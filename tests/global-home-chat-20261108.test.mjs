import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import chat from '../api/chat.js';
const server=readFileSync(new URL('../server.js',import.meta.url),'utf8');
const storage=readFileSync(new URL('../lib/mb-storage.js',import.meta.url),'utf8');
const backend=readFileSync(new URL('../api/chat.js',import.meta.url),'utf8');
const launcher=readFileSync(new URL('../munbub_backrooms_entry_20261106.js',import.meta.url),'utf8');
const client=readFileSync(new URL('../munbub_global_chat_20261108.js',import.meta.url),'utf8');
test('Global chat route is connected to the Home launcher',()=>{
 assert.match(server,/'ranked','score','chat'/);
 assert.match(launcher,/chatScript\.src='\/munbub_global_chat_20261108\.js'/);
 assert.match(client,/getElementById\('homeScreen'\)/);
 assert.match(client,/getElementById\('mb-global-chat-toggle'\)/);
 assert.match(client,/munbub_global_chat_20261108\.css/);
});
test('Neon global chat persists authenticated messages with reporting and no fixed send delay',()=>{
 assert.match(storage,/CREATE TABLE IF NOT EXISTS mb_global_chat/);
 assert.match(storage,/BIGSERIAL PRIMARY KEY/);
 assert.match(storage,/CREATE TABLE IF NOT EXISTS mb_global_chat_reports/);
 assert.match(backend,/FROM mb_global_chat m/);
 assert.match(backend,/ORDER BY m\.id DESC LIMIT 60/);
 assert.match(backend,/created_at>NOW\(\)-INTERVAL '10 seconds'/);
 assert.match(backend,/created_at>NOW\(\)-INTERVAL '60 seconds'/);
 assert.doesNotMatch(backend,/lastPost\.get\(user\.id\)>now-4000/);
 assert.doesNotMatch(backend,/created_at>NOW\(\)-INTERVAL '4 seconds'/);
 assert.match(backend,/sameOrigin\(req\)/);
 assert.match(backend,/session\(req\)/);
 assert.match(backend,/body\.action==='report'/);
});
test('Unauthenticated requests cannot read the whole-server chat',async()=>{
 const mock={
  status(n){this.statusCode=n;return this},
  json(value){this.payload=value;return this},
  setHeader(){}
 };
 await chat({method:'GET',headers:{}},mock);
 assert.equal(mock.statusCode,401);
 assert.match(mock.payload.error,/로그인/);
});
test('Home global chat renders user content as text and offers responsive UI',()=>{
 assert.match(client,/text\.textContent=String\(msg\.text\|\|''\)/);
 assert.doesNotMatch(client,/text\.innerHTML\s*=/);
 assert.match(client,/setInterval\(\(\)=>\{if\(visible/);
 assert.match(client,/input\.maxLength=180/);
 assert.match(client,/action:'send'/);
 assert.match(client,/action:'report'/);
 assert.doesNotThrow(()=>new Script(client));
 assert.doesNotThrow(()=>new Script(launcher));
});
