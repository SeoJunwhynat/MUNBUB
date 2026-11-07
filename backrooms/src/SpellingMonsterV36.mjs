/**
 * Spelling Monster v3.6 — visual-only animation controller for Backrooms.
 * Uses the original supplied GLB clips: notices, chase enter/loop/turns/stop,
 * attack, stun and roaming. Server alone controls movement/capture.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const NOMINAL_SERVER_SPEED=2.05;
export const REFERENCE_CYCLE_SECONDS=.96;
export const CLIP_MAP=Object.freeze({
 Idle:'Idle',Patrol:'Patrol',Investigate:'Search',Detect:'Notice',
 ChaseEnter:'Chase_Enter',Chasing:'Chase_Loop',
 ChaseCornerLeft:'Chase_Corner_Left',ChaseCornerRight:'Chase_Corner_Right',
 ChaseStop:'Chase_Stop',Attacking:'Attack',Stunned:'Stun',
 Pivot:'Pivot',Transition:'Transition'
});
const SINGLE=new Set(['Notice','Chase_Enter','Chase_Corner_Left',
 'Chase_Corner_Right','Chase_Stop','Attack','Stun','Pivot','Transition']);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const lerp=(a,b,t)=>a+(b-a)*t;
const turn=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));

class HandContactIK {
 constructor(root,{mobile=false,getFloorHeight=()=>0}={}){
  this.root=root;this.getFloorHeight=getFloorHeight;
  this.iterations=mobile?2:3;this.entries=[];
  const shifts={L1:0,R1:.5,L2:.26,R2:.76};
  for(const side of ['L','R'])for(const arm of [1,2]){
   const rootName=side+'_Arm'+arm+'_';
   const names=['Clavicle','UpperArm_A','UpperArm_B','Elbow',
     'Forearm_A','Forearm_B','Wrist','Palm'];
   const bones=names.map(name=>root.getObjectByName(rootName+name));
   if(bones.some(b=>!b?.isBone))continue;
   this.entries.push({bones,shift:shifts[side+arm],wasPlanted:false,anchor:null});
  }
  this.tip=new THREE.Vector3();this.joint=new THREE.Vector3();
  this.toTip=new THREE.Vector3();this.toGoal=new THREE.Vector3();
  this.axis=new THREE.Vector3();this.world=new THREE.Quaternion();
  this.inverse=new THREE.Quaternion();this.delta=new THREE.Quaternion();
 }
 reset(){for(const e of this.entries){e.wasPlanted=false;e.anchor=null;}}
 solve(e,target,blend){
  const bones=e.bones,palm=bones.at(-1);
  for(let cycle=0;cycle<this.iterations;cycle++)for(let i=bones.length-2;i>=1;i--){
   const bone=bones[i];this.root.updateMatrixWorld(true);
   palm.getWorldPosition(this.tip);bone.getWorldPosition(this.joint);
   this.toTip.copy(this.tip).sub(this.joint);
   this.toGoal.copy(target).sub(this.joint);
   if(this.toTip.lengthSq()<1e-8||this.toGoal.lengthSq()<1e-8)continue;
   this.toTip.normalize();this.toGoal.normalize();
   const angle=Math.acos(clamp(this.toTip.dot(this.toGoal),-1,1));
   if(angle<.0005)continue;
   this.axis.crossVectors(this.toTip,this.toGoal);
   if(this.axis.lengthSq()<1e-9)continue;
   this.axis.normalize();
   const step=Math.min(angle,(this.iterations===2?.13:.19)*blend);
   this.delta.setFromAxisAngle(this.axis,step);
   bone.parent.getWorldQuaternion(this.world);
   this.inverse.copy(this.world).invert();
   bone.quaternion.premultiply(
    this.inverse.multiply(this.delta).multiply(this.world)
   ).normalize();
  }
 }
 update(phase,moving){
  if(!moving){this.reset();return;}
  this.root.updateMatrixWorld(true);
  for(const e of this.entries){
   const cycle=((phase+e.shift)%1+1)%1;
   const planted=cycle<.60;
   if(planted&&!e.wasPlanted){
    const p=new THREE.Vector3();e.bones.at(-1).getWorldPosition(p);
    p.y=Math.max(this.getFloorHeight(p.x,p.z)+.13,p.y);
    e.anchor=p;
   }
   if(!planted)e.anchor=null;
   e.wasPlanted=planted;
   if(planted&&e.anchor){
    const edge=clamp(Math.min(cycle/.08,(.60-cycle)/.08),.25,1);
    this.solve(e,e.anchor,edge);
   }
  }
 }
}

export class SpellingMonsterV36 {
 static async load({url,scene,scale=1,loader,mobile=false,getFloorHeight}={}){
  if(!url)throw Error('Missing v3.6 GLB URL');
  const gltf=await (loader||new GLTFLoader()).loadAsync(url);
  const monster=new SpellingMonsterV36(gltf,{scale,mobile,getFloorHeight});
  scene?.add(monster.root);return monster;
 }
 constructor(gltf,{scale=1,mobile=false,getFloorHeight}={}){
  this.root=gltf.scene;
  this.root.scale.setScalar(scale);
  this.root.traverse(o=>{
   if(o.isSkinnedMesh){o.castShadow=!mobile;o.receiveShadow=!mobile;}
  });
  this.mixer=new THREE.AnimationMixer(this.root);
  this.actions=Object.fromEntries(gltf.animations.map(c=>[c.name,this.mixer.clipAction(c)]));
  this.clips=Object.fromEntries(gltf.animations.map(c=>[c.name,c]));
  for(const required of ['Idle','Patrol','Search','Notice','Chase_Enter',
    'Chase_Loop','Chase_Corner_Left','Chase_Corner_Right','Chase_Stop','Attack','Stun']){
   if(!this.actions[required])throw Error('GLB missing v3.6 animation: '+required);
  }
  this.action=null;this.actionName=null;this.state='Idle';
  this.hasServerPos=false;this.serverPos=new THREE.Vector3();
  this.lastSnapshot=null;this.measuredSpeed=0;this.filteredSpeed=0;
  this.heading=0;this.desiredHeading=0;this.userPlayback=1;
  this.cornerCooldown=0;
  this.ik=new HandContactIK(this.root,{mobile,getFloorHeight});
  this.mixer.addEventListener('finished',()=> {
   if(this.actionName==='Chase_Enter'||this.actionName?.startsWith('Chase_Corner_'))
    this.play('Chasing',.17);
   else if(this.actionName==='Chase_Stop')this.play('Investigate',.22);
  });
  this.play('Idle',0);
 }
 play(state,fade=.18){
  const clip=CLIP_MAP[state]||state,action=this.actions[clip];
  if(!action)throw Error('Unsupported v3.6 animation: '+clip);
  if(action===this.action)return;
  const last=this.action;
  action.enabled=true;action.reset().setEffectiveWeight(1);
  const once=SINGLE.has(clip);
  action.setLoop(once?THREE.LoopOnce:THREE.LoopRepeat,once?1:Infinity);
  action.clampWhenFinished=once;action.play();
  if(last){if(fade>0)action.crossFadeFrom(last,fade,true);else last.stop();}
  this.action=action;this.actionName=clip;this.state=state;this.ik.reset();
 }
 setPlaybackRate(rate){this.userPlayback=clamp(Number(rate)||1,.25,2.5);}
 setServerSnapshot({position,heading,velocity,serverTime,teleport=false}={}){
  const pos=new THREE.Vector3(Number(position?.x)||0,Number(position?.y)||0,Number(position?.z)||0);
  const now=Number.isFinite(serverTime)?serverTime:performance.now();
  if(this.lastSnapshot&&!teleport){
   const dt=(now-this.lastSnapshot.t)/1000;
   const traveled=pos.distanceTo(this.lastSnapshot.p);
   if(dt>.018&&dt<1.5&&traveled<3.5)this.measuredSpeed=clamp(traveled/dt,0,9);
   else if(traveled>3.5){this.ik.reset();this.root.position.copy(pos);}
  }
  if(Number.isFinite(velocity?.x)&&Number.isFinite(velocity?.z))
   this.measuredSpeed=Math.hypot(velocity.x,velocity.z);
  this.lastSnapshot={p:pos.clone(),t:now};this.serverPos.copy(pos);
  if(!this.hasServerPos||teleport){this.root.position.copy(pos);this.hasServerPos=true;}
  if(Number.isFinite(heading))this.desiredHeading=heading;
  else if(this.measuredSpeed>.1){
   const dir=pos.clone().sub(this.root.position);
   if(dir.lengthSq()>.0001)this.desiredHeading=Math.atan2(dir.x,dir.z);
  }
 }
 update(seconds){
  const dt=clamp(Number(seconds)||0,0,.07);
  if(this.hasServerPos)this.root.position.lerp(this.serverPos,1-Math.exp(-11*dt));
  this.filteredSpeed=lerp(this.filteredSpeed,this.measuredSpeed,1-Math.exp(-5*dt));
  const angle=turn(this.heading,this.desiredHeading);
  this.heading+=clamp(angle,-2.5*dt,2.5*dt);
  this.root.rotation.y=this.heading;
  this.cornerCooldown=Math.max(0,this.cornerCooldown-dt);
  if(this.state==='Chasing'&&this.cornerCooldown<=0&&Math.abs(angle)>.38&&this.filteredSpeed>.35){
   this.cornerCooldown=1.18;
   this.play(angle>0?'ChaseCornerRight':'ChaseCornerLeft',.10);
  }
  const locomotion=this.actionName==='Chase_Loop'||this.actionName?.startsWith('Chase_Corner_');
  if(this.action)this.action.timeScale=locomotion
   ?clamp(this.filteredSpeed/NOMINAL_SERVER_SPEED,.05,2.35)*this.userPlayback:this.userPlayback;
  this.mixer.update(dt);
  const clip=this.action?.getClip();
  const phase=clip?.duration?this.action.time/clip.duration:0;
  this.ik.update(phase,locomotion&&this.filteredSpeed>.15);
 }
 dispose(){this.mixer.stopAllAction();this.mixer.uncacheRoot(this.root);this.root.removeFromParent();}
}
