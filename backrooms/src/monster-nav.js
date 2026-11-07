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
 function route(map,from,to,{blocked=null}={}){
   if(!from||!to||!map?.length)return [];
   const h=map.length,w=map[0]?.length||0;
   const sx=Math.floor(from.x/CELL),sz=Math.floor(from.z/CELL);
   const tx=Math.floor(to.x/CELL),tz=Math.floor(to.z/CELL);
   if([sx,sz,tx,tz].some(Number.isNaN)||map[sz]?.[sx]!==0||map[tz]?.[tx]!==0)return [];
   if(clearLine(map,from,to,{blocked}))return [{x:to.x,z:to.z}];
   const start=sz*w+sx,goal=tz*w+tx;
   const open=[start],opened=new Set([start]),seen=new Set(),came=new Map();
   const score=new Map([[start,0]]),estimate=new Map([[start,Math.hypot(tx-sx,tz-sz)]]);
   let found=start===goal;
   while(open.length&&seen.size<h*w){
     let best=0;
     for(let i=1;i<open.length;i++)if((estimate.get(open[i])??Infinity)<(estimate.get(open[best])??Infinity))best=i;
     const current=open.splice(best,1)[0];opened.delete(current);
     if(current===goal){found=true;break}
     if(seen.has(current))continue;
     seen.add(current);const x=current%w,z=Math.floor(current/w);
     for(const [dx,dz] of DIRS){
       const nx=x+dx,nz=z+dz;if(map[nz]?.[nx]!==0)continue;
       if(dx&&dz&&(map[z]?.[nx]!==0||map[nz]?.[x]!==0))continue; // no diagonal corner cuts
       const next=nz*w+nx;
       const cost=(score.get(current)??Infinity)+Math.hypot(dx,dz);
       if(cost>=(score.get(next)??Infinity))continue;
       came.set(next,current);score.set(next,cost);
       estimate.set(next,cost+Math.hypot(tx-nx,tz-nz));
       if(!opened.has(next)){open.push(next);opened.add(next)}
     }
   }
   if(!found)return [];
   const raw=[];let cursor=goal;
   while(cursor!==start&&raw.length<h*w){
     const x=cursor%w,z=Math.floor(cursor/w);
     raw.unshift({x:(x+0.5)*CELL,z:(z+0.5)*CELL});
     cursor=came.get(cursor);if(cursor===undefined)return [];
   }
   raw.push({x:to.x,z:to.z});
   // A terminal can occupy a tile centre. Pick a walkable side waypoint so
   // the monster routes AROUND the prop instead of stalling at its centre.
   if(blocked){
     const offsets=[[1.35,0],[-1.35,0],[0,1.35],[0,-1.35],
                    [1.35,1.35],[-1.35,1.35],[1.35,-1.35],[-1.35,-1.35]];
     for(let i=0;i<raw.length-1;i++){
       const point=raw[i];
       if(!blocked(point.x,point.z))continue;
       const previous=i?raw[i-1]:from,next=raw[i+1];
       const candidates=offsets.map(([dx,dz])=>({x:point.x+dx,z:point.z+dz}))
         .filter(p=>walkable(map,p.x,p.z,.36)&&!blocked(p.x,p.z)
            &&clearLine(map,previous,p,{blocked}));
       if(candidates.length)raw[i]=candidates.sort((a,b)=>
           Math.hypot(a.x-next.x,a.z-next.z)-Math.hypot(b.x-next.x,b.z-next.z))[0];
     }
   }
   // Greedy line-of-sight simplification; do not cut through colliders or wall corners.
   const refined=[],points=[{x:from.x,z:from.z},...raw];
   let i=0;
   while(i<points.length-1){
     let far=i+1;
     for(let j=points.length-1;j>i+1;j--){
       if(clearLine(map,points[i],points[j],{blocked})){far=j;break}
     }
     refined.push(points[far]);i=far;
   }
   return refined;
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
 return Object.freeze({CELL,MONSTER_CHASE_SPEED,MONSTER_PATROL_SPEED,MONSTER_SEARCH_SPEED,wall,walkable,clearLine,route,advance});
});
