/**
 * DEV1 AM2 - pure READ-ONLY logging and scoring.
 * Prospective P-AM2-1 + descriptive O8. No write to Amelia, PF1, C1,
 * existing constants or AM1 stone memory. Does not dispatch any arms.
 * Designed to be called from future approved synthetic cohort runners.
 */
import {createHash} from 'node:crypto';
import {CANONICAL_GATES} from '../ai/numogram/AmeliaQabbalaInterface';
import {findCandidates} from '../../experiments/pf1/core.mjs';
import {load} from '../../experiments/pf1/PF1_A1_R2_SCORER.mjs';

export type AM2Arm='B'|'D1'|'D2'|'D3'|'D4'|'Y'|'L'|'LY'|'L0'|'LS'|'LSY';
export type CueClass='pitward'|'other';
export type ChoiceEvent=Readonly<{
  arm:AM2Arm;lineageId:number;generation:number;
  stepWithinLife:number;sourceZone:number;selectedZone:number;
  inputZone:number|null;
}>;
export type CueObservation=Readonly<{
  choicePoint:boolean;isCued:boolean;cueClass:CueClass|null;
  compliant:boolean|null;sourceZone:number;cueTarget:number|null;
  selectedZone:number;
}>;
const CHOICES=new Map<number,{pitward:number;other:number}>([
 [1,{pitward:2,other:8}],
 [2,{pitward:4,other:7}],
 [4,{pitward:5,other:7}]
]);
export const AM2_SPARSE_BELOW=20;
export const AM2_BLOCK=1000;
export const AM2_PERMUTATIONS=100000;
export const AM2_ALPHA=0.05;
export const AM2_EDGE_CLASSES=Object.freeze({
 pitward:['1->2','2->4','4->5'],other:['1->8','2->7','4->7']
});
if(CHOICES.size!==3)throw Error('AM2_CHOICE_POINT_COUNT');
for(const [source,exit] of CHOICES){
 const actual=CANONICAL_GATES.filter(g=>g.isOpen&&g.source===source).map(g=>g.target).sort((a,b)=>a-b);
 const declared=[exit.pitward,exit.other].sort((a,b)=>a-b);
 if(JSON.stringify(actual)!==JSON.stringify(declared))throw Error('AM2_UNCHANGED_CANONICAL_CHOICES_MISMATCH_ZONE_'+source);
}
export function classifyCue(sourceZone:number,selectedZone:number,inputZone:number|null):CueObservation{
 if(!Number.isInteger(sourceZone)||!Number.isInteger(selectedZone))throw Error('AM2_BAD_CHOICE_ZONE');
 if(inputZone!==null&&(!Number.isInteger(inputZone)||inputZone<0||inputZone>9))
   throw Error('AM2_BAD_INPUT_ZONE');
 const p=CHOICES.get(sourceZone);
 if(!p){
  return {choicePoint:false,isCued:false,cueClass:null,compliant:null,
    sourceZone,cueTarget:null,selectedZone};
 }
 if(selectedZone!==p.pitward&&selectedZone!==p.other)throw Error('AM2_NONCANONICAL_EXIT_AT_CHOICE_POINT');
 if(inputZone!==p.pitward&&inputZone!==p.other)
  return {choicePoint:true,isCued:false,cueClass:null,compliant:null,
   sourceZone,cueTarget:null,selectedZone};
 const cueClass=inputZone===p.pitward?'pitward':'other';
 return {choicePoint:true,isCued:true,cueClass,
   compliant:selectedZone===inputZone,sourceZone,cueTarget:inputZone,selectedZone};
}
export type AM2CueCount={cued:number;compliant:number};
export type O8Cell=Readonly<{
  arm:AM2Arm;lineageId:number;windowType:'lifeBlock'|'generation';
  window:number;pitward:AM2CueCount&{rate:number|null;sparse:boolean};
  other:AM2CueCount&{rate:number|null;sparse:boolean};
  resistanceIndex:number|null;uncuedChoices:number;nonChoicePoints:number;
}>;
type MutableCell={
 arm:AM2Arm;lineageId:number;windowType:'lifeBlock'|'generation';window:number;
 pitward:AM2CueCount;other:AM2CueCount;uncuedChoices:number;nonChoicePoints:number;
};
export function armUsesGeneration(arm:AM2Arm):boolean{
 return arm==='L'||arm==='LY'||arm==='L0'||arm==='LS'||arm==='LSY';
}
export class AM2O8Recorder{
 private cells=new Map<string,MutableCell>();
 private eventKeys=new Set<string>();
 observe(event:ChoiceEvent):CueObservation{
  if(!Number.isInteger(event.lineageId)||event.lineageId<1||event.lineageId>32)
   throw Error('AM2_LINEAGE_ID_OUT_OF_RANGE');
  if(!Number.isInteger(event.generation)||event.generation<1)
   throw Error('AM2_GENERATION_OUT_OF_RANGE');
  if(!Number.isInteger(event.stepWithinLife)||event.stepWithinLife<1)
   throw Error('AM2_STEP_MUST_BE_POSITIVE');
  if(!armUsesGeneration(event.arm)&&event.generation!==1)
   throw Error('AM2_NONLINEAGE_GENERATION_MUST_EQUAL_ONE');
  const evKey=[event.arm,event.lineageId,event.generation,event.stepWithinLife].join(':');
  if(this.eventKeys.has(evKey))throw Error('AM2_DUPLICATE_STEP_OBSERVATION');
  const obs=classifyCue(event.sourceZone,event.selectedZone,event.inputZone);
  const byGen=armUsesGeneration(event.arm);
  const window=byGen?event.generation:Math.floor((event.stepWithinLife-1)/AM2_BLOCK)+1;
  const key=[event.arm,event.lineageId,byGen?'generation':'lifeBlock',window].join(':');
  let cell=this.cells.get(key);
  if(!cell){
   cell={arm:event.arm,lineageId:event.lineageId,
    windowType:byGen?'generation':'lifeBlock',window,
    pitward:{cued:0,compliant:0},other:{cued:0,compliant:0},
    uncuedChoices:0,nonChoicePoints:0};
   this.cells.set(key,cell);
  }
  this.eventKeys.add(evKey);
  if(!obs.choicePoint)cell.nonChoicePoints++;
  else if(!obs.isCued)cell.uncuedChoices++;
  else{
   const bucket=cell[obs.cueClass!];
   bucket.cued++;
   if(obs.compliant)bucket.compliant++;
  }
  return obs;
 }
 summary():O8Cell[]{
  const describe=(bucket:AM2CueCount)=>({
    cued:bucket.cued,compliant:bucket.compliant,
    rate:bucket.cued?bucket.compliant/bucket.cued:null,
    sparse:bucket.cued<AM2_SPARSE_BELOW
  });
  return [...this.cells.values()].sort((a,b)=>
    a.arm.localeCompare(b.arm)||a.lineageId-b.lineageId||a.window-b.window
  ).map(x=>{
    const pit=describe(x.pitward),other=describe(x.other);
    return {arm:x.arm,lineageId:x.lineageId,windowType:x.windowType,window:x.window,
      pitward:pit,other,resistanceIndex:pit.rate===null||other.rate===null?
       null:other.rate-pit.rate,uncuedChoices:x.uncuedChoices,nonChoicePoints:x.nonChoicePoints};
  });
 }
}
/** Distinct canonical gates and actual non-dwell moves, NOT survival length.
 * PF-1 scanner uses unchanged findCandidates and frozen eligibleByGraphOnlyNull
 * decisions, on supplied trajectory only, without forks or writeback.
 */
export type AM2IndividualExploration=Readonly<{
 generation:number;lineageId:number;movingSteps:number;
 distinctDirectedEdges:number;directedEdgesPer1000:number|null;
 distinctEligiblePairs:number;eligiblePairsPer1000:number|null;
 totalPresentedCandidates:number;distinctEligiblePairKeys:string[];
}>;
export function summarizeExploration(
 lineageId:number,generation:number,zones:readonly number[],
 candidatePairKeys:readonly string[]
):AM2IndividualExploration{
 if(lineageId<1||lineageId>32||!Number.isInteger(lineageId)||
  generation<1||!Number.isInteger(generation))throw Error('AM2_INVALID_LINEAGE_OR_GEN');
 if(zones.length===0)throw Error('AM2_TRAJECTORY_MUST_INCLUDE_INITIAL_ZONE');
 const edges=new Set<string>();let moving=0;
 const valid=new Set(CANONICAL_GATES.filter(g=>g.isOpen).map(g=>g.source+'->'+g.target));
 for(let i=1;i<zones.length;i++){
  const prev=zones[i-1],cur=zones[i];
  if(cur===prev)continue;
  const e=prev+'->'+cur;
  if(!valid.has(e))throw Error('AM2_NOT_CANONICAL_EDGE_IN_TRAJECTORY '+e);
  moving++;edges.add(e);
 }
 const distinct=[...new Set(candidatePairKeys)].sort();
 for(const p of distinct)if(!/^\d-\d$/.test(p))throw Error('AM2_INVALID_ELIGIBLE_PAIR_KEY');
 return {lineageId,generation,movingSteps:moving,distinctDirectedEdges:edges.size,
   directedEdgesPer1000:moving?1000*edges.size/moving:null,
   distinctEligiblePairs:distinct.length,eligiblePairsPer1000:moving?1000*distinct.length/moving:null,
   totalPresentedCandidates:candidatePairKeys.length,distinctEligiblePairKeys:distinct};
}
/** Directly calls the unchanged PF1 scanner, not a reconstructed algorithm. */
export function readOnlyPF1EligibleCandidateKeys(zones:readonly number[]):string[]{
 const scope=load(); // frozen PF1 graph + read-only graph-null eligibility
 const list=findCandidates([...zones],scope.graph,scope.constants.scanner.windowSteps,
   scope.constants.scanner.recurrenceCount).candidates;
 return list.filter((candidate:any)=>scope.rowByPair.get(candidate.key)?.eligibleByGraphOnlyNull)
    .map((candidate:any)=>candidate.key);
}
export function lineageExplorationMean(items:readonly AM2IndividualExploration[]):{
 lineageId:number|null;generationsIncluded:number;excludedGeneration1:number;
 undefinedMovingSteps:number;distinctEdgesPer1000:number|null;
 eligiblePairsPer1000:number|null
}{
 const ids=new Set(items.map(x=>x.lineageId));
 if(ids.size>1)throw Error('AM2_MIXED_LINEAGES');
 const selected=items.filter(x=>x.generation>=2);
 const valid=selected.filter(x=>x.movingSteps>0&&x.directedEdgesPer1000!==null&&x.eligiblePairsPer1000!==null);
 const mean=(f:(x:AM2IndividualExploration)=>number|null)=>valid.length?
    valid.reduce((s,x)=>s+(f(x) as number),0)/valid.length:null;
 return {lineageId:items[0]?.lineageId??null,generationsIncluded:valid.length,
  excludedGeneration1:items.length-selected.length,
  undefinedMovingSteps:selected.length-valid.length,
  distinctEdgesPer1000:mean(x=>x.directedEdgesPer1000),
  eligiblePairsPer1000:mean(x=>x.eligiblePairsPer1000)};
}
/** Preregistered pairwise, whole-lineage label swaps (no individual-level
 * permutations). Fixed 100000 pseudorandom sign assignments by SHA256 seed.
 * All 32 matched IDs required, finite and no missing. Not called by unit tests
 * on real lineages; this function cannot initiate a cohort.
 */
export function permutationLess(
 xByLineage:readonly number[],yByLineage:readonly number[],
 seed:string,permutations:number=AM2_PERMUTATIONS
):{observedMeanDifference:number;pValue:number;extremeCount:number;permutations:number}{
 if(xByLineage.length!==32||yByLineage.length!==32||
   ![...xByLineage,...yByLineage].every(Number.isFinite)||
   permutations!==AM2_PERMUTATIONS||!seed)throw Error('AM2_REGISTERED_PERMUTATION_INPUT_GATE');
 const diffs=xByLineage.map((x,i)=>x-yByLineage[i]);
 const observed=diffs.reduce((a,b)=>a+b,0)/32;
 let extreme=0;
 for(let p=0;p<permutations;p++){
  let sum=0;
  for(let k=0;k<32;k++){
   const hash=createHash('sha256').update('DEV1-AM2-P-AM2-1|'+seed+'|'+p+'|'+k).digest();
   sum+=(hash[0]&1)?diffs[k]:-diffs[k];
  }
  if(sum/32<=observed+1e-12)extreme++;
 }
 return {observedMeanDifference:observed,pValue:(extreme+1)/(permutations+1),
   extremeCount:extreme,permutations};
}
export function holmTwo(pA:number,pB:number){
 if(![pA,pB].every(x=>Number.isFinite(x)&&x>=0&&x<=1))throw Error('AM2_BAD_P');
 const [a,b]=pA<=pB?[[0,pA],[1,pB]]:[[1,pB],[0,pA]];
 const adjusted=[0,0];
 adjusted[a[0]]=Math.min(1,2*a[1]);
 adjusted[b[0]]=Math.min(1,Math.max(adjusted[a[0]],b[1]));
 return {adjustedP:adjusted,rejectAt005:adjusted.map(p=>p<=AM2_ALPHA)};
}
