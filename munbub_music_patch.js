/* Single authoritative music controller: no gain boosts, no duplicate playback.
 * The same Audio element is reused on every screen; playback continues for
 * modes sharing the same track, and looping works on every browser.
 */
(()=>{
 'use strict';
 if(window.__mbBgm2026v6)return;
 if(typeof bgmPlayer==='undefined'||!bgmPlayer)return;
 window.__mbBgm2026v6=true;
 const audio=bgmPlayer,$=id=>document.getElementById(id);
 const HOME=[
  ['parade','Full Tilt Parade · 메인 홈','assets/bgm/Full_Tilt_Parade.mp3'],
  ['new','새 메인 배경음악','assets/bgm/home-new.mp3'],
  ['original','기존 메인 배경음악','assets/bgm/main.mp3'],
  ['old-spelling','기존 맞춤법 BGM','assets/bgm/spelling.mp3'],
  ['old-idiom','기존 사자성어 BGM','assets/bgm/idiom.mp3'],
  ['old-timed','기존 시간제한 BGM','assets/bgm/timed.mp3'],
  ['old-infinite','기존 무한모드 BGM','assets/bgm/infinite.mp3'],
  ['pixel','Pixel Confetti Rush','assets/bgm/spelling-new.mp3'],
  ['harbor','Harbor View Drive','assets/bgm/idiom-new.mp3'],
  ['hard','하드코어 BGM','assets/bgm/hardcore-new.mp3'],
  ['duel','1대1 대결 BGM','assets/bgm/duel-new.mp3'],
  ['sugar','The Final Sugar Rush','assets/bgm/The_Final_Sugar_Rush.mp3'],
  ['rain','Evening Rain On Paper','assets/bgm/Evening_Rain_On_Paper.mp3']
 ];
 const TRACKS={
  spelling:['spelling','Pixel Confetti Rush','assets/bgm/spelling-new.mp3'],
  idiom:['idiom','Harbor View Drive','assets/bgm/idiom-new.mp3'],
  hardcore:['hardcore','하드코어 BGM','assets/bgm/hardcore-new.mp3'],
  duel:['duel','1대1 대결 BGM','assets/bgm/duel-new.mp3']
 };

 const HIGH=[
  ['hard','하드코어 BGM','assets/bgm/hardcore-new.mp3'],
  ['inf','무한모드 BGM','assets/bgm/infinite.mp3'],
  ['timed','시간제한 BGM','assets/bgm/timed.mp3'],
  ['organ','Behind the Organ Pipes','assets/bgm/Behind_the_Organ_Pipes.mp3'],
  ['arch','Beneath the Painted Arch','assets/bgm/Beneath_the_Painted_Arch.mp3']
 ];
 const INFINITE=[
  ['transit','Transit at Midnight · 무한모드','assets/bgm/Transit_at_Midnight.mp3'],
  ...HIGH
 ];
 const BASIC=[
  ...HOME.filter(x=>!['hard','duel','old-infinite'].includes(x[0]))
 ];
// MB_20261108_AUDIO_START
 const ADDED_BGM=[
  ['mischief','Playful Mischief','assets/bgm/playful_mischief.mp3'],
  ['eastfantasy','East Asian Fantasy','assets/bgm/east_asian_fantasy.mp3'],
  ['triumph','Triumphant Orchestra','assets/bgm/triumphant_orchestra.mp3'],
  ['vhs','Retro VHS Horror','assets/bgm/retro_vhs_horror.mp3'],
  ['dreamcore','Dreamcore Ambient','assets/bgm/dreamcore_ambient.mp3'],
  ['night1','Late Night Study Session · 원곡','assets/bgm/late_night_study_1.mp3'],
  ['night2','Late Night Study Session (1) · 다른 음악','assets/bgm/late_night_study_2.mp3'],
  ['books1','Magical Bookshelf · 원곡','assets/bgm/magical_bookshelf_1.mp3'],
  ['books2','Magical Bookshelf (1) · 다른 음악','assets/bgm/magical_bookshelf_2.mp3'],
  ['neon1','ネオン・ループ · 원곡','assets/bgm/neon_loop_1.mp3'],
  ['neon2','ネオン・ループ (1) · 다른 음악','assets/bgm/neon_loop_2.mp3']
 ];
 // Five user-supplied tracks: share across every non-Backrooms mode.
 const SEASONAL_BGM=[
  ['peppermint','Peppermint Pursuit','assets/bgm/Peppermint_Pursuit.mp3'],
  ['hearth','Gathered by the Hearth','assets/bgm/Gathered_by_the_Hearth.mp3'],
  ['seasons','The Quiet Between Seasons','assets/bgm/The_Quiet_Between_Seasons.mp3'],
  ['warmnight','따스한 이 밤에','assets/bgm/Warm_Winter_Night.mp3'],
  ['pumpkin','Moonlight Pumpkin Sprint','assets/bgm/Moonlight_Pumpkin_Sprint.mp3']
 ];
 // Shared history & spelling playlist. These become playable only after actual MP3s
 // are present in assets/bgm and announced by Render's published catalog.
 const HISTORY_SHARED_BGM=[
  ['history-teahouse','Afternoon in a Seoul Teahouse','assets/bgm/Afternoon_in_a_Seoul_Teahouse.mp3'],
  ['history-gallery','Questions in the Gallery','assets/bgm/Questions_in_the_Gallery.mp3'],
  ['history-ledger',"The Clockmaker's Ledger",'assets/bgm/The_Clockmaker_s_Ledger.mp3'],
  ['history-ending','마지막 장을 넘겨도','assets/bgm/Last_Page_Turned.mp3']
 ];
 HOME.push(...HISTORY_SHARED_BGM);
 BASIC.push(...HISTORY_SHARED_BGM);
 HIGH.push(...HISTORY_SHARED_BGM);
 INFINITE.push(...HISTORY_SHARED_BGM);
 HOME.push(...SEASONAL_BGM);
 BASIC.push(...SEASONAL_BGM);
 HIGH.push(...SEASONAL_BGM);
 INFINITE.push(...SEASONAL_BGM);
 // The new 12 songs form six independent original/(1) pairs.
 // The existing night/books/neon pairs above are also distinct tracks.
 const NEW_PAIRS_20261110=[
  ['menu1','Menu Drift · 원곡','assets/bgm/menu_drift_1.mp3'],
  ['menu2','Menu Drift (1) · 다른 음악','assets/bgm/menu_drift_2.mp3'],
  ['tape1','Nostalgic Tape · 원곡','assets/bgm/nostalgic_tape_1.mp3'],
  ['tape2','Nostalgic Tape (1) · 다른 음악','assets/bgm/nostalgic_tape_2.mp3'],
  ['fanfare1','Triumphant Fanfare · 원곡','assets/bgm/triumphant_fanfare_1.mp3'],
  ['fanfare2','Triumphant Fanfare (1) · 다른 음악','assets/bgm/triumphant_fanfare_2.mp3'],
  ['mystic1','신비로운 모험 · 원곡','assets/bgm/mystic_adventure_1.mp3'],
  ['mystic2','신비로운 모험 (1) · 다른 음악','assets/bgm/mystic_adventure_2.mp3'],
  ['journey1','역사의 여정 · 원곡','assets/bgm/history_journey_1.mp3'],
  ['journey2','역사의 여정 (1) · 다른 음악','assets/bgm/history_journey_2.mp3'],
  ['rhythm1','퀴즈의 리듬 · 원곡','assets/bgm/quiz_rhythm_1.mp3'],
  ['rhythm2','퀴즈의 리듬 (1) · 다른 음악','assets/bgm/quiz_rhythm_2.mp3']
 ];
 HOME.push(...NEW_PAIRS_20261110);
 BASIC.push(...NEW_PAIRS_20261110);
 HIGH.push(...NEW_PAIRS_20261110);
 INFINITE.push(...NEW_PAIRS_20261110);
 HOME.push(...ADDED_BGM);
 BASIC.push(...ADDED_BGM.filter(t=>!['vhs','dreamcore','neon1','neon2'].includes(t[0])));
 HIGH.push(...ADDED_BGM.filter(t=>['vhs','dreamcore','neon1','neon2','triumph','mischief'].includes(t[0])));
 INFINITE.push(...ADDED_BGM.filter(t=>['neon1','neon2','mischief','eastfantasy','triumph'].includes(t[0])));
 // MB_20261108_AUDIO_END
 // Only published MP3s (or files reconstructed by npm run check) are playable.
 // Keep the unavailable user-requested tracks in the catalog for later upload,
 // but never attempt a known 404 or offer it as a selectable option.
 const PUBLISHED_BGM=new Set([
  'assets/bgm/duel-new.mp3',
  'assets/bgm/hardcore-new.mp3',
  'assets/bgm/home-new.mp3',
  'assets/bgm/idiom-new.mp3',
  'assets/bgm/idiom.mp3',
  'assets/bgm/infinite.mp3',
  'assets/bgm/main.mp3',
  'assets/bgm/neon_loop_1.mp3',
  'assets/bgm/spelling-new.mp3',
  'assets/bgm/spelling.mp3',
  'assets/bgm/timed.mp3',
  'assets/bgm/Behind_the_Organ_Pipes.mp3',
  'assets/bgm/Beneath_the_Painted_Arch.mp3',
  'assets/bgm/The_Final_Sugar_Rush.mp3',
  'assets/bgm/Evening_Rain_On_Paper.mp3',
  'assets/bgm/Full_Tilt_Parade.mp3',
  'assets/bgm/Transit_at_Midnight.mp3',
  'assets/bgm/playful_mischief.mp3',
  'assets/bgm/east_asian_fantasy.mp3',
  'assets/bgm/triumphant_orchestra.mp3',
  'assets/bgm/retro_vhs_horror.mp3',
  'assets/bgm/dreamcore_ambient.mp3',
  'assets/bgm/late_night_study_1.mp3',
  'assets/bgm/late_night_study_2.mp3',
  'assets/bgm/magical_bookshelf_1.mp3',
  'assets/bgm/magical_bookshelf_2.mp3',
  'assets/bgm/neon_loop_2.mp3'
 ]);
 const KEY='matchunbeom_home_bgm_choice_v2';
 let homeChoice=PUBLISHED_BGM.has(HOME[0][2])?'parade':'new',duelObserver=null,rankObserver=null,updating=false,lastLabel='',lastVolume=-1;
 let currentTrack=null,currentGroup='',lastMode='',lastTrackUrl='',manualPick=true;
 const missing=new Set(),played=new Set();
 try{const v=localStorage.getItem(KEY);if(HOME.some(q=>q[0]===v&&PUBLISHED_BGM.has(q[2])))homeChoice=v}catch(_){}
 const absolute=p=>new URL(p,document.baseURI).href;
 function mode(){
  if($('mb-duel-dialog')?.open)return 'duel';
  const rank=$('mb-ranked-dialog');
  if(rank?.open){
   const chosen=rank.dataset.mbRankedMode||rank.querySelector('[data-rank-pick].selected')?.dataset.rankPick||'';
   return chosen==='infinite'?'infinite':'ranked';
  }
  const view=typeof section!=='undefined'?section:'home';
  const active=typeof store!=='undefined'?store.active:null;
  const route=typeof window.__mbSelectedMenu==='function'?window.__mbSelectedMenu():null;
  if(view==='home'||view==='settings')return 'home';
  if(route==='hard'||route==='hardcore'||active?.cfg?.hard)return 'hardcore';
  const rule=String(active?.cfg?.mode||active?.cfg?.challenge||'').toLowerCase();
  if(route==='infinite'||view==='infinite'||rule==='infinite'||active?.cfg?.infinite)return 'infinite';
  if(route==='ranked'||route==='ranking')return 'ranked';
  const category=view==='setup'?($('categorySelect')?.value||active?.cfg?.category):active?.cfg?.category;
  if(category==='idiom'||view==='idiom'||(route==='idiom'&&view!=='quiz'))return 'idiom';
  if(view==='timed'||route==='timed'||rule==='timed60')return 'timed';
  return ['quiz','setup','result','spelling','application','mistakes'].includes(view)?'spelling':'home';
 }
 const groupFor=m=>m==='duel'?'duel':['hardcore','infinite','ranked'].includes(m)?'high':'basic';
 const assetRevisions=new Map();
 const abs=t=>{const url=new URL(t[2],document.baseURI);const ver=assetRevisions.get(t[2]);if(ver)url.searchParams.set('v',ver);return url.href};
 // Backrooms themes are available in Home's manual picker, never the automatic rotation.
 const BACKROOMS_MENU_TRACKS=new Set(['vhs','dreamcore']);
 const available=t=>!!t&&PUBLISHED_BGM.has(t[2])&&!missing.has(abs(t));
 function playlist(m){
  const basic=m==='home'?[HOME.find(t=>t[0]===homeChoice)||HOME[0],...BASIC]:m==='idiom'?[TRACKS.idiom,...BASIC]:m==='timed'?[HOME.find(x=>x[0]==='old-timed'),...BASIC]:[TRACKS.spelling,...BASIC];
  const tracks=m==='duel'?[TRACKS.duel,...SEASONAL_BGM]:m==='infinite'?INFINITE:groupFor(m)==='high'?HIGH:basic;
  const used=new Set();
  return tracks.filter(t=>{if(!available(t))return false;if(BACKROOMS_MENU_TRACKS.has(t[0])&&!(m==='home'&&t[0]===homeChoice))return false;const u=abs(t);if(used.has(u))return false;used.add(u);return true});
 }
 function pick(m,advance=false){
  const list=playlist(m);
  if(!list.length)return null;
  if(manualPick&&m==='home'){
   manualPick=false;
   const selected=HOME.find(t=>t[0]===homeChoice);
   if(available(selected))return selected;
  }
  if(!advance&&currentTrack&&list.some(t=>abs(t)===abs(currentTrack)))return currentTrack;
  if(!advance&&m==='duel'){
   const theme=available(TRACKS.duel)?TRACKS.duel:null;
   if(theme){played.add(abs(theme));return theme;}
  }
  if(!advance&&m==='infinite'){
   // A missing newly requested track must not delay the first question.
   const theme=available(INFINITE[0])?INFINITE[0]:INFINITE.find(t=>t[2]==='assets/bgm/infinite.mp3'&&available(t));
   if(theme){played.add(abs(theme));return theme;}
  }
  let options=list.filter(t=>abs(t)!==lastTrackUrl&&!played.has(abs(t)));
  if(!options.length){played.clear();options=list.filter(t=>abs(t)!==lastTrackUrl)}
  if(!options.length)options=list;
  const item=options[Math.floor(Math.random()*options.length)];
  played.add(abs(item));return item;
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
 function update(next=false){
  if(updating)return;
  updating=true;
  try{
   const m=mode(),group=groupFor(m),changed=group!==currentGroup;
   const modeChanged=m!==lastMode;
   if(changed){played.clear();currentGroup=group}
   lastMode=m;
   // On entering the home or infinite mode, begin its designated BGM.
   // Subsequent tracks still shuffle with the existing playlist.
   if(modeChanged&&!next){
    currentTrack=null;
    if(m==='home')manualPick=true;
   }
   const tracks=playlist(m);
   const allowed=currentTrack&&tracks.some(t=>abs(t)===abs(currentTrack));
   if(next||!allowed){
    const track=pick(m,!!next);
    if(track){
     currentTrack=track;lastTrackUrl=abs(track);
     if(audio.src!==lastTrackUrl){audio.src=lastTrackUrl;audio.load()}
    }
   }
   syncUI(currentTrack||tracks[0]||HOME[0]);
   const v=volume();
   if(lastVolume!==v||audio.volume!==v){audio.volume=v;lastVolume=v}
   if(audio.loop)audio.loop=false;
   if(!enabled()||document.hidden){if(!audio.paused)audio.pause()}else play();
  }finally{updating=false}
 }
 // Advance to a different song when the current one finishes.
 audio.loop=false;
 audio.addEventListener('ended',()=>{if(enabled())update(true)});
 // Skip assets that have not been uploaded yet, preserving old BGM.
 audio.addEventListener('error',()=>{
  if(!currentTrack)return;
  missing.add(abs(currentTrack));
  currentTrack=null;
  if(playlist(mode()).length)queueMicrotask(()=>update(true));
 });
 // Replace the legacy entrypoint so buttons, slider and navigation use ONE
 // playback policy. Do not wrap its old implementation.
 window.syncBgm=update;
 function installPicker(){
  const host=document.querySelector('#view-settings .bgm-settings');
  if(!host)return;
  let select=$('mb-home-bgm-choice');
  if(select){
   for(const opt of select.options){
    const t=HOME.find(x=>x[0]===opt.value);
    opt.disabled=!available(t);
    if(t)opt.textContent=t[1]+(opt.disabled?' (음원 미등록)':'');
   }
   if(select.value!==homeChoice)select.value=homeChoice;
   return;
  }
  const div=document.createElement('div');div.className='mb-home-bgm-picker';
  const title=document.createElement('label');
  title.htmlFor='mb-home-bgm-choice';title.textContent='🏠 홈 화면 배경음악';
  select=document.createElement('select');
  select.id='mb-home-bgm-choice';select.setAttribute('aria-label','홈 화면 배경음악 선택');
  for(const [id,name] of HOME){
   const option=document.createElement('option');option.value=id;
   const candidate=HOME.find(t=>t[0]===id);
   option.disabled=!available(candidate);
   option.textContent=name+(option.disabled?' (음원 미등록)':'');select.append(option);
  }
  select.value=homeChoice;
  const note=document.createElement('small');
  note.textContent='서버에 등록된 음악만 선택할 수 있어. Full Tilt Parade는 홈에서, Transit at Midnight는 무한모드에서 먼저 재생돼.';
  div.append(title,select,note);host.append(div);
  select.addEventListener('change',()=>{
   homeChoice=select.value;
   manualPick=true;
   try{localStorage.setItem(KEY,homeChoice)}catch(_){}
   if(mode()==='home')update(true);else update();
  });
 }
 function watchDuel(){
  const el=$('mb-duel-dialog');
  if(!el||duelObserver)return;
  duelObserver=new MutationObserver(update);
  duelObserver.observe(el,{attributes:true,attributeFilter:['open']});
 }
 function watchRanked(){
  const el=$('mb-ranked-dialog');
  if(!el||rankObserver)return;
  rankObserver=new MutationObserver(update);
  rankObserver.observe(el,{attributes:true,attributeFilter:['open']});
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
 installPicker();watchDuel();watchRanked();
 // One-shot pointer event can unlock browser audio; don't restart on every click.
 const gesture=()=>{if(enabled())queueMicrotask(update)};
 document.addEventListener('pointerdown',gesture,{once:true,passive:true});
 document.addEventListener('keydown',gesture,{once:true,passive:true});
 document.addEventListener('visibilitychange',update);
 $('bgmVolume')?.addEventListener('input',update);
 const loop=setInterval(()=>{installPicker();watchDuel();watchRanked();update()},1800);
 window.addEventListener('pagehide',()=>{clearInterval(loop);duelObserver?.disconnect();rankObserver?.disconnect()},{once:true});

 // Render generates this manifest from actual MP3 files during build.
 async function loadPublishedBgm(){
  if(typeof fetch!=='function')return;
  try{
   const r=await fetch('/assets/bgm/catalog.json',{cache:'no-store'});
   if(!r.ok)return;
   const data=await r.json();
   if(!Array.isArray(data?.tracks))return;
   const files=data.tracks.filter(x=>typeof x==='string'&&/^assets\/bgm\/[A-Za-z0-9_-]+\.mp3$/.test(x));
   if(!files.length)return;
   PUBLISHED_BGM.clear();
   for(const file of files)PUBLISHED_BGM.add(file);
   assetRevisions.clear();
   const hashes=data?.hashes&&typeof data.hashes==='object'?data.hashes:{};
   for(const file of files){const ver=hashes[file];if(typeof ver==='string'&&/^[0-9a-f]{12,64}$/i.test(ver))assetRevisions.set(file,ver.slice(0,16))}
   // Restore the requested homepage theme when the original MP3 is installed.
   let restoreHomeTheme=false;
   if(available(HOME[0])&&homeChoice==='new'){
    let userPicked=false;
    try{userPicked=!!localStorage.getItem(KEY)}catch(_){}
    if(!userPicked){homeChoice='parade';manualPick=true;restoreHomeTheme=true;}
   }
   if(currentTrack&&!available(currentTrack))currentTrack=null;
   installPicker();
   const note=document.querySelector('#view-settings .mb-home-bgm-picker small');
   if(note)note.textContent='홈·일반 게임 모드는 등록된 음악을 함께 섞어 재생해. 백룸 전용 음악은 자동 재생목록에서 제외돼.';
   update(restoreHomeTheme&&mode()==='home');
  }catch(_){}
 }
 update();
 loadPublishedBgm();
})();
