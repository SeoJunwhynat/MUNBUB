/* 맛춘범 과목 선택 패널: 기존 게임·랭킹·백룸 로직 유지 */
(()=>{'use strict';
if(window.__mbSubjectPanel2026)return;
window.__mbSubjectPanel2026=true;
const style=document.createElement('style');style.id='mb-subject-panel-style';
style.textContent=[
'#mb-subject-panel{box-sizing:border-box;max-width:1050px;margin:10px auto 16px;padding:11px;border-radius:17px;border:2px solid #8e6b55;background:linear-gradient(110deg,#fff2d9,#e5c6ab);box-shadow:0 6px 0 #30212a;color:#35252e}',
'#mb-subject-panel .mb-subject-heading{font-size:13px;font-weight:900;margin:0 0 8px;text-align:center;letter-spacing:.04em}',
'#mb-subject-panel .mb-subject-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}',
'#mb-subject-panel .mb-subject-entry{box-sizing:border-box;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:2px;text-decoration:none;border:2px solid #805e54;border-radius:10px;background:#fff9ed;min-height:55px;padding:8px 5px;color:#3c2b2c;text-align:center;font-size:clamp(13px,1.35vw,18px);font-weight:950;line-height:1.2}',
'#mb-subject-panel .mb-subject-entry small{font-size:10px;font-weight:750;opacity:.77}',
'#mb-subject-panel a.mb-subject-entry:hover{filter:brightness(.96);transform:translateY(-1px)}',
'#mb-subject-panel .mb-subject-entry.is-current{background:#edcdab;border-color:#b88656}',
'#mb-subject-panel .mb-subject-entry.is-pending{opacity:.57;border-style:dashed;cursor:default}',
'@media(max-width:520px){#mb-subject-panel{margin:8px 5px 13px;padding:8px}#mb-subject-panel .mb-subject-options{gap:5px}#mb-subject-panel .mb-subject-entry{min-height:51px;font-size:13px;padding:5px 2px}#mb-subject-panel .mb-subject-entry small{font-size:9px}}'
].join('\n');document.head.append(style);
function mount(){
  const home=document.getElementById('homeScreen');
  if(!home||document.getElementById('mb-subject-panel'))return;
  const host=home.querySelector('.home-main')||home;
  const panel=document.createElement('section');
  panel.id='mb-subject-panel';panel.setAttribute('aria-label','과목 선택');
  panel.innerHTML='<p class="mb-subject-heading">📚 맛춘범 과목 선택</p><nav class="mb-subject-options" aria-label="학습 과목"><a class="mb-subject-entry is-current" href="/" aria-current="page">📖 국어<small>기존 맛춘범</small></a><a class="mb-subject-entry" href="/history-study.html">📜 역사<small>문제·사료·박물관</small></a><span class="mb-subject-entry is-pending" aria-disabled="true">🌍 사회<small>준비 중</small></span></nav>';
  host.insertBefore(panel,host.firstChild);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
