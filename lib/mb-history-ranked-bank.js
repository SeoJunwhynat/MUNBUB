/* Server-only 한국사 랭킹 문제은행: browser answers are never authoritative. */
import {readFileSync} from 'node:fs';
import {randomInt,createHash} from 'node:crypto';
const raw=readFileSync(new URL('../history-study-data.js',import.meta.url),'utf8');
const marker='window.HISTORY_FINAL_DB=';
const at=raw.indexOf(marker);
if(at<0)throw new Error('History database missing');
const data=JSON.parse(raw.slice(at+marker.length).trim().replace(/;\s*$/,''));
const extraRaw=readFileSync(new URL('../history-study-additions.js',import.meta.url),'utf8');
const extraMarker='window.MB_HISTORY_EXTRA_DB=';
const extraAt=extraRaw.indexOf(extraMarker);
if(extraAt<0)throw new Error('History additional database missing');
const extra=JSON.parse(extraRaw.slice(extraAt+extraMarker.length).trim().replace(/;\s*$/,''));
const knownIds=new Set(data.items.map(e=>e.id));
const events=data.items.concat((extra.events||[]).filter(e=>!knownIds.has(e.id)&&data.chapters[e.u]));
const unique=(arr)=>[...new Set(arr.filter(x=>typeof x==='string'&&x.trim()))];
const stableShuffle=(arr,seed)=>arr.slice().sort((a,b)=>createHash('sha256').update(seed+':'+a).digest('hex').localeCompare(createHash('sha256').update(seed+':'+b).digest('hex')));
function pickChoices(event,field,answer){
 const neighbors=events.filter(x=>x.id!==event.id&&x.u===event.u).concat(events.filter(x=>x.id!==event.id&&x.u!==event.u));
 const values=unique(neighbors.map(x=>field==='year'?String(x.date).slice(0,4):String(x[field]||''))).filter(v=>v!==answer);
 if(values.length<3)return null;
 return stableShuffle([answer,...stableShuffle(values,event.id+':'+field+':pool').slice(0,3)],event.id+':'+field+':choices');
}
const bank=[];
for(const ev of events){
 const modes=[
  {type:'concept',prompt:'다음 설명에 해당하는 역사적 사건이나 제도는?\n\n'+ev.detail,field:'title',answer:ev.title},
  {type:'year',prompt:'다음 사건이 일어난 연도로 옳은 것은?\n\n'+ev.title,field:'year',answer:String(ev.date).slice(0,4)},
  {type:'advanced',prompt:'다음 사건과 가장 직접적으로 연결되는 핵심 개념을 선택하세요.\n\n'+ev.title+'\n\n'+ev.detail,field:'keyword',answer:ev.keyword}
 ];
 for(const mode of modes){
  const choices=pickChoices(ev,mode.field,mode.answer);
  if(!choices)continue;
  const explain=ev.title+' · '+ev.date.replace(/-/g,'. ')+'\n'+ev.detail;
  bank.push(Object.freeze({id:'h'+ev.id+'-'+mode.type,type:mode.type,unit:ev.u,
   prompt:mode.prompt,choices:Object.freeze(choices),correct:choices.indexOf(mode.answer),explain}));
 }
}
export const HISTORY_RANKED_BANK=Object.freeze(bank);
export const HISTORY_RANKED_MAP=new Map(bank.map(q=>[q.id,q]));
export const HISTORY_RANKED_MODES=Object.freeze(['infinite','hardcore','timed60']);
export function selectRankedQuestion(recent=[],round=0){
 const poolType=['concept','year','advanced'][round%3];
 const recentSet=new Set(recent);
 const preferred=bank.filter(q=>q.type===poolType&&!recentSet.has(q.id));
 const fallbacks=preferred.length?preferred:bank.filter(q=>!recentSet.has(q.id));
 const pool=fallbacks.length?fallbacks:bank;
 if(!pool.length)throw new Error('History bank empty');
 return pool[randomInt(pool.length)];
}
