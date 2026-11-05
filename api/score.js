import {configured,noCache,sameOrigin,session,token,verify,newId,writePrivate,answerCorrect} from '../lib/mb-server.js';
export default async function handler(req,res){
 noCache(res);
 if(req.method!=='POST')return res.status(405).json({error:'POST만 지원해요.'});
 if(!sameOrigin(req))return res.status(403).json({error:'잘못된 요청 출처예요.'});
 if(!configured())return res.status(503).json({error:'서버 랭킹 준비 중이에요.'});
 const me=session(req);if(!me)return res.status(401).json({error:'온라인 랭킹에는 닉네임 로그인이 필요해.'});
 const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
 const now=Date.now();
 try{
  if(body.action==='start'){
   const qid=String(body.qid||'');
   if(!/^[si]\d+$/.test(qid)||answerCorrect(qid,'')===null)return res.status(400).json({error:'기본 맞춤법·사자성어만 가능해.'});
   const run={kind:'run',id:me.id,runId:newId(),qid,score:0,correct:0,phase:'question',startedAt:now,createdAt:now,exp:now+7200000};
   return res.status(200).json({run:token(run),score:0,correct:0})
  }
  const state=verify(body.run);
  if(state?.kind!=='run'||state.id!==me.id||state.createdAt<now-7200000||state.correct>2500)return res.status(401).json({error:'랭킹 세션이 만료되었어.'});
  if(body.action==='next'){
   const qid=String(body.qid||'');
   if(state.phase!=='next'||!/^[si]\d+$/.test(qid)||answerCorrect(qid,'')===null)return res.status(409).json({error:'다음 문제 순서가 맞지 않아.'});
   return res.status(200).json({run:token({...state,qid,phase:'question',startedAt:now}),score:state.score,correct:state.correct})
  }
  if(body.action==='answer'){
   if(state.phase!=='question'||state.qid!==body.qid)return res.status(409).json({error:'문제 순서가 맞지 않아.'});
   const correct=answerCorrect(state.qid,body.answer);
   if(correct===null)return res.status(400).json({error:'문제 정보가 잘못되었어.'});
   const elapsed=Math.max(0,now-state.startedAt);
   const seconds=state.qid.startsWith('i')&&body.form==='text'?60000:35000;
   const points=correct?Math.max(1,Math.min(10,Math.round(10-9*Math.min(1,elapsed/seconds)))):0;
   const next={...state,score:state.score+points,correct:state.correct+(correct?1:0),phase:correct?'next':'ended'};
   if(!correct){
    await writePrivate('scores/'+next.runId+'.json',{id:me.id,name:me.name,score:next.score,correct:next.correct,at:now});
    return res.status(200).json({ended:true,correct:false,points,score:next.score,answers:next.correct})
   }
   return res.status(200).json({ended:false,correct:true,points,score:next.score,answers:next.correct,run:token(next)})
  }
  return res.status(400).json({error:'알 수 없는 랭킹 요청이야.'})
 }catch(e){console.error('Score API:',e.message);return res.status(503).json({error:'랭킹 서버를 사용할 수 없어.'})}
}
