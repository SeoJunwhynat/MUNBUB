import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const bank=require('../backrooms/bank.json');
const source=readFileSync(new URL('../backrooms/index.html',import.meta.url),'utf8');
const serverSource=readFileSync(new URL('../backrooms/server.js',import.meta.url),'utf8');
const embedded=JSON.parse(source.match(/const ORIGINAL_BANK=(\{.*?\});\s*const QUESTIONS_PER_TERMINAL=/s)?.[1]||'null');

test('all 156 spelling problems are sentence fill-in-the-blank exercises',()=>{
 assert.equal(bank.spelling.length,156);
 const ids=new Set();
 for(const entry of bank.spelling){
  assert.ok(!ids.has(entry.id),`duplicate ID ${entry.id}`);ids.add(entry.id);
  assert.equal(entry.prompt.split('___').length-1,1,entry.id+' missing or multiple blanks');
  assert.match(entry.prompt,/[.?!]$/,entry.id+' is not sentence punctuation');
  assert.ok(entry.answers.length>0&&entry.answers.every(a=>entry.options.includes(a)),entry.id+' answer not in choices');
  for(const answer of entry.answers){
   const sentence=entry.prompt.replace('___',answer);
   assert.ok(!sentence.includes('___'),`blank remains ${entry.id}`);
   assert.ok(sentence.length>answer.length,`${entry.id} not contextual`);
  }
 }
 assert.equal(new Set(bank.spelling.map(p=>p.prompt)).size,bank.spelling.length,'duplicate sentence prompts');
});

test('offline and online modes share the same spelling bank and question format',()=>{
 assert.deepEqual(embedded.spelling,bank.spelling);
 assert.match(source,/q:entry\.prompt/,'offline question shows full sentence');
 assert.match(serverSource,/q:p\.prompt/,'server question shows full sentence');
 assert.ok(!source.includes("q:'다음 중 올바른 맞춤법은?'"));
 assert.ok(!serverSource.includes("q:'다음 중 올바른 맞춤법은?'"));
 assert.match(source,/function renderQuizQuestion\(q\)/);
 assert.match(source,/target\.replaceChildren\(\)/);
 assert.match(source,/document\.createTextNode/,'sentence UI avoids injecting markup');
 assert.match(source,/sentenceBlank/,'visual blank exists');
 assert.match(source,/빈칸에 들어갈 올바른 표현을 고르세요/);
 assert.match(serverSource,/function publicQuestion\(q\)\{const \{answer,accepted,exp,\.\.\.shown\}=q;return shown;\}/);
});
