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

test('default homepage song is new Full Tilt Parade',()=>{
 const p=player();
 assert.match(p.audio.src,/Full_Tilt_Parade\\.mp3$/);
 assert.equal(p.audio.volume,.28);
 assert.equal(p.audio.loop,false);
});

test('regular infinite mode begins Transit at Midnight',()=>{
 const p=player();
 p.go('quiz','infinite',{infinite:true});
 assert.match(p.audio.src,/Transit_at_Midnight\\.mp3$/);
});

test('ranked infinite plays Transit, other ranked variants do not force it',()=>{
 const p=player();
 p.rank.open=true;
 p.rank.dataset.mbRankedMode='infinite';
 p.window.syncBgm();
 assert.match(p.audio.src,/Transit_at_Midnight\\.mp3$/);
 p.rank.dataset.mbRankedMode='hardcore';
 p.window.syncBgm();
 assert.doesNotMatch(p.audio.src,/Transit_at_Midnight\\.mp3$/);
});

test('existing music remains in shuffled playlists after the first song',()=>{
 const p=player();
 assert.match(p.audio.src,/Full_Tilt_Parade\\.mp3$/);
 p.end();
 assert.doesNotMatch(p.audio.src,/Full_Tilt_Parade\\.mp3$/);
 p.go('quiz','infinite',{infinite:true});
 assert.match(p.audio.src,/Transit_at_Midnight\\.mp3$/);
 p.end();
 assert.doesNotMatch(p.audio.src,/Transit_at_Midnight\\.mp3$/);
 assert.equal(p.audio.loop,false);
});

test('one audio element only; unchanged mode does not reload music',()=>{
 const p=player();
 const loads=p.audio.loads;
 p.window.syncBgm();p.window.syncBgm();
 assert.equal(p.audio.loads,loads);
 assert.equal(p.audio.volume,.28);
});
