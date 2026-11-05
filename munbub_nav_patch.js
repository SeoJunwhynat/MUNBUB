/* 맛춘범 홈 배치 & 모든 화면의 단일 모드 네비게이션 */
(()=>{
 'use strict';
 if(window.__mbNavLayout2026)return;
 window.__mbNavLayout2026=true;
 const $=id=>document.getElementById(id);
 const style=document.createElement('style');
 style.id='mb-nav-layout-2026';
 style.textContent=[
  '#homeScreen .mb-home-dashboard>.mb-mascot-stage{display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:clamp(7px,1vw,12px)!important;width:min(100%,552px)!important;height:auto!important;min-height:0!important;aspect-ratio:auto!important;align-self:start!important}',
  '#homeScreen .mb-home-dashboard>.mb-mascot-stage>.hero-character.mb-mascot-animated{display:block!important;flex:none!important;position:relative!important;width:100%!important;height:auto!important;aspect-ratio:1!important;object-fit:contain!important}',
  '#homeScreen .mb-mascot-stage>.mb-online-actions{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:clamp(7px,1vw,13px)!important;position:relative!important;z-index:8!important;box-sizing:border-box!important;width:100%!important;margin:0!important;padding:0!important;pointer-events:auto!important}',
  '#homeScreen .mb-mascot-stage>.mb-online-actions button:not(.mb-duel-home):not(.mb-home-sound){box-sizing:border-box!important;display:grid!important;place-items:center!important;min-width:0!important;min-height:54px!important;margin:0!important;padding:8px!important;border:4px double #9e6b55!important;border-radius:13px!important;background:linear-gradient(180deg,#fff3d9,#deb28d)!important;color:#432727!important;box-shadow:inset 0 0 0 2px #fff8eb,0 4px 0 #3b2428!important;font-size:clamp(12px,1.25vw,18px)!important;font-weight:950!important;line-height:1.25!important;word-break:keep-all!important;cursor:pointer!important;transition:transform .15s,filter .15s}',
  '#homeScreen .mb-mascot-stage>.mb-online-actions button:not(.mb-duel-home):not(.mb-home-sound):hover{transform:translateY(-3px)!important;filter:brightness(1.08)}',
  '#homeScreen .mb-mascot-stage>.mb-online-actions button:not(.mb-duel-home):not(.mb-home-sound):active{transform:translateY(1px)!important;filter:brightness(.95)}',
  '.sidebar-nav .mb-hard-nav,.mobile-drawer .mb-hard-nav{box-sizing:border-box!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:3px!important;width:100%!important;min-height:76px!important;padding:9px 5px!important;border:4px double #9e7156!important;border-radius:12px!important;background:linear-gradient(180deg,#fff0d1,#d8ac8b)!important;box-shadow:inset 0 0 0 2px #fff8e7,0 4px 0 #3e262b!important;color:#40272b!important;font-size:clamp(15px,1.55vw,22px)!important;font-weight:950!important;line-height:1.2!important;text-align:center!important;cursor:pointer;transition:transform .15s,filter .15s}',
  '.sidebar-nav .mb-hard-nav small,.mobile-drawer .mb-hard-nav small{display:block!important;font-size:clamp(10px,.95vw,13px)!important;font-weight:750!important;white-space:normal!important;line-height:1.25!important}',
  '.sidebar-nav .mb-hard-nav.locked,.mobile-drawer .mb-hard-nav.locked{filter:grayscale(.65);opacity:.77}',
  '.sidebar-nav .mb-hard-nav.active,.mobile-drawer .mb-hard-nav.active{background:linear-gradient(180deg,#d8b08a,#b38c72)!important;filter:brightness(.8)!important;outline:3px solid #e1aa77!important;outline-offset:-3px!important;transform:scale(.98)!important}',
  '.sidebar-nav .navbtn.active:not(.mb-hard-nav),.mobile-drawer .navbtn.active:not(.mb-hard-nav),.mobile-bottom [data-route].active{filter:brightness(.78)!important}',
  '@media(max-width:700px){#homeScreen .mb-home-dashboard>.mb-mascot-stage{width:100%!important;max-width:100%!important;gap:7px!important}#homeScreen .mb-mascot-stage>.mb-online-actions{grid-template-columns:minmax(0,1fr)!important;gap:6px!important}#homeScreen .mb-mascot-stage>.mb-online-actions button:not(.mb-duel-home):not(.mb-home-sound){min-height:42px!important;padding:5px 2px!important;font-size:clamp(10px,2.35vw,14px)!important;border-width:3px!important} .sidebar-nav .mb-hard-nav,.mobile-drawer .mb-hard-nav{min-height:60px!important;font-size:17px!important}}',
  '@media(prefers-reduced-motion:reduce){#homeScreen .mb-mascot-stage>.mb-online-actions button:not(.mb-duel-home):not(.mb-home-sound),.sidebar-nav .mb-hard-nav,.mobile-drawer .mb-hard-nav{transition:none!important}}'
 ].join('\n');
 document.head.append(style);
 // Move online buttons below the home mascot; don't clone (their IDs and listeners must stay unique).
 const stage=document.querySelector('#homeScreen .mb-mascot-stage');
 const onlineRow=document.querySelector('#homeScreen .mb-online-actions');
 if(stage && onlineRow)stage.append(onlineRow);
 // Move one ORIGINAL hardcore mode button to the home right column.
 // It keeps the existing unlock logic and the same route, without duplicates.
 const primary=document.querySelector('.mb-hard-button');
 const rightColumn=document.querySelector('#homeScreen .mb-dashboard-left');
 if(primary && rightColumn){
  const locked=primary.classList.contains('locked');
  primary.className='mb-hard-button mb-hard-feature'+(locked?' locked':'');
  primary.dataset.route='hard';
  primary.setAttribute('aria-label','하드코어 모드');
  primary.title='하드코어 모드';
  rightColumn.append(primary);
  primary.addEventListener('click',event=>{
   event.preventDefault();
   event.stopImmediatePropagation();
   window.openModeSetup?.('hard');
  },true);
 }
 document.querySelectorAll('.sidebar-nav [data-route="hard"],.mobile-drawer [data-route="hard"]').forEach(el=>{if(el!==primary)el.remove()});
 style.textContent+='\n'+"#homeScreen .mb-dashboard-left>.mb-hard-feature{display:block!important;position:relative!important;flex:none!important;order:3!important;align-self:center!important;box-sizing:border-box!important;width:100%!important;max-width:550px!important;height:auto!important;min-height:0!important;aspect-ratio:1024/341!important;border:0!important;border-radius:0!important;padding:0!important;margin:clamp(6px,.9vw,11px) auto 0!important;background:transparent url(\"./ui-assets/hardcore-feature.webp\") center/contain no-repeat!important;box-shadow:none!important;color:transparent!important;font-size:0!important;line-height:0!important;text-shadow:none!important;overflow:visible!important;cursor:pointer!important;transition:transform .15s,filter .15s!important}\n#homeScreen .mb-dashboard-left>.mb-hard-feature small{display:none!important}\n#homeScreen .mb-dashboard-left>.mb-hard-feature.locked{filter:brightness(.44) grayscale(.17)!important}\n#homeScreen .mb-dashboard-left>.mb-hard-feature.locked:hover{filter:brightness(.44) grayscale(.17)!important;transform:translateY(-1px)!important}\n#homeScreen .mb-dashboard-left>.mb-hard-feature:not(.locked):hover{filter:brightness(1.09)!important;transform:translateY(-3px) scale(1.025)!important}\n#homeScreen .mb-dashboard-left>.mb-hard-feature:not(.locked):active{filter:brightness(.88)!important;transform:translateY(1px) scale(.99)!important}\n#homeScreen .mb-dashboard-left>.home-hero{height:clamp(133px,17vw,218px)!important}\n#homeScreen .mb-dashboard-left{gap:clamp(5px,.65vw,9px)!important}\n#homeScreen .mb-mascot-stage>.hero-character{max-height:clamp(255px,30vw,346px)!important}\n#homeScreen .mb-home-dashboard{gap:clamp(12px,1.2vw,18px)!important;margin-bottom:clamp(4px,.8vw,10px)!important}\n@media(max-width:700px){#homeScreen .mb-dashboard-left>.mb-hard-feature{width:100%!important;margin:6px auto!important;aspect-ratio:1024/341!important}#homeScreen .mb-dashboard-left>.home-hero{height:clamp(110px,30vw,168px)!important}}";
 style.textContent += '\n' + "@media(min-width:860px){#homeScreen .home-main>.mb-home-dashboard{grid-template-columns:minmax(0,39fr) minmax(0,61fr)!important;column-gap:clamp(9px,1vw,14px)!important}#homeScreen .mb-home-dashboard>.mb-mascot-stage{max-width:100%!important}#homeScreen .home-main>.home-card-grid{margin-top:0!important}#homeScreen .home-main>.home-actions{margin-top:3px!important}}\n@media(min-width:701px) and (max-width:859px){#homeScreen .home-main>.mb-home-dashboard{margin-bottom:3px!important}#homeScreen .home-main>.home-card-grid{margin-top:0!important}#homeScreen .home-main>.home-actions{margin-top:3px!important}}\n@media(max-width:700px){#homeScreen .home-main>.mb-home-dashboard{margin-bottom:2px!important}#homeScreen .home-main>.home-card-grid{margin-top:0!important}#homeScreen .home-main>.home-actions{margin-top:3px!important}}";
 style.textContent += '\n'+[
  '#homeScreen .mb-dashboard-left>.mb-hard-feature.locked{background-image:url("/ui-assets/mb_hardcore_locked_ui.webp")!important;background-size:contain!important;background-position:center!important;background-repeat:no-repeat!important;filter:none!important;opacity:1!important}',
  '#homeScreen .mb-dashboard-left>.mb-hard-feature.locked:hover{background-image:url("/ui-assets/mb_hardcore_locked_ui.webp")!important;filter:brightness(1.08)!important;transform:scale(1.02)!important}',
  '#homeScreen .mb-dashboard-left>.mb-hard-feature.locked:active{transform:scale(.99)!important}',
  '@media(max-width:700px){#homeScreen .mb-dashboard-left>.mb-hard-feature.locked{aspect-ratio:3/1!important;max-width:100%!important}}'
 ].join('\n');
 // Hide the legacy local ranking entirely; only live server ranking remains.
 document.querySelectorAll('#mb-hard-account').forEach(el=>el.remove());
 let selected='home';
 const tracked=new Set(['home','spelling','idiom','application','infinite','timed','ranked','hard','duel','mistakes','history','settings']);
 function paint(){
  for(const btn of document.querySelectorAll('.sidebar-nav [data-route],.mobile-drawer [data-route],.mobile-bottom [data-route]')){
   const active=btn.dataset.route===selected;
   btn.classList.toggle('active',active);
   btn.setAttribute('aria-current',active?'page':'false');
   if(btn.dataset.route==='hard')btn.setAttribute('aria-pressed',String(active));
  }
  if(primary)primary.classList.toggle('active',selected==='hard');
 }
 function selectRoute(route){
  if(tracked.has(route))selected=route;
  paint();
 }
 const oldNav=window.navigate,oldSetup=window.openModeSetup,oldStart=window.startSession,oldRender=window.renderQuestion,oldFinish=window.finishSession;
 if(typeof oldNav!=='function'||typeof oldSetup!=='function')return;
 window.openModeSetup=function(m){
  const out=oldSetup.apply(this,arguments);
  if(m!=='hard'||!primary?.classList.contains('locked'))selectRoute(m);
  return out;
 };
 window.navigate=function(route){
  const out=oldNav.apply(this,arguments);
  if(route!=='hard'||!primary?.classList.contains('locked'))selectRoute(route);
  else paint();
  return out;
 };
 if(typeof oldStart==='function')window.startSession=function(){
  const out=oldStart.apply(this,arguments);paint();return out;
 };
 if(typeof oldRender==='function')window.renderQuestion=function(){
  const out=oldRender.apply(this,arguments);paint();return out;
 };
 if(typeof oldFinish==='function')window.finishSession=function(){
  const out=oldFinish.apply(this,arguments);paint();return out;
 };
 // Keep the selected special mode when the base engine opens its generic
 // spelling setup/quiz/result internally. Only a click on an actual mode menu
 // changes the selected mode, not selecting a question category.
 window.__mbSelectedMenu=()=>selected;
 window.__mbMarkRoute=selectRoute;
 paint();
 // Install the latest workbook BEFORE the duel captures its question MAP.
 // An onload dependency ensures both clients share the exact 100 idiom answers.
 function loadDuel(){
  if(document.getElementById('mb-duel-loader'))return;
  const duelScript=document.createElement('script');
  duelScript.id='mb-duel-loader';duelScript.src='./munbub_duel_patch.js';
  document.body.append(duelScript);
 }
 if(!document.getElementById('mb-idiom-100-loader')){
  const bankScript=document.createElement('script');
  bankScript.id='mb-idiom-100-loader';bankScript.src='./munbub_idiom_bank_100.js';
  bankScript.onload=()=>{
   if(window.__mbIdiomBank100?.count===100)loadDuel();
   else console.error('사자성어 100개를 로드하지 못해 대전 시작을 중단했어.');
  };
  bankScript.onerror=()=>console.error('최신 사자성어 파일을 다운로드하지 못했어.');
  document.body.append(bankScript);
 }
 // Load the illustrated atlas once, then the UI image replacement.
 if(!document.getElementById('mb-ui-atlas-loader')){
  const atlasScript=document.createElement('script');
  atlasScript.id='mb-ui-atlas-loader';
  atlasScript.src='./munbub_supplied_ui_atlas.js';
  atlasScript.onload=()=>{
   if(document.getElementById('mb-supplied-ui-loader'))return;
   const patch=document.createElement('script');
   patch.id='mb-supplied-ui-loader';patch.src='./munbub_uploaded_ui_patch.js';
   document.body.append(patch);
  };
  document.body.append(atlasScript);
 }
 // Quiz backgrounds are isolated from the title/home and do not change BGM.
 if(!document.getElementById('mb-quiz-scenes-loader')){
  const scenes=document.createElement('script');
  scenes.id='mb-quiz-scenes-loader';
  scenes.src='./munbub_quiz_scenes_2026.js';
  scenes.onerror=()=>console.error('게임 플레이 배경 모듈 로드 실패');
  document.body.append(scenes);
 }

})();
