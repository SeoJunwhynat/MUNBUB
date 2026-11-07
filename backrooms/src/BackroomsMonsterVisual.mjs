import * as THREE from 'three';
import {loadSpellingMonster} from './SpellingMonster.mjs';
import {BackroomsMonsterBridge,chooseMonsterAIState} from './BackroomsMonsterBridge.mjs';

/**
 * Reuses the existing WebGL context/canvas and its depth buffer.
 * The custom maze draws FIRST; the GLB draws SECOND with autoClear=false.
 * This is not a second canvas/overlay: wall and model depth testing is shared.
 * Physics, monster AI, SSE and scoring remain in original code.
 */

/**
 * v3.6 model controller compatibility for the Backrooms' existing 3D scene.
 * The v3.6 source module is packaged with the supplied model assets; it is
 * loaded only if the new GLBs are present. Legacy v3 remains a safe fallback.
 */
function wrapV36(model){
  const stateMap={Idle:'Idle',Patrol:'Patrol',Search:'Investigate',
    Notice:'Detect',Chase:'Chasing',Attack:'Attacking',Stun:'Stunned',
    Pivot:'Chase_Turn',Transition:'Chase_Stop'};
  return {
    object:model.root,
    clips:Object.keys(model.clips).map(name=>({name})),
    currentName:'Idle',
    setAnimation(name,{fade=.18}={}){
      try{
        // Enter the chase ONCE; the source controller then starts Chase_Loop
        // and automatically selects corner clips with its four-hand IK.
        const state=name==='Chase'&&this.currentName!=='Chase'
          ?'ChaseEnter':(stateMap[name]||'Idle');
        if(name!==this.currentName||name==='Chase'&&model.actionName==='Chase_Stop')
          model.play(state,fade);
        this.currentName=name;
        return true;
      }catch(err){console.warn('v36 animation transition:',err);return false;}
    },
    sync({x,z,vx,vz,visible=true}={}){
      model.root.visible=visible;
      model.setServerSnapshot({
        position:{x:Number.isFinite(x)?x:0,y:.09,z:Number.isFinite(z)?z:0},
        velocity:{x:Number.isFinite(vx)?vx:0,z:Number.isFinite(vz)?vz:0},
        serverTime:performance.now()
      });
    },
    setAnimationSpeed(rate){model.setPlaybackRate(rate);},
    update(dt){model.update(dt);}
  };
}

export class BackroomsMonsterVisual {
  constructor(canvas, gl) {
    if (!gl || !canvas) throw Error('WebGL context not available');
    this.canvas=canvas;
    this.renderer=new THREE.WebGLRenderer({canvas,context:gl,antialias:true,alpha:false});
    this.renderer.autoClear=false;
    this.renderer.shadowMap.enabled=false;
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.scene=new THREE.Scene();
    this.scene.fog=new THREE.Fog(0x292a1c,18,49);
    this.scene.add(new THREE.HemisphereLight(0xffe6af,0x19170f,2.3));
    this.headlamp=new THREE.PointLight(0xffe8b5,12,17,2);
    this.scene.add(this.headlamp);
    this.camera=new THREE.PerspectiveCamera(73.91,1,0.065,96);
    this.ready=false;
    this.error=null;
    this.bridge=null;
    this.controller=null;
    this.state='Idle';
    this.noticeUntil=0;
    this.attacking=false;
    this.wasChasing=false;
    this.searchUntil=0;
    this.movingUntil=0;
    this.lastX=null;this.lastZ=null;
    this.lastFrames=0;
    this.loading=this.load();
  }
  async load() {
    try {
      // Native v3.6 loader and animation controller: PC high detail, mobile LOD2.
      // The original GLB stays available until the binary assets are uploaded.
      const mobile=!!(globalThis.matchMedia?.('(pointer:coarse)').matches
        ||globalThis.innerWidth<700);
      const variant=mobile?'spelling_monster_v36_lod2.glb':'spelling_monster_v36_high.glb';
      const v36url=new URL('../assets/monsters/'+variant,import.meta.url).href;
      this.usingV36=false;
      try{
        const {SpellingMonsterV36}=await import('./SpellingMonsterV36.mjs');
        const rig=await SpellingMonsterV36.load({
          url:v36url,scale:2.90/5.55,mobile,
          getFloorHeight:()=>0
        });
        this.controller=wrapV36(rig);
        this.usingV36=true;
        this.controller.setAnimationSpeed(1);
      }catch(v36Error){
        console.info('v3.6 asset not available: using the previous GLB safely.',v36Error);
        const url=new URL('../assets/monsters/spelling_monster_v3.glb',import.meta.url).href;
        this.controller=await loadSpellingMonster({url,targetHeight:2.90,floorOffset:0.09,castShadow:false});
        this.controller.setAnimationSpeed(1.3);
      }
      this.bridge=new BackroomsMonsterBridge(this.controller);
      this.scene.add(this.controller.object);
      this.controller.object.visible=false;
      this.ready=true;
      document.dispatchEvent(new CustomEvent('backrooms-monster-loaded',{detail:{animations:this.controller.clips.map(c=>c.name)}}));
    } catch(error) {
      this.error=error;
      console.warn('새 괴물 GLB 로딩 실패. 기존 임시 모델로 표시합니다.',error);
      document.dispatchEvent(new CustomEvent('backrooms-monster-error',{detail:{message:String(error)}}));
    }
  }
  notice() {
    // Event-only; the bridge is the ONE owner of animation actions.
    if(!this.attacking)this.noticeUntil=Math.max(this.noticeUntil,performance.now()+1200);
  }
  attack(){
    // Death/capture only. Do not latch this into the next gameplay state.
    if(this.attacking)return;
    this.attacking=true;
    this.noticeUntil=0;
    this.searchUntil=0;
  }
  reset(){
    this.attacking=false;
    this.noticeUntil=0;
    this.searchUntil=0;
    this.movingUntil=0;
    this.wasChasing=false;
    this.lastX=null;this.lastZ=null;
    if(this.ready){this.bridge.reset();this.state='Idle';}
  }
  renderAfterWorld({enemy,player,eye,forward,dt,width,height,phase,game,chasing,mode=null}) {
    if(!this.ready||!enemy||!player)return;
    const now=performance.now();
    const showing=enemy.grace<=0||game==='jumpscare'||game==='ended';
    const pursuing=!!chasing && enemy.grace<=0 && game!=='jumpscare' && game!=='ended';
    if(game!=='jumpscare'&&this.attacking){
      this.attacking=false;
      this.bridge.reset();
    }
    // Track network movement with a short hold to avoid flickering Patrol/Idle
    // between the multiplayer server's position broadcasts.
    if(this.lastX!==null&&Math.hypot(enemy.x-this.lastX,enemy.z-this.lastZ)>.008)
      this.movingUntil=now+480;
    this.lastX=enemy.x;this.lastZ=enemy.z;
    if(this.wasChasing&&!pursuing)this.searchUntil=now+2400;
    if(pursuing&&!this.wasChasing&&now>=this.noticeUntil)this.notice();
    if(!showing){this.noticeUntil=0;this.searchUntil=0;}
    const aiState=chooseMonsterAIState({
      game,visible:showing,chasing:pursuing,
      noticed:pursuing&&(mode==='notice'||(!mode&&now<this.noticeUntil)),
      searching:mode==='search'||(!mode&&now<this.searchUntil),
      moving:mode==='patrol'&&now<this.movingUntil
    });
    if(aiState==='attack'&&!this.attacking)this.attack();
    this.wasChasing=pursuing;
    // Existing global animation multiplier is 1.3x; the sight-based 30%
    // pursuit acceleration is mirrored by Chase playback to avoid foot sliding.
    if(!this.usingV36)this.controller.setAnimationSpeed(aiState==='chase'?(((5.75*1.05*.93)*1.08)*.8)/2.05:1.3);
    this.bridge.update(enemy,Math.min(dt,.09),{aiState,visible:showing});
    this.state=this.bridge.state;
    this.controller.object.visible=showing;
    if(!showing)return;
    // Rendering is on the SAME canvas and context, so the maze's depth buffer masks the rig.
    this.camera.aspect=width/Math.max(height,1);
    this.camera.fov=game==='jumpscare'?61:73.91;
    this.camera.updateProjectionMatrix();
    this.camera.position.set(...eye);
    this.camera.up.set(0,1,0);
    this.camera.lookAt(eye[0]+forward[0],eye[1]+forward[1],eye[2]+forward[2]);
    this.headlamp.position.set(...eye);
    this.headlamp.intensity=player.flash?12:5;
    // THREE's state cache must be reset after the raw WebGL maze draw.
    this.renderer.resetState();
    this.renderer.setViewport(0,0,width,height);
    this.renderer.render(this.scene,this.camera);
  }
}

export function setupBackroomsMonsterVisual(canvas,gl){return new BackroomsMonsterVisual(canvas,gl);}
