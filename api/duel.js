/* Private invite-code 1v1 quiz. Neither player's records overwrite the other's. */
import { randomBytes, randomInt } from 'node:crypto';
import { list, put, del } from '../lib/mb-storage.js';
import { configured, noCache, sameOrigin, session, token, verify, readPrivate, writePrivate, answerCorrect, duelQuestionIds, duelFinalIdiomIds } from '../lib/mb-server.js';

const PREFIX='duels/';
const TITLE_NAMES=new Set(['국어 새내기','훈민정음 수련생','맞춤법 탐험가','정답 감별사','문제 사냥꾼','시간의 지배자','사자성어 도전자','국어 고수','백문백답','연승 장인','말풍선 장인']);
const titleOf=v=>TITLE_NAMES.has(String(v||''))?String(v):'국어 새내기';
const MAX_QUESTIONS=10;
const MS_PER_QUESTION=25000;
const COUNTS=[5,10,15,20,30];
const SECONDS=[10,15,25,30,40,60];
const TYPES=['mixed','spelling','idiom'];
const FORMS=['auto','two','four','text'];
function validSettings(input){
 const count=Number(input?.count??10),seconds=Number(input?.seconds??25);
 const type=String(input?.type??'mixed'),form=String(input?.form??'auto');
 return COUNTS.includes(count)&&SECONDS.includes(seconds)&&TYPES.includes(type)&&FORMS.includes(form)
  ?{count,seconds,type,form}:null;
}
function roomSettings(room){return validSettings(room?.settings)||{count:10,seconds:25,type:'mixed'}}
const REVIEW_MS=10000;
const EMOTE_IDS=new Set(['wave','cheer','laugh','wow','cry','fire','thumbs','thinking','cool','sleep','love','angry']);
function nextTurnAt(roomVersion,ours,theirs){
 const lastAt=Math.max(Number(ours?.at)||0,Number(theirs?.at)||0);
 if(roomVersion<4)return lastAt+1500;
 const fallback=lastAt+(roomVersion>=5?REVIEW_MS:5000);
 const first=Number(ours?.readyAt)||0,second=Number(theirs?.readyAt)||0;
 // Fast-forward only on agreement by BOTH players. Either may agree early.
 return first&&second?Math.min(fallback,Math.max(first,second)):fallback;
}

const ROOM_LIFETIME=45*60*1000;
const CHARS='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const codeOK=s=>typeof s==='string'&&/^[A-HJ-NP-Z2-9]{8}$/.test(s);
const codeNew=()=>Array.from(randomBytes(8),v=>CHARS[v%CHARS.length]).join('');
const roomPath=c=>PREFIX+c+'/room.json';
const guestPath=c=>PREFIX+c+'/guest.json';
const lobbyPath=c=>PREFIX+c+'/lobby.json';
const lobbyReadyPath=(c,id)=>PREFIX+c+'/lobby-ready/'+id+'.json';
const lobbyStartPath=c=>PREFIX+c+'/lobby-start.json';
const chatPath=c=>PREFIX+c+'/chat/';
const stepPath=(c,id,index)=>PREFIX+c+'/steps/'+id+'/'+index+'.json';
const progressPath=(c,id)=>PREFIX+c+'/progress/'+id+'.json';
const emotePath=(c,id)=>PREFIX+c+'/emotes/'+id+'.json';
const presencePath=(c,id)=>PREFIX+c+'/presence/'+id+'.json';
const hasExpired=room=>!room||!Number.isFinite(room.expiresAt)||room.expiresAt<Date.now();

async function readLobby(code,room,guest){
 const lobby=await readPrivate(lobbyPath(code),{fresh:true});
 if(!lobby||room.version<7)return lobby;
 // Each player owns one readiness record. Simultaneous clicks must not
 // overwrite the other player's ready flag in a shared read/modify/write.
 const [host,visitor,start]=await Promise.all([
  readPrivate(lobbyReadyPath(code,room.hostId),{fresh:true}),
  guest?readPrivate(lobbyReadyPath(code,guest.id),{fresh:true}):null,
  readPrivate(lobbyStartPath(code),{fresh:true})
 ]);
 return {...lobby,hostReady:!!host?.ready,guestReady:!!visitor?.ready,
  startedAt:start?.startedAt||lobby.startedAt};
}

function pickQuestions(settings){
 const sp=duelQuestionIds().filter(k=>/^s[0-9]+$/.test(k));
 const id=duelFinalIdiomIds(); // Exactly the final workbook's 100 idioms (including legacy IDs >95).
 const sample=(arr,n)=>{
  const a=[...arr];for(let i=0;i<n;i++){const j=i+randomInt(a.length-i);[a[i],a[j]]=[a[j],a[i]]}
  return a.slice(0,n);
 };
 const spCount=settings.type==='spelling'?settings.count
  :settings.type==='idiom'?0:Math.ceil(settings.count/2);
 const idiomCount=settings.count-spCount;
 const all=[...sample(sp,spCount),...sample(id,idiomCount)];
 if(all.length!==settings.count)throw Error('Insufficient questions for settings');
 for(let i=all.length-1;i>0;i--){const j=randomInt(i+1);[all[i],all[j]]=[all[j],all[i]]}
 return all;
}

async function state(c,room,guest,me){
 const settings=roomSettings(room);
 const lobby=room.publicRoom?await readLobby(c,room,guest):null;
 const actualStart=room.publicRoom?(Number(lobby?.startedAt)||null):guest?.joinedAt+6000;
 const members=[{id:room.hostId,name:room.hostName,title:titleOf(room.hostTitle)},...(guest?[{id:guest.id,name:guest.name,title:titleOf(guest.title)}]:[])];
 const isMember=members.some(x=>x.id===me.id);
 if(!isMember)return null;
 const records=await Promise.all(members.map(async member=>{
  // One fresh progress read per player replaces 2 list operations and up to 20
  // per-answer downloads on every poll. Legacy in-progress rooms use fallback.
  let summary=await readPrivate(progressPath(c,member.id),{fresh:true});
  if(!summary&&!(room.version>=2)){
   const paths=await list({prefix:PREFIX+c+'/steps/'+member.id+'/',limit:20});
   const entries=(await Promise.all(paths.blobs.slice(0,MAX_QUESTIONS).map(b=>readPrivate(b.pathname).catch(()=>null)))).filter(x=>x&&Number.isInteger(x.index));
   const ordered=[...new Map(entries.map(e=>[e.index,e])).values()].sort((a,b)=>a.index-b.index);
   summary={answered:ordered.length,correct:ordered.reduce((n,x)=>n+(x.correct?1:0),0),
    score:ordered.reduce((n,x)=>n+x.points,0),lastAt:ordered.at(-1)?.at||null,
    answers:ordered.map(x=>({index:x.index,correct:x.correct,points:x.points,at:x.at}))};
  }
  if(!summary)summary={answered:0,correct:0,score:0,lastAt:null,answers:[]};
  return {
   id:member.id,name:member.name,title:member.title,
   answered:summary.answered||0,
   correct:summary.correct||0,
   score:summary.score||0,
   finished:(summary.answered||0)>=settings.count,
   lastAt:summary.lastAt||null,
   answers:member.id===me.id?summary.answers||[]:undefined,
   _answerTimes:(summary.answers||[]).map(x=>Number(x.at)||null),
   _answerDetails:summary.answers||[]
  };
 }));
 const mine=records.find(x=>x.id===me.id);
 const other=records.find(x=>x.id!==me.id);
 const turn=mine?.answered||0;
 // The faster player waits for the slower player; the slower one may still answer.
 const turnReady=!!guest&&!!other&&!!actualStart&&turn<settings.count&&turn<=other.answered;
 const opponentAnswered=!!other&&other.answered>turn;
 const opponentAnsweredAt=opponentAnswered?(other._answerTimes[turn]||other.lastAt||null):null;
 const lastMine=turn>0?mine?._answerDetails[turn-1]:null;
 const lastOther=turn>0?other?._answerDetails[turn-1]:null;
 const turnStartsAt=turnReady?(turn===0?actualStart:
  nextTurnAt(room.version||0,lastMine,lastOther)):null;
 const reviewReadyAt=Number(lastMine?.readyAt)||null;
 const opponentReviewReadyAt=Number(lastOther?.readyAt)||null;
 const finalReviewEndsAt=!!guest&&records.every(x=>x.finished)&&settings.count>0
  ?nextTurnAt(room.version||0,mine?._answerDetails[settings.count-1],other?._answerDetails[settings.count-1]):null;
 return {code:c,hostName:room.hostName,guestName:guest?.name||null,
   publicRoom:!!room.publicRoom,roomName:room.roomName||null,
   lobbyReady:room.publicRoom?{host:!!lobby?.hostReady,guest:!!lobby?.guestReady,startedAt:actualStart}:null,
  me:me.id,role:room.hostId===me.id?'host':'guest',
  ready:!!guest&&!!actualStart,startsAt:actualStart||null,turnReady,turnStartsAt,
  opponentAnswered,opponentAnsweredAt,serverNow:Date.now(),settings,
  reviewMode:room.version>=5?'both-ready-or-10s':room.version>=4?'both-ready-or-5s':'legacy',
  reviewReadyAt,opponentReviewReadyAt,finalReviewEndsAt,
  // A room-scoped, signed read ticket lets the client check ONLY the other
  // player's compact progress snapshot. The API still authenticates the
  // session and verifies ticket owner/room/expiry on every signal request.
  signalTicket:token({
   kind:'duel-signal',code:c,viewerId:me.id,
   opponentId:other?.id||null,version:room.version||3,exp:room.expiresAt
  }),
  // Server-signed immutable room parameters eliminate two Blob reads from
  // every answer POST without weakening authentication or anti-duplicate writes.
  answerTicket:guest&&actualStart?token({
   kind:'duel-answer',code:c,viewerId:me.id,
   hostId:room.hostId,guestId:guest.id,joinedAt:room.publicRoom?actualStart-6000:guest.joinedAt,
   version:room.version||3,
   settings,questionIds:room.questionIds,exp:room.expiresAt
  }):null,
  expiresAt:room.expiresAt,questionIds:room.questionIds,
  players:records.map(({_answerTimes,_answerDetails,...record})=>record),
  finished:!!guest&&records.every(x=>x.finished)};
}
async function sendError(res,code,text){return res.status(code).json({error:text})}
export default async function handler(req,res){
 noCache(res);
 if(!configured())return sendError(res,503,'대결 서버의 Render 데이터베이스 연결을 확인해 줘.');
 const me=session(req);
 if(!me)return sendError(res,401,'1대1 대결은 온라인 로그인 후 이용할 수 있어.');
 if(req.method==='GET'){
  // Fast event channel: ONE Blob read instead of room+guest+2 progress reads.
  // The signed ticket was issued by a validated full room state response.
  if(req.query?.chat){
   const code=String(req.query.chat||'').toUpperCase();
   if(!codeOK(code))return sendError(res,400,'방 코드가 올바르지 않아.');
   const [room,guest]=await Promise.all([
    readPrivate(roomPath(code),{fresh:true}),readPrivate(guestPath(code),{fresh:true})
   ]);
   if(hasExpired(room)||!room.publicRoom)return sendError(res,404,'공개 대기실을 찾을 수 없어.');
   if(me.id!==room.hostId&&me.id!==guest?.id)return sendError(res,403,'대기실 참가자가 아니야.');
   const listing=await list({prefix:chatPath(code),limit:100});
   const messagePaths=listing.blobs.filter(x=>/\/\d+-[a-f0-9]+\.json$/.test(x.pathname))
    .sort((a,b)=>a.pathname.localeCompare(b.pathname)).slice(-25);
   const messages=(await Promise.all(messagePaths.map(p=>readPrivate(p.pathname).catch(()=>null)))).filter(Boolean);
   return res.status(200).json({messages});
  }
  if(req.query?.signal){
   const claim=verify(String(req.query.signal));
   if(!claim||claim.kind!=='duel-signal'||claim.viewerId!==me.id||
      !codeOK(claim.code)||!(claim.opponentId===null||
      (typeof claim.opponentId==='string'&&claim.opponentId.length<100))){
    return sendError(res,403,'유효하지 않은 대전 알림 인증이야.');
   }
   try{
    if(!claim.opponentId){
     const guest=await readPrivate(guestPath(claim.code),{fresh:true});
     return res.status(200).json({
      ready:!!guest,opponentId:guest?.id||null,
      serverNow:Date.now()
     });
    }
    const [progress,emote,presence]=await Promise.all([
     readPrivate(progressPath(claim.code,claim.opponentId),{fresh:true}),
     req.query?.reactions==='1'?readPrivate(emotePath(claim.code,claim.opponentId),{fresh:true}):Promise.resolve(null),
     req.query?.reactions==='1'&&claim.version>=6
      ?readPrivate(presencePath(claim.code,claim.opponentId),{fresh:true}):Promise.resolve(null)
    ]);
    return res.status(200).json({
     ready:true,answered:progress?.answered||0,correct:progress?.correct||0,
     score:progress?.score||0,lastAt:progress?.lastAt||null,
     // Only the latest two turns are needed for opponent signals. Keeping
     // 30 old turns out of the 350ms response cuts bandwidth and parsing.
     answers:(progress?.answers||[]).slice(-2).map(x=>({index:x.index,at:x.at,readyAt:x.readyAt||null})),
     ...(req.query?.reactions==='1'?{emote:emote?.id&&EMOTE_IDS.has(emote.id)?emote:null}:{}),
     ...(req.query?.reactions==='1'&&claim.version>=6?{
      opponentLeft:!!presence?.leftAt,
      opponentOffline:!!presence?.at&&Date.now()-presence.at>26000
     }:{}),
     serverNow:Date.now()
    });
   }catch(e){
    console.error('Duel signal',e?.name);
    return sendError(res,503,'상대방 상태를 확인하지 못했어.');
   }
  }
  const code=String(req.query?.code||'').toUpperCase();
  if(!codeOK(code))return sendError(res,400,'8자리 방 코드를 입력해 줘.');
  try{
   const [room,guest]=await Promise.all([
    readPrivate(roomPath(code),{fresh:true}),
    readPrivate(guestPath(code),{fresh:true})
   ]);
   if(hasExpired(room))return sendError(res,404,'방이 없거나 유효 시간이 지났어.');
   const data=await state(code,room,guest,me);
   if(!data)return sendError(res,403,'이 방에 참여한 계정이 아니야.');
   return res.status(200).json(data);
  }catch(e){console.error('Duel status',e.message);return sendError(res,503,'대결 정보를 불러오지 못했어.')}
 }
 if(req.method!=='POST')return sendError(res,405,'지원하지 않는 요청이야.');
 if(!sameOrigin(req))return sendError(res,403,'잘못된 요청 출처야.');
 const body=req.body&&typeof req.body==='object'?req.body:{};
 try{
  if(body.action==='create'){
   const settings=validSettings(body.settings);
   if(!settings)return sendError(res,400,'문제 수·시간·유형 중 지원하지 않는 설정이 있어.');
   const code=codeNew(),now=Date.now();
   const publicRoom=body.publicRoom===true||body.lobbyRoom===true;
   const listPublicly=body.publicRoom===true;
   const roomName=String(body.roomName||'').replace(/[<>\x00-\x1f]/g,'').trim().slice(0,36)||me.name+'의 대결방';
   const hostTitle=titleOf(body.title);
   await put(roomPath(code),JSON.stringify({
    version:7,settings,code,hostId:me.id,hostName:me.name,hostTitle,
    publicRoom,roomName,questionIds:pickQuestions(settings),
    createdAt:now,expiresAt:now+ROOM_LIFETIME
   }),{access:'private',addRandomSuffix:false,contentType:'application/json'});
   // Write game state BEFORE listing. Never advertise a half-created room.
   await writePrivate(progressPath(code,me.id),{answered:0,score:0,correct:0,lastAt:null,answers:[]});
   await writePrivate(presencePath(code,me.id),{at:Date.now(),leftAt:null});
   if(publicRoom)await writePrivate(lobbyPath(code),{hostReady:false,guestReady:false,startedAt:null},{overwrite:true});
   if(listPublicly)await writePrivate('public-rooms/'+code+'.json',{
    code,roomName,hostId:me.id,hostName:me.name,hostTitle,createdAt:now,
    expiresAt:now+ROOM_LIFETIME,settings
   },{overwrite:true});
   return res.status(201).json({code,settings,expiresAt:now+ROOM_LIFETIME});
  }
  const code=String(body.code||'').trim().toUpperCase();
  if(!codeOK(code))return sendError(res,400,'올바른 8자리 방 코드를 입력해 줘.');
  let room,guest;
  if(['answer','ready','emote','pulse','leave'].includes(body.action)&&body.answerTicket){
   const verified=verify(String(body.answerTicket));
   if(!verified||verified.kind!=='duel-answer'||
    verified.code!==code||verified.viewerId!==me.id||
    ![verified.hostId,verified.guestId].includes(me.id)||
    !validSettings(verified.settings)||
    !Array.isArray(verified.questionIds)||
    verified.questionIds.length!==verified.settings.count||
    verified.questionIds.some(id=>typeof id!=='string'||!/^([si])\d{1,4}$/.test(id))||
    !Number.isFinite(verified.joinedAt)){
    return sendError(res,403,'대전 인증이 만료됐어. 방에 다시 입장해 줘.');
   }
   room={
    version:Number(verified.version)||3,hostId:verified.hostId,expiresAt:verified.exp,
    questionIds:verified.questionIds,settings:verified.settings
   };
   guest={id:verified.guestId,joinedAt:verified.joinedAt};
  }else{
   [room,guest]=await Promise.all([
    readPrivate(roomPath(code),{fresh:true}),
    readPrivate(guestPath(code),{fresh:true})
   ]);
  }
  if(hasExpired(room))return sendError(res,404,'방을 찾을 수 없거나 유효 시간이 지났어.');
  if(body.action==='join'){
   if(room.version>=6){
    const hostPresence=await readPrivate(presencePath(code,room.hostId),{fresh:true});
    if(hostPresence?.leftAt)return sendError(res,410,'방장이 대결방을 나갔어. 새 방 코드를 받아 줘.');
   }
   if(room.hostId===me.id)return sendError(res,400,'자기 자신과는 대결할 수 없어.');
   // Reconnect while seated, but do not let departed guests occupy the
   // only seat forever. Reopening applies only before the match started.
   if(guest){
    const departed=await readPrivate(presencePath(code,guest.id),{fresh:true});
    const lobby=room.publicRoom?await readPrivate(lobbyPath(code),{fresh:true}):null;
    const started=!!lobby?.startedAt||!!(room.version>=7&&await readPrivate(lobbyStartPath(code),{fresh:true}));
    if(departed?.leftAt&&!started){
     await del(guestPath(code)).catch(()=>{});
     guest=await readPrivate(guestPath(code),{fresh:true});
    }
   }
   if(guest?.id===me.id)return res.status(200).json({code,joined:true,reconnected:true});
   if(guest)return sendError(res,409,'이미 다른 계정이 참가한 방이야. 새 방 코드를 받아 줘.');
   try{
    await put(guestPath(code),JSON.stringify({id:me.id,name:me.name,title:titleOf(body.title),joinedAt:Date.now()}),
     {access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json'});
   }catch(e){
    // Blob writes are conditional; concurrent callers cannot take the same seat.
    const occupant=await readPrivate(guestPath(code),{fresh:true}).catch(()=>null);
    if(occupant?.id===me.id)return res.status(200).json({code,joined:true,reconnected:true});
    return sendError(res,409,'참가할 수 없는 방이야. 상대가 이미 들어왔는지 확인해 줘.');
   }
   // Do NOT immediately re-read the Blob and reject a successful write:
   // storage propagation/caching can briefly return an older guest value.
   try{
    await writePrivate(progressPath(code,me.id),
     {answered:0,score:0,correct:0,lastAt:null,answers:[]},{overwrite:true});
    await writePrivate(presencePath(code,me.id),{at:Date.now(),leftAt:null},{overwrite:true});
    // The host may have waited for the invitation to be accepted for minutes
    // before receiving an answer ticket and starting heartbeats. Prevent a
    // freshly joined guest from treating that as an immediate disconnect.
    const hostSeen=await readPrivate(presencePath(code,room.hostId),{fresh:true});
    if(!hostSeen?.leftAt)
     await writePrivate(presencePath(code,room.hostId),{at:Date.now(),leftAt:null},{overwrite:true});
   }catch(e){
    // Guest registration already succeeded; a delayed progress record must
    // not turn a successful join into a misleading failure.
    console.error('Duel guest progress init failed',e?.message);
   }
   return res.status(200).json({code,joined:true});
  }
  if(body.action==='lobbyReady'||body.action==='lobbyStart'){
   if(!room.publicRoom||!guest)return sendError(res,409,'공개 대기실에 두 플레이어가 들어와야 해.');
   if(me.id!==room.hostId&&me.id!==guest.id)return sendError(res,403,'방 참가자가 아니야.');
   const path=lobbyPath(code),lobby=await readLobby(code,room,guest);
   if(!lobby||lobby.startedAt)return sendError(res,409,'이미 시작됐거나 대기실이 닫혔어.');
   if(body.action==='lobbyReady'){
    if(room.version>=7){
     await writePrivate(lobbyReadyPath(code,me.id),{ready:!!body.ready},{overwrite:true});
     return res.status(200).json({ready:true});
    }
    if(me.id===room.hostId)lobby.hostReady=!!body.ready;
    else lobby.guestReady=!!body.ready;
    await writePrivate(path,lobby,{overwrite:true});
    return res.status(200).json({ready:true,lobby});
   }
   if(me.id!==room.hostId)return sendError(res,403,'방장만 대결을 시작할 수 있어.');
   if(!lobby.hostReady||!lobby.guestReady)return sendError(res,409,'두 사람이 모두 준비해야 시작할 수 있어.');
   let startedAt=Date.now()+6000;
   if(room.version>=7){
    try{await writePrivate(lobbyStartPath(code),{startedAt})}
    catch(error){
     const existing=await readPrivate(lobbyStartPath(code),{fresh:true});
     if(!existing?.startedAt)throw error;
     startedAt=existing.startedAt;
    }
   }
   await writePrivate(path,{...lobby,startedAt},{overwrite:true});
   return res.status(200).json({startedAt});
  }
  if(body.action==='chat'){
   if(!room.publicRoom||(me.id!==room.hostId&&me.id!==guest?.id))return sendError(res,403,'공개방 참가자만 채팅할 수 있어.');
   const message=String(body.message??'').trim();
   if(!message||message.length>80)return sendError(res,400,'채팅은 1~80자로 입력해 줘.');
   const ratePath=chatPath(code)+'rate-'+me.id+'.json';
   const recent=await readPrivate(ratePath,{fresh:true}),now=Date.now();
   if(recent?.at&&now-recent.at<1200)return sendError(res,429,'채팅은 잠깐 간격을 두고 보내 줘.');
   await writePrivate(ratePath,{at:now},{overwrite:true});
   const id=now+'-'+randomBytes(4).toString('hex');
   await put(chatPath(code)+id+'.json',JSON.stringify({name:me.name,message,at:now}),{
    access:'private',addRandomSuffix:false,contentType:'application/json'});
   return res.status(200).json({sent:true});
  }
  if(body.action==='pulse'||body.action==='leave'){
   if(room.version<6||(!guest&&room.hostId!==me.id))
    return sendError(res,409,'방에 먼저 참가해 줘.');
   if(me.id!==room.hostId&&me.id!==guest?.id)return sendError(res,403,'방 참가자가 아니야.');
   const path=presencePath(code,me.id),previous=await readPrivate(path,{fresh:true});
   const now=Date.now();
   if(previous?.leftAt)return res.status(200).json({ended:true,at:previous.leftAt});
   if(body.action==='leave'){
    const leftAt=now;
    await writePrivate(path,{at:previous?.at||now,leftAt},{overwrite:true});
    if(me.id===room.hostId){
     // Explicitly hide an abandoned public room. The original private room
     // record stays for compatibility with in-progress opponent polling.
     await del('public-rooms/'+code+'.json').catch(()=>{});
    }else if(room.publicRoom){
     const lobby=await readPrivate(lobbyPath(code),{fresh:true});
     const started=!!lobby?.startedAt||!!(room.version>=7&&await readPrivate(lobbyStartPath(code),{fresh:true}));
     if(!started){
      // Free the waiting seat so a new guest can join without a dead room.
      await del(guestPath(code)).catch(()=>{});
      await Promise.all([
       writePrivate(lobbyReadyPath(code,me.id),{ready:false},{overwrite:true}),
       writePrivate(lobbyReadyPath(code,room.hostId),{ready:false},{overwrite:true})
      ]);
     }
    }
    return res.status(200).json({ended:true,at:leftAt});
   }
   if(previous?.at&&now-previous.at<4500)return res.status(200).json({alive:true});
   await writePrivate(path,{at:now,leftAt:null},{overwrite:true});
   return res.status(200).json({alive:true});
  }
  if(body.action==='emote'){
   if(!guest||room.version<5)return sendError(res,409,'이 방에서는 이모티콘을 사용할 수 없어.');
   if(me.id!==room.hostId&&me.id!==guest.id)return sendError(res,403,'참가자만 이모티콘을 보낼 수 있어.');
   const id=String(body.emote||'');
   if(!EMOTE_IDS.has(id))return sendError(res,400,'지원하지 않는 이모티콘이야.');
   const path=emotePath(code,me.id);
   const previous=await readPrivate(path,{fresh:true});
   const now=Date.now();
   if(previous&&now-Number(previous.at||0)<1100)
    return sendError(res,429,'이모티콘은 1초마다 보낼 수 있어.');
   const data={id,at:now};
   await writePrivate(path,data,{overwrite:true});
   return res.status(200).json({accepted:true,emote:data});
  }
  if(body.action==='ready'){
   if(!guest||room.version<4)return sendError(res,409,'현재 방은 바로 넘기기를 지원하지 않아.');
   if(me.id!==room.hostId&&me.id!==guest.id)return sendError(res,403,'방 참가자만 동의할 수 있어.');
   const index=Number(body.index),settings=roomSettings(room);
   if(!Number.isInteger(index)||index<0||index>=settings.count)
    return sendError(res,400,'현재 문제 번호를 확인해 줘.');
   const myPath=progressPath(code,me.id);
   const progress=await readPrivate(myPath,{fresh:true});
   if(!progress||progress.answered!==index+1||progress.answers?.[index]?.index!==index)
    return sendError(res,409,'현재 답변을 제출한 뒤 동의할 수 있어.');
   const already=Number(progress.answers[index].readyAt)||0;
   if(already)return res.status(200).json({accepted:true,index,readyAt:already,already:true});
   const readyAt=Date.now();
   progress.answers[index]={...progress.answers[index],readyAt};
   await writePrivate(myPath,progress,{overwrite:true});
   return res.status(200).json({accepted:true,index,readyAt});
  }
  if(body.action==='answer'){
   if(!guest)return sendError(res,409,'상대가 입장할 때까지 기다려 줘.');
   if(me.id!==room.hostId&&me.id!==guest.id)return sendError(res,403,'이 대결의 참가자가 아니야.');
   const index=Number(body.index);
   const settings=roomSettings(room);
   if(!Number.isInteger(index)||index<0||index>=settings.count)return sendError(res,400,'문제 번호를 확인해 줘.');
   const qid=room.questionIds[index];
   if(!qid)return sendError(res,400,'문제 정보를 찾을 수 없어.');
   const start=guest.joinedAt+6000;
   if(Date.now()<start)return sendError(res,409,'대결 시작 신호를 기다려 줘.');
   // Progress snapshot guards the turn, and an immutable put below rejects
   // duplicate submissions atomically. No extra Blob read is needed here.
   const path=stepPath(code,me.id,index);
   const otherId=me.id===room.hostId?guest.id:room.hostId;
   const [previousProgress,otherProgress]=await Promise.all([
    readPrivate(progressPath(code,me.id),{fresh:true}),
    readPrivate(progressPath(code,otherId),{fresh:true})
   ]);
   const mineCount=previousProgress?.answered||0,otherCount=otherProgress?.answered||0;
   if(mineCount!==index)return sendError(res,409,'이미 답한 문제이거나 이전 문제부터 풀어야 해.');
   if(otherCount<index)return sendError(res,409,'상대방이 이전 문제를 마칠 때까지 기다려 줘.');
   let began=start;
   if(index>0){
    // New rooms: ten seconds after both answers, or immediately if both
    // players agree. This is verified on the SERVER, not just the UI.
    // Older active rooms keep their original 1.5-second rule.
    began=nextTurnAt(room.version||0,
     previousProgress?.answers?.[index-1],
     otherProgress?.answers?.[index-1]);
   }
   if(Date.now()<began)return sendError(res,409,'두 사람의 다음 문제 시작 신호를 기다려 줘.');
   const answer=String(body.answer??'');
   if(answer.length>100)return sendError(res,400,'답변이 너무 길어.');
   const checked=answerCorrect(qid,answer);
   if(checked===null)return sendError(res,400,'유효하지 않은 문제야.');
   const at=Date.now();
   const opponentAt=Number(otherProgress?.answers?.[index]?.at)||null;
   // After the opponent chooses, the remaining clock runs at 2x speed.
   // Only this elapsed time contributes to the deadline; both clients use
   // the exact same calculation from server timestamps.
   const elapsed=Math.max(0,at-began)+(opponentAt?Math.max(0,at-opponentAt):0);
   const maxMs=settings.seconds*1000;
   const timedOut=elapsed>=maxMs;
   const correct=!timedOut&&checked;
   const points=correct?Math.max(0,Math.min(10,Math.round(10-10*Math.min(1,elapsed/maxMs)))):0;
   const entry={index,qid,correct,points,at,elapsed,timedOut};
   try{await put(path,JSON.stringify(entry),{access:'private',addRandomSuffix:false,contentType:'application/json'})}
   catch(e){return sendError(res,409,'이미 제출되었어. 상태를 새로고침해 줘.')}
   // A compact per-player snapshot makes polling O(2) instead of O(20).
   const next={
    answered:index+1,
    score:(previousProgress?.score||0)+points,
    correct:(previousProgress?.correct||0)+(correct?1:0),
    lastAt:at,
    answers:[...(previousProgress?.answers||[]),{index,correct,points,at}]
   };
   try{await writePrivate(progressPath(code,me.id),next,{overwrite:true})}
   catch(e){
    // The immutable answer survives even when the read model needs repair.
    console.error('Duel progress snapshot failed',e?.name);
   }
   return res.status(200).json({accepted:true,index,correct,points,elapsed,timedOut,at,finished:index===settings.count-1});
  }
  return sendError(res,400,'알 수 없는 대결 요청이야.');
 }catch(e){console.error('Duel API',e.message);return sendError(res,503,'대결 서버에 문제가 발생했어. 다시 시도해 줘.')}
}
