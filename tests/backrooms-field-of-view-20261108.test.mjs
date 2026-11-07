import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import Nav from '../backrooms/src/monster-nav.js';

const area=Array.from({length:25},(_,z)=>Array.from({length:25},(_,x)=>
 (z===0||x===0||z===24||x===24)?1:0));
const monster={x:50,z:50},rad=d=>d*Math.PI/180;
const spot=d=>({x:50+Math.sin(rad(d))*8,z:50+Math.cos(rad(d))*8});

test('140-degree FOV: front and ±70° edges visible, sides and behind hidden',()=>{
 assert.equal(Nav.MONSTER_FIELD_OF_VIEW_DEGREES,140);
 for(const d of [-70,-69,0,55,69,70])assert.equal(Nav.visible(area,monster,spot(d),{facing:0,maxDistance:17}),true,'visible '+d);
 for(const d of [-180,-91,-71,71,91,180])assert.equal(Nav.visible(area,monster,spot(d),{facing:0,maxDistance:17}),false,'hidden '+d);
 assert.equal(Nav.withinFieldOfView(monster,{x:50,z:60},Math.PI),false);
 assert.equal(Nav.withinFieldOfView(monster,{x:50,z:40},Math.PI),true);
});
test('FOV rotates with actual monster yaw and respects wall/distance',()=>{
 const target=spot(110);
 assert.equal(Nav.visible(area,monster,target,{facing:rad(110),maxDistance:17}),true);
 assert.equal(Nav.visible(area,monster,target,{facing:rad(270),maxDistance:17}),false);
 assert.equal(Nav.visible(area,monster,target,{facing:rad(110),maxDistance:4}),false);
 area[12][13]=1;
 assert.equal(Nav.visible(area,monster,target,{facing:rad(110),maxDistance:17}),false);
});
test('solo and co-op both read facing and update yaw when walking',()=>{
 const html=readFileSync(new URL('../backrooms/index.html',import.meta.url),'utf8');
 const server=readFileSync(new URL('../backrooms/server.js',import.meta.url),'utf8');
 assert.match(html,/maxDistance:17,facing:enemy\.yaw,fovDegrees:140/);
 assert.match(server,/facing:room\.enemy\.yaw,fovDegrees:140/);
 assert.match(html,/enemy\.yaw=Math\.atan2\(dx,dz\)/);
 assert.match(server,/e\.yaw=Math\.atan2\(dx,dz\)/);
 assert.match(server,/yaw:room\.enemy\.yaw/);
});
