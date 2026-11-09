import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';
import {createAppServer} from '../server.js';

const load=filename=>readFileSync(new URL('../'+filename,import.meta.url),'utf8');

test('pixel subject launcher retains uploaded visuals and offers real navigation',()=>{
 const html=load('subject-select.html');
 assert.match(html,/벚꽃과 등불로 장식된 맛춘범 도트풍 학습관/);
 assert.match(html,/data:image\/webp;base64,/);
 assert.match(html,/data-view="home"/);
 assert.match(html,/data-subject="core"/);
 assert.match(html,/data-subject="history"/);
 assert.match(html,/id="historyModesDialog"/);
 for(const href of ['/index.html','/history-story.html','/history-museum.html','/history-study.html']){
  assert.ok(html.includes(href),'Missing route '+href);
 }
 assert.equal((html.match(/class="history-mode-card"/g)||[]).length,3);
 assert.match(html,/@media\(max-width:680px\)/);
 const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
 assert.ok(script,'Embedded launcher app script exists');
 assert.doesNotThrow(()=>new Script(script));
});
test('subject selection opens history choices and preserves old Korean game link',()=>{
 const source=load('subject-select.html'),script=source.match(/<script>([\s\S]*?)<\/script>/)[1];
 const map=new Map(),navigated=[];
 function el(id){if(map.has(id))return map.get(id);
  const x={id,dataset:{},open:false,value:'',textContent:'',addEventListener(){},
   classList:{add(){},remove(){}},showModal(){this.open=true},close(){this.open=false}};
  map.set(id,x);return x;
 }
 const document={getElementById:el,querySelectorAll(){return[]},addEventListener(){},dispatchEvent(){return true}};
 const window={location:{assign(route){navigated.push(route)}},dispatchEvent(){return true},clearTimeout(){},setTimeout(){return 1}};
 class CustomEvent{constructor(name,options){this.type=name;this.detail=options?.detail;}}
 runInNewContext(script,{document,window,CustomEvent});
 assert.equal(el('app').dataset.view,'home');
 window.MatchunbeomSubjectUI.open();
 assert.equal(el('app').dataset.view,'subjects');
 window.MatchunbeomSubjectUI.selectSubject('history');
 assert.equal(el('historyModesDialog').open,true);
 assert.deepEqual(navigated,[]);
 window.MatchunbeomSubjectUI.selectSubject('core');
 assert.deepEqual(navigated,['/index.html']);
});
test('Render root is pixel launcher, original index remains intact, and each history module responds',async()=>{
 const server=createAppServer();
 await new Promise((resolve,reject)=>server.once('error',reject).listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 try{
  const main=await fetch(base+'/');
  assert.equal(main.status,200);
  const text=await main.text();
  assert.match(text,/맛춘범 \| 과목 선택/);
  assert.match(text,/historyModesDialog/);
  const legacy=await fetch(base+'/index.html',{method:'HEAD',headers:{'Accept-Encoding':'identity'}});
  assert.equal(legacy.status,200);
  assert.ok(Number(legacy.headers.get('content-length'))>2000000,'Original Korean app HTML was preserved');
  for(const url of ['/subject-select.html','/history-story.html','/history-museum.html','/history-study.html']){
   const res=await fetch(base+url,{method:'HEAD'});
   assert.equal(res.status,200,url);
   assert.match(res.headers.get('content-type'),/text\/html/);
  }
 }finally{
  await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));
 }
});
