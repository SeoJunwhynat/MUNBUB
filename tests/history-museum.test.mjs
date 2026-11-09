import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {MUSEUM_QUESTIONS,validMuseumBank} from '../lib/mb-history-museum-bank.js';
const load=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('museum multiplayer quiz bank validates 16 independent historical questions',()=>{
 assert.equal(validMuseumBank(),true);
 assert.equal(MUSEUM_QUESTIONS.length,16);
 assert.equal(new Set(MUSEUM_QUESTIONS.map(q=>q.id)).size,16);
 assert.ok(MUSEUM_QUESTIONS.every(q=>q.explain&&q.choices[q.correct]));
});
test('museum main scene connects all 8 era galleries to every source and record',()=>{
 const ctx={window:{}};
 runInNewContext(load('history-study-data.js'),ctx);
 runInNewContext(load('history-deep-sources.js'),ctx);
 const fake=()=>{
  const classes=new Set();
  return {textContent:'',value:'',innerHTML:'',disabled:false,style:{},
   classList:{add(x){classes.add(x)},remove(x){classes.delete(x)},toggle(x,v){if(v)classes.add(x);else classes.delete(x)},contains(x){return classes.has(x)}},
   addEventListener(){},insertAdjacentHTML(){},querySelectorAll(){return[]},setAttribute(){}};
 };
 const elems=new Map();
 const drawing={getContext(){return {}},addEventListener(){},focus(){}};
 const doc={
  activeElement:{tagName:'BODY'},
  getElementById(id){if(!elems.has(id))elems.set(id,id==='museum'?drawing:fake());return elems.get(id)},
  querySelectorAll(){return []},
  addEventListener(){}
 };
 const window={HISTORY_FINAL_DB:ctx.window.HISTORY_FINAL_DB,MB_HISTORY_DEEP_SOURCES:ctx.window.MB_HISTORY_DEEP_SOURCES,addEventListener(){},scrollTo(){},location:{assign(){}}};
 const env={window,document:doc,localStorage:{getItem(){return null},setItem(){}},performance:{now(){return 0}},requestAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},setInterval(){return 1},clearInterval(){},fetch(){throw Error('No network in test')},URLSearchParams};
 assert.doesNotThrow(()=>runInNewContext(load('history-museum-app.js'),env));
 const museum=env.window.MB_HISTORY_MUSEUM;
 assert.equal(museum.total,ctx.window.HISTORY_FINAL_DB.items.length+ctx.window.MB_HISTORY_DEEP_SOURCES.length);
 assert.equal(new Set(museum.exhibits.map(x=>x.key)).size,museum.total);
 assert.equal(new Set(museum.exhibits.filter(x=>x.type==='source').map(x=>x.key)).size,25);
 for(const unit of Object.keys(ctx.window.HISTORY_FINAL_DB.chapters)){museum.go(unit);assert.equal(museum.scene,unit)}
 museum.go('lobby');assert.equal(museum.scene,'lobby');
 museum.openItem(museum.exhibits[0]);assert.equal(museum.visited,1);
});
test('museum public UI has keyboard, touch, archive and named endpoints',()=>{
 const html=load('history-museum.html'),app=load('history-museum-app.js'),server=load('server.js'),api=load('api/history-museum.js');
 for(const id of ['museum','hallButtons','tabArchive','tabGame','roomList','readQuiz','quizOverlay','playerList'])assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(html,/data-move="up"/);
 assert.match(app,/Arrow|arrowup/);
 assert.match(app,/mbHistoryMuseumV2_/);
 assert.match(api,/sameOrigin/);
 assert.match(api,/session\(req\)/);
 assert.match(api,/revision/);
 assert.match(server,/'history-museum'/);
});
