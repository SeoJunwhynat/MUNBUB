import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../backrooms/index.html',import.meta.url),'utf8');
const server=readFileSync(new URL('../backrooms/server.js',import.meta.url),'utf8');
const visual=readFileSync(new URL('../backrooms/src/BackroomsMonsterVisual.mjs',import.meta.url),'utf8');
test('raw maze renderer resets GL state shared with Three.js so walls and ceilings do not vanish',()=>{
 assert.match(html,/gl\.disable\(gl\.CULL_FACE\)/);
 assert.match(html,/gl\.disable\(gl\.SCISSOR_TEST\)/);
 assert.match(html,/gl\.disable\(gl\.STENCIL_TEST\)/);
 assert.match(html,/gl\.frontFace\(gl\.CCW\)/);
});
test('every maze cell has a backup ceiling separated from main tiles to seal seams',()=>{
 assert.match(html,/Sealed ceiling behind all original ceiling tiles/);
 assert.match(html,/planeY\(m,xx,zz,xx\+CELL,zz\+CELL,HEIGHT\+\.025,2,-1\)/);
});
test('catch GIF decodes one-shot by dropping infinite loop extension and ignores delayed restarts',()=>{
 assert.match(html,/async function oneShotJumpscareGif\(blob\)/);
 assert.match(html,/NETSCAPE2\.0/);
 assert.match(html,/new Blob\(\[bytes\.subarray\(0,i\),bytes\.subarray\(i\+19\)\]/);
 assert.match(html,/if\(playback!==jumpscarePlaybackId\|\|game!=='jumpscare'/);
 assert.doesNotMatch(html,/img\.src=jumpscareGifPath\+'\?replay='/);
});
test('solo and co-op movement and GLB animation all use 1.3x multiplier',()=>{
 assert.match(html,/nav\.MONSTER_CHASE_SPEED/);
 assert.match(server,/Nav\.MONSTER_CHASE_SPEED/);
 assert.match(visual,/this\.controller\.setAnimationSpeed\(1\.3\)/);
});
