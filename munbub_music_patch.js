/* Single authoritative music controller: no gain boosts, no duplicate playback.
 * The same Audio element is reused on every screen; playback continues for
 * modes sharing the same track, and looping works on every browser.
 */
(()=>{
 'use strict';
 if(window.__mbBgm2026v4)return;
 if(typeof bgmPlayer==='undefined'||!bgmPlayer)return;
 window.__mbBgm2026v4=true;
 const audio=bgmPlayer,$=id=>document.getElementById(id);
 const HOME=[
  ['new','새 메인 배경음악','assets/bgm/home-new.mp3'],
  ['original','기존 메인 배경음악','assets/bgm/main.mp3'],
  ['old-spelling','기존 맞춤법 BGM','assets/bgm/spelling.mp3'],
  ['old-idiom','기존 사자성어 BGM','assets/bgm/idiom.mp3'],
  ['old-timed','기존 시간제한 BGM','assets/bgm/timed.mp3'],
  ['old-infinite','기존 무한모드 BGM','assets/bgm/infinite.mp3'],
  ['pixel','Pixel Confetti Rush','assets/bgm/spelling-new.mp3'],
  ['harbor','Harbor View Drive','assets/bgm/idiom-new.mp3'],
  ['hard','하드코어 BGM','assets/bgm/hardcore-new.mp3'],
  ['duel','1대1 대결 BGM','assets/bgm/duel-new.mp3']
 ];
 const TRACKS={
  spelling:['spelling','Pixel Confetti Rush','assets/bgm/spelling-new.mp3'],
  idiom:['idiom','Harbor View Drive','assets/bgm/idiom-new.mp3'],
  hardcore:['hardcore','하드코어 BGM','assets/bgm/hardcore-new.mp3'],
  duel:['duel','1대1 대결 BGM','assets/bgm/duel-new.mp3']
 };
 const KEY='matchunbeom_home_bgm_choice_v1';
 let homeChoice='new',duelObserver=null,updating=false,lastLabel='',lastVolume=-1;
 try{const v=localStorage.getItem(KEY);if(HOME.some(q=>q[0]===v))homeChoice=v}catch(_){}
 const absolute=p=>new URL(p,document.baseURI).href;
 function mode(){
  if($('mb-duel-dialog')?.open)return 'duel';
  const view=typeof section!=='undefined'?section:'home';
  const active=typeof store!=='undefined'?store.active:null;
  const route=window.__mbSelectedMenu?.();
  if(view==='home'||view==='settings')return 'home';
  if((route==='hard'||active?.cfg?.hard)&&view!=='home')return 'hardcore';
  const category=view==='setup'?($('categorySelect')?.value||active?.cfg?.category):active?.cfg?.category;
  if(category==='idiom'||view==='idiom'||(route==='idiom'&&view!=='quiz'))return 'idiom';
  if(['quiz','setup','result','spelling','application','infinite','timed','idiom','mistakes'].includes(view))return 'spelling';
  return 'home';
 }
 function desired(){
  const m=mode();
  return m==='home'?HOME.find(t=>t[0]===homeChoice)||HOME[0]:TRACKS[m]||TRACKS.spelling;
 }
 function enabled(){return typeof bgmEnabled!=='undefined'&&!!bgmEnabled}
 function volume(){return typeof bgmVolume!=='undefined'&&Number.isFinite(bgmVolume)?Math.max(0,Math.min(1,bgmVolume)):.35}
 function syncUI(track){
  const state=enabled(),pressed=String(state);
  for(const id of ['bgmToggle','bgmQuick']){
   const el=$(id);if(el&&el.getAttribute('aria-pressed')!==pressed)el.setAttribute('aria-pressed',pressed);
  }
  const toggle=$('bgmToggle');if(toggle){
   const title=state?'🔊 음악 끄기':'🔇 음악 켜기';
   if(toggle.textContent!==title)toggle.textContent=title;
  }
  const quick=$('bgmQuick');if(quick){
   const title=state?'♫':'♪̸';if(quick.textContent!==title)quick.textContent=title;
  }
  const slider=$('bgmVolume'),label=$('bgmVolumeText'),v=String(Math.round(volume()*100));
  if(slider&&slider.value!==v)slider.value=v;
  if(label&&label.textContent!==v+'%')label.textContent=v+'%';
  const msg=state?'선택된 곡: '+track[1]:'배경음악 꺼짐';
  if(lastLabel!==msg){
   const text=$('bgmNowPlaying');if(text)text.textContent=msg;
   lastLabel=msg;
  }
 }
 function play(){
  if(audio.paused&&enabled()&&typeof bgmArmed!=='undefined'&&bgmArmed&&!document.hidden){
   const task=audio.play();if(task?.catch)task.catch(()=>{});
  }
 }
 function update(){
  if(updating)return;
  updating=true;
  try{
   const track=desired(),target=absolute(track[2]);
   syncUI(track);
   // Preserve sound level exactly as chosen by the user. Never triple it.
   const v=volume();
   if(lastVolume!==v||audio.volume!==v){audio.volume=v;lastVolume=v}
   if(!audio.loop)audio.loop=true;
   // Switching modes with the same actual URL NEVER calls load(), resets the
   // playback position, or creates another Audio instance.
   if(audio.src!==target){
    audio.src=target;
    audio.load();
   }
   if(!enabled()||document.hidden){
    if(!audio.paused)audio.pause();
   }else play();
  }finally{updating=false}
 }
 // If native loop is unsupported and playback reaches the end, replay once.
 audio.loop=true;
 audio.addEventListener('ended',()=>{
  if(!enabled()||document.hidden)return;
  if(audio.ended){audio.currentTime=0;play()}
 });
 // Replace the legacy entrypoint so buttons, slider and navigation use ONE
 // playback policy. Do not wrap its old implementation.
 window.syncBgm=update;
 function installPicker(){
  const host=document.querySelector('#view-settings .bgm-settings');
  if(!host)return;
  let select=$('mb-home-bgm-choice');
  if(select){if(select.value!==homeChoice)select.value=homeChoice;return}
  const div=document.createElement('div');div.className='mb-home-bgm-picker';
  const title=document.createElement('label');
  title.htmlFor='mb-home-bgm-choice';title.textContent='🏠 홈 화면 배경음악';
  select=document.createElement('select');
  select.id='mb-home-bgm-choice';select.setAttribute('aria-label','홈 화면 배경음악 선택');
  for(const [id,name] of HOME){
   const option=document.createElement('option');option.value=id;option.textContent=name;select.append(option);
  }
  select.value=homeChoice;
  const note=document.createElement('small');
  note.textContent='같은 곡을 사용하는 모드끼리는 재생 위치가 유지돼. 모든 곡은 자동 반복돼.';
  div.append(title,select,note);host.append(div);
  select.addEventListener('change',()=>{
   homeChoice=select.value;
   try{localStorage.setItem(KEY,homeChoice)}catch(_){}
   update();
  });
 }
 function watchDuel(){
  const el=$('mb-duel-dialog');
  if(!el||duelObserver)return;
  duelObserver=new MutationObserver(update);
  duelObserver.observe(el,{attributes:true,attributeFilter:['open']});
 }
 const style=document.createElement('style');
 style.id='mb-music-controller-v4';
 style.textContent=[
  '#view-settings .mb-home-bgm-picker{display:flex;flex-direction:column;gap:9px;padding:14px;margin:15px 0;border:2px solid #b58b70;border-radius:12px;background:#f5dfc6;color:#422729}',
  '#view-settings .mb-home-bgm-picker label{font-weight:900}',
  '#view-settings .mb-home-bgm-picker select{min-height:42px;max-width:100%;padding:9px;font:inherit;border:2px solid #886452;border-radius:8px;background:#fff7e9;color:#422729}',
  '#view-settings .mb-home-bgm-picker small{font-size:12px;line-height:1.5}'
 ].join('\n');
 document.head.append(style);
 installPicker();watchDuel();
 // One-shot pointer event can unlock browser audio; don't restart on every click.
 const gesture=()=>{if(enabled())queueMicrotask(update)};
 document.addEventListener('pointerdown',gesture,{once:true,passive:true});
 document.addEventListener('keydown',gesture,{once:true,passive:true});
 document.addEventListener('visibilitychange',update);
 $('bgmVolume')?.addEventListener('input',update);
 const loop=setInterval(()=>{installPicker();watchDuel();update()},1800);
 window.addEventListener('pagehide',()=>{clearInterval(loop);duelObserver?.disconnect()},{once:true});
 update();
})();
