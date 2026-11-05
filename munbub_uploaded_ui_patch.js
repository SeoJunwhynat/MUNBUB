/* Sprite-preserving UI replacement: all seven images supplied by the creator. */
(()=>{
 'use strict';
 if(window.__mbIllustratedUIV1)return;
 window.__mbIllustratedUIV1=true;
 const atlas=window.__mbSuppliedUI;
 if(!atlas||!atlas.src)return;
 const $=id=>document.getElementById(id);
 const art={};
 const picture=new Image();
 picture.onload=()=>{
  for(const [name,coords] of Object.entries(atlas.slices)){
   const [x,y,w,h]=coords,canvas=document.createElement('canvas');
   canvas.width=w;canvas.height=h;
   const ctx=canvas.getContext('2d',{alpha:true});
   if(!ctx)continue;
   ctx.imageSmoothingEnabled=false;
   ctx.drawImage(picture,x,y,w,h,0,0,w,h);
   art[name]=canvas.toDataURL('image/png');
  }
  installStyles();installControls();
 };
 picture.onerror=()=>console.warn('Illustrated UI atlas failed to load');
 picture.src=atlas.src;
 function url(key){return art[key]?'url("'+art[key]+'")':'none'}
 function installStyles(){
  if($('mb-uploaded-ui-styles'))return;
  const style=document.createElement('style');
  style.id='mb-uploaded-ui-styles';
  style.textContent=[
   /* Preserve pixel-art button shape and avoid doubled text over the uploaded labels. */
   '#homeScreen .mb-online-actions #mb-account-open,#homeScreen .mb-online-actions #mb-rank-open,#homeScreen .mb-online-actions .mb-duel-home,#homeScreen .mb-online-actions .mb-home-sound{display:block!important;position:relative!important;box-sizing:border-box!important;background-color:transparent!important;background-position:center center!important;background-repeat:no-repeat!important;background-size:contain!important;border:0!important;border-radius:0!important;box-shadow:none!important;padding:0!important;aspect-ratio:200/80!important;width:100%!important;min-height:0!important;height:auto!important;line-height:0!important;font-size:0!important;color:transparent!important;text-shadow:none!important;image-rendering:auto!important;overflow:visible!important;touch-action:manipulation!important}',
   '#homeScreen .mb-online-actions #mb-account-open{background-image:'+url('login_button')+'!important}',
   '#homeScreen .mb-online-actions #mb-rank-open{background-image:'+url('ranking_button')+'!important;aspect-ratio:200/75!important}',
   '#homeScreen .mb-online-actions .mb-duel-home{background-image:'+url('duel_button')+'!important;aspect-ratio:200/82!important}',
   '#homeScreen .mb-online-actions .mb-duel-home small{display:none!important}',
   '#homeScreen .mb-online-actions .mb-home-sound{background-image:'+url('sound_button')+'!important;aspect-ratio:200/81!important}',
   '#homeScreen .mb-online-actions .mb-home-sound.muted{filter:grayscale(.82) brightness(.52)!important}',
   '#homeScreen .mb-online-actions #mb-account-open:hover,#homeScreen .mb-online-actions #mb-rank-open:hover,#homeScreen .mb-online-actions .mb-duel-home:hover,#homeScreen .mb-online-actions .mb-home-sound:hover{filter:brightness(1.13)!important;transform:translateY(-2px) scale(1.025)!important}',
   '#homeScreen .mb-online-actions button:active{filter:brightness(.82)!important;transform:translateY(1px) scale(.97)!important}',
   '#homeScreen .mb-online-actions{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-auto-rows:auto!important;column-gap:clamp(5px,.7vw,10px)!important;row-gap:clamp(5px,.7vw,8px)!important;align-items:center!important;align-content:start!important;min-height:0!important;height:auto!important}',
   '#homeScreen .mb-online-actions>.mb-duel-home{grid-column:auto!important;grid-row:auto!important;width:100%!important;min-width:0!important;min-height:0!important;justify-self:stretch!important}',
   '#homeScreen .mb-dashboard-left .timed-home-btn{display:block!important;position:relative!important;box-sizing:border-box!important;width:100%!important;height:auto!important;min-height:0!important;aspect-ratio:266/46!important;padding:0!important;margin:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:'+url('timed_button')+' center/100% 100% no-repeat!important;color:transparent!important;font-size:0!important;line-height:0!important;overflow:visible!important;image-rendering:auto!important}',
   '#homeScreen .mb-dashboard-left .timed-home-btn::before,#homeScreen .mb-dashboard-left .timed-home-btn span{display:none!important;content:none!important}',
   '.sidebar-nav [data-route="timed"],.mobile-drawer [data-route="timed"]{display:block!important;box-sizing:border-box!important;width:100%!important;min-height:0!important;height:auto!important;aspect-ratio:266/46!important;padding:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:'+url('timed_button')+' center/100% 100% no-repeat!important;color:transparent!important;font-size:0!important;line-height:0!important;image-rendering:auto!important}',
   '.sidebar-nav [data-route="timed"].active,.mobile-drawer [data-route="timed"].active{filter:brightness(.72)!important;transform:scale(.98)!important}',
   '#mb-achievement-launch{position:fixed!important;top:calc(10px + env(safe-area-inset-top))!important;right:clamp(8px,1vw,16px)!important;bottom:auto!important;box-sizing:border-box!important;aspect-ratio:200/77!important;width:clamp(114px,10vw,180px)!important;height:auto!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:'+url('achievement_button')+' center/100% 100% no-repeat!important;color:transparent!important;font-size:0!important;line-height:0!important;image-rendering:auto!important;overflow:hidden!important}',
   '#mb-achievement-launch:hover{filter:brightness(1.1)!important;transform:translateY(-2px) scale(1.04)!important}',
   '#bgmToggle{display:inline-block!important;box-sizing:border-box!important;aspect-ratio:200/81!important;min-width:160px!important;width:min(100%,240px)!important;height:auto!important;min-height:0!important;background:'+url('sound_button')+' center/100% 100% no-repeat!important;padding:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;color:transparent!important;font-size:0!important;image-rendering:auto!important}',
   '#bgmToggle[aria-pressed="false"]{filter:grayscale(.8) brightness(.6)!important}',
   /* The provided crown-and-podium board is the single background/frame. */
   '#mb-online-modal.mb-ranking-modal{width:min(94vw,740px)!important;max-height:min(92dvh,800px)!important;overflow:hidden!important;background:#291b1f!important;border:3px solid #996b53!important;padding:clamp(8px,1.3vw,14px)!important;border-radius:16px!important;box-shadow:0 15px 70px #000b!important}',
   '#mb-online-modal.mb-ranking-modal .mb-ranking-heading{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip-path:inset(50%)!important;white-space:nowrap!important}',
   '#mb-online-modal.mb-ranking-modal>.mb-tip{display:none!important}',
   '#mb-online-modal .mb-ranking-board{position:relative!important;display:block!important;width:100%!important;max-width:100%!important;aspect-ratio:540/266!important;margin:0 auto!important;background:'+url('ranking_board')+' center/100% 100% no-repeat!important;image-rendering:auto!important}',
   '#mb-online-modal .mb-ranking-rows{position:absolute!important;left:17.5%!important;right:17.5%!important;top:44%!important;bottom:20%!important;overflow-y:auto!important;overflow-x:hidden!important;color:#482a29!important;font-weight:900!important;font-size:clamp(12px,1.65vw,21px)!important;line-height:1.35!important;scrollbar-width:thin!important;image-rendering:auto!important}',
   '#mb-online-modal .mb-board-row{display:grid!important;grid-template-columns:25% 47% 28%!important;align-items:center!important;min-height:25%!important;box-sizing:border-box!important;gap:0!important;padding:2px 4px!important;border-bottom:1px solid #b28a76aa!important;text-align:center!important}',
   '#mb-online-modal .mb-board-row>span:nth-child(2){text-align:center!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}',
   '#mb-online-modal .mb-board-empty{text-align:center!important;padding:8px!important;font-size:clamp(12px,1.4vw,18px)!important}',
   '@media(max-width:700px){#homeScreen .mb-online-actions{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px!important}#homeScreen .mb-online-actions .mb-duel-home{grid-column:auto!important;min-height:0!important;width:100%!important}#homeScreen .mb-online-actions #mb-account-open,#homeScreen .mb-online-actions #mb-rank-open,#homeScreen .mb-online-actions .mb-home-sound{min-height:0!important}#mb-achievement-launch{width:clamp(94px,26vw,138px)!important}#mb-online-modal .mb-ranking-rows{font-size:clamp(10px,3.1vw,16px)!important;top:44%!important;bottom:20%!important}}',
   "#mb-online-modal.mb-ranking-modal #mb-online-close{position:absolute!important;z-index:15!important;top:8px!important;right:9px!important;float:none!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;background:#ffebcd!important;color:#502d28!important;border:2px solid #8a6250!important;border-radius:9px!important;font-size:14px!important;padding:6px 11px!important;min-height:35px!important}",
   "@media(min-width:860px){#mb-achievement-launch{top:calc(9px + env(safe-area-inset-top))!important;right:clamp(10px,1.4vw,24px)!important;bottom:auto!important;left:auto!important;width:clamp(138px,13vw,177px)!important}}",
   "#homeScreen .mb-online-actions .mb-duel-home,#homeScreen .mb-online-actions .mb-home-sound{background-color:transparent!important;box-shadow:none!important;border:0!important;border-radius:0!important;min-height:0!important;font-size:0!important;color:transparent!important;line-height:0!important;grid-row:auto!important;align-self:center!important;image-rendering:auto!important}",
   "#homeScreen .mb-mascot-stage .mb-online-actions{gap:clamp(5px,.7vw,8px)!important;min-height:0!important;grid-auto-rows:auto!important}",
   "#homeScreen .mb-online-actions #mb-account-open.mb-account-logged{background-image:url(\"./ui-assets/login-account.webp\")!important;position:relative!important;display:flex!important;align-items:center!important;justify-content:center!important}",
   "#homeScreen .mb-online-actions #mb-account-open.mb-account-logged .mb-account-name{position:absolute!important;z-index:2!important;display:block!important;left:13%!important;right:13%!important;top:50%!important;transform:translateY(-50%)!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;text-align:center!important;color:#fff0d6!important;text-shadow:1px 2px #130a0b!important;font-weight:950!important;letter-spacing:-.035em!important;line-height:1.15!important;pointer-events:none!important}",
   "#homeScreen .mb-online-actions .mb-home-sound.muted:hover,#homeScreen .mb-online-actions .mb-home-sound.muted:focus-visible{filter:grayscale(.82) brightness(.52)!important}",
   "#homeScreen .mb-online-actions .mb-home-sound:hover,#homeScreen .mb-online-actions .mb-home-sound:focus-visible{filter:none!important;transform:translateY(-2px) scale(1.025)!important}",
   "#homeScreen .mb-online-actions .mb-home-sound:is(.muted,[aria-pressed='false']):hover,#homeScreen .mb-online-actions .mb-home-sound:is(.muted,[aria-pressed='false']):focus-visible{filter:grayscale(.82) brightness(.52)!important}",
   "#homeScreen .mb-online-actions .mb-home-sound[aria-pressed='false']{filter:grayscale(.82) brightness(.52)!important}",
   "#bgmToggle[aria-pressed=\"false\"]:hover,#bgmToggle[aria-pressed=\"false\"]:focus-visible{filter:grayscale(.8) brightness(.6)!important}",
   "#homeScreen .mb-online-actions #mb-account-open.mb-account-logged:hover .mb-account-name{color:#fff0d6!important}",
   '@media(prefers-reduced-motion:reduce){#homeScreen .mb-online-actions button{transition:none!important}}'
  ].join('\n');
  document.head.append(style);
 }
 function installControls(){
  const row=document.querySelector('#homeScreen .mb-online-actions');
  if(row && !row.querySelector('.mb-home-sound')){
   const sound=document.createElement('button');
   sound.className='mb-home-sound';sound.type='button';sound.title='음악 켜기 / 끄기';
   sound.setAttribute('aria-label','배경음악 켜기 또는 끄기');
   row.append(sound);
   sound.addEventListener('click',event=>{
    // Avoid sending a synthetic click to the hidden Settings button: its
    // global click ripple used to flash in the top-left corner.
    event.stopPropagation();
    if(typeof window.toggleBgm==='function')window.toggleBgm();
    else if(typeof toggleBgm==='function')toggleBgm();
   });
   function updateSound(){
    const bgm=$('bgmToggle');
    if(!bgm)return;
    const isOn=bgm.getAttribute('aria-pressed')==='true';
    sound.classList.toggle('muted',!isOn);
    sound.setAttribute('aria-pressed',String(isOn));
    sound.title=isOn?'배경음악 끄기':'배경음악 켜기';
   }
   const toggle=$('bgmToggle');
   if(toggle)new MutationObserver(updateSound).observe(toggle,{attributes:true,attributeFilter:['aria-pressed'],childList:true,subtree:true});
   updateSound();
  }
  $('mb-achievement-launch')?.setAttribute('aria-label','업적 도감 보기');
  document.querySelector('.timed-home-btn')?.setAttribute('aria-label','시간제한 도전!');
  if(!document.getElementById('mb-custom-bgm-loader')){
   const script=document.createElement('script');
   script.id='mb-custom-bgm-loader';
   script.src='./munbub_music_patch.js';
   document.body.append(script);
  }
  if(!document.getElementById('mb-night-scene-loader')){
   const sceneScript=document.createElement('script');
   sceneScript.id='mb-night-scene-loader';
   sceneScript.src='./munbub_scene_patch.js';
   document.body.append(sceneScript);
  }
 }
})();