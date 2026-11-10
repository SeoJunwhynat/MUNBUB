/** Reconstruct the four user-supplied MP3 tracks losslessly during Render builds.
 * Each GitHub-safe source part stores a segment of the original base64 bytes.
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const tracks = [
  {"file":"Behind_the_Organ_Pipes.mp3","parts":8,"bytes":3979035,"sha256":"c28da978c4667abd05cb63ab91ad1e651b0acbf0ebde0cff65acce826126ac17"},
  {"file":"Beneath_the_Painted_Arch.mp3","parts":9,"bytes":4242979,"sha256":"efdd25964965f2e33ceeb3e9f7b032e9924e45d5da7d8a9ef82b47012d03c886"},
  {"file":"The_Final_Sugar_Rush.mp3","parts":9,"bytes":4327616,"sha256":"551801f81cd13650fbca6fcab11dbc3c283ef806a6f08a3bd1c7d32cf75a7a41"},
  {"file":"Evening_Rain_On_Paper.mp3","parts":9,"bytes":4304419,"sha256":"56fcc92b5ea5c1a57f00f3910bfce977c91a46c7f79fda91c9a77e189740ef40"}
];
for (const {file,parts,bytes,sha256} of tracks) {
  const encoded=[];
  for (let i=0;i<parts;i++) {
    const part=await readFile(join(root,'assets','bgm','_encoded',`${file}.b64.${String(i).padStart(3,'0')}`),'utf8');
    if (!/^[A-Za-z0-9+/=]+$/.test(part)) throw Error(`Invalid base64 source for ${file} part ${i}`);
    encoded.push(part);
  }
  const data=Buffer.from(encoded.join(''),'base64');
  const hash=createHash('sha256').update(data).digest('hex');
  if (data.length!==bytes || hash!==sha256) throw Error(`BGM integrity mismatch for ${file}`);
  const output=join(root,'assets','bgm',file);
  await mkdir(dirname(output),{recursive:true});
  await writeFile(output,data);
  console.log(`BGM OK: ${file} (${data.length} bytes, SHA256 verified)`);
}

// Apply only successfully verified uploaded music ZIPs. Existing files are overwritten on purpose.
const {installHistoryPacks}=await import('./install-history-music-packs.mjs');
await installHistoryPacks(root);

// Publish only files present at build time, never placeholders or missing MP3s.
// Updating the repo assets automatically enables new songs on the next Render build.
const bgmDir=join(root,'assets','bgm');
const files=(await readdir(bgmDir,{withFileTypes:true}))
  .filter(e=>e.isFile()&&/^[A-Za-z0-9_-]+\.mp3$/i.test(e.name))
  .map(e=>'assets/bgm/'+e.name).sort();
// Hashes invalidate the browser's old music cache when audio bytes are overwritten.
const hashes={};
for(const file of files){
 const contents=await readFile(join(root,file));
 hashes[file]=createHash('sha256').update(contents).digest('hex').slice(0,16);
}
await writeFile(join(bgmDir,'catalog.json'),JSON.stringify({tracks:files,hashes},null,2)+'\n');
console.log('BGM catalog OK: '+files.length+' installed MP3 tracks');
