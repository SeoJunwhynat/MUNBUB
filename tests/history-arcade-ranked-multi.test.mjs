import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';
import {HISTORY_RANKED_BANK,HISTORY_RANKED_MODES,selectRankedQuestion} from '../lib/mb-history-ranked-bank.js';

const load=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

test('history ranked bank is separate, correct and sufficiently varied',()=>{
 assert.deepEqual([...HISTORY_RANKED_MODES],['infinite','hardcore','timed60']);
 assert.ok(HISTORY_RANKED_BANK.length>=230);
 for(const kind of ['concept','year','advanced']){
  assert.ok(HISTORY_RANKED_BANK.filter(x=>x.type===kind).length>=60);
 }
 const ids=new Set();
 for(const q of HISTORY_RANKED_BANK){
  assert.ok(!ids.has(q.id));ids.add(q.id);
  assert.equal(q.choices.length,4);
  assert.equal(new Set(q.choices).size,4);
  assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<=3);
  assert.ok(q.prompt.length>=20&&q.explain.length>=20);
 }
 for(const i of [0,1,2,3,4,5]){
  const q=selectRankedQuestion([],i);
  assert.equal(q.type,['concept','year','advanced'][i%3]);
 }
});

test('history home mirrors Korean mode routes and reserves history-only features afterward',()=>{
 const src=load('history-study-matchun-ui.js');
 assert.doesNotThrow(()=>new Script(src));
 const ctx={window:{}};runInNewContext(src,ctx);
 const ui=ctx.window.MB_HISTORY_MODE_UI;
 const html=ui.renderHome({facts:[{u:'A'}],questions:[{id:1}],units:{A:'광복과 정부 수립'},wrongCount:4,encode:x=>String(x)});
 for(const key of ['concept','year','advanced','infinite','hardcore','timed60']){
  assert.match(html,new RegExp('data-history-mode="'+key+'"'));
 }
 for(const slot of ['spelling','idiom','application','infinite','hard','timed','backrooms','ranked','duel','public-rooms']){
  assert.match(html,new RegExp('data-art-slot="'+slot+'"'));
 }
 assert.match(html,/data-history-competition="rank"/);
 assert.match(html,/data-history-competition="multi"/);
 assert.match(html,/HISTORY EXTRAS/);
 assert.ok(html.indexOf('HISTORY EXTRAS')>html.indexOf('history-museum-card'));
 assert.ok(html.indexOf('data-history-mode="infinite"')<html.indexOf('data-history-competition="rank"'));
 const css=load('history-study-matchun-ui.css');
 assert.match(css,/39fr/);assert.match(css,/61fr/);
 const page=load('history-study.html');
 assert.match(page,/history-study-competition\.js/);
 assert.match(page,/history-study-competition\.css/);
 assert.ok(load('index.html').length>2_000_000,'original Korean game must remain intact');
});

test('infinite, hardcore and 60-second practice launch and terminate through real history quiz engine',()=>{
 const handlers={};
 const root={innerHTML:'',addEventListener(n,fn){handlers[n]=fn}};
 const tabs={addEventListener(){},querySelectorAll(){return[]}};
 const clock={textContent:''};
 const fields={unit:{value:'all'},level:{value:'all'},type:{value:'all'},count:{value:'10'},clock};
 const document={getElementById(id){return id==='app'?root:id==='tabs'?tabs:fields[id]||null}};
 const storage=new Map();
 const ctx={
  window:{scrollTo(){}},
  document,
  localStorage:{getItem(k){return storage.get(k)||null},setItem(k,v){storage.set(k,String(v))}},
  console,Math,setTimeout(){return 1},clearTimeout(){},setInterval(){return 1},clearInterval(){}
 };
 runInNewContext(load('history-study-data.js'),ctx);
 runInNewContext(load('history-deep-sources.js'),ctx);
 runInNewContext(load('history-study-app.js'),ctx);
 function click(target){handlers.click({target})}
 function action(mode){
  click({id:'',closest(s){return s==='[data-history-mode]'?{dataset:{historyMode:mode}}:null}});
  click({id:'start',closest(){return null}});
 }
 for(const mode of ['infinite','hardcore','timed60']){
  action(mode);
  assert.match(root.innerHTML,/기록 마치기/);
  if(mode==='infinite'||mode==='hardcore')assert.match(root.innerHTML,/∞/);
  if(mode==='timed60')assert.match(root.innerHTML,/초 남음/);
  click({id:'stopRun',closest(){return null}});
  assert.match(root.innerHTML,/학습 완료/);
  assert.match(root.innerHTML,/내 최고 점수/);
 }
 const app=load('history-study-app.js');
 assert.match(app,/state.mode==="hardcore"&&!correct/);
 assert.match(app,/state.deadline&&Date.now\(\)>=state.deadline/);
 assert.match(app,/state.session=rnd\(all.filter/);
});

test('ranking client and API do not trust client scores and reuse authenticated museum multiplayer',()=>{
 const client=load('history-study-competition.js');
 const server=load('api/history-ranked.js');
 assert.doesNotThrow(()=>new Script(client));
 assert.match(client,/\/api\/history-ranked/);
 assert.match(client,/\/api\/history-museum/);
 assert.match(client,/\/api\/account/);
 for(const action of ["create","join","ready","start","answer","next","leave"])assert.ok(client.includes(action));
 assert.match(server,/sameOrigin\(req\)/);
 assert.match(server,/session\(req\)/);
 assert.match(server,/const ok=choice===q.correct/);
 assert.doesNotMatch(server,/score\s*=\s*(?:body|req\.body)\.score/);
 assert.match(load('server.js'),/'history-ranked'/);
});
