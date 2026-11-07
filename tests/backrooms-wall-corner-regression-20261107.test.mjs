import test from 'node:test';
import assert from 'node:assert/strict';
import Nav from '../backrooms/src/monster-nav.js';
function maze(){
 let seed=88311;
 const rnd=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
 const map=Array.from({length:25},()=>Array(25).fill(1)),stack=[[1,1]];
 map[1][1]=0;
 while(stack.length){
  const [x,z]=stack[stack.length-1];
  const dirs=[[2,0],[-2,0],[0,2],[0,-2]].filter(([dx,dz])=>
   x+dx>0&&z+dz>0&&x+dx<24&&z+dz<24&&map[z+dz][x+dx]);
  if(!dirs.length){stack.pop();continue;}
  const [dx,dz]=dirs[Math.floor(rnd()*dirs.length)];
  map[z+dz/2][x+dx/2]=map[z+dz][x+dx]=0;
  stack.push([x+dx,z+dz]);
 }
 return map;
}
const props=[
 {x:74,z:46},{x:94,z:42},{x:62,z:82},{x:58,z:94},{x:6,z:50},
 {x:46,z:54},{x:78,z:6},{x:14,z:34},{x:94,z:66},{x:38,z:10},{x:54,z:14}
];
const blocked=(x,z)=>props.some(p=>Math.abs(x-p.x)<1.15&&Math.abs(z-p.z)<1.15);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
test('a bend must not be skipped while the next leg passes through a wall',()=>{
 const map=maze(),at={x:92.27117232517031,z:44.41575314114027};
 const corner={x:92.5,z:44.5},following={x:92.5,z:7.5};
 assert.ok(dist(at,corner)<.43);
 assert.equal(Nav.clearLine(map,corner,following,{blocked}),true);
 assert.equal(Nav.clearLine(map,at,following,{blocked}),false);
 const path=[corner,following];
 assert.deepEqual(Nav.nextWaypoint(map,at,path,{blocked}),corner);
 assert.equal(path.length,2);
});
const cases=[
 [{x:34,z:86},{x:82,z:6}],
 [{x:54,z:6},{x:94,z:70}],
 [{x:38,z:30},{x:46,z:94}],
 [{x:18,z:14},{x:14,z:46}],
 [{x:58,z:30},{x:14,z:94}],
 [{x:50,z:6},{x:14,z:46}]
];
for(const mode of ['solo','coop']){
 test(mode+' routes successfully around tight corners and props',()=>{
  const map=maze();
  for(const [from,to] of cases){
   const route=Nav.route(map,from,to,{blocked});
   assert.ok(route.length>2,'must find a legitimate path around walls');
   const path=mode==='solo'?route.map(p=>[p.x,p.z]):route.map(p=>({...p}));
   let at={...from};
   for(let i=0;i<2500&&path.length;i++){
    const waypoint=Nav.nextWaypoint(map,at,path,{blocked});
    if(!waypoint)break;
    const moved=Nav.advance(map,at,waypoint,.32,{blocked});
    assert.equal(moved.moved,true,'AI should not walk into wall and freeze');
    at={x:moved.x,z:moved.z};
    assert.equal(Nav.walkable(map,at.x,at.z,.35),true);
    assert.equal(blocked(at.x,at.z),false);
   }
   assert.ok(dist(at,to)<.75,'failed to reach target, remaining: '+dist(at,to));
  }
 });
}
