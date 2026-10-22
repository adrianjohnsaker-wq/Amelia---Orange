/**
 * PF2 selection-only overlay. Canonical classes and PFM remain byte-identical.
 * The normative receiver's `exitBonus` hook is not implemented by the frozen
 * runtime. This adapter enforces precisely the intended LAST-TERM score,
 * preserving left-to-right JS Number evaluation and canonical gate-order ties.
 *
 * We independently calculate each true, evolved selector score, then use an
 * ephemeral gate Proxy only if that would select a different gate than the
 * frozen vanilla loop. No real gate flux, trait evolution or memory is edited.
 */
export function pf2Step(rt,input){
 if(typeof rt.exitBonus!=='function')return rt.step(input);
 const q=rt.getQabbala();
 const originalGetGates=q.getGates;
 const originalGates=originalGetGates.call(q);
 const trait=rt.traitEvolution;
 const originalEvolve=trait.evolveStep;
 const cue=parseInt((awaitSha256(input.trim())).slice(0,2),16)%10;
 const from=rt.getCurrentZone();
 let afterEvolution=false;
 let chosen=null;
 let needsEnforcement=false;
 q.getGates=function(){
   return originalGates.map(g=>new Proxy(g,{
     get(target,prop,receiver){
       if(prop==='flux'&&afterEvolution&&needsEnforcement&&target.isOpen&&target.source===from&&target.target===chosen){
         return target.flux+1000000/(1-target.resistance);
       }
       return Reflect.get(target,prop,receiver);
     },
     set(target,prop,val,receiver){return Reflect.set(target,prop,val,receiver)}
   }));
 };
 trait.evolveStep=function(zones,gates,damping,advisory,bias,suppress){
   const result=originalEvolve.call(trait,zones,gates,damping,advisory,bias,suppress);
   const eligible=originalGates.filter(g=>g.isOpen&&g.source===from);
   let vanillaBest=-Infinity,vanilla=from,exactBest=-Infinity,exact=from;
   for(const gate of eligible){
     const target=gate.target,z=zones[target];
     // Base expression EXACTLY in the frozen canonical left-to-right order.
     const base=gate.flux*(1-gate.resistance)
       +(bias[target]||0)*0.4
       +z.activation*0.2+Math.cos(z.phaseAngle)*0.1
       +(cue===target?0.35:0);
     const v=rt.exitBonus(from,target);
     if(!Number.isFinite(v)||Math.abs(v)>0.5+1e-12)throw Error('PF2_BONUS_INVALID');
     const full=base+v; // normative required last floating-point operation
     if(base>vanillaBest){vanillaBest=base;vanilla=target}
     if(full>exactBest){exactBest=full;exact=target}
   }
   chosen=exact;needsEnforcement=exact!==vanilla;
   afterEvolution=true;
   return result;
 };
 try{
   const out=rt.step(input);
   if(out.lastTransition.to!==chosen&&chosen!==null)
     throw Error('PF2_CANONICAL_SCORE_LAST_TERM_MISMATCH');
   return out;
 }finally{
   trait.evolveStep=originalEvolve;
   q.getGates=originalGetGates;
 }
}
import {createHash} from 'node:crypto';
function awaitSha256(input){return createHash('sha256').update(input).digest('hex')}
