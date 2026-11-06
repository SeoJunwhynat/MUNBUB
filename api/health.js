/* Safe public readiness probe; never return secrets or account information. */
import {configured,noCache} from '../lib/mb-server.js';
export default function handler(req,res){
 noCache(res);
 if(req.method!=='GET')return res.status(405).json({error:'GET 요청만 지원해.'});
 return res.status(configured()?200:503).json({
  status:configured()?'configured':'setup-required',
  accounts:configured(),publicRooms:configured(),
  nextStep:configured()?undefined:'Vercel Storage에서 Blob 스토어를 프로젝트에 연결하고 프로덕션 환경변수를 적용해 재배포해 줘.'
 });
}
