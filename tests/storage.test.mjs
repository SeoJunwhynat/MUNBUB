import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

// Test the real adapter with an isolated in-memory SQL driver, not live user records.
async function fixture(databaseEnabled=true) {
  const records=new Map();
  let blobCalls=0;
  let sqlCalls=0;
  const sql=async (statement,params=[])=>{
    sqlCalls++;
    const query=String(statement);
    if(query.startsWith('CREATE TABLE'))return [];
    if(query.startsWith('SELECT 1'))return [{ok:1}];
    if(query.includes('INSERT INTO mb_objects')){
      const [path,text]=params;
      if(!query.includes('DO UPDATE')&&records.has(path))return [];
      const previous=records.get(path);
      records.set(path,{pathname:path,body:JSON.parse(text),
        updated_at:new Date().toISOString(),created_at:previous?.created_at||new Date().toISOString()});
      return [{pathname:path}];
    }
    if(query.includes('WHERE pathname = ANY')&&query.startsWith('SELECT')){
      const [paths]=params;
      return [...records.values()].filter(x=>paths.includes(x.pathname));
    }
    if(query.startsWith('SELECT body FROM mb_objects WHERE pathname =')){
      const row=records.get(params[0]);
      return row?[{body:row.body}]:[];
    }
    if(query.startsWith('SELECT pathname,updated_at')){
      const [prefix,after,limit]=params;
      return [...records.values()].filter(x=>x.pathname.startsWith(prefix)&&x.pathname>after)
        .sort((a,b)=>a.pathname.localeCompare(b.pathname)).slice(0,limit);
    }
    if(query.startsWith('SELECT body FROM mb_objects WHERE left')){
      const [prefix,limit]=params;
      return [...records.values()].filter(x=>x.pathname.startsWith(prefix))
        .sort((a,b)=>a.pathname.localeCompare(b.pathname)).slice(0,limit).map(x=>({body:x.body}));
    }
    if(query.startsWith('DELETE FROM mb_objects')){
      for(const path of params[0])records.delete(path);
      return [];
    }
    throw Error('Unrecognized SQL in fake driver: '+query.slice(0,100));
  };
  const blobMap=new Map();
  const blob={
    get:async path=>{blobCalls++;const x=blobMap.get(path);return x?{
      statusCode:200,stream:new Response(JSON.stringify(x)).body
    }:null;},
    put:async(path,data,opt={})=>{blobCalls++;
      if(blobMap.has(path)&&!opt.allowOverwrite)throw Error('Already exists');
      blobMap.set(path,JSON.parse(data));return {pathname:path};
    },
    list:async({prefix=''})=>{blobCalls++;return {blobs:[...blobMap.keys()]
      .filter(x=>x.startsWith(prefix)).map(pathname=>({pathname})),hasMore:false};},
    del:async paths=>{blobCalls++;for(const path of Array.isArray(paths)?paths:[paths])blobMap.delete(path);}
  };
  const context=vm.createContext({process:{env:databaseEnabled?{DATABASE_URL:'postgresql://example.invalid/test'}:{}},
    console,Buffer,Date,JSON,Error,Response});
  const modules=new Map();
  function synthetic(name,defs){
    const mod=new vm.SyntheticModule(Object.keys(defs),function(){
      for(const [k,v] of Object.entries(defs))this.setExport(k,v);
    },{context,identifier:name});
    modules.set(name,mod);
  }
  synthetic('@neondatabase/serverless',{neon:()=>({query:sql})});
  synthetic('@vercel/blob',blob);
  const code=await readFile(new URL('../lib/mb-storage.js',import.meta.url),'utf8');
  const module=new vm.SourceTextModule(code,{context,identifier:'mb-storage'});
  await module.link(id=>modules.get(id));await module.evaluate();
  return {...module.namespace,records,blobMap,getBlobCalls:()=>blobCalls,getSQLCalls:()=>sqlCalls};
}

test('Neon adapter: atomic create, update, batch read, list cursor, and delete',async()=>{
  const store=await fixture(true);
  assert.equal(store.usingPostgres(),true);
  assert.equal(await store.readJson('names/a.json'),null);
  await store.writeJson('names/a.json',{id:'u1'});
  await assert.rejects(store.writeJson('names/a.json',{id:'u2'}),/409 AlreadyExists/);
  await store.writeJson('names/a.json',{id:'u3'},{overwrite:true});
  await store.writeJson('names/b.json',{id:'u4'});
  await store.writeJson('profiles/u3.json',{name:'국어 학습자'});
  assert.deepEqual(JSON.parse(JSON.stringify(await store.readJsonMany([
    'names/a.json','names/missing.json','profiles/u3.json'
  ]))),[{id:'u3'},null,{name:'국어 학습자'}]);
  const first=await store.list({prefix:'names/',limit:1});
  assert.equal(first.blobs.length,1);assert.equal(first.hasMore,true);
  assert.ok(first.cursor);
  const second=await store.list({prefix:'names/',limit:1,cursor:first.cursor});
  assert.equal(second.blobs.length,1);assert.equal(second.hasMore,false);
  const list=await store.readRecords('names/',100);
  assert.equal(list.length,2);
  await store.del('names/a.json');
  assert.equal(await store.readJson('names/a.json'),null);
  assert.equal((await store.checkStorage()).backend,'postgres');
  assert.equal(store.getBlobCalls(),0);
});

test('Without DATABASE_URL, fail closed without falling back to Vercel Blob',async()=>{
  const store=await fixture(false);
  assert.equal(store.usingPostgres(),false);
  await assert.rejects(store.readJson('profiles/u1.json'),/DATABASE_URL is not set/);
  await assert.rejects(store.writeJson('profiles/u1.json',{name:'test'}),/DATABASE_URL is not set/);
  await assert.rejects(store.checkStorage(),/DATABASE_URL is not set/);
  assert.equal(store.getBlobCalls(),0);
  assert.equal(store.getSQLCalls(),0);
});
