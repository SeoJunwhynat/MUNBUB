/* 맛춘범: 프린트 맞춤법 심화 선택형 + 학습 모드별 최고 기록.
 * 기존 210개 응용문항과 학습 내역은 절대 덮어쓰지 않는다.
 */
(()=>{
 'use strict';
 if(window.__mbAppRecords2026v1)return;
 if(typeof BANK==='undefined'||typeof MAP==='undefined'||typeof ALL==='undefined'||
    typeof store==='undefined'||typeof persist!=='function'){
  console.error('맛춘범 응용·기록 확장: 기본 엔진이 준비되지 않았어.');return;
 }
 window.__mbAppRecords2026v1=true;
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const minutes=[60,120,180,300],SUBTYPE='헷갈리는 맞춤법';
 const seeded=BANK.spelling.filter(q=>
  typeof q.prompt==='string'&&q.prompt.includes('___')&&
  Array.isArray(q.answers)&&q.answers.length===1&&
  Array.isArray(q.options)&&q.options.length>=2&&
  new Set(q.options).size===q.options.length&&
  q.options.includes(q.answers[0])&&typeof q.note==='string'&&q.note.trim());
 const extra=seeded.map((q,i)=>({
  id:'a'+(211+i),type:'application',format:'choice',subtype:SUBTYPE,
  prompt:q.prompt.replace(/___\s+([.!?])/g,'___$1'),options:[...q.options],answers:[...q.answers],
  note:q.note,source:q.source||'학교 프린트',sourceId:q.id
 }));
 if(!extra.length||new Set(extra.map(q=>q.id)).size!==extra.length||
    extra.some(q=>MAP.has(q.id))){
  console.error('맛춘범 응용 확장: 원본 문제 수 또는 ID 충돌, 추가 중단');return;
 }
 BANK.applications.push(...extra);
 ALL.push(...extra);
 extra.forEach(q=>MAP.set(q.id,q));
 const bankCount=document.getElementById('bankApp');
 if(bankCount)bankCount.textContent=String(BANK.applications.length);
 const subtype=document.getElementById('subtypeSelect');
 if(subtype&&![...subtype.options].some(opt=>opt.value===SUBTYPE)){
  const opt=document.createElement('option');
  opt.value=SUBTYPE;opt.textContent=SUBTYPE+' · '+extra.length+'문항';
  subtype.add(opt);
 }
 try{if(typeof updateSetupCount==='function')updateSetupCount()}catch(_){}

 const empty=()=>({infinite:null,hardcore:{bestScore:0,bestStreak:0,scoreAt:null,streakAt:null},timeAttack:{}});
 const finiteNonnegative=n=>Number.isFinite(Number(n))&&Number(n)>=0?Math.floor(Number(n)):0;
 const validTime=n=>minutes.includes(Number(n));
 function records(){
  if(!store.modeRecords||typeof store.modeRecords!=='object')store.modeRecords=empty();
  if(!store.modeRecords.hardcore||typeof store.modeRecords.hardcore!=='object')
   store.modeRecords.hardcore=empty().hardcore;
  if(!store.modeRecords.timeAttack||typeof store.modeRecords.timeAttack!=='object')
   store.modeRecords.timeAttack={};
  return store.modeRecords;
 }
 function recordAttempt(h,{score=null,at=null}={}){
  if(!h||!h.cfg||!Number.isFinite(Number(h.answered))||
     Number(h.answered)<1)return false;
  // In infinite mode there is no built-in finish: older sessions were often
  // archived as "abandoned" when switching modes. Their earned answers count.
  if(h.abandoned&&!(h.cfg.infinite&&!h.cfg.hard&&!h.cfg.timed))return false;
  const r=records(),cfg=h.cfg,correct=finiteNonnegative(h.correct);
  const answered=finiteNonnegative(h.answered);
  const date=Number(at||h.date||h.startedAt)||Date.now();
  let changed=false;
  if(cfg.hard){
   const hard=r.hardcore;
   const direct=score===null?(h.hardScore===undefined?null:h.hardScore):score;
   const points=direct===null?null:finiteNonnegative(direct);
   if(points!==null&&(points>finiteNonnegative(hard.bestScore)||
     (!hard.scoreAt&&points===finiteNonnegative(hard.bestScore)))){
    hard.bestScore=points;hard.scoreAt=date;changed=true;
   }
   if(correct>finiteNonnegative(hard.bestStreak)||
    (!hard.streakAt&&correct===finiteNonnegative(hard.bestStreak))){
    hard.bestStreak=correct;hard.streakAt=date;changed=true;
   }
  }else if(cfg.timed&&validTime(cfg.timeSeconds)){
   const seconds=Number(cfg.timeSeconds),prev=r.timeAttack[seconds];
   if(!prev||correct>finiteNonnegative(prev.correct)||
       (correct===finiteNonnegative(prev.correct)&&answered>finiteNonnegative(prev.answered))){
    r.timeAttack[seconds]={correct,answered,category:String(cfg.category||'all'),at:date};
    changed=true;
   }
  }else if(cfg.infinite){
   const prev=r.infinite;
   if(!prev||correct>finiteNonnegative(prev.correct)||
       (correct===finiteNonnegative(prev.correct)&&answered>finiteNonnegative(prev.answered))){
    r.infinite={correct,answered,category:String(cfg.category||'all'),at:date};
    changed=true;
   }
  }
  return changed;
 }
 function migrate(){
  let changed=false;
  for(const h of store.history||[])changed=recordAttempt(h)||changed;
  for(const [key,val] of Object.entries(store.timedRecords||{})){
   const seconds=Number(key.split('|').at(-1));
   if(!validTime(seconds)||!val||!Number.isFinite(Number(val.correct)))continue;
   const cfg={timed:true,timeSeconds:seconds,category:key.slice(0,key.lastIndexOf('|'))||'all'};
   changed=recordAttempt({cfg,answered:val.answered??val.correct,correct:val.correct,date:val.at})||changed;
  }
  if(changed)persist();
 }
 // Infinite mode has no natural finish. Keep the best answered/correct
 // record up to date as soon as the player picks an answer, even if they
 // return home, switch tabs, or close their browser afterward.
 const oldJudge=window.judge;
 if(typeof oldJudge==='function'){
  window.judge=function(...args){
   const before=store.active;
   const result=oldJudge.apply(this,args);
   const active=store.active;
   if(before&&active===before&&active.cfg?.infinite&&
      !active.cfg?.hard&&!active.cfg?.timed&&
      active.answeredCount>0&&active.lastFeedback){
    if(recordAttempt({
     cfg:active.cfg,answered:active.answeredCount,correct:active.correctCount,
     date:Date.now(),abandoned:false
    }))persist();
   }
   return result;
  };
 }
 const oldFinish=window.finishSession;
 if(typeof oldFinish==='function'){
  window.finishSession=function(...args){
   const a=store.active;
   const snapshot=a?{
    id:a.id,startedAt:a.startedAt,cfg:{...a.cfg},
    answered:a.answeredCount,correct:a.correctCount,
    hardScore:finiteNonnegative(a.hardScore),date:Date.now()
   }:null;
   const out=oldFinish.apply(this,args);
   if(snapshot&&!store.active&&
      (store.history||[]).some(x=>x.id===snapshot.id&&!x.abandoned)){
    if(recordAttempt(snapshot,{score:snapshot.cfg.hard?snapshot.hardScore:null})){
     persist();
    }
   }
   return out;
  };
 }
 const style=document.createElement('style');
 style.id='mb-app-records-v1';
 style.textContent=[
  '#mb-mode-bests{margin:0 0 18px;padding:clamp(12px,1.8vw,20px);background:linear-gradient(125deg,#fff5e5,#ead0b0);border:3px solid #95684e;border-radius:16px;box-shadow:0 5px 0 #56322b;color:#42282c}',
  '#mb-mode-bests h3{margin:0 0 13px;font-size:clamp(18px,2vw,25px);color:#592f29}',
  '#mb-mode-bests .mb-record-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}',
  '#mb-mode-bests .mb-record{padding:12px 13px;min-width:0;border-radius:12px;border:2px solid #b4896b;background:#fff8ea}',
  '#mb-mode-bests .mb-record strong{font-size:clamp(19px,2.15vw,27px);display:block;line-height:1.35;color:#783a30}',
  '#mb-mode-bests .mb-record-title{font-size:14px;font-weight:900;margin-bottom:4px}',
  '#mb-mode-bests .mb-record-info{font-size:12px;color:#735849;margin-top:7px;line-height:1.5}',
  '#mb-mode-bests .mb-time-title{margin:16px 0 9px;font-weight:900;font-size:17px}',
  '#mb-mode-bests .mb-record-note{margin-top:12px;font-size:12px;color:#75564a}',
  '@media(min-width:860px){#mb-mode-bests .mb-time-records{grid-template-columns:repeat(4,minmax(0,1fr))}}',
  '@media(max-width:460px){#mb-mode-bests .mb-record-grid{gap:7px}#mb-mode-bests .mb-record{padding:10px 8px}#mb-mode-bests .mb-record strong{font-size:20px}}'
 ].join('\n');
 document.head.append(style);
 const categoryName=category=>{
  const map={all:'전체',spelling:'맞춤법',idiom:'사자성어',application:'응용문제'};
  return map[String(category||'all')]||String(category||'전체');
 };
 function bestUI(){
  const data=records(),hard=data.hardcore||empty().hardcore,inf=data.infinite;
  const day=timestamp=>timestamp?new Date(timestamp).toLocaleDateString('ko-KR')+' 기록':'';
  const card=(title,value,description)=>'<div class="mb-record"><div class="mb-record-title">'+esc(title)+
   '</div><strong>'+esc(value)+'</strong><div class="mb-record-info">'+esc(description)+'</div></div>';
  const infinite=card('∞ 무한모드 · 최고 정답',
   inf?inf.correct+'문제':'기록 없음',
   inf?categoryName(inf.category)+' · '+inf.answered+'문제 풀이 · '+day(inf.at):'무한모드에서 문제를 풀면 바로 기록돼.');
  const hardScore=hard.scoreAt?hard.bestScore+'점':'기록 없음';
  const hardRecord=card('⚔ 하드코어 · 최고 점수',
   hardScore,hard.scoreAt?day(hard.scoreAt):'하드코어 도전 종료 후 기록돼.');
  const streak=card('⚔ 하드코어 · 최다 연속 정답',
   hard.streakAt?hard.bestStreak+'문제':'기록 없음',
   hard.streakAt?day(hard.streakAt):'오답 전까지 맞힌 문제 수를 기록해.');
  const timed=minutes.map(seconds=>{
   const v=data.timeAttack?.[seconds],minutesLabel=(seconds/60)+'분';
   return card('⏱ '+minutesLabel+' 최고 정답',
    v?v.correct+'문제':'기록 없음',
    v?categoryName(v.category)+' · 총 '+v.answered+'문제 풀이 · '+day(v.at):minutesLabel+' 시간제한 도전 기록이 없어.');
  }).join('');
  return '<section id="mb-mode-bests" aria-label="모드별 최고 기록">'+
   '<h3>🏆 모드별 최고 기록</h3><div class="mb-record-grid">'+infinite+hardRecord+streak+'</div>'+
   '<div class="mb-time-title">⏱ 타임어택 · 시간별 최다 정답</div>'+
   '<div class="mb-record-grid mb-time-records">'+timed+'</div>'+
   '<div class="mb-record-note">기존 문제 풀이 내역과 오답 기록은 아래에 그대로 남아 있어. 이전 시간제한 기록도 불러와 표시해.</div></section>';
 }
 function paint(){
  const list=document.getElementById('historyList');
  if(!list)return;
  let box=document.getElementById('mb-mode-bests');
  if(box)box.remove();
  list.insertAdjacentHTML('beforebegin',bestUI());
 }
 const oldHistory=window.renderHistory;
 if(typeof oldHistory==='function'){
  window.renderHistory=function(...args){
   migrate();
   const result=oldHistory.apply(this,args);
   paint();
   return result;
  };
 }
 migrate();
 if(typeof section!=='undefined'&&section==='history')paint();
 window.__mbAppRecordsSummary={
  added:extra.length,subtype:SUBTYPE,applicationTotal:BANK.applications.length,
  timeAttackMinutes:minutes.map(x=>x/60)
 };
})();
