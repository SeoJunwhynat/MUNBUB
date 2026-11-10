/* 《이름 없는 사람들의 역사》 v8: actual WebGL 3D historical chapters.
 * Historical perspective is educational, with exploration/document support,
 * not combat replication. 3D war: Republic of Korea soldier, June 25 1950.
 * Yeo: 1947 July 19 13:00 passenger POV in his moving car, non-graphic cinematic.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const KEY='history_v8_3d_chapter';
let saved={war:{x:0,z:5,tasks:{}},yeoSeen:false};
try{const read=JSON.parse(localStorage.getItem(KEY)||'null');if(read)saved={...saved,...read,war:{...saved.war,...(read.war||{}),tasks:{...(read.war?.tasks||{})}}}}catch{}
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(saved))}catch{}};
const text=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;',">":'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let active=null,root=null,canvas=null,gl=null,program=null,vao=null,matrixLoc=null,colorLoc=null,meshes=[],raf=0,last=0,elapsed=0;
let camera={x:0,z:5,yaw:0,pitch:0},pressed={},stopped=false,returnScene='museum',shownSteps=new Set(),fadeStarted=false,webglError=false;
const warTasks=[
 {id:'briefing',x:-3.2,z:-12.5,name:'상황 일지 확인',who:'국군 통신병 (창작 인물)',say:'6월 25일 새벽부터 소식이 잇따르고 있습니다. 전해 들은 말과 확인한 시간을 구분해 적어 주세요.',done:'전황 일지를 확인했습니다. 다음은 보급소의 기록을 살펴보세요.'},
 {id:'supply',x:3.4,z:-29,name:'구호 물품 확인',who:'국군 보급병 (창작 인물)',say:'먼저 가족들에게 전달할 물품을 정리해야 합니다. 필요한 이들에게 물자가 도착했는지 적어 주세요.',done:'구호 물품 기록을 정리했습니다. 피란민 안내소로 이동하세요.'},
 {id:'evac',x:-3.1,z:-45,name:'피란 안내 기록',who:'피란민 안내원 (창작 인물)',say:'길을 떠나는 사람들에게 확인된 안내만 전하고 있습니다. 불확실한 소문은 그대로 전하지 말아 주세요.',done:'피란 안내 내용을 기록했습니다. 마지막으로 부대의 일지를 정리하세요.'},
 {id:'archive',x:2.7,z:-62,name:'당시 자료 정리',who:'국군 기록병 (창작 인물)',say:'누가 승리했는지만 적어 두면 그날의 사람이 사라집니다. 우리가 본 것과 확인된 사실을 함께 남겨 주세요.',done:'1950년 6월 25일의 기록을 정리했습니다.'}
];
const warNpcs=[
 [-7,-8,'이동 중인 국군 병사','전쟁이 이렇게 시작될 줄은 아무도 알지 못했습니다.'],
 [6,-16,'국군 통신병','확인된 기록부터 정리해 주세요.'],
 [-5,-24,'구호소 근무자','이곳에 남은 사람들도 오늘의 기록에 남아야 합니다.'],
 [7,-36,'피란민','가족이 어디로 갈 수 있는지 알고 싶어요.'],
 [-7,-53,'국군 기록병','기억은 흐려져도 날짜가 적힌 기록은 다시 찾아볼 수 있죠.'],
 [6,-69,'피란 안내원','무사히 도착했다는 소식이 기다려집니다.']
];
function canvasRoot(){
 if(root)return;
 const viewport=document.querySelector('.viewport');if(!viewport)return;
 root=document.createElement('div');root.id='historyV8ThreeD';root.setAttribute('aria-label','역사 3D 체험');
 root.innerHTML='<canvas id="historyV8Canvas" tabindex="0" aria-label="실제 WebGL 3D 역사 체험 장면"></canvas>'+
 '<div class="v8-3d-hud"><span id="v8Title">3D 역사 체험</span><span id="v8Date">1950년</span></div>'+
 '<div class="v8-3d-crosshair" aria-hidden="true">+</div>'+
 '<section class="v8-3d-panel"><h3 id="v8Objective">역사 현장 탐험</h3><p id="v8Description">주변을 살펴보세요.</p><p id="v8Near"></p></section>'+
 '<div id="v8Cue" class="v8-3d-cue" aria-live="polite"></div>'+
 '<div class="v8-3d-toolbar"><button id="v8Back" type="button">↩ 2D로 복귀</button><button id="v8Switch" type="button">3D 모드 전환</button><button id="v8Museum" type="button">🏛 박물관</button></div>'+
 '<div class="v8-3d-mobile"><button data-v8-hold="left">◀</button><button data-v8-hold="forward">▲</button><button data-v8-hold="back">▼</button><button data-v8-hold="right">▶</button><button id="v8Interact" type="button">조사 E</button></div>'+
 '<div id="v8End" class="v8-3d-end" hidden><h2 id="v8EndTitle"></h2><p id="v8EndBody"></p><div><button id="v8Replay">장면 다시 보기</button><button id="v8Finish">2D 스토리로 복귀</button></div></div>';
 viewport.appendChild(root);canvas=$('historyV8Canvas');
 $('v8Back').onclick=()=>exit();
 $('v8Museum').onclick=()=>exit('museum');
 $('v8Switch').onclick=()=>enter(active==='war'?'yeo':'war');
 $('v8Replay').onclick=()=>enter(active,{restart:true});
 $('v8Finish').onclick=()=>exit();
 $('v8Interact').onclick=()=>interact();
 root.querySelectorAll('[data-v8-hold]').forEach(btn=>{
  let key=btn.dataset.v8Hold;
  const up=()=>{delete pressed[key];btn.classList.remove('pressed')};
  btn.addEventListener('pointerdown',e=>{e.preventDefault();pressed[key]=true;btn.classList.add('pressed');btn.setPointerCapture?.(e.pointerId)});
  btn.addEventListener('pointerup',up);btn.addEventListener('pointercancel',up);btn.addEventListener('lostpointercapture',up);
 });
 document.addEventListener('keydown',onKey,true);document.addEventListener('keyup',onKey,true);
}
function onKey(e){
 if(!active||e.target?.matches?.('input,textarea,[contenteditable]'))return;
 const key=e.code;
 const ours=['KeyW','KeyS','KeyA','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight','KeyE','Escape','Space'];
 if(!ours.includes(key))return;
 e.preventDefault();e.stopImmediatePropagation();
 if(e.type==='keyup'){delete pressed[key];return}
 if(key==='Escape'&&!e.repeat){exit();return}
 if(key==='KeyE'&&!e.repeat){interact();return}
 pressed[key]=true;
}
function programInit(){
 if(gl)return true;
 gl=canvas.getContext('webgl2',{alpha:false,antialias:true})||canvas.getContext('webgl',{alpha:false,antialias:true});
 if(!gl){webglError=true;return false}
 const vertex='attribute vec3 aPos; attribute float aShade;uniform mat4 uMatrix;uniform vec3 uColor;varying vec3 vColor;varying float vDepth;void main(){vec4 v=uMatrix*vec4(aPos,1.0);gl_Position=v;vColor=uColor*aShade;vDepth=v.w;}';
 const frag='precision mediump float;varying vec3 vColor;varying float vDepth;uniform vec3 uFog;void main(){float fog=clamp((vDepth-18.0)/90.0,0.0,0.72);gl_FragColor=vec4(mix(vColor,uFog,fog),1.0);}';
 const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader};
 try{
  program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,frag));gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const verts=[];
  const face=(points,shade)=>{
   for(const p of [points[0],points[1],points[2],points[0],points[2],points[3]])verts.push(...p,shade)
  };
  face([[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]],.95);
  face([[.5,-.5,-.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5]],.6);
  face([[.5,-.5,.5],[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5]],.72);
  face([[-.5,-.5,-.5],[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5]],.8);
  face([[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5],[-.5,.5,-.5]],1.12);
  face([[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5]],.48);
  vao=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vao);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.STATIC_DRAW);
  const aPos=gl.getAttribLocation(program,'aPos'),aShade=gl.getAttribLocation(program,'aShade');
  gl.vertexAttribPointer(aPos,3,gl.FLOAT,false,16,0);gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aShade,1,gl.FLOAT,false,16,12);gl.enableVertexAttribArray(aShade);
  matrixLoc=gl.getUniformLocation(program,'uMatrix');colorLoc=gl.getUniformLocation(program,'uColor');
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);
  return true;
 }catch(e){console.error('History WebGL',e);webglError=true;return false}
}
const box=(x,y,z,w,h,d,color,scroll=false)=>meshes.push({x,y,z,w,h,d,color,scroll});
function soldier(x,z,shirt='#637666'){
 box(x,1.05,z,.85,1.26,.55,shirt);
 box(x,2.0,z,.54,.55,.5,'#c5a68b');
 box(x,2.36,z,.76,.18,.65,'#5a6854');
 box(x-.23,.35,z,.27,.7,.3,'#38443b');box(x+.23,.35,z,.27,.7,.3,'#38443b');
}
function house(x,z,w=7,color='#817b74'){
 box(x,2.7,z,w,5.4,7,color);
 box(x,5.48,z,w+.5,.5,8,'#554f55');
 for(let i=-1;i<2;i++)box(x+i*w/3,3.5,z+3.52,.8,.9,.08,'#d4bd9c');
 box(x,1.35,z+3.6,1,2.7,.13,'#4c3e3e');
}
function worldWar(){
 meshes=[];
 box(0,-.24,-36,100,.42,155,'#61594d');box(0,-.018,-36,14,.04,155,'#78736a');
 box(0,-.007,-36,1.9,.025,155,'#57544e');
 for(let i=0;i<13;i++){
  const z=9-i*7.2;
  box(-7,.4,z,1.1,.8,2.2,'#858174');box(7,.42,z-.9,1.1,.85,2,'#7a766b');
  if(i%2===0){box(-14,2,z-4,4.8,4.1,5,'#5e625a');box(14,2.2,z-1,5.3,4.4,5,'#68665f')}
 }
 house(-19,-26,7,'#746b65');house(19,-45,8,'#777268');
 box(-3.2,.9,-12.5,1.6,1.8,.9,'#b49a7f');
 box(3.4,.9,-29,2,1.8,1.2,'#938b72');
 box(-3.1,1.4,-45,2.5,2.8,1.1,'#b09a86');
 box(2.7,.9,-62,1.8,1.8,1,'#aea68e');
 for(const [x,z] of warNpcs)soldier(x,z);
 for(let i=0;i<18;i++){const x=(i%2?1:-1)*(19+i%4*4),z=3-i*4.8;box(x,2.3,z,.5,4.6,.45,'#565a4b');box(x,4.8,z,1.6,.7,1,'#4f5148')}
}
function worldCar(){
 meshes=[];
 box(0,-.13,-47,15,.26,170,'#7a7771');
 box(-8,0,-46,1.3,.25,171,'#58504b');box(8,0,-46,1.3,.25,171,'#58504b');
 for(let i=0;i<24;i++)house(i%2===0?-19:19,11-i*6.7,i%5===0?7:5,i%3===0?'#8d7968':'#81786f');
 // Rear passenger seat and a period-looking dashboard, framed in actual perspective geometry
 box(0,.64,-.65,3.9,1.15,.5,'#352b2a');
 box(0,.63,-1.5,3.85,.25,.7,'#5c443b');
 box(-1.97,1.75,-1.65,.19,2.85,.27,'#332c2b');
 box(1.97,1.75,-1.65,.19,2.85,.27,'#332c2b');
 box(0,2.98,-1.65,4,.28,.3,'#3e3433');
 box(0,1.14,-1.65,4,.15,.3,'#3e3433');
 box(0,.72,-2,2.5,.26,.54,'#886c51');
 box(-1.1,.72,-1.72,.6,.15,.15,'#b2a087');
}
function hex(rgb){
 const n=parseInt(rgb.replace('#',''),16);
 return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]
}
const normalize=v=>{const len=Math.hypot(...v)||1;return v.map(x=>x/len)};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a.reduce((sum,n,i)=>sum+n*b[i],0);
function lookAt(eye,at){
 const z=normalize(eye.map((v,i)=>v-at[i])),x=normalize(cross([0,1,0],z)),y=cross(z,x);
 return [x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]
}
function mult(a,b){const r=new Float32Array(16);for(let c=0;c<4;c++)for(let row=0;row<4;row++)for(let k=0;k<4;k++)r[c*4+row]+=a[k*4+row]*b[c*4+k];return r}
function perspective(fov,aspect,near,far){
 const f=1/Math.tan(fov/2),n=1/(near-far);
 return [f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*n,-1,0,0,2*far*near*n,0]
}
function model(o,z){return [o.w,0,0,0,0,o.h,0,0,0,0,o.d,0,o.x,o.y,z,1]}
function resize(){
 if(!canvas||!gl)return;
 const w=Math.min(1600,Math.max(320,canvas.clientWidth*devicePixelRatio)),h=Math.min(900,Math.max(220,canvas.clientHeight*devicePixelRatio));
 if(canvas.width!==Math.round(w)||canvas.height!==Math.round(h)){canvas.width=Math.round(w);canvas.height=Math.round(h)}
 gl.viewport(0,0,canvas.width,canvas.height);
}
function render(){
 if(!gl)return;resize();const war=active==='war';
 const bg=war?[.54,.59,.57]:[.62,.62,.64];
 gl.clearColor(...bg,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 gl.useProgram(program);gl.uniform3fv(gl.getUniformLocation(program,'uFog'),bg);
 const eye=war?[camera.x,1.75,camera.z]:[Math.sin(elapsed*.26)*.08,1.75,1.4];
 const yaw=war?camera.yaw:Math.sin(elapsed*.13)*.03;
 const at=[eye[0]+Math.sin(yaw),eye[1]+(war?camera.pitch:0),eye[2]-Math.cos(yaw)];
 const view=lookAt(eye,at),projection=perspective(65*Math.PI/180,canvas.width/canvas.height,.08,160);
 const pv=mult(projection,view);
 for(const o of meshes){
  let z=o.z;
  if(o.scroll)z=((o.z+elapsed*6+155)%160)-145;
  gl.uniformMatrix4fv(matrixLoc,false,mult(pv,model(o,z)));
  gl.uniform3fv(colorLoc,hex(o.color));gl.drawArrays(gl.TRIANGLES,0,36);
 }
}
function cue(name,message){
 $('v8Cue').innerHTML='<b>'+text(name)+'</b><p>'+text(message)+'</p>';
 $('v8Cue').classList.add('show');
}
function nearby(){
 if(active!=='war')return null;
 const list=warTasks.filter(q=>!saved.war.tasks[q.id]&&Math.hypot(camera.x-q.x,camera.z-q.z)<3.4);
 if(list.length)return {kind:'task',task:list[0]};
 const npc=warNpcs.find(p=>Math.hypot(camera.x-p[0],camera.z-p[1])<2.75);
 return npc?{kind:'npc',npc}:null;
}
function interact(){
 if(active!=='war')return;
 const n=nearby();
 if(!n){cue('현장','상황 일지와 안내 표시 가까이 다가가 E로 조사하세요.');return}
 if(n.kind==='npc'){cue(n.npc[2],n.npc[3]);return}
 const q=n.task;
 saved.war.tasks[q.id]=true;persist();cue(q.who,q.say);
 $('v8Description').textContent=q.done;
 updateWarTask();
}
function updateWarTask(){
 const done=warTasks.filter(x=>saved.war.tasks[x.id]).length;
 $('v8Objective').textContent='국군 병사의 현장 기록 · '+done+'/'+warTasks.length;
 if(done===warTasks.length){
  $('v8Description').textContent='1950년 6월 25일의 하루를 돌아보며, 확인한 기록을 남겼습니다.';
  $('v8Near').textContent='모든 환경 조사 완료 · 2D 또는 박물관으로 돌아갈 수 있습니다.';
  if(!shownSteps.has('war-end')){shownSteps.add('war-end');cue('국군 기록병','그날을 기록한다면, 군인뿐 아니라 함께 그날을 살아낸 사람들도 남겨 주세요.')}
 }else{
  const next=warTasks.find(x=>!saved.war.tasks[x.id]);
  $('v8Description').textContent='다음 목표: '+next.name+' · 정면 도로를 따라 이동하여 조사하세요.';
 }
}
function update(dt){
 if(active==='war'){
  const fwd=(pressed.KeyW||pressed.ArrowUp||pressed.forward?1:0)-(pressed.KeyS||pressed.ArrowDown||pressed.back?1:0);
  const str=(pressed.KeyD||pressed.right?1:0)-(pressed.KeyA||pressed.left?1:0);
  const speed=(pressed.ShiftLeft||pressed.ShiftRight?6.8:4.2)*dt;
  camera.x=Math.max(-8.4,Math.min(8.4,camera.x+str*speed));
  camera.z=Math.max(-73,Math.min(8,camera.z-fwd*speed));
  if(pressed.ArrowLeft)camera.yaw=Math.max(-.8,camera.yaw-dt*.85);
  if(pressed.ArrowRight)camera.yaw=Math.min(.8,camera.yaw+dt*.85);
  saved.war.x=camera.x;saved.war.z=camera.z;
  const near=nearby();$('v8Near').textContent=near?'[E] '+(near.kind==='task'?near.task.name:near.npc[2]):'WASD 이동 · Shift 달리기 · E 조사 · Esc 2D 복귀';
  if(Math.floor(elapsed)%7===0&&Math.floor(elapsed)!==shownSteps.lastPersist){shownSteps.lastPersist=Math.floor(elapsed);persist()}
 }else if(active==='yeo'){
  if(elapsed<6&&!shownSteps.has('car-0')){shownSteps.add('car-0');cue('여운형 시점 · 창작 독백','1947년 여름, 서울의 거리를 자동차로 지나갑니다. 서로 다른 생각을 가진 사람들은 같은 도시에서 살아가고 있습니다.')}
  if(elapsed>7&&!shownSteps.has('car-1')){shownSteps.add('car-1');cue('차량 내부 · 창작 연출','창밖으로 혜화동의 거리가 이어집니다. 나는 지난날의 대화와 아직 끝나지 않은 일들을 떠올립니다.')}
  if(elapsed>14&&!fadeStarted){
   fadeStarted=true;root.classList.add('v8-historical-cut');
   $('v8Description').textContent='1947년 7월 19일 · 오후 1시경 · 서울 혜화동';
   $('v8Near').textContent='국사편찬위원회 자료에서 사건이 확인됩니다.';
  }
  if(elapsed>17&&!shownSteps.has('car-end')){
   shownSteps.add('car-end');saved.yeoSeen=true;persist();endCar();
  }
 }
}
function endCar(){
 $('v8EndTitle').textContent='1947년 7월 19일 · 여운형 암살';
 $('v8EndBody').textContent='여운형은 서울 혜화동에서 자동차로 이동하던 중 암살되었습니다. 당대 외교 보고서는 오후 1시경으로 기록하며, 당시 신문 보도에는 오후 1시 15분경으로 전해집니다. 자동차 내부의 독백과 주행 화면은 역사 사실을 이해하기 위한 창작 연출입니다. 이후 2D 거리에서 당시 기록과 시민들의 반응을 살펴볼 수 있습니다.';
 $('v8End').hidden=false;
}
function loop(now){
 if(!active){raf=0;return}
 const dt=Math.min(.06,Math.max(0,(now-last)/1000));last=now;elapsed+=dt;
 update(dt);
 if(!webglError)render();
 raf=requestAnimationFrame(loop);
}
function enter(mode,opts={}){
 if(!['war','yeo'].includes(mode))return false;
 canvasRoot();if(!root)return false;
 if(!active)returnScene=window.MB_V7?.snapshot?.()?.scene||'museum';
 if(raf)cancelAnimationFrame(raf);
 active=mode;pressed={};shownSteps=new Set();elapsed=0;fadeStarted=false;webglError=false;
 $('v8End').hidden=true;root.classList.remove('v8-historical-cut');
 root.classList.add('active');canvas?.focus();
 $('v8Title').textContent=mode==='war'?'6·25 전쟁 · 국군 병사 시점':'여운형 자동차 · 1인칭 시네마틱';
 $('v8Date').textContent=mode==='war'?'1950. 6. 25. · 북한군 남침':'1947. 7. 19. · 오후 1시경';
 $('v8Near').textContent='Esc · 2D 복귀';
 $('v8Cue').classList.remove('show');
 if(mode==='war'){
  if(opts.restart){saved.war={x:0,z:5,tasks:{}};persist()}
  camera={x:saved.war.x||0,z:Number.isFinite(saved.war.z)?saved.war.z:5,yaw:0,pitch:0};
  $('v8Description').textContent='1950년 6월 25일, 국군 병사의 시점으로 당시의 기록과 피란 안내 현장을 탐험합니다.';
  worldWar();updateWarTask();
  cue('국군 병사 (창작 인물)','무슨 일이 벌어지는지 제대로 기록해야 해. 먼저 가까운 상황 일지를 찾아보자.');
 }else{
  worldCar();
  $('v8Objective').textContent='여운형의 시점 · 혜화동으로 가는 자동차';
  $('v8Description').textContent='차량 내부의 3D 시점에서 당시 서울을 바라봅니다. 사건 당시 실제 발언은 확인되지 않아 대사는 창작으로 처리했습니다.';
  cue('시네마틱 안내','3D 카메라가 1947년 7월 19일 서울의 거리로 이동합니다. 2D로 언제든 돌아갈 수 있습니다.');
 }
 if(!programInit()){
  $('v8Objective').textContent='이 기기에서 WebGL 3D 그래픽을 사용할 수 없습니다.';
  $('v8Description').textContent='브라우저 하드웨어 가속을 확인하거나 2D 체험으로 돌아가 주세요.';
 }
 last=performance.now();raf=requestAnimationFrame(loop);
 return true;
}
function exit(target){
 if(!active)return;
 const prev=active;
 active=null;
 if(raf)cancelAnimationFrame(raf);raf=0;pressed={};root?.classList.remove('active','v8-historical-cut');
 if(prev==='war')persist();
 const go=target||(prev==='yeo'?'1947':returnScene);
 window.MB_V7?.goto?.(go);
 window.MB_V7?.notify?.(go==='museum'?'박물관 로비로 돌아왔습니다.':'2D 횡스크롤 탐험으로 돌아왔습니다.');
 if(target==='museum')returnScene='museum';
}
function mountNav(){
 const stage=document.querySelector('.stage-head');if(!stage)return;
 const nav=document.createElement('div');nav.className='v8-mode-links';
 nav.innerHTML='<button type="button" id="v8WarOpen">🪖 1950 국군 3D 체험</button>'+
 '<button type="button" id="v8YeoOpen">🚗 1947 여운형 자동차 3D</button>'+
 '<button type="button" id="v8TwoDOpen">↩ 2D 스토리 복귀</button>';
 stage.after(nav);
 $('v8WarOpen').onclick=()=>enter('war');
 $('v8YeoOpen').onclick=()=>enter('yeo');
 $('v8TwoDOpen').onclick=()=>{if(active)exit();else window.MB_V7?.goto?.('street')};
 canvasRoot();
 const css=document.createElement('link');css.rel='stylesheet';css.href='/history-v8-3d.css';document.head.append(css);
}
window.MB_HISTORY_3D={enterWar:()=>enter('war'),enterYeo:()=>enter('yeo'),enter,exit,isActive:()=>!!active,status:()=>({mode:active,war:saved.war,yeoSeen:saved.yeoSeen}),tasks:warTasks.map(t=>({id:t.id,name:t.name}))};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountNav,{once:true});else mountNav();
})();