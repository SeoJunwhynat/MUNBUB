import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const html=readFileSync(new URL('../backrooms/index.html',import.meta.url),'utf8');
const match=html.match(/function updateSprint\(dt,wantsToSprint\)\{[\s\S]*?\n\}/);
assert.ok(match,'Stamina movement controller is present');
function rig(){
 const scope=vm.createContext({});
 vm.runInContext(`const MAX_STAMINA=300,STAMINA_REGEN_PER_SECOND=72;let stamina=MAX_STAMINA,staminaExhausted=false,notices=[];function toast(s){notices.push(s)};function updateStaminaHUD(){};function sound(){}\n${match[0]}\nglobalThis.rig={tick:updateSprint,get:()=>({stamina,staminaExhausted,notices})};`,scope);
 return scope.rig;
}

test('Holding sprint drains stamina all the way to zero and blocks sprint',()=>{
 const r=rig();
 for(let i=0;i<1300 && !r.get().staminaExhausted;i++)r.tick(1/60,true);
 let st=r.get();
 assert.equal(st.stamina,0);
 assert.equal(st.staminaExhausted,true);
 assert.equal(st.notices.length,1);
 for(let i=0;i<200;i++)assert.equal(r.tick(1/60,true),false,'Cannot run until fully recovered');
 st=r.get();
 assert.ok(st.stamina>0 && st.stamina<300);
 assert.equal(st.staminaExhausted,true);
 assert.equal(st.notices.length,1);
});

test('Full recovery clears exhaustion, allowing sprint again',()=>{
 const r=rig();
 for(let i=0;i<1300&&!r.get().staminaExhausted;i++)r.tick(1/60,true);
 let ticks=0;
 while(r.get().stamina<300 && ticks<900){assert.equal(r.tick(1/60,true),false);ticks++}
 assert.equal(r.get().stamina,300);
 assert.equal(r.get().staminaExhausted,false);
 assert.equal(r.get().notices.length,2);
 assert.equal(r.tick(1/60,true),true);
 assert.ok(r.get().stamina<300);
});

test('Resting before exhaustion recharges normally without lockout',()=>{
 const r=rig();
 for(let i=0;i<100;i++)assert.equal(r.tick(1/60,true),true);
 assert.ok(r.get().stamina<300);
 for(let i=0;i<200;i++)r.tick(1/60,false);
 assert.equal(r.get().stamina,300);
 assert.equal(r.get().staminaExhausted,false);
 assert.equal(r.tick(1/60,true),true);
});

test('Keyboard/mobile input shares sprint lockout and HUD displays it',()=>{
 assert.match(html,/updateSprint\(dt,\(keys\.ShiftLeft\|\|keys\.ShiftRight\|\|runHold\)\&\&len>\.1\)/);
 assert.match(html,/staminaExhausted=false;runHold=false;[\s\S]*?quizSolved=\{\}/);
 assert.match(html,/staminaExhausted\?' · 회복 중':'/);
 assert.match(html,/#touchRun\.staminaExhausted\{/);
 assert.doesNotMatch(html,/stamina>2&&len>\.1/);
});
