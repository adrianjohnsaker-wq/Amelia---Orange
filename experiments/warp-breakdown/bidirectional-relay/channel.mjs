/** Experimental bidirectional relay; never alters the live Oracle. */
import assert from 'node:assert/strict';
import {reward} from '../fullgraph/controller.mjs';
const clip=x=>Math.max(-1,Math.min(1,x));
export const ROUTES=['warp','matched27'];
export const MODES=['natural','global','read_only','bidirectional','sham_write','reverse_write','entry'];
export function feedback(r,d,score,route,mode){
 assert.ok(ROUTES.includes(route)&&MODES.includes(mode));
 const local=reward(r,d,score),pair=route==='warp'?[3,6]:[2,7],writes=[];
 if(['bidirectional','sham_write','reverse_write'].includes(mode)){
  for(const source of pair){
   const options=r.r.qabbala.getGates().filter(g=>g.isOpen&&g.source===source).map(g=>g.target).sort((a,b)=>a-b);
   if(options.length<2)continue;
   // A local update at this source has already applied the real feedback once.
   if(source===local.source){writes.push({source,options,skippedLocal:true});continue;}
   const usedScore=mode==='sham_write'?1:score,usedAction=mode==='reverse_write'?1-d.action:d.action,before=[],after=[];
   for(let j=0;j<options.length;j++){
    const edge=`${source}>${options[j]}`;assert.ok(Number.isFinite(r.L.V[edge]));const v=r.L.V[edge];before.push(v);
    const next=clip(.75*v+(usedScore-1)*(j%2===usedAction?1:-1));r.L.V[edge]=next;after.push(next);
   }
   writes.push({source,options,skippedLocal:false,usedScore,usedAction,before,after});
  }
 }
 return {local,writes};
}
