/* Three-channel home chat: public thread, private messages, and global alerts. */
(()=>{
 'use strict';
 if(window.__mbGlobalHomeChat)return;
 window.__mbGlobalHomeChat=true;
 function mount(){
  const home=document.getElementById('homeScreen');
  if(!home||document.getElementById('mb-global-chat-toggle'))return;
  const css=document.createElement('link');css.rel='stylesheet';css.href='/munbub_global_chat_20261108.css';document.head.append(css);
  const toggle=document.createElement('button');
  toggle.id='mb-global-chat-toggle';toggle.type='button';toggle.textContent='💬 채팅';
  toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','mb-global-chat-panel');
  const panel=document.createElement('section');panel.id='mb-global-chat-panel';panel.hidden=true;
  panel.setAttribute('aria-label','맛춘범 채팅');
  const head=document.createElement('div');head.className='mbg-header';
  const heading=document.createElement('strong');heading.textContent='💬 맛춘범 채팅';
  const close=document.createElement('button');close.className='mbg-close';close.type='button';close.textContent='×';
  close.setAttribute('aria-label','채팅 닫기');head.append(heading,close);
  const tabs=document.createElement('nav');tabs.className='mbg-tabs';tabs.setAttribute('aria-label','채팅 종류');
  const modes=[['global','🌐 전체 채팅'],['dm','✉️ 개인 채팅'],['all','📢 모두에게']];
  const tabButtons={};
  for(const [value,label] of modes){
   const button=document.createElement('button');button.type='button';button.textContent=label;
   button.dataset.mode=value;button.setAttribute('aria-pressed',String(value==='global'));
   button.addEventListener('click',()=>chooseMode(value));tabs.append(button);tabButtons[value]=button;
  }
  const note=document.createElement('p');note.className='mbg-note';
  note.textContent='개인정보를 보내지 마세요. 차단과 신고를 이용할 수 있어요.';
  const people=document.createElement('div');people.className='mbg-people';people.hidden=true;
  const search=document.createElement('input');search.type='search';search.placeholder='이용한 적 있는 사용자 검색';
  search.setAttribute('aria-label','대화할 사용자 검색');search.autocomplete='off';
  const peopleList=document.createElement('div');peopleList.className='mbg-people-list';
  people.append(search,peopleList);
  const peerBar=document.createElement('div');peerBar.className='mbg-peer';peerBar.hidden=true;
  const back=document.createElement('button');back.type='button';back.textContent='← 목록';
  const peerName=document.createElement('strong');peerName.textContent='개인 채팅';
  const block=document.createElement('button');block.type='button';block.className='mbg-block';block.textContent='차단';
  peerBar.append(back,peerName,block);
  const messages=document.createElement('div');messages.className='mbg-messages';
  messages.setAttribute('role','log');messages.setAttribute('aria-live','polite');
  const status=document.createElement('p');status.className='mbg-status';status.textContent='연결 중…';
  const form=document.createElement('form');form.className='mbg-form';
  const input=document.createElement('input');input.type='text';input.maxLength=180;input.autocomplete='off';
  input.disabled=true;input.placeholder='로그인이 필요해';input.setAttribute('aria-label','채팅 메시지');
  const send=document.createElement('button');send.type='submit';send.disabled=true;send.textContent='전송';
  form.append(input,send);panel.append(head,tabs,note,people,peerBar,messages,status,form);
  // Fixed-position controls must not be clipped by the transformed/scaled Home.
  document.body.append(toggle,panel);
  function liftChat(){
   const dialogs=[...document.querySelectorAll('dialog[open]')];
   const host=dialogs.at(-1)||document.body;
   if(toggle.parentElement!==host)host.append(toggle);
   if(panel.parentElement!==host)host.append(panel);
  }
  liftChat();
  let visible=false,busy=false,posting=false,logged=false,mode='global',peer=null,lastLoginCheck=0;
  let previousIds='',users=[],threads=[],requestVersion=0,searchDelay=0;
  let adjustKeyboard=()=>{};
  const say=text=>{status.textContent=text};
  const authorize=ok=>{
   logged=ok;input.disabled=!ok||mode==='dm'&&!peer;send.disabled=input.disabled;
   input.placeholder=!ok?'맛춘범 계정 로그인 필요':mode==='dm'&&!peer?'대화할 이용자를 선택해 줘':mode==='all'?'모두에게 상단 알림 보내기 (25초 간격)':'메시지 입력 · 최대 180자';
  };
  async function fetchChat(options=null,query=''){
   const url='/api/chat'+(query?'?'+query:'');
   const r=await fetch(url,options?{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify(options),credentials:'same-origin',cache:'no-store'}:{credentials:'same-origin',cache:'no-store'});
   const out=await r.json().catch(()=>({}));
   if(!r.ok)throw Object.assign(Error(out.error||'채팅 서버 오류'),{status:r.status});
   return out;
  }
  function draw(rows){
   const key=mode+':'+(peer?.id||'')+':'+rows.map(x=>x.id).join(',');
   if(key===previousIds)return;
   previousIds=key;
   const stick=messages.scrollHeight-messages.scrollTop-messages.clientHeight<70;
   const fragment=document.createDocumentFragment();
   for(const msg of rows){
    const item=document.createElement('div');item.className='mbg-item'+(msg.mine?' mine':'');
    const caption=document.createElement('div');caption.className='mbg-item-head';
    const name=document.createElement('strong');name.textContent=String(msg.name||'이용자');
    const time=document.createElement('time'),at=Number(msg.at);
    time.textContent=Number.isFinite(at)&&at>0?new Date(at).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'}):'';
    caption.append(name,time);
    if(!msg.mine&&mode!=='all'){
     const report=document.createElement('button');report.type='button';report.className='mbg-report';report.textContent='신고';
     report.setAttribute('aria-label','메시지 신고');
     report.addEventListener('click',async()=>{
      if(!confirm('이 메시지를 신고할까?'))return;
      report.disabled=true;
      try{await fetchChat(mode==='dm'?{action:'report_dm',id:msg.id}:{action:'report',id:msg.id});say('신고를 접수했어.');}
      catch(e){say(e.message);report.disabled=false}
     });
     caption.append(report);
    }
    const text=document.createElement('div');text.className='mbg-body';
    text.textContent=String(msg.text||'');
    item.append(caption,text);fragment.append(item);
   }
   messages.replaceChildren(fragment);
   if(stick||messages.scrollTop===0)messages.scrollTop=messages.scrollHeight;
  }
  function displayUsers(){
   peopleList.replaceChildren();
   if(!users.length){const empty=document.createElement('p');empty.textContent='일치하는 이용자가 없어.';peopleList.append(empty);return}
   for(const u of users){
    const row=document.createElement('button');row.type='button';row.className='mbg-user';
    const label=document.createElement('span');label.textContent=(u.online?'🟢 ':'⚪ ')+u.name;
    const hint=document.createElement('small');hint.textContent=(u.online?'접속 중':'이용 기록')+(u.blocked?' · 차단됨':'')+
      (threads.some(t=>t.peer===u.id)?' · 대화 기록 있음':'');
    row.append(label,hint);row.addEventListener('click',()=>choosePeer(u));
    peopleList.append(row);
   }
  }
  async function loadUsers(){
   if(!logged)return;
   try{
    const [result,inbox]=await Promise.all([
      fetchChat(null,'mode=users&q='+encodeURIComponent(search.value.trim())),
      fetchChat(null,'mode=inbox')
    ]);
    users=Array.isArray(result.users)?result.users:[];
    threads=Array.isArray(inbox.threads)?inbox.threads:[];
    displayUsers();
    say('🟢 현재 접속 · ⚪ 이전 이용자 · 닉네임으로 선택');
   }catch(e){say(e.message)}
  }
  function updateView(){
   for(const [key,button] of Object.entries(tabButtons))button.setAttribute('aria-pressed',String(mode===key));
   people.hidden=mode!=='dm'||!!peer;peerBar.hidden=mode!=='dm'||!peer;
   form.hidden=mode==='dm'&&!peer;
   messages.hidden=mode==='dm'&&!peer;
   note.textContent=mode==='all'?'📢 보낸 메시지는 접속 중인 모든 사람의 화면 상단에 표시돼요.':
      mode==='dm'?'✉️ 특정 사용자와의 대화는 본인과 상대만 볼 수 있어요.':'🌐 전체 채팅 · 메시지는 모두에게 공개돼요.';
   peerName.textContent=peer?.name||'개인 채팅';
   block.textContent=peer?.blocked?'차단 해제':'차단';
   authorize(logged);
  }
  function chooseMode(value){
   if(!['global','dm','all'].includes(value))return;
   mode=value;peer=null;previousIds='';messages.replaceChildren();search.value='';
   updateView();refresh();if(value==='dm')loadUsers();
  }
  function choosePeer(user){
   peer=user;previousIds='';messages.replaceChildren();updateView();refresh();
  }
  back.addEventListener('click',()=>{peer=null;previousIds='';messages.replaceChildren();updateView();loadUsers()});
  block.addEventListener('click',async()=>{
   if(!peer)return;
   if(!confirm(peer.blocked?'이 이용자의 차단을 해제할까?':'이 이용자의 개인 메시지를 차단할까?'))return;
   try{
    const res=await fetchChat({action:peer.blocked?'unblock':'block',peer:peer.id});
    peer.blocked=!!res.blocked;updateView();say(peer.blocked?'차단 완료':'차단 해제');
   }catch(e){say(e.message)}
  });
  search.addEventListener('input',()=>{clearTimeout(searchDelay);searchDelay=setTimeout(loadUsers,270)});
  async function refresh(){
   if(!visible||busy||document.hidden)return;
   busy=true;const req=++requestVersion,which=mode,who=peer?.id;
   try{
    const path=which==='dm'?(who?'mode=dm&peer='+encodeURIComponent(who):null):
      which==='all'?'mode=broadcast':'';
    if(path===null){
     await fetchChat(null,'mode=inbox');
     authorize(true);
     if(!users.length)loadUsers();
     return;
    }
    const payload=await fetchChat(null,path);
    if(req!==requestVersion||mode!==which||peer?.id!==who)return;
    if(which==='all'){
     // Anyone can read announcements, but sending still requires login.
     if(Date.now()-lastLoginCheck>12000){
      const account=await fetch('/api/account',{credentials:'same-origin',cache:'no-store'}).then(r=>r.json()).catch(()=>({}));
      logged=!!account.loggedIn;lastLoginCheck=Date.now();
     }
     authorize(logged);
    }else authorize(true);
    say(which==='global'?'최근 7일 · 최신 60개 메시지':which==='all'?'최근 모두에게 보낸 알림':'개인 대화 · 로그인 계정만 볼 수 있어');
    draw(Array.isArray(payload.messages)?payload.messages:[]);
   }catch(e){
    if(e.status===401){authorize(false);messages.replaceChildren();previousIds='';say('홈의 로그인 버튼으로 로그인해 줘.');}
    else say(e.message);
   }finally{busy=false}
  }
  function ensureMobileChatEntry(){
   // The floating desktop chat button must never cover the mobile bottom bar.
   // Mobile opens chat only from the existing additional-modes drawer.
   const drawer=document.getElementById('mobileDrawer')||document.querySelector('.mobile-drawer');
   if(!drawer)return;
   let entry=drawer.querySelector('#mb-mobile-chat-entry');
   if(entry)return;
   entry=document.createElement('button');
   entry.id='mb-mobile-chat-entry';
   entry.className='mb-mobile-chat-entry';
   entry.type='button';
   entry.setAttribute('aria-label','채팅 열기');
   const symbol=document.createElement('span');
   symbol.className='mb-mobile-chat-symbol';
   symbol.setAttribute('aria-hidden','true');
   symbol.textContent='💬';
   const caption=document.createElement('span');
   caption.textContent='채팅 열기';
   entry.append(symbol,caption);
   entry.addEventListener('click',()=>{
    drawer.hidden=true;
    display(true);
   });
   drawer.append(entry);
  }
  ensureMobileChatEntry();
  function display(state){
   visible=state;panel.hidden=!state;toggle.setAttribute('aria-expanded',String(state));
   liftChat();
   document.documentElement.classList.toggle('mb-chat-open',state&&window.innerWidth<=700);
   if(state){updateView();refresh();}else input.blur();
   requestAnimationFrame(adjustKeyboard);
  }
  toggle.addEventListener('click',()=>display(!visible));
  close.addEventListener('click',()=>display(false));
  window.addEventListener('mb:open-private-chat',e=>{
   const detail=e.detail||{};
   if(!/^[a-f0-9-]{36}$/i.test(String(detail.id||'')))return;
   display(true);chooseMode('dm');
   choosePeer({id:String(detail.id),name:String(detail.name||'이용자'),blocked:false});
  });
  form.addEventListener('submit',async e=>{
   e.preventDefault();
   const text=input.value.trim();
   if(!logged||posting||!text||mode==='dm'&&!peer)return;
   posting=true;send.disabled=true;
   const payload=mode==='dm'?{action:'send_dm',peer:peer.id,text}:mode==='all'?
    {action:'send_broadcast',text}:{action:'send',text};
   try{
    await fetchChat(payload);input.value='';previousIds='';await refresh();
    if(mode==='all')say('📢 모두에게 전송했어. 접속 화면 상단에 표시돼.');
   }catch(err){say(err.message)}
   finally{posting=false;send.disabled=!logged||mode==='dm'&&!peer;}
  });
  document.addEventListener('keydown',e=>{if(visible&&e.key==='Escape')display(false)});
  setInterval(()=>{if(visible&&!document.hidden)refresh()},2600);
  setInterval(()=>{liftChat();ensureMobileChatEntry()},1800);
  window.addEventListener('resize',()=>document.documentElement.classList.toggle('mb-chat-open',visible&&window.innerWidth<=700));
  document.addEventListener('visibilitychange',()=>{if(visible&&!document.hidden)refresh()});
  window.addEventListener('pageshow',()=>{if(visible)refresh()});
  // Avoid the virtual keyboard covering the compose row on Android/iOS.
  const vv=window.visualViewport;
  if(vv){
   const reposition=()=>{
    // The visual viewport excludes the mobile keyboard. Keep the form inside it.
    const keyboard=Math.max(0,window.innerHeight-vv.height-vv.offsetTop);
    if(visible&&window.innerWidth<=700&&keyboard>80){
     panel.style.setProperty('top',Math.round(vv.offsetTop)+'px','important');
     panel.style.setProperty('bottom','auto','important');
     panel.style.setProperty('height',Math.max(170,Math.round(vv.height))+'px','important');
    }else{
     panel.style.removeProperty('top');
     panel.style.removeProperty('bottom');
     panel.style.removeProperty('height');
    }
   };
   adjustKeyboard=reposition;
   vv.addEventListener('resize',reposition);vv.addEventListener('scroll',reposition);
   input.addEventListener('focus',()=>requestAnimationFrame(reposition));
   input.addEventListener('blur',()=>requestAnimationFrame(reposition));
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
 else mount();
})();