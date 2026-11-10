/* Core Korean game: subject navigation disabled after history/social separation (2026-11-11). */
(()=>{
  'use strict';
  window.__mbSubjectPanel2026=true;
  const remove=()=>document.getElementById('mb-subject-panel')?.remove();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',remove,{once:true});
  else remove();
})();
