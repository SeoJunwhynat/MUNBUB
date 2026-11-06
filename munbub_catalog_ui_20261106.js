/* Matchunbeom achievement/title catalog UI upgrade.
   PRESERVES existing achievement accounting, localStorage keys, title equip actions
   and duel display. Only changes presentation using original supplied art assets. */
(()=>{
'use strict';
if(window.__mbCatalogUI20261106)return;
window.__mbCatalogUI20261106=true;
const DATA={"version":"2026-11-06","achievements":[{"id":"visit1","name":"출석 완료","condition":"맛춘범에 접속하기","images":{"earned":"/ui-assets/catalog/achievements/achievement_01_earned.png","locked":"/ui-assets/catalog/achievements/achievement_01_locked.png"}},{"id":"visit3","name":"단골손님","condition":"서로 다른 날이 아니어도 총 3회 접속하기","images":{"earned":"/ui-assets/catalog/achievements/achievement_02_earned.png","locked":"/ui-assets/catalog/achievements/achievement_02_locked.png"}},{"id":"quiz1","name":"첫 도전","condition":"문제 풀이 시작하기","images":{"earned":"/ui-assets/catalog/achievements/achievement_03_earned.png","locked":"/ui-assets/catalog/achievements/achievement_03_locked.png"}},{"id":"answer1","name":"첫 문제 완료","condition":"문제 1개 풀기","images":{"earned":"/ui-assets/catalog/achievements/achievement_04_earned.png","locked":"/ui-assets/catalog/achievements/achievement_04_locked.png"}},{"id":"right1","name":"첫 정답","condition":"처음으로 정답 맞히기","images":{"earned":"/ui-assets/catalog/achievements/achievement_05_earned.png","locked":"/ui-assets/catalog/achievements/achievement_05_locked.png"}},{"id":"wrong1","name":"오답도 경험치","condition":"오답 1개 기록하기","images":{"earned":"/ui-assets/catalog/achievements/achievement_06_earned.png","locked":"/ui-assets/catalog/achievements/achievement_06_locked.png"}},{"id":"answers10","name":"워밍업 끝","condition":"문제 10개 풀기","images":{"earned":"/ui-assets/catalog/achievements/achievement_07_earned.png","locked":"/ui-assets/catalog/achievements/achievement_07_locked.png"}},{"id":"answers50","name":"문제 사냥꾼","condition":"문제 50개 풀기","images":{"earned":"/ui-assets/catalog/achievements/achievement_08_earned.png","locked":"/ui-assets/catalog/achievements/achievement_08_locked.png"}},{"id":"answers100","name":"백문이 불여일풀","condition":"문제 100개 풀기","images":{"earned":"/ui-assets/catalog/achievements/achievement_09_earned.png","locked":"/ui-assets/catalog/achievements/achievement_09_locked.png"}},{"id":"right30","name":"정답 감별사","condition":"정답 30개 맞히기","images":{"earned":"/ui-assets/catalog/achievements/achievement_10_earned.png","locked":"/ui-assets/catalog/achievements/achievement_10_locked.png"}},{"id":"streak3","name":"3연승","condition":"3문제 연속 정답","images":{"earned":"/ui-assets/catalog/achievements/achievement_11_earned.png","locked":"/ui-assets/catalog/achievements/achievement_11_locked.png"}},{"id":"streak7","name":"정답 급행열차","condition":"7문제 연속 정답","images":{"earned":"/ui-assets/catalog/achievements/achievement_12_earned.png","locked":"/ui-assets/catalog/achievements/achievement_12_locked.png"}},{"id":"streak15","name":"연승 폭주 기관차","condition":"15문제 연속 정답","images":{"earned":"/ui-assets/catalog/achievements/achievement_13_earned.png","locked":"/ui-assets/catalog/achievements/achievement_13_locked.png"}},{"id":"chat1","name":"말 좀 걸어 봐","condition":"캐릭터를 1회 클릭하기","images":{"earned":"/ui-assets/catalog/achievements/achievement_14_earned.png","locked":"/ui-assets/catalog/achievements/achievement_14_locked.png"}},{"id":"chat10","name":"수다 동료","condition":"캐릭터를 10회 클릭하기","images":{"earned":"/ui-assets/catalog/achievements/achievement_15_earned.png","locked":"/ui-assets/catalog/achievements/achievement_15_locked.png"}},{"id":"chat30","name":"드립 배추국","condition":"캐릭터를 50회 클릭하기","images":{"earned":"/ui-assets/catalog/achievements/achievement_16_earned.png","locked":"/ui-assets/catalog/achievements/achievement_16_locked.png"}},{"id":"timed1","name":"시간과의 승부","condition":"시간제한 도전 시작하기","images":{"earned":"/ui-assets/catalog/achievements/achievement_17_earned.png","locked":"/ui-assets/catalog/achievements/achievement_17_locked.png"}},{"id":"visit5","name":"단골 입장","condition":"누적 5회 방문","images":{"earned":"/ui-assets/catalog/achievements/achievement_18_earned.png","locked":"/ui-assets/catalog/achievements/achievement_18_locked.png"}},{"id":"visit10","name":"열 번째 출석","condition":"누적 10회 방문","images":{"earned":"/ui-assets/catalog/achievements/achievement_19_earned.png","locked":"/ui-assets/catalog/achievements/achievement_19_locked.png"}},{"id":"visit25","name":"국어밥 주민","condition":"누적 25회 방문","images":{"earned":"/ui-assets/catalog/achievements/achievement_20_earned.png","locked":"/ui-assets/catalog/achievements/achievement_20_locked.png"}},{"id":"quiz3","name":"세 번째 판","condition":"퀴즈 3회 시작","images":{"earned":"/ui-assets/catalog/achievements/achievement_21_earned.png","locked":"/ui-assets/catalog/achievements/achievement_21_locked.png"}},{"id":"quiz10","name":"퀴즈 수집가","condition":"퀴즈 10회 시작","images":{"earned":"/ui-assets/catalog/achievements/achievement_22_earned.png","locked":"/ui-assets/catalog/achievements/achievement_22_locked.png"}},{"id":"quiz25","name":"고인물 입문","condition":"퀴즈 25회 시작","images":{"earned":"/ui-assets/catalog/achievements/achievement_23_earned.png","locked":"/ui-assets/catalog/achievements/achievement_23_locked.png"}},{"id":"timed3","name":"시간 압박 숙련","condition":"시간제한 3회 시작","images":{"earned":"/ui-assets/catalog/achievements/achievement_24_earned.png","locked":"/ui-assets/catalog/achievements/achievement_24_locked.png"}},{"id":"timed10","name":"타임어택 장인","condition":"시간제한 10회 시작","images":{"earned":"/ui-assets/catalog/achievements/achievement_25_earned.png","locked":"/ui-assets/catalog/achievements/achievement_25_locked.png"}},{"id":"answers5","name":"몸풀기","condition":"누적 5문제 풀이","images":{"earned":"/ui-assets/catalog/achievements/achievement_26_earned.png","locked":"/ui-assets/catalog/achievements/achievement_26_locked.png"}},{"id":"answers25","name":"국어 시동","condition":"누적 25문제 풀이","images":{"earned":"/ui-assets/catalog/achievements/achievement_27_earned.png","locked":"/ui-assets/catalog/achievements/achievement_27_locked.png"}},{"id":"answers200","name":"문제책 정복자","condition":"누적 200문제 풀이","images":{"earned":"/ui-assets/catalog/achievements/achievement_28_earned.png","locked":"/ui-assets/catalog/achievements/achievement_28_locked.png"}},{"id":"answers500","name":"문제은행 탐험가","condition":"누적 500문제 풀이","images":{"earned":"/ui-assets/catalog/achievements/achievement_29_earned.png","locked":"/ui-assets/catalog/achievements/achievement_29_locked.png"}},{"id":"answers1000","name":"천 문제의 기록","condition":"누적 1,000문제 풀이","images":{"earned":"/ui-assets/catalog/achievements/achievement_30_earned.png","locked":"/ui-assets/catalog/achievements/achievement_30_locked.png"}},{"id":"right5","name":"첫 다섯 정답","condition":"누적 정답 5개","images":{"earned":"/ui-assets/catalog/achievements/achievement_31_earned.png","locked":"/ui-assets/catalog/achievements/achievement_31_locked.png"}},{"id":"right10","name":"정답 감별력","condition":"누적 정답 10개","images":{"earned":"/ui-assets/catalog/achievements/achievement_32_earned.png","locked":"/ui-assets/catalog/achievements/achievement_32_locked.png"}},{"id":"right50","name":"50 정답 달성","condition":"누적 정답 50개","images":{"earned":"/ui-assets/catalog/achievements/achievement_33_earned.png","locked":"/ui-assets/catalog/achievements/achievement_33_locked.png"}},{"id":"right100","name":"정답 100개","condition":"누적 정답 100개","images":{"earned":"/ui-assets/catalog/achievements/achievement_34_earned.png","locked":"/ui-assets/catalog/achievements/achievement_34_locked.png"}},{"id":"right300","name":"국어 달인 수련","condition":"누적 정답 300개","images":{"earned":"/ui-assets/catalog/achievements/achievement_35_earned.png","locked":"/ui-assets/catalog/achievements/achievement_35_locked.png"}},{"id":"wrong5","name":"함정 분석가","condition":"누적 오답 5개","images":{"earned":"/ui-assets/catalog/achievements/achievement_36_earned.png","locked":"/ui-assets/catalog/achievements/achievement_36_locked.png"}},{"id":"wrong20","name":"오답 기록 박사","condition":"누적 오답 20개","images":{"earned":"/ui-assets/catalog/achievements/achievement_37_earned.png","locked":"/ui-assets/catalog/achievements/achievement_37_locked.png"}},{"id":"streak2","name":"연승의 싹","condition":"2문제 연속 정답","images":{"earned":"/ui-assets/catalog/achievements/achievement_38_earned.png","locked":"/ui-assets/catalog/achievements/achievement_38_locked.png"}},{"id":"streak5","name":"5연승","condition":"5문제 연속 정답","images":{"earned":"/ui-assets/catalog/achievements/achievement_39_earned.png","locked":"/ui-assets/catalog/achievements/achievement_39_locked.png"}},{"id":"streak10","name":"열 번의 집중력","condition":"10문제 연속 정답","images":{"earned":"/ui-assets/catalog/achievements/achievement_40_earned.png","locked":"/ui-assets/catalog/achievements/achievement_40_locked.png"}},{"id":"streak20","name":"연승 전설","condition":"20문제 연속 정답","images":{"earned":"/ui-assets/catalog/achievements/achievement_41_earned.png","locked":"/ui-assets/catalog/achievements/achievement_41_locked.png"}},{"id":"chat5","name":"수다 시작","condition":"캐릭터를 5회 클릭하기","images":{"earned":"/ui-assets/catalog/achievements/achievement_42_earned.png","locked":"/ui-assets/catalog/achievements/achievement_42_locked.png"}},{"id":"chat20","name":"말풍선 단골","condition":"캐릭터를 20회 클릭하기","images":{"earned":"/ui-assets/catalog/achievements/achievement_43_earned.png","locked":"/ui-assets/catalog/achievements/achievement_43_locked.png"}},{"id":"chat50","name":"드립 방송국","condition":"캐릭터를 50회 클릭하기","images":{"earned":"/ui-assets/catalog/achievements/achievement_44_earned.png","locked":"/ui-assets/catalog/achievements/achievement_44_locked.png"}},{"id":"chat100","name":"백 번의 드립","condition":"캐릭터를 100회 클릭하기","images":{"earned":"/ui-assets/catalog/achievements/achievement_45_earned.png","locked":"/ui-assets/catalog/achievements/achievement_45_locked.png"}}],"titles":[{"id":"title_01","name":"국어 새내기","condition":"기본 칭호","images":{"earned":"/ui-assets/catalog/titles/title_01_earned.png","locked":"/ui-assets/catalog/titles/title_01_locked.png","selected":"/ui-assets/catalog/titles/title_01_selected.png","icon":"/ui-assets/catalog/titles/title_01_icon.png","icon_locked":"/ui-assets/catalog/titles/title_01_icon_locked.png"}},{"id":"title_02","name":"훈민정음 수련생","condition":"첫 문제 풀기","images":{"earned":"/ui-assets/catalog/titles/title_02_earned.png","locked":"/ui-assets/catalog/titles/title_02_locked.png","selected":"/ui-assets/catalog/titles/title_02_selected.png","icon":"/ui-assets/catalog/titles/title_02_icon.png","icon_locked":"/ui-assets/catalog/titles/title_02_icon_locked.png"}},{"id":"title_03","name":"맞춤법 탐험가","condition":"문제 10개 풀기","images":{"earned":"/ui-assets/catalog/titles/title_03_earned.png","locked":"/ui-assets/catalog/titles/title_03_locked.png","selected":"/ui-assets/catalog/titles/title_03_selected.png","icon":"/ui-assets/catalog/titles/title_03_icon.png","icon_locked":"/ui-assets/catalog/titles/title_03_icon_locked.png"}},{"id":"title_04","name":"정답 감별사","condition":"정답 30개 맞히기","images":{"earned":"/ui-assets/catalog/titles/title_04_earned.png","locked":"/ui-assets/catalog/titles/title_04_locked.png","selected":"/ui-assets/catalog/titles/title_04_selected.png","icon":"/ui-assets/catalog/titles/title_04_icon.png","icon_locked":"/ui-assets/catalog/titles/title_04_icon_locked.png"}},{"id":"title_05","name":"문제 사냥꾼","condition":"문제 50개 풀기","images":{"earned":"/ui-assets/catalog/titles/title_05_earned.png","locked":"/ui-assets/catalog/titles/title_05_locked.png","selected":"/ui-assets/catalog/titles/title_05_selected.png","icon":"/ui-assets/catalog/titles/title_05_icon.png","icon_locked":"/ui-assets/catalog/titles/title_05_icon_locked.png"}},{"id":"title_06","name":"시간의 지배자","condition":"시간제한 10회 도전","images":{"earned":"/ui-assets/catalog/titles/title_06_earned.png","locked":"/ui-assets/catalog/titles/title_06_locked.png","selected":"/ui-assets/catalog/titles/title_06_selected.png","icon":"/ui-assets/catalog/titles/title_06_icon.png","icon_locked":"/ui-assets/catalog/titles/title_06_icon_locked.png"}},{"id":"title_07","name":"사자성어 도전자","condition":"퀴즈 10회 도전","images":{"earned":"/ui-assets/catalog/titles/title_07_earned.png","locked":"/ui-assets/catalog/titles/title_07_locked.png","selected":"/ui-assets/catalog/titles/title_07_selected.png","icon":"/ui-assets/catalog/titles/title_07_icon.png","icon_locked":"/ui-assets/catalog/titles/title_07_icon_locked.png"}},{"id":"title_08","name":"국어 고수","condition":"문제 100개 풀기","images":{"earned":"/ui-assets/catalog/titles/title_08_earned.png","locked":"/ui-assets/catalog/titles/title_08_locked.png","selected":"/ui-assets/catalog/titles/title_08_selected.png","icon":"/ui-assets/catalog/titles/title_08_icon.png","icon_locked":"/ui-assets/catalog/titles/title_08_icon_locked.png"}},{"id":"title_09","name":"백문백답","condition":"문제 200개 풀기","images":{"earned":"/ui-assets/catalog/titles/title_09_earned.png","locked":"/ui-assets/catalog/titles/title_09_locked.png","selected":"/ui-assets/catalog/titles/title_09_selected.png","icon":"/ui-assets/catalog/titles/title_09_icon.png","icon_locked":"/ui-assets/catalog/titles/title_09_icon_locked.png"}},{"id":"title_10","name":"연승 장인","condition":"최고 연속 정답 10개","images":{"earned":"/ui-assets/catalog/titles/title_10_earned.png","locked":"/ui-assets/catalog/titles/title_10_locked.png","selected":"/ui-assets/catalog/titles/title_10_selected.png","icon":"/ui-assets/catalog/titles/title_10_icon.png","icon_locked":"/ui-assets/catalog/titles/title_10_icon_locked.png"}},{"id":"title_11","name":"말풍선 장인","condition":"캐릭터와 50회 대화","images":{"earned":"/ui-assets/catalog/titles/title_11_earned.png","locked":"/ui-assets/catalog/titles/title_11_locked.png","selected":"/ui-assets/catalog/titles/title_11_selected.png","icon":"/ui-assets/catalog/titles/title_11_icon.png","icon_locked":"/ui-assets/catalog/titles/title_11_icon_locked.png"}}]};
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const imgEl=(src,alt,klass='')=>{const im=document.createElement('img');im.src=src;im.alt=alt;im.loading='lazy';im.decoding='async';if(klass)im.className=klass;return im};
const awardStore=()=>{try{const s=JSON.parse(localStorage.getItem('munbub_achievements_v1')||'{}');return s&&typeof s==='object'?s:{}}catch{return{}}};
const unlockedAwards=()=>awardStore().unlocked||{};
const titleByName=name=>DATA.titles.find(x=>x.name===name);
const selectedTitle=()=>window.mbGetEquippedTitle?.()||localStorage.getItem('munbub_equipped_title_v1')||'국어 새내기';
const titleUnlocked=t=>{if(t.id==='title_01')return true;const target={
 'title_02':'answer1','title_03':'answers10','title_04':'right30','title_05':'answers50',
 'title_06':'timed10','title_07':'quiz10','title_08':'answers100','title_09':'answers200',
 'title_10':'streak10','title_11':'chat50'};return !!unlockedAwards()[target[t.id]]};
function makeToolbar(scope,label){
 const bar=document.createElement('div');bar.className='mb-cat-toolbar';
 bar.innerHTML='<div class="mb-cat-filters" role="group" aria-label="'+label+' 필터">'+
  '<button type="button" class="mb-cat-filter active" data-cat-filter="all" aria-pressed="true">전체</button>'+
  '<button type="button" class="mb-cat-filter" data-cat-filter="earned" aria-pressed="false">획득</button>'+
  '<button type="button" class="mb-cat-filter" data-cat-filter="locked" aria-pressed="false">미획득</button></div>'+
  '<input class="mb-cat-search" type="search" placeholder="이름 · 달성 조건 검색" aria-label="'+label+' 이름과 조건 검색" autocomplete="off">';
 const val={filter:'all',search:''};
 const list=document.createElement('div');list.className='mb-cat-grid';list.setAttribute('aria-label',label+' 목록');
 const counter=document.createElement('p');counter.className='mb-cat-count';counter.setAttribute('aria-live','polite');
 const detail=document.createElement('div');detail.className='mb-cat-overlay';detail.hidden=true;
 const close=()=>{detail.hidden=true;detail.replaceChildren()};
 detail.addEventListener('click',e=>{if(e.target===detail||e.target.closest('[data-cat-close]'))close()});
 detail.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close()}});
 scope.addEventListener('keydown',e=>{if(e.key==='Escape'&&!detail.hidden){e.stopPropagation();e.preventDefault();close()}});
 function showDetail(entry,earned,selected,onEquip){
  detail.replaceChildren();
  const pane=document.createElement('section');pane.className='mb-cat-detail';pane.setAttribute('role','dialog');pane.setAttribute('aria-label',entry.name+' 상세 정보');
  const top=document.createElement('div');top.className='mb-cat-detail-head';
  const title=document.createElement('h3');title.textContent=entry.name;const closer=document.createElement('button');closer.type='button';closer.textContent='✕ 닫기';closer.dataset.catClose='1';
  top.append(title,closer);pane.append(top);
  pane.append(imgEl(entry.images[selected?'selected':earned?'earned':'locked'],entry.name+' '+(selected?'장착':earned?'획득':'미획득')));
  const condition=document.createElement('p');condition.textContent='달성 조건: '+entry.condition;pane.append(condition);
  if(onEquip){const equip=document.createElement('button');equip.type='button';equip.className='mb-cat-equip';
   equip.disabled=!earned||selected;equip.textContent=selected?'✓ 장착 중':earned?'칭호 장착하기':'🔒 아직 잠긴 칭호';
   equip.addEventListener('click',()=>{if(!earned)return;onEquip();close()});pane.append(equip);
  }
  detail.append(pane);detail.hidden=false;closer.focus();
 }
 return {bar,val,list,counter,detail,close,showDetail,onUpdate:null,init(){
   bar.querySelectorAll('[data-cat-filter]').forEach(b=>b.addEventListener('click',()=>{
    val.filter=b.dataset.catFilter;bar.querySelectorAll('[data-cat-filter]').forEach(x=>{const active=x===b;x.classList.toggle('active',active);x.setAttribute('aria-pressed',String(active))});this.onUpdate?.()
   }));
   bar.querySelector('.mb-cat-search').addEventListener('input',e=>{val.search=e.target.value.trim().toLocaleLowerCase('ko');this.onUpdate?.()});
  }};
}
function mountAchievements(){
 const dialog=$('mb-achievement-dialog'),launch=$('mb-achievement-launch');
 if(!dialog||!launch||dialog.classList.contains('mb-catalog-enabled'))return false;
 dialog.classList.add('mb-catalog-enabled');
 const panel=document.createElement('div');panel.className='mb-cat-book';panel.dataset.catalog='achievements';
 const c=makeToolbar(panel,'업적');c.init();
 panel.append(c.bar,c.counter,c.list,c.detail);dialog.append(panel);
 const render=()=>{
  const unlocked=unlockedAwards();const q=c.val.search;let visible=0,got=0;
  c.list.replaceChildren();
  for(const entry of DATA.achievements){
   const earned=!!unlocked[entry.id];if(earned)got++;
   if(c.val.filter==='earned'&&!earned||c.val.filter==='locked'&&earned)continue;
   if(q&&!(entry.name+' '+entry.condition).toLocaleLowerCase('ko').includes(q))continue;
   visible++;
   const article=document.createElement('article');article.className='mb-cat-entry';article.dataset.earned=earned?'1':'0';
   const btn=document.createElement('button');btn.type='button';btn.className='mb-cat-card';btn.setAttribute('aria-label',entry.name+' · '+entry.condition+(earned?' · 획득':' · 미획득'));
   btn.append(imgEl(entry.images[earned?'earned':'locked'],entry.name+' '+(earned?'획득':'잠금')+' 카드'));
   btn.addEventListener('click',()=>c.showDetail(entry,earned,false,null));
   article.append(btn);c.list.append(article);
  }
  c.counter.textContent='획득 '+got+' / '+DATA.achievements.length+' · 현재 표시 '+visible+'개';
  if(!visible){const empty=document.createElement('p');empty.className='mb-cat-empty';empty.textContent='검색 조건에 맞는 업적이 없어.';c.list.append(empty)}
 };
 c.onUpdate=render;
 launch.addEventListener('click',render); // keep the original dialog.open action untouched
 window.addEventListener('storage',e=>{if(e.key==='munbub_achievements_v1'&&dialog.open)render()});
 // The original tracker re-renders only its hidden list; watch that element for progress
 // while the catalog is open, without ever mutating the observed element.
 const oldList=dialog.querySelector('.mb-award-list');
 if(oldList){const observer=new MutationObserver(()=>{if(dialog.open)render()});observer.observe(oldList,{childList:true})}
 render();return true;
}
function mountTitles(){
 const dialog=$('mb-title-dialog'),launch=$('mb-title-open');
 if(!dialog||!launch||dialog.classList.contains('mb-catalog-enabled'))return false;
 dialog.classList.add('mb-catalog-enabled');
 const heading=dialog.querySelector('.mb-title-top h2');if(heading)heading.textContent='🏅 맛춘범 칭호 도감';
 const panel=document.createElement('div');panel.className='mb-cat-book';panel.dataset.catalog='titles';
 const c=makeToolbar(panel,'칭호');c.init();panel.append(c.bar,c.counter,c.list,c.detail);dialog.append(panel);
 const render=()=>{
  let earnedCount=0,visible=0;const q=c.val.search;const equipped=selectedTitle();
  c.list.replaceChildren();
  DATA.titles.forEach((entry,i)=>{
   const earned=titleUnlocked(entry),selected=earned&&equipped===entry.name;
   if(earned)earnedCount++;
   if(c.val.filter==='earned'&&!earned||c.val.filter==='locked'&&earned)return;
   if(q&&!(entry.name+' '+entry.condition).toLocaleLowerCase('ko').includes(q))return;
   visible++;
   const article=document.createElement('article');article.className='mb-cat-entry';article.dataset.earned=earned?'1':'0';article.dataset.selected=selected?'1':'0';
   const btn=document.createElement('button');btn.type='button';btn.className='mb-cat-card';
   btn.setAttribute('aria-label',entry.name+' · '+entry.condition+(selected?' · 장착 중':earned?' · 획득':' · 미획득'));
   btn.append(imgEl(entry.images[selected?'selected':earned?'earned':'locked'],entry.name+(selected?' 선택':earned?' 획득':' 잠금')+' 칭호 카드'));
   btn.addEventListener('click',()=>c.showDetail(entry,earned,selected,()=>{
    // Exercise the ORIGINAL click action so equipped titles, multiplayer title
    // lookups and localStorage share the exact same authoritative code path.
    const source=dialog.querySelector('.mb-title-list [data-title-index="'+i+'"]');
    if(!source||source.disabled)return;
    source.click();render();
   }));
   article.append(btn);c.list.append(article);
  });
  c.counter.textContent='획득 '+earnedCount+' / '+DATA.titles.length+' · 현재 표시 '+visible+'개 · 착용: '+equipped;
  if(!visible){const empty=document.createElement('p');empty.className='mb-cat-empty';empty.textContent='검색 조건에 맞는 칭호가 없어.';c.list.append(empty)}
 };
 c.onUpdate=render;
 launch.addEventListener('click',render);
 window.addEventListener('storage',e=>{if(['munbub_equipped_title_v1','munbub_achievements_v1'].includes(e.key)&&dialog.open)render()});
 render();return true;
}
let achievementReady=false,titleReady=false;
const install=()=>{
 if(!achievementReady)achievementReady=mountAchievements();
 if(!titleReady)titleReady=mountTitles();
 if(achievementReady&&titleReady){observer.disconnect()}
};
const observer=new MutationObserver(install);
observer.observe(document.documentElement,{subtree:true,childList:true});
install();
})();