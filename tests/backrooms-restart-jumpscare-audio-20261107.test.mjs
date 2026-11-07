import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
const html=readFileSync(new URL('../backrooms/index.html',import.meta.url),'utf8');
const gif=readFileSync(new URL('../backrooms/assets/jumpscare/monster_rush.gif',import.meta.url));
test('attached GIF is exactly the asset used by the jumpscare',()=>{
 const bytes=Buffer.from('blob '+gif.length+'\0');
 const hash=createHash('sha1').update(bytes).update(gif).digest('hex');
 assert.equal(hash,'94590af43870307432b340d1378c24259ff98740');
 assert.match(html,/const jumpscareGifVersion='94590af43870'/);
 assert.match(html,/fetch\(jumpscareGifPath\+'\?v='\+jumpscareGifVersion/);
 assert.ok(statSync(new URL('../backrooms/assets/jumpscare/monster_rush.gif',import.meta.url)).size>500000);
});
test('retry resets life and monster state before gameplay is re-enabled',()=>{
 assert.match(html,/function start\(\)\{clearTimeout\(jumpscareTimer\);jumpscareTimer=null;hideJumpscare\(\)/);
 assert.match(html,/elapsed=online.active\?Number\(online.room\?\.elapsed\|\|0\):0;/);
 assert.match(html,/stamina=100;player.stamina=100;staminaExhausted=false/);
 assert.match(html,/enemy.path=\[\];enemy.pathGoal=null;enemy.pathMode=null/);
 assert.match(html,/lastGameFrameAt=last/);
});
test('game simulation keeps working if rendering fails or RAF suspends',()=>{
 assert.match(html,/function stepGameSimulation\(ts\)/);
 assert.match(html,/if\(game==='playing'\)\{/);
 assert.match(html,/try\{updateHUD\(Math\.hypot/);
 assert.match(html,/if\(now-lastGameFrameAt<=260\)return/);
 assert.match(html,/stepGameSimulation\(now\)/);
 assert.match(html,/gameFrameQueued=false;\s*lastGameFrameAt=now;\s*ensureGameLoop\(\)/);
});
test('caught cue gain triples, while passing through the existing limiter',()=>{
 assert.match(html,/const previousCaughtGain=\.69\*9/);
 assert.match(html,/const jumpscareBoost=3/);
 assert.match(html,/previousCaughtGain\*jumpscareBoost:\.53,\{limit:kind==='caught'\}/);
});
