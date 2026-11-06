/**
 * Render adapter for the existing Vercel-style /api modules.
 * Node >=22, no Express dependency. Keeps the exact routes and request formats.
 * Login, rankings, duels and public rooms still require a configured Vercel Blob token.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import backroomsRelay from './backrooms/server.js';
import { session, sameOrigin } from './lib/mb-server.js';
const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)));
const handlers = new Map();
const apiRoutes = new Set(['account','duel','health','leaderboard','public-arena','public-rooms','ranked','score']);
const mime = {
  '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8',
  '.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg',
  '.gif':'image/gif','.svg':'image/svg+xml','.ico':'image/x-icon',
  '.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg','.woff2':'font/woff2',
  '.webm':'video/webm',
};
const hiddenPrefixes=['/api/','/lib/','/tests/','/.','/node_modules/'];
const prohibitedFiles = new Set(['package.json','package-lock.json','render.yaml','vercel.json','server.js','hard_answer_hashes.json','idiom_final_100.json']);
function json(res,code,value){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));}
function adapt(res){
  res.status=function(code){res.statusCode=code;return res;};
  res.json=function(value){if(!res.headersSent)res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(value));return res;};
  res.send=function(value){res.end(value);return res;};
  return res;
}
async function parseBody(req){
  if(req.method!=='POST' && req.method!=='PUT' && req.method!=='PATCH')return undefined;
  let chunks=[],total=0;
  for await(const chunk of req){total+=chunk.length;if(total>1024*1024){const error=new Error('Request too large');error.status=413;throw error;}chunks.push(chunk);}
  if(!chunks.length)return {};
  const str=Buffer.concat(chunks).toString('utf8');
  if(!req.headers['content-type']?.includes('application/json'))return str;
  try{return JSON.parse(str);}catch{const error=new Error('Invalid JSON body');error.status=400;throw error;}
}
async function handle(req,res){
  adapt(res);
  let url;
  try{url=new URL(req.url,'http://localhost')}catch{return json(res,400,{error:'Bad URL'})}
  let pathname;
  try{pathname=decodeURIComponent(url.pathname)}catch{return json(res,400,{error:'Bad URL encoding'})}
  if(pathname.includes('\\')||pathname.includes('\0')||pathname.split('/').includes('..'))return json(res,404,{error:'Not found'});
  if(pathname==='/healthz')return json(res,200,{status:'up'});
  if(pathname==='/moved'){
    const page='<!doctype html><html lang="ko"><meta charset="utf-8"><meta http-equiv="refresh" content="2;url=/"><title>이전되었습니다</title><body>맛춘범은 Render로 이전되었습니다. <a href="/">홈으로 이동</a></body></html>';
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});return res.end(page);
  }
  if(pathname==='/backrooms'||pathname==='/backrooms/'){
    if(req.method!=='GET'&&req.method!=='HEAD')return json(res,405,{error:'GET only'});
    const filename=resolve(ROOT,'backrooms/index.html');const f=await stat(filename);
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Content-Length':f.size,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'});
    if(req.method==='HEAD')return res.end();
    return createReadStream(filename).pipe(res);
  }
  if(pathname.startsWith('/backrooms/api/')){
    if(req.method!=='GET'&&req.method!=='POST'&&req.method!=='OPTIONS')return json(res,405,{error:'허용되지 않은 방식이야.'});
    if(req.method==='OPTIONS')return json(res,405,{error:'허용되지 않은 방식이야.'});
    if(req.method==='POST'&&!sameOrigin(req))return json(res,403,{error:'잘못된 요청 출처야.'});
    const identity=session(req);
    if(!identity)return json(res,401,{ok:false,error:'맛춘범에 로그인해야 협동 모드를 사용할 수 있어.'});
    // Never trust browser-supplied nicknames: bind every session to a signed taste account ID.
    req._mbBackroomsUser={id:identity.id,name:identity.name};
    req.url=req.url.replace(/^\/backrooms(?=\/api\/)/,'');
    backroomsRelay.server.emit('request',req,res);
    return;
  }
  if(pathname.startsWith('/api/')){
    const name=pathname.slice(5);
    if(!apiRoutes.has(name))return json(res,404,{error:'API route not found'});
    req.query=Object.fromEntries(url.searchParams.entries());
    try{
      req.body=await parseBody(req);
      if(!handlers.has(name))handlers.set(name,(await import(`./api/${name}.js`)).default);
      return await handlers.get(name)(req,res);
    }catch(e){
      if(res.headersSent){res.end();return;}
      console.error('API failed:',name,e?.message||'unknown error');
      return json(res,e.status||500,{error:e.status?e.message:'서버 내부 오류가 발생했어.'});
    }
  }
  // Keep answers and private coop server files inaccessible over HTTP.
  if(pathname.startsWith('/backrooms/')){
    // Only expose explicitly approved game assets, never answers or server code.
    const publicAsset=/^\/backrooms\/(?:assets\/(?:jumpscare\/[A-Za-z0-9_.-]+\.gif|sfx\/[A-Za-z0-9_.-]+\.(?:mp3|wav|ogg)|monsters\/[A-Za-z0-9_.-]+\.glb)|src\/[A-Za-z0-9_.-]+\.mjs)$/i;
    if(!publicAsset.test(pathname))return json(res,404,{error:'Not found'});
    if(req.method!=='GET'&&req.method!=='HEAD')return json(res,405,{error:'GET only'});
    const filePath=resolve(ROOT,pathname.replace(/^\/+/, ''));
    if(!filePath.startsWith(ROOT+sep))return json(res,404,{error:'Not found'});
    let asset;
    try{asset=await stat(filePath)}catch{return json(res,404,{error:'Not found'})}
    if(!asset.isFile())return json(res,404,{error:'Not found'});
    const assetExt=extname(filePath).toLowerCase();
    const assetType=assetExt==='.glb'?'model/gltf-binary':
      assetExt==='.mjs'?'text/javascript; charset=utf-8':mime[assetExt];
    if(!assetType)return json(res,404,{error:'Not found'});
    res.writeHead(200,{'Content-Type':assetType,'Content-Length':asset.size,
      'Cache-Control':'public, max-age=300','X-Content-Type-Options':'nosniff'});
    if(req.method==='HEAD')return res.end();
    return createReadStream(filePath).on('error',()=>res.destroy()).pipe(res);
  }
  if(req.method!=='GET'&&req.method!=='HEAD')return json(res,405,{error:'GET only'});
  if(pathname==='/'||pathname==='')pathname='/index.html';
  const rel=pathname.replace(/^\/+/,''),ext=extname(rel).toLowerCase();
  if(hiddenPrefixes.some(p=>pathname.startsWith(p))||rel.split('/').some(s=>s.startsWith('.'))||prohibitedFiles.has(rel)||!mime[ext])return json(res,404,{error:'Not found'});
  const path=resolve(ROOT,rel);
  if(!path.startsWith(ROOT+sep)&&path!==ROOT)return json(res,404,{error:'Not found'});
  let file;
  try{file=await stat(path)}catch{return json(res,404,{error:'Not found'})}
  if(!file.isFile())return json(res,404,{error:'Not found'});
  const cache=ext==='.html'?'no-store':'public, max-age=300';
  res.writeHead(200,{'Content-Type':mime[ext],'Content-Length':file.size,'Cache-Control':cache,'X-Content-Type-Options':'nosniff'});
  if(req.method==='HEAD')return res.end();
  createReadStream(path).on('error',()=>res.destroy()).pipe(res);
}
export function createAppServer(){return createServer((req,res)=>{handle(req,res).catch(e=>{console.error('Unexpected error',e.message);if(!res.headersSent)json(res,500,{error:'Unexpected error'});else res.destroy();});});}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){const port=Number(process.env.PORT)||3000;const server=createAppServer();server.listen(port,'0.0.0.0',()=>console.log(`Matchunbeom Render adapter listening on ${port}`));}
