/* Separate opt-in Backrooms mode, without modifying legacy taste pages or controls. */
(()=>{
 'use strict';
 if(window.__mbBackroomsLauncher2026)return;
 window.__mbBackroomsLauncher2026=true;
 function mount(){
  const home=document.getElementById('homeScreen');
  if(!home||document.getElementById('mb-backrooms-mode-button'))return;
  const btn=document.createElement('button');
  btn.type='button';btn.id='mb-backrooms-mode-button';
  btn.setAttribute('aria-label','백룸 입장 — 3D 협동 게임 실행');
  btn.title='백룸 3D 협동 탐험';
  // Display the actual uploaded neon image, not an imitation CSS button.
  // Keep the click target as the original button and preserve a text fallback.
  const art=document.createElement('img');
  art.src='/ui-assets/backrooms-entry-neon.png?v=20261106b';
  art.alt='백룸 입장';art.width=420;art.height=140;art.loading='eager';art.decoding='async';
  art.addEventListener('error',()=>{
   art.remove();
   btn.textContent='🚪 백룸 입장';
   btn.classList.add('mb-backrooms-image-fallback');
  },{once:true});
  btn.append(art);
  // The home menu is assembled by other patches; keep this button in the
  // same RIGHT menu column as timed/hardcore, after the original hard button.
  // Never clone or replace the existing mode controls.
  const host=home.querySelector('.mb-home-dashboard .mb-dashboard-left');
  if(!host)return;
  const holder=document.createElement('div');
  holder.className='mb-backrooms-launcher';
  holder.append(btn);
  const hardcore=host.querySelector('.mb-hard-feature');
  if(hardcore)hardcore.insertAdjacentElement('afterend',holder);
  else host.append(holder);
  btn.addEventListener('click',()=>{window.location.assign('/backrooms/')});
 }
 const style=document.createElement('style');style.id='mb-backrooms-launcher-style';
 style.textContent=`#homeScreen .mb-dashboard-left>.mb-backrooms-launcher{display:flex!important;flex:none!important;order:4!important;justify-content:center;align-items:center;align-self:center;box-sizing:border-box;width:min(100%,420px)!important;max-width:420px!important;min-width:0!important;height:auto!important;margin:clamp(4px,.6vw,9px) auto 0!important;padding:0!important;position:relative!important;top:-8px!important;z-index:12}#mb-backrooms-mode-button{box-sizing:border-box!important;display:block!important;cursor:pointer!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;color:transparent!important;font-size:0!important;line-height:0!important;padding:0!important;margin:0!important;width:100%!important;height:auto!important;min-width:0!important;min-height:0!important;aspect-ratio:3/1!important;overflow:visible!important;transition:filter .12s,transform .12s!important}#mb-backrooms-mode-button>img{display:block!important;width:100%!important;height:auto!important;aspect-ratio:3/1!important;object-fit:contain!important;pointer-events:none!important;image-rendering:auto!important}#mb-backrooms-mode-button.mb-backrooms-image-fallback{display:grid!important;place-items:center!important;border:4px double #b98563!important;border-radius:12px!important;background:linear-gradient(180deg,#f4dec1,#d3a178)!important;box-shadow:0 4px 0 #301a22!important;color:#3d2624!important;font-size:clamp(14px,1.4vw,19px)!important;font-weight:900!important;min-height:48px!important}#mb-backrooms-mode-button:hover{transform:translateY(-2px);filter:brightness(1.08)}#mb-backrooms-mode-button:focus-visible{outline:3px solid #ffd7a0;outline-offset:3px}@media(max-width:700px){#homeScreen .mb-home-dashboard>.mb-backrooms-launcher,#homeScreen .mb-dashboard-left>.mb-backrooms-launcher{grid-column:1/-1!important;grid-row:5!important;width:100%!important;max-width:100%!important;margin:5px auto!important}}`;
 document.head.append(style);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
