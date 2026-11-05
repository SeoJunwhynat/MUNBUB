/* 맛춘범 온라인 1대1: 초대 코드, 동일한 10문제, 서버 채점 및 실시간 점수 확인. */
(()=>{
 'use strict';
 if(window.__mbDuelV1)return;
 window.__mbDuelV1=true;
 const $=id=>document.getElementById(id);
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const dialog=document.createElement('dialog');
 dialog.id='mb-duel-dialog';
 dialog.setAttribute('aria-label','맛춘범 온라인 1대1 대결');
 document.body.append(dialog);
 const stickerProbe=new Image();
 stickerProbe.addEventListener('error',()=>dialog.classList.add('mb-duel-no-sprites'),{once:true});
 stickerProbe.src='/ui-assets/duel-emotes-sheet.webp';
 const css=document.createElement('style');
 css.id='mb-duel-styles';
 css.textContent=[
  '#homeScreen .mb-online-actions>.mb-duel-home{grid-column:auto!important;min-height:0!important;width:100%!important;background-color:transparent!important;font-size:0!important}',
  '#homeScreen .mb-duel-home small{display:none!important}',
  '.sidebar-nav .mb-duel-nav,.mobile-drawer .mb-duel-nav{display:flex!important;flex-direction:column;align-items:center;justify-content:center;min-height:61px!important;padding:7px 5px!important;border:3px solid #b08566!important;border-radius:12px!important;background:linear-gradient(#ffedcd,#d4a784)!important;color:#42292a!important;box-shadow:inset 0 0 0 2px #fff6e5,0 3px 0 #39262a!important;font-weight:950!important;line-height:1.2!important;font-size:clamp(15px,1.35vw,19px)!important;cursor:pointer}',
  '.sidebar-nav .mb-duel-nav small,.mobile-drawer .mb-duel-nav small{font-size:11px!important;font-weight:750!important}',
  '.sidebar-nav .mb-duel-nav.active,.mobile-drawer .mb-duel-nav.active{filter:brightness(.77)!important;outline:3px solid #d6ad82;outline-offset:-3px}',
  '#mb-duel-dialog{box-sizing:border-box;width:min(93vw,760px);max-height:min(90dvh,850px);overflow:auto;border:5px double #ac7a53;border-radius:20px;padding:clamp(14px,2.3vw,25px);background:#f9e7d0;color:#422924;box-shadow:0 18px 65px #100b11a8}',
  '#mb-duel-dialog::backdrop{background:#1a0e16c9}',
  '#mb-duel-dialog h2{font-size:clamp(22px,3vw,32px);margin:4px 0 12px}',
  '#mb-duel-dialog h3{font-size:clamp(17px,2.1vw,22px);margin:13px 0}',
  '#mb-duel-dialog p{line-height:1.55;margin:9px 0}',
  '#mb-duel-dialog .mb-duel-panel{padding:clamp(12px,2vw,19px);border:3px solid #b98c69;border-radius:15px;background:#fff5e6;box-shadow:inset 0 0 0 2px #f8dcba}',
  '#mb-duel-dialog .mb-duel-actions{display:flex;flex-wrap:wrap;gap:9px;margin:15px 0 8px}',
  '#mb-duel-dialog button{min-height:43px;padding:9px 13px;border:2px solid #8e6047;border-radius:10px;background:#f1cca6;color:#3e2927;font-size:clamp(14px,1.5vw,17px);font-weight:850;cursor:pointer;touch-action:manipulation}',
  '#mb-duel-dialog button:hover{filter:brightness(1.065)}',
  '#mb-duel-dialog button:disabled{opacity:.48;cursor:default;filter:grayscale(.6)}',
  '#mb-duel-dialog button.mb-duel-primary{background:linear-gradient(#ffd992,#d99a62);border-color:#955c3e}',
  '#mb-duel-dialog button.mb-duel-close{float:right;padding:6px 10px;min-height:37px}',
  '#mb-duel-dialog .mb-duel-code{font-family:ui-monospace,monospace;font-size:clamp(22px,4vw,34px);font-weight:1000;letter-spacing:.14em;color:#693c2c}',
  '#mb-duel-dialog input{display:block;width:100%;max-width:285px;padding:13px;font-size:clamp(19px,2vw,24px);font-family:ui-monospace,monospace;font-weight:900;letter-spacing:.16em;text-transform:uppercase;border:3px solid #a77455;border-radius:11px;background:#fffcf5;color:#4b302d}',
  '#mb-duel-dialog .mb-duel-status{margin:9px 0;padding:10px;border:2px solid #b7946e;border-radius:12px;background:#ffeacb;font-weight:800}',
  '#mb-duel-dialog .mb-duel-scoreboard{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:10px 0}',
  '#mb-duel-dialog .mb-duel-score{padding:10px;border:3px solid #b38c71;border-radius:12px;background:#fffaf0;text-align:center;min-width:0}',
  '#mb-duel-dialog .mb-duel-score.me{border-color:#ad5e35;background:#fff1d9}',
  '#mb-duel-dialog .mb-duel-score strong{font-size:clamp(22px,3vw,35px);display:block;color:#763c2d}',
  '#mb-duel-dialog .mb-duel-option-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:12px 0}',
  '#mb-duel-dialog .mb-duel-option-list button{min-height:67px;text-align:center;background:#fff0d6;font-size:clamp(15px,1.7vw,21px);word-break:keep-all}',
  '#mb-duel-dialog .mb-duel-option-list button:active{transform:scale(.97)}',
  '#mb-duel-dialog .mb-duel-clock{font-size:clamp(16px,2.2vw,25px);font-weight:1000;color:#74452c}',
  '#mb-duel-dialog .mb-duel-clock.low{color:#ae2939}',
  '#mb-duel-dialog .mb-duel-start-box{text-align:center;padding:clamp(14px,3vw,26px);margin:12px auto;border:3px solid #b99166;border-radius:18px;background:linear-gradient(#fff7e6,#f3d7ab);max-width:410px}',
  '#mb-duel-dialog .mb-duel-start-label{font-size:clamp(19px,3vw,28px);font-weight:950;color:#684333;letter-spacing:.04em}',
  '#mb-duel-dialog .mb-duel-start-number{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:clamp(132px,24vw,214px);min-height:clamp(130px,23vw,204px);padding:5px 24px;border:5px double #ffdab1;border-radius:23px;background:linear-gradient(150deg,#432830,#27181e);box-shadow:0 9px 0 #a16f55,0 13px 22px #3a1c2055,inset 0 0 0 3px #6f4641;font-size:clamp(96px,17vw,154px);line-height:1.0;font-variant-numeric:tabular-nums;font-weight:1000;color:#fff0d6;text-shadow:4px 5px 0 #95513b;letter-spacing:-.06em;margin:14px auto 12px;isolation:isolate}',
  '#mb-duel-dialog .mb-duel-start-note{font-size:clamp(15px,2vw,18px);font-weight:800;color:#6e4b36}',
  '@media(max-width:460px){#mb-duel-dialog .mb-duel-start-number{min-width:145px;min-height:145px;padding:4px 18px;font-size:112px;margin:10px auto}}',
  '#mb-duel-dialog .mb-duel-review{padding:clamp(13px,2vw,19px);margin:13px 0;border:3px solid #b48c68;border-radius:15px;background:#fff0d7;text-align:center}',
  '#mb-duel-dialog .mb-duel-review .mb-duel-result{margin:6px 0 14px}',
  '#mb-duel-dialog .mb-duel-review-clock{font-size:clamp(25px,4.6vw,40px);font-weight:1000;color:#823e30;font-variant-numeric:tabular-nums;line-height:1.3}',
  '#mb-duel-dialog .mb-duel-review-status{font-size:clamp(13px,1.6vw,17px);font-weight:800;color:#6d4a3f;min-height:26px;margin:10px 0}',
  '#mb-duel-dialog #mb-duel-next-ready{display:inline-block;width:min(100%,360px);min-height:53px;background:linear-gradient(#ffdb9c,#d99b5e);font-size:clamp(15px,2vw,20px);font-weight:950}',
  '#mb-duel-dialog #mb-duel-next-ready:disabled{opacity:1;background:#e4d6bd;border-color:#8b7b66;color:#5d6258;filter:none}',
  '@media(prefers-reduced-motion:reduce){#mb-duel-dialog .mb-duel-start-number{animation:none}}',
  '#mb-duel-dialog .mb-duel-clock.mb-duel-rival-fast{color:#c52839!important;animation:mb-duel-urgency .57s ease-in-out infinite alternate;transform-origin:left center}',
  '@keyframes mb-duel-urgency{from{filter:brightness(1);transform:scale(1)}to{filter:brightness(1.3);transform:scale(1.045)}}',
  '#mb-duel-dialog .mb-rival-alert{margin:9px 0;padding:9px 11px;border:2px solid #ac5c60;border-radius:10px;background:#ffdedc;color:#9c2535;font-weight:900;min-height:26px}',
  '#mb-duel-dialog .mb-rival-alert[hidden]{display:none!important}',
  '#mb-duel-dialog .mb-duel-config{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:12px 0}',
  '#mb-duel-dialog .mb-duel-config label{display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:850;color:#52392b}',
  '#mb-duel-dialog .mb-duel-config select{width:100%;min-width:0;min-height:43px;padding:8px;border:2px solid #977457;border-radius:9px;background:#fff8e8;color:#422924;font:inherit;font-weight:800}',
  '@media(max-width:460px){#mb-duel-dialog .mb-duel-config{grid-template-columns:1fr 1fr}#mb-duel-dialog .mb-duel-config label:last-child{grid-column:1/-1}}',
  '@media(prefers-reduced-motion:reduce){#mb-duel-dialog .mb-duel-clock.mb-duel-rival-fast{animation:none}}',
  '#mb-duel-dialog .mb-duel-result{margin-top:12px;padding:13px;border-radius:13px;border:3px solid #896848;font-size:clamp(16px,2.1vw,22px);font-weight:950}',
  '#mb-duel-dialog .mb-duel-result.good{background:#dff7d6;color:#205c37;border-color:#438e56}',
  '#mb-duel-dialog .mb-duel-result.bad{background:#ffe1dc;color:#96313a;border-color:#ad4b4f}',
  '#mb-duel-dialog .mb-duel-scoreboard{position:relative;gap:clamp(22px,4vw,62px)}',
  '#mb-duel-dialog .mb-duel-scoreboard::after{content:"VS";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);padding:7px 9px;background:#642c2e;color:#ffe0b0;border:3px double #e6ba85;border-radius:50%;font-size:clamp(14px,2vw,22px);font-weight:1000}',
  '#mb-duel-dialog .mb-duel-note{color:#735444;font-size:13px}',
  '#mb-duel-dialog{width:min(95vw,1180px);max-height:95dvh;background:linear-gradient(180deg,#e4eff21a,#271c1d18),url("/ui-assets/duel-day-loop.webp") center/cover fixed!important}',
  '#mb-duel-dialog .mb-duel-panel{max-width:1050px;margin:0 auto;padding:clamp(13px,2vw,24px);background:linear-gradient(#fff1dce8,#fae2c6ec);backdrop-filter:blur(4px)}',
  '#mb-duel-dialog h2{margin-bottom:8px;padding:9px 20px;text-align:center;border-radius:14px;background:linear-gradient(#684242,#32232b);color:#ffe0b2;border:4px double #e5bd8e;text-shadow:1px 2px #301c20}',
  '#mb-duel-dialog .mb-duel-score{background:linear-gradient(#422a2fee,#6a4435ed);border:4px double #f4d6aa;color:#fff0d3;min-height:90px}',
  '#mb-duel-dialog .mb-duel-score.me{background:linear-gradient(#69483dee,#4b2c32ed);border-color:#f8d1a5}',
  '#mb-duel-dialog .mb-duel-score strong{color:#fbe1b9}',
  '#mb-duel-dialog .mb-duel-option-list button{background:linear-gradient(#fffaef,#f6dfc0);border:4px double #b88766;box-shadow:0 4px 0 #6b4539;padding:16px 20px}',
  '#mb-duel-dialog .mb-duel-option-list[data-duel-two="true"]{grid-template-columns:repeat(2,minmax(0,1fr))}',
  '#mb-duel-dialog .mb-duel-written-form{display:grid;grid-template-columns:1fr auto;gap:8px;margin:17px auto;max-width:700px}',
  '#mb-duel-dialog #mb-duel-written-answer{box-sizing:border-box;width:100%;max-width:100%;background:#fff8e7;border:4px double #9e7059;border-radius:13px;min-height:57px;font:inherit;font-size:19px;color:#3f2a27;padding:9px 16px}',
  '#mb-duel-dialog .mb-duel-hero{margin:6px 0 17px;text-align:center}',
  '#mb-duel-dialog .mb-duel-question-text{background:linear-gradient(#fffaf0,#ffe7cb);padding:clamp(15px,3vw,30px);min-height:85px;border:5px double #bd8e68;border-radius:22px;text-align:center;font-size:clamp(19px,2.3vw,27px);font-weight:900;line-height:1.6}',
  '#mb-duel-dialog .mb-duel-round-indicator{margin:11px auto 5px;max-width:470px;padding:10px 19px;border:4px double #deb795;border-radius:16px;background:#4c2b2b;color:#fff0d7;text-align:center;font-size:clamp(15px,2vw,21px);font-weight:950}',
  '#mb-duel-dialog .mb-duel-result-hero{display:block;max-height:210px;width:min(65vw,250px);object-fit:contain;margin:6px auto}',
  '@media(max-width:600px){#mb-duel-dialog .mb-duel-written-form{grid-template-columns:1fr}#mb-duel-dialog .mb-duel-option-list[data-duel-two="true"]{grid-template-columns:1fr}#mb-duel-dialog .mb-duel-question-text{padding:12px}}',
  '#mb-duel-dialog .mb-duel-solution{padding:10px 13px;margin:9px 0;border:2px solid #9c7152;background:#fffaf0;color:#603c2d;font-size:clamp(16px,2vw,20px);font-weight:850;border-radius:12px}',
  '#mb-duel-dialog .mb-duel-emotes{display:flex;flex-wrap:wrap;align-items:center;gap:5px;margin:8px 0;padding:7px 8px;border:2px solid #b48b6e;background:#fff9ec;border-radius:11px}',
  '#mb-duel-dialog .mb-duel-emotes-label{font-weight:850;font-size:12px;margin-right:3px;color:#714e3d}',
  '#mb-duel-dialog .mb-duel-emotes button{box-sizing:border-box;min-width:38px;min-height:39px;padding:3px 5px;font-size:24px;line-height:1;border:1px solid #b98c71;background:#fff2d8;border-radius:8px;touch-action:manipulation}',
  '#mb-duel-dialog .mb-duel-emotes button:active{transform:scale(.9)}',
  '#mb-duel-dialog .mb-duel-remote-emote{margin:7px 0;padding:8px 13px;background:#ffe8bc;border:2px solid #a66b48;border-radius:12px;color:#5a352b;font-weight:900;font-size:17px;line-height:1.4}',
  '#mb-duel-dialog .mb-duel-remote-emote[hidden]{display:none!important}',
  '#mb-duel-dialog .mb-duel-remote-emote{animation:mb-scholar-emote .42s cubic-bezier(.2,1.2,.3,1) both;transform-origin:center bottom;box-shadow:0 7px 22px #3b202040}',
  '@keyframes mb-scholar-emote{0%{opacity:0;transform:translateY(22px) scale(.45) rotate(-9deg)}65%{opacity:1;transform:translateY(-7px) scale(1.08) rotate(3deg)}100%{transform:translateY(0) scale(1)}}',
  '#mb-duel-dialog .mb-duel-emotes .mb-duel-emote-art{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;background-size:400% 300%;background-repeat:no-repeat;vertical-align:middle;image-rendering:auto}',
  '#mb-duel-dialog .mb-duel-result-hero{filter:drop-shadow(1px 5px 3px #421e2d70)}',
  '#mb-duel-dialog .mb-duel-emotes-state{font-size:12px;color:#805b48;min-width:65px}',
  '@media(max-width:460px){#mb-duel-dialog .mb-duel-emotes{gap:3px;padding:5px}#mb-duel-dialog .mb-duel-emotes button{font-size:22px;min-width:36px;min-height:37px}#mb-duel-dialog .mb-duel-emotes-label{width:100%}}',
  '@media(max-width:600px){#mb-duel-dialog .mb-duel-option-list{grid-template-columns:1fr}#mb-duel-dialog .mb-duel-option-list button{min-height:55px}#mb-duel-dialog .mb-duel-scoreboard{gap:6px}}'
 ].join('\n');
 document.head.append(css);
 const duelLayout=document.createElement('link');
 duelLayout.rel='stylesheet';duelLayout.href='./munbub_duel_arena_2026.css';
 duelLayout.id='mb-duel-arena-2026-css';document.head.append(duelLayout);
 // All supplied images are committed to ui-assets. The linked arena CSS owns
 // their sizes and overlays; do not re-inject an older set of competing rules.
 const homeRow=document.querySelector('#homeScreen .mb-online-actions');
 if(homeRow){
  const btn=document.createElement('button');
  btn.type='button';btn.className='mb-duel-home';
  btn.innerHTML='🎮 1대1 대결<small>친구와 설정한 문제로 승부!</small>';
  btn.setAttribute('aria-label','온라인 1대1 대결');
  homeRow.append(btn);
  btn.addEventListener('click',openLobby);
 }
 // 1대1 대결은 홈 캐릭터 아래 버튼에서만 진입한다.
 let roomCode=null,status=null,busy=false,lastViewKey='',phase='lobby',feedback=null,feedbackUntil=0,pollBusy=false,previousSelection=null,serverOffset=0;
 let emoteBusy=false,lastEmoteSentAt=0,lastRemoteEmoteAt=0,recentRemoteEmote=null,signalTickCount=0;
 const perf={requests:0,failed:0,elapsedMs:0,signalRequests:0};
 window.mbDuelMetrics=()=>({...perf,meanRequestMs:perf.requests?Math.round(perf.elapsedMs/perf.requests):0});
 let leaving=false,heartbeatBusy=false,lastHeartbeat=0;
 let signalBusy=false,signalLastAt=0,signalFailures=0,lastOpponentSignal=null;
 const currentRoomKey='mb_duel_last_room_v1';
 const roomSettingsKey='mb_duel_host_settings_v1';
 const statusEl=()=>dialog.querySelector('#mb-duel-info');
 function showError(message){const place=statusEl();if(place)place.textContent=message;else renderNotice(message)}
 function makeHeader(){return '<div class="mb-duel-top-controls">'+
  '<button type="button" id="mb-duel-home" aria-label="홈으로 돌아가기"></button>'+
  '<button type="button" id="mb-duel-sound" aria-label="소리 켜기 또는 끄기"></button>'+
  '<button class="mb-duel-close" type="button" id="mb-duel-close" aria-label="1대1 설정으로 이동"></button>'+
  '</div><h2 aria-label="1대1 모드"></h2>'}
 function putHTML(content){
  dialog.classList.toggle('mb-duel-live',content.includes('mb-duel-arena'));
  dialog.innerHTML=makeHeader()+content;
  // Settings and leaving the room are not the Home action.
  dialog.querySelector('#mb-duel-close')?.addEventListener('click',showLobby);
  dialog.querySelector('#mb-duel-home')?.addEventListener('click',async()=>{
   if(!await leaveCurrentRoom())return;
   dialog.close();window.navigate?.('home');
  });
  dialog.querySelector('#mb-duel-sound')?.addEventListener('click',()=>{
   const master=document.querySelector('#bgmToggle')||
    document.querySelector('.mb-home-sound');
   if(master){master.click();return}
   const settings=document.querySelector('#bgmSettingsToggle');
   if(settings)settings.click();
  });
 }
 function renderNotice(message){putHTML('<div class="mb-duel-panel"><p class="mb-duel-status" id="mb-duel-info">'+esc(message)+'</p><div class="mb-duel-actions"><button type="button" id="mb-duel-back">방 선택으로</button></div></div>');dialog.querySelector('#mb-duel-back')?.addEventListener('click',showLobby)}
 async function api(body,code){
  const started=performance.now();perf.requests++;
  const url='/api/duel'+(code?'?code='+encodeURIComponent(code):'');
  try{
   const result=await fetch(url,{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
   const json=await result.json().catch(()=>({}));
   if(!result.ok)throw Error(json.error||'대결 서버에 연결하지 못했어.');
   return json;
  }catch(e){perf.failed++;throw e}finally{perf.elapsedMs+=performance.now()-started}
 }
 async function checkLogin(){
  try{const r=await fetch('/api/account',{credentials:'same-origin'});const j=await r.json();return !!j.loggedIn}catch{return false}
 }
 async function showLobby(){
  if(!await leaveCurrentRoom())return;
  roomCode=null;status=null;phase='lobby';feedback=null;lastViewKey='';signalLastAt=0;signalFailures=0;lastOpponentSignal=null;recentRemoteEmote=null;lastRemoteEmoteAt=0;signalTickCount=0;
  const last=localStorage.getItem(currentRoomKey)||'';
  putHTML('<div class="mb-duel-panel"><p>친구에게 <strong>8자리 방 코드</strong>를 알려 주고 같은 문제로 대결해 봐! 방장이 문제 수와 시간, 유형을 정할 수 있어.</p>'+
   '<form id="mb-duel-create-form"><div class="mb-duel-config">'+
   '<label>문제 수<select id="mb-duel-count"><option value="5">5문제</option><option value="10" selected>10문제</option><option value="15">15문제</option><option value="20">20문제</option><option value="30">30문제</option></select></label>'+
   '<label>문제당 제한 시간<select id="mb-duel-seconds"><option value="10">10초</option><option value="15">15초</option><option value="25" selected>25초</option><option value="30">30초</option><option value="40">40초</option><option value="60">60초</option></select></label>'+
   '<label>문제 유형<select id="mb-duel-type"><option value="mixed" selected>맞춤법 + 사자성어</option><option value="spelling">맞춤법만</option><option value="idiom">사자성어만</option></select></label>'+
   '<label>문제 형식<select id="mb-duel-form"><option value="auto">문제별 자동</option><option value="two">2지선다</option><option value="four">4지선다</option><option value="text">서술형</option></select></label>'+
   '</div><button id="mb-duel-create" type="submit" class="mb-duel-primary">➕ 설정대로 대결방 만들기</button></form>'+
   '<hr><label for="mb-duel-input"><strong>초대받은 방 코드</strong></label><input id="mb-duel-input" maxlength="8" autocomplete="off" placeholder="예: ABCD2345" value="'+esc(last)+'"><div class="mb-duel-actions"><button id="mb-duel-join">↪ 방 코드로 참가</button>'+(last?'<button id="mb-duel-return">최근 방 다시 보기</button>':'')+'</div><p class="mb-duel-note">닉네임·비밀번호 로그인 후 참가할 수 있어. 1대1 점수는 하드코어 랭킹에 합산되지 않아.</p><p id="mb-duel-info" role="status" class="mb-duel-status">새 방을 만들거나 친구의 코드를 입력해 줘.</p></div>');
  try{
   const saved=JSON.parse(localStorage.getItem(roomSettingsKey)||'null');
   for(const [id,value] of [['mb-duel-count',saved?.count],['mb-duel-seconds',saved?.seconds],['mb-duel-type',saved?.type],['mb-duel-form',saved?.form]]){
    const el=$(id);
    if(el&&[...el.options].some(opt=>opt.value===String(value)))el.value=String(value);
   }
  }catch(_){}
  dialog.querySelector('#mb-duel-create-form')?.addEventListener('submit',e=>{
   e.preventDefault();
   const settings={count:Number($('mb-duel-count').value),
    seconds:Number($('mb-duel-seconds').value),type:$('mb-duel-type').value,form:$('mb-duel-form').value};
   try{localStorage.setItem(roomSettingsKey,JSON.stringify(settings))}catch(_){}
   startAction('create',settings);
  });
  dialog.querySelector('#mb-duel-join')?.addEventListener('click',()=>startAction('join',dialog.querySelector('#mb-duel-input')?.value));
  dialog.querySelector('#mb-duel-return')?.addEventListener('click',()=>enterRoom(last));
 }
 async function openLobby(){
  if(dialog.open)return;
  previousSelection=window.__mbSelectedMenu?.()||'home';
  // 홈 버튼에서 여는 팝업은 왼쪽 모드 선택 상태를 바꾸지 않는다.
  dialog.showModal();
  showLobby();
  const logged=await checkLogin();
  if(!logged && dialog.open && phase==='lobby'){
   putHTML('<div class="mb-duel-panel"><p class="mb-duel-status">🔒 온라인 1대1은 로그인 후 이용할 수 있어.</p><p>홈 캐릭터 아래의 로그인 버튼에서 닉네임과 비밀번호로 로그인해 줘.</p><div class="mb-duel-actions"><button type="button" id="mb-duel-login">👤 로그인하기</button></div></div>');
   dialog.querySelector('#mb-duel-login')?.addEventListener('click',()=>{
    dialog.close();$('mb-account-open')?.click();
   });
  }
 }

 document.addEventListener('click',e=>{
  const target=e.target.closest?.('[data-route="duel"]');
  if(!target)return;
  e.preventDefault();e.stopImmediatePropagation();
  openLobby();
 },true);
 dialog.addEventListener('close',()=>{
  reportLeave();
  if(typeof window.__mbMarkRoute==='function')window.__mbMarkRoute(previousSelection||'home');
  previousSelection=null;
 });
 async function leaveCurrentRoom(){
  if(!roomCode)return true;
  if(leaving)return false;
  leaving=true;
  const code=roomCode;
  try{
   await api({action:'leave',code,
    ...(status?.answerTicket?{answerTicket:status.answerTicket}:{})});
   if(roomCode===code){roomCode=null;status=null;}
   try{localStorage.removeItem(currentRoomKey)}catch(_){}
   return true;
  }catch(error){showError('방을 나가지 못했어: '+error.message);return false}
  finally{leaving=false}
 }
 // Best-effort only for tab closing. All visible exit buttons await the server.
 function reportLeave(){
  if(!roomCode)return;
  try{
   const body=JSON.stringify({action:'leave',code:roomCode,
    ...(status?.answerTicket?{answerTicket:status.answerTicket}:{})});
   const sent=navigator.sendBeacon?.('/api/duel',new Blob([body],{type:'application/json'}));
   if(!sent)fetch('/api/duel',{method:'POST',credentials:'same-origin',
    headers:{'Content-Type':'application/json'},body,keepalive:true}).catch(()=>{});
  }catch(_){}
 }
 function opponentGone(offline){
  if(!roomCode)return;
  roomCode=null;status=null;phase='opponent-left';feedback=null;lastViewKey='';
  const message=offline?'상대방의 연결이 끊겨 대결을 종료했어.':'상대방이 대결방에서 나갔어. 1대1 대결이 종료됐어.';
  putHTML('<div class="mb-duel-panel"><h3>🚪 상대방 퇴장 · 대결 종료</h3>'+
   '<p class="mb-duel-status">'+esc(message)+'</p>'+
   '<p class="mb-duel-note">더 이상 상대의 답변을 기다리지 않아. 새 방을 만들거나 다른 방에 참가해 줘.</p>'+
   '<button id="mb-duel-again" type="button">다른 대결방 만들기 / 참가하기</button></div>');
  dialog.querySelector('#mb-duel-again')?.addEventListener('click',showLobby);
 }
 async function heartbeat(){
  if(!roomCode||!status||!dialog.open||heartbeatBusy||
     Date.now()-lastHeartbeat<5200)return;
  const code=roomCode;heartbeatBusy=true;lastHeartbeat=Date.now();
  try{
   const out=await api({action:'pulse',code,...(status?.answerTicket?{answerTicket:status.answerTicket}:{})});
   if(out.ended&&roomCode===code)opponentGone(false);
  }catch(_){/* transient connection failures must not interrupt the user's answer */}
  finally{heartbeatBusy=false}
 }
 async function startAction(action,value){
  if(busy)return;
  busy=true;showError(action==='create'?'대결방 생성 중...':'친구 방에 참가하는 중...');
  try{
   const code=String(value||'').trim().toUpperCase();
   const title=window.mbGetEquippedTitle?.()||'국어 새내기';
   const result=await api(action==='create'?{action:'create',settings:value,title}:{action:'join',code,title});
   await enterRoom(result.code);
  }catch(e){showError(e.message)}finally{busy=false}
 }
 async function enterRoom(code){
  roomCode=String(code||'').trim().toUpperCase();
  if(!roomCode)return showLobby();
  phase='room';status=null;feedback=null;lastViewKey='';signalLastAt=0;signalFailures=0;lastOpponentSignal=null;recentRemoteEmote=null;lastRemoteEmoteAt=0;signalTickCount=0;
  try{localStorage.setItem(currentRoomKey,roomCode)}catch(_){}
  putHTML('<div class="mb-duel-panel"><p class="mb-duel-status" id="mb-duel-info">대결 정보를 불러오는 중...</p></div>');
  await updateRoom();
 }
 async function updateRoom(){
  if(!roomCode||!dialog.open)return;
  if(pollBusy){setTimeout(()=>{if(roomCode)updateRoom()},160);return;}
  pollBusy=true;
  const started=Date.now(),code=roomCode;
  try{
   const next=await api(null,code);
   if(!dialog.open||roomCode!==next.code)return;
   // An earlier full response must never roll back a fresher signal.
   if(status?.code===code&&signalLastAt>started)return;
   if(Number.isFinite(next.serverNow))serverOffset=next.serverNow-Date.now();
   const firstSignal=!status?.signalTicket&&!!next.signalTicket;
   status=next;
   if(firstSignal&&status?.answerTicket)heartbeat();
   showGame();
   // Don't wait up to 1.4s for the old idle poll timer after room entry.
   if(firstSignal){
    clearTimeout(fastTimer);
    fastTimer=setTimeout(signalPoll,80);
   }
  }catch(e){showError(e.message)}finally{pollBusy=false}
 }
 // Fast path: a room-bound signed ticket reads only ONE opponent progress Blob
 // rather than reloading the room, guest and two players on every 0.4s poll.
 async function checkSignal(){
  if(signalBusy||!dialog.open||!roomCode||document.hidden||
     !status?.signalTicket||busy)return;
  const code=roomCode,credential=status.signalTicket;
  signalBusy=true;
  try{
   const start=Date.now();perf.requests++;perf.signalRequests++;
   const includeEmote=++signalTickCount%2===0;
   const res=await fetch('/api/duel?signal='+encodeURIComponent(credential)+(includeEmote?'&reactions=1':''),{
    credentials:'same-origin',cache:'no-store'
   });
   if(!res.ok)throw Error('대전 알림 연결 실패 '+res.status);
   const signal=await res.json();
   if(!dialog.open||roomCode!==code||status?.signalTicket!==credential)return;
   signalFailures=0;
   // Server clock sample is captured before response transmission.
   if(Number.isFinite(signal.serverNow))
    serverOffset=signal.serverNow-Math.round((start+Date.now())/2);
   if(!status.ready){
    if(signal.ready)await updateRoom();
    return;
   }
   const me=status.players.find(p=>p.id===status.me);
   const opponent=status.players.find(p=>p.id!==status.me);
   if(!me||!opponent||!Number.isInteger(signal.answered))return;
   if(signal.emote)receiveEmote(signal.emote);
   if(signal.opponentLeft||signal.opponentOffline){opponentGone(!!signal.opponentOffline);return;}
   if(signal.answered<opponent.answered)return; // Ignore stale Blob copies.
   const previousSignal=lastOpponentSignal;
   lastOpponentSignal=signal;
   const agreementChanged=signal.answers?.some(a=>{
    const prior=previousSignal?.answers?.find(x=>x.index===a.index);
    return (a.readyAt||null)!==(prior?.readyAt||null);
   });
   const changed=signal.answered!==opponent.answered||
    signal.score!==opponent.score||signal.lastAt!==opponent.lastAt||agreementChanged;
   if(!changed)return;
   signalLastAt=Date.now();
   opponent.answered=signal.answered;
   opponent.correct=signal.correct;
   opponent.score=signal.score;
   opponent.lastAt=signal.lastAt;
   status.opponentAnswered=opponent.answered>me.answered;
   status.opponentAnsweredAt=status.opponentAnswered
    ?signal.answers?.find(a=>a.index===me.answered)?.at||opponent.lastAt:null;
   status.turnReady=me.answered<count()&&me.answered<=opponent.answered;
   if(status.turnReady){
    if(me.answered===0)status.turnStartsAt=status.startsAt;
    else{
     const prev=me.answered-1;
     const ours=me.answers?.find(a=>a.index===prev)?.at||me.lastAt;
     const theirs=signal.answers?.find(a=>a.index===prev)?.at||opponent.lastAt;
     if(ours&&theirs){
      const ownAnswer=lastAnswer(me,prev)||{at:ours};
      const theirAnswer=signal.answers?.find(a=>a.index===prev)||{at:theirs};
      status.reviewReadyAt=Number(ownAnswer.readyAt)||null;
      status.opponentReviewReadyAt=Number(theirAnswer.readyAt)||null;
      status.turnStartsAt=newReview()
       ?reviewTurnAt(ownAnswer,theirAnswer):Math.max(ours,theirs)+1500;
     }else{await updateRoom();return}
    }
   }else status.turnStartsAt=null;
   status.finished=status.players.every(p=>p.answered>=count());
   if(status.finished&&newReview()){
    const end=count()-1;
    const ours=lastAnswer(me,end),theirs=signal.answers?.find(a=>a.index===end);
    if(ours&&theirs)status.finalReviewEndsAt=reviewTurnAt(ours,theirs);
   }
   showGame(); // Scoreboard-only update when phase/question is unchanged.
  }catch(e){
   signalFailures++;
   // Graceful fallback to the normal authenticated state endpoint.
   // Do not replace the question UI with a transient connection error.
   if(signalFailures===2)await updateRoom();
  }finally{signalBusy=false}
 }
 function opts(q,index){
  if(q.type==='spelling')return [...q.options||[]];
  if(q.type!=='idiom')return [];
  const rejected=new Set([q.answer]);
  const synonyms=[['일거양득','일석이조'],['막상막하','난형난제'],['갑론을박','설왕설래'],
  ['진퇴양난','진퇴유곡'],['고립무원','사고무친'],['분기탱천','비분강개'],
   ['안하무인','방약무인'],['대경실색','혼비백산'],
   ['명재경각','백척간두'],['전전긍긍','전전반측']];
  for(const group of synonyms)if(group.includes(q.answer))group.forEach(a=>rejected.add(a));
  const candidates=BANK.idioms.filter(x=>!rejected.has(x.answer)&&x.meaning!==q.meaning);
  const seed=[...roomCode].reduce((a,c)=>a+c.charCodeAt(0),0)+index*37;
  const choices=[q.answer];
  for(let offset=0;choices.length<4&&offset<candidates.length;offset++)choices.push(candidates[(seed+offset*11)%candidates.length].answer);
  return choices.map((x,i)=>({x,index:(i*7+seed)%4})).sort((a,b)=>a.index-b.index).map(x=>x.x);
 }
 const now=()=>Date.now()+serverOffset;
 const count=()=>status?.settings?.count||status?.questionIds?.length||10;
 const duration=()=>1000*(status?.settings?.seconds||25);
 const remaining=()=>{
  if(!status?.ready||!status.turnReady||!status.turnStartsAt)return 0;
  const time=now();
  const original=Math.max(0,time-status.turnStartsAt);
  const extra=status.opponentAnsweredAt?Math.max(0,time-status.opponentAnsweredAt):0;
  return Math.max(0,duration()-original-extra);
 };
 const newReview=()=>['both-ready-or-10s','both-ready-or-5s'].includes(status?.reviewMode);
 const reviewMilliseconds=()=>status?.reviewMode==='both-ready-or-10s'?10000:5000;
 const lastAnswer=(p,index)=>p?.answers?.find(a=>a.index===index);
 function reviewTurnAt(ours,theirs){
  const last=Math.max(Number(ours?.at)||0,Number(theirs?.at)||0);
  const fallback=last+reviewMilliseconds();
  const first=Number(ours?.readyAt)||0,second=Number(theirs?.readyAt)||0;
  return first&&second?Math.min(fallback,Math.max(first,second)):fallback;
 }
 function reviewInfo(){
  const me=status?.players?.find(p=>p.id===status.me);
  const opponent=status?.players?.find(p=>p.id!==status.me);
  if(!me||me.answered<1||me.answered>count())return null;
  const index=me.answered-1;
  const own=lastAnswer(me,index);
  const theirs=lastOpponentSignal?.answers?.find(a=>a.index===index);
  const readyAt=Number(own?.readyAt||status.reviewReadyAt)||null;
  const opponentReadyAt=Number(theirs?.readyAt||status.opponentReviewReadyAt)||null;
  const otherAnswered=!!opponent&&opponent.answered>index;
  return {index,own,readyAt,opponentReadyAt,otherAnswered,
   readyCount:Number(!!readyAt)+Number(!!opponentReadyAt)};
 }
 function refreshReview(){
  if(phase!=='review'||!status)return;
  const info=reviewInfo();
  if(!info)return;
  const btn=dialog.querySelector('#mb-duel-next-ready');
  if(btn){
   const disabled=!!info.readyAt||busy;
   const finalRound=info.index===count()-1;
   const label=info.readyAt?(finalRound?'✅ 결과 확인 동의 완료':'✅ 바로 넘어가기 동의 완료'):(finalRound?'🏆 결과 확인하기':'⚡ 바로 다음 문제로 넘어가기 동의');
   if(btn.disabled!==disabled)btn.disabled=disabled;
   if(btn.textContent!==label)btn.textContent=label;
  }
  const clock=dialog.querySelector('#mb-duel-review-clock');
  if(clock){
   const end=info.index===count()-1?status.finalReviewEndsAt:status.turnStartsAt;
   const caption=!info.otherAnswered?'⏳ 상대 답변 대기 중'
    :end&&now()<end
     ?'⏱ '+(Math.max(0,(end-now())/1000)).toFixed(1)+'초 후 '+(info.index===count()-1?'결과 발표':'자동 진행')
     :'⚔ '+(info.index===count()-1?'최종 결과 공개!':'다음 문제 시작!');
   if(clock.textContent!==caption)clock.textContent=caption;
  }
  const statusText=dialog.querySelector('#mb-duel-review-status');
  if(statusText){
   const caption=info.readyCount+' / 2명 동의'
    +(info.otherAnswered?' · 둘 다 답변 완료':' · 상대방이 문제를 풀고 있어');
   if(statusText.textContent!==caption)statusText.textContent=caption;
  }
 }
 function updateOpponentSignal(){
  if(!dialog.open||phase!=='question'||!status)return;
  const flash=!!status.opponentAnswered;
  const clock=dialog.querySelector('#mb-duel-clock');
  clock?.classList.toggle('mb-duel-rival-fast',flash);
  const notice=dialog.querySelector('#mb-duel-rival-notice');
  if(notice){
   notice.hidden=!flash;
   if(flash&&notice.textContent!=='⚡ 상대가 먼저 답했어! 남은 시간이 2배 빠르게 줄어들어!')
    notice.textContent='⚡ 상대가 먼저 답했어! 남은 시간이 2배 빠르게 줄어들어!';
  }
 }
 function concealedScore(){
  const ps=status?.players||[];
  // Correctness and points are private until both people submit.
  return ps.length===2&&ps[0].answered!==ps[1].answered;
 }
 function scoreboard(){
  const hidden=concealedScore();
  return '<div class="mb-duel-scoreboard">'+(status?.players||[]).map(p=>
   '<div class="mb-duel-score'+(p.id===status.me?' me':'')+'" data-duel-player="'+esc(p.id)+'">'+
   '<span class="mb-duel-player-name">'+esc(p.name)+(p.id===status.me?' (나)':'')+'</span>'+ 
    '<span class="mb-duel-player-title">'+esc(p.title||'국어 새내기')+'</span>'+
   '<strong class="mb-duel-score-value">'+(hidden?'🔒 공개 대기':p.score+'점')+'</strong>'+
   '<small class="mb-duel-progress">'+(hidden?'상대 답변 후 점수 공개 · '+p.answered+'/'+count():'정답 '+p.correct+' · '+p.answered+'/'+count())+'</small>'+
   (p.id===status.me?
     '<div id="mb-duel-local-emote" class="mb-duel-portrait-emote mb-duel-local-emote" role="status" aria-live="polite" hidden></div>':
     '<div id="mb-duel-remote-emote" class="mb-duel-portrait-emote mb-duel-remote-emote" role="status" aria-live="polite" hidden></div>')+
   '</div>').join('')+'</div>';
 }
 function refreshScoreboard(){
  const hidden=concealedScore();
  for(const p of status?.players||[]){
   const card=dialog.querySelector('[data-duel-player="'+p.id+'"]');
   if(!card)continue;
   const points=card.querySelector('.mb-duel-score-value');
   const progress=card.querySelector('.mb-duel-progress');
   if(points){const next=hidden?'🔒 공개 대기':p.score+'점';if(points.textContent!==next)points.textContent=next;}
   if(progress){const next=hidden?
    '상대 답변 후 점수 공개 · '+p.answered+'/'+count():
    '정답 '+p.correct+' · '+p.answered+'/'+count();if(progress.textContent!==next)progress.textContent=next;}
  }
  updateOpponentSignal();
  refreshReview();
  const points=status?.players||[];
  const left=dialog.querySelector('#mb-duel-score-left'),right=dialog.querySelector('#mb-duel-score-right');
  if(left){const n=hidden?'?':String(points[0]?.score||0);if(left.textContent!==n)left.textContent=n;}
  if(right){const n=hidden?'?':String(points[1]?.score||0);if(right.textContent!==n)right.textContent=n;}
 }
  const EMOTES={
  wave:['👋','인사'],cheer:['🙌','만세'],laugh:['😂','웃음'],
  wow:['😮','놀람'],cry:['😢','아쉬움'],fire:['🔥','불꽃'],
  thumbs:['👍','좋아요'],thinking:['🤔','고민'],
  cool:['😎','멋짐'],sleep:['💤','졸림'],love:['💗','하트'],angry:['😤','화남']
 };
 const EMOTE_ORDER=['wave','thumbs','laugh','angry','cry','wow','fire','thinking','cool','sleep','love','cheer'];
 const spriteStyle=id=>{const index=EMOTE_ORDER.indexOf(id);return index<0?'':
  'background-position:'+((index%4)*100/3)+'% '+(Math.floor(index/4)*50)+'%'};
 function renderRemoteEmote(){
  const el=dialog.querySelector('#mb-duel-remote-emote');
  if(!el)return;
  const live=recentRemoteEmote&&Date.now()-recentRemoteEmote.received<2900;
  el.hidden=!live;
  if(live)el.innerHTML='<strong>상대방</strong><span class="mb-duel-emote-art mb-duel-remote-sticker" style="'+spriteStyle(recentRemoteEmote.id)+'" role="img" aria-label="'+esc(EMOTES[recentRemoteEmote.id]?.[1]||'이모티콘')+'"></span>';
 }
 function receiveEmote(emote){
  if(!emote||!EMOTES[emote.id]||!Number.isFinite(emote.at)||
     emote.at<=lastRemoteEmoteAt)return;
  lastRemoteEmoteAt=emote.at;
  recentRemoteEmote={id:emote.id,received:Date.now()};
  renderRemoteEmote();
 }
 function emotePalette(){
  if(!status)return '';
  return '<div class="mb-duel-emotes" aria-label="상대에게 이모티콘 보내기">'+
   '<span class="mb-duel-emotes-label">이모티콘</span>'+
   EMOTE_ORDER.map(key=>{
    const [icon,name]=EMOTES[key];
    return '<button type="button" data-duel-emote="'+key+'" aria-label="'+name+' 보내기" title="'+name+'"'+
     (!status?.ready||!status.answerTicket?' disabled':'')+'>'+
     '<span class="mb-duel-emote-art" style="'+spriteStyle(key)+'"><span class="mb-duel-emote-fallback">'+icon+'</span></span></button>';
   }).join('')+
   '<span id="mb-duel-emotes-state" class="mb-duel-emotes-state" aria-live="polite"></span></div>';
 }
 async function sendEmote(id){
  if(!EMOTES[id]||!dialog.open||!roomCode||!status?.ready||
     !status.answerTicket||emoteBusy)return;
  const time=Date.now();
  if(time-lastEmoteSentAt<1150)return;
  lastEmoteSentAt=time;emoteBusy=true;
  const area=dialog.querySelector('#mb-duel-emotes-state');
  if(area)area.textContent='전송 중…';
  const currentCode=roomCode;
  try{
   await api({action:'emote',code:currentCode,emote:id,answerTicket:status.answerTicket});
   if(currentCode===roomCode){
    const local=dialog.querySelector('#mb-duel-local-emote');
    if(local){local.hidden=false;local.innerHTML='<span class="mb-duel-emote-art mb-duel-remote-sticker" style="'+spriteStyle(id)+'" role="img" aria-label="'+esc(EMOTES[id][1])+'"></span><strong>내 이모티콘</strong>';
     setTimeout(()=>{if(local.isConnected)local.hidden=true},2700)}
    const label=dialog.querySelector('#mb-duel-emotes-state');
    if(label)label.textContent='전송 완료!';
   }
  }catch(e){
   if(e.message.includes('1초'))lastEmoteSentAt=Date.now();
   const label=dialog.querySelector('#mb-duel-emotes-state');
   if(label)label.textContent=e.message;
  }finally{emoteBusy=false}
 }
 dialog.addEventListener('click',event=>{
  const button=event.target.closest?.('[data-duel-emote]');
  if(button){event.preventDefault();sendEmote(button.dataset.duelEmote)}
 });
  function formFor(q,index){
  const selected=status?.settings?.form||'auto';
  if(selected==='text')return 'text';
  if(selected==='two')return 'two';
  if(selected==='four')return 'four';
  // Automatic format adapts to each question rather than forcing four answers.
  return q.type==='idiom'?'four':'two';
 }
 function optionsFor(q,index,form){
  const all=opts(q,index);
  if(form!=='two'||all.length<=2)return all;
  const solution=q.type==='idiom'?q.answer:q.answers?.[0];
  const decoy=all.find(x=>x!==solution);
  if(!solution||!decoy)return all.slice(0,2);
  return index%2===0?[solution,decoy]:[decoy,solution];
 }
 function showGame(){
  if(!dialog.open||!roomCode||!status)return;
  const me=status.players.find(x=>x.id===status.me);
  const qidx=me?.answered||0;
  // A player must never see the next question while the other is answering.
  // Local feedback may show first, but the new round is server-gated.
  const other=status.players.find(x=>x.id!==status.me);
  const unlocked=!!status.turnReady&&!!other&&qidx<=other.answered;
  const bothSubmitted=!!other&&other.answered>=qidx;
  const reviewEnd=qidx>=count()?status.finalReviewEndsAt:status.turnStartsAt;
  // Reveal correctness only after BOTH players have submitted this question.
  const showReview=newReview()&&qidx>0&&bothSubmitted&&
   (!reviewEnd||now()<reviewEnd);
  const newPhase=!status.ready?'waiting'
   :showReview?'review'
   :status.finished?'results'
   :qidx>=count()?'finished'
   :!newReview()&&Date.now()<feedbackUntil?'feedback'
   :!unlocked?'opponent'
   :now()<status.turnStartsAt?'countdown':'question';
  // Include multiplayer lobby readiness and opponent presence in the view key.
   // Otherwise the fast poll changes state but never redraws the waiting UI.
   const lobbyKey=newPhase==='waiting'&&status.publicRoom
    ?'|'+String(status.guestName||'')+'|'+Number(!!status.lobbyReady?.host)+'|'+Number(!!status.lobbyReady?.guest)
    :'';
   const viewKey=newPhase+'|'+qidx+lobbyKey;
  if(viewKey===lastViewKey){refreshScoreboard();return;}
  lastViewKey=viewKey;phase=newPhase;
  const options=status.settings||{count:count(),seconds:25,type:'mixed'};
  const typeLabel={mixed:'맞춤법+사자성어',spelling:'맞춤법만',idiom:'사자성어만'};
  const formLabel={auto:'문제별 자동',two:'2지선다',four:'4지선다',text:'서술형'};
  let html='<div class="mb-duel-panel mb-duel-arena"><div class="mb-duel-roommeta"><p>친구 초대 코드 <strong class="mb-duel-code" id="mb-duel-code">'+esc(roomCode)+'</strong> <button id="mb-duel-copy" type="button">복사</button></p>'+
   '<p class="mb-duel-note">⚙ '+count()+'문제 · 문제당 '+options.seconds+'초 · '+esc(typeLabel[options.type]||'혼합')+' · '+esc(formLabel[options.form]||'문제별 자동')+'</p></div>';
  html+='<section class="mb-duel-hud">'+scoreboard()+
   '<div class="mb-duel-vs-bar" aria-label="양쪽 점수 비교"><span id="mb-duel-score-left">'+
   (concealedScore()?'?':(status.players[0]?.score||0))+'</span><span class="mb-duel-vs-caption">VS</span>'+
   '<span id="mb-duel-score-right">'+(concealedScore()?'?':(status.players[1]?.score||0))+'</span></div></section>';
  if(newPhase==='waiting'&&status.publicRoom){
   const ready=status.lobbyReady||{},mine=status.role==='host'?ready.host:ready.guest;
   html+='<section class="mb-public-waiting"><h3>🏮 '+esc(status.roomName||'공개방 대기실')+'</h3>'+
    '<p class="mb-public-wait-desc">방 코드 '+esc(roomCode)+' · 두 명이 준비하면 방장이 시작할 수 있어.</p>'+
    '<div class="mb-public-players"><div>👑 '+esc(status.hostName||'방장')+' <b>'+(ready.host?'✅ 준비 완료':'⏳ 준비 중')+'</b></div>'+
    '<div>📖 '+esc(status.guestName||'참가자 대기 중')+' <b>'+(ready.guest?'✅ 준비 완료':'⏳ 준비 중')+'</b></div></div>'+
    '<div class="mb-public-ready-actions"><button id="mb-public-ready" type="button" class="mb-duel-primary" '+(!status.guestName?'disabled':'')+'>'+(mine?'✓ 준비 취소':'✓ 준비 완료')+'</button>'+
    (status.role==='host'?'<button id="mb-public-start" type="button" '+(!ready.host||!ready.guest?'disabled':'')+'>▶ 게임 시작</button>':'<span>방장 시작 대기 중</span>')+'</div>'+
    '<div class="mb-public-chat"><strong>💬 대기실 채팅</strong><div id="mb-public-chatlog" role="log" aria-live="polite">채팅 불러오는 중...</div>'+
    '<form id="mb-public-chatform"><input id="mb-public-chattext" maxlength="80" autocomplete="off" placeholder="메시지 입력 · 80자 이내"><button type="submit">전송</button></form>'+
    '<div class="mb-public-quickchat"><button type="button" data-public-emoji="👋">👋</button><button type="button" data-public-emoji="😄">😄</button><button type="button" data-public-emoji="🔥">🔥</button><button type="button" data-public-emoji="👏">👏</button></div></div></section>';
  }
  if(newPhase==='waiting'&&!status.publicRoom)html+='<p class="mb-duel-status" id="mb-duel-info">⏳ 아직 상대방이 입장하지 않았어. 둘 다 들어와야 시작돼!</p>';
  if(newPhase==='opponent')html+='<p class="mb-duel-status" id="mb-duel-info">⏳ 답안 제출 완료! 상대방도 답을 고르면 정답과 해설을 함께 공개해.</p><p class="mb-duel-note">답안은 서버에 접수됐어. 결과는 아직 공개되지 않아.</p>';
  if(newPhase==='countdown')html+='<section class="mb-duel-start-box" aria-label="대결 시작 카운트다운">'+
   '<p id="mb-duel-countdown" class="mb-duel-start-number" role="timer">'+Math.max(0,Math.ceil((status.turnStartsAt-now())/1000))+'초 뒤에 시작...</p></section>';
  if(newPhase==='question'){
   const q=MAP.get(status.questionIds[qidx]);
   if(!q){html+='<p id="mb-duel-info">문제를 불러오지 못했어.</p>'}
   else{
    const title=q.type==='idiom'?'📖 다음 뜻에 해당하는 사자성어를 골라 줘.':'✏️ 빈칸에 들어갈 맞는 표현을 골라 줘.';
    const question=q.type==='idiom'?q.meaning:q.prompt;
    const form=formFor(q,qidx),answers=optionsFor(q,qidx,form);
    html+='<p><strong>문제 '+(qidx+1)+' / '+count()+'</strong> · '+(q.type==='idiom'?'사자성어':'프린트 맞춤법')+' · '+(form==='text'?'서술형':answers.length+'지선다')+'</p><p id="mb-duel-clock" class="mb-duel-clock">⏱ '+(duration()/1000).toFixed(1)+'초</p>'+
    '<p id="mb-duel-rival-notice" role="status" aria-live="polite" class="mb-rival-alert" hidden></p>'+
    '<h3>'+esc(title)+'</h3><div class="mb-duel-question-text">'+esc(question)+'</div>'+
    (form==='text'?'<form id="mb-duel-written-form" class="mb-duel-written-form"><input id="mb-duel-written-answer" maxlength="100" placeholder="정답 직접 입력" autocomplete="off" spellcheck="false" required><button type="submit">제출</button></form>':
     '<div class="mb-duel-option-list" data-duel-two="'+(answers.length===2?'true':'false')+'">'+answers.map(value=>'<button type="button" data-duel-answer="'+esc(value)+'">'+esc(value)+'</button>').join('')+'</div>')+
    '<p class="mb-duel-note">빠르게 맞힐수록 최대 10점. 상대가 먼저 제출하면 남은 시간은 2배 속도로 감소!</p>';
   }
  }
  if(newPhase==='review'){
   const info=reviewInfo();
   const good=info?.own?.correct??feedback?.correct;
   const points=info?.own?.points??feedback?.points??0;
   const q=status.questionIds?.[qidx-1]?MAP.get(status.questionIds[qidx-1]):null;
   const solution=q?(q.type==='idiom'?q.answer:(q.answers||[]).join(' / ')):'';
   html+='<section class="mb-duel-review" aria-label="문제 풀이 후 대기">'+
    '<p class="mb-duel-result '+(good?'good':'bad')+'">'+(good?'✔ 정답! +'+points+'점':'✖ 오답! 0점')+'</p>'+
    '<p class="mb-duel-solution">정답: <strong>'+esc(solution)+'</strong></p>'+
    (q?.note?'<p class="mb-duel-note">해설: '+esc(q.note)+'</p>':'')+
    '<div id="mb-duel-review-clock" class="mb-duel-review-clock" role="timer"></div>'+
    '<p id="mb-duel-review-status" class="mb-duel-review-status" aria-live="polite"></p>'+
    '<button type="button" id="mb-duel-next-ready">'+(qidx>=count()?'🏆 결과 확인하기':'⚡ 바로 다음 문제로 넘어가기 동의')+'</button>'+
    '<p class="mb-duel-note">둘 다 답한 뒤 '+(reviewMilliseconds()/1000)+'초 후 '+(qidx>=count()?'결과를 공개해.':'자동으로 다음 문제로 넘어가.')+' 둘 다 동의하면 바로 진행해.</p></section>';
  }
  if(newPhase==='feedback'){const good=feedback?.correct;html+='<p class="mb-duel-result '+(good?'good':'bad')+'">'+(good?'✔ 정답! +'+feedback.points+'점':'✖ 아쉬워! 0점')+'</p><p>'+(qidx>=count()?'결과 확인하기':'다음 문제로 넘어가는 중...')+'</p>'}
  if(newPhase==='finished')html+='<p class="mb-duel-status">✅ '+count()+'문제를 모두 풀었어! 상대가 마칠 때까지 기다리고 있어.</p>';
  if(newPhase==='results'){
   const players=[...status.players].sort((a,b)=>b.score-a.score||b.correct-a.correct);
   const draw=players[0].score===players[1].score&&players[0].correct===players[1].correct;
   const win=players[0]?.id===status.me;
   html+='<h3>🏆 대결 종료!</h3>'+
    '<img class="mb-duel-result-hero" alt="'+(draw?'무승부':win?'승리한 선비':'패배한 선비')+
    '" src="'+(win&&!draw?'/ui-assets/duel-winner.webp':'/ui-assets/duel-loser.webp')+
    '" onerror="this.onerror=null;this.src=\'/ui-assets/mascot-character.png\'">'+
    '<p class="mb-duel-result '+(win&&!draw?'good':'bad')+'">'+(draw?'🤝 무승부!':win?'🎉 승리!':'⚔ 다음에는 승리해 보자!')+
    '</p><p>최종 결과: '+esc(players[0].name)+' '+players[0].score+'점 / '+esc(players[1].name)+' '+players[1].score+'점</p>';
  }
  html+='<footer class="mb-duel-footer">'+emotePalette()+
   '<div class="mb-duel-round-indicator">ROUND '+Math.min(qidx+1,count())+' / '+count()+'</div>'+
   '<div class="mb-duel-footer-actions"><button id="mb-duel-new" type="button" aria-label="1대1 방 설정으로 이동">방 설정</button>'+
   '<button id="mb-duel-emoji-toggle" type="button" aria-expanded="false">이모티콘</button>'+
   '<button id="mb-duel-exit" type="button">나가기</button></div></footer>'+
   '<p id="mb-duel-info" class="mb-duel-note" role="status">대결은 서버에서 채점돼. 동일한 문제를 각자 풀어!</p></div>';
  putHTML(html);
  if(newPhase==='waiting'&&status.publicRoom){
   lastChatPoll=0;loadChat();
   dialog.querySelector('#mb-public-ready')?.addEventListener('click',async event=>{
    const button=event.currentTarget;button.disabled=true;
    const ready=status.lobbyReady||{},mine=status.role==='host'?ready.host:ready.guest;
    try{await api({action:'lobbyReady',code:roomCode,ready:!mine});lastViewKey='';await updateRoom()}
    catch(e){showError(e.message)}finally{if(button.isConnected)button.disabled=false}
   });
   dialog.querySelector('#mb-public-start')?.addEventListener('click',async()=>{
    try{await api({action:'lobbyStart',code:roomCode});lastViewKey='';await updateRoom()}
    catch(e){showError(e.message)}
   });
   dialog.querySelector('#mb-public-chatform')?.addEventListener('submit',async e=>{
    e.preventDefault();const input=dialog.querySelector('#mb-public-chattext');if(!input)return;
    const message=input.value.trim();if(!message)return;
    try{await api({action:'chat',code:roomCode,message});input.value='';await loadChat()}
    catch(e){showError(e.message)}
   });
   dialog.querySelectorAll('[data-public-emoji]').forEach(btn=>btn.addEventListener('click',async()=>{
    try{await api({action:'chat',code:roomCode,message:btn.dataset.publicEmoji});await loadChat()}
    catch(e){showError(e.message)}
   }));
  }
  renderRemoteEmote();
  updateOpponentSignal();
  refreshReview();
  dialog.querySelector('#mb-duel-next-ready')?.addEventListener('click',sendReady);
  dialog.querySelector('#mb-duel-copy')?.addEventListener('click',async()=>{
   try{await navigator.clipboard.writeText(roomCode);showError('방 코드가 복사됐어.')}catch(_){showError('복사가 제한됐어. 위 코드를 직접 알려 줘.')}
  });
  dialog.querySelector('#mb-duel-new')?.addEventListener('click',showLobby);
  dialog.querySelector('#mb-duel-exit')?.addEventListener('click',showLobby);
  dialog.querySelector('#mb-duel-emoji-toggle')?.addEventListener('click',()=>{
   const palette=dialog.querySelector('.mb-duel-emotes');if(!palette)return;
   palette.classList.toggle('mb-duel-emotes-expanded');
   dialog.querySelector('#mb-duel-emoji-toggle')?.setAttribute('aria-expanded',String(palette.classList.contains('mb-duel-emotes-expanded')));
  });
  dialog.querySelectorAll('[data-duel-answer]').forEach(btn=>btn.addEventListener('click',()=>sendAnswer(btn.dataset.duelAnswer)));
  dialog.querySelector('#mb-duel-written-form')?.addEventListener('submit',e=>{
   e.preventDefault();sendAnswer(dialog.querySelector('#mb-duel-written-answer')?.value||'');
  });
 }
 async function sendReady(){
  if(busy||!newReview()||phase!=='review'||!status?.answerTicket)return;
  const info=reviewInfo();
  if(!info||info.readyAt||!info.own)return;
  const room=roomCode,round=info.index;
  busy=true;
  const button=dialog.querySelector('#mb-duel-next-ready');
  if(button)button.disabled=true;
  try{
   const out=await api({action:'ready',code:room,index:round,
    answerTicket:status.answerTicket});
   if(!dialog.open||roomCode!==room)return;
   const me=status.players.find(p=>p.id===status.me);
   const mine=lastAnswer(me,round);
   if(!mine)return;
   mine.readyAt=out.readyAt;
   status.reviewReadyAt=out.readyAt;
   const other=lastOpponentSignal?.answers?.find(a=>a.index===round);
   const opponent=status.players.find(p=>p.id!==status.me);
   const otherAnswer=other||((opponent?.answered||0)>round
    ?{at:opponent.lastAt,readyAt:status.opponentReviewReadyAt}:null);
   if(otherAnswer&&me.answered<=opponent.answered){
    if(me.answered>=count()){
     status.finalReviewEndsAt=reviewTurnAt(mine,otherAnswer);
    }else{
     status.turnReady=true;
     status.turnStartsAt=reviewTurnAt(mine,otherAnswer);
    }
   }
   showGame();
  }catch(e){
   const label=dialog.querySelector('#mb-duel-review-status');
   if(label)label.textContent='동의 전송 실패: '+e.message;
  }finally{
   busy=false;
   refreshReview();
  }
 }
 async function sendAnswer(answer){
  if(busy||!roomCode||!status?.ready||!status.turnReady)return;
  const me=status.players.find(x=>x.id===status.me);
  const opponent=status.players.find(x=>x.id!==status.me);
  if(!me||!opponent||me.answered>opponent.answered||
     me.answered>=count()||now()<status.turnStartsAt)return;
  busy=true;
  const activeOption=[...dialog.querySelectorAll('[data-duel-answer]')].find(x=>x.dataset.duelAnswer===answer);
  if(activeOption)activeOption.classList.add('mb-answer-pending');
  dialog.querySelectorAll('[data-duel-answer],#mb-duel-written-form button,#mb-duel-written-answer').forEach(b=>b.disabled=true);
  try{
   const out=await api({action:'answer',code:roomCode,index:me.answered,answer,
    answerTicket:status.answerTicket||undefined});
   feedback=out;feedbackUntil=Date.now()+1050;lastViewKey='';
   // Use the server response for the local score immediately, no extra round-trip.
   me.answered=out.index+1;
   me.score+=out.points;
   if(out.correct)me.correct++;
   me.lastAt=out.at||Date.now();
   status.reviewReadyAt=null;
   status.opponentReviewReadyAt=null;
   if(!Array.isArray(me.answers))me.answers=[];
   if(!me.answers.some(x=>x.index===out.index))
    me.answers.push({index:out.index,at:me.lastAt,correct:out.correct,points:out.points});
   // If the opponent already chose, both clients can open the next turn
   // immediately without waiting for the next full multi-Blob refresh.
   const opponentNow=status.players.find(x=>x.id!==status.me);
   if(opponentNow&&me.answered<=opponentNow.answered&&me.answered<count()){
    const index=me.answered-1;
    const theirs=lastOpponentSignal?.answers?.find(x=>x.index===index)?.at||
     opponentNow.lastAt;
    if(theirs){
     status.turnReady=true;
     const theirAnswer=lastOpponentSignal?.answers?.find(x=>x.index===index)||
      {at:theirs};
     status.opponentReviewReadyAt=Number(theirAnswer.readyAt)||null;
     status.turnStartsAt=newReview()
      ?reviewTurnAt(lastAnswer(me,index),theirAnswer)
      :Math.max(me.lastAt,theirs)+1500;
    }else{
     status.turnReady=false;status.turnStartsAt=null;
    }
   }else{
    status.turnReady=false;
    status.turnStartsAt=null;
   }
   status.opponentAnswered=!!opponentNow&&opponentNow.answered>me.answered;
   status.opponentAnsweredAt=status.opponentAnswered?opponentNow.lastAt:null;
   status.finished=status.players.every(p=>p.answered>=count());
   if(status.finished&&newReview()){
    const ours=lastAnswer(me,count()-1);
    const theirs=lastOpponentSignal?.answers?.find(a=>a.index===count()-1);
    if(ours&&theirs)status.finalReviewEndsAt=reviewTurnAt(ours,theirs);
   }
   showGame();
  }catch(e){lastViewKey='';showError('답변 처리 실패: '+e.message);await updateRoom()}finally{
   busy=false;if(activeOption?.isConnected)activeOption.classList.remove('mb-answer-pending');
   if(phase==='question')dialog.querySelectorAll('[data-duel-answer],#mb-duel-written-form button,#mb-duel-written-answer').forEach(b=>b.disabled=false);
  }
 }
 let chatBusy=false,lastChatPoll=0;
 async function loadChat(){
  if(chatBusy||!dialog.open||!roomCode||!status?.publicRoom||phase!=='waiting')return;
  chatBusy=true;lastChatPoll=Date.now();const code=roomCode;
  try{
   const res=await fetch('/api/duel?chat='+encodeURIComponent(code),{credentials:'same-origin'});
   const data=await res.json();if(!res.ok)throw Error(data.error||'채팅을 불러오지 못했어.');
   if(code!==roomCode)return;
   const view=dialog.querySelector('#mb-public-chatlog');if(!view)return;
   const html=(data.messages||[]).map(m=>'<div><strong>'+esc(m.name||'플레이어')+':</strong> '+esc(m.message||'')+'</div>').join('')||'<p>아직 메시지가 없어. 먼저 인사해 봐!</p>';
   if(view.innerHTML!==html)view.innerHTML=html;
   view.scrollTop=view.scrollHeight;
  }catch(e){const view=dialog.querySelector('#mb-public-chatlog');if(view&&!view.children.length)view.textContent=e.message}
  finally{chatBusy=false}
 }
 function tick(){
  if(dialog.open&&roomCode&&Date.now()-lastHeartbeat>6100)heartbeat();
  if(!dialog.open||!roomCode||!status||document.hidden)return;
  if(phase==='waiting'&&status.publicRoom&&Date.now()-lastChatPoll>2800)loadChat();
  if(recentRemoteEmote&&Date.now()-recentRemoteEmote.received>=2900){
   recentRemoteEmote=null;renderRemoteEmote();
  }
  if(phase==='countdown'){
   const left=Math.max(0,Math.ceil((status.turnStartsAt-now())/1000));
   const el=dialog.querySelector('#mb-duel-countdown');
   if(el&&el.textContent!==left+'초 뒤에 시작...')el.textContent=left+'초 뒤에 시작...';
   if(left<=0){lastViewKey='';showGame()}
  }else if(phase==='question'){
   const ms=remaining(),el=dialog.querySelector('#mb-duel-clock');
   if(el){el.textContent='⏱ '+(ms/1000).toFixed(1)+'초';el.classList.toggle('low',ms<7000);el.classList.toggle('mb-duel-rival-fast',!!status.opponentAnswered)}
   updateOpponentSignal();
   if(ms<=0&&!busy)sendAnswer('');
  }else if(phase==='review'){
   refreshReview();
   const done=status?.players?.find(p=>p.id===status.me)?.answered>=count();
   const end=done?status.finalReviewEndsAt:status.turnStartsAt;
   if(end&&now()>=end){lastViewKey='';feedback=null;showGame()}
  }else if(phase==='feedback'&&Date.now()>=feedbackUntil){lastViewKey='';feedback=null;showGame()}
 }
 // Fast opponent signals are deliberately small and serial (no overlapping
 // requests); full room state is reconciled much less often.
 function signalDelay(){
  if(!dialog.open||!roomCode||document.hidden)return 1400;
  if(signalFailures>3)return 2600;
  if(phase==='question'||phase==='opponent')return 440;
  if(phase==='review'||phase==='countdown'||phase==='feedback')return 660;
  if(phase==='waiting')return 900;
  if(phase==='finished')return 950;
  return 2200;
 }
 function fullDelay(){
  if(!dialog.open||!roomCode||document.hidden)return 4000;
  if(status?.signalTicket&&signalFailures<2)
   return phase==='results'?14000:6500;
  return phase==='waiting'?1000:1300;
 }
 async function backgroundPoll(){
  if(dialog.open&&roomCode&&!document.hidden&&!busy)await updateRoom();
  fullTimer=setTimeout(backgroundPoll,fullDelay());
 }
 async function signalPoll(){
  if(dialog.open&&roomCode&&!document.hidden&&!busy)await checkSignal();
  fastTimer=setTimeout(signalPoll,signalDelay());
 }
 let fullTimer=setTimeout(backgroundPoll,900);
 let fastTimer=setTimeout(signalPoll,520);
 window.addEventListener('pagehide',()=>{
  reportLeave();clearTimeout(fullTimer);clearTimeout(fastTimer);
 },{once:true});
 setInterval(tick,210);
 // Public-room browser is a separate module; route joined games here.
 window.mbDuelEnterRoom=async code=>{
  if(!dialog.open)dialog.showModal();
  await enterRoom(code);
 };
})();
