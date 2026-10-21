/**
 * DEV-1 AM5 SECOND CORRECTED ARM ONLY: D2″
 * This is the second corrected arm under separately sealed AM5; D1″ accepted. Original D1 and B
 * files are READ ONLY and stay unchanged; no D3″ or lineage arm is dispatched.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {AmeliaNumogramSubstrateRuntime} from '../../src/substrate/ameliaNumogramSubstrateRuntime';
import {accelerateExactHistoryDigest} from '../../src/developmental/DEV1ExactDigestAdapter';
import {d1EdgeKey,d1ChooseExit,D1_CANONICAL_EDGES}
 from '../../src/developmental/DEV1D1EdgeSelector';
import {updateEdgeValue} from '../../src/developmental/DEV1Mechanisms';
import {RefrainQueue,AM3_H} from '../../src/developmental/DEV1AM3Refrain';
import {classifyCue} from '../../src/developmental/DEV1AM2Readouts';
import {AM5SelectorTraces,am5D2Step} from '../../src/developmental/DEV1AM5Mechanisms';

const ROOT='experiments/dev1/';
const sha=(x:string|Buffer)=>createHash('sha256').update(x).digest('hex');
const originalRaw=readFileSync(ROOT+'DEV1_CONSTANTS.json');
const original=JSON.parse(originalRaw.toString());
const am3Raw=readFileSync(ROOT+'DEV1_CONSTANTS_MANIFEST_AM3.json');
const am3=JSON.parse(am3Raw.toString());
const am5Raw=readFileSync(ROOT+'DEV1_CONSTANTS_MANIFEST_AM5.json');
const am5=JSON.parse(am5Raw.toString());
const acceptedD1PP=JSON.parse(readFileSync(ROOT+'DEV1_AM3_D1PP_RESULT.json','utf8'));
assert.equal(acceptedD1PP.O1.D1PPRestrictedMeanSurvival,1593.625);
const b=JSON.parse(readFileSync(ROOT+'DEV1_BASELINE_CALIBRATION.json','utf8'));
const d1=JSON.parse(readFileSync(ROOT+'DEV1_D1_RESULT.json','utf8'));
const bCue=JSON.parse(readFileSync(ROOT+'DEV1_D1_CHOICE_POINT_AUDIT.json','utf8'));
assert.equal(process.env.DRIFT_C1_ENABLE_LIVE,'false');
assert.equal(process.env.DEV1_AM3_RFC3161_VERIFIED,'true');
assert.equal(process.env.DEV1_AM3_SEVEN_UNITS_PASS,'true');
assert.equal(process.env.DEV1_FROZEN_IDENTITY_PASS,'true');
assert.equal(process.env.DEV1_D2PP_OPERATOR_APPROVED,'true');
assert.equal(process.env.DEV1_AM5_RFC3161_VERIFIED,'true');
assert.equal(process.env.DEV1_AM5_ELEVEN_UNITS_PASS,'true');
assert.equal(am3.schema,'DEV1_AM3_ADDITIVE_CONSTANTS_MANIFEST_V3');
assert.equal(am3.correctedOrder[0],'D1″');
assert.equal(am3.correctedOrder[1],'D2″');
assert.equal(am5.schema,'DEV1_AM5_ADDITIVE_SEALED_MANIFEST_V1');
assert.equal(am5.D2.fastTau,48);
assert.equal(am5.D2.slowTau,2400);
assert.deepEqual(am3.onlyExistingCohorts,['B','D1']);
assert.equal(am3.signal.wV,0.5);
assert.equal(am3.signal.horizon,24);
assert.equal(original.mechanisms.valueUpdate.timeConstantTraversal,8);
assert.equal(original.mechanisms.outcome.edgeCount,11);
assert.equal(original.baseline.numberOfTapes,32);
assert.equal(b.absorbedCount,32);
assert.equal(d1.O1.absorbed,32);
assert.equal(sha(originalRaw),d1.constantsSha256);
assert.equal(D1_CANONICAL_EDGES.length,11);
const LIMIT=10000,COUNT=32;
const tape=(k:number,i:number)=>sha('DEV1-TAPE-'+k+'|'+i);
type Cell={pitwardSelected:number;choices:number};
type Category='pitwardCue'|'otherCue'|'uncued';
type Point='1'|'2'|'4';
type ChoiceTable=Record<Point,Record<Category,Cell>>;
function blankChoices():ChoiceTable{
 return Object.fromEntries(['1','2','4'].map(zone=>[zone,
    Object.fromEntries(['pitwardCue','otherCue','uncued'].map(cls=>[cls,
      {pitwardSelected:0,choices:0}]))])) as ChoiceTable;
}
const pitward:Record<Point,number>={'1':2,'2':4,'4':5};
function observeChoice(table:ChoiceTable,from:number,to:number,inputZone:number):void{
 if(from!==1&&from!==2&&from!==4)return;
 const obs=classifyCue(from,to,inputZone);
 assert(obs.choicePoint,'AM3_UNKNOWN_BRANCH');
 const cls:Category=obs.isCued?(obs.cueClass==='pitward'?'pitwardCue':'otherCue'):'uncued';
 const cell=table[String(from) as Point][cls];
 cell.choices++;
 if(to===pitward[String(from) as Point])cell.pitwardSelected++;
}
function summarizeChoices(table:ChoiceTable){
 return Object.fromEntries((['1','2','4'] as const).map(zone=>{
  const cells=table[zone];
  const desc=Object.fromEntries((['pitwardCue','otherCue','uncued'] as const).map(cls=>{
   const c=cells[cls];
   return [cls,{...c,share:c.choices?c.pitwardSelected/c.choices:null,
     sparse:c.choices<20}];
  }));
  const total=(['pitwardCue','otherCue','uncued'] as const).reduce((acc,k)=>{
   acc.choices+=cells[k].choices;acc.pitwardSelected+=cells[k].pitwardSelected;
   return acc;
  },{choices:0,pitwardSelected:0});
  return [zone,{...desc,overall:{...total,share:total.choices?
    total.pitwardSelected/total.choices:null,sparse:total.choices<20}}];
 }));
}
type TapeData={tape:number;absorptionStep:number|null;censored:boolean;
 movingSteps:number;distinctEdges:number;O4Per1000:number|null;
 lastFourZones:number[];last24Edges:string[];choices:ChoiceTable;
 selector?:{branchChoices:number;combinedChanged:number;vOnlyChanged:number;movingExits:number};
 finalV?:Record<string,number>;outcomeCounts?:Record<string,number>;
 valueUpdates?:number;unfinishedHorizon?:number;O8Blocks?:Record<string,ChoiceTable>;
 finalFastTrace?:number[];finalSlowTrace?:number[];consolidationCalls?:number};
function replayB(k:number):TapeData {
 const rt=new AmeliaNumogramSubstrateRuntime();rt.setSuppressRelaySteering(true);
 const digest=accelerateExactHistoryDigest(rt.getMemory());
 const zones=[rt.getCurrentZone()],edges:string[]=[];
 const choices=blankChoices();
 let terminal:number|null=null;
 for(let i=0;i<LIMIT;i++){
  const before=rt.getCurrentZone();
  if(before===5)break;
  const input=tape(k,i);
  const inputZone=parseInt(sha(input).slice(0,2),16)%10;
  const snap=rt.step(input);
  const next=rt.getCurrentZone();
  assert.equal(snap.lastTransition.to,next);
  assert.equal(snap.lastTransition.from,before);
  const edge=d1EdgeKey(before,next);
  assert(D1_CANONICAL_EDGES.includes(edge),'B_NONCANONICAL_EDGE');
  edges.push(edge);zones.push(next);
  observeChoice(choices,before,next,inputZone);
  if(i<24)digest.validateCanonical();
  if(next===5){terminal=i+1;break;}
 }
 digest.validateCanonical();
 assert.equal(terminal,b.absorptionSteps[k-1].step,'B_REGISTERED_ABSORPTION_MISMATCH');
 const originalB=bCue.pairs[k-1].B.choicePointStats;
 for(const zone of ['1','2','4'] as const)
  for(const cls of ['pitwardCue','otherCue','uncued'] as const)
   assert.deepEqual(choices[zone][cls],originalB[zone][cls],'B_CHOICE_LOG_REPRODUCTION');
 const distinct=new Set(edges).size;
 return {tape:k,absorptionStep:terminal,censored:terminal===null,
 movingSteps:edges.length,distinctEdges:distinct,
 O4Per1000:edges.length?1000*distinct/edges.length:null,
 lastFourZones:zones.slice(-4),last24Edges:edges.slice(-24),choices};
}
function runD2PP(k:number):TapeData {
 const rt=new AmeliaNumogramSubstrateRuntime();rt.setSuppressRelaySteering(true);
 const digest=accelerateExactHistoryDigest(rt.getMemory());
 const values:Record<string,number>=Object.fromEntries(D1_CANONICAL_EDGES.map(id=>[id,0]));
 const zones:number[]=[rt.getCurrentZone()],edges:string[]=[];
 const cue=blankChoices();
 const q=new RefrainQueue();
 const traces=new AM5SelectorTraces();let consolidationCalls=0;
 const blocks:Record<string,ChoiceTable>={};
 let terminal:number|null=null,branchChoices=0,combinedChanged=0,vOnlyChanged=0,movingExits=0;
 let updates=0;
 const outcomes:Record<string,number>={abolition:0,refrain:0,otherwise:0,
   nonZeroRefrain:0,zeroRefrain:0};
 for(let i=0;i<LIMIT;i++){
  const prev=rt.getCurrentZone();if(prev===5){terminal=terminal??i;break;}
  const input=tape(k,i);
  const inputZone=parseInt(sha(input).slice(0,2),16)%10;
  const memoryBias=traces.selectorBias(); // previous step's normalized F,S; canonical PFM preserved for TraitEvolution
  const pastValues=Object.freeze({...values});
  const stepOut=am5D2Step(rt,traces,pastValues,input);
  const snap=stepOut.result;
  if(stepOut.consolidated)consolidationCalls++;
  assert.deepEqual(stepOut.selectorBias,memoryBias);
  if(stepOut.consolidated)assert.equal((i+1)%48,0);
  const to=rt.getCurrentZone();
  assert.equal(snap.lastTransition.from,prev);
  assert.equal(snap.lastTransition.to,to);
  const gates=rt.getQabbala().getGates(),zonesMap=rt.getQabbala().getZones();
  assert.equal(d1ChooseExit(prev,gates,zonesMap,memoryBias,inputZone,pastValues),to,
      'AM3_SELECTOR_EQUIVALENCE');
  const withoutV=d1ChooseExit(prev,gates,zonesMap,memoryBias,inputZone,pastValues,true,false);
  const withoutVAndBias=d1ChooseExit(prev,gates,zonesMap,memoryBias,inputZone,pastValues,false,false);
  const nOpen=gates.filter(g=>g.isOpen&&g.source===prev).length;
  assert(nOpen>0);
  movingExits++;
  if(nOpen>1){
   branchChoices++;
   if(withoutV!==to)vOnlyChanged++;
   if(withoutVAndBias!==to)combinedChanged++;
  }
  const edge=d1EdgeKey(prev,to);
  assert(edge in values,'AM3_CHOICE_NOT_CANONICAL');
  edges.push(edge);zones.push(to);
  observeChoice(cue,prev,to,inputZone);
  const block=String(Math.floor(i/1000)+1);
  if(!blocks[block])blocks[block]=blankChoices();
  observeChoice(blocks[block],prev,to,inputZone);
  const ended=gates.every(g=>!(g.isOpen&&g.source===to));
  q.addEdge(i,edge);
  for(const p of q.resolve(zones,ended)){
   values[p.edge]=updateEdgeValue(values[p.edge],p.result.value);
   updates++;
   outcomes[p.result.kind]++;
   if(p.result.kind==='refrain'){
    if(p.result.value>0)outcomes.nonZeroRefrain++;
    else outcomes.zeroRefrain++;
   }
  }
  if(i<24||ended)digest.validateCanonical();
  if(ended){assert.equal(to,5);terminal=i+1;break;}
 }
 digest.validateCanonical();
 assert.equal(q.completed(),updates);
 if(terminal!==null){
  assert.equal(updates,edges.length,'ALL_TERMINAL_WINDOWS_MUST_RESOLVE');
  assert.equal(q.unfinished(),0);
  assert.equal(outcomes.abolition,Math.min(AM3_H,edges.length));
 }else{
  assert.equal(edges.length,LIMIT);
  assert.equal(q.unfinished(),AM3_H-1,'AT_10000_UNRESOLVED_23_HORIZONS');
 }
 assert(Object.values(values).every(x=>x>=-1&&x<=1));
 assert.equal(consolidationCalls,Math.floor(edges.length/48),'AM5_D2_STRICT_CONSOLIDATION_48');
 if(edges.length>0){
  const ns=traces.normalized();
  assert(Math.abs(ns.F.reduce((a,b)=>a+b,0)-1)<1e-9);
  assert(Math.abs(ns.S.reduce((a,b)=>a+b,0)-1)<1e-9);
 }
 const distinct=new Set(edges).size;
 return {tape:k,absorptionStep:terminal,censored:terminal===null,
  movingSteps:edges.length,distinctEdges:distinct,
  O4Per1000:edges.length?1000*distinct/edges.length:null,
  lastFourZones:zones.slice(-4),last24Edges:edges.slice(-24),choices:cue,
  selector:{branchChoices,combinedChanged,vOnlyChanged,movingExits},
  finalV:values,outcomeCounts:outcomes,valueUpdates:updates,
  unfinishedHorizon:q.unfinished(),O8Blocks:blocks,
  finalFastTrace:[...traces.fast],finalSlowTrace:[...traces.slow],
  consolidationCalls};
}
function median(xs:number[]):number|null{
 if(!xs.length)return null;
 const s=[...xs].sort((a,b)=>a-b),n=s.length;
 return n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2;
}
const paired:{tape:number;B:TapeData;D2PP:TapeData}[]=[];
for(let k=1;k<=COUNT;k++){
 const B=replayB(k), D2PP=runD2PP(k);
 paired.push({tape:k,B,D2PP});
 console.log('DEV1_AM5_D2PP_TAPE_VERIFIED',JSON.stringify({k,Bstep:B.absorptionStep,
  correctedStep:D2PP.absorptionStep,censored:D2PP.censored,
  B_O4:B.O4Per1000,D2PP_O4:D2PP.O4Per1000,
  branchChanges:D2PP.selector!.combinedChanged}));
}
const expectedB=paired.map(x=>x.B.movingSteps).reduce((a,b)=>a+b,0);
assert.equal(expectedB,b.localSelectorMemoryAblation.exitChoices);
const count=(fn:(p:typeof paired[number])=>number)=>paired.reduce((a,p)=>a+fn(p),0);
const correctedSteps=paired.map(p=>p.D2PP.absorptionStep).filter((x):x is number=>x!==null);
const bRmst=count(p=>Math.min(p.B.absorptionStep??LIMIT,LIMIT))/COUNT;
const correctedRmst=count(p=>Math.min(p.D2PP.absorptionStep??LIMIT,LIMIT))/COUNT;
assert.equal(bRmst,1703);
const baselineBranchShare=b.localSelectorMemoryAblation.changedBranchChoices/b.localSelectorMemoryAblation.branchChoices;
const branches=count(p=>p.D2PP.selector!.branchChoices);
const changed=count(p=>p.D2PP.selector!.combinedChanged);
const vChanged=count(p=>p.D2PP.selector!.vOnlyChanged);
const shares=(table:ChoiceTable[])=>{
 const total=blankChoices();
 for(const c of table)
  for(const z of ['1','2','4'] as const)
   for(const cls of ['pitwardCue','otherCue','uncued'] as const){
    total[z][cls].choices+=c[z][cls].choices;
    total[z][cls].pitwardSelected+=c[z][cls].pitwardSelected;
   }
 return summarizeChoices(total);
};
const priorB=bCue.choicePointSummaries.B;
const BChoices=shares(paired.map(p=>p.B.choices));
for(const z of ['1','2','4'] as const)
 for(const cls of ['pitwardCue','otherCue','uncued'] as const)
  assert.equal((BChoices as any)[z][cls].pitwardSelected,priorB[z][cls].pitwardSelected);
const correctedChoices=shares(paired.map(p=>p.D2PP.choices));
const routes:Record<string,number>={};
for(const row of paired){
 const x=row.D2PP.absorptionStep===null?'CENSORED':row.D2PP.lastFourZones.join('→');
 routes[x]=(routes[x]??0)+1;
}
const O1={BRestrictedMeanSurvival:bRmst,D2PPRestrictedMeanSurvival:correctedRmst,
 differenceD2PPMinusB:correctedRmst-bRmst,absorbed:correctedSteps.length,
 rightCensored:COUNT-correctedSteps.length,absorptionMedian:median(correctedSteps),
 absorptionRange:correctedSteps.length?[Math.min(...correctedSteps),Math.max(...correctedSteps)]:null,
 registeredP3_1SurvivalNotHigher:correctedRmst<=bRmst};
const B_O4=paired.map(p=>p.B.O4Per1000!);
const D2PP_O4=paired.map(p=>p.D2PP.O4Per1000!);
const mean=(arr:number[])=>arr.reduce((a,b)=>a+b,0)/arr.length;
const O4={BMeanPerIndividual:B_O4.length?mean(B_O4):null,
 D2PPMeanPerIndividual:mean(D2PP_O4),differenceMean:mean(D2PP_O4)-mean(B_O4),
 outcome:"distinct canonical directed edges per 1000 moving steps per life, then tape mean",
 registeredP3_1D2PPExploresMore:mean(D2PP_O4)>mean(B_O4),
 baselineIndividualValues:B_O4,correctedIndividualValues:D2PP_O4,
 noRegisteredD2PP_PValue:true};
const O2={baselineMemoryShare:baselineBranchShare,baselineChanges:b.localSelectorMemoryAblation.changedBranchChoices,
 baselineBranchChoices:b.localSelectorMemoryAblation.branchChoices,
 D2PPBranches:branches,D2PPMemoryAblationChanged:changed,
 D2PPCombinedShare:branches?changed/branches:null,
 D2PPVOnlyChanged:vChanged,D2PPVOnlyShare:branches?vChanged/branches:null,
 manipulationCheck:branches&&changed/branches>baselineBranchShare?'PASS':'FAIL'};
const result={schema:'DEV1_AM5_D2_DOUBLE_PRIME_CORRECTED_COHORT_V1',arm:'D2″',
 syntheticOnly:true,registeredCorrectionFromD1:true,
 AM3ManifestSHA256:sha(am3Raw),AM5ManifestSHA256:sha(am5Raw),baseConstantsSHA256:sha(originalRaw),
 originalD1Preserved:true,newCorrectedArmExecuted:'D2″',
 tapes:COUNT,H:AM3_H,wV:0.5,source:'original canonical Amelia runtime with selector-only AM5 fast/slow trace replacing PFM selector bias, original AM3 o″ and 48-step memory strain consolidation',
 status:'REGISTERED_SECOND_CORRECTED_ARM_WAITING_OPERATOR_REVIEW',
 O1,O4,O2,absorptionRoutes:routes,
 threeChoicePoints:{B:BChoices,D2PP:correctedChoices},
 finalValueTableColumns:D1_CANONICAL_EDGES,
 rows:paired.map(p=>({tape:p.tape,B:{absorptionStep:p.B.absorptionStep,
   movingSteps:p.B.movingSteps,distinctEdges:p.B.distinctEdges,O4Per1000:p.B.O4Per1000},
   D2PP:{absorptionStep:p.D2PP.absorptionStep,censored:p.D2PP.censored,
   movingSteps:p.D2PP.movingSteps,distinctEdges:p.D2PP.distinctEdges,
   O4Per1000:p.D2PP.O4Per1000,
   lastFourZones:p.D2PP.lastFourZones,last24Edges:p.D2PP.last24Edges,
   finalV:p.D2PP.finalV,
   selector:p.D2PP.selector,consequenceOutcomes:p.D2PP.outcomeCounts,
   valueUpdates:p.D2PP.valueUpdates,unfinishedHorizon:p.D2PP.unfinishedHorizon,
   finalFastTrace:p.D2PP.finalFastTrace,finalSlowTrace:p.D2PP.finalSlowTrace,
   consolidationCalls:p.D2PP.consolidationCalls,
   choicePoints:summarizeChoices(p.D2PP.choices),O8LifeBlocks:Object.fromEntries(
    Object.entries(p.D2PP.O8Blocks??{}).map(([i,table])=>[i,summarizeChoices(table)]))
   }}))
};
const json=JSON.stringify(result,null,2)+'\n';
const cpHeaders=['pitwardCue','otherCue','uncued','overall'] as const;
const pct=(o:any)=>o.share===null?'NA':(100*o.share).toFixed(3)+'%';
const body=[
 '# DEV-1 AM5 D2″ corrected refrain + multi-timescale selector-memory cohort — 32 original synthetic tapes',
 '',
 '**Status:** Second corrected arm D2″ under AM5, following operator-accepted D1″. B and D1/D1″ preserved. Later arms stop until D2″ review.',
 '',
 '## O1 survival',
 '',
 '- D2″ RMST **'+correctedRmst.toFixed(4)+'** vs B **'+bRmst.toFixed(4)+'**; paired difference **'+(correctedRmst-bRmst).toFixed(4)+'** steps.',
 '- Absorbed '+correctedSteps.length+'/32; censored '+(32-correctedSteps.length)+'/32. Observed absorption median '+(median(correctedSteps)??'NA')+'.',
 '- Prospective descriptive prediction P3-1 within-life survival **'+(O1.registeredP3_1SurvivalNotHigher?'HELD':'FAILED')+'** under criterion D2″ survival not higher than B.',
 '',
 '## O4 exploration while moving (co-primary outcome; D2″ contrast descriptive, not among six co-primary tests)',
 '',
 '- B mean per tape **'+mean(B_O4).toFixed(6)+'**; D2″ mean per tape **'+mean(D2PP_O4).toFixed(6)+'** distinct directed edges per 1,000 moving steps.',
 '- Mean difference **'+(mean(D2PP_O4)-mean(B_O4)).toFixed(6)+'**. Prospective P3-1 exploration more than B **'+(O4.registeredP3_1D2PPExploresMore?'HELD':'FAILED')+'**.',
 '- Each tape counts distinct directed gates once, then divides by its actual preabsorption moving length or 10,000 if right-censored. No p-value for D2″ vs B: registered six-test co-primary family is for D4″/Y″ and L″/LY″.',
 '',
 '## O2 matched selector memory ablation',
 '',
 '- B '+b.localSelectorMemoryAblation.changedBranchChoices+'/'+b.localSelectorMemoryAblation.branchChoices+' = '+(100*baselineBranchShare).toFixed(5)+'%.',
 '- D2″ combined (PFM and V removed from same post-evolution state) '+changed+'/'+branches+' = '+(100*(O2.D2PPCombinedShare??0)).toFixed(5)+'%.',
 '- D2″ V-only '+vChanged+'/'+branches+' = '+(100*(O2.D2PPVOnlyShare??0)).toFixed(5)+'%. **O2 '+O2.manipulationCheck+'**.',
 '',
 '## AM5 D2″ multi-timescale memory',
 '',
 '- Selector trace normalisation and replacement enabled; canonical TraitEvolution uses unchanged IntegratedMemorySystem bias.',
 '- Total 48-step strain-only consolidations across 32 lives: '+paired.reduce((v,p)=>v+(p.D2PP.consolidationCalls??0),0)+'.',
 '- Final fast and slow raw trace vectors for each tape are available in full-precision JSON.',
 '',
 '## Absorption routes',
 '',
 ...Object.entries(routes).sort().map(([route,count])=>'- '+route+': **'+count+'** tapes'),
 '',
 '## All three zone choice-point shares (pit-ward target selected, exact cue class)',
 '',
 '| Arm | Edge | Pitward cue | Other-target cue | Uncued | Overall |',
 '|---|---|---:|---:|---:|---:|',
 ...(['B','D2PP'] as const).flatMap(arm=>['1','2','4'].map(zone=>{
  const dat=(arm==='B'?BChoices:correctedChoices) as any;
  const e=zone==='1'?'1→2':zone==='2'?'2→4':'4→5';
  const form=(c:any)=>c.pitwardSelected+'/'+c.choices+' ('+pct(c)+')'+(c.sparse?' [sparse]':'');
  return '| '+(arm==='B'?'B':'D2″')+' | '+e+' | '+cpHeaders.map(k=>form(dat[zone][k])).join(' | ')+' |';
 })),
 '',
 '## All 32 matched tapes: O1/O4',
 '',
 '| Tape | B survival | D2″ survival (censored?) | B O4 | D2″ O4 | D2″ distinct edges | D2″ route |',
 '|---:|---:|---:|---:|---:|---:|---|',
 ...paired.map(p=>'| '+p.tape+' | '+p.B.absorptionStep+' | '+(p.D2PP.absorptionStep??'10,000 censored')+
 ' | '+p.B.O4Per1000!.toFixed(5)+' | '+p.D2PP.O4Per1000!.toFixed(5)+
 ' | '+p.D2PP.distinctEdges+' | '+(p.D2PP.absorptionStep===null?'CENSORED':p.D2PP.lastFourZones.join('→'))+' |'),
 '',
 '## All 32 final V values, all 11 canonical gates (six decimal display; full precision in JSON)',
 '',
 '| Tape | '+D1_CANONICAL_EDGES.join(' | ')+' |',
 '|---:|'+D1_CANONICAL_EDGES.map(()=>'---:').join('|')+'|',
 ...paired.map(p=>'| '+p.tape+' | '+D1_CANONICAL_EDGES.map(k=>p.D2PP.finalV![k].toFixed(6)).join(' | ')+' |'),
 '',
 '## Research boundaries and provenance',
 '',
 '- D2″ retains original signed AM3 **within-life** terminal rule (AM4/AM5 termination credit changes ONLY inherited lineage values). During life abolition within H=24 has precedence and earns −1. Otherwise a new departure returning to prior territory receives new excursion-edge count /11; in-territory repetition and non-return receive 0. No foresight, update remains V←V+(o″−V)/8.',
 '- Any unresolved H horizons at the 10,000-step right-censor boundary are explicitly left without an invented outcome; all terminal pending horizons are settled at absorption.',
 '- Original B rerun only for exactly observed per-tape O4 and verified against original 32 absorption steps and original post hoc three-choice counts.',
 '- Input domain: SHA256("DEV1-TAPE-"+k+"|"+i), same original B and D1 domain. No C1 or PF1 live external input.',
 '- All three choice-point tables with 1,000-step O8 windows and all terminal final V values are in full-precision machine-readable result JSON.',
 '- Full independent second run MUST reproduce byte-identical JSON and Markdown. Original D1 and all retired unrun arms unchanged.',
 '- D2″ adds AM5 fast and slow trace selector-bias replacement, normalized separately and updated after every move; after steps divisible by 48 only strain is consolidated with no Governor consolidation event.',
 '- D1″ was previously operator-accepted; D2″ is now the ONLY additional corrected arm; any D3″ or lineage action is blocked until D2″ review.',
 '- This correction was motivated by previously observed D1 results and is prospectively sealed relative to the corrected data, not blinded before D1.',
 '- Result JSON SHA256 '+sha(json),
 ''
].join('\n');
writeFileSync(ROOT+'DEV1_AM5_D2PP_RESULT.json',json);
writeFileSync(ROOT+'DEV1_AM5_D2PP_REPORT.md',body);
console.log('DEV1_AM5_D2PP_COMPLETE',JSON.stringify({
 O1,O4:{B:O4.BMeanPerIndividual,D2PP:O4.D2PPMeanPerIndividual,held:O4.registeredP3_1D2PPExploresMore},
 O2,absorptionRoutes:routes,sha256:sha(json),noLaterArmRun:true
}));
