/** Independent public 2–4-player arena. Private invite-code 1v1 remains untouched. */
import {randomBytes,randomInt} from 'node:crypto';
import {neon} from '@neondatabase/serverless';
import {configured,noCache,sameOrigin,session,answerCorrect,duelQuestionIds,duelFinalIdiomIds} from '../lib/mb-server.js';
import {CODE_RE,settingsOf,active,createRoom,settle,view,perform} from '../lib/mb-arena-engine.js';
const CHARS='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const PREFIX='arena4/';
let db;
const sql=async(query,args=[])=>{db??=neon(process.env.DATABASE_URL);return db.query(query,args)};
const path=c=>PREFIX+c;
async function readRoom(code){const rows=await sql('SELECT body FROM mb_objects WHERE pathname=$1',[path(code)]);return rows[0]?.body||null}
async function insertRoom(r){const rows=await sql('INSERT INTO mb_objects(pathname,body) VALUES ($1,$2::jsonb) ON CONFLICT DO NOTHING RETURNING pathname',[path(r.code),JSON.stringify(r)]);return !!rows.length}
async function updateRoom(old,r){r.revision=(old.revision||0)+1;
 const rows=await sql('UPDATE mb_objects SET body=$2::jsonb,updated_at=NOW() WHERE pathname=$1 AND (body->>\'revision\')::integer=$3 RETURNING pathname',[path(r.code),JSON.stringify(r),old.revision||0]);return !!rows.length;
}
async function settledRoom(code){
 for(let i=0;i<12;i++){
  const old=await readRoom(code);if(!old)return null;
  const next=structuredClone(old);
  if(!settle(next,Date.now()))return old;
  if(await updateRoom(old,next))return next;
 }
 throw Error('Room busy');
}
async function actionRoom(code,actor,action,body){
 for(let i=0;i<16;i++){
  const old=await readRoom(code);if(!old)return {status:404,error:'방이 없거나 종료됐어.'};
  const next=structuredClone(old),now=Date.now();
  settle(next,now);
  let result;
  try{result=perform(next,actor,action,body,now,answerCorrect)}
  catch(e){return {status:e.status||400,error:e.message}}
  if(action==='pulse'&&JSON.stringify(next)===JSON.stringify(old))return {status:200,...result};
  if(await updateRoom(old,next))return {status:200,...result,state:view(next,actor.id,now)};
 }
 return {status:409,error:'동시 접속 처리 중이야. 다시 시도해 줘.'};
}
function drawQuestions(settings){
 const sp=duelQuestionIds().filter(k=>/^s\d+$/.test(k));
 const id=duelFinalIdiomIds();
 const shuffle=arr=>{const v=[...arr];for(let i=v.length-1;i>0;i--){let j=randomInt(i+1);[v[i],v[j]]=[v[j],v[i]]}return v};
 const spCount=settings.type==='spelling'?settings.count:settings.type==='idiom'?0:Math.ceil(settings.count/2);
 const chosen=[...shuffle(sp).slice(0,spCount),...shuffle(id).slice(0,settings.count-spCount)];
 if(chosen.length!==settings.count)throw Error('Not enough questions');return shuffle(chosen);
}
function summary(r){
 const players=active(r).length;
 return {code:r.code,name:r.name,host:r.players[0]?.name||'방장',
  players,capacity:r.capacity,status:r.phase==='lobby'?(players>=r.capacity?'full':'waiting'):'playing',
  type:r.settings.type,form:r.settings.form,count:r.settings.count,seconds:r.settings.seconds,createdAt:r.createdAt};
}
function response(res,code,value){return res.status(code).json(value)}
export default async function handler(req,res){
 noCache(res);
 if(!configured())return response(res,503,{error:'온라인 서버의 데이터베이스 설정을 확인해 줘.'});
 const me=session(req);
 if(!me)return response(res,401,{error:'공개방은 로그인한 계정만 이용할 수 있어.'});
 try{
  if(req.method==='GET'){
   const code=String(req.query?.code||'').trim().toUpperCase();
   if(code){
    if(!CODE_RE.test(code))return response(res,400,{error:'8자리 방 코드를 확인해 줘.'});
    const room=await settledRoom(code);
    if(!room||room.expiresAt<=Date.now()||room.closedAt)return response(res,404,{error:'종료되었거나 존재하지 않는 방이야.'});
    const data=view(room,me.id,Date.now());
    if(!data)return response(res,403,{error:'이 공개방에 참가한 계정이 아니야.'});
    return response(res,200,data);
   }
   const rows=await sql(`SELECT body FROM mb_objects WHERE pathname LIKE 'arena4/%' AND updated_at>NOW()-INTERVAL '60 minutes' ORDER BY updated_at DESC LIMIT 200`);
   const now=Date.now();
   const list=rows.map(x=>x.body).filter(r=>!r.closedAt&&r.expiresAt>now&&r.players?.[0]&&!r.players[0].leftAt&&now-(r.players[0].lastSeenAt||r.createdAt)<120000);
   return response(res,200,{rooms:list.map(summary).slice(0,80)});
  }
  if(req.method!=='POST')return response(res,405,{error:'지원하지 않는 요청 방식이야.'});
  if(!sameOrigin(req))return response(res,403,{error:'잘못된 요청 출처야.'});
  const body=req.body&&typeof req.body==='object'?req.body:{};
  const action=String(body.action||'');
  if(action==='create'){
   const settings=settingsOf(body.settings),capacity=Number(body.capacity||4);
   if(!settings||![2,3,4].includes(capacity))return response(res,400,{error:'문제 설정과 최대 참가 인원을 확인해 줘.'});
   const name=String(body.roomName||'').replace(/[<>\x00-\x1f]/g,'').trim().slice(0,36)||me.name+'의 공개방';
   const title=String(body.title||'국어 새내기').slice(0,30);
   const questions=drawQuestions(settings);
   for(let retry=0;retry<4;retry++){
    const code=Array.from(randomBytes(8),x=>CHARS[x%CHARS.length]).join('');
    const room=createRoom({code,name,host:{id:me.id,name:me.name,title},settings,capacity,questions,now:Date.now()});
    if(await insertRoom(room))return response(res,201,{code,capacity,state:view(room,me.id,Date.now())});
   }
   return response(res,503,{error:'방 코드를 만들지 못했어. 다시 시도해 줘.'});
  }
  const code=String(body.code||'').trim().toUpperCase();
  if(!CODE_RE.test(code))return response(res,400,{error:'8자리 방 코드를 확인해 줘.'});
  const result=await actionRoom(code,{id:me.id,name:me.name,title:String(body.title||'국어 새내기').slice(0,30)},action,body);
  return response(res,result.status,result.error?{error:result.error}:result);
 }catch(error){console.error('Public arena',error?.name||'UnknownError');return response(res,503,{error:'공개방 서버에 연결하지 못했어.'})}
}
