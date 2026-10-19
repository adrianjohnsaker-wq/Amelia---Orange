/**
 * OUTSIDE-3 reader v2 candidate: injective six-line PFM input.
 * SYNTHETIC UNIT-TEST STAGE ONLY. No chosen constants, calibration,
 * hidden targets, working IDs, external entropy or beacon access.
 *
 * All six lines yield one RESULTING-hexagram polarity event at their OWN zone.
 * Old lines append a separate movement event at the same zone.
 * No complementary-zone aliasing is permitted.
 */
import {createHash} from 'node:crypto';
import type {PFMEventRecord} from '../../../src/substrate/IntegratedMemorySystem';

export const LINE_ZONES_V2=[1,2,4,8,7,5] as const;
export type LineValue=6|7|8|9;
export type SixLineCast=readonly [LineValue,LineValue,LineValue,LineValue,LineValue,LineValue];
export type PFMEncodingMagnitudes={yin:number;yang:number;movement:number;phaseCoherence:number;strainRelaxation:number};
export type EventKindV2='CAST_POLARITY_YIN'|'CAST_POLARITY_YANG'|'CAST_MOVEMENT';
export type TaggedPFMEvent={
  descriptor:{
    schema:'OUTSIDE3_V2_SYNTHETIC_CAST';
    line:number;
    mappedZone:number;
    castValue:LineValue;
    primaryBit:0|1;
    resultingBit:0|1;
    movementFlag:boolean;
    eventKind:EventKindV2;
    ordinal:number;
    localStep:number;
    fluxDelta:number;
  };
  event:PFMEventRecord;
};

export function validateMagnitudes(p:PFMEncodingMagnitudes) {
  for(const x of Object.values(p))if(!Number.isFinite(x))throw Error('V2_NONFINITE_ENCODING_PARAMETER');
  if(p.yin<=0||p.yang<=0||p.movement<=0||
     p.yin===p.yang||p.movement===Math.abs(p.yang-p.yin))throw Error('V2_NONINJECTIVE_MAGNITUDES');
  if(p.phaseCoherence<=0||p.phaseCoherence>1)throw Error('V2_COHERENCE_INVALID');
  if(p.strainRelaxation<0||p.strainRelaxation>=1)throw Error('V2_RELAXATION_INVALID');
  const levels=[p.yin,p.yang,p.yin+p.movement,p.yang+p.movement];
  if(new Set(levels.map(x=>x.toPrecision(15))).size!==4)throw Error('V2_NUMERIC_DOSE_COLLISION');
}

export function castFromPrimaryAndMoving(primary:number,movingMask:number):SixLineCast {
  if(!Number.isInteger(primary)||primary<0||primary>63||
     !Number.isInteger(movingMask)||movingMask<0||movingMask>63)throw Error('V2_CAST_BITS_INVALID');
  return Array.from({length:6},(_,i)=>{
    const yang=!!(primary&(1<<i)),moving=!!(movingMask&(1<<i));
    return (yang?(moving?9:7):(moving?6:8)) as LineValue;
  }) as unknown as SixLineCast;
}

export function bitsFromCast(cast:readonly number[]) {
  if(cast.length!==6||cast.some(x=>![6,7,8,9].includes(x)))throw Error('V2_CAST_INVALID');
  let primary=0,movingMask=0;
  for(let i=0;i<6;i++){
    if(cast[i]===7||cast[i]===9)primary|=1<<i;
    if(cast[i]===6||cast[i]===9)movingMask|=1<<i;
  }
  return {primary,movingMask,resulting:primary^movingMask};
}

export function encodeCastToPFM(cast:SixLineCast,p:PFMEncodingMagnitudes,localStep:number):TaggedPFMEvent[] {
  validateMagnitudes(p);
  if(!Number.isInteger(localStep)||localStep<0)throw Error('V2_STEP_INVALID');
  const {primary,movingMask,resulting}=bitsFromCast(cast);
  const out:TaggedPFMEvent[]=[];
  for(let i=0;i<6;i++){
    const value=cast[i],z=LINE_ZONES_V2[i];
    const primaryBit=((primary>>i)&1) as 0|1;
    const resultingBit=((resulting>>i)&1) as 0|1;
    const movementFlag=!!(movingMask&(1<<i));
    const events:{kind:EventKindV2;dose:number}[]=[
      {kind:resultingBit?'CAST_POLARITY_YANG':'CAST_POLARITY_YIN',dose:resultingBit?p.yang:p.yin}
    ];
    if(movementFlag)events.push({kind:'CAST_MOVEMENT',dose:p.movement});
    for(const {kind,dose} of events){
      const descriptor={
        schema:'OUTSIDE3_V2_SYNTHETIC_CAST' as const,
        line:i+1,mappedZone:z,castValue:value,
        primaryBit,resultingBit,movementFlag,
        eventKind:kind,ordinal:out.length,localStep,fluxDelta:dose
      };
      // SHA-256 metadata is an audit marker. The *distinct dose* is what
      // preserves causal polarity/movement differences in PFM update.
      const eventDigest=createHash('sha256').update(JSON.stringify(descriptor)).digest('hex');
      out.push({descriptor,event:{
        blockIndex:localStep,depth:localStep,targetZone:z,
        fluxDelta:dose,phaseCoherence:p.phaseCoherence,
        strainRelaxation:p.strainRelaxation,
        eventDigest,timestamp:localStep,kind:'OTHER'
      }});
    }
  }
  const movingCount=bitsFromCast(cast).movingMask.toString(2).replace(/0/g,'').length;
  if(out.length!==6+movingCount)throw Error('V2_INCOMPLETE_CAST_EVENTS');
  return out;
}

export function canonicalInputSignature(entries:readonly TaggedPFMEvent[]):string {
  return JSON.stringify(entries.map(x=>x.descriptor));
}
