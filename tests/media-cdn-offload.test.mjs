import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer as rawServer} from 'node:http';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../server.js',import.meta.url),'utf8');

test('safe whitelist offloads only public music, study images, UI pictures and game media',()=>{
 assert.match(source,/function isPublicMedia\(pathname\)/);
 for(const prefix of ['assets\\\\/bgm','assets\\\\/history-exam','ui-assets','backrooms\\\\/assets'])assert.ok(source.includes(prefix),'missing allowed path prefix '+prefix);
 assert.match(source,/\\/media-health\.json/);
 assert.match(source,/data\?\.musicCount>=49&&data\?\.historyImages===186/);
 assert.match(source,/if\(!mediaCdnHealthy\)return false/);
 assert.match(source,/res\.writeHead\(307,/);
 assert.match(source,/if\(redirectPublicMedia\(req,res,pathname,url\)\)return/);
 assert.ok(source.indexOf("if(redirectPublicMedia(req,res,pathname,url))return")<source.indexOf("if(pathname.startsWith('/api/'))"));
 assert.doesNotMatch(source,/^.*redirectPublicMedia\(req,res,pathname,url\).*\/api\/account/m);
});

test('Media CDN responds with a real 307 to verified host only; private paths and HTML stay local',async()=>{
 const fake=rawServer((req,res)=>{
  if(req.url==='/media-health.json'){
   res.writeHead(200,{'Content-Type':'application/json'});
   return res.end(JSON.stringify({status:'ok',mediaHost:true,musicCount:49,historyImages:186}));
  }
  res.writeHead(200).end('static');
 });
 await new Promise(resolve=>fake.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+fake.address().port;
 process.env.MB_MEDIA_CDN_ORIGIN=origin;
 // Dynamic import after setting env; the test runner isolates files.
 const {createAppServer}=await import('../server.js');
 const app=createAppServer();
 await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+app.address().port;
 const head=path=>fetch(base+path,{method:'HEAD',redirect:'manual'});
 try{
  const first=await head('/assets/bgm/main.mp3');
  assert.ok([200,307].includes(first.status),'local fallback must be safe');
  let result;
  for(let i=0;i<15;i++){
   await new Promise(resolve=>setTimeout(resolve,30));
   result=await head('/assets/bgm/main.mp3?v=testing');
   if(result.status===307)break;
  }
  assert.equal(result?.status,307,'verified media must redirect to CDN');
  assert.equal(result.headers.get('location'),origin+'/assets/bgm/main.mp3?v=testing');
  for(const path of ['/api/account','/assets/bgm/_incoming/private.zip','/lib/mb-server.js','/backrooms/server.js']){
   const r=await head(path);
   assert.notEqual(r.status,307,'must never redirect sensitive route '+path);
  }
  const glb=await head('/backrooms/assets/monsters/spelling_monster_v321_high.glb');
  assert.equal(glb.status,307);
  assert.equal(glb.headers.get('location'),origin+'/backrooms/assets/monsters/spelling_monster_v321_high.glb');
  const image=await head('/ui-assets/ranked-stage-final.png');
  assert.equal(image.status,307);
  const history=await head('/assets/history-exam/images/s000.png');
  assert.equal(history.status,307);
 }finally{
  await Promise.all([new Promise(resolve=>app.close(resolve)),new Promise(resolve=>fake.close(resolve))]);
 }
});

test('CDN never serves authentication, ranked APIs, or zipped upload sources through redirect',()=>{
 const segment=source.split('function isPublicMedia(pathname)')[1].split('async function checkMediaCdn()')[0];
 assert.ok(!segment.includes('zip'));
 assert.ok(!segment.includes('api/'));
 assert.match(segment,/\\.mp3/);
 assert.match(segment,/\\.glb/);
});
