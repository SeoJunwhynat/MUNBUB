/* 맛춘범 고급 모드 확장. 문제은행 원본 불변. */
(()=>{
'use strict';
if(window.__mbModes2026)return;
window.__mbModes2026=true;
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(_){return d}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}};
const UNLOCK='mb_hard_unlock_v1',PROFILE='mb_local_player_v1',RANK='mb_local_hard_scores_v1';
const prev={navigate:window.navigate,start:window.startSession,read:window.readConfig,pool:window.getPool,judge:window.judge,renderQuestion:window.renderQuestion,feedback:window.showFeedback,finish:window.finishSession,result:window.renderResult};
if(Object.values(prev).some(f=>typeof f!=='function')){console.error('모드 연동: 기본 엔진 없음');return}
let mode='standard',endState=null;
const stories={
 '괄목상대':['삼국지 관련 기록','손권의 권유를 받은 여몽이 공부해 크게 발전하자 노숙이 놀랐다는 이야기에서 나왔어.'],
 '다다익선':['사기','유방이 한신에게 군사를 얼마나 거느릴 수 있느냐고 묻자 한신은 많을수록 좋다는 취지로 답했어.'],
 '사면초가':['사기','포위된 항우가 사방에서 초나라의 노래를 듣고 자기편이 모두 적에게 넘어갔다고 여겼다는 이야기야.'],
 '삼고초려':['삼국지 관련 기록','유비가 제갈량을 얻기 위해 그의 초가를 세 차례 방문한 일화야.'],
 '새옹지마':['회남자','변방 노인이 잃은 말이 좋은 말을 데려오고 아들은 그 말을 타다 다치는 등 행운과 불행이 뒤바뀌는 이야기야.'],
 '수주대토':['한비자','농부가 우연히 나무 그루터기에 부딪힌 토끼를 얻은 뒤 다시 같은 행운만 기다렸어.'],
 '순망치한':['좌전','우나라가 괵나라를 공격하려는 진나라에 길을 빌려주자 괵나라가 망하면 우나라도 위험해진다는 경고가 나왔어.'],
 '오십보백보':['맹자','싸움터에서 오십 보 물러난 이가 백 보 도망친 이를 비웃지만 둘 다 도망친 것은 같다는 비유야.'],
 '조삼모사':['열자·장자','원숭이들은 도토리를 아침 세 개, 저녁 네 개 받는다고 하자 화냈지만 아침 네 개, 저녁 세 개로 바꾸자 기뻐했어.'],
 '호가호위':['전국책','여우가 자신이 무섭다며 호랑이를 데리고 다니자 동물들이 사실은 호랑이를 보고 도망친 이야기야.'],
 '연목구어':['맹자','나무에 올라 물고기를 구하는 것처럼 목적과 수단이 맞지 않는 일을 비유해.'],
 '와신상담':['춘추시대 오·월의 고사','복수를 잊지 않으려는 오나라와 월나라 인물들의 인내와 고생을 다룬 이야기에서 나왔어.'],
 '청출어람':['순자','쪽풀에서 나온 푸른 물감이 쪽풀보다 더 푸를 수 있다는 비유야.'],
 '문전성시':['전국책','제나라 추기의 간언 뒤 왕이 바른 말을 구하자 간언하는 사람들이 몰려들었다는 고사와 관련돼.'],
 '이심전심':['선종의 전승','부처가 꽃을 들어 보이자 가섭이 미소로 뜻을 알아차렸다는 염화미소 전승과 관련지어 설명해.'],
 '토사구팽':['사기 관련 고사','토끼를 잡으면 사냥개를 삶는다는 비유로 공을 세운 사람을 필요 없어졌다고 버리는 일을 가리켜.']
};
Object.assign(stories,{"군계일학":["진서 혜소전","혜소가 사람들 사이에 있을 때 학이 닭 무리에 서 있는 듯 눈에 띈다는 평가에서 유래했어."],"오리무중":["후한서 장해전","장해가 다섯 리 안을 뒤덮는 안개를 만들 수 있었다는 일화에서 유래했어."],"점입가경":["진서 고개지전","고개지가 사탕수수를 덜 단 부분부터 먹으며 뒤로 갈수록 맛있어진다고 설명한 일화에서 유래했어."],"풍수지탄":["한시외전","고어가 부모를 봉양하려 할 때 이미 때가 늦었다며, 나무는 고요하려 해도 바람이 그치지 않는다고 탄식한 이야기야."],"상전벽해":["신선전 마고 이야기","마고가 동해가 뽕나무밭으로 여러 차례 바뀐 일을 말한다는 전승에서 세상 변화의 큼을 나타내게 되었어."],"온고지신":["논어 위정편","공자는 옛것을 익히고 이를 바탕으로 새것을 알면 남의 스승이 될 수 있다고 말했어."],"유비무환":["서경 관련 구절","미리 준비해 두면 근심할 일이 없다는 뜻의 옛 구절에서 쓰였어."]});
const style=document.createElement('style');style.id='mb-modes-2026';
style.textContent=[
 '#homeScreen .mb-home-dashboard{grid-template-columns:minmax(240px,1.08fr) minmax(300px,.92fr)!important}',
 '#homeScreen .mb-home-dashboard>.mb-mascot-stage{width:min(100%,552px)!important;max-width:552px!important}',
 '#homeScreen .mb-mascot-stage>.mb-home-speech{width:clamp(155px,21vw,252px)!important;max-width:58%!important;font-size:clamp(14px,1.3vw,19px)!important;padding:clamp(8px,1.1vw,14px)!important;line-height:1.42!important}',
 '#homeScreen .mb-mascot-stage>.mb-home-speech::after{right:auto!important;left:11%!important;bottom:-17px!important;width:24px!important;height:20px!important;border:0!important;border-left:3px solid #4b292b!important;transform:skewX(-24deg) rotate(-8deg)!important;background:linear-gradient(135deg,#ffecd1 48%,transparent 50%)!important}',
 '#homeScreen .mb-dashboard-left .timed-home-btn{min-height:82px!important;background:linear-gradient(#fff2db,#eac49e)!important;border:5px double #ae7758!important;border-radius:15px!important;color:#482c23!important;box-shadow:inset 0 0 0 3px #fff8e9,0 6px 0 #4a2926!important;font-size:clamp(19px,2.3vw,30px)!important}',
 '#homeScreen .timed-home-btn span{font-size:clamp(11px,1.15vw,17px)!important}',
 '#homeScreen .mb-hard-button{order:3;display:flex;flex-direction:column;justify-content:center;align-items:center;width:100%;min-height:76px;padding:8px;border:5px double #a27960;border-radius:15px;background:linear-gradient(#f6dfc6,#cdab87);color:#472925;box-shadow:inset 0 0 0 3px #fff3d9,0 6px 0 #4a2926;font-size:24px;font-weight:900;cursor:pointer}',
 '#homeScreen .mb-hard-button small{font-size:12px;font-weight:800;text-align:center}',
 '#homeScreen .mb-hard-button.locked{filter:grayscale(.5);opacity:.8}',
 '#homeScreen .mb-local-buttons{order:4;display:flex;gap:8px}',
 '#homeScreen .mb-local-buttons button{flex:1;min-height:44px;background:#fff1dc;color:#492c28;border:2px solid #a4785f;border-radius:12px;font-weight:850;cursor:pointer}',
 '#mb-mode-title{padding:13px;border:3px solid #936952;border-radius:13px;background:#ffedd2;color:#4b2928;margin-bottom:12px;font-weight:900}',
 '#mb-mode-title small{display:block;font-weight:650;margin-top:5px}',
 '#view-setup label:has(#infiniteCheck),#view-setup label:has(#timedCheck){display:none!important}',
 '.mb-deep-note{margin-top:12px;padding:11px 13px;border-radius:11px;border-top:3px dashed #b08a6f;background:#fffaeb;color:#442d29;line-height:1.7}',
 '.mb-deep-note p{margin:5px 0 10px!important}',
 '#mb-hard-account{border:4px solid #986947;border-radius:18px;background:#fff0d6;color:#422a24;padding:22px;width:min(93vw,620px);max-height:84vh;overflow:auto}',
 '#mb-hard-account::backdrop{background:#180d17c9}',
 '#mb-hard-account input{font-size:18px;padding:9px;border:2px solid #ae8a74;border-radius:10px;width:min(100%,320px);box-sizing:border-box}',
 '#mb-hard-account button{background:#f8dbb7;border:2px solid #956a51;border-radius:9px;padding:10px;font-weight:900;margin:5px;cursor:pointer}',
 '#mb-hard-account table{width:100%;border-collapse:collapse}',
 '#mb-hard-account th,#mb-hard-account td{text-align:left;padding:8px;border-bottom:1px solid #d9bba0}',
 '#mb-hard-account .caption{font-size:13px;color:#755846;line-height:1.5}',
 '@media(max-width:1100px){#homeScreen .mb-home-dashboard{grid-template-columns:minmax(0,1.08fr) minmax(0,.92fr)!important}}',
 '@media(max-width:700px){#homeScreen .mb-home-dashboard{grid-template-columns:minmax(0,44fr) minmax(0,56fr)!important}#homeScreen .mb-home-dashboard>.mb-mascot-stage{width:100%!important;max-width:100%!important}#homeScreen .mb-mascot-stage>.mb-home-speech{font-size:clamp(11px,2.5vw,14px)!important;max-width:70%!important;width:min(70%,152px)!important;padding:6px!important}#homeScreen .mb-hard-button,#homeScreen .mb-local-buttons{grid-column:1/-1;min-height:60px}#homeScreen .mb-hard-button{font-size:19px}}'
 ].join('\n');
 document.head.append(style);
 const timerHome=document.querySelector('#homeScreen .timed-home-btn');
 if(timerHome){for(const n of timerHome.childNodes)if(n.nodeType===3){n.textContent='시간제한 도전! ';break}const span=timerHome.querySelector('span');if(span)span.textContent='단원과 시간을 선택해서 도전!';}
 const mainLeft=document.querySelector('#homeScreen .mb-dashboard-left');
 const hardButton=document.createElement('button');hardButton.type='button';hardButton.className='mb-hard-button';hardButton.dataset.route='hard';mainLeft?.append(hardButton);
 const row=document.createElement('div');row.className='mb-online-actions';row.innerHTML='<button id="mb-account-open" type="button">👤 온라인 로그인</button><button id="mb-rank-open" type="button">🏆 온라인 랭킹</button>';mainLeft?.append(row);
 function isBasic(c){return c&&!c.hard&&!c.timed&&!c.infinite&&!c.onlyWrong&&['spelling','idiom'].includes(c.category)}
 function unlocked(){
  if(read(UNLOCK,false))return true;
  const prior=store.history?.some(x=>!x.abandoned&&isBasic(x.cfg)&&x.answered>=1);
  if(prior)save(UNLOCK,true);return !!prior;
 }
 function updateHardButton(){const yes=unlocked();hardButton.classList.toggle('locked',!yes);hardButton.innerHTML=yes?'⚔ 하드코어<small>오답 한 번이면 종료 · 최고 10점</small>':'🔒 하드코어<small>기본문제 완료 시 해금</small>'}
 const banner=document.createElement('div');banner.id='mb-mode-title';banner.hidden=true;
 const setup=$('view-setup')?.querySelector('.panel');setup?.insertBefore(banner,setup.firstChild);
 function setupUI(m){
  mode=m;const special=m!=='standard';
  $('infiniteCheck').checked=false;$('timedCheck').checked=false;
  $('infiniteCheck').closest('label').hidden=true;$('timedCheck').closest('label').hidden=true;
  $('countSelect').closest('label').hidden=special;
  $('timeLimitWrap').hidden=m!=='timed';
  const select=$('categorySelect');for(const opt of select.options)opt.disabled=m==='hard'&&opt.value==='application';
  if(m==='hard'&&select.value==='application')select.value='all';
  $('applicationTopicWrap').hidden=m==='hard'||select.value!=='application';
  $('subtypeWrap').hidden=m==='hard'||select.value!=='application';
  $('styleWrap').hidden=select.value==='spelling'||select.value==='application';
  banner.hidden=!special;
  if(special){
   const h=m==='hard'?'⚔ 하드모드':m==='timed'?'⏱ 시간제한 도전!':'∞ 무한모드';
   const t=m==='hard'?'학교 프린트 맞춤법 + 사자성어만 출제. 첫 오답에서 종료하며 문제당 최대 10점!':m==='timed'?'풀고 싶은 단원과 제한 시간을 선택해.':'풀고 싶은 단원을 선택하면 문제가 계속 나와.';
   banner.innerHTML=h+'<small>'+t+'</small>';
  }
  $('startBtn').textContent=m==='hard'?'⚔ 하드모드 시작':m==='timed'?'⏱ 시간제한 시작':m==='infinite'?'∞ 무한모드 시작':'문제 시작';
  updateSetupCount();
 }
 function openSetup(m){
  if(m==='hard'&&!unlocked()){alert('기본 맞춤법 또는 사자성어 문제를 한 세트 끝내면 하드모드가 열려!');return}
  prev.navigate('spelling');$('categorySelect').value='all';setupUI(m);
  $('pageTitle').textContent=m==='hard'?'⚔ 하드모드':m==='timed'?'⏱ 시간제한 도전!':'∞ 무한모드';
  $('pageSub').textContent='풀고 싶은 단원을 선택해.';
 }
 window.openModeSetup=openSetup;
 window.navigate=function(route){
  if(['hard','timed','infinite'].includes(route))return openSetup(route);
  const out=prev.navigate(route);
  if(['spelling','idiom','application'].includes(route))setupUI('standard');
  return out;
 };
 window.readConfig=function(){const c=prev.read();c.infinite=mode!=='standard';c.timed=mode==='timed';c.hard=mode==='hard';if(c.hard){c.onlyWrong=false;if(c.category==='application')c.category='all'}return c};
 window.getPool=function(cfg){let items=prev.pool(cfg);return cfg?.hard?items.filter(x=>x.type==='idiom'||x.type==='spelling'):items};
 $('categorySelect')?.addEventListener('change',()=>{if(mode!=='standard')setupUI(mode)});
 window.startSession=function(cfg,override){
  if(cfg.hard&&!unlocked()){alert('하드모드가 잠겨 있어. 기본 문제를 먼저 끝내 줘.');return}
  if(cfg.hard)cfg={...cfg,timed:false,infinite:true,onlyWrong:false,count:'all'};
  const prior=store.active,out=prev.start(cfg,override),a=store.active;
  if(a&&a!==prior&&a.cfg?.hard){a.hardScore=0;a.hardQuestionStartedAt=Date.now();persist()}
  return out;
 };
 window.renderQuestion=function(){
  const out=prev.renderQuestion(),a=store.active;
  if(a?.cfg?.hard&&!a.lastFeedback){
   a.hardQuestionStartedAt=Date.now();
   $('quizPosition').textContent='⚔ 연속 '+a.correctCount+' · '+(a.hardScore||0)+'점';
   $('quizCategory').textContent='⚔ 하드모드 · '+(current()?.id?.startsWith('i')?'사자성어':'프린트 맞춤법');
   $('promptDesc').textContent+=' · 틀리면 끝!';
  }
  return out;
 };
 function moreFeedback(f,q){
  let html='';
  if(q.type==='idiom'){
   html+='<strong>📖 뜻과 핵심</strong><p>'+esc(q.answer)+' : '+esc(q.meaning)+'</p>';
   const tale=stories[q.answer];
   if(tale)html+='<strong>📜 관련 고사 · '+esc(tale[0])+'</strong><p>'+esc(tale[1])+'</p>';
   if(!f.good){
    const selected=(typeof BANK!=='undefined'&&BANK.idioms||[]).find(item=>item.answer===String(f.user||'').trim());
    html+='<strong>🔎 오답 분석</strong><p>정답 '+esc(q.answer)+'의 뜻은 '+esc(q.meaning)+'이야. ';
    if(selected)html+='네가 선택한 '+esc(selected.answer)+'의 뜻은 '+esc(selected.meaning)+'이므로 의미와 상황이 달라.';
    else html+='입력한 '+esc(f.user)+'은(는) 해당 뜻을 가리키는 바른 사자성어가 아니야.';
    html+='</p><p>✅ 복습: 문제의 뜻과 정답을 함께 소리 내어 읽어 보자.</p>';
   }
  }else{
   if(q.note&&q.subtype!=='헷갈리는 맞춤법')html+='<strong>✅ 바른 표현의 이유</strong><p>'+esc(q.note)+'</p>';
   if(q.prompt?.includes('___')&&q.answers?.length)html+='<strong>바르게 완성한 문장</strong><p>'+esc(q.prompt.replace('___',q.answers[0]))+'</p>';
   if(!f.good){
    const correct=(q.answers||[])[0]||'';
    html+='<strong>🔎 오답 비교</strong><p>네 선택: <strong>'+esc(f.user)+'</strong> · 바른 표현: <strong>'+esc((q.answers||[]).join(' / '))+'</strong></p>';
    if(q.prompt?.includes('___')){
     html+='<strong>📖 문장 비교</strong><p>오답 문장: '+esc(q.prompt.replace('___',String(f.user)))+'</p><p>정답 문장: '+esc(q.prompt.replace('___',correct))+'</p>';
    }
    html+='<p>✅ 복습: 문장의 의미·활용·띄어쓰기를 비교하고 정답이 되는 이유를 확인해 봐.</p>';
   }
  }
  return html?'<div class="mb-deep-note">'+html+'</div>':'';
 }
 window.showFeedback=function(f,q,item){const out=prev.feedback(f,q,item);$('feedback')?.insertAdjacentHTML('beforeend',moreFeedback(f,q));return out};
 window.judge=function(user){
  const a=store.active,hard=!!a?.cfg?.hard&&!a.lastFeedback,item=hard?current():null;
  const result=prev.judge(user);
  if(hard&&a===store.active&&a.lastFeedback){
   const elapsed=Math.max(0,Date.now()-(a.hardQuestionStartedAt||Date.now()));
   const basis=item?.form==='text'?60000:35000;
   const points=a.lastFeedback.good?Math.max(1,Math.min(10,Math.round(10-9*Math.min(1,elapsed/basis)))):0;
   a.lastFeedback.hardPoints=points;a.lastFeedback.responseMs=elapsed;
   a.hardScore=(a.hardScore||0)+points;persist();
   if(!a.lastFeedback.good){a.hardMiss=$('feedback')?.innerHTML||'';window.finishSession(false)}
   else {$('feedback')?.insertAdjacentHTML('beforeend','<p><strong>⚔ +'+points+'점</strong> · '+(elapsed/1000).toFixed(1)+'초 · 누적 '+a.hardScore+'점</p>');$('quizPosition').textContent='⚔ 연속 '+a.correctCount+' · '+a.hardScore+'점'}
  }
  return result;
 };
 window.renderResult=function(){
  const r=resultCache;
  if(!r?.cfg?.hard)return prev.result();
  const h=endState||{};
  $('view-result').innerHTML='<div class="panel"><h2>⚔ 하드모드 종료!</h2><p class="summary">첫 오답에서 종료 · 연속 정답 '+(h.correct||0)+'개</p><div class="metrics"><span>점수 <strong>'+(h.score||0)+'</strong></span><span>정답 <strong>'+(h.correct||0)+'</strong></span></div><p>객관식은 35초, 서술형은 60초를 기준으로 답변 시간이 짧을수록 높은 점수. 문제당 최대 10점!</p>'+(h.miss?'<h3>마지막 오답과 자세한 해설</h3><div class="feedback bad">'+h.miss+'</div>':'')+'<div class="row"><button class="action" id="mb-hard-replay">다시 도전</button><button class="action" id="mb-hard-leaderboard">온라인 랭킹</button><button class="action" data-route="home">홈으로</button></div></div>';
  $('mb-hard-replay')?.addEventListener('click',()=>openSetup('hard'));
  // Online leaderboard button is handled by the online module.
 };
 window.finishSession=function(timeUp=false){
  const a=store.active;
  if(a?.cfg?.hard)endState={score:a.hardScore||0,correct:a.correctCount||0,miss:a.hardMiss||''};
  const out=prev.finish(timeUp);
  if(a&&isBasic(a.cfg)&&a.answeredCount>0){save(UNLOCK,true);updateHardButton()}
  return out;
 };
 setupUI('standard');updateHardButton();
 // Keep the original question and record engines intact. Load the print-based
 // application choice extension only after all mode result hooks are in place.
 if(!document.getElementById('mb-app-records-loader')){
  const extension=document.createElement('script');
  extension.id='mb-app-records-loader';
  extension.src='./munbub_application_records_patch.js';
  extension.onerror=()=>console.error('응용 맞춤법·최고 기록 확장 파일을 불러오지 못했어.');
  extension.addEventListener('load',()=>{
   if(document.getElementById('mb-ranked-script'))return;
   const ranked=document.createElement('script');
   ranked.id='mb-ranked-script';
   ranked.src='./munbub_ranked_challenge.js';
   ranked.onerror=()=>console.error('랭킹전 게임을 불러오지 못했어.');
   document.body.append(ranked);
  },{once:true});
  document.body.append(extension);
 }
 // Load online account/leaderboard only after the core hard-mode wrappers exist.
 if(!document.getElementById('mb-online-module-script')){
  const onlineScript=document.createElement('script');
  onlineScript.id='mb-online-module-script';
  onlineScript.src='./munbub_online_patch.js';
  document.body.append(onlineScript);
  // Load cosmetic titles and the actual public-room lobby once, after core mode setup.
  for(const [id,src] of [['mb-titles-loader','./munbub_titles_patch.js'],['mb-public-loader','./munbub_public_patch.js']]){
   if(document.getElementById(id))continue;
   const script=document.createElement('script');
   script.id=id;script.src=src;
   script.onerror=()=>console.error('추가 모듈을 불러오지 못했어: '+src);
   document.body.append(script);
  }
  import('./munbub_nav_patch.js').catch(error=>console.warn('Navigation extension unavailable',error));
 }
})();