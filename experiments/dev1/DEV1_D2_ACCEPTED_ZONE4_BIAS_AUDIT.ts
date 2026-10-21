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
import {CANONICAL_GATES} from '../../src/ai/numogram/AmeliaQabbalaInterface';
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

type Z4Record={
 arm:'B'|'D2″';tape:number;step:number;inputZone:number;cueClass:'pitwardCue'|'otherCue'|'uncued';actualTarget:number;predictedTarget:number;
 canonicalBias5:number;canonicalBias7:number;selectorBias5:number;selectorBias7:number;
 weightedSelectorBias5:number;weightedSelectorBias7:number;canonicalBiasDelta7Minus5:number;
 selectorBiasDelta7Minus5:number;fluxDelta7Minus5:number;activationPhaseDelta7Minus5:number;
 inputDelta7Minus5:number;VDelta7Minus5:number;
 totalScore5:number;totalScore7:number;margin7Minus5:number;
 marginWithoutSelectorBias:number;selectedWithoutSelectorBias:number;selectorBiasChangedExit:boolean;
};
const auditRows:Z4Record[]=[];
let auditInputZone=0,auditStep=0;
function installZ4Audit(rt:AmeliaNumogramSubstrateRuntime,arm:'B'|'D2″',k:number,
 selectorBias:()=>number[],values:()=>Record<string,number>):void{
 const trait=(rt as any).traitEvolution;
 const f=trait.evolveStep.bind(trait);
 trait.evolveStep=(zones:any,gates:any[],damping:number,advisory:number,pfmBias:number[],suppress:boolean)=>{
  const returned=f(zones,gates,damping,advisory,pfmBias,suppress);
  if(rt.getCurrentZone()===4){
   const b=selectorBias(),v=values();
   const score=(target:number)=>{
    const gate=gates.find(g=>g.source===4&&g.target===target&&g.isOpen);
    const pinned=CANONICAL_GATES.find(g=>g.source===4&&g.target===target&&g.isOpen);
    assert(gate&&pinned,'AUDIT_MISSING_EXIT');
    const z=zones[target];
    const flux=pinned!.flux*(1-pinned!.resistance);
    const actPhase=z.activation*.2+Math.cos(z.phaseAngle)*.1;
    const cue=auditInputZone===target?.35:0;
    const vterm=arm==='D2″'?.5*(v['4->'+target]??0):0;
    const weighted=b[target]*.4;
    const full=flux+actPhase+cue+vterm+weighted;
    const exactActual=gate.flux*(1-gate.resistance)+.4*(pfmBias[target]??0)+actPhase+cue;
    assert(Math.abs(full-exactActual)<1e-10,
      'ZONE4_HOOK_TRUE_SELECTOR_SCORE_MISMATCH_'+arm+'_TAPE_'+k+'_STEP_'+auditStep);
    return {flux,actPhase,cue,vterm,weighted,full};
   };
   const x5=score(5),x7=score(7);
   const margin=x7.full-x5.full;
   const without=margin-(x7.weighted-x5.weighted);
   const noBias=without>0?7:5; // canonical 4→5 wins exact ties
   auditRows.push({arm,tape:k,step:auditStep,inputZone:auditInputZone,
    cueClass:auditInputZone===5?'pitwardCue':auditInputZone===7?'otherCue':'uncued',
    actualTarget:-1,predictedTarget:margin>0?7:5,
    canonicalBias5:pfmBias[5]??0,canonicalBias7:pfmBias[7]??0,
    selectorBias5:b[5]??0,selectorBias7:b[7]??0,
    weightedSelectorBias5:x5.weighted,weightedSelectorBias7:x7.weighted,
    canonicalBiasDelta7Minus5:.4*((pfmBias[7]??0)-(pfmBias[5]??0)),
    selectorBiasDelta7Minus5:x7.weighted-x5.weighted,
    fluxDelta7Minus5:x7.flux-x5.flux,
    activationPhaseDelta7Minus5:x7.actPhase-x5.actPhase,
    inputDelta7Minus5:x7.cue-x5.cue,VDelta7Minus5:x7.vterm-x5.vterm,
    totalScore5:x5.full,totalScore7:x7.full,margin7Minus5:margin,
    marginWithoutSelectorBias:without,selectedWithoutSelectorBias:noBias,
    selectorBiasChangedExit:noBias!==(margin>0?7:5)});
  }
  return returned;
 };
}

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
 installZ4Audit(rt,'B',k,()=>rt.getMemory().readMemoryBias().biasVector,()=>({}));
 const zones=[rt.getCurrentZone()],edges:string[]=[];
 const choices=blankChoices();
 let terminal:number|null=null;
 for(let i=0;i<LIMIT;i++){
  const before=rt.getCurrentZone();
  if(before===5)break;
  const input=tape(k,i);
  const inputZone=parseInt(sha(input).slice(0,2),16)%10;
  auditStep=i+1;auditInputZone=inputZone;
  const snap=rt.step(input);
  if(before===4){const row=auditRows[auditRows.length-1];
   assert.equal(row.tape,k);assert.equal(row.step,i+1);
   row.actualTarget=rt.getCurrentZone();assert.equal(row.actualTarget,row.predictedTarget);
  }
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
 installZ4Audit(rt,'D2″',k,()=>traces.selectorBias(),()=>values);
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
  auditStep=i+1;auditInputZone=inputZone;
  const stepOut=am5D2Step(rt,traces,pastValues,input);
  if(prev===4){const row=auditRows[auditRows.length-1];
   assert.equal(row.tape,k);assert.equal(row.step,i+1);
   row.actualTarget=rt.getCurrentZone();assert.equal(row.actualTarget,row.predictedTarget);
  }
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

const archived=JSON.parse(readFileSync(ROOT+'DEV1_AM5_D2PP_RESULT.json','utf8'));
const acceptedB=JSON.parse(readFileSync(ROOT+'DEV1_D1_CHOICE_POINT_AUDIT.json','utf8'));
const paired=[] as {tape:number;B:TapeData;D2PP:TapeData}[];
for(let tape=1;tape<=32;tape++){
 const B=replayB(tape),D2PP=runD2PP(tape);
 paired.push({tape,B,D2PP});
 assert.equal(D2PP.absorptionStep,archived.rows[tape-1].D2PP.absorptionStep);
 assert.deepEqual(D2PP.finalV,archived.rows[tape-1].D2PP.finalV);
 assert.deepEqual(D2PP.finalFastTrace,archived.rows[tape-1].D2PP.finalFastTrace);
 assert.deepEqual(D2PP.finalSlowTrace,archived.rows[tape-1].D2PP.finalSlowTrace);
}
const sum=(arm:'B'|'D2″',cue:string)=>{
 const rows=auditRows.filter(x=>x.arm===arm&&x.cueClass===cue);
 const avg=(f:(r:Z4Record)=>number)=>
  rows.length?rows.reduce((p,x)=>p+f(x),0)/rows.length:null;
 return {n:rows.length,chosen5:rows.filter(x=>x.actualTarget===5).length,
  chosen7:rows.filter(x=>x.actualTarget===7).length,
  meanCanonicalPFMBias5:avg(x=>x.canonicalBias5),
  meanCanonicalPFMBias7:avg(x=>x.canonicalBias7),
  meanSelectorBias5:avg(x=>x.selectorBias5),
  meanSelectorBias7:avg(x=>x.selectorBias7),
  meanWeightedSelectorBias5:avg(x=>x.weightedSelectorBias5),
  meanWeightedSelectorBias7:avg(x=>x.weightedSelectorBias7),
  meanCanonicalBiasMargin7Minus5:avg(x=>x.canonicalBiasDelta7Minus5),
  meanSelectorBiasMargin7Minus5:avg(x=>x.selectorBiasDelta7Minus5),
  meanFullScoreMargin7Minus5:avg(x=>x.margin7Minus5),
  meanNoSelectorBiasMargin7Minus5:avg(x=>x.marginWithoutSelectorBias),
  numberOfBiasSensitiveChoices:rows.filter(x=>x.selectorBiasChangedExit).length};
};
const summary=Object.fromEntries((['B','D2″'] as const).map(arm=>[
 arm,Object.fromEntries(['pitwardCue','otherCue','uncued'].map(cue=>[cue,sum(arm,cue)]))]));
for(const arm of ['B','D2″'] as const){
 const stat=(arm==='B'?acceptedB.choicePointSummaries.B:archived.threeChoicePoints.D2PP)['4'];
 const rows=auditRows.filter(x=>x.arm===arm);
 assert.equal(rows.length,stat.overall.choices);
 assert.equal(rows.filter(x=>x.actualTarget===5).length,stat.overall.pitwardSelected);
 for(const key of ['pitwardCue','otherCue','uncued'] as const){
  assert.equal(rows.filter(x=>x.cueClass===key).length,stat[key].choices);
  assert.equal(rows.filter(x=>x.cueClass===key&&x.actualTarget===5).length,stat[key].pitwardSelected);
 }
}
const output={schema:'DEV1_D2_ACCEPTED_ZONE4_BIAS_READONLY_AUDIT_V1',
 characterization:'UNREGISTERED_READ_ONLY_MATCHED_B_D2_REPLAY_DIAGNOSTIC',
 noNewCohort:true,onlyArmsReplayed:['B','D2″'],
 verifiedAll64AbsorptionSteps:true,verifiedAll32D2TerminalVAndTraceVectors:true,
 contrastSign:'positive margin7Minus5 selects 4→7; negative selects 4→5',
 baselineFullSelector:'canonical PFM bias ×0.4; D2″ replaces only selector bias by (Fhat+Shat)/2 ×0.4; canonical PFM retained in TraitEvolution',
 cueClasses:{pitwardCue:'inputZone==5',otherCue:'inputZone==7',uncued:'inputZone neither 5 nor 7'},
 denominator:'every actual visit to zone4 before first absorption (includes terminal choice), each recorded once',
 originalD2SHA256:sha(readFileSync(ROOT+'DEV1_AM5_D2PP_RESULT.json')),
 originalBSHA256:sha(readFileSync(ROOT+'DEV1_BASELINE_CALIBRATION.json')),
 summary,events:auditRows};
const json=JSON.stringify(output,null,2)+'\n';
const format=(n:number|null)=>n===null?'NA':n.toFixed(6);
const cols=['arm','tape','step','cueClass','inputZone','actualTarget',
  'canonicalBias5','canonicalBias7','selectorBias5','selectorBias7',
  'weightedSelectorBias5','weightedSelectorBias7',
  'canonicalBiasDelta7Minus5','selectorBiasDelta7Minus5',
  'fluxDelta7Minus5','activationPhaseDelta7Minus5',
  'inputDelta7Minus5','VDelta7Minus5',
  'totalScore5','totalScore7','margin7Minus5','marginWithoutSelectorBias',
  'selectedWithoutSelectorBias','selectorBiasChangedExit'];
const lines=[
 '# DEV-1 accepted D2″ — retrospective read-only all-zone4 selector bias and score audit',
 '',
 'This is **not a new arm**, not a test registered before B/D2″, and not proof of a specific causal mediation effect. The replay matches all 64 B/D2″ absorption steps, all 32 terminal D2″ V vectors and final fast/slow traces and all zone4 cue counts. Original B/D2″ evidence is unchanged.',
 '',
 '**Margin:** score(4→7) − score(4→5), positive favors 7. Bias terms are individually 0.4×selector bias for target 5 or 7, assessed after trait evolution and before selecting the exit. The separate canonical PFM bias is recorded even in D2″, where it continues into TraitEvolution but is replaced in the *selector* by the normalized fast/slow bias.',
 '',
 '## Every zone4 decision — summary stratified by input cue',
 '',
 '| Arm | Cue | n | Chose 5 | Chose 7 | Mean selector 0.4b5 | Mean selector 0.4b7 | Mean bias margin 7−5 | Mean full margin 7−5 | Mean margin w/o selector bias | Selector bias flips |',
 '|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|',
 ...(['B','D2″'] as const).flatMap(arm=>
  ['pitwardCue','otherCue','uncued'].map(cue=>{
    const d=(summary as any)[arm][cue];
    return '| '+arm+' | '+cue+' | '+d.n+' | '+d.chosen5+' | '+d.chosen7+
    ' | '+format(d.meanWeightedSelectorBias5)+' | '+format(d.meanWeightedSelectorBias7)+
    ' | '+format(d.meanSelectorBiasMargin7Minus5)+
    ' | '+format(d.meanFullScoreMargin7Minus5)+
    ' | '+format(d.meanNoSelectorBiasMargin7Minus5)+
    ' | '+d.numberOfBiasSensitiveChoices+' |';
  })),
 '',
 '## Full per-event data, all zone4 visits (full precision in accompanying JSON)',
 '',
 '| '+cols.join(' | ')+' |',
 '| '+cols.map(()=>'---').join(' | ')+' |',
 ...auditRows.map(x=>'| '+cols.map(k=>{
  const v=(x as any)[k];return typeof v==='number'?Number(v.toFixed(7)).toString():String(v);
 }).join(' | ')+' |'),
 '',
 '## Limits and question under review',
 '',
 'The immediate selector-only bias margin can be isolated exactly. By contrast, canonical memory also affects target activation via TraitEvolution and changes with each preceding trajectory; removing it globally would require an intervention not authorised by this read-only audit. Do not interpret cross-arm mean differences as an identified causal protection effect.',
 '',
 'Published original B and D2″ machine-readable cohort data remain byte-identical. A complete second replay of this JSON and Markdown is required before accepting this audit.',
 '- JSON SHA256 '+sha(json)
].join('\n');
writeFileSync(ROOT+'DEV1_D2_ACCEPTED_ZONE4_BIAS_AUDIT.json',json);
writeFileSync(ROOT+'DEV1_D2_ACCEPTED_ZONE4_BIAS_AUDIT.md',lines);
console.log('DEV1_D2_ZONE4_BIAS_AUDIT_PASS',JSON.stringify({summary,events:auditRows.length,sha256:sha(json)}));
