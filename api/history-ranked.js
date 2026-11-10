/* 한국사 2 공식 랭킹전 · 서버 채점 / Neon storage / signed account */
import {randomUUID} from 'node:crypto';
import {neon} from '@neondatabase/serverless';
import {configured,noCache,sameOrigin,session} from '../lib/mb-server.js';
import {HISTORY_RANKED_MAP,HISTORY_RANKED_MODES,selectRankedQuestion} from '../lib/mb-history-ranked-bank.js';

const PREFIX='history-ranked/';
const RUN=/^[0-9a-f-]{36}$/;
const RUN_TTL=3*60*60*1000;
let sqlClient;
const sql=(q,args=[])=>{sqlClient??=neon(process.env.DATABASE_URL);return sqlClient.query(q,args)};
const runKey=id=>PREFIX+'run/'+id;
const bestKey=(mode,id)=>PREFIX+'best/'+mode+'/'+id;
const error=(res,status,message)=>res.status(status).json({error:message});
async function getObject(key){const rows=await sql('SELECT body FROM mb_objects WHERE pathname=$1',[key]);return rows[0]?.body||null}
async function insertObject(key,obj){const rows=await sql('INSERT INTO mb_objects(pathname,body) VALUES($1,$2::jsonb) ON CONFLICT DO NOTHING RETURNING pathname',[key,JSON.stringify(obj)]);return rows.length>0}
async function replace(old,next){
 next.revision=old.revision+1;
 const rows=await sql("UPDATE mb_objects SET body=$2::jsonb,updated_at=NOW() WHERE pathname=$1 AND (body->>'revision')::integer=$3 RETURNING pathname",[runKey(old.runId),JSON.stringify(next),old.revision]);
 return rows.length>0;
}
function shown(s,review=false){
 const q=HISTORY_RANKED_MAP.get(s.qid);
 return {
  runId:s.runId,mode:s.mode,phase:s.phase,answered:s.answered,correct:s.correct,score:s.score,
  elapsedMs:Date.now()-s.startedAt,deadline:s.deadline||null,finishedReason:s.finishedReason||null,
  question:['question','review'].includes(s.phase)&&q?{id:q.id,type:q.type,unit:q.unit,prompt:q.prompt,choices:q.choices,number:s.answered+1}:null,
  review:review||s.phase==='review'?{correctIndex:q?.correct??null,explanation:q?.explain||'',wasCorrect:s.lastCorrect===true,points:s.lastPoints||0}:null
 };
}
async function bestRecord(me,s){
 if(s.saved)return false;
 const score=s.score;
 if(s.answered===0)return false;
 const obj={id:me.id,name:String(me.name||'학습자').slice(0,28),score,correct:s.correct,answered:s.answered,mode:s.mode,at:Date.now()};
 const rows=await sql("INSERT INTO mb_objects(pathname,body) VALUES($1,$2::jsonb) ON CONFLICT(pathname) DO UPDATE SET body=EXCLUDED.body, updated_at=NOW() WHERE COALESCE((mb_objects.body->>'score')::int,-1)<$3 RETURNING pathname",
 [bestKey(s.mode,me.id),JSON.stringify(obj),score]);
 return rows.length>0;
}
async function board(mode){
 const rows=await sql("SELECT body FROM mb_objects WHERE pathname LIKE $1 ORDER BY COALESCE((body->>'score')::int,0) DESC LIMIT 30",[PREFIX+'best/'+mode+'/%']);
 return rows.map((r,i)=>({rank:i+1,name:r.body.name,score:r.body.score,correct:r.body.correct,at:r.body.at}));
}
export default async function handler(req,res){
 noCache(res);
 if(!configured())return error(res,503,'역사 랭킹전은 Render/Neon 로그인이 필요해.');
 const me=session(req);
 if(req.method==='GET'){
  const mode=String(req.query?.mode||'infinite');
  if(!HISTORY_RANKED_MODES.includes(mode))return error(res,400,'지원하지 않는 랭킹 유형이야.');
  try{return res.status(200).json({mode,board:await board(mode)})}
  catch(e){console.error('History rank list',e?.message);return error(res,503,'랭킹 목록을 가져오지 못했어.')}
 }
 if(req.method!=='POST')return error(res,405,'지원하지 않는 방식이야.');
 if(!sameOrigin(req))return error(res,403,'잘못된 요청 출처야.');
 if(!me)return error(res,401,'맛춘범에 로그인해야 역사 랭킹전에 참가할 수 있어.');
 const body=req.body&&typeof req.body==='object'?req.body:{};
 const action=String(body.action||'');
 try{
  if(action==='start'){
   const mode=String(body.mode||'');
   if(!HISTORY_RANKED_MODES.includes(mode))return error(res,400,'지원하지 않는 모드야.');
   const now=Date.now(),qid=selectRankedQuestion([],0).id;
   for(let t=0;t<3;t++){
    const s={runId:randomUUID(),userId:me.id,mode,phase:'question',qid,revision:0,answered:0,correct:0,score:0,
     createdAt:now,startedAt:now,deadline:mode==='timed60'?now+60000:null,expiresAt:now+RUN_TTL,recent:[qid],lastCorrect:null,lastPoints:0,finishedReason:null,saved:false};
    if(await insertObject(runKey(s.runId),s))return res.status(200).json({state:shown(s)});
   }
   return error(res,503,'랭킹 세션을 생성하지 못했어.');
  }
  const runId=String(body.runId||'');
  if(!RUN.test(runId))return error(res,400,'세션 번호를 확인해 줘.');
  for(let tryNumber=0;tryNumber<12;tryNumber++){
   const old=await getObject(runKey(runId));
   if(!old||old.userId!==me.id||old.expiresAt<Date.now())return error(res,404,'기한이 지난 기록이거나 본인의 세션이 아니야.');
   const next=structuredClone(old),now=Date.now();
   if(next.phase==='finished')return res.status(200).json({state:shown(next)});
   if(next.deadline&&now>=next.deadline){next.phase='finished';next.finishedReason='time';}
   else if(action==='answer'){
    if(next.phase!=='question')return error(res,409,'현재는 답안을 제출할 수 없어.');
    const choice=Number(body.choice),q=HISTORY_RANKED_MAP.get(next.qid);
    if(!q||!Number.isInteger(choice)||choice<0||choice>3)return error(res,400,'선택지를 확인해 줘.');
    const ok=choice===q.correct;
    next.answered+=1;next.lastCorrect=ok;next.correct+=ok?1:0;
    const points=ok?(next.mode==='hardcore'?Math.max(1,10-Math.floor((now-next.createdAt)/6000)):1):0;
    next.lastPoints=points;next.score+=points;
    next.phase=next.mode==='hardcore'&&!ok?'finished':'review';
    if(next.phase==='finished')next.finishedReason='wrong';
   }else if(action==='next'){
    if(next.phase!=='review')return error(res,409,'먼저 현재 문제에 답해 줘.');
    const q=selectRankedQuestion(next.recent,next.answered);
    next.qid=q.id;next.recent=[...next.recent,q.id].slice(-35);
    next.phase='question';next.createdAt=now;next.lastCorrect=null;next.lastPoints=0;
   }else if(action==='finish'){next.phase='finished';next.finishedReason='exit'}
   else if(action!=='status')return error(res,400,'지원하지 않는 작업이야.');
   if(next.phase==='finished'&&!next.saved){
    await bestRecord(me,next);
    next.saved=true;
   }
   if(await replace(old,next)){
    return res.status(200).json({state:shown(next,next.phase==='review'||next.finishedReason==='wrong')});
   }
  }
  return error(res,409,'요청이 겹쳤어. 다시 진행해 줘.');
 }catch(e){console.error('History ranked API',e?.message);return error(res,503,'역사 랭킹 요청을 처리하지 못했어.')}
}
