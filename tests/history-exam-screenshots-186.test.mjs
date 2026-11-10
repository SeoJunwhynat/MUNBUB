import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script,runInNewContext} from 'node:vm';
import {mkdtemp,mkdir,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {HISTORY_RANKED_BANK,HISTORY_RANKED_MAP} from '../lib/mb-history-ranked-bank.js';
import {installHistoryExamSources,readSourceZip} from '../scripts/install-history-exam-sources.mjs';

const load=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const source=load('history-exam-uploaded-data.js');
const marker='window.MB_HISTORY_EXAM_2026=';
const exam=JSON.parse(source.slice(source.indexOf(marker)+marker.length).trim().replace(/;\s*$/,''));

test('New textbook material covers 186 PNGs and new Cairo to post-war exam facts',()=>{
 assert.equal(exam.count,186);
 assert.equal(exam.events.length,8);
 assert.equal(exam.questions.length,42);
 assert.equal(new Set(exam.events.map(e=>e.id)).size,8);
 assert.ok(exam.events.every(e=>e.u==='A'||e.u==='B'));
 assert.deepEqual(exam.events.map(e=>e.id),[2000,2001,2002,2003,2004,2005,2006,2007]);
 for(const t of ['카이로 회담','카이로 선언 발표','얄타 회담','포츠담 회담과 선언','일본의 항복문서 서명','연합국 최고사령관 각서 제677호'])
  assert.ok(exam.events.some(e=>e.title===t),'missing '+t);
 assert.equal(exam.events.find(e=>e.title==='카이로 선언 발표').date,'1943-12-01');
 assert.equal(exam.events.find(e=>e.title==='일본의 항복문서 서명').date,'1945-09-02');
 assert.equal(exam.events.find(e=>e.title==='연합국 최고사령관 각서 제677호').date,'1946-01-29');
});

test('All 42 photograph, map and source problems have unique correct answers and 186 valid material indexes',()=>{
 assert.equal(new Set(exam.questions.map(q=>q.id)).size,42);
 const baseData=load('history-study-data.js');
 const original=JSON.parse(baseData.split('window.HISTORY_FINAL_DB=')[1].trim().replace(/;\s*$/,''));
 const extras=JSON.parse(load('history-study-additions.js').split('window.MB_HISTORY_EXTRA_DB=')[1].trim().replace(/;\s*$/,''));
 const facts=[...original.items,...extras.events,...exam.events];
 for(const q of exam.questions){
  assert.ok(facts.some(f=>f.title===q.eventTitle),'unmapped '+q.id+'/'+q.eventTitle);
  assert.match(q.imageId,/^s\d{3}$/);
  assert.ok(Number(q.imageId.slice(1))<186);
  assert.equal(q.choices.length,4,q.id);
  assert.equal(new Set(q.choices).size,4,q.id);
  assert.equal(q.choices.filter(x=>x===q.answer).length,1,q.id);
  assert.ok(q.body.length>=20&&q.explanation.length>=20,q.id);
  assert.ok(['source','visual','map','context','worksheet','timeline','month'].includes(q.type));
  assert.ok(['basic','advanced','top'].includes(q.level));
 }
 assert.ok(new Set(exam.questions.map(q=>q.imageId)).size>=30);
 assert.ok(exam.questions.filter(x=>x.type==='source').length>=10);
 assert.ok(exam.questions.filter(x=>x.type==='map').length>=5);
});

test('Uploaded source questions require installed original images; no broken-image guessing before ZIP upload',()=>{
 const src=load('history-study-app.js');
 assert.doesNotThrow(()=>new Script(src));
 assert.match(src,/function loadNewExamMediaQuestions\(\)/);
 assert.match(src,/MB_HISTORY_EXAM_MEDIA\?\.status\?\.\(\)!=="installed"/);
 assert.match(src,/history-exam-media-ready/);
 assert.match(src,/newExam\.questions/);
 assert.match(src,/imageId=q\.imageId/);
 assert.match(src,/MB_HISTORY_EXAM_MEDIA\.questionImage\(q\)/);
 assert.match(src,/function gallery\(\)/);
 assert.match(src,/state\.tab==="gallery"/);
 const html=load('history-study.html');
 for(const path of ['history-exam-uploaded-data.js','history-exam-media.js','history-exam-media.css'])
  assert.ok(html.includes(path),path+' not linked');
 assert.match(html,/data-tab="gallery"/);
 assert.match(load('history-exam-media.css'),/history-exam-question-image/);
 const media=load('history-exam-media.js');
 assert.doesNotThrow(()=>new Script(media));
 assert.match(media,/\/assets\/history-exam\/catalog\.json/);
 assert.match(media,/history-source-zoom/);
 assert.match(media,/function renderGallery/);
 assert.match(media,/loading="lazy"/);
});

test('Server-side ranked challenge is expanded by 8 fact events without sharing correct answer indices',()=>{
 assert.ok(HISTORY_RANKED_BANK.length>=450);
 for(const e of exam.events){
  for(const type of ['concept','year','advanced']){
   const item=HISTORY_RANKED_MAP.get('h'+e.id+'-'+type);
   assert.ok(item,'missing server ranked question '+e.title+' '+type);
   assert.equal(item.choices.length,4);
   assert.ok(item.correct>=0&&item.correct<4);
   assert.equal(item.unit,e.u);
  }
 }
});

function tinyEntry(name,content){
 const body=Buffer.from(content),file=Buffer.from(name);
 const head=Buffer.alloc(30);head.writeUInt32LE(0x04034b50,0);
 head.writeUInt16LE(20,4);head.writeUInt16LE(0,8);
 head.writeUInt32LE(body.length,18);head.writeUInt32LE(body.length,22);
 head.writeUInt16LE(file.length,26);
 return Buffer.concat([head,file,body]);
}
test('Original 186 PNG ZIP importer refuses other file paths and survives a not-yet-uploaded archive',async()=>{
 const archive=Buffer.concat([tinyEntry('manifest.json','{}'),tinyEntry('s000.png','1234')]);
 const parsed=readSourceZip(archive);
 assert.ok(parsed.has('manifest.json'));assert.ok(parsed.has('s000.png'));
 assert.throws(()=>readSourceZip(tinyEntry('../../outside.png','1234')),/Invalid image file/);
 assert.throws(()=>readSourceZip(Buffer.concat([tinyEntry('s000.png','1'),tinyEntry('s000.png','2')])),/Invalid image file/);
 const dir=await mkdtemp(join(tmpdir(),'history-upload-sources-'));
 try{
  await mkdir(join(dir,'assets','history-exam','_incoming'),{recursive:true});
  const logs=[];
  const result=await installHistoryExamSources(dir,{log:x=>logs.push(x)});
  assert.deepEqual(result,{installed:0,awaiting:186});
  assert.match(logs.join('\n'),/awaiting user upload archive/);
 }finally{await rm(dir,{recursive:true,force:true})}
});

test('Story game remains independent from new main-exam image-question deployment',()=>{
 const html=load('history-study.html');
 assert.match(html,/history-study-audio\.js/);
 assert.match(html,/history-quick-nav\.js/);
 assert.doesNotMatch(html,/history-v8-3d\.js/);
 const installer=load('scripts/assemble-supplied-bgm.mjs');
 assert.match(installer,/installHistoryExamSources\(root\)/);
 assert.match(load('scripts/install-history-exam-sources.mjs'),/17af1a41c1c331883d1cf5d6189025835bd604642a4aa4a16601e2a35f4af265/);
});
