import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const load=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
test('The uploaded 186-source manifest hash is pinned and checked before publishing',()=>{
 const src=load('scripts/install-history-exam-sources.mjs');
 assert.match(src,/17af1a41c1c331883d1cf5d6189025835bd604642a4aa4a16601e2a35f4af265/);
 assert.match(src,/sha\(png\)!==item\.sha256/);
 assert.match(src,/info\.total!==186/);
 assert.match(src,/186 installed, 0 awaiting/);
});
test('Source gallery uses specific textbook captions for original maps, conference photos, and documents',()=>{
 const media=load('history-exam-media.js');
 const data=load('history-exam-uploaded-data.js');
 assert.doesNotThrow(()=>new Script(media));
 assert.match(media,/return c\[n\]\|\|installed\.find/);
 assert.match(media,/curated\?\{\.\.\.x,caption:curated\}:x/);
 for(const term of ['카이로 회담','얄타 회담','포츠담 선언','항복문서','186'])assert.ok(data.includes(term));
});
