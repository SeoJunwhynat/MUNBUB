import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer as rawServer} from 'node:http';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../server.js',import.meta.url),'utf8');

test('CDN whitelist includes only public media, with core history blocked before redirects',()=>{
 const whitelist=source.split('function isPublicMedia(pathname)')[1]?.split('async function checkMediaCdn()')[0];
 assert.ok(whitelist,'CDN public media whitelist exists');
 for(const part of [String.raw`assets\/bgm`,String.raw`assets\/history-exam`,String.raw`ui-assets`,String.raw`backrooms\/assets`]){
  assert.ok(whitelist.includes(part),'missing public-media pattern '+part);
 }
 assert.match(source,/media-health\.json/);
 assert.match(source,/data\?\.musicCount>=49&&data\?\.historyImages===186/);
 assert.match(source,/if\(!mediaCdnHealthy\)return false/);
 assert.match(source,/res\.writeHead\(307,/);
 const splitGuard=source.indexOf("if(process.env.MB_SERVICE_ROLE!=='study')");
 const redirect=source.indexOf('if(redirectPublicMedia(req,res,pathname,url))return');
 const api=source.indexOf("if(pathname.startsWith('/api/'))");
 assert.ok(splitGuard>=0&&redirect>splitGuard,'core study gate must precede CDN offload');
 assert.ok(api>redirect,'CDN check must occur before API routing');
 assert.doesNotMatch(source,/^.*redirectPublicMedia\(req,res,pathname,url\).*\/api\/account/m);
});

test('Media CDN redirects verified public assets, never re-exposes core historical resources',async()=>{
 const previousCdn=process.env.MB_MEDIA_CDN_ORIGIN;
 const previousRole=process.env.MB_SERVICE_ROLE;
 const fake=rawServer((req,res)=>{
  if(req.url==='/media-health.json'){
   res.writeHead(200,{'Content-Type':'application/json'});
   return res.end(JSON.stringify({status:'ok',mediaHost:true,musicCount:49,historyImages:186}));
  }
  res.writeHead(200).end('static');
 });
 let core,study;
 try{
  await new Promise((resolve,reject)=>fake.once('error',reject).listen(0,'127.0.0.1',resolve));
  const origin='http://127.0.0.1:'+fake.address().port;
  process.env.MB_MEDIA_CDN_ORIGIN=origin;
  delete process.env.MB_SERVICE_ROLE;
  // Import only after setting the fake CDN; the Node test runner isolates test files.
  const {createAppServer}=await import('../server.js');
  core=createAppServer();
  await new Promise((resolve,reject)=>core.once('error',reject).listen(0,'127.0.0.1',resolve));
  const coreUrl='http://127.0.0.1:'+core.address().port;
  const head=(url,path)=>fetch(url+path,{method:'HEAD',redirect:'manual'});

  // Before CDN verification a missing local asset may correctly return 404.
  const first=await head(coreUrl,'/assets/bgm/main.mp3');
  assert.ok([200,307,404].includes(first.status),'CDN fallback response must be safe');
  let music;
  for(let i=0;i<40;i++){
   music=await head(coreUrl,'/assets/bgm/main.mp3?v=testing');
   if(music.status===307)break;
   await new Promise(resolve=>setTimeout(resolve,30));
  }
  assert.equal(music?.status,307,'verified CDN must redirect public music');
  assert.equal(music.headers.get('location'),origin+'/assets/bgm/main.mp3?v=testing');

  for(const path of ['/api/account','/assets/bgm/_incoming/private.zip',
   '/lib/mb-server.js','/backrooms/server.js']){
   const r=await head(coreUrl,path);
   assert.notEqual(r.status,307,'private route must never redirect '+path);
  }
  for(const path of ['/history-story-v7.html','/assets/history-exam/images/s000.png',
   '/api/history-side','/social-study.html']){
   const r=await head(coreUrl,path);
   assert.equal(r.status,404,'core deployment must block '+path);
  }
  for(const path of ['/backrooms/assets/monsters/spelling_monster_v321_high.glb',
   '/ui-assets/ranked-stage-final.png']){
   const r=await head(coreUrl,path);
   assert.equal(r.status,307,'public core asset should offload '+path);
   assert.equal(r.headers.get('location'),origin+path);
  }

  process.env.MB_SERVICE_ROLE='study';
  study=createAppServer();
  await new Promise((resolve,reject)=>study.once('error',reject).listen(0,'127.0.0.1',resolve));
  const studyUrl='http://127.0.0.1:'+study.address().port;
  const story=await head(studyUrl,'/history-story-v7.html');
  assert.equal(story.status,200,'the preserved history page remains available in study mode');
  const image=await head(studyUrl,'/assets/history-exam/images/s000.png');
  assert.equal(image.status,307,'verified history asset may offload in study mode');
  assert.equal(image.headers.get('location'),origin+'/assets/history-exam/images/s000.png');
 }finally{
  await Promise.all([core,study,fake].filter(Boolean).filter(s=>s.listening).map(
   server=>new Promise(resolve=>server.close(resolve))
  ));
  if(previousCdn===undefined)delete process.env.MB_MEDIA_CDN_ORIGIN;
  else process.env.MB_MEDIA_CDN_ORIGIN=previousCdn;
  if(previousRole===undefined)delete process.env.MB_SERVICE_ROLE;
  else process.env.MB_SERVICE_ROLE=previousRole;
 }
});

test('CDN whitelist excludes private APIs and ZIP uploads',()=>{
 const segment=source.split('function isPublicMedia(pathname)')[1].split('async function checkMediaCdn()')[0];
 assert.ok(!segment.includes('zip'));
 assert.ok(!segment.includes('api/'));
 assert.ok(segment.includes(String.raw`\.mp3`));
 assert.ok(segment.includes(String.raw`\.glb`));
});
