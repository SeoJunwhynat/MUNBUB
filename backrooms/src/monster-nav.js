/* Shared deterministic Backrooms navigation. Works in browser and Node CommonJS. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.MonsterNav=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const CELL=4;
 const MONSTER_CHASE_SPEED=5.75*0.93;
 const MONSTER_PATROL_SPEED=2.65;
 const MONSTER_SEARCH_SPEED=3.2;
 const DIRS=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
 function wall(map,x,z){return map[Math.floor(z/CELL)]?.[Math.floor(x/CELL)]!==0;}
 function walkable(map,x,z,radius=0.35){
   return !wall(map,x-radius,z-radius)&&!wall(map,x-radius,z+radius)
    &&!wall(map,x+radius,z-radius)&&!wall(map,x+radius,z+radius);
 }
 function clearLine(map,a,b,{radius=0.36,blocked=null}={}){
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

 // Shared perception: scenery and walls block sight, independently of walk radius.
 function visible(map,from,to,{blocked=null,maxDistance=Infinity}={}){
  if(!map?.length||!from||!to||![from.x,from.z,to.x,to.z].every(Number.isFinite))return false;
  if(Math.hypot(to.x-from.x,to.z-from.z)>maxDistance)return false;
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
 function route(map,from,to,{blocked=null}={}){
   if(!from||!to||!map?.length)return [];
   if(![from.x,from.z,to.x,to.z].every(Number.isFinite))return [];
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
       pass[id]=(walkable(map,px,pz,.36)&&!blocked?.(px,pz))?1:-1;}
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
     // Slide along an obstacle without walking through it.
     if(allowed(x+dx,z))x+=dx;
     if(allowed(x,z+dz))z+=dz;
   }
   return {x,z,moved:Math.hypot(x-from.x,z-from.z)>.002};
 }
 return Object.freeze({CELL,MONSTER_CHASE_SPEED,MONSTER_PATROL_SPEED,MONSTER_SEARCH_SPEED,wall,walkable,clearLine,visible,predict,route,nextWaypoint,advance});
});
