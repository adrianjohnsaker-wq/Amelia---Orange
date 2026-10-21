/**
 * DEV-1 AM1 LS/LSY lineage scaffolding and birth-state isolator.
 * NOT an executable developmental cohort: D4 full mechanism integration
 * remains a separate, review-gated stage. Unit fixture births only.
 *
 * Frozen AM1 constants: 32 lineages, 50 gens, 100000 steps, own LS
 * previous-death marks vs contemporaneous (k mod 32)+1 LS donor marks.
 */
import {AmeliaNumogramSubstrateRuntime} from '../substrate/ameliaNumogramSubstrateRuntime';
import {CANONICAL_GATES} from '../ai/numogram/AmeliaQabbalaInterface';
import {blankStoneMarks,StoneTapePlaceMemory,StoneTapeLife,StoneMarks,validateStoneMarks} from './DEV1StoneTape';
import {d1EdgeKey} from './DEV1D1EdgeSelector';
import type {ValueTable} from './DEV1Mechanisms';

export const AM1_MAX_LINEAGES=32,AM1_MAX_GENERATIONS=50,AM1_MAX_LINEAGE_STEPS=100000;
export type StoneArm='LS'|'LSY';
export type LSGenerationBirth={
  arm:StoneArm;lineage:number;generation:number;
  donorLineage:number|null;
  runtime:AmeliaNumogramSubstrateRuntime;
  place:StoneTapePlaceMemory;
  life:StoneTapeLife;
  personalV:ValueTable;
  fastTrace:number[];
  slowTrace:number[];
  canonicalWeights:{w_bias:number;w_act:number;w_phase:number;w_input:number;w_V:number};
  inheritedPersonalMemory:false;
};
export type SynchronousDonorSource=Readonly<Record<number,ReadonlyArray<Readonly<StoneMarks>>>>;

export function lsWrongDeathDonor(k:number):number{
 if(!Number.isInteger(k)||k<1||k>AM1_MAX_LINEAGES)throw Error('AM1_K_MUST_BE_1_TO_32');
 return (k%AM1_MAX_LINEAGES)+1;
}
export function enforceStoneLineageLimits(k:number,generation:number,totalSteps:number){
 lsWrongDeathDonor(k);
 if(!Number.isInteger(generation)||generation<1||generation>AM1_MAX_GENERATIONS)
  throw Error('AM1_GENERATION_CAP_EXCEEDED');
 if(!Number.isInteger(totalSteps)||totalSteps<0||totalSteps>AM1_MAX_LINEAGE_STEPS)
  throw Error('AM1_LINEAGE_STEPS_CAP_EXCEEDED');
}
/** Require all 32 generation-indexed LS donor marks present BEFORE recipients
 * may read a contemporary LSY generation; disallows future peeking. */
export function freezeAgeMatchedDonors(
 generation:number,lsDonorMarks:SynchronousDonorSource
):Readonly<Record<number,Readonly<StoneMarks>>> {
 enforceStoneLineageLimits(1,generation,0);
 const snapshots:Record<number,StoneMarks>={};
 for(let k=1;k<=32;k++){
  const ages=lsDonorMarks[k];
  if(!Array.isArray(ages)||ages.length<generation)
    throw Error('AM1_DONOR_GENERATION_NOT_READY_FOR_K_'+k);
  // Convention: snapshots index g-1 is the state immediately before LS
  // generation g starts. No additional death of generation g yet.
  const source=ages[generation-1];
  validateStoneMarks(source as StoneMarks);
  snapshots[k]={...source};
 }
 return snapshots;
}
/** Initializes an entirely fresh D4 birth boundary (new PFM, new V and
 * two EMPTY wrapper traces). Later work integrates D4 modules during life. */
export function freshStoneTapeD4Birth(
 arm:StoneArm,lineage:number,generation:number,place:StoneTapePlaceMemory,
 donorLineage:number|null
):LSGenerationBirth{
 enforceStoneLineageLimits(lineage,generation,0);
 if(arm!=='LS'&&arm!=='LSY')throw Error('AM1_ARM_INVALID');
 const runtime=new AmeliaNumogramSubstrateRuntime();
 runtime.setSuppressRelaySteering(true);
 runtime.setMomentumDamping(0.88);
 if(runtime.getCurrentZone()!==0||runtime.getMemory().getEvents().length!==0)
  throw Error('AM1_SUCCESSOR_INHERITED_STATE');
 if(runtime.getGovernor().momentumDampingFactor!==0.88)
  throw Error('AM1_NOT_CANONICAL_INITIAL_DAMPING');
 const personalV:Object=Object.fromEntries(CANONICAL_GATES.filter(g=>g.isOpen)
   .map(g=>[d1EdgeKey(g.source,g.target),0]));
 const fastTrace=Array(10).fill(0),slowTrace=Array(10).fill(0);
 return {arm,lineage,generation,donorLineage,runtime,place,life:place.beginLife(),
   personalV:personalV as ValueTable,fastTrace,slowTrace,
   canonicalWeights:{w_bias:0.4,w_act:0.2,w_phase:0.1,w_input:0.35,w_V:0.5},
   inheritedPersonalMemory:false};
}
/** LS: preserve only OWN accumulated place T. Personal V and traces new. */
export function beginLSGeneration(
 k:number,generation:number,ownPlace:StoneTapePlaceMemory,totalStepsBefore=0
):LSGenerationBirth{
 enforceStoneLineageLimits(k,generation,totalStepsBefore);
 return freshStoneTapeD4Birth('LS',k,generation,ownPlace,null);
}
/** LSY: copy a synchronously frozen OTHER-LS lineage's same-generation
 * marks. The recipient does NOT inherit its own previous place or any V
 * and may not mutate the donor snapshot through the returned place. */
export function beginLSYGeneration(
 k:number,generation:number,allFrozenSameGeneration:Readonly<Record<number,Readonly<StoneMarks>>>,
 totalStepsBefore=0
):LSGenerationBirth{
 enforceStoneLineageLimits(k,generation,totalStepsBefore);
 const donor=lsWrongDeathDonor(k);
 const snap=allFrozenSameGeneration[donor];
 if(!snap)throw Error('AM1_DONOR_SNAPSHOT_NOT_FOUND');
 validateStoneMarks(snap as StoneMarks);
 return freshStoneTapeD4Birth('LSY',k,generation,new StoneTapePlaceMemory({...snap}),donor);
}
/** A fresh lineage starts with all 11 place marks zero; it does not receive
 * the personal memory of its predecessor or even of its first individual. */
export function newStoneLineagePlace():StoneTapePlaceMemory{
 return new StoneTapePlaceMemory(blankStoneMarks());
}
