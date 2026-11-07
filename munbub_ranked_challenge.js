/* Explicit online ranked quiz challenge, separate from normal unlimited practice. */
(()=>{
 'use strict';
 if(window.__mbRankedChallenge2026)return;
 window.__mbRankedChallenge2026=true;
 const $=id=>document.getElementById(id);
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const MODES={infinite:{title:'∞ 무한모드 랭킹전',detail:'제한 없이 최고 정답 수 도전'},hardcore:{title:'⚔ 하드코어 랭킹전',detail:'첫 오답에서 종료 · 속도에 따라 1~10점'},timed60:{title:'⏱ 1분 타임어택 랭킹전',detail:'60초 동안 최다 정답 도전'}};
 const dialog=document.createElement('dialog');
 dialog.id='mb-ranked-dialog';dialog.setAttribute('aria-label','맛춘범 온라인 랭킹전');
 document.body.append(dialog);
 const style=document.createElement('style');style.id='mb-ranked-dialog-style';style.textContent=[
  '#mb-ranked-dialog{box-sizing:border-box;width:min(92vw,790px);max-height:90dvh;padding:0;border:5px double #ae8260;border-radius:18px;overflow:auto;background:#f7e7d3;color:#3c2727;box-shadow:0 18px 65px #130c13b3}',
  '#mb-ranked-dialog::backdrop{background:#1c1118bf}',
  '#mb-ranked-dialog .mb-ranked-head{padding:16px 21px;background:linear-gradient(120deg,#42262b,#663539);color:#ffdfb8;display:flex;align-items:center;justify-content:space-between;gap:10px}',
  '#mb-ranked-dialog h2{font-size:clamp(21px,3vw,31px);margin:0}',
  '#mb-ranked-dialog .mb-ranked-body{padding:clamp(13px,2.3vw,25px)}',
  '#mb-ranked-dialog button{font:inherit;cursor:pointer;touch-action:manipulation;font-weight:900;border-radius:12px;border:3px solid #956445;background:linear-gradient(#fff2d5,#e5bd93);padding:11px;color:#482c26;min-height:44px}',
  '#mb-ranked-dialog .mb-ranked-modes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:13px 0}',
  '#mb-ranked-dialog .mb-ranked-modes button{min-width:0;word-break:keep-all;padding:14px 9px;line-height:1.5}',
  '#mb-ranked-dialog .mb-ranked-modes button.selected{background:#50303a;color:#ffe2bc;border-color:#dcad7e}',
  '#mb-ranked-dialog .mb-ranked-modes small{display:block;font-size:12px;font-weight:700}',
  '#mb-ranked-dialog .mb-ranked-primary{background:linear-gradient(#fadd9f,#d99a61);font-weight:1000;font-size:clamp(16px,2vw,21px);width:100%;margin-top:11px}',
  '#mb-ranked-dialog .mb-ranked-question{padding:clamp(15px,3vw,29px);border:4px double #976d58;border-radius:18px;background:#fffaf0;min-height:82px;font-size:clamp(20px,2.5vw,29px);font-weight:900;text-align:center;line-height:1.6;margin:16px 0}',
  '#mb-ranked-dialog .mb-ranked-stat{display:flex;flex-wrap:wrap;gap:8px;justify-content:space-between;padding:10px 14px;border:3px solid #b48a67;border-radius:12px;background:#fff4dc;font-weight:850}',
  '#mb-ranked-dialog .mb-ranked-choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}',
  '#mb-ranked-dialog .mb-ranked-choices button{padding:16px 11px;min-height:69px;background:#fff1d6;overflow-wrap:anywhere}',
  '#mb-ranked-dialog .mb-ranked-input{box-sizing:border-box;display:block;width:100%;padding:14px;border:3px solid #9a6950;border-radius:12px;font:inherit;font-size:19px;background:#fffdf7;color:#2f2225}',
  '#mb-ranked-dialog .mb-ranked-feedback{padding:17px;border:3px solid #a78461;border-radius:13px;background:#fff5e5;margin-top:10px;font-weight:850}',
  '#mb-ranked-dialog .mb-ranked-help{font-size:13px;line-height:1.7;color:#795749}',
  '#mb-ranked-dialog .mb-ranked-error{color:#a82b32;font-weight:900;min-height:1.3em}',
  '#mb-ranked-dialog #mb-ranked-close{width:auto;min-height:40px;padding:5px 12px}',
  '#view-setup #mb-ranked-entry{margin:12px 0;padding:14px 17px;background:linear-gradient(125deg,#503035,#7d4435);border:4px double #d7a276;border-radius:15px;color:#ffe6c4;box-shadow:0 4px 0 #291d21}',
  '#view-setup #mb-ranked-entry .mb-ranked-entry-row{display:flex;flex-wrap:wrap;align-items:center;gap:12px;justify-content:space-between}',
  '#view-setup #mb-ranked-entry button{border:3px solid #e2b387;border-radius:11px;padding:11px 16px;background:#f1d3a7;color:#462c2a;font-weight:1000;font-size:clamp(15px,1.75vw,19px);cursor:pointer}',
  '#view-setup #mb-ranked-entry p{margin:5px 0;font-size:13px;color:#ffe2c6}',
  '@media(max-width:540px){#mb-ranked-dialog .mb-ranked-modes{grid-template-columns:1fr}#mb-ranked-dialog .mb-ranked-choices{grid-template-columns:1fr}#mb-ranked-dialog .mb-ranked-modes button{padding:8px}#mb-ranked-dialog .mb-ranked-question{padding:13px;min-height:70px}}'
 ].join('\n');
style.textContent += [
 '.sidebar-nav button.mb-ranked-nav,.mobile-drawer button.mb-ranked-nav{display:flex!important;align-items:center!important;justify-content:center!important;position:relative!important;flex:none!important;box-sizing:border-box!important;width:100%!important;max-width:100%!important;min-height:0!important;aspect-ratio:2048/682!important;height:auto!important;margin:2px auto!important;padding:0!important;border:0!important;border-radius:0!important;outline-offset:0!important;background:transparent!important;background-image:none!important;box-shadow:none!important;filter:none!important;color:#f6d6a6!important;font-size:0!important;line-height:0!important;text-indent:0!important;overflow:visible!important;opacity:1!important;cursor:pointer!important}',
 '.sidebar-nav button.mb-ranked-nav .mb-ranked-art,.mobile-drawer button.mb-ranked-nav .mb-ranked-art{display:block!important;position:relative!important;width:100%!important;max-width:100%!important;height:auto!important;aspect-ratio:2048/682!important;object-fit:contain!important;opacity:1!important;filter:none!important;image-rendering:auto!important;pointer-events:none!important}',
 '.sidebar-nav button.mb-ranked-nav .mb-ranked-fallback,.mobile-drawer button.mb-ranked-nav .mb-ranked-fallback{display:none!important}',
 '.sidebar-nav button.mb-ranked-nav.art-missing,.mobile-drawer button.mb-ranked-nav.art-missing{font-size:18px!important;line-height:1.3!important;border:3px double #e6c49a!important;background:#492b30!important}',
 '.sidebar-nav button.mb-ranked-nav.art-missing .mb-ranked-fallback,.mobile-drawer button.mb-ranked-nav.art-missing .mb-ranked-fallback{display:inline!important}',
 '.sidebar-nav button.mb-ranked-nav:hover .mb-ranked-art,.mobile-drawer button.mb-ranked-nav:hover .mb-ranked-art{filter:brightness(1.12)!important;transform:scale(1.025)!important}',
 '.sidebar-nav button.mb-ranked-nav.active .mb-ranked-art,.mobile-drawer button.mb-ranked-nav.active .mb-ranked-art{filter:brightness(.78)!important}',
 '#mb-ranked-dialog{z-index:2147482000!important;isolation:isolate!important}',
 '#mb-ranked-dialog::backdrop{background:rgba(24,15,20,.33)!important}',
 '#mb-ranked-dialog .mb-ranked-modes{position:relative;z-index:1}',
 '#mb-ranked-dialog .mb-ranked-modes button{position:relative;z-index:2;opacity:1!important;visibility:visible!important}',
 '@media(max-width:700px){.sidebar-nav button.mb-ranked-nav,.mobile-drawer button.mb-ranked-nav{max-height:76px!important}}'
].join('\n');
style.textContent += '\n'+[
 '#mb-ranked-dialog .mb-ranked-hourglass{display:block;align-self:center;flex:0 0 auto;width:clamp(32px,6dvh,58px);height:clamp(32px,6dvh,58px);margin:0 auto;object-fit:contain;pointer-events:none}',
 '#mb-ranked-dialog[data-mb-ranked-mode="timed60"] .mb-ranked-body .mb-ranked-question{position:relative}',
 '#mb-ranked-dialog.mb-ranked-playing[open]{display:flex;flex-direction:column;width:min(98vw,1100px);height:98dvh;max-height:98dvh;overflow:hidden}',
 '#mb-ranked-dialog.mb-ranked-playing .mb-ranked-head{flex:0 0 auto;padding:6px 12px}',
 '#mb-ranked-dialog.mb-ranked-playing h2{font-size:clamp(16px,2.4vw,25px)}',
 '#mb-ranked-dialog.mb-ranked-playing .mb-ranked-body{flex:1 1 0;min-height:0;display:flex;flex-direction:column;gap:clamp(3px,1dvh,10px);padding:clamp(7px,1.5dvh,16px)!important;overflow:hidden}',
 '#mb-ranked-dialog.mb-ranked-playing .mb-ranked-stat{flex:0 0 auto;padding:5px 9px;font-size:clamp(11px,1.4vw,16px);gap:4px}',
 '#mb-ranked-dialog.mb-ranked-playing .mb-ranked-question{display:grid;place-items:center;flex:1 1 auto;min-height:0;margin:0;padding:clamp(8px,2dvh,20px);font-size:clamp(18px,2.4vw,30px);line-height:1.3}',
 '#mb-ranked-dialog.mb-ranked-playing .mb-ranked-choices{flex:1 1 auto;min-height:0;max-height:30dvh;grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:minmax(32px,1fr);gap:5px}',
 '#mb-ranked-dialog.mb-ranked-playing .mb-ranked-choices button{min-height:32px;padding:6px;font-size:clamp(13px,1.7vw,20px);line-height:1.25}',
 '#mb-ranked-dialog.mb-ranked-playing .mb-ranked-help{flex:0 0 auto;font-size:11px;line-height:1.25;margin:0}',
 '#mb-ranked-dialog.mb-ranked-playing .mb-ranked-feedback{flex:1 1 auto;min-height:0;overflow-y:auto;margin:0;padding:9px}',
 '#mb-ranked-dialog.mb-ranked-playing .mb-ranked-primary{min-height:34px;padding:6px;margin:0;font-size:16px}',
 '#mb-ranked-dialog.mb-ranked-playing #mb-ranked-stop{flex:0 0 auto;min-height:32px;padding:5px}',
 '#mb-ranked-dialog.mb-ranked-playing #mb-ranked-message{display:none}',
 '@media(max-height:500px){#mb-ranked-dialog.mb-ranked-playing .mb-ranked-question{font-size:17px;padding:6px}#mb-ranked-dialog.mb-ranked-playing .mb-ranked-stat>span:first-child{display:none}#mb-ranked-dialog.mb-ranked-playing .mb-ranked-hourglass{width:30px;height:30px}}'
].join('\n');
document.head.append(style);
 const visualCss=document.createElement('link');visualCss.rel='stylesheet';visualCss.href='./munbub_ranked_visual_20261106.css';document.head.append(visualCss);
 let selected='infinite',run=null,active=false,busy=false,mode=null,qid=null,
     correct=0,answered=0,score=0,deadline=null,lastResult=null,tickId=null,generation=0;
 const now=()=>Date.now();
 const safeMode=x=>MODES[x]?x:'infinite';
 function frame(title,content){
  dialog.classList.remove('mb-ranked-visual-open');
  dialog.classList.toggle('mb-ranked-playing',active);
  dialog.innerHTML='<div class="mb-ranked-head"><h2>'+esc(title)+'</h2><button id="mb-ranked-close" type="button" aria-label="랭킹전 닫기">✕</button></div>'+
   '<div class="mb-ranked-body">'+
   (dialog.dataset.mbRankedMode==='timed60'?'<img class="mb-ranked-hourglass" src="/ui-assets/hourglass_loop.webp" alt="움직이는 모래시계" width="96" height="96">':'')+
   content+'</div>';
 }
 async function api(data){
  const r=await fetch('/api/ranked',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  const json=await r.json().catch(()=>({}));
  if(!r.ok)throw Error(json.error||'랭킹 서버에 연결할 수 없어.');
  return json;
 }
 async function checkLogin(){
  try{const r=await fetch('/api/account',{credentials:'same-origin'}),j=await r.json();return !!j.loggedIn}catch{return false}
 }
 let rankingPeriod='all',rankFetchSerial=0;
 function rankPeriodLabel(p){return {all:'전체',day:'일간',week:'주간'}[p]||'전체'}
 function renderRankBoard(mode=selected,period=rankingPeriod){
  const target=dialog.querySelector('#mb-ranked-stage-rows');if(!target)return;
  const serial=++rankFetchSerial;
  target.textContent='랭킹 불러오는 중…';
  fetch('/api/leaderboard?mode='+encodeURIComponent(mode),{credentials:'same-origin'})
   .then(async r=>{const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||'랭킹 서버 연결 오류');return d})
   .then(data=>{
    if(serial!==rankFetchSerial||!dialog.open||!dialog.querySelector('#mb-ranked-stage-rows'))return;
    const all=Array.isArray(data.scores)?data.scores:[];
    // Historical server keeps each player's best result and its timestamp.
    // These tabs filter that stored best-result date, not a fresh per-day competition.
    const min=period==='day'?Date.now()-86400000:period==='week'?Date.now()-604800000:0;
    const scores=all.filter(x=>(Number(x.at)||0)>=min).slice(0,7);
    target.innerHTML=scores.length?scores.map((r,i)=>'<div class="mb-ranked-stage-row"><span>'+(i+1)+'</span><span>'+esc(r.name||'이름 없음')+'</span><strong>'+Math.max(0,Number(r.score)||0)+'</strong></div>').join(''):
      '<p class="mb-ranked-empty">'+(all.length?'이 기간에 등록된 최고 기록이 없어.':'아직 등록된 기록이 없어. 첫 도전에 나서 봐!')+'</p>';
   })
   .catch(e=>{if(serial===rankFetchSerial&&dialog.querySelector('#mb-ranked-stage-rows'))target.textContent=e.message});
 }
 function showLobby(message=''){
  active=false;run=null;mode=null;deadline=null;lastResult=null;
  dialog.classList.remove('mb-ranked-playing');
  dialog.classList.add('mb-ranked-visual-open');
  delete dialog.dataset.mbRankedMode;
  dialog.innerHTML='<section class="mb-ranked-lobby" aria-label="한옥 랭킹모드">'+
   '<img class="mb-ranked-lobby-art" src="/ui-assets/ranked-stage-final.png" alt="한옥 정원의 랭킹모드 화면" width="1672" height="941">'+
   '<button type="button" id="mb-ranked-stage-back" class="mb-ranked-hit" aria-label="돌아가기"></button>'+
   '<button type="button" id="mb-ranked-stage-guide" class="mb-ranked-hit" aria-label="랭킹 안내"></button>'+
   '<button type="button" id="mb-ranked-stage-reward" class="mb-ranked-hit" aria-label="보상 안내"></button>'+
   '<button type="button" id="mb-ranked-stage-rules" class="mb-ranked-hit" aria-label="규칙 안내"></button>'+
   '<div class="mb-ranked-stage-modes" role="group" aria-label="랭킹 모드 선택">'+
    [['timed60','ranked-time-button.png','시간제한'],['hardcore','ranked-hard-button.png','하드코어'],['infinite','ranked-infinite-button.png','무한']].map(([id,img,label])=>
     '<button type="button" class="mb-ranked-stage-mode '+(selected===id?'selected':'')+'" data-rank-pick="'+id+'" aria-pressed="'+(selected===id)+'" title="'+label+' 랭킹전"><img src="/ui-assets/'+img+'" alt="'+label+' 랭킹전" width="1100" height="380"></button>').join('')+'</div>'+
   '<div class="mb-ranked-stage-tabs" role="tablist" aria-label="랭킹 집계 기간">'+
    [['all','전체'],['day','일간'],['week','주간']].map(([id,label])=>'<button type="button" role="tab" class="mb-ranked-stage-tab '+(rankingPeriod===id?'selected':'')+'" data-rank-period="'+id+'" aria-selected="'+(rankingPeriod===id)+'" aria-label="'+label+' 랭킹"></button>').join('')+'</div>'+
   '<div class="mb-ranked-stage-rows" id="mb-ranked-stage-rows" aria-live="polite"></div>'+
   '<p class="mb-ranked-stage-note" id="mb-ranked-stage-note" role="status">'+esc(message||'')+'</p>'+
   '<button type="button" class="mb-ranked-hit" id="mb-ranked-begin" aria-label="선택한 랭킹전 도전하기"></button>'+
   '<div class="mb-ranked-stage-mobileinfo">모드 선택 · 랭킹 조회 · 도전 시작</div>'+
   '</section>';
  const btn=id=>dialog.querySelector('#'+id);
  dialog.querySelectorAll('[data-rank-pick]').forEach(button=>button.addEventListener('click',()=>{
   selected=safeMode(button.dataset.rankPick);
   dialog.querySelectorAll('[data-rank-pick]').forEach(b=>{let on=b.dataset.rankPick===selected;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on))});
   renderRankBoard();
  }));
  dialog.querySelectorAll('[data-rank-period]').forEach(button=>button.addEventListener('click',()=>{
   rankingPeriod=button.dataset.rankPeriod;
   dialog.querySelectorAll('[data-rank-period]').forEach(b=>{let on=b.dataset.rankPeriod===rankingPeriod;b.classList.toggle('selected',on);b.setAttribute('aria-selected',String(on))});
   renderRankBoard();
  }));
  btn('mb-ranked-stage-back').onclick=()=>dialog.close();
  const guide=(t,msg)=>{const note=btn('mb-ranked-stage-note');if(note)note.textContent=t+' · '+msg};
  btn('mb-ranked-stage-guide').onclick=()=>guide('랭킹','계정별 모드 최고 점수 기준으로 순위를 표시해.');
  btn('mb-ranked-stage-reward').onclick=()=>guide('보상','현재는 공식 보상 시스템이 없어.');
  btn('mb-ranked-stage-rules').onclick=()=>guide('규칙','무한·1분 제한·하드코어 중 골라서 서버 채점에 도전해. 일간·주간은 최고기록 갱신 날짜를 기준으로 표시돼.');
  btn('mb-ranked-begin').onclick=start;
  renderRankBoard();
 }
 function nicknameMode(){
  if(!dialog.open)dialog.showModal();
  showLobby();
  checkLogin().then(ok=>{
   if(dialog.open&&!busy&&!active&&!ok&&!run)showLobby('🔒 온라인 랭킹전은 먼저 닉네임·비밀번호로 로그인해야 해.');
  });
 }
 const findQ=()=>{
  if(typeof MAP!=='undefined'&&MAP.has(qid))return MAP.get(qid);
  if(typeof BANK!=='undefined')for(const arr of [BANK.spelling,BANK.idioms,BANK.applications]){
   const question=(arr||[]).find(q=>q.id===qid);
   if(question)return question;
  }
  return null;
 };
 const choices=(q)=>{
  if(q.type==='idiom'){
   const all=(BANK.idioms||[]).filter(x=>x.id!==q.id&&x.answer!==q.answer&&x.meaning!==q.meaning);
   const seed=[...q.id].reduce((a,c)=>a+c.charCodeAt(0),0);
   const items=[q.answer];
   for(let k=0;k<all.length&&items.length<4;k++){
    const candidate=all[(seed+17*k)%all.length]?.answer;
    if(candidate&&!items.includes(candidate))items.push(candidate);
   }
   return items.map((v,i)=>({v,key:(i*7+seed)%items.length})).sort((a,b)=>a.key-b.key).map(x=>x.v);
  }
  return Array.isArray(q.options)?q.options:[];
 };
 function timeLeft(){return deadline?Math.max(0,Math.ceil((deadline-now())/1000)):null}
 function stats(){
  return '<div class="mb-ranked-stat quiz-meta"><span>⚔ '+esc(MODES[mode]?.title||'랭킹전')+'</span>'+
   '<span>정답 '+correct+' / '+answered+'</span>'+
   (mode==='hardcore'?'<span>점수 '+score+'점</span>':'')+
   (deadline?'<span id="mb-ranked-time">⏱ '+timeLeft()+'초</span>':'')+'</div>';
 }
 function showQuestion(){
  if(!active||!run)return;
  const q=findQ();
  if(!q){showLobby('문제를 불러오지 못했어. 다시 시도해 줘.');return}
  const label=q.type==='idiom'?'사자성어 뜻':q.type==='application'?'응용문제':'프린트 맞춤법';
  const problem=q.type==='idiom'?(q.meaning||q.prompt):q.prompt;
  const options=choices(q);
  const written=q.format==='text'||(!options.length&&q.type!=='idiom');
  frame(MODES[mode].title,stats()+
   '<p class="mb-ranked-help">문제 '+(answered+1)+' · '+esc(label)+' · '+(written?'서술형':'객관식')+'</p>'+
   '<div class="mb-ranked-question prompt" role="heading" aria-level="3">'+esc(problem)+'</div>'+
   (written?'<form id="mb-ranked-write"><input id="mb-ranked-typed" class="mb-ranked-input" maxlength="120" required autocomplete="off" spellcheck="false" placeholder="정답을 직접 입력해 줘"><button class="mb-ranked-primary" type="submit">제출</button></form>':
    '<div class="mb-ranked-choices option-list">'+options.map(x=>'<button class="option" type="button" data-ranked-answer="'+esc(x)+'">'+esc(x)+'</button>').join('')+'</div>')+
   '<p class="mb-ranked-help" id="mb-ranked-message">서버에서 정답을 확인해. 랭킹전 점수는 계정별 최고 기록만 반영돼.</p>'+
   '<button id="mb-ranked-stop" type="button">도전 종료하고 기록 저장</button>');
  dialog.querySelectorAll('[data-ranked-answer]').forEach(btn=>btn.addEventListener('click',()=>submit(btn.dataset.rankedAnswer)));
  $('mb-ranked-write')?.addEventListener('submit',e=>{e.preventDefault();submit($('mb-ranked-typed')?.value||'')});
  $('mb-ranked-stop')?.addEventListener('click',finish);
 }
 async function start(){
  if(busy)return;
  busy=true;
  const button=$('mb-ranked-begin');if(button){button.disabled=true;button.textContent='⏳ 문제를 준비하고 있어…'}
  try{
   // Ranked POST validates the login cookie itself. Avoid a separate GET
   // race that previously blocked a valid account during brief network errors.
   const selection=selected;
   const out=await api({action:'start',rankedChallenge:true,mode:selection});
   if(!out?.run||!out?.qid)throw Error('서버에서 문제를 전달하지 못했어. 다시 도전해 줘.');
   mode=selection;run=out.run;qid=out.qid;correct=0;answered=0;score=0;deadline=out.deadline||null;
   dialog.dataset.mbRankedMode=mode;
   if(!findQ())throw Error('랭킹 문제 데이터가 준비되지 않았어. 화면을 새로고침한 뒤 다시 도전해 줘.');
   generation++;active=true;showQuestion();
  }catch(e){showLobby(e.message)}finally{busy=false}
 }
 async function submit(answer){
  if(!active||busy||!run)return;
  if(deadline&&timeLeft()===0){finish();return}
  busy=true;
  const id=qid;
  dialog.querySelectorAll('[data-ranked-answer],#mb-ranked-write button').forEach(b=>b.disabled=true);
  const msg=$('mb-ranked-message');if(msg)msg.textContent='답을 전송하고 있어…';
  try{
   const out=await api({action:'answer',run,qid:id,answer});
   if(out.ended){
    correct=out.correct||0;answered=out.answered||0;score=out.score||0;
    showEnd(out);return;
   }
   run=out.run;correct=out.correct;answered=out.answered;score=out.score||0;
   const q=findQ();
   lastResult={good:out.verifiedCorrect,answer:q?.answers?.join(' / ')||q?.answer||'',note:q?.note||'',points:out.points||0};
   showFeedback();
  }catch(e){const p=$('mb-ranked-message');if(p)p.textContent='⚠ '+e.message;
   dialog.querySelectorAll('[data-ranked-answer],#mb-ranked-write button').forEach(b=>b.disabled=false);
  }finally{busy=false}
 }
 function showFeedback(){
  const f=lastResult;
  frame(MODES[mode].title,stats()+'<section class="mb-ranked-feedback">'+
   '<h3>'+(f.good?'✅ 정답!':'❌ 오답!')+(mode==='hardcore'&&f.good?' +'+f.points+'점':'')+'</h3>'+
   '<p>정답: <strong>'+esc(f.answer)+'</strong></p>'+
   (f.note?'<p>'+esc(f.note)+'</p>':'')+
   '</section><button id="mb-ranked-next" class="mb-ranked-primary" type="button">다음 혼합문제 ▶</button>'+
   '<button id="mb-ranked-stop" type="button">도전 종료하고 기록 저장</button>');
  $('mb-ranked-next')?.addEventListener('click',next);
  $('mb-ranked-stop')?.addEventListener('click',finish);
 }
 async function next(){
  if(!active||busy)return;
  busy=true;
  try{
   const out=await api({action:'next',run});
   if(out.ended){showEnd(out);return}
   run=out.run;qid=out.qid;showQuestion();
  }catch(e){const btn=$('mb-ranked-next');if(btn)btn.textContent='재시도 · '+e.message}
  finally{busy=false}
 }
 async function finish(){
  if(busy||!run||!active)return;
  busy=true;
  try{
   const out=await api({action:'finish',run});
   showEnd(out);
  }catch(e){const p=$('mb-ranked-message');if(p)p.textContent=e.message}
  finally{busy=false}
 }
 function showEnd(out){
  active=false;run=null;deadline=null;
  if(Number.isFinite(out.correct))correct=out.correct;
  if(Number.isFinite(out.answered))answered=out.answered;
  if(Number.isFinite(out.score))score=out.score;
  frame('🏆 랭킹전 종료', '<div class="mb-ranked-feedback"><h3>'+esc(MODES[mode]?.title||'랭킹전')+'</h3>'+
   '<p>정답: <strong>'+correct+'문제</strong> / 도전: '+answered+'문제</p>'+
   (mode==='hardcore'?'<p>하드코어 점수: <strong>'+score+'점</strong></p>':'')+
   '<p>'+(out.recorded?'온라인 순위 기록 저장 완료 · 최고 '+(out.best??correct)+(mode==='hardcore'?'점':'문제'):'온라인 기록은 정답이 있을 때 등록돼.')+'</p></div>'+
   '<button id="mb-ranked-again" class="mb-ranked-primary" type="button">다른 랭킹전 도전하기</button>'+
   '<button id="mb-ranked-view-leaderboard" type="button">🏆 이 모드 랭킹 보기</button>');
  $('mb-ranked-again')?.addEventListener('click',()=>showLobby());
  $('mb-ranked-view-leaderboard')?.addEventListener('click',()=>{selected=safeMode(mode);showLobby();});
 }
 function stopWithoutPause(){
  if(active&&run){
   const out={action:'finish',run};
   // Closing the dialog must not silently lose the confirmed rank record.
   try{navigator.sendBeacon?.('/api/ranked',new Blob([JSON.stringify(out)],{type:'application/json'}))}catch(_){}
   active=false;run=null;
  }
 }
 dialog.addEventListener('click',e=>{
  if(e.target.closest?.('#mb-ranked-close')){
   stopWithoutPause();dialog.close();
  }
 });
 dialog.addEventListener('cancel',()=>stopWithoutPause());
 window.addEventListener('pagehide',stopWithoutPause,{capture:true});
 tickId=window.setInterval(()=>{
  if(!active||!dialog.open||!deadline)return;
  const timer=$('mb-ranked-time');if(timer)timer.textContent='⏱ '+timeLeft()+'초';
  if(timeLeft()===0&&!busy)finish();
 },350);
 // Ranked play lives in its own navigation item, never nested in infinite mode.
 function rankedMenu(){
  document.querySelectorAll('#mb-ranked-entry').forEach(el=>el.remove());
  const make=(container,aria)=>{
   if(!container||container.querySelector('.mb-ranked-nav'))return;
   const btn=document.createElement('button');
   btn.type='button';btn.className='mb-ranked-nav';
   btn.dataset.route='ranked';
   btn.setAttribute('aria-label','랭킹전');
   btn.title='온라인 랭킹전';
   btn.innerHTML='<img class="mb-ranked-art" src="/ui-assets/mb_ranking_ui.webp" width="2048" height="682" alt="" decoding="async" loading="eager"><span class="mb-ranked-fallback">🏆 랭킹전</span>';
   btn.querySelector('img')?.addEventListener('error',()=>btn.classList.add('art-missing'),{once:true});
   const timed=container.querySelector('[data-route="timed"]');
   if(timed)timed.after(btn);else container.append(btn);
   btn.addEventListener('click',e=>{
    e.preventDefault();e.stopImmediatePropagation();
    if(dialog.open)return;
    window.navigate?.('home');
    window.__mbMarkRoute?.('ranked');
    const drawer=$('mobileDrawer');
    if(drawer&&!drawer.hidden)drawer.hidden=true;
    nicknameMode();
   },true);
  };
  document.querySelectorAll('.sidebar-nav').forEach(nav=>make(nav,'desktop'));
  make($('mobileDrawer'),'mobile');
 }
 // The menu shell is stable, but a mutation may replace its navigation nodes.
 // Observe only the relevant navigation containers, never the whole document.
 rankedMenu();
 for(const nav of [...document.querySelectorAll('.sidebar-nav'),$('mobileDrawer')]){
  if(nav)new MutationObserver(()=>rankedMenu()).observe(nav,{childList:true});
 }
 dialog.addEventListener('close',()=>window.__mbMarkRoute?.('home'));
 window.__mbRankedOpen=nicknameMode;
})();
