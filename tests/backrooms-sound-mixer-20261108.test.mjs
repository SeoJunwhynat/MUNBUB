import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const html=readFileSync(new URL('../backrooms/index.html',import.meta.url),'utf8');
test('four independent sound settings appear in Backrooms settings with persistence',()=>{
 for(const name of ['Master','Bgm','Steps','Threat']){
  assert.match(html,new RegExp('id="soundVol'+name+'"'));
  assert.match(html,new RegExp('id="soundOut'+name+'"'));
 }
 assert.match(html,/backrooms_sound_mixer_v1/);
 assert.match(html,/slider\.addEventListener\('input'/);
});
test('music gain triples original .34 volume and respects audio master and mute',()=>{
 assert.match(html,/backroomsChaseBgm\.volume=\.34/);
 assert.match(html,/backroomsBgmGain\.gain\.value=\(3\/\.78\)\*soundPrefs\.bgm\/100/);
 assert.match(html,/musicSource\.connect\(backroomsBgmGain\)\.connect\(audioMaster\)/);
 assert.match(html,/audioMuted\?0:\.78\*soundPrefs\.master\/100/);
 assert.match(html,/if\(audioMuted\)\{stopChaseVoices\(\);stopBackroomsChaseBgm\(\);\}/);
});
test('step and monster volumes are independently adjustable',()=>{
 assert.match(html,/soundPrefs\.steps\/100/);
 assert.match(html,/volume\*=soundPrefs\.threat\/100/);
 assert.match(html,/soundPrefs\.threat===0/);
});
test('main inline game script remains valid JavaScript',()=>{
 const inline=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
 const plain=inline.find(([tag])=>!tag.includes('type='));
 assert.ok(plain);assert.doesNotThrow(()=>new Script(plain[1]));
});
