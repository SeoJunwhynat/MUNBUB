/** Optional AI-to-visual state adapter. It does NOT calculate AI, collisions or networking. */
export class BackroomsMonsterBridge {
  constructor(monster){
    this.monster=monster;
    this.lastX=null;this.lastZ=null;
    this.state='Idle';
  }
  /**
   * enemy: {x,z,grace,phase} coordinates already expressed in METERS/world units.
   * aiState: one of idle, patrol, search, notice, chase, attack, stun, pivot.
   * dt is seconds; if your existing game has a separate state variable, pass it here.
   */
  update(enemy,dt,{aiState='patrol', visible=true}={}) {
    if(!enemy||!Number.isFinite(enemy.x)||!Number.isFinite(enemy.z))return;
    const dx=this.lastX===null?0:enemy.x-this.lastX;
    const dz=this.lastZ===null?0:enemy.z-this.lastZ;
    const vx=dt>0?dx/dt:0;
    const vz=dt>0?dz/dt:0;
    this.monster.sync({x:enemy.x,z:enemy.z,vx,vz,visible});
    const stateMap={idle:'Idle',patrol:'Patrol',search:'Search',notice:'Notice',chase:'Chase',attack:'Attack',stun:'Stun',pivot:'Pivot',transition:'Transition'};
    const next=stateMap[aiState]||'Idle';
    if(next!==this.state){this.monster.setAnimation(next);this.state=next;}
    // Animation playback may need calibrating to game speed to prevent sliding.
    this.monster.update(dt);
    this.lastX=enemy.x;this.lastZ=enemy.z;
  }
}
