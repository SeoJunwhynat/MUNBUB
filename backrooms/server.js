'use strict';
// Backrooms co-op relay / authoritative shared progress. Zero npm dependencies, Node >=18.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const BANK = require('./bank.json');
const Nav = require('./src/monster-nav.js');
const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = __dirname;
const rooms = new Map();
const MAX_BODY = 180_000;
const MAX_ROOMS = 100;
const MAX_PLAYERS_PER_ACCOUNT = 1;
const START_GRACE = 40;
const QUESTIONS_PER_TERMINAL = 3;
const SELF_RESPAWN_MS = 12000;
const REVIVE_PROTECTION_MS = 6500;
const CHASE_SIGHT_DISTANCE = 17;
const MAX_STAMINA = 150;
const CELL = 4, WORLD = 25;
function badRequest(message){return Object.assign(new Error(message),{httpStatus:400});}
const jsonHeaders = {'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};
const stamp = () => Date.now();
const rand = (n = 18) => crypto.randomBytes(n).toString('hex');
const code = () => crypto.randomBytes(5).toString('base64url').replace(/[^A-Z0-9]/gi,'').toUpperCase().slice(0,6);
const safeName = (s) => String(s || '탐험가').replace(/[<>\r\n]/g,'').trim().slice(0,14) || '탐험가';
function json(res, status, payload) {res.writeHead(status,jsonHeaders);res.end(JSON.stringify(payload));}
function error(res, status, message) {json(res,status,{ok:false,error:message});}
function distance(a,b) {return Math.hypot(a.x-b.x,a.z-b.z);}
function wall(map,x,z){const gx=Math.floor(x/CELL),gz=Math.floor(z/CELL);return map[gz]?.[gx]!==0;}
function blocks(room,x,z){const radius=.33;
 for(const p of [[-radius,-radius],[-radius,radius],[radius,-radius],[radius,radius]])if(wall(room.map,x+p[0],z+p[1]))return true;
 for(const o of room.objects){if(o.type==='exit')continue;let cx=(o.x+.5)*CELL,cz=(o.z+.5)*CELL;let half=o.type==='quiz'?.72:.88;let dx=Math.max(cx-half,Math.min(x,cx+half)),dz=Math.max(cz-half,Math.min(z,cz+half));if((x-dx)**2+(z-dz)**2<radius*radius)return true;}
 return false;
}
function canMove(room,a,b){if(!Number.isFinite(b.x)||!Number.isFinite(b.z))return false;let steps=Math.max(1,Math.ceil(distance(a,b)/.18));if(steps>100)return false;for(let i=1;i<=steps;i++)if(blocks(room,a.x+(b.x-a.x)*i/steps,a.z+(b.z-a.z)*i/steps))return false;return true;}
function validateWorld(w) {
 if(!w || !Array.isArray(w.map)||w.map.length!==WORLD || !w.map.every(row=>Array.isArray(row)&&row.length===WORLD&&row.every(v=>v===0||v===1)) || w.map[1][1]!==0)throw badRequest('맵 데이터가 올바르지 않습니다.');
 const list=w.objects;
 if(!Array.isArray(list)||list.length!==11)throw badRequest('단말기·열쇠·출구 개수가 맞지 않습니다.');
 const quiz=list.filter(o=>o.type==='quiz');
 if(quiz.length!==8||quiz.filter(o=>o.kind==='spell').length!==4||quiz.filter(o=>o.kind==='idiom').length!==4||new Set(quiz.map(o=>o.quizId)).size!==8||list.filter(o=>o.type==='key').length!==2||list.filter(o=>o.type==='exit').length!==1)throw badRequest('맵 목표가 올바르지 않습니다.');
 for(const o of list){if(!Number.isInteger(o.x)||!Number.isInteger(o.z)||o.x<1||o.z<1||o.x>=24||o.z>=24||w.map[o.z][o.x]!==0)throw badRequest('단말기가 벽 안에 놓여 있습니다.');}
 // Reject duplicate objects and unreachable objectives before accepting the host's maze.
 const spots=new Set();for(const o of list){const at=o.x+','+o.z;if(spots.has(at))throw badRequest('단말기 위치가 겹쳐 있습니다.');spots.add(at);}
 const seen=new Set(['1,1']),todo=[[1,1]];
 for(let i=0;i<todo.length;i++){const [x,z]=todo[i];for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz,k=nx+','+nz;if(w.map[nz]?.[nx]!==0||seen.has(k))continue;seen.add(k);todo.push([nx,nz]);}}
 if(list.some(o=>!seen.has(o.x+','+o.z)))throw badRequest('시작 위치에서 목표까지 이동할 수 없습니다.');
 return {map:w.map.map(row=>row.slice()),enemy:w.enemy&&Number.isFinite(w.enemy.x)&&Number.isFinite(w.enemy.z)&&w.map[Math.floor(w.enemy.z/CELL)]?.[Math.floor(w.enemy.x/CELL)]===0?{x:w.enemy.x,z:w.enemy.z}:{x:6,z:6},objects:list.map(o=>{
    const q=o.type==='quiz'?makeQuestion(o.kind):undefined;
    return {type:o.type,kind:o.kind,quizId:o.quizId,x:o.x,z:o.z,question:q,cooldownUntil:0,seenQuestionIds:q?[q.id]:[]};
   })};
}
function makeQuestion(kind,exclude){const src=kind==='spell'?BANK.spelling:BANK.idioms;
 const excluded=new Set(Array.isArray(exclude)?exclude:exclude?[exclude]:[]);
 const arr=src.filter(p=>!excluded.has(p.id));let p=arr[Math.floor(Math.random()*arr.length)]||src[0];
 if(kind==='spell'){let opts=p.options.slice(),answer=opts.indexOf(p.answers[0]);return {type:'spell',id:p.id,q:p.prompt,opts,answer:Math.max(0,answer),accepted:p.answers.map(v=>opts.indexOf(v)).filter(v=>v>=0),exp:p.note||'올바른 표현을 확인해 보세요.'};}
 let other=src.filter(x=>x.id!==p.id).sort(()=>Math.random()-.5).slice(0,3).map(x=>x.answer),opts=[p.answer,...other].sort(()=>Math.random()-.5);
 return {type:'idiom',id:p.id,q:p.meaning,opts,answer:opts.indexOf(p.answer),exp:`정답은 ‘${p.answer}’입니다. ${p.meaning}`};
}
function publicQuestion(q){const {answer,accepted,exp,...shown}=q;return shown;}
function playerInfo(p){return {id:p.id,name:p.name,x:p.x,z:p.z,yaw:p.yaw,pitch:p.pitch,stamina:p.stamina,ready:p.ready,alive:p.alive,respawnAt:p.respawnAt||0,revives:p.revives||0};}
function listPublicRooms(){
 return [...rooms.values()].filter(r=>r.visibility==='public'&&r.status==='lobby'&&r.players.size<r.limit)
  .sort((a,b)=>b.createdAt-a.createdAt).slice(0,50).map(r=>({
   code:r.code,title:r.title,visibility:'public',players:r.players.size,
   limit:r.limit,hostName:[...r.players.values()].find(p=>p.id===r.host)?.name||'탐험가',createdAt:r.createdAt
  }));
}
function snapshot(room) {
 return {code:room.code,title:room.title,visibility:room.visibility,limit:room.limit,status:room.status,host:room.host,won:room.won||false,version:room.version,players:[...room.players.values()].map(playerInfo),
 map:room.map,objects:room.objects.map(o=>({type:o.type,kind:o.kind,quizId:o.quizId,x:o.x,z:o.z,question:o.question?publicQuestion(o.question):undefined,cooldownRemaining:Math.max(0,o.cooldownUntil-stamp())})),quizSolved:room.quizSolved,owned:room.owned,enemy:{x:room.enemy.x,z:room.enemy.z,grace:Math.max(0,room.enemy.grace),chasing:!!room.enemy.chasing,mode:room.enemy.mode||'patrol'},elapsed:room.elapsed};
}
function dispatch(room,only=null){const payload=JSON.stringify(snapshot(room));const message='data: '+payload+'\n\n';for(const [token,client] of room.listeners){if(only&&token!==only)continue;try{client.write(message);}catch{room.listeners.delete(token);}}}
function resultEvent(room,p,body){for(const [token,res] of room.listeners){if(token===p.token){try{res.write('event: notice\ndata: '+JSON.stringify(body)+'\n\n')}catch{};break}}}
function createRoom(name,world,accountId,options={}){if(rooms.size>=MAX_ROOMS)throw badRequest('서버 방 개수가 가득 찼습니다.');let id=code();while(rooms.has(id))id=code();let token=rand(),pid=rand(6);let p={token,id:pid,accountId,name:safeName(name),x:6,z:6,yaw:0,pitch:0,stamina:MAX_STAMINA,ready:true,alive:true,vx:0,vz:0,lastMove:stamp(),respawnAt:0,reviveProtectedUntil:0,revives:0};let room={code:id,host:pid,title:options.title||'두 개의 열쇠',visibility:options.visibility||'private',limit:options.limit||4,status:'lobby',players:new Map([[token,p]]),listeners:new Map(),createdAt:stamp(),lastActivity:stamp(),version:0,elapsed:0,enemy:{x:world.enemy.x,z:world.enemy.z,grace:START_GRACE,path:[],pathAt:0,chasing:false,sightedUntil:0,targetId:null,lastSeen:null,lastSeenAt:0,mode:'patrol',stuckTicks:0,patrolGoal:null},map:world.map,objects:world.objects,quizSolved:{},owned:{spell:false,idiom:false},won:false};rooms.set(id,room);return {room,p};}
function auth(b,account){
 const room=rooms.get(String(b.code||'').toUpperCase());
 const player=room&&[...room.players.values()].find(p=>p.accountId===account?.id);
 if(!room||!player)throw badRequest('방을 찾을 수 없거나 계정 세션이 만료되었습니다.');
 room.lastActivity=stamp();player.lastSeen=stamp();return {room,player};
}
function near(room,p,o,max=3.25){return distance(p,{x:(o.x+.5)*CELL,z:(o.z+.5)*CELL})<max;}
function solvedCount(room,kind){return room.objects.filter(o=>o.type==='quiz'&&o.kind===kind&&(Number(room.quizSolved[o.quizId])||0)>=QUESTIONS_PER_TERMINAL).length;}
function handleAction(room,p,b){let type=b.type;
 if(type==='leave'){room.players.delete(p.token);room.listeners.get(p.token)?.end();room.listeners.delete(p.token);if(room.host===p.id)room.host=[...room.players.values()][0]?.id;if(!room.players.size)rooms.delete(room.code);return {ok:true,message:'방에서 나왔어요.'};}
 if(type==='ready'){if(room.status!=='lobby')throw badRequest('준비 상태를 변경할 수 없습니다.');p.ready=!p.ready;dispatch(room);return {ok:true};}
 if(type==='start'){if(room.status!=='lobby')throw badRequest('이미 시작한 방입니다.');if(room.host!==p.id)throw badRequest('방장만 시작할 수 있어요.');if(room.players.size<2)throw badRequest('최소 2명이 필요해요.');if([...room.players.values()].some(x=>!x.ready))throw badRequest('모든 참가자가 준비해야 해요.');room.status='playing';room.elapsed=0;room.enemy.grace=START_GRACE;const candidates=[];for(let dx of [-.52,.0,.52])for(let dz of [-.52,0,.52])candidates.push({x:6+dx,z:6+dz});let ix=0;for(const pp of room.players.values()){let pos=candidates[ix++];pp.x=pos.x;pp.z=pos.z;pp.alive=true;pp.ready=true;pp.stamina=MAX_STAMINA;pp.vx=0;pp.vz=0;pp.lastMove=stamp();pp.respawnAt=0;pp.reviveProtectedUntil=0;pp.revives=0;}room.version++;dispatch(room);return {ok:true,message:'협동 탐험을 시작합니다!'};}
 if(type==='ping')return {ok:true};if(room.status!=='playing')throw badRequest('현재 플레이 중인 방이 아닙니다.');
 if(type==='revive'){
   if(!p.alive)throw badRequest('쓰러진 상태에서는 다른 팀원을 부활시킬 수 없어요.');
   const target=[...room.players.values()].find(other=>other.id===String(b.targetId||''));
   if(!target||target.alive||target.id===p.id)throw badRequest('부활시킬 팀원을 찾을 수 없어요.');
   if(distance(p,target)>2.95)throw badRequest('쓰러진 팀원 가까이 다가가세요.');
   target.alive=true;target.respawnAt=0;target.reviveProtectedUntil=stamp()+REVIVE_PROTECTION_MS;
   target.stamina=MAX_STAMINA*.8;target.lastMove=stamp();target.revives=(target.revives||0)+1;
   room.version++;dispatch(room);
   return {ok:true,message:target.name+' 님이 부활했어요!',revived:target.id};
 }
 if(type==='respawn'){
   if(p.alive)throw badRequest('이미 탐험 중이에요.');
   const now=stamp();
   if(now<(p.respawnAt||0))throw badRequest('부활 대기 시간이 남아 있어요.');
   p.alive=true;p.x=6;p.z=6;p.vx=0;p.vz=0;p.stamina=MAX_STAMINA;p.lastMove=now;
   p.respawnAt=0;p.reviveProtectedUntil=now+REVIVE_PROTECTION_MS;
   p.revives=(p.revives||0)+1;
   room.version++;dispatch(room);
   return {ok:true,message:'시작 위치에서 부활했어요!',revived:p.id};
 }
 if(type==='position'){
   let x=Number(b.x),z=Number(b.z),yaw=Number(b.yaw),pitch=Number(b.pitch);
   if(!p.alive)return {ok:true};
   const now=stamp(),dt=Math.max(.04,Math.min(2,(now-p.lastMove)/1000)),d=Math.hypot(x-p.x,z-p.z);
   if(Number.isFinite(x)&&Number.isFinite(z)&&d<=Math.max(1.15,7.4*dt)&&canMove(room,p,{x,z})){p.vx=Math.max(-7.4,Math.min(7.4,(x-p.x)/dt));p.vz=Math.max(-7.4,Math.min(7.4,(z-p.z)/dt));p.x=x;p.z=z;}else{p.vx=0;p.vz=0;}
   if(Number.isFinite(yaw))p.yaw=Math.max(-1e6,Math.min(1e6,yaw));if(Number.isFinite(pitch))p.pitch=Math.max(-1.4,Math.min(1.4,pitch));p.stamina=Number.isFinite(Number(b.stamina))?Math.max(0,Math.min(MAX_STAMINA,Number(b.stamina))):MAX_STAMINA;p.lastMove=now;return {ok:true};}
 if(!p.alive)throw badRequest('괴물에게 붙잡혀 행동할 수 없어요.');
 if(type==='answer'){
   const o=room.objects.find(o=>o.type==='quiz'&&o.quizId===b.quizId);if(!o)throw badRequest('단말기를 찾을 수 없습니다.');if(!near(room,p,o))throw badRequest('단말기에 더 가까이 다가가세요.');
   if((Number(room.quizSolved[o.quizId])||0)>=QUESTIONS_PER_TERMINAL)throw badRequest('이 단말기의 3문제를 모두 해결했습니다.');if(o.cooldownUntil>stamp())throw badRequest('이 단말기는 아직 잠겨 있습니다.');
   if(b.questionId&&b.questionId!==o.question.id)throw badRequest('다른 팀원이 먼저 풀었습니다. 단말기를 다시 열어 주세요.');
   if(!Number.isInteger(b.choice)||b.choice<0||b.choice>=o.question.opts.length)throw badRequest('정답 선택이 잘못되었습니다.');
   const correctIndices=(o.question.accepted||[o.question.answer]);
   const correct=correctIndices.includes(b.choice),correctIndex=correctIndices[0],exp=o.question.exp;
   if(correct){room.quizSolved[o.quizId]=Math.min(QUESTIONS_PER_TERMINAL,(Number(room.quizSolved[o.quizId])||0)+1);}
   else{o.cooldownUntil=stamp()+10000;}
   const progress=Number(room.quizSolved[o.quizId])||0;
   if(progress<QUESTIONS_PER_TERMINAL){
    const next=makeQuestion(o.kind,o.seenQuestionIds);
    o.question=next;o.seenQuestionIds.push(next.id);
   }
   room.version++;dispatch(room);
   return {ok:true,correct,correctIndex,exp,progress,finished:progress===QUESTIONS_PER_TERMINAL,
     nextQuestion:progress===QUESTIONS_PER_TERMINAL?null:publicQuestion(o.question),quizId:o.quizId,
     message:correct?(progress===QUESTIONS_PER_TERMINAL?'단말기 3문제 완료!':`정답! 팀 단말기 진행도 ${progress}/3`):'오답입니다. 10초 잠금 · 맞힌 문제는 유지됩니다.'};
 }
 if(type==='collect'){
   let kind=b.kind;if(!['spell','idiom'].includes(kind))throw badRequest('잘못된 열쇠 유형입니다.');let o=room.objects.find(o=>o.type==='key'&&o.kind===kind);if(!near(room,p,o))throw badRequest('열쇠가 있는 방으로 이동하세요.');if(room.owned[kind])return {ok:true,message:'이미 팀에서 획득한 열쇠입니다.'};if(solvedCount(room,kind)!==4)throw badRequest('해당 유형의 단말기 4개를 모두 풀어야 합니다.');room.owned[kind]=true;room.version++;dispatch(room);return {ok:true,message:(kind==='spell'?'맞춤법':'사자성어')+' 열쇠를 팀이 획득했어요!'};
 }
 if(type==='escape'){let o=room.objects.find(o=>o.type==='exit');if(!near(room,p,o))throw badRequest('출구 앞으로 이동하세요.');if(!room.owned.spell||!room.owned.idiom)throw badRequest('탈출하려면 열쇠 2개가 필요해요.');room.status='ended';room.won=true;room.version++;dispatch(room);return {ok:true,won:true,message:'모두 탈출에 성공했어요!'};}
 throw badRequest('지원하지 않는 동작입니다.');
}
function bfsPath(room,sx,sz,tx,tz){const [a,b,c,d]=[Math.floor(sx/CELL),Math.floor(sz/CELL),Math.floor(tx/CELL),Math.floor(tz/CELL)];if(room.map[b]?.[a]!==0||room.map[d]?.[c]!==0)return [];
 const prev=Array.from({length:WORLD},()=>Array(WORLD).fill(null)),queue=[[a,b]];prev[b][a]=[-1,-1];for(let i=0;i<queue.length;i++){let [x,z]=queue[i];if(x===c&&z===d)break;for(let [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){let nx=x+dx,nz=z+dz;if(room.map[nz]?.[nx]!==0||prev[nz][nx])continue;prev[nz][nx]=[x,z];queue.push([nx,nz]);}}
 let path=[],x=c,z=d;while(prev[z]?.[x]&&!(x===a&&z===b)&&path.length<500){path.unshift([(x+.5)*CELL,(z+.5)*CELL]);[x,z]=prev[z][x];}return path;
}
// Occlude monster sight with walls and solid objects, including terminals.
function seesPlayer(room,player){
 return Nav.visible(room.map,room.enemy,player,{
  maxDistance:CHASE_SIGHT_DISTANCE,blocked:(x,z)=>blocks(room,x,z)
 });
}
let lastTick=stamp();function tick(){let now=stamp(),dt=Math.min(.25,(now-lastTick)/1000);lastTick=now;for(const room of rooms.values()){
 for(const [token,pl] of room.players){if(now-(pl.lastSeen||room.createdAt)>30000&&!room.listeners.has(token)){room.players.delete(token);if(room.host===pl.id)room.host=[...room.players.values()][0]?.id;}}if(!room.players.size){rooms.delete(room.code);continue}
 if(room.status==='playing'){
 for(let o of room.objects){if(o.type==='quiz'&&o.cooldownUntil&&o.cooldownUntil<=now){o.cooldownUntil=0;room.version++;}}
 room.elapsed+=dt;if(room.enemy.grace>0){room.enemy.grace=Math.max(0,room.enemy.grace-dt)}else{
  const active=[...room.players.values()].filter(p=>p.alive);
  const e=room.enemy;
  if(active.length){
   // Prefer an already followed player to avoid target swapping every 220ms.
   const visible=active.filter(p=>seesPlayer(room,p)).sort((a,b)=>distance(a,e)-distance(b,e));
   const current=visible.find(p=>p.id===e.targetId);
   const nearest=visible[0];
   const target=current&&(!nearest||distance(current,e)<distance(nearest,e)*1.55)?current:nearest;
   const obstacle=(x,z)=>blocks(room,x,z);
   let goal=null;
   if(target){
    e.targetId=target.id;e.lastSeen={x:target.x,z:target.z};e.lastSeenAt=now;
    e.sightedUntil=now+3000;e.mode='chase';e.chasing=true;e.patrolGoal=null;
    // Short prediction remains inside walkable space.
    goal=Nav.predict(room.map,target,{x:target.vx,z:target.vz},{blocked:obstacle});
   }else if(e.lastSeen&&now-e.lastSeenAt<3000){
    e.mode='chase';e.chasing=true;goal=e.lastSeen;
   }else if(e.lastSeen&&now-e.lastSeenAt<7200){
    e.mode='search';e.chasing=false;goal=e.lastSeen;
   }else{
    e.mode='patrol';e.chasing=false;e.targetId=null;e.lastSeen=null;e.lastSeenAt=0;
    if(!e.patrolGoal||distance(e,e.patrolGoal)<.85){
     const gx=Math.floor(e.x/CELL),gz=Math.floor(e.z/CELL);
     const candidates=[];
     for(let z=Math.max(1,gz-6);z<=Math.min(WORLD-2,gz+6);z++)
      for(let x=Math.max(1,gx-6);x<=Math.min(WORLD-2,gx+6);x++)
       if(room.map[z]?.[x]===0&&Math.abs(x-gx)+Math.abs(z-gz)>2)candidates.push({x:(x+.5)*CELL,z:(z+.5)*CELL});
     e.patrolGoal=candidates[Math.floor(Math.random()*candidates.length)]||{x:e.x,z:e.z};
    }
    goal=e.patrolGoal;
   }
   const targetMoved=goal&&(!e.pathGoal||distance(goal,e.pathGoal)>1.15);
   const sincePlan=now-(e.pathAt||0);
   // Bound expensive A* in multiplayer, but respond immediately to a mode change.
   if(goal&&(e.pathMode!==e.mode||sincePlan>850||
       (targetMoved&&sincePlan>420)||(!e.path?.length&&sincePlan>480)||
       (e.stuckTicks>=2&&sincePlan>200))){
    e.path=Nav.route(room.map,e,goal,{blocked:obstacle});
    e.pathGoal={x:goal.x,z:goal.z};e.pathMode=e.mode;
    e.pathAt=now;e.stuckTicks=0;
   }
   const waypoint=Nav.nextWaypoint(room.map,e,e.path,{blocked:obstacle});
   if(waypoint&&!Nav.clearLine(room.map,e,waypoint,{blocked:obstacle})){
    // A moving target invalidated this turn: replan from the actual position.
    e.path=[];e.pathAt=0;e.stuckTicks=2;
   }else if(waypoint){
    const speed=e.mode==='chase'?Nav.MONSTER_CHASE_SPEED:e.mode==='search'?Nav.MONSTER_SEARCH_SPEED:Nav.MONSTER_PATROL_SPEED;
    const next=Nav.advance(room.map,e,waypoint,speed*dt,{blocked:obstacle});
    const progress=distance(e,waypoint)-distance(next,waypoint);
    if(next.moved){e.x=next.x;e.z=next.z;}
    e.stuckTicks=progress>.016?0:e.stuckTicks+1;
    if(e.stuckTicks>=2)e.pathAt=0;
   }else if(e.mode==='patrol')e.patrolGoal=null;
   for(const p of active)if(distance(p,e)<1.05&&now>=(p.reviveProtectedUntil||0)&&Nav.clearLine(room.map,p,e,{radius:.15})){
    p.alive=false;p.respawnAt=now+SELF_RESPAWN_MS;p.lastMove=now;room.version++;
   }
  }else{
    e.mode='idle';e.chasing=false;e.path=[];e.targetId=null;
    e.patrolGoal=null;e.lastSeen=null;e.lastSeenAt=0;e.sightedUntil=0;
  }
  // Keep the room running when everybody is downed. Teammates can revive one another,
  // and all players can self-respawn after their server-authorized cooldown.
 }}
 if(now-room.lastActivity>1000*60*35){for(let res of room.listeners.values())res.end();rooms.delete(room.code);continue;}
 if(room.listeners.size)dispatch(room);
}}
setInterval(tick,220).unref();
function read(req){return new Promise((resolve,reject)=>{let s='';req.on('data',d=>{s+=d;if(s.length>MAX_BODY){reject(Object.assign(Error('요청이 너무 큽니다.'),{httpStatus:413}));req.destroy();}});req.on('end',()=>{try{resolve(JSON.parse(s||'{}'));}catch{reject(badRequest('잘못된 JSON입니다.'));}});req.on('error',reject);});}
const server=http.createServer(async(req,res)=>{
 try{
   const url=new URL(req.url,'http://localhost');if(req.method==='OPTIONS'){return error(res,405,'지원하지 않는 방식이야.');}
   if(!req._mbBackroomsUser)return error(res,401,'맛춘범 계정으로 로그인해야 해.');
   if(req.method==='GET'&&url.pathname==='/api/rooms')return json(res,200,{ok:true,rooms:listPublicRooms()});
   if(req.method==='GET'&&url.pathname==='/api/health')return json(res,200,{ok:true,rooms:rooms.size,players:[...rooms.values()].reduce((n,r)=>n+r.players.size,0)});
   if(req.method==='GET'&&url.pathname==='/api/events'){
      const {room,player}=auth({code:url.searchParams.get('code')},req._mbBackroomsUser);res.writeHead(200,{'content-type':'text/event-stream; charset=utf-8','cache-control':'no-cache, no-transform','connection':'keep-alive','x-accel-buffering':'no','x-content-type-options':'nosniff'});res.write('retry: 1500\n\n');room.listeners.get(player.token)?.end();room.listeners.set(player.token,res);dispatch(room,player.token);req.on('close',()=>{if(room.listeners.get(player.token)===res)room.listeners.delete(player.token)});return;
   }
   if(req.method==='POST'&&url.pathname==='/api/create'){const b=await read(req);const world=validateWorld(b.world);
    const visibility=b.visibility===undefined?'private':b.visibility;
    if(!['public','private'].includes(visibility))return error(res,400,'공개방 설정이 올바르지 않습니다.');
    const limit=b.limit===undefined?4:Number(b.limit);
    if(!Number.isInteger(limit)||limit<2||limit>4)return error(res,400,'방 정원은 2~4명이어야 합니다.');
    const title=String(b.title||'두 개의 열쇠').normalize('NFC').replace(/[<>\r\n\t]/g,'').trim().slice(0,24)||'두 개의 열쇠';
    const {room,p}=createRoom(req._mbBackroomsUser.name,world,req._mbBackroomsUser.id,{title,limit,visibility});return json(res,200,{ok:true,code:room.code,token:p.token,playerId:p.id,isHost:true,room:snapshot(room)});}
   if(req.method==='POST'&&url.pathname==='/api/join'){const b=await read(req),room=rooms.get(String(b.code||'').toUpperCase());if(!room)return error(res,404,'해당 방이 없습니다. 방 코드를 다시 확인하세요.');const existing=[...room.players.values()].find(p=>p.accountId===req._mbBackroomsUser.id);if(existing)return json(res,200,{ok:true,code:room.code,token:existing.token,playerId:existing.id,isHost:existing.id===room.host,room:snapshot(room)});if(room.status!=='lobby')return error(res,409,'이미 탐험이 시작된 방입니다.');if(room.players.size>=room.limit)return error(res,409,'이 방은 정원이 찼습니다.');const token=rand(),pid=rand(6);room.players.set(token,{token,id:pid,name:safeName(req._mbBackroomsUser.name),accountId:req._mbBackroomsUser.id,x:6,z:6,yaw:0,pitch:0,stamina:MAX_STAMINA,ready:false,alive:true,vx:0,vz:0,lastMove:stamp(),respawnAt:0,reviveProtectedUntil:0,revives:0});room.lastActivity=stamp();dispatch(room);return json(res,200,{ok:true,code:room.code,token,playerId:pid,isHost:false,room:snapshot(room)});}
   if(req.method==='POST'&&url.pathname==='/api/action'){let b=await read(req),{room,player}=auth(b,req._mbBackroomsUser);let r=handleAction(room,player,b);return json(res,200,r);}
   if(req.method==='POST'&&url.pathname==='/api/leave'){let b=await read(req),{room,player}=auth(b,req._mbBackroomsUser);let r=handleAction(room,player,{type:'leave'});return json(res,200,r);}
   if(req.method==='GET'&&['/','/index.html','/favicon.ico'].includes(url.pathname)){
    if(url.pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
    res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});fs.createReadStream(path.join(ROOT,'index.html')).pipe(res);return;
   }
   error(res,404,'페이지를 찾을 수 없어요.');
 }catch(e){
   if(e.httpStatus)return error(res,e.httpStatus,e.message);
   console.error('Backrooms internal error:',e?.name||'Unknown');
   return error(res,500,'백룸 서버 내부 오류야.');
 }
});
if(require.main===module)server.listen(PORT,HOST,()=>console.log(`BACKROOMS CO-OP running at http://localhost:${PORT}`));
module.exports={server,rooms,createRoom,validateWorld,handleAction,snapshot,publicQuestion,listPublicRooms};
