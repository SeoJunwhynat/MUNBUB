/* Vercel static CDN build: no accounts, secrets or Node API shipped publicly.
 * Copies static binary blobs from the dedicated source snapshot,
 * verifies user-supplied BGM and textbook ZIPs before extracting,
 * then removes every installer, source ZIP and hidden file.
 */
import { cp, mkdir, rm, readFile, readdir, writeFile, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
const target=join(root,'dist');
const source=join(root,'source');
await rm(target,{recursive:true,force:true});
await mkdir(target,{recursive:true});
for(const dir of ['assets','ui-assets'])await cp(join(source,dir),join(target,dir),{recursive:true});
await mkdir(join(target,'backrooms'),{recursive:true});
await cp(join(source,'backrooms','assets'),join(target,'backrooms','assets'),{recursive:true});
await cp(join(root,'_tools'),join(target,'scripts'),{recursive:true});
await import(pathToFileURL(join(target,'scripts','assemble-supplied-bgm.mjs')).href);
const music=JSON.parse(await readFile(join(target,'assets','bgm','catalog.json'),'utf8'));
const images=JSON.parse(await readFile(join(target,'assets','history-exam','catalog.json'),'utf8'));
if(!Array.isArray(music.tracks)||music.tracks.length<49)throw Error('CDN build missing some expected MP3 tracks');
if(images.total!==186||images.items?.length!==186)throw Error('CDN build missing 186 original exam images');
for(const file of music.tracks)await stat(join(target,file));
for(const image of images.items)await stat(join(target,'assets','history-exam','images',image.file));
for(const dir of ['scripts','assets/bgm/_incoming','assets/bgm/_encoded','assets/history-exam/_incoming'])
 await rm(join(target,dir),{recursive:true,force:true});
await writeFile(join(target,'index.html'),'<!doctype html><html lang="ko"><meta charset="utf-8"><title>맛춘범 정적 파일 서버</title><body><h1>맛춘범 미디어 전용 CDN</h1><p>로그인·게임 서버는 분리되어 있습니다.</p></body></html>\n');
await writeFile(join(target,'media-health.json'),JSON.stringify({status:'ok',mediaHost:true,musicCount:music.tracks.length,historyImages:images.total,build:'static-cdn-v1'})+'\n');
const glb=(await readdir(join(target,'backrooms','assets','monsters'))).filter(x=>x.endsWith('.glb'));
console.log('STATIC_CDN_READY: '+music.tracks.length+' MP3, '+images.total+' study images, '+glb.length+' GLB models');
