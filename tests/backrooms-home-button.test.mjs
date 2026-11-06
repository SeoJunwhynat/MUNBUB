import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('home Backrooms button renders the actual uploaded neon image with preserved ratio',()=>{
 const script=readFileSync(new URL('../munbub_backrooms_entry_20261106.js',import.meta.url),'utf8');
 const file=readFileSync(new URL('../ui-assets/backrooms-entry-neon.png',import.meta.url));
 assert.equal(file.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(file.readUInt32BE(16),420);assert.equal(file.readUInt32BE(20),140);
 assert.match(script,/art\.src='\/ui-assets\/backrooms-entry-neon\.png\?v=20261106b'/);
 assert.match(script,/aspect-ratio:3\/1!important/);
 assert.match(script,/art\.addEventListener\('error'/);
 assert.match(script,/window\.location\.assign\('\/backrooms\/'\)/);
 assert.match(script,/hardcore\.insertAdjacentElement\('afterend',holder\)/);
 assert.match(script,/btn\.append\(art\)/);
});
