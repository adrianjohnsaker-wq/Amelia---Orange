/** DEV1 D1 32-tape synthetic cohort. No D2/D3/D4/Y/L/LY/L0 runner or live inflow.
 * Uses the sealed constants and original canonical AmeliaNumogramSubstrateRuntime
 * imported and wrapped only at the exit-selection edge bonus.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {AmeliaNumogramSubstrateRuntime} from '../../src/substrate/ameliaNumogramSubstrateRuntime';
import {accelerateExactHistoryDigest} from '../../src/developmental/DEV1ExactDigestAdapter';
import {d1EdgeKey,d1GateSelectorOverlay,d1ChooseExit,D1_CANONICAL_EDGES} from '../../src/developmental/DEV1D1EdgeSelector';
import {updateEdgeValue,consequenceOutcome} from '../../src/developmental/DEV1Mechanisms';

const ROOT='experiments/dev1/';
const raw=readFileSync(ROOT+'DEV1_CONSTANTS.json');
const C=JSON.parse(raw.toString());
const baseline=JSON.parse(readFileSync(ROOT+'DEV1_BASELINE_CALIBRATION.json','utf8'));
const sha=(s:string|Buffer)=>createHash('sha256').update(s).digest('hex');
assert.equal(C.schema,'DEV1_STAGE1_SYNTHETIC_CONSTANTS_V1');
assert.equal(C.syntheticOnly,true);assert.equal(C.liveInflowProhibited,true);
assert.equal(process.env.DRIFT_C1_ENABLE_LIVE,'false');
assert.equal(process.env.DEV1_D1_UNIT_VERIFIED,'true','D1_UNIT_GATE_MUST_PRECEDE_COHORT');
assert.equal(process.env.DEV1_CONSTANTS_RFC3161_VERIFIED,'true');
assert.equal(process.env.DEV1_IDENTITY_PASS,'true');
assert.equal(C.armsOrder[1],'D1');
assert.equal(C.mechanisms.consequenceHorizon.value,24);
assert.equal(C.mechanisms.consequenceWeight.value,0.5);
assert.equal(C.mechanisms.edgeValues.initial,0);
assert.equal(C.mechanisms.valueUpdate.formula,'V <- V + (o-V)/8');
assert.equal(C.mechanisms.outcome.edgeCount,11);
assert.equal(C.baseline.maxStepsPerTape,10000);
assert.equal(C.baseline.numberOfTapes,32);
assert.equal(baseline.arm,'B');
assert.equal(baseline.absorbedCount,32);
assert.equal(baseline.medianAbsorptionStep,1393);
assert.equal(baseline.localSelectorMemoryAblation.changedBranchChoices,124);
assert.equal(baseline.localSelectorMemoryAblation.branchChoices,18594);
const H=24; const LIMIT=10000;
const tape=(k:number,i:number)=>sha('DEV1-TAPE-'+k+'|'+i);
type Pending={edge:string;t:number;beforeDistinct:number;afterEdges:string[]};
type D1Row={tape:number;absorptionStep:number|null;restrictedSurvival:number;censored:boolean;
  baseStep:number|null;pairedDifference:number;
  absorptionRoute:string|null;lastFourZones:number[];entryPathLast20:number[];
  distinctEdges:number;edgeValuesAtEnd:Record<string,number>;valueUpdates:number;
  valueUpdatesNegative:number;valueUpdatesMoving:number;
  branchChoices:number;memoryTermsChangedBranch:number;edgeValueChangedBranch:number;
  movingExits:number;memoryTermsChangedExit:number;edgeValueChangedExit:number;
  digestValidated:true};
function median(x:number[]):number|null{
 if(!x.length)return null;
 const sorted=[...x].sort((a,b)=>a-b);
 const n=sorted.length;
 return n%2?sorted[(n-1)/2]:(sorted[n/2-1]+sorted[n/2])/2;
}
function one(k:number):D1Row {
 const rt=new AmeliaNumogramSubstrateRuntime();
 rt.setSuppressRelaySteering(true);
 const digest=accelerateExactHistoryDigest(rt.getMemory());
 const V:Object=Object.fromEntries(D1_CANONICAL_EDGES.map(e=>[e,0]));
 const values=V as Record<string,number>;
 const zones:number[]=[rt.getCurrentZone()];
 const edges:string[]=[];
 const pending:Pending[]=[];
 let updates=0,negativeUpdates=0,movingUpdates=0;
 let branchChoices=0,combinedBranch=0,valueBranch=0,movingExits=0,combinedExit=0,valueExit=0;
 let absorbed:number|null=null;
 for(let i=0;i<LIMIT;i++){
  const t=i+1;
  const prev=rt.getCurrentZone();
  if(prev===5){absorbed=absorbed??i;break}
  const input=tape(k,i);
  const inputZone=parseInt(sha(input).slice(0,2),16)%10;
  const memoryBias=rt.getMemory().readMemoryBias().biasVector;
  const beforeDistinct=new Set(edges.slice(-H)).size;
  const pastValues=Object.freeze({...values});
  const snap=d1GateSelectorOverlay(rt.getQabbala(),pastValues,()=>rt.step(input));
  const to=rt.getCurrentZone();
  assert.equal(to,snap.lastTransition.to);
  // This counterpart reconstructs exactly the canonical selector on the
  // SAME post-evolution zone and gate states; no alternative rollouts/tapes.
  const gates=rt.getQabbala().getGates();
  const zonesMap=rt.getQabbala().getZones();
  const chosen=d1ChooseExit(prev,gates,zonesMap,memoryBias,inputZone,pastValues);
  assert.equal(to,chosen,'D1_SELECTOR_OVERLAY_NOT_EQUIVALENT');
  const baseBiasOnly=d1ChooseExit(prev,gates,zonesMap,memoryBias,inputZone,pastValues,true,false);
  const noSelectorMemory=d1ChooseExit(prev,gates,zonesMap,memoryBias,inputZone,pastValues,false,false);
  const branches=gates.filter(x=>x.isOpen&&x.source===prev).length;
  if(branches>0){
   movingExits++;
   if(to!==baseBiasOnly)valueExit++;
   if(to!==noSelectorMemory)combinedExit++;
  }
  if(branches>1){
   branchChoices++;
   if(to!==baseBiasOnly)valueBranch++;
   if(to!==noSelectorMemory)combinedBranch++;
  }
  assert(gates.some(x=>x.isOpen&&x.source===prev&&x.target===to));
  const e=d1EdgeKey(prev,to);
  assert(e in values,'D1_SELECTED_NON_CANONICAL_EDGE');
  edges.push(e);
  zones.push(to);
  const enteredAbsorption=gates.filter(x=>x.isOpen&&x.source===to).length===0;
  // Every pending choice consumes exactly the following H edges to evaluate
  // its delayed consequence (same tape, no future peek).
  for(const p of pending)p.afterEdges.push(e);
  for(let j=pending.length-1;j>=0;j--){
   const p=pending[j];
   if(enteredAbsorption || p.afterEdges.length===H){
    const outcome=consequenceOutcome(enteredAbsorption,new Set(Array(p.beforeDistinct).fill(0)).size,
         new Set(p.afterEdges).size);
    // Use the saved number of distinct preceding edges (not a padded array).
    const o=enteredAbsorption?-1:Math.max(-1,Math.min(1,
      (new Set(p.afterEdges).size-p.beforeDistinct)/11));
    assert(Math.abs(o-(enteredAbsorption?-1:consequenceOutcome(false,p.beforeDistinct,new Set(p.afterEdges).size)))<1e-12);
    values[p.edge]=updateEdgeValue(values[p.edge],o);
    updates++; if(o===-1)negativeUpdates++; else movingUpdates++;
    pending.splice(j,1);
   }
  }
  if(enteredAbsorption){
   // Terminal choice itself earns an immediate -1 (absorbs at its exit).
   values[e]=updateEdgeValue(values[e],-1);
   updates++;negativeUpdates++;
   absorbed=t;
  } else pending.push({edge:e,t,beforeDistinct,afterEdges:[]});
  if(t<=24 || enteredAbsorption) digest.validateCanonical();
  if(enteredAbsorption)break; // zone 5 dwell is irreversible; right-censor at 10000
 }
 digest.validateCanonical();
 const routeZones=zones.slice(-20);
 const lastFour=zones.slice(-4);
 const route=lastFour.join('→');
 const baseStep=baseline.absorptionSteps.find((x:any)=>x.tape===k)?.step??null;
 const survival=Math.min(absorbed??LIMIT,LIMIT);
 return {tape:k,absorptionStep:absorbed,restrictedSurvival:survival,
  censored:absorbed===null,baseStep,pairedDifference:survival-Math.min(baseStep??LIMIT,LIMIT),
  absorptionRoute:absorbed===null?null:route,
  lastFourZones:lastFour,entryPathLast20:routeZones,
  distinctEdges:new Set(edges).size,edgeValuesAtEnd:values,
  valueUpdates:updates,valueUpdatesNegative:negativeUpdates,valueUpdatesMoving:movingUpdates,
  branchChoices,memoryTermsChangedBranch:combinedBranch,edgeValueChangedBranch:valueBranch,
  movingExits,memoryTermsChangedExit:combinedExit,edgeValueChangedExit:valueExit,
  digestValidated:true};
}
const rows:D1Row[]=[];
for(let k=1;k<=32;k++){
 const r=one(k);rows.push(r);
 console.log('DEV1_D1_TAPE_COMPLETE',JSON.stringify({
  tape:k,absorptionStep:r.absorptionStep,route:r.absorptionRoute,
  branchChanges:r.memoryTermsChangedBranch,branches:r.branchChoices,
  edgeValueChanges:r.edgeValueChangedBranch,updates:r.valueUpdates}));
}
const sum=(key:keyof D1Row)=>rows.reduce((x,r)=>x+(typeof r[key]==='number'?r[key] as number:0),0);
const nAbs=rows.filter(x=>x.absorptionStep!==null).length;
const steps=rows.filter(x=>x.absorptionStep!==null).map(x=>x.absorptionStep as number);
const branchCount=sum('branchChoices');
const fullChange=sum('memoryTermsChangedBranch');
const vChange=sum('edgeValueChangedBranch');
const fullShare=branchCount?fullChange/branchCount:0;
const onlyVShare=branchCount?vChange/branchCount:0;
const bBranchShare=baseline.localSelectorMemoryAblation.changedBranchChoices/
  baseline.localSelectorMemoryAblation.branchChoices;
const rmst=sum('restrictedSurvival')/32;
const bRmst=baseline.absorptionSteps.reduce((s:number,r:any)=>s+Math.min(r.step??LIMIT,LIMIT),0)/32;
const routes=Object.fromEntries([...new Set(rows.map(x=>x.absorptionRoute||'CENSORED'))].sort().map(x=>
  [x,rows.filter(y=>(y.absorptionRoute||'CENSORED')===x).length]));
const result={schema:'DEV1_D1_COHORT_RESULT_V1',arm:'D1',syntheticOnly:true,source:'Original canonical runtime imported/wrapped (D1 selector bonus +0.5 V(e)); unmodified baseline data',
  constantsSha256:sha(raw),tapes:32,maxStepsPerTape:LIMIT,consequenceHorizon:24,
  valueUpdate:'V <- V + (o-V)/8',outcome:'-1 if enters zone5 within 24 after a choice; otherwise (distinctFollowing24 - distinctPreceding24)/11, clipped',
  noForesight:true,noDevelopmentalOtherArms:true,
  O1:{restrictedMeanSurvival:rmst,baselineRestrictedMeanSurvival:bRmst,pairedMeanDifference:rmst-bRmst,
   medianAbsorptionStep:median(steps),absorptionRange:steps.length?[Math.min(...steps),Math.max(...steps)]:null,
   absorbed:nAbs,rightCensored:32-nAbs,allAbsorbed:nAbs===32,absorptionSteps:rows.map(r=>({tape:r.tape,step:r.absorptionStep,baseStep:r.baseStep,difference:r.pairedDifference})),
   noConfirmatoryPValue:true},
  O2:{baselineBranchShare:bBranchShare,baselineBranchChanged:124,baselineBranchChoices:18594,
   D1BranchChoices:branchCount,D1SelectorAllMemoryChanges:fullChange,
   D1SelectorAllMemoryShare:fullShare,D1ValueOnlyChanges:vChange,D1ValueOnlyShare:onlyVShare,
   manipulationCheck:fullShare>bBranchShare?'PASS':'FAIL',
   definition:'At every zone with >=2 open exits: chosen D1 (PFM + V) vs selector with both PFM and V removed on identical post-evolution state, plus V-only removal; no alternate rollout.'},
  learning:{edgeValueUpdates:sum('valueUpdates'),negativeAbsorptionUpdates:sum('valueUpdatesNegative'),
    movingOutcomeUpdates:sum('valueUpdatesMoving'),
    edgeValuesRemainBounded:rows.every(r=>Object.values(r.edgeValuesAtEnd).every(v=>v>=-1&&v<=1))},
  absorptionRoutes:routes,rows
};
assert.equal(result.learning.edgeValuesRemainBounded,true);
const json=JSON.stringify(result,null,2)+'\n';
const dataPath=ROOT+'DEV1_D1_RESULT.json';
writeFileSync(dataPath,json);
const lines=[
 '# DEV-1 Stage 1 — D1 edge-value cohort (synthetic only)',
 '',
 '**Gate:** Sealed constants, pinned science, prior [standalone D1 exit-choice unit test](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39586471562) PASS before any of these 32 tapes. No other developmental arm run.',
 '',
 '## O1 — Restricted survival (up to 10,000 synthetic steps)',
 '',
 '- D1 restricted mean: **'+rmst.toFixed(3)+'** steps; unchanged B restricted mean: **'+bRmst.toFixed(3)+'**; paired mean difference D1−B: **'+(rmst-bRmst).toFixed(3)+'**.',
 '- Absorbed: **'+nAbs+'/32**; right-censored: **'+(32-nAbs)+'/32**.',
 '- Absorption median (uncensored): **'+(median(steps)??'not estimable')+'**; range **'+(steps.length?Math.min(...steps)+'–'+Math.max(...steps):'not estimable')+'**.',
 '- No confirmatory survival p-value for D1: registered confirmatory comparisons are D4 vs B and D4 vs Y, later.',
 '',
 '## O2 — Selector-memory manipulation check',
 '',
 '- Unchanged B reference: **124/18,594 = '+(100*bBranchShare).toFixed(4)+'%** of branch choices.',
 '- D1 total selector-memory removal (PFM + V): **'+fullChange+'/'+branchCount+' = '+(100*fullShare).toFixed(4)+'%**.',
 '- D1 V-only removal (PFM retained): **'+vChange+'/'+branchCount+' = '+(100*onlyVShare).toFixed(4)+'%**.',
 '- Predeclared manipulation verdict (D1 combined share strictly greater than B): **'+result.O2.manipulationCheck+'**.',
 '- These are local matched selector ablations on the same post-evolution state; they do not undo history already incorporated into zone dynamics.',
 '',
 '## Observed absorption routes (terminal last four zones)',
 '',
 ...Object.entries(routes).map(([route,count])=>'- '+route+': **'+count+'**'),
 '',
 '## Per-tape O1 and route',
 '',
 '| Synthetic tape | B absorption | D1 absorption | D1 − B steps | D1 route |',
 '|---|---:|---:|---:|---|',
 ...rows.map(r=>'| '+r.tape+' | '+(r.baseStep??'censored')+' | '+(r.absorptionStep??'censored')+
 ' | '+r.pairedDifference+' | '+(r.absorptionRoute??'censored')+' |'),
 '',
 '## Provenance and bounds',
 '',
 '- Synthetic input only: SHA256("DEV1-TAPE-"+k+"|"+i), k=1..32; no live drand, PF-1 input, C1 dispatch or notifications.',
 '- Original canonical runtime classes were imported, never changed. Temporary D1 exit-score overlay uses the sealed edge term +0.5×V(e); original gate flux remains stored unchanged.',
 '- H=24, value range [-1,1], update V←V+(o−V)/8, fixed before outcome observation.',
 '- Byte-identical second full replay and pinned source checks are mandatory workflow gates; no other arm may start before review.',
 '- Canonical full-history digest equality was checked on early steps and each final absorbed state.',
 '- Result JSON SHA-256: `'+sha(json)+'`.',
 ''
].join('\n');
writeFileSync(ROOT+'DEV1_D1_REPORT.md',lines);
console.log('DEV1_D1_RESULT_COMPLETE',JSON.stringify({
  O1:result.O1,O2:result.O2,absorptionRoutes:routes,learning:result.learning,
  sha256:sha(json)
}).slice(0,13000));
