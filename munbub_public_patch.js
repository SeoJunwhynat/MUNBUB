/* Live public-room browser adapted from the supplied offline UI pack. */
(()=>{
'use strict';if(window.__mbPublicRoomsV1)return;window.__mbPublicRoomsV1=true;
// Dialog controls must be looked up in their owning dialog, even if a
// home-screen extension temporarily reparents overlay nodes.
const $=id=>roomsDialog.querySelector('#'+String(id).replace(/^#/,''))||document.getElementById(String(id).replace(/^#/,''));
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const roomsDialog=document.createElement('dialog');roomsDialog.id='mb-public-dialog';roomsDialog.setAttribute('aria-label','실시간 공개방');
document.body.append(roomsDialog);
const css=document.createElement('style');css.id='mb-public-css';css.textContent=`
#mb-public-dialog{box-sizing:border-box;width:min(97vw,1300px);max-width:1300px;max-height:95dvh;overflow:auto;margin:auto;padding:clamp(14px,2vw,28px);background:linear-gradient(135deg,#51332fed,#2a1a1be9),url('/ui-assets/scene_spelling.webp') center/cover;color:#ffe4c2;border:5px double #d7ab80;border-radius:17px;box-shadow:0 20px 70px #100509cc;font-family:'Malgun Gothic',sans-serif}
#mb-public-dialog::backdrop{background:#120909db}
#mb-public-dialog *{box-sizing:border-box}
#mb-public-dialog .mb-pub-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:15px}
#mb-public-dialog h2{margin:0;font-size:clamp(22px,3vw,32px);color:#ffdfb1}
#mb-public-dialog .mb-pub-note{color:#e8c6aa;font-size:13px;line-height:1.6;margin:8px 0 17px}
#mb-public-dialog button{font:inherit;cursor:pointer;touch-action:manipulation}
#mb-public-dialog .mb-pub-btn{border:3px double #e9c99d;border-radius:7px;background:linear-gradient(#855445,#56342f);color:#fff0d7;font-weight:900;padding:10px 14px;min-height:40px;box-shadow:0 4px 0 #1b1010}
#mb-public-dialog .mb-pub-btn.primary{background:linear-gradient(#be7360,#873d3e)}
#mb-public-dialog .mb-pub-btn.pale{background:#f3d4ac;color:#3a2523}
#mb-public-dialog .mb-pub-btn:disabled{opacity:.45;cursor:default}
#mb-public-dialog .mb-pub-btn:hover:not(:disabled){filter:brightness(1.13)}
#mb-public-dialog .mb-pub-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
#mb-public-dialog .mb-pub-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(215px,280px);gap:15px}
#mb-public-dialog .mb-pub-panel{border:4px double #d4a678;background:#302122e6;padding:clamp(13px,1.4vw,20px);border-radius:12px;box-shadow:inset 0 0 0 3px #54372d}
#mb-public-dialog .mb-pub-searchline{display:flex;gap:8px;flex-wrap:wrap}
#mb-public-dialog input,#mb-public-dialog select{box-sizing:border-box;min-width:0;min-height:40px;padding:10px 12px;border:2px solid #a87956;background:#fff1d6;color:#35211c;border-radius:6px;font:inherit}
#mb-public-dialog input[type=checkbox]{min-height:0;width:18px;height:18px;accent-color:#91594b}
#mb-public-dialog #mb-pub-search{flex:1 1 180px}
#mb-public-dialog .mb-pub-filters{display:flex;gap:6px;flex-wrap:wrap;margin:12px 0}
#mb-public-dialog .mb-pub-filter{font-size:12px;padding:7px 11px;color:#f0d1ae;background:#422b26;border:2px solid #926d58;border-radius:5px;font-weight:800}
#mb-public-dialog .mb-pub-filter.active{background:#f4d3a6;color:#3d2725}
#mb-public-dialog #mb-pub-list{display:grid;gap:9px;max-height:min(55dvh,520px);min-height:100px;overflow-y:auto;padding:3px}
#mb-public-dialog .mb-pub-room{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:12px;align-items:center;background:#503630e0;border:2px solid #946e54;border-radius:6px;padding:12px}
#mb-public-dialog .mb-pub-room strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:15px;color:#ffead0}
#mb-public-dialog .mb-pub-room small{color:#e6bfa0;font-size:12px;line-height:1.6}
#mb-public-dialog .mb-pub-room .mb-pub-people{font-weight:900;font-size:15px}
#mb-public-dialog .mb-pub-stats{margin-top:13px;font-size:13px;color:#f5d3ac}
#mb-public-dialog .mb-pub-side h3{margin:0 0 9px;font-size:18px}
#mb-public-dialog .mb-pub-side p{font-size:13px;line-height:1.8}
#mb-public-dialog .mb-pub-form{display:grid;gap:12px;max-width:650px;margin:auto}
#mb-public-dialog .mb-pub-field{display:grid;grid-template-columns:minmax(90px,125px) minmax(0,1fr);align-items:center;gap:9px}
#mb-public-dialog .mb-pub-field label{font-size:14px;font-weight:900}
#mb-public-dialog .mb-pub-field input,#mb-public-dialog .mb-pub-field select{width:100%}
#mb-public-dialog .mb-pub-backrow{margin-bottom:13px}
#mb-public-dialog .mb-pub-message{margin-top:12px;min-height:1.5em;color:#ffd18b;line-height:1.5;font-size:13px}
#homeScreen .mb-online-actions #mb-public-open{min-height:52px!important;display:grid;place-items:center;font-size:clamp(13px,1.15vw,17px)!important;background:linear-gradient(#fae9cc,#cba27a)!important;color:#422b29!important;border:4px double #96674c!important;border-radius:13px!important}
.sidebar-nav .mb-public-nav,.mobile-drawer .mb-public-nav{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;min-height:65px;padding:9px 4px;background:linear-gradient(#ffe8be,#d4a57c);border:3px double #91644c;border-radius:11px;color:#482e28;font-weight:950;font-size:17px}
@media(max-width:730px){#mb-public-dialog{width:100vw;max-height:100dvh;height:100dvh;padding:12px;border-radius:0}#mb-public-dialog .mb-pub-layout{grid-template-columns:1fr}#mb-public-dialog .mb-pub-side{display:none}#mb-public-dialog .mb-pub-actions{justify-content:flex-start}#mb-public-dialog .mb-pub-room{grid-template-columns:minmax(0,1fr) auto;gap:7px}#mb-public-dialog .mb-pub-people{display:none}#mb-public-dialog .mb-pub-field{grid-template-columns:1fr;gap:4px}#mb-public-dialog #mb-pub-list{max-height:52dvh}}
`;document.head.append(css);
let rooms=[],filter='all',query='',screen='list',busy=false,refreshing=false,lastCheck=0,pendingAccount=false;
const typeNames={mixed:'혼합',spelling:'맞춤법',idiom:'사자성어'};
function button(text,id,kind=''){return '<button type="button" class="mb-pub-btn '+kind+'" id="'+id+'">'+text+'</button>'}
function shell(body){if(!roomsDialog.isConnected)document.body.append(roomsDialog);roomsDialog.innerHTML='<div class="mb-pub-top"><h2>🏮 맛춘범 공개방</h2>'+button('✕ 닫기','mb-pub-close')+'</div>'+body+'<p id="mb-pub-message" class="mb-pub-message" role="status"></p>';roomsDialog.querySelector('#mb-pub-close')?.addEventListener('click',()=>roomsDialog.close())}
function message(s){const p=$('mb-pub-message');if(p)p.textContent=s}
function matchingRooms(){return rooms.filter(r=>(filter==='all'||(filter==='waiting'?r.status==='waiting':r.type===filter))&&
 (!query||(r.name+' '+r.host).toLowerCase().includes(query.toLowerCase())))}
function drawRooms(){
 const list=$('mb-pub-list');if(!list)return;
 const shown=matchingRooms();
 list.innerHTML=shown.length?shown.map(r=>'<article class="mb-pub-room"><div><strong>📜 '+esc(r.name)+'</strong><small>방장 '+esc(r.host)+' · '+esc(typeNames[r.type]||'혼합')+' · '+r.count+'문제 · '+r.seconds+'초</small></div><span class="mb-pub-people">'+r.players+'/2</span><button type="button" class="mb-pub-btn '+(r.status==='waiting'?'primary':'')+'" data-mb-pub-join="'+esc(r.code)+'" '+(r.status!=='waiting'||r.players>=2?'disabled':'')+'>'+(r.status==='waiting'?'입장':r.status==='full'?'인원 가득':'게임 중')+'</button></article>').join(''):'<div style="padding:38px;text-align:center;color:#e6c9a7">조건에 맞는 공개방이 없어. 새 방을 만들어 봐!</div>';
 const count=$('mb-pub-count');if(count)count.textContent='공개방 '+rooms.length+'개 · 입장 가능 '+rooms.filter(r=>r.status==='waiting'&&r.players<2).length+'개';
}
function listView(){
 screen='list';
 shell('<div class="mb-pub-actions">'+button('⟳ 새로고침','mb-pub-refresh')+button('🗝 코드 입장','mb-pub-code')+button('＋ 방 만들기','mb-pub-create','primary')+'</div>'+
  '<p class="mb-pub-note">실제 접속 중인 플레이어의 방만 보여 줘. 초대 코드로 비공개 1대1 대전에도 참가할 수 있어.</p>'+
  '<div class="mb-pub-layout"><section class="mb-pub-panel"><div class="mb-pub-searchline"><input id="mb-pub-search" placeholder="방 제목·방장 검색" autocomplete="off" value="'+esc(query)+'">'+button('⚡ 빠른 입장','mb-pub-quick','pale')+'</div>'+
  '<div class="mb-pub-filters"><button class="mb-pub-filter active" data-mb-pub-filter="all">전체</button><button class="mb-pub-filter" data-mb-pub-filter="waiting">대기 중</button><button class="mb-pub-filter" data-mb-pub-filter="spelling">맞춤법</button><button class="mb-pub-filter" data-mb-pub-filter="idiom">사자성어</button><button class="mb-pub-filter" data-mb-pub-filter="mixed">혼합</button></div><div id="mb-pub-list"></div><p class="mb-pub-stats" id="mb-pub-count"></p></section>'+
  '<aside class="mb-pub-panel mb-pub-side"><h3>📖 공개방 이용 안내</h3><p>새 방을 생성하면 모든 이용자가 목록에서 확인할 수 있어.<br>실제 채팅과 준비 기능은 대기실에서 작동해.<br>한 방에서 최대 2명까지 서버 채점 대결이 가능해.</p><p>4인 대전은 별도 동기화 기능이 필요하므로 현재 지원하지 않아.</p></aside></div>');
 $('#mb-pub-search').oninput=e=>{query=e.target.value;drawRooms()};
 $('#mb-pub-refresh').onclick=()=>refresh();
 $('#mb-pub-quick').onclick=()=>{const r=matchingRooms().find(x=>x.status==='waiting'&&x.players<2);r?join(r.code):message('선택한 조건에 맞는 입장 가능한 방이 없어.')};
 $('#mb-pub-code').onclick=codeView;$('#mb-pub-create').onclick=createView;
 roomsDialog.querySelectorAll('[data-mb-pub-filter]').forEach(b=>b.onclick=()=>{
  filter=b.dataset.mbPubFilter;roomsDialog.querySelectorAll('[data-mb-pub-filter]').forEach(x=>x.classList.toggle('active',x===b));drawRooms();
 });
 roomsDialog.querySelector('#mb-pub-list').addEventListener('click',e=>{
  const b=e.target.closest('[data-mb-pub-join]');if(b)join(b.dataset.mbPubJoin);
 });
 drawRooms();roomsDialog.querySelector('[data-mb-pub-filter="'+filter+'"]')?.click();
}
function createView(){
 screen='create';shell('<div class="mb-pub-backrow">'+button('← 방 목록','mb-pub-back')+'</div>'+
  '<section class="mb-pub-panel"><h3>🏮 새 공개방 만들기</h3><form id="mb-pub-createform" class="mb-pub-form">'+
  '<div class="mb-pub-field"><label for="mb-pub-name">방 제목</label><input id="mb-pub-name" maxlength="36" value="함께 국어 대결해요!" required></div>'+
  '<div class="mb-pub-field"><label for="mb-pub-type">문제 유형</label><select id="mb-pub-type"><option value="mixed">맞춤법 + 사자성어</option><option value="spelling">맞춤법만</option><option value="idiom">사자성어만</option></select></div>'+
  '<div class="mb-pub-field"><label for="mb-pub-form">문제 형식</label><select id="mb-pub-form"><option value="auto">문제별 자동</option><option value="two">2지선다</option><option value="four">4지선다</option><option value="text">서술형</option></select></div>'+
  '<div class="mb-pub-field"><label for="mb-pub-amount">문제 수</label><select id="mb-pub-amount"><option>5</option><option selected>10</option><option>15</option><option>20</option><option>30</option></select></div>'+
  '<div class="mb-pub-field"><label for="mb-pub-seconds">제한 시간</label><select id="mb-pub-seconds"><option>10</option><option>15</option><option selected>25</option><option>30</option><option>40</option><option>60</option></select></div>'+
  '<div class="mb-pub-field"><label>최대 인원</label><span>2명 (1대1)　<small style="opacity:.65">4명: 준비 중</small></span></div>'+
  '<label style="display:flex;gap:7px;align-items:center"><input type="checkbox" id="mb-pub-private"> 비공개방 (목록에 표시하지 않고 코드로만 입장)</label>'+
  '<div class="mb-pub-actions"><button type="submit" class="mb-pub-btn primary">✓ 방 생성</button></div></form></section>');
 $('#mb-pub-back').onclick=listView;$('#mb-pub-createform').onsubmit=async e=>{
  e.preventDefault();if(busy)return;busy=true;message('방을 만들고 있어...');
  const settings={type:$('#mb-pub-type').value,form:$('#mb-pub-form').value,count:Number($('#mb-pub-amount').value),seconds:Number($('#mb-pub-seconds').value)};
  const body={action:'create',settings,publicRoom:!$('#mb-pub-private').checked,lobbyRoom:true,roomName:$('#mb-pub-name').value.trim(),title:window.mbGetEquippedTitle?.()||'국어 새내기'};
  try{const out=await request('/api/duel',body);message('방 생성 완료! 대기실로 이동 중...');await enterDuel(out.code)}
  catch(error){message(error.message)}finally{busy=false}
 };
}
function codeView(){
 screen='code';shell('<div class="mb-pub-backrow">'+button('← 방 목록','mb-pub-back')+'</div><section class="mb-pub-panel"><h3>🗝 코드로 입장</h3><p class="mb-pub-note">8자리 대결 코드를 입력해 줘. 친구가 만든 비공개방에도 참가할 수 있어.</p>'+
 '<form id="mb-pub-codeform" class="mb-pub-form"><input id="mb-pub-codeinput" maxlength="8" autocomplete="off" placeholder="ABCD2345" required style="text-transform:uppercase;max-width:300px;letter-spacing:2px"><button class="mb-pub-btn primary" type="submit">입장</button></form></section>');
 $('#mb-pub-back').onclick=listView;$('#mb-pub-codeform').onsubmit=e=>{e.preventDefault();join($('#mb-pub-codeinput').value)};
}
async function request(url,body){
 const res=await fetch(url,{method:body?'POST':'GET',credentials:'same-origin',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
 const data=await res.json().catch(()=>({}));
 if(!res.ok){
  const why=res.status===404?'공개방 API가 배포되지 않았어. 프로젝트 루트에 api 폴더가 있는지 확인해 줘.':
   res.status===503?'온라인 저장소 연결 오류야. Vercel Blob 설정을 확인해 줘.':
   res.status===401?'온라인 계정 로그인이 필요해.':'서버와 통신할 수 없어 ('+res.status+').';
  throw Error(data.error||why);
 }
 return data;
}
async function refresh(){
 if(!roomsDialog.open||screen!=='list'||refreshing)return;
 refreshing=true;
 try{const data=await request('/api/public-rooms');rooms=Array.isArray(data.rooms)?data.rooms:[];lastCheck=Date.now();if(roomsDialog.open&&screen==='list'){drawRooms();message('실시간 공개방 목록이 갱신됐어.')}}
 catch(e){message(e.message)}
 finally{refreshing=false}
}
async function enterDuel(code){
 if(typeof window.mbDuelEnterRoom!=='function')throw Error('1대1 대전 모듈을 불러오지 못했어. 새로고침해 줘.');
 // Never stack two modal dialogs: close the public-room browser FIRST.
 // The originating route is passed to duel so Settings / Exit returns here.
 const wasOpen=roomsDialog.open;
 if(wasOpen)roomsDialog.close();
 try{await window.mbDuelEnterRoom(code,{origin:'public'})}
 catch(error){
  if(wasOpen&&!roomsDialog.open)roomsDialog.showModal();
  throw error;
 }
}
async function join(code){
 if(busy)return;code=String(code||'').trim().toUpperCase();if(!/^[A-HJ-NP-Z2-9]{8}$/.test(code))return message('8자리 방 코드를 확인해 줘.');
 busy=true;message('방에 참가하고 있어...');
 try{await request('/api/duel',{action:'join',code,title:window.mbGetEquippedTitle?.()||'국어 새내기'});message('참가 완료! 대기실로 이동 중...');await enterDuel(code)}
 catch(e){message(e.message)}finally{busy=false}
}
let opening=false;
async function open(){
 if(opening)return;opening=true;
 try{
 try{
  const account=await request('/api/account');
  if(!account.loggedIn){
   pendingAccount=true;
   window.mbOpenAccount?.();
   if(typeof window.mbOpenAccount!=='function'){
    if(!roomsDialog.open)roomsDialog.showModal();
    filter='all';query='';listView();
    message('온라인 로그인·계정 생성 화면을 불러오지 못했어. 새로고침한 뒤 다시 눌러 줘.');
   }
   return;
  }
 }catch(e){
  if(!roomsDialog.open)roomsDialog.showModal();
  filter='all';query='';listView();
  message('공개방 서버 확인 실패: '+e.message);
  return;
 }
 pendingAccount=false;
 if(!roomsDialog.open)roomsDialog.showModal();
 filter='all';query='';listView();
 await refresh();
}finally{opening=false}
}
window.mbPublicOpen=open;
document.addEventListener('mb:auth-changed',event=>{
 if(event.detail?.loggedIn&&pendingAccount){pendingAccount=false;open()}
 if(!event.detail?.loggedIn)pendingAccount=false;
});
function mount(){
 const row=document.querySelector('#homeScreen .mb-online-actions');
 if(row&&!$('#mb-public-open')){const btn=document.createElement('button');btn.type='button';btn.id='mb-public-open';btn.classList.add('mb-art-button');btn.innerHTML='<img class="mb-art-button-img" src="/ui-assets/public-button-final.png" width="1148" height="292" alt="공개방">';btn.addEventListener('click',open);row.append(btn)}
 for(const side of document.querySelectorAll('.sidebar-nav')){
 if(!side.querySelector('.mb-public-nav')){const btn=document.createElement('button');btn.type='button';btn.className='mb-public-nav';btn.classList.add('mb-art-button');btn.innerHTML='<img class="mb-art-button-img" src="/ui-assets/public-button-final.png" width="1148" height="292" alt="공개방">';btn.addEventListener('click',open);side.append(btn)}
 }
 const mobile=document.querySelector('.mobile-drawer');
 if(mobile&&!mobile.querySelector('.mb-public-nav')){const btn=document.createElement('button');btn.type='button';btn.className='mb-public-nav';btn.classList.add('mb-art-button');btn.innerHTML='<img class="mb-art-button-img" src="/ui-assets/public-button-final.png" width="1148" height="292" alt="공개방">';btn.addEventListener('click',open);mobile.append(btn)}
 return !!row;
}
mount();const interval=setInterval(()=>{if(mount())clearInterval(interval)},250);setTimeout(()=>clearInterval(interval),16000);
setInterval(()=>{if(roomsDialog.open&&screen==='list'&&Date.now()-lastCheck>5000)refresh()},6700);
})();
