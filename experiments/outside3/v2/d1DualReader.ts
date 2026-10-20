/**
 * OUTSIDE-3 v2 D1 dual readout: same developed runtime, two different
 * final observables. Option A feeds all six resulting polarities to PFM.
 * No target argument appears anywhere in the reader API.
 */
import {AmeliaNumogramSubstrateRuntime} from '../../../src/substrate/ameliaNumogramSubstrateRuntime';
import {encodeCastToPFM,bitsFromCast,LINE_ZONES_V2,
  type PFMEncodingMagnitudes,type SixLineCast} from './castEncoding';
import {doubledMidRanks,rawCastReadout} from '../ejing';

export type ReadoutName='ACTIVATION'|'PFM_STRAIN';
export type SixVector=[number,number,number,number,number,number];
export type Standardization={mean:SixVector;sigma:SixVector};
export function freshRuntime() {
 const rt=new AmeliaNumogramSubstrateRuntime();
 rt.setSuppressRelaySteering(true);
 return rt;
}
export function runtimeClone(state:Record<string,unknown>) {
 const rt=freshRuntime();
 rt.importState(state);
 return rt;
}
export function appendAndDevelop(rt:AmeliaNumogramSubstrateRuntime,
 cast:SixLineCast,p:PFMEncodingMagnitudes,steps:number){
 if(!Number.isInteger(steps)||steps<1||steps>60)throw Error('D1_INVALID_WINDOW');
 const localStep=rt.getSnapshots().at(-1)?.step??0;
 const input=encodeCastToPFM(cast,p,localStep);
 for(const event of input)rt.getMemory().append(event.event);
 for(let i=0;i<steps;i++)rt.step();
 return {eventCount:input.length,lastTransition:rt.getLastTransition()};
}
/** Source of memory observable MUST be the actual IntegratedMemorySystem
 * zoneStrainHistory, never the audit label, synthetic target or event digest.
 */
export function observable(rt:AmeliaNumogramSubstrateRuntime,kind:ReadoutName):SixVector{
 if(kind==='ACTIVATION')return LINE_ZONES_V2.map(z=>
  rt.getQabbala().getZones()[z].activation) as SixVector;
 if(kind==='PFM_STRAIN'){
  const state=rt.getMemory().exportState();
  if(!Array.isArray(state.zoneStrainHistory)||state.zoneStrainHistory.length!==10)
   throw Error('PFM_STRAIN_MISSING');
  return LINE_ZONES_V2.map(z=>state.zoneStrainHistory[z]) as SixVector;
 }
 throw Error('INVALID_D1_READOUT');
}
export function moments(rows:readonly SixVector[]):Standardization{
 if(rows.length<2)throw Error('INSUFFICIENT_REFERENCE');
 const mean=Array.from({length:6},(_,z)=>
  rows.reduce((sum,row)=>sum+row[z],0)/rows.length) as SixVector;
 const sigma=Array.from({length:6},(_,z)=>
  Math.sqrt(rows.reduce((sum,row)=>sum+(row[z]-mean[z])**2,0)/rows.length)) as SixVector;
 if(sigma.some(x=>!Number.isFinite(x)||x<=0))
  throw Error('D1_ZERO_REFERENCE_SIGMA');
 return {mean,sigma};
}
export function standardized(vector:SixVector,ref:Standardization):SixVector{
 return vector.map((x,i)=>(x-ref.mean[i])/ref.sigma[i]) as SixVector;
}
export function hexagramScores(vector:SixVector):number[]{
 return Array.from({length:64},(_,h)=>{
  let sum=0;
  for(let i=0;i<6;i++)sum+=((h>>i)&1?1:-1)*vector[i];
  return sum;
 });
}
export function rankingFromState(
 rt:AmeliaNumogramSubstrateRuntime,kind:ReadoutName,reference:Standardization
){
 const raw=observable(rt,kind);
 const v=standardized(raw,reference);
 const scores=hexagramScores(v);
 const rank2=doubledMidRanks(scores);
 return {feature:raw,standardized:v,rank2,
  minHamming1ScoreMargin:2*Math.min(...v.map(x=>Math.abs(x))),
  ties:64-new Set(scores).size,
  strainSaturatedZones:rt.getMemory().exportState().zoneStrainHistory.filter(x=>x>=1).length
 };
}
export function rawRanksForCast(cast:SixLineCast){
 return rawCastReadout(bitsFromCast(cast).resulting);
}
