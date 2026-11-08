import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const source=read('scripts/assemble-supplied-bgm.mjs');
const player=read('munbub_music_patch.js');

test('Render build generates installed-only MP3 catalog',()=>{
 assert.match(source,/readdir\(bgmDir,\{withFileTypes:true\}\)/);
 assert.match(source,/e\.isFile\(\)/);
 assert.match(source,/catalog\.json/);
 assert.match(source,/BGM catalog OK/);
});
test('audio controller loads catalog, excludes uninstalled tracks and honors home theme',()=>{
 assert.match(player,/fetch\('\/assets\/bgm\/catalog\.json'/);
 assert.match(player,/PUBLISHED_BGM\.clear\(\)/);
 assert.match(player,/for\(const file of files\)PUBLISHED_BGM\.add\(file\)/);
 assert.match(player,/update\(restoreHomeTheme&&mode\(\)==='home'\)/);
 assert.doesNotThrow(()=>new Script(player));
});
