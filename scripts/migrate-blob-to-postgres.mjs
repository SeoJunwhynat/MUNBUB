/**
 * One-time, COPY-ONLY backup of account and leaderboard records.
 * Usage (trusted local machine only):
 *   DATABASE_URL=... BLOB_READ_WRITE_TOKEN=... node scripts/migrate-blob-to-postgres.mjs
 *
 * No record is deleted or overwritten. Requires the old Blob store to be accessible.
 * Run only after existing data is backed up and quota restrictions are lifted.
 */
import { get, list } from '@vercel/blob';
import { writeJson, usingPostgres } from '../lib/mb-storage.js';

const token=process.env.BLOB_READ_WRITE_TOKEN;
if(!usingPostgres()||!token)throw Error('Both DATABASE_URL and BLOB_READ_WRITE_TOKEN are required');
const prefixes=['names/','profiles/','rankings/','scores/'];
let imported=0,skipped=0;
for(const prefix of prefixes){
 let cursor;
 let count=0;
 do {
  const result=await list({prefix,limit:100,token,...(cursor?{cursor}:{})});
  for(const blob of result.blobs){
   const file=await get(blob.pathname,{access:'private',token,useCache:false});
   if(!file||file.statusCode!==200)throw Error('Unable to read old object; original store may be limited');
   const data=JSON.parse(await new Response(file.stream).text());
   try {await writeJson(blob.pathname,data);imported++;count++}
   catch(error){
    if(error?.name==='StorageConflict'){skipped++;continue}
    throw error;
   }
  }
  cursor=result.hasMore?result.cursor:undefined;
 }while(cursor);
 console.log(prefix+': copied '+count+' records');
}
console.log('Copy completed: '+imported+' copied; '+skipped+' already present. Originals preserved.');
