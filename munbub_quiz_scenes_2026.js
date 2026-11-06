/* Apply requested live play backgrounds only to the actual quiz view. */
(()=>{
 'use strict';
 if(window.__mbQuizScene2026)return;window.__mbQuizScene2026=true;
 const quiz=document.getElementById('view-quiz');if(!quiz)return;
 const workspace=document.getElementById('workspace');
 const css=document.createElement('link');css.rel='stylesheet';css.href='./munbub_quiz_scenes_2026.css';css.id='mb-quiz-scenes-css';document.head.append(css);
 const artwork=document.createElement('link');artwork.rel='stylesheet';artwork.href='./munbub_art_refresh_20261106.css';artwork.id='mb-art-refresh-css';document.head.append(artwork);
 
 // Reuse the one original clock; never add a decorative hourglass or a second countdown.
 const clock=document.getElementById('quizTimer');
 if(clock){
  const group=document.createElement('span');
  group.className='mb-quiz-timer-group';
  group.setAttribute('aria-label','남은 시간');
  workspace.append(group);
  group.append(clock);
 }
 const CLASSES=['mb-scene-spelling','mb-scene-idiom','mb-scene-infinite','mb-scene-hard','mb-scene-timed'];
 function refresh(){
  const active=typeof store!=='undefined'&&store?.active;
  if(quiz.hidden||workspace?.hidden){
   quiz.classList.remove('mb-quiz-scene',...CLASSES);
   workspace?.classList.remove('mb-playing-scene',...CLASSES);return;
  }
  const cfg=active?.cfg||{};
  const item=active?.queue?.[active.index];
  const type=item?.type||(typeof MAP!=='undefined'?MAP.get(item?.id)?.type:'');
  let scene='spelling';
  if(cfg.hard)scene='hard';
  else if(cfg.timed)scene='timed';
  else if(cfg.infinite)scene='infinite';
  else if(type==='idiom'||cfg.category==='idiom')scene='idiom';
  quiz.classList.remove(...CLASSES);
  quiz.classList.add('mb-quiz-scene','mb-scene-'+scene);
  workspace?.classList.remove(...CLASSES);
  workspace?.classList.add('mb-playing-scene','mb-scene-'+scene);
 }
 const obs=new MutationObserver(refresh);
 obs.observe(quiz,{attributes:true,attributeFilter:['hidden']});
 if(workspace)obs.observe(workspace,{attributes:true,attributeFilter:['hidden']});
 for(const target of [document.getElementById('questionPrompt'),document.getElementById('quizCategory')]){
  if(target)obs.observe(target,{childList:true,characterData:true,subtree:true});
 }
 document.addEventListener('visibilitychange',refresh);
 refresh();setTimeout(refresh,300);
})();
