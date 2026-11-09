/* 시간의 기록: 2D 역사 박물관 — 전시·기록·퀴즈·멀티 클라이언트 */
(function(){
'use strict';
const data=window.HISTORY_FINAL_DB||{},facts=Array.isArray(data.items)?data.items:[],src=Array.isArray(window.MB_HISTORY_DEEP_SOURCES)?window.MB_HISTORY_DEEP_SOURCES:[],units=data.chapters||{};
const C=document.getElementById('museum'),ctx=C.getContext('2d'),W=960,H=600;
if(!ctx){document.getElementById('sceneCaption').textContent='Canvas를 지원하는 브라우저가 필요해요.';return}
const $=id=>document.getElementById(id),allUnit=Object.keys(units),order=['A','B','C','D','E','F','G','H'];
const labels={lobby:'중앙 로비',A:'광복과 정부 수립',B:'전쟁과 분단',C:'민주화의 길',D:'산업화와 경제',E:'문화와 일상',F:'6월 항쟁 이후',G:'현대 사회·경제',H:'남북 관계와 평화',archive:'기록 보관소',exam:'역사 시험장',online:'멀티 접수처',achieve:'업적 전시관',story:'시간의 기록자 스토리'};
const icons={lobby:'🏛️',A:'🌅',B:'🕊️',C:'✊',D:'🏗️',E:'🎞️',F:'🗳️',G:'💹',H:'🤝',archive:'📚',exam:'📝',online:'🌐',achieve:'🏅',story:'📜'};
const color={lobby:'#d2aa74',A:'#d3b08a',B:'#a7b6c6',C:'#bd8b89',D:'#9aaf99',E:'#aa9ac8',F:'#90bdb7',G:'#c6ad8b',H:'#96aebf',archive:'#c0a8d0',exam:'#e0a879',online:'#92baac',achieve:'#e0bd76',story:'#e7b885'};
const sourceMap=new Map(src.map(s=>[s.id,s])),factMap=new Map(facts.map(f=>[f.id,f]));
const itemsByUnit={};order.forEach(u=>itemsByUnit[u]=[]);
src.forEach(s=>{if(itemsByUnit[s.u])itemsByUnit[s.u].push({key:'source:'+s.id,type:'source',unit:s.u,date:s.date,title:s.title,source:s,fact:factMap.get(s.eventId)})});
facts.forEach(f=>{if(itemsByUnit[f.u])itemsByUnit[f.u].push({key:'event:'+f.id,type:'event',unit:f.u,date:f.date,title:f.title,fact:f})});
order.forEach(u=>itemsByUnit[u].sort((a,b)=>String(a.fact?.date||a.date).localeCompare(String(b.fact?.date||b.date))||(a.type==='source'?-1:1)));
const ALL=order.flatMap(u=>itemsByUnit[u]),itemMap=new Map(ALL.map(x=>[x.key,x])),total=ALL.length;
const readStore=(key,otherwise)=>{try{const x=JSON.parse(localStorage.getItem('mbHistoryMuseumV2_'+key)||'null');return x??otherwise}catch{return otherwise}};
const progress={visited:new Set(readStore('visited',[])),saved:new Set(readStore('saved',[])),solved:new Set(readStore('solved',[])),missed:new Set(readStore('missed',[])),halls:new Set(readStore('halls',[]))};
const persist=()=>{for(const key of Object.keys(progress))try{localStorage.setItem('mbHistoryMuseumV2_'+key,JSON.stringify([...progress[key]]))}catch(e){}};
let scene='lobby',page=0,pos={x:480,y:535},held=new Set(),last=0,focusItem=null,recordTab='summary',tab='exhibit',quiz=null,timerToast=0,roomCode='',account=null,roomState=null,netBusy=false,polling=null,loadingRooms=false;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v)),esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const short=(txt,max=15)=>String(txt).length>max?String(txt).slice(0,max-1)+'…':String(txt);
const count=unit=>itemsByUnit[unit]?.length||0;
const pageCount=unit=>Math.max(1,Math.ceil(count(unit)/6));
const activeItems=()=>itemsByUnit[scene]?.slice(page*6,(page+1)*6)||[];
function toast(s){const el=$('toast');el.textContent=s;el.classList.add('visible');clearTimeout(timerToast);timerToast=setTimeout(()=>el.classList.remove('visible'),2800)}
function saveStats(){persist();$('overallProgress').textContent=progress.visited.size+' / '+total+' 전시 조사';$('progressMeter').style.width=(total?progress.visited.size/total*100:0)+'%';$('achievementLine').textContent='🏅 관람 '+progress.visited.size+'개 · 저장 '+progress.saved.size+'개 · 정답 '+progress.solved.size+'개 · 방문한 시대관 '+progress.halls.size+'/8'}
function changeTab(next){tab=next;document.querySelectorAll('[data-tab]').forEach(el=>{el.classList.toggle('active',el.dataset.tab===next);el.setAttribute('aria-selected',String(el.dataset.tab===next))});$('tabExhibit').classList.toggle('hidden',next!=='exhibit');$('tabArchive').classList.toggle('hidden',next!=='archive');$('tabGame').classList.toggle('hidden',next!=='game');if(next==='archive')renderArchive();if(next==='game'){checkAccount();listRooms();ensurePolling()}}
function renderHalls(){
 $('hallButtons').innerHTML=['lobby','story',...order,'archive','exam','online','achieve'].map(id=>'<button type="button" data-hall="'+id+'" class="'+(scene===id?'active':'')+'">'+icons[id]+' '+labels[id]+'<small>'+(order.includes(id)?progress.visited.size&&itemsByUnit[id].filter(x=>progress.visited.has(x.key)).length+'/'+count(id)+' 기록':id==='lobby'?'중앙 입구':'이동하기')+'</small></button>').join('');
}
function go(next,step=0){
 if(!labels[next])return;scene=next;page=clamp(step,0,pageCount(next)-1);pos={x:480,y:530};held.clear();
 if(order.includes(next)){progress.halls.add(next);saveStats()}
 $('sceneName').textContent=icons[next]+' '+labels[next];
 $('sceneCaption').textContent=order.includes(next)?'전시 '+(page+1)+' / '+pageCount(next)+' · 사료와 사건 '+count(next)+'개':({lobby:'8개의 역사관으로 향하는 중앙 로비 · 특별 전시실',archive:'한국사 연표와 수집 기록을 검색해 보세요.',exam:'전시별 문제를 풀거나 기말 실전문제로 이동하세요.',online:'로그인하고 전용 역사 퀴즈방에 참가하세요.',achieve:'관람 기록을 바탕으로 업적을 확인하세요.'})[next];
 $('roomTag').textContent=next==='lobby'?'CENTRAL ATRIUM':order.includes(next)?'GALLERY '+next+' · '+(page+1)+'/'+pageCount(next):next.toUpperCase();
 $('prevWing').disabled=!order.includes(next)||page===0;
 $('nextWing').disabled=!order.includes(next)||page>=pageCount(next)-1;
 renderHalls();if(next==='archive'){changeTab('archive')}if(next==='online'){changeTab('game')}if(next==='achieve'){changeTab('exhibit');showAchievements()}if(next==='exam'){toast('전시대에서 문제를 풀거나 한국사 실전 문제를 열어 봐!')}
 persist();
}
function lobbyObjects(){
 const nodes=order.map((id,i)=>({type:'portal',to:id,title:labels[id],icon:icons[id],x:[135,365,595,825][i%4],y:i<4?195:365}));
 nodes.push({type:'portal',to:'archive',title:'기록 보관소',icon:'📚',x:115,y:495});
 nodes.push({type:'portal',to:'exam',title:'역사 시험장',icon:'📝',x:297,y:495});
 nodes.push({type:'portal',to:'story',title:'스토리 모드',icon:'📜',x:480,y:495});
 nodes.push({type:'portal',to:'online',title:'멀티 접수처',icon:'🌐',x:663,y:495});
 nodes.push({type:'portal',to:'achieve',title:'업적관',icon:'🏅',x:845,y:495});
 return nodes;
}
function objects(){
 if(scene==='lobby')return lobbyObjects();
 if(order.includes(scene))return activeItems().map((item,i)=>({type:'exhibit',item,x:[195,480,765][i%3],y:i<3?225:395,title:item.title}));
 if(scene==='archive')return [{type:'action',action:'archive',title:'연표·자료 검색',icon:'📚',x:280,y:290},{type:'action',action:'saved',title:'수집 기록함',icon:'🗂️',x:680,y:290}];
 if(scene==='exam')return [{type:'action',action:'quiz',title:'전시 퀴즈',icon:'🧩',x:275,y:300},{type:'action',action:'study',title:'기말 실전',icon:'📝',x:690,y:300}];
 if(scene==='online')return [{type:'action',action:'online',title:'역사 대전 접수처',icon:'🌐',x:475,y:290}];
 return [{type:'action',action:'achieve',title:'업적·수집품',icon:'🏆',x:475,y:280}];
}
function nearest(){
 let selected=null,best=118;
 for(const o of objects()){const delta=Math.hypot(pos.x-o.x,pos.y-o.y);if(delta<best){best=delta;selected=o}}
 return selected;
}
function interact(obj=nearest()){
 if(!obj){toast('전시대·문 가까이 이동해서 E 또는 조사 버튼을 눌러 줘.');return}
 if(obj.type==='portal'){if(obj.to==='story'){window.location.assign('/history-story.html');return}go(obj.to);return}
 if(obj.type==='exhibit'){openItem(obj.item);return}
 if(obj.action==='archive'){changeTab('archive')}
 if(obj.action==='saved'){$('onlySaved').checked=true;changeTab('archive')}
 if(obj.action==='quiz'){const pool=ALL.filter(x=>x.type==='source');openQuiz(pool[Math.floor(Math.random()*pool.length)])}
 if(obj.action==='study')window.location.assign('/history-study.html');
 if(obj.action==='online'){changeTab('game')}
 if(obj.action==='achieve'){showAchievements()}
}
function openItem(item){
 focusItem=item;recordTab='summary';progress.visited.add(item.key);saveStats();renderHalls();changeTab('exhibit');renderExhibit();
 toast('🔎 '+item.title+' · 조사 기록에 추가했어.');
}
function currentDate(item){return item.type==='source'?(item.source.date||item.fact?.date||''):item.fact?.date||item.date}
function recordViews(item){
 if(!item)return {};
 if(item.type==='source'){
  const s=item.source,f=item.fact;
  return {summary:'**전시 핵심**\n'+s.summary+'\n\n'+(s.context||''),
   context:'**시대적 배경**\n'+s.context+'\n\n**사료를 구분하는 핵심 표현**\n'+s.signals.join(' · '),
   chronology:'**전시 연도**\n'+currentDate(item)+'\n\n**연관 사건**\n'+(f?f.title+' ('+f.date+')\n'+f.detail:'관련 사건 정보 없음')+'\n\n**비교하기**\n'+(s.compare||''),
   caution:'**오답을 피하는 방법**\n'+(s.trap||'사건의 원인과 결과를 함께 구별하세요.')+'\n\n※ 이 전시의 사료 설명은 학습용으로 작성한 요약·재구성이며, 교과서·문서의 원문 이미지는 아닙니다.'};
 }
 const f=item.fact;
 return {summary:'**역사 기록**\n'+f.detail+'\n\n**핵심어**\n'+f.keyword,
 context:'**역사적 맥락**\n'+f.detail+'\n\n연관 단원: '+units[f.u],
 chronology:'**발생 시기**\n'+currentDate(item)+'\n\n**사건 유형**\n'+f.type,
 caution:'**학습 포인트**\n연도를 외울 때는 사건의 배경·전개·영향을 함께 확인하세요.\n\n이 자료는 사실에 기초한 자체 작성 학습 요약입니다.'};
}
function rich(s){return esc(s).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>')}
function renderExhibit(){
 const t=$('exhibitView');if(!focusItem){t.innerHTML='<div class="cover"><div class="seal">史</div><span class="eyebrow">CURATOR’S NOTE</span><h2>시간 속 기록을 찾으세요</h2><p>전시대로 걸어가서 <b>E</b> 또는 조사 버튼을 누르면 자료를 탐구할 수 있어요.</p></div>';$('readQuiz').disabled=true;$('saveRecord').disabled=true;return}
 const item=focusItem,views=recordViews(item);
 t.innerHTML='<div class="recordHead"><span class="docType">'+(item.type==='source'?'📜 사료 집중 분석':'📅 역사 기록')+'</span><div class="date">'+esc(currentDate(item))+'</div><h2>'+esc(item.title)+'</h2><p class="small">'+esc(units[item.unit])+'</p></div>'+
 '<div class="recordTabs">'+[['summary','개요'],['context','배경·단서'],['chronology','연도·비교'],['caution','오답 주의']].map(([k,label])=>'<button data-record="'+k+'" class="'+(recordTab===k?'active':'')+'">'+label+'</button>').join('')+'</div>'+
 '<div class="recordBody">'+rich(views[recordTab])+'<div class="related"><small>사료 원문이나 저작권이 있는 교과서 페이지를 그대로 수록하지 않은 학습 전시입니다.</small></div></div>';
 $('readQuiz').disabled=false;$('saveRecord').disabled=false;$('saveRecord').textContent=progress.saved.has(item.key)?'✅ 수집 기록 저장됨':'📌 기록 저장';
 t.querySelectorAll('[data-record]').forEach(b=>b.addEventListener('click',()=>{recordTab=b.dataset.record;renderExhibit()}));
}
function archiveMatches(){
 const query=$('archiveSearch').value.trim().toLowerCase(),unit=$('archiveUnit').value,only=$('onlySaved').checked;
 return ALL.filter(x=>(unit==='all'||x.unit===unit)&&(!only||progress.visited.has(x.key))&&(!query||(x.title+' '+currentDate(x)+' '+(x.fact?.detail||x.source?.summary||'')).toLowerCase().includes(query)));
}
function renderArchive(){
 const matches=archiveMatches();$('archiveStats').textContent='전체 '+total+'건 · 조사 '+progress.visited.size+'건 · 즐겨찾기 '+progress.saved.size+'건 · 검색 결과 '+matches.length+'건';
 $('archiveList').innerHTML=matches.length?matches.slice(0,180).map(x=>'<button type="button" data-record-key="'+esc(x.key)+'"><b>'+(progress.visited.has(x.key)?'<span class="done">✓ </span>':'')+esc(x.title)+'</b><small>'+esc(currentDate(x))+' · '+(x.type==='source'?'사료':'사건')+'</small></button>').join(''):'<p class="small">조건과 일치하는 기록이 없어.</p>';
}
const achievements=[
 {name:'첫 발자국',desc:'기록 1개 조사',done:()=>progress.visited.size>=1},
 {name:'자료 조사관',desc:'사료 10개 조사',done:()=>[...progress.visited].filter(x=>x.startsWith('source:')).length>=10},
 {name:'역사의 관찰자',desc:'기록 30개 조사',done:()=>progress.visited.size>=30},
 {name:'시대 여행자',desc:'8개 시대관 모두 방문',done:()=>progress.halls.size===8},
 {name:'시간의 기록자',desc:'모든 전시 조사',done:()=>progress.visited.size>=total},
 {name:'첫 정답',desc:'박물관 문제 1개 정답',done:()=>progress.solved.size>=1},
 {name:'사료 감별사',desc:'박물관 문제 10개 정답',done:()=>progress.solved.size>=10},
 {name:'아카이브 수집가',desc:'기록 20개 북마크',done:()=>progress.saved.size>=20}
];
function showAchievements(){
 focusItem=null;changeTab('exhibit');$('readQuiz').disabled=true;$('saveRecord').disabled=true;
 const done=achievements.filter(x=>x.done()).length;
 $('exhibitView').innerHTML='<div class="recordHead"><span class="eyebrow">ACHIEVEMENTS</span><h2>🏅 기록자의 업적</h2><p>달성 '+done+' / '+achievements.length+'개</p></div>'+
 achievements.map(a=>'<div style="padding:12px 2px;border-bottom:1px solid #69556a"><b style="color:'+(a.done()?'#f4d49b':'#b4a8b6')+'">'+(a.done()?'🏆 ':'🔒 ')+esc(a.name)+'</b><div class="small">'+esc(a.desc)+'</div></div>').join('');
}
function sampleQuiz(item){
 const s=item?.source;
 if(s?.quiz?.choices?.length===4&&s.quiz.choices.includes(s.quiz.answer)){
  return {key:item.key,prompt:s.quiz.question,choices:s.quiz.choices,answer:s.quiz.answer,explain:s.quiz.explanation||s.summary}
 }
 const f=item.fact||factMap.get(item.source?.eventId);
 if(!f)return null;
 const candidates=facts.filter(x=>x.id!==f.id&&x.u===f.u).concat(facts.filter(x=>x.id!==f.id&&x.u!==f.u));
 const others=[...new Set(candidates.map(x=>x.title).filter(x=>x!==f.title))].slice(0,3);
 if(others.length!==3)return null;
 const choices=[f.title,...others];
 for(let i=choices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]]}
 return {key:item.key,prompt:'다음 역사 자료가 가리키는 사건·정책은?\n\n'+(s?s.context:f.detail),choices,answer:f.title,explain:f.title+' · '+f.date+'\n'+f.detail}
}
function openQuiz(item){
 if(!item){toast('풀 수 있는 문제가 없어.');return}
 quiz=sampleQuiz(item);if(!quiz){toast('이 전시는 준비된 문제가 없어.');return}
 $('quizTitle').textContent=item.title+' · 확인 문제';$('quizPrompt').textContent=quiz.prompt;
 $('quizFeedback').textContent='';$('quizFeedback').className='';$('quizChoices').innerHTML=quiz.choices.map((x,i)=>'<button type="button" data-qchoice="'+i+'"> '+['①','②','③','④'][i]+' '+esc(x)+'</button>').join('');
 $('nextQuiz').classList.add('hidden');$('quizOverlay').classList.remove('hidden');held.clear();
}
function answerQuiz(i){
 if(!quiz||quiz.done)return;quiz.done=true;const chosen=quiz.choices[i],correct=chosen===quiz.answer;
 if(correct){progress.solved.add(quiz.key);progress.missed.delete(quiz.key)}else progress.missed.add(quiz.key);
 persist();saveStats();$('quizFeedback').textContent=(correct?'✅ 정답! ':'❌ 오답. 정답: '+quiz.answer+'\n')+quiz.explain;
 $('quizFeedback').className=correct?'good':'bad';
 [...$('quizChoices').children].forEach((b,j)=>{b.disabled=true;if(quiz.choices[j]===quiz.answer)b.classList.add('correct');else if(j===i)b.classList.add('wrong')});
 $('nextQuiz').classList.remove('hidden');
}
function closeQuiz(){quiz=null;$('quizOverlay').classList.add('hidden')}
function fill(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h)}
function rect(x,y,w,h,r,base,outline){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=base;ctx.fill();if(outline){ctx.lineWidth=2;ctx.strokeStyle=outline;ctx.stroke()}}
function text(x,y,str,font,color,align='center'){ctx.font=font;ctx.textAlign=align;ctx.fillStyle=color;ctx.fillText(str,x,y)}
function drawFloor(){
 const accent=color[scene]||color.lobby;
 fill(0,0,W,H,'#191a25');
 for(let y=35;y<H;y+=36){for(let x=32;x<W;x+=36){fill(x,y,35,35,(Math.floor(x/36)+Math.floor(y/36))%2?'#292831':'#24232b');}}
 ctx.save();ctx.globalAlpha=.2;ctx.strokeStyle=accent;ctx.lineWidth=1.2;
 for(let x=64;x<920;x+=72){ctx.beginPath();ctx.moveTo(x,50);ctx.lineTo(x,H-27);ctx.stroke()}
 ctx.restore();
 fill(0,0,W,56,'#42313e');fill(0,0,42,H,'#322835');fill(W-42,0,42,H,'#322835');fill(0,H-31,W,31,'#322835');
 fill(40,56,W-80,7,'#a27e5a');fill(40,H-38,W-80,5,'#6c5252');
 for(const x of [70,890]){rect(x-12,82,24,420,7,'#4d3b48','#a48360');rect(x-21,72,42,25,6,'#584652','#c8a075');rect(x-21,485,42,25,6,'#584652','#c8a075')}
 const lamps=[90,320,640,870];lamps.forEach(x=>{const rg=ctx.createRadialGradient(x,95,2,x,95,112);rg.addColorStop(0,'#f7d3a525');rg.addColorStop(1,'#f7d3a500');ctx.fillStyle=rg;ctx.beginPath();ctx.arc(x,95,113,0,Math.PI*2);ctx.fill();rect(x-9,56,18,15,5,'#f3d69a','#ae804e')});
 rect(320,72,320,47,12,'#433440','#e3ba7e');text(480,103,'時 間 의 記 錄', '900 23px sans-serif','#ffe2a7');
 rect(430,536,100,19,5,'#9d7961','#e0bc89');
}
function drawPortal(o,near){
 const w=scene==='lobby'?176:260,h=74,x=o.x-w/2,y=o.y-h/2;
 ctx.save();ctx.shadowColor=near?'#ffe3aa':'#000';ctx.shadowBlur=near?24:9;
 rect(x,y,w,h,11,near?'#76574c':'#423744',near?'#ffd49a':'#b08d70');ctx.restore();
 rect(x+7,y+7,w-14,h-14,9,'#261f2e','#88705f');
 text(o.x,y+3,o.icon,'24px sans-serif','#fff');
 text(o.x,y+25,short(o.title,scene==='lobby'?12:19),'800 12px sans-serif','#f7e2c0');
 if(near){text(o.x,y-51,'E 입장','900 12px sans-serif','#ffe2b5')}
}
function drawStand(o,near){
 const x=o.x,y=o.y,seen=progress.visited.has(o.item.key),highlight=near||focusItem?.key===o.item.key;
 ctx.save();ctx.shadowColor=highlight?'#ffc889':'#000';ctx.shadowBlur=highlight?30:15;
 rect(x-120,y-65,240,103,11,highlight?'#73524c':'#4d3f49',highlight?'#ffe0ad':'#af896e');
 ctx.restore();
 rect(x-106,y-57,212,72,9,'#302831','#a99077');
 rect(x-78,y-54,156,16,4,o.item.type==='source'?'#d1ae7b':'#93a9ba');
 ctx.fillStyle='#f4e4c5';ctx.textAlign='center';
 text(x,y-42,o.item.type==='source'?'史料 · RECORD':'EVENT · CHRONICLE','800 9px sans-serif','#22212a');
 text(x,y-14,short(o.item.title,15),'900 16px sans-serif','#f4deba');
 text(x,y+6,short(String(currentDate(o.item)),22),'700 11px sans-serif','#c7bdba');
 text(x,y+30,seen?'✓ 조사 완료':'🔎 새 기록','800 10px sans-serif',seen?'#a5dfb1':'#f7d5a0');
 rect(x-89,y+38,178,18,5,'#6e5155','#9a8471');
 if(near)text(x,y-80,'E 조사 / 눌러서 확인','900 12px sans-serif','#fff1cb');
}
function drawActor(){
 const moving=held.size>0,t=performance.now()/130,step=moving?Math.sin(t)*2.5:0;
 ctx.save();ctx.fillStyle='#0008';ctx.beginPath();ctx.ellipse(pos.x,pos.y+24,20,8,0,0,Math.PI*2);ctx.fill();
 rect(pos.x-14,pos.y-13+step,28,33,7,'#8da1af','#e4d9c6');
 rect(pos.x-12,pos.y+16+step,10,12,3,'#4d4758','#c0b3b6');rect(pos.x+2,pos.y+16-step,10,12,3,'#4d4758','#c0b3b6');
 ctx.fillStyle='#f2cdab';ctx.beginPath();ctx.arc(pos.x,pos.y-22+step,16,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#3b3039';ctx.stroke();
 ctx.beginPath();ctx.fillStyle='#413039';ctx.arc(pos.x,pos.y-28+step,15,Math.PI,Math.PI*2);ctx.fill();
 text(pos.x,pos.y-54,'기록자','800 12px sans-serif','#fce6c1');
 ctx.restore();
}
function paint(){
 drawFloor();const obs=objects(),near=nearest();
 if(scene==='lobby'){text(480,147,'✦  시대를 건너는 여덟 개의 전시실  ✦','900 15px sans-serif','#ebc78e');ctx.save();ctx.globalAlpha=.18;rect(430,225,100,110,49,'#caa779');ctx.restore();}
 else if(order.includes(scene)){text(480,155,'제 '+(page+1)+' 전시 구역 · '+count(scene)+'개의 기록 중 '+(page*6+1)+' ~ '+Math.min(count(scene),(page+1)*6),'800 13px sans-serif','#f4c993');}
 else text(480,169,icons[scene]+' '+labels[scene],'900 20px sans-serif','#f6ce98');
 for(const o of obs){const close=near===o;if(o.type==='exhibit')drawStand(o,close);else drawPortal(o,close)}
 drawActor();$('nearby').textContent=near?(near.type==='exhibit'?'가까운 전시: ':'이동: ')+short(near.title,21):'전시대 또는 출입문 가까이 이동하세요';
}
function collides(x,y){
 if(x<53||x>907||y<122||y>528)return true;
 for(const o of objects()){if(o.type!=='exhibit')continue;if(Math.abs(x-o.x)<121&&Math.abs(y-o.y)<72)return true}
 return false;
}
function frame(now){
 const dt=Math.min(.045,(now-last)/1000||0);last=now;
 let dx=Number(held.has('d')||held.has('arrowright'))-Number(held.has('a')||held.has('arrowleft'));
 let dy=Number(held.has('s')||held.has('arrowdown'))-Number(held.has('w')||held.has('arrowup'));
 if(dx||dy){const normal=Math.hypot(dx,dy),step=235*dt;dx=dx/normal*step;dy=dy/normal*step;
 if(!collides(pos.x+dx,pos.y))pos.x+=dx;
 if(!collides(pos.x,pos.y+dy))pos.y+=dy}
 paint();requestAnimationFrame(frame);
}
const inputActive=()=>['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);
document.addEventListener('keydown',ev=>{
 if(inputActive()||!$('quizOverlay').classList.contains('hidden')){if(ev.key==='Escape')closeQuiz();return}
 const key=ev.key.toLowerCase();
 if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(key)){ev.preventDefault()}
 if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)){held.add(key);return}
 if(key==='e'||key===' '){ev.preventDefault();if(!ev.repeat)interact()}
 if(key==='escape'&&scene!=='lobby')go('lobby');
});
document.addEventListener('keyup',ev=>held.delete(ev.key.toLowerCase()));
window.addEventListener('blur',()=>held.clear());
document.addEventListener('visibilitychange',()=>{if(document.hidden)held.clear()});
document.querySelectorAll('[data-move]').forEach(btn=>{
 const k={up:'arrowup',down:'arrowdown',left:'arrowleft',right:'arrowright'}[btn.dataset.move];
 btn.addEventListener('pointerdown',ev=>{ev.preventDefault();held.add(k);try{btn.setPointerCapture(ev.pointerId)}catch{}});
 ['pointerup','pointercancel','lostpointercapture'].forEach(n=>btn.addEventListener(n,()=>held.delete(k)));
});
C.addEventListener('click',ev=>{
 const bb=C.getBoundingClientRect(),x=(ev.clientX-bb.left)*W/bb.width,y=(ev.clientY-bb.top)*H/bb.height;
 const hit=objects().find(o=>Math.abs(x-o.x)<(o.type==='exhibit'?117:91)&&Math.abs(y-o.y)<(o.type==='exhibit'?58:41));
 if(hit)interact(hit);else C.focus();
});
$('interact').addEventListener('click',()=>interact());
$('returnHome').addEventListener('click',()=>go('lobby'));
$('prevWing').addEventListener('click',()=>go(scene,page-1));
$('nextWing').addEventListener('click',()=>go(scene,page+1));
$('expand').addEventListener('click',async()=>{
 const stage=$('stage');
 try{if(document.fullscreenElement)await document.exitFullscreen();else await stage.requestFullscreen()}catch{toast('이 브라우저는 전체 화면을 지원하지 않아.')}
});
$('hallButtons').addEventListener('click',ev=>{const b=ev.target.closest('[data-hall]');if(b){if(b.dataset.hall==='story')window.location.assign('/history-story.html');else go(b.dataset.hall)}});
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>changeTab(b.dataset.tab)));
$('readQuiz').addEventListener('click',()=>focusItem?openQuiz(focusItem):toast('전시 기록을 먼저 조사해 줘.'));
$('saveRecord').addEventListener('click',()=>{if(!focusItem)return;progress.saved.has(focusItem.key)?progress.saved.delete(focusItem.key):progress.saved.add(focusItem.key);saveStats();renderExhibit()});
$('archiveSearch').addEventListener('input',renderArchive);$('archiveUnit').addEventListener('change',renderArchive);$('onlySaved').addEventListener('change',renderArchive);
$('archiveList').addEventListener('click',ev=>{const b=ev.target.closest('[data-record-key]');if(b){const item=itemMap.get(b.dataset.recordKey);if(item)openItem(item)}});
$('quizChoices').addEventListener('click',ev=>{const b=ev.target.closest('[data-qchoice]');if(b)answerQuiz(Number(b.dataset.qchoice))});
$('closeQuiz').addEventListener('click',closeQuiz);$('nextQuiz').addEventListener('click',closeQuiz);
$('quizOverlay').addEventListener('click',ev=>{if(ev.target===$('quizOverlay'))closeQuiz()});
$('showAchievements').addEventListener('click',()=>{go('achieve');showAchievements()});
for(const u of order){$('archiveUnit').insertAdjacentHTML('beforeend','<option value="'+u+'">'+esc(labels[u])+'</option>')}
const netMessage=s=>$('networkMessage').textContent=s||'';
async function request(url,opts){
 const r=await fetch(url,{credentials:'same-origin',cache:'no-store',...opts});let data;
 try{data=await r.json()}catch{throw Error('서버 응답을 해석하지 못했어.')}
 if(!r.ok)throw Error(data.error||'서버 오류가 발생했어.');return data;
}
async function checkAccount(){
 if(account!==null)return;
 try{account=await request('/api/account');
 $('accountNote').textContent=account.loggedIn?'✅ 로그인: '+account.name+' · 역사 전용 멀티 참여 가능':'로그인이 필요해. 맛춘범 홈에서 로그인한 후 이 화면으로 돌아와 줘.';
 $('createRoom').disabled=!account.loggedIn;$('joinRoom').disabled=!account.loggedIn;
 }catch(e){$('accountNote').textContent='로그인 상태를 확인하지 못했어: '+e.message;$('createRoom').disabled=true;$('joinRoom').disabled=true}
}
function ensurePolling(){
 if(polling)return;
 polling=setInterval(()=>{if(tab!=='game'||document.hidden)return;if(roomCode)loadRoom(false);else listRooms(false)},3000);
}
async function listRooms(notify=true){
 if(roomCode||loadingRooms)return;loadingRooms=true;
 try{
 const r=await request('/api/history-museum');const list=r.rooms||[];
 $('roomList').innerHTML=list.length?list.map(row=>'<div class="roomLine"><div><strong>'+esc(row.name)+'</strong><span>'+esc(row.code)+' · '+esc(row.players)+' / '+esc(row.capacity)+'명 · '+esc(row.host)+'</span></div><button type="button" data-join-code="'+esc(row.code)+'" '+(!account?.loggedIn||row.players>=row.capacity?'disabled':'')+'>입장</button></div>').join(''):'<p class="small">현재 열린 역사 대전방이 없어. 새 방을 만들어 봐.</p>';
 if(notify)netMessage('열린 방 목록을 갱신했어.');
 }catch(e){if(notify)netMessage(e.message)}finally{loadingRooms=false}
}
function activeRoom(state){
 roomState=state;roomCode=state.code;$('multiplayer').classList.add('hidden');$('activeRoom').classList.remove('hidden');renderRoom();
}
async function loadRoom(notify=true){
 if(!roomCode||netBusy)return;
 try{const r=await request('/api/history-museum?code='+encodeURIComponent(roomCode));activeRoom(r.state)}
 catch(e){if(notify)netMessage(e.message);if(/없|참가|찾지/.test(e.message)){roomCode='';roomState=null;$('multiplayer').classList.remove('hidden');$('activeRoom').classList.add('hidden');listRooms()}}
}
async function post(action,extra={}){
 if(netBusy)return;netBusy=true;
 try{
 const payload={action,...extra};if(action!=='create')payload.code=roomCode||extra.code;
 const r=await request('/api/history-museum',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
 if(action==='leave'){roomCode='';roomState=null;$('multiplayer').classList.remove('hidden');$('activeRoom').classList.add('hidden');netMessage('방에서 나왔어.');listRooms();return}
 if(r.state){activeRoom(r.state);netMessage('')}
 }catch(e){netMessage(e.message)}finally{netBusy=false}
}
function renderRoom(){
 if(!roomState)return;
 const r=roomState,me=r.players.find(x=>x.id===r.me),host=r.hostId===r.me;
 $('activeRoomTitle').textContent=r.name;$('activeRoomCode').textContent=r.code;
 $('onlineHint').textContent=({lobby:'모든 참가자가 준비하면 방장이 시작해. 8문제 · 문제당 35초',live:'진행 중 · 자신의 답안을 선택해.',review:'정답 공개 · 방장이 다음 문제로 진행해.',results:'게임 종료! 아래 점수표를 확인해.'})[r.phase]||'';
 $('playerList').innerHTML=r.players.map(p=>'<div>'+(p.id===r.hostId?'👑 ':'')+esc(p.name)+(p.id===r.me?' (나)':'')+' · '+p.score+'점 · '+(r.phase==='lobby'?(p.ready?'✅ 준비':'대기'):(p.answered?'✓ 제출':'생각 중'))+'</div>').join('');
 const round=r.round;
 $('readyRoom').classList.toggle('hidden',r.phase!=='lobby');$('readyRoom').textContent=me?.ready?'준비 취소':'준비하기';
 $('startRoom').classList.toggle('hidden',!host||r.phase!=='lobby');$('startRoom').disabled=!r.canStart;
 $('nextRound').classList.toggle('hidden',!host||r.phase!=='review');
 if(r.phase==='results'){$('roundView').innerHTML='<div class="multiplayerQuestion"><h3>🏆 경기 종료!</h3><p>'+r.players.slice().sort((a,b)=>b.score-a.score).map((p,i)=>(i+1)+'위 '+esc(p.name)+' — '+p.score+'점').join('<br>')+'</p></div>';return}
 if(!round){$('roundView').innerHTML='';return}
 const done=round.myChoice!==null,review=r.phase==='review';
 $('roundView').innerHTML='<div class="multiplayerQuestion"><small>문제 '+round.number+'/'+round.total+' · '+esc(units[round.unit]||'한국사')+' · 35초</small><h3>'+esc(round.prompt)+'</h3>'+
 round.choices.map((c,i)=>'<button type="button" class="choiceM '+(review&&i===round.correctIndex?'correct':review&&i===round.myChoice?'incorrect':'')+'" data-online-choice="'+i+'" '+(review||done?'disabled':'')+'>'+['①','②','③','④'][i]+' '+esc(c)+'</button>').join('')+
 (review?'<p style="color:#b5ecc6"><b>정답: '+['①','②','③','④'][round.correctIndex]+'</b><br>'+esc(round.explanation)+'</p>':done?'<p>✅ 제출했어. 다른 참가자의 답을 확인 중…</p>':'<p class="small">선택해도 정답은 모두 답하거나 제한 시간이 끝나기 전에는 공개되지 않아.</p>')+'</div>';
}
$('roomList').addEventListener('click',ev=>{const b=ev.target.closest('[data-join-code]');if(b)post('join',{code:b.dataset.joinCode})});
$('refreshRooms').addEventListener('click',()=>listRooms());
$('createRoom').addEventListener('click',()=>post('create',{name:$('roomName').value}));
$('joinRoom').addEventListener('click',()=>{const code=$('roomCode').value.trim().toUpperCase();if(code.length!==8){netMessage('8자리 방 코드를 입력해 줘.');return}post('join',{code})});
$('roomCode').addEventListener('input',ev=>ev.target.value=ev.target.value.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g,'').slice(0,8));
$('readyRoom').addEventListener('click',()=>post('ready',{ready:!roomState?.players.find(p=>p.id===roomState.me)?.ready}));
$('startRoom').addEventListener('click',()=>post('start'));
$('nextRound').addEventListener('click',()=>post('next'));
$('leaveRoom').addEventListener('click',()=>post('leave'));
$('roundView').addEventListener('click',ev=>{const b=ev.target.closest('[data-online-choice]');if(b)post('answer',{choice:Number(b.dataset.onlineChoice)})});
$('readQuiz').disabled=true;$('saveRecord').disabled=true;saveStats();renderHalls();go('lobby');last=performance.now();requestAnimationFrame(frame);
window.MB_HISTORY_MUSEUM={get scene(){return scene},get total(){return total},get visited(){return progress.visited.size},get exhibits(){return ALL},go,openItem,showAchievements};
})();