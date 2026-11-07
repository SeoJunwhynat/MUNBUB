import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import Nav from '../backrooms/src/monster-nav.js';
import server from '../backrooms/server.js';
const html=readFileSync(new URL('../backrooms/index.html',import.meta.url),'utf8');
test('stamina 150, 2x regen and movement 1.05x',()=>{
 assert.match(html,/MAX_STAMINA=150,STAMINA_REGEN_PER_SECOND=18\*2/);
 assert.match(html,/PLAYER_WALK_SPEED=3\.30\*1\.05,PLAYER_SPRINT_SPEED=5\.75\*1\.05/);
 assert.match(html,/let speed=sprint\?PLAYER_SPRINT_SPEED:PLAYER_WALK_SPEED/);
 assert.match(html,/stamina=Math\.min\(MAX_STAMINA,stamina\+STAMINA_REGEN_PER_SECOND\*dt\)/);
 assert.match(html,/stamina\/MAX_STAMINA\*100/);
 assert.equal(Nav.MONSTER_CHASE_SPEED,(5.75*1.05)*.93);
});
test('coop spawn and respawn use stamina capacity 150',()=>{
 const map=Array.from({length:25},(_,z)=>Array.from({length:25},(_,x)=>x===0||z===0||x===24||z===24?1:0));
 const {room,p}=server.createRoom('Balance fixture',{map,enemy:{x:6,z:6},objects:[]},'test-balance');
 try{
  assert.equal(p.stamina,150);room.status='playing';
  p.alive=false;p.stamina=0;p.respawnAt=Date.now()-1;
  server.handleAction(room,p,{type:'respawn'});assert.equal(p.stamina,150);
 }finally{server.rooms.delete(room.code);}
});
test('game inline JS parses',()=>{
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
 const plain=scripts.find(([full])=>!full.includes('type='));
 assert.ok(plain);assert.doesNotThrow(()=>new Script(plain[1]));
});
