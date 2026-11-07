/* Safe public readiness probe; never return secrets or account information. */
import {configured,noCache} from '../lib/mb-server.js';
import {checkStorage} from '../lib/mb-storage.js';
export default async function handler(req,res){
 noCache(res);
 if(req.method!=='GET')return res.status(405).json({error:'GET 요청만 지원해.'});
 if(!configured())return res.status(503).json({status:'setup-required',accounts:false,publicRooms:false,
   nextStep:'Render의 DATABASE_URL과 SESSION_SECRET을 확인해 줘.'});
 try{
  const storage=await checkStorage();
  return res.status(200).json({status:'configured',accounts:true,publicRooms:true,storage:storage.backend});
 }catch(error){
  console.error('Health database unavailable:',error?.name||'Unknown');
  return res.status(503).json({status:'storage-unavailable',accounts:false,publicRooms:false});
 }
}
