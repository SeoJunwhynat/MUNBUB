import * as THREE from 'three';
import {loadSpellingMonster} from './SpellingMonster.mjs';
import {BackroomsMonsterBridge} from './BackroomsMonsterBridge.mjs';

/**
 * Reuses the existing WebGL context/canvas and its depth buffer.
 * The custom maze draws FIRST; the GLB draws SECOND with autoClear=false.
 * This is not a second canvas/overlay: wall and model depth testing is shared.
 * Physics, monster AI, SSE and scoring remain in original code.
 */
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
    this.lastFrames=0;
    this.loading=this.load();
  }
  async load() {
    try {
      const url=new URL('../assets/monsters/spelling_monster_v3.glb',import.meta.url).href;
      this.controller=await loadSpellingMonster({url,targetHeight:2.90,floorOffset:0.09,castShadow:false});
      this.controller.setAnimationSpeed(1.3);
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
    this.noticeUntil=performance.now()+980;
    if(this.ready){this.controller.setAnimation('Notice',{fade:.08,after:'Chase'});this.state='Notice';}
  }
  attack(){
    this.attacking=true;
    if(this.ready){this.controller.setAnimation('Attack',{fade:.05,force:true,after:'Idle'});this.state='Attack';}
  }
  reset(){
    this.attacking=false;this.noticeUntil=0;
    if(this.ready){this.controller.setAnimation('Idle',{fade:.12});this.state='Idle';}
  }
  renderAfterWorld({enemy,player,eye,forward,dt,width,height,phase,game,chasing}) {
    if(!this.ready||!enemy||!player) return;
    const showing=enemy.grace<=0||game==='jumpscare'||game==='ended';
    let aiState='patrol';
    const dist=Math.hypot(enemy.x-player.x,enemy.z-player.z);
    if(!showing)aiState='idle';
    else if(game==='jumpscare'||this.attacking)aiState='attack';
    else if(performance.now()<this.noticeUntil)aiState='notice';
    else if(chasing)aiState='chase';
    else if(dist<28)aiState='search';
    // The single-shot animations must not be interrupted before finishing.
    if(aiState==='notice' && this.state!=='Notice') this.notice();
    if(aiState==='attack' && this.state!=='Attack') this.attack();
    if(aiState==='chase' && this.state==='Notice' && performance.now()<this.noticeUntil) aiState='notice';
    this.bridge.update(enemy,Math.min(dt,.09),{aiState,visible:showing});
    this.state=this.controller.currentName||this.state;
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
