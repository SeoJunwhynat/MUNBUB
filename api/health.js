/* Safe public readiness probe. Never returns database URLs, tokens or account data. */
import { configured, noCache } from '../lib/mb-server.js';
import { usingPostgres, checkStorage } from '../lib/mb-storage.js';

export default async function handler(req,res) {
  noCache(res);
  if(req.method!=='GET')return res.status(405).json({error:'GET 요청만 지원해.'});
  const backend='postgres';
  if(!configured())return res.status(503).json({
    status:'setup-required', backend, accounts:false, publicRooms:false,
    nextStep:'Render Environment에 DATABASE_URL과 MB_SESSION_SECRET을 설정해 줘.'
  });
  // Both ?probe=storage and the previously documented ?probe=blob are accepted.
  if(req.query?.probe==='storage'||req.query?.probe==='blob'){
    try {
      const status=await checkStorage();
      return res.status(200).json({status:'storage-readable',...status,
        note:'스토리지 연결을 읽기로 확인했어. 실제 계정 저장 쓰기 테스트는 별도로 필요해.'});
    } catch(error){
      console.error('Storage health probe failed:', {
        name:String(error?.name||'Unknown').slice(0,80),
        code:String(error?.code||'').slice(0,80)
      });
      return res.status(503).json({status:'storage-unreachable',backend,
        nextStep:'Neon 데이터베이스 연결과 Render 환경변수 권한을 확인해 줘.'});
    }
  }
  return res.status(200).json({status:'configured',backend,accounts:true,publicRooms:true,
    note:'환경변수 존재만 확인했어. 실제 연결은 ?probe=storage를 이용해 검사해 줘.'});
}
