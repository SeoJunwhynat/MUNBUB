import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const html=readFileSync(new URL('../backrooms/index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../munbub_ui_patch.js',import.meta.url),'utf8');
const server=readFileSync(new URL('../backrooms/server.js',import.meta.url),'utf8');
test('HUD is a fixed central symmetric filament, white full and red recharging',()=>{
 assert.match(html,/id="hudStamina"[^>]+aria-valuemax="300"/);
 assert.match(html,/#hud #hudStamina,#hud.hudLayoutEnabled #hudStamina/);
 assert.match(html,/left:50%!important/);
 assert.match(html,/transform:translateX\(-50%\)!important/);
 assert.match(html,/#hud #hudStamina.recovering #staminaFill/);
 assert.match(html,/background:#f34a4a!important/);
 assert.match(html,/staminaRecovering&&stamina<MAX_STAMINA/);
});
test('co-op and solo stamina capacity is 300 with doubled recovery speed',()=>{
 assert.match(html,/MAX_STAMINA=300,STAMINA_REGEN_PER_SECOND=18\*4/);
 assert.match(server,/const MAX_STAMINA = 300/);
 assert.match(server,/Math\.min\(MAX_STAMINA,Number\(b\.stamina\)\)/);
});
test('descriptive answers focus automatically and Enter advances after checking',()=>{
 assert.match(app,/__mbEssayAutoFocusV4/);
 assert.match(app,/MutationObserver\(focusEssay\)/);
 assert.match(app,/input\.focus\(\{preventScroll:true\}\)/);
 assert.match(app,/e\.key!=='Enter'/);
 assert.match(app,/document\.getElementById\('nextBtn'\)\?\.click\(\)/);
 assert.doesNotThrow(()=>new Script(app));
});
test('mobile game and main quiz use safe-area and flexible layouts',()=>{
 assert.match(html,/viewport-fit=cover/);
 assert.match(html,/safe-area-inset-bottom/);
 assert.match(html,/@media\(pointer:coarse\) and \(orientation:landscape\)/);
 assert.match(app,/#answerArea \.essay-form input/);
 assert.match(app,/@media\(max-width:850px\)/);
});
