/* Live, opt-in public duel listing. Private invite rooms never appear here. */
import { list } from '../lib/mb-storage.js';
import { configured, noCache, readPrivate } from '../lib/mb-server.js';
const ID=/^[A-HJ-NP-Z2-9]{8}$/;
const PREFIX='public-rooms/';
export default async function handler(req,res){
 noCache(res);
 if(req.method!=='GET')return res.status(405).json({error:'GET 전용 요청이야.'});
 if(!configured())return res.status(503).json({error:'공개방 저장소가 연결되지 않았어. Vercel Blob 연결을 확인해 줘.'});
 try{
  const blobList=await list({prefix:PREFIX,limit:1000});
  // Avoid 3-4 private Blob reads for hundreds of expired rooms. Metadata from
  // list is enough to reject old objects before touching their contents.
  const recent=blobList.blobs.filter(b=>!b.uploadedAt||Date.now()-new Date(b.uploadedAt).getTime()<50*60*1000)
   .sort((a,b)=>new Date(b.uploadedAt||0)-new Date(a.uploadedAt||0)).slice(0,60);
  const rows=await Promise.all(recent.map(async b=>{
   try{
    const r=await readPrivate(b.pathname,{fresh:true});
    if(!r||!ID.test(r.code)||!Number.isFinite(r.expiresAt)||r.expiresAt<Date.now())return null;
    const [guest,host,lobby]=await Promise.all([
     readPrivate('duels/'+r.code+'/guest.json',{fresh:true}),
     readPrivate('duels/'+r.code+'/presence/'+r.hostId+'.json',{fresh:true}),
     readPrivate('duels/'+r.code+'/lobby.json',{fresh:true})
    ]);
    if(host?.leftAt||!host?.at||Date.now()-host.at>60000)return null;
    const visitor=guest?await readPrivate('duels/'+r.code+'/presence/'+guest.id+'.json',{fresh:true}):null;
    const occupied=!!guest&&!visitor?.leftAt;
    return {code:r.code,name:r.roomName||'공개 대결방',
     host:r.hostName||'플레이어',title:r.hostTitle||'국어 새내기',
     type:r.settings?.type||'mixed',form:r.settings?.form||'auto',
     count:r.settings?.count||10,seconds:r.settings?.seconds||25,
     players:occupied?2:1,capacity:2,
     status:lobby?.startedAt?'playing':occupied?'full':'waiting',createdAt:r.createdAt||0};
   }catch{return null}
  }));
  return res.status(200).json({rooms:rows.filter(Boolean).sort((a,b)=>b.createdAt-a.createdAt).slice(0,80)});
 }catch(e){console.error('Public room listing',e?.message);return res.status(503).json({error:'공개방 목록을 불러오지 못했어.'})}
}
