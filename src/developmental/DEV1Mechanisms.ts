/**
 * DEV-1 synthetic-only developmental mechanisms. Pure functions at Stage 1;
 * canonical Amelia classes are imported by the assay, never edited.
 * Not wired to PF-1 or C1. D-arm execution remains gated by B calibration.
 */
export type EdgeKey = string;
export type ValueTable = Record<EdgeKey,number>;
export type WeightSet = {w_bias:number;w_act:number;w_phase:number;w_input:number;w_V:number};
export const clip=(x:number,a:number,b:number)=>Math.min(b,Math.max(a,x));
export function updateEdgeValue(v:number,outcome:number):number {
  if(!Number.isFinite(v)||!Number.isFinite(outcome)||v < -1||v>1||outcome < -1||outcome>1) throw Error('VALUE_RANGE');
  return clip(v+(outcome-v)/8,-1,1);
}
export function consequenceOutcome(absorbedWithin24:boolean,beforeDistinct:number,afterDistinct:number):number {
  if(absorbedWithin24)return -1;
  return clip((afterDistinct-beforeDistinct)/11,-1,1);
}
export function exponentiallyUpdateTrace(previous:readonly number[],zone:number,tau:number):number[] {
  if(previous.length!==10||!Number.isInteger(zone)||zone<0||zone>9||tau<=0)throw Error('TRACE_INPUT');
  const alpha=Math.exp(-1/tau);
  const out=previous.map((x,i)=>alpha*x+(i===zone?1-alpha:0));
  const total=out.reduce((a,b)=>a+b,0);
  return total>0?out.map(x=>x/total):out.map((_,i)=>+(i===zone));
}
export function traceBias(fast:readonly number[],slow:readonly number[]):number[] {
  if(fast.length!==10||slow.length!==10)throw Error('TRACE_LENGTH');
  return fast.map((x,i)=>0.4*(x+slow[i])/2);
}
export function e1WithinBounds(edgeTrail:readonly string[],window=48):boolean {
  return new Set(edgeTrail.slice(-window)).size>=3;
}
export function e2WithinBounds(tension:number):boolean {return tension>=0.14&&tension<=0.65}
export function homeostat(damping:number,tension:number):number {
  return clip(damping+(tension<0.14?0.01:tension>0.65?-0.01:0),0.45,0.99);
}
/** A deterministic generator must be injected. Never Math.random. */
export function secondOrderRedraw(canonical:WeightSet,unitUniform:()=>number):WeightSet{
  const unit=()=>{const v=unitUniform();if(v<0||v>=1)throw Error('GENERATOR_RANGE');return v};
  return {w_bias:2*canonical.w_bias*unit(),w_act:2*canonical.w_act*unit(),
    w_phase:2*canonical.w_phase*unit(),w_input:2*canonical.w_input*unit(),w_V:canonical.w_V};
}
export function lineageInheritance(v:ValueTable,slow:readonly number[]) {
  if(slow.length!==10)throw Error('TRACE_LENGTH');
  return {zone:0,values:{...v},slow:[...slow],fast:Array(10).fill(0),damping:0.88,
    weights:{w_bias:0.4,w_act:0.2,w_phase:0.1,w_input:0.35,w_V:0.5}};
}
