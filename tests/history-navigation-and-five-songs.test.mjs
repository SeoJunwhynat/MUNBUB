import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';
import {mkdtemp,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {HISTORY_NEW_5_PACKS,installHistoryPacks} from '../scripts/install-history-music-packs.mjs';

const load=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
const five=HISTORY_NEW_5_PACKS.history_music_register_5_20261110.zip;

test('All history routes expose the same always-accessible quiz/museum/story/Matchunbeom switcher',()=>{
 const routes=['history-study.html','history-museum.html','history-story-v7.html','history-final-exam.html'];
 const js=load('history-quick-nav.js'),css=load('history-quick-nav.css');
 assert.doesNotThrow(()=>new Script(js));
 for(const r of routes){
  const html=load(r);
  assert.match(html,/history-quick-nav\.css/,'missing navigation CSS in '+r);
  assert.match(html,/history-quick-nav\.js/,'missing navigation JS in '+r);
 }
 for(const url of ['/history-study.html','/history-museum.html','/history-story-v7.html','/index.html','/']){
  assert.ok(js.includes('href:"'+url+'"'),'navigation missing '+url);
 }
 assert.match(js,/aria-current="page"/);
 assert.match(js,/document\.body\.prepend\(bar\)/);
 assert.match(js,/<details class="mb-quick-nav-mobile">/);
 assert.match(css,/position:sticky;top:0;z-index:9000/);
 assert.match(css,/@media\(max-width:790px\)/);
 assert.match(css,/:focus-visible/);
 assert.match(css,/max-height:calc\(100dvh - 75px\)/);
});
test('Navigation highlights the current app and exposes compact mobile mode links',()=>{
 const js=load('history-quick-nav.js');
 const made=[];
 for(const route of ['/history-museum.html','/history-story-v7.html','/history-study.html']){
  const events={};
  const document={
   readyState:'loading',addEventListener(name,cb){events[name]=cb},
   getElementById(){return null},
   createElement(){const node={innerHTML:'',setAttribute(){},querySelector(){return {open:false}},className:''};made.push(node);return node},
   body:{prepend(x){made.push({inserted:x})}}
  };
  const context={document,location:{pathname:route}};
  runInNewContext(js,context);
  assert.equal(typeof events.DOMContentLoaded,'function');
  events.DOMContentLoaded();
  const generated=made.at(-1).inserted.innerHTML;
  assert.match(generated,/aria-current="page"/);
  assert.match(generated,/<details class="mb-quick-nav-mobile">/);
  made.length=0;
 }
});
test('Music archive contains five distinct SHA-verified recordings; previously missing tracks use canonical names',async()=>{
 assert.equal(Object.keys(HISTORY_NEW_5_PACKS).length,1);
 assert.equal(five.length,5);
 assert.equal(new Set(five.map(x=>x[0])).size,5);
 assert.equal(new Set(five.map(x=>x[2])).size,5);
 for(const [file,size,sha] of five){
  assert.match(file,/^[A-Za-z0-9_-]+\.mp3$/);
  assert.ok(size>=2000000);
  assert.match(sha,/^[a-f0-9]{64}$/);
 }
 for(const file of ['Afternoon_in_a_Seoul_Teahouse.mp3','Questions_in_the_Gallery.mp3',
  'The_Clockmaker_s_Ledger.mp3','Last_Page_Turned.mp3','Flowers_Beneath_the_Wall.mp3'])
  assert.ok(five.some(x=>x[0]===file));
 const dir=await mkdtemp(join(tmpdir(),'history-music-pending-'));
 try{
  await mkdir(join(dir,'assets','bgm','_incoming'),{recursive:true});
  const result=await installHistoryPacks(dir,{log(){}},HISTORY_NEW_5_PACKS);
  assert.deepEqual(result,{installed:0,awaiting:5},'do not report files as installed until user ZIP exists');
 }finally{await rm(dir,{recursive:true,force:true})}
});
test('New fifth track is in both shared playlists, build reads separate five-pack and never falsely publishes missing music',()=>{
 const korean=load('munbub_music_patch.js'),history=load('history-study-audio.js'),build=load('scripts/assemble-supplied-bgm.mjs');
 for(const name of ['Afternoon_in_a_Seoul_Teahouse.mp3','Questions_in_the_Gallery.mp3','The_Clockmaker_s_Ledger.mp3','Last_Page_Turned.mp3','Flowers_Beneath_the_Wall.mp3']){
  assert.ok(korean.includes(name),'missing Matchunbeom track '+name);
  assert.ok(history.includes(name),'missing history quiz track '+name);
 }
 assert.match(build,/HISTORY_NEW_5_PACKS/);
 assert.match(build,/installHistoryPacks\(root,console,HISTORY_NEW_5_PACKS\)/);
 assert.match(build,/BGM five-track registration/);
 assert.match(history,/installedFiles/);
 assert.match(korean,/PUBLISHED_BGM/);
 assert.match(build,/readdir\(bgmDir/);
});
