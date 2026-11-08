import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';

const read=filename=>readFileSync(new URL('../'+filename,import.meta.url),'utf8');
const backrooms=read('backrooms/index.html');
const homeMusic=read('munbub_music_patch.js');
const chat=read('api/chat.js');
const modes=read('api/chat-modes.js');
const chatUI=read('munbub_global_chat_20261108.js');

test('Backrooms menu and multiplayer lobby share the two requested music tracks',()=>{
 assert.match(backrooms,/id="mbLobbyMusicMenuMount"/);
 assert.match(backrooms,/id="mbLobbyMusicMultiMount"/);
 assert.match(backrooms,/id="mbLobbyBgmSelect"/);
 assert.match(backrooms,/Retro VHS Horror/);
 assert.match(backrooms,/Dreamcore Ambient/);
 assert.match(backrooms,/new URL\('\.\.\/assets\/bgm\/retro_vhs_horror\.mp3'/);
 assert.match(backrooms,/new URL\('\.\.\/assets\/bgm\/dreamcore_ambient\.mp3'/);
 assert.match(backrooms,/mbLobbyAudio\.addEventListener\('ended'/);
 assert.match(backrooms,/function mbInLobby\(\)\{return \['menu','lobby','ended'\]/);
 assert.match(backrooms,/ensureGameLoop\(\);showScreen\('menu'\)/);
 assert.match(backrooms,/if\(mbInLobby\(\)\)syncLobbyMusic\(\)/);
 assert.match(backrooms,/else stopLobbyMusic\(true\)/);
 // The gameplay JavaScript must still compile after editing the large HTML.
 const raw=[...backrooms.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
 const main=raw.find(x=>!x[0].includes('type='));
 assert.ok(main);
 assert.doesNotThrow(()=>new Script(main[1]));
});
test('Backrooms music does not shuffle automatically in the main Taste Home',()=>{
 assert.match(homeMusic,/const BACKROOMS_MENU_TRACKS=new Set\(\['vhs','dreamcore'\]\)/);
 assert.match(homeMusic,/BACKROOMS_MENU_TRACKS\.has\(t\[0\]\)/);
 assert.match(homeMusic,/m==='home'&&t\[0\]===homeChoice/);
});
test('ordinary messages have no fixed delay but have a bounded burst allowance',()=>{
 assert.match(chat,/INTERVAL '10 seconds'\)<8/);
 assert.match(chat,/INTERVAL '60 seconds'\)<30/);
 assert.doesNotMatch(chat,/lastPost\.get\(user\.id\)/);
 assert.match(modes,/INTERVAL '10 seconds'\)<8/);
 assert.match(modes,/INTERVAL '60 seconds'\)<30/);
 assert.doesNotMatch(modes,/throttled\(user\.id,'dm'/);
});
test('broadcast alerts have a shorter but nonzero delay so they cannot flood every screen',()=>{
 assert.match(modes,/throttled\(user\.id,'all',3000\)/);
 assert.match(modes,/INTERVAL '3 seconds'/);
 assert.match(modes,/INTERVAL '60 seconds'\)<6/);
 assert.match(chatUI,/모두에게 상단 알림 보내기 \(3초 간격\)/);
});
