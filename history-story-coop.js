/* 역사 스토리 2–4인 협동: Render/Neon 방, shared evidence and player ghosts. */
(function(){
'use strict';
const $=id=>document.getElementById(id),debug=window.MB_HISTORY_STORY_DEBUG;
if(!debug||!$('coopCreate'))return;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let account=null,room=null,code='',busy=false,pollBusy=false,roomListBusy=false,lastPos='',lastMove=0;
const inform=t=>{$('coopInfo').textContent=t||''};
function active(){return !!room&&room.phase==='playing'}
function state(){return room}
function isHost(){return !!room&&room.hostId===room.me}
async function request(url,options){
 const res=await fetch(url,{credentials:'same-origin',cache:'no-store',...options});
 const payload=await res.json().catch(()=>{throw Error('서버의 응답을 읽지 못했어.')});
 if(!res.ok)throw Error(payload.error||'서버 연결에 실패했어.');
 return payload;
}
async function checkAccount(){
 try{
  const r=await request('/api/account');account=r;
  $('coopAccount').textContent=r.loggedIn?'✅ 로그인: '+r.name:'맛춘범 계정으로 로그인해야 다른 플레이어와 함께 탐험할 수 있어. 단독 스토리는 바로 플레이 가능해.';
  $('coopCreate').disabled=!r.loggedIn;$('coopJoin').disabled=!r.loggedIn;
  const url=new URLSearchParams(window.location.search),joinCode=String(url.get('join')||'').toUpperCase();
  if(r.loggedIn&&/^[A-HJ-NP-Z2-9]{8}$/.test(joinCode)&&!code){
   $('coopCode').value=joinCode;await record('join',{code:joinCode}).catch(e=>inform(e.message));
  }
 }catch(e){$('coopAccount').textContent='로그인 상태를 확인하지 못했어: '+e.message;$('coopCreate').disabled=true;$('coopJoin').disabled=true}
}
function apply(r){
 if(!r)return;
 const before=room?.chapterId;
 room=r;code=r.code;const started=r.phase==='playing';
 if(started){
  if(debug.chapter!==r.chapterId)debug.forceJump(r.chapterId);
  else debug.syncShared();
  if(before&&before!==r.chapterId)inform('⏳ 모든 기록자가 함께 '+r.chapterId+' 시대로 이동했어.');
 }
 drawRoom();
}
function drawRoom(){
 const joined=!!room;
 $('coopLobby').classList.toggle('hidden',joined);
 $('coopSession').classList.toggle('hidden',!joined);
 if(!joined)return;
 $('coopRoomCode').textContent=room.name+' · '+room.code;
 const phase=room.phase;
 $('coopPhase').textContent=phase==='lobby'?'입장 중 · 모두 준비하면 방장이 시작해.':phase==='playing'?'공동 수집 기록 '+room.collected.length+'/4 · 대화 '+room.spoken.length+'/2 · '+(room.quizSolved?'최종 퀴즈 해결!':room.timelineSolved?'연표 복원 완료':'탐사 중'): '🎉 협동 이야기 완료!';
 $('coopPlayers').innerHTML=room.players.map(p=>'<div class="coop-person">'+(p.id===room.hostId?'👑 ':'')+escape(p.name)+(p.id===room.me?' (나)':'')+' · '+(phase==='lobby'?(p.ready?'준비 완료':'준비 대기'):'구역 '+(p.zone+1))+'</div>').join('');
 $('coopReady').classList.toggle('hidden',phase!=='lobby');
 $('coopStart').classList.toggle('hidden',phase!=='lobby'||!isHost());$('coopStart').disabled=!room.canStart;
 $('coopAdvance').classList.toggle('hidden',phase!=='playing'||!isHost());$('coopAdvance').disabled=!room.quizSolved;
 $('coopReady').textContent=room.players.find(p=>p.id===room.me)?.ready?'준비 취소':'준비하기';
}
async function record(action,details={}){
 if(busy&&action==='move')return null;
 if(busy&&['create','join','leave','start','ready','advance'].includes(action))throw Error('이전 요청을 처리하고 있어.');
 busy=true;
 const input={action,...details};
 if(action!=='create')input.code=details.code||code;
 try{
  const r=await request('/api/history-story',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});
  if(action==='leave'){room=null;code='';lastPos='';drawRoom();inform('협동방에서 나왔어. 혼자서도 이야기를 이어갈 수 있어.');listRooms(false);return null}
  if(r.state)apply(r.state);
  return r.state;
 }catch(e){inform(e.message);throw e}finally{busy=false}
}
async function listRooms(loud=true){
 if(roomListBusy||room)return;roomListBusy=true;
 try{
  const result=await request('/api/history-story');const rows=result.rooms||[];
  $('coopList').innerHTML=rows.length?rows.map(r=>'<div class="coop-room"><div><b>'+escape(r.name)+'</b><small>'+escape(r.code)+' · '+r.players+'/'+r.capacity+'명 · '+escape(r.host)+'</small></div><button type="button" data-coop-join="'+escape(r.code)+'" '+(r.players>=r.capacity||!account?.loggedIn?'disabled':'')+'>입장</button></div>').join(''):'<p class="coop-account">현재 열린 협동방이 없어. 새 방을 만들어 봐.</p>';
  if(loud)inform('열린 협동방 목록을 갱신했어.');
 }catch(e){if(loud)inform(e.message)}finally{roomListBusy=false}
}
async function poll(){
 if(!code||pollBusy||busy||document.hidden)return;
 pollBusy=true;
 try{const result=await request('/api/history-story?code='+encodeURIComponent(code));apply(result.state)}
 catch(e){
  if(/없거나|참가|찾지|만료/.test(e.message)){room=null;code='';drawRoom();inform('협동방 연결이 종료되었어.');}
  else inform(e.message);
 }finally{pollBusy=false}
}
function positionNow(){
 if(!active())return;
 const p=debug.position,body={x:Math.round(p.x),y:Math.round(p.y),zone:p.zone},serial=body.x+':'+body.y+':'+body.zone;
 if(serial===lastPos||busy)return;lastPos=serial;lastMove=Date.now();
 record('move',body).catch(()=>{lastPos='' });
}
setInterval(()=>{
 if(!document.hidden){
  if(code)poll();
  else if(account&&!room)listRooms(false);
 }
},2200);
setInterval(()=>{
 if(active()&&!document.hidden&&Date.now()-lastMove>2700)positionNow();
},1700);
$('coopCreate').addEventListener('click',()=>record('create',{name:$('coopName').value}).catch(()=>{}));
$('coopJoin').addEventListener('click',()=>{
 const value=$('coopCode').value.trim().toUpperCase();if(!/^[A-HJ-NP-Z2-9]{8}$/.test(value)){inform('정확한 8자리 방 코드를 입력해 줘.');return}
 record('join',{code:value}).catch(()=>{});
});
$('coopBrowse').addEventListener('click',()=>listRooms());
$('coopCode').addEventListener('input',ev=>ev.target.value=ev.target.value.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g,'').slice(0,8));
$('coopList').addEventListener('click',ev=>{
 const btn=ev.target.closest('[data-coop-join]');if(btn)record('join',{code:btn.dataset.coopJoin}).catch(()=>{});
});
$('coopReady').addEventListener('click',()=>record('ready',{ready:!room.players.find(p=>p.id===room.me)?.ready}).catch(()=>{}));
$('coopStart').addEventListener('click',()=>record('start').catch(()=>{}));
$('coopAdvance').addEventListener('click',()=>record('advance').catch(()=>{}));
$('coopLeave').addEventListener('click',()=>record('leave').catch(()=>{}));
$('coopCopy').addEventListener('click',()=>{
 if(!code)return;
 const copy=window.location.origin+'/history-story.html?join='+code;
 if(navigator.clipboard?.writeText)navigator.clipboard.writeText(copy).then(()=>inform('입장 링크를 복사했어.')).catch(()=>inform('방 코드: '+code));
 else inform('초대 코드: '+code);
});
window.MB_STORY_COOP={active,state,isHost,record,positionNow};
checkAccount().then(()=>listRooms(false));
})();