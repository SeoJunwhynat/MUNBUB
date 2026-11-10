import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';
import {HISTORY_RANKED_BANK,HISTORY_RANKED_MAP,HISTORY_RANKED_MODES} from '../lib/mb-history-ranked-bank.js';

const load=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const parse=(file,marker)=>{
 const text=load(file);
 const idx=text.indexOf(marker);
 assert.ok(idx>=0,marker+' is missing');
 return JSON.parse(text.slice(idx+marker.length).trim().replace(/;\s*$/,''));
};
const original=parse('history-study-data.js','window.HISTORY_FINAL_DB=');
const extra=parse('history-study-additions.js','window.MB_HISTORY_EXTRA_DB=');
const events=original.items.concat(extra.events);
const byId=new Map(events.map(e=>[e.id,e]));

test('expanded Korean history quiz covers Liberation to present with 42 new distinct facts and eight chapters',()=>{
 assert.equal(original.items.length,103);
 assert.equal(extra.events.length,42);
 assert.equal(events.length,145);
 assert.equal(new Set(events.map(e=>e.id)).size,145,'ID collisions');
 assert.ok(extra.events.every(e=>e.id>=1000),'new facts must not collide with existing history-deep-sources IDs');
 assert.equal(new Set(events.map(e=>e.title)).size,145,'duplicate titles');
 const groups=Object.keys(original.chapters);
 assert.deepEqual(groups,['A','B','C','D','E','F','G','H']);
 for(const group of groups)assert.ok(extra.events.some(e=>e.u===group),'chapter '+group+' not expanded');
 for(const e of extra.events){
  assert.ok(/^(19|20)\d\d-\d\d(?:-\d\d)?$/.test(e.date),e.title+' invalid date');
  assert.ok(e.detail.length>=30,e.title+' has weak explanation');
  assert.ok(e.keyword.length>=5,e.title+' missing key term');
  assert.ok(original.chapters[e.u]);
 }
 for(const title of ['좌우 합작 7원칙 발표','여운형 암살','유엔 총회의 한국 총선거 결의','낙동강 방어선 형성','김주열 시신 발견과 마산 시위 확산','박종철 고문치사 사건','경부 고속 도로 개통','의료 보험 제도 시행','남북 고위급 회담 시작']){
  assert.ok(extra.events.some(e=>e.title===title),title+' missing');
 }
});
test('68 additional handcrafted exam questions have exactly one keyed correct option and valid explanations',()=>{
 assert.equal(extra.questions.length,68);
 assert.equal(new Set(extra.questions.map(q=>q.id)).size,68);
 const counts={};
 for(const q of extra.questions){
  assert.ok(byId.has(q.eventId),'invalid event '+q.id);
  assert.equal(byId.get(q.eventId).u,q.unit,q.id+' wrong unit');
  assert.equal(q.choices.length,4,q.id);
  assert.equal(new Set(q.choices).size,4,q.id+' duplicate choices');
  assert.equal(q.choices.filter(a=>a===q.answer).length,1,q.id+' not a unique answer');
  assert.ok(q.body.length>=18,q.id+' empty question');
  assert.ok(q.explanation.length>=18,q.id+' no useful explanation');
  assert.ok(['basic','advanced','top'].includes(q.level),q.id);
  counts[q.type]=(counts[q.type]||0)+1;
  if(/원문 아님|원본 사진 아님|원본 지도 아님/.test(q.body))assert.ok(q.explanation);
 }
 assert.ok(counts.source>=8,'insufficient source interpretation');
 assert.ok(counts.context>=10,'insufficient causal reasoning');
 assert.ok(counts.timeline>=3,'insufficient chronology');
 assert.ok(counts.year>=5,'insufficient dates');
 assert.ok(counts.visual>=3,'insufficient visual descriptions');
 assert.ok(counts.map>=2,'insufficient map problems');
 assert.ok(counts.worksheet>=5,'insufficient worksheets');
});
test('all local Korean history quiz modes receive the expanded 145-event pool plus 68 curated questions',()=>{
 const app=load('history-study-app.js'),html=load('history-study.html');
 assert.doesNotThrow(()=>new Script(app));
 assert.ok(html.indexOf('history-study-additions.js')<html.indexOf('history-study-app.js'),'extension must load first');
 assert.match(app,/facts=db\.items\.concat\(expanded,newExamEvents\)/);
 assert.match(app,/newExamEvents=Array\.isArray\(newExam\.events\)/);
 assert.match(app,/Array\.isArray\(extra\.questions\)/);
 const handlers={},root={innerHTML:'',addEventListener(name,fn){handlers[name]=fn}},tabs={addEventListener(){},querySelectorAll(){return[]}};
 const inputs={unit:{value:'all'},level:{value:'all'},type:{value:'all'},count:{value:'10000'}};
 const document={getElementById(id){return id==='app'?root:id==='tabs'?tabs:inputs[id]||null}};
 const stats={};
 const window={scrollTo(){},MB_HISTORY_MODE_UI:{renderHome({facts,questions,units,wrongCount,encode}){stats.facts=facts.length;stats.questions=questions;return '<div>extra bank</div>';}}};
 const context={window,document,localStorage:{getItem(){return null},setItem(){}},Math,setTimeout(){return 1},clearTimeout(){},setInterval(){return 1},clearInterval(){}};
 for(const f of ['history-study-data.js','history-study-additions.js','history-deep-sources.js','history-study-app.js'])runInNewContext(load(f),context);
 assert.ok(stats.facts>=145,'all expanded facts must be available alongside original deep-source extras');
 assert.ok(stats.questions.length>=700,'main question pool insufficient: '+stats.questions.length);
 for(const q of extra.questions){
  const found=stats.questions.find(x=>x.id===q.id);
  assert.ok(found,'curated problem not reachable: '+q.id);
  assert.equal(found.answer,q.answer,q.id);
 }
 const counts={};for(const question of stats.questions)counts[question.ev.u]=(counts[question.ev.u]||0)+1;
 for(const u of Object.keys(original.chapters))assert.ok(counts[u]>=30,'chapter underrepresented '+u);
});
test('new fact pool is built server-side for all three ranked modes without exposing answers to client',()=>{
 assert.ok(HISTORY_RANKED_BANK.length>=410,'server ranked pool too small: '+HISTORY_RANKED_BANK.length);
 for(const type of ['concept','year','advanced'])assert.ok(HISTORY_RANKED_BANK.filter(x=>x.type===type).length>=135);
 assert.deepEqual([...HISTORY_RANKED_MODES],['infinite','hardcore','timed60']);
 for(const e of extra.events){
  for(const type of ['concept','year','advanced']){
   const q=HISTORY_RANKED_MAP.get('h'+e.id+'-'+type);
   assert.ok(q,'missing server question '+e.title+': '+type);
   assert.equal(q.choices.length,4);
   assert.ok(q.correct>=0&&q.correct<4);
   assert.equal(new Set(q.choices).size,4);
  }
 }
 assert.match(load('api/history-ranked.js'),/HISTORY_RANKED_MAP/);
 assert.doesNotMatch(load('api/history-ranked.js'),/body\.answer\s*=/);
});
test('history-story game remains separate and untouched by the added quiz scripts',()=>{
 const html=load('history-study.html');
 assert.match(html,/history-study-additions\.js/);
 assert.match(html,/history-study-competition\.js/);
 assert.ok(!html.includes('history-v8-3d.js'));
});
