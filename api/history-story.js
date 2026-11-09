/* 맛춘범 역사 스토리 전용 협동 세션: Render + Neon */
import {randomBytes} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {neon} from '@neondatabase/serverless';
import {configured,noCache,sameOrigin,session} from '../lib/mb-server.js';
const raw=readFileSync(new URL('../history-story-data.js',import.meta.url),'utf8');
const marker='window.MB_HISTORY_STORY=',offset=raw.indexOf(marker);
if(offset<0)throw Error('History story data missing');
const chapters=JSON.parse(raw.slice(offset+marker.length).trim().replace(/;\s*$/,'')).chapters;
const PREFIX='history-story/',EXPIRY=60*60*1000,KEYS='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE=/^[A-HJ-NP-Z2-9]{8}$/;let client;
const sql=(q,args=[])=>{client??=neon(process.env.DATABASE_URL);return client.query(q,args)};
const key=code=>PREFIX+code;
const generate=()=>Array.from(randomBytes(8),b=>KEYS[b%KEYS.length]).join('');
const chapter=id=>chapters.find(c=>c.id===id);
const error=(status,message)=>({status,error:message});
const name=x=>String(x||'시간의 기록자 협동방').normalize('NFC').replace(/[^가-힣a-zA-Z0-9 _-]/g,'').trim().slice(0,26)||'시간의 기록자 협동방';
async function get(code){const a=await sql('SELECT body FROM mb_objects WHERE pathname=$1',[key(code)]);return a[0]?.body||null}
async function insert(r){const a=await sql('INSERT INTO mb_objects(pathname,body) VALUES($1,$2::jsonb) ON CONFLICT DO NOTHING RETURNING pathname',[key(r.code),JSON.stringify(r)]);return !!a.length}
async function update(old,r){r.revision=(old.revision||0)+1;
 const a=await sql("UPDATE mb_objects SET body=$2::jsonb,updated_at=NOW() WHERE pathname=$1 AND (body->>'revision')::integer=$3 RETURNING pathname",[key(old.code),JSON.stringify(r),old.revision||0]);return !!a.length;
}
function stageOK(r){const c=chapter(r.chapterId),first=c?.zones[0].objects||[];
 return first.filter(x=>x.kind==='clue'&&r.collected.includes(x.id)).length===2&&first.some(x=>x.kind==='npc'&&r.spoken.includes(x.id))}
const ready=r=>r.collected.length>=4&&r.spoken.length>=2;
function publicView(r,id){return {code:r.code,name:r.name,phase:r.phase,hostId:r.hostId,me:id,capacity:4,
 chapterId:r.chapterId,players:r.players.map(p=>({id:p.id,name:p.name,ready:p.ready,zone:p.zone,x:p.x,y:p.y,lastAt:p.lastAt})),
 collected:r.collected,spoken:r.spoken,timelineSolved:r.timelineSolved,quizSolved:r.quizSolved,
 completed:r.completed,unlocked:r.unlocked,canStart:r.phase==='lobby'&&r.players.length>=2&&r.players.every(p=>p.ready)}}
async function alter(code,user,action,body){
 for(let attempt=0;attempt<16;attempt++){
  const old=await get(code),now=Date.now();
  if(!old||old.expiresAt<now)return error(404,'방이 없거나 만료되었어.');
  const r=structuredClone(old),me=r.players.find(p=>p.id===user.id);
  if(action==='join'){
   if(r.phase!=='lobby')return error(409,'이미 시작된 방이야.');
   if(!me){if(r.players.length>=4)return error(409,'4명이 모두 입장했어.');r.players.push({id:user.id,name:user.name,ready:false,x:470,y:475,zone:0,lastAt:now})}
  }else if(!me)return error(403,'먼저 방에 참가해 줘.');
  else if(action==='leave'){
   r.players=r.players.filter(p=>p.id!==user.id);
   if(r.hostId===user.id)r.hostId=r.players[0]?.id||'';
   if(!r.players.length)r.expiresAt=now-1;
   if(r.phase==='lobby')r.players.forEach(p=>p.ready=false);
  }else if(action==='ready'){
   if(r.phase!=='lobby')return error(409,'대기 중일 때만 준비할 수 있어.');
   me.ready=body.ready===true;
  }else if(action==='start'){
   if(r.hostId!==user.id)return error(403,'방장만 시작할 수 있어.');
   if(r.phase!=='lobby'||r.players.length<2||!r.players.every(p=>p.ready))return error(409,'2명 이상 모두 준비해야 시작할 수 있어.');
   r.phase='playing';r.collected=[];r.spoken=[];r.timelineSolved=false;r.quizSolved=false;
   r.players.forEach(p=>{p.ready=false;p.x=470;p.y=475;p.zone=0});
  }else if(action==='move'){
   if(r.phase!=='playing')return error(409,'먼저 게임을 시작해 줘.');
   const x=Number(body.x),y=Number(body.y),zone=Number(body.zone);
   if(!Number.isFinite(x)||!Number.isFinite(y)||![0,1].includes(zone)||x<60||x>906||y<235||y>496||zone===1&&!stageOK(r))return error(400,'이동 가능한 지역이 아니야.');
   me.x=x;me.y=y;me.zone=zone;me.lastAt=now;
  }else if(action==='collect'||action==='talk'){
   if(r.phase!=='playing')return error(409,'게임 시작 후 조사할 수 있어.');
   const c=chapter(r.chapterId),id=String(body.id||''),zone=Number(body.zone);
   const found=c?.zones.flatMap((z,i)=>z.objects.map(o=>({...o,zone:i}))).find(o=>o.id===id);
   if(!found||found.kind!==(action==='collect'?'clue':'npc')||zone!==found.zone||zone===1&&!stageOK(r))return error(409,'먼저 해당 시대 구역으로 이동해 줘.');
   const list=action==='collect'?r.collected:r.spoken;
   if(!list.includes(id))list.push(id);
  }else if(action==='timeline'){
   const c=chapter(r.chapterId),ids=body.order;
   if(r.phase!=='playing'||!ready(r))return error(409,'필요한 증언과 사료를 먼저 모아 줘.');
   if(!Array.isArray(ids)||ids.length!==c.timeline.length||!ids.every((x,i)=>x===c.timeline[i].id))return error(422,'연표 순서가 맞지 않아.');
   r.timelineSolved=true;
  }else if(action==='quiz'){
   const c=chapter(r.chapterId),n=Number(body.choice);
   if(r.phase!=='playing'||!r.timelineSolved)return error(409,'연표 복원을 먼저 완료해 줘.');
   if(!Number.isInteger(n)||n<0||n>3)return error(400,'답안을 확인해 줘.');
   if(n!==c.quiz.correct)return error(422,'답이 맞지 않아. 기록을 다시 살펴봐.');
   r.quizSolved=true;
  }else if(action==='advance'){
   if(r.hostId!==user.id)return error(403,'방장만 다음 장을 진행할 수 있어.');
   if(r.phase!=='playing'||!r.quizSolved)return error(409,'현재 장을 먼저 완료해 줘.');
   if(!r.completed.includes(r.chapterId))r.completed.push(r.chapterId);
   const next=chapters[chapters.findIndex(c=>c.id===r.chapterId)+1];
   if(!next)r.phase='complete';
   else{r.chapterId=next.id;if(!r.unlocked.includes(next.id))r.unlocked.push(next.id);r.collected=[];r.spoken=[];r.timelineSolved=false;r.quizSolved=false;
    r.players.forEach(p=>{p.zone=0;p.x=470;p.y=475});}
  }else return error(400,'지원하지 않는 동작이야.');
  if(r.players.length)r.expiresAt=now+EXPIRY;
  if(await update(old,r))return {status:200,state:publicView(r,user.id)};
 }
 return error(409,'동시 요청으로 충돌했어. 다시 시도해 줘.');
}
export default async function handler(req,res){
 noCache(res);
 if(!configured())return res.status(503).json({error:'역사 협동 서버가 연결되지 않았어.'});
 const me=session(req);
 if(req.method==='GET'){
  const code=String(req.query?.code||'').toUpperCase();
  try{
   if(!code){
    const rows=await sql("SELECT body FROM mb_objects WHERE pathname LIKE 'history-story/%' AND updated_at>NOW()-INTERVAL '60 minutes' ORDER BY updated_at DESC LIMIT 80");
    const list=rows.map(x=>x.body).filter(r=>r?.phase==='lobby'&&r.expiresAt>Date.now()&&r.players?.length);
    return res.status(200).json({rooms:list.slice(0,35).map(r=>({code:r.code,name:r.name,host:r.players.find(p=>p.id===r.hostId)?.name||'방장',players:r.players.length,capacity:4}))});
   }
   if(!CODE.test(code))return res.status(400).json({error:'8자리 방 코드를 입력해 줘.'});
   const r=await get(code);
   if(!r||r.expiresAt<Date.now())return res.status(404).json({error:'방이 없거나 만료됐어.'});
   if(!me||!r.players.some(p=>p.id===me.id))return res.status(403).json({error:'방 참가자만 확인할 수 있어.'});
   return res.status(200).json({state:publicView(r,me.id)});
  }catch(e){console.error('History story GET',e?.message);return res.status(503).json({error:'방 목록을 확인할 수 없어.'})}
 }
 if(req.method!=='POST')return res.status(405).json({error:'지원하지 않는 방식이야.'});
 if(!sameOrigin(req))return res.status(403).json({error:'요청 출처를 확인해 줘.'});
 if(!me)return res.status(401).json({error:'맛춘범 로그인 후 협동에 참가할 수 있어.'});
 const body=req.body&&typeof req.body==='object'?req.body:{},action=String(body.action||'');
 try{
  if(action==='create'){
   const rows=await sql("SELECT body FROM mb_objects WHERE pathname LIKE 'history-story/%' AND updated_at>NOW()-INTERVAL '60 minutes' ORDER BY updated_at DESC LIMIT 80");
   if(rows.some(x=>x.body?.expiresAt>Date.now()&&x.body?.players?.some(p=>p.id===me.id)))return res.status(409).json({error:'이미 다른 스토리방에 참여 중이야.'});
   for(let t=0;t<8;t++){
    const now=Date.now(),r={code:generate(),name:name(body.name),phase:'lobby',hostId:me.id,createdAt:now,expiresAt:now+EXPIRY,revision:0,chapterId:chapters[0].id,
     completed:[],unlocked:[chapters[0].id],collected:[],spoken:[],timelineSolved:false,quizSolved:false,
     players:[{id:me.id,name:me.name,ready:false,x:470,y:475,zone:0,lastAt:now}]};
    if(await insert(r))return res.status(200).json({state:publicView(r,me.id)});
   }
   return res.status(503).json({error:'방 생성이 실패했어.'});
  }
  const code=String(body.code||'').toUpperCase();
  if(!CODE.test(code))return res.status(400).json({error:'올바른 방 코드를 입력해 줘.'});
  const result=await alter(code,me,action,body);
  return res.status(result.status).json(result.error?{error:result.error}:{state:result.state});
 }catch(e){console.error('History story POST',e?.message);return res.status(503).json({error:'협동 요청에 실패했어.'})}
}
