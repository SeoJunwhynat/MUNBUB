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