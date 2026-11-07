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
 document.head.append(style);
 const KEY='mb_global_announcement_cursor_20261108';
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
  anchor();poll();setInterval(()=>{anchor();poll()},2700);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)poll()});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
})();