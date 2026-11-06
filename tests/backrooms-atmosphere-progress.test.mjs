import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import server from '../backrooms/server.js';
const html=readFileSync(new URL('../backrooms/index.html',import.meta.url),'utf8');
const qWorld=()=>{
 const map=Array.from({length:25},(_,z)=>Array.from({length:25},(_,x)=>x===0||z===0||x===24||z===24?1:0));
 const objects=[];for(let n=0;n<8;n++)objects.push({type:'quiz',kind:n<4?'spell':'idiom',quizId:'x'+n,x:n+3,z:4});
 objects.push({type:'key',kind:'spell',x:16,z:4},{type:'key',kind:'idiom',x:17,z:4},{type:'exit',x:18,z:4});
 return {map,objects,enemy:{x:6,z:8}};
};
test('fresh world contains eight terminals, each starting at 0/3, and excludes answer indices from public room state',()=>{
 const w=server.validateWorld(qWorld());
 const {room}=server.createRoom('테스터',w,'account-a');
 try{
  assert.equal(room.objects.filter(o=>o.type==='quiz').length,8);
  assert.deepEqual(room.quizSolved,{});
  const exposed=server.snapshot(room);
  assert.equal(exposed.objects[0].question.answer,undefined);
  assert.equal(exposed.objects[0].seenQuestionIds,undefined);
 }finally{server.rooms.delete(room.code)}
});
test('three-question progress is represented consistently in UI and both room modes',()=>{
 for(const pattern of [/QUESTIONS_PER_TERMINAL=3/,/function progressOf\(o\)/,/function answeredOf\(type\)/,/progressOf\(o\)>=QUESTIONS_PER_TERMINAL/,/quizContinue.*onclick/s,/12문제/,/총 24문제/])assert.match(html,pattern);
 assert.match(html,/다음 문제 \(/);
});
test('cinematic visuals have noise, depth fog, flicker and reduced-motion support',()=>{
 for(const phrase of ['#fluorescentGlow','backroomsGrain','backroomsFlicker','prefers-reduced-motion','grain.toDataURL','gl.uniform1f(loc.fog,30)'])assert.ok(html.includes(phrase));
});
test('distance-linked creature drone, terminal feedback, and carpet footsteps share mute controls',()=>{
 for(const phrase of ['dreadBus','dreadFilter','sound(\'terminal\')',"'complete':'success'",'audioMuted','playFootstep(running)'])assert.ok(html.includes(phrase));
});
