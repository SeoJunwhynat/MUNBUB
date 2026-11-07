import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../backrooms/index.html',import.meta.url),'utf8');

test('single RAF owner always re-arms after a render error or jumpscare retry',()=>{
 assert.match(html,/function ensureGameLoop\(\)/);
 assert.match(html,/gameFrameQueued=true/);
 assert.match(html,/try\{render\(ts\)\}/);
 assert.match(html,/finally\{ensureGameLoop\(\)\}/);
 assert.match(html,/function start\(\)\{clearTimeout\(jumpscareTimer\);hideJumpscare\(\);clearChaseState\(\)/);
 assert.match(html,/resetRunControls\(\)/);
 assert.match(html,/function start\([\s\S]*?ensureGameLoop\(\);lock\(\)/);
 assert.match(html,/function resumeCoopFromDowned\([\s\S]*?ensureGameLoop\(\);lock\(\)/);
 assert.equal((html.match(/requestAnimationFrame\(render\)/g)||[]).length,0);
});
test('reset state covers keys, virtual joystick, time, stamina and navigation',()=>{
 assert.match(html,/Object\.keys\(keys\)\.forEach/);
 assert.match(html,/joy\.x=0;joy\.y=0/);
 assert.match(html,/elapsed=online\.active\?Number\(online\.room\?\.elapsed\|\|0\):0/);
 assert.match(html,/stamina=100;player\.stamina=100;staminaExhausted=false/);
 assert.match(html,/enemy\.pathMode=null;enemy\.stuckTicks=0/);
});
test('death scream gain is 3x but pursuit cue stays unchanged',()=>{
 assert.match(html,/kind==='caught'\?\(0\.69\*3\):\.53/);
 assert.match(html,/limit:kind==='caught'/);
 assert.match(html,/audio\.createDynamicsCompressor/);
 assert.match(html,/const jumpscareGifPath='assets\/jumpscare\/monster_rush\.gif'/);
});
