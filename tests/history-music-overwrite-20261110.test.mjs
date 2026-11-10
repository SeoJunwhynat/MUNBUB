import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {EXPECTED_MUSIC_PACKS,parseStoredZip,installHistoryPacks} from '../scripts/install-history-music-packs.mjs';
import {readFileSync} from 'node:fs';
const load=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');

test('all 18 user recordings have distinct verified hashes and nine original/(1) pairs',()=>{
 const entries=Object.values(EXPECTED_MUSIC_PACKS).flat();
 assert.equal(Object.keys(EXPECTED_MUSIC_PACKS).length,3);
 assert.equal(entries.length,18);
 assert.equal(new Set(entries.map(x=>x[0])).size,18);
 assert.equal(new Set(entries.map(x=>x[2])).size,18);
 for(const [file,bytes,hash] of entries){
  assert.match(file,/^[a-z0-9_-]+\.mp3$/);
  assert.ok(bytes>1_000_000);
  assert.match(hash,/^[0-9a-f]{64}$/);
 }
 const groups=new Map();
 for(const [file,,hash] of entries){
  const key=file.replace(/_[12]\.mp3$/,''),member=groups.get(key)||[];
  member.push([file,hash]);groups.set(key,member);
 }
 assert.equal(groups.size,9);
 for(const [name,member] of groups){
  assert.equal(member.length,2,name+' is not a pair');
  assert.notEqual(member[0][1],member[1][1],'must not deduplicate distinct audio '+name);
  assert.ok(member.some(x=>x[0].endsWith('_1.mp3')));
  assert.ok(member.some(x=>x[0].endsWith('_2.mp3')));
 }
});

function tinyZip(name,content){
 const file=Buffer.from(name),body=Buffer.from(content);
 const header=Buffer.alloc(30);
 header.writeUInt32LE(0x04034b50,0);
 header.writeUInt16LE(20,4);header.writeUInt16LE(0,6);header.writeUInt16LE(0,8);
 header.writeUInt32LE(body.length,18);header.writeUInt32LE(body.length,22);
 header.writeUInt16LE(file.length,26);
 return Buffer.concat([header,file,body,Buffer.from([0x50,0x4b,0x01,0x02])]);
}

test('build unpacks supplied stored ZIP, overwrites original files, and rejects bad replacement data',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'history-bgms-'));
 try{
  const bgm=join(dir,'assets','bgm'),incoming=join(bgm,'_incoming');
  await mkdir(incoming,{recursive:true});
  const filename='example_1.mp3',updated=Buffer.from('new distinct audio data');
  const hash=createHash('sha256').update(updated).digest('hex');
  const manifest={'sample.zip':[[filename,updated.length,hash]]};
  await writeFile(join(bgm,filename),'old binary audio');
  await writeFile(join(incoming,'sample.zip'),tinyZip(filename,updated));
  const entry=parseStoredZip(tinyZip(filename,updated));
  assert.deepEqual(entry.get(filename),updated);
  const logs=[];
  const result=await installHistoryPacks(dir,{log:m=>logs.push(m)},manifest);
  assert.deepEqual(result,{installed:1,awaiting:0});
  assert.deepEqual(await readFile(join(bgm,filename)),updated);
  assert.match(logs.join('\n'),/overwritten/);
  const bad={'sample.zip':[[filename,updated.length,hash.replace(/^./,'0')]]};
  await assert.rejects(installHistoryPacks(dir,{log(){}},bad),/SHA256 mismatch/);
 }finally{await rm(dir,{recursive:true,force:true})}
});
test('missing ZIPs never falsely publish new songs or break the music catalog',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'history-bgms-empty-'));
 try{
  await mkdir(join(dir,'assets','bgm','_incoming'),{recursive:true});
  const log=[];
  const r=await installHistoryPacks(dir,{log:m=>log.push(m)});
  assert.deepEqual(r,{installed:0,awaiting:18});
  assert.match(log.join('\n'),/awaiting/);
 }finally{await rm(dir,{recursive:true,force:true})}
});
test('music catalog hashes ensure new MP3 bytes do not reuse previous browser cache',()=>{
 const assemble=load('scripts/assemble-supplied-bgm.mjs');
 const korean=load('munbub_music_patch.js'),history=load('history-study-audio.js');
 assert.match(assemble,/installHistoryPacks\(root\)/);
 assert.match(assemble,/hashes\[file\]=createHash\('sha256'\)/);
 assert.match(assemble,/JSON\.stringify\(\{tracks:files,hashes\}/);
 assert.match(korean,/assetRevisions\.get\(t\[2\]\)/);
 assert.match(history,/assetRevisions\.get\(filename\)/);
 assert.match(korean,/NEW_PAIRS_20261110/);
 assert.match(history,/UPDATED_20261110/);
 for(const prefix of ['menu_drift','nostalgic_tape','triumphant_fanfare','mystic_adventure','history_journey','quiz_rhythm']){
  for(const digit of ['1','2']){
   assert.ok(korean.includes(prefix+'_'+digit+'.mp3'),prefix+' missing from spelling');
   assert.ok(history.includes(prefix+'_'+digit+'.mp3'),prefix+' missing from history');
  }
 }
 for(const prefix of ['late_night_study','magical_bookshelf','neon_loop']){
  for(const digit of ['1','2']){
   assert.ok(korean.includes(prefix+'_'+digit+'.mp3'));
   assert.ok(history.includes(prefix+'_'+digit+'.mp3'));
  }
 }
});
