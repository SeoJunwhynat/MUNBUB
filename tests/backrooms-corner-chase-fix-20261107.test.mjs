import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import Nav from '../backrooms/src/monster-nav.js';
const map=()=>{const g=Array.from({length:25},(_,z)=>Array.from({length:25},(_,x)=>x===0||z===0||x===24||z===24?1:0));for(let z=8;z<=11;z++)g[z][12]=1;return g;};
test('legal player at wall edge never causes monster A* to return empty',()=>{
 const g=map(),monster={x:42,z:34},player={x:47.65,z:34};
 assert.equal(Nav.walkable(g,player.x,player.z,.33),true);
 assert.equal(Nav.walkable(g,player.x,player.z,.35),false);
 const path=Nav.route(g,monster,player);
 assert.ok(path.length,'AI should approach rather than freeze');
 const last=path.at(-1);
 assert.ok(Math.hypot(last.x-player.x,last.z-player.z)<=.93);
 assert.ok(Nav.walkable(g,last.x,last.z,.35),'no wall clipping');
 let current={...monster},toGo=[...path];
 for(let i=0;i<200&&toGo.length;i++){
  const waypoint=Nav.nextWaypoint(g,current,toGo);
  if(!waypoint)break;
  const next=Nav.advance(g,current,waypoint,.18);
  assert.equal(next.moved,true,'must continue walking around the wall edge');
  current={x:next.x,z:next.z};
  assert.ok(Nav.walkable(g,current.x,current.z,.35));
 }
 assert.ok(Math.hypot(current.x-player.x,current.z-player.z)<1.05);
});
test('route and actual movement agree on monster .35m wall clearance',()=>{
 const g=map(),nearWall={x:47.645,z:34},target={x:42,z:34};
 assert.equal(Nav.walkable(g,nearWall.x,nearWall.z,.35),true);
 assert.equal(Nav.walkable(g,nearWall.x,nearWall.z,.36),false);
 assert.ok(Nav.route(g,nearWall,target).length>0);
});
test('solo and authoritative co-op invalidate obstructed waypoints',()=>{
 const solo=readFileSync(new URL('../backrooms/index.html',import.meta.url),'utf8');
 const coop=readFileSync(new URL('../backrooms/server.js',import.meta.url),'utf8');
 assert.match(solo,/waypoint&&nav&&!nav\.clearLine\(map,enemy,waypoint/);
 assert.match(coop,/waypoint&&!Nav\.clearLine\(room\.map,e,waypoint/);
 assert.match(solo,/enemy\.path=\[\];enemy\.pathTime=0;enemy\.stuckTicks=2/);
 assert.match(coop,/e\.path=\[\];e\.pathAt=0;e\.stuckTicks=2/);
 assert.equal(Nav.MONSTER_CHASE_SPEED,(5.75*1.05)*.93);
});
