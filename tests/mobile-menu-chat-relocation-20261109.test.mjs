import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {Script} from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const chat=read('munbub_global_chat_20261108.js');
const chatCss=read('munbub_global_chat_20261108.css');
const mode=read('munbub_mobile_menu_art_20261109.js');
const modeCss=read('munbub_mobile_menu_art_20261109.css');
const launcher=read('munbub_backrooms_entry_20261106.js');
const repoRoot=new URL('../',import.meta.url);

test('mobile chat no longer floats over bottom navigation',()=>{
 assert.match(chat,/function ensureMobileChatEntry\(\)/);
 assert.match(chat,/entry\.id='mb-mobile-chat-entry'/);
 assert.match(chat,/drawer\.hidden=true;\s*display\(true\)/);
 assert.match(chat,/setInterval\(\(\)=>\{liftChat\(\);ensureMobileChatEntry\(\)\},1800\)/);
 assert.match(chatCss,/@media\(max-width:700px\)/);
 assert.match(chatCss,/#mb-global-chat-toggle\{\s*display:none!important/);
 assert.match(chatCss,/button\.mb-mobile-chat-entry/);
 assert.match(chatCss,/min-height:58px!important/);
 assert.doesNotThrow(()=>new Script(chat));
});
test('every additional mode keeps its original behavior and receives visible artwork',()=>{
 for(const route of ['home','spelling','idiom','application','infinite','timed','ranked','hard','duel','mistakes','history','settings']){
  assert.match(mode,new RegExp('\\b'+route+':\\['),'missing route '+route);
 }
 assert.match(mode,/function restoreButton\(button\)/);
 assert.match(mode,/button\.querySelector\('img'\)/);
 assert.match(mode,/BANNERS\.has\(route\)/);
 assert.match(mode,/button\.prepend\(img\)/);
 assert.match(mode,/button\.append\(caption\)/);
 assert.match(mode,/MutationObserver/);
 assert.match(mode,/data-route="ranked"/);
 assert.match(mode,/primary\.click\(\)/);
 assert.match(mode,/drawer\.querySelector\('#mb-mobile-chat-entry'\)/);
 assert.doesNotThrow(()=>new Script(mode));
});
test('all art filenames actually exist in repository',()=>{
 const names=['mb_ranking_ui.webp','timed_sidebar_new.png','hardcore-feature.webp','scene_spelling.webp',
 'scene_idiom.webp','scene_infinite.webp','duel-arena.webp','title-brush.webp'];
 for(const name of names){
  const file=new URL('ui-assets/'+name,repoRoot);
  assert.ok(existsSync(file),'missing mobile art '+name);
  assert.ok(statSync(file).size>1000,'empty mobile art '+name);
 }
});
test('mobile menu CSS shows readable labels, safe area, image fallback, no clipping',()=>{
 assert.match(modeCss,/max-height:calc\(100dvh/);
 assert.match(modeCss,/overflow-y:auto!important/);
 assert.match(modeCss,/mb-mobile-existing-art img/);
 assert.match(modeCss,/mb-mobile-route-card/);
 assert.match(modeCss,/mb-mobile-mode-banner/);
 assert.match(modeCss,/mb-mobile-art-missing/);
 assert.match(modeCss,/font:900 clamp\(15px,4vw,19px\)/);
 assert.equal(modeCss.split('{').length,modeCss.split('}').length);
 assert.match(launcher,/mobileArt\.src='\/munbub_mobile_menu_art_20261109\.js'/);
});
