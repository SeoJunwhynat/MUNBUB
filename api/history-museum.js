/* 역사 박물관 전용 멀티 퀴즈. Render + Neon, 기존 국어 대전과 완전 분리. */
import {randomBytes,randomInt} from 'node:crypto';
import {neon} from '@neondatabase/serverless';
import {configured,noCache,sameOrigin,session} from '../lib/mb-server.js';
import {MUSEUM_QUESTIONS} from '../lib/mb-history-museum-bank.js';

const PREFIX='history-museum/';
const VALID=/^[A-HJ-NP-Z2-9]{8}$/;
const ALPHABET='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_PLAYERS=4,COUNT=8,ROUND_MS=35000,ROOM_MS=65*60*1000;
let client;
function sql(query,args=[]){client??=neon(process.env.DATABASE_URL);return client.query(query,args)}
const path=code=>PREFIX+code;
const codeNew=()=>Array.from(randomBytes(8),b=>ALPHABET[b%ALPHABET.length]).join('');
const error=(status,message)=>({status,error:message});
const shuffle=xs=>{const out=[...xs];for(let i=out.length-1;i>0;i--){const j=randomInt(i+1);[out[i],out[j]]=[out[j],out[i]]}return out};
function sanitizeName(x){
 return String(x||'역사 탐험방').normalize('NFC').replace(/[^가-힣a-zA-Z0-9 _-]/g,'').trim().slice(0,26)||'역사 탐험방';
}
async function readRoom(code){const rows=await sql('SELECT body FROM mb_objects WHERE pathname=$1',[path(code)]);return rows[0]?.body||null}
async function insertRoom(room){
 const rows=await sql('INSERT INTO mb_objects(pathname,body) VALUES ($1,$2::jsonb) ON CONFLICT DO NOTHING RETURNING pathname',[path(room.code),JSON.stringify(room)]);
 return rows.length>0;
}
async function saveRoom(old,room){
 room.revision=(old.revision||0)+1;
 const rows=await sql("UPDATE mb_objects SET body=$2::jsonb,updated_at=NOW() WHERE pathname=$1 AND (body->>'revision')::integer=$3 RETURNING pathname",[path(room.code),JSON.stringify(room),old.revision||0]);
 return rows.length>0;
}
function cleanup(room,now){
 if(room.phase==='live'&&(now>=room.deadline||room.players.every(p=>p.choice!==null)))room.phase='review';
 return room;
}
function userView(room,id){
 const me=room.players.find(p=>p.id===id);
 const question=MUSEUM_QUESTIONS.find(q=>q.id===room.ids[room.index]);
 const round=['live','review'].includes(room.phase)&&question?{
  id:question.id,unit:question.unit,prompt:question.question,choices:question.choices,
  number:room.index+1,total:room.ids.length,deadline:room.deadline,
  correctIndex:room.phase==='review'?question.correct:null,
  explanation:room.phase==='review'?question.explain:null,
  myChoice:me?.choice??null
 }:null;
 return {code:room.code,name:room.name,phase:room.phase,hostId:room.hostId,
  capacity:room.capacity||MAX_PLAYERS,createdAt:room.createdAt,round,
  players:room.players.map(p=>({id:p.id,name:p.name,score:p.score,ready:p.ready,answered:p.choice!==null})),
  me:id,canStart:room.phase==='lobby'&&room.players.length>=2&&room.players.every(p=>p.ready)};
}
async function settle(code){
 for(let attempt=0;attempt<10;attempt++){
  const old=await readRoom(code);if(!old)return null;
  if(old.expiresAt<Date.now())return null;
  if(old.phase!=='live'||(Date.now()<old.deadline&&!old.players.every(p=>p.choice!==null)))return old;
  const next=structuredClone(old);cleanup(next,Date.now());
  if(await saveRoom(old,next))return next;
 }
 throw Error('busy');
}
async function mutate(code,actor,action,body){
 for(let tries=0;tries<14;tries++){
  const old=await readRoom(code);
  if(!old||old.expiresAt<Date.now())return error(404,'방이 없거나 만료됐어.');
  const next=structuredClone(old),now=Date.now();
  cleanup(next,now);
  let player=next.players.find(p=>p.id===actor.id);
  if(action==='join'){
   if(next.phase!=='lobby')return error(409,'이미 게임이 시작됐어.');
   if(!player){
    if(next.players.length>=(next.capacity||MAX_PLAYERS))return error(409,'방이 가득 찼어.');
    next.players.push({id:actor.id,name:actor.name,ready:false,score:0,choice:null});
   }
  }else{
   if(!player)return error(403,'이 방에 참가하지 않았어.');
   if(action==='leave'){
    next.players=next.players.filter(p=>p.id!==actor.id);
    if(next.hostId===actor.id)next.hostId=next.players[0]?.id||'';
    if(!next.players.length)next.expiresAt=now-1;
    else if(next.phase==='lobby')next.players.forEach(p=>p.ready=false);
   }else if(action==='ready'){
    if(next.phase!=='lobby')return error(409,'대기 중일 때만 준비할 수 있어.');
    player.ready=Boolean(body.ready);
   }else if(action==='start'){
    if(next.hostId!==actor.id)return error(403,'방장만 시작할 수 있어.');
    if(next.phase!=='lobby'||next.players.length<2||!next.players.every(p=>p.ready))
     return error(409,'2명 이상 입장하고 모두 준비해야 시작할 수 있어.');
    next.phase='live';next.index=0;next.deadline=now+ROUND_MS;
    next.players.forEach(p=>{p.choice=null;p.score=0;p.ready=false});
   }else if(action==='answer'){
    if(next.phase!=='live'||now>=next.deadline||player.choice!==null)return error(409,'현재는 답안을 제출할 수 없어.');
    const choice=Number(body.choice),question=MUSEUM_QUESTIONS.find(q=>q.id===next.ids[next.index]);
    if(!Number.isInteger(choice)||choice<0||choice>3||!question)return error(400,'선택지를 확인해 줘.');
    player.choice=choice;
    if(choice===question.correct)player.score+=10;
    cleanup(next,now);
   }else if(action==='next'){
    if(next.hostId!==actor.id)return error(403,'방장만 다음 문제로 진행할 수 있어.');
    if(next.phase!=='review')return error(409,'모든 플레이어가 답하거나 제한 시간이 끝나야 해.');
    next.index++;
    if(next.index>=next.ids.length)next.phase='results';
    else {next.phase='live';next.deadline=now+ROUND_MS;next.players.forEach(p=>p.choice=null)}
   }else return error(400,'지원하지 않는 동작이야.');
  }
  if(next.players.length)next.expiresAt=now+ROOM_MS;
  if(await saveRoom(old,next))return {status:200,state:userView(next,actor.id)};
 }
 return error(409,'동시 접속 중이야. 다시 시도해 줘.');
}
export default async function handler(req,res){
 noCache(res);
 if(!configured())return res.status(503).json({error:'역사 멀티 서버의 Render/Neon 연결을 확인해 줘.'});
 const me=session(req);
 if(req.method==='GET'){
  const code=String(req.query?.code||'').toUpperCase();
  try{
   if(!code){
    const rows=await sql("SELECT body FROM mb_objects WHERE pathname LIKE 'history-museum/%' AND updated_at>NOW()-INTERVAL '65 minutes' ORDER BY updated_at DESC LIMIT 80");
    const rooms=rows.map(x=>x.body).filter(x=>x&&x.expiresAt>Date.now()&&x.players?.length&&x.phase==='lobby')
    .slice(0,35).map(x=>({code:x.code,name:x.name,players:x.players.length,capacity:x.capacity||MAX_PLAYERS,host:x.players.find(p=>p.id===x.hostId)?.name||'방장'}));
    return res.status(200).json({rooms});
   }
   if(!VALID.test(code))return res.status(400).json({error:'방 코드를 확인해 줘.'});
   const room=await settle(code);
   if(!room)return res.status(404).json({error:'방을 찾지 못했어.'});
   if(!me||!room.players.some(p=>p.id===me.id))return res.status(403).json({error:'먼저 로그인하고 방에 참가해 줘.'});
   return res.status(200).json({state:userView(room,me.id)});
  }catch(e){console.error('History museum GET',e?.message);return res.status(503).json({error:'방 정보를 불러오지 못했어.'})}
 }
 if(req.method!=='POST')return res.status(405).json({error:'지원하지 않는 방식이야.'});
 if(!sameOrigin(req))return res.status(403).json({error:'잘못된 요청 출처야.'});
 if(!me)return res.status(401).json({error:'맛춘범 로그인 후 역사 멀티를 이용할 수 있어.'});
 const body=req.body&&typeof req.body==='object'?req.body:{};
 const action=String(body.action||'');
 try{
  if(action==='create'){
   const recent=await sql("SELECT body FROM mb_objects WHERE pathname LIKE 'history-museum/%' AND updated_at>NOW()-INTERVAL '65 minutes' ORDER BY updated_at DESC LIMIT 80");
   if(recent.some(x=>x.body?.expiresAt>Date.now()&&x.body?.players?.some(p=>p.id===me.id)))return res.status(409).json({error:'이미 참가 중인 역사 방이 있어. 그 방에서 나간 뒤 새로 만들어 줘.'});
   for(let i=0;i<8;i++){
    const code=codeNew(),now=Date.now();
    const room={code,name:sanitizeName(body.name),hostId:me.id,createdAt:now,expiresAt:now+ROOM_MS,revision:0,
     capacity:body.capacity===2?2:4,phase:'lobby',index:0,deadline:0,ids:shuffle(MUSEUM_QUESTIONS.map(q=>q.id)).slice(0,COUNT),
     players:[{id:me.id,name:me.name,ready:false,score:0,choice:null}]};
    if(await insertRoom(room))return res.status(200).json({state:userView(room,me.id)});
   }
   return res.status(503).json({error:'새 방 코드를 생성하지 못했어.'});
  }
  const code=String(body.code||'').toUpperCase();
  if(!VALID.test(code))return res.status(400).json({error:'방 코드를 확인해 줘.'});
  const result=await mutate(code,me,action,body);
  return res.status(result.status).json(result.error?{error:result.error}:{state:result.state});
 }catch(e){console.error('History museum POST',e?.message);return res.status(503).json({error:'역사 멀티 요청을 처리하지 못했어.'})}
}
