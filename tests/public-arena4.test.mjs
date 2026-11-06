import test from 'node:test';
import assert from 'node:assert/strict';
import {createRoom,perform,settle,view} from '../lib/mb-arena-engine.js';
const now=Date.now();
const members=Array.from({length:5},(_,i)=>({id:'p'+i,name:'선비'+i,title:'국어 새내기'}));
const settings={count:5,seconds:25,type:'mixed',form:'four'};
function setup(capacity=4){return createRoom({code:'ABCDEFGH',name:'4인 대전방',host:members[0],settings,capacity,
 questions:['s1','i001','s2','i002','s3'],now})}
function go(r,user,action,input={},at=now){return perform(r,user,action,input,at,()=>true)}
test('public room capacity is 4 and a fifth simultaneous participant is rejected',()=>{
 const r=setup();for(let i=1;i<4;i++)go(r,members[i],'join');
 assert.equal(r.players.length,4);assert.throws(()=>go(r,members[4],'join'),/정원/);
 assert.deepEqual(r.players.map(p=>p.id),['p0','p1','p2','p3']);
});
test('leaving lobby frees seat, wrong-member actions are forbidden',()=>{
 const r=setup();for(let i=1;i<4;i++)go(r,members[i],'join');
 go(r,members[2],'leave');assert.equal(r.players.length,3);
 go(r,members[4],'join');assert.equal(r.players.length,4);
 assert.throws(()=>go(r,members[2],'ready',{ready:true}),/참가자/);
 assert.equal(r.players[3].id,'p4');
});
test('only host may start, minimum two and every player must be ready',()=>{
 const r=setup();assert.throws(()=>go(r,members[0],'start'),/2명/);
 go(r,members[1],'join');go(r,members[2],'join');
 go(r,members[0],'ready',{ready:true});go(r,members[1],'ready',{ready:true});
 assert.throws(()=>go(r,members[0],'start'),/모두 준비/);
 go(r,members[2],'ready',{ready:true});
 assert.throws(()=>go(r,members[1],'start'),/방장만/);
 const x=go(r,members[0],'start');assert.equal(x.startedAt,now+5000);
 assert.equal(r.phase,'countdown');settle(r,now+5000);
 assert.equal(r.phase,'question');assert.equal(r.roundStartedAt,now+5000);
});
test('four server-graded answers advance together, no duplicate points, and return next round',()=>{
 const r=setup();for(let i=1;i<4;i++)go(r,members[i],'join');
 for(let i=0;i<4;i++)go(r,members[i],'ready',{ready:true});
 go(r,members[0],'start');settle(r,now+5000);
 for(let i=0;i<3;i++){
  const result=go(r,members[i],'answer',{index:0,answer:'sample'},now+6000+i);
  assert.equal(result.correct,true);assert.ok(result.points>0);
 }
 assert.equal(r.phase,'question');assert.throws(()=>go(r,members[0],'answer',{index:0,answer:'sample'},now+6005),/이미/);
 go(r,members[3],'answer',{index:0,answer:'sample'},now+6007);
 assert.equal(r.phase,'review');
 for(let i=0;i<3;i++)go(r,members[i],'reviewReady',{},now+7000);
 assert.equal(r.phase,'review');go(r,members[3],'reviewReady',{},now+7000);
 assert.equal(r.phase,'question');assert.equal(r.round,1);
 const first=view(r,'p0',now+7001);assert.equal(first.players.length,4);assert.equal(first.players[0].score,r.players[0].score);
 assert.equal(first.questionId,'i001');
});
test('timeout triggers review, then next round, and results rank all players',()=>{
 const r=setup(2);go(r,members[1],'join');
 for(let i=0;i<2;i++)go(r,members[i],'ready',{ready:true});
 go(r,members[0],'start');settle(r,now+5000);
 settle(r,now+31000);assert.equal(r.phase,'review');
 settle(r,now+36010);assert.equal(r.phase,'question');assert.equal(r.round,1);
 for(let round=1;round<5;round++){
  go(r,members[0],'answer',{index:round,answer:'abc'},r.roundStartedAt+1200);
  go(r,members[1],'answer',{index:round,answer:'abc'},r.roundStartedAt+1400);
  assert.equal(r.phase,'review');settle(r,r.reviewEndsAt+1);
 }
 assert.equal(r.phase,'finished');
 const state=view(r,'p0',now+100000);
 assert.equal(state.winnerIds.length,1);assert.equal(state.winnerIds[0],'p0');
});
test('departure during match prevents hanging and private rooms are not changed',()=>{
 const r=setup(2);go(r,members[1],'join');
 go(r,members[0],'ready',{ready:true});go(r,members[1],'ready',{ready:true});
 go(r,members[0],'start');settle(r,now+5000);
 go(r,members[1],'leave',{},now+6500);
 assert.equal(r.phase,'finished');assert.equal(view(r,'p0',now+6501).winnerIds[0],'p0');
 assert.equal(view(r,'p1',now+6501),null);
});
