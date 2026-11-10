/* Historical side-scroll controls/settings, map, quest journal, inventory */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const BASE={left:'KeyA',right:'KeyD',jump:'Space',sprint:'ShiftLeft',interact:'KeyE',use:'KeyF',inventory:'KeyI',journal:'KeyJ',map:'KeyM',quest:'Tab',settings:'Escape'};
const NAMES={left:'왼쪽 이동',right:'오른쪽 이동',jump:'점프',sprint:'달리기',interact:'조사·대화',use:'물건 사용',inventory:'인벤토리',journal:'기록지',map:'지역 지도',quest:'퀘스트',settings:'설정'};
let prefs={bindings:{...BASE},size:49,bottom:30,left:8,right:8},dialog=null,rebind=null;
try{const old=JSON.parse(localStorage.getItem('history_v7_input')||'null');if(old)prefs={...prefs,...old,bindings:{...BASE,...old.bindings}}}catch{}
function save(){try{localStorage.setItem('history_v7_input',JSON.stringify(prefs))}catch{}}
function pixelTouch(){
 for(const [key,v] of [['size',prefs.size],['bottom',prefs.bottom],['left',prefs.left],['right',prefs.right]]){
  document.documentElement.style.setProperty('--v7-touch-'+key,Number(v)+'px');
 }
}
function escape(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;',">":'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function player(){return window.MB_V7?.snapshot?.()||{scene:'museum',x:0,progress:{}}}
function objective(){
 const p=player().progress||{};
 return '<p>현재 지역: '+escape(player().scene)+' · 월드 위치 '+Math.round(player().x)+'</p><div class="v7-task-list">'+[
  [p.manuscript,'인쇄소 위층에서 신문 원고 찾기'],[p.paper,'인쇄용 종이 수집'],
  [p.document,'1946. 10. 7. 좌우합작 7원칙 조사'],[p.printed,'활자 배열·신문 인쇄'],
  [p.delivered,'서울 거리에서 신문 전달'],[p.timeline,'공동 기록판에 1945~1946년 사건 순서 정리'],[p.cut,'1947. 7. 19. 역사 컷신'],
  [p.memorial,'혜화동 후속 기록 조사']
 ].map(x=>'<p>'+(x[0]?'✅':'⬜')+' '+x[1]+'</p>').join('')+'</div>';
}
function items(){
 const p=player().progress||{};
 return '<h3>수집 아이템</h3>'+[
  [p.manuscript,'📰 신문 원고'],[p.paper,'📄 인쇄용 종이'],
  [p.document,'📜 좌우합작 7원칙'],[p.printed,'🗞️ 완성된 신문'],[p.memorial,'📖 사건 기록']
 ].filter(x=>x[0]).map(x=>'<p class="v7-item">'+x[1]+'</p>').join('')+
 (!Object.values(p).some(Boolean)?'<p>현재 소지품이 없습니다. 인쇄소와 거리를 탐험해 보세요.</p>':'');
}
function record(){
 const p=player().progress||{};
 return '<h3>1946년 10월 7일 · 좌우합작 7원칙 '+(p.document?'✅':'🔒')+'</h3>'+
 '<p>여운형과 김규식 등이 참여한 좌우합작위원회는 통일 임시정부 수립과 미소공동위원회 속개 등을 제안했습니다.</p>'+
 '<a href="https://contents.history.go.kr/front/hm/view.do?levelId=hm_144_0150" target="_blank" rel="noopener">국사편찬위원회 사료 확인</a>'+
 '<h3>1947년 7월 19일 오후 1시경 · 여운형 암살 '+(p.memorial?'✅':'🔒')+'</h3>'+
 '<p>서울 혜화동에서 발생한 사건입니다. 후속 자료와 1946년 좌우합작 자료를 비교해 보세요.</p>'+
 '<a href="https://db.history.go.kr/contemp/level.do?levelId=frus_003r_0010_0870" target="_blank" rel="noopener">국사편찬위원회 당시 보고 확인</a>';
}
function map(){
 const now=player();
 return '<p>현재 위치: '+escape(now.scene)+' · x='+Math.round(now.x)+'/2200</p>'+
 '<div class="v7-map-route"><b>서울 거리</b> ⇄ 인쇄소 · 시장 · 학교 · 신문사 · 집 · 광장 ⇄ 1947년 혜화동</div>'+
 '<p>박물관 로비에는 광복부터 현대까지의 시대별 전시 입구가 있습니다. 모든 실내는 횡스크롤 방식입니다.</p>';
}
function settingsHtml(){
 const fields=Object.keys(BASE).map(k=>'<div class="v7-binding"><span>'+NAMES[k]+'</span><button data-rebind="'+k+'">'+escape(prefs.bindings[k])+'</button></div>').join('');
 const sliders=[['size','터치 버튼 크기',38,82],['bottom','아래쪽 여백',5,130],['left','왼쪽 여백',0,60],['right','오른쪽 여백',0,60]].map(([k,title,min,max])=>
 '<label class="v7-binding"><span>'+title+'</span><input type="range" data-touch="'+k+'" min="'+min+'" max="'+max+'" value="'+prefs[k]+'"><b data-touch-value="'+k+'">'+prefs[k]+'</b></label>').join('');
 return '<p>변경할 키를 누른 다음 새로운 키를 입력하세요.</p><div class="v7-bind-grid">'+fields+'</div><button data-reset-keys>기본 키 복원</button>'+
 '<h3>📱 모바일 버튼 크기·위치</h3>'+sliders+'<p class="v7-muted">설정은 이 기기에 저장됩니다.</p>';
}
function open(which){
 if(!dialog)return;
 rebind=null;
 const labels={inventory:'🎒 인벤토리',quest:'📋 현재 퀘스트',journal:'📜 역사 기록지',map:'🗺️ 지역 지도',settings:'⚙️ 조작 설정'};
 if(dialog.open)dialog.close();
 $('v7DialogTitle').textContent=labels[which]||'기록';
 $('v7DialogBody').innerHTML=({inventory:items,quest:objective,journal:record,map,settings:settingsHtml}[which]||items)();
 dialog.dataset.view=which;dialog.showModal();
}
function close(){if(dialog?.open)dialog.close();rebind=null;$('canvas')?.focus()}
function emit(e,code){
 const ev=new KeyboardEvent(e.type,{code,key:code,bubbles:true,cancelable:true,repeat:!!e.repeat});
 Object.defineProperty(ev,'historyV7Synthetic',{value:true});document.dispatchEvent(ev);
}
function capture(e){
 if(e.historyV7Synthetic)return;
 if(rebind&&e.type==='keydown'){
  e.preventDefault();e.stopImmediatePropagation();
  if(e.code==='Escape'){rebind=null;open('settings');return}
  const conflict=Object.keys(prefs.bindings).find(k=>k!==rebind&&prefs.bindings[k]===e.code);
  if(conflict){$('v7DialogTitle').textContent='이미 '+NAMES[conflict]+'에 사용 중인 키입니다.';return}
  prefs.bindings[rebind]=e.code;save();rebind=null;open('settings');return;
 }
 if(e.target?.closest?.('input,textarea,select,[contenteditable]'))return;
 if(dialog?.open){
  if(e.type==='keydown'&&e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();close()}
  return;
 }
 if($('modal')?.classList.contains('show'))return;
 const local=$('local')?.textContent?.includes('ON');
 const arrows=local?{}:{ArrowLeft:'KeyA',ArrowRight:'KeyD',ArrowUp:'Space',ArrowDown:'KeyS'};
 let mapping=arrows[e.code];
 const command=Object.keys(prefs.bindings).find(k=>prefs.bindings[k]===e.code);
 if(!mapping&&command&&['inventory','journal','map','quest','settings','use'].includes(command)){
  e.preventDefault();e.stopImmediatePropagation();
  if(e.type==='keydown'&&!e.repeat){
   if(command==='use')window.MB_V7?.use?.();else open(command);
  }
  return;
 }
 if(!mapping&&command&&['left','right','jump','sprint','interact'].includes(command))mapping=BASE[command];
 if(mapping&&mapping!==e.code){e.preventDefault();e.stopImmediatePropagation();emit(e,mapping)}
}
function init(){
 const link=document.createElement('link');link.rel='stylesheet';link.href='/history-v7-controls.css';document.head.append(link);
 dialog=document.createElement('dialog');dialog.id='v7ControlsDialog';dialog.innerHTML=
 '<header><h2 id="v7DialogTitle">기록</h2><button id="v7CloseControl" type="button">×</button></header><section id="v7DialogBody"></section>';
 document.body.append(dialog);$('v7CloseControl').onclick=close;
 dialog.addEventListener('click',e=>{
  const key=e.target.closest('[data-rebind]');
  if(key){rebind=key.dataset.rebind;$('v7DialogTitle').textContent=NAMES[rebind]+' · 새 키를 누르세요';return}
  if(e.target.closest('[data-reset-keys]')){prefs.bindings={...BASE};save();open('settings')}
  if(e.target===dialog)close();
 });
 dialog.addEventListener('input',e=>{
  const key=e.target.dataset.touch;if(!key)return;
  prefs[key]=Number(e.target.value);const label=dialog.querySelector('[data-touch-value="'+key+'"]');if(label)label.textContent=String(prefs[key]);
  pixelTouch();save();
 });
 const top=document.querySelector('.top .actions');
 if(top){const b=document.createElement('button');b.textContent='⚙️ 설정 (Esc)';b.onclick=()=>open('settings');top.append(b)}
 const row=document.createElement('nav');row.className='v7-shortcuts';row.setAttribute('aria-label','게임 도구');
 for(const [kind,label] of [['inventory','🎒 인벤토리'],['journal','📜 기록지'],['map','🗺️ 지도'],['quest','📋 퀘스트'],['settings','⚙️ 설정']]){
  const b=document.createElement('button');b.textContent=label;b.onclick=()=>open(kind);row.append(b);
 }
 document.querySelector('.bottom')?.after(row);
 pixelTouch();
 window.addEventListener('keydown',capture,true);
 window.addEventListener('keyup',capture,true);
}
window.MB_V7_CONTROLS={open};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();