/**
 * BACKROOMS / 맞춤법 괴물 v3 - Three.js visual adapter.
 * Requires `three` + `three/addons/loaders/GLTFLoader.js` resolved by your build or import map.
 * This is VISUAL ONLY. Keep monster AI, collisions, quest state and multiplayer authority
 * in your existing game/server. One instance for each visible monster.
 *
 *   const monster = await SpellingMonster.load({url:'/assets/monsters/spelling_monster_v3.glb'});
 *   scene.add(monster.object);
 *   monster.setAnimation('Patrol');
 *   monster.sync({x:12,z:8,vx:0,vz:1});
 *   monster.update(deltaSeconds);
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const SPELLING_MONSTER_CLIPS = Object.freeze([
  'Idle', 'Patrol', 'Search', 'Notice', 'Chase',
  'Attack', 'Stun', 'Pivot', 'Transition'
]);
const LOOPING = new Set(['Idle', 'Patrol', 'Search', 'Chase']);
const SINGLE_SHOT = new Set(['Notice', 'Attack', 'Stun', 'Pivot', 'Transition']);
const BASE_HEIGHT = 5.55; // approximate original model height in GLB meters

export class SpellingMonster {
  static async load({
    url = '/assets/monsters/spelling_monster_v3.glb',
    targetHeight = 2.90,  // suitable for ~3.35m Backrooms ceiling
    floorOffset = 0.09, // original source mesh extends slightly below Y=0
    castShadow = false,
    receiveShadow = false,
    loader = new GLTFLoader(),
    onProgress = null
  } = {}) {
    const gltf = await loader.loadAsync(url, onProgress || undefined);
    if (!gltf.scene) throw new Error('GLB scene missing');
    const monster = new SpellingMonster(gltf, {targetHeight, floorOffset, castShadow, receiveShadow});
    monster.setAnimation('Idle', {fade:0});
    return monster;
  }

  constructor(gltf, {targetHeight, floorOffset, castShadow, receiveShadow}) {
    this.object = new THREE.Group();
    this.object.name = 'SpellingMonster_v3';
    this.model = gltf.scene;
    this.model.name = 'RiggedSpellingMonster';
    this.object.add(this.model);
    this.scale = targetHeight / BASE_HEIGHT;
    this.model.scale.setScalar(this.scale);
    this.floorOffset = floorOffset;
    this.object.position.y = floorOffset;
    this.object.traverse(obj => {
      if (obj.isMesh) {obj.castShadow=castShadow; obj.receiveShadow=receiveShadow; obj.frustumCulled=false;}
    });
    this.mixer = new THREE.AnimationMixer(this.model);
    this.actions = new Map();
    this.clips = gltf.animations.slice();
    for(const clip of this.clips) this.actions.set(clip.name,this.mixer.clipAction(clip));
    this.current = null;
    this.currentName = null;
    this.fallbackName = 'Idle';
    this.disposed = false;
    this._onFinished = ({action}) => {
      if (this.disposed || action !== this.current) return;
      if (this.currentName && SINGLE_SHOT.has(this.currentName)) {
        this.setAnimation(this.fallbackName, {fade:0.18, force:true});
      }
    };
    this.mixer.addEventListener('finished',this._onFinished);
  }

  /** @param {'Idle'|'Patrol'|'Search'|'Notice'|'Chase'|'Attack'|'Stun'|'Pivot'|'Transition'} name */
  setAnimation(name, {fade=0.22, force=false, after=null} = {}) {
    if (this.disposed) return false;
    const next = this.actions.get(name);
    if (!next) {console.warn('Unknown creature animation:',name); return false;}
    if (!force && next === this.current) return true;
    if (after && this.actions.has(after)) this.fallbackName = after;
    const old=this.current;
    if(old && old !== next) old.fadeOut(Math.max(fade,0.001));
    next.enabled=true;
    next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1);
    next.setLoop(LOOPING.has(name)?THREE.LoopRepeat:THREE.LoopOnce, LOOPING.has(name)?Infinity:1);
    next.clampWhenFinished = SINGLE_SHOT.has(name);
    next.play();
    if(fade>0 && old!==next) next.fadeIn(fade);
    this.current=next; this.currentName=name;
    return true;
  }

  /** Set animation playback speed independent of world movement speed. */
  setAnimationSpeed(speed=1) {
    this.mixer.timeScale=THREE.MathUtils.clamp(Number(speed)||1,0.15,3);
  }

  /** Position in existing game world; heading is radians around +Y, where 0 faces +Z. */
  sync({x,z,y=0,heading=null,vx=null,vz=null,visible=true}={}) {
    if (this.disposed) return;
    if(Number.isFinite(x)) this.object.position.x=x;
    if(Number.isFinite(z)) this.object.position.z=z;
    this.object.position.y=(Number.isFinite(y)?y:0)+this.floorOffset;
    this.object.visible=visible!==false;
    if(Number.isFinite(heading)) this.object.rotation.y=heading;
    else if(Number.isFinite(vx)&&Number.isFinite(vz)&&Math.hypot(vx,vz)>0.05){
      this.object.rotation.y=Math.atan2(vx,vz); // native model's front = +Z
    }
  }

  /** dt = elapsed seconds from one render frame; update once per frame only. */
  update(dt) {
    if(!this.disposed && this.object.visible && Number.isFinite(dt) && dt>0)
      this.mixer.update(Math.min(dt,0.1));
  }

  /** Opt-in GPU wireframe visualization for inspection. */
  setWireframe(enabled) {
    this.object.traverse(obj=>{
      if(obj.isMesh){for(const m of Array.isArray(obj.material)?obj.material:[obj.material]){
        if(m && 'wireframe' in m) m.wireframe=Boolean(enabled);
      }}
    });
  }

  /** Releasing one model instance; do not share/dispose the same textures between controllers. */
  dispose() {
    if(this.disposed) return;
    this.mixer.removeEventListener('finished',this._onFinished);
    this.mixer.stopAllAction(); this.mixer.uncacheRoot(this.model);
    this.model.traverse(obj=>{
      if(!obj.isMesh) return;
      obj.geometry?.dispose();
      for(const m of Array.isArray(obj.material)?obj.material:[obj.material]){
        if(!m) continue;
        for(const k of ['map','normalMap','aoMap','roughnessMap','metalnessMap','emissiveMap','alphaMap'])m[k]?.dispose?.();
        m.dispose?.();
      }
    });
    this.object.removeFromParent();
    this.disposed=true;
  }
}

export async function loadSpellingMonster(options={}) {return SpellingMonster.load(options);}
