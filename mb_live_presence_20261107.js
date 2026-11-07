/* Anonymous, tab-local presence counter shared by Taste home and Backrooms. */
(()=>{
 'use strict';
 if(window.__mbLivePresence2026)return;
 window.__mbLivePresence2026=true;
 const KEY='mb_live_presence_id_v1';
 let id;
 try{id=sessionStorage.getItem(KEY)}catch{}
 if(!/^[A-Za-z0-9_-]{20,100}$/.test(id||'')){
  id=(window.crypto?.randomUUID?.()||Array.from(window.crypto.getRandomValues(new Uint8Array(24)),n=>n.toString(16).padStart(2,'0')).join(''));
  try{sessionStorage.setItem(KEY,id)}catch{}
 }
 const onlineLine=()=>{
  const footer=document.querySelector('#homeScreen .home-foot');
  if(!footer)return null;
  let span=document.getElementById('mb-live-online-count');
  if(!span){
   span=document.createElement('span');span.id='mb-live-online-count';
   span.textContent='현재 이용 중 확인 중…';
   footer.append(document.createTextNode(' · '),span);
  }
  return span;
 };
 function show(count){
  const span=onlineLine();
  if(span&&Number.isInteger(count)&&count>=0)span.textContent='현재 이용 중 '+count+'명';
 }
 async function ping(){
  if(document.hidden)return;
  try{
   const res=await fetch('/api/presence',{
    method:'POST',credentials:'same-origin',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({id}),cache:'no-store',keepalive:true
   });
   if(!res.ok)throw Error('presence unavailable');
   const body=await res.json();show(body.online);
  }catch{
   const span=onlineLine();
   if(span)span.textContent='현재 이용 중 확인 불가';
  }
 }
 function close(){
  try{fetch('/api/presence',{method:'DELETE',credentials:'same-origin',
    headers:{'Content-Type':'application/json'},body:JSON.stringify({id}),keepalive:true}).catch(()=>{})}catch{}
 }
 function start(){onlineLine();ping();setInterval(ping,20000);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)close();else ping()});
  window.addEventListener('pagehide',close);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
})();
