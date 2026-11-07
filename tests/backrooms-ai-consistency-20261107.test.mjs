import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import Nav from '../backrooms/src/monster-nav.js';
const map=()=>Array.from({length:9},(_,z)=>Array.from({length:9},(_,x)=>
 x===0||z===0||x===8||z===8?1:0));
test('sight respects solid scenery, walls and distance',()=>{
 const world=map(),from={x:10,z:14},to={x:22,z:14};
 assert.equal(Nav.visible(world,from,to,{maxDistance:17}),true);
 assert.equal(Nav.visible(world,from,to,{maxDistance:11}),false);
 assert.equal(Nav.visible(world,from,to,{maxDistance:17,blocked:(x,z)=>Math.abs(x-16)<.9&&Math.abs(z-14)<.9}),false);
 world[3][4]=1;
 assert.equal(Nav.visible(world,from,to,{maxDistance:17}),false);
});
test('prediction is short and never crosses furniture',()=>{
 const world=map(),from={x:15.3,z:14};
 const v=Nav.predict(world,from,{x:7.4,z:0});
 assert.ok(v.x>from.x&&v.x<=from.x+1.60001);
 assert.equal(v.z,from.z);
 assert.deepEqual(Nav.predict(world,from,{x:7.4,z:0},{blocked:(x,z)=>x>=15.9&&x<=17}),from);
 const c=Nav.predict(world,from,{x:100,z:0},{maxLead:.6});
 assert.ok(c.x>from.x&&c.x<=from.x+.60001);
});
test('client and authoritative server share sight, chase and search',()=>{
 const server=readFileSync(new URL('../backrooms/server.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../backrooms/index.html',import.meta.url),'utf8');
 const visual=readFileSync(new URL('../backrooms/src/BackroomsMonsterVisual.mjs',import.meta.url),'utf8');
 assert.match(server,/Nav\.visible\(/);assert.match(server,/Nav\.predict\(/);assert.match(server,/sincePlan>850/);
 assert.match(html,/nav\?\.visible\(/);assert.match(html,/nav\?\.predict\(/);
 assert.match(html,/enemy\.aiMode=r\.enemy\.mode/);
 assert.match(visual,/searching:mode==='search'/);
 assert.equal(Nav.MONSTER_CHASE_SPEED,(5.75*1.05)*.93);
});
