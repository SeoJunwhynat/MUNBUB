import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html = readFileSync(new URL('../backrooms/index.html', import.meta.url),'utf8');

test('Backrooms soundscape has low air noise, mains hum and carpet steps',()=>{
 assert.match(html,/function buildNoiseBuffer\(/);
 assert.match(html,/\[\[60,\.031\],\[120,\.012\]/);
 assert.match(html,/function playFootstep\(running\)/);
 assert.match(html,/const moving=len>\.1&&Math\.hypot\(player\.x-oldPX,player\.z-oldPZ\)/);
});
test('WebAudio obeys play state, mute preference and tab visibility',()=>{
 assert.match(html,/const playing=game==='playing'&&!document\.hidden&&!audioMuted/);
 assert.match(html,/const quizBrowsing=/);
 assert.match(html,/dreadBus\.gain\.setTargetAtTime/);
 assert.match(html,/backrooms_audio_muted_v1/);
 assert.match(html,/document\.addEventListener\('visibilitychange',syncSoundscape\)/);
});
test('Audio controls exist in title, gameplay and pause UI',()=>{
 for(const id of ['audioToggle','menuAudioToggle','pauseAudioToggle'])
  assert.ok(html.includes(`id="${id}"`), `missing ${id}`);
 assert.match(html,/e\.code==='KeyV'/);
});
