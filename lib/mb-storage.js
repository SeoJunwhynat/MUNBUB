/**
 * Server-only JSON storage adapter.
 * DATABASE_URL -> Neon Postgres. If absent, retain the existing private Vercel Blob behavior.
 * The Neon store is intentionally isolated from Blob: old records remain untouched until
 * they can be explicitly imported after the original store's quota resets.
 */
import { neon } from '@neondatabase/serverless';
import { get as blobGet, put as blobPut, list as blobList, del as blobDel } from '@vercel/blob';

let client, tableReady;
const dbURL=()=>process.env.DATABASE_URL||process.env.POSTGRES_URL||'';
export const usingPostgres=()=>Boolean(dbURL());

async function database() {
  const url=dbURL();
  if (!url) throw Error('DATABASE_URL is not set');
  if (!client) client=neon(url);
  if (!tableReady) {
    tableReady=client(
      'CREATE TABLE IF NOT EXISTS mb_objects (pathname text PRIMARY KEY, body jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT NOW(), updated_at timestamptz NOT NULL DEFAULT NOW())'
    ).catch(error=>{ tableReady=null; throw error; });
  }
  await tableReady;
  return client;
}
async function query(text, params=[]) {
  const db=await database();
  return db(text,params);
}

export async function checkStorage() {
  if (usingPostgres()) {
    await query('SELECT 1 AS ok');
    return {backend:'postgres',readable:true,writeTested:false};
  }
  await blobList({prefix:'__mb_probe_never_exists__/',limit:1});
  return {backend:'blob',readable:true,writeTested:false};
}
export async function readJson(path, {fresh=false}={}) {
  if (!usingPostgres()) {
    const item=await blobGet(path,{access:'private',...(fresh?{useCache:false}:{})});
    if (!item) return null;
    if (item.statusCode!==200) throw Error('Blob read failed');
    return JSON.parse(await new Response(item.stream).text());
  }
  const rows=await query('SELECT body FROM mb_objects WHERE pathname = $1',[path]);
  return rows[0]?.body??null;
}
// One SQL query can fetch an entire room list instead of hundreds of individual network reads.
export async function readJsonMany(paths, options={}) {
  if (!paths.length) return [];
  if (!usingPostgres()) return Promise.all(paths.map(path=>readJson(path,options)));
  const rows=await query('SELECT pathname,body FROM mb_objects WHERE pathname = ANY($1::text[])',[paths]);
  const map=new Map(rows.map(row=>[row.pathname,row.body]));
  return paths.map(path=>map.get(path)??null);
}
export async function writeJson(path, data, {overwrite=false}={}) {
  if (!usingPostgres()) {
    return blobPut(path,JSON.stringify(data),{access:'private',addRandomSuffix:false,
      allowOverwrite:overwrite,contentType:'application/json'});
  }
  const payload=JSON.stringify(data);
  const rows=overwrite
    ?await query('INSERT INTO mb_objects(pathname,body) VALUES ($1,$2::jsonb) ON CONFLICT(pathname) DO UPDATE SET body=EXCLUDED.body,updated_at=NOW() RETURNING pathname',[path,payload])
    :await query('INSERT INTO mb_objects(pathname,body) VALUES ($1,$2::jsonb) ON CONFLICT(pathname) DO NOTHING RETURNING pathname',[path,payload]);
  if (!rows.length) {
    const error=Error('409 AlreadyExists');
    error.name='StorageConflict';
    throw error;
  }
  return {pathname:rows[0].pathname};
}
// Compatibility methods for the three API handlers that write/read raw Blob JSON.
export async function put(path, content, options={}) {
  const data=typeof content==='string'?JSON.parse(content):content;
  return writeJson(path,data,{overwrite:options.allowOverwrite===true});
}
export async function del(paths) {
  if (!usingPostgres()) return blobDel(paths);
  const values=Array.isArray(paths)?paths:[paths];
  if (values.length) await query('DELETE FROM mb_objects WHERE pathname = ANY($1::text[])',[values]);
}
export async function list(options={}) {
  if (!usingPostgres()) return blobList(options);
  const limit=Math.max(1,Math.min(1000,Number(options.limit)||1000));
  const prefix=String(options.prefix||'');
  let after='';
  if (options.cursor) {
    try {after=Buffer.from(String(options.cursor),'base64url').toString('utf8');}
    catch {throw Error('Invalid cursor');}
  }
  const rows=await query(
    'SELECT pathname,updated_at FROM mb_objects WHERE left(pathname,length($1::text))=$1 AND pathname>$2 ORDER BY pathname ASC LIMIT $3',
    [prefix,after,limit+1]
  );
  const visible=rows.slice(0,limit);
  return {
    blobs:visible.map(r=>({pathname:r.pathname,uploadedAt:new Date(r.updated_at).toISOString()})),
    hasMore:rows.length>limit,
    cursor:rows.length>limit&&visible.length?Buffer.from(visible.at(-1).pathname).toString('base64url'):undefined
  };
}
// One database query replaces hundreds of network reads for each leaderboard request.
export async function readRecords(prefix,limit=1000) {
  if (!usingPostgres()) {
    const pages=await list({prefix,limit});
    return Promise.all(pages.blobs.map(async entry=>{
      try {return await readJson(entry.pathname);}
      catch {return null;}
    }));
  }
  const rows=await query(
    'SELECT body FROM mb_objects WHERE left(pathname,length($1::text))=$1 ORDER BY pathname ASC LIMIT $2',
    [prefix,Math.max(1,Math.min(1000,limit))]
  );
  return rows.map(r=>r.body);
}
