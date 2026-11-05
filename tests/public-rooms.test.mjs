import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import * as crypto from 'node:crypto';

// Exercise the real handlers with isolated storage, never live accounts/rooms.
async function fixture(){
 const files=new Map();
 const clone=value=>value==null?null:structuredClone(value);
 const readPrivate=async path=>{await Promise.resolve();return clone(files.get(path))};
 const writePrivate=async(path,value,{overwrite=false}={})=>{
  await Promise.resolve();
  if(files.has(path)&&!overwrite)throw Object.assign(Error('BlobAlreadyExists'),{name:'BlobAlreadyExistsError'});
  files.set(path,clone(value));return {pathname:path};
 };
 const list=async({prefix='',limit=1000}={})=>({blobs:[...files.keys()].filter(k=>k.startsWith(prefix)).sort().slice(0,limit).map(pathname=>({pathname}))});
 const blob={list,put:async(path,text,options={})=>writePrivate(path,JSON.parse(text),{overwrite:options.allowOverwrite===true}),del:async(path)=>{if(Array.isArray(path)){path.forEach(p=>files.delete(p))}else files.delete(path)}};
 const server={configured:()=>true,noCache:()=>{},sameOrigin:()=>true,session:req=>req.user,
  token:claim=>JSON.stringify(claim),verify:claim=>JSON.parse(claim),readPrivate,writePrivate,
  answerCorrect:()=>true,duelQuestionIds:()=>[...Array.from({length:156},(_,i)=>'s'+(i+1)),...Array.from({length:95},(_,i)=>'i'+(i+1))]};
 const context=vm.createContext({console,Date,JSON,Response,Buffer,setTimeout,clearTimeout});
 const modules=new Map();
 function synthetic(name,exports){
  const mod=new vm.SyntheticModule(Object.keys(exports),function(){for(const [k,v] of Object.entries(exports))this.setExport(k,v)},{context,identifier:name});
  modules.set(name,mod);return mod;
 }
 synthetic('node:crypto',crypto);synthetic('@vercel/blob',blob);synthetic('../lib/mb-server.js',server);
 async function load(name){
  const source=await readFile(new URL('../api/'+name+'.js',import.meta.url),'utf8');
  const mod=new vm.SourceTextModule(source,{context,identifier:name});
  await mod.link(specifier=>modules.get(specifier));await mod.evaluate();return mod.namespace.default;
 }
 const duel=await load('duel'),rooms=await load('public-rooms');
 async function request(handler,user,body,query={}){
  const res={code:200,status(n){this.code=n;return this},json(data){this.data=data;return this},setHeader(){}};
  await handler({method:body?'POST':'GET',body,user,query,headers:{}},res);return {code:res.code,data:clone(res.data)};
 }
 const host={id:'host',name:'테스트방장'},guest={id:'guest',name:'테스트참가자'};
 const call=(user,body,query)=>request(duel,user,body,query);
 const settings={type:'mixed',form:'four',count:5,seconds:25};
 async function create(isPublic=true){
  const out=await call(host,{action:'create',settings,lobbyRoom:true,publicRoom:isPublic,roomName:'격리 테스트',title:'연승 장인'});
  assert.equal(out.code,201);return out.data.code;
 }
 async function enter(code){assert.equal((await call(guest,{action:'join',code,title:'국어 새내기'})).code,200)}
 return {files,call,host,guest,create,enter,listing:()=>request(rooms,host)};
}

test('simultaneous readiness keeps both flags; only the host starts after both ready',async()=>{
 const f=await fixture(),code=await f.create();await f.enter(code);
 assert.equal((await f.call(f.host,{action:'lobbyStart',code})).code,409);
 await Promise.all([f.call(f.host,{action:'lobbyReady',code,ready:true}),f.call(f.guest,{action:'lobbyReady',code,ready:true})]);
 const state=(await f.call(f.host,null,{code})).data;
 assert.equal(state.lobbyReady.host,true);assert.equal(state.lobbyReady.guest,true);
 assert.equal(state.players[0].title,'연승 장인');assert.equal(state.ready,false);
 assert.equal((await f.call(f.guest,{action:'lobbyStart',code})).code,403);
 const start=await f.call(f.host,{action:'lobbyStart',code});assert.equal(start.code,200);
 assert.ok(start.data.startedAt>Date.now());
 const active=(await f.call(f.guest,null,{code})).data;
 assert.equal(active.ready,true);assert.equal(active.startsAt,start.data.startedAt);
 assert.ok(active.answerTicket);assert.equal(active.questionIds.length,5);
});

test('cancelling one ready flag preserves the other',async()=>{
 const f=await fixture(),code=await f.create();await f.enter(code);
 await Promise.all([f.call(f.host,{action:'lobbyReady',code,ready:true}),f.call(f.guest,{action:'lobbyReady',code,ready:true})]);
 await f.call(f.guest,{action:'lobbyReady',code,ready:false});
 const state=(await f.call(f.host,null,{code})).data;
 assert.equal(state.lobbyReady.host,true);assert.equal(state.lobbyReady.guest,false);
 assert.equal((await f.call(f.host,{action:'lobbyStart',code})).code,409);
});

test('public listing distinguishes waiting, full and playing; stale/left hosts disappear',async()=>{
 const f=await fixture(),code=await f.create();
 assert.equal((await f.listing()).data.rooms[0].status,'waiting');
 await f.enter(code);assert.equal((await f.listing()).data.rooms[0].status,'full');
 await Promise.all([f.call(f.host,{action:'lobbyReady',code,ready:true}),f.call(f.guest,{action:'lobbyReady',code,ready:true})]);
 await f.call(f.host,{action:'lobbyStart',code});assert.equal((await f.listing()).data.rooms[0].status,'playing');
 f.files.set('duels/'+code+'/presence/host.json',{at:Date.now()-61000,leftAt:null});
 assert.equal((await f.listing()).data.rooms.length,0);
 await f.call(f.host,{action:'pulse',code});assert.equal((await f.listing()).data.rooms.length,1);
 await f.call(f.host,{action:'leave',code});assert.equal((await f.listing()).data.rooms.length,0);
});

test('private code rooms share readiness without being listed; lone host can heartbeat',async()=>{
 const f=await fixture(),code=await f.create(false);
 f.files.set('duels/'+code+'/presence/host.json',{at:Date.now()-10000,leftAt:null});
 assert.equal((await f.call(f.host,{action:'pulse',code})).code,200);
 assert.ok(f.files.get('duels/'+code+'/presence/host.json').at>Date.now()-1000);
 assert.equal((await f.listing()).data.rooms.length,0);
 await f.enter(code);const state=(await f.call(f.host,null,{code})).data;
 assert.equal(state.publicRoom,true);assert.equal(state.ready,false);
 assert.equal(state.lobbyReady.host,false);
});

test('simultaneous host start requests share one countdown',async()=>{
 const f=await fixture(),code=await f.create();await f.enter(code);
 await Promise.all([f.call(f.host,{action:'lobbyReady',code,ready:true}),f.call(f.guest,{action:'lobbyReady',code,ready:true})]);
 const starts=await Promise.all([f.call(f.host,{action:'lobbyStart',code}),f.call(f.host,{action:'lobbyStart',code})]);
 assert.equal(starts[0].code,200);assert.equal(starts[1].code,200);
 assert.equal(starts[0].data.startedAt,starts[1].data.startedAt);
 const state=(await f.call(f.host,null,{code})).data;
 assert.equal(state.startsAt,starts[0].data.startedAt);
});

test('legacy ready records remain compatible with existing rooms',async()=>{
 const f=await fixture(),code=await f.create();await f.enter(code);
 f.files.get('duels/'+code+'/room.json').version=6;
 await f.call(f.host,{action:'lobbyReady',code,ready:true});
 await f.call(f.guest,{action:'lobbyReady',code,ready:true});
 assert.equal((await f.call(f.host,{action:'lobbyStart',code})).code,200);
});


test('guest leave releases public waiting-room seat and a different guest can enter',async()=>{
 const f=await fixture(),code=await f.create();await f.enter(code);
 assert.equal((await f.call(f.guest,{action:'leave',code})).code,200);
 assert.equal((await f.listing()).data.rooms[0].players,1);
 const next={id:'another-guest',name:'새로운 참가자'};
 assert.equal((await f.call(next,{action:'join',code})).code,200);
 const listing=(await f.listing()).data.rooms[0];
 assert.equal(listing.players,2);
 assert.equal((await f.call(next,null,{code})).code,200);
});

test('host leave removes public listing and prevents subsequent joins',async()=>{
 const f=await fixture(),code=await f.create();
 assert.equal((await f.call(f.host,{action:'leave',code})).code,200);
 assert.equal((await f.listing()).data.rooms.length,0);
 assert.equal((await f.call(f.guest,{action:'join',code})).code,410);
});
