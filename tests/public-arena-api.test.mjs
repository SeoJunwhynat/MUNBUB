import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import * as crypto from 'node:crypto';

async function fixture(){
 const objects=new Map();
 const clone=o=>o==null?o:structuredClone(o);
 const database={query:async(sql,params=[])=>{
  await Promise.resolve();
  if(sql.startsWith('SELECT body FROM mb_objects WHERE pathname=$1')){
   return objects.has(params[0])?[{body:clone(objects.get(params[0]))}]:[];
  }
  if(sql.startsWith('INSERT INTO mb_objects')){
   if(objects.has(params[0]))return [];
   objects.set(params[0],JSON.parse(params[1]));return [{pathname:params[0]}];
  }
  if(sql.startsWith('UPDATE mb_objects')){
   const previous=objects.get(params[0]);
   if(!previous||previous.revision!==params[2])return [];
   objects.set(params[0],JSON.parse(params[1]));return [{pathname:params[0]}];
  }
  if(sql.startsWith('SELECT body FROM mb_objects WHERE pathname LIKE'))return [...objects].filter(([k])=>k.startsWith('arena4/')).map(([,v])=>({body:clone(v)}));
  throw Error('Unsupported SQL: '+sql);
 }};
 const context=vm.createContext({console,Date,JSON,Buffer,Response,structuredClone,process:{env:{DATABASE_URL:'postgresql://test'}}});
 function synthetic(id,exports){return new vm.SyntheticModule(Object.keys(exports),function(){for(const [key,value]of Object.entries(exports))this.setExport(key,value)},{context,identifier:id})}
 const engineCode=await readFile(new URL('../lib/mb-arena-engine.js',import.meta.url),'utf8');
 const engine=new vm.SourceTextModule(engineCode,{context,identifier:'../lib/mb-arena-engine.js'});
 const src=await readFile(new URL('../api/public-arena.js',import.meta.url),'utf8');
 const module=new vm.SourceTextModule(src,{context,identifier:'arena'});
 const server={configured:()=>true,noCache:()=>{},sameOrigin:()=>true,session:req=>req.user,
  answerCorrect:(_id,answer)=>answer==='correct',
  duelQuestionIds:()=>Array.from({length:155},(_,i)=>'s'+(i+1)),
  duelFinalIdiomIds:()=>Array.from({length:100},(_,i)=>'i'+(i+1).toString().padStart(3,'0'))};
 const imports={'node:crypto':synthetic('node:crypto',{randomBytes:crypto.randomBytes,randomInt:crypto.randomInt}),
  '@neondatabase/serverless':synthetic('@neondatabase/serverless',{neon:()=>database}),
  '../lib/mb-server.js':synthetic('../lib/mb-server.js',server)};
 await module.link(id=>id==='../lib/mb-arena-engine.js'?engine:imports[id]);
 await module.evaluate();
 const handle=module.namespace.default;
 const actors=Array.from({length:5},(_,i)=>({id:'p'+i,name:'플레이어'+i}));
 async function call(user,body=null,query={}){
  const res={code:200,status(n){this.code=n;return this},json(o){this.data=o;return this},setHeader(){}};
  await handle({method:body?'POST':'GET',query,body,user,headers:{}},res);
  return {status:res.code,...clone(res.data)};
 }
 return {call,actors,objects};
}

test('4 players can join concurrently, 5th fails and no duplicate seat appears',async()=>{
 const {call,actors}=await fixture();
 const c=await call(actors[0],{action:'create',roomName:'모두 함께',capacity:4,settings:{count:5,seconds:25,type:'mixed',form:'auto'}});
 assert.equal(c.status,201);const code=c.code;
 const joined=await Promise.all(actors.slice(1,5).map(user=>call(user,{action:'join',code})));
 assert.equal(joined.filter(r=>r.status===200).length,3);
 assert.equal(joined.filter(r=>r.status===409).length,1);
 const s=await call(actors[0],null,{code});assert.equal(s.players.length,4);
 const list=await call(actors[0]);assert.equal(list.rooms[0].capacity,4);assert.equal(list.rooms[0].status,'full');
});
test('all readiness, synchronized clock and server graded points',async()=>{
 const {call,actors}=await fixture();
 const c=await call(actors[0],{action:'create',capacity:3,settings:{count:5,seconds:25,type:'mixed',form:'four'}});const code=c.code;
 for(const user of actors.slice(1,3))assert.equal((await call(user,{action:'join',code})).status,200);
 assert.equal((await call(actors[0],{action:'start',code})).status,409);
 for(const user of actors.slice(0,3))assert.equal((await call(user,{action:'ready',code,ready:true})).status,200);
 const start=await call(actors[0],{action:'start',code});assert.equal(start.status,200);
 assert.ok(start.startedAt>Date.now());
 const s=await call(actors[1],null,{code});assert.equal(s.startAt,start.startedAt);
 assert.equal(s.players.length,3);
 assert.equal((await call(actors[4],null,{code})).status,403);
 assert.equal((await call(actors[4],{action:'answer',code,index:0,answer:'correct'})).status,403);
});


test('public arena settings updates are server-generated and shared with all participants',async()=>{
 const {call,actors,objects}=await fixture();
 const initial={count:5,seconds:25,type:'mixed',form:'auto'};
 const create=await call(actors[0],{action:'create',capacity:4,settings:initial});
 const code=create.code;
 await call(actors[1],{action:'join',code});
 await call(actors[0],{action:'ready',code,ready:true});
 await call(actors[1],{action:'ready',code,ready:true});
 const next={count:5,seconds:40,type:'idiom',form:'text'};
 const forbidden=await call(actors[1],{action:'settings',code,settings:next,questions:['s1']});
 assert.equal(forbidden.status,403);
 const result=await call(actors[0],{action:'settings',code,settings:next,questions:['s1']});
 assert.equal(result.status,200);assert.equal(result.state.settings.type,'idiom');
 assert.equal(result.state.settings.form,'text');
 assert.ok(result.state.players.every(p=>!p.ready));
 const stored=objects.get('arena4/'+code);
 assert.equal(stored.questions.length,5);assert.ok(stored.questions.every(k=>k.startsWith('i')));
 const guest=await call(actors[1],null,{code});
 assert.equal(guest.settings.seconds,40);assert.equal(guest.settings.type,'idiom');
 assert.equal((await call(actors[0],{action:'start',code})).status,409);
 assert.equal((await call(actors[0],{action:'settings',code,settings:{...next,type:'invalid'}})).status,400);
});

test('public 2-4 player API stores new display modes and sends objective format for idioms',async()=>{
 const {call,actors,objects}=await fixture();
 const config={count:5,seconds:25,type:'idiom',form:'choice'};
 const create=await call(actors[0],{action:'create',capacity:4,settings:config});
 assert.equal(create.status,201);
 assert.equal(create.state.questionFormat,'four');
 await call(actors[1],{action:'join',code:create.code});
 const settings={count:5,seconds:25,type:'spelling',form:'combined'};
 const update=await call(actors[0],{action:'settings',code:create.code,settings});
 assert.equal(update.status,200);
 assert.equal(update.state.settings.form,'combined');
 assert.equal(update.state.questionFormat,'two');
 const stored=objects.get('arena4/'+create.code);
 assert.equal(stored.settings.form,'combined');
 assert.ok(stored.questions.every(q=>q.startsWith('s')));
 const guest=await call(actors[1],null,{code:create.code});
 assert.equal(guest.questionFormat,'two');
});
