(()=>{
 'use strict';
 if(window.__munbubUIPatchV3)return;
 window.__munbubUIPatchV3=true;
 const s=document.createElement('style');
 s.id='munbub-responsive-v3';
 s.textContent="\n/* Responsive home and typography: one scoped override layer, v3 */\n#homeScreen .home-main{display:flex;flex-direction:column;align-items:stretch;gap:0;width:100%;max-width:none;min-width:0;overflow:visible;padding:clamp(12px,1.5vw,24px) clamp(12px,2vw,30px) 30px}\n#homeScreen .home-hero{order:0;height:clamp(115px,12.5vw,192px);min-height:0;max-width:920px;width:100%;margin:0 auto;overflow:visible}\n#homeScreen .hero-scroll{max-height:90%;top:3%;left:2%;width:60%}\n#homeScreen .hero-character{max-height:103%;width:40%;bottom:-4px;right:2%}\n#homeScreen .progress-panel{order:1;align-self:center;width:min(100%,850px);max-width:100%;margin:3px auto 12px;padding:8px 14px}\n#homeScreen .progress-mobile{display:none!important}\n#homeScreen .resume-group{order:2;width:100%;max-width:860px;min-width:0;display:flex;justify-content:center;align-self:center;margin:0 auto 9px}\n#resumeHotspot,#mobileResume{box-sizing:border-box!important;display:block;width:min(100%,600px)!important;max-width:600px!important;height:auto!important;min-height:0!important;aspect-ratio:660/162!important;position:relative;overflow:hidden;background:transparent url('./ui-assets/resume.png') center/contain no-repeat!important;border:0!important;box-shadow:none!important;padding:0!important;color:transparent!important;font-size:0!important;cursor:pointer;transition:transform .16s,filter .16s}\n#resumeHotspot[hidden],#mobileResume[hidden]{display:none!important}\n#mobileResume:not([hidden]){display:none!important}\n#resumeHotspot:not([hidden]){display:block!important}\n#homeScreen .timed-home-wrap{order:3;align-self:center;display:block;width:min(100%,1050px);max-width:100%;margin:3px auto 14px!important;min-width:0}\n#homeScreen .timed-home-btn{display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:center!important;gap:clamp(6px,1.5vw,24px)!important;width:100%!important;max-width:none!important;min-width:0!important;height:auto!important;min-height:clamp(78px,7.6vw,112px)!important;aspect-ratio:auto!important;margin:0!important;padding:clamp(9px,1.5vw,18px) clamp(10px,2vw,26px)!important;box-sizing:border-box!important;color:#2c1817!important;text-indent:0!important;font-size:clamp(17px,2.65vw,39px)!important;line-height:1.2!important;font-weight:900!important;word-break:keep-all;border:clamp(4px,.5vw,7px) double #bd896e!important;border-radius:clamp(13px,2vw,23px)!important;background:linear-gradient(180deg,#ffebd4 0%,#f3d0ad 100%)!important;box-shadow:inset 0 0 0 3px #fff7e9,0 7px 0 #351c20,0 11px 0 #180f13!important;white-space:normal!important;overflow:visible!important;isolation:isolate}\n#homeScreen .timed-home-btn::before{content:\"⏱\";display:inline-grid;place-items:center;flex:0 0 auto;font-size:clamp(25px,3.8vw,54px);width:clamp(36px,5.2vw,70px);height:clamp(36px,5.2vw,70px);border-right:3px solid #c08a75;padding-right:clamp(4px,1vw,17px);color:#713d35}\n#homeScreen .timed-home-btn span{display:inline!important;color:#3c2321!important;opacity:1!important;flex:0 1 auto;min-width:0;font-size:clamp(12px,1.65vw,24px)!important;font-weight:750!important;line-height:1.25!important;text-align:center;padding-left:clamp(5px,1vw,17px);border-left:3px solid #c48b74}\n#homeScreen .home-card-grid{order:4;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(8px,1.5vw,22px);align-items:start;width:100%;max-width:1080px;margin:0 auto;isolation:auto}\n#homeScreen .home-card-grid .img-button{width:100%;max-width:100%;min-width:0;display:block;overflow:visible;align-self:start}\n#homeScreen .home-card-grid .img-button img{display:block;object-fit:contain;width:100%;height:auto;max-height:clamp(145px,21vw,300px)}\n#homeScreen .home-actions{order:5;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(8px,1.5vw,22px);width:100%;max-width:1080px;margin:12px auto 0}\n#homeScreen .home-actions .img-button{width:100%;min-width:0}\n#homeScreen .home-actions img{display:block;width:100%;height:auto;max-height:94px;object-fit:contain}\n#homeScreen .home-foot{order:6;position:static;margin-top:12px;line-height:1.5}\n#homeScreen .timed-home-btn:hover,#resumeHotspot:hover,#mobileResume:hover{transform:translateY(-2px) scale(1.015)!important;filter:brightness(1.05)!important}\n#homeScreen .timed-home-btn:active,#resumeHotspot:active,#mobileResume:active{transform:translateY(1px) scale(.985)!important}\n#homeScreen .timed-home-btn:focus-visible,.timed-nav:focus-visible,#resumeHotspot:focus-visible,#mobileResume:focus-visible{outline:3px solid #ffdfb0!important;outline-offset:3px}\n.sidebar-nav .timed-nav{box-sizing:border-box!important;display:block!important;width:100%!important;max-width:100%!important;min-height:44px!important;height:auto!important;aspect-ratio:420/122!important;margin:1px 0!important;padding:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent url('./ui-assets/timed_sidebar_new.png') center/contain no-repeat!important;color:transparent!important;font-size:0!important;line-height:0!important;overflow:hidden!important;cursor:pointer!important;appearance:none!important;-webkit-appearance:none!important;transition:transform .16s ease,filter .16s ease}\n\n.sidebar-nav .timed-nav:hover{transform:scale(1.035)!important;filter:brightness(1.12)}\n.sidebar-nav .timed-nav:active{transform:scale(.985)!important;filter:brightness(.96)}\n/* Large-text mode changes real text (not the decorative PNG labels). */\nbody.large-text .panel{font-size:18px!important}\nbody.large-text :is(.panel h2,.panel h3){font-size:clamp(23px,2.5vw,32px)!important}\nbody.large-text :is(.lead,.panel p,.history-item,.note-row,.feedback,.note-row p,.form-grid label,.quiz-meta,.app-caption,.prompt-desc){font-size:clamp(17px,1.75vw,20px)!important;line-height:1.7!important}\nbody.large-text .prompt{font-size:clamp(27px,3.25vw,43px)!important;line-height:1.6!important}\nbody.large-text .option{font-size:clamp(20px,2.15vw,25px)!important;line-height:1.5!important}\nbody.large-text :is(.action,.go-home,.essay-form input,.search,.form-grid input,.form-grid select,.form-grid select option){font-size:clamp(17px,1.85vw,22px)!important}\nbody.large-text :is(.work-header h1,.summary,.fb-title){font-size:clamp(26px,2.6vw,35px)!important}\nbody.large-text :is(.history-item small,.note-row small,.app-caption){font-size:16px!important}\n#fontNormal[aria-pressed=\"true\"],#fontLarge[aria-pressed=\"true\"]{outline:3px solid #8c5047;box-shadow:inset 0 0 0 2px #fff5dd}\n/* Tablet: no fixed-width desktop frame overflow */\n@media(max-width:1100px){\n #homeScreen .home-main{width:100%;max-width:900px;margin:auto;padding:10px max(12px,env(safe-area-inset-left)) calc(104px + env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-right))}\n #homeScreen .home-hero{height:clamp(130px,23vw,220px)}\n #homeScreen .progress-panel:not(.progress-mobile){display:none!important}\n #homeScreen .progress-mobile{display:block!important}\n #homeScreen .resume-group>#resumeHotspot{display:none!important}\n #homeScreen #mobileResume:not([hidden]){display:block!important;width:min(100%,560px)!important;margin:0 auto!important}\n #homeScreen .home-card-grid,#homeScreen .home-actions{max-width:800px;gap:clamp(8px,1.4vw,18px)}\n #homeScreen .timed-home-wrap{max-width:800px}\n #homeScreen .timed-home-btn{font-size:clamp(20px,3vw,30px)!important;min-height:92px!important}\n #homeScreen .timed-home-btn span{font-size:clamp(12px,2.05vw,20px)!important}\n .work-main{max-width:950px!important;min-width:0}\n}\n@media(max-width:600px){\n #homeScreen .home-hero{height:clamp(110px,30vw,170px)}\n #homeScreen .hero-scroll{width:68%;top:10%;left:-2%}\n #homeScreen .hero-character{width:45%;right:0;max-height:96%}\n #homeScreen .home-card-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}\n #homeScreen .home-card-grid .img-button:last-child{grid-column:1/-1;width:min(58%,215px);margin:auto}\n #homeScreen .home-actions{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}\n #homeScreen .home-actions .img-button:last-child{grid-column:1/-1;width:min(58%,215px);margin:auto}\n #homeScreen .timed-home-btn{min-height:78px!important;padding:10px!important;gap:7px!important;border-width:4px!important}\n #homeScreen .timed-home-btn::before{font-size:27px;width:35px;height:38px;padding-right:4px;border-right-width:2px}\n #homeScreen .timed-home-btn span{font-size:12px!important;padding-left:6px;border-left-width:2px}\n #homeScreen .timed-home-btn{font-size:clamp(16px,4.2vw,23px)!important}\n #homeScreen .home-foot{text-align:center}\n body.large-text .prompt{font-size:clamp(25px,6.5vw,33px)!important}\n body.large-text .option{font-size:clamp(18px,5vw,23px)!important}\n body.large-text :is(.panel p,.lead,.history-item,.note-row,.feedback,.form-grid label,.app-caption){font-size:17px!important}\n}\n@media(max-width:360px){\n #homeScreen .timed-home-btn span{font-size:11px!important}\n #homeScreen .home-card-grid .img-button:last-child,#homeScreen .home-actions .img-button:last-child{width:62%}\n}\n@media(hover:none){#homeScreen .timed-home-btn:hover,#resumeHotspot:hover,#mobileResume:hover{transform:none!important;filter:none!important}}\n@media(prefers-reduced-motion:reduce){#homeScreen .timed-home-btn,#resumeHotspot,#mobileResume{transition:none!important}}\n.munbub-timed-dialog{border:4px double #86584a;border-radius:16px;box-shadow:0 12px 0 #2b191a,0 24px 54px #0008;background:#f5dfc6;color:#392221;width:min(440px,calc(100vw - 32px));max-width:95vw;padding:22px;text-align:center}\n.munbub-timed-dialog::backdrop{background:#1d1118bd}\n.munbub-timed-dialog h2{margin:0 0 12px;font-size:1.5rem}\n.munbub-timed-dialog p{margin:0 0 18px}\n.munbub-timed-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}\n.munbub-timed-grid button,.munbub-timed-close{font:inherit;font-weight:900;border:2px solid #8f624f;color:#3f2821;background:#ffe9cc;min-height:49px;border-radius:8px;padding:12px}\n.munbub-timed-grid button:hover,.munbub-timed-close:hover{background:#fff9eb}\n.munbub-timed-close{margin-top:14px;width:100%}\n";
 document.head.append(s);
 for(const b of document.querySelectorAll('.sidebar-nav .timed-nav')){
  b.setAttribute('aria-label','시간제한');
  b.setAttribute('title','시간제한 도전');
  if(!b.querySelector('img')){
   const picture=document.createElement('img');
   picture.src='./ui-assets/timed_sidebar_new.png';
   picture.alt='';
   picture.setAttribute('aria-hidden','true');
   picture.decoding='async';
   picture.addEventListener('error',()=>{
    b.classList.add('mb-timed-fallback');
    b.textContent='⏱ 시간제한';
   },{once:true});
   b.replaceChildren(picture);
  }
 }
 const normal=document.getElementById('fontNormal'),large=document.getElementById('fontLarge');
 if(normal)normal.textContent='작은 글씨';
 const updateFontButtons=()=>{
  const big=document.body.classList.contains('large-text');
  normal?.setAttribute('aria-pressed',String(!big));
  large?.setAttribute('aria-pressed',String(big));
 };
 normal?.addEventListener('click',updateFontButtons);
 large?.addEventListener('click',updateFontButtons);
 updateFontButtons();
 const dialog=document.createElement('dialog');
 dialog.className='munbub-timed-dialog';
 dialog.setAttribute('aria-label','시간제한 도전 시간 선택');
 dialog.innerHTML='<h2>⏱ 시간제한 도전</h2><p>도전할 시간을 선택해 주세요.</p><div class="munbub-timed-grid"><button type="button" data-seconds="60">1분</button><button type="button" data-seconds="120">2분</button><button type="button" data-seconds="180">3분</button><button type="button" data-seconds="300">5분</button></div><button type="button" class="munbub-timed-close">돌아가기</button>';
 document.body.append(dialog);
 document.addEventListener('click',e=>{
  const button=e.target.closest?.('button[data-route="timed"]');
  if(!button)return;
  e.preventDefault();e.stopImmediatePropagation();
  if(typeof window.openModeSetup==='function'){window.openModeSetup('timed');return;}
  if(typeof dialog.showModal==='function'&&!dialog.open)dialog.showModal();
 },true);
 dialog.addEventListener('click',e=>{
  const choice=e.target.closest?.('button[data-seconds]');
  if(choice){
   const seconds=Number(choice.dataset.seconds);
   if(![60,120,180,300].includes(seconds))return;
   dialog.close();
   if(typeof window.startSession==='function')window.startSession({category:'all',style:'mixed',count:'all',infinite:true,onlyWrong:false,timed:true,timeSeconds:seconds});
  }else if(e.target.closest?.('.munbub-timed-close'))dialog.close();
 });

 // A single extra style layer follows the existing responsive patch (no duplicated overrides).
 const v4=document.createElement('style');
 v4.id='munbub-application-touch-v4';
 v4.textContent="\n/* v4: application-topic choices, Candy-pop touch response and viewport-safe layouts */\n#applicationTopicWrap{grid-column:1/-1;min-width:0;margin:0;padding:13px 14px 15px;border:3px solid #a77562;border-radius:15px;background:#fff0dc;box-shadow:inset 0 0 0 3px #ffe8cb,0 4px 0 #d3ae96}\n#applicationTopicWrap legend{padding:0 10px;color:#54332b;font-weight:950;font-size:clamp(14px,1.6vw,18px)}\n.application-topic-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}\n.form-grid .application-topic-option{position:relative;display:flex!important;flex-direction:row!important;justify-content:center;align-items:center;gap:6px!important;text-align:center;min-width:0;min-height:60px;padding:8px 7px;cursor:pointer;user-select:none;-webkit-user-select:none;border:2px solid #b98c75;border-radius:11px;background:#fae5ca;box-shadow:0 4px 0 #9d6c58,inset 0 2px #fff7e6;color:#49312e;font-size:clamp(12px,1.25vw,16px)!important;font-weight:900;line-height:1.25;word-break:keep-all;touch-action:manipulation;transition:background .14s,box-shadow .14s,filter .14s,transform .14s}\n.form-grid .application-topic-option input[type=radio]{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;opacity:0!important;cursor:pointer!important;margin:0!important;padding:0!important;z-index:1}\n.form-grid .application-topic-option .application-topic-icon{display:inline-grid;place-items:center;flex:none;width:30px;height:30px;border-radius:8px;background:#f5cba4;color:#603c33;font-size:20px;line-height:1;font-weight:900}\n.form-grid .application-topic-option:has(input:checked){background:#3e292e;color:#ffe7cb;box-shadow:0 4px 0 #1c1216,inset 0 0 0 2px #efc69e;border-color:#f0bf8f}\n.form-grid .application-topic-option:has(input:checked) .application-topic-icon{background:#f9d3ac;color:#3f292a}\n.form-grid .application-topic-option:has(input:focus-visible){outline:4px solid #e28b5a;outline-offset:4px}\n@media(hover:hover){.form-grid .application-topic-option:hover{filter:brightness(1.06);transform:translateY(-2px)}}\n.munbub-pop-ring,.munbub-pop-star{position:fixed;left:0;top:0;pointer-events:none!important;z-index:2147483000;will-change:transform,opacity;transform:translate(-50%,-50%)}\n.munbub-pop-ring{width:54px;height:54px;border-radius:50%;border:5px solid #ffe3a1;box-shadow:0 0 0 3px #9f5a56,0 0 13px #ffc87a88;animation:munbub-ring .40s ease-out forwards}\n.munbub-pop-star{font-size:clamp(15px,2.5vw,25px);line-height:1;font-weight:900;text-shadow:1px 2px 0 #4c2826;animation:munbub-star .54s cubic-bezier(.1,.74,.4,1) forwards}\n@keyframes munbub-ring{from{transform:translate(-50%,-50%) scale(.16);opacity:.95}to{transform:translate(-50%,-50%) scale(1.7);opacity:0}}\n@keyframes munbub-star{0%{transform:translate(-50%,-50%) scale(.3) rotate(-25deg);opacity:1}65%{opacity:1}100%{transform:translate(calc(-50% + var(--pop-x)),calc(-50% + var(--pop-y))) scale(.65) rotate(var(--pop-rot));opacity:0}}\n@media(max-width:1100px){\n html,body{max-width:100%;overflow-x:clip}\n #homeScreen .home-main,#workspace .work-main{box-sizing:border-box;min-width:0;width:100%;margin-inline:auto}\n #workspace .work-main{max-width:940px!important;padding-left:max(14px,env(safe-area-inset-left))!important;padding-right:max(14px,env(safe-area-inset-right))!important;padding-bottom:calc(112px + env(safe-area-inset-bottom))!important}\n #homeScreen .home-main{padding-left:max(12px,env(safe-area-inset-left))!important;padding-right:max(12px,env(safe-area-inset-right))!important;padding-bottom:calc(110px + env(safe-area-inset-bottom))!important}\n #workspace .panel,#workspace .view,#workspace .form-grid{min-width:0;max-width:100%}\n .mobile-bottom{box-sizing:border-box;padding-bottom:env(safe-area-inset-bottom)!important}\n .mobile-bottom button{touch-action:manipulation;min-height:52px}\n}\n@media(min-width:601px) and (max-width:1100px){\n #homeScreen .home-card-grid,#homeScreen .home-actions{grid-template-columns:repeat(3,minmax(0,1fr))!important;max-width:900px}\n #homeScreen .home-card-grid .img-button:last-child,#homeScreen .home-actions .img-button:last-child{grid-column:auto;width:100%}\n #workspace .form-grid{grid-template-columns:repeat(2,minmax(0,1fr))}\n}\n@media(max-width:600px){\n #homeScreen .home-hero{height:clamp(112px,29vw,168px)}\n #homeScreen .home-card-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;max-width:440px}\n #homeScreen .home-card-grid .img-button:last-child{grid-column:1/-1;width:min(58%,215px);margin:auto}\n #homeScreen .home-actions{grid-template-columns:repeat(2,minmax(0,1fr))!important;max-width:440px}\n #homeScreen .home-actions .img-button:last-child{grid-column:1/-1;width:min(58%,215px);margin:auto}\n #workspace .form-grid,#workspace .option-list{grid-template-columns:minmax(0,1fr)!important}\n .application-topic-options{grid-template-columns:repeat(2,minmax(0,1fr))}\n .application-topic-option:last-child{grid-column:1/-1}\n .form-grid .application-topic-option{min-height:53px;font-size:14px!important}\n #workspace .work-main{padding-top:15px!important}\n #workspace .work-header{gap:8px}\n #workspace .work-header h1{font-size:clamp(19px,5vw,27px)}\n #workspace .panel{padding:clamp(12px,3.7vw,21px)}\n #workspace .option{min-width:0;min-height:62px;overflow-wrap:anywhere}\n}\n@media(max-width:360px){\n #applicationTopicWrap{padding:10px 8px}\n .application-topic-options{gap:7px}\n .form-grid .application-topic-option{font-size:12px!important;gap:3px!important;padding:6px 4px}\n .form-grid .application-topic-option .application-topic-icon{width:25px;height:25px;font-size:17px}\n}\n@media(max-height:530px) and (orientation:landscape) and (max-width:1100px){\n #homeScreen .home-main,#workspace .work-main{padding-top:8px!important}\n #homeScreen .home-main{padding-bottom:calc(75px + env(safe-area-inset-bottom))!important}\n #workspace .work-main{padding-bottom:calc(80px + env(safe-area-inset-bottom))!important}\n #homeScreen .home-hero{height:clamp(100px,28svh,155px)}\n .mobile-bottom button{min-height:43px}\n}\n@media(prefers-reduced-motion:reduce){\n .munbub-pop-ring,.munbub-pop-star{display:none!important;animation:none!important}\n .form-grid .application-topic-option{transition:none!important}\n}";
 document.head.append(v4);

 // V5 interaction layer. Earlier responsive rules are retained; all new
 // behavior is registered here once, rather than stacking competing handlers.
 const v5=document.createElement('style');
 v5.id='munbub-interaction-v5';
 v5.textContent=`
 /* Selected menu: pressed/darker, not highlighted/brighter. */
 .sidebar-nav .navbtn.active,.sidebar-nav .timed-nav.active{
   filter:brightness(.66) saturate(.86) drop-shadow(0 2px 2px #1c1016)!important;
   background:rgba(26,14,20,.21)!important;
   box-shadow:inset 0 0 0 2px #efc99c7a!important;
   transform:scale(.992)!important;
   z-index:1;
 }
 .sidebar-nav .navbtn.active:hover{filter:brightness(.75) saturate(.9) drop-shadow(0 4px 3px #180c14)!important;transform:scale(1.02)!important}
 /* Match all other menu buttons: settings now visibly grows on hover. */
 @media(hover:hover) and (pointer:fine){
  .sidebar-nav .navbtn[data-route="settings"]:not(.active):hover,
  #homeScreen .sidebar-nav .navbtn[data-route="settings"]:hover,
  #workspace .sidebar-nav .navbtn[data-route="settings"]:not(.active):hover{
    transform:scale(1.065)!important;filter:brightness(1.13) drop-shadow(0 5px 5px #0007)!important;z-index:4;
  }
 }
 /* Press animation also works on touchscreens (where :hover is unreliable). */
 button.mb-pressing,.img-button.mb-pressing,.navbtn.mb-pressing,.application-topic-option.mb-pressing{
   transform:scale(.955)!important;filter:brightness(1.16) saturate(1.06)!important;
   transition:transform .10s cubic-bezier(.2,.8,.2,1),filter .10s ease!important;
 }
 .sidebar-nav .navbtn.active.mb-pressing{transform:scale(.965)!important;filter:brightness(.8)!important}
 .mb-tap-burst{position:fixed;left:0;top:0;pointer-events:none!important;z-index:2147483000;width:0;height:0;contain:layout style;isolation:isolate}
 .mb-tap-halo,.mb-tap-core,.mb-tap-spark{position:absolute;left:0;top:0;pointer-events:none;transform:translate(-50%,-50%)}
 .mb-tap-halo{width:72px;height:72px;border-radius:50%;border:4px solid #ffe0ab;box-shadow:0 0 0 2px #995b53aa,0 0 20px #ffe4b177;animation:mb-halo .42s ease-out both}
 .mb-tap-core{width:15px;height:15px;border-radius:50%;background:#fff8db;box-shadow:0 0 0 3px #f2af87a6;animation:mb-core .34s ease-out both}
 .mb-tap-spark{width:9px;height:9px;background:var(--mb-spark-color,#f1b78b);border:1px solid #fff5d9;box-shadow:1px 1px 0 #71463a85;clip-path:polygon(50% 0,67% 33%,100% 50%,67% 67%,50% 100%,33% 67%,0 50%,33% 33%);animation:mb-spark .48s cubic-bezier(.15,.66,.3,1) both}
 @keyframes mb-halo{0%{opacity:1;transform:translate(-50%,-50%) scale(.15)}65%{opacity:.8}100%{opacity:0;transform:translate(-50%,-50%) scale(1.65)}}
 @keyframes mb-core{0%{opacity:1;transform:translate(-50%,-50%) scale(.5)}100%{opacity:0;transform:translate(-50%,-50%) scale(2.1)}}
 @keyframes mb-spark{0%{opacity:1;transform:translate(-50%,-50%) scale(.3) rotate(0)}70%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--sx)),calc(-50% + var(--sy))) scale(.8) rotate(125deg)}}
 /* Range-driven reading size: PNG menu labels are deliberately untouched. */
 #workspace :is(.panel,.view){overflow-wrap:break-word}
 #workspace .panel{font-size:calc(16px * var(--mb-text-scale,1))!important;line-height:1.55}
 #workspace :is(.panel p,.lead,.history-item,.note-row,.feedback,.form-grid label,.quiz-meta,.app-caption,.prompt-desc,.empty){font-size:calc(15.5px * var(--mb-text-scale,1))!important;line-height:1.65!important}
 #workspace :is(.panel h2,.panel h3){font-size:calc(24px * var(--mb-text-scale,1))!important;line-height:1.3!important}
 #workspace .prompt{font-size:calc(clamp(25px,2.7vw,35px) * var(--mb-text-scale,1))!important;line-height:1.5!important}
 #workspace .option{font-size:calc(19px * var(--mb-text-scale,1))!important;line-height:1.42!important;min-width:0;white-space:normal}
 #workspace :is(.action,.go-home,.essay-form input,.form-grid input,.form-grid select,.search,.form-grid select option){font-size:calc(16px * var(--mb-text-scale,1))!important}
 #workspace :is(.work-header h1,.summary,.fb-title){font-size:calc(26px * var(--mb-text-scale,1))!important}
 #workspace :is(.history-item small,.note-row small){font-size:calc(13px * var(--mb-text-scale,1))!important}
 .mb-font-range{margin:13px 0 17px;padding:14px 16px;background:#fff0de;border:2px solid #c49a80;border-radius:12px;color:#46302a}
 .mb-font-range label{display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;font-weight:900;align-items:center}
 .mb-font-range output{font-variant-numeric:tabular-nums;font-weight:900;color:#66362f}
 .mb-font-range input{display:block;width:100%;margin:13px 0 4px;accent-color:#8f6150;min-height:24px;touch-action:pan-x}
 .mb-font-range .mb-font-preview{font-size:calc(15px * var(--mb-text-scale,1));margin:9px 0 0;color:#584036}
 #fontNormal[aria-pressed=true],#fontLarge[aria-pressed=true]{background:#433039!important;color:#ffeed9!important;outline:2px solid #d5a988}
 .mobile-bottom [data-route].active,.mobile-drawer [data-route].active{background:#3a2529!important;color:#ffe0b4!important;filter:brightness(.88)}
 @media(max-width:600px){
  #workspace .prompt{font-size:calc(clamp(22px,5.5vw,30px) * var(--mb-text-scale,1))!important}
  #workspace .option{font-size:calc(17px * var(--mb-text-scale,1))!important}
  .mb-font-range{padding:11px}
 }
 @media(prefers-reduced-motion:reduce){
  .mb-tap-burst{display:none!important}
  button.mb-pressing,.img-button.mb-pressing,.navbtn.mb-pressing{transition:none!important}
 }`;
 document.head.append(v5);

 const reduced=()=>!!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 const lastPointer=new WeakMap();
 const pressTimeouts=new WeakMap();
 const clickableSelector='button:not(:disabled),[role="button"],.application-topic-option,a[href],summary,input[type="checkbox"],input[type="radio"],select,input[type="range"]';
 const clickableFor=e=>e?.target instanceof Element?e.target.closest(clickableSelector):null;
 const pressable=el=>el.matches('button,.img-button,.navbtn,.application-topic-option,[role="button"]');
 function burst(clientX,clientY){
  if(reduced())return;
  const burstEl=document.createElement('span');burstEl.className='mb-tap-burst';
  burstEl.style.left=clientX+'px';burstEl.style.top=clientY+'px';
  burstEl.innerHTML='<i class="mb-tap-halo"></i><i class="mb-tap-core"></i>';
  const colors=['#fff0bf','#f5b891','#e7998c','#e6bb8d','#ffdf9a','#f3a99a'];
  for(let i=0;i<6;i++){
    const star=document.createElement('i');
    star.className='mb-tap-spark';
    const a=i*Math.PI/3-.35,dist=38+(i%2)*12;
    star.style.setProperty('--sx',Math.round(Math.cos(a)*dist)+'px');
    star.style.setProperty('--sy',Math.round(Math.sin(a)*dist-7)+'px');
    star.style.setProperty('--mb-spark-color',colors[i]);
    burstEl.append(star);
  }
  document.body.append(burstEl);
  setTimeout(()=>burstEl.remove(),560);
 }
 function press(el){
  if(!pressable(el))return;
  clearTimeout(pressTimeouts.get(el));
  el.classList.add('mb-pressing');
  pressTimeouts.set(el,setTimeout(()=>el.classList.remove('mb-pressing'),155));
 }
 let ctx=null;
 function tapSound(){
  try{
   const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
   if(!ctx)ctx=new C();
   if(ctx.state==='suspended')ctx.resume().catch(()=>{});
   const now=ctx.currentTime,osc=ctx.createOscillator(),gain=ctx.createGain();
   osc.type='sine';osc.frequency.setValueAtTime(740,now);osc.frequency.exponentialRampToValueAtTime(520,now+.068);
   gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.028,now+.009);gain.gain.exponentialRampToValueAtTime(.0001,now+.077);
   osc.connect(gain).connect(ctx.destination);osc.start(now);osc.stop(now+.082);
  }catch(_){}
 }
 function showInteraction(el,x,y,source){
  if(!el || el.matches?.(':disabled,[aria-disabled="true"]'))return;
  press(el);
  burst(x,y);
  if(source!=='click')tapSound();
  if(source==='touch'&&!reduced())try{navigator.vibrate?.(7)}catch(_){}
 }
 document.addEventListener('pointerdown',e=>{
  if(e.button!==0 || !e.isPrimary)return;
  const el=clickableFor(e);
  // Every tap/click on the screen gets visual feedback, even empty space.
  // Buttons and other controls also receive the short press animation/sound.
  if(!el){burst(e.clientX,e.clientY);return;}
  lastPointer.set(el,Date.now());
  showInteraction(el,e.clientX,e.clientY,e.pointerType==='touch'?'touch':'pointer');
 },{passive:true});
 // Covers synthetic clicks, accessibility activation and touch-only browsers,
 // without double-firing after pointerdown.
 document.addEventListener('click',e=>{
  const el=clickableFor(e);if(!el)return;
  if(Date.now()-(lastPointer.get(el)||0)<500)return;
  const rect=el.getBoundingClientRect();
  showInteraction(el,rect.left+rect.width/2,rect.top+rect.height/2,'click');
 });
 document.addEventListener('keydown',e=>{
  if(e.repeat||!['Enter',' '].includes(e.key))return;
  const el=clickableFor(e);if(!el)return;
  const rect=el.getBoundingClientRect();
  showInteraction(el,rect.left+rect.width/2,rect.top+rect.height/2,'keyboard');
 });

 // Selected item follows the actual route, including timed/infinite sessions.
 function actualRoute(){
  const current=typeof section!=='undefined'?section:'home';
  if(current!=='quiz')return current;
  const cfg=typeof store!=='undefined'?store?.active?.cfg:null;
  return cfg?.timed?'timed':cfg?.infinite?'infinite':(cfg?.category||'home');
 }
 function showSelected(route=actualRoute()){
  document.querySelectorAll('.sidebar-nav [data-route],.mobile-bottom [data-route],.mobile-drawer [data-route]').forEach(el=>{
   const on=el.dataset.route===route;
   el.classList.toggle('active',on);
   if(el.classList.contains('navbtn'))el.setAttribute('aria-current',on?'page':'false');
  });
 }
 showSelected();
 let fromSidebar=false;
 document.addEventListener('pointerdown',e=>{
  const nav=e.target instanceof Element?e.target.closest('.sidebar-nav [data-route]'):null;
  if(nav && nav.dataset.route!=='home')showSelected(nav.dataset.route);
 },{passive:true});
 // The inline app explicitly calls scrollTo({top:0}) inside navigate().
 // Block that *one* scroll request for left menu switches; preserve all
 // ordinary scrolling and home/quiz navigation.
 document.addEventListener('click',e=>{
  const nav=e.target instanceof Element?e.target.closest('.sidebar-nav [data-route]'):null;
  if(!nav || nav.dataset.route==='home')return;
  fromSidebar=true;
  queueMicrotask(()=>{fromSidebar=false});
 },true);
 if(typeof window.navigate==='function'){
  const originalNavigate=window.navigate;
  window.navigate=function(...args){
   const keep=fromSidebar,priorY=window.scrollY,oldScroll=window.scrollTo;
   if(keep){
    window.scrollTo=function(...scrollArgs){
     if(scrollArgs.length===1&&scrollArgs[0]&&typeof scrollArgs[0]==='object'&&scrollArgs[0].top===0)return;
     return oldScroll.apply(window,scrollArgs);
    };
   }
   try{return originalNavigate.apply(this,args)}
   finally{
    if(keep){
     window.scrollTo=oldScroll;
     requestAnimationFrame(()=>{
      const maxY=Math.max(0,document.documentElement.scrollHeight-window.innerHeight);
      const desired=Math.min(priorY,maxY);
      if(Math.abs(window.scrollY-desired)>6)oldScroll.call(window,{top:desired,behavior:'instant'});
     });
    }
    showSelected();
   }
  };
 }

 // Font-size slider: 80-150%, retained per browser.
 const small=document.getElementById('fontNormal');
 const big=document.getElementById('fontLarge');
 const fontKey='matchunbeom_font_scale_v2';
 let range=null,number=null;
 if(small && big && !document.getElementById('mbFontSizeRange')){
  const wrap=document.createElement('div');
  wrap.className='mb-font-range';
  wrap.innerHTML='<label for="mbFontSizeRange"><span>글씨 크기 조절</span><output id="mbFontPercent" for="mbFontSizeRange">100%</output></label><input id="mbFontSizeRange" type="range" min="80" max="150" step="5" value="100" aria-label="글씨 크기 조절"><p class="mb-font-preview">미리보기 · 맞춤법 문제를 편하게 읽어 봐!</p>';
  big.parentElement.insertAdjacentElement('afterend',wrap);
  range=wrap.querySelector('input');
  number=wrap.querySelector('output');
 }else{range=document.getElementById('mbFontSizeRange');number=document.getElementById('mbFontPercent');}
 function setTextScale(value){
  const v=Math.max(80,Math.min(150,Math.round(Number(value)/5)*5 || 100));
  document.documentElement.style.setProperty('--mb-text-scale',String(v/100));
  if(range)range.value=String(v);
  if(number)number.textContent=v+'%';
  // Keep older two-button setting and previously saved preferences in sync.
  document.body.classList.toggle('large-text',v>=120);
  small?.setAttribute('aria-pressed',String(v===100));
  big?.setAttribute('aria-pressed',String(v>=120));
  try{localStorage.setItem(fontKey,String(v));localStorage.setItem('matchunbeom_large_font',v>=120?'1':'0')}catch(_){}
 }
 let initial=100;
 try{const saved=Number(localStorage.getItem(fontKey));if(saved>=80&&saved<=150)initial=saved;else if(localStorage.getItem('matchunbeom_large_font')==='1')initial=125;}catch(_){}
 setTextScale(initial);
 range?.addEventListener('input',()=>setTextScale(range.value));
 small?.addEventListener('click',()=>setTextScale(100));
 big?.addEventListener('click',()=>setTextScale(125));

 // The single music controller manages volume, looping and playback; no legacy 3x boost.

})();


/* Mascot v7: compact top-left mascot, aligned controls, no duplicate overlays,
   vary character motion and banter while keeping timer and quiz controls intact. */
(()=>{
 'use strict';
 if(window.__munbubMascotV7)return;
 window.__munbubMascotV7=true;
 const imgSource='./ui-assets/mascot-character.png';
 const home=document.getElementById('homeScreen');
 const main=home?.querySelector('.home-main');
 const mascot=home?.querySelector('.hero-character');
 if(!home || !main || !mascot)return;
 mascot.src=imgSource;
 mascot.alt='맛춘범 픽셀 캐릭터 — 눌러서 대화하기';
 mascot.decoding='async';
 mascot.draggable=false;
 mascot.classList.add('mb-mascot-animated');
 // Keep original buttons & click handlers, but reserve two explicit columns.
 // Prevent the mascot from being obscured by full-width floating home controls.
 const dashboard=document.createElement('div');
 dashboard.className='mb-home-dashboard';
 const left=document.createElement('div');
 left.className='mb-dashboard-left';
 const stage=document.createElement('div');
 stage.className='mb-mascot-stage';
 for(const node of Array.from(main.children)){
  if(node.matches('.home-hero,.progress-panel,.resume-group,.timed-home-wrap'))left.append(node);
 }
 // Place mascot first in both DOM order and desktop layout, in the very top-left of the home body.
 stage.append(mascot);
 dashboard.append(stage,left);
 main.insertBefore(dashboard,main.firstChild);
 mascot.setAttribute('role','button');
 mascot.setAttribute('tabindex','0');
 mascot.setAttribute('aria-label','맛춘범 캐릭터와 대화하기');
 mascot.title='캐릭터를 누르면 새로운 대사가 나와요';
 const bubble=document.createElement('div');
 bubble.className='mb-home-speech';
 bubble.setAttribute('aria-live','off');
 bubble.textContent='국어 공부하러 왔어? 나도 퇴근 못 했어. 📚';
 stage.append(bubble);
 const style=document.createElement('style');
 style.id='mb-mascot-v7-expanded-title-and-banter';
 style.textContent=[
  "/* v6 HOME: first column mascot at upper left, right column all controls without giant vertical gaps */",
  "#homeScreen .home-main{position:relative!important;isolation:isolate;overflow:visible!important;gap:0!important}",
  "#homeScreen .home-main>.mb-home-dashboard{order:0!important;display:grid!important;grid-template-columns:minmax(220px,.88fr) minmax(300px,1.12fr)!important;column-gap:clamp(9px,1.35vw,18px)!important;row-gap:6px!important;align-items:start!important;width:100%!important;max-width:1120px!important;margin:0 auto 8px!important;box-sizing:border-box;min-width:0}",
  "#homeScreen .mb-home-dashboard>.mb-mascot-stage{grid-column:1;grid-row:1;position:relative!important;z-index:3!important;display:block!important;align-self:start!important;justify-self:start!important;box-sizing:border-box;width:min(100%,460px)!important;aspect-ratio:1!important;min-width:0;min-height:0;overflow:visible!important;pointer-events:none;margin:0!important}",
  "#homeScreen .mb-mascot-stage>.hero-character.mb-mascot-animated{position:relative!important;display:block!important;inset:auto!important;z-index:2!important;visibility:visible!important;opacity:1!important;width:100%!important;height:100%!important;max-height:none!important;max-width:100%!important;object-fit:contain!important;object-position:center!important;image-rendering:pixelated!important;transform-origin:50% 90%;cursor:pointer;pointer-events:auto!important;filter:drop-shadow(5px 7px 3px #1a111859);animation:mb-mascot-idle-v3 4.8s ease-in-out infinite}",
  "#homeScreen .mb-mascot-stage>.hero-character:focus-visible{outline:3px dashed #fce1ae;outline-offset:5px;border-radius:8px}",
  "#homeScreen .mb-mascot-stage>.mb-home-speech{position:absolute!important;top:0!important;right:0!important;left:auto!important;bottom:auto!important;z-index:4!important;box-sizing:border-box;width:clamp(126px,17vw,204px)!important;max-width:53%!important;min-height:47px;padding:clamp(7px,1vw,12px);border:3px solid #4b292b;border-radius:15px;background:#ffecd1;color:#3e2523;font-size:clamp(12px,1vw,15px);line-height:1.32;font-weight:850;text-align:center;box-shadow:inset 0 0 0 2px #fff7e9,0 4px 0 #27171a;pointer-events:none;word-break:keep-all}",
  "#homeScreen .mb-mascot-stage>.mb-home-speech::after{content:\"\";position:absolute;right:25%;bottom:-10px;width:14px;height:14px;transform:rotate(45deg);background:#ffecd1;border-right:3px solid #4b292b;border-bottom:3px solid #4b292b}",
  "#homeScreen .mb-mascot-stage>.mb-home-speech.mb-speech-pop{animation:mb-speech-pop .35s ease both}",
  "#homeScreen .mb-home-dashboard>.mb-dashboard-left{grid-column:2;grid-row:1;display:flex!important;flex-direction:column!important;align-items:stretch!important;justify-content:flex-start!important;gap:clamp(5px,.8vw,10px)!important;min-width:0;width:100%!important;max-width:none!important;box-sizing:border-box}",
  "#homeScreen .mb-dashboard-left>.home-hero{position:relative!important;order:0!important;width:100%!important;max-width:100%!important;min-height:0!important;height:clamp(84px,9vw,133px)!important;overflow:visible!important;margin:0!important;padding:0!important;align-self:flex-start!important}",
  "#homeScreen .mb-dashboard-left>.home-hero .hero-scroll{display:block!important;left:0!important;top:0!important;right:auto!important;width:100%!important;max-width:100%!important;max-height:100%!important;height:100%!important;object-fit:contain!important;object-position:left top!important;transform:none!important;z-index:3!important}",
  "#homeScreen .mb-dashboard-left>.progress-panel{position:relative!important;order:1!important;display:block;box-sizing:border-box!important;width:100%!important;max-width:100%!important;min-width:0;align-self:flex-start!important;margin:0!important;padding:clamp(8px,1vw,12px)!important}",
  "#homeScreen .mb-dashboard-left>.resume-group{position:relative!important;order:2!important;display:flex!important;justify-content:flex-start!important;align-self:flex-start!important;box-sizing:border-box;width:100%!important;max-width:100%!important;min-width:0!important;margin:0!important;padding:0!important}",
  "#homeScreen .mb-dashboard-left #resumeHotspot,#homeScreen .mb-dashboard-left #mobileResume{max-width:100%!important;margin:0!important}",
  "#homeScreen .mb-dashboard-left>.timed-home-wrap{position:relative!important;order:3!important;align-self:flex-start!important;display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box;min-width:0!important;margin:0!important;padding:0!important}",
  "#homeScreen .mb-dashboard-left .timed-home-btn{box-sizing:border-box!important;width:100%!important;max-width:100%!important;min-width:0!important;min-height:clamp(68px,7.6vw,100px)!important;padding:clamp(7px,1vw,12px)!important;gap:clamp(5px,1vw,10px)!important;font-size:clamp(17px,2vw,28px)!important}",
  "#homeScreen .mb-dashboard-left .timed-home-btn::before{width:clamp(28px,3.5vw,46px)!important;height:clamp(32px,4vw,50px)!important;font-size:clamp(24px,2.8vw,36px)!important}",
  "#homeScreen .mb-dashboard-left .timed-home-btn span{font-size:clamp(11px,1.1vw,16px)!important;padding-left:clamp(4px,.7vw,9px)!important}",
  "#homeScreen .home-main>.home-card-grid,#homeScreen .home-main>.home-actions,#homeScreen .home-main>.home-foot{position:relative!important;z-index:2}",
  "#homeScreen .home-main>.home-card-grid{order:1!important;gap:clamp(6px,1vw,12px)!important;max-width:1120px!important;margin:3px auto!important}",
  "#homeScreen .home-main>.home-actions{order:2!important;gap:clamp(6px,1vw,12px)!important;max-width:1120px!important;margin:7px auto 0!important}",
  "#homeScreen .home-main>.home-card-grid .img-button,#homeScreen .home-main>.home-actions .img-button{min-width:0!important;width:100%!important}",
  "#homeScreen .home-main>.home-card-grid .img-button img{height:clamp(115px,16vw,238px)!important;max-height:none!important;width:100%!important;object-fit:contain!important}",
  "#homeScreen .home-main>.home-actions .img-button img{height:clamp(67px,7vw,96px)!important;max-height:none!important;width:100%!important;object-fit:contain!important}",
  "#homeScreen .home-main>.home-foot{order:3!important;margin-top:8px!important}",
  '/* Timed button retains its real PNG as an img, not an empty active-state background. */',
  '.sidebar-nav .navbtn.timed-nav{display:block!important;min-height:0!important;height:auto!important;aspect-ratio:420/122!important;background:none!important;overflow:visible!important;line-height:0!important}',
  '.sidebar-nav .navbtn.timed-nav img{display:block!important;width:100%!important;height:auto!important;max-height:none!important;object-fit:contain!important;pointer-events:none!important;opacity:1!important;visibility:visible!important;filter:none!important}',
  '.sidebar-nav .navbtn.timed-nav.active{background-color:rgba(26,14,20,.12)!important}',
  '.sidebar-nav .navbtn.timed-nav.mb-timed-fallback{display:grid!important;place-items:center!important;min-height:70px!important;border:3px solid #f2d7b6!important;border-radius:12px!important;background:#291b21!important;color:#fbe4c2!important;font-size:clamp(15px,2vw,19px)!important;line-height:1.3!important}',
  '/* Quiz companion stays in its own column. */',
  '#workspace #view-quiz:not([hidden]){display:grid;grid-template-columns:minmax(0,1fr) minmax(185px,260px);gap:clamp(12px,1.5vw,22px);align-items:start}',
  '#workspace #view-quiz>.panel{min-width:0;margin-bottom:0}',
  '#workspace .mb-quiz-companion{box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:8px;position:sticky;top:16px;min-width:0;width:100%;padding:14px 10px 16px;text-align:center}',
  '#workspace .mb-mascot-button{display:grid;place-items:end center;flex:none;width:min(100%,220px);height:230px;max-width:100%;background:transparent;border:0;padding:0;cursor:pointer;touch-action:manipulation;filter:drop-shadow(5px 8px 1px #120b10aa);transition:filter .18s}',
  '#workspace .mb-mascot-button img{display:block;max-width:100%;max-height:100%;width:auto;height:100%;object-fit:contain;image-rendering:pixelated;pointer-events:none;animation:mb-quiz-idle-v3 4.1s ease-in-out infinite;transform-origin:50% 90%}',
  '#workspace .mb-mascot-button:hover{filter:drop-shadow(6px 10px 2px #120b10) brightness(1.1)}',
  '#workspace .mb-mascot-button:focus-visible{outline:3px solid #d69d6c;outline-offset:3px;border-radius:10px}',
  '#workspace .mb-quiz-speech{position:relative;box-sizing:border-box;width:100%;min-height:88px;padding:13px 12px;border:3px solid #4b292b;border-radius:16px;background:#ffead0;color:#3e2523;font-size:clamp(14px,1.1vw,17px);font-weight:850;line-height:1.5;word-break:keep-all;box-shadow:inset 0 0 0 2px #fff7e9,0 5px 0 #27171a}',
  '#workspace .mb-quiz-speech::before{content:"";position:absolute;top:-12px;left:calc(50% - 10px);width:18px;height:18px;transform:rotate(45deg);background:#ffead0;border-top:3px solid #4b292b;border-left:3px solid #4b292b}',
  '#workspace .mb-quiz-hint{margin:6px 0 0;color:#f0d6bd;font-size:12px;font-weight:700}',
  '@keyframes mb-mascot-idle-v3{0%,100%{transform:translateY(0) rotate(-.8deg)}24%{transform:translateY(-5px) rotate(.5deg)}55%{transform:translateY(-9px) rotate(1.1deg)}79%{transform:translateY(-2px) rotate(-.5deg)}}',
  '@keyframes mb-quiz-idle-v3{0%,100%{transform:translateY(0) rotate(-.4deg)}50%{transform:translateY(-6px) rotate(1deg)}}',
  '@keyframes mb-act-hop{0%,100%{transform:translateY(0) scale(1)}32%{transform:translateY(-24px) scale(1.08,.92)}60%{transform:translateY(3px) scale(.96,1.04)}80%{transform:translateY(-7px)}}',
  '@keyframes mb-act-nod{0%,100%{transform:rotate(0)}20%,60%{transform:rotate(9deg) translateY(3px)}40%,80%{transform:rotate(-4deg) translateY(-4px)}}',
  '@keyframes mb-act-wiggle{0%,100%{transform:rotate(0)}20%{transform:rotate(-11deg)}40%{transform:rotate(10deg)}60%{transform:rotate(-7deg)}80%{transform:rotate(6deg)}}',
  '@keyframes mb-act-think{0%,100%{transform:rotate(0)}30%,70%{transform:translateX(-8px) rotate(-10deg)}50%{transform:translateX(-10px) rotate(-5deg)}}',
  '@keyframes mb-act-cheer{0%,100%{transform:translateY(0) rotate(0)}20%{transform:translateY(-15px) rotate(-9deg) scale(1.06)}45%{transform:translateY(-21px) rotate(10deg) scale(1.07)}70%{transform:translateY(-7px) rotate(-4deg)}}',
  '@keyframes mb-act-surprise{0%,100%{transform:scale(1)}22%{transform:translateY(-9px) scale(1.13) rotate(-4deg)}50%{transform:scale(.92) rotate(5deg)}76%{transform:scale(1.04)}}',
  '@keyframes mb-act-sway{0%,100%{transform:rotate(0)}35%{transform:translateX(-13px) rotate(-8deg)}68%{transform:translateX(13px) rotate(8deg)}}',
  '@keyframes mb-act-stretch{0%,100%{transform:scale(1)}35%{transform:scale(.94,1.1) translateY(-5px)}60%{transform:scale(1.08,.94) translateY(3px)}}',
  '@keyframes mb-speech-pop{0%{opacity:.4;transform:translateY(7px) scale(.94)}100%{opacity:1;transform:none}}',
  '#homeScreen .hero-character.mb-motion-hop,#workspace .mb-mascot-button.mb-motion-hop img{animation:mb-act-hop .7s cubic-bezier(.24,.72,.26,1) 1 both!important}',
  '#homeScreen .hero-character.mb-motion-nod,#workspace .mb-mascot-button.mb-motion-nod img{animation:mb-act-nod .75s ease 1 both!important}',
  '#homeScreen .hero-character.mb-motion-wiggle,#workspace .mb-mascot-button.mb-motion-wiggle img{animation:mb-act-wiggle .68s ease 1 both!important}',
  '#homeScreen .hero-character.mb-motion-think,#workspace .mb-mascot-button.mb-motion-think img{animation:mb-act-think .9s ease 1 both!important}',
  '#homeScreen .hero-character.mb-motion-cheer,#workspace .mb-mascot-button.mb-motion-cheer img{animation:mb-act-cheer .8s ease 1 both!important}',
  '#homeScreen .hero-character.mb-motion-surprise,#workspace .mb-mascot-button.mb-motion-surprise img{animation:mb-act-surprise .73s ease 1 both!important}',
  '#homeScreen .hero-character.mb-motion-sway,#workspace .mb-mascot-button.mb-motion-sway img{animation:mb-act-sway .85s ease 1 both!important}',
  '#homeScreen .hero-character.mb-motion-stretch,#workspace .mb-mascot-button.mb-motion-stretch img{animation:mb-act-stretch 1.1s ease 1 both!important}',
  "@media(max-width:1100px){\n#homeScreen .home-main>.mb-home-dashboard{grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr)!important}\n#homeScreen .mb-dashboard-left>.home-hero{height:clamp(82px,10vw,125px)!important}\n#workspace #view-quiz:not([hidden]){grid-template-columns:minmax(0,1fr) minmax(160px,205px)}\n#workspace .mb-mascot-button{height:190px}\n}",
  "@media(max-width:700px){\n#homeScreen .home-main>.mb-home-dashboard{grid-template-columns:minmax(0,38fr) minmax(0,62fr)!important;row-gap:7px!important;column-gap:8px!important;margin-bottom:6px!important}\n#homeScreen .mb-home-dashboard>.mb-dashboard-left{display:contents!important}\n#homeScreen .mb-home-dashboard>.mb-mascot-stage{grid-column:1;grid-row:1;align-self:start!important;width:100%!important;max-width:none!important}\n#homeScreen .mb-dashboard-left>.home-hero{grid-column:2;grid-row:1;align-self:start!important;height:clamp(95px,28vw,165px)!important;width:100%!important;max-width:100%!important}\n#homeScreen .mb-dashboard-left>.progress-panel{grid-column:1/-1;grid-row:2;width:100%!important;padding:8px!important;min-width:0!important;font-size:clamp(12px,3.3vw,16px)}\n#homeScreen .mb-dashboard-left>.resume-group{grid-column:1/-1;grid-row:3;width:100%!important}\n#homeScreen .mb-dashboard-left>.timed-home-wrap{grid-column:1/-1;grid-row:4;width:100%!important}\n#homeScreen .mb-mascot-stage>.mb-home-speech{right:-3px!important;top:0!important;max-width:69%!important;width:clamp(85px,25vw,130px)!important;padding:5px!important;border-width:2px!important;font-size:clamp(10px,2.5vw,12px)!important;line-height:1.25!important}\n#homeScreen .mb-dashboard-left .timed-home-btn{min-height:68px!important;font-size:clamp(15px,4vw,21px)!important}\n#homeScreen .mb-dashboard-left .timed-home-btn span{font-size:12px!important}\n#homeScreen .home-main>.home-card-grid .img-button img{height:clamp(95px,29vw,170px)!important}\n#homeScreen .home-main>.home-actions .img-button img{height:clamp(62px,17vw,85px)!important}\n#workspace #view-quiz:not([hidden]){grid-template-columns:minmax(0,1fr);gap:10px}\n#workspace .mb-quiz-companion{order:-1;position:static;flex-direction:row;align-items:center;justify-content:center;padding:8px 5px;gap:12px}\n#workspace .mb-mascot-button{height:118px;width:115px}\n#workspace .mb-quiz-speech{flex:1;min-height:77px;text-align:left;font-size:14px}\n#workspace .mb-quiz-speech::before{left:-11px;top:calc(50% - 9px);border-top:none;border-left:3px solid #4b292b;border-bottom:3px solid #4b292b}\n#workspace .mb-quiz-hint{display:none}\n}",
  "@media(max-width:600px){\n#homeScreen .mb-dashboard-left>.home-hero{height:clamp(85px,29vw,135px)!important}\n#homeScreen .mb-dashboard-left>.home-hero .hero-scroll{left:0!important;top:0!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important}\n#homeScreen .mb-dashboard-left>.resume-group{margin:0!important}\n#workspace .mb-quiz-companion{gap:8px}\n#workspace .mb-mascot-button{height:102px;width:100px}\n#workspace .mb-quiz-speech{padding:10px;min-height:66px}\n}",
  '@media(prefers-reduced-motion:reduce){#homeScreen .mb-mascot-stage>img.hero-character.mb-mascot-animated,#homeScreen .mb-mascot-stage>img.hero-character[class*="mb-motion-"],#workspace .mb-mascot-button img,#workspace .mb-mascot-button[class*="mb-motion-"] img,#homeScreen .mb-home-speech{animation:none!important;transform:none!important}}'
 ].join('\n');
 style.textContent += "\n" + "\n/* Progress retained as hidden DOM data targets, entirely removed from visible layout. */\n#homeScreen .progress-panel,#homeScreen .progress-mobile,#homeScreen .mb-dashboard-left>.progress-panel{display:none!important;visibility:hidden!important;height:0!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important}\n#homeScreen .mb-dashboard-left>.home-hero{height:clamp(150px,19vw,255px)!important;min-height:0!important;max-height:255px!important;flex:none!important}\n#homeScreen .mb-dashboard-left>.home-hero .hero-scroll{width:100%!important;max-width:100%!important;height:100%!important;max-height:100%!important;object-fit:contain!important;object-position:left center!important}\n#homeScreen .mb-dashboard-left{gap:clamp(5px,.7vw,9px)!important}\n#homeScreen .home-main>.mb-home-dashboard{margin-bottom:clamp(4px,.6vw,9px)!important}\n#homeScreen .mb-dashboard-left>.resume-group{order:1!important}\n#homeScreen .mb-dashboard-left>.timed-home-wrap{order:2!important}\n@media(max-width:1100px){#homeScreen .mb-dashboard-left>.home-hero{height:clamp(140px,21vw,240px)!important}}\n@media(max-width:700px){\n#homeScreen .mb-dashboard-left>.home-hero{height:clamp(112px,33vw,188px)!important;max-height:none!important}\n#homeScreen .mb-dashboard-left>.resume-group{grid-column:1/-1!important;grid-row:2!important}\n#homeScreen .mb-dashboard-left>.timed-home-wrap{grid-column:1/-1!important;grid-row:3!important}\n}\n@media(max-width:360px){#homeScreen .mb-dashboard-left>.home-hero{height:clamp(95px,32vw,140px)!important}}\n";
 style.textContent += "\n" + "@keyframes mb-act-salute{0%,100%{transform:rotate(0)}25%,62%{transform:rotate(-13deg) translateY(-6px)}85%{transform:rotate(3deg)}}\n#homeScreen .hero-character.mb-motion-salute,#workspace .mb-mascot-button.mb-motion-salute img{animation:mb-act-salute .95s ease-in-out 1 both!important}\n@keyframes mb-act-shudder{0%,100%{transform:translateX(0)}15%,45%,75%{transform:translateX(-7px) rotate(-3deg)}30%,60%,90%{transform:translateX(7px) rotate(3deg)}}\n#homeScreen .hero-character.mb-motion-shudder,#workspace .mb-mascot-button.mb-motion-shudder img{animation:mb-act-shudder .95s ease-in-out 1 both!important}\n@keyframes mb-act-moonwalk{0%,100%{transform:translateX(0)}25%{transform:translateX(-18px) rotate(-3deg)}65%{transform:translateX(15px) rotate(4deg)}}\n#homeScreen .hero-character.mb-motion-moonwalk,#workspace .mb-mascot-button.mb-motion-moonwalk img{animation:mb-act-moonwalk .95s ease-in-out 1 both!important}\n@keyframes mb-act-victory{0%,100%{transform:translateY(0) scale(1)}20%{transform:translateY(-23px) rotate(-8deg) scale(1.07)}45%{transform:translateY(0)}70%{transform:translateY(-20px) rotate(9deg) scale(1.05)}}\n#homeScreen .hero-character.mb-motion-victory,#workspace .mb-mascot-button.mb-motion-victory img{animation:mb-act-victory .95s ease-in-out 1 both!important}\n@keyframes mb-act-peek{0%,100%{transform:translateX(0) rotate(0)}25%,60%{transform:translateX(18px) rotate(9deg)}}\n#homeScreen .hero-character.mb-motion-peek,#workspace .mb-mascot-button.mb-motion-peek img{animation:mb-act-peek .95s ease-in-out 1 both!important}\n@keyframes mb-act-stumble{0%,100%{transform:rotate(0) translateY(0)}25%{transform:rotate(-14deg) translateY(7px)}52%{transform:rotate(11deg) translateY(2px)}75%{transform:rotate(-5deg) translateY(4px)}}\n#homeScreen .hero-character.mb-motion-stumble,#workspace .mb-mascot-button.mb-motion-stumble img{animation:mb-act-stumble .95s ease-in-out 1 both!important}\n@keyframes mb-act-zoom{0%,100%{transform:scale(1)}30%{transform:scale(1.15) translateY(-8px)}67%{transform:scale(.93) translateY(5px)}}\n#homeScreen .hero-character.mb-motion-zoom,#workspace .mb-mascot-button.mb-motion-zoom img{animation:mb-act-zoom .95s ease-in-out 1 both!important}\n@keyframes mb-act-bow{0%,100%{transform:rotate(0) scaleY(1)}28%,65%{transform:rotate(6deg) scaleY(.87)}}\n#homeScreen .hero-character.mb-motion-bow,#workspace .mb-mascot-button.mb-motion-bow img{animation:mb-act-bow .95s ease-in-out 1 both!important}\n@keyframes mb-act-bop{0%,100%{transform:translateY(0) rotate(0)}20%{transform:translateY(-8px) rotate(-5deg)}40%{transform:translateY(0) rotate(4deg)}65%{transform:translateY(-8px) rotate(-3deg)}}\n#homeScreen .hero-character.mb-motion-bop,#workspace .mb-mascot-button.mb-motion-bop img{animation:mb-act-bop .95s ease-in-out 1 both!important}\n@keyframes mb-act-suspicious{0%,100%{transform:rotate(0) translateX(0)}20%,60%{transform:rotate(-11deg) translateX(-7px)}80%{transform:rotate(5deg) translateX(2px)}}\n#homeScreen .hero-character.mb-motion-suspicious,#workspace .mb-mascot-button.mb-motion-suspicious img{animation:mb-act-suspicious .95s ease-in-out 1 both!important}";
 document.head.append(style);
 const reduceMotion=()=>!!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 const motions=['hop','nod','wiggle','think','cheer','surprise','sway','stretch','salute','shudder','moonwalk','victory','peek','stumble','zoom','bow','bop','suspicious'];
 const timers=new WeakMap();
 function playMotion(target,motion){
  if(!target || reduceMotion())return;
  const kind=motions.includes(motion)?motion:motions[Math.floor(Math.random()*motions.length)];
  clearTimeout(timers.get(target));
  for(const m of motions)target.classList.remove('mb-motion-'+m);
  void target.offsetWidth;
  target.classList.add('mb-motion-'+kind);
  timers.set(target,setTimeout(()=>target.classList.remove('mb-motion-'+kind),1150));
 }
 function oneOf(lines,previous){
  if(lines.length===1)return lines[0];
  let next=lines[Math.floor(Math.random()*lines.length)];
  if(next===previous)next=lines[(lines.indexOf(next)+1+Math.floor(Math.random()*(lines.length-1)))%lines.length];
  return next;
 }
 const homeLines=[
  '국어 공부하러 왔어? 나도 퇴근 못 했어. 📚',
  '맞춤법 점수로 승부 보자. 나도 긴장 중!',
  '띄어쓰기는 중요해. 우리 사이는 붙어 있어도 되고.',
  '어쩔티비? 정답은 외울티비.',
  '사자성어? 사자 네 마리 찾는 게임 아니야. 🦁',
  '오답은 부끄러운 게 아니야. 복습 퀘스트야!',
  '국어 만점이면 내가 박수 대신 춤춰 줄게.',
  '잠깐! 그 선택지… 냄새가 수상한데?',
  '이 문제 맞히면 오늘의 명예 국어왕 인정.',
  '찍는 것도 실력? 음… 근거부터 찾자.',
  '난 맞춘범. 정답을 맞추는 쪽이 전문이지!',
  '오늘도 뇌세포 출근 완료. 야근은 사양할게.',
  '정답 찾기 전에 간식 찾는 건 국룰이지.',
  '말은 쉬운데 띄어쓰기가 안 쉬워. 🥲',
  '국어를 공부했더니 말장난이 늘었어.',
  '아는 문제면 쿨하게, 헷갈리면 천천히!'
 ];
 const prompts=[
  '이번 문제는 단어 하나가 힌트일지도?',
  '선지부터 훑지 말고 문장을 먼저 읽어 봐!',
  '함정 발견하면 내가 마음속으로 박수칠게.',
  '오늘의 퀘스트: 오답 함정 피하기.',
  '아리송하다면 문맥으로 돌아가 보자.',
  '맞춤법은 감보다 근거! 탐정 모드 ON.',
  '문장에 숨은 복선… 아니, 맞춤법 단서!',
  '이거 맞히면 내 자신감도 같이 올라감.',
  '잠깐만! 비슷한 표현끼리 비교해 봐.',
  '국어 뇌 풀가동, 삐빅! 분석 중.'
 ];
 const right=[
  '정답! 네 국어력, 오늘도 정상 영업 중. 🎉',
  '이걸 맞히네? 나 지금 소름 돋았잖아!',
  '오케이! 정답 버튼에 이름 새겨야겠다.',
  '깔끔하다! 선택지들이 박수치는 중.',
  '이 정도면 맞춤법 경찰도 경례하겠다.',
  '좋았어! 다음 문제도 출동하자.',
  '정답이다! 내 응원도 효과가 있었나? 😎',
  '레벨 업! 국어 경험치 +100.',
  '이야, 정답률이 춤추겠는데?',
  '이번 판 주인공은 너다!'
 ];
 const wrong=[
  '아깝다! 이 문제는 복습 보스라고 생각하자.',
  '앗, 함정 카드였네. 해설에서 힌트를 챙겨!',
  '틀릴 수도 있지! 다음 문제에서 복수전.',
  '괜찮아. 오답은 기억에 오래 남는 단서야.',
  '이번 건 헷갈릴 만했어. 차이를 확인하자.',
  '어이쿠! 국어 함정에 한 번 걸렸네.',
  '정답 확인하고 다시 도전하면 돼. 🧠',
  '아쉽지만 경험치 획득! 다음 문제 고고.',
  '이 표현, 오답 노트에 특별 출연 확정.',
  '한 번 틀렸다고 게임 오버는 아니지!'
 ];
 const chatting=[
  '불렀어? 지금 공부하는 척하고 있었어.',
  '내 대사보다 중요한 건 문제야… 아마도.',
  '한 번 더 누르면 내가 더 수다스러워짐.',
  '이 버튼 누르는 실력으로 정답도 눌러 봐.',
  '국어가 어려워? 나도 내 이름 맞춤법 헷갈려.',
  '사자성어가 어렵다면 뜻을 장면으로 외워 봐.',
  '내가 힌트 줄까? 답은 문맥 속에 숨어 있다!',
  '오늘의 명언: 찍지 말고 읽자. (가끔 찍힘)',
  '문제 하나씩! 속도보다 이해가 더 중요해.',
  '계속 누르면 숨겨진 대사는… 그냥 드립이야.',
  '학습 모드 ON! 농담 모드도 ON!',
  '자, 집중! 내가 떠드는 사이 문제 도망간다.'
 ];

 homeLines.push(
  '야 잠깐만, 공부 버튼 눌렀으면 이제 도망 못 가 ㅋㅋ',
  '문제들 긴장해라. 오늘 퀴즈판 주인은 우리다.',
  '틀리면? 웃고 다시 풀면 됨. 국어는 리스폰 가능!',
  '내가 봤는데 이 문제 출제자 좀 장난꾸러기임.',
  '오늘 목표는 만점. 현실 목표는 어제보다 한 문제 더!',
  '아 ㅋㅋ 띄어쓰기가 왜 사람을 띄엄띄엄 보냐고.',
  '정답을 맞히는 게 일이면 난 지금 야근 중.',
  '문법 지옥 입구입니다. 출구는 정답 옆.',
  '잠깐, 책상 위 간식부터 확인하고 갑시다.',
  '사자성어 공부 중인 사자는 지금 동물원에 없습니다.',
  '문제가 어렵다고? 나도 어렵다. 일단 같이 읽자.',
  '나랑 눈 마주쳤지? 그럼 문제 하나 더.',
  '성적을 높이는 비법: 틀린 문제를 다시 보면 된다. 진짜로.',
  '이 프로그램 이름 맛춘범인데 난 아직도 맞춤법 검사기 켬.',
  '오늘도 국어와 한판 뜨는 중. 파이팅이다!',
  '국어는 국어인데 왜 영어보다 긴장되냐.',
  '정답의 기운이 느껴진다… 아니면 배고파서 그럴 수도.',
  '너 지금 문제 대신 내 대사 읽고 있지 ㅋㅋ',
  '어허! 집중력 탈주했다. 잡아와!',
  '이 정도 공부했으면 내 머리에서도 연기가 난다.',
  '문제 하나 틀리면 다음 문제 하나 맞혀 버리면 되지.',
  '띄어쓰기는 거리 두기지만 공부는 몰입하기.',
  '맞춤법이 자꾸 틀리면? 어쩔 수 없지, 연습이지!',
  '나 사실 캐릭터가 아니라 퀴즈판 감시자임. 농담임.',
  '지금 포기하면 드립만 남고 점수는 안 남아.',
  '점수보다 중요한 건 오늘 배운 하나!',
  '문제에 함정 있으면 나한테도 알려 줘. 내가 못 봄.',
  '오답 노트가 곧 보스 공략집이다!',
  '오늘만큼은 맞춤법 마스터가 되어 보자.',
  '공부하다 졸리면 물 한 잔 마시고 다시 오자.',
  '와, 아직도 공부 중? 집중력 인정.',
  '한글이 이렇게 어려울 줄 세종대왕도 예상하셨을까?',
  'ㅋㅋㅋ 정답 고르는 모습이 아주 진지한데?',
  '이거 풀면 내가 업적 하나 줄지도? 🏆',
  '퀴즈왕의 탄생을 실시간으로 목격하는 중.',
  '마지막 한 문제만! 이 말이 제일 무서운 말이긴 해.'
 );
 prompts.push(
  '그렇게 날 보지 말고 문제를 봐 ㅋㅋ',
  '쫄지 마. 일단 띄어쓰기부터 확인해!',
  '문제야, 우리한테 왜 이러니?',
  '오늘의 미션: 함정 선지 들키게 만들기.',
  '힌트는 내 얼굴에 없어. 문장에 있어!',
  '정답아 어디 있니? 숨바꼭질 그만하자.',
  '아 이 문제 느낌 있다. 근거는 아직 없음.',
  '한 번 더 읽으면 보일지도. 안 보이면 또 읽기!',
  '문제와 눈싸움 중… 집중해 봐.',
  '이제 찍기의 시대를 끝내자. 근거 찾기!',
  '헷갈리는 표현은 직접 소리 내어 비교해 봐.',
  '답은 하나인데 왜 다 맞아 보이는 거야 ㅋㅋ'
 );
 right.push(
  '와 정답ㅋㅋ 나보다 잘하는 거 아니야?',
  '이거 그냥 고수잖아? 👑',
  '정답! 출제자가 지금 좀 긴장했겠다.',
  '맞혔다! 오늘도 맞춘범 이름값 하는 중.',
  '그 선택 완벽했어. 내 입꼬리도 올라감.',
  '정답! 나 방금 승리의 춤 춘 거 봤냐?',
  '오케이, 국어 보스 체력 -1.',
  '완벽한 한 방. 다음 문제 도전!',
  '정답인데 왜 내가 더 신났지?',
  '이야… 이쯤 되면 너한테 내가 배우겠다.'
 );
 wrong.push(
  '앗 ㅋㅋ 문제한테 한 방 먹었네. 다시 복습!',
  '이건 좀 억울하지? 해설 보면서 확인하자.',
  '오답 발생! 하지만 데이터는 쌓인다.',
  '어허, 방금 선지가 낚싯대 던진 거 봤어?',
  '틀린 건 틀린 거고, 다음에 맞히면 되지!',
  '너 방금 함정 밟았어. 지도에 표시해 두자.',
  '아니 이 선지는 왜 이렇게 정답처럼 생겼냐.',
  '그럴 수 있어. 오답노트엔 좋은 재료지!',
  '아까워! 다음 문제에서는 내가 더 떠들어 줄게.',
  '나도 헷갈렸어… 라고 하면 위로가 되려나?'
 );
 chatting.push(
  '왜 불러 ㅋㅋ 나 지금 문법과 결투 중이야.',
  '수다를 원한다고? 문제 다 풀고 와. 농담!',
  '누른 김에 문제도 하나 풀자. 제발.',
  '너 지금 캐릭터 클릭 업적 노리는 거지?',
  '이 캐릭터, 말이 많아서 문제에 집중이 안 된대.',
  '맞춘범 상담실입니다. 오답은 접수번호 1번.',
  '우리 드립은 만점인데 맞춤법 점수는 어때?',
  '내가 조용하면 섭섭하고 떠들면 시끄럽지? ㅋㅋ',
  '국어 공부하는데 어휘력보다 드립력이 늘고 있어.',
  '내 직업은 문제 옆에서 쓸데없이 응원하기.',
  '진지하게 가자. 아 근데 사자성어 얘기하니까 사자 보고 싶다.',
  '정답 알려달라고? 그건 반칙이지! 힌트는 문맥.',
  '문법은 규칙인데 왜 내 인생은 랜덤이냐.',
  '넌 공부해. 난 옆에서 리액션 담당할게.',
  '이거 누를 시간에 정답 하나 더 고르는 건 어때?',
  '내가 말이 좀 많지? 맞아. 아주 많이.',
  '수행평가 만점 기원… 주문 접수 완료!',
  '지금은 공부 중! 잡담은 내가 책임진다.',
  '이러다가 나 캐릭터 대사로 국어 시험 나오겠다.',
  '오늘의 퀴즈 꿀팁: 천천히 읽기. 너무 뻔한가?',
  '맞춰보자! 아니 이름이 맛춘범이라니까?',
  '나 사실 버튼 누를 때마다 춤 연습 중이야.',
  '너가 누르니까 자꾸 떠들게 되잖아 ㅋㅋ',
  '아니 왜 이렇게 많이 누르는 건데 ㅋㅋㅋ',
  '캐릭터 수다 레벨 +1. 문제도 푸는 거 맞지?',
  '나 지금 숨겨진 대사 100개 만들고 있는 기분임.',
  '이 정도면 나보다 네가 더 수다쟁이 아니냐.',
  '이벤트! 지금부터 말풍선에만 집중하면 공부는 못 함.',
  '아무 말 대잔치 시작. 일단 문제부터 풀고!',
  '드립을 이렇게 쳐도 국어 지식은 진지하게 가자.'
 );

 const extraBanter={"home":["댓글 창엔 오타가 있고, 내 머릿속엔 교정기가 있지.","말은 눈 깜빡할 새 지나가도 맞춤법은 남아.","버튼이 날 부르고 있어. 아니, 네가 누른 거구나.","맞춤법 마스터의 길은 오답노트에서 시작돼.","정답이 외로워 보이면 한 문제 맞혀 주자.","난 국어 캐릭터인데 드립에 더 진심이야.","국어 시험지가 게임 보스처럼 생겨 보이는 건 기분 탓일까.","한글 맞춤법은 약속이고, 찍기는 운이야.","긴장하지 마. 문장은 도망가지 않아.","어휘력이 늘면 말장난도 정교해져. 이득이네!","누군가는 댓글에 오타를 남기고, 우린 그걸 공부하지.","자주 틀리는 표기를 고치면 속이 시원하다니까.","내가 떠들면 웃고, 문제는 진지하게 풀어 줘.","국어가 이렇게 스릴 넘치면 공포게임이 필요 없겠다.","선지들이 서로 정답인 척 연기하는 중이래.","와 이거 국어 공부인지 드립 수업인지 모르겠네.","사자성어 속 사자들은 사실 출석하지 않았습니다.","정답을 숨겨 놓은 출제자, 숨바꼭질 고수 인정.","한글이 위대하니까 띄어쓰기까지 쉽게 느껴지진 않네.","문장 하나가 두 뜻이라면 문맥을 먼저 봐.","내 눈엔 오타가 점프스케어처럼 보여.","오답은 내일 맞힐 문제의 예고편이야.","오늘의 국어 체력은 아직 괜찮아?","공부를 시작했으면 일단 10문제까지 도전!","어려운 문제는 천천히 푸는 게 오히려 빠를지도.","맞춤법에 자신 없어도 배울 준비면 충분해.","요즘 인터넷에서 본 표기, 사전에서는 다를 수 있어."],"prompts":["이 문제는 인터넷 댓글처럼 느낌으로만 고르면 안 돼.","어절을 잘라 보면 띄어쓰기가 보일 수 있어.","헷갈리면 문장 끝의 서술어부터 살펴봐.","기본형으로 돌리면 정답의 단서가 나올 수 있어.","부정 표현이면 '안'과 '않'을 구분해 봐.","문장을 소리 내 읽는 것도 좋은 방법이야.","의존 명사인지 조사인지가 핵심일 수 있어.","사자성어는 글자와 뜻을 연결해 봐.","맞는 표기만 보지 말고 틀린 표기도 분석해.","온라인에서 본 말이 표준어라고 단정하지 마.","이럴 땐 어휘의 뜻부터 확인하는 거야.","빨리 찍기 전에 한 번 더 비교해 봐.","숨은 단서가 있는지 천천히 살펴보자.","이 문장의 말하는 상황을 머릿속에 그려 봐.","한 글자 차이가 문장 의미를 바꿀 수도 있어.","기억이 흐릿하다면 반례를 떠올려 봐.","이번 문제는 문법의 개념을 확인할 기회야.","맞춘 뒤에도 근거를 설명할 수 있으면 최고!","쉽게 보이는 표기가 함정인 경우도 있어.","주변 단어와의 호응을 확인하는 거 잊지 마."],"right":["그거야! 출제자가 노린 함정을 피해 버렸네.","정답! 국어력이 한 단계 업그레이드됐어.","맞혔다! 사전도 끄덕이는 중일걸.","완벽한 국어 수비였어. 깔끔했다.","정답은 초록색, 내 기분은 무지개색.","댓글 오타도 네 앞에선 바로 교정되겠어.","정답! 한 번 더 맞혀서 연승을 이어 가자.","선택이 아주 정확했어. 이유도 기억하자!","어? 이 문제 은근 어려웠는데 대단한데?","맞췄다! 아니 '맞혔다'라고 해야겠지.","오늘 국어 뇌가 아주 열심히 일한다.","정답 누른 손가락에 훈장 하나 주고 싶네.","보기에 낚일 뻔했는데 잘 피했어.","정확하게 판단했어. 다음에도 이 규칙 기억!","한 문제 해결. 국어 퀘스트 완료!","정답 맞히는 속도보다 근거가 더 멋있어.","놀랍다! 내 말장난보다 정답이 더 신나네.","이거 완전히 고수 플레이잖아 ㅋㅋ.","국어 왕관은 아직 없지만 마음속엔 있어.","정답이야. 이제 나도 리액션 춤 춰야지."],"wrong":["아깝다. 인터넷에서 익숙한 오타가 함정이었을지도.","이건 틀린 이유를 알면 금세 해결돼.","오답도 공부의 일부라니까. 해설로 가자!","문맥 속 힌트를 하나 놓쳤을 수도 있어.","선지가 정답 코스프레를 잘하네.","괜찮아, 다음에는 비슷한 표기를 구별할 수 있겠어.","이런 문제는 자주 보면 감이 생기더라.","이건 사전 확인이 도움이 될 거야.","틀린 단어 하나가 좋은 복습 재료가 됐어.","다음에는 차분히 읽고 고르면 돼.","오늘의 보스는 이 선지였구나.","누구나 헷갈리는 표기가 있지. 이유를 알아보자.","오답노트에 들어갈 명예의 후보야.","틀린 답이 왜 틀렸는지 확인해 봐.","아니 이 보기 왜 이렇게 정답처럼 생겼냐?","다음에 또 만나면 정답으로 되갚아 주자.","방금 실수는 기억에 오래 남을 듯해.","조금만 더 읽었으면 찾았을 것 같은데!","한 번의 오답으로 실력을 단정할 필요 없어.","다음 문제는 더 침착하게 가자."],"chatting":["내가 지금 떠드는 동안 너는 문제를 풀고 있지?","오타 찾아달라고? 먼저 어떤 단어인지 알려 줘!","댓글에 '웬지' 쓰는 사람 보면 살짝 알려 주자.","난 맞춤법 지킴이, 넌 정답 지킴이.","나를 열 번 누르면 국어 지식도 열 배 될까? 글쎄.","맞춤법은 나도 사전 보면서 배운다니까.","어휘 선택이 고민되면 문맥부터 살펴봐.","수다보단 공부! 라고 말하는 캐릭터가 제일 시끄럽네.","내 춤을 감상하느라 문제 놓치지 마.","게임에는 보스가 있고 국어에는 함정이 있지.","계속 누르면 새로운 드립이 계속 나올걸.","오늘 배운 표현 하나만 제대로 기억해도 성공이야.","새 업적을 노리고 있는 거 맞지 ㅋㅋ.","클릭 소리가 들리면 난 춤출 준비를 한다.","무작정 암기보다 문장 속 쓰임을 확인해 봐.","맞춤법을 지적할 땐 사람 말고 표현을 고치자.","한글이 어렵다고? 난 맞춘범이라 매일 복습 중.","틀린 표현이 정답을 가르쳐 주는 역설.","이 드립에는 수능 출제 가능성이 없습니다.","국어 공부하다가 내가 더 수다스러워진 것 같아.","캐릭터가 말이 많아서 불편하면 문제에 집중해 봐.","연속 정답 달성하면 나도 축하 춤 춰 줄게.","정답의 열쇠는 '왜 그게 맞는지' 설명하는 거야.","내가 자주 말하는 단어? 정답, 오답, 복습!","나랑 노는 것도 좋은데 문제도 풀자 ㅋㅋ."]};
 const commonTypos=[["웬지","왠지","'왜인지'에서 줄었어."],["왠일","웬일","'어찌 된 일'은 '웬일'이야."],["왠만하면","웬만하면","'웬만하다'에서 왔어."],["금새","금세","'금시에'에서 줄었어."],["어떻해","어떡해","'어떻게 해'의 준말이야."],["어떡해 풀지","어떻게 풀지","방법을 물을 때는 '어떻게'를 써."],["않 해","안 해","'안'은 '아니'의 준말이야."],["않 보여","안 보여","부정 부사 '안'을 써야지."],["깨끗히","깨끗이","'깨끗이'가 바른 부사야."],["갖어","가져","'가지다'의 활용은 '가져'야."],["낫설다","낯설다","바른 표기는 '낯설다'야."]];
 const friendlyPrefixes=['ㅋㅋ 잠깐! ','📢 맞춘범 속보! ','아니 진짜, ','국어왕의 조언: '];
 // Two rephrasings of the pre-existing corpus plus genuinely new lines.
 for(const pool of [homeLines,prompts,right,wrong,chatting]){
  const original=[...pool];
  original.forEach((line,i)=>{
   pool.push(friendlyPrefixes[i%friendlyPrefixes.length]+line);
   pool.push(friendlyPrefixes[(i+2)%friendlyPrefixes.length]+line);
  });
 }
 for(const [pool,lines] of [[homeLines,extraBanter.home],[prompts,extraBanter.prompts],
                            [right,extraBanter.right],[wrong,extraBanter.wrong],[chatting,extraBanter.chatting]])pool.push(...lines);
 for(const [bad,good,reason] of commonTypos){
  homeLines.push("인터넷 댓글 맞춤법 단속! '"+bad+"' 대신 '"+good+"'이야. ㅋㅋ");
  homeLines.push("아니 '"+bad+"'라고 썼어? '"+good+"'으로 고치자.");
  chatting.push("오늘의 오타 제보: '"+bad+"' → '"+good+"'. "+reason);
  chatting.push("나한테 물어봤으니 알려 줄게. '"+good+"'! "+reason);
  prompts.push("인터넷에서 '"+bad+"' 본 적 있어? 바른 표현 '"+good+"'도 기억하자.");
 }
 let lastHome=bubble.textContent;
 function homeSay(){
  const next=oneOf(homeLines,lastHome);
  lastHome=next;
  bubble.textContent=next;
  if(!reduceMotion()){
   bubble.classList.remove('mb-speech-pop');
   void bubble.offsetWidth;
   bubble.classList.add('mb-speech-pop');
  }
 }
 function homeReact(){
  homeSay();
  playMotion(mascot,oneOf(motions));
 }
 mascot.addEventListener('click',homeReact);
 mascot.addEventListener('keydown',event=>{
  if(event.key==='Enter'||event.key===' '){event.preventDefault();homeReact();}
 });
 home.querySelector('.home-card-grid')?.addEventListener('click',()=>{
  homeSay();playMotion(mascot,'cheer');
 });
 home.querySelector('.home-actions')?.addEventListener('click',()=>{
  homeSay();playMotion(mascot,'hop');
 });
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)bubble.classList.remove('mb-speech-pop')});
 setInterval(()=>{
  if(document.hidden || !home.getClientRects().length || reduceMotion())return;
  homeSay();
  playMotion(mascot,oneOf(['nod','think','sway','stretch','salute','peek','moonwalk','bop','suspicious']));
 },6800);
 const quizView=document.getElementById('view-quiz');
 const question=document.getElementById('questionPrompt');
 const feedback=document.getElementById('feedback');
 if(!quizView||!question||!feedback)return;
 if(quizView.querySelector('.mb-quiz-companion'))return;
 const companion=document.createElement('aside');
 companion.className='mb-quiz-companion';
 companion.setAttribute('aria-label','맛춘범 캐릭터 응원');
 const characterButton=document.createElement('button');
 characterButton.type='button';
 characterButton.className='mb-mascot-button';
 characterButton.setAttribute('aria-label','맛춘범 캐릭터와 대화하기');
 characterButton.title='눌러서 캐릭터와 대화하기';
 const characterImage=document.createElement('img');
 characterImage.src=imgSource;
 characterImage.alt='맛춘범 캐릭터';
 characterImage.draggable=false;
 characterButton.append(characterImage);
 const dialogue=document.createElement('div');
 dialogue.className='mb-quiz-speech';
 dialogue.setAttribute('role','status');
 dialogue.setAttribute('aria-live','polite');
 dialogue.textContent='문제를 잘 읽어 봐! 난 옆에서 응원할게. 🧠';
 const hint=document.createElement('p');
 hint.className='mb-quiz-hint';
 hint.textContent='캐릭터를 눌러서 대화하기';
 companion.append(characterButton,dialogue,hint);
 quizView.append(companion);
 let lastPhase='',lastLine=dialogue.textContent,scheduled=false;
 function say(lines,motion){
  lastLine=oneOf(lines,lastLine);
  dialogue.textContent=lastLine;
  if(motion)playMotion(characterButton,motion);
 }
 function announce(){
  if(quizView.hidden || !quizView.getClientRects().length)return;
  const phase=feedback.hidden?'question':feedback.classList.contains('bad')?'wrong':'right';
  const signature=phase+'|'+question.textContent.trim()+'|'+(document.getElementById('quizPosition')?.textContent||'');
  if(signature===lastPhase)return;
  lastPhase=signature;
  if(phase==='right')say(right,oneOf(['cheer','hop','wiggle','victory','zoom','bop']));
  else if(phase==='wrong')say(wrong,oneOf(['surprise','think','nod','stumble','shudder','bow']));
  else say(prompts,oneOf(['nod','think','sway','peek','salute','suspicious']));
 }
 function scheduleAnnouncement(){
  if(scheduled)return;
  scheduled=true;
  queueMicrotask(()=>{scheduled=false;announce()});
 }
 characterButton.addEventListener('click',()=>say(chatting,oneOf(motions)));
 const observer=new MutationObserver(scheduleAnnouncement);
 observer.observe(question,{childList:true,characterData:true,subtree:true});
 observer.observe(feedback,{childList:true,attributes:true,attributeFilter:['hidden','class'],subtree:true});
 observer.observe(quizView,{attributes:true,attributeFilter:['hidden']});
 scheduleAnnouncement();

 // Playful reminders also run during quizzes, but never cover the question.
 setInterval(()=>{
  if(document.hidden || quizView.hidden || !quizView.getClientRects().length)return;
  const lines=feedback.hidden?prompts:feedback.classList.contains('bad')?wrong:right;
  say(lines,oneOf(['nod','think','wiggle','sway','stretch']));
 },8100);
})();

/* Achievements v1: independent, persistent, event-based, no changes to quiz data. */
(()=>{
 'use strict';
 if(window.__munbubAchievementsV1)return;
 window.__munbubAchievementsV1=true;
 const KEY='munbub_achievements_v1';
 const $=id=>document.getElementById(id);
 const defaults={visits:0,quizStarts:0,timedStarts:0,answers:0,correct:0,wrong:0,streak:0,bestStreak:0,chatClicks:0,unlocked:{}};
 let loaded={};
 try{loaded=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(_){}
 const state={...defaults,...loaded,unlocked:{...(loaded.unlocked||{})}};
 for(const k of Object.keys(defaults)){
  if(k==='unlocked')continue;
  state[k]=Number.isFinite(Number(state[k]))?Math.max(0,Math.floor(Number(state[k]))):0;
 }
 const awards=[
  {id:'visit1',icon:'👋',name:'출석 완료',hint:'맛춘범에 접속하기',test:()=>state.visits>=1},
  {id:'visit3',icon:'🏠',name:'단골손님',hint:'서로 다른 날이 아니어도 총 3회 접속하기',test:()=>state.visits>=3},
  {id:'quiz1',icon:'🧭',name:'첫 도전',hint:'문제 풀이 시작하기',test:()=>state.quizStarts>=1},
  {id:'answer1',icon:'📖',name:'첫 문제 완료',hint:'문제 1개 풀기',test:()=>state.answers>=1},
  {id:'right1',icon:'✨',name:'첫 정답',hint:'처음으로 정답 맞히기',test:()=>state.correct>=1},
  {id:'wrong1',icon:'📝',name:'오답도 경험치',hint:'오답 1개 기록하기',test:()=>state.wrong>=1},
  {id:'answers10',icon:'🎯',name:'워밍업 끝',hint:'문제 10개 풀기',test:()=>state.answers>=10},
  {id:'answers50',icon:'⚔️',name:'문제 사냥꾼',hint:'문제 50개 풀기',test:()=>state.answers>=50},
  {id:'answers100',icon:'🏆',name:'백문이 불여일풀',hint:'문제 100개 풀기',test:()=>state.answers>=100},
  {id:'right30',icon:'🌟',name:'정답 감별사',hint:'정답 30개 맞히기',test:()=>state.correct>=30},
  {id:'streak3',icon:'🔥',name:'3연승',hint:'3문제 연속 정답',test:()=>state.bestStreak>=3},
  {id:'streak7',icon:'🚀',name:'정답 급행열차',hint:'7문제 연속 정답',test:()=>state.bestStreak>=7},
  {id:'streak15',icon:'👑',name:'연승 폭주 기관차',hint:'15문제 연속 정답',test:()=>state.bestStreak>=15},
  {id:'chat1',icon:'💬',name:'말 좀 걸어 봐',hint:'캐릭터를 1회 클릭하기',test:()=>state.chatClicks>=1},
  {id:'chat10',icon:'🗣️',name:'수다 동료',hint:'캐릭터를 10회 클릭하기',test:()=>state.chatClicks>=10},
  {id:'chat30',icon:'🎤',name:'드립 대폭주',hint:'캐릭터를 30회 클릭하기',test:()=>state.chatClicks>=30},
  {id:'timed1',icon:'⏱️',name:'시간과의 승부',hint:'시간제한 도전 시작하기',test:()=>state.timedStarts>=1},
  {id:"visit5",icon:"🏠",name:"단골 입장",hint:"누적 5회 방문",test:()=>state.visits>=5},
  {id:"visit10",icon:"🎟️",name:"열 번째 출석",hint:"누적 10회 방문",test:()=>state.visits>=10},
  {id:"visit25",icon:"🛋️",name:"국어방 주민",hint:"누적 25회 방문",test:()=>state.visits>=25},
  {id:"quiz3",icon:"🎮",name:"세 번째 판",hint:"퀴즈 3회 시작",test:()=>state.quizStarts>=3},
  {id:"quiz10",icon:"🧩",name:"퀴즈 수집가",hint:"퀴즈 10회 시작",test:()=>state.quizStarts>=10},
  {id:"quiz25",icon:"🏟️",name:"고인물 입문",hint:"퀴즈 25회 시작",test:()=>state.quizStarts>=25},
  {id:"timed3",icon:"⌛",name:"시간 압박 숙련",hint:"시간제한 3회 시작",test:()=>state.timedStarts>=3},
  {id:"timed10",icon:"⏱️",name:"타임어택 장인",hint:"시간제한 10회 시작",test:()=>state.timedStarts>=10},
  {id:"answers5",icon:"✏️",name:"몸풀기",hint:"누적 5문제 풀이",test:()=>state.answers>=5},
  {id:"answers25",icon:"📗",name:"국어 시동",hint:"누적 25문제 풀이",test:()=>state.answers>=25},
  {id:"answers200",icon:"📚",name:"문제책 정복자",hint:"누적 200문제 풀이",test:()=>state.answers>=200},
  {id:"answers500",icon:"🏛️",name:"문제은행 탐험가",hint:"누적 500문제 풀이",test:()=>state.answers>=500},
  {id:"answers1000",icon:"🌌",name:"천 문제의 기록",hint:"누적 1,000문제 풀이",test:()=>state.answers>=1000},
  {id:"right5",icon:"🎯",name:"첫 다섯 정답",hint:"누적 정답 5개",test:()=>state.correct>=5},
  {id:"right10",icon:"💡",name:"정답 감별력",hint:"누적 정답 10개",test:()=>state.correct>=10},
  {id:"right50",icon:"🥇",name:"50 정답 달성",hint:"누적 정답 50개",test:()=>state.correct>=50},
  {id:"right100",icon:"👑",name:"정답 100개",hint:"누적 정답 100개",test:()=>state.correct>=100},
  {id:"right300",icon:"🌠",name:"국어 달인 수련",hint:"누적 정답 300개",test:()=>state.correct>=300},
  {id:"wrong5",icon:"🔍",name:"함정 분석가",hint:"누적 오답 5개",test:()=>state.wrong>=5},
  {id:"wrong20",icon:"🧠",name:"오답 기록 박사",hint:"누적 오답 20개",test:()=>state.wrong>=20},
  {id:"streak2",icon:"🔸",name:"연승의 싹",hint:"2문제 연속 정답",test:()=>state.bestStreak>=2},
  {id:"streak5",icon:"⚡",name:"5연승",hint:"5문제 연속 정답",test:()=>state.bestStreak>=5},
  {id:"streak10",icon:"💥",name:"열 번의 집중력",hint:"10문제 연속 정답",test:()=>state.bestStreak>=10},
  {id:"streak20",icon:"🌈",name:"연승 전설",hint:"20문제 연속 정답",test:()=>state.bestStreak>=20},
  {id:"chat5",icon:"☕",name:"수다 시작",hint:"캐릭터를 5회 클릭하기",test:()=>state.chatClicks>=5},
  {id:"chat20",icon:"📢",name:"말풍선 단골",hint:"캐릭터를 20회 클릭하기",test:()=>state.chatClicks>=20},
  {id:"chat50",icon:"🎙️",name:"드립 방송국",hint:"캐릭터를 50회 클릭하기",test:()=>state.chatClicks>=50},
  {id:"chat100",icon:"🎪",name:"백 번의 드립",hint:"캐릭터를 100회 클릭하기",test:()=>state.chatClicks>=100}
 ];
 const style=document.createElement('style');
 style.id='mb-achievements-v1';
 style.textContent=[
  '#mb-achievement-launch{position:fixed;right:16px;top:calc(14px + env(safe-area-inset-top));bottom:auto!important;z-index:950;padding:10px 15px;border:3px solid #7d4c38;border-radius:30px;background:linear-gradient(#ffedc4,#e3a978);color:#3a2524;font-weight:950;font-size:14px;line-height:1.2;cursor:pointer;box-shadow:0 4px 0 #382021,0 6px 14px #120b124d;transition:transform .14s,filter .14s;touch-action:manipulation}',
  '#mb-achievement-launch:hover{transform:translateY(-2px) scale(1.04);filter:brightness(1.08)}',
  '#mb-achievement-launch:active{transform:translateY(2px) scale(.97)}',
  '#mb-achievement-dialog{box-sizing:border-box;width:min(92vw,720px);max-height:min(84vh,760px);padding:0;border:4px solid #7b4a39;border-radius:21px;background:#fff1d9;color:#392729;box-shadow:0 18px 70px #100b10bb;overflow:auto}',
  '#mb-achievement-dialog::backdrop{background:rgba(12,8,14,.75)}',
  '#mb-achievement-dialog .mb-award-head{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:17px 20px;background:#f7d2a9;border-bottom:3px solid #9f6d54}',
  '#mb-achievement-dialog h2{margin:0;font-size:clamp(20px,3vw,29px)}',
  '#mb-achievement-dialog .mb-award-close{display:grid;place-items:center;width:40px;height:40px;flex:none;background:#653e39;color:#fff4e6;border:0;border-radius:12px;font-size:23px;cursor:pointer}',
  '#mb-achievement-dialog .mb-award-desc{margin:12px 18px;color:#654b40;font-weight:700;line-height:1.5}',
  '#mb-achievement-dialog .mb-award-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px;padding:10px 16px 20px}',
  '#mb-achievement-dialog .mb-award-card{min-width:0;padding:12px;border:2px solid #a98269;border-radius:13px;background:#fffbf0;display:flex;gap:10px;align-items:flex-start}',
  '#mb-achievement-dialog .mb-award-card.locked{filter:grayscale(.9);opacity:.62;background:#e9dfce}',
  '#mb-achievement-dialog .mb-award-emoji{flex:none;font-size:30px;line-height:1.3}',
  '#mb-achievement-dialog .mb-award-card strong{display:block;font-size:15px}',
  '#mb-achievement-dialog .mb-award-card small{display:block;margin-top:4px;line-height:1.4;color:#634d46;font-size:12px}',
  '#mb-achievement-dialog .mb-award-progress{font-size:13px;font-weight:850;color:#5c3931;white-space:nowrap}',
  '#mb-achievement-dialog .mb-award-summary{margin:0;padding:0 18px 16px;font-size:14px;color:#5f4538}',
  '#mb-achievement-toast{position:fixed;left:50%;bottom:92px;transform:translateX(-50%);z-index:1600;display:none;max-width:min(90vw,390px);width:max-content;box-sizing:border-box;padding:14px 19px;border:3px solid #f9d491;border-radius:16px;background:#39242b;color:#fff1cf;box-shadow:0 9px 30px #080708b5;text-align:center;line-height:1.45;font-weight:900;pointer-events:none}',
  '#mb-achievement-toast.show{display:block;animation:mb-award-rise .36s ease both}',
  '@keyframes mb-award-rise{from{opacity:0;transform:translate(-50%,15px) scale(.88)}to{opacity:1;transform:translate(-50%,0) scale(1)}}',
  '@media(max-width:700px){#mb-achievement-launch{right:10px;top:calc(10px + env(safe-area-inset-top));bottom:auto!important;padding:7px 10px;font-size:12px}#mb-achievement-dialog .mb-award-list{grid-template-columns:1fr;gap:8px}#mb-achievement-dialog .mb-award-head{padding:12px 14px}#mb-achievement-toast{bottom:calc(155px + env(safe-area-inset-bottom))}}',
  '@media(prefers-reduced-motion:reduce){#mb-achievement-toast.show{animation:none}#mb-achievement-launch{transition:none}}'
 ].join('\n');
 document.head.append(style);
 const launch=document.createElement('button');
 launch.type='button';launch.id='mb-achievement-launch';launch.setAttribute('aria-label','업적 도감 열기');
 const dialog=document.createElement('dialog');
 dialog.id='mb-achievement-dialog';dialog.setAttribute('aria-label','맛춘범 업적 도감');
 dialog.innerHTML='<div class="mb-award-head"><h2>🏆 맛춘범 업적 도감</h2><button type="button" class="mb-award-close" aria-label="업적 닫기">✕</button></div><p class="mb-award-desc">문제와 수다로 업적을 모아 보자! 이 브라우저에 자동 저장돼.</p><div class="mb-award-list"></div><p class="mb-award-summary"></p>';
 const toast=document.createElement('div');
 toast.id='mb-achievement-toast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');
 document.body.append(launch,dialog,toast);
 const count=()=>awards.filter(a=>state.unlocked[a.id]).length;
 function render(){
  launch.textContent='🏆 업적 '+count()+'/'+awards.length;
  const progress=dialog.querySelector('.mb-award-list');
  if(progress)progress.innerHTML=awards.map(a=>'<article class="mb-award-card'+(state.unlocked[a.id]?'':' locked')+'"><span class="mb-award-emoji">'+(state.unlocked[a.id]?a.icon:'🔒')+'</span><div><strong>'+a.name+'</strong><small>'+a.hint+'</small></div></article>').join('');
  const summary=dialog.querySelector('.mb-award-summary');
  if(summary)summary.textContent='누적 문제 '+state.answers+'개 · 정답 '+state.correct+'개 · 최고 연속 정답 '+state.bestStreak+'개 · 캐릭터 대화 '+state.chatClicks+'회';
 }
 const pending=[];
 let initializing=true;
 const hadPriorProgress=Number(loaded.visits||0)>0;
 let toastTimer=null;
 function nextToast(){
  if(toastTimer!==null||!pending.length)return;
  const a=pending.shift();
  toast.textContent='🏆 업적 달성! '+a.icon+' '+a.name;
  toast.classList.add('show');
  toastTimer=setTimeout(()=>{
   toast.classList.remove('show');toastTimer=null;nextToast();
  },2900);
 }
 function saveAndEvaluate(){
  for(const a of awards)if(!state.unlocked[a.id]&&a.test()){
   state.unlocked[a.id]=Date.now();if(!(initializing&&hadPriorProgress))pending.push(a);
  }
  try{localStorage.setItem(KEY,JSON.stringify(state))}catch(_){}
  render();nextToast();
 }
 launch.addEventListener('click',()=>{render();if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','')});
 dialog.querySelector('.mb-award-close')?.addEventListener('click',()=>{if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open')});
 dialog.addEventListener('click',e=>{
  if(e.target===dialog && typeof dialog.close==='function')dialog.close();
 });
 const homeMascot=document.querySelector('#homeScreen .hero-character');
 const quizMascot=document.querySelector('#view-quiz .mb-mascot-button');
 function recordChat(){state.chatClicks++;saveAndEvaluate()}
 homeMascot?.addEventListener('click',recordChat);
 homeMascot?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')recordChat()});
 quizMascot?.addEventListener('click',recordChat);
 const originalStart=window.startSession;
 if(typeof originalStart==='function' && !originalStart.__mbAchievementWrapped){
  const wrapped=function(...args){
   const result=originalStart.apply(this,args);
   state.quizStarts++;
   if(args[0]&&args[0].timed)state.timedStarts++;
   saveAndEvaluate();
   return result;
  };
  wrapped.__mbAchievementWrapped=true;
  window.startSession=wrapped;
 }
 const feedback=$('feedback'),quiz=$('view-quiz');
 const question=$('questionPrompt'),position=$('quizPosition');
 if(feedback && quiz){
  let visible=feedback.hidden===false;
  let lastAnswerKey='',lastAnswerAt=0;
  const onAnswer=()=>{
   const nowVisible=feedback.hidden===false;
   if(!nowVisible){visible=false;return}
   if(visible)return;
   visible=true;
   if(quiz.hidden)return;
   const key=(question?.textContent||'').trim()+'|'+(position?.textContent||'').trim()+'|'+feedback.className;
   const now=Date.now();
   if(key===lastAnswerKey&&now-lastAnswerAt<900)return;
   lastAnswerKey=key;lastAnswerAt=now;
   const wrong=feedback.classList.contains('bad');
   state.answers++;
   if(wrong){state.wrong++;state.streak=0}
   else{state.correct++;state.streak++;state.bestStreak=Math.max(state.bestStreak,state.streak)}
   saveAndEvaluate();
  };
  const observer=new MutationObserver(onAnswer);
  observer.observe(feedback,{attributes:true,attributeFilter:['hidden','class'],childList:true,subtree:true});
  observer.observe(quiz,{attributes:true,attributeFilter:['hidden']});
 }
 state.visits++;
 saveAndEvaluate();
 initializing=false;
})();

/* Result impact v1. Feedback visibility is the source of truth. */
(()=>{
 'use strict';
 if(window.__munbubResultImpactV1)return;
 window.__munbubResultImpactV1=true;
 const feedback=document.getElementById('feedback');
 const quiz=document.getElementById('view-quiz');
 if(!feedback || !quiz)return;
 const style=document.createElement('style');
 style.id='mb-result-impact-v1';
 style.textContent=[
  '#workspace #feedback:not([hidden]){border-width:4px!important;border-style:solid!important;border-radius:17px!important;box-shadow:0 7px 0 #1b131b55,0 0 0 4px #fff3d6!important;transform-origin:center;animation:mb-feedback-appear .4s cubic-bezier(.17,.8,.28,1) both}',
  '#workspace #feedback:not([hidden]):not(.bad){background:#ddffe0!important;border-color:#16753b!important;color:#17472a!important}',
  '#workspace #feedback.bad:not([hidden]){background:#ffe0db!important;border-color:#b52e33!important;color:#7f1721!important}',
  '#workspace #feedback:not([hidden])::before{display:inline-block!important;margin-right:12px!important;font-size:clamp(22px,2.8vw,37px)!important;font-weight:1000!important;vertical-align:middle}',
  '#workspace #feedback:not([hidden]):not(.bad)::before{content:"✔"!important}',
  '#workspace #feedback.bad:not([hidden])::before{content:"✖"!important}',
  '#workspace #view-quiz.mb-answer-good>.panel{animation:mb-answer-glow-good .8s ease both!important}',
  '#workspace #view-quiz.mb-answer-bad>.panel{animation:mb-answer-glow-bad .8s ease both!important}',
  '#mb-answer-impact{position:fixed;top:clamp(68px,12vh,130px);left:50%;z-index:2147482800;transform:translateX(-50%);min-width:min(75vw,270px);width:max-content;max-width:92vw;box-sizing:border-box;border:5px solid #fff7df;border-radius:22px;padding:12px 21px;text-align:center;line-height:1.3;font-weight:1000;font-size:clamp(21px,3vw,34px);letter-spacing:.02em;box-shadow:0 7px 0 #170e15,0 16px 34px #110b16aa;pointer-events:none;opacity:0;visibility:hidden}',
  '#mb-answer-impact.mb-result-visible{visibility:visible;animation:mb-impact-pop 1.45s cubic-bezier(.2,.8,.25,1) both}',
  '#mb-answer-impact.mb-hit-good{background:#228e51;color:#fffbe8;text-shadow:1px 2px #125c32}',
  '#mb-answer-impact.mb-hit-bad{background:#b32e40;color:#fff8df;text-shadow:1px 2px #692033}',
  '@keyframes mb-feedback-appear{from{transform:translateY(10px) scale(.97);opacity:.5}to{transform:translateY(0) scale(1);opacity:1}}',
  '@keyframes mb-answer-glow-good{0%{box-shadow:0 0 0 0 #53e17b}45%{box-shadow:0 0 0 8px #53e17b99,0 0 36px #3bd872aa}100%{box-shadow:0 0 0 0 #53e17b00}}',
  '@keyframes mb-answer-glow-bad{0%{box-shadow:0 0 0 0 #eb6060}45%{box-shadow:0 0 0 8px #eb606099,0 0 36px #f44a4aaa}100%{box-shadow:0 0 0 0 #eb606000}}',
  '@keyframes mb-impact-pop{0%{opacity:0;transform:translate(-50%,-23px) scale(.58)}16%{opacity:1;transform:translate(-50%,3px) scale(1.12)}28%,78%{opacity:1;transform:translate(-50%,0) scale(1)}100%{opacity:0;transform:translate(-50%,-16px) scale(.92)}}',
  '@media(prefers-reduced-motion:reduce){#mb-answer-impact.mb-result-visible,#workspace #view-quiz.mb-answer-good>.panel,#workspace #view-quiz.mb-answer-bad>.panel,#workspace #feedback:not([hidden]){animation:none!important}#mb-answer-impact.mb-result-visible{opacity:1}}'
 ].join('\n');
 document.head.append(style);
 const overlay=document.createElement('div');
 overlay.id='mb-answer-impact';
 overlay.setAttribute('role','status');
 overlay.setAttribute('aria-live','assertive');
 document.body.append(overlay);
 let ctx=null;
 function audio(){
  try{
   const Audio=window.AudioContext||window.webkitAudioContext;
   if(!Audio)return null;
   if(!ctx)ctx=new Audio();
   if(ctx.state==='suspended')ctx.resume().catch(()=>{});
   return ctx;
  }catch(_){return null}
 }
 // Unlock audio only from a real user gesture, never force playback on page load.
 const unlock=()=>{if(!quiz.hidden)audio()};
 document.addEventListener('pointerdown',unlock,{passive:true});
 document.addEventListener('keydown',unlock,{passive:true});
 function effectVolume(){
  const v=Number(document.getElementById('bgmVolume')?.value);
  return Number.isFinite(v)?Math.max(0,Math.min(1,v/100)):.35;
 }
 function playResultSound(correct){
  const a=audio();if(!a)return;
  const level=effectVolume();
  if(level<=0)return;
  const now=a.currentTime+.015;
  const tones=correct?[[660,0,.1,'sine'],[830,.105,.11,'triangle'],[990,.22,.21,'sine']]:[[355,0,.14,'triangle'],[265,.12,.2,'sawtooth']];
  for(const [hz,offset,duration,wave] of tones){
   const osc=a.createOscillator(),gain=a.createGain();
   osc.type=wave;osc.frequency.setValueAtTime(hz,now+offset);
   const peak=(correct?.11:.05)*level;
   gain.gain.setValueAtTime(.0001,now+offset);
   gain.gain.exponentialRampToValueAtTime(Math.max(.0002,peak),now+offset+.014);
   gain.gain.exponentialRampToValueAtTime(.0001,now+offset+duration);
   osc.connect(gain).connect(a.destination);
   osc.start(now+offset);
   osc.stop(now+offset+duration+.02);
  }
 }
 let wasVisible=!feedback.hidden,previous='',lastTime=0,removeTimer=null;
 function observeAnswer(){
  const showing=!feedback.hidden && !quiz.hidden;
  if(!showing){wasVisible=false;return}
  if(wasVisible)return;
  wasVisible=true;
  const question=document.getElementById('questionPrompt')?.textContent?.trim()||'';
  const position=document.getElementById('quizPosition')?.textContent?.trim()||'';
  const wrong=feedback.classList.contains('bad');
  const key=question+'|'+position+'|'+(wrong?'bad':'good');
  const now=Date.now();
  if(key===previous&&now-lastTime<850)return;
  previous=key;lastTime=now;
  const type=wrong?'bad':'good';
  overlay.className='mb-hit-'+type;
  overlay.textContent=wrong?'✖ 오답! 다시 도전!':'✔ 정답! 완벽해!';
  // Force the CSS entrance keyframe to restart on every new answer.
  void overlay.offsetWidth;
  overlay.classList.add('mb-result-visible');
  quiz.classList.remove('mb-answer-good','mb-answer-bad');
  void quiz.offsetWidth;
  quiz.classList.add(wrong?'mb-answer-bad':'mb-answer-good');
  clearTimeout(removeTimer);
  removeTimer=setTimeout(()=>{
   overlay.classList.remove('mb-result-visible');
   quiz.classList.remove('mb-answer-good','mb-answer-bad');
  },1550);
  playResultSound(!wrong);
 }
 const observer=new MutationObserver(observeAnswer);
 observer.observe(feedback,{attributes:true,attributeFilter:['class','hidden'],childList:true,subtree:true});
 observer.observe(quiz,{attributes:true,attributeFilter:['hidden']});
})();
