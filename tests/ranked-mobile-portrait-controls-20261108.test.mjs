import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {Script,runInNewContext} from 'node:vm';
const read=(file)=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const ranked=read('munbub_ranked_challenge.js');
const rankedCss=read('munbub_ranked_visual_20261106.css');
const mobile=read('munbub_mobile_portrait_20261108.css');
const quiz=read('munbub_quiz_scenes_2026.css');
const launcher=read('munbub_backrooms_entry_20261106.js');
function clickEvent(partial={}){
 return {code:'Space',key:' ',repeat:false,isComposing:false,keyCode:32,
  target:{closest:()=>null},prevented:false,stopped:false,
  preventDefault(){this.prevented=true;},
  stopPropagation(){this.stopped=true;},...partial};
}
test('ranked shortcut advances precisely once only on visible feedback screen',()=>{
 const a=ranked.indexOf("dialog.addEventListener('keydown',e=>{");
 const b=ranked.indexOf("dialog.addEventListener('cancel'",a);
 assert.ok(a>0&&b>a,'keyboard handler is attached to ranked dialog');
 const source=ranked.slice(a,ranked.indexOf(" // Keyboard focus",a)>a?ranked.indexOf(" // Keyboard focus",a):b);
 let handler=null,called=0,feedback=true;
 const dialog={open:true,querySelector:(x)=>x==='#mb-ranked-next'&&feedback?{}:null,
  addEventListener:(type,fn)=>{if(type==='keydown')handler=fn}};
 const ctx={dialog,active:true,busy:false,next:()=>{called++;ctx.busy=true}};
 assert.doesNotThrow(()=>runInNewContext(source,ctx));
 assert.equal(typeof handler,'function');
 const first=clickEvent();handler(first);
 assert.equal(called,1);assert.equal(first.prevented,true);
 const rapid=clickEvent();handler(rapid);
 assert.equal(called,1,'busy prevents accidental double-submit');
 ctx.busy=false;
 handler(clickEvent({repeat:true}));assert.equal(called,1);
 handler(clickEvent({isComposing:true}));assert.equal(called,1);
 handler(clickEvent({target:{closest:(sel)=>({tag:'INPUT'})}}));assert.equal(called,1);
 feedback=false;
 handler(clickEvent());assert.equal(called,1,'not while current question is displayed');
 feedback=true;
 handler(clickEvent({code:'KeyS',key:'s'}));assert.equal(called,1);
});
test('ranked essay automatically focuses and uses native Enter form submission',()=>{
 assert.match(ranked,/const typed=\$\('mb-ranked-typed'\)/);
 assert.match(ranked,/typed\.focus\(\{preventScroll:true\}\)/);
 assert.match(ranked,/id="mb-ranked-write"/);
 assert.match(ranked,/id="mb-ranked-typed"/);
 assert.match(ranked,/addEventListener\('submit',e=>\{e\.preventDefault\(\);submit\(/);
 assert.match(ranked,/dialog\.querySelector\('#mb-ranked-typed'\)\?\.blur\(\)/);
 assert.match(ranked,/visualViewport\?\.addEventListener\('resize',syncRankedMobileKeyboard\)/);
 assert.match(ranked,/dialog\.style\.setProperty\('height',usable\+'px','important'\)/);
 assert.doesNotThrow(()=>new Script(ranked));
});
test('portrait restores images for logo, mascot, mode buttons and mobile nav',()=>{
 assert.match(launcher,/munbub_mobile_portrait_20261108\.css/);
 for(const selector of ['.mb-dashboard-left>.home-hero','.mb-dashboard-left>.mb-hard-feature',
   '.mb-online-actions button','.mb-home-dashboard>.mb-mascot-stage','.mobile-drawer button.mb-art-button',
   '#mb-backrooms-mode-button>img','.home-card-grid .img-button img']){
  assert.ok(mobile.includes(selector),'portrait CSS missing '+selector);
 }
 assert.match(mobile,/orientation:portrait/);
 assert.match(mobile,/visibility:visible!important/);
 assert.match(mobile,/overflow-y:auto!important/);
 assert.match(mobile,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});
test('ranked portrait shows ALL three original UI image buttons, never hides images',()=>{
 const assetNames=['ranked-time-button.png','ranked-hard-button.png','ranked-infinite-button.png',
  'ranking_timed_animated.webp','ranking_hardcore_animated.webp','ranking_infinite_animated.webp',
  'ranked-stage-final.png','hourglass_loop.webp','title-brush.webp','backrooms-entry-neon.png',
  'scene_hard.webp','scene_timed.webp','scene_infinite.webp','scene_spelling.webp','scene_idiom.webp'];
 for(const name of assetNames){
  const path=new URL('../ui-assets/'+name,import.meta.url);
  assert.ok(existsSync(path),'required UI art not deployed '+name);
  assert.ok(statSync(path).size>500,'empty UI art '+name);
 }
 for(const text of ['.mb-ranked-stage-modes img{','display:block!important','visibility:visible!important',
   'mb-ranked-visual-open .mb-ranked-lobby','grid-template-columns:repeat(3,minmax(0,1fr))',
   '.mb-ranked-lobby-art','max-width:360px']){
  assert.ok(rankedCss.includes(text),text);
 }
});
test('portrait quiz cards and character are separated into distinct grid rows',()=>{
 assert.match(quiz,/orientation:portrait/);
 assert.match(quiz,/grid-template-rows:minmax\(0,1fr\) clamp\(60px,11dvh,86px\)/);
 assert.match(quiz,/\.mb-quiz-companion\{/);
 assert.match(quiz,/grid-row:2!important/);
 assert.match(quiz,/\.mb-mascot-button img\{/);
 assert.match(quiz,/visibility:visible!important/);
 assert.match(quiz,/min-height:44px!important/);
});
test('new CSS is balanced and contains separate safe-area and small-screen cases',()=>{
 for(const [name,css] of [['ranked',rankedCss],['quiz',quiz],['mobile',mobile]]){
  const delta=css.split('{').length-css.split('}').length;
  assert.equal(delta,0,name+' unbalanced CSS');
 }
 assert.match(mobile,/safe-area-inset-bottom/);
 assert.match(mobile,/max-width:380px/);
 assert.match(rankedCss,/max-width:360px/);
});
