import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const api=read('api/chat.js'),backend=read('api/chat-modes.js');
const alert=read('munbub_global_alert_20261108.js');
const client=read('munbub_global_chat_20261108.js');
const css=read('munbub_global_chat_20261108.css');

test('DM notification API uses authenticated recipient filter and sender identity',()=>{
 assert.match(api,/\['users','dm','inbox','dm_notifications'\]/);
 assert.match(backend,/req\.query\.mode==='dm_notifications'/);
 assert.match(backend,/m\.receiver_id=\$1 AND m\.id>\$2::bigint/);
 assert.match(backend,/b\.owner_id=\$1 AND b\.target_id=m\.sender_id/);
 assert.match(backend,/me:user\.id,messages:rows\.reverse\(\)/);
 assert.match(backend,/senderId:String\(x\.sender_id\)/);
});
test('recipient receives non-intrusive private banner with cursored polling and safe rendering',()=>{
 assert.match(alert,/mode=dm_notifications&since=/);
 assert.match(alert,/sessionStorage\.setItem\(DM_KEY/);
 assert.match(alert,/const me=String\(data\.me\|\|''\)/);
 assert.match(alert,/document\.createElement\('span'\)/);
 assert.match(alert,/body\.textContent=String\(msg\.text\|\|''\)/);
 assert.match(alert,/mb:open-private-chat/);
 assert.match(alert,/setInterval\(pollPrivate,2700\)/);
 assert.doesNotThrow(()=>new Script(alert));
});
test('DM banner click opens conversation and moves chat outside scaled Home',()=>{
 assert.match(client,/document\.body\.append\(toggle,panel\)/);
 assert.match(client,/function liftChat\(/);
 assert.match(client,/dialog\[open\]/);
 assert.match(client,/mb:open-private-chat/);
 assert.match(client,/choosePeer\(\{id:String\(detail\.id\)/);
 assert.match(client,/form\.hidden=mode==='dm'&&!peer/);
 assert.match(client,/panel\.style\.setProperty\('top'/);
 assert.match(client,/panel\.style\.setProperty\('height'/);
 assert.doesNotThrow(()=>new Script(client));
});
test('zoom/mobile chat uses viewport rather than Home dimensions and readable inputs',()=>{
 assert.match(css,/width:min\(570px,calc\(100vw - 24px\)\)/);
 assert.match(css,/@media\(max-width:700px\),\(max-height:580px\)/);
 assert.match(css,/height:100dvh!important/);
 assert.match(css,/font-size:16px!important/);
 assert.match(css,/safe-area-inset-bottom/);
 assert.match(css,/min-height:52px!important/);
});
