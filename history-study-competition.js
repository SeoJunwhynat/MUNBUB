/* 한국사 온라인 랭킹전 + 멀티플레이: 국어 서버와 분리, 기존 박물관 4인 방 재사용. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const modes={infinite:'♾ 무한모드 랭킹',hardcore:'⚔ 하드코어 랭킹',timed60:'⏳ 60초 시간제한 랭킹'};
const modal=document.createElement('dialog');
modal.id='historyCompetitionDialog';
modal.className='history-competition-dialog';
modal.setAttribute('aria-label','한국사 온라인 랭킹과 멀티플레이');
document.body.append(modal);
let section='rank',selectedMode='infinite',state=null,room=null,roomCode='',roomCapacity=4,busy=false,tickId=null,pollId=null,account=null,serial=0,board=[],expired=false;
async function request(path,data){
 const params=data?{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}:{credentials:'same-origin'};
 const response=await fetch(path,params);let body={};
 try{body=await response.json()}catch{}
 if(!response.ok)throw new Error(body.error||'서버 통신 오류');
 return body;
}
const rankPath='/api/history-ranked',multiPath='/api/history-museum';
function clearTimers(){if(tickId)clearInterval(tickId);if(pollId)clearInterval(pollId);tickId=null;pollId=null;}
function wrap(eyebrow,title,body){modal.innerHTML='<div class="history-competition-shell"><div class="history-competition-head"><div><small>'+eyebrow+'</small><h2>'+title+'</h2></div><button class="history-competition-close" type="button" data-competition="close" aria-label="닫기">×</button></div><div class="history-competition-body">'+body+'</div></div>';}
function note(s){const box=$('historyCompetitionStatus');if(box)box.textContent=s;}
function waitVisual(){return '<div class="history-competition-status" id="historyCompetitionStatus" role="status" aria-live="polite"></div>';}
async function login(){
 try{account=await request('/api/account')}catch{account={loggedIn:false}}
 return account;
}
function open(which='rank'){
 section=which==='multi'||which==='duel'?'multi':'rank';
 if(which==='duel')roomCapacity=2;else if(which==='multi')roomCapacity=4;
 serial++;clearTimers();
 if(!modal.open){if(modal.showModal)modal.showModal();else modal.setAttribute('open','');}
 if(section==='rank'){state=null;showRankMenu();login().then(()=>{if(section==='rank'&&!state&&modal.open)showRankMenu()})}
 else {showMulti();login().then(()=>{if(section==='multi'&&modal.open)showMulti()})}
}
function close(){
 clearTimers();
 serial++;
 if(modal.close)modal.close();else modal.removeAttribute('open');
}
function showRankMenu(){
 clearTimers();state=null;expired=false;
 const logged=account?.loggedIn;
 wrap('RANKED · HISTORY','역사 온라인 랭킹전',
  '<div class="history-competition-tabs"><button type="button" data-competition="tab-rank" class="active">🏆 랭킹전</button><button type="button" data-competition="tab-multi">🤝 멀티플레이</button></div>'+
  '<p class="history-competition-desc">무한 · 하드코어 · 시간제한 기록을 경쟁합니다. 점수와 정답은 서버에서 판정해요.</p>'+
  '<div class="history-competition-modes">'+Object.keys(modes).map(mode=>'<button type="button" data-rank-mode="'+mode+'" class="'+(selectedMode===mode?'active':'')+'">'+modes[mode]+'</button>').join('')+'</div>'+
  '<div class="history-competition-actions"><button type="button" class="primary" data-competition="rank-start" '+(logged?'':'disabled')+'>▶ 랭킹 도전하기</button><button type="button" data-competition="rank-refresh">🏅 순위 새로고침</button></div>'+
  (!logged?'<p class="history-competition-hint">🔒 온라인 랭킹전은 맛춘범 계정으로 로그인해야 해요. <a href="/index.html">국어 게임에서 로그인하기</a></p>':'<p class="history-competition-hint">접속 계정: '+esc(account.name||'학습자')+'</p>')+
  '<h3>📊 '+modes[selectedMode]+' 순위표</h3><div id="historyRankRows" class="history-rank-rows"><p>순위를 확인 중입니다.</p></div>'+waitVisual());
 loadBoard();
}
async function loadBoard(){
 const code=++serial,spot=$('historyRankRows');if(!spot)return;
 spot.innerHTML='<p>기록을 불러오는 중…</p>';
 try{
  const r=await request(rankPath+'?mode='+encodeURIComponent(selectedMode));
  if(code!==serial||!$('historyRankRows')||section!=='rank')return;
  board=r.board||[];
  spot.innerHTML=board.length?board.map(row=>'<div class="history-rank-row"><strong>'+row.rank+'위</strong><span>'+esc(row.name)+'</span><b>'+row.score+'점</b></div>').join(''):'<p>아직 등록된 기록이 없습니다. 첫 기록에 도전해 보세요.</p>';
 }catch(e){if(code===serial&&spot)spot.textContent=e.message}
}
function rankCountdown(){
 const node=$('historyRankTimer');if(!node)return;
 if(state?.deadline){
  const sec=Math.max(0,Math.ceil((state.deadline-Date.now())/1000));
  node.textContent='남은 시간 '+sec+'초';
  if(sec===0&&!expired&&state.phase!=='finished'){
   expired=true;rankAction('status');
  }
 }else node.textContent='정답 '+(state?.correct||0)+'개 · 점수 '+(state?.score||0);
}
function showRankGame(){
 clearTimers();
 if(!state)return showRankMenu();
 const q=state.question,review=state.review;
 const header='<div class="history-rank-status"><b>'+modes[state.mode]+'</b><span id="historyRankTimer"></span><span>정답 '+state.correct+' / 도전 '+state.answered+'</span></div>';
 if(state.phase==='finished'){
  wrap('RANKED · RESULT','도전 종료',
   header+'<div class="history-competition-result"><strong>'+state.score+'점</strong><p>맞힌 문제 '+state.correct+'개 · 풀이 '+state.answered+'문항</p><p>'+
   ({wrong:'하드코어에서는 첫 오답으로 도전이 종료됩니다.',time:'제한 시간 60초가 끝났습니다.',exit:'도전을 종료했습니다.'}[state.finishedReason]||'서버에 기록을 저장했습니다.')+
   '</p></div><div class="history-competition-actions"><button type="button" class="primary" data-competition="rank-menu">🏆 랭킹 목록</button><button type="button" data-competition="rank-retry">다시 도전하기</button></div>'+waitVisual());
  rankCountdown();return;
 }
 const question=q?'<div class="history-rank-question"><small>문제 '+q.number+' · '+esc(q.type)+' · 단원 '+esc(q.unit)+'</small><div>'+esc(q.prompt)+'</div></div>'+
 '<div class="history-rank-choices">'+q.choices.map((choice,i)=>'<button type="button" data-rank-choice="'+i+'">'+(i+1)+'. '+esc(choice)+'</button>').join('')+'</div>':'';
 const reviewHtml=review?'<div class="history-rank-feedback"><strong>'+(review.wasCorrect?'✅ 정답 +'+review.points+'점':'❌ 오답')+'</strong><p>정답: '+(review.correctIndex+1)+'번</p><p>'+esc(review.explanation)+'</p></div><button type="button" class="history-rank-next" data-competition="rank-next">다음 문제 →</button>':'';
 wrap('RANKED · GAME','한국사 랭킹 도전',
  header+question+reviewHtml+'<div class="history-competition-actions"><button type="button" data-competition="rank-finish">도전 종료</button></div>'+waitVisual());
 if(review)modal.querySelectorAll('[data-rank-choice]').forEach(btn=>{btn.disabled=true;if(Number(btn.dataset.rankChoice)===review.correctIndex)btn.classList.add('is-correct')});
 rankCountdown();
 tickId=setInterval(rankCountdown,400);
}
async function rankAction(action,extra={}){
 if(busy)return;busy=true;
 try{
  const requestBody={action,...(state?{runId:state.runId}:{mode:selectedMode}),...extra};
  const r=await request(rankPath,requestBody);
  state=r.state;expired=false;
  showRankGame();
 }catch(e){note(e.message);if(action==='status')expired=true}
 finally{busy=false}
}
function multiPolling(){
 if(pollId)clearInterval(pollId);
 pollId=setInterval(()=>{if(section==='multi'&&modal.open&&!busy){if(roomCode)refreshRoom(false);else loadRooms(false)}},3000);
}
function showMulti(){
 clearTimers();section='multi';
 wrap('MULTIPLAYER · HISTORY',roomCapacity===2?'역사 1:1 대전':'역사 퀴즈 멀티플레이',
 '<div class="history-competition-tabs"><button data-competition="tab-rank">🏆 랭킹전</button><button class="active" data-competition="tab-multi">🤝 멀티플레이</button></div>'+
 '<p class="history-competition-desc">기존 역사 박물관의 서버 퀴즈방을 사용합니다. 최대 '+roomCapacity+'명이 같은 문제를 풀며 점수를 겨뤄요.</p>'+
 (account?.loggedIn?'<p class="history-competition-hint">접속: '+esc(account.name||'학습자')+'</p>':'<p class="history-competition-hint">🔒 참여하려면 먼저 <a href="/index.html">맛춘범에 로그인</a>해 주세요.</p>')+
 '<div class="history-multi-controls"><label>방 이름<input id="historyRoomName" maxlength="26" value="한국사 퀴즈방"></label><button type="button" data-competition="multi-create" '+(account?.loggedIn?'':'disabled')+'>+ 새 방 만들기</button></div>'+
 '<div class="history-multi-controls"><label>8자리 방 코드<input id="historyRoomCode" maxlength="8" placeholder="방 코드 입력"></label><button type="button" data-competition="multi-join" '+(account?.loggedIn?'':'disabled')+'>코드로 입장</button></div>'+
 '<div class="history-competition-actions"><button type="button" data-competition="multi-refresh">열린 방 새로고침</button><a href="/history-museum.html">역사 박물관으로 이동</a></div>'+
 '<div id="historyMultiRooms" class="history-multi-room-list"><p>방을 찾는 중…</p></div>'+waitVisual());
 if(roomCode)refreshRoom();else loadRooms();
 multiPolling();
}
async function loadRooms(message=true){
 if(roomCode)return;
 try{
  const r=await request(multiPath);
  const el=$('historyMultiRooms');if(!el||roomCode||section!=='multi')return;
  el.innerHTML=(r.rooms||[]).length?r.rooms.map(x=>'<div class="history-multi-room"><span><strong>'+esc(x.name)+'</strong><small>'+esc(x.code)+' · '+x.players+'/'+x.capacity+'명</small></span><button type="button" data-room-join="'+esc(x.code)+'" '+(!account?.loggedIn||x.players>=x.capacity?'disabled':'')+'>입장</button></div>').join(''):'<p>현재 공개방이 없습니다. 새 방을 생성할 수 있어요.</p>';
  if(message)note('공개방을 불러왔어.');
 }catch(e){note(e.message)}
}
async function multiAction(action,other={}){
 if(busy)return;busy=true;
 try{
  const requestBody={action,...other};
  if(action!=='create')requestBody.code=roomCode;
  const r=await request(multiPath,requestBody);
  if(action==='leave'){roomCode='';room=null;showMulti()}
  else{room=r.state;roomCode=room.code;showRoom()}
 }catch(e){note(e.message)}
 finally{busy=false}
}
async function refreshRoom(message=true){
 if(!roomCode||busy)return;
 try{
  const r=await request(multiPath+'?code='+encodeURIComponent(roomCode));
  room=r.state;showRoom();
  if(message)note('게임방을 갱신했어.');
 }catch(e){if(message)note(e.message)}
}
function showRoom(){
 if(!room)return showMulti();
 const r=room;
 const isHost=r.hostId===r.me,me=r.players.find(p=>p.id===r.me),round=r.round;
 const playerList='<div class="history-multi-players">'+r.players.map(p=>'<div><span>'+(p.id===r.hostId?'👑 ':'')+esc(p.name)+(p.id===r.me?' (나)':'')+'</span><b>'+p.score+'점</b><small>'+(r.phase==='lobby'?(p.ready?'준비 완료':'준비 중'):(p.answered?'제출 완료':'풀이 중'))+'</small></div>').join('')+'</div>';
 let stage='';
 if(r.phase==='lobby'){
  stage='<p>최대 '+r.capacity+'명 · 방장 '+esc(r.players.find(p=>p.id===r.hostId)?.name||'')+'</p><div class="history-competition-actions">'+
  '<button data-multi-action="ready">'+(me?.ready?'준비 취소':'준비하기')+'</button>'+
  (isHost?'<button class="primary" data-multi-action="start" '+(!r.canStart?'disabled':'')+'>경기 시작</button>':'')+'</div>';
 }else if(r.phase==='results'){
  stage='<div class="history-competition-result"><h3>🏆 경기 결과</h3>'+r.players.slice().sort((a,b)=>b.score-a.score).map((p,i)=>'<p>'+(i+1)+'위 '+esc(p.name)+' — '+p.score+'점</p>').join('')+'</div>';
 }else if(round){
  const answerable=r.phase==='live'&&round.myChoice===null;
  stage='<div class="history-rank-question"><small>문제 '+round.number+'/'+round.total+' · '+esc(round.unit)+'</small><div>'+esc(round.prompt)+'</div></div>'+
   '<div class="history-rank-choices">'+round.choices.map((c,i)=>'<button type="button" data-multi-choice="'+i+'" '+(!answerable?'disabled':'')+' class="'+(r.phase==='review'&&i===round.correctIndex?'is-correct':'')+'">'+(i+1)+'. '+esc(c)+'</button>').join('')+'</div>'+
   (r.phase==='review'?'<div class="history-rank-feedback">✅ 정답 '+(round.correctIndex+1)+'번 · '+esc(round.explanation)+'</div>':'<p class="history-competition-hint">답을 고른 뒤 다른 참가자의 제출을 기다려 주세요.</p>')+
   (r.phase==='review'&&isHost?'<div class="history-competition-actions"><button class="primary" data-multi-action="next">다음 문제 →</button></div>':'');
 }
 wrap('MULTIPLAYER · ROOM',esc(r.name),
 '<div class="history-competition-tabs"><button data-competition="multi-exit">← 로비로</button><button data-competition="multi-sync">↻ 갱신</button></div>'+
 '<p class="history-competition-hint">방 코드 <strong>'+esc(r.code)+'</strong> · 상태 '+esc(r.phase)+'</p>'+playerList+stage+
 '<div class="history-competition-actions"><button type="button" data-competition="multi-leave">방 나가기</button></div>'+waitVisual());
}
modal.addEventListener('click',e=>{
 const target=e.target.closest('button,[data-competition],a[data-competition]');
 if(!target)return;
 const action=target.dataset.competition;
 if(action==='close'){close();return}
 if(action==='tab-rank'){section='rank';showRankMenu();return}
 if(action==='tab-multi'){section='multi';roomCapacity=4;showMulti();return}
 const mode=target.dataset.rankMode;
 if(mode&&modes[mode]){selectedMode=mode;showRankMenu();return}
 if(action==='rank-refresh'){loadBoard();return}
 if(action==='rank-menu'){showRankMenu();return}
 if(action==='rank-retry'||action==='rank-start'){state=null;rankAction('start',{mode:selectedMode});return}
 if(action==='rank-next'){rankAction('next');return}
 if(action==='rank-finish'){rankAction('finish');return}
 if(target.hasAttribute('data-rank-choice')){rankAction('answer',{choice:Number(target.dataset.rankChoice)});return}
 if(action==='multi-refresh'){loadRooms();return}
 if(action==='multi-create'){multiAction('create',{name:$('historyRoomName')?.value||'한국사 퀴즈방',capacity:roomCapacity});return}
 if(action==='multi-join'){roomCode=String($('historyRoomCode')?.value||'').trim().toUpperCase();multiAction('join');return}
 if(target.dataset.roomJoin){roomCode=target.dataset.roomJoin;multiAction('join');return}
 if(action==='multi-sync'){refreshRoom();return}
 if(action==='multi-exit'){multiAction('leave');return}
 if(action==='multi-leave'){multiAction('leave');return}
 if(target.dataset.multiAction){
  const kind=target.dataset.multiAction;
  const me=room?.players.find(p=>p.id===room.me);
  multiAction(kind,kind==='ready'?{ready:!me?.ready}:{});
  return;
 }
 if(target.hasAttribute('data-multi-choice')){multiAction('answer',{choice:Number(target.dataset.multiChoice)});}
});
modal.addEventListener('close',()=>{clearTimers();serial++});
window.MB_HISTORY_COMPETITION={open,close};
})();