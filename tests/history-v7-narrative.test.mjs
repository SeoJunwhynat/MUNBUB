import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';
const load=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
function script(){
 const storage=new Map(),dialogues=[],notes=[];
 const window={
  MB_V7:{
   snapshot(){return {scene:'street',progress:{}}},dialog(title,body,buttons){dialogues.push({title,body,buttons})},
   closeDialog(){},notify(){}
  }
 };
 const document={readyState:'loading',addEventListener(){},
  querySelector(){return null}
 };
 const ctx={window,document,localStorage:{getItem(k){return storage.get(k)||null},setItem(k,v){storage.set(k,v)}},
  setTimeout(){return 1},clearTimeout(){}};
 const text=load('history-v7-narrative.js');
 assert.doesNotThrow(()=>new Script(text));
 runInNewContext(text,ctx);
 return {script:window.MB_V7_STORY,dialogues,notes,storage};
}
test('historical side-scroller narrative preserves walkable environments and layers six fictional ordinary-citizen stories',()=>{
 const h=load('history-story-v7.html');
 assert.match(h,/history-v7-narrative\.js/);
 assert.match(h,/MB_V7_STORY\?\.populate/);
 assert.match(h,/MB_V7_STORY\?\.enter/);
 assert.match(h,/MB_V7_STORY\?\.objective/);
 assert.match(h,/MB_V7_STORY\?\.aftermath/);
 assert.match(h,/MB_V7_STORY\?\.finalise/);
 assert.match(h,/MB_V7_STORY\?\.beforePrint/);
 assert.match(h,/window\.MB_V7_STORY\?\.printed/);
 assert.match(h,/document:openDocument,use:/);
 assert.match(h,/dialog:openModal,closeDialog:closeModal/);
 assert.equal((h.match(/data:image\/webp;base64/g)||[]).length,4);
 assert.match(h,/!\\?\['market','news','home','school','plaza'\]/);
 const {script}=script();
 for(const [scene,labels] of Object.entries({
  street:['견습 기자 미란','거리의 전달책'],
  print:['인쇄공 태식','편집용 교정지'],
  market:['시장 상인 순덕','가게의 장부'],
  school:['학생 영호','교실의 공책'],
  news:['신문사 편집인','서로 다른 신문 제목'],
  home:['은희의 집','집에 남은 편지'],
  plaza:['광장의 시민'],
  '1947':['기록을 지키는 이웃','신문이 놓인 벤치']
 })){
  const objs=[];script.populate(scene,(x,y,label,kind,fn)=>objs.push({x,y,label,kind,fn}));
  for(const label of labels)assert.ok(objs.some(o=>o.label===label),'Missing '+scene+'/'+label);
  assert.ok(objs.every(o=>o.x>=0&&o.x<=2200&&typeof o.fn==='function'));
 }
});
test('first reporting choice is replayable if dialog is closed, then affects downstream dialogue without rewriting history',()=>{
 const {script,dialogues,storage}=script();const arr=[];
 script.populate('street',(x,y,label,kind,fn)=>arr.push({label,fn}));
 const miran=arr.find(o=>o.label==='견습 기자 미란');
 miran.fn();assert.match(dialogues.at(-1).body,/1946/);
 // Closing without committing must not permanently lock a dialogue route.
 miran.fn();assert.equal(dialogues.length,2);
 dialogues.at(-1).buttons[1].f();
 assert.equal(script.state().choices.approach,'voices');
 assert.ok(script.journal().includes('첫 취재 선택'));
 miran.fn();assert.equal(dialogues.length,2,'revisiting after a choice gives an ambient line instead of a forced modal');
 assert.ok(storage.has('mb_v7_nameless_narrative_v2'));
 assert.ok(script.aftermath().includes('미란'));
 const game=load('history-story-v7.html');
 assert.match(game,/progress\.timeline/);
 assert.match(game,/1947\. 7\. 19/);
});
test('newspaper layout choice and final historical memory diverge locally while main task is playable',()=>{
 const {script,dialogues}=script();
 let continued=0;
 assert.equal(script.beforePrint(()=>continued++),true);
 assert.equal(continued,0);
 const opts=dialogues.at(-1).buttons;
 assert.equal(opts.length,2);
 opts[0].f();
 assert.equal(continued,1);
 assert.equal(script.state().choices.headline,'sources');
 assert.equal(script.beforePrint(()=>continued++),false);
 assert.ok(script.deliveryText().includes('날짜'));
 let recorded=0;
 script.finalise(()=>recorded++);
 assert.equal(recorded,0);
 dialogues.at(-1).buttons[1].f();
 assert.equal(recorded,1);
 assert.equal(script.state().choices.memory,'people');
 assert.equal(script.state().finished,true);
 assert.ok(script.journal().includes('마지막 문장'));
 script.finalise(()=>recorded++);
 assert.equal(recorded,2,'already finished historical memory is re-entrant');
});
test('journal and story UI keep primary play nonblocking, with source-based history separate from fictional memories',()=>{
 const controls=load('history-v7-controls.js');
 assert.match(controls,/MB_V7_STORY\?\.journal/);
 const narrative=load('history-v7-narrative.js');
 const css=load('history-v7-narrative.css');
 assert.match(narrative,/창작 인물/);
 assert.match(narrative,/실제 사료와 구분/);
 assert.match(narrative,/1946년 10월 7일/);
 assert.match(narrative,/역사적 사건은 달라지지 않으며/);
 assert.match(css,/#v7-story-bubble/);
 assert.match(css,/pointer-events:none/);
 assert.match(css,/prefers-reduced-motion/);
 assert.ok(!css.includes('position:fixed'),'ambient speech must be anchored in game viewport');
});
