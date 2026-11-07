/**
 * Matchunbeom Backrooms Creature v3.6 — network-aware movement and world-space
 * 4-hand contact stabilization for 90° hallway turns.
 * Existing game/server remains authoritative (this module only renders).
 * Uses Three.js ESM and GLTFLoader (same versions).
 * Coordinate convention: +Y up, model forward +Z, nominal server speed 2.05 u/s.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const NOMINAL_SERVER_SPEED = 2.05;
export const REFERENCE_CYCLE_SECONDS = 0.96;
export const CLIP_MAP = Object.freeze({
  Idle:'Idle', Patrol:'Patrol', Investigate:'Search', Detect:'Notice',
  ChaseEnter:'Chase_Enter', Chasing:'Chase_Loop',
  ChaseCornerLeft:'Chase_Corner_Left', ChaseCornerRight:'Chase_Corner_Right',
  ChaseStop:'Chase_Stop', Attacking:'Attack', Stunned:'Stun'
});
const SINGLE = new Set(['Chase_Enter','Chase_Corner_Left','Chase_Corner_Right','Chase_Stop','Notice','Attack','Stun']);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,t)=>a+(b-a)*t;
const signedAngle=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
const v3=(p)=>p?.isVector3?p.clone():new THREE.Vector3(Number(p?.x)||0,Number(p?.y)||0,Number(p?.z)||0);

class LiveHandContactIK {
  constructor(model,{getFloorHeight=()=>0,mobile=false,enabled=true}={}) {
    this.model=model;this.getFloorHeight=getFloorHeight;this.enabled=enabled;
    this.iterations=mobile?2:3;this.maxStep=mobile?.13:.19;
    this.entries=[];
    const shifts={L1:0,R1:.5,L2:.26,R2:.76};
    for(const side of ['L','R']) for(const arm of [1,2]) {
      const prefix=`${side}_Arm${arm}_`;
      const names=['Clavicle','UpperArm_A','UpperArm_B','Elbow','Forearm_A','Forearm_B','Wrist','Palm'];
      const nodes=names.map(n=>model.getObjectByName(prefix+n));
      if(nodes.some(n=>!n?.isBone)) continue;
      this.entries.push({id:`${side}${arm}`,nodes,shift:shifts[`${side}${arm}`],anchor:null,planted:false,
        contactError:0,wasContact:false});
    }
    this.tmp={end:new THREE.Vector3(),pivot:new THREE.Vector3(),toEnd:new THREE.Vector3(),toGoal:new THREE.Vector3(),
      parentRot:new THREE.Quaternion(),invParent:new THREE.Quaternion(),delta:new THREE.Quaternion(),local:new THREE.Quaternion(),axis:new THREE.Vector3()};
  }
  reset(){for(const e of this.entries){e.anchor=null;e.planted=false;e.wasContact=false;}}
  solve(e,target,blend=1){
    const {nodes}=e;const eff=nodes[nodes.length-1];const T=this.tmp;
    for(let iter=0;iter<this.iterations;iter++){
      // Preserve the mixer pose but adjust several real joints (CCD) toward the
      // world-locked contact. Never transform the whole creature mesh.
      for(let i=nodes.length-2;i>=1;i--){
        const joint=nodes[i];this.model.updateMatrixWorld(true);
        eff.getWorldPosition(T.end);joint.getWorldPosition(T.pivot);
        T.toEnd.copy(T.end).sub(T.pivot);T.toGoal.copy(target).sub(T.pivot);
        if(T.toEnd.lengthSq()<1e-7||T.toGoal.lengthSq()<1e-7)continue;
        T.toEnd.normalize();T.toGoal.normalize();
        const dot=clamp(T.toEnd.dot(T.toGoal),-1,1);
        let angle=Math.acos(dot);if(angle<.0005)continue;
        T.axis.crossVectors(T.toEnd,T.toGoal);
        if(T.axis.lengthSq()<1e-9)continue;
        T.axis.normalize();angle=Math.min(this.maxStep*blend,angle);
        T.delta.setFromAxisAngle(T.axis,angle);
        joint.parent.getWorldQuaternion(T.parentRot);
        T.invParent.copy(T.parentRot).invert();
        T.local.copy(T.invParent).multiply(T.delta).multiply(T.parentRot);
        joint.quaternion.premultiply(T.local).normalize();
      }
    }
    this.model.updateMatrixWorld(true);eff.getWorldPosition(T.end);
    e.contactError=T.end.distanceTo(target);
  }
  update(phase,isChasing){
    if(!this.enabled||!isChasing)return this.reset();
    this.model.updateMatrixWorld(true);
    for(const e of this.entries){
      const cyc=((phase+e.shift)%1+1)%1;
      const planted=cyc<.60;
      if(planted && !e.wasContact){
        // Capture the GLOBAL hand position, not its bone-relative position.
        const p=new THREE.Vector3();e.nodes[e.nodes.length-1].getWorldPosition(p);
        const floor=this.getFloorHeight(p.x,p.z);
        // Palm origin is above the fingertips, which are the physical floor pad.
        p.y=Math.max(floor+.13,p.y);
        e.anchor=p;e.planted=true;
      }
      if(!planted){e.anchor=null;e.planted=false;}
      e.wasContact=planted;
      if(planted&&e.anchor){
        // Ease contact near lifting; keep a fixed 3D world target through the
        // entire stationary hand-support interval while root turns.
        const edge=Math.min(cyc/.08,(.60-cyc)/.08,1);
        this.solve(e,e.anchor,clamp(edge,.25,1));
      }
    }
  }
  diagnostics(){return this.entries.map(e=>({limb:e.id,planted:e.planted,contactError:Number(e.contactError.toFixed(4))}));}
}

export class SpellingMonsterV36 {
  static async load({url,scene,scale=1,loader,mobile=false,getFloorHeight}={}) {
    if(!url)throw Error('GLB 모델 경로가 필요합니다.');
    const gltf=await (loader??new GLTFLoader()).loadAsync(url);
    const model=new SpellingMonsterV36(gltf,{scale,mobile,getFloorHeight});
    scene?.add(model.root);return model;
  }
  constructor(gltf,{scale=1,mobile=false,getFloorHeight}={}){
    this.root=gltf.scene;this.root.scale.setScalar(scale);
    this.root.traverse(o=>{if(o.isSkinnedMesh){o.castShadow=!mobile;o.receiveShadow=!mobile;}});
    this.mixer=new THREE.AnimationMixer(this.root);
    this.actions=Object.fromEntries(gltf.animations.map(a=>[a.name,this.mixer.clipAction(a)]));
    this.clips=Object.fromEntries(gltf.animations.map(a=>[a.name,a]));
    this.state='Idle';this.action=null;this.actionName=null;
    this.hasState=false;this.serverPos=new THREE.Vector3();this.hasServerPos=false;
    this.lastSnapshot=null;this.measuredSpeed=0;this.filteredSpeed=0;
    this.heading=0;this.desiredHeading=0;this.userPlayback=1;
    this.cornerCooldown=0;this.cornerDirection=0;
    this.ik=new LiveHandContactIK(this.root,{getFloorHeight,mobile});
    this.mixer.addEventListener('finished',event=>{
      const n=this.actionName;
      if(n==='Chase_Enter'||n.startsWith('Chase_Corner_'))this.play('Chasing',.17);
      else if(n==='Chase_Stop')this.play('Investigate',.22);
    });
    this.play('Idle',0);
  }
  play(state,fade=.18){
    const name=CLIP_MAP[state]??state;const next=this.actions[name];
    if(!next)throw Error(`GLB에 ${name} 클립이 없습니다.`);
    if(this.action===next)return;
    const previous=this.action;
    next.enabled=true;next.reset().setEffectiveWeight(1);
    const single=SINGLE.has(name);
    next.setLoop(single?THREE.LoopOnce:THREE.LoopRepeat,single?1:Infinity);
    next.clampWhenFinished=single;next.play();
    if(previous){if(fade>0)next.crossFadeFrom(previous,fade,true);else previous.stop();}
    this.action=next;this.actionName=name;this.state=state;this.ik.reset();
  }
  setState(state){if(state==='Turning')return;this.play(state);}
  setPlaybackRate(rate){this.userPlayback=clamp(Number(rate)||1,.25,2.5);}
  setServerSnapshot({position,heading,velocity,serverTime,aiState,teleport=false}={}){
    const pos=v3(position);const now=Number.isFinite(serverTime)?serverTime:performance.now();
    if(this.lastSnapshot&&!teleport){
      const dt=(now-this.lastSnapshot.t)/1000;
      const travel=pos.distanceTo(this.lastSnapshot.p);
      if(dt>.018&&dt<1.5&&travel<3.5){
        this.measuredSpeed=clamp(travel/dt,0,9); // use net displacement if no velocity included
      }else if(travel>3.5){this.ik.reset();this.root.position.copy(pos);}
    }
    if(Number.isFinite(velocity?.x)&&Number.isFinite(velocity?.z))
      this.measuredSpeed=Math.hypot(velocity.x,velocity.z);
    this.lastSnapshot={p:pos.clone(),t:now};this.serverPos.copy(pos);
    if(!this.hasServerPos||teleport){this.root.position.copy(pos);this.hasServerPos=true;}
    if(Number.isFinite(heading))this.desiredHeading=heading;
    else if(this.measuredSpeed>.1){const d=pos.clone().sub(this.root.position);if(d.lengthSq()>.0001)this.desiredHeading=Math.atan2(d.x,d.z);}
    if(aiState&&aiState!==this.state&&!(this.actionName?.startsWith('Chase_Corner_')&&aiState==='Chasing'))this.play(aiState);
  }
  update(dt){
    dt=clamp(Number(dt)||0,0,.07);
    const alpha=1-Math.exp(-11*dt);
    if(this.hasServerPos)this.root.position.lerp(this.serverPos,alpha);
    this.filteredSpeed=smooth(this.filteredSpeed,this.measuredSpeed,1-Math.exp(-5*dt));
    const angle=signedAngle(this.heading,this.desiredHeading);
    const rotationStep=clamp(angle,-2.5*dt,2.5*dt);this.heading+=rotationStep;
    this.root.rotation.y=this.heading;
    this.cornerCooldown=Math.max(0,this.cornerCooldown-dt);
    if(this.state==='Chasing'&&this.cornerCooldown<=0&&Math.abs(angle)>.38&&this.filteredSpeed>.35){
      this.cornerCooldown=1.18;
      this.cornerDirection=Math.sign(angle);
      this.play(this.cornerDirection>0?'ChaseCornerRight':'ChaseCornerLeft',.10);
    }
    const moving=this.actionName==='Chase_Loop'||this.actionName?.startsWith('Chase_Corner_');
    if(this.action){
      this.action.timeScale=moving?clamp(this.filteredSpeed/NOMINAL_SERVER_SPEED,0.05,2.35)*this.userPlayback:this.userPlayback;
    }
    this.mixer.update(dt);
    const phase=this.action?.getClip()?this.action.time/this.action.getClip().duration:0;
    // World-locked hands are applied AFTER mixer sampling and root rotation.
    this.ik.update(phase,moving&&this.filteredSpeed>.15);
  }
  debug(){return {state:this.state,clip:this.actionName,serverSpeed:this.measuredSpeed,filteredSpeed:this.filteredSpeed,heading:this.heading,handContact:this.ik.diagnostics()};}
  setContactIK(enabled){this.ik.enabled=!!enabled;this.ik.reset();}
  dispose(){this.mixer.stopAllAction();this.mixer.uncacheRoot(this.root);this.root.removeFromParent();}
}
