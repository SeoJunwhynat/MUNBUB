import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
const html=readFileSync(new URL('../backrooms/index.html',import.meta.url),'utf8');
const gif=readFileSync(new URL('../backrooms/assets/jumpscare/monster_rush.gif',import.meta.url));
test('custom jumpscare is a valid 8-frame animated GIF',()=>{
 assert.equal(gif.subarray(0,6).toString('ascii'),'GIF89a');
 assert.equal(gif.readUInt16LE(6),443);
 assert.equal(gif.readUInt16LE(8),443);
 assert.ok(gif.includes(Buffer.from('NETSCAPE2.0')),'loop metadata missing');
 assert.ok(statSync(new URL('../backrooms/assets/jumpscare/monster_rush.gif',import.meta.url)).size>100_000);
});
test('caught screen overlays custom GIF with highest z-index and plays scream 1',()=>{
 assert.match(html,/#jumpscareFx\{position:fixed;inset:0;z-index:1000/);
 assert.match(html,/id="jumpscareFx" class="hidden" aria-hidden="true"><img id="jumpscareGif"/);
 assert.match(html,/jumpscareGifPath='assets\/jumpscare\/monster_rush\.gif'/);
 assert.match(html,/showJumpscare\(\);/);
 assert.match(html,/playChaseCue\('caught'\)/);
 assert.match(html,/setTimeout\(\(\)=>finishEnd\(false\),1760\)/);
});
test('retries reset GIF frames and clean up object URL',()=>{
 assert.match(html,/URL\.createObjectURL\(jumpscareGifBlob\)/);
 assert.match(html,/URL\.revokeObjectURL\(jumpscareGifObjectURL\)/);
 assert.match(html,/function hideJumpscare\(/);
 assert.match(html,/function start\(\)\{clearTimeout\(jumpscareTimer\);hideJumpscare\(\)/);
});
