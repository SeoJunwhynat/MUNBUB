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
