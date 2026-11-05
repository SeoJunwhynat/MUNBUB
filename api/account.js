/* Tastefully minimal nickname+password accounts with unique server-side names. */
import { list } from '../lib/mb-storage.js';
import {
 configured,noCache,sameOrigin,session,setSession,clearSession,
 nickname,canonicalName,newId,hash,readPrivate,readPrivatePrefix,writePrivate,usesPostgres,
 passwordValid,passwordHash,passwordMatches
} from '../lib/mb-server.js';

const namePath=name=>'names/'+hash(canonicalName(name))+'.json';
const profilePath=id=>'profiles/'+id+'.json';
const err=(res,status,error)=>res.status(status).json({error});
function duplicate(e){return /already exists|alreadyexist|conflict|409/i.test(String(e?.message||e))}
async function oldNameAlreadyUsed(name,exceptId){
 // One database query replaces thousands of Blob reads during registration.
 if(usesPostgres()){
  const records=await readPrivatePrefix('profiles/',1000);
  return records.some(p=>p&&p.id!==exceptId&&canonicalName(p.name)===canonicalName(name));
 }
 // Old recovery-code accounts predate the unique-name registry.
 let cursor=undefined;
 for(let page=0;page<20;page++){
  const result=await list({prefix:'profiles/',limit:100,...(cursor?{cursor}:{})});
  const batch=await Promise.all(result.blobs.map(b=>readPrivate(b.pathname).catch(()=>null)));
  if(batch.some(p=>p&&p.id!==exceptId&&canonicalName(p.name)===canonicalName(name)))return true;
  if(!result.hasMore||!result.cursor)break;
  cursor=result.cursor;
 }
 return false;
}
async function reserveName(name,id){
 const path=namePath(name);
 const existing=await readPrivate(path,{fresh:true});
 if(existing)return {ok:existing.id===id,already:existing.id===id};
 if(await oldNameAlreadyUsed(name,id))return {ok:false,reason:'duplicate'};
 try{
  await writePrivate(path,{id,displayName:name,created:Date.now()});
  return {ok:true,already:false};
 }catch(e){
  if(duplicate(e))return {ok:false,reason:'duplicate'};
  throw e;
 }
}
const validateName=res=>err(res,400,'닉네임은 한글·영문·숫자·공백·밑줄 2~12자로 입력해 줘.');
const validatePass=res=>err(res,400,'비밀번호는 8~72자로 설정해 줘. 공백만으로 만들 수는 없어.');
export default async function handler(req,res){
 noCache(res);
 if(!configured())return err(res,503,'온라인 데이터베이스 연결을 확인해 줘. DATABASE_URL과 MB_SESSION_SECRET 설정이 필요해.');
 const me=session(req);
 if(req.method==='GET'){
  if(!me)return res.status(200).json({loggedIn:false});
  try{
   const p=await readPrivate(profilePath(me.id),{fresh:true});
   if(!p)return res.status(200).json({loggedIn:false});
   return res.status(200).json({loggedIn:true,id:p.id,name:p.name,needsPassword:!p.password});
  }catch{return err(res,503,'로그인 상태를 확인하지 못했어.')}
 }
 if(req.method!=='POST')return err(res,405,'지원하지 않는 요청이에요.');
 if(!sameOrigin(req))return err(res,403,'잘못된 요청 출처야.');
 let data=req.body||{};
 try{if(typeof data==='string')data=JSON.parse(data)}catch{return err(res,400,'올바른 요청이 아니야.')}
 try{
  if(data.action==='register'){
   const name=nickname(data.name);
   if(!name)return validateName(res);
   if(!passwordValid(data.password))return validatePass(res);
   const id=newId();
   const claim=await reserveName(name,id);
   if(!claim.ok)return err(res,409,'이미 사용 중인 닉네임이야. 다른 닉네임을 골라 줘.');
   const password=passwordHash(data.password);
   await writePrivate(profilePath(id),{id,name,password,created:Date.now()});
   setSession(res,id,name);
   return res.status(201).json({loggedIn:true,name,id});
  }
  if(data.action==='login'){
   const name=nickname(data.name);
   if(!name||typeof data.password!=='string'||data.password.length>72)return err(res,401,'닉네임이나 비밀번호가 일치하지 않아.');
   const claim=await readPrivate(namePath(name),{fresh:true});
   const user=claim?.id?await readPrivate(profilePath(claim.id),{fresh:true}):null;
   if(!user||!user.password||!passwordMatches(data.password,user.password))return err(res,401,'닉네임이나 비밀번호가 일치하지 않아.');
   setSession(res,user.id,user.name);
   return res.status(200).json({loggedIn:true,name:user.name,id:user.id});
  }
  if(data.action==='recovery'){
   const code=String(data.code||'').trim(),parts=code.split('.');
   if(parts.length!==2||!/^[a-f0-9-]{36}$/.test(parts[0])||!/^[A-Za-z0-9_-]{30,50}$/.test(parts[1]))
    return err(res,401,'복구 코드가 올바르지 않아.');
   const user=await readPrivate(profilePath(parts[0]),{fresh:true});
   if(!user||!user.recoveryHash||hash(parts[1])!==user.recoveryHash)return err(res,401,'복구 코드가 올바르지 않아.');
   setSession(res,user.id,user.name);
   return res.status(200).json({loggedIn:true,name:user.name,id:user.id,needsPassword:!user.password});
  }
  if(data.action==='upgrade'){
   if(!me)return err(res,401,'먼저 기존 계정으로 로그인해 줘.');
   const previous=await readPrivate(profilePath(me.id),{fresh:true});
   if(!previous)return err(res,404,'계정을 찾지 못했어.');
   if(previous.password)return err(res,409,'이미 비밀번호 로그인 계정이야.');
   if(!passwordValid(data.password))return validatePass(res);
   const name=nickname(data.name||previous.name);
   if(!name)return validateName(res);
   const claim=await reserveName(name,me.id);
   if(!claim.ok)return err(res,409,'이미 사용 중인 닉네임이야. 다른 닉네임을 골라 줘.');
   const user={...previous,name,password:passwordHash(data.password),migratedAt:Date.now()};
   await writePrivate(profilePath(user.id),user,{overwrite:true});
   setSession(res,user.id,user.name);
   return res.status(200).json({loggedIn:true,name:user.name,id:user.id});
  }
  if(data.action==='logout'){clearSession(res);return res.status(200).json({loggedIn:false})}
  return err(res,400,'알 수 없는 계정 요청이야.');
 }catch(e){
  console.error('Account operation:',e?.name||'UnknownFailure');
  if(duplicate(e))return err(res,409,'이미 사용 중인 닉네임이야.');
  return err(res,503,'계정 저장소 오류야. 배포 로그와 Blob 연결 상태를 확인해 줘.');
 }
}
