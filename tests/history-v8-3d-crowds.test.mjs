import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const load=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
test('V8 real WebGL Korean War chapter and car POV have actual 3D shader pipeline and independent controls',()=>{
 const js=load('history-v8-3d.js');
 assert.doesNotThrow(()=>new vm.Script(js));
 for(const part of ["getContext('webgl2'","gl.createShader","gl.drawArrays(gl.TRIANGLES",
 "gl.enable(gl.DEPTH_TEST)","function lookAt(","function perspective(","function worldWar()","function worldCar()",
 "function update(dt)","function exit(target)","function enter(mode,opts={})",
 "enterWar:()=>enter('war')","enterYeo:()=>enter('yeo')","isActive:()=>!!active",
 "1950. 6. 25.","1947. 7. 19.","북한군 남침","국군 병사"])assert.ok(js.includes(part),'3D behavior absent: '+part);
 assert.ok(js.includes("const warTasks="));
 assert.match(js,/\'briefing\'|id:\'briefing\'/);
 assert.match(js,/id:\'supply\'/);
 assert.match(js,/id:\'evac\'/);
 assert.match(js,/id:\'archive\'/);
 assert.ok(!/shoot|weapon|bullet|ammo|triggerFire|fireProjectile|shooting/i.test(js),'war gameplay is exploration and historical documentation, not weapon usage');
 assert.match(js,/returnScene=/);
 assert.match(js,/historyV8ThreeD/);
 assert.match(load('history-v8-3d.css'),/v8-3d-mobile/);
});
test('V8 crowd script adds at least 90 context-grounded named talkable NPCs, with dynamic walking pedestrians',()=>{
 const js=load('history-v8-crowds.js');
 assert.doesNotThrow(()=>new vm.Script(js));
 const context={window:{MB_V7_STORY:{bubble(){}}}};
 vm.runInNewContext(js,context);
 const c=context.window.MB_HISTORY_CROWDS;
 assert.ok(c.count>=90,'too few NPCs: '+c.count);
 for(const scene of ['museum','street','print','market','news','home','school','plaza','1947','1950']){
  const objs=[];c.populate(scene,(x,y,name,kind,action)=>objs.push({x,y,name,kind,action}));
  assert.ok(objs.length>=5,scene+' too few NPCs');
  assert.ok(objs.every(o=>o.x>=0&&o.x<=2200&&o.y===282&&o.kind==='npc'&&typeof o.action==='function'));
 }
 assert.match(js,/Math\.sin\(tick/);
 assert.match(js,/function draw\(ctx,cam,scene,tick\)/);
});
test('3D chapters are navigable from museum door, era list and dated 1947 cutscene; can exit back to real 2D',()=>{
 const h=load('history-story-v7.html');
 assert.match(h,/history-v8-3d\.js/);
 assert.match(h,/history-v8-crowds\.js/);
 assert.match(h,/MB_HISTORY_3D\?\.enterWar/);
 assert.match(h,/MB_HISTORY_3D\?\.enterYeo/);
 assert.match(h,/MB_HISTORY_3D\?\.isActive/);
 assert.match(h,/MB_HISTORY_CROWDS\?\.populate/);
 assert.match(h,/MB_HISTORY_CROWDS\?\.draw/);
 assert.equal((h.match(/data:image\/webp;base64/g)||[]).length,4,'2D art should survive');
 const originalSprites=[...h.matchAll(/data:image\/png;base64,([A-Za-z0-9+/=]+)/g)];
 assert.equal(originalSprites.length,2,'user-supplied museum image and pixel sprite sheet should be embedded');
 assert.ok(originalSprites.some(x=>x[1].length>100000),'museum 2200x360 sprite bitmap missing');
 assert.ok(originalSprites.some(x=>x[1].length>6000&&x[1].length<20000),'pixel character sprite sheet missing');
 assert.match(h,/function spriteFrame\(charName,frame,x,y/);
 assert.match(h,/function drawMuseumBackground\(\)/);
 assert.match(h,/if\(spriteFrame\(idx===2/);

 assert.match(load('history-v7-controls.js'),/MB_HISTORY_3D\?\.isActive/);
 const js=load('history-v8-3d.js');
 for(const button of ['v8WarOpen','v8YeoOpen','v8TwoDOpen','v8Back','v8Museum','v8Switch'])
  assert.ok(js.includes(button),'missing exit/entry control '+button);
});
test('3D POV historical depictions are labeled as reconstructed, retain sourced time and no granular violence',()=>{
 const js=load('history-v8-3d.js');
 assert.match(js,/창작 연출/);
 assert.match(js,/1947년 7월 19일/);
 assert.match(js,/오후 1시 15분/);
 assert.match(js,/국사편찬위원회/);
 assert.match(js,/피란 안내/);
 assert.match(js,/3D 카메라/);
 assert.ok(!js.includes('총을 발사'),'no attack simulation');
});
