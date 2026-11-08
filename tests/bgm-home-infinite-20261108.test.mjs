import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const code=readFileSync(new URL('../munbub_music_patch.js',import.meta.url),'utf8');
const home='Full_Tilt_Parade.mp3';
const infinite='Transit_at_Midnight.mp3';

function player(){
 const callbacks={};
 const audio={
  src:'',paused:true,volume:0,loop:false,loads:0,
  addEventListener(name,fn){callbacks[name]=fn},
  load(){this.loads++},
  play(){this.paused=false;return Promise.resolve()},
  pause(){this.paused=true},
  ended(){callbacks.ended?.()}
 };
 let section='home',route='home';
 let cfg={};
 const rank={open:false,dataset:{},querySelector(){return null}};
 const head={append(){}};
 const document={
  baseURI:'https://example.test/',hidden:false,head,
  getElementById(id){return id==='mb-ranked-dialog'?rank:null},
  querySelector(){return null},
  createElement(){return {style:{},append(){},setAttribute(){},addEventListener(){}}},
  addEventListener(){}
 };
 const window={
  __mbSelectedMenu(){return route},
  addEventListener(){},
 };
 const globals={
  window,document,bgmPlayer:audio,bgmArmed:true,bgmEnabled:true,bgmVolume:.28,
  get section(){return section},
  get store(){return {active:{cfg}}},
  URL,MutationObserver:class {observe(){}disconnect(){}},
  localStorage:{getItem(){return null},setItem(){}},
  queueMicrotask,clearInterval,setInterval(){return 1}
 };
 const context=vm.createContext(globals);
 vm.runInContext(code,context);
 return {audio,rank,window,
  go(view,menu,settings={}){section=view;route=menu;cfg=settings;window.syncBgm()},
  end(){audio.ended()}
 };
}

test('homepage starts with Full Tilt Parade when installed',()=>{
 const p=player();
 assert.match(p.audio.src,/Full_Tilt_Parade\.mp3$/);
 assert.equal(p.audio.volume,.28);
 assert.equal(p.audio.loop,false);
});

test('infinite mode starts Transit at Midnight when installed',()=>{
 const p=player();
 p.go('quiz','infinite',{infinite:true});
 assert.match(p.audio.src,/Transit_at_Midnight\.mp3$/);
});

test('ranked infinite uses the available theme; other ranked variants change mode',()=>{
 const p=player();
 p.rank.open=true;
 p.rank.dataset.mbRankedMode='infinite';
 p.window.syncBgm();
 assert.match(p.audio.src,/Transit_at_Midnight\.mp3$/);
 p.rank.dataset.mbRankedMode='hardcore';
 p.window.syncBgm();
 assert.doesNotMatch(p.audio.src,/Transit_at_Midnight\.mp3$/);
});

test('existing music remains in shuffled playlists after the first song',()=>{
 const p=player();
 assert.match(p.audio.src,/Full_Tilt_Parade\.mp3$/);
 p.end();
 assert.doesNotMatch(p.audio.src,/Full_Tilt_Parade\.mp3$/);
 p.go('quiz','infinite',{infinite:true});
 assert.match(p.audio.src,/Transit_at_Midnight\.mp3$/);
 p.end();
 assert.doesNotMatch(p.audio.src,/Transit_at_Midnight\.mp3$/);
 assert.equal(p.audio.loop,false);
});

test('one audio element only; unchanged mode does not reload music',()=>{
 const p=player();
 const loads=p.audio.loads;
 p.window.syncBgm();p.window.syncBgm();
 assert.equal(p.audio.loads,loads);
 assert.equal(p.audio.volume,.28);
});

test('music catalog filters missing MP3s before playback and disables unloaded choices',()=>{
 assert.match(code,/const PUBLISHED_BGM=new Set/);
 assert.match(code,/if\(!available\(t\)\)return false/);
 assert.match(code,/option\.disabled=!available\(candidate\)/);
 assert.match(code,/음원 미등록/);
 assert.ok(!code.includes("'assets/bgm/Full_Tilt_Parade.mp3'\n") || code.includes("PUBLISHED_BGM"));
});
