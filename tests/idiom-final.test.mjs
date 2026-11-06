import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const here=new URL('../',import.meta.url);
const final=JSON.parse(await readFile(new URL('idiom_final_100.json',here),'utf8'));
const browserSource=await readFile(new URL('munbub_idiom_bank_100.js',here),'utf8');
const browser=JSON.parse(browserSource.match(/const entries=(\[.*?\]);/s)?.[1]??'null');
const hashes=JSON.parse(await readFile(new URL('hard_answer_hashes.json',here),'utf8'));

test('최종 엑셀에서 정리한 한자성어 100개가 브라우저와 서버에 완전히 동일하게 적용된다',()=>{
 assert.equal(final.length,100);
 assert.deepEqual(browser,final);
 assert.deepEqual(final.map(x=>x.number),Array.from({length:100},(_,i)=>i+1));
 assert.equal(new Set(final.map(x=>x.id)).size,100);
 assert.equal(new Set(final.map(x=>x.answer)).size,100);
 assert.ok(final.every(x=>x.hanja.length===4&&x.meaning.length>0));
});
test('기존 아이디와 정답 해시가 유지되어 계정 기록 및 채점이 깨지지 않는다',()=>{
 for(const {id,answer} of final){
  const hash=createHash('sha256').update(answer).digest('hex').slice(0,20);
  assert.ok(Array.isArray(hashes[id]),id+' 서버 정답 정보 없음');
  assert.ok(hashes[id].includes(hash),id+' 정답 해시가 일치하지 않음');
 }
});
test('멀티플레이 서버가 최종 한자성어 100개를 출제 대상으로 삼는다',async()=>{
 const source=await readFile(new URL('api/duel.js',here),'utf8');
 assert.match(source,/const id=duelFinalIdiomIds\(\)/);
 const lib=await readFile(new URL('lib/mb-server.js',here),'utf8');
 assert.match(lib,/finalIdioms.*idiom_final_100\.json/);
 assert.match(lib,/function duelFinalIdiomIds/);
});
