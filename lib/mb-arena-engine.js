/** Public-room 2–4 player state machine. All timestamps are server times. */
export const CAPACITY_MIN=2;
export const CAPACITY_MAX=4;
export const ROUND_REVIEW_MS=5000;
export const ROOM_LIFETIME_MS=45*60*1000;
export const EMOTES=new Set(['wave','cheer','laugh','wow','cry','fire','thumbs','thinking','cool','sleep','love','angry']);
export const CODE_RE=/^[A-HJ-NP-Z2-9]{8}$/;
const counts=new Set([5,10,15,20,30]);
const seconds=new Set([10,15,25,30,40,60]);
const types=new Set(['mixed','spelling','idiom']);
const forms=new Set(['auto','two','four','text']);
export const active=room=>room.players.filter(p=>!p.leftAt);
export function settingsOf(s){
 const count=Number(s?.count),time=Number(s?.seconds),type=String(s?.type||'mixed'),form=String(s?.form||'auto');
 if(!counts.has(count)||!seconds.has(time)||!types.has(type)||!forms.has(form))return null;
 return {count,seconds:time,type,form};
}
export function createRoom({code,name,host,settings,capacity,questions,now}){
 return {
  code,name,settings,capacity,questions,revision:0,createdAt:now,
  expiresAt:now+ROOM_LIFETIME_MS,phase:'lobby',round:0,startAt:null,
  roundStartedAt:null,reviewEndsAt:null,closedAt:null,
  players:[{id:host.id,name:host.name,title:host.title,joinedAt:now,lastSeenAt:now,ready:false,
   leftAt:null,score:0,correct:0,answers:[],reviewReady:false,lastEmote:null,lastChatAt:0}],
  chat:[]
 };
}
export function settle(room,now){
 if(room.closedAt||room.phase==='finished'||room.phase==='lobby')return false;
 const players=active(room);
 if(!players.length){room.closedAt=now;room.phase='finished';return true;}
 if(players.length===1){room.phase='finished';return true;}
 if(room.phase==='countdown'&&now>=room.startAt){
  room.phase='question';room.roundStartedAt=room.startAt;return true;
 }
 if(room.phase==='question'){
  const everyoneAnswered=players.every(p=>p.answers.some(a=>a.index===room.round));
  const deadline=room.roundStartedAt+room.settings.seconds*1000;
  if(everyoneAnswered||now>=deadline){
   room.phase='review';room.reviewEndsAt=Math.max(now,room.roundStartedAt)+ROUND_REVIEW_MS;
   for(const p of room.players)p.reviewReady=false;
   return true;
  }
 }
 if(room.phase==='review'){
  if(now>=room.reviewEndsAt||players.every(p=>p.reviewReady)){
   if(room.round+1>=room.settings.count||players.length===1){room.phase='finished';return true;}
   room.phase='question';room.round+=1;room.roundStartedAt=now;
   for(const p of room.players)p.reviewReady=false;
   return true;
  }
 }
 return false;
}
export function view(room,viewer,now){
 const current=room.players.find(p=>p.id===viewer);
 if(!current||current.leftAt)return null;
 const completed=room.phase==='review'||room.phase==='finished';
 const activePlayers=active(room);
 const ranked=[...activePlayers].sort((a,b)=>b.score-a.score||b.correct-a.correct||a.joinedAt-b.joinedAt);
 const best=ranked[0];
 const winnerIds=room.phase==='finished'&&best?ranked.filter(p=>p.score===best.score&&p.correct===best.correct).map(p=>p.id):[];
 return {
  code:room.code,name:room.name,capacity:room.capacity,settings:room.settings,
  phase:room.phase,round:room.round,questionId:room.questions[room.round],
  serverNow:now,expiresAt:room.expiresAt,startAt:room.startAt,
  roundStartedAt:room.roundStartedAt,deadlineAt:room.phase==='question'?room.roundStartedAt+room.settings.seconds*1000:null,
  reviewEndsAt:room.reviewEndsAt,hostId:room.players[0]?.id,me:viewer,
  players:room.players.map(p=>({id:p.id,name:p.name,title:p.title,ready:p.ready,
   left:!!p.leftAt,score:p.score,correct:p.correct,reviewReady:!!p.reviewReady,
   answered:p.answers.some(a=>a.index===room.round),lastEmote:p.lastEmote||null})),
  myAnswer:completed?current.answers.find(a=>a.index===room.round)||null:null,
  everyoneAnswered:activePlayers.every(p=>p.answers.some(a=>a.index===room.round)),
  chat:room.chat.slice(-25),winnerIds
 };
}
export function perform(room,actor,action,input,now,grade){
 if(room.closedAt||room.expiresAt<=now)throw Object.assign(Error('이 방은 종료되었어.'),{status:410});
 const existing=room.players.find(p=>p.id===actor.id);
 if(action==='join'){
  if(room.phase!=='lobby')throw Object.assign(Error('이미 시작한 방이야.'),{status:409});
  if(existing&&!existing.leftAt)return {joined:true,reconnected:true};
  if(existing?.leftAt){
   // A departed member can occupy a newly vacant seat before the match starts.
   room.players=room.players.filter(p=>p.id!==actor.id);
  }
  if(active(room).length>=room.capacity)throw Object.assign(Error('정원이 찼어.'),{status:409});
  room.players.push({id:actor.id,name:actor.name,title:actor.title,joinedAt:now,lastSeenAt:now,
   ready:false,leftAt:null,score:0,correct:0,answers:[],reviewReady:false,lastEmote:null,lastChatAt:0});
  return {joined:true};
 }
 const p=room.players.find(p=>p.id===actor.id&&!p.leftAt);
 if(!p)throw Object.assign(Error('참가자만 사용할 수 있어.'),{status:403});
 if(action==='leave'){
  if(room.phase==='lobby'){
   if(p.id===room.players[0]?.id){room.closedAt=now;} // Host closes room while waiting.
   else room.players=room.players.filter(x=>x.id!==p.id);
  }else{p.leftAt=now;settle(room,now);}
  return {left:true};
 }
 if(action==='pulse'){
  if(now-p.lastSeenAt>=4000)p.lastSeenAt=now;
  return {alive:true};
 }
 if(action==='ready'){
  if(room.phase!=='lobby')throw Object.assign(Error('게임 시작 후에는 준비를 바꿀 수 없어.'),{status:409});
  p.ready=input.ready===true;return {ready:p.ready};
 }
 if(action==='start'){
  if(room.phase!=='lobby')throw Object.assign(Error('이미 대결이 시작됐어.'),{status:409});
  if(room.players[0]?.id!==p.id)throw Object.assign(Error('방장만 시작할 수 있어.'),{status:403});
  if(active(room).length<2||active(room).some(x=>!x.ready))throw Object.assign(Error('2명 이상 모두 준비해야 시작할 수 있어.'),{status:409});
  room.phase='countdown';room.startAt=now+5000;
  return {startedAt:room.startAt};
 }
 if(action==='answer'){
  if(room.phase!=='question')throw Object.assign(Error('문제 풀이 시간이 아니야.'),{status:409});
  const index=Number(input.index);
  if(!Number.isInteger(index)||index!==room.round)throw Object.assign(Error('현재 문제 번호와 맞지 않아.'),{status:409});
  if(p.answers.some(a=>a.index===index))throw Object.assign(Error('이미 답한 문제야.'),{status:409});
  const elapsed=now-room.roundStartedAt;
  if(elapsed<0||elapsed>=room.settings.seconds*1000)throw Object.assign(Error('제한 시간이 끝났어.'),{status:409});
  const answer=String(input.answer??'');
  if(answer.length>100)throw Object.assign(Error('답변 길이를 확인해 줘.'),{status:400});
  const correct=grade(room.questions[index],answer)===true;
  const points=correct?Math.max(1,Math.min(10,Math.round(10-10*elapsed/(room.settings.seconds*1000)))):0;
  const result={index,correct,points,at:now};p.answers.push(result);
  p.score+=points;p.correct+=correct?1:0;
  settle(room,now);
  return {accepted:true,correct,points,index};
 }
 if(action==='reviewReady'){
  if(room.phase!=='review')throw Object.assign(Error('결과 확인 시간이 아니야.'),{status:409});
  p.reviewReady=true;settle(room,now);return {ready:true};
 }
 if(action==='emote'){
  const id=String(input.emote||'');
  if(!EMOTES.has(id))throw Object.assign(Error('지원하지 않는 이모티콘이야.'),{status:400});
  if(p.lastEmote&&now-p.lastEmote.at<1000)throw Object.assign(Error('이모티콘은 잠시 후 다시 보내 줘.'),{status:429});
  p.lastEmote={id,at:now};return {sent:true};
 }
 if(action==='chat'){
  const message=String(input.message||'').trim();
  if(message.length<1||message.length>80)throw Object.assign(Error('채팅은 1~80자로 입력해 줘.'),{status:400});
  if(p.lastChatAt&&now-p.lastChatAt<900)throw Object.assign(Error('채팅을 너무 빠르게 보내고 있어.'),{status:429});
  p.lastChatAt=now;
  room.chat.push({id:now+'-'+p.id,name:p.name,message,at:now});room.chat=room.chat.slice(-30);
  return {sent:true};
 }
 throw Object.assign(Error('지원하지 않는 동작이야.'),{status:400});
}
