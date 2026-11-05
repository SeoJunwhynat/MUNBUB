/* Final layout safety net; no duplicate navigation or quiz handlers. */
(()=>{
 'use strict';
 if(window.__mbRuntimeFixNov05)return;
 window.__mbRuntimeFixNov05=true;
 const home=document.getElementById('homeScreen');
 const work=document.getElementById('workspace');
 const quiz=document.getElementById('view-quiz');
 if(!home||!work||!quiz)return;
 let updating=false;
 function reconcile(){
  if(updating)return;
  updating=true;
  try{
   // Never leave both screens visible. A hidden workspace cannot leak its quiz
   // below the home dashboard when a late stylesheet overrides display.
   if(!home.hidden&&!work.hidden){
    if(!quiz.hidden)home.hidden=true;
    else work.hidden=true;
   }
   const playing=!work.hidden&&!quiz.hidden;
   if(playing){
    work.classList.add('mb-playing-scene');
    quiz.classList.add('mb-quiz-scene');
    // Fallback for browsers that load the scene module after the first quiz.
    if(!Array.from(work.classList).some(x=>x.startsWith('mb-scene-'))){
     let scene='spelling';
     try{
      const c=(typeof store!=='undefined'?store?.active?.cfg:null)||{};
      scene=c.hard?'hard':c.timed?'timed':c.infinite?'infinite':c.category==='idiom'?'idiom':'spelling';
     }catch(_){}
     work.classList.add('mb-scene-'+scene);
    }
   }else if(work.hidden){
    work.classList.remove('mb-playing-scene');
    document.documentElement.style.removeProperty('overflow');
   }
  }finally{updating=false;}
 }
 for(const el of [home,work,quiz]){
  new MutationObserver(reconcile).observe(el,{attributes:true,attributeFilter:['hidden']});
 }
 reconcile();
 // Keep one online action bar when older UI extensions are loaded twice.
 function dedupeOnlineBars(){
  const bars=[...document.querySelectorAll('#homeScreen .mb-online-actions')];
  if(bars.length<2)return;
  const keep=bars[0];
  const mascot=document.querySelector('#homeScreen .mb-mascot-stage');
  if(mascot&&!mascot.contains(keep))mascot.append(keep);
  for(const other of bars.slice(1))other.remove();
 }
 dedupeOnlineBars();
 setTimeout(dedupeOnlineBars,1500);
 setTimeout(dedupeOnlineBars,3500);
 document.addEventListener('click',e=>{
  const btn=e.target.closest?.('.sidebar-nav [data-route],.mobile-drawer [data-route]');
  if(!btn)return;
  // The original menu handler owns navigation; this only prevents unwanted
  // browser scroll anchoring caused by focus on a partially clipped button.
  if(btn.tagName==='BUTTON')btn.blur();
 },false);
})();
