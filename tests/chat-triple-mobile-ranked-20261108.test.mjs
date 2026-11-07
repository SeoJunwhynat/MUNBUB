import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import chat from '../api/chat.js';
import {activeUserIds,pingPresence,resetPresenceForTests} from '../lib/mb-presence.js';

const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const page=read('munbub_global_chat_20261108.js');
const style=read('munbub_global_chat_20261108.css');
const alert=read('munbub_global_alert_20261108.js');
const ranked=read('munbub_ranked_challenge.js');
const rankedCss=read('munbub_ranked_visual_20261106.css');
const backend=read('api/chat-modes.js');
const chatServer=read('api/chat.js');
const storage=read('lib/mb-storage.js');
const presence=read('lib/mb-presence.js');
const adapter=read('server.js');
const backrooms=read('backrooms/index.html');
const launcher=read('munbub_backrooms_entry_20261106.js');

test('signed-in users have separate global, private and broadcast channels',()=>{
 assert.match(page,/value==='global'/);
 assert.match(page,/\['global','🌐 전체 채팅'\]/);
 assert.match(page,/\['dm','✉️ 개인 채팅'\]/);
 assert.match(page,/\['all','📢 모두에게'\]/);
 assert.match(page,/action:'send_dm'/);
 assert.match(page,/action:'send_broadcast'/);
 assert.match(page,/action:'send',text/);
 assert.match(page,/mode=users&q=/);
 assert.match(page,/mode=inbox/);
 assert.match(page,/mode=dm&peer=/);
 assert.match(page,/body\.textContent=|text\.textContent=String\(msg\.text\|\|''\)/);
 assert.doesNotMatch(page,/innerHTML\s*=/);
});
test('public broadcast banners are attached to modal top layer and also Backrooms',()=>{
 assert.match(launcher,/munbub_global_alert_20261108\.js/);
 assert.match(backrooms,/src="\/munbub_global_alert_20261108\.js"/);
 assert.match(backrooms,/src="\/mb_live_presence_20261107\.js"/);
 assert.match(alert,/dialog\[open\]/);
 assert.match(alert,/role','status'/);
 assert.match(alert,/mode=broadcast&since=/);
 assert.match(alert,/body\.textContent=String\(msg\.text\|\|''\)/);
 assert.match(alert,/setInterval\(\(\)=>\{anchor\(\);poll\(\)\},2700\)/);
 assert.doesNotThrow(()=>new Script(alert));
});
test('private chats expose only sender/receiver, server-side account identity and safe recipient listing',()=>{
 assert.match(chatServer,/handleChatModes\(req,res,user\)/);
 assert.match(backend,/sender_id=\$1 AND receiver_id=\$2/);
 assert.match(backend,/sender_id=\$2 AND receiver_id=\$1/);
 assert.match(backend,/body->>'name'/);
 assert.match(backend,/body->>'id'/);
 assert.match(backend,/activeUserIds\(\)/);
 assert.match(backend,/WHERE id=\$1::bigint AND receiver_id=\$2/);
 assert.match(backend,/\['send_dm','block','unblock'\]\.includes\(body\.action\)/);
 assert.match(backend,/action==='block'/);
 assert.match(backend,/action==='unblock'/);
 assert.match(storage,/CREATE TABLE IF NOT EXISTS mb_private_chat/);
 assert.match(storage,/CREATE TABLE IF NOT EXISTS mb_chat_blocks/);
 assert.match(storage,/CREATE TABLE IF NOT EXISTS mb_chat_broadcast/);
 assert.match(adapter,/session\(req\)\?\.id\|\|null/);
});
test('private chat GET requires login and cannot list other people anonymously',async()=>{
 const response={
  status(n){this.statusCode=n;return this},
  json(v){this.body=v;return this},
  setHeader(){}
 };
 await chat({method:'GET',query:{mode:'dm',peer:'a'.repeat(36)},headers:{}},response);
 assert.equal(response.statusCode,401);
 assert.match(response.body.error,/로그인/);
});
test('online users are linked only to authenticated active tabs and expired on leave',()=>{
 resetPresenceForTests();
 const a='a'.repeat(36),b='b'.repeat(36),id1='Z'.repeat(36),id2='Y'.repeat(36);
 assert.equal(pingPresence(id1,10000,a),1);
 assert.deepEqual(activeUserIds(),[]); // the synthetic old timestamp has already expired
 assert.equal(pingPresence(id1,Date.now(),a),1);
 assert.equal(pingPresence(id2,Date.now(),b),2);
 assert.equal(activeUserIds().length,2);
 resetPresenceForTests();
 assert.deepEqual(activeUserIds(),[]);
 assert.match(presence,/accountTabs\.delete\(id\)/);
});
test('ranked game restores individual animated backgrounds and standard quiz card variants',()=>{
 for(const mode of ['infinite','hardcore','timed60'])
  assert.match(rankedCss,new RegExp('data-mb-ranked-mode="'+mode+'"'));
 for(const asset of ['ranking_infinite_animated.webp','ranking_hardcore_animated.webp','ranking_timed_animated.webp'])
  assert.match(rankedCss,new RegExp(asset.replaceAll('.','\\.')));
 assert.match(ranked,/mb-ranked-question prompt/);
 assert.match(ranked,/mb-ranked-choices option-list/);
 assert.match(ranked,/class="option"/);
 assert.match(ranked,/q\.format==='text'/);
 assert.match(ranked,/api\(\{action:'answer',run,qid:id,answer\}\)/);
});
test('mobile chat handles soft keyboard and ranked buttons have min 44px targets',()=>{
 assert.match(page,/window\.visualViewport/);
 assert.match(page,/vv\.addEventListener\('resize'/);
 assert.match(page,/panel\.style\.setProperty\('bottom'/);
 assert.match(style,/font-size:16px/);
 assert.match(style,/mbg-people-list/);
 assert.match(rankedCss,/max-width:700px/);
 assert.match(rankedCss,/min-height:48px!important/);
 assert.match(rankedCss,/min-height:44px!important/);
 assert.match(backrooms,/Mobile convenience/);
 assert.doesNotThrow(()=>new Script(page));
});
