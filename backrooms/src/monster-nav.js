/* Shared deterministic Backrooms navigation. Works in browser and Node CommonJS. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.MonsterNav=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const CELL=4;
 const MONSTER_CHASE_SPEED=((5.75*1.05*.93)*1.08)*0.8;
 const MONSTER_NOTICE_DURATION_MS=1200;
 const MONSTER_FIELD_OF_VIEW_DEGREES=140;
 const MONSTER_PATROL_SPEED=2.65;
 const MONSTER_SEARCH_SPEED=3.2;
 const DIRS=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
 function wall(map,x,z){return map[Math.floor(z/CELL)]?.[Math.floor(x/CELL)]!==0;}
 function walkable(map,x,z,radius=0.35){
   return !wall(map,x-radius,z-radius)&&!wall(map,x-radius,z+radius)
    &&!wall(map,x+radius,z-radius)&&!wall(map,x+radius,z+radius);
 }
 function clearLine(map,a,b,{radius=0.35,blocked=null}={}){
   if(!a||!b||![a.x,a.z,b.x,b.z].every(Number.isFinite))return false;
   const distance=Math.hypot(b.x-a.x,b.z-a.z);
   const steps=Math.max(1,Math.ceil(distance/.20));
   if(steps>800)return false;
   for(let i=0;i<=steps;i++){
     const x=a.x+(b.x-a.x)*i/steps,z=a.z+(b.z-a.z)*i/steps;
     if(!walkable(map,x,z,radius)||blocked?.(x,z))return false;
   }
   return true;
 }

 // Facing is a yaw angle measured from +Z towards +X. The sight cone
 // extends 70° to either side (total FOV 140°), not behind the monster.
 function withinFieldOfView(from,to,facing,angle=MONSTER_FIELD_OF_VIEW_DEGREES){
  if(!from||!to||![from.x,from.z,to.x,to.z,facing].every(Number.isFinite))return false;
  const dx=to.x-from.x,dz=to.z-from.z;
  const distance=Math.hypot(dx,dz);
  if(distance<.0001)return true;
  const field=Math.max(0,Math.min(360,Number(angle)||0))*Math.PI/360;
  return (dx*Math.sin(facing)+dz*Math.cos(facing))/distance>=Math.cos(field)-1e-8;
 }
 // Shared perception: require both an unobstructed line and the front arc.
 function visible(map,from,to,{blocked=null,maxDistance=Infinity,facing=null,fovDegrees=MONSTER_FIELD_OF_VIEW_DEGREES}={}){
  if(!map?.length||!from||!to||![from.x,from.z,to.x,to.z].every(Number.isFinite))return false;
  if(Math.hypot(to.x-from.x,to.z-from.z)>maxDistance)return false;
  if(facing!==null&&!withinFieldOfView(from,to,facing,fovDegrees))return false;
  return clearLine(map,from,to,{radius:.08,blocked});
 }
 // Predict cautiously; never aim across a wall/prop or overreact to network jitter.
 function predict(map,target,velocity,{blocked=null,leadSeconds=.27,maxLead=1.6}={}){
  if(!target||![target.x,target.z].every(Number.isFinite))return null;
  const base={x:target.x,z:target.z};
  const vx=Number.isFinite(velocity?.x)?Math.max(-7.4,Math.min(7.4,velocity.x)):0;
  const vz=Number.isFinite(velocity?.z)?Math.max(-7.4,Math.min(7.4,velocity.z)):0;
  const length=Math.hypot(vx,vz)*leadSeconds;
  if(length<.01)return base;
  const scale=Math.min(leadSeconds,maxLead/Math.hypot(vx,vz));
  const next={x:base.x+vx*scale,z:base.z+vz*scale};
  return clearLine(map,base,next,{blocked,radius:.35})?next:base;
 }
 // A player can stand within .35m of a wall (player radius .33m).
 // Rather than fail pathfinding at that unreachable exact point, find a legal
 // approach on the player's side within monster capture distance.
 function approachRoute(map,from,to,blocked){
   const candidates=[];
   for(const radius of [.40,.60,.78,.90]){
     for(let i=0;i<16;i++){
       const angle=Math.PI*2*i/16;
       const p={x:to.x+Math.cos(angle)*radius,z:to.z+Math.sin(angle)*radius};
       if(!walkable(map,p.x,p.z,.35)||blocked?.(p.x,p.z))continue;
       if(!clearLine(map,p,to,{radius:.08,blocked}))continue;
       candidates.push({p,score:Math.hypot(p.x-from.x,p.z-from.z)+radius*.12});
     }
   }
   candidates.sort((a,b)=>a.score-b.score);
   // Bound computation for a crowded multiplayer maze.
   for(const candidate of candidates.slice(0,24)){
     const path=route(map,from,candidate.p,{blocked,allowApproach:false});
     if(path.length)return path;
   }
   return [];
 }
 function route(map,from,to,{blocked=null,allowApproach=true}={}){
   if(!from||!to||!map?.length)return [];
   if(![from.x,from.z,to.x,to.z].every(Number.isFinite))return [];
   // Path planning and actual movement must use exactly the same clearance.
   if(!walkable(map,to.x,to.z,.35)||blocked?.(to.x,to.z))
     return allowApproach?approachRoute(map,from,to,blocked):[];
   if(clearLine(map,from,to,{blocked}))return [{x:to.x,z:to.z}];
   // An ordinary tile-level A* treats an entire 4m tile as one waypoint.
   // Terminals and shelves sit at tile centres, so their collider could make
   // that waypoint unreachable even when there is plenty of floor on both sides.
   // Navigate on a 1m clearance grid, then simplify the safe route.
   const width=(map[0]?.length||0)*CELL,height=map.length*CELL;
   if(!width||!height)return [];
   const total=width*height,pass=new Int8Array(total),closed=new Uint8Array(total);
   const cost=new Float64Array(total).fill(Infinity),previous=new Int32Array(total).fill(-1);
   const xy=(id)=>({x:id%width+.5,z:Math.floor(id/width)+.5});
   function clearNode(x,z){
     if(x<0||z<0||x>=width||z>=height)return false;
     const id=z*width+x;
     if(!pass[id]){const px=x+.5,pz=z+.5;
       pass[id]=(walkable(map,px,pz,.35)&&!blocked?.(px,pz))?1:-1;}
     return pass[id]===1;
   }
   function anchor(point){
     const px=Math.floor(point.x),pz=Math.floor(point.z);
     for(let radius=0;radius<=7;radius++){
       let best=-1,bestDistance=Infinity;
       for(let dz=-radius;dz<=radius;dz++)for(let dx=-radius;dx<=radius;dx++){
         if(Math.max(Math.abs(dx),Math.abs(dz))!==radius)continue;
         const x=px+dx,z=pz+dz;
         if(!clearNode(x,z))continue;
         const p={x:x+.5,z:z+.5};
         if(!clearLine(map,point,p,{blocked}))continue;
         const d=Math.hypot(point.x-p.x,point.z-p.z);
         if(d<bestDistance){best=z*width+x;bestDistance=d;}
       }
       if(best>=0)return best;
     }
     return -1;
   }
   const start=anchor(from),goal=anchor(to);
   if(start<0||goal<0)return [];
   const heap=[];
   function push(id,priority){
     let i=heap.length;heap.push({id,priority});
     while(i>0){const p=(i-1)>>1;
       if(heap[p].priority<=priority)break;
       heap[i]=heap[p];i=p;
     }
     heap[i]={id,priority};
   }
   function pop(){
     const first=heap[0],tail=heap.pop();
     if(heap.length){let i=0;
       while(true){let child=i*2+1;if(child>=heap.length)break;
         if(child+1<heap.length&&heap[child+1].priority<heap[child].priority)child++;
         if(heap[child].priority>=tail.priority)break;
         heap[i]=heap[child];i=child;
       }
       heap[i]=tail;
     }
     return first.id;
   }
   const target=xy(goal);
   const heuristic=id=>{const p=xy(id);return Math.hypot(p.x-target.x,p.z-target.z);};
   cost[start]=0;push(start,heuristic(start));
   let found=false;
   while(heap.length){
     const id=pop();if(closed[id])continue;
     if(id===goal){found=true;break;}
     closed[id]=1;
     const x=id%width,z=Math.floor(id/width),here=xy(id);
     for(const [dx,dz] of DIRS){
       const nx=x+dx,nz=z+dz;if(!clearNode(nx,nz))continue;
       if(dx&&dz&&(!clearNode(x+dx,z)||!clearNode(x,z+dz)))continue;
       const there={x:nx+.5,z:nz+.5};
       if(!clearLine(map,here,there,{blocked}))continue;
       const neighbor=nz*width+nx,weight=Math.hypot(dx,dz);
       const tentative=cost[id]+weight;
       if(tentative>=cost[neighbor]||closed[neighbor])continue;
       previous[neighbor]=id;cost[neighbor]=tentative;
       push(neighbor,tentative+heuristic(neighbor));
     }
   }
   if(!found)return [];
   const raw=[];let cursor=goal;
   while(cursor!==start&&raw.length<total){
     raw.unshift(xy(cursor));
     cursor=previous[cursor];if(cursor<0)return [];
   }
   // Ensure the first/last sub-tile connections are also obstacle-free.
   const points=[{x:from.x,z:from.z},xy(start),...raw,{x:to.x,z:to.z}];
   const simplified=[];let i=0;
   while(i<points.length-1){
     let far=i+1;
     for(let j=i+2;j<points.length;j++)
       if(clearLine(map,points[i],points[j],{blocked}))far=j;
     if(!clearLine(map,points[i],points[far],{blocked}))return [];
     simplified.push(points[far]);i=far;
   }
   return simplified;
 }

 // Do not leave a bend based on distance alone; that cuts through corners.
 // Both [x,z] client paths and {x,z} authoritative paths use this function.
 function nextWaypoint(map,from,path,{blocked=null}={}){
   if(!map?.length||!from||!Array.isArray(path))return null;
   const point=p=>Array.isArray(p)?{x:p[0],z:p[1]}:p;
   let scanned=0;
   while(path.length&&scanned++<1024){
     const now=point(path[0]);
     if(!now||![now.x,now.z].every(Number.isFinite)){path.shift();continue;}
     const distance=Math.hypot(now.x-from.x,now.z-from.z);
     if(path.length===1){
       if(distance<=.12){path.shift();continue;}
       return now;
     }
     const following=point(path[1]);
     // Only skip a nearby waypoint when the actual CURRENT position has
     // an obstacle-free segment to the next waypoint. Otherwise finish turn.
     if(distance<.70&&following&&clearLine(map,from,following,{blocked})){
       path.shift();continue;
     }
     return now;
   }
   return null;
 }
 function advance(map,from,to,length,{blocked=null}={}){
   if(!to||!from||!(length>0))return {x:from.x,z:from.z,moved:false};
   const vx=to.x-from.x,vz=to.z-from.z,dist=Math.hypot(vx,vz);
   if(dist<.001)return {x:from.x,z:from.z,moved:false};
   const travel=Math.min(length,dist),steps=Math.max(1,Math.ceil(travel/.15));
   const dx=vx/dist*travel/steps,dz=vz/dist*travel/steps;
   let x=from.x,z=from.z;
   const allowed=(nx,nz)=>walkable(map,nx,nz,.35)&&!blocked?.(nx,nz);
   for(let i=0;i<steps;i++){
     if(allowed(x+dx,z+dz)){x+=dx;z+=dz;continue}
     // Slide only while making progress; otherwise request a fresh route.
     const oldDistance=Math.hypot(to.x-x,to.z-z);
     if(allowed(x+dx,z)&&Math.hypot(to.x-x-dx,to.z-z)<oldDistance-1e-6)x+=dx;
     if(allowed(x,z+dz)&&Math.hypot(to.x-x,to.z-z-dz)<Math.hypot(to.x-x,to.z-z)-1e-6)z+=dz;
   }
   return {x,z,moved:Math.hypot(x-from.x,z-from.z)>.002};
 }
 return Object.freeze({CELL,MONSTER_CHASE_SPEED,MONSTER_NOTICE_DURATION_MS,MONSTER_FIELD_OF_VIEW_DEGREES,MONSTER_PATROL_SPEED,MONSTER_SEARCH_SPEED,wall,walkable,clearLine,withinFieldOfView,visible,predict,route,nextWaypoint,advance});
});
