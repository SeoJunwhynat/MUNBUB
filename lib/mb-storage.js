/**
 * Render JSON persistence backed exclusively by Neon PostgreSQL.
 * No Vercel Blob traffic is generated during normal gameplay.
 * The optional one-time migration script remains isolated under scripts/.
 */
import { neon } from '@neondatabase/serverless';

let client, tableReady, chatReady;
const dbURL=()=>process.env.DATABASE_URL||'';
export const usingPostgres=()=>Boolean(dbURL());

async function database() {
  const url=dbURL();
  if(!url)throw Error('DATABASE_URL is not set');
  if(!client)client=neon(url);
  if(!tableReady){
    tableReady=client.query(
      'CREATE TABLE IF NOT EXISTS mb_objects (pathname text PRIMARY KEY, body jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT NOW(), updated_at timestamptz NOT NULL DEFAULT NOW())'
    ).catch(error=>{tableReady=null;throw error});
  }
  await tableReady;
  return client;
}

async function query(text,params=[]){
  const db=await database();
  return db.query(text,params);
}

/** Durable global chat uses the same Render-linked Neon store as accounts. */
export async function chatQuery(sql,params=[]){
 if(!chatReady){
  chatReady=(async()=>{
   await query('CREATE TABLE IF NOT EXISTS mb_global_chat (id BIGSERIAL PRIMARY KEY, user_id TEXT NOT NULL, display_name VARCHAR(32) NOT NULL, body VARCHAR(300) NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
   await query('CREATE TABLE IF NOT EXISTS mb_global_chat_reports (message_id BIGINT NOT NULL REFERENCES mb_global_chat(id) ON DELETE CASCADE, reporter_id TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY(message_id,reporter_id))');
  })().catch(error=>{chatReady=null;throw error});
 }
 await chatReady;
 return query(sql,params);
}

export async function checkStorage(){
  await query('SELECT 1 AS ok');
  return {backend:'postgres',readable:true,writeTested:false};
}

export async function readJson(path){
  const rows=await query('SELECT body FROM mb_objects WHERE pathname = $1',[path]);
  return rows[0]?.body??null;
}

export async function readJsonMany(paths){
  if(!paths.length)return [];
  const rows=await query(
    'SELECT pathname,body FROM mb_objects WHERE pathname = ANY($1::text[])',[paths]);
  const map=new Map(rows.map(row=>[row.pathname,row.body]));
  return paths.map(path=>map.get(path)??null);
}

export async function writeJson(path,data,{overwrite=false}={}){
  const payload=JSON.stringify(data);
  const rows=overwrite
    ?await query('INSERT INTO mb_objects(pathname,body) VALUES ($1,$2::jsonb) ON CONFLICT(pathname) DO UPDATE SET body=EXCLUDED.body,updated_at=NOW() RETURNING pathname',[path,payload])
    :await query('INSERT INTO mb_objects(pathname,body) VALUES ($1,$2::jsonb) ON CONFLICT(pathname) DO NOTHING RETURNING pathname',[path,payload]);
  if(!rows.length){
    const error=Error('409 AlreadyExists');
    error.name='StorageConflict';
    throw error;
  }
  return {pathname:rows[0].pathname};
}

export async function put(path,content,options={}){
  const data=typeof content==='string'?JSON.parse(content):content;
  return writeJson(path,data,{overwrite:options.allowOverwrite===true});
}

export async function del(paths){
  const values=Array.isArray(paths)?paths:[paths];
  if(values.length)await query(
    'DELETE FROM mb_objects WHERE pathname = ANY($1::text[])',[values]);
}

export async function list(options={}){
  const limit=Math.max(1,Math.min(1000,Number(options.limit)||1000));
  const prefix=String(options.prefix||'');
  let after='';
  if(options.cursor){
    try{after=Buffer.from(String(options.cursor),'base64url').toString('utf8')}
    catch{throw Error('Invalid cursor')}
  }
  const rows=await query(
    'SELECT pathname,updated_at FROM mb_objects WHERE left(pathname,length($1::text))=$1 AND pathname>$2 ORDER BY pathname ASC LIMIT $3',
    [prefix,after,limit+1]
  );
  const visible=rows.slice(0,limit);
  return {
    blobs:visible.map(r=>({pathname:r.pathname,uploadedAt:new Date(r.updated_at).toISOString()})),
    hasMore:rows.length>limit,
    cursor:rows.length>limit&&visible.length?
      Buffer.from(visible.at(-1).pathname).toString('base64url'):undefined
  };
}

export async function readRecords(prefix,limit=1000){
  const rows=await query(
    'SELECT body FROM mb_objects WHERE left(pathname,length($1::text))=$1 ORDER BY pathname ASC LIMIT $2',
    [prefix,Math.max(1,Math.min(1000,limit))]
  );
  return rows.map(r=>r.body);
}
