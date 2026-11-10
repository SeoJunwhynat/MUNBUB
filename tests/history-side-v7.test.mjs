import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import {createAppServer} from '../server.js';
const load=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');

test('V7 story route is the submitted full pixel side-scroller rather than the former top-down novel',()=>{
 const url=load('history-story.html');
 assert.match(url,/location\.replace\("\/history-story-v7\.html"/);
 const html=load('history-story-v7.html');
 assert.match(html,/이름 없는 사람들의 역사/);
 assert.match(html,/canvas id="canvas" width="640" height="360"/);
 assert.equal((html.match(/data:image\/webp;base64/g)||[]).length,4,'all four uploaded pixel layers must survive');
 assert.match(html,/history-v7-online\.js/);
 assert.match(html,/id="v7OnlinePanel"/);
 assert.match(html,/id="v7RoomCode"/);
 assert.match(html,/id="v7ChatForm"/);
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
 assert.ok(scripts.length>=2);
 for(const script of scripts)assert.doesNotThrow(()=>new Script(script));
});
test('side scroller does real physics, world coordinate camera and stage interactions',()=>{
 const src=load('history-story-v7.html');
 for(const term of [
  'p.vy+.51*dt','p.buffer=9','p.coyote=p.onGround','p.x+=p.vx*dt',
  'p.y+=p.vy*dt','const target=p1.x-236','cam+=','ladders.find',
  'groundScene(byid.print','groundScene(byid.street','progress.manuscript','progress.paper',
  'progress.document','progress.printed','progress.delivered','progress.memorial','startPrinting()'
 ])assert.ok(src.includes(term),'missing actual game logic '+term);
 assert.match(src,/인쇄기 A 레버/);
 assert.match(src,/인쇄기 B 레버/);
 assert.match(src,/window\.MB_V7_NET\?\.pressReady/);
 assert.match(src,/1947\. 7\. 19/);
 assert.match(src,/v7-date-card/);
 assert.match(src,/국사편찬위원회 FRUS/);
 assert.match(src,/setProgress:\(next\)/);
 assert.match(src,/resetForRoom:\(\)/);
});
test('online co-op is authenticated, has actual signed rooms and multiplayer position/quest synchronization',()=>{
 const src=load('history-v7-online.js');
 assert.doesNotThrow(()=>new Script(src));
 for(const key of ['/api/history-side','/api/account','function drawPlayers','setInterval(refresh,650)','setInterval(move,260)','function onProgress','function onScene','function pressReady','function lever','function restoreSolo']){
  assert.ok(src.includes(key),'client missing '+key);
 }
 const server=load('api/history-side.js');
 assert.match(server,/session\(req\)/);
 assert.match(server,/sameOrigin\(req\)/);
 assert.match(server,/const MAX_PLAYERS=4|MAX_PLAYERS=4/);
 assert.match(server,/const VALID_SCENES=new Set/);
 assert.match(server,/const FLAGS=/);
 for(const action of ['create','join','leave','ready','start','move','progress','chat','switch','cutReady']){
  assert.ok(server.includes("action==='"+action+"'"),'server missing action '+action);
 }
 assert.match(server,/Math\.abs\(x-site\)>80/);
 assert.match(server,/l\.left\.id!==l\.right\.id/);
 assert.match(server,/revision/);
 assert.match(server,/Math\.abs\(x-actor\.x\)/);
 assert.match(load('server.js'),/'history-side'/);
});
test('Render serves new historic side-scroller public files while preserving original homework and museum',async()=>{
 const server=createAppServer();
 await new Promise((resolve,reject)=>server.once('error',reject).listen(0,'127.0.0.1',resolve));
 const root='http://127.0.0.1:'+server.address().port;
 try{
  for(const path of ['/history-story-v7.html','/history-v7-online.js','/history-study.html','/history-museum.html']){
   const r=await fetch(root+path);
   assert.equal(r.status,200,'missing '+path);
   const bytes=await r.arrayBuffer();
   assert.ok(bytes.byteLength>500,'empty '+path);
  }
  const html=await (await fetch(root+'/history-story-v7.html')).text();
  assert.ok(html.includes('data:image/webp;base64,'));
  assert.ok(html.includes('2D')||html.includes('횡스크롤'));
 }finally{await new Promise(r=>server.close(r))}
});
