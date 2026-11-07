import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
const html=readFileSync(new URL('../backrooms/index.html',import.meta.url),'utf8');
const bridge=readFileSync(new URL('../backrooms/src/BackroomsMonsterVisual.mjs',import.meta.url),'utf8');
const monster=readFileSync(new URL('../backrooms/src/SpellingMonster.mjs',import.meta.url),'utf8');

test('GLB model is present, properly sized and handled by 9-state rig',()=>{
 const glb=readFileSync(new URL('../backrooms/assets/monsters/spelling_monster_v3.glb',import.meta.url));
 assert.ok(glb.length>6000000);
 assert.equal(glb.toString('ascii',0,4),'glTF');
 assert.match(monster,/SPELLING_MONSTER_CLIPS/);
 assert.match(bridge,/targetHeight:2\.90/);
 for(const state of ['Idle','Patrol','Search','Notice','Chase','Attack','Stun','Pivot','Transition']) assert.ok(monster.includes(`'${state}'`));
});

test('model and maze share ONE WebGL canvas and a single depth buffer',()=>{
 assert.match(bridge,/new THREE\.WebGLRenderer\(\{canvas,context:gl/);
 assert.match(bridge,/this\.renderer\.autoClear=false/);
 assert.match(bridge,/this\.renderer\.resetState\(\)/);
 assert.match(html,/monsterVisual\.renderAfterWorld/);
 assert.match(html,/gl\.clear\(gl\.COLOR_BUFFER_BIT\|gl\.DEPTH_BUFFER_BIT\);draw\(staticBuf\)/);
 assert.doesNotMatch(bridge,/document\.createElement\('canvas'\)/);
});

test('game owns AI and collision, model is visual only with original fallback',()=>{
 assert.match(html,/function enemyPath\(goal\)/);
 assert.match(html,/function collides\(x,z\)/);
 assert.match(html,/nav\.route\(map,enemy,dest/);
 assert.match(html,/!window\.__backroomsMonsterVisual\?\.ready/);
 assert.match(bridge,/this\.bridge\.update\(enemy/);
 assert.match(html,/game==='jumpscare'/);
});
