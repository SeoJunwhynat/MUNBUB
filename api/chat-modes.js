/* Server-authoritative personal messages and account-wide announcements. */
import {configured,sameOrigin,readPrivate} from '../lib/mb-server.js';
import {chatQuery} from '../lib/mb-storage.js';
import {activeUserIds} from '../lib/mb-presence.js';
const ID=/^[a-f0-9-]{36}$/i;
const validId=x=>ID.test(String(x||''))?String(x):null;
const output=(res,code,body)=>res.status(code).json(body);
const record=x=>({id:String(x.id),name:String(x.name||''),text:String(x.text||''),at:Number(x.at)||0,mine:!!x.mine});
const clean=x=>{
 if(typeof x!=='string')return null;
 const t=x.normalize('NFC').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim();
 return [...t].length&&[...t].length<=180&&Buffer.byteLength(t,'utf8')<=900?t:null;
};
const localThrottle=new Map();
function throttled(user,channel,ms){
 const key=user+':'+channel,now=Date.now();
 if((localThrottle.get(key)||0)+ms>now)return true;
 localThrottle.set(key,now);
 if(localThrottle.size>20000)for(const [k,t] of localThrottle)if(t<now-90000)localThrottle.delete(k);
 return false;
}
export default async function handleChatModes(req,res,user){
 if(!configured())return output(res,503,{error:'채팅 저장소를 사용할 수 없어.'});
 if(req.method==='GET'&&req.query?.mode==='broadcast'){
  try{
   const since=/^[0-9]{1,18}$/.test(String(req.query.since||''))?String(req.query.since):'0';
   const rows=await chatQuery([
    'SELECT id::text AS id,display_name AS name,body AS text,',
    '(EXTRACT(EPOCH FROM created_at)*1000)::bigint AS at',
    'FROM mb_chat_broadcast WHERE id>$1::bigint',
    "AND created_at>NOW()-INTERVAL '24 hours'",
    'ORDER BY mb_chat_broadcast.id DESC LIMIT 15'
   ].join(' '),[since]);
   return output(res,200,{ok:true,messages:rows.reverse().map(record)});
  }catch(e){console.error('Broadcast read',e.name);return output(res,503,{error:'전체 알림 조회 오류'})}
 }
 if(!user)return output(res,401,{error:'먼저 로그인해 줘.'});
 if(req.method==='GET'){
  try{
   if(req.query.mode==='dm_notifications'){
    // Recipient-only, server-authenticated. Never return other users' inboxes.
    const since=/^[0-9]{1,18}$/.test(String(req.query.since||''))?String(req.query.since):'0';
    const rows=await chatQuery([
      'SELECT m.id::text AS id,m.sender_id AS sender_id,m.sender_name AS name,',
      'm.body AS text,(EXTRACT(EPOCH FROM m.created_at)*1000)::bigint AS at',
      'FROM mb_private_chat m',
      'WHERE m.receiver_id=$1 AND m.id>$2::bigint',
      "AND m.created_at>NOW()-INTERVAL '7 days'",
      'AND NOT EXISTS (SELECT 1 FROM mb_chat_blocks b',
      'WHERE b.owner_id=$1 AND b.target_id=m.sender_id)',
      'ORDER BY m.id DESC LIMIT 20'
    ].join(' '),[user.id,since]);
    return output(res,200,{ok:true,me:user.id,messages:rows.reverse().map(x=>({
      ...record(x),senderId:String(x.sender_id)
    }))});
   }
   if(req.query.mode==='users'){
    const q=String(req.query.q||'').normalize('NFC').trim().toLocaleLowerCase('ko-KR').slice(0,30);
    // Only public nickname and account id; never return password or profile objects.
    const people=await chatQuery([
      "SELECT body->>'id' AS id,body->>'name' AS name FROM mb_objects",
      "WHERE pathname LIKE 'profiles/%' AND body ? 'id' AND body ? 'name'",
      'ORDER BY pathname LIMIT 3000'
    ].join(' '));
    const online=new Set(activeUserIds());
    const b=await chatQuery('SELECT target_id FROM mb_chat_blocks WHERE owner_id=$1',[user.id]);
    const blocks=new Set(b.map(x=>x.target_id));
    const users=people.filter(p=>p.id!==user.id&&validId(p.id)&&typeof p.name==='string'&&(!q||p.name.toLocaleLowerCase('ko-KR').includes(q)))
      .map(p=>({id:p.id,name:p.name,online:online.has(p.id),blocked:blocks.has(p.id)}))
      .sort((a,b)=>Number(b.online)-Number(a.online)||a.name.localeCompare(b.name,'ko')).slice(0,150);
    return output(res,200,{ok:true,users});
   }
   if(req.query.mode==='dm'){
    const peer=validId(req.query.peer);
    if(!peer||peer===user.id)return output(res,400,{error:'상대방을 선택해 줘.'});
    const profile=await readPrivate('profiles/'+peer+'.json');
    if(!profile)return output(res,404,{error:'해당 계정을 찾지 못했어.'});
    const rows=await chatQuery([
      'SELECT id::text AS id,sender_name AS name,body AS text,',
      '(EXTRACT(EPOCH FROM created_at)*1000)::bigint AS at,(sender_id=$1) AS mine',
      'FROM mb_private_chat',
      'WHERE ((sender_id=$1 AND receiver_id=$2) OR (sender_id=$2 AND receiver_id=$1))',
      'AND NOT EXISTS(SELECT 1 FROM mb_chat_blocks b WHERE b.owner_id=$1 AND b.target_id=mb_private_chat.sender_id)',
      'ORDER BY mb_private_chat.id DESC LIMIT 60'
    ].join(' '),[user.id,peer]);
    return output(res,200,{ok:true,peer:profile.name,messages:rows.reverse().map(record)});
   }
   if(req.query.mode==='inbox'){
    const rows=await chatQuery([
      'SELECT DISTINCT ON (peer) peer,name,id::text AS id,',
      '(EXTRACT(EPOCH FROM created_at)*1000)::bigint AS at',
      'FROM (SELECT id,created_at,',
      'CASE WHEN sender_id=$1 THEN receiver_id ELSE sender_id END AS peer,',
      'CASE WHEN sender_id=$1 THEN receiver_name ELSE sender_name END AS name',
      'FROM mb_private_chat WHERE sender_id=$1 OR receiver_id=$1) threads',
      'WHERE NOT EXISTS(SELECT 1 FROM mb_chat_blocks b WHERE b.owner_id=$1 AND b.target_id=peer)',
      'ORDER BY peer,threads.id DESC LIMIT 80'
    ].join(' '),[user.id]);
    return output(res,200,{ok:true,threads:rows.sort((a,b)=>Number(b.at)-Number(a.at)).map(x=>({peer:x.peer,name:x.name,id:String(x.id),at:Number(x.at)}))});
   }
   return output(res,400,{error:'채팅 목록이 올바르지 않아.'});
  }catch(e){console.error('DM read',e.name);return output(res,503,{error:'대화 목록을 불러오지 못했어.'})}
 }
 if(req.method!=='POST')return output(res,405,{error:'POST만 지원해.'});
 if(!sameOrigin(req))return output(res,403,{error:'허용되지 않은 출처야.'});
 const body=req.body||{};
 try{
  if(body.action==='send_broadcast'){
   const message=clean(body.text);
   if(!message)return output(res,400,{error:'1~180자 이내로 작성해 줘.'});
   if(throttled(user.id,'all',3000))return output(res,429,{error:'모두에게 알림은 3초 간격으로 전송할 수 있어.'});
   const rows=await chatQuery([
     'INSERT INTO mb_chat_broadcast(user_id,display_name,body)',
     'SELECT $1,$2,$3 WHERE NOT EXISTS(',
     "SELECT 1 FROM mb_chat_broadcast WHERE user_id=$1 AND created_at>NOW()-INTERVAL '3 seconds')",
     'AND (SELECT COUNT(*) FROM mb_chat_broadcast WHERE user_id=$1',
     "AND created_at>NOW()-INTERVAL '60 seconds')<6",
     'RETURNING id::text AS id,display_name AS name,body AS text,',
     '(EXTRACT(EPOCH FROM created_at)*1000)::bigint AS at'
   ].join(' '),[user.id,user.name,message]);
   if(!rows.length)return output(res,429,{error:'전송 간격이 짧아. 잠시 뒤에 다시 보내 줘.'});
   return output(res,201,{ok:true,message:record(rows[0])});
  }
  if(body.action==='report_dm'){
   const id=/^[1-9][0-9]{0,17}$/.test(String(body.id||''))?String(body.id):null;
   if(!id)return output(res,400,{error:'신고 대상이 올바르지 않아.'});
   const rows=await chatQuery([
    'INSERT INTO mb_private_chat_reports(message_id,reporter_id)',
    'SELECT id,$2 FROM mb_private_chat WHERE id=$1::bigint AND receiver_id=$2 AND sender_id<>$2',
    'ON CONFLICT DO NOTHING RETURNING message_id'
   ].join(' '),[id,user.id]);
   return output(res,200,{ok:true,reported:rows.length>0});
  }
  if(['send_dm','block','unblock'].includes(body.action)){
   const peer=validId(body.peer);
   if(!peer||peer===user.id)return output(res,400,{error:'받을 이용자를 선택해 줘.'});
   const target=await readPrivate('profiles/'+peer+'.json');
   if(!target)return output(res,404,{error:'해당 이용자를 찾지 못했어.'});
   if(body.action==='block'){
    await chatQuery('INSERT INTO mb_chat_blocks(owner_id,target_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[user.id,peer]);
    return output(res,200,{ok:true,blocked:true});
   }
   if(body.action==='unblock'){
    await chatQuery('DELETE FROM mb_chat_blocks WHERE owner_id=$1 AND target_id=$2',[user.id,peer]);
    return output(res,200,{ok:true,blocked:false});
   }
   const message=clean(body.text);
   if(!message)return output(res,400,{error:'개인 메시지는 1~180자로 작성해 줘.'});
   // Private messages have no fixed wait; a short burst quota prevents flooding.
   const rows=await chatQuery([
    'INSERT INTO mb_private_chat(sender_id,receiver_id,sender_name,receiver_name,body)',
    'SELECT $1,$2,$3,$4,$5 WHERE NOT EXISTS(',
    'SELECT 1 FROM mb_chat_blocks WHERE (owner_id=$1 AND target_id=$2) OR (owner_id=$2 AND target_id=$1))',
    'AND (SELECT COUNT(*) FROM mb_private_chat WHERE sender_id=$1',
    "AND created_at>NOW()-INTERVAL '10 seconds')<8",
    'AND (SELECT COUNT(*) FROM mb_private_chat WHERE sender_id=$1',
    "AND created_at>NOW()-INTERVAL '60 seconds')<30",
    'RETURNING id::text AS id,sender_name AS name,body AS text,',
    '(EXTRACT(EPOCH FROM created_at)*1000)::bigint AS at'
   ].join(' '),[user.id,peer,user.name,target.name,message]);
   if(!rows.length)return output(res,409,{error:'상대방이 차단했거나 메시지를 너무 빠르게 많이 보냈어.'});
   return output(res,201,{ok:true,message:record({...rows[0],mine:true})});
  }
  return output(res,400,{error:'지원되지 않는 요청이야.'});
 }catch(e){console.error('DM send',e.name);return output(res,503,{error:'메시지 전송 오류'})}
}
