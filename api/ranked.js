/* Verified ranked sessions for timed one-minute and infinite quiz modes.
 * Never trust client-reported points, correctness or elapsed time.
 */
import { randomInt } from 'node:crypto';
import {configured,noCache,sameOrigin,session,token,verify,newId,
 readPrivate,writePrivate,answerCorrect,duelQuestionIds} from '../lib/mb-server.js';

const MODES=['timed60','infinite','hardcore'];
const CATEGORIES=['s','i','a'];
const BANK_IDS=duelQuestionIds().filter(id=>/^[sia]\d{1,4}$/.test(id)&&
 (id[0]!=='i'||Number(id.slice(1))<=95)&&
 (id[0]!=='a'||Number(id.slice(1))<=210));
// Ranked play must choose from the base bank always shipped in index.html.
// Extra application questions depend on a separately loaded optional script;
// choosing them could create a server run before the client knows the question.
function chooseQuestion(st){
 const target=CATEGORIES[st.answered%3];
 const permitted=BANK_IDS.filter(id=>id.startsWith(target)&&!st.recent.includes(id));
 const candidates=permitted.length?permitted:BANK_IDS.filter(id=>!st.recent.includes(id));
 if(!candidates.length)throw Error('No available ranked questions');
 return candidates[randomInt(candidates.length)];
}
const VALID_QID=/^[sia]\d{1,4}$/;
const MAX_RECENT=35;
const pathFor=(mode,id)=>'rankings/'+mode+'/'+id+'.json';
const okayQ=id=>typeof id==='string'&&VALID_QID.test(id)&&answerCorrect(id,'')!==null;
const err=(res,code,msg)=>res.status(code).json({error:msg});
async function saveBest(me,st){
 const mode=st.mode,correct=Math.max(0,Number(st.correct)||0);
 const score=mode==='hardcore'?Math.max(0,Number(st.score)||0):correct;
 if(mode==='hardcore'){
  // Keep the previous hardcore ranking's scores/ storage schema intact.
  const file='scores/'+st.runId+'.json';
  await writePrivate(file,{id:me.id,name:me.name,score,correct,at:Date.now()});
  return {recorded:true,isNewBest:true,best:score};
 }
 if(!correct)return {recorded:false};
 const file=pathFor(mode,me.id);
 const existing=await readPrivate(file,{fresh:true});
 const answered=Math.max(0,Number(st.answered)||0);
 if(existing&&
  (existing.correct>correct||
   (existing.correct===correct&&existing.answered<=answered))){
  return {recorded:true,isNewBest:false,best:existing.correct};
 }
 await writePrivate(file,{
  id:me.id,name:me.name,mode,correct,answered,at:Date.now()
 },{overwrite:!!existing});
 return {recorded:true,isNewBest:true,best:correct};
}
export default async function handler(req,res){
 noCache(res);
 if(req.method!=='POST')return err(res,405,'POST만 지원해.');
 if(!sameOrigin(req))return err(res,403,'허용되지 않은 요청이야.');
 if(!configured())return err(res,503,'온라인 순위 저장소가 아직 준비되지 않았어.');
 const me=session(req);if(!me)return err(res,401,'온라인 순위에는 로그인이 필요해.');
 let body;
 try{body=typeof req.body==='string'?JSON.parse(req.body):req.body||{}}catch{return err(res,400,'올바른 요청이 아니야.')}
 try{
  const now=Date.now();
  if(body.action==='start'){
   const mode=String(body.mode||''),qid=String(body.qid||'');
   const rankedChallenge=body.rankedChallenge===true;
   if(!MODES.includes(mode)||(!rankedChallenge&&!okayQ(qid))||
     (mode==='hardcore'&&!rankedChallenge))return err(res,400,'지원하지 않는 모드 또는 문제야.');
   const state={
    kind:'ranked',id:me.id,mode,runId:newId(),qid,
    rankedChallenge,phase:'question',correct:0,answered:0,score:0,recent:rankedChallenge?[]:[qid],
    createdAt:now,startedAt:now,
    deadline:mode==='timed60'?now+60000:null,
    exp:now+(mode==='timed60'?8*60*1000:3*3600*1000)
   };
   if(rankedChallenge){state.qid=chooseQuestion(state);state.recent=[state.qid]}
   return res.status(200).json({run:token(state),qid:state.qid,correct:0,answered:0,mode,rankedChallenge,deadline:state.deadline,serverNow:now});
  }
  const st=verify(body.run);
  if(!st||st.kind!=='ranked'||st.id!==me.id||
    !MODES.includes(st.mode)||!Number.isInteger(st.correct)||
    !Number.isInteger(st.answered)||st.correct<0||st.answered<0||
    st.correct>st.answered||st.answered>10000||!okayQ(st.qid)||
    (st.mode==='hardcore'&&(!st.rankedChallenge||!Number.isFinite(st.score)||st.score<0))||
    !Array.isArray(st.recent)||st.recent.length>MAX_RECENT||
    st.recent.some(id=>!okayQ(id))){
   return err(res,401,'랭킹 도전이 만료되었어. 새 도전을 시작해 줘.');
  }
  const timeExpired=st.mode==='timed60'&&now>=st.deadline;
  if(body.action==='finish'){
   const saved=await saveBest(me,st);
   return res.status(200).json({ended:true,mode:st.mode,
    score:st.score||0,correct:st.correct,answered:st.answered,...saved});
  }
  if(timeExpired){
   const saved=await saveBest(me,st);
   return res.status(200).json({ended:true,timeUp:true,mode:st.mode,
    correct:st.correct,answered:st.answered,...saved});
  }
  if(body.action==='next'){
   const qid=st.rankedChallenge?chooseQuestion(st):String(body.qid||'');
   if(st.phase!=='next'||!okayQ(qid))
    return err(res,409,'다음 문제 순서 또는 문제 정보가 올바르지 않아.');
   if(st.recent.includes(qid))
    return err(res,409,'온라인 랭킹은 최근 출제된 문제를 반복해서 점수를 올릴 수 없어.');
   const next={...st,qid,phase:'question',startedAt:now,
    recent:[...st.recent.slice(-(MAX_RECENT-1)),qid]};
   return res.status(200).json({run:token(next),qid,correct:next.correct,answered:next.answered,deadline:next.deadline,serverNow:now});
  }
  if(body.action==='answer'){
   const qid=String(body.qid||'');
   if(st.phase!=='question'||st.qid!==qid)return err(res,409,'답변 순서가 맞지 않아.');
   const answer=String(body.answer??'');
   if(answer.length>160)return err(res,400,'답변이 너무 길어.');
   const correct=answerCorrect(qid,answer);
   if(correct===null)return err(res,400,'문제 정보를 검증하지 못했어.');
   const elapsed=Math.max(0,now-st.startedAt);
   const points=correct?Math.max(1,Math.min(10,Math.round(10-9*Math.min(1,elapsed/35000)))):0;
   const next={...st,phase:'next',answered:st.answered+1,
    correct:st.correct+(correct?1:0),score:(st.score||0)+points,startedAt:now};
   if(st.mode==='hardcore'&&!correct){
    const saved=await saveBest(me,next);
    return res.status(200).json({ended:true,mode:st.mode,verifiedCorrect:false,
     score:next.score,correct:next.correct,answered:next.answered,...saved});
   }
   let saved={recorded:false};
   // Infinite scores survive closing a tab; every fifth correct answer is
   // checkpointed and finish() saves the remainder.
   if(st.mode==='infinite'&&correct&&next.correct%5===0)
    saved=await saveBest(me,next);
   return res.status(200).json({run:token(next),mode:st.mode,
    score:next.score,points,correct:next.correct,answered:next.answered,verifiedCorrect:correct,...saved});
  }
  return err(res,400,'알 수 없는 온라인 랭킹 동작이야.');
 }catch(e){
  console.error('Ranked API:',e?.message);
  return err(res,503,'온라인 기록을 전송하지 못했어.');
 }
}
