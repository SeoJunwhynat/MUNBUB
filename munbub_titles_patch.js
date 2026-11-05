/* Cosmetic titles based on existing local achievements; no quiz data is changed. */
(()=>{
'use strict';if(window.__mbTitlesV1)return;window.__mbTitlesV1=true;
const KEY='munbub_equipped_title_v1',AWARDS='munbub_achievements_v1';
const TITLES=[
 ['국어 새내기',null,'기본 칭호'],
 ['훈민정음 수련생','answer1','첫 문제 풀기'],
 ['맞춤법 탐험가','answers10','문제 10개 풀기'],
 ['정답 감별사','right30','정답 30개 맞히기'],
 ['문제 사냥꾼','answers50','문제 50개 풀기'],
 ['시간의 지배자','timed10','시간제한 10회 도전'],
 ['사자성어 도전자','quiz10','퀴즈 10회 도전'],
 ['국어 고수','answers100','문제 100개 풀기'],
 ['백문백답','answers200','문제 200개 풀기'],
 ['연승 장인','streak10','최고 연속 정답 10개'],
 ['말풍선 장인','chat50','캐릭터와 50회 대화']
];
const achievements=()=>{try{return JSON.parse(localStorage.getItem(AWARDS)||'{}')?.unlocked||{}}catch{return {}}};
const unlocked=t=>!t[1]||!!achievements()[t[1]];
const getTitle=()=>{
 const name=localStorage.getItem(KEY)||'국어 새내기';
 const entry=TITLES.find(t=>t[0]===name);
 return entry&&unlocked(entry)?name:'국어 새내기';
};
window.mbGetEquippedTitle=getTitle;
const css=document.createElement('style');css.id='mb-titles-css';
css.textContent=`
#mb-title-dialog{width:min(92vw,590px);max-height:85dvh;overflow:auto;background:#f9e7ce;color:#3b2426;border:5px double #95674c;border-radius:17px;padding:20px;box-shadow:0 12px 40px #0009}
#mb-title-dialog::backdrop{background:#160f15bf}
#mb-title-dialog .mb-title-top{display:flex;align-items:center;justify-content:space-between;gap:10px}
#mb-title-dialog h2{font-size:24px;margin:0}
#mb-title-dialog button{font:inherit;cursor:pointer}
#mb-title-dialog .mb-title-close{background:#593333;color:#ffe8cb;border:0;border-radius:8px;padding:8px 12px}
#mb-title-dialog .mb-title-hint{font-size:13px;color:#775344;line-height:1.5}
#mb-title-dialog .mb-title-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
#mb-title-dialog .mb-title-choice{display:flex;flex-direction:column;text-align:left;gap:4px;min-width:0;padding:12px;border:2px solid #a67a5d;border-radius:10px;background:#fff6e6;color:#442828}
#mb-title-dialog .mb-title-choice strong{font-size:15px;overflow-wrap:anywhere}
#mb-title-dialog .mb-title-choice small{color:#805d4a;line-height:1.4}
#mb-title-dialog .mb-title-choice.equipped{background:#e8d6a3;border-color:#8d5c37;outline:2px solid #f7c678}
#mb-title-dialog .mb-title-choice:disabled{opacity:.55;filter:grayscale(.65);cursor:default}
#homeScreen .mb-online-actions #mb-title-open{min-height:52px!important;display:grid;place-items:center;font-size:clamp(13px,1.15vw,17px)!important;background:linear-gradient(#ffedcf,#e4b88b)!important;color:#422b29!important;border:4px double #96674c!important;border-radius:13px!important}
@media(max-width:600px){#mb-title-dialog .mb-title-list{grid-template-columns:1fr}#mb-title-dialog{padding:12px}}
`;document.head.append(css);
const dialog=document.createElement('dialog');dialog.id='mb-title-dialog';dialog.setAttribute('aria-label','칭호 선택');
dialog.innerHTML='<div class="mb-title-top"><h2>🏅 칭호 도감</h2><button type="button" class="mb-title-close">✕ 닫기</button></div><p class="mb-title-hint">획득한 칭호를 선택하면 1대1 대전의 명패에 표시돼. 칭호 획득 기록은 이 브라우저의 기존 업적과 연동돼.</p><div class="mb-title-list"></div>';
document.body.append(dialog);
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){
 const selected=getTitle();
 dialog.querySelector('.mb-title-list').innerHTML=TITLES.map((t,i)=>'<button type="button" class="mb-title-choice'+(selected===t[0]?' equipped':'')+'" data-title-index="'+i+'"'+(unlocked(t)?'':' disabled')+'><strong>'+(unlocked(t)?'🏅 ':'🔒 ')+esc(t[0])+(selected===t[0]?' ✓':'')+'</strong><small>'+esc(t[2])+'</small></button>').join('');
}
dialog.querySelector('.mb-title-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{
 const b=e.target.closest('[data-title-index]');
 if(b){const t=TITLES[Number(b.dataset.titleIndex)];if(!t||!unlocked(t))return;localStorage.setItem(KEY,t[0]);render();document.getElementById('mb-title-open')?.setAttribute('title','착용 중: '+t[0]);}
 if(e.target===dialog)dialog.close();
});
function mount(){const row=document.querySelector('#homeScreen .mb-online-actions');if(!row||document.getElementById('mb-title-open'))return false;
 const b=document.createElement('button');b.id='mb-title-open';b.type='button';b.classList.add('mb-art-button');b.innerHTML='<img class="mb-art-button-img" src="/ui-assets/title-button-final.png" width="2048" height="682" alt="칭호 선택">';b.title='착용 중: '+getTitle();
 b.addEventListener('click',()=>{render();dialog.showModal()});row.append(b);return true;}
if(!mount()){const timer=setInterval(()=>{if(mount())clearInterval(timer)},200);setTimeout(()=>clearInterval(timer),16000)}
})();
