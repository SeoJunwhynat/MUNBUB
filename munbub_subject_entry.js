/* 맛춘범 상단 과목 이동 바 · 도트 테마 반응형 수정 2026-11-10 */
(()=>{
'use strict';
if(window.__mbSubjectPanel2026)return;
window.__mbSubjectPanel2026=true;
const style=document.createElement('style');
style.id='mb-subject-panel-style';
style.textContent=`
#mb-subject-panel,#mb-subject-panel *{box-sizing:border-box}
#mb-subject-panel{
  position:relative;z-index:2;grid-column:1/-1;align-self:stretch;
  width:100%;max-width:1050px;min-width:0;margin:6px auto 14px;
  padding:7px 9px;display:flex;align-items:center;justify-content:space-between;gap:12px;
  border:2px solid #cf9a68;border-bottom:4px solid #633b42;border-radius:8px;
  color:#fff0cd;background:linear-gradient(180deg,#563444,#352431);
  box-shadow:inset 0 0 0 2px #7d4b51,0 4px 0 #211521;
  font-family:"Malgun Gothic","Apple SD Gothic Neo",sans-serif
}
#mb-subject-panel .mb-subject-heading{
  display:flex;align-items:center;gap:6px;flex:0 0 auto;margin:0;
  padding:4px 9px;color:#ffe0a7;text-decoration:none;
  font-size:clamp(12px,1.4vw,15px);line-height:1.4;font-weight:900;
  white-space:nowrap;letter-spacing:-.015em
}
#mb-subject-panel .mb-subject-heading:hover{color:white;text-decoration:underline}
#mb-subject-panel .mb-subject-options{
  display:flex;flex:1 1 auto;min-width:0;justify-content:flex-end;gap:7px;align-items:stretch
}
#mb-subject-panel .mb-subject-entry{
  display:inline-flex;flex:0 1 150px;min-width:0;min-height:35px;
  align-items:center;justify-content:center;gap:5px;
  padding:6px 10px;text-decoration:none;text-align:center;
  font-weight:900;font-size:clamp(12px,1.2vw,15px);line-height:1.3;
  color:#ffe9c3;background:#5f3d48;
  border:2px solid #9f7465;border-radius:4px;
  transition:background .12s,filter .12s
}
#mb-subject-panel .mb-subject-entry small{font-size:10px;color:#ebc39f;font-weight:700;white-space:nowrap}
#mb-subject-panel a.mb-subject-entry:hover{background:#83505a;border-color:#ffe0a9;filter:brightness(1.1)}
#mb-subject-panel .mb-subject-entry.is-current{color:#39232b;background:#efc68e;border-color:#ffe0a9}
#mb-subject-panel .mb-subject-entry.is-current small{color:#65414b}
#mb-subject-panel .mb-subject-entry.is-pending{opacity:.55;border-style:dashed;cursor:default}
#mb-subject-panel .mb-subject-entry:focus-visible,
#mb-subject-panel .mb-subject-heading:focus-visible{outline:3px solid #ffdc9d;outline-offset:2px}
@media(max-width:780px){
  #mb-subject-panel{gap:6px;padding:7px;margin:5px auto 10px}
  #mb-subject-panel .mb-subject-heading{font-size:12px;padding:2px 4px}
  #mb-subject-panel .mb-subject-options{gap:5px}
  #mb-subject-panel .mb-subject-entry{padding:5px 6px;min-height:36px;font-size:12px}
  #mb-subject-panel .mb-subject-entry small{display:none}
}
@media(max-width:510px){
  #mb-subject-panel{max-width:100%;padding:6px;flex-wrap:wrap}
  #mb-subject-panel .mb-subject-heading{width:100%;font-size:11px;line-height:1.1;padding:0 3px 1px}
  #mb-subject-panel .mb-subject-options{width:100%;flex:1 0 100%;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}
  #mb-subject-panel .mb-subject-entry{width:100%;min-width:0;min-height:36px;white-space:nowrap;font-size:13px;padding:6px 3px}
}
@media(max-width:340px){
  #mb-subject-panel .mb-subject-entry{font-size:12px;gap:2px}
}
`;
document.head.append(style);
function mount(){
 const home=document.getElementById('homeScreen');
 if(!home||document.getElementById('mb-subject-panel'))return;
 const host=home.querySelector('.home-main')||home;
 const panel=document.createElement('section');
 panel.id='mb-subject-panel';
 panel.setAttribute('aria-label','과목 선택 및 이동');
 panel.innerHTML='<a class="mb-subject-heading" href="/subject-select.html#subjects" aria-label="과목 선택 화면으로">▤ 과목 선택</a><nav class="mb-subject-options" aria-label="학습 과목"><span class="mb-subject-entry is-current" aria-current="page">📖 국어 <small>현재 과목</small></span><a class="mb-subject-entry" href="/subject-select.html?subject=history">📜 역사 <small>모드 선택</small></a><span class="mb-subject-entry is-pending" aria-disabled="true">🌍 사회 <small>준비 중</small></span></nav>';
 host.insertBefore(panel,host.firstChild);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
else mount();
})();
