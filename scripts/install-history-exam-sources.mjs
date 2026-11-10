/* Read only our user-provided 186-image ZIP_STORED snapshot (not a generic ZIP extractor).
 * Sanitizes paths, validates the pinned manifest SHA and every original PNG hash.
 * Missing upload is not a build failure; a published catalog means all images exist.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const ARCHIVE='history_exam_sources_186_20261110.zip';
const MANIFEST_SHA='17af1a41c1c331883d1cf5d6189025835bd604642a4aa4a16601e2a35f4af265';
const sha=b=>createHash('sha256').update(b).digest('hex');
export function readSourceZip(buffer){
 const found=new Map();
 let i=0;
 while(i+4<=buffer.length){
  const marker=buffer.readUInt32LE(i);
  if(marker===0x02014b50||marker===0x06054b50)break;
  if(marker!==0x04034b50||i+30>buffer.length)throw Error('Invalid historical source ZIP header');
  const flag=buffer.readUInt16LE(i+6),method=buffer.readUInt16LE(i+8);
  if(flag&8||method!==0)throw Error('Upload must use a stored ZIP without data descriptors');
  const size=buffer.readUInt32LE(i+18),expanded=buffer.readUInt32LE(i+22);
  const length=buffer.readUInt16LE(i+26),extra=buffer.readUInt16LE(i+28);
  const name=buffer.subarray(i+30,i+30+length).toString('utf8');
  const start=i+30+length+extra,end=start+size;
  if(!/^(manifest\.json|s\d{3}\.png)$/.test(name)||size!==expanded||
    end>buffer.length||found.has(name))throw Error('Invalid image file in user ZIP: '+name);
  found.set(name,buffer.subarray(start,end));i=end;
 }
 return found;
}
export async function installHistoryExamSources(root,log=console){
 const incoming=join(root,'assets','history-exam','_incoming',ARCHIVE);
 let bytes;
 try{bytes=await readFile(incoming)}catch(e){
  if(e?.code==='ENOENT'){
   log.log('History exam source images: 186 awaiting user upload archive');
   return {installed:0,awaiting:186};
  }
  throw e;
 }
 const files=readSourceZip(bytes);
 const manifestData=files.get('manifest.json');
 if(!manifestData||sha(manifestData)!==MANIFEST_SHA)throw Error('History exam image manifest checksum mismatch');
 const info=JSON.parse(manifestData.toString('utf8'));
 if(info.total!==186||info.items?.length!==186||files.size!==187)throw Error('History exam source count mismatch');
 for(let n=0;n<186;n++){
  const item=info.items[n],name='s'+String(n).padStart(3,'0')+'.png',png=files.get(name);
  if(item?.id!=='s'+String(n).padStart(3,'0')||item.file!==name||!png||
    item.size!==png.length||sha(png)!==item.sha256||
    png.length<500||png.readUInt32BE(0)!==0x89504e47)
    throw Error('Historical exam source mismatch '+name);
 }
 const publicDir=join(root,'assets','history-exam','images');
 await mkdir(publicDir,{recursive:true});
 for(let n=0;n<186;n++){
  const name='s'+String(n).padStart(3,'0')+'.png';
  await writeFile(join(publicDir,name),files.get(name));
 }
 const catalog={version:info.version,total:186,origin:info.origin,items:info.items.map(x=>({
  id:x.id,file:x.file,original:x.original,section:x.section,kind:x.kind,caption:x.caption
 }))};
 await writeFile(join(root,'assets','history-exam','catalog.json'),JSON.stringify(catalog)+'\n');
 log.log('History exam source images: 186 installed, 0 awaiting, original PNG SHA256 verified');
 return {installed:186,awaiting:0};
}
