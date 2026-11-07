import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BackroomsMonsterBridge,chooseMonsterAIState,MONSTER_STATE_CLIPS} from '../backrooms/src/BackroomsMonsterBridge.mjs';

function rig(){
 const calls=[];
 const model={
  currentName:'Idle',
  sync(data){this.position=data;},
  setAnimation(name,options={}){calls.push({name,options});this.currentName=name;return true;},
  update(dt){this.elapsed=(this.elapsed||0)+dt;}
 };
 return {model,calls,bridge:new BackroomsMonsterBridge(model)};
}
const enemy={x:12,z:8};
const frame={game:'playing',visible:true};

test('nine source animation roles exist and the source GLB contains distinct Chase/Attack clips',()=>{
 for(const name of ['Idle','Patrol','Search','Notice','Chase','Attack','Stun','Pivot','Transition'])
  assert.ok(Object.values(MONSTER_STATE_CLIPS).includes(name));
 const glb=readFileSync(new URL('../backrooms/assets/monsters/spelling_monster_v3.glb',import.meta.url));
 assert.equal(glb.toString('ascii',0,4),'glTF');
 const jsonLength=glb.readUInt32LE(12);
 const gltf=JSON.parse(glb.subarray(20,20+jsonLength).toString('utf8'));
 const clips=new Map(gltf.animations.map(x=>[x.name,x]));
 assert.equal(clips.size,9);
 assert.notDeepEqual(clips.get('Chase').channels,clips.get('Attack').channels);
 assert.ok(clips.get('Chase').channels.length>0);
 assert.ok(clips.get('Attack').channels.length>0);
});

test('state resolver: correct distinct clips for idle, patrol, search, notice, chase and attack',()=>{
 assert.equal(chooseMonsterAIState({...frame,moving:false}), 'idle');
 assert.equal(chooseMonsterAIState({...frame,moving:true}), 'patrol');
 assert.equal(chooseMonsterAIState({...frame,moving:true,searching:true}), 'search');
 assert.equal(chooseMonsterAIState({...frame,moving:true,chasing:true,noticed:true}), 'notice');
 assert.equal(chooseMonsterAIState({...frame,moving:true,chasing:true}), 'chase');
 assert.equal(chooseMonsterAIState({...frame,moving:true,chasing:true,game:'jumpscare'}), 'attack');
 assert.equal(chooseMonsterAIState({...frame,moving:true,chasing:true,game:'ended'}), 'idle');
 assert.equal(chooseMonsterAIState({...frame,chasing:true,visible:false}), 'idle');
});

test('optional clips only play in their explicit gameplay states',()=>{
 assert.equal(chooseMonsterAIState({...frame,stunned:true,chasing:true}), 'stun');
 assert.equal(chooseMonsterAIState({...frame,pivoting:true,moving:true}), 'pivot');
 assert.equal(chooseMonsterAIState({...frame,transitioning:true,moving:true}), 'transition');
 assert.notEqual(chooseMonsterAIState({...frame,chasing:true,attacking:true}),'attack');
});

test('bridge plays Chase continuously during pursuit, never Attack until actual death',()=>{
 const {bridge,model,calls}=rig();
 bridge.update(enemy,.016,{aiState:'patrol'});
 bridge.update({...enemy,x:12.2},.016,{aiState:'notice'});
 bridge.update({...enemy,x:12.4},.016,{aiState:'chase'});
 for(let i=0;i<30;i++)bridge.update({...enemy,x:12.4+i*.08},.016,{aiState:'chase'});
 assert.deepEqual(calls.map(x=>x.name),['Patrol','Notice','Chase']);
 assert.equal(model.currentName,'Chase');
});

test('Notice single-shot completion does not restart every frame',()=>{
 const {bridge,model,calls}=rig();
 bridge.update(enemy,.016,{aiState:'notice'});
 assert.equal(calls.at(-1).options.after,'Chase');
 model.currentName='Chase'; // Mixer finished Notice and selected fallback Chase.
 for(let i=0;i<20;i++)bridge.update(enemy,.016,{aiState:'notice'});
 assert.equal(calls.filter(x=>x.name==='Notice').length,1);
 bridge.update(enemy,.016,{aiState:'chase'});
 assert.equal(model.currentName,'Chase');
});

test('Attack is one-shot and only resets on leaving caught state',()=>{
 const {bridge,model,calls}=rig();
 bridge.update(enemy,.016,{aiState:'chase'});
 bridge.update(enemy,.016,{aiState:'attack'});
 model.currentName='Idle'; // Mixer finished Attack and returned to Idle.
 for(let i=0;i<100;i++)bridge.update(enemy,.016,{aiState:'attack'});
 assert.equal(calls.filter(x=>x.name==='Attack').length,1);
 assert.equal(calls.find(x=>x.name==='Attack').options.after,'Idle');
 bridge.update(enemy,.016,{aiState:'chase'});
 assert.equal(model.currentName,'Chase');
 assert.equal(bridge.state,'Chase');
});

test('visual controller uses the exclusive capture state and server-authoritative chase',()=>{
 const visual=readFileSync(new URL('../backrooms/src/BackroomsMonsterVisual.mjs',import.meta.url),'utf8');
 const html=readFileSync(new URL('../backrooms/index.html',import.meta.url),'utf8');
 assert.match(visual,/chooseMonsterAIState\(\{/);
 assert.match(visual,/if\(aiState==='attack'&&!this\.attacking\)this\.attack\(\)/);
 assert.doesNotMatch(visual,/game==='jumpscare'\|\|this\.attacking/);
 assert.match(visual,/this\.controller\.setAnimationSpeed\(aiState==='chase'\?1\.3\*1\.3:1\.3\)/);
 assert.match(html,/chasing:online\.active\?!!enemy\.chasing/);
 assert.match(visual,/this\.bridge\.update\(enemy/);
});
