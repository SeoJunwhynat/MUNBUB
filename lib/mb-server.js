import { createHmac, createHash, randomBytes, randomUUID, timingSafeEqual, scryptSync } from 'node:crypto';
import {list,readJson,writeJson} from './mb-storage.js';
import { readFileSync } from 'node:fs';

const bank = JSON.parse(readFileSync(new URL('../hard_answer_hashes.json', import.meta.url), 'utf8'));
const finalIdioms = JSON.parse(readFileSync(new URL('../idiom_final_100.json', import.meta.url), 'utf8'));
const finalIdiomIds = Object.freeze(finalIdioms.map(({id})=>id));
const COOKIE='mb_session';
const KEY=process.env.SESSION_SECRET;
const b64=s=>Buffer.from(JSON.stringify(s)).toString('base64url');
const mac=s=>createHmac('sha256',KEY||'unconfigured').update(s).digest('base64url');

export function configured(){return Boolean(process.env.DATABASE_URL&&typeof KEY==='string'&&KEY.length>=32);}
export function token(data){const s=b64(data);return s+'.'+mac(s)}
export function verify(s){
 if(typeof s!=='string'||s.length>1600)return null;
 const [p,m,...rest]=s.split('.');if(rest.length||!p||!m)return null;
 const expected=mac(p);
 if(m.length!==expected.length||!timingSafeEqual(Buffer.from(m),Buffer.from(expected)))return null;
 try{const data=JSON.parse(Buffer.from(p,'base64url'));return data&&data.exp>Date.now()?data:null}catch{return null}
}
export function session(req){
 const cookie=String(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='));
 const data=verify(cookie?.slice(COOKIE.length+1));
 return data?.kind==='account'?data:null
}
export function setSession(res,id,name){
 const exp=Date.now()+30*24*3600*1000;
 const value=token({kind:'account',id,name,exp});
 res.setHeader('Set-Cookie',COOKIE+'='+value+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000');
}
export function clearSession(res){res.setHeader('Set-Cookie',COOKIE+'=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0')}
export function noCache(res){res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8')}
export function sameOrigin(req){
 const origin=req.headers.origin; if(!origin)return true;
 try{return new URL(origin).host===req.headers.host}catch{return false}
}
export function nickname(value){
 const s=String(value||'').normalize('NFC').trim().replace(/\s+/g,' ');
 return s.length>=2&&s.length<=12&&/^[가-힣a-zA-Z0-9_ ]+$/.test(s)?s:null
}
export function canonicalName(name){
 return String(name||'').normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('ko-KR');
}
export function passwordValid(s){
 return typeof s==='string' && s.length>=8 && s.length<=72 && Buffer.byteLength(s,'utf8')<=192 && s.trim().length>=8;
}
export function passwordHash(password,salt=randomBytes(16).toString('hex')){
 return {salt,digest:scryptSync(password,salt,64).toString('hex'),algorithm:'scrypt'};
}
export function passwordMatches(password,record){
 if(!record?.salt||!record?.digest||record.algorithm!=='scrypt')return false;
 try{
  const actual=scryptSync(password,record.salt,64);
  const expected=Buffer.from(record.digest,'hex');
  return actual.length===expected.length && timingSafeEqual(actual,expected);
 }catch{return false}
}
export function newId(){return randomUUID()}
export function randomKey(){return randomBytes(24).toString('base64url')}
export function hash(s){return createHash('sha256').update(String(s)).digest('hex')}
export async function readPrivate(path,{fresh=false}={}){
 // Always read from the Render-linked Neon database. Avoid Vercel Blob entirely.
 return readJson(path);
}
export async function writePrivate(path,data,{overwrite=false}={}){
 return writeJson(path,data,{overwrite});
}
export function duelQuestionIds(){return Object.keys(bank)}
export function duelFinalIdiomIds(){return [...finalIdiomIds]}
export function answerCorrect(id,answer){
 const list=bank[id];if(!Array.isArray(list))return null;
 let s=String(answer??'').normalize('NFC').trim().replace(/[·.,!?！。'"“”‘’()]/g,'');
 s=id.startsWith('i')?s.replace(/\s/g,''):s.replace(/\s+/g,' ');
 return list.includes(hash(s).slice(0,20));
}
export async function topModeScores(mode){
 if(!['timed60','infinite'].includes(mode))return [];
 // One best-score record per player and mode; unlike historic hardcore scores,
 // no full run history needs to be downloaded on each ranking request.
 const data=await list({prefix:'rankings/'+mode+'/',limit:1000});
 const records=await Promise.all(data.blobs.slice(0,1000).map(async b=>{
  try{
   const r=await readPrivate(b.pathname);
   return r?.mode===mode&&r.id&&typeof r.name==='string'&&
    Number.isInteger(r.correct)&&r.correct>=0?r:null;
  }catch{return null}
 }));
 return records.filter(Boolean)
  .sort((a,b)=>b.correct-a.correct||a.answered-b.answered||a.at-b.at)
  .slice(0,100)
  .map(r=>({id:r.id,name:r.name,score:r.correct,correct:r.correct,
   answered:r.answered,at:r.at}));
}
export async function topScores(){
 const data=await list({prefix:'scores/',limit:1000});
 const objects=await Promise.all(data.blobs.slice(0,1000).map(async b=>{
  try{const x=await readPrivate(b.pathname);return x&&Number.isInteger(x.score)?x:null}catch{return null}
 }));
 const best=new Map();
 for(const r of objects.filter(Boolean)){
  if(!r.id||typeof r.name!=='string')continue;
  const old=best.get(r.id);
  if(!old||r.score>old.score||(r.score===old.score&&r.correct>old.correct))best.set(r.id,r)
 }
 return [...best.values()].sort((a,b)=>b.score-a.score||b.correct-a.correct||a.at-b.at).slice(0,100)
 .map(({id,name,score,correct,at})=>({id,name,score,correct,at}));
}
