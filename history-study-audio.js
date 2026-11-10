/* 역사 학습관 전용 공용 음악 플레이어.
 * Shares the actual published /assets/bgm/ files and catalog with 맛춘범.
 * Never attempts missing audio, or plays before a user gesture.
 */
(()=>{'use strict';
const BASE='/assets/bgm/';
const CATALOG='/assets/bgm/catalog.json';
const KEY='history_study_audio_v2';
const NEW=[
 ['Afternoon_in_a_Seoul_Teahouse.mp3','Afternoon in a Seoul Teahouse','찻집의 오후'],
 ['Questions_in_the_Gallery.mp3','Questions in the Gallery','전시실의 질문'],
 ['The_Clockmaker_s_Ledger.mp3',"The Clockmaker's Ledger",'시계공의 장부'],
 ['Last_Page_Turned.mp3','마지막 장을 넘겨도','엔딩·휴식']
];
const RECOMMENDED=[
 ...NEW,
 ['Evening_Rain_On_Paper.mp3','Evening Rain on Paper','차분한 학습'],
 ['Beneath_the_Painted_Arch.mp3','Beneath the Painted Arch','전시·기록'],
 ['Behind_the_Organ_Pipes.mp3','Behind the Organ Pipes','역사 탐구'],
 ['The_Final_Sugar_Rush.mp3','The Final Sugar Rush','퀴즈'],
 ['Full_Tilt_Parade.mp3','Full Tilt Parade','메인'],
 ['Transit_at_Midnight.mp3','Transit at Midnight','무한'],
 ['magical_bookshelf_1.mp3','Magical Bookshelf','학습'],
 ['late_night_study_1.mp3','Late Night Study Session','학습'],
 ['main.mp3','맛춘범 메인 테마','공유'],
 ['spelling.mp3','맛춘범 맞춤법 테마','공유'],
 ['idiom.mp3','맛춘범 사자성어 테마','공유']
];
const names=new Map(RECOMMENDED.map(([file,title,category])=>[file,{title,category}]));
const excluded=/backrooms?|jumpscare|monster|chase|horror|retro_vhs|dreamcore|sfx|death/i;
const $=id=>document.getElementById(id);
const html=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;',">":'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(x,min,max)=>Math.max(min,Math.min(max,Number(x)||0));
let settings={enabled:false,bgmVolume:38,sfxVolume:32,sfxEnabled:true,shuffle:true,track:''};
try{
 const saved=JSON.parse(localStorage.getItem(KEY)||'null');
 if(saved&&typeof saved==='object')settings={...settings,...saved,enabled:false};
}catch{}
settings.bgmVolume=clamp(settings.bgmVolume,0,100);
settings.sfxVolume=clamp(settings.sfxVolume,0,100);
let playlist=[],missing=new Set(),audio=null,ctx=null,dialog=null,idx=-1,active=false,changing=false,ready=false,errorText='',last='',
 history=[],installed=false;
function save(){
 try{localStorage.setItem(KEY,JSON.stringify({...settings,enabled:false}))}catch{}
}
function safeName(file){
 return names.get(file)?.title||file.replace(/\.mp3$/,'').replace(/_/g,' ').replace(/-/g,' ');
}
function category(file){return names.get(file)?.category||'맛춘범 공유'}
function nowTrack(){return playlist[idx]||null}
function trackOptions(){
 return playlist.map((file,i)=>'<option value="'+html(file)+'" '+(i===idx?'selected':'')+'>'+html(safeName(file))+' · '+html(category(file))+'</option>').join('');
}
function status(text,error=false){
 errorText=text||'';
 const el=$('historyBgmStatus');if(el){el.textContent=text||'';el.classList.toggle('error',!!error)}
}
function audioElement(){
 if(audio)return audio;
 audio=new Audio();
 audio.preload='none';audio.loop=false;audio.volume=settings.bgmVolume/100;
 audio.addEventListener('ended',()=>{if(active)next()});
 audio.addEventListener('error',()=>{
  const name=nowTrack();if(name)missing.add(name);
  if(!active)return;
  status('이 곡을 불러올 수 없어 다음 음악으로 넘어갑니다.',true);
  next();
 });
 return audio;
}
function redraw(){
 const current=nowTrack();
 const title=current?safeName(current):'선택된 음악 없음';
 const mini=$('historyMiniBgm');
 if(mini){
  mini.textContent=active?'⏸ 음악 멈춤':'♫ 음악 재생';
  mini.setAttribute('aria-pressed',String(active));
  mini.title='맛춘범과 공유하는 역사 배경음악 · '+title;
 }
 const now=$('historyBgmNow');if(now)now.textContent=title;
 const meta=$('historyBgmCount');if(meta)meta.textContent=playlist.length+'곡 공유 중';
 const btn=$('historyAudioPlay');if(btn)btn.textContent=active?'⏸ 일시정지':'▶ 음악 재생';
 const bgmToggle=$('historyBgmEnable');if(bgmToggle){bgmToggle.checked=active;bgmToggle.setAttribute('aria-label','배경음악 '+(active?'재생 중':'꺼짐'))}
 const sfxToggle=$('historySfxEnable');if(sfxToggle)sfxToggle.checked=!!settings.sfxEnabled;
 for(const [id,key] of [['historyBgmVolume','bgmVolume'],['historySfxVolume','sfxVolume']]){
  const node=$(id);if(node&&Number(node.value)!==settings[key])node.value=String(settings[key]);
  const label=$(id+'Number');if(label)label.textContent=settings[key]+'%';
 }
 const shuffle=$('historyShuffle');if(shuffle)shuffle.checked=!!settings.shuffle;
 const select=$('historyTrackChoice');
 if(select){
  if(select.options.length!==playlist.length||select.dataset.fingerprint!==playlist.join('|')){
   select.innerHTML=trackOptions();select.dataset.fingerprint=playlist.join('|');
  }
  if(current&&select.value!==current)select.value=current;
  select.disabled=!playlist.length;
 }
 for(const id of ['historyAudioPlay','historyAudioNext']){const el=$(id);if(el)el.disabled=!playlist.length}
 const buttons=document.querySelectorAll('[data-history-play]');
 buttons.forEach(btn=>btn.setAttribute('aria-pressed',String(active)));
}
function chooseIndex(target,advance=false){
 const playable=playlist.map((_,i)=>i).filter(i=>!missing.has(playlist[i]));
 if(!playable.length){idx=-1;status('사용 가능한 BGM이 없습니다. 서버 음악 목록을 확인해 주세요.',true);redraw();return false}
 if(target&&playlist.includes(target)&&!missing.has(target)){idx=playlist.indexOf(target);return true}
 if(settings.shuffle){
  const pool=playable.filter(i=>i!==idx&&(!history.includes(playlist[i])||history.length>=playlist.length-1));
  const choices=pool.length?pool:playable.filter(i=>i!==idx);
  idx=(choices.length?choices:playable)[Math.floor(Math.random()*(choices.length?choices:playable).length)];
 }else{
  let candidate=idx;
  for(let i=0;i<playlist.length;i++){candidate=(candidate+1)%playlist.length;if(!missing.has(playlist[candidate]))break}
  idx=candidate<0?playable[0]:candidate;
 }
 const current=playlist[idx];history.push(current);
 if(history.length>10)history.shift();
 return true;
}
async function start(target){
 if(!ready){status('서버 음악 목록을 불러오는 중입니다. 잠시 후 재생을 눌러 주세요.');return}
 if(!chooseIndex(target))return;
 active=true;settings.enabled=true;settings.track=nowTrack();
 const player=audioElement();
 const src=BASE+encodeURIComponent(nowTrack());
 if(player.getAttribute('src')!==src){player.src=src;player.load()}
 player.volume=settings.bgmVolume/100;
 save();redraw();
 try{
  await player.play();
  if(!active)player.pause();
  else status('재생 중 · '+safeName(nowTrack()));
 }catch(e){
  if(!active)return;
  active=false;settings.enabled=false;save();redraw();
  status('브라우저가 재생을 차단했습니다. 재생 버튼을 한 번 더 눌러 주세요.',true);
 }
}
function pause(){
 active=false;settings.enabled=false;audio?.pause();save();redraw();status('음악 일시정지');
}
function toggle(){
 if(active)pause();
 else start(nowTrack()||settings.track||undefined);
}
function next(){
 if(!ready)return;
 if(!chooseIndex(undefined,true))return;
 if(active)start(nowTrack());
 else{settings.track=nowTrack();save();redraw();status('선택된 곡: '+safeName(nowTrack()))}
}
function volume(value){
 settings.bgmVolume=clamp(value,0,100);
 if(audio)audio.volume=settings.bgmVolume/100;
 save();redraw();
}
function tone(type){
 if(!settings.sfxEnabled||!settings.sfxVolume)return;
 try{
  const Ctx=window.AudioContext||window.webkitAudioContext;
  if(!Ctx)return;
  ctx=ctx||new Ctx();
  if(ctx.state==='suspended')ctx.resume().catch(()=>{});
  const osc=ctx.createOscillator(),gain=ctx.createGain();
  const now=ctx.currentTime,notes={
   click:[430,410,.055],correct:[740,990,.17],wrong:[330,240,.19],next:[500,600,.08]
  },[start,end,duration]=notes[type]||notes.click;
  osc.type=type==='wrong'?'triangle':'sine';
  osc.frequency.setValueAtTime(start,now);
  osc.frequency.exponentialRampToValueAtTime(end,now+duration);
  gain.gain.setValueAtTime(.0001,now);
  gain.gain.exponentialRampToValueAtTime(Math.max(.0002,settings.sfxVolume/100*.045),now+.016);
  gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
  osc.connect(gain);gain.connect(ctx.destination);
  osc.start(now);osc.stop(now+duration+.01);
  osc.onended=()=>{osc.disconnect();gain.disconnect()};
 }catch{}
}
function renderSettings(){
 if(dialog)return;
 dialog=document.createElement('dialog');dialog.id='historySoundDialog';dialog.className='history-sound-dialog';
 dialog.setAttribute('aria-label','한국사 학습관 사운드 설정');
 dialog.innerHTML='<div class="history-sound-head"><div><small>HISTORY • AUDIO SETTINGS</small><h2>⚙️ 설정 · 소리</h2><p>맛춘범 음악과 공유되는 역사 학습관 음악 플레이어</p></div><button type="button" id="historySoundClose" aria-label="설정 닫기">×</button></div>'+
 '<div class="history-sound-body">'+
 '<section class="history-audio-card"><div class="history-now-row"><span class="history-record-icon">♫</span><div><small>NOW PLAYING</small><h3 id="historyBgmNow">공유 음악 불러오는 중</h3><span id="historyBgmCount"></span></div></div>'+
 '<div class="history-player-buttons"><button type="button" id="historyAudioPlay">▶ 음악 재생</button><button type="button" id="historyAudioNext">⏭ 다음 곡</button></div>'+
 '<p id="historyBgmStatus" role="status" aria-live="polite"></p></section>'+
 '<section class="history-settings-grid">'+
 '<label class="history-check-row"><span><strong>🎵 배경음악</strong><small>처음에는 꺼진 상태로 시작합니다</small></span><input id="historyBgmEnable" type="checkbox"></label>'+
 '<label class="history-slider-row"><span>배경음악 볼륨</span><input id="historyBgmVolume" type="range" min="0" max="100" step="1"><b id="historyBgmVolumeNumber">38%</b></label>'+
 '<label class="history-check-row"><span><strong>🔔 효과음</strong><small>정답 · 오답 · 화면 조작</small></span><input id="historySfxEnable" type="checkbox"></label>'+
 '<label class="history-slider-row"><span>효과음 볼륨</span><input id="historySfxVolume" type="range" min="0" max="100" step="1"><b id="historySfxVolumeNumber">32%</b></label>'+
 '<label class="history-check-row"><span><strong>🔀 무작위 재생</strong><small>같은 곡 연속 재생을 최소화</small></span><input id="historyShuffle" type="checkbox"></label>'+
 '</section><section class="history-audio-library"><h3>🎼 공유 음악 라이브러리</h3><p>맛춘범에 실제 등록된 BGM을 가져옵니다. 백룸 전용 음악은 제외해요.</p>'+
 '<label for="historyTrackChoice">재생할 곡 선택</label><select id="historyTrackChoice" aria-label="재생할 음악 선택"></select>'+
 '<details><summary>이번에 추가 요청한 음악 4곡</summary><div id="historyRequestedTracks"></div></details>'+
 '<p class="history-audio-notice">브라우저 보안 정책에 따라 처음 재생할 때는 버튼을 눌러야 합니다. 퀴즈 진행 중에도 음악이 이어집니다.</p>'+
 '</section><div class="history-sound-footer"><button type="button" id="historyAudioReset">설정 초기화</button><button type="button" id="historyAudioDone">설정 닫기</button></div></div>';
 document.body.append(dialog);
 dialog.querySelector('#historySoundClose').onclick=close;
 dialog.querySelector('#historyAudioDone').onclick=close;
 dialog.querySelector('#historyAudioPlay').onclick=toggle;
 dialog.querySelector('#historyAudioNext').onclick=next;
 $('historyBgmEnable').addEventListener('change',e=>e.target.checked?start(nowTrack()||settings.track||undefined):pause());
 $('historySfxEnable').addEventListener('change',e=>{settings.sfxEnabled=!!e.target.checked;save();redraw();if(settings.sfxEnabled)tone('correct')});
 $('historyShuffle').addEventListener('change',e=>{settings.shuffle=!!e.target.checked;save()});
 $('historyBgmVolume').addEventListener('input',e=>volume(e.target.value));
 $('historySfxVolume').addEventListener('input',e=>{settings.sfxVolume=clamp(e.target.value,0,100);save();redraw()});
 $('historyTrackChoice').addEventListener('change',e=>{if(playlist.includes(e.target.value))start(e.target.value)});
 $('historyAudioReset').onclick=()=>{pause();settings={enabled:false,bgmVolume:38,sfxVolume:32,sfxEnabled:true,shuffle:true,track:''};save();redraw();status('소리 설정을 초기화했습니다.')};
 dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
 redraw();
}
function open(){
 renderSettings();
 if(!dialog.open)dialog.showModal();
 redraw();
}
function close(){if(dialog?.open)dialog.close()}
function mini(){
 const head=document.querySelector('.barLinks')||document.querySelector('header .bar');
 if(!head||$('historyMiniBgm'))return;
 const music=document.createElement('button');music.id='historyMiniBgm';music.type='button';music.className='history-audio-mini';music.setAttribute('aria-label','음악 재생 및 일시정지');
 music.onclick=toggle;head.prepend(music);
 const settingsTab=$('historySettingsTab');
 if(settingsTab)settingsTab.onclick=open;
 const settingsButton=$('historySoundSettings');
 if(settingsButton)settingsButton.onclick=open;
 redraw();
}
async function catalog(){
 try{
  const response=await fetch(CATALOG,{cache:'no-store'});
  if(!response.ok)throw Error('HTTP '+response.status);
  const data=await response.json();
  if(!Array.isArray(data?.tracks))throw Error('Invalid catalog');
  const installedFiles=new Set(data.tracks.filter(x=>typeof x==='string'&&/^assets\/bgm\/[A-Za-z0-9_-]+\.mp3$/.test(x))
     .map(x=>x.slice('assets/bgm/'.length)));
  playlist=[...installedFiles].filter(x=>!excluded.test(x)).sort((a,b)=>{
   const aKey=RECOMMENDED.findIndex(v=>v[0]===a),bKey=RECOMMENDED.findIndex(v=>v[0]===b);
   if(aKey<0&&bKey<0)return a.localeCompare(b);
   return (aKey<0?1000:aKey)-(bKey<0?1000:bKey);
  });
  ready=true;installed=true;
  if(settings.track&&playlist.includes(settings.track))idx=playlist.indexOf(settings.track);
  else idx=playlist.length?0:-1;
  const list=$('historyRequestedTracks');
  if(list)list.innerHTML=NEW.map(([file,title])=>
    '<p><span>'+html(title)+'</span><b class="'+(installedFiles.has(file)?'installed':'pending')+'">'+
    (installedFiles.has(file)?'재생 가능':'서버 등록 대기')+'</b></p>').join('');
  redraw();
  status(playlist.length+'곡의 공용 음악을 확인했습니다. ▶를 누르면 시작합니다.');
 }catch(e){
  ready=false;playlist=[];redraw();status('음악 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',true);
 }
}
function boot(){
 mini();renderSettings();
 document.addEventListener('click',e=>{
  const btn=e.target.closest?.('[data-choice]');
  if(btn){
   setTimeout(()=>{
    const result=document.querySelector('.feedback');
    if(result)tone(result.classList.contains('good')?'correct':'wrong');
   },0);
  }else if(e.target.closest?.('button,[role=button]')){
   const t=e.target.closest('button');if(t&&!t.closest('#historySoundDialog')&&t.id!=='historyMiniBgm')tone('click');
  }
 },true);
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden&&active&&audio&&!audio.paused)audio.pause();
  if(!document.hidden&&active&&audio&&audio.paused)audio.play().catch(()=>{});
 });
 window.addEventListener('pagehide',()=>{
  audio?.pause();if(ctx&&ctx.state!=='closed')ctx.close().catch(()=>{});
 },{once:true});
 catalog();
}
const api={open,toggle,next,start,pause,catalog,getState:()=>({settings:{...settings},active,ready,tracks:playlist.slice(),track:nowTrack()}),tones:tone};
window.MB_HISTORY_AUDIO=api;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();