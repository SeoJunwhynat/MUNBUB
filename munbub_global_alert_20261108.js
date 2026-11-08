/* Universal, text-only top-of-screen announcements (including Backrooms). */
(()=>{
 'use strict';
 if(window.__mbGlobalAlert2026)return;
 window.__mbGlobalAlert2026=true;
 const frame=document.createElement('section');
 frame.id='mb-global-alerts';frame.setAttribute('role','status');frame.setAttribute('aria-live','polite');
 frame.setAttribute('aria-label','모두에게 온 메시지');
 const style=document.createElement('style');style.textContent="#mb-global-alerts{position:fixed!important;z-index:2147483640!important;left:50%!important;top:max(10px,env(safe-area-inset-top,0px))!important;transform:translateX(-50%)!important;width:min(700px,calc(100vw - 28px))!important;display:flex!important;flex-direction:column!important;gap:6px!important;align-items:stretch!important;pointer-events:none!important;box-sizing:border-box!important}\n#mb-global-alerts .mb-global-alert{box-sizing:border-box!important;background:linear-gradient(115deg,#37283aee,#52363df5)!important;border:2px solid #f2c18a!important;border-radius:13px!important;box-shadow:0 12px 32px #0009!important;color:#ffeed8!important;padding:11px 16px!important;font:700 clamp(12px,2.7vw,16px)/1.45 system-ui,'Malgun Gothic',sans-serif!important;overflow-wrap:anywhere!important;text-align:center!important;animation:mb-global-alert-entry .22s ease-out}\n#mb-global-alerts strong{color:#ffe6a1!important;margin-right:6px}\n@keyframes mb-global-alert-entry{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}\n@media(prefers-reduced-motion:reduce){#mb-global-alerts .mb-global-alert{animation:none}}";
 function anchor(){
  // A showModal dialog lives in the top layer, above normal fixed elements.
  const dialogs=[...document.querySelectorAll('dialog[open]')];
  const parent=dialogs.at(-1)||document.body;
  if(frame.parentElement!==parent)parent.append(frame);
 }
 style.textContent+='#mb-global-alerts .mb-private-alert{background:linear-gradient(115deg,#234355f5,#274d43f5)!important;border-color:#82d9c8!important;text-align:left!important;pointer-events:auto!important;cursor:pointer!important;max-height:130px;overflow-y:auto}#mb-global-alerts .mb-private-alert:focus-visible{outline:3px solid #fff1a8!important;outline-offset:3px}';
 document.head.append(style);
 const KEY='mb_global_announcement_cursor_20261108';
 const DM_KEY='mb_private_notification_cursor_v2';
 let privateUser='',privateCursor='0',privateBusy=false;
 try{
  const saved=JSON.parse(sessionStorage.getItem(DM_KEY)||'null');
  if(saved&&/^[a-f0-9-]{36}$/i.test(saved.me)&&/^[0-9]{1,18}$/.test(saved.cursor)){
   privateUser=saved.me;privateCursor=saved.cursor;
  }
 }catch{}
 let cursor='0',first=true,running=false;
 try{const stored=sessionStorage.getItem(KEY);if(/^[0-9]{1,18}$/.test(stored||'')){cursor=stored;first=false;}}catch{}
 function announce(msg){
  anchor();
  const card=document.createElement('div');card.className='mb-global-alert';
  const who=document.createElement('strong');who.textContent='📢 '+String(msg.name||'이용자')+':';
  const body=document.createElement('span');body.textContent=String(msg.text||'');
  card.append(who,body);frame.append(card);
  while(frame.childElementCount>3)frame.firstElementChild.remove();
  setTimeout(()=>card.remove(),7600);
 }

 function announcePrivate(msg){
  anchor();
  const card=document.createElement('div');
  card.className='mb-global-alert mb-private-alert';
  const who=document.createElement('strong');
  who.textContent='✉️ '+String(msg.name||'이용자')+':';
  const body=document.createElement('span');
  body.textContent=String(msg.text||'');
  card.append(who,body);
  if(/^[a-f0-9-]{36}$/i.test(String(msg.senderId||''))){
   card.tabIndex=0;
   card.setAttribute('role','button');
   card.setAttribute('aria-label','개인 채팅 열기');
   const open=()=>{
    if(!document.getElementById('mb-global-chat-toggle'))return;
    window.dispatchEvent(new CustomEvent('mb:open-private-chat',{
     detail:{id:String(msg.senderId),name:String(msg.name||'이용자')}
    }));
    card.remove();
   };
   card.addEventListener('click',open);
   card.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}
   });
  }
  frame.append(card);
  while(frame.childElementCount>3)frame.firstElementChild.remove();
  setTimeout(()=>card.remove(),9800);
 }
 async function pollPrivate(){
  if(privateBusy||document.hidden)return;
  privateBusy=true;
  try{
   const r=await fetch('/api/chat?mode=dm_notifications&since='+encodeURIComponent(privateCursor),{
    credentials:'same-origin',cache:'no-store'
   });
   if(r.status===401){
    privateCursor='0';privateUser='';
    try{sessionStorage.removeItem(DM_KEY)}catch{}
    return;
   }
   if(!r.ok)return;
   const data=await r.json();
   const me=String(data.me||'');
   if(!/^[a-f0-9-]{36}$/i.test(me))return;
   if(privateUser!==me){
    privateUser=me;privateCursor='0';
    try{sessionStorage.setItem(DM_KEY,JSON.stringify({me,cursor:'0'}))}catch{}
    return;
   }
   const fresh=privateCursor==='0',rows=Array.isArray(data.messages)?data.messages:[];
   for(const msg of rows){
    const id=String(msg.id||'');
    if(!/^[0-9]{1,18}$/.test(id)||BigInt(id)<=BigInt(privateCursor))continue;
    const at=Number(msg.at);
    if(!fresh||(at>Date.now()-60000&&at<Date.now()+60000))announcePrivate(msg);
    privateCursor=id;
   }
   try{sessionStorage.setItem(DM_KEY,JSON.stringify({me,cursor:privateCursor}))}catch{}
  }catch{}finally{privateBusy=false;}
 }
 async function poll(){
  if(running||document.hidden)return;
  running=true;
  try{
   const r=await fetch('/api/chat?mode=broadcast&since='+encodeURIComponent(cursor),{credentials:'same-origin',cache:'no-store'});
   if(!r.ok)throw Error('broadcast');
   const data=await r.json(),rows=Array.isArray(data.messages)?data.messages:[];
   for(const message of rows){
    if(!/^[0-9]{1,18}$/.test(String(message.id||'')))continue;
    if(!first||(Number(message.at)>Date.now()-9000&&Number(message.at)<Date.now()+1000))announce(message);
    if(BigInt(message.id)>BigInt(cursor))cursor=message.id;
   }
   first=false;
   try{sessionStorage.setItem(KEY,cursor)}catch{}
  }catch{}finally{running=false;}
 }
 function start(){
  anchor();poll();pollPrivate();setInterval(()=>{anchor();poll()},2700);
  setInterval(pollPrivate,2700);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){poll();pollPrivate();}});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
})();