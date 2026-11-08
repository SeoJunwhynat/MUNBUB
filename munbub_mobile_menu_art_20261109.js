/* Taste mobile drawer: preserve every route, restore art and provide a clean touch list. */
(()=>{
 'use strict';
 if(window.__mbMobileDrawerArtwork20261109)return;
 window.__mbMobileDrawerArtwork20261109=true;
 const css=document.createElement('link');
 css.rel='stylesheet';css.href='/munbub_mobile_menu_art_20261109.css';
 document.head.append(css);
 const MODES={
  home:['🏠 홈','/ui-assets/title-brush.webp'],
  spelling:['📝 맞춤법','/ui-assets/scene_spelling.webp'],
  idiom:['📜 사자성어','/ui-assets/scene_idiom.webp'],
  application:['✍️ 응용문제','/ui-assets/scene_spelling.webp'],
  infinite:['♾️ 무한모드','/ui-assets/scene_infinite.webp'],
  hard:['⚔️ 하드코어','/ui-assets/hardcore-feature.webp'],
  timed:['⏱️ 시간제한','/ui-assets/timed_sidebar_new.png'],
  ranked:['🏆 랭킹전','/ui-assets/mb_ranking_ui.webp'],
  duel:['⚔️ 1대1 대전','/ui-assets/duel-arena.webp'],
  mistakes:['📒 오답노트','/ui-assets/scene_spelling.webp'],
  history:['📚 이전 기록','/ui-assets/title-brush.webp'],
  settings:['⚙️ 설정','/ui-assets/title-brush.webp'],
  ranking:['🏆 랭킹','/ui-assets/mb_ranking_ui.webp'],
  leaderboard:['🏆 순위표','/ui-assets/mb_ranking_ui.webp']
 };
 const BANNERS=new Set(['timed','ranked','hard']);
 function restoreButton(button){
  if(button.dataset.mbMobileArtwork==='ready')return;
  const route=button.dataset.route;
  if(!route)return;
  const info=MODES[route];
  if(!info)return; // Leave unknown navigation routes untouched.
  const [label,asset]=info;
  button.dataset.mbMobileArtwork='ready';
  button.setAttribute('aria-label',button.getAttribute('aria-label')||label);
  if(button.querySelector('img')){
   // Ranked and already illustrated modes own their actual image source.
   button.classList.add('mb-mobile-existing-art');
   return;
  }
  const img=document.createElement('img');
  img.className=BANNERS.has(route)?'mb-mobile-mode-art':'mb-mobile-mode-thumb';
  img.src=asset;img.alt='';img.loading='eager';img.decoding='async';
  img.addEventListener('error',()=>{
   button.classList.add('mb-mobile-art-missing');
   img.remove();
  },{once:true});
  const caption=document.createElement('span');
  caption.className='mb-mobile-mode-label';
  caption.textContent=label;
  button.classList.add(BANNERS.has(route)?'mb-mobile-mode-banner':'mb-mobile-route-card');
  button.prepend(img);
  button.append(caption);
 }
 function ensureHardcore(drawer){
  if(drawer.querySelector('[data-route="hard"]'))return;
  const primary=document.querySelector('#homeScreen .mb-hard-feature');
  if(!primary)return;
  const btn=document.createElement('button');
  btn.type='button';btn.dataset.route='hard';
  btn.className='mb-mobile-hard-shortcut';
  btn.setAttribute('aria-label','하드코어 모드');
  // Never recreate hard-mode logic: delegate to the actual, existing Home button.
  btn.addEventListener('click',e=>{
   e.preventDefault();e.stopPropagation();
   drawer.hidden=true;
   primary.click();
  });
  const ranked=drawer.querySelector('[data-route="ranked"]');
  const timed=drawer.querySelector('[data-route="timed"]');
  const after=ranked||timed;
  if(after)after.insertAdjacentElement('afterend',btn);
  else drawer.append(btn);
 }
 let activeDrawer=null,observer=null,pending=false;
 function render(){
  const drawer=document.getElementById('mobileDrawer')||document.querySelector('.mobile-drawer');
  if(!drawer)return;
  if(drawer!==activeDrawer){
   observer?.disconnect();
   activeDrawer=drawer;
   observer=new MutationObserver(()=>{
    if(pending)return;
    pending=true;
    queueMicrotask(()=>{pending=false;render()});
   });
   observer.observe(drawer,{childList:true,subtree:true});
  }
  ensureHardcore(drawer);
  for(const button of drawer.querySelectorAll('button[data-route]'))restoreButton(button);
  // Keep the chat entry visually last after dynamically inserted modes.
  const chat=drawer.querySelector('#mb-mobile-chat-entry');
  if(chat&&chat!==drawer.lastElementChild)drawer.append(chat);
 }
 if(document.readyState==='loading')
  document.addEventListener('DOMContentLoaded',render,{once:true});
 else render();
 const timer=setInterval(render,1800);
 window.addEventListener('pagehide',()=>{clearInterval(timer);observer?.disconnect()},{once:true});
})();
