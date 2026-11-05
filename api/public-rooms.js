/* Live public room listing; batched reads prevent 200+ requests per refresh. */
import { list } from '../lib/mb-storage.js';
import { configured, noCache, readPrivateBatch } from '../lib/mb-server.js';
const ID=/^[A-HJ-NP-Z2-9]{8}$/;
const PREFIX='public-rooms/';

export default async function handler(req,res){
  noCache(res);
  if(req.method!=='GET')return res.status(405).json({error:'GET 전용 요청이야.'});
  if(!configured())return res.status(503).json({error:'공개방 저장소가 연결되지 않았어.'});
  try{
    const now=Date.now();
    const blobList=await list({prefix:PREFIX,limit:1000});
    const recent=blobList.blobs
      .filter(b=>!b.uploadedAt||now-new Date(b.uploadedAt).getTime()<50*60*1000)
      .sort((a,b)=>new Date(b.uploadedAt||0)-new Date(a.uploadedAt||0))
      .slice(0,60);
    const descriptions=await readPrivateBatch(recent.map(b=>b.pathname),{fresh:true});
    const rooms=descriptions.filter(r=>r&&ID.test(r.code)&&Number.isFinite(r.expiresAt)&&r.expiresAt>now);
    const infoPaths=rooms.flatMap(r=>[
      'duels/'+r.code+'/guest.json',
      'duels/'+r.code+'/presence/'+r.hostId+'.json',
      'duels/'+r.code+'/lobby.json'
    ]);
    const info=await readPrivateBatch(infoPaths,{fresh:true});
    const guestEntries=rooms.map((r,i)=>info[i*3]||null);
    const visitorPaths=rooms.map((r,i)=>guestEntries[i]
      ?'duels/'+r.code+'/presence/'+guestEntries[i].id+'.json':null);
    const visitorInfo=await readPrivateBatch(visitorPaths.filter(Boolean),{fresh:true});
    let visitorIndex=0;
    const results=[];
    for(let i=0;i<rooms.length;i++){
      const r=rooms[i],guest=guestEntries[i],host=info[i*3+1],lobby=info[i*3+2];
      const visitor=guest?visitorInfo[visitorIndex++]:null;
      if(host?.leftAt||!host?.at||now-host.at>60000)continue;
      const occupied=!!guest&&!visitor?.leftAt;
      results.push({
        code:r.code,name:r.roomName||'공개 대결방',
        host:r.hostName||'플레이어',title:r.hostTitle||'국어 새내기',
        type:r.settings?.type||'mixed',form:r.settings?.form||'auto',
        count:r.settings?.count||10,seconds:r.settings?.seconds||25,
        players:occupied?2:1,capacity:2,
        status:lobby?.startedAt?'playing':occupied?'full':'waiting',
        createdAt:r.createdAt||0
      });
    }
    return res.status(200).json({rooms:results.sort((a,b)=>b.createdAt-a.createdAt).slice(0,80)});
  }catch(error){
    console.error('Public room listing',error?.name||'UnknownError');
    return res.status(503).json({error:'공개방 목록을 불러오지 못했어.'});
  }
}
