/* 한국사 문제 모드 · 맛춘범 홈 구조 어댑터 v1 (UI 이미지 별도 교체 가능) */
(function(){
'use strict';
const definitions={
 concept:{label:'개념문제',description:'사건 · 용어 · 인물 · 원인과 영향',slot:'spelling'},
 year:{label:'연도문제',description:'연도 · 시대 흐름 · 사건 배열',slot:'idiom'},
 advanced:{label:'심화문제',description:'사료 · 지도 · 자료 · 추론',slot:'application'},
 infinite:{label:'무한모드',description:'정답 수와 관계없이 계속 학습',slot:'infinite'},
 hardcore:{label:'하드코어',description:'첫 오답에서 즉시 종료되는 도전',slot:'hard'},
 timed60:{label:'시간제한',description:'60초 동안 최다 정답에 도전',slot:'timed'},
 all:{label:'전체 문제',description:'전 범위 종합 연습',slot:'all'}
};
const htmlEscape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function card(id,icon,description){
 const d=definitions[id];
 return '<button type="button" class="history-mode-card history-mode-'+id+'" data-history-mode="'+id+'" data-art-slot="'+d.slot+'" aria-label="'+d.label+' 시작">'+
 '<span class="history-mode-art" aria-hidden="true">'+icon+'</span><span class="history-mode-meta"><strong>'+d.label+'</strong><small>'+description+'</small></span>'+
 '<span class="history-mode-arrow" aria-hidden="true">›</span></button>';
}
function renderHome({facts,questions,units,wrongCount,encode}){
 const safe=encode||htmlEscape;
 return '<div class="history-game-home">'+
 '<section class="history-game-head"><div><div class="eyebrow">MATCHUNBEOM · HISTORY GAME</div>'+
 '<h1>한국사 2 <span>문제 게임</span></h1><p>광복부터 현대까지 · 기말고사 대비 · 원하는 문제 모드를 선택하세요.</p></div>'+
 '<span class="history-game-head-seal" aria-hidden="true">史</span></section>'+
 '<section class="history-home-stage" aria-label="역사 게임 모드 선택">'+
 '<div class="history-home-main-col"><div class="history-hero-title">문제 모드 <small>CHOOSE MODE</small></div>'+
 card('concept','✎','개념과 사건을 이해하는 문제')+
 card('year','▣','연도와 사건의 순서를 맞히는 문제')+
 card('advanced','✦','사료·사진·지도 활용 심화문제')+
 card('infinite','∞','끝없는 역사 문제 도전')+
 card('hardcore','⚔','첫 오답에서 종료')+
 card('timed60','⌛','60초 제한시간 도전')+
 '<button type="button" class="history-music-home-btn" data-history-audio="open"><span aria-hidden="true">♫</span><span><strong>음악 · 소리 설정</strong><small>맛춘범과 공유하는 배경음악 재생 및 볼륨 조절</small></span></button></div>'+
 '<div class="history-home-side-col">'+
 '<div class="history-hero-art" data-art-slot="character" aria-label="캐릭터 그림 교체 자리"><div class="history-hero-emblem" aria-hidden="true">史</div>'+
 '<strong>HISTORY ARCHIVE</strong><span>한국 현대사의 기록을 따라<br>공부하고 탐험하는 공간</span><small>캐릭터 및 배경 아트 슬롯</small></div>'+
 '<div class="history-online-actions" aria-label="역사 온라인 기능">'+
 '<button type="button" data-history-competition="rank" data-art-slot="ranked">🏆 랭킹전</button>'+
 '<button type="button" data-history-competition="duel" data-art-slot="duel">⚔ 1:1 대전</button>'+
 '<button type="button" data-history-competition="multi" data-art-slot="public-rooms">🤝 공개방</button>'+
 '<a href="/history-museum.html#achievement" data-art-slot="achievement">🎖 업적·칭호</a></div>'+
 '<a class="history-mode-card history-museum-card" href="/history-museum.html" data-art-slot="backrooms"><span class="history-mode-art" aria-hidden="true">▤</span>'+
 '<span class="history-mode-meta"><strong>역사 박물관</strong><small>백룸 모드 자리 · 사료·전시·탐험</small></span><span class="history-mode-arrow" aria-hidden="true">›</span></a>'+
 '</div></section>'+
 '<div class="history-only-menu-title">HISTORY EXTRAS · 한국사 전용 기능</div><nav class="history-extra-modes" aria-label="추가 학습 메뉴">'+
 '<button type="button" data-history-mode="all">🎯 전체 문제</button>'+
 '<button type="button" data-go="concept">📚 개념정리</button>'+
 '<button type="button" data-go="timeline">📅 역사 연표</button>'+
 '<button type="button" data-go="sources">📜 사료 분석</button>'+
 '<button type="button" data-go="wrong">📒 오답노트 <span>('+wrongCount+')</span></button>'+
 '<button type="button" data-history-audio="open">🎵 소리 설정</button>'+
 '<a href="/history-story.html">🎞️ 스토리 게임</a></nav>'+
 '<section class="history-units-panel"><div class="history-units-heading"><div><h2>단원별 학습</h2>'+
 '<p>단원을 선택하면 해당 범위의 종합 문제를 설정할 수 있습니다.</p></div>'+
 '<div class="history-unit-stats"><span>핵심 사건 '+facts.length+'</span><span>문제 후보 '+questions.length+'</span></div></div>'+
 '<div class="history-unit-grid">'+Object.keys(units).map(k=>'<button type="button" class="history-unit-card" data-unitgo="'+safe(k)+'"><span>'+safe(k)+'</span><strong>'+safe(units[k])+'</strong><small>'+facts.filter(f=>f.u===k).length+'개 사건</small></button>').join('')+'</div>'+
 '<p class="history-disclaimer">학습 자료의 사료형 재구성 문장은 실제 사료 원문과 구별됩니다. 기존 학습 기록과 오답노트는 유지됩니다.</p></section>'+
 '</div>';
}
function prepareSetup(mode,configuration){
 const app=document.getElementById('app');
 if(!app)return;
 const d=definitions[mode]||definitions.all;
 const h2=app.querySelector('h2');
 if(h2)h2.textContent=d.label+' · 문제 설정';
 const intro=app.querySelector('h2 + p');
 if(intro)intro.textContent=d.description+' · 단원, 유형, 문항 수를 설정하고 시작하세요.';
 const type=document.getElementById('type'),allowed=configuration?.types;
 if(type&&Array.isArray(allowed)){
   Array.from(type.options).forEach(opt=>{if(opt.value!=='all'&&!allowed.includes(opt.value))opt.remove()});
   type.value='all';
 }
 app.querySelectorAll('[data-quick]').forEach(b=>{
   const t=b.dataset.quick;
   if(Array.isArray(allowed)&&t!=='top'&&!allowed.includes(t))b.remove();
   if(Array.isArray(allowed)&&t==='top'&&mode!=='advanced')b.remove();
 });
 const actions=app.querySelector('.card .actions');
 if(actions&& !document.getElementById('history-quiz-go-home')){
   const back=document.createElement('button');
   back.type='button';back.id='history-quiz-go-home';back.className='btn';
   back.dataset.go='home';back.textContent='← 모드 선택';
   actions.append(back);
 }
 const active=document.createElement('div');
 active.className='history-active-mode';
 active.setAttribute('aria-label','현재 한국사 문제 모드');
 active.innerHTML='<span>HISTORY QUIZ</span><strong>'+htmlEscape(d.label)+'</strong><small>'+htmlEscape(d.description)+'</small>';
 app.insertBefore(active,app.firstChild);
}
window.MB_HISTORY_MODE_UI={definitions,renderHome,prepareSetup};
})();