/* Accessible persistent navigation for all Korean-history game pages.
   Works in museum, side-scrolling story, study, and exam; never swallows game keys.
 */
(()=>{'use strict';
 const routes=[
  {href:"/history-study.html",name:"한국사 퀴즈",icon:"📚"},
  {href:"/history-museum.html",name:"역사 박물관",icon:"🏛️"},
  {href:"/history-story-v7.html",name:"역사 스토리",icon:"🎮"},
  {href:"/index.html",name:"맛춘범",icon:"✏️"},
  {href:"/",name:"과목 선택",icon:"🏠"}
 ];
 const pathname=location.pathname;
 const current=routes.find(r=>r.href===pathname)||
   (pathname==="/history-story.html"?routes[2]:
   pathname==="/history-final-exam.html"?routes[0]:routes[4]);
 const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const link=r=>'<a class="mb-quick-nav-link'+(current===r?' active':'')+'" href="'+r.href+'"'+(current===r?' aria-current="page"':'')+'>'+r.icon+' <span>'+escapeHtml(r.name)+'</span></a>';
 function init(){
  if(document.getElementById('mbQuickHistoryNav'))return;
  const bar=document.createElement('div');
  bar.id='mbQuickHistoryNav';
  bar.className='mb-quick-nav';
  bar.setAttribute('role','navigation');
  bar.setAttribute('aria-label','게임과 학습관 이동');
  bar.innerHTML='<div class="mb-quick-nav-inner">'+
    '<div class="mb-quick-nav-desktop"><span class="mb-quick-nav-caption">모드 이동</span>'+routes.map(link).join('')+'</div>'+
    '<details class="mb-quick-nav-mobile"><summary aria-label="다른 게임이나 학습 화면으로 이동">☰ 모드 이동 <b>· '+current.icon+' '+escapeHtml(current.name)+'</b></summary>'+
    '<div class="mb-quick-nav-dropdown">'+routes.map(link).join('')+'</div></details></div>';
  document.body.prepend(bar);
  const details=bar.querySelector('details');
  document.addEventListener('pointerdown',e=>{if(details.open&&!bar.contains(e.target))details.open=false});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&details.open){details.open=false;e.stopPropagation();e.preventDefault()}},true);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();