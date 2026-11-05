import { canonicalSha256 } from '../../src/lib/sha256';
import type { LiveFieldObservation, SyntheticSourceOffer } from '../../src/outside/LiveFieldLoop';

/** A planted, inspectable control source, not evidence of an external mind. */
export type SourceArm = 'live' | 'shuffled' | 'uniform';
export interface SourceState { step:number; smoothedCentroid:number; address:0|1 }
export interface SourceReading { pointer:number; before:SourceState; after:SourceState;
  targetProfile:number[]; offer:SyntheticSourceOffer; }
const WEIGHTS=[.235,.185,.145,.115,.095,.075,.055,.045,.030,.020];
const SHUFFLE=[3,8,1,6,4,9,0,5,2,7];

/** Profiles are intentionally engineered and do not imply discovered forms. */
export function targetProfile(address:0|1):number[] {
  return address===0 ? [...WEIGHTS] : [...WEIGHTS].reverse();
}
export function startSource():SourceState { return {step:0,smoothedCentroid:0.5,address:0}; }
export function respondToBody(observation:LiveFieldObservation, previous:SourceState, arm:SourceArm):SourceReading {
  const vector=observation.attentionVector;
  if(!vector || vector.length!==10 || vector.some(v=>!Number.isFinite(v) || v<0) ||
     Math.abs(vector.reduce((a,b)=>a+b,0)-1)>1e-9) throw Error('Source requires a current normalized body observation');
  if(!Number.isSafeInteger(previous.step)||previous.step<0||!Number.isFinite(previous.smoothedCentroid)||
     ![0,1].includes(previous.address)||!['live','shuffled','uniform'].includes(arm)) throw Error('Invalid source state or arm');
  const pointer=vector.reduce((sum,v,i)=>sum+v*i/9,0);
  const smoothedCentroid=0.65*previous.smoothedCentroid+0.35*pointer;
  const address:0|1=smoothedCentroid>=0.5 ? 1 : 0;
  const after:SourceState={step:previous.step+1,smoothedCentroid,address};
  const profile=targetProfile(address);
  const attentionVector=arm==='uniform'?Array(10).fill(0.1):arm==='shuffled'?SHUFFLE.map(i=>profile[i]):profile;
  const sourceStateDigest=canonicalSha256(JSON.stringify({schema:'amelia.adaptive-source-state/v1',arm,...after}));
  const offer:SyntheticSourceOffer={schema:'amelia.synthetic-source-offer/v1',bodyDigest:observation.sourceDigest,
    sourceId:`${arm}-pattern-v1`,sourceStep:after.step,sourceStateDigest,attentionVector};
  return {pointer,before:{...previous},after,targetProfile:profile,offer};
}
