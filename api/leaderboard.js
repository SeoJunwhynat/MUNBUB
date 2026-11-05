import {configured,noCache,topScores,topModeScores,session} from '../lib/mb-server.js';
export default async function handler(req,res){
 noCache(res);
 if(req.method!=='GET')return res.status(405).json({error:'GET만 지원해요.'});
 if(!configured())return res.status(503).json({error:'랭킹 저장소가 준비되지 않았어요.'});
 const mode=String(req.query?.mode||'hardcore');
 if(!['hardcore','timed60','infinite'].includes(mode))
  return res.status(400).json({error:'지원하지 않는 랭킹 유형이야.'});
 try{
  const scores=mode==='hardcore'?await topScores():await topModeScores(mode);
  return res.status(200).json({scores,me:session(req)?.id||null,mode,scope:'online',rule:'1인 모드별 최고 기록'});
 }catch(e){console.error('Leaderboard API:',e.message);return res.status(503).json({error:'랭킹을 불러오지 못했어.'})}
}
