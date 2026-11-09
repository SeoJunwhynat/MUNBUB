(function(){
"use strict";
var db=window.HISTORY_FINAL_DB,root=document.getElementById("app"),tabs=document.getElementById("tabs");
if(!db||!Array.isArray(db.items)){root.innerHTML='<div class="empty">역사 학습 데이터를 불러오지 못했습니다. 새로고침해 주세요.</div>';return}
var facts=db.items,units=db.chapters;
var state={tab:"home",unit:"all",search:"",session:[],index:0,chosen:-1,score:0,start:0,timer:null,review:false,finished:false};
var fromDisk=function(key){try{return new Set(JSON.parse(localStorage.getItem("history_final_"+key)||"[]"))}catch(e){return new Set()}};
var wrong=fromDisk("wrong"),saved=fromDisk("saved"),all=[];
var save=function(key,set){try{localStorage.setItem("history_final_"+key,JSON.stringify(Array.from(set)))}catch(e){}};
var enc=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
var rnd=function(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var temp=a[i];a[i]=a[j];a[j]=temp}return a};
var y=function(s){return s.slice(0,4)};
var dt=function(s){return s.replace(/-/g,". ")};
var valDate=function(e){var t=e.date.split("-");return Number(t[0])*10000+Number(t[1]||1)*100+Number(t[2]||1)};
var toast=function(text){var el=document.getElementById("toast");el.textContent=text;el.style.display="block";clearTimeout(toast.timer);toast.timer=setTimeout(function(){el.style.display="none"},1800)};
var unitSelect=function(){return '<label class="field">단원<select id="unit"><option value="all">전체 범위</option>'+Object.keys(units).map(function(k){return '<option value="'+k+'" '+(state.unit===k?"selected":"")+'>'+enc(units[k])+'</option>'}).join("")+"</select></label>"};
var section=function(t,p){return "<h2>"+t+'</h2><p class="muted">'+p+"</p>"};
var filtered=function(){var text=state.search.toLowerCase().trim();return facts.filter(function(f){return (state.unit==="all"||f.u===state.unit)&&(!text||(f.title+" "+f.detail+" "+f.keyword+" "+f.date).toLowerCase().includes(text))})};
var control=function(withUnit){return '<div class="controls">'+(withUnit?unitSelect():"")+'<label class="field">키워드 검색<input type="search" id="search" placeholder="사건·연도·인물·개념" value="'+enc(state.search)+'"></label><button class="btn" id="resetFilter">필터 초기화</button></div>'};
var options=function(ev,field){var key=function(x){return field==="date"?y(x.date):x[field]};var candidates=rnd(facts.filter(function(x){return x.id!==ev.id&&x.u===ev.u})).concat(rnd(facts.filter(function(x){return x.id!==ev.id&&x.u!==ev.u}))),result=[],used=new Set([key(ev)]);for(var i=0;i<candidates.length&&result.length<3;i++){var k=key(candidates[i]);if(!used.has(k)){used.add(k);result.push(candidates[i])}}return result};
var add=function(id,ev,type,level,body,choices,answer,explanation,wrongNotes){if(choices.length!==4||new Set(choices).size!==4||!choices.includes(answer))return;all.push({id:id,ev:ev,type:type,level:level,body:body,choices:rnd(choices),answer:answer,explanation:explanation,wrongNotes:wrongNotes||{}})};
facts.forEach(function(f){
 var o=options(f,"title"),t=[f.title].concat(o.map(function(v){return v.title})),twhy={};o.forEach(function(v){twhy[v.title]="이것은 "+v.title+"에 관한 내용입니다. "+v.detail});
 add(f.id+"-event",f,"event","basic","다음 설명에 해당하는 사건·현상·정책은?\n\n"+f.detail,t,f.title,f.title+": "+f.detail,twhy);
 var years=options(f,"date"),yw={};years.forEach(function(v){yw[y(v.date)]=v.title+"은(는) "+dt(v.date)+"에 해당합니다."});
 add(f.id+"-year",f,"year","basic","다음 사건이 일어난 연도로 가장 적절한 것은?\n\n"+f.title,[y(f.date)].concat(years.map(function(v){return y(v.date)})),y(f.date),f.title+"의 시기는 "+dt(f.date)+"입니다. "+f.detail,yw);
 var k=options(f,"keyword"),kw={};k.forEach(function(v){kw[v.keyword]="‘"+v.keyword+"’은(는) "+v.title+"와 관련됩니다."});
 add(f.id+"-keyword",f,"keyword","advanced","다음 사건과 직접 연결되는 핵심어는?\n\n"+f.title,[f.keyword].concat(k.map(function(v){return v.keyword})),f.keyword,f.detail,kw);
 var d=options(f,"detail"),dw={};d.forEach(function(v){dw[v.detail]="이 설명은 "+v.title+"의 내용입니다."});
 add(f.id+"-meaning",f,"meaning","advanced","다음 사건에 대한 설명으로 옳은 것은?\n\n"+f.title,[f.detail].concat(d.map(function(v){return v.detail})),f.detail,f.title+"의 핵심 특징입니다. "+f.detail,dw);
 if(["민주","헌법","정부","선거","정치","국제회의","외교","경제","통일","사건","전쟁","노동"].includes(f.type)){
  add(f.id+"-source",f,"source","advanced","[시대 상황을 재구성한 학습용 사료형 문제 — 원문 아님]\n\n"+f.keyword+"\n"+f.detail+"\n\n이 자료에서 추론되는 사건은?",t,f.title,f.title+"에 관한 상황을 학습용으로 재구성했습니다. "+f.detail,twhy);
 }
});
Object.keys(units).forEach(function(u){var group=facts.filter(function(f){return f.u===u}).sort(function(a,b){return valDate(a)-valDate(b)});
for(var pos=0;pos<group.length-3;pos+=2){
 var four=[],seen=new Set();for(var j=pos;j<group.length&&four.length<4;j++){if(!seen.has(y(group[j].date))){seen.add(y(group[j].date));four.push(group[j])}}if(four.length<4)continue;
 var mixed=rnd(four),abc=["가","나","다","라"],answer=four.map(function(f){return abc[mixed.indexOf(f)]}).join(" → "),choices=[answer];for(var i=0;i<24&&choices.length<4;i++){var s=rnd(mixed).map(function(f){return abc[mixed.indexOf(f)]}).join(" → ");if(!choices.includes(s))choices.push(s)}
 add(u+"-order-"+pos,four[0],"order","advanced","사건을 발생한 순서대로 바르게 나열한 것은?\n\n"+mixed.map(function(f,i){return abc[i]+". "+f.title}).join("\n"),choices,answer,"올바른 순서: "+four.map(function(f){return dt(f.date)+" "+f.title}).join(" → "));
}});
// Hand-reviewed source reasoning questions, distinct from generated reconstructed source items.
(window.MB_HISTORY_DEEP_SOURCES||[]).forEach(function(s){
 if(!s.quiz)return;
 var ev=facts.find(function(f){return f.id===s.eventId})||facts[0];
 add("deep-"+s.id,ev,"source","advanced",s.quiz.question,s.quiz.choices,s.quiz.answer,s.quiz.explanation,s.quiz.wrongNotes||{});
});
var people=[
["여운형","광복 전 건국 동맹을 결성했고 광복 직후 건국 준비 위원회 활동을 이끌었다."],
["김구","임시 정부의 주요 지도자였으며 광복 후 통일 정부를 위한 남북 협상에 참여했다."],
["김규식","좌우 합작과 남북 협상에 관여하며 통일 정부 수립을 모색했다."],
["이승만","대한민국 초대 대통령. 발췌 개헌과 사사오입 개헌을 거쳐 집권을 이어가다 4·19 혁명 뒤 하야했다."],
["장면","제2공화국의 국무총리로 의원 내각제 정부를 이끌었다."],
["박정희","5·16 군사 정변과 제3공화국·유신 체제, 경제 개발 정책에 관련된 인물이다."],
["전태일","1970년 노동 현장의 현실과 근로 기준법 준수를 요구하여 노동권 문제를 널리 알렸다."],
["김영삼","민주화 운동에 참여했으며 문민정부에서 금융 실명제 등을 추진했다."],
["김대중","민주화 운동에 참여했으며 1997년 대통령 선거에서 당선되어 첫 평화적 여야 정권 교체를 이뤘다."],
["전두환","신군부의 권력 장악 과정과 제5공화국 통치에 핵심적으로 관여했다."],
["노태우","6·29 선언을 발표하고 1987년 대통령 선거를 통해 취임했다."],
["이한열","1987년 6월 민주 항쟁 중 경찰의 최루탄에 맞아 중상을 입고 이후 사망했다."],
["박종철","1987년 경찰 조사를 받다 사망했으며 사건 진상 은폐 시도가 밝혀져 민주화 운동의 계기가 되었다."],
["노무현","참여정부를 이끌며 참여 민주주의와 지역 균형 발전을 주요 과제로 추진했다."]
];
function setTab(tab){if(state.timer)clearInterval(state.timer);state.timer=null;state.tab=tab;tabs.querySelectorAll("[data-tab]").forEach(function(b){b.classList.toggle("active",b.dataset.tab===tab)});draw();window.scrollTo(0,0)}
function home(){
root.innerHTML='<div class="hero"><div class="eyebrow">2022 개정 · 한국사 2 · 기말 대비</div><h1>광복 이후 대한민국의 발전과 현대사</h1><p>기존 중간고사 학습기는 유지하고, 기말고사를 위한 핵심 사건·연도·개념·사료형·연표 문제와 오답 복습을 별도 구성했습니다.</p><div class="stats"><div class="stat"><b>8</b><span>주제</span></div><div class="stat"><b>'+facts.length+'</b><span>핵심 개념</span></div><div class="stat"><b>'+all.length+'</b><span>문제 후보</span></div><div class="stat"><b>'+wrong.size+'</b><span>누적 오답</span></div></div><div class="actions"><button class="btn main" data-go="quiz">기말 문제 풀기</button><button class="btn" data-go="concept">개념 정리</button><a href="/" class="btn" style="text-decoration:none">중간고사 이어서</a></div></div>'+
'<div class="panel">'+section("8개 주제별 학습","단원을 클릭하면 해당 범위의 문제만 출제됩니다.")+'<div class="grid">'+Object.keys(units).map(function(k){return '<button class="card unit" data-unitgo="'+k+'"><div class="date">'+k+'</div><h3>'+enc(units[k])+'</h3><div class="small">핵심 사건 '+facts.filter(function(f){return f.u===k}).length+'개</div></button>'}).join("")+'</div></div>'+
'<div class="panel card"><h3>교과서 연계 범위 안내</h3><p class="muted">제공된 한국사 2 교과서 캡처를 주제별로 참고한 자체 제작 학습 자료입니다. 전자교과서의 전체 본문을 그대로 옮긴 것이 아니며, 학교가 지정한 기말 시험 범위와 정확히 일치한다고 단정하지 않습니다. 사료형 문제는 원문이 아닌 재구성 문장입니다.</p><a href="https://ebook.dongapublishing.com/ebook/ecatalog5.asp?Dir=2394" target="_blank" rel="noopener">동아출판 전자교과서 보기</a></div>';
}
function setup(){
root.innerHTML=section("기말 실전 문제풀이","문항 수·난이도·유형을 선택해 연습할 수 있습니다. 정답 선택 후 모든 선지의 이유를 확인하세요.")+
'<div class="card"><div class="controls">'+unitSelect()+
'<label class="field">난이도<select id="level"><option value="all">전체</option><option value="basic">기본</option><option value="advanced">심화</option></select></label>'+
'<label class="field">문제 유형<select id="type"><option value="all">전체</option><option value="event">사건 추론</option><option value="year">연도 판단</option><option value="keyword">핵심어</option><option value="meaning">역사적 의미</option><option value="source">사료형</option><option value="order">연표 배열</option></select></label>'+
'<label class="field">문항 수<select id="count"><option value="10">10문제</option><option value="20" selected>20문제</option><option value="30">30문제</option><option value="50">50문제</option><option value="10000">선택 범위 전체</option></select></label></div>'+
'<div class="actions"><button class="btn main" id="start">문제 시작</button><button class="btn" data-go="wrong">오답 노트 ('+wrong.size+')</button></div><p class="small">문항은 검토된 개념 데이터를 바탕으로 여러 형태로 자동 구성됩니다. 선지 배열은 매번 바뀝니다.</p></div>';
}
function begin(review,list){
var unit=document.getElementById("unit")?document.getElementById("unit").value:state.unit;
var lev=document.getElementById("level")?document.getElementById("level").value:"all";
var type=document.getElementById("type")?document.getElementById("type").value:"all";
var count=Number(document.getElementById("count")?document.getElementById("count").value:10000);
state.unit=unit;state.review=!!review;state.session=rnd(list||all.filter(function(q){return (unit==="all"||q.ev.u===unit)&&(lev==="all"||q.level===lev)&&(type==="all"||q.type===type)&&(!review||wrong.has(q.id))})).slice(0,count);
if(!state.session.length){toast("선택한 조건에 문제가 없습니다.");return}
state.index=0;state.score=0;state.chosen=-1;state.start=Date.now();state.tab="quiz";question();
}
function clock(){var n=Math.floor((Date.now()-state.start)/1000);return Math.floor(n/60)+":"+String(n%60).padStart(2,"0")}
function question(){
if(state.timer)clearInterval(state.timer);
if(state.index>=state.session.length){result();return}
var q=state.session[state.index],chosen=state.chosen;
root.innerHTML='<div class="quiz"><div class="actions" style="justify-content:space-between"><span class="chip">'+enc(units[q.ev.u])+'</span><span id="clock" class="date">'+clock()+'</span></div><div style="display:flex;justify-content:space-between"><b>문제 '+(state.index+1)+' / '+state.session.length+'</b><span class="small">'+(q.level==="advanced"?"심화":"기본")+' · '+q.type+'</span></div><div class="progress"><div style="width:'+(state.index*100/state.session.length)+'%"></div></div>'+
'<section class="card"><div class="actions" style="justify-content:flex-end"><button class="btn" id="bookmark">'+(saved.has(q.id)?"★ 저장됨":"☆ 즐겨찾기")+'</button></div><div class="question">'+enc(q.body)+'</div><div class="choices">'+q.choices.map(function(c,i){return '<button class="choice '+(chosen>=0?(c===q.answer?"correct":chosen===i?"wrong":""):"")+'" data-choice="'+i+'" '+(chosen>=0?"disabled":"")+'><b>'+(i+1)+'</b><span>'+enc(c)+'</span></button>'}).join("")+'</div>'+
(chosen>=0?feedback(q,chosen):"")+'</section><div class="actions"><button class="btn" id="quit">문제 설정으로</button>'+(chosen>=0?'<button class="btn main" id="next">'+(state.index+1===state.session.length?"결과 확인":"다음 문제")+'</button>':"")+'</div></div>';
if(chosen<0){var clockNode=document.getElementById("clock");state.timer=setInterval(function(){if(clockNode)clockNode.textContent=clock()},1000)}
}
function feedback(q,index){
var ok=q.choices[index]===q.answer;
return '<div class="feedback '+(ok?"good":"")+'"><h3>'+(ok?"✅ 정답":"❌ 오답 · 정답 "+(q.choices.indexOf(q.answer)+1)+"번")+'</h3><p>'+enc(q.explanation)+'</p><details><summary>전체 선지 정오 해설</summary>'+q.choices.map(function(c,i){return '<p><b>'+(i+1)+'번 '+(c===q.answer?"[정답]":"[오답]")+'</b> '+enc(c===q.answer?q.explanation:(q.wrongNotes[c]||"시기 또는 설명의 주제가 정답과 일치하지 않습니다."))+'</p>'}).join("")+'</details></div>';
}
function choose(i){
if(state.chosen>=0)return;var q=state.session[state.index];state.chosen=i;
if(q.choices[i]===q.answer){state.score++;if(state.review){wrong.delete(q.id);save("wrong",wrong)}}
else{wrong.add(q.id);save("wrong",wrong)}
question();
}
function result(){
if(state.timer)clearInterval(state.timer);state.timer=null;
var pct=Math.round(state.score*100/state.session.length);
root.innerHTML='<div class="quiz card"><div class="eyebrow">기말 모의고사 결과</div><h1>학습 완료 🎯</h1><div class="result">'+pct+'점</div><p>'+state.session.length+'문항 중 '+state.score+'개 정답 · 풀이시간 '+clock()+'</p><p class="muted">틀린 문제는 이 브라우저의 오답노트에 자동 저장됩니다.</p><div class="actions"><button class="btn main" data-go="quiz">다른 문제 풀기</button><button class="btn" data-go="wrong">오답 복습 ('+wrong.size+')</button></div></div>';
}
function concepts(){
var a=filtered();root.innerHTML=section("개념·사건 정리","사건의 배경·전개·의의를 확인하고 핵심어를 암기하세요.")+control(true)+
'<div class="grid">'+(a.length?a.map(function(f){return '<div class="card"><div class="date">'+dt(f.date)+'</div><h3>'+enc(f.title)+'</h3><p>'+enc(f.detail)+'</p><span class="chip">'+enc(f.keyword)+'</span><p class="small">'+enc(units[f.u])+'</p></div>'}).join(""):'<div class="empty">검색 결과가 없습니다.</div>')+'</div>';
}
function timeline(){
var a=filtered().sort(function(a,b){return valDate(a)-valDate(b)});
root.innerHTML=section("한국 현대사 연표","시대별 중요한 사건을 연대순으로 정리했습니다. 사건의 원인과 결과도 함께 살펴보세요.")+control(true)+
'<section class="card timeline">'+(a.length?a.map(function(f){return '<div class="line"><div class="date">'+dt(f.date)+'</div><h3>'+enc(f.title)+'</h3><p>'+enc(f.detail)+'</p><span class="chip">'+enc(units[f.u])+'</span></div>'}).join(""):'<div class="empty">검색 결과가 없습니다.</div>')+'</section>';
}
function sources(){
var deep=window.MB_HISTORY_DEEP_SOURCES||[];
var term=state.search.toLowerCase().trim();
var a=deep.filter(function(s){return (state.unit==="all"||s.u===state.unit)&&(!term||(s.title+" "+s.summary+" "+s.context+" "+s.signals.join(" ")+" "+s.date).toLowerCase().includes(term))});
root.innerHTML=section("사료 집중 분석","교과서 캡처를 참고해 독자적으로 작성한 사료 해설입니다. 원문을 그대로 복제한 내용이 아니며, 사료의 표현·배경·역사적 의미를 비교해 학습합니다.")+control(true)+
'<div class="card"><b>🔎 사료 분석법</b><p>① 시대 단서 확인 → ② 작성 주체와 목적 파악 → ③ 역사적 배경과 결과 연결 → ④ 비슷한 사료와 비교 → ⑤ 관련 문제 해결</p><p class="small">원문 전문을 대신하는 자료가 아닙니다. 교과서나 공식 사료를 함께 확인하세요.</p><div class="actions"><button class="btn main" data-go="quiz">사료형 문제 풀기</button></div></div>'+
'<div class="grid">'+(a.length?a.map(function(s){return '<article class="card source"><span class="chip">'+enc(units[s.u]||"한국사")+'</span><div class="date">'+enc(s.date)+'</div><h3>'+enc(s.title)+'</h3><p>'+enc(s.summary)+'</p><p class="small">자료 유형: '+enc(s.kind)+'</p><details><summary>분석하기 · 배경 / 핵심 표현 / 함정</summary><h3>역사적 배경</h3><p>'+enc(s.context)+'</p><h3>판별 단서</h3><p>'+s.signals.map(enc).join(" · ")+'</p><h3>혼동 주의</h3><p>'+enc(s.trap)+'</p><h3>함께 비교</h3><p>'+enc(s.compare)+'</p><p class="small">교과서의 관련 주제: '+enc(s.source)+'</p></details></article>'}).join(""):'<div class="empty">해당 조건의 사료 노트가 없습니다.</div>')+'</div>';
}
function persons(){
var term=state.search.toLowerCase(),a=people.filter(function(p){return (p[0]+p[1]).toLowerCase().includes(term)});
root.innerHTML=section("인물별 정리","정부 수립·민주화·산업화에 등장하는 주요 인물의 특징을 비교합니다.")+control(false)+
'<div class="grid">'+a.map(function(p){return '<article class="card"><h3 class="date">'+enc(p[0])+'</h3><p>'+enc(p[1])+'</p></article>'}).join("")+'</div>';
}
function flow(){
var rows=[
["광복과 정부 수립",["광복","분할 점령","미소 공동 위원회","5·10 총선거","정부 수립"]],
["전쟁의 전개",["6·25 전쟁","인천 상륙","중국군 참전","정전 회담","정전 협정"]],
["민주주의의 변화",["3·15 부정 선거","4·19 혁명","유신 체제","5·18","6월 항쟁"]],
["경제 구조의 변화",["원조 경제","경제 개발 계획","중화학 공업화","노동권 확대","외환 위기"]],
["남북 관계",["7·4 공동 성명","남북 기본 합의서","6·15 공동 선언","판문점 선언"]]
];
root.innerHTML=section("역사 흐름·개념 지도","실제 지리 지도 대신 사건 사이의 흐름을 시각화한 개념도입니다.")+
'<div class="grid">'+rows.map(function(row){return '<div class="card"><h3>'+row[0]+'</h3><div class="flow">'+row[1].map(function(t,i){return (i?'<span class="arrow">→</span>':"")+'<span class="node">'+t+'</span>'}).join("")+'</div></div>'}).join("")+'</div>'+
'<div class="panel card"><h3>실제 지도·사진 자료 확인</h3><p><a href="https://www.archives.go.kr" target="_blank" rel="noopener">국가기록원</a>, <a href="https://www.museum.go.kr" target="_blank" rel="noopener">국립중앙박물관</a>, <a href="https://ebook.dongapublishing.com/ebook/ecatalog5.asp?Dir=2394" target="_blank" rel="noopener">동아출판 교과서</a>에서 출처를 확인하세요.</p></div>';
}
function review(){
var w=all.filter(function(q){return wrong.has(q.id)}),b=all.filter(function(q){return saved.has(q.id)});
root.innerHTML=section("오답노트와 즐겨찾기","정답을 맞히면 복습 완료로 오답에서 제외됩니다. 기록은 현재 브라우저에만 저장됩니다.")+
'<div class="card"><h3>오답 '+w.length+'개 · 저장한 문제 '+b.length+'개</h3><div class="actions"><button id="reviewStart" class="btn main" '+(w.length?"":"disabled")+'>오답 다시 풀기</button><button id="savedStart" class="btn" '+(b.length?"":"disabled")+'>즐겨찾기 풀기</button><button id="clearWrong" class="btn" '+(w.length?"":"disabled")+'>오답 초기화</button></div></div>'+
'<div class="panel"><h3>오답 목록</h3>'+(w.length?'<div class="grid">'+w.slice(0,100).map(function(q){return '<div class="card"><div class="chip">'+enc(units[q.ev.u])+'</div><h3>'+enc(q.ev.title)+'</h3><div class="small">유형: '+q.type+'</div></div>'}).join("")+'</div>':'<div class="empty">아직 기록한 오답이 없습니다.</div>')+'</div>';
}
function draw(){
if(state.tab==="home")home();else if(state.tab==="quiz")setup();else if(state.tab==="concept")concepts();else if(state.tab==="timeline")timeline();else if(state.tab==="sources")sources();else if(state.tab==="people")persons();else if(state.tab==="flow")flow();else if(state.tab==="wrong")review();
}
tabs.addEventListener("click",function(e){var b=e.target.closest("[data-tab]");if(b)setTab(b.dataset.tab)});
root.addEventListener("click",function(e){
 var go=e.target.closest("[data-go]");if(go){setTab(go.dataset.go);return}
 var u=e.target.closest("[data-unitgo]");if(u){state.unit=u.dataset.unitgo;setTab("quiz");return}
 if(e.target.id==="start"){begin(false);return}
 var c=e.target.closest("[data-choice]");if(c){choose(Number(c.dataset.choice));return}
 if(e.target.id==="next"){state.index++;state.chosen=-1;question();return}
 if(e.target.id==="quit"){setTab("quiz");return}
 if(e.target.id==="bookmark"){var q=state.session[state.index];if(saved.has(q.id))saved.delete(q.id);else saved.add(q.id);save("saved",saved);e.target.textContent=saved.has(q.id)?"★ 저장됨":"☆ 즐겨찾기";return}
 if(e.target.id==="reviewStart"){state.unit="all";begin(true);return}
 if(e.target.id==="savedStart"){begin(false,all.filter(function(q){return saved.has(q.id)}));return}
 if(e.target.id==="clearWrong"&&confirm("모든 오답 기록을 삭제할까요?")){wrong.clear();save("wrong",wrong);review();return}
 if(e.target.id==="resetFilter"){state.unit="all";state.search="";draw();return}
});
root.addEventListener("change",function(e){if(e.target.id==="unit"){state.unit=e.target.value;if(["concept","timeline","sources"].includes(state.tab))draw()}});
root.addEventListener("input",function(e){if(e.target.id==="search"){state.search=e.target.value;var caret=e.target.selectionStart;draw();var input=document.getElementById("search");if(input){input.focus();try{input.setSelectionRange(caret,caret)}catch(_){}}}});
draw();
})();