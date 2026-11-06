/* Live public-room browser adapted from the supplied offline UI pack. */
(()=>{
'use strict';if(window.__mbPublicRoomsV1)return;window.__mbPublicRoomsV1=true;
// Dialog controls must be looked up in their owning dialog, even if a
// home-screen extension temporarily reparents overlay nodes.
const $=id=>roomsDialog.querySelector('#'+String(id).replace(/^#/,''))||document.getElementById(String(id).replace(/^#/,''));
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const roomsDialog=document.createElement('dialog');roomsDialog.id='mb-public-dialog';roomsDialog.setAttribute('aria-label','실시간 공개방');
document.body.append(roomsDialog);
const css=document.createElement('style');css.id='mb-public-css';css.textContent=`
#mb-public-dialog{box-sizing:border-box;width:min(97vw,1300px);max-width:1300px;max-height:95dvh;overflow:auto;margin:auto;padding:clamp(14px,2vw,28px);background:linear-gradient(135deg,#51332fed,#2a1a1be9),url('/ui-assets/scene_spelling.webp') center/cover;color:#ffe4c2;border:5px double #d7ab80;border-radius:17px;box-shadow:0 20px 70px #100509cc;font-family:'Malgun Gothic',sans-serif}
#mb-public-dialog::backdrop{background:#120909db}
#mb-public-dialog *{box-sizing:border-box}
#mb-public-dialog .mb-pub-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:15px}
#mb-public-dialog h2{margin:0;font-size:clamp(22px,3vw,32px);color:#ffdfb1}
#mb-public-dialog .mb-pub-note{color:#e8c6aa;font-size:13px;line-height:1.6;margin:8px 0 17px}
#mb-public-dialog button{font:inherit;cursor:pointer;touch-action:manipulation}
#mb-public-dialog .mb-pub-btn{border:3px double #e9c99d;border-radius:7px;background:linear-gradient(#855445,#56342f);color:#fff0d7;font-weight:900;padding:10px 14px;min-height:40px;box-shadow:0 4px 0 #1b1010}
#mb-public-dialog .mb-pub-btn.primary{background:linear-gradient(#be7360,#873d3e)}
#mb-public-dialog .mb-pub-btn.pale{background:#f3d4ac;color:#3a2523}
#mb-public-dialog .mb-pub-btn:disabled{opacity:.45;cursor:default}
#mb-public-dialog .mb-pub-btn:hover:not(:disabled){filter:brightness(1.13)}
#mb-public-dialog .mb-pub-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
#mb-public-dialog .mb-pub-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(215px,280px);gap:15px}
#mb-public-dialog .mb-pub-panel{border:4px double #d4a678;background:#302122e6;padding:clamp(13px,1.4vw,20px);border-radius:12px;box-shadow:inset 0 0 0 3px #54372d}
#mb-public-dialog .mb-pub-searchline{display:flex;gap:8px;flex-wrap:wrap}
#mb-public-dialog input,#mb-public-dialog select{box-sizing:border-box;min-width:0;min-height:40px;padding:10px 12px;border:2px solid #a87956;background:#fff1d6;color:#35211c;border-radius:6px;font:inherit}
#mb-public-dialog input[type=checkbox]{min-height:0;width:18px;height:18px;accent-color:#91594b}
#mb-public-dialog #mb-pub-search{flex:1 1 180px}
#mb-public-dialog .mb-pub-filters{display:flex;gap:6px;flex-wrap:wrap;margin:12px 0}
#mb-public-dialog .mb-pub-filter{font-size:12px;padding:7px 11px;color:#f0d1ae;background:#422b26;border:2px solid #926d58;border-radius:5px;font-weight:800}
#mb-public-dialog .mb-pub-filter.active{background:#f4d3a6;color:#3d2725}
#mb-public-dialog #mb-pub-list{display:grid;gap:9px;max-height:min(55dvh,520px);min-height:100px;overflow-y:auto;padding:3px}
#mb-public-dialog .mb-pub-room{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:12px;align-items:center;background:#503630e0;border:2px solid #946e54;border-radius:6px;padding:12px}
#mb-public-dialog .mb-pub-room strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:15px;color:#ffead0}
#mb-public-dialog .mb-pub-room small{color:#e6bfa0;font-size:12px;line-height:1.6}
#mb-public-dialog .mb-pub-room .mb-pub-people{font-weight:900;font-size:15px}
#mb-public-dialog .mb-pub-stats{margin-top:13px;font-size:13px;color:#f5d3ac}
#mb-public-dialog .mb-pub-side h3{margin:0 0 9px;font-size:18px}
#mb-public-dialog .mb-pub-side p{font-size:13px;line-height:1.8}
#mb-public-dialog .mb-pub-form{display:grid;gap:12px;max-width:650px;margin:auto}
#mb-public-dialog .mb-pub-field{display:grid;grid-template-columns:minmax(90px,125px) minmax(0,1fr);align-items:center;gap:9px}
#mb-public-dialog .mb-pub-field label{font-size:14px;font-weight:900}
#mb-public-dialog .mb-pub-field input,#mb-public-dialog .mb-pub-field select{width:100%}
#mb-public-dialog .mb-pub-backrow{margin-bottom:13px}
#mb-public-dialog .mb-pub-message{margin-top:12px;min-height:1.5em;color:#ffd18b;line-height:1.5;font-size:13px}
/* Original temporary public button theme removed: the PNG-only art button owns this view. */
.sidebar-nav .mb-public-nav,.mobile-drawer .mb-public-nav{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;min-height:65px;padding:9px 4px;background:linear-gradient(#ffe8be,#d4a57c);border:3px double #91644c;border-radius:11px;color:#482e28;font-weight:950;font-size:17px}
@media(max-width:730px){#mb-public-dialog{width:100vw;max-height:100dvh;height:100dvh;padding:12px;border-radius:0}#mb-public-dialog .mb-pub-layout{grid-template-columns:1fr}#mb-public-dialog .mb-pub-side{display:none}#mb-public-dialog .mb-pub-actions{justify-content:flex-start}#mb-public-dialog .mb-pub-room{grid-template-columns:minmax(0,1fr) auto;gap:7px}#mb-public-dialog .mb-pub-people{display:none}#mb-public-dialog .mb-pub-field{grid-template-columns:1fr;gap:4px}#mb-public-dialog #mb-pub-list{max-height:52dvh}}
`;document.head.append(css);
const moreCss=document.createElement('style');moreCss.id='mb-public-arena-four-style';moreCss.textContent=`
#mb-public-dialog{width:min(98vw,1350px);max-height:97dvh;padding:clamp(10px,1.3vw,20px)}
#mb-public-dialog .mb-pub-room{grid-template-columns:minmax(0,1fr) 62px auto}
#mb-public-dialog .mb-pub-people{display:block!important;white-space:nowrap}
#mb-public-dialog .mb-arena-hud{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:10px 0 17px}
#mb-public-dialog .mb-arena-person{min-width:0;position:relative;border:3px solid #ae8263;border-radius:10px;background:#fff0d5;color:#3d2924;padding:10px;min-height:90px}
#mb-public-dialog .mb-arena-person.mine{border-color:#f1bb52;box-shadow:0 0 0 2px #a95636}
#mb-public-dialog .mb-arena-person strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:clamp(12px,1.45vw,18px)}
#mb-public-dialog .mb-arena-person small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:11px;color:#77513e}
#mb-public-dialog .mb-arena-person .mb-arena-score{display:block;font-weight:1000;font-size:clamp(21px,2.2vw,31px);color:#833f30}
#mb-public-dialog .mb-arena-person .mb-arena-mini{font-size:11px;color:#745045}
#mb-public-dialog .mb-arena-person .mb-arena-emote{position:absolute;top:100%;left:0;z-index:2;background:#fff1d0;border:2px solid #9a614a;border-radius:12px;padding:7px 9px;font-size:38px;line-height:1;box-shadow:0 8px 15px #0006;pointer-events:none}
#mb-public-dialog .mb-arena-person .mb-arena-emote::before{content:'';position:absolute;top:-10px;left:18px;width:15px;height:15px;border-top:2px solid #9a614a;border-left:2px solid #9a614a;transform:rotate(45deg);background:#fff1d0}
#mb-public-dialog .mb-arena-person:nth-child(even) .mb-arena-emote{left:auto;right:0}
#mb-public-dialog .mb-arena-person:nth-child(even) .mb-arena-emote::before{left:auto;right:18px}
#mb-public-dialog .mb-arena-stage{min-height:min(47dvh,380px);margin-top:12px;border:4px double #bb936f;border-radius:13px;background:#ffe8cce8;color:#3f2928;padding:clamp(13px,2vw,23px)}
#mb-public-dialog .mb-arena-stage h3{font-size:clamp(17px,2vw,28px);margin:8px auto 14px}
#mb-public-dialog .mb-arena-question{font-weight:900;font-size:clamp(18px,2.1vw,30px);line-height:1.6;word-break:keep-all;margin:20px auto}
#mb-public-dialog .mb-arena-stage .mb-arena-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:25px}
#mb-public-dialog .mb-arena-options button{background:#fff8eb;border:2px solid #c39573;border-radius:8px;padding:11px;min-height:51px;color:#452c26;font-weight:850;font-size:clamp(14px,1.5vw,19px)}
#mb-public-dialog .mb-arena-stage input{width:100%;min-width:0}
#mb-public-dialog .mb-arena-stage .mb-arena-written{display:flex;gap:7px;margin-top:20px}
#mb-public-dialog .mb-arena-status{color:#a04d3e;font-size:clamp(12px,1.2vw,17px);font-weight:850;min-height:20px}
#mb-public-dialog .mb-arena-clock{font-weight:900;color:#804833;font-size:clamp(17px,2vw,25px)}
#mb-public-dialog .mb-arena-chat{margin-top:12px;border:2px solid #bb906b;border-radius:10px;padding:10px;background:#2c1d20cb;color:#f5dfc3}
#mb-public-dialog .mb-arena-messages{max-height:115px;overflow-y:auto;font-size:13px;margin-bottom:7px}
#mb-public-dialog .mb-arena-messages p{margin:4px 0;overflow-wrap:anywhere}
#mb-public-dialog .mb-arena-chat form{display:flex;gap:5px}
#mb-public-dialog .mb-arena-chat form input{flex:1;min-width:0}
#mb-public-dialog .mb-arena-reactions{display:flex;flex-wrap:wrap;gap:5px;margin-top:12px}
#mb-public-dialog .mb-arena-reactions button{font-size:25px;min-width:48px;padding:4px}
#mb-public-dialog .mb-arena-rank{display:grid;gap:7px;margin:12px auto;max-width:550px}
#mb-public-dialog .mb-arena-rank div{display:flex;justify-content:space-between;padding:10px 14px;background:#fff5e5;border:2px solid #bf9472;border-radius:9px;font-weight:850}
@media(max-width:760px){
 #mb-public-dialog{height:100dvh;max-height:100dvh;width:100vw;padding:10px;border-radius:0}
 #mb-public-dialog .mb-arena-hud{grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}
 #mb-public-dialog .mb-arena-person{min-height:72px;padding:6px}
 #mb-public-dialog .mb-arena-person .mb-arena-emote{font-size:31px;padding:3px 5px}
 #mb-public-dialog .mb-arena-stage{min-height:36dvh;padding:11px}
 #mb-public-dialog .mb-arena-stage .mb-arena-options{gap:7px;margin-top:12px}
 #mb-public-dialog .mb-pub-room{grid-template-columns:minmax(0,1fr) auto auto}
}
`;document.head.append(moreCss);
let rooms=[],filter='all',query='',screen='list',busy=false,refreshing=false,pendingAccount=false;
let roomCode=null,room=null,viewKey='',pollTimer=0,pulseAt=0,serverOffset=0,lastRoomRefresh=0;
const typeNames={mixed:'혼합',spelling:'맞춤법',idiom:'사자성어'};
const emotes={wave:'👋',cheer:'👏',laugh:'😄',wow:'😮',cry:'😢',fire:'🔥',thumbs:'👍',thinking:'🤔',cool:'😎',sleep:'💤',love:'💗',angry:'😠'};
function button(label,id,cls=''){return `<button type="button" class="mb-pub-btn ${cls}" id="${id}">${label}</button>`}
function shell(body){if(!roomsDialog.isConnected)document.body.append(roomsDialog);
 roomsDialog.innerHTML=`<div class="mb-pub-top"><h2>🏮 맛춘범 공개방 · 최대 4인</h2>${button('✕ 닫기','mb-pub-close')}</div>${body}<p id="mb-pub-message" class="mb-pub-message" role="status"></p>`;
 $('mb-pub-close').onclick=close;
}
function message(s){const el=$('mb-pub-message');if(el)el.textContent=s}
async function request(body,code){const url='/api/public-arena'+(code?'?code='+encodeURIComponent(code):'');
 const res=await fetch(url,{method:body?'POST':'GET',credentials:'same-origin',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
 const data=await res.json().catch(()=>({}));if(!res.ok)throw Error(data.error||`공개방 연결 오류 (${res.status})`);return data;
}
function matches(){return rooms.filter(r=>(filter==='all'||(filter==='waiting'?r.status==='waiting':r.type===filter))&&(!query||(r.name+' '+r.host).toLowerCase().includes(query.toLowerCase())))}
function drawRooms(){const el=$('mb-pub-list');if(!el)return;
 const shown=matches();el.innerHTML=shown.length?shown.map(r=>`<article class="mb-pub-room"><div><strong>📜 ${esc(r.name)}</strong><small>방장 ${esc(r.host)} · ${typeNames[r.type]||'혼합'} · ${r.count}문제 · ${r.seconds}초</small></div><span class="mb-pub-people">${r.players}/${r.capacity}</span><button type="button" class="mb-pub-btn ${r.status==='waiting'?'primary':''}" data-join="${esc(r.code)}" ${r.status!=='waiting'?'disabled':''}>${r.status==='waiting'?'입장':r.status==='full'?'정원 마감':'대전 중'}</button></article>`).join(''):'<p class="mb-pub-note">조건에 맞는 공개방이 없어. 새 방을 만들어 봐!</p>';
 const count=$('mb-pub-count');if(count)count.textContent=`공개방 ${rooms.length}개 · 입장 가능 ${rooms.filter(r=>r.status==='waiting').length}개`;
}
function listView(){screen='list';roomCode=null;room=null;viewKey='';stopPoll();
 shell(`<div class="mb-pub-actions">${button('⟳ 새로고침','mb-pub-refresh')}${button('🗝 공개방 코드 입장','mb-pub-code')}${button('＋ 방 만들기','mb-pub-create','primary')}</div><p class="mb-pub-note">2~4명이 함께 대결해! 일반 친구 초대 1대1 코드는 별도의 1대1 설정에서 입장해 줘.</p><div class="mb-pub-layout"><section class="mb-pub-panel"><div class="mb-pub-searchline"><input id="mb-pub-search" placeholder="방 제목·방장 검색" value="${esc(query)}">${button('⚡ 빠른 입장','mb-pub-quick','pale')}</div><div class="mb-pub-filters">${['all','waiting','spelling','idiom','mixed'].map((v,i)=>`<button class="mb-pub-filter ${filter===v?'active':''}" data-filter="${v}">${['전체','입장 가능','맞춤법','사자성어','혼합'][i]}</button>`).join('')}</div><div id="mb-pub-list"></div><p id="mb-pub-count" class="mb-pub-stats"></p></section><aside class="mb-pub-panel mb-pub-side"><h3>📖 4인 공개방</h3><p>최대 4명 입장 · 방장이 최소 2명 준비 완료 후 시작<br>모두 같은 문제를 풀고 서버 채점으로 점수 결정<br>점수판 · 이모티콘 · 채팅 · 최종 순위 지원</p></aside></div>`);
 $('mb-pub-search').oninput=e=>{query=e.target.value;drawRooms()};$('mb-pub-refresh').onclick=refresh;
 $('mb-pub-quick').onclick=()=>{const r=matches().find(r=>r.status==='waiting');r?join(r.code):message('입장 가능한 방이 없어.')};
 $('mb-pub-code').onclick=codeView;$('mb-pub-create').onclick=createView;
 roomsDialog.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;roomsDialog.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));drawRooms()});
 $('mb-pub-list').onclick=e=>{const b=e.target.closest('[data-join]');if(b)join(b.dataset.join)};drawRooms();
}
function createView(){screen='create';shell(`<div class="mb-pub-backrow">${button('← 방 목록','mb-pub-back')}</div><section class="mb-pub-panel"><h3>🏮 공개방 만들기</h3><form id="mb-pub-createform" class="mb-pub-form">
 <div class="mb-pub-field"><label for="mb-pub-name">방 제목</label><input id="mb-pub-name" maxlength="36" value="국어 4인 대결!" required></div>
 <div class="mb-pub-field"><label for="mb-pub-capacity">최대 인원</label><select id="mb-pub-capacity"><option>2</option><option>3</option><option selected>4</option></select></div>
 <div class="mb-pub-field"><label for="mb-pub-type">문제 유형</label><select id="mb-pub-type"><option value="mixed">맞춤법+사자성어</option><option value="spelling">맞춤법</option><option value="idiom">사자성어</option></select></div>
 <div class="mb-pub-field"><label for="mb-pub-form">문제 형식</label><select id="mb-pub-form"><option value="auto">문제별 자동</option><option value="two">2지선다</option><option value="four">4지선다</option><option value="text">서술형</option></select></div>
 <div class="mb-pub-field"><label for="mb-pub-amount">문제 수</label><select id="mb-pub-amount"><option>5</option><option selected>10</option><option>15</option><option>20</option><option>30</option></select></div>
 <div class="mb-pub-field"><label for="mb-pub-seconds">문제당 시간</label><select id="mb-pub-seconds"><option>10</option><option>15</option><option selected>25</option><option>30</option><option>40</option><option>60</option></select></div>
 <button class="mb-pub-btn primary" type="submit">✓ 공개방 생성</button></form></section>`);
 $('mb-pub-back').onclick=listView;
 $('mb-pub-createform').onsubmit=async e=>{e.preventDefault();if(busy)return;busy=true;message('방을 생성하는 중...');
 const settings={type:$('#mb-pub-type').value,form:$('#mb-pub-form').value,count:Number($('#mb-pub-amount').value),seconds:Number($('#mb-pub-seconds').value)};
 try{const x=await request({action:'create',roomName:$('#mb-pub-name').value,capacity:Number($('#mb-pub-capacity').value),title:window.mbGetEquippedTitle?.()||'국어 새내기',settings});roomCode=x.code;room=x.state;gameView(true);}
 catch(error){message(error.message)}finally{busy=false};
 };
}
function codeView(){screen='code';shell(`<div class="mb-pub-backrow">${button('← 방 목록','mb-pub-back')}</div><div class="mb-pub-panel"><h3>🗝 공개방 코드로 입장</h3><p class="mb-pub-note">8자리 공개방 코드를 입력해 줘. 개인 1대1 코드는 1대1 메뉴에서 입력해.</p><form id="mb-pub-codeform" class="mb-pub-form"><input id="mb-pub-codeinput" maxlength="8" autocomplete="off" placeholder="ABCD2345" required><button type="submit" class="mb-pub-btn primary">입장</button></form></div>`);
 $('mb-pub-back').onclick=listView;$('mb-pub-codeform').onsubmit=e=>{e.preventDefault();join($('#mb-pub-codeinput').value)};
}
async function join(code){if(busy)return;code=String(code||'').trim().toUpperCase();if(!/^[A-HJ-NP-Z2-9]{8}$/.test(code))return message('8자리 코드를 확인해 줘.');busy=true;message('방에 참가하는 중...');
 try{const x=await request({action:'join',code,title:window.mbGetEquippedTitle?.()||'국어 새내기'});roomCode=code;room=x.state;gameView(true)}catch(error){message(error.message)}finally{busy=false};
}
function scoreCards(){return room.players.map(p=>`<article class="mb-arena-person ${p.id===room.me?'mine':''}" data-pid="${esc(p.id)}"><strong>${p.id===room.hostId?'👑 ':''}${esc(p.name)}${p.id===room.me?' (나)':''}</strong><small>${esc(p.title||'국어 새내기')}</small><span class="mb-arena-score">${p.score}점</span><span class="mb-arena-mini">${p.left?'퇴장':room.phase==='lobby'?(p.ready?'✅ 준비 완료':'⏳ 준비 중'):(p.answered?'✓ 제출 완료':'풀이 중')}</span>${p.lastEmote&&Date.now()-p.lastEmote.at<4200?`<span class="mb-arena-emote">${emotes[p.lastEmote.id]||'👋'}</span>`:''}</article>`).join('')}
function getQuestion(){try{return typeof MAP!=='undefined'?MAP.get(room.questionId):null}catch{return null}}
function chosenForm(){if(room.settings.form!=='auto')return room.settings.form;return room.round%5===4?'text':room.round%4===0?'two':'four'}
function choices(q){const answer=q.type==='idiom'?q.answer:(q.answers||[])[0]||q.answer;
 const n=chosenForm()==='two'?2:4;
 const pool=(typeof ALL==='undefined'?[]:ALL).filter(x=>x.type===q.type&&x.id!==q.id).map(x=>x.type==='idiom'?x.answer:(x.answers||[])[0]||x.answer).filter(Boolean);
 // Stable per-room ordering, so both players see the same answer positions.
 let seed=0;for(const c of (room.code+room.round))seed=(seed*33+c.charCodeAt(0))>>>0;
 const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const candidates=[...new Set(pool.filter(x=>x!==answer))];for(let i=candidates.length-1;i>0;i--){let j=Math.floor(rnd()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]]}
 const result=[answer,...candidates.slice(0,n-1)];for(let i=result.length-1;i>0;i--){let j=Math.floor(rnd()*(i+1));[result[i],result[j]]=[result[j],result[i]]}
 return result;
}
function stage(){const p=room.players.find(p=>p.id===room.me);if(!p)return '';
 if(room.phase==='lobby')return `<h3>🏮 ${esc(room.name)}</h3><p>방 코드 <b>${esc(room.code)}</b> · 참가 ${room.players.filter(x=>!x.left).length}/${room.capacity}명</p><p>최소 2명 입장한 뒤 모두 준비하면 방장이 시작할 수 있어.</p><div class="mb-pub-actions">${button(p.ready?'✓ 준비 취소':'✓ 준비 완료','mb-arena-ready','primary')}${room.me===room.hostId?button('▶ 대전 시작','mb-arena-start'):''}${button('📋 코드 복사','mb-arena-copy','pale')}</div>`;
 if(room.phase==='countdown')return `<h3>⚔ 대결 준비</h3><p class="mb-arena-clock" id="mb-arena-clock">5초 뒤에 시작...</p><p>모든 플레이어가 같은 문제를 풀어!</p>`;
 if(room.phase==='question'){
  const q=getQuestion();if(!q)return `<p>문제 데이터를 불러오지 못했어. 화면을 새로고침해 줘.</p>`;
  const form=chosenForm(),title=q.type==='idiom'?'뜻에 맞는 사자성어를 골라 줘.':'문장에 알맞은 표현을 골라 줘.';
  return `<div class="mb-arena-clock" id="mb-arena-clock" role="timer">⏱ ${room.settings.seconds}초</div><h3>문제 ${room.round+1}/${room.settings.count} · ${title}</h3><p class="mb-arena-question">${esc(q.type==='idiom'?q.meaning:q.prompt)}</p>${p.answered?'<p class="mb-arena-status">✓ 답변 접수 완료 · 다른 플레이어를 기다리는 중</p>':(form==='text'?`<form class="mb-arena-written" id="mb-arena-written"><input id="mb-arena-input" maxlength="100" autocomplete="off" placeholder="정답 입력" required><button class="mb-pub-btn primary" type="submit">제출</button></form>`:`<div class="mb-arena-options">${choices(q).map(x=>`<button type="button" data-answer="${esc(x)}">${esc(x)}</button>`).join('')}</div>`)}<p class="mb-arena-status" id="mb-arena-question-status"></p>`;
 }
 if(room.phase==='review'){
  const a=room.myAnswer,q=getQuestion();const ans=q?(q.type==='idiom'?q.answer:(q.answers||[])[0]||q.answer):'';
  return `<h3>${room.round+1}번째 문제 결과</h3><p class="mb-arena-status">${a?(a.correct?'✅ 정답 +'+a.points+'점':'❌ 오답'):'⏳ 제한 시간 종료 · 미제출'}</p><p>정답: <b>${esc(ans)}</b></p><p class="mb-arena-clock" id="mb-arena-clock">5초 후 ${room.round+1===room.settings.count?'결과 발표':'다음 문제'}</p>${button(room.round+1===room.settings.count?'🏆 결과 확인하기':'✓ 바로 진행 동의','mb-arena-review','primary')}`;
 }
 if(room.phase==='finished'){
  const ranking=[...room.players].filter(x=>!x.left).sort((a,b)=>b.score-a.score||b.correct-a.correct);
  return `<h3>🏆 최종 결과</h3><div class="mb-arena-rank">${ranking.map((p,i)=>`<div><span>${i+1}위 ${room.winnerIds.includes(p.id)?'🏆 ':''}${esc(p.name)}${p.id===room.me?' (나)':''}</span><span>${p.score}점</span></div>`).join('')}</div>${button('🏠 공개방 목록으로','mb-arena-again','primary')}`;
 }
 return '';
}
function gameView(force){if(!room||!roomCode)return;
 screen='game';const key=[room.phase,room.round,room.players.map(p=>[p.id,p.ready,p.left,p.answered].join(':')).join('|'),room.chat.at(-1)?.id||''].join('~');
 if(!force&&viewKey===key){const hud=$('mb-arena-hud');if(hud)hud.innerHTML=scoreCards();return}
 viewKey=key;
 const body=`<div class="mb-pub-actions">${button('← 방 나가기','mb-arena-leave')}${button('⟳ 동기화','mb-arena-refresh','pale')}</div><p class="mb-pub-note">${esc(room.name)} · ${room.players.filter(p=>!p.left).length}/${room.capacity}명 · ${room.settings.count}문제 · ${room.settings.seconds}초</p><section id="mb-arena-hud" class="mb-arena-hud">${scoreCards()}</section><div class="mb-arena-stage">${stage()}</div><div class="mb-arena-reactions">${Object.entries(emotes).map(([k,v])=>`<button type="button" class="mb-pub-btn pale" data-emote="${k}" aria-label="${k}">${v}</button>`).join('')}</div><section class="mb-arena-chat"><strong>💬 대기실·대전 채팅</strong><div class="mb-arena-messages" id="mb-arena-chatlog">${chatHTML()}</div><form id="mb-arena-chat-form"><input id="mb-arena-chat-input" maxlength="80" placeholder="80자 이내" autocomplete="off"><button type="submit" class="mb-pub-btn pale">전송</button></form></section>`;
 shell(body);$('mb-arena-leave').onclick=leaveRoom;$('mb-arena-refresh').onclick=updateRoom;
 $('mb-arena-ready')?.addEventListener('click',()=>send('ready',{ready:!room.players.find(x=>x.id===room.me)?.ready}));
 $('mb-arena-start')?.addEventListener('click',()=>send('start'));
 $('mb-arena-copy')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(room.code);message('코드가 복사됐어.')}catch{message('방 코드: '+room.code)}});
 $('mb-arena-review')?.addEventListener('click',()=>send('reviewReady'));
 $('mb-arena-again')?.addEventListener('click',leaveRoom);
 roomsDialog.querySelectorAll('[data-answer]').forEach(btn=>btn.onclick=()=>send('answer',{index:room.round,answer:btn.dataset.answer}));
 $('mb-arena-written')?.addEventListener('submit',e=>{e.preventDefault();send('answer',{index:room.round,answer:$('#mb-arena-input').value})});
 roomsDialog.querySelectorAll('[data-emote]').forEach(btn=>btn.onclick=()=>send('emote',{emote:btn.dataset.emote}));
 $('mb-arena-chat-form').onsubmit=e=>{e.preventDefault();const input=$('mb-arena-chat-input');if(input?.value.trim())send('chat',{message:input.value.trim()})};
 updateClock();startPoll();
}
function chatHTML(){return room?.chat?.length?room.chat.slice(-20).map(x=>`<p><strong>${esc(x.name)}:</strong> ${esc(x.message)}</p>`).join(''):'<p>아직 메시지가 없어.</p>'}
function updateClock(){const el=$('mb-arena-clock');if(!el||!room)return;const now=Date.now()+serverOffset;
 if(room.phase==='countdown')el.textContent=Math.max(0,Math.ceil((room.startAt-now)/1000))+'초 뒤에 시작...';
 if(room.phase==='question')el.textContent='⏱ '+Math.max(0,(room.deadlineAt-now)/1000).toFixed(1)+'초';
 if(room.phase==='review')el.textContent=Math.max(0,Math.ceil((room.reviewEndsAt-now)/1000))+'초 후 '+(room.round+1===room.settings.count?'결과 발표':'다음 문제');
}
let pollBusy=false,pollEvery=0;
function stopPoll(){if(pollTimer)clearTimeout(pollTimer);pollTimer=0}
function startPoll(){if(pollTimer)return;pollTimer=setTimeout(poll,450)}
async function poll(){pollTimer=0;if(!roomsDialog.open||screen!=='game'||!roomCode)return;
 if(!pollBusy){pollBusy=true;try{await updateRoom();if(Date.now()-pulseAt>10000){pulseAt=Date.now();request({action:'pulse',code:roomCode}).catch(()=>{})}}catch(error){message('연결 재시도 중: '+error.message)}finally{pollBusy=false}}
 if(roomsDialog.open&&screen==='game')pollTimer=setTimeout(poll,800);
}
async function updateRoom(){if(!roomCode)return;const code=roomCode;const x=await request(null,code);if(code!==roomCode)return;
 serverOffset=x.serverNow-Date.now();const phaseBefore=room?.phase,chatBefore=room?.chat.at(-1)?.id;room=x;gameView(false);
 if(phaseBefore===room.phase&&chatBefore!==room?.chat.at(-1)?.id){const log=$('mb-arena-chatlog');if(log)log.innerHTML=chatHTML()}
 updateClock();
}
async function send(action,extra={}){if(busy||!roomCode)return;busy=true;const code=roomCode;const target=roomsDialog.querySelector('[data-answer],#mb-arena-written button,#mb-arena-ready,#mb-arena-start');
 // Immediate client visual feedback; server remains the scoring authority.
 if(action==='answer'&&target){roomsDialog.querySelectorAll('[data-answer],#mb-arena-written button').forEach(b=>b.disabled=true)}
 try{const x=await request({action,code,...extra});if(code!==roomCode)return;
  if(x.state){room=x.state;serverOffset=room.serverNow-Date.now();viewKey='';gameView(true)}else await updateRoom();
  if(action==='answer')message(x.correct?'✅ 정답 제출! +'+x.points+'점':'답변 제출 완료');
 }catch(error){message(error.message);if(action==='answer')roomsDialog.querySelectorAll('[data-answer],#mb-arena-written button').forEach(b=>b.disabled=false)}finally{busy=false}
}
async function leaveRoom(){if(!roomCode){listView();return}const code=roomCode;stopPoll();roomCode=null;room=null;viewKey='';
 try{await request({action:'leave',code})}catch{/* Local exit should still work. */}
 if(roomsDialog.open){listView();refresh()}
}
async function close(){if(screen==='game'&&roomCode)await leaveRoom();if(roomsDialog.open)roomsDialog.close();stopPoll()}
async function refresh(){if(!roomsDialog.open||screen!=='list'||refreshing)return;refreshing=true;
 try{const x=await request();rooms=Array.isArray(x.rooms)?x.rooms:[];drawRooms();message('공개방 목록 갱신 완료')}catch(error){message(error.message)}finally{refreshing=false}
}
let opening=false;async function open(){if(opening)return;opening=true;
 try{const a=await fetch('/api/account',{credentials:'same-origin'});const account=await a.json();
  if(!account.loggedIn){pendingAccount=true;window.mbOpenAccount?.();return}
  pendingAccount=false;if(!roomsDialog.open)roomsDialog.showModal();filter='all';query='';listView();await refresh();
 }catch(error){if(!roomsDialog.open)roomsDialog.showModal();listView();message('계정 연결 오류: '+error.message)}finally{opening=false}
}
roomsDialog.addEventListener('cancel',e=>{e.preventDefault();close()});
document.addEventListener('mb:auth-changed',e=>{if(e.detail?.loggedIn&&pendingAccount){pendingAccount=false;open()}if(!e.detail?.loggedIn)pendingAccount=false});
window.mbPublicOpen=open;
function mount(){const row=document.querySelector('#homeScreen .mb-online-actions');
 if(row&&!document.getElementById('mb-public-open')){const b=document.createElement('button');b.type='button';b.id='mb-public-open';b.className='mb-art-button';b.innerHTML='<img class="mb-art-button-img" src="/ui-assets/public-button-final.png" width="1148" height="292" alt="공개방">';b.addEventListener('click',open);row.append(b)}
 for(const host of document.querySelectorAll('.sidebar-nav,.mobile-drawer'))if(!host.querySelector('.mb-public-nav')){const b=document.createElement('button');b.type='button';b.className='mb-public-nav mb-art-button';b.innerHTML='<img class="mb-art-button-img" src="/ui-assets/public-button-final.png" width="1148" height="292" alt="공개방">';b.addEventListener('click',open);host.append(b)}
 return !!row;
}
mount();const mountTimer=setInterval(()=>{if(mount())clearInterval(mountTimer)},300);setTimeout(()=>clearInterval(mountTimer),15000);
setInterval(()=>{if(roomsDialog.open&&screen==='list')refresh();if(roomsDialog.open&&screen==='game')updateClock()},1250);
})();
