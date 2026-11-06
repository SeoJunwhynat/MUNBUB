/* Scenes v1: 1) supplied brushwork title; 2) seamless, drifting night library;
 * 3) fixed daylight duel arena when the online match opens.
 * The 4344x724 seamless strip comes directly from the supplied HTML simulation.
 */
(()=>{
 'use strict';
 if(window.__mbScene2026)return;
 window.__mbScene2026=true;
 const TITLE='./ui-assets/title-brush.webp';
 const NIGHT='./ui-assets/home-night-loop.webp';
 const ARENA='./ui-assets/duel-arena.webp';
 const $=selector=>document.querySelector(selector);
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 const style=document.createElement('style');
 style.id='mb-scene-2026';
 style.textContent=[
  'body{background:#20141b!important}',
  '#mb-night-scene{position:fixed;inset:0;z-index:0;pointer-events:none;background-image:url("'+NIGHT+'");background-position:0px center;background-size:auto 100%;background-repeat:repeat-x;opacity:.96;will-change:background-position}',
  '#homeScreen,#workspace{position:relative;z-index:1}',
  '#homeScreen{background-color:transparent!important;background-image:none!important}',
  '#workspace{background-color:rgba(29,17,24,.28)!important;background-image:none!important}',
  '#homeScreen .home-main{background:linear-gradient(90deg,rgba(30,18,24,.48),rgba(32,19,25,.53))!important;padding-top:clamp(9px,1vw,14px)!important;padding-bottom:clamp(14px,1.5vw,19px)!important}',
  '#homeScreen .home-main>.mb-home-dashboard{margin-bottom:0!important;row-gap:3px!important}',
  '#homeScreen .mobile-top-logo{display:none!important}',
  '#homeScreen .mb-home-dashboard>.mb-mascot-stage{gap:clamp(4px,.5vw,7px)!important}',
  '#homeScreen .mb-home-dashboard>.mb-dashboard-left{gap:clamp(4px,.55vw,7px)!important}',
  '#homeScreen .home-main>.home-card-grid{margin-top:0!important;margin-bottom:0!important;gap:clamp(5px,.6vw,9px)!important}',
  '#homeScreen .home-main>.home-actions{margin-top:3px!important;gap:clamp(5px,.6vw,9px)!important}',
  '#homeScreen .mb-dashboard-left>.home-hero{height:clamp(117px,14.2vw,174px)!important}',
  '#homeScreen .home-hero .hero-scroll{position:absolute!important;left:0!important;right:0!important;top:1%!important;width:100%!important;height:98%!important;max-width:100%!important;max-height:98%!important;object-fit:contain!important;object-position:center center!important;filter:none!important}',
  '#homeScreen .home-hero .hero-moon,#homeScreen .home-hero .hero-cloud{display:none!important}',
  '#homeScreen .sidebar .logo,#workspace .sidebar .logo{object-fit:contain!important;object-position:center center!important}',
  '.floating-bgm,#bgmQuick{display:none!important}',
  '#mb-duel-dialog::backdrop{background:linear-gradient(0deg,rgba(20,11,15,.43),rgba(20,11,15,.38)),url("'+ARENA+'") center center/cover no-repeat!important}',
  '#mb-duel-dialog{background:linear-gradient(140deg,rgba(255,236,209,.91),rgba(252,235,213,.93)),url("'+ARENA+'") center center/cover no-repeat!important}',
  '#mb-duel-dialog .mb-duel-panel{background:rgba(255,246,230,.94)!important;backdrop-filter:blur(2px)}',
  '@media(max-width:1100px){#homeScreen .mb-dashboard-left>.home-hero{height:clamp(100px,13vw,157px)!important}#homeScreen .home-main{padding-top:10px!important}}',
  '@media(max-width:700px){#homeScreen .home-main{background:rgba(30,18,25,.52)!important;padding-top:8px!important}#homeScreen .mb-dashboard-left>.home-hero{height:clamp(78px,24vw,134px)!important}#homeScreen .home-main>.mb-home-dashboard{row-gap:4px!important}#homeScreen .home-main>.home-card-grid{margin-top:0!important}#homeScreen .home-main>.home-actions{margin-top:3px!important}}',
  // HOME BUTTONS ALIGNED v20261106: same image width, original aspect ratios and no duplicate controls.
  // Reserve space BELOW the unchanged title; flex-flow positioning replaces the old top offsets.
  '@media(min-width:701px){#homeScreen#homeScreen .mb-dashboard-left{gap:clamp(9px,1vw,13px)!important}#homeScreen#homeScreen .mb-dashboard-left>:is(.resume-group,.timed-home-wrap,.mb-hard-feature){box-sizing:border-box!important;position:relative!important;top:0!important;width:min(100%,420px)!important;max-width:420px!important;min-width:0!important;min-height:0!important;height:auto!important;align-self:center!important;margin:0 auto!important;padding:0!important;flex:none!important}#homeScreen#homeScreen .mb-dashboard-left>.resume-group{display:flex!important;align-items:center!important;justify-content:center!important}#homeScreen#homeScreen .mb-dashboard-left>.resume-group>#mobileResume{display:none!important}#homeScreen#homeScreen .mb-dashboard-left>.resume-group>#resumeHotspot:not([hidden]){box-sizing:border-box!important;display:block!important;width:100%!important;max-width:100%!important;height:auto!important;min-height:0!important;aspect-ratio:660/162!important;background-size:contain!important}#homeScreen#homeScreen .mb-dashboard-left>.timed-home-wrap>.timed-home-btn{box-sizing:border-box!important;width:100%!important;max-width:100%!important;height:auto!important;min-height:0!important;aspect-ratio:266/46!important;background-size:contain!important}#homeScreen#homeScreen .mb-dashboard-left>.mb-hard-feature{aspect-ratio:1024/341!important;background-size:contain!important;margin-bottom:clamp(7px,.75vw,11px)!important}}',
  '@media(min-width:1101px){#homeScreen#homeScreen .mb-dashboard-left>.home-hero .hero-scroll{transform:translateX(25px) scale(1.25)!important;transform-origin:50% 0!important;pointer-events:none!important}#homeScreen#homeScreen .mb-dashboard-left>.resume-group{margin-top:clamp(38px,3.6vw,52px)!important}}',
  '@media(min-width:701px) and (max-width:1100px){#homeScreen#homeScreen .mb-dashboard-left>.home-hero .hero-scroll{transform:scale(1.14)!important;transform-origin:50% 0!important;pointer-events:none!important}#homeScreen#homeScreen .mb-dashboard-left>.resume-group{margin-top:clamp(21px,2.8vw,31px)!important}}',
  '@media(max-width:700px){#homeScreen#homeScreen .mb-dashboard-left>.home-hero .hero-scroll{transform:none!important}#homeScreen#homeScreen .mb-dashboard-left>.timed-home-wrap,#homeScreen#homeScreen .mb-dashboard-left>.mb-hard-feature{top:0!important}#homeScreen#homeScreen .mb-dashboard-left>.resume-group>#resumeHotspot{display:none!important}#homeScreen#homeScreen .mb-dashboard-left>.resume-group>#mobileResume:not([hidden]){display:block!important;width:100%!important;max-width:100%!important;height:auto!important;aspect-ratio:660/162!important;background-size:contain!important}}',
  '@media(prefers-reduced-motion:reduce){#mb-night-scene{will-change:auto}}'
 ].join('\n');
 document.head.append(style);
 // Do not clone old buttons or replace their event handlers; change image src only.
 function installTitle(){
  const hero=$('#homeScreen .home-hero .hero-scroll');
  if(hero){hero.src=TITLE;hero.alt='맛춘범 붓글씨 로고';hero.decoding='async'}
  document.querySelectorAll('img.logo,img.mobile-top-logo,img.work-mobile-logo').forEach(img=>{
   img.src=TITLE;img.alt='맛춘범';img.decoding='async';
  });
 }
 installTitle();
 // RESUME ALWAYS VISIBLE v20261106. The original index.html hides both buttons when
 // store.active is null; wrap its progress refresh, rather than cloning controls.
 (function installPersistentResumeControl(){
  if(window.__mbResumeAlwaysVisible20261106)return;
  window.__mbResumeAlwaysVisible20261106=true;
  const ids=['resumeHotspot','mobileResume'];
  const showButtons=()=>{
   for(const id of ids){const btn=document.getElementById(id);if(btn)btn.hidden=false}
  };
  const originalProgress=window.updateHomeProgress;
  if(typeof originalProgress==='function'){
   window.updateHomeProgress=function(...args){
    const result=originalProgress.apply(this,args);
    showButtons();
    return result;
   };
  }
  function currentNormalSession(){
   try{
    const saved=JSON.parse(window.localStorage.getItem('matchunbeom_v1')||'null');
    const active=saved?.active;
    if(!active||!active.cfg)return {valid:false,ranked:false};
    const cfg=active.cfg;
    if(cfg.ranked||cfg.ranking||cfg.rankedChallenge||
       active.ranked||active.rankedChallenge||active.mode==='ranked'||
       ['ranked','ranking','ranked-infinite','ranked-hardcore','ranked-timed'].includes(cfg.mode)||
       cfg.category==='ranked')return {valid:false,ranked:true};
    const valid=['spelling','idiom','application','all'].includes(cfg.category)&&
       Array.isArray(active.queue)&&active.queue.length>0&&
       (Number(active.index||0)<active.queue.length||!!active.lastFeedback||!!cfg.infinite);
    return {valid,ranked:false};
   }catch{return {valid:false,ranked:false}}
  }
  function showNotice(message){
   if(typeof window.toast==='function'){window.toast(message);return}
   const toastEl=document.getElementById('toast');
   if(toastEl){toastEl.textContent=message;toastEl.classList.add('show');return}
   window.alert?.(message);
  }
  function interceptResume(event){
   const status=currentNormalSession();
   if(status.valid)return; // Retain the ORIGINAL click handler and resume state.
   event.preventDefault();
   event.stopImmediatePropagation();
   showNotice(status.ranked?'랭킹전은 이어서 풀 수 없습니다.':'이전에 풀던 문제가 없습니다!');
  }
  for(const id of ids){
   const btn=document.getElementById(id);
   if(!btn)continue;
   btn.setAttribute('aria-label','풀던 문제 이어서 풀기');
   btn.addEventListener('click',interceptResume,true);
  }
  showButtons();
 })();
 if(!$('#mb-night-scene')){
  const background=document.createElement('div');
  background.id='mb-night-scene';
  background.setAttribute('aria-hidden','true');
  document.body.prepend(background);
 }
 const scene=$('#mb-night-scene');
 const tileWidth=4344,tileHeight=724,speed=130;
 let offset=0,last=0,lastPaint=0,accumulated=0;
 function tick(ms){
  const dt=last?Math.min(.06,(ms-last)/1000):0;
  last=ms;
  const stop=document.hidden||reduced?.matches||!!$('#mb-duel-dialog')?.open;
  if(stop){accumulated=0;lastPaint=ms}
  else{
   accumulated+=dt;
   if(ms-lastPaint>30){
    lastPaint=ms;
    const visualHeight=window.innerHeight||724;
    const period=tileWidth*visualHeight/tileHeight;
    offset=(offset+speed*accumulated)%period;
    accumulated=0;
    scene.style.backgroundPositionX=(-offset)+'px';
   }
  }
  requestAnimationFrame(tick);
 }
 if(typeof requestAnimationFrame==='function')requestAnimationFrame(tick);
})();