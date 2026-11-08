/**
 * Server-wide, login-only home chat on Render/Neon.
 * Persistent history; posted identities are ALWAYS read from signed sessions.
 */
import {configured,session,sameOrigin,noCache} from '../lib/mb-server.js';
import {chatQuery} from '../lib/mb-storage.js';
import handleChatModes from './chat-modes.js';

const MAX_CHARS=180;
// No fixed gap between ordinary messages. Database-enforced sliding-window caps prevent flooding.
const respond=(res,code,body)=>res.status(code).json(body);
const publicMessage=row=>({
 id:String(row.id),name:String(row.name||''),text:String(row.text||''),
 at:Number(row.at||0),mine:!!row.mine
});
export default async function handler(req,res){
 noCache(res);
 const user=session(req);
 if(req.method==='GET'&&req.query?.mode==='broadcast')return handleChatModes(req,res,user);
 if(!user)return respond(res,401,{error:'전체 채팅은 맛춘범 로그인이 필요해.'});
 if(!configured())return respond(res,503,{error:'채팅 저장소에 연결하지 못했어.'});
 if((req.method==='GET'&&['users','dm','inbox','dm_notifications'].includes(req.query?.mode))||(req.method==='POST'&&['send_dm','send_broadcast','block','unblock','report_dm'].includes(req.body?.action)))return handleChatModes(req,res,user);
 if(req.method==='GET'){
  try{
   const rows=await chatQuery([
    'SELECT m.id::text AS id,m.display_name AS name,m.body AS text,',
    '(EXTRACT(EPOCH FROM m.created_at)*1000)::bigint AS at,',
    '(m.user_id=$1) AS mine',
    'FROM mb_global_chat m',
    "WHERE m.created_at>NOW()-INTERVAL '7 days'",
    'AND (SELECT COUNT(*) FROM mb_global_chat_reports r WHERE r.message_id=m.id)<3',
    'ORDER BY m.id DESC LIMIT 60'
   ].join(' '),[user.id]);
   return respond(res,200,{ok:true,me:user.name,messages:rows.reverse().map(publicMessage)});
  }catch(e){
   console.error('Global chat list error',e?.name||'DatabaseError');
   return respond(res,503,{error:'전체 채팅을 불러오지 못했어.'});
  }
 }
 if(req.method!=='POST')return respond(res,405,{error:'허용되지 않은 요청이야.'});
 if(!sameOrigin(req))return respond(res,403,{error:'잘못된 요청 출처야.'});
 const body=req.body;
 if(!body||typeof body!=='object'||Array.isArray(body))
  return respond(res,400,{error:'요청 형식이 올바르지 않아.'});
 if(body.action==='report'){
  const id=String(body.id||'');
  if(!/^[1-9]\d{0,18}$/.test(id))return respond(res,400,{error:'신고 대상이 올바르지 않아.'});
  try{
   const rows=await chatQuery([
    'INSERT INTO mb_global_chat_reports(message_id,reporter_id)',
    'SELECT m.id,$2 FROM mb_global_chat m',
    'WHERE m.id=$1::bigint AND m.user_id<>$2',
    'ON CONFLICT DO NOTHING RETURNING message_id'
   ].join(' '),[id,user.id]);
   return respond(res,200,{ok:true,reported:rows.length>0});
  }catch(e){
   console.error('Global chat report error',e?.name||'DatabaseError');
   return respond(res,503,{error:'신고를 처리하지 못했어.'});
  }
 }
 if(body.action!=='send'||typeof body.text!=='string')
  return respond(res,400,{error:'메시지를 입력해 줘.'});
 const message=body.text.normalize('NFC').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim();
 if([...message].length<1||[...message].length>MAX_CHARS||Buffer.byteLength(message,'utf8')>900)
  return respond(res,400,{error:'메시지는 1~180자로 작성해 줘.'});
 try{
  const rows=await chatQuery([
   'INSERT INTO mb_global_chat(user_id,display_name,body)',
   'SELECT $1,$2,$3',
   'WHERE (SELECT COUNT(*) FROM mb_global_chat WHERE user_id=$1',
   "AND created_at>NOW()-INTERVAL '10 seconds')<8",
   'AND (SELECT COUNT(*) FROM mb_global_chat WHERE user_id=$1',
   "AND created_at>NOW()-INTERVAL '60 seconds')<30",
   'RETURNING id::text AS id,display_name AS name,body AS text,',
   '(EXTRACT(EPOCH FROM created_at)*1000)::bigint AS at'
  ].join(' '),[user.id,user.name,message]);
  if(!rows.length)return respond(res,429,{error:'메시지를 빠르게 많이 보냈어. 잠깐 쉬었다가 다시 보내 줘.'});
  if(Math.random()<.05)chatQuery("DELETE FROM mb_global_chat WHERE created_at<NOW()-INTERVAL '7 days'").catch(()=>{});
  return respond(res,201,{ok:true,message:publicMessage({...rows[0],mine:true})});
 }catch(e){
  console.error('Global chat send error',e?.name||'DatabaseError');
  return respond(res,503,{error:'채팅 전송 중 오류가 발생했어.'});
 }
}
