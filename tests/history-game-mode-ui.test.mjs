import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';
const load=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('history mode home maps Korean game slots to concept/year/advanced/museum',()=>{
 const html=load('history-study.html');
 assert.match(html,/history-study-matchun-ui\.css/);
 assert.match(html,/history-study-matchun-ui\.js/);
 const src=load('history-study-matchun-ui.js');
 assert.doesNotThrow(()=>new Script(src));
 const ctx={window:{}};
 runInNewContext(src,ctx);
 const ui=ctx.window.MB_HISTORY_MODE_UI;
 assert.ok(ui);
 const page=ui.renderHome({
   facts:[{u:'A'}],questions:[{id:1}],units:{A:'광복과 정부 수립'},wrongCount:2,
   encode:s=>String(s)
 });
 for(const [mode,slot,label] of [
  ['concept','spelling','개념문제'],
  ['year','idiom','연도문제'],
  ['advanced','application','심화문제']
 ]){
  assert.match(page,new RegExp('data-history-mode="'+mode+'" data-art-slot="'+slot+'"'));
  assert.ok(page.includes(label));
 }
 assert.match(page,/class="history-mode-card history-museum-card" href="\/history-museum\.html" data-art-slot="backrooms"/);
 assert.ok(page.includes('역사 박물관'));
 assert.ok(page.includes('data-go="wrong"'));
 assert.ok(page.includes('data-unitgo="A"'));
 assert.ok(page.includes('광복과 정부 수립'));
});
test('history quiz modes select different real question pools without modifying Korean game',()=>{
 const listeners={};
 const root={innerHTML:'',addEventListener(name,cb){listeners[name]=cb}};
 const tabs={addEventListener(){},querySelectorAll(){return[]}};
 const fields={unit:{value:'all'},level:{value:'all'},type:{value:'all'},count:{value:'10'},clock:{textContent:''}};
 const document={getElementById(id){return id==='app'?root:id==='tabs'?tabs:fields[id]||null}};
 const window={scrollTo(){},MB_HISTORY_MODE_UI:{renderHome(){return '<h1>한국사 2 문제 게임</h1>'},prepareSetup(){}}};
 const ctx={window,document,localStorage:{getItem(){return null},setItem(){}},setInterval(){return 1},clearInterval(){},setTimeout,clearTimeout,console};
 runInNewContext(load('history-study-data.js'),ctx);
 runInNewContext(load('history-deep-sources.js'),ctx);
 runInNewContext(load('history-study-app.js'),ctx);
 assert.match(root.innerHTML,/한국사 2/);
 const click=(mode,kind='mode')=>{
   const target={id:kind==='start'?'start':'',dataset:{},closest(sel){
     if(kind==='mode'&&sel==='[data-history-mode]')return {dataset:{historyMode:mode}};
     return null;
   }};
   listeners.click({target});
 };
 const map={
   concept:new Set(['event','keyword','meaning','context','people','worksheet']),
   year:new Set(['year','month','order','timeline','between']),
   advanced:new Set(['source','visual','map','context','meaning','people','worksheet','timeline','between','order'])
 };
 for(const m of Object.keys(map)){
   click(m);
   assert.match(root.innerHTML,/기말 실전 문제풀이/);
   click(null,'start');
   const found=root.innerHTML.match(/<span class="small">(?:심화|기본) · ([a-z]+)<\/span>/);
   assert.ok(found,'quiz question must be rendered for '+m);
   assert.ok(map[m].has(found[1]),'unexpected '+m+' question type '+found[1]);
 }
 assert.equal(load('index.html').length>2_000_000,true);
});
