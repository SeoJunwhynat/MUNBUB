import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script,runInNewContext} from 'node:vm';
const load=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

test('History quiz loads standalone audio controls and sound settings without touching the narrative game',()=>{
 const html=load('history-study.html');
 assert.match(html,/<button class="tab" id="historySettingsTab"/);
 assert.match(html,/history-study-audio\.css/);
 assert.match(html,/history-study-audio\.js/);
 assert.ok(html.indexOf('history-study-app.js')<html.indexOf('history-study-audio.js'));
 assert.match(load('history-study-matchun-ui.js'),/data-history-audio="open"/);
 assert.ok(!html.includes('history-v8-3d.js'));
});

test('History audio reads exactly the existing published Matchunbeom BGM catalog, never 404 placeholder tracks',()=>{
 const s=load('history-study-audio.js');
 assert.doesNotThrow(()=>new Script(s));
 assert.match(s,/\/assets\/bgm\/catalog\.json/);
 assert.match(s,/history_study_audio_v2/);
 assert.match(s,/fetch\(CATALOG,\{cache:'no-store'\}\)/);
 assert.match(s,/installedFiles\.has\(file\)\?'재생 가능':'서버 등록 대기'/);
 assert.match(s,/function chooseIndex\(/);
 assert.match(s,/function next\(/);
 assert.match(s,/audio\.addEventListener\('ended'/);
 assert.match(s,/\.filter\(x=>!excluded\.test\(x\)\)/);
 assert.match(s,/encodeURIComponent\(nowTrack\(\)\)/);
 const original=load('munbub_music_patch.js');
 assert.match(original,/assets\/bgm\/catalog\.json/);
 assert.match(load('scripts/assemble-supplied-bgm.mjs'),/BGM catalog OK/);
});

test('Settings include playback, track picker, individual BGM/SFX volumes, shuffle, persistence and mobile-friendly CSS',()=>{
 const script=load('history-study-audio.js'),css=load('history-study-audio.css');
 const actions={};
 const ctx={
   window:{},document:{readyState:'loading',addEventListener(name,fn){actions[name]=fn},getElementById(){return null}},
   localStorage:{getItem(){return null},setItem(){}},console
 };
 runInNewContext(script,ctx);
 const state=ctx.window.MB_HISTORY_AUDIO.getState();
 assert.equal(state.active,false);
 assert.equal(state.ready,false);
 assert.ok(state.settings.bgmVolume>0);
 assert.ok(state.settings.sfxVolume>0);
 for(const id of ['historyBgmVolume','historySfxVolume','historySfxEnable','historyBgmEnable',
 'historyShuffle','historyTrackChoice','historySoundDialog','historyAudioPlay','historyAudioNext',
 'historySoundClose','historyAudioReset','historyMiniBgm']){
   assert.ok(script.includes(id),'missing sound control: '+id);
 }
 assert.match(script,/AudioContext/);
 assert.match(script,/tone\(result\.classList\.contains\('good'\)\?'correct':'wrong'\)/);
 assert.match(css,/@media\(max-width:560px\)/);
 assert.match(css,/:focus-visible/);
 assert.match(css,/history-sound-dialog/);
 assert.match(css,/history-audio-mini/);
 assert.ok(typeof actions.DOMContentLoaded==='function');
});

test('New tracks are registered as available only after asset registration; Korean original tracks remain unaffected',()=>{
 const s=load('history-study-audio.js'),shared=load('munbub_music_patch.js');
 for(const f of ['Afternoon_in_a_Seoul_Teahouse.mp3','Questions_in_the_Gallery.mp3',
                   'The_Clockmaker_s_Ledger.mp3','Last_Page_Turned.mp3'])assert.ok(s.includes(f));
 assert.match(s,/if\(!ready\)/);
 assert.match(s,/if\(!playlist\.length\)/); // intentional: if missing, UI stays non-playable.
 assert.doesNotMatch(s,/document\.addEventListener\('pointerdown'[^;]*start\(/);
 assert.match(shared,/PUBLISHED_BGM/);
 assert.match(shared,/function playlist\(m\)/);
});
