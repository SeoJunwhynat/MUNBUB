import {test, after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import backrooms from '../backrooms/server.js';

function world(){
 const map=Array.from({length:25},(_,z)=>Array.from({length:25},(_,x)=>x===0||z===0||x===24||z===24?1:0));
 const objects=[];
 for(let i=0;i<8;i++)objects.push({type:'quiz',kind:i<4?'spell':'idiom',quizId:'q'+i,x:i+3,z:3});
 objects.push({type:'key',kind:'spell',x:12,z:3},{type:'key',kind:'idiom',x:13,z:3},{type:'exit',x:14,z:3});
 return {map,objects,enemy:{x:6,z:6}};
}
const proxy=createServer((req,res)=>{
 const account=req.headers['x-test-account'];
 if(account&&/^a[0-9]+$/.test(account)) req._mbBackroomsUser={id:account,name:'사용자'+account};
 backrooms.server.emit('request',req,res);
});
await new Promise(ok=>proxy.listen(0,'127.0.0.1',ok));
const origin='http://127.0.0.1:'+proxy.address().port;
async function api(account,path,body){
 const req={headers:{...(account?{'X-Test-Account':account}:{}),...(body?{'Content-Type':'application/json'}:{})}};
 if(body){req.method='POST';req.body=JSON.stringify(body)}
 const res=await fetch(origin+'/api/'+path,req);
 return {status:res.status,...await res.json()};
}
after(async()=>{
 for(const room of backrooms.rooms.values())for(const stream of room.listeners.values())stream.end();
 backrooms.rooms.clear();await new Promise(ok=>proxy.close(ok));
});
test('public list requires the taste account cookie; no room data leak',async()=>{
 assert.equal((await api(null,'rooms')).status,401);
 const a=await api('a0','rooms');assert.equal(a.status,200);assert.deepEqual(a.rooms,[]);
});
test('public and private co-op rooms have separate discovery, identical access via invite code',async()=>{
 const secret=await api('a0','create',{world:world(),visibility:'private',limit:4,title:'비공개 친구방'});
 assert.equal(secret.status,200);
 assert.equal(secret.room.visibility,'private');assert.equal(secret.room.limit,4);
 const pub=await api('a1','create',{world:world(),visibility:'public',limit:3,title:'함께 탈출하자!'});
 assert.equal(pub.status,200);assert.equal(pub.room.visibility,'public');assert.equal(pub.room.title,'함께 탈출하자!');
 assert.equal(pub.room.limit,3);
 const list=(await api('a2','rooms')).rooms;
 assert.equal(list.length,1);assert.equal(list[0].code,pub.code);assert.equal(list[0].hostName,'사용자a1');
 assert.equal(list[0].limit,3);assert.equal(list[0].players,1);
 assert.ok(!('objects' in list[0]));assert.ok(!('map' in list[0]));assert.ok(!('token' in list[0]));
 assert.equal((await api('a2','join',{code:secret.code})).status,200,'private still supports code join');
 globalThis.testPubCode=pub.code;
});
test('capacity 3 limits joins and removes full rooms from public browser; reconnect still works',async()=>{
 const code=globalThis.testPubCode;
 const a=await api('a2','join',{code});const b=await api('a3','join',{code});
 assert.equal(a.status,200);assert.equal(b.status,200);
 assert.equal((await api('a4','join',{code})).status,409);
 const again=await api('a2','join',{code});assert.equal(again.playerId,a.playerId);
 const list=(await api('a0','rooms')).rooms;
 assert.ok(!list.some(r=>r.code===code));
 assert.equal((await api('a0','action',{code,type:'start'})).status,400,'non host cannot start');
 assert.equal((await api('a1','action',{code,type:'start'})).status,400,'all must ready');
 assert.equal((await api('a2','action',{code,type:'ready'})).status,200);
 assert.equal((await api('a3','action',{code,type:'ready'})).status,200);
 assert.equal((await api('a1','action',{code,type:'start'})).status,200);
 assert.ok(!((await api('a0','rooms')).rooms.some(r=>r.code===code)));
});
test('bad size and visibility rejected; arbitrary titles sanitized',async()=>{
 assert.equal((await api('a5','create',{world:world(),limit:5,visibility:'public'})).status,400);
 assert.equal((await api('a5','create',{world:world(),limit:1,visibility:'public'})).status,400);
 assert.equal((await api('a5','create',{world:world(),limit:2.5,visibility:'public'})).status,400);
 assert.equal((await api('a5','create',{world:world(),visibility:'unsafe'})).status,400);
 const pub=await api('a5','create',{world:world(),title:'<script>bad</script>\n공개',visibility:'public',limit:2});
 assert.equal(pub.status,200);assert.equal(pub.room.title.includes('<'),false);assert.equal(pub.room.title.includes('\n'),false);
});
