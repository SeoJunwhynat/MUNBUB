import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../backrooms/index.html',import.meta.url),'utf8');

test('original two creature sounds stay embedded for roaming',()=>{
 const m=html.match(/const chaseSampleBase64=\{main:"([A-Za-z0-9+/=]+)",accent:"([A-Za-z0-9+/=]+)"\};/);
 assert.ok(m,'roaming sound data not found');
 const first=readFileSync(new URL('../backrooms/assets/sfx/chase_start_and_caught.mp3',import.meta.url));
 const second=readFileSync(new URL('../backrooms/assets/sfx/chase_random_stinger.mp3',import.meta.url));
 assert.deepEqual(Buffer.from(m[1],'base64'),first);
 assert.deepEqual(Buffer.from(m[2],'base64'),second);
 assert.match(html,/function playRoamingCue\(distance\)/);
 assert.match(html,/playSample\(key,\(key==='main'/);
});

test('three screams and ambient MP3s are fully embedded and match original files',()=>{
 const m=html.match(/const monsterNewAudioBase64=\{scream1:"([A-Za-z0-9+/=]+)",scream2:"([A-Za-z0-9+/=]+)",scream3:"([A-Za-z0-9+/=]+)",atmosphere:"([A-Za-z0-9+/=]+)"\};/);
 assert.ok(m,'new scream files missing');
 for(const [i,name] of ['scream1','scream2','scream3','atmosphere'].entries()) {
  const buffer=readFileSync(new URL('../backrooms/assets/sfx/'+name+'.mp3',import.meta.url));
  assert.deepEqual(Buffer.from(m[i+1],'base64'),buffer,`${name} differs from supplied audio`);
 }
 assert.match(html,/src\.loop=true/);
});

test('scream 1 is used for chase onset and caught jumpscare',()=>{
 assert.match(html,/const detected=enemy\.active&&enemy\.grace<=0/);
 assert.match(html,/playChaseCue\('start'\)/);
 assert.match(html,/playChaseCue\('caught'\)/);
 assert.match(html,/playSample\('scream1',kind==='caught'/);
 assert.match(html,/window\.__backroomsMonsterVisual\?\.attack\(\)/);
 assert.match(html,/jumpscareTimer=setTimeout\(\(\)=>finishEnd\(false\),1760\)/);
});

test('screams 2 and 3 alternate during chase and old sounds only play when roaming',()=>{
 assert.match(html,/lastChaseAccent==='scream2'\?'scream3':'scream2'/);
 assert.match(html,/nextChaseAccentAt=now\+5\+Math\.random\(\)\*8/);
 assert.match(html,/nextRoamAt=now\+11\+Math\.random\(\)\*14/);
 assert.match(html,/if\(chaseActive\)return false;/);
 assert.match(html,/if\(now-chaseOutSince>=3\.5\)/);
});

test('mute, blur and chase end stop one-shot effects',()=>{
 assert.match(html,/if\(audioMuted\)stopChaseVoices\(\)/);
 assert.match(html,/function stopChaseVoices\(\)\{stopVoices\(chaseVoiceSources\);stopVoices\(roamVoiceSources\);\}/);
 assert.match(html,/document\.addEventListener\('visibilitychange',\(\)=>\{if\(document\.hidden\)stopChaseVoices\(\);\}\)/);
});
