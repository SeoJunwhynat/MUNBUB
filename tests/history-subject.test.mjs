import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const load = name => readFileSync(new URL('../'+name, import.meta.url),'utf8');

test('history study files load, answer keys are valid, and exhibit notes are original summaries',()=>{
  const ctx={window:{}};
  runInNewContext(load('history-study-data.js'),ctx);
  runInNewContext(load('history-deep-sources.js'),ctx);
  const items=ctx.window.HISTORY_FINAL_DB.items;
  const sources=ctx.window.MB_HISTORY_DEEP_SOURCES;
  assert.equal(items.length,116);
  assert.equal(new Set(items.map(x=>x.id)).size,items.length);
  assert.equal(sources.length,25);
  assert.ok(sources.every(s=>s.id&&s.u&&s.title&&s.summary&&Array.isArray(s.signals)));
  const quizzes=sources.filter(s=>s.quiz);
  assert.equal(quizzes.length,10);
  for(const s of quizzes){
    assert.equal(s.quiz.choices.length,4);
    assert.equal(new Set(s.quiz.choices).size,4);
    assert.ok(s.quiz.choices.includes(s.quiz.answer));
    assert.ok(items.some(x=>x.id===s.eventId));
  }
});

test('history UI initializes with original exam question engine',()=>{
  const root={innerHTML:'',addEventListener(){},querySelectorAll(){return []}};
  const tabs={addEventListener(){},querySelectorAll(){return []}};
  const ctx={
    window:{scrollTo(){}},
    document:{getElementById(id){return id==='app'?root:id==='tabs'?tabs:null}},
    localStorage:{getItem(){return null},setItem(){}},
    console,
    setTimeout,clearTimeout,setInterval,clearInterval
  };
  runInNewContext(load('history-study-data.js'),ctx);
  runInNewContext(load('history-deep-sources.js'),ctx);
  assert.doesNotThrow(()=>runInNewContext(load('history-study-app.js'),ctx));
  assert.match(root.innerHTML,/한국사|기말/);
});

test('history museum has real galleries, study archive, quiz, and dedicated multiplayer entry',()=>{
 const html=load('history-museum.html');
 assert.match(html,/역사 박물관|시간의 기록/);
 assert.match(html,/history-museum-app\.js/);
 assert.match(html,/history-museum\.css/);
 assert.match(html,/history-study\.html/);
 assert.match(html,/멀티플레이 접수처/);
 assert.doesNotMatch(html,/1인용 시범 구현/);
});
