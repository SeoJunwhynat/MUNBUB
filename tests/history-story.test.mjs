import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const get=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
function data(){
 const context={window:{}};runInNewContext(get('history-story-data.js'),context);
 return context.window.MB_HISTORY_STORY;
}
test('history narrative retains nine-episode roadmap and five playable chapters',()=>{
 const d=data();assert.equal(d.chapters.length,5);assert.equal(d.roadmap.length,9);
 assert.deepEqual(Array.from(d.chapters,c=>c.year),['1945','1948','1950–1953','1960','1970년대']);
 assert.ok(d.historyRule.includes('역사적 사실')&&d.fictionNotice.includes('창작'));
 const allNames=new Set();
 for(const c of d.chapters){
  assert.equal(c.zones.length,2);
  const objects=c.zones.flatMap(z=>z.objects);
  const clues=objects.filter(o=>o.kind==='clue'),npc=objects.filter(o=>o.kind==='npc');
  assert.equal(clues.length,4,'four playable records in '+c.id);
  assert.ok(npc.length>=2,'two actors in '+c.id);
  assert.equal(new Set(objects.map(o=>o.id)).size,objects.length);
  assert.ok(objects.every(o=>o.x>=60&&o.x<=906&&o.y>=200&&o.y<=470));
  assert.ok(clues.every(o=>o.fact.length>=15&&o.quote&&o.date&&o.tag));
  assert.ok(npc.every(o=>o.lines.length>=2&&o.choices.length>=2));
  assert.ok(c.quiz.choices.length===4&&new Set(c.quiz.choices).size===4);
  assert.ok(Number.isInteger(c.quiz.correct)&&c.quiz.correct>=0&&c.quiz.correct<4);
  assert.ok(c.timeline.length>=3&&c.timeline.every((e,i,arr)=>i===0||arr[i-1].date<e.date));
  assert.ok(!allNames.has(c.id));allNames.add(c.id);
 }
});
function fakeDOM(){
 const elements=new Map();
 function fake(id){
  const classes=new Set(['hidden']),listeners={};
  const el={id,textContent:'',innerHTML:'',value:'',style:{},dataset:{},disabled:false,
   classList:{add(k){classes.add(k)},remove(k){classes.delete(k)},contains(k){return classes.has(k)},toggle(k,v){if(v)classes.add(k);else classes.delete(k)}},
   listeners,addEventListener(k,fn){(listeners[k]??=[]).push(fn)},querySelectorAll(){return []},setAttribute(){},focus(){},scrollIntoView(){}};
  if(id==='storyCanvas')el.getContext=()=>({});
  return el;
 }
 const document={
  body:{innerHTML:''},getElementById(id){if(!elements.has(id))elements.set(id,fake(id));return elements.get(id)},
  querySelectorAll(){return[]},addEventListener(){},activeElement:{tagName:'BODY'},hidden:false
 };
 return {document,elements};
}
test('story chapter 1945 is playable from NPC to historical timeline quiz and unlocks 1948',()=>{
 const {document,elements}=fakeDOM(),state={};
 const localStorage={getItem(k){return state[k]||null},setItem(k,v){state[k]=v}};
 const window={addEventListener(){},location:{assign(){},origin:'https://example.test',search:''}};
 const ctx={window,document,localStorage,performance:{now(){return 0}},requestAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},setInterval(){return 1},clearInterval(){},confirm(){return true}};
 runInNewContext(get('history-story-data.js'),ctx);
 runInNewContext(get('history-story-app.js'),ctx);
 const dbg=window.MB_HISTORY_STORY_DEBUG,c=window.MB_HISTORY_STORY.chapters[0];
 assert.equal(dbg.chapter,'ep1945');
 assert.equal(dbg.modalType,'lines');
 const next=()=>elements.get('dialogNext').listeners.click[0]({target:{}});
 for(let i=0;i<3;i++)next();
 const obj=id=>c.zones.flatMap(z=>z.objects).find(o=>o.id===id);
 dbg.interact(obj('radio'));next();
 dbg.interact(obj('committee'));next();
 dbg.interact(obj('newsboy'));next();next();dbg.chooseView(1);next();
 assert.equal(dbg.collected.length,2);assert.equal(dbg.spoken.length,1);
 dbg.changeZone(1);assert.equal(dbg.zone,1);
 dbg.interact(obj('parallel'));next();
 dbg.interact(obj('moscow'));next();
 dbg.interact(obj('curator'));next();next();dbg.chooseView(0);next();
 assert.equal(dbg.collected.length,4);assert.equal(dbg.spoken.length,2);
 dbg.openFinal();assert.equal(dbg.modalType,'timeline');
 const choice=(sel,k)=>elements.get('dialogueExtra').listeners.click[0]({target:{closest(s){return s==='[data-'+sel+']'?{dataset:{[sel==='timeline'?'timeline':'quizChoice']:k}}:null}}});
 for(const item of ['liberation','division','moscow'])choice('timeline',item);
 next();next();assert.equal(dbg.modalType,'quiz');
 choice('quiz-choice',2);next();
 assert.ok(dbg.completed.includes('ep1945'));
 assert.ok(dbg.unlocked.includes('ep1948'));
 assert.ok(state['mb_history_story_2026_v1']);
 dbg.jump('ep1948',true);assert.equal(dbg.chapter,'ep1948');
});
test('story mode page and museum entry retain existing museum navigation',()=>{
 const html=get('history-story.html'),app=get('history-story-app.js'),coop=get('history-story-coop.js'),museum=get('history-museum.html'),api=get('api/history-story.js'),server=get('server.js');
 for(const token of ['storyCanvas','chapterList','journalBody','storyOverlay','touchPad','coopLobby','coopSession'])assert.match(html,new RegExp('id="'+token+'"'));
 assert.match(html,/history-story-coop\.js/);
 assert.match(museum,/href="\/history-story\.html"/);
 assert.match(get('history-museum-app.js'),/to:'story'/);
 assert.match(app,/history preserved|HISTORY PRESERVED/);
 assert.match(app,/MB_STORY_COOP/);
 assert.match(coop,/\/api\/history-story/);
 assert.match(coop,/cop[yY]|navigator\.clipboard/);
 assert.match(api,/sameOrigin\(req\)/);
 assert.match(api,/session\(req\)/);
 assert.match(api,/revision/);
 assert.match(server,/'history-story'/);
});
