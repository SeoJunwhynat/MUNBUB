import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {Script} from 'node:vm';
import server from '../backrooms/server.js';

const html=readFileSync(new URL('../backrooms/index.html',import.meta.url),'utf8');
const relay=readFileSync(new URL('../backrooms/server.js',import.meta.url),'utf8');
const visual=readFileSync(new URL('../backrooms/src/BackroomsMonsterVisual.mjs',import.meta.url),'utf8');

test('monster stays absent before first correct answer; first error does not activate it',()=>{
 const map=Array.from({length:25},(_,z)=>Array.from({length:25},(_,x)=>x===0||z===0||x===24||z===24?1:0));
 const q={type:'quiz',kind:'spell',quizId:'q1',x:2,z:2,cooldownUntil:0,seenQuestionIds:['test-first'],
  question:{id:'test-first',q:'문장 ___',opts:['오답','정답'],accepted:[1],answer:1,exp:'풀이'}};
 const {room,p}=server.createRoom('Sound spawn test',{map,objects:[q],enemy:{x:46,z:46}},'unit-user');
 try{
  room.status='playing';p.x=10;p.z=10;room.enemy.grace=0;
  assert.equal(room.enemy.active,false);
  assert.equal(server.snapshot(room).enemy.active,false);
  server.tick();server.tick();
  assert.equal(room.enemy.mode,'idle');
  assert.deepEqual([room.enemy.x,room.enemy.z],[46,46]);
  const bad=server.handleAction(room,p,{type:'answer',quizId:'q1',choice:0,questionId:'test-first'});
  assert.equal(bad.correct,false);
  assert.equal(room.enemy.active,false);
  q.cooldownUntil=0;
  const newQuestion=q.question;
  const good=server.handleAction(room,p,{type:'answer',quizId:'q1',choice:newQuestion.accepted[0],questionId:newQuestion.id});
  assert.equal(good.correct,true);
  assert.equal(good.progress,1);
  assert.equal(room.enemy.active,true);
  assert.equal(server.snapshot(room).enemy.active,true);
  assert.equal(room.enemy.grace,0);
 }finally{
  server.rooms.delete(room.code);
 }
});

test('solo and co-op first-answer activation is not based on a start timer',()=>{
 assert.match(relay,/if\(!room\.enemy\.active\)\{room\.enemy\.active=true/);
 assert.match(relay,/room\.elapsed\+=dt;if\(!room\.enemy\.active\)/);
 assert.match(html,/if\(!online\.active&&!enemy\.active\)awakenMonsterAfterFirstAnswer\(\)/);
 assert.match(html,/if\(enemyAwakenedNow\)playDistantMonsterCry\(\)/);
 assert.match(html,/function playDistantMonsterCry\(\)/);
 assert.match(visual,/enemy\.active!==false/);
 assert.doesNotMatch(html,/enemy\.grace=28/);
});
test('no tracking bar, monster map marker or countdown; monster footfalls and heartbeat fade with distance',()=>{
 assert.match(html,/#hud #hudDanger,#hud\.hudLayoutEnabled #hudDanger\{display:none!important\}/);
 assert.doesNotMatch(html,/● 괴물/);
 assert.doesNotMatch(html,/a\.arc\(enemy\.x\/CELL\*S/);
 assert.match(html,/function playMonsterFootstep\(distance,chasing\)/);
 assert.match(html,/function playHeartbeat\(proximity\)/);
 assert.match(html,/syncMonsterPresenceAudio\(n,distance\)/);
 assert.match(html,/gain\.gain\.linearRampToValueAtTime\(Math\.max\(\.0001,\(running\?\.43:\.33\)\*soundPrefs\.steps\/100\)/);
});
test('BGM preloads and starts on notice/chase, in real user gesture context',()=>{
 const music=new URL('../backrooms/assets/sfx/The_Weight_Behind_You.mp3',import.meta.url);
 assert.ok(statSync(music).size>1000000);
 assert.match(html,/backroomsChaseBgm\.preload='auto'/);
 assert.match(html,/function beginChaseAudio\(\)/);
 assert.match(html,/if\(!chaseActive\)beginChaseAudio\(\)/);
 assert.match(html,/const detected=enemy\.active&&enemy\.grace<=0/);
 assert.match(html,/\['playing','quiz','map'\]\.includes\(game\)&&!audioMuted\)/);\n assert.match(html,/if\(chaseActive\)startBackroomsChaseBgm\(\)/);
 const rawScripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
 const main=rawScripts.find(([all])=>!all.includes('type='));
 assert.ok(main);assert.doesNotThrow(()=>new Script(main[1]));
});
