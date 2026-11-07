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
test('FIRST Space during server verification cannot scroll and queues one advance',()=>{
 const from=ranked.indexOf('function handleRankedSpaceKey(e){');
 const to=ranked.indexOf("window.addEventListener('keyup',handleRankedSpaceKey,true);",from);
 assert.ok(from>0&&to>from,'global capture handler found');
 const text=ranked.slice(from,to+"window.addEventListener('keyup',handleRankedSpaceKey,true);".length);
 const handlers={},document={activeElement:{matches:()=>false}};
 let calls=0,result=false;
 const ctx={document,dialog:{open:true,querySelector:id=>id==='#mb-ranked-next'&&result?{}:null},
  active:true,busy:true,answerChecking:true,advanceQueued:false,
  next:()=>{calls++;ctx.busy=true},
  window:{addEventListener:(type,fn,capture)=>{assert.equal(capture,true);handlers[type]=fn}}};
 assert.doesNotThrow(()=>runInNewContext(text,ctx));
 assert.equal(typeof handlers.keydown,'function');
 assert.equal(typeof handlers.keyup,'function');
 const first=clickEvent({type:'keydown',target:{closest:()=>null},
  stopImmediatePropagation(){this.immediate=true}});
 handlers.keydown(first);
 assert.equal(first.prevented,true,'prevent FIRST Space default scroll before response');
 assert.equal(first.immediate,true,'stop other key handlers from triggering');
 assert.equal(ctx.advanceQueued,true,'queue first Space during answer API request');
 assert.equal(calls,0,'cannot advance until server returns');
 const up=clickEvent({type:'keyup'});
 handlers.keyup(up);
 assert.equal(up.prevented,true,'keyup also cannot scroll or activate old choice');
 const repeat=clickEvent({type:'keydown',repeat:true});
 handlers.keydown(repeat);
 assert.equal(repeat.prevented,true,'held key may not scroll');
 assert.equal(calls,0);
 // Simulate submit finally: after showFeedback renders and busy becomes false,
 // the queued FIRST keystroke must invoke next, with no second keystroke.
 result=true;ctx.answerChecking=false;ctx.busy=false;
 const finallyStart=ranked.indexOf('if(advanceQueued&&active&&dialog.open&&dialog.querySelector(',ranked.indexOf('async function submit('));
 const finallyEnd=ranked.indexOf('  }\n }\n function showFeedback',finallyStart);
 assert.ok(finallyStart>0&&finallyEnd>finallyStart);
 const cleanup=ranked.slice(finallyStart,finallyEnd).trim();
 // This fragment is an if/else statement from the successful answer's finally.
 ctx.queueMicrotask=fn=>fn();
 assert.doesNotThrow(()=>runInNewContext(cleanup,ctx));
 assert.equal(calls,1,'FIRST Space advances automatically after feedback');
 assert.equal(ctx.advanceQueued,false,'consumed exactly once');
 // On an already visible feedback screen, one Space immediately advances.
 ctx.busy=false;
 const second=clickEvent({type:'keydown'});
 handlers.keydown(second);
 assert.equal(second.prevented,true);assert.equal(calls,2);
 const busySpace=clickEvent({type:'keydown'});
 handlers.keydown(busySpace);
 assert.equal(busySpace.prevented,true,'must block scroll during next request');
 assert.equal(calls,2,'do not double request');
 ctx.busy=false;
 const input=clickEvent({type:'keydown',target:{closest:()=>({tagName:'INPUT'})}});
 handlers.keydown(input);
 assert.equal(input.prevented,false,'leave whitespace in essays untouched');
 document.activeElement={matches:()=>true};
 const focused=clickEvent({type:'keydown'});handlers.keydown(focused);
 assert.equal(focused.prevented,false);
 document.activeElement={matches:()=>false};
 result=false;
 const question=clickEvent({type:'keydown'});handlers.keydown(question);
 assert.equal(question.prevented,true,'even on question screen prevent page scroll');
 assert.equal(calls,2,'do not skip unanswered question');
 ctx.active=false;
 const closed=clickEvent({type:'keydown'});handlers.keydown(closed);
 assert.equal(closed.prevented,false,'outside ranked mode Space works normally');
});
test('result view focuses NEXT button and uses versioned script so the new fix is loaded',()=>{
 assert.match(ranked,/resultNext\.focus\(\{preventScroll:true\}\)/);
 assert.match(ranked,/dialog\.contains\(resultNext\)/);
 assert.match(ranked,/answerChecking=false;advanceQueued=false/);
 const modes=read('munbub_modes_patch.js');
 const server=read('server.js');
 assert.match(modes,/ranked\.src='\.\/munbub_ranked_challenge\.js\?v=20261108-space2'/);
 assert.match(server,/no-cache, max-age=0, must-revalidate/);
 assert.doesNotThrow(()=>new Script(ranked));
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
