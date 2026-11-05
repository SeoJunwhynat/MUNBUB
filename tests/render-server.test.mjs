import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createAppServer} from '../server.js';

test('Render serves the game assets, routes APIs and blocks private files',async()=>{
  const server=createAppServer();
  await new Promise((resolve,reject)=>server.once('error',reject).listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  try{
    const home=await fetch(base+'/');
    assert.equal(home.status,200);
    assert.match(home.headers.get('content-type')||'',/text\/html/);
    const text=await home.text();
    assert.ok(text.length>10000,'complete game HTML is served');

    const ui=await fetch(base+'/ui-assets/scene_spelling.webp',{method:'HEAD'});
    assert.equal(ui.status,200);
    assert.match(ui.headers.get('content-type')||'',/image\/webp/);
    const music=await fetch(base+'/assets/bgm/home-new.mp3',{method:'HEAD'});
    assert.equal(music.status,200);
    assert.match(music.headers.get('content-type')||'',/audio\/mpeg/);

    const script=await fetch(base+'/munbub_duel_patch.js',{method:'HEAD'});
    assert.equal(script.status,200);
    assert.match(script.headers.get('content-type')||'',/javascript/);

    for(const p of ['/hard_answer_hashes.json','/lib/mb-server.js',
      '/server.js','/scripts/migrate-blob-to-postgres.mjs',
      '/%2e%2e%2fapi%2faccount.js','/.env','/api/not-real']){
      const res=await fetch(base+p);
      assert.equal(res.status,404,p+' is hidden');
    }

    const ping=await fetch(base+'/healthz');
    assert.equal(ping.status,200);
    assert.equal((await ping.json()).status,'up');

    const account=await fetch(base+'/api/account');
    assert.ok([200,503].includes(account.status));
    assert.match(account.headers.get('content-type')||'',/json/);

    const bad=await fetch(base+'/api/account',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:'{not json'
    });
    assert.equal(bad.status,400);
    assert.match((await bad.json()).error,/Invalid JSON body/);
  }finally{
    await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
  }
});
