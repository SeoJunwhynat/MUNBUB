/* 《이름 없는 사람들의 역사》 v7 real-time side-scroll co-op rooms.
   Isolated from the legacy history-story top-down room state.
   Persistence: Neon mb_objects CAS revision; authenticated via existing signed taste session.
*/
import {randomBytes} from 'node:crypto';
import {neon} from '@neondatabase/serverless';
import {configured,noCache,sameOrigin,session} from '../lib/mb-server.js';

const PREFIX='history-side-v7/', LIFETIME=90*60*1000,MAX_PLAYERS=4;
const CODE=/^[A-HJ-NP-Z2-9]{8}$/;
const ALPHABET='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const VALID_SCENES=new Set(['museum','1945','street','print','market','news','home','school','plaza','1947','1950','1960','1970','1980','1987','modern']);
const FLAGS=['manuscript','paper','document','printed','delivered','cut','memorial'];
const SITES={
 manuscript:{scene:'print',x:790,requires:[]},
 paper:{scene:'print',x:1025,requires:[]},
 document:{scene:'print',x:690,requires:[]},
 printed:{scene:'print',x:1500,requires:['manuscript','paper','document']},
 delivered:{scene:'street',x:1560,requires:['printed']},
 cut:{scene:'street',x:1560,requires:['delivered']},
 memorial:{scene:'1947',x:700,requires:['cut']}
};
let client;
const sql=(query,args=[])=>{client??=neon(process.env.DATABASE_URL);return client.query(query,args)};
const key=code=>PREFIX+code;
const error=(status,text)=>({status,error:text});
const generate=()=>Array.from(randomBytes(8),b=>ALPHABET[b%ALPHABET.length]).join('');
const clean=(s,n=160)=>String(s||'').normalize('NFC').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,n);
const name=s=>clean(s||'1946년 서울 역사 탐험방',26).replace(/[<>"']/g,'')||'1946년 서울 역사 탐험방';
const blank=()=>Object.fromEntries(FLAGS.map(k=>[k,false]));
const player=(me)=>({id:me.id,name:clean(me.name,24),ready:false,scene:'museum',x:230,y:280,facing:1,lastAt:Date.now()});
async function read(code){const r=await sql('SELECT body FROM mb_objects WHERE pathname=$1',[key(code)]);return r[0]?.body||null}
async function insert(room){const r=await sql('INSERT INTO mb_objects(pathname,body) VALUES($1,$2::jsonb) ON CONFLICT DO NOTHING RETURNING pathname',[key(room.code),JSON.stringify(room)]);return r.length>0}
async function cas(old,next){
 next.revision=old.revision+1;
 const rows=await sql("UPDATE mb_objects SET body=$2::jsonb,updated_at=NOW() WHERE pathname=$1 AND (body->>'revision')::int=$3 RETURNING pathname",
 [key(old.code),JSON.stringify(next),old.revision]);
 return rows.length>0;
}
function view(room,me){
 const p=room.players.find(x=>x.id===me);
 return {
  code:room.code,name:room.name,visibility:room.visibility,phase:room.phase,hostId:room.hostId,me,
  capacity:room.capacity||MAX_PLAYERS,chapter:room.chapter,progress:room.progress,
  players:room.players.map(x=>({id:x.id,name:x.name,scene:x.scene,x:x.x,y:x.y,facing:x.facing,ready:x.ready,lastAt:x.lastAt})),
  chat:(room.chat||[]).slice(-40),cinematic:room.cinematic||null,levers:room.levers||{left:null,right:null,ready:false},
  canStart:room.phase==='lobby'&&room.players.length>=2&&room.players.every(x=>x.ready),
  joined:!!p,revision:room.revision
 };
}
function progressValid(room,actor,flag){
 const site=SITES[flag];
 if(!site||room.progress[flag])return false;
 if(site.requires.some(x=>!room.progress[x]))return false;
 if(actor.scene!==site.scene)return false;
 return Math.abs(actor.x-site.x)<=130||(flag==='cut'&&Math.abs(actor.x-1940)<=130);
}
async function mutate(code,me,body){
 for(let i=0;i<15;i++){
  const old=await read(code);
  if(!old||old.expiresAt<Date.now())return error(404,'방이 없거나 만료되었습니다.');
  const next=structuredClone(old),now=Date.now(),action=String(body.action||'');
  let actor=next.players.find(x=>x.id===me.id);
  if(action==='join'){
   if(actor)return {status:200,state:view(next,me.id)};
   if(next.phase!=='lobby')return error(409,'이미 플레이 중인 방입니다. 기존 참가자는 재접속할 수 있습니다.');
   if(next.players.length>=(next.capacity||MAX_PLAYERS))return error(409,'방의 정원이 가득 찼습니다.');
   actor=player(me);next.players.push(actor);
  }else if(!actor)return error(403,'방에 참가한 다음 조작할 수 있습니다.');
  else if(action==='leave'){
   next.players=next.players.filter(x=>x.id!==me.id);
   if(next.hostId===me.id)next.hostId=next.players[0]?.id||'';
   if(!next.players.length)next.expiresAt=now-1;
   else if(next.phase==='lobby')next.players.forEach(x=>x.ready=false);
  }else if(action==='ready'){
   if(next.phase!=='lobby')return error(409,'대기실에서만 준비할 수 있습니다.');
   actor.ready=body.ready===true;
  }else if(action==='start'){
   if(next.hostId!==me.id)return error(403,'방장만 시작할 수 있습니다.');
   if(next.phase!=='lobby'||next.players.length<2||!next.players.every(x=>x.ready))
    return error(409,'2명 이상 모두 준비해야 시작할 수 있습니다.');
   next.phase='playing';next.chapter='1946';next.progress=blank();next.cinematic=null;next.levers={left:null,right:null,ready:false};
   next.players.forEach((x,i)=>{x.ready=false;x.scene='street';x.x=90+i*22;x.y=280;x.facing=1;x.lastAt=now});
  }else if(action==='move'){
   if(next.phase!=='playing')return error(409,'게임 시작 후 이동할 수 있습니다.');
   const scene=String(body.scene||''),x=Number(body.x),y=Number(body.y),facing=Number(body.facing);
   if(!VALID_SCENES.has(scene)||!Number.isFinite(x)||!Number.isFinite(y)||x<4||x>2160||y<0||y>312||![1,-1].includes(facing))
    return error(400,'잘못된 플레이어 좌표입니다.');
   const time=Math.min(5,Math.max(0,(now-(actor.lastAt||now))/1000));
   if(scene===actor.scene&&Math.abs(x-actor.x)>Math.max(35,time*350+25))
    return error(409,'이동 좌표를 다시 동기화해 주세요.');
   actor.scene=scene;actor.x=Math.round(x*10)/10;actor.y=Math.round(y*10)/10;actor.facing=facing;actor.lastAt=now;
  }else if(action==='switch'){
   if(next.phase!=='playing')return error(409,'먼저 협동 탐험을 시작해 주세요.');
   const lever=String(body.lever||''),scene=String(body.scene||''),x=Number(body.x),site={left:460,right:1170}[lever];
   if(!site||scene!=='print'||!Number.isFinite(x)||Math.abs(x-site)>80)
    return error(409,'인쇄소 레버 가까이 이동해서 조작해 주세요.');
   actor.scene='print';actor.x=x;actor.lastAt=now;
   const l=next.levers||{left:null,right:null,ready:false};
   l[lever]={id:me.id,at:now};
   l.ready=!!(l.left&&l.right&&Math.abs(l.left.at-l.right.at)<=25000&&
     (l.left.id!==l.right.id||next.players.length===1));
   next.levers=l;
  }else if(action==='progress'){
   if(next.phase!=='playing')return error(409,'게임 시작 후에만 기록할 수 있습니다.');
   const flag=String(body.flag||'');
   const atScene=String(body.scene||''),atX=Number(body.x);
   if(VALID_SCENES.has(atScene)&&Number.isFinite(atX)&&atX>=4&&atX<=2160){
    const seconds=Math.max(0,Math.min(5,(now-(actor.lastAt||now))/1000));
    if(atScene!==actor.scene||Math.abs(atX-actor.x)<Math.max(130,seconds*350+25)){
     actor.scene=atScene;actor.x=atX;actor.lastAt=now;
    }
   }
   if(!FLAGS.includes(flag))return error(400,'지원하지 않는 공동 기록입니다.');
   if(next.progress[flag])return {status:200,state:view(next,me.id)};
   if(!progressValid(next,actor,flag))return error(409,'공동 기록 위치와 선행 퀘스트를 확인해 주세요.');
   next.progress[flag]=true;
   if(flag==='cut')next.cinematic={id:'yeo1947',at:now,date:'1947-07-19',clock:'13:00경',ready:[]};
  }else if(action==='cutReady'){
   if(!next.cinematic)return error(409,'공동 컷신이 시작되지 않았습니다.');
   if(!next.cinematic.ready.includes(me.id))next.cinematic.ready.push(me.id);
  }else if(action==='chat'){
   if(next.phase==='complete')return error(409,'종료된 방입니다.');
   const message=clean(body.message,180);
   if(!message)return error(400,'메시지를 입력해 주세요.');
   if((actor.lastChatAt||0)+400>now)return error(429,'채팅 입력 간격이 너무 짧습니다.');
   actor.lastChatAt=now;
   next.chat=[...(next.chat||[]).slice(-38),{id:String(now)+'-'+me.id.slice(0,8),from:me.id,name:clean(me.name,24),message,at:now}];
  }else return error(400,'지원하지 않는 동작입니다.');
  if(next.players.length)next.expiresAt=now+LIFETIME;
  if(await cas(old,next))return {status:200,state:view(next,me.id)};
 }
 return error(409,'여러 명의 동작이 겹쳤습니다. 다시 시도해 주세요.');
}
export default async function handler(req,res){
 noCache(res);
 if(!configured())return res.status(503).json({error:'Render/Neon 계정 연결을 확인해 주세요.'});
 const me=session(req);
 if(req.method==='GET'){
  const code=String(req.query?.code||'').toUpperCase();
  try{
   if(!code){
    const rows=await sql("SELECT body FROM mb_objects WHERE pathname LIKE 'history-side-v7/%' AND updated_at>NOW()-INTERVAL '90 minutes' ORDER BY updated_at DESC LIMIT 80");
    const rooms=rows.map(x=>x.body).filter(x=>x&&x.visibility==='public'&&x.phase==='lobby'&&x.expiresAt>Date.now()&&x.players?.length)
    .slice(0,35).map(r=>({code:r.code,name:r.name,players:r.players.length,capacity:r.capacity,host:r.players.find(p=>p.id===r.hostId)?.name||'방장'}));
    return res.status(200).json({rooms});
   }
   if(!CODE.test(code))return res.status(400).json({error:'올바른 8자리 방 코드가 필요합니다.'});
   const room=await read(code);
   if(!room||room.expiresAt<Date.now())return res.status(404).json({error:'방을 찾지 못했습니다.'});
   if(!me||!room.players.some(x=>x.id===me.id))return res.status(403).json({error:'방 참가자만 확인할 수 있습니다.'});
   return res.status(200).json({state:view(room,me.id)});
  }catch(e){console.error('History v7 GET',e?.message);return res.status(503).json({error:'멀티 방 조회에 실패했습니다.'})}
 }
 if(req.method!=='POST')return res.status(405).json({error:'지원하지 않는 요청 방식입니다.'});
 if(!sameOrigin(req))return res.status(403).json({error:'허용되지 않은 요청 출처입니다.'});
 if(!me)return res.status(401).json({error:'맛춘범 계정으로 로그인해야 멀티플레이에 참가할 수 있습니다.'});
 const body=req.body&&typeof req.body==='object'?req.body:{},action=String(body.action||'');
 try{
  if(action==='create'){
   const rows=await sql("SELECT body FROM mb_objects WHERE pathname LIKE 'history-side-v7/%' AND updated_at>NOW()-INTERVAL '90 minutes' ORDER BY updated_at DESC LIMIT 80");
   if(rows.some(x=>x.body?.expiresAt>Date.now()&&x.body?.players?.some(p=>p.id===me.id)))
    return res.status(409).json({error:'이미 참가 중인 횡스크롤 역사 탐험방이 있습니다.'});
   for(let i=0;i<8;i++){
    const now=Date.now(),r={code:generate(),name:name(body.name),visibility:body.private===true?'private':'public',
     phase:'lobby',chapter:'1946',hostId:me.id,capacity:Math.min(4,Math.max(2,Number(body.capacity)||4)),createdAt:now,
     expiresAt:now+LIFETIME,revision:0,players:[player(me)],progress:blank(),chat:[],cinematic:null,levers:{left:null,right:null,ready:false}};
    if(await insert(r))return res.status(200).json({state:view(r,me.id)});
   }
   return res.status(503).json({error:'방 코드 생성에 실패했습니다.'});
  }
  const code=String(body.code||'').toUpperCase();
  if(!CODE.test(code))return res.status(400).json({error:'8자리 방 코드를 확인해 주세요.'});
  const result=await mutate(code,me,body);
  return res.status(result.status).json(result.error?{error:result.error}:{state:result.state});
 }catch(e){console.error('History v7 POST',e?.message);return res.status(503).json({error:'협동 서버 처리 중 오류가 발생했습니다.'})}
}