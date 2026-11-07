import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import Nav from '../backrooms/src/monster-nav.js';

const html=readFileSync(new URL('../backrooms/index.html',import.meta.url),'utf8');
const visual=readFileSync(new URL('../backrooms/src/BackroomsMonsterVisual.mjs',import.meta.url),'utf8');
test('new chase balance: speed is 0.8 of sprint; stamina drain is 0.775 previous',()=>{
 const sprint=(5.75*1.05*.93)*1.08;
 assert.equal(Nav.MONSTER_CHASE_SPEED,sprint*.8);
 assert.match(html,/stamina=Math\.max\(0,stamina-37\.2\*dt\)/);
 assert.match(html,/bottom:calc\(72px \+ env\(safe-area-inset-bottom,0px\)\)!important/);
 assert.match(html,/bottom:calc\(26dvh \+ 14px \+ env/);
 assert.match(html,/bottom:calc\(24px \+ env/);
});
test('new GLB loads high detail desktop or LOD2 mobile and falls back if assets missing',()=>{
 assert.match(visual,/spelling_monster_v36_high\.glb/);
 assert.match(visual,/spelling_monster_v36_lod2\.glb/);
 assert.match(visual,/SpellingMonsterV36\.mjs/);
 assert.match(visual,/wrapV36\(rig\)/);
 assert.match(visual,/spelling_monster_v3\.glb/);
 assert.match(visual,/ChaseEnter/);
 assert.match(visual,/getFloorHeight:\(\)=>0/);
});
test('supplied chase BGM starts on detection, loops and stops on exit/mute/background',()=>{
 assert.match(html,/new Audio\('assets\/sfx\/The_Weight_Behind_You\.mp3'\)/);
 assert.match(html,/backroomsChaseBgm\.loop=true/);
 assert.match(html,/if\(!aware\)return/);
 assert.match(html,/startBackroomsChaseBgm\(\)/);
 assert.match(html,/stopBackroomsChaseBgm\(\)/);
 assert.match(html,/if\(audioMuted\)stopBackroomsChaseBgm\(\)/);
 assert.match(html,/document\.hidden\)stopBackroomsChaseBgm\(\)/);
});
