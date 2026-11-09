/* 시간의 기록자 · history story adventure client */
(function(){
'use strict';
const data=window.MB_HISTORY_STORY;
if(!data||!Array.isArray(data.chapters)||!data.chapters.length){document.body.innerHTML='<main style="margin:3rem auto;max-width:40rem;color:white">스토리 데이터를 읽지 못했습니다. 새로고침해 주세요.</main>';return}
const $=id=>document.getElementById(id),canvas=$('storyCanvas'),ctx=canvas.getContext('2d'),W=960,H=560;
if(!ctx){$('chapterSubtitle').textContent='게임 화면을 지원하는 브라우저가 필요해요.';return}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),html=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),short=(s,n)=>String(s).length>n?String(s).slice(0,n-1)+'…':String(s);
const characters={'기록관':'史','신문 배달 청년 도윤':'🧢','견습 기자 미란':'📰','학생 기록자 은하':'🎒'};
const storageKey='mb_history_story_2026_v1',fresh=()=>({current:'ep1945',unlocked:['ep1945'],completed:[],chapters:{},sound:false});
let save;
try{save={...fresh(),...JSON.parse(localStorage.getItem(storageKey)||'{}')}}catch{save=fresh()}
if(!Array.isArray(save.unlocked))save.unlocked=['ep1945'];if(!save.unlocked.includes('ep1945'))save.unlocked.unshift('ep1945');
if(!Array.isArray(save.completed))save.completed=[];
if(!save.chapters||typeof save.chapters!=='object')save.chapters={};
let chapter=null,chapterState=null,zone=0,actor={x:476,y:474},held=new Set(),autoTarget=null,modal=null,frameAt=0,dialogLine=0,selection=[],jtab='clue',notifyTimer=0,attempts=0,lastNearest=null,finishedChapter=false;
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(save))}catch{}}
function progressFor(id){if(!save.chapters[id])save.chapters[id]={collected:[],spoken:[],insight:0,zone:0,intro:false,timelineSolved:false,quizSolved:false};const s=save.chapters[id];if(!Array.isArray(s.collected))s.collected=[];if(!Array.isArray(s.spoken))s.spoken=[];return s}
function dataFor(id){return data.chapters.find(c=>c.id===id)}
function shared(){return window.MB_STORY_COOP?.active()?window.MB_STORY_COOP.state():null}
function currentCollected(){return shared()?.collected||chapterState.collected}
function currentSpoken(){return shared()?.spoken||chapterState.spoken}
function timelineDone(){return shared()?shared().timelineSolved:chapterState.timelineSolved}
function quizDone(){return shared()?shared().quizSolved:chapterState.quizSolved}
function byObject(id){return chapter.zones.flatMap(z=>z.objects).find(o=>o.id===id)}
function setNote(t){const el=$('notification');el.textContent=t;el.classList.add('on');clearTimeout(notifyTimer);notifyTimer=setTimeout(()=>el.classList.remove('on'),2800)}
function beep(t='tap'){if(!save.sound||!window.AudioContext&&!window.webkitAudioContext)return;try{const AC=window.AudioContext||window.webkitAudioContext;const ac=window.__mbStoryAudio||(window.__mbStoryAudio=new AC()),o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=t==='success'?700:t==='error'?180:420;g.gain.setValueAtTime(.045,ac.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+.14);o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+.15)}catch{}}
function renderChapters(){
 const next=data.roadmap||[];
 $('chapterList').innerHTML=next.map(r=>{
 const playable=r.status==='playable',unlocked=playable&&save.unlocked.includes(r.id),done=playable&&save.completed.includes(r.id),active=chapter?.id===r.id;
 return '<button type="button" class="chapter-item '+(active?'current':'')+(unlocked?'':' unavailable')+'" data-chapter="'+html(r.id||'')+'" '+(!unlocked?'disabled':'')+' title="'+html(!playable?'준비 중인 후속 에피소드':!unlocked?'이전 에피소드를 완료하면 열립니다':r.title)+'"><span class="year">'+html(r.year)+'</span><span class="chapter-meta"><strong>'+html(r.title)+'</strong><small>'+(done?'완료한 이야기':unlocked?'입장할 수 있는 이야기':playable?'이전 챕터 완료 후':'제작 예정')+'</small></span><span class="chapter-status">'+(done?'✓':unlocked?'▶':'🔒')+'</span></button>'
 }).join('');
}
function jumpChapter(id,showIntro=true){
 if(shared()&&shared().chapterId!==id){setNote('협동 중에는 방장이 진행 중인 챕터만 탐험할 수 있어.');return}
 const target=dataFor(id);
 if(!target||!save.unlocked.includes(id)){setNote('이전 이야기를 마쳐야 이 챕터가 열려.');return}
 chapter=target;chapterState=progressFor(id);zone=clamp(chapterState.zone||0,0,chapter.zones.length-1);
 actor={x:470,y:475};held.clear();autoTarget=null;save.current=id;persist();
 $('chapterEra').textContent='EPISODE '+String(data.chapters.indexOf(chapter)+1).padStart(2,'0')+' · '+chapter.year+' · '+chapter.place;
 $('chapterTitle').textContent=chapter.title;$('chapterSubtitle').textContent=chapter.subtitle;
 $('historyRule').textContent=data.historyRule;
 updateUI();renderChapters();
 if(showIntro&&!chapterState.intro){chapterState.intro=true;persist();showLines(chapter.intro,{title:'시간의 기록자 · '+chapter.year,tag:'CHAPTER OPENING',onDone:()=>setNote('첫 지역에서 기록 2개를 수집하고 사람과 대화해 봐.')})}
}
function stationList(){return chapter.zones[zone].objects}
function clues(){return chapter.zones.flatMap(z=>z.objects.filter(o=>o.kind==='clue'))}
function allRequired(){return currentCollected().length>=4&&currentSpoken().length>=2}
function zoneUnlocked(){const first=chapter.zones[0].objects;return first.filter(o=>o.kind==='clue'&&currentCollected().includes(o.id)).length>=2&&first.some(o=>o.kind==='npc'&&currentSpoken().includes(o.id))}
function currentObjective(){
 if(quizDone())return '이야기 완성 · 다시 보기 가능';
 if(!zoneUnlocked())return '첫 구역의 단서 2개와 인물 대화 1개 완료';
 if(zone===0)return '다음 지역으로 이동해 남은 기록을 찾아보세요';
 if(!allRequired())return '나머지 역사 기록과 인물의 증언을 수집하세요';
 if(!timelineDone())return '사건의 순서를 복원하고 정확한 연표를 작성하세요';
 return '역사적 맥락을 확인하는 마지막 문제를 해결하세요';
}
function updateUI(){
 const location=chapter.zones[zone];
 $('mapLabel').textContent=chapter.year+' · '+location.title;
 $('stageProgress').textContent='기록 '+currentCollected().length+' / 4 · 대화 '+currentSpoken().length+' / 2';
 $('objectiveShort').textContent=short(currentObjective(),33);
 $('missionTitle').textContent=zoneUnlocked()?currentCollected().length>=4?'연표와 사건의 진실을 연결하라':location.title:'첫 기록의 실마리를 찾아라';
 $('missionDescription').textContent=currentObjective();
 $('insightNumber').textContent=chapterState.insight+' pt';
 $('cluePercent').textContent=Math.round(currentCollected().length/4*100)+'%';
 $('clueMeter').style.width=Math.round(currentCollected().length/4*100)+'%';
 $('backZone').disabled=zone===0;
 $('forwardZone').disabled=zone===chapter.zones.length-1;
 $('finalChallenge').disabled=!allRequired();
 $('finalChallenge').textContent=quizDone()?'✓ 완료된 기록 다시 보기':timelineDone()?'📝 최종 역사 판단':'🔐 최종 기록 복원';
 renderJournal();renderChapters();
}
function renderJournal(){
 let body='';
 if(jtab==='clue'){
  body=clues().map(o=>{
   const known=currentCollected().includes(o.id);
   return '<article class="entry '+(known?'':'unknown')+'"><small>'+(known?html(o.date):'???. ?? · 비공개 기록')+'</small><b>'+(known?html(o.name):'발견되지 않은 전시 기록')+'</b><p>'+(known?html(o.fact):'시대의 다른 장소를 탐색하세요.')+'</p>'+(known?'<button data-jitem="'+html(o.id)+'">기록 다시 읽기</button>':'')+'</article>';
  }).join('');
 }else if(jtab==='people'){
  body=chapter.zones.flatMap(z=>z.objects.filter(o=>o.kind==='npc')).map(o=>{
   const known=currentSpoken().includes(o.id);
   return '<article class="entry '+(known?'':'unknown')+'"><small>'+(known?'대화 완료':'기록 대기')+'</small><b>'+html(o.name)+'</b><p>'+(known?html(o.lines.join(' ')):'이 인물을 찾아 이야기를 들어 보세요.')+'</p></article>';
  }).join('');
 }else{
  body='<p>단서 4개와 인물 대화 2개를 마친 뒤 최종 연표를 복원할 수 있어요.</p>'+
  chapter.timeline.map(e=>'<article class="entry '+(timelineDone()?'':'unknown')+'"><b>'+(timelineDone()?html(e.date):'????. ??')+'</b><p>'+html(e.label)+'</p></article>').join('');
 }
 $('journalBody').innerHTML=body||'<p>기록이 없습니다.</p>';
 document.querySelectorAll('[data-jtab]').forEach(btn=>{btn.classList.toggle('active',btn.dataset.jtab===jtab);btn.setAttribute('aria-selected',String(btn.dataset.jtab===jtab))});
}
function changeZone(n){
 if(n<0||n>=chapter.zones.length)return;
 if(n===1&&!zoneUnlocked()){setNote('첫 구역에서 기록 2개를 찾고 인물과 먼저 대화해 줘.');beep('error');return}
 zone=n;chapterState.zone=n;actor={x:470,y:475};held.clear();autoTarget=null;persist();updateUI();if(shared())window.MB_STORY_COOP.positionNow();
 setNote('📍 '+chapter.zones[zone].title);
}
function getNear(){
 let found=null,best=117;
 const stations=stationList().concat([{id:'timegate',kind:'gate',name:'시간의 문',icon:'🚪',x:862,y:360}]);
 for(const o of stations){const distance=Math.hypot(o.x-actor.x,o.y-actor.y);if(distance<best){best=distance;found=o}}
 return found;
}
function handleTarget(o=getNear()){
 if(!o){setNote('기록물이나 등장인물 가까이 이동해 조사해 봐.');return}
 if(o.kind==='gate'){if(zone===0)changeZone(1);else if(allRequired())openFinal();else setNote('이 시대의 기록과 증언을 더 모아야 시간의 문이 열려.');return}
 if(o.kind==='clue')return showClue(o);
 if(o.kind==='npc')return speak(o);
}
function showClue(o){
 const already=currentCollected().includes(o.id);
 if(!already){if(shared())window.MB_STORY_COOP.record('collect',{id:o.id,zone}).catch(e=>setNote(e.message));else{chapterState.collected.push(o.id);persist()}beep('success');updateUI();setNote('📜 새로운 사료 기록을 수집했어!')}
 showLines([{speaker:'기록 발견 · '+o.date,text:o.icon+' '+o.name+'\n\n'+o.fact+'\n\n[사료 해설]\n'+o.quote}],{title:o.name,tag:'ARCHIVED DOCUMENT · 학습용 재구성',onDone:()=>{updateUI()}});
}
function speak(o){
 showLines(o.lines.map(x=>({speaker:o.name,text:x})),{title:o.name,tag:'FICTIONAL CHARACTER · 창작 인물',onDone:()=>showChoices(o)});
}
function showChoices(o){
 modal={type:'choices',target:o};$('overlayTag').textContent='CHOOSE YOUR INTERPRETATION';$('overlayTitle').textContent=o.name+'에게 답하기';
 $('speaker').textContent=o.name;$('portrait').textContent=o.icon;$('dialogueText').textContent='어떤 관점으로 이 기록을 읽겠어?';
 $('dialogueExtra').innerHTML='<div class="dialog-choices">'+o.choices.map((c,i)=>'<button type="button" data-decision="'+i+'">'+(i+1)+'. '+html(c.text)+'</button>').join('')+'</div>';
 $('dialogBack').classList.add('hidden');$('dialogNext').classList.add('hidden');$('storyOverlay').classList.remove('hidden');
}
function chooseView(i){
 const o=modal?.target,decision=o?.choices?.[i];if(!decision)return;
 const first=!currentSpoken().includes(o.id);
 if(first){if(shared())window.MB_STORY_COOP.record('talk',{id:o.id,zone}).catch(e=>setNote(e.message));else chapterState.spoken.push(o.id);if(decision.good)chapterState.insight+=10;persist();updateUI()}
 else if(decision.good)setNote('이 인물의 관점은 이미 기록했어.');
 beep(decision.good?'success':'tap');
 showLines([{speaker:o.name,text:decision.reply}],{title:'대화의 기록',tag:'INTERPRETATION · 역사 결과는 변하지 않음',onDone:()=>{setNote(first?'인물 대화를 기록 수첩에 추가했어.':'대화를 다시 확인했어.')}});
}
function showLines(lines,options={}){
 modal={type:'lines',lines,index:0,title:options.title||'이야기',tag:options.tag||'STORY',onDone:options.onDone||null};
 $('storyOverlay').classList.remove('hidden');held.clear();autoTarget=null;renderDialog();
}
function renderDialog(){
 if(!modal||modal.type!=='lines')return;
 const lines=modal.lines,idx=clamp(modal.index,0,lines.length-1),line=lines[idx];
 $('overlayTag').textContent=modal.tag;$('overlayTitle').textContent=modal.title;
 $('speaker').textContent=line.speaker;$('portrait').textContent=characters[line.speaker]||((line.speaker||'').includes('기록')?'史':'📜');
 $('dialogueText').textContent=line.text;$('dialogueExtra').innerHTML='';
 $('dialogBack').classList.toggle('hidden',idx===0);$('dialogNext').classList.remove('hidden');
 $('dialogNext').textContent=idx===lines.length-1?'확인 ✓':'계속 ›';
}
function advanceDialog(){
 if(!modal)return;
 if(modal.type==='lines'){
  if(modal.index<modal.lines.length-1){modal.index++;renderDialog();beep();return}
  const after=modal.onDone;modal=null;$('storyOverlay').classList.add('hidden');if(after)after();beep();return;
 }
 if(modal.type==='timeline'){checkTimeline();return}
 if(modal.type==='quiz'){return}
 if(modal.type==='menu')closeDialog();
}
function closeDialog(){
 if(modal?.type==='introRequired')return;
 modal=null;$('storyOverlay').classList.add('hidden');held.clear();autoTarget=null;
}
function openFinal(){
 if(!allRequired()){setNote('먼저 단서 4개와 NPC 대화 2개를 완료해 줘.');return}
 if(quizDone()){
  if(!save.completed.includes(chapter.id)){finishChapter();return}
  showLines(chapter.ending,{title:'완성된 역사 기록',tag:'CHAPTER COMPLETED'});return;
 }
 if(timelineDone())showFinalQuiz();
 else showTimeline();
}
function showTimeline(){
 modal={type:'timeline'};selection=[];attempts=0;
 $('storyOverlay').classList.remove('hidden');held.clear();autoTarget=null;
 $('overlayTag').textContent='CHRONOLOGY PUZZLE · 연표 복원';$('overlayTitle').textContent='흩어진 연표를 되찾아라';
 $('speaker').textContent='기록관';$('portrait').textContent='🕰️';
 $('dialogueText').textContent='수집한 역사 기록의 선후 관계를 복원해 줘. 아래 사건을 이른 날짜부터 누르면 돼. 정확한 날짜는 정답 확인 후 공개돼.';
 renderTimeline();
}
function shuffledTimeline(){
 const ev=chapter.timeline;
 const order=ev.length===4?[2,0,3,1]:[1,2,0];return order.map(i=>ev[i]);
}
function renderTimeline(){
 if(modal?.type!=='timeline')return;
 const list=shuffledTimeline();
 $('dialogueExtra').innerHTML='<div class="challenge-skyline">사건을 순서대로 누르세요. 선택한 기록: '+selection.length+'/'+chapter.timeline.length+'</div>'+
 '<div class="sequence-list">'+list.map(e=>'<button type="button" data-timeline="'+html(e.id)+'" '+(selection.includes(e.id)?'disabled class="selected"':'')+'><span>▣</span> '+html(e.label)+'</button>').join('')+'</div>'+
 '<div class="sequence-picks">선택한 순서: '+(selection.map((id,i)=>(i+1)+'. '+chapter.timeline.find(x=>x.id===id).label).join(' → ')||'아직 선택하지 않았어')+'</div>'+
 '<p class="dialog-hint">※ 연표는 추리 과정에서 날짜를 숨기고, 확인한 뒤 근거를 보여 줍니다.</p><div id="timelineError" role="status"></div>';
 $('dialogBack').classList.remove('hidden');$('dialogBack').textContent='다시 선택';
 $('dialogNext').classList.remove('hidden');$('dialogNext').textContent='순서 제출';$('dialogNext').disabled=selection.length!==chapter.timeline.length;
}
function checkTimeline(){
 if(selection.length!==chapter.timeline.length)return;
 const expected=chapter.timeline.map(e=>e.id);
 if(selection.every((id,i)=>id===expected[i])){
  const success=()=>{chapterState.timelineSolved=true;chapterState.insight+=20;persist();beep('success');updateUI();showLines([{speaker:'기록관',text:'정확하게 복원했어!\n\n'+chapter.timeline.map(e=>e.date+' · '+e.label).join('\n')+'\n\n이제 역사적 의미를 확인하는 마지막 질문이 남았어.'}],{title:'연표 복원 성공',tag:'CHRONOLOGY VERIFIED',onDone:showFinalQuiz})};
  if(shared()){window.MB_STORY_COOP.record('timeline',{order:selection.slice()}).then(success).catch(e=>{setNote(e.message);beep('error')});return}
  success();return;
 }
 attempts++;beep('error');
 const el=$('timelineError');if(el)el.innerHTML='<div class="answer-status bad">순서가 맞지 않아. 조사한 사건들의 앞뒤 관계를 다시 확인해 봐. ('+attempts+'회 시도)</div>';
}
function showFinalQuiz(){
 modal={type:'quiz',answered:false};
 $('storyOverlay').classList.remove('hidden');held.clear();autoTarget=null;
 $('overlayTag').textContent='FINAL INVESTIGATION';$('overlayTitle').textContent='최종 기록 검증';
 $('speaker').textContent='기록관';$('portrait').textContent='⚖️';$('dialogueText').textContent=chapter.quiz.question;
 $('dialogueExtra').innerHTML='<div class="dialog-choices">'+chapter.quiz.choices.map((text,i)=>'<button data-quiz-choice="'+i+'">'+(i+1)+'. '+html(text)+'</button>').join('')+'</div><div id="storyQuizResult" role="status"></div>';
 $('dialogBack').classList.add('hidden');$('dialogNext').classList.add('hidden');
}
function checkQuiz(index){
 if(modal?.type!=='quiz'||modal.answered)return;
 const correct=index===chapter.quiz.correct;
 [...$('dialogueExtra').querySelectorAll('[data-quiz-choice]')].forEach((b,i)=>{
  b.disabled=true;if(i===chapter.quiz.correct)b.classList.add('selected');
 });
 const target=$('storyQuizResult');
 if(correct){
  const accepted=()=>{if(!modal||modal.type!=='quiz')return;modal.answered=true;chapterState.quizSolved=true;chapterState.insight+=25;persist();beep('success');
  target.innerHTML='<div class="answer-status good">✅ 정답!<br>'+html(chapter.quiz.explain)+'</div>';
  $('dialogNext').classList.remove('hidden');$('dialogNext').textContent='이야기 마치기';updateUI()};
  if(shared()){window.MB_STORY_COOP.record('quiz',{choice:index}).then(accepted).catch(e=>{setNote(e.message);beep('error')});return}
  accepted();
 }else{
  beep('error');target.innerHTML='<div class="answer-status bad">답을 다시 생각해 봐. 자료를 근거로 한 번 더 풀어 보자.</div>';
  [...$('dialogueExtra').querySelectorAll('[data-quiz-choice]')].forEach(b=>b.disabled=false);
 }
}
function finishChapter(){
 if(!save.completed.includes(chapter.id)){save.completed.push(chapter.id)}
 const index=data.chapters.indexOf(chapter),next=data.chapters[index+1];
 if(next&&!save.unlocked.includes(next.id))save.unlocked.push(next.id);
 persist();renderChapters();updateUI();
 showLines(chapter.ending,{title:'CHAPTER '+(index+1)+' · '+chapter.title,tag:'HISTORY PRESERVED · 챕터 완료',onDone:()=>{
  if(shared()){if(window.MB_STORY_COOP.isHost())window.MB_STORY_COOP.record('advance',{}).catch(e=>setNote(e.message));else setNote('방장이 다음 시대를 열면 모두 함께 이동해.')}
  else setNote('🏅 '+chapter.year+' 에피소드를 완료했어! '+(next?'다음 장이 개방됐어.':'모든 공개 에피소드를 완료했어.'));
 }});
}
function showMenu(){
 modal={type:'menu'};held.clear();autoTarget=null;$('storyOverlay').classList.remove('hidden');
 $('overlayTag').textContent='PAUSE MENU';$('overlayTitle').textContent='탐험 메뉴';
 $('speaker').textContent='기록관';$('portrait').textContent='史';
 $('dialogueText').textContent='진행 상황은 이 브라우저에 자동 저장돼. 이어서 탐험할 수 있어.';
 $('dialogueExtra').innerHTML='<div class="dialog-choices"><button data-menu="continue">▶ 계속 플레이</button><button data-menu="journal">📖 기록 수첩 확인</button><button data-menu="restart">↻ 현재 챕터 초기화</button><button data-menu="museum">🏛️ 박물관으로 돌아가기</button></div>';
 $('dialogBack').classList.add('hidden');$('dialogNext').classList.add('hidden');
}
function resetChapter(){
 if(!confirm('이 챕터에서 수집한 기록과 대화·연표 진행을 초기화할까? 다른 챕터 완료 기록은 유지돼.'))return;
 save.chapters[chapter.id]={collected:[],spoken:[],insight:0,zone:0,intro:false,timelineSolved:false,quizSolved:false};persist();closeDialog();jumpChapter(chapter.id,true);
}
function drawFill(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}
function line(x,y,w,h,c){drawFill(x,y,w,h,c)}
function drawText(x,y,t,size=13,c='#f7ebd8',align='center'){ctx.fillStyle=c;ctx.font='800 '+size+'px system-ui,sans-serif';ctx.textAlign=align;ctx.fillText(String(t),x,y)}
function drawBox(x,y,w,h,c,outline){
 drawFill(x,y,w,h,c);if(outline){ctx.strokeStyle=outline;ctx.lineWidth=2;ctx.strokeRect(x,y,w,h)}
}
function scenePalette(){
 const palettes={ep1945:{sky:'#454256',rear:'#403e4f',build:'#514858',wall:'#756469',street:'#353746',detail:'#d6b289'},ep1948:{sky:'#384e64',rear:'#405569',build:'#566478',wall:'#788391',street:'#344352',detail:'#ebcfad'},ep1960:{sky:'#464661',rear:'#49445a',build:'#625b73',wall:'#8f7f92',street:'#3e4359',detail:'#cfb9b0'}};
 return palettes[chapter.id]||palettes.ep1945;
}
function drawBackground(){
 const p=scenePalette();
 drawFill(0,0,W,H,p.sky);
 for(let i=0;i<25;i++){const x=i*49,y=110+(i%5)*13;drawFill(x,y,37,235,p.rear)}
 for(let x=38;x<W;x+=180){
  const h=160+(x%4)*15,y=176+(x%3)*17;
  drawBox(x,y,155,h,p.build,p.wall);
  drawBox(x+9,y+12,137,29,p.wall,p.detail);
  for(let j=0;j<3;j++)for(let k=0;k<2;k++)drawBox(x+16+k*69,y+53+j*42,43,25,j%2?'#2b3c4b':'#283341','#9d8b82');
  drawFill(x+56,y+h-64,43,64,'#393442');
 }
 const location=chapter.zones[zone];
 if(location.kind==='archive'||location.kind==='assembly'||location.kind==='square60'){
  drawBox(95,115,770,240,'#343744',p.detail);
  drawBox(140,130,680,59,'#655869',p.detail);
  drawText(480,171,location.kind==='assembly'?'제헌 기록 보관실':location.kind==='square60'?'시민 기록실':'시대의 자료 보관실',23,'#f2debd');
  for(let i=0;i<5;i++){drawBox(157+i*135,215,99,90,'#443e4c','#aa927d');for(let k=0;k<3;k++)drawFill(166+i*135,225+k*22,82,12,'#c2ab8a')}
 }
 if(location.kind==='school'){drawBox(123,138,710,195,'#67657c',p.detail);drawBox(135,148,686,45,'#b5b2b7',p.detail);drawText(479,178,'학교 앞 거리',25,'#3a3a4e')}
 if(location.kind==='city'){drawBox(220,145,520,177,'#74778a',p.detail);drawText(480,185,'시민의 기록',24,'#ffe4bc')}
 drawFill(0,343,W,67,'#67606b');drawFill(0,407,W,153,p.street);
 for(let x=0;x<W;x+=95)drawFill(x+10,423,59,4,'#b0a09a');
 for(let x=35;x<W;x+=55){drawFill(x,455+(x%3),3,70,'#ffffff0a')}
 drawFill(0,347,W,5,p.detail);
 for(const x of [62,899]){drawFill(x,244,8,104,'#262d38');drawBox(x-5,229,18,20,'#f0d6a3','#ae907b')}
 drawText(480,122,chapter.year+' · '+short(location.title,32),18,'#fff2d5');
}
function drawNPC(x,y,o,near){
 const bob=Math.sin(performance.now()/450+o.x/100)*2;
 drawFill(x-18,y-8+bob,36,39,'#4b5d6b');
 drawBox(x-20,y-26+bob,40,25,'#eccca7','#5b4a49');
 drawFill(x-22,y-36+bob,44,11,'#554458');
 drawFill(x-13,y+26+bob,11,14,'#343545');drawFill(x+3,y+26+bob,11,14,'#343545');
 drawText(x,y-54+bob,o.icon,21);
 drawBox(x-82,y-89,164,26,near?'#f6dca9':'#252937',near?'#e1c49a':'#847c89');
 drawText(x,y-72,short(o.name,13),12,near?'#2d2930':'#fff0d2');
}
function drawClue(x,y,o,near,collected){
 ctx.save();ctx.shadowColor=near?'#ffda9c':'#0009';ctx.shadowBlur=near?19:8;
 drawBox(x-61,y-62,122,91,near?'#b18d70':'#685968',near?'#ffe7b9':'#a28a7b');ctx.restore();
 drawBox(x-48,y-49,96,61,'#3a3a45','#cbb397');
 drawText(x,y-18,o.icon,25);
 drawText(x,y+6,short(o.name,12),11,'#e9d6b6');
 drawText(x,y+48,collected?'✓ 수집 완료':'▣ 조사 가능',11,collected?'#b5e1c3':'#ffdea4');
}
function drawGate(x,y,near){
 const ready=zone===0?zoneUnlocked():allRequired();
 drawBox(x-36,y-77,72,117,ready?'#7e6c7c':'#4e4a5a',ready?'#f6d29f':'#817f86');
 drawBox(x-28,y-68,56,98,ready?'#394b5d':'#2c2d3a','#a98c75');
 drawBox(x+17,y-7,6,6,'#f1cf8c');
 drawText(x,y-99,zone===0?'다음 시간':'시간의 문',14,'#f7dda7');
 drawText(x,y+56,ready?'열림 · E':'잠김',11,ready?'#b4e5c2':'#ffbbba');
 if(near)drawText(x,y-117,'E 조사',12,'#fff6d9');
}
function drawHero(){
 const moving=held.size>0||!!autoTarget,step=moving?Math.sin(performance.now()/100)*3:0,x=actor.x,y=actor.y;
 ctx.fillStyle='#0b0e1755';ctx.beginPath();ctx.ellipse(x,y+30,19,7,0,0,Math.PI*2);ctx.fill();
 drawFill(x-14,y-17+step,28,36,'#738fa0');
 drawFill(x-10,y+20+step,9,13,'#383d51');drawFill(x+1,y+20-step,9,13,'#383d51');
 drawBox(x-13,y-36+step,26,23,'#f3d2ab','#4e424b');
 drawFill(x-16,y-40+step,32,9,'#3c3542');
 drawText(x,y-58+step,'기록자',11,'#fff1d6');
}
function renderCanvas(){
 drawBackground();
 const near=getNear();
 stationList().forEach(o=>{
  const active=near===o;const collected=currentCollected().includes(o.id);
  if(o.kind==='npc')drawNPC(o.x,o.y,o,active);else drawClue(o.x,o.y,o,active,collected);
 });
 drawGate(862,360,near?.kind==='gate');
 drawHero();
 const room=shared();
 if(room)for(const p of room.players){if(p.id===room.me||p.zone!==zone)continue;drawBox(p.x-12,p.y-28,24,35,'#ae8398','#ebd5b8');drawBox(p.x-9,p.y-48,18,18,'#f5cfae','#9a726c');drawText(p.x,p.y-56,short(p.name,9),11,'#fbe2b7')}
 if(near)drawText(near.x,near.y-117,'E / Space',12,'#fff8d1');
 $('nearLabel').textContent=near?'조사 대상: '+near.name+' · E / Space 또는 터치':'WASD · 방향키 이동 / E 또는 Space 대화·조사';
}
function frame(now){
 const dt=Math.min((now-frameAt)/1000||0,.052);frameAt=now;
 if(!modal){
  let dx=Number(held.has('d')||held.has('arrowright'))-Number(held.has('a')||held.has('arrowleft'));
  let dy=Number(held.has('s')||held.has('arrowdown'))-Number(held.has('w')||held.has('arrowup'));
  if(dx||dy){autoTarget=null;const len=Math.hypot(dx,dy);actor.x=clamp(actor.x+dx/len*190*dt,60,906);actor.y=clamp(actor.y+dy/len*190*dt,235,496)}
  else if(autoTarget){
   const tx=autoTarget.x,ty=autoTarget.y+88,ddx=tx-actor.x,ddy=ty-actor.y,len=Math.hypot(ddx,ddy);
   if(len<108){const hit=autoTarget;autoTarget=null;handleTarget(hit)}
   else{const pace=Math.min(len-100,dt*235);actor.x=clamp(actor.x+ddx/len*pace,60,906);actor.y=clamp(actor.y+ddy/len*pace,235,496)}
  }
 }
 renderCanvas();requestAnimationFrame(frame);
}
function isTyping(){return ['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)}
document.addEventListener('keydown',ev=>{
 const k=ev.key.toLowerCase();
 if(modal){
  if(k==='escape'&&modal.type!=='timeline'&&modal.type!=='quiz'){ev.preventDefault();closeDialog();return}
  if(['enter',' '].includes(k)&&modal.type==='lines'){ev.preventDefault();advanceDialog();return}
  return;
 }
 if(isTyping())return;
 if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){held.add(k);if(k.startsWith('arrow'))ev.preventDefault();return}
 if(k==='e'||k===' '){ev.preventDefault();if(!ev.repeat)handleTarget();return}
 if(k==='escape'){ev.preventDefault();showMenu()}
});
document.addEventListener('keyup',ev=>held.delete(ev.key.toLowerCase()));
window.addEventListener('blur',()=>held.clear());
document.addEventListener('visibilitychange',()=>{if(document.hidden)held.clear()});
document.querySelectorAll('[data-move]').forEach(btn=>{
 const key={up:'arrowup',down:'arrowdown',left:'arrowleft',right:'arrowright'}[btn.dataset.move];
 btn.addEventListener('pointerdown',ev=>{ev.preventDefault();autoTarget=null;held.add(key);try{btn.setPointerCapture(ev.pointerId)}catch{}});
 for(const type of ['pointercancel','pointerup','lostpointercapture'])btn.addEventListener(type,()=>held.delete(key));
});
canvas.addEventListener('click',ev=>{
 if(modal)return;
 const r=canvas.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width*W,y=(ev.clientY-r.top)/r.height*H;
 const o=stationList().concat([{id:'timegate',kind:'gate',name:'시간의 문',x:862,y:360}]).find(o=>Math.abs(x-o.x)<90&&Math.abs(y-o.y)<100);
 if(o){autoTarget=o;setNote('목표로 이동 중…')}else canvas.focus();
});
$('actionButton').addEventListener('click',()=>handleTarget());
$('backZone').addEventListener('click',()=>changeZone(zone-1));$('forwardZone').addEventListener('click',()=>changeZone(zone+1));
$('finalChallenge').addEventListener('click',openFinal);
$('pauseButton').addEventListener('click',showMenu);$('restartButton').addEventListener('click',resetChapter);
$('chapterList').addEventListener('click',ev=>{
 const b=ev.target.closest('[data-chapter]');if(b&&b.dataset.chapter){closeDialog();jumpChapter(b.dataset.chapter,true)}
});
$('journalBody').addEventListener('click',ev=>{
 const b=ev.target.closest('[data-jitem]');if(!b)return;const o=byObject(b.dataset.jitem);if(o)showClue(o);
});
document.querySelectorAll('[data-jtab]').forEach(b=>b.addEventListener('click',()=>{jtab=b.dataset.jtab;renderJournal()}));
$('openJournal').addEventListener('click',()=>{
 $('journalPanel').scrollIntoView({behavior:'smooth',block:'start'});jtab='clue';renderJournal();
});
$('dialogBack').addEventListener('click',()=>{
 if(!modal)return;
 if(modal.type==='lines'&&modal.index>0){modal.index--;renderDialog()}
 else if(modal.type==='timeline'){selection=[];renderTimeline()}
});
$('dialogNext').addEventListener('click',()=>{
 if(!modal)return;
 if(modal.type==='quiz'&&modal.answered){finishChapter();return}
 advanceDialog();
});
$('dialogClose').addEventListener('click',closeDialog);
$('dialogueExtra').addEventListener('click',ev=>{
 const decision=ev.target.closest('[data-decision]');
 if(decision&&modal?.type==='choices'){chooseView(Number(decision.dataset.decision));return}
 const t=ev.target.closest('[data-timeline]');
 if(t&&modal?.type==='timeline'&&!selection.includes(t.dataset.timeline)){selection.push(t.dataset.timeline);renderTimeline();return}
 const q=ev.target.closest('[data-quiz-choice]');
 if(q&&modal?.type==='quiz'){checkQuiz(Number(q.dataset.quizChoice));return}
 const menu=ev.target.closest('[data-menu]');
 if(menu&&modal?.type==='menu'){
  const act=menu.dataset.menu;
  if(act==='continue')closeDialog();
  if(act==='journal'){closeDialog();$('journalPanel').scrollIntoView({behavior:'smooth'})}
  if(act==='restart')resetChapter();
  if(act==='museum')window.location.assign('/history-museum.html');
 }
});
$('storyOverlay').addEventListener('click',ev=>{
 if(ev.target===$('storyOverlay')&&modal?.type==='lines')closeDialog();
});
$('muteToggle').addEventListener('click',()=>{
 save.sound=!save.sound;persist();
 $('muteToggle').textContent=save.sound?'🔊 효과음 켜짐':'🔇 효과음 꺼짐';
 if(save.sound)beep('success');
});
$('muteToggle').textContent=save.sound?'🔊 효과음 켜짐':'🔇 효과음 꺼짐';
window.MB_HISTORY_STORY_DEBUG={
 get chapter(){return chapter?.id},get collected(){return chapterState?.collected.slice()},get spoken(){return chapterState?.spoken.slice()},
 get zone(){return zone},get completed(){return save.completed.slice()},get insight(){return chapterState?.insight},
 get modalType(){return modal?.type},get unlocked(){return save.unlocked.slice()},get position(){return {x:actor.x,y:actor.y,zone}},
 syncShared(){const r=shared();if(r){for(const id of r.completed||[])if(!save.completed.includes(id))save.completed.push(id);for(const id of r.unlocked||[])if(!save.unlocked.includes(id))save.unlocked.push(id);persist()}updateUI()},forceJump(id){if(!save.unlocked.includes(id))save.unlocked.push(id);persist();jumpChapter(id,false)},
 jump:jumpChapter,interact:o=>handleTarget(o),openFinal,changeZone,chooseView,checkQuiz
};
jumpChapter(dataFor(save.current)&&save.unlocked.includes(save.current)?save.current:'ep1945',true);
frameAt=performance.now();requestAnimationFrame(frame);
})();