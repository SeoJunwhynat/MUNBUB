/* User-provided textbook picture gallery. Images only appear after verified ZIP install.
 * No alternate web images are substituted for source photographs or maps.
 */
(()=>{'use strict';
const CATALOG='/assets/history-exam/catalog.json';
const BASE='/assets/history-exam/images/';
const LIMIT=186;
let installed=[],status='loading',root=null,query='',group='all',dialog=null,bound=false;
const $=id=>document.getElementById(id);
const enc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;',">":'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const idOk=id=>/^s\d{3}$/.test(String(id))&&Number(String(id).slice(1))<LIMIT;
const imageSrc=id=>idOk(id)?BASE+id+'.png':'';
const titleOf=(id,catalog)=>{
 const n=Number(id?.slice(1));
 const c=catalog||window.MB_HISTORY_EXAM_2026?.captions||{};
 return installed.find(x=>x.id===id)?.caption||c[n]||'교과서 자료 '+String(n+1).padStart(3,'0');
};
function ensureZoom(){
 if(dialog)return dialog;
 dialog=document.createElement('dialog');dialog.className='history-source-zoom';dialog.id='historySourceZoom';
 dialog.innerHTML='<header><strong id="historyZoomTitle">교과서 자료</strong><button type="button" id="historyZoomClose">닫기 ×</button></header>'+
 '<div class="history-source-zoom-content"><img id="historyZoomImage" alt="확대한 교과서 자료" /><p id="historyZoomCaption"></p></div>';
 document.body.append(dialog);$('historyZoomClose').onclick=()=>dialog.close();
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
 return dialog;
}
function zoom(id){
 if(!idOk(id)||status!=='installed')return;
 ensureZoom();
 $('historyZoomImage').src=imageSrc(id);
 $('historyZoomImage').alt=titleOf(id);
 $('historyZoomTitle').textContent=id.toUpperCase()+' · '+titleOf(id);
 $('historyZoomCaption').textContent='사용자 제공 교과서 자료 · 원본 파일의 분류와 맥락을 확인하면서 학습하세요.';
 dialog.showModal();
}
function questionImage(q){
 if(!q?.imageId||!idOk(q.imageId))return '';
 const title=titleOf(q.imageId);
 return '<figure class="history-exam-question-image">'+
 (status==='installed'?'<button type="button" data-source-zoom="'+enc(q.imageId)+'" title="자료 크게 보기" class="history-exam-image-open">'+
 '<img src="'+imageSrc(q.imageId)+'" alt="'+enc(title)+'" loading="lazy"><span class="history-image-hint">원본 사진·지도·사료 확대 <b>+</b></span></button>':
 '<div class="history-source-await"><b>📷 교과서 이미지 '+enc(q.imageId)+'</b><span>원본 사진 자료가 서버에 아직 등록되지 않았습니다. 아래 문제 설명을 바탕으로 풀 수 있어요.</span></div>')+
 '<figcaption>📎 '+enc(title)+' · 사용자가 제공한 교과서 자료'+(status==='installed'?' · 클릭해서 확대':' · 이미지 업로드 대기')+'</figcaption></figure>';
}
const fallback=meta=>{
 const topics=meta?.captions||{};
 return Array.from({length:LIMIT},(_,i)=>({id:'s'+String(i).padStart(3,'0'),section:'교과서 자료',kind:'source',caption:topics[i]||'교과서 자료 '+(i+1)}));
};
function groupKeys(items){return [...new Set(items.map(x=>x.section))]}
function thumbnails(){
 if(!root)return;
 const grid=$('historySourceGrid'),count=$('historySourceFilteredCount');
 if(!grid)return;
 const v=query.trim().toLowerCase();
 const visible=installed.filter(item=>(group==='all'||item.section===group)&&
 (!v||(item.caption+' '+item.original+' '+item.section+' '+item.id).toLowerCase().includes(v)));
 if(count)count.textContent=visible.length+'개 표시 / '+installed.length+'개';
 grid.innerHTML=visible.map(x=>'<button type="button" class="history-exam-tile" data-source-zoom="'+enc(x.id)+'">'+
 '<span class="history-image-slot"><img loading="lazy" src="'+imageSrc(x.id)+'" alt="'+enc(x.caption)+'"></span>'+
 '<span class="history-image-id">'+enc(x.id.toUpperCase())+' · '+enc(x.kind)+'</span>'+
 '<strong>'+enc(x.caption)+'</strong><small>'+enc(x.section)+'</small></button>').join('')||
 '<div class="history-exam-empty">현재 필터에 맞는 자료가 없습니다.</div>';
}
function renderGallery(element,meta){
 root=element;
 const available=status==='installed';
 const total=available?installed.length:0;
 const sourceTypes=groupKeys(installed);
 root.innerHTML='<div class="history-exam-gallery-head">'+
 '<div><span class="history-image-eyebrow">HISTORY SOURCE LIBRARY</span>'+
 '<h1>📷 교과서 사료·지도·사진</h1><p>업로드된 역사 자료 186장을 사건별로 살펴보고 사진·지도·그래프 분석 문제에 연결하는 자료실입니다.</p></div>'+
 '<div class="history-exam-counter"><b>'+total+' / 186</b><span>등록 이미지</span></div></div>'+
 (available?'<div class="history-exam-library-controls">'+
 '<label>자료 검색<input id="historySourceSearch" type="search" placeholder="사건명 · 자료 종류 · 시대" value="'+enc(query)+'"></label>'+
 '<label>시대 구분<select id="historySourceFilter"><option value="all">전체 자료</option>'+
 sourceTypes.map(x=>'<option value="'+enc(x)+'" '+(x===group?'selected':'')+'>'+enc(x)+'</option>').join('')+'</select></label>'+
 '<span id="historySourceFilteredCount" aria-live="polite"></span></div>'+
 '<div class="history-exam-gallery-grid" id="historySourceGrid"></div>':
 '<div class="history-exam-unavailable"><h2>📦 교과서 자료 업로드 대기</h2><p>사용자가 제공한 원본 이미지 186장은 모두 정리되어 있어요. 현재 서버에는 이미지 ZIP이 등록되지 않아 사진은 표시하지 않습니다. 기존 설명형 문제와 새 사료 해석 문제는 그대로 풀 수 있습니다.</p>'+
 '<p>설치할 파일: <code>history_exam_sources_186_20261110.zip</code></p>'+
 '<p class="history-image-subtle">경로: <code>assets/history-exam/_incoming/</code> · 커밋 시 Render가 자동으로 186장을 검증하여 복원합니다.</p></div>')+
 '<div class="history-exam-help"><b>자료 분석 방법</b> — 날짜·장소·인물 확인 → 작성 주체와 사료 종류 파악 → 당시 역사적 배경 연결 → 선지별 근거 비교. 교과서 사진에 적힌 사실과 학습용 문제의 설명을 구분하세요.</div>';
 if(available)thumbnails();
 if(!bound){
  bound=true;
  document.addEventListener('click',e=>{const node=e.target.closest?.('[data-source-zoom]');if(node)zoom(node.dataset.sourceZoom)});
  element.addEventListener('input',e=>{
   if(e.target.id==='historySourceSearch'){query=e.target.value;thumbnails()}
  });
  element.addEventListener('change',e=>{
   if(e.target.id==='historySourceFilter'){group=e.target.value;thumbnails()}
  });
 }
}
async function load(){
 try{
  const res=await fetch(CATALOG,{cache:'no-store'});
  if(!res.ok)throw Error('not installed');
  const info=await res.json();
  if(!info||info.total!==LIMIT||!Array.isArray(info.items)||info.items.length!==LIMIT||
   !info.items.every(x=>idOk(x.id)&&x.file===x.id+'.png'))throw Error('catalog mismatch');
  installed=info.items;status='installed';
 }catch(e){installed=[];status='missing'}
 if(root&&root.querySelector('.history-exam-gallery-head'))renderGallery(root,window.MB_HISTORY_EXAM_2026);
}
window.MB_HISTORY_EXAM_MEDIA={questionImage,renderGallery,load,status:()=>status,count:()=>installed.length,imageSrc};
load();
})();