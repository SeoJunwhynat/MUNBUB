import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const bank=JSON.parse(read('backrooms/bank.json'));
const main=JSON.parse(read('index.html').match(/const BANK=(\{.*?\});\s*const ALL=/s)?.[1]||'null');
const back=JSON.parse(read('backrooms/index.html').match(/const ORIGINAL_BANK=(\{.*?\});\s*const QUESTIONS_PER_TERMINAL=/s)?.[1]||'null');
const hash=JSON.parse(read('hard_answer_hashes.json'));
test('NIKL verified 전세방 correction is consistent in 3 banks and hardcore',()=>{
 assert.equal(bank.spelling.length,156);
 for(const list of [bank.spelling,main.spelling,back.spelling]){
  assert.equal(list.length,156);
  assert.equal(new Set(list.map(x=>x.id)).size,156);
  for(const q of list)assert.ok(q.answers.length&&q.answers.every(x=>q.options.includes(x)),q.id);
  assert.deepEqual(list.find(x=>x.id==='s28a').answers,['전세방']);
 }
 assert.deepEqual(hash.s28a,[createHash('sha256').update('전세방').digest('hex').slice(0,20)]);
 assert.deepEqual(bank.spelling.find(x=>x.id==='s22').answers,['짜장면','자장면']);
 assert.deepEqual(bank.spelling.find(x=>x.id==='s86').answers,['두리뭉실','두루뭉술']);
});

test('NIKL additional corrections match spelling in home, Backrooms, and ranked hard hashes',()=>{
 for(const list of [bank.spelling,main.spelling,back.spelling]){
  const q23=list.find(q=>q.id==='s23');
  assert.deepEqual(q23.answers,['늦장','늑장']);
  assert.deepEqual(q23.options,['늦장','늑장','늣장','늑짱']);
  const q85=list.find(q=>q.id==='s85');
  assert.deepEqual(q85.answers,['얼마큼']);
  assert.deepEqual(q85.options,['얼만큼','얼마큼']);
  assert.match(q85.note,/얼마만큼/);
  assert.ok(q85.answers.every(a=>q85.options.includes(a)));
 }
 for(const answer of ['늦장','늑장'])assert.ok(hash.s23.includes(createHash('sha256').update(answer).digest('hex').slice(0,20)));
 assert.deepEqual(hash.s85,[createHash('sha256').update('얼마큼').digest('hex').slice(0,20)]);
 for(const wrong of ['늣장','늑짱','얼만큼']){
  const digest=createHash('sha256').update(wrong).digest('hex').slice(0,20);
  assert.ok(!(wrong==='얼만큼'?hash.s85:hash.s23).includes(digest));
 }
});
