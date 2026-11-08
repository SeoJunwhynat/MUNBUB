/**
 * Matchunbeom Backrooms spelling monster v3.21 — split four-arm support/threat chase, world-anchored foot/rear-hand IK and player-locked head gaze.
 * Authoritative position/AI belongs to the existing multiplayer server.
 * Three.js renderer required. All contact adjustments happen after AnimationMixer.update.
 * Uses +Y up and +Z model forward, consistent with the supplied v3.6 GLB.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const deltaAngle=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
const vec=(p)=>p?.isVector3?p.clone():new THREE.Vector3(Number(p?.x)||0, Number(p?.y)||0, Number(p?.z)||0);
const ONCE = new Set(['Notice','Attack','Chase_Enter','Chase_Turn','Chase_Corner_Left','Chase_Corner_Right','Chase_Stop','Stun','Pivot','Transition']);
export const NOMINAL_SPEED = 2.05;
export const CLIPS = Object.freeze({
  Idle:'Idle',Patrol:'Patrol',Investigate:'Search',Detect:'Notice',
  ChaseEnter:'Chase_Enter',Chasing:'Chase_Loop',ChaseCornerLeft:'Chase_Corner_Left',
  ChaseCornerRight:'Chase_Corner_Right',ChaseStop:'Chase_Stop',Attacking:'Attack',Stunned:'Stun',Turn:'Pivot',Transition:'Transition'
});

/**
 * v3.21 contact rig: Only REAR Arm2_L/R and both feet can contact the ground.
 * Contact anchors are WORLD-space; front Arm1_L/R are never locked, preserving threat poses.
 * Ground callback must return WORLD y at the supplied world x/z, or 0 for a flat plane.
 */
class ContactSolver {
  constructor(model,{mobile=false,getFloorHeight=()=>0}={}) {
    this.model=model;this.floor=getFloorHeight;this.enabled=true;
    this.iterations=mobile?3:7;this.maxAngle=mobile?.12:.16;
    this.limbs=[];
    const add=(key,type,names,phase,height,chain)=>{
      const bones=names.map(n=>model.getObjectByName(n));
      if(bones.some(b=>!b?.isBone))return;
      this.limbs.push({key,type,bones,phase,height,chain,anchor:null,weight:0,error:0,stance:false});
    };
    for(const side of ['L','R']){
      const a=side==='L'?.08:.58;
      add(`${side}2`,'rearHand',['Clavicle','UpperArm_A','UpperArm_B','Elbow','Forearm_A','FlexMid','Forearm_B','FlexWrist','Wrist','Palm','Finger4_1','Finger4_2','Finger4_Tip'].map(n=>`${side}_Arm2_${n}`),a,.025,[8,7,5,3,2,1,0]);
      const b=side==='L'?.12:.62;
      add(`${side}Foot`,'foot',['Hip','Thigh','Knee','Shin','Ankle','Foot'].map(n=>`${side}_Leg_${n}`),b,.15,[4,2,1,0]);
    }
    this.eff=new THREE.Vector3();this.pivot=new THREE.Vector3();this.a=new THREE.Vector3();this.b=new THREE.Vector3();
    this.axis=new THREE.Vector3();this.rotation=new THREE.Quaternion();this.parentQ=new THREE.Quaternion();
    this.localQ=new THREE.Quaternion();this.invQ=new THREE.Quaternion();this.tmpScale=new THREE.Vector3();
    this.clock=0;
  }
  reset(){for(const l of this.limbs){l.anchor=null;l.weight=0;l.error=0;l.stance=false;}}
  contactWeight(l,mode,phase){
    // Front arms are never members of this solver. All anchors are world coordinates.
    if(mode==='none')return 0;
    if(mode==='brace'||mode==='attack')return 1;
    if(mode==='settle')return l.type==='foot'?1:.72;
    if(mode==='pivot'){
      if(l.type==='foot'||l.key==='L2')return 1;
      const lift=smoothstep(.17,.48,phase)*(1-smoothstep(.70,.94,phase));
      return 1-lift;
    }
    const u=((phase+l.phase)%1+1)%1;
    // Patrol and chase both actively alternate rear-hand support with foot plants.
    const rise=smoothstep(0,.07,u),fall=1-smoothstep(.43,.57,u);
    return rise*fall;
  }
  solve(l,target,blend){
    const joints=l.bones,eff=joints.at(-1);
    for(let pass=0;pass<this.iterations;pass++){
      for(const index of l.chain){
        const joint=joints[index];this.model.updateMatrixWorld(true);
        eff.getWorldPosition(this.eff);joint.getWorldPosition(this.pivot);
        this.a.subVectors(this.eff,this.pivot);this.b.subVectors(target,this.pivot);
        const la=this.a.length(),lb=this.b.length();if(la<1e-6||lb<1e-6)continue;
        this.a.multiplyScalar(1/la);this.b.multiplyScalar(1/lb);
        let angle=Math.acos(clamp(this.a.dot(this.b),-1,1));if(angle<.0008)continue;
        this.axis.crossVectors(this.a,this.b);const al=this.axis.length();if(al<1e-6)continue;
        this.axis.multiplyScalar(1/al);
        angle=Math.min(angle,this.maxAngle*blend*(index===0?.50:1));
        this.rotation.setFromAxisAngle(this.axis,angle);
        if(joint.parent){joint.parent.getWorldQuaternion(this.parentQ);}else this.parentQ.identity();
        this.invQ.copy(this.parentQ).invert();
        this.localQ.copy(this.invQ).multiply(this.rotation).multiply(this.parentQ);
        joint.quaternion.premultiply(this.localQ).normalize();
      }
      this.model.updateMatrixWorld(true);eff.getWorldPosition(this.eff);
      if(this.eff.distanceToSquared(target)<.0009)break;
    }
    this.model.updateMatrixWorld(true);eff.getWorldPosition(this.eff);
    l.error=this.eff.distanceTo(target);
  }
  update(mode,phase,dt){
    if(!this.enabled||mode==='none'){this.reset();return;}
    this.model.updateMatrixWorld(true);const scale=Math.abs(this.model.getWorldScale(this.tmpScale).y)||1;
    for(const l of this.limbs){
      const desired=this.contactWeight(l,mode,phase);
      // Release before the swing. Contact cannot be dragged around by the animation.
      if(desired<.025){l.anchor=null;l.stance=false;l.weight=0;l.error=0;continue;}
      const eff=l.bones.at(-1),p=eff.getWorldPosition(new THREE.Vector3());
      const ground=this.floor(p.x,p.z);const y=(Number.isFinite(ground)?ground:0)+l.height*scale;
      if(!l.anchor){l.anchor=new THREE.Vector3(p.x,y,p.z);}
      // Supports limited reach: replant instead of stretching an arm through the body.
      if(l.anchor.distanceTo(p)>1.20*scale){
        l.anchor.set(p.x,y,p.z);l.weight=0;
      }
      l.anchor.y+=(y-l.anchor.y)*Math.min(1,Math.max(dt,0)*7);
      l.weight=desired;l.stance=true;this.solve(l,l.anchor,desired);
    }
  }
  diagnostics(){return this.limbs.map(l=>({id:l.key,type:l.type,contact:l.stance,weight:+l.weight.toFixed(2),error:+l.error.toFixed(3)}));}
}
const smoothstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
export class SpellingMonsterV321 {
  static async load({url,scene,scale=1,mobile=false,getFloorHeight,loader}={}) {
    if(!url)throw new Error('3D 괴물 GLB 경로가 없습니다.');
    const gltf=await (loader??new GLTFLoader()).loadAsync(url);
    const obj=new SpellingMonsterV321(gltf,{scale,mobile,getFloorHeight});
    scene?.add(obj.root);
    return obj;
  }
  constructor(gltf,{scale=1,mobile=false,getFloorHeight}={}) {
    this.root=gltf.scene;this.root.scale.setScalar(scale);
    this.root.traverse(o=>{if(o.isSkinnedMesh){o.castShadow=!mobile;o.receiveShadow=!mobile;}});
    this.mixer=new THREE.AnimationMixer(this.root);
    this.clips=Object.fromEntries(gltf.animations.map(c=>[c.name,c]));
    this.actions=Object.fromEntries(gltf.animations.map(c=>[c.name,this.mixer.clipAction(c)]));
    this.state='Idle';this.name=null;this.action=null;this.attackPending=false;
    this.targetPos=new THREE.Vector3();this.hasTarget=false;this.lastSnap=null;
    this.heading=0;this.targetHeading=0;this.rawSpeed=0;this.speed=0;this.playback=1;
    this.cornerCooldown=0;
    this.contacts=new ContactSolver(this.root,{mobile,getFloorHeight});
    this.eyeBones=['EyeBall_L','EyeBall_R'].map(name=>this.root.getObjectByName(name));
    this.eyeLookTarget=null;this.eyeYawLimit=THREE.MathUtils.degToRad(13);this.eyePitchLimit=THREE.MathUtils.degToRad(9);
    this.eyeTargetYaw=[0,0];this.eyeTargetPitch=[0,0];
    this.headBone=this.root.getObjectByName('Head');this.gazeYaw=0;this.gazePitch=0;this.gazeWeight=0;
    this._headPos=new THREE.Vector3();this._headParentQ=new THREE.Quaternion();this._gazeDir=new THREE.Vector3();this._gazeAim=new THREE.Quaternion();
    this.lowerJaw=this.root.getObjectByName('Jaw');
    this.upperMouth=this.root.getObjectByName('UpperMouth');
    this.upperLipBones=['UpperLip_L','UpperLip_R'].map(n=>this.root.getObjectByName(n));
    this.lowerLipBones=['LowerLip_L','LowerLip_R'].map(n=>this.root.getObjectByName(n));
    this.eyelidBones=['UpperEyelid_L','UpperEyelid_R','LowerEyelid_L','LowerEyelid_R'].map(n=>this.root.getObjectByName(n));
    this.flexBones=['L','R'].flatMap(s=>[1,2].flatMap(i=>['FlexMid','FlexWrist'].map(t=>this.root.getObjectByName(`${s}_Arm${i}_${t}`))));
    this.mixer.addEventListener('finished',evt=>{
      const finished=evt.action?.getClip()?.name;
      if(finished!==this.name)return;
      if(finished==='Attack')this.play('Chasing',.22);
      else if(finished==='Pivot')this.play(this.speed>.28?'Patrol':'Idle',.24);
      else if(finished==='Chase_Enter'||finished.startsWith('Chase_Corner_')||finished==='Chase_Turn')this.play('Chasing',.17);
      else if(finished==='Chase_Stop')this.play('Investigate',.20);
    });
    this.play('Idle',0);
  }
  play(state,fade=.16){
    const clipName=CLIPS[state]??state, next=this.actions[clipName];
    if(!next)throw new Error(`애니메이션을 찾을 수 없습니다: ${clipName}`);
    if(this.action===next)return;
    const prev=this.action;
    next.enabled=true;next.reset().setEffectiveWeight(1);
    const single=ONCE.has(clipName);
    next.setLoop(single?THREE.LoopOnce:THREE.LoopRepeat,single?1:Infinity);
    next.clampWhenFinished=single;next.play();
    if(prev){if(fade>0)next.crossFadeFrom(prev,fade,true);else prev.stop();}
    this.action=next;this.name=clipName;this.state=state;
    // DO NOT reset anchors between Chase and Attack. This was the v3.6 contact-loss bug.
    if(!['Idle','Search','Notice','Transition','Stun','Pivot','Attack','Patrol','Chase_Loop','Chase','Chase_Enter','Chase_Turn','Chase_Corner_Left','Chase_Corner_Right','Chase_Stop'].includes(clipName))this.contacts.reset();
  }
  setState(state){
    if(state==='Turning'){this.play('Turn',.20);return;}
    if(this.name==='Attack'&&state==='Chasing'&&this.action?.isRunning())return;
    this.play(state);
  }
  /** Pass live player eye position in world coordinates, or null to use baked natural eye animation. */
  setLookTarget(position){this.eyeLookTarget=position==null?null:vec(position);}
  /**
   * Counter-rotate animated head yaw/pitch toward WORLD target, so lateral torso/head swing
   * is still visible but the face's focal direction stays attached to the moving player.
   * Call setLookTarget(player.position) each update (or clear on losing target).
   */
  updateHeadGaze(dt){
    const head=this.headBone;if(!head?.isBone)return;
    if(!this.eyeLookTarget){this.gazeWeight=0;return;}
    this.root.updateMatrixWorld(true);
    head.getWorldPosition(this._headPos);
    this._gazeDir.subVectors(this.eyeLookTarget,this._headPos);
    if(this._gazeDir.lengthSq()<.02)return;
    head.parent?.getWorldQuaternion(this._headParentQ);
    this._gazeDir.applyQuaternion(this._headParentQ.clone().invert()).normalize();
    const yy=clamp(Math.atan2(this._gazeDir.x,this._gazeDir.z),-.60,.60);
    const xx=clamp(-Math.atan2(this._gazeDir.y,Math.hypot(this._gazeDir.x,this._gazeDir.z)),-.32,.32);
    const k=1-Math.exp(-12*Math.max(0,dt));
    this.gazeYaw=lerp(this.gazeYaw,yy,k);this.gazePitch=lerp(this.gazePitch,xx,k);
    this.gazeWeight=lerp(this.gazeWeight,1,k);
    this._gazeAim.setFromEuler(new THREE.Euler(this.gazePitch,this.gazeYaw,0,'YXZ'));
    // Only remove most of baked yaw/pitch jitter. Preserve some roll/sway for horror character.
    head.quaternion.slerp(this._gazeAim,.88*this.gazeWeight).normalize();
    this.root.updateMatrixWorld(true);
  }
  /** Mild independent eye tracking on top of head counter-motion. */
  updateEyeTracking(dt){
    if(!this.eyeLookTarget||this.eyeBones.some(b=>!b?.isBone))return;
    const head=this.root.getObjectByName('Head');if(!head)return;
    this.root.updateMatrixWorld(true);const target=head.worldToLocal(this.eyeLookTarget.clone());
    for(let i=0;i<this.eyeBones.length;i++){const eye=this.eyeBones[i];
      const direction=target.clone().sub(eye.position);const planar=Math.hypot(direction.x,direction.z);
      if(planar<1e-5)continue;
      const yaw=clamp(Math.atan2(direction.x,direction.z),-this.eyeYawLimit,this.eyeYawLimit);
      const pitch=clamp(-Math.atan2(direction.y,planar),-this.eyePitchLimit,this.eyePitchLimit);
      const k=1-Math.exp(-7*Math.max(dt,0));
      this.eyeTargetYaw[i]=lerp(this.eyeTargetYaw[i],yaw,k);this.eyeTargetPitch[i]=lerp(this.eyeTargetPitch[i],pitch,k);
      eye.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(this.eyeTargetPitch[i],this.eyeTargetYaw[i],0,'YXZ'))).normalize();
    }
  }
  setPlaybackRate(rate){this.playback=clamp(Number(rate)||1,.2,3);}
  setServerSnapshot({position,heading,velocity,serverTime,aiState,teleport=false}={}){
    const p=vec(position),t=Number.isFinite(serverTime)?serverTime:performance.now();
    if(this.lastSnap&&!teleport){
      const dt=(t-this.lastSnap.t)/1000,dis=p.distanceTo(this.lastSnap.pos);
      if(dt>.018&&dt<1.5&&dis<3.5)this.rawSpeed=clamp(dis/dt,0,9);
      else if(dis>3.5){this.contacts.reset();this.root.position.copy(p);}
    }
    if(Number.isFinite(velocity?.x)&&Number.isFinite(velocity?.z))this.rawSpeed=Math.hypot(velocity.x,velocity.z);
    this.lastSnap={pos:p.clone(),t};this.targetPos.copy(p);
    if(!this.hasTarget||teleport){this.root.position.copy(p);this.contacts.reset();this.hasTarget=true;}
    if(Number.isFinite(heading))this.targetHeading=heading;
    else if(this.rawSpeed>.12){const d=p.clone().sub(this.root.position);if(d.lengthSq()>.0001)this.targetHeading=Math.atan2(d.x,d.z);}
    if(aiState)this.setState(aiState);
  }
  update(dt){
    dt=clamp(Number(dt)||0,0,.07);
    this.speed=lerp(this.speed,this.rawSpeed,1-Math.exp(-5*dt));
    const theta=deltaAngle(this.heading,this.targetHeading);
    this.heading+=clamp(theta,-2.4*dt,2.4*dt);this.root.rotation.y=this.heading;
    if(this.hasTarget)this.root.position.lerp(this.targetPos,1-Math.exp(-11*dt));
    this.cornerCooldown=Math.max(0,this.cornerCooldown-dt);
    if(this.state==='Chasing'&&this.cornerCooldown<=0&&Math.abs(theta)>.42&&this.speed>.4){
      this.cornerCooldown=1.1;this.play(theta>0?'ChaseCornerRight':'ChaseCornerLeft',.12);
    }
    const chasing=['Chase_Loop','Chase_Corner_Left','Chase_Corner_Right','Chase'].includes(this.name);
    if(this.action){
      // Attack plays at cinematic rate, independent of network movement speed.
      this.action.timeScale=chasing ? clamp(this.speed/NOMINAL_SPEED,.1,2.2)*this.playback : this.playback;
    }
    this.mixer.update(dt);
    const phase=this.action?.getClip()?this.action.time/this.action.getClip().duration:0;
    const mode=this.name==='Attack'?'attack':(chasing?'chase':(this.name==='Patrol'?'patrol':(['Idle','Search','Notice','Transition'].includes(this.name)?'brace':(this.name==='Pivot'?'pivot':(this.name==='Stun'?'settle':'none')))));
    // IK must run after mixer sampling AND root position/rotation updates.
    this.contacts.update(mode,phase,dt);
    this.updateHeadGaze(dt);
    this.updateEyeTracking(dt);
  }
  debug(){return {clip:this.name,state:this.state,serverSpeed:this.rawSpeed,filteredSpeed:this.speed,contacts:this.contacts.diagnostics(),headTrackingActive:!!this.eyeLookTarget,rearArmsSupporting:this.contacts.limbs.filter(l=>l.type==='rearHand').map(l=>l.key),eyesRigged:this.eyeBones.every(Boolean),jawRigged:!!this.lowerJaw,dualJawRigged:!!this.lowerJaw&&!!this.upperMouth,lipBonesRigged:this.upperLipBones.every(Boolean)&&this.lowerLipBones.every(Boolean),eyelidBonesRigged:this.eyelidBones.every(Boolean),armFlexRigged:this.flexBones.filter(Boolean).length};}
  setContactIK(on){this.contacts.enabled=!!on;if(!on)this.contacts.reset();}
  dispose(){this.mixer.stopAllAction();this.mixer.uncacheRoot(this.root);this.root.removeFromParent();}
}

// Backward-compatible exports for existing integrations.
export { SpellingMonsterV321 as SpellingMonsterV319, SpellingMonsterV321 as SpellingMonsterV318, SpellingMonsterV321 as SpellingMonsterV316, SpellingMonsterV321 as SpellingMonsterV314, SpellingMonsterV321 as SpellingMonsterV313, SpellingMonsterV321 as SpellingMonsterV39, SpellingMonsterV321 as SpellingMonsterV38 };
