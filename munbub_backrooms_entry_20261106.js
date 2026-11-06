/* Separate opt-in Backrooms mode, without modifying legacy taste pages or controls. */
(()=>{
 'use strict';
 if(window.__mbBackroomsLauncher2026)return;
 window.__mbBackroomsLauncher2026=true;
 function mount(){
  const home=document.getElementById('homeScreen');
  if(!home||document.getElementById('mb-backrooms-mode-button'))return;
  const btn=document.createElement('button');
  btn.type='button';btn.id='mb-backrooms-mode-button';btn.textContent='🚪 백룸 3D 협동 탐험';
  btn.setAttribute('aria-label','백룸 3D 협동 게임 실행');
  const host=home.querySelector('.mb-home-dashboard .mb-mascot-stage .mb-online-actions')||home.querySelector('.home-actions')||home.querySelector('.home-main');
  if(!host)return;
  const holder=document.createElement('div');holder.className='mb-backrooms-launcher';holder.append(btn);host.insertAdjacentElement('afterend',holder);
  btn.addEventListener('click',()=>{window.location.assign('/backrooms/')});
 }
 const style=document.createElement('style');style.id='mb-backrooms-launcher-style';
 style.textContent=`#homeScreen .mb-backrooms-launcher{display:flex;justify-content:center;align-items:center;box-sizing:border-box;width:100%;max-width:780px;margin:8px auto 4px;position:relative;top:-12px;z-index:12}#mb-backrooms-mode-button{box-sizing:border-box;cursor:pointer;border:4px double #b98563;border-radius:12px;background:linear-gradient(180deg,#f4dec1,#d3a178);box-shadow:0 4px 0 #301a22;color:#3d2624;font-size:clamp(14px,1.4vw,19px);font-weight:900;padding:9px 18px;width:min(100%,330px);min-height:48px;transition:filter .12s,transform .12s}#mb-backrooms-mode-button:hover{transform:translateY(-2px);filter:brightness(1.08)}#mb-backrooms-mode-button:focus-visible{outline:3px solid #ffd7a0;outline-offset:3px}@media(max-width:700px){#homeScreen .mb-backrooms-launcher{grid-column:1/-1;margin:5px auto}}`;
 document.head.append(style);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
