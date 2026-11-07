import test from 'node:test';
import assert from 'node:assert/strict';
import backrooms from '../backrooms/server.js';
import {readFileSync} from 'node:fs';

function makeWorld(){
 const map=Array.from({length:25},(_,z)=>Array.from({length:25},(_,x)=>x===0||z===0||x===24||z===24?1:0));
 return {map,objects:[],enemy:{x:6,z:6}};
}
function roomFixture(){
 const {room,p:host}=backrooms.createRoom('Test Host',makeWorld(),'account-one',{title:'Revive Tests',visibility:'private',limit:4});
 room.status='playing';
 const guest={...host,id:'guest',name:'Guest',accountId:'account-two',token:'other-token',x:7,z:6,alive:false,stamina:0,respawnAt:Date.now()+12000,reviveProtectedUntil:0,revives:0};
 room.players.set(guest.token,guest);
 return {room,host,guest};
}
function cleanup(room){backrooms.rooms.delete(room.code);}

test('a teammate can revive a nearby downed player without resetting shared objectives',()=>{
 const {room,host,guest}=roomFixture();
 try{
  room.quizSolved.sp1=2;room.owned.spell=true;
  const output=backrooms.handleAction(room,host,{type:'revive',targetId:guest.id});
  assert.equal(output.ok,true);assert.equal(guest.alive,true);
  assert.equal(guest.respawnAt,0);assert.ok(guest.reviveProtectedUntil>Date.now());
  assert.equal(guest.stamina,80);assert.equal(room.quizSolved.sp1,2);
  assert.equal(room.owned.spell,true);
  assert.equal(backrooms.snapshot(room).players.find(p=>p.id==='guest').alive,true);
 }finally{cleanup(room);}
});

test('revive cannot target distant, living, or nonexistent team members',()=>{
 const {room,host,guest}=roomFixture();
 try{
  guest.x=30;
  assert.throws(()=>backrooms.handleAction(room,host,{type:'revive',targetId:'guest'}),/가까이/);
  guest.x=7;guest.alive=true;
  assert.throws(()=>backrooms.handleAction(room,host,{type:'revive',targetId:'guest'}),/찾을 수/);
  assert.throws(()=>backrooms.handleAction(room,host,{type:'revive',targetId:'missing'}),/찾을 수/);
 }finally{cleanup(room);}
});

test('downed player stays in room and cannot self-respawn until server cooldown is finished',()=>{
 const {room,guest}=roomFixture();
 try{
  assert.equal(room.status,'playing');
  assert.throws(()=>backrooms.handleAction(room,guest,{type:'respawn'}),/대기 시간/);
  guest.respawnAt=Date.now()-10;
  const restored=backrooms.handleAction(room,guest,{type:'respawn'});
  assert.equal(restored.ok,true);assert.equal(guest.alive,true);
  assert.equal(guest.x,6);assert.equal(guest.z,6);assert.equal(guest.stamina,100);
  assert.ok(guest.reviveProtectedUntil>Date.now());
  assert.equal(room.status,'playing');
  assert.equal(room.quizSolved.sp1,undefined);
 }finally{cleanup(room);}
});

test('dead players cannot revive anyone while fallen',()=>{
 const {room,host,guest}=roomFixture();
 try{
  host.alive=false;
  assert.throws(()=>backrooms.handleAction(room,host,{type:'revive',targetId:'guest'}),/쓰러진/);
 }finally{cleanup(room);}
});

test('client keeps coop death in a downed view and exposes leave/settings/team interactions',()=>{
 const html=readFileSync(new URL('../backrooms/index.html',import.meta.url),'utf8');
 for(const id of ['downedScreen','selfRespawnBtn','gameLeaveBtn','gameSettingsBtn','gameSettingsPanel','coopTeamPanel','coopTeamList','coopCopyCode']){
  assert.match(html,new RegExp('id="'+id+'"'));
 }
 assert.match(html,/function showCoopDowned\(/);
 assert.match(html,/function resumeCoopFromDowned\(/);
 assert.match(html,/multiAction\('revive'/);
 assert.match(html,/multiAction\('respawn'\)/);
 assert.doesNotMatch(html,/if\(!me\.alive&&!online\.dead\)\{online\.dead=true;end\(false\)\}/);
});

test('monster accelerates only when a player is visible',()=>{
 const html=readFileSync(new URL('../backrooms/index.html',import.meta.url),'utf8');
 const server=readFileSync(new URL('../backrooms/server.js',import.meta.url),'utf8');
 assert.match(html,/nav\.MONSTER_CHASE_SPEED/);
 assert.match(server,/Nav\.MONSTER_CHASE_SPEED/);
 assert.match(server,/function seesPlayer\(room,player\)/);
});
