import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {randomUUID,createHash,randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
const canonicalName=n=>String(n).normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('ko-KR');
const hash=s=>createHash('sha256').update(String(s)).digest('hex');
async function fixture(){
 const blobs=new Map();
 const readPrivate=async(path)=>blobs.get(path)||null;
 const writePrivate=async(path,value,{overwrite=false}={})=>{
  if(blobs.has(path)&&!overwrite)throw Error('409 AlreadyExists');
  blobs.set(path,structuredClone(value));
 };
 const list=async({prefix='',limit=1000}={})=>({blobs:[...blobs.keys()].filter(x=>x.startsWith(prefix)).slice(0,limit).map(pathname=>({pathname})),hasMore:false});
 const helpers={configured:()=>true,noCache:()=>{},sameOrigin:()=>true,
  session:req=>req.user||null,setSession:(res,id,name)=>{res.cookie={id,name}},clearSession:res=>{res.cookie=null},
  nickname:s=>{s=String(s||'').trim();return s.length>=2&&s.length<=12&&/^[가-힣a-zA-Z0-9_ ]+$/.test(s)?s:null},
  canonicalName,newId:randomUUID,hash,readPrivate,writePrivate,
  passwordValid:s=>typeof s==='string'&&s.length>=8&&s.length<=72&&s.trim().length>=8,
  passwordHash:s=>{let salt=randomBytes(16).toString('hex');return {salt,digest:scryptSync(s,salt,64).toString('hex'),algorithm:'scrypt'}},
  passwordMatches:(s,record)=>{if(!record?.salt)return false;let a=scryptSync(s,record.salt,64),b=Buffer.from(record.digest,'hex');return a.length===b.length&&timingSafeEqual(a,b)}
 };
 const context=vm.createContext({console,JSON,Date,Buffer});
 const external=new vm.SyntheticModule(['list'],function(){this.setExport('list',list)},{context});
 const server=new vm.SyntheticModule(Object.keys(helpers),function(){for(let [k,v]of Object.entries(helpers))this.setExport(k,v)},{context});
 const code=await readFile(new URL('../api/account.js',import.meta.url),'utf8');
 const m=new vm.SourceTextModule(code,{context});
 await m.link(id=>id==='../lib/mb-storage.js'?external:server);await m.evaluate();
 return async(method,body={},user=null)=>{
  const req={method,body,user,headers:{}};
  const res={statusCode:200,status(n){this.statusCode=n;return this},json(value){this.body=value;return this},setHeader(){}};
  await m.namespace.default(req,res);
  return {status:res.statusCode,...res.body,cookie:res.cookie};
 };
}
test('register, duplicate prevention, password login, current account, logout',async()=>{
 const request=await fixture();
 const reg=await request('POST',{action:'register',name:'테스트닉네임',password:'passWord123'});
 assert.equal(reg.status,201);
 assert.ok(reg.id);
 assert.equal((await request('POST',{action:'register',name:'테스트닉네임',password:'passWord123'})).status,409);
 assert.equal((await request('POST',{action:'login',name:'테스트닉네임',password:'wrong_pass'})).status,401);
 const login=await request('POST',{action:'login',name:'테스트닉네임',password:'passWord123'});
 assert.equal(login.status,200);
 assert.equal(login.name,'테스트닉네임');
 assert.equal((await request('GET',{}, {id:reg.id})).loggedIn,true);
 assert.equal((await request('POST',{action:'logout'},{id:reg.id})).loggedIn,false);
});
