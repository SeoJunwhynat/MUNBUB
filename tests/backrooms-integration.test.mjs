import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import backrooms from '../backrooms/server.js';
import {readFileSync} from 'node:fs';
const bank=JSON.parse(readFileSync(new URL('../backrooms/bank.json',import.meta.url),'utf8'));
const world=()=>{
  const map=Array.from({length:25},(_,z)=>Array.from({length:25},(_,x)=>x===0||z===0||x===24||z===24?1:0));
  const objects=[];
  for(let k=0;k<8;k++)objects.push({type:'quiz',kind:k<4?'spell':'idiom',quizId:`q${k+1}`,x:k+3,z:3,question:{q:'malicious',opts:['hack'],accepted:[0],answer:0}});
  objects.push({type:'key',kind:'spell',x:12,z:3},{type:'key',kind:'idiom',x:13,z:3},{type:'exit',x:14,z:3});
  return {map,objects,enemy:{x:24,z:24}};
};
const proxy=createServer((req,res)=>{
  const acc=req.headers['x-test-account'];
  if(acc && /^a[0-9]$/.test(acc)) req._mbBackroomsUser={id:acc,name:'사용자'+acc};
  backrooms.server.emit('request',req,res);
});
await new Promise(resolve=>proxy.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+proxy.address().port;
after(async()=>{for(const room of backrooms.rooms.values())for(const stream of room.listeners.values())stream.end();await new Promise((resolve,reject)=>proxy.close(e=>e?reject(e):resolve()));});
async function api(account,route,body=null){const r=await fetch(origin+'/api/'+route,{method:body===null?'GET':'POST',headers:{'Content-Type':'application/json',...(account?{'X-Test-Account':account}:{})},body:body===null?undefined:JSON.stringify(body)});return {status:r.status,...await r.json()}}

test('bank counts and world validation of 8 terminals and 2 keys',()=>{
 assert.equal(bank.spelling.length,156);assert.equal(bank.idioms.length,95);
 assert.equal(backrooms.validateWorld(world()).objects.length,11);
 const bad=world();bad.objects[0].x=bad.objects[1].x;
 assert.throws(()=>backrooms.validateWorld(bad),/겹쳐/);
});

test('require signed taste account, keep nickname, and do not trust client answer',async()=>{
 const invalid=await api(null,'create',{name:'변조자',world:world()});assert.equal(invalid.status,401);
 const created=await api('a0','create',{name:'변조자',world:world()});assert.equal(created.status,200);
 assert.equal(created.room.players[0].name,'사용자a0');
 assert.equal(created.room.objects[0].question.q,'다음 중 올바른 맞춤법은?');
 assert.ok(!('answer' in created.room.objects[0].question));
 assert.ok(!('accepted' in created.room.objects[0].question));
 assert.ok(!('exp' in created.room.objects[0].question));
 const room=backrooms.rooms.get(created.code);assert.ok(room);
 assert.ok(room.objects[0].question.opts.length>=2);
 globalThis.__code=created.code;globalThis.__room=room;
});

test('four accounts can join; duplicate account reconnects; fifth account refused',async()=>{
 const code=globalThis.__code;
 const joins=[];
 for(const uid of ['a1','a2','a3']){const r=await api(uid,'join',{code,name:'타인'});assert.equal(r.status,200);joins.push(r)}
 assert.equal(joins[2].room.players.length,4);
 const resumed=await api('a2','join',{code});assert.equal(resumed.status,200);assert.equal(resumed.playerId,joins[1].playerId);
 assert.equal(resumed.room.players.length,4);
 assert.equal((await api('a4','join',{code})).status,409);
 assert.equal((await api('a4','action',{code,type:'ready'})).status,400);
});

test('host controls countdown and all ready state before entering synchronized play',async()=>{
 const code=globalThis.__code;
 assert.equal((await api('a1','action',{code,type:'start'})).status,400);
 assert.equal((await api('a0','action',{code,type:'start'})).status,400);
 for(const uid of ['a1','a2','a3'])assert.equal((await api(uid,'action',{code,type:'ready'})).status,200);
 assert.equal((await api('a0','action',{code,type:'start'})).status,200);
 assert.equal(globalThis.__room.status,'playing');
 assert.equal((await api('a4','join',{code})).status,409);
 const r=await api('a1','join',{code});assert.equal(r.status,200);assert.equal(r.room.status,'playing');
});

test('shared terminal correctness, cooldown and server-only solutions',async()=>{
 const room=globalThis.__room,code=globalThis.__code;
 const player=[...room.players.values()][0];const q=room.objects.find(o=>o.type==='quiz');
 player.x=(q.x+.5)*4;player.z=(q.z+.5)*4;
 const previous=q.question.id,wrong=q.question.opts.findIndex((_,i)=>!q.question.accepted.includes(i));
 const response=await api('a0','action',{code,type:'answer',quizId:q.quizId,choice:wrong});
 assert.equal(response.status,200);assert.equal(response.correct,false);
 assert.ok(Number.isInteger(response.correctIndex));
 assert.ok(!('answer' in response.nextQuestion));assert.notEqual(previous,q.question.id);
 assert.equal((await api('a0','action',{code,type:'answer',quizId:q.quizId,choice:0})).status,400);
 q.cooldownUntil=0;const answer=q.question.accepted[0];
 const success=await api('a0','action',{code,type:'answer',quizId:q.quizId,choice:answer});
 assert.equal(success.correct,true);assert.equal(room.quizSolved[q.quizId],true);
 assert.equal((await api('a0','action',{code,type:'answer',quizId:q.quizId,choice:answer})).status,400);
});

test('SSE broadcast is bound to authenticated participant and hides solutions',async()=>{
 const code=globalThis.__code;
 const denied=await fetch(origin+'/api/events?code='+code);
 assert.equal(denied.status,401);
 const ctl=new AbortController();const timeout=setTimeout(()=>ctl.abort(),5000);
 try{
  const response=await fetch(origin+'/api/events?code='+code,{headers:{'X-Test-Account':'a1'},signal:ctl.signal});
  assert.equal(response.status,200);assert.match(response.headers.get('content-type')||'',/event-stream/);
  const reader=response.body.getReader(),first=await reader.read();
  assert.equal(first.done,false);const text=new TextDecoder().decode(first.value);
  assert.match(text,/retry:|data:/);
  assert.ok(!text.includes('accepted'));assert.ok(!text.includes('accountId'));
  ctl.abort();
 }finally{clearTimeout(timeout)}
});

test('only correct keys unlock exit; room clears on all leaves',async()=>{
 const room=globalThis.__room,code=globalThis.__code;
 const p=[...room.players.values()][0];const k=room.objects.find(x=>x.type==='key'&&x.kind==='spell');
 p.x=(k.x+.5)*4;p.z=(k.z+.5)*4;
 assert.equal((await api('a0','action',{code,type:'collect',kind:'spell'})).status,400);
 for(const q of room.objects.filter(o=>o.type==='quiz'))room.quizSolved[q.quizId]=true;
 assert.equal((await api('a0','action',{code,type:'collect',kind:'spell'})).status,200);
 assert.equal(room.owned.spell,true);
 assert.equal((await api('a0','action',{code,type:'escape'})).status,400);
 const second=room.objects.find(o=>o.type==='key'&&o.kind==='idiom');p.x=(second.x+.5)*4;p.z=(second.z+.5)*4;
 assert.equal((await api('a0','action',{code,type:'collect',kind:'idiom'})).status,200);
 const exit=room.objects.find(o=>o.type==='exit');p.x=(exit.x+.5)*4;p.z=(exit.z+.5)*4;
 assert.equal((await api('a0','action',{code,type:'escape'})).won,true);
 for(const uid of ['a3','a2','a1','a0'])assert.equal((await api(uid,'leave',{code})).status,200);
 assert.equal(backrooms.rooms.has(code),false);
});
