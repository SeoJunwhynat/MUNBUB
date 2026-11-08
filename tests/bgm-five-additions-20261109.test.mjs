import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const js=readFileSync(new URL('../munbub_music_patch.js',import.meta.url),'utf8');
const assembler=readFileSync(new URL('../scripts/assemble-supplied-bgm.mjs',import.meta.url),'utf8');

test('all five provided songs are in the shared BGM catalog',()=>{
 const entries=[
  ['peppermint','Peppermint_Pursuit.mp3'],
  ['hearth','Gathered_by_the_Hearth.mp3'],
  ['seasons','The_Quiet_Between_Seasons.mp3'],
  ['warmnight','Warm_Winter_Night.mp3'],
  ['pumpkin','Moonlight_Pumpkin_Sprint.mp3']
 ];
 for(const [id,file] of entries){
  assert.match(js,new RegExp("\\['"+id+"','[^']+','assets/bgm/"+file.replaceAll('.','\\.')+"'\\]"));
 }
 assert.doesNotThrow(()=>new Script(js));
});
test('new songs rotate on Home and all regular, high, infinite and duel playlists',()=>{
 assert.match(js,/HOME\.push\(\.\.\.SEASONAL_BGM\)/);
 assert.match(js,/BASIC\.push\(\.\.\.SEASONAL_BGM\)/);
 assert.match(js,/HIGH\.push\(\.\.\.SEASONAL_BGM\)/);
 assert.match(js,/INFINITE\.push\(\.\.\.SEASONAL_BGM\)/);
 assert.match(js,/m==='duel'\?\[TRACKS\.duel,\.\.\.SEASONAL_BGM\]/);
 assert.match(js,/m==='home'&&t\[0\]===homeChoice/);
 assert.match(js,/const BACKROOMS_MENU_TRACKS=new Set\(\['vhs','dreamcore'\]\)/);
});
test('Render will enable newly uploaded MP3s only when files exist',()=>{
 assert.match(assembler,/readdir\(bgmDir,\{withFileTypes:true\}\)/);
 assert.match(js,/fetch\('\/assets\/bgm\/catalog\.json'/);
 assert.match(js,/option\.disabled=!available\(candidate\)/);
 assert.match(js,/if\(!available\(t\)\)return false/);
});
