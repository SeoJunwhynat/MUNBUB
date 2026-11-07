/* Global room for everyone signed in on the Render site; mounts on home only. */
(()=>{
 'use strict';
 if(window.__mbGlobalHomeChat)return;
 window.__mbGlobalHomeChat=true;
 function mount(){
  const home=document.getElementById('homeScreen');
  if(!home||document.getElementById('mb-global-chat-toggle'))return;
  const css=document.createElement('link');css.rel='stylesheet';css.href='/munbub_global_chat_20261108.css';document.head.append(css);
  const toggle=document.createElement('button');
  toggle.id='mb-global-chat-toggle';toggle.type='button';toggle.textContent='🌐 전체 채팅';
  toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','mb-global-chat-panel');
  const panel=document.createElement('section');panel.id='mb-global-chat-panel';panel.hidden=true;
  panel.setAttribute('aria-label','맛춘범 서버 전체 채팅');
  const head=document.createElement('div');head.className='mbg-header';
  const label=document.createElement('strong');label.textContent='🌐 서버 전체 채팅';
  const close=document.createElement('button');close.className='mbg-close';close.type='button';
  close.textContent='×';close.setAttribute('aria-label','전체 채팅 닫기');head.append(label,close);
  const note=document.createElement('p');note.className='mbg-note';
  note.textContent='모든 로그인 사용자에게 공개돼요. 개인정보 공유는 피해주세요.';
  const messages=document.createElement('div');messages.className='mbg-messages';
  messages.setAttribute('role','log');messages.setAttribute('aria-live','polite');
  const status=document.createElement('p');status.className='mbg-status';status.textContent='연결 중…';
  const form=document.createElement('form');form.className='mbg-form';
  const input=document.createElement('input');input.type='text';input.maxLength=180;input.autocomplete='off';
  input.disabled=true;input.placeholder='로그인하면 메시지를 쓸 수 있어';input.setAttribute('aria-label','전체 채팅 메시지');
  const send=document.createElement('button');send.type='submit';send.disabled=true;send.textContent='전송';
  form.append(input,send);panel.append(head,note,messages,status,form);home.append(toggle,panel);
  let visible=false,busy=false,posting=false,logged=false,previousIds='';
  const say=(text)=>{status.textContent=text;};
  const authorize=ok=>{logged=ok;input.disabled=!ok;send.disabled=!ok;
   input.placeholder=ok?'메시지 입력 · 최대 180자':'로그인 후 채팅할 수 있어';};
  async function fetchChat(options=null){
   const res=await fetch('/api/chat',options?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(options),credentials:'same-origin',cache:'no-store'}:{credentials:'same-origin',cache:'no-store'});
   let body={};try{body=await res.json()}catch{}
   if(!res.ok)throw Object.assign(Error(body.error||'채팅 서버 연결 실패'),{status:res.status});
   return body;
  }
  function draw(rows){
   const key=rows.map(x=>x.id).join(',');
   if(key===previousIds)return;
   previousIds=key;
   const stick=messages.scrollHeight-messages.scrollTop-messages.clientHeight<70;
   const fragment=document.createDocumentFragment();
   for(const msg of rows){
    const item=document.createElement('div');item.className='mbg-item'+(msg.mine?' mine':'');
    const caption=document.createElement('div');caption.className='mbg-item-head';
    const name=document.createElement('strong');name.textContent=String(msg.name||'이용자');
    const time=document.createElement('time');const at=Number(msg.at);
    time.textContent=Number.isFinite(at)&&at>0?new Date(at).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'}):'';
    caption.append(name,time);
    if(!msg.mine){
     const report=document.createElement('button');report.type='button';report.className='mbg-report';
     report.textContent='신고';report.setAttribute('aria-label','메시지 신고');
     report.addEventListener('click',async()=>{
      if(!confirm('이 메시지를 신고할까?'))return;
      report.disabled=true;
      try{await fetchChat({action:'report',id:msg.id});say('신고가 접수됐어.');}
      catch(e){say(e.message);report.disabled=false;}
     });
     caption.append(report);
    }
    const text=document.createElement('div');text.className='mbg-body';
    // Absolutely never interpret user-posted text as HTML.
    text.textContent=String(msg.text||'');
    item.append(caption,text);fragment.append(item);
   }
   messages.replaceChildren(fragment);
   if(stick||messages.scrollTop===0)messages.scrollTop=messages.scrollHeight;
  }
  async function refresh(){
   if(!visible||busy||document.hidden)return;
   busy=true;
   try{
    const data=await fetchChat();
    authorize(true);say('최근 7일 · 최신 60개 메시지');
    draw(Array.isArray(data.messages)?data.messages:[]);
   }catch(e){
    if(e.status===401){
     authorize(false);messages.replaceChildren();previousIds='';
     say('맛춘범 계정 로그인이 필요해. 홈의 로그인 버튼을 눌러줘.');
    }else say(e.message);
   }finally{busy=false;}
  }
  function display(open){
   visible=open;panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));
   if(open)refresh();else input.blur();
  }
  toggle.addEventListener('click',()=>display(!visible));
  close.addEventListener('click',()=>display(false));
  form.addEventListener('submit',async e=>{
   e.preventDefault();
   const content=input.value.trim();
   if(!logged||posting||!content)return;
   posting=true;send.disabled=true;
   try{await fetchChat({action:'send',text:content});input.value='';previousIds='';await refresh();}
   catch(error){say(error.message)}
   finally{posting=false;send.disabled=!logged;}
  });
  document.addEventListener('keydown',e=>{if(visible&&e.key==='Escape')display(false)});
  setInterval(()=>{if(visible&&!document.hidden)refresh()},3200);
  document.addEventListener('visibilitychange',()=>{if(visible&&!document.hidden)refresh()});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
 else mount();
})();
