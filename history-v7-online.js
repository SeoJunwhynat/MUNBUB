/* 《이름 없는 사람들의 역사》 v7 · live 2–4 player companion.
   Uses the existing authenticated Render + Neon service; unlike offline P2 local mode,
   every player has their own camera, position and browser.
*/
(()=>{'use strict';
const $=id=>document.getElementById(id),api='/api/history-side';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;',">":'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const FLAGS=['manuscript','paper','document','printed','delivered','cut','memorial'];
let account=null,room=null,code='',busy=false,moveBusy=false,pollBusy=false,requestSerial=0;
let hadPlaying=false,soloBackup=null,sendPos='',progressQueue=[],progressBusy=false,lastRoomPhase='',oldCut=false,locallyStartedCut=false;
const smooth=new Map(),pending=new Set();
function status(t){const el=$('v7Status');if(el)el.textContent=t||''}
function short(t){const el=$('v7ShortStatus');if(el)el.textContent=t||'싱글플레이'}
function active(){return !!room&&room.phase==='playing'&&room.players.some(x=>x.id===room.me)}
function connected(){return !!room&&room.players.some(x=>x.id===room.me)}
function snapshot(){return window.MB_V7?.snapshot?.()||null}
async function req(path,body){
 const resp=await fetch(path,{credentials:'same-origin',cache:'no-store',
  ...(body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});
 const json=await resp.json().catch(()=>({}));
 if(!resp.ok)throw new Error(json.error||'서버에 연결할 수 없습니다.');
 return json;
}
function member(){return room?.players.find(p=>p.id===room.me)}
function restoreSolo(){
 if(!soloBackup)return;
 window.MB_V7?.setProgress?.(soloBackup);
 soloBackup=null;window.MB_V7?.goto?.('museum');
}
function accept(next){
 if(!next)return;
 const prev=room,started=next.phase==='playing'&&(!prev||prev.phase!=='playing'),fresh=prev&&prev.progress&&!prev.progress.cut&&next.progress?.cut;
 room=next;code=next.code;
 if(started){
  if(!soloBackup)soloBackup=snapshot()?.progress||null;
  window.MB_V7?.resetForRoom?.();
  const me=next.players.find(x=>x.id===next.me);
  window.MB_V7?.goto?.(me?.scene||'street');
 }
 if(next.phase==='playing'&&next.progress){
  window.MB_V7?.mergeProgress?.(next.progress);
  if(fresh){if(!locallyStartedCut)window.MB_V7?.cutscene?.();locallyStartedCut=false;status('모든 플레이어에게 1947년 역사 시네마틱이 전달되었습니다.')}
 }
 drawPanel();
}
function drawPanel(){
 const logged=account?.loggedIn===true;
 $('v7Account').textContent=logged?'✅ 로그인: '+(account.name||'학습자'):'맛춘범 계정 로그인 후 멀티 방을 만들 수 있습니다. 싱글은 로그인 없이 가능해요.';
 $('v7Create').disabled=!logged||connected();$('v7Join').disabled=!logged||connected();
 $('v7Lobby').classList.toggle('v7-hidden',connected());
 $('v7Session').classList.toggle('v7-hidden',!connected());
 if(!connected()){short('싱글플레이');return}
 const me=member(),host=room.hostId===room.me,waiting=room.phase==='lobby';
 $('v7Code').textContent=room.code;
 $('v7Phase').textContent=waiting?'대기실':room.phase==='playing'?'협동 탐험 중':room.phase;
 $('v7Players').innerHTML=room.players.map(p=>
  '<div class="v7-roomline"><span>'+(p.id===room.hostId?'👑 ':'')+esc(p.name)+(p.id===room.me?' (나)':'')+
  ' · '+(waiting?(p.ready?'✅ 준비':'⏳ 대기'):esc(p.scene)+' · '+Math.round(p.x)+'px')+'</span></div>').join('');
 $('v7Ready').style.display=waiting?'':'none';
 $('v7Ready').textContent=me?.ready?'준비 취소':'준비하기';
 $('v7Start').style.display=waiting&&host?'':'none';
 $('v7Start').disabled=!room.canStart;
 short(room.players.length+'/'+room.capacity+'명 · '+(waiting?'대기실':'온라인 협동'));
 const chat=room.chat||[],log=$('v7ChatLog');
 const atBottom=log.scrollHeight-log.scrollTop-log.clientHeight<30;
 log.innerHTML=chat.length?chat.map(m=>'<div class="v7-chat-entry"><b>'+esc(m.name)+'</b> '+esc(m.message)+'</div>').join(''):'파티원과 이야기할 수 있습니다.';
 if(atBottom)log.scrollTop=log.scrollHeight;
}
async function refresh(){
 if(!code||pollBusy||!connected())return;
 pollBusy=true;
 try{const r=await req(api+'?code='+encodeURIComponent(code));accept(r.state)}
 catch(e){status(e.message)}
 finally{pollBusy=false}
}
async function browse(){
 if(connected())return;
 try{
  const r=await req(api);
  $('v7RoomList').innerHTML=(r.rooms||[]).length?r.rooms.map(x=>
   '<div class="v7-roomline"><span><b>'+esc(x.name)+'</b><br>'+esc(x.code)+' · '+x.players+'/'+x.capacity+'명</span>'+
   '<button type="button" data-v7-join="'+esc(x.code)+'" '+(x.players>=x.capacity?'disabled':'')+'>참가</button></div>').join(''):'현재 열린 공개방이 없습니다.';
 }catch(e){status(e.message)}
}
async function send(action,params={}){
 if(busy)return;
 busy=true;
 try{
  const r=await req(api,{action,...(action==='create'?{}:{code}),...params});
  if(action==='leave'){room=null;code='';hadPlaying=false;sendPos='';progressQueue=[];pending.clear();smooth.clear();restoreSolo();drawPanel();status('싱글플레이로 돌아왔습니다.');return}
  accept(r.state);
  if(action==='create'||action==='join'){
   status('방에 입장했습니다. 준비가 완료되면 방장이 협동 탐험을 시작할 수 있습니다.');
   refresh();
  }
 }catch(e){status(e.message)}
 finally{busy=false}
}
async function move(){
 if(!active()||moveBusy||document.hidden)return;
 const s=snapshot();if(!s)return;
 const pos=s.scene+':'+Math.round(s.x/4)+':'+Math.round(s.y/4)+':'+s.facing;
 if(pos===sendPos)return;
 moveBusy=true;
 try{
  const body={action:'move',code,scene:s.scene,x:s.x,y:s.y,facing:s.facing};
  await req(api,body);sendPos=pos;
 }catch(e){if(!String(e.message).includes('겹쳤'))status(e.message)}
 finally{moveBusy=false}
}
function onScene(scene){sendPos='';if(active())move()}
function onProgress(next){
 if(!active()||!next)return;
 if(next.cut&&!room?.progress?.cut)locallyStartedCut=true;
 for(const flag of FLAGS){
  if(next[flag]&&!room?.progress?.[flag]&&!pending.has(flag)){
   const s=snapshot();
   if(s){progressQueue.push({flag,scene:s.scene,x:s.x});pending.add(flag)}
  }
 }
 flushProgress();
}
async function flushProgress(){
 if(!active()||progressBusy||!progressQueue.length)return;
 progressBusy=true;
 try{
  while(active()&&progressQueue.length){
   const action=progressQueue[0];
   try{
    const r=await req(api,{action:'progress',code,...action});
    accept(r.state);
   }catch(e){
    status('공동 기록 동기화: '+e.message);
   }finally{pending.delete(action.flag);progressQueue.shift()}
  }
 }finally{progressBusy=false}
}
function drawPlayers(ctx,cam,scene){
 if(!active())return;
 for(const p of room.players){
  if(p.id===room.me||p.scene!==scene||Date.now()-(p.lastAt||0)>22000)continue;
  let r=smooth.get(p.id);
  if(!r||r.scene!==scene||Math.abs(r.x-p.x)>210)r={x:p.x,y:p.y,scene};
  r.x+=(p.x-r.x)*.16;r.y+=(p.y-r.y)*.16;smooth.set(p.id,r);
  const x=Math.round(r.x-cam),y=Math.round(r.y);if(x<-30||x>680)continue;
  ctx.save();ctx.globalAlpha=.94;
  ctx.fillStyle='#231b29';ctx.fillRect(x+2,y+7,12,22);
  ctx.fillStyle='#dba899';ctx.fillRect(x+3,y+1,10,10);
  ctx.fillStyle='#98b3c8';ctx.fillRect(x+2,y+12,12,12);
  ctx.fillStyle='#3f3552';ctx.fillRect(x+2,y+24,5,6);ctx.fillRect(x+10,y+24,5,6);
  ctx.fillStyle='#fff1d5';ctx.font='bold 9px "Malgun Gothic",sans-serif';ctx.textAlign='center';
  ctx.fillText(p.name.slice(0,8),x+8,y-8);ctx.restore();
 }
}
async function accountStatus(){
 try{account=await req('/api/account')}catch{account={loggedIn:false}}
 drawPanel();if(account.loggedIn)browse();
 const params=new URLSearchParams(location.search),invited=String(params.get('join')||'').toUpperCase();
 if(account.loggedIn&&/^[A-HJ-NP-Z2-9]{8}$/.test(invited)){$('v7RoomCode').value=invited;send('join')}
}
function wire(){
 $('v7Create').addEventListener('click',()=>send('create',{name:$('v7RoomName').value,private:$('v7Private')?.checked||false,capacity:Number($('v7Capacity')?.value||4)}));
 $('v7Join').addEventListener('click',()=>{code=String($('v7RoomCode').value||'').trim().toUpperCase();send('join')});
 $('v7Browse').addEventListener('click',browse);
 $('v7RoomList').addEventListener('click',e=>{const b=e.target.closest('[data-v7-join]');if(b){code=b.dataset.v7Join;send('join')}});
 $('v7Ready').addEventListener('click',()=>send('ready',{ready:!member()?.ready}));
 $('v7Start').addEventListener('click',()=>send('start'));
 $('v7Leave').addEventListener('click',()=>send('leave'));
 $('v7ChatForm').addEventListener('submit',e=>{
  e.preventDefault();const input=$('v7ChatInput'),message=input.value.trim();if(!connected()||!message)return;
  input.value='';send('chat',{message});
 });
 $('v7Lobby').insertAdjacentHTML('beforeend','<div class="v7-net-controls"><label style="font-size:12px"><input type="checkbox" id="v7Private"> 비공개방</label><label style="font-size:12px">인원 <select id="v7Capacity" style="background:#251b2d;color:#ffeed4;border:1px solid #9b7373;padding:6px"><option value="4">4인</option><option value="3">3인</option><option value="2">2인</option></select></label></div>');
 const copy=document.createElement('button');copy.textContent='방 코드 복사';copy.onclick=()=>{const url=location.origin+location.pathname+'?join='+code;navigator.clipboard?.writeText?navigator.clipboard.writeText(url).then(()=>status('초대 링크를 복사했습니다.')).catch(()=>status('방 코드: '+code)):status('방 코드: '+code)};
 $('v7Session').append(copy);
 const side=$('v7OnlinePanel');
 if(side&&innerWidth<700)side.open=false;
 accountStatus();
 setInterval(refresh,650);
 setInterval(move,260);
 document.addEventListener('keydown',e=>{
  if(e.code==='Enter'&&active()&&!e.target.closest?.('input,textarea,button')){$('v7OnlinePanel').open=true;$('v7ChatInput').focus();e.preventDefault();}
 });
}
window.MB_V7_NET={active,onScene,onProgress,drawPlayers,room:()=>room};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire,{once:true});else wire();
})();