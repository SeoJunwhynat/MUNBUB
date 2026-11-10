/**
 * Render adapter for the existing Vercel-style /api modules.
 * Node >=22, no Express dependency. Keeps the exact routes and request formats.
 * Login, rankings, duels and public rooms use the Render-linked Neon store.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createGzip } from 'node:zlib';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import backroomsRelay from './backrooms/server.js';
import { session, sameOrigin } from './lib/mb-server.js';
import {activeCount,pingPresence,forgetPresence} from './lib/mb-presence.js';
const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)));
const handlers = new Map();
const apiRoutes = new Set(['account','history-museum','history-story','history-ranked','duel','health','leaderboard','public-arena','public-rooms','ranked','score','chat']);
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
function sendPublicFile(req,res,filename,size,type,cache,extra={}){
  // Large HTML and JS previously transferred uncompressed (2.7MB home / 0.9MB Backrooms).
  // Compress on demand; leave binaries and clients without gzip support unchanged.
  const extension=extname(filename).toLowerCase();
  const compressible=['.html','.js','.mjs','.css','.json','.svg'].includes(extension)&&size>=8192;
  const gzip=compressible&&/\bgzip\b/i.test(String(req.headers['accept-encoding']||''));
  const headers={'Content-Type':type,'Cache-Control':cache,'X-Content-Type-Options':'nosniff','Vary':'Accept-Encoding',...extra};
  if(gzip)headers['Content-Encoding']='gzip';
  else headers['Content-Length']=size;
  res.writeHead(200,headers);
  if(req.method==='HEAD')return res.end();
  const input=createReadStream(filename).on('error',()=>res.destroy());
  return gzip?input.pipe(createGzip()).on('error',()=>res.destroy()).pipe(res):input.pipe(res);
}
function adapt(res){
  res.status=function(code){res.statusCode=code;return res;};
  res.json=function(value){if(!res.headersSent)res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(value));return res;};
  res.send=function(value){res.end(value);return res;};
  return res;
}
async function parseBody(req){
  if(!['POST','PUT','PATCH','DELETE'].includes(req.method))return undefined;
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
    return sendPublicFile(req,res,filename,f.size,'text/html; charset=utf-8','no-store',{'Referrer-Policy':'same-origin'});
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
  if(pathname==='/api/presence'){
    if(req.method==='GET'||req.method==='HEAD')return json(res,200,{online:activeCount()});
    if(req.method!=='POST'&&req.method!=='DELETE')return json(res,405,{error:'Method not allowed'});
    if(!sameOrigin(req))return json(res,403,{error:'Forbidden'});
    const body=await parseBody(req);
    const id=body&&typeof body==='object'&&body.id;
    if(typeof id!=='string'||!/^[A-Za-z0-9_-]{20,100}$/.test(id))return json(res,400,{error:'Invalid anonymous session'});
    if(req.method==='DELETE')return json(res,200,{online:forgetPresence(id)});
    const online=pingPresence(id,Date.now(),session(req)?.id||null);
    if(online===null)return json(res,429,{error:'Too many active sessions'});
    return json(res,200,{online});
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
    const publicAsset=/^\/backrooms\/(?:assets\/(?:jumpscare\/[A-Za-z0-9_.-]+\.gif|sfx\/[A-Za-z0-9_.-]+\.(?:mp3|wav|ogg)|monsters\/[A-Za-z0-9_.-]+\.glb)|src\/(?:[A-Za-z0-9_.-]+\.mjs|monster-nav\.js))$/i;
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
    return sendPublicFile(req,res,filePath,asset.size,assetType,'public, max-age=300');
  }
  if(req.method!=='GET'&&req.method!=='HEAD')return json(res,405,{error:'GET only'});
  // The standalone pixel subject launcher is the site entrance; /index.html remains the original complete Korean quiz game.
  if(pathname==='/'||pathname==='')pathname='/subject-select.html';
  const rel=pathname.replace(/^\/+/,''),ext=extname(rel).toLowerCase();
  if(hiddenPrefixes.some(p=>pathname.startsWith(p))||rel.split('/').some(s=>s.startsWith('.'))||prohibitedFiles.has(rel)||!mime[ext])return json(res,404,{error:'Not found'});
  const path=resolve(ROOT,rel);
  if(!path.startsWith(ROOT+sep)&&path!==ROOT)return json(res,404,{error:'Not found'});
  let file;
  try{file=await stat(path)}catch{return json(res,404,{error:'Not found'})}
  if(!file.isFile())return json(res,404,{error:'Not found'});
  const cache=['.html','.js','.mjs','.css'].includes(ext)?'no-cache, max-age=0, must-revalidate':'public, max-age=300';
  return sendPublicFile(req,res,path,file.size,mime[ext],cache);
}
export function createAppServer(){return createServer((req,res)=>{handle(req,res).catch(e=>{console.error('Unexpected error',e.message);if(!res.headersSent)json(res,500,{error:'Unexpected error'});else res.destroy();});});}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){const port=Number(process.env.PORT)||3000;const server=createAppServer();server.keepAliveTimeout=65000;server.headersTimeout=66000;server.listen(port,'0.0.0.0',()=>console.log(`Matchunbeom Render adapter listening on ${port}`));}
