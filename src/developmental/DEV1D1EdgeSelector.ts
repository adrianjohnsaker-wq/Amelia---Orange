/** DEV-1 D1 consequence-value exit selector.
 * Synthetic experiment only: canonical source is never edited. */
import {CANONICAL_GATES} from '../ai/numogram/AmeliaQabbalaInterface';
export type D1Gate = {source:number;target:number;flux:number;resistance:number;isOpen:boolean};
export function d1EdgeKey(a:number,b:number):string {return a+'->'+b}
export const D1_CANONICAL_EDGES=CANONICAL_GATES.filter(x=>x.isOpen).map(g=>d1EdgeKey(g.source,g.target));
export const D1_W_VALUE=0.5;
export function d1EdgeBonus(value:number,wV:number=D1_W_VALUE):number {
 if(!Number.isFinite(value)||value< -1||value>1||wV!==D1_W_VALUE)throw Error('SEALED_EDGE_VALUE_RANGE_OR_WEIGHT');
 return wV*value;
}
export function d1GateScore(
 gate:D1Gate,activation:number,cosPhase:number,baseBias:number,inputZone:number|null,
 value:number,includeBias=true,includeValue=true
):number{
 return gate.flux*(1-gate.resistance)
 +(includeBias?baseBias*0.4:0)
 +activation*0.2+cosPhase*0.1+(inputZone===gate.target?0.35:0)
 +(includeValue?d1EdgeBonus(value):0);
}
export function d1ChooseExit(
 from:number,gates:readonly D1Gate[],zones:Record<number,{activation:number;phaseAngle:number}>,
 bias:readonly number[],inputZone:number|null,values:Record<string,number>,
 includeBias=true,includeValue=true
):number {
 let chosen=from,best=-Infinity;
 for(const g of gates){
  if(!g.isOpen||g.source!==from)continue;
  const z=zones[g.target];if(!z)throw Error('D1_MISSING_TARGET_ZONE');
  const edge=d1EdgeKey(g.source,g.target);
  const score=d1GateScore(g,z.activation,Math.cos(z.phaseAngle),bias[g.target]||0,inputZone,
    values[edge]??0,includeBias,includeValue);
  if(score>best){best=score;chosen=g.target}
 }
 return chosen;
}
/** Temporarily wraps gate flux during canonical rt.step: trait evolution
 * only reads permeability/source/target/open; all its writes pass through
 * the Proxy, and the real flux is NOT modified or exported.
 * Since the selector computes flux*(1-r), injecting +wV*V/(1-r)
 * achieves the EXACT D1 edge bonus with no change to canonical files. */
export function d1GateSelectorOverlay<T>(
 qabbala:{getGates:()=>any[]},
 values:Record<string,number>,step:()=>T
):T {
 const original=qabbala.getGates;
 const gates=original.call(qabbala);
 qabbala.getGates=()=>{
  return gates.map(g=>new Proxy(g,{
   get(target,prop,receiver){
    if(prop==='flux'){
     const v=values[d1EdgeKey(target.source,target.target)]??0;
     if(!target.resistance||target.resistance>=1)throw Error('D1_RESISTANCE_INVALID');
     return target.flux+d1EdgeBonus(v)/(1-target.resistance);
    }
    return Reflect.get(target,prop,receiver);
   },
   set(target,prop,value,receiver){return Reflect.set(target,prop,value,receiver)}
  }));
 };
 try{return step()} finally {qabbala.getGates=original}
}
