import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import Nav from '../backrooms/src/monster-nav.js';
import {createAppServer} from '../server.js';
import {activeCount,pingPresence,forgetPresence,resetPresenceForTests} from '../lib/mb-presence.js';

function mapOf(size=13){
 return Array.from({length:size},(_,z)=>Array.from({length:size},(_,x)=>
  x===0||z===0||x===size-1||z===size-1?1:0));
}
const point=(x,z)=>({x:x*4+2,z:z*4+2});
test('player sprint is 1.08 times the monster pursuit speed in both modes',()=>{
 assert.equal(Nav.MONSTER_CHASE_SPEED,(5.75*1.05)*.93);
 assert.equal(Number(Nav.MONSTER_CHASE_SPEED.toFixed(4)),5.6149);
 const html=readFileSync(new URL('../backrooms/index.html',import.meta.url),'utf8');
 const server=readFileSync(new URL('../backrooms/server.js',import.meta.url),'utf8');
 assert.match(html,/nav\.MONSTER_CHASE_SPEED/);
 assert.match(server,/Nav\.MONSTER_CHASE_SPEED/);
 assert.doesNotMatch(server,/2\.05\*1\.3\*\(room\.enemy\.chasing/);
});
test('A* navigation crosses a legitimate doorway, not wall corners',()=>{
 const map=mapOf();
 for(let z=1;z<12;z++)if(z!==6)map[z][6]=1;
 const start=point(3,3),goal=point(9,3);
 assert.equal(Nav.clearLine(map,start,goal),false);
 const steps=Nav.route(map,start,goal);
 assert.ok(steps.length>1,'the route must use a waypoint at the doorway');
 let at=start;
 for(const target of steps){
  for(let i=0;i<350&&Math.hypot(at.x-target.x,at.z-target.z)>.38;i++){
   const next=Nav.advance(map,at,target,Nav.MONSTER_CHASE_SPEED*.05);
   assert.equal(Nav.walkable(map,next.x,next.z,.35),true,'never step through a wall');
   assert.equal(next.moved,true,'path segment should be traversable');
   at={x:next.x,z:next.z};
  }
 }
 assert.ok(Math.hypot(at.x-goal.x,at.z-goal.z)<.5,'monster eventually reaches visible target');
});
test('no corner cutting between diagonal blocked tiles',()=>{
 const map=mapOf(5);
 for(let z=1;z<4;z++)for(let x=1;x<4;x++)map[z][x]=1;
 map[1][1]=0;map[2][2]=0;
 assert.deepEqual(Nav.route(map,point(1,1),point(2,2)),[]);
});
test('prop blocking is respected by navigation and final movement',()=>{
 const map=mapOf();
 const cx=point(6,6).x,cz=point(6,6).z;
 const blocked=(x,z)=>Math.abs(x-cx)<1.1&&Math.abs(z-cz)<1.1;
 const from=point(3,6),to=point(9,6);
 assert.equal(Nav.clearLine(map,from,to,{blocked}),false);
 const path=Nav.route(map,from,to,{blocked});
 assert.ok(path.length>=1);
 let at=from;
 for(const target of path){
  for(let i=0;i<380&&Math.hypot(at.x-target.x,at.z-target.z)>.4;i++){
   const next=Nav.advance(map,at,target,.24,{blocked});
   assert.equal(blocked(next.x,next.z),false,'no collision with terminal');
   if(!next.moved)break;
   at={x:next.x,z:next.z};
  }
 }
 assert.ok(Math.hypot(at.x-to.x,at.z-to.z)<1,'monster routes around center prop');
});
test('active tabs are anonymous, deduplicated and expire within 70 seconds',()=>{
 resetPresenceForTests();
 const a='A'.repeat(36),b='B'.repeat(36);
 assert.equal(activeCount(1000),0);
 assert.equal(pingPresence(a,1000),1);
 assert.equal(pingPresence(a,2000),1);
 assert.equal(pingPresence(b,4000),2);
 assert.equal(pingPresence('bad',2000),null);
 assert.equal(activeCount(73000),1);
 assert.equal(forgetPresence(a),0); // current Date.now() sweeps stale old test timestamps
 resetPresenceForTests();
});
test('presence endpoint reports current visitors without login, persists no personal details',async()=>{
 resetPresenceForTests();
 const server=createAppServer();
 await new Promise((ok,fail)=>server.once('error',fail).listen(0,'127.0.0.1',ok));
 const origin='http://127.0.0.1:'+server.address().port;
 try{
  const response=await fetch(origin+'/api/presence');
  assert.equal(response.status,200);
  assert.equal((await response.json()).online,0);
  const id='V'.repeat(36);
  const post=await fetch(origin+'/api/presence',{method:'POST',headers:{'Content-Type':'application/json','Origin':origin},body:JSON.stringify({id})});
  assert.equal(post.status,200);assert.equal((await post.json()).online,1);
  const repeat=await fetch(origin+'/api/presence',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});
  assert.equal((await repeat.json()).online,1);
  const disallowed=await fetch(origin+'/api/presence',{method:'POST',headers:{'Origin':'https://other.test','Content-Type':'application/json'},body:JSON.stringify({id})});
  assert.equal(disallowed.status,403);
  const js=await fetch(origin+'/backrooms/src/monster-nav.js');
  assert.equal(js.status,200);
  assert.match(await js.text(),/MONSTER_CHASE_SPEED/);
  const bye=await fetch(origin+'/api/presence',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});
  assert.equal((await bye.json()).online,0);
 }finally{resetPresenceForTests();await new Promise(ok=>server.close(ok));}
});
test('homepage active-user count is text-only in the original footer',()=>{
 const launcher=readFileSync(new URL('../munbub_backrooms_entry_20261106.js',import.meta.url),'utf8');
 const counter=readFileSync(new URL('../mb_live_presence_20261107.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../backrooms/index.html',import.meta.url),'utf8');
 assert.match(launcher,/mb_live_presence_20261107\.js/);
 assert.match(counter,/document\.querySelector\('#homeScreen \.home-foot'\)/);
 assert.match(counter,/현재 이용 중/);
 assert.match(counter,/sessionStorage/);
 assert.match(html,/\/mb_live_presence_20261107\.js/);
});
