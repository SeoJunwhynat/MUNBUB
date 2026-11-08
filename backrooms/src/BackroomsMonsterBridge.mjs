/**
 * Backrooms animation state bridge. Visual-only: never decides collision, scoring
 * or whether a player has been caught.
 *
 * Attack is exclusively a death/jumpscare clip. Chase is exclusively pursuit.
 * One-shot clips are requested only on state entry and never restarted each frame.
 */
export const MONSTER_STATE_CLIPS=Object.freeze({
 idle:'Idle',patrol:'Patrol',search:'Search',notice:'Notice',
 chase:'Chase',attack:'Attack',stun:'Stun',pivot:'Pivot',transition:'Transition'
});
const ONCE=new Set(['Notice','Attack','Stun','Pivot','Transition']);
const NEXT_AFTER=Object.freeze({Notice:'Idle',Attack:'Idle',Stun:'Idle',Pivot:'Patrol',Transition:'Idle'});

/** Pure resolver; an attack may ONLY be selected on the actual catch scene. */
export function chooseMonsterAIState({game='playing',visible=true,chasing=false,noticed=false,
 searching=false,moving=false,stunned=false,pivoting=false,transitioning=false}={}){
 if(game==='jumpscare')return 'attack';
 if(!visible||game==='ended'||game==='menu'||game==='lobby'||game==='downed')return 'idle';
 if(stunned)return 'stun';
 if(chasing&&noticed)return 'notice';
 if(chasing)return 'chase';
 if(searching)return 'search';
 if(pivoting)return 'pivot';
 if(transitioning)return 'transition';
 if(moving)return 'patrol';
 return 'idle';
}

export class BackroomsMonsterBridge {
 constructor(monster){
  this.monster=monster;
  this.lastX=null;this.lastZ=null;
  this.requestedState='Idle';
  this.state=monster?.currentName||'Idle';
 }
 reset(){
  this.lastX=null;this.lastZ=null;
  this.requestedState='Idle';
  this.monster.setAnimation('Idle',{fade:.12,force:true});
  this.state=this.monster.currentName||'Idle';
 }
 update(enemy,dt,{aiState='patrol',visible=true}={}){
  if(!enemy||!Number.isFinite(enemy.x)||!Number.isFinite(enemy.z))return;
  const dx=this.lastX===null?0:enemy.x-this.lastX;
  const dz=this.lastZ===null?0:enemy.z-this.lastZ;
  const vx=dt>0?dx/dt:0,vz=dt>0?dz/dt:0;
  this.monster.sync({x:enemy.x,z:enemy.z,vx,vz,heading:enemy.yaw,visible});
  const next=MONSTER_STATE_CLIPS[aiState]||'Idle';
  const current=this.monster.currentName||this.state;
  // Looped actions should be restored if the mixer changed unexpectedly.
  // Never restart a one-shot on every render frame, even after its finished
  // event returns the mixer to Idle/Chase.
  if(next!==this.requestedState||(!ONCE.has(next)&&current!==next)){
   const options=ONCE.has(next)
    ?{fade:next==='Attack'?.05:.14,after:NEXT_AFTER[next]}
    :{fade:.18};
   const accepted=this.monster.setAnimation(next,options);
   if(accepted!==false)this.requestedState=next;
  }
  this.monster.update(dt);
  this.state=this.monster.currentName||next;
  this.lastX=enemy.x;this.lastZ=enemy.z;
 }
}
