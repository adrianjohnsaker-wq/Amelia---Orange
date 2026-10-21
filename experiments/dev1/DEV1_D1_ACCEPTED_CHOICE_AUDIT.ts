/**
 * DEV-1 read-only POST-D1-ACCEPTANCE DIAGNOSTIC, not a new arm.
 *
 * Replays only the exact already-published B and D1 synthetic 32 tapes;
 * validates recorded absorption steps and every D1 terminal V value.
 * Adds counts/rates for 1->2 actual choices. DOES NOT modify, overwrite,
 * execute or retune registered cohort analysis, source, or frozen constants.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {AmeliaNumogramSubstrateRuntime} from '../../src/substrate/ameliaNumogramSubstrateRuntime';
import {accelerateExactHistoryDigest} from '../../src/developmental/DEV1ExactDigestAdapter';
import {D1_CANONICAL_EDGES,d1GateSelectorOverlay,d1EdgeKey} from '../../src/developmental/DEV1D1EdgeSelector';
import {consequenceOutcome,updateEdgeValue} from '../../src/developmental/DEV1Mechanisms';

const PREFIX='experiments/dev1/';
const baseline=JSON.parse(readFileSync(PREFIX+'DEV1_BASELINE_CALIBRATION.json','utf8'));
const d1=JSON.parse(readFileSync(PREFIX+'DEV1_D1_RESULT.json','utf8'));
const constantsRaw=readFileSync(PREFIX+'DEV1_CONSTANTS.json');
const C=JSON.parse(constantsRaw.toString('utf8'));
const sha=(x:string|Buffer)=>createHash('sha256').update(x).digest('hex');
assert.equal(process.env.DRIFT_C1_ENABLE_LIVE,'false','LIVE_DISALLOWED');
assert.equal(process.env.DEV1_DIAGNOSTIC_IDENTITY_PASS,'true','SIGNED_SCIENTIFIC_GATE_REQUIRED');
assert.equal(process.env.DEV1_D1_RERUN_NOT_NEW_ARM,'true');
assert.equal(C.schema,'DEV1_STAGE1_SYNTHETIC_CONSTANTS_V1');
assert.equal(sha(constantsRaw),d1.constantsSha256);
assert.deepEqual(C.armsOrder,['B','D1','D2','D3','D4','Y','L','LY','L0']);
assert.equal(C.mechanisms.consequenceHorizon.value,24);
assert.equal(C.mechanisms.consequenceWeight.value,0.5);
assert.equal(C.mechanisms.valueUpdate.timeConstantTraversal,8);
assert.equal(C.mechanisms.outcome.edgeCount,11);
assert.equal(baseline.absorbedCount,32);
assert.equal(d1.O1.absorbed,32);
assert.equal(d1.rows.length,32);
const T=10000,H=24,gateKeys=D1_CANONICAL_EDGES.slice();
assert.equal(gateKeys.length,11);
const zeroValues=()=>Object.fromEntries(gateKeys.map(k=>[k,0])) as Record<string,number>;
type Credit={edge:string;beforeDistinct:number;afterEdges:string[]};
type Observation={arm:'B'|'D1';tape:number;absorptionStep:number;movingSteps:number;
 zone1Choices:number;chosen1to2:number;rate1to2Per1000MovingSteps:number;
 rate1to2Per1000RegisteredSteps:number;
 terminalValues?:Record<string,number>;consequenceUpdates?:number};

function run(arm:'B'|'D1',tapeNo:number):Observation{
 const rt=new AmeliaNumogramSubstrateRuntime();
 rt.setSuppressRelaySteering(true);
 const digest=accelerateExactHistoryDigest(rt.getMemory());
 const values=zeroValues();
 const edges:string[]=[];
 const pending:Credit[]=[];
 let moves=0,chosen=0,zone1Choices=0,absorb=0,updates=0;
 for(let i=0;i<T;i++){
  const from=rt.getCurrentZone();
  if(from===5)break;
  const input=sha('DEV1-TAPE-'+tapeNo+'|'+i);
  const beforeDistinct=arm==='D1'?new Set(edges.slice(-H)).size:0;
  const frozenV=arm==='D1'?Object.freeze({...values}):null;
  const snap=arm==='D1'
   ?d1GateSelectorOverlay(rt.getQabbala(),frozenV!,()=>rt.step(input))
   :rt.step(input);
  const to=rt.getCurrentZone();
  assert.equal(snap.lastTransition.from,from);
  assert.equal(snap.lastTransition.to,to);
  const outgoing=rt.getQabbala().getGates().filter(g=>g.isOpen&&g.source===from);
  assert(outgoing.some(g=>g.target===to),'REPLAY_SELECTED_NONCANONICAL_EDGE');
  moves++;
  if(from===1){
   zone1Choices++;
   if(to===2)chosen++;
  }
  if(arm==='D1'){
   const e=d1EdgeKey(from,to);
   edges.push(e);
   const enteredAbsorption=rt.getQabbala().getGates().every(g=>!(g.isOpen&&g.source===to));
   for(const p of pending)p.afterEdges.push(e);
   for(let j=pending.length-1;j>=0;j--){
    const p=pending[j];
    if(enteredAbsorption||p.afterEdges.length===H){
     const o=consequenceOutcome(enteredAbsorption,p.beforeDistinct,new Set(p.afterEdges).size);
     values[p.edge]=updateEdgeValue(values[p.edge],o);
     updates++; pending.splice(j,1);
    }
   }
   if(enteredAbsorption){
    values[e]=updateEdgeValue(values[e],-1);
    updates++;
   }else pending.push({edge:e,beforeDistinct,afterEdges:[]});
  }
  if(i<24)digest.validateCanonical();
  if(to===5){absorb=i+1;digest.validateCanonical();break}
 }
 digest.validateCanonical();
 assert(absorb>0,'EXPECTED_ABSORPTION_IN_REGISTERED_32_TAPES');
 const expected=arm==='B'?baseline.absorptionSteps[tapeNo-1].step:d1.rows[tapeNo-1].absorptionStep;
 assert.equal(absorb,expected,arm+' TAPE '+tapeNo+' ABSORPTION_REPLAY_MISMATCH');
 assert.equal(moves,absorb,'MOVING_DENOMINATOR_NOT_PREABSORPTION');
 if(arm==='D1'){
  const registered=d1.rows[tapeNo-1];
  assert.equal(updates,registered.valueUpdates,'D1_CONSEQUENCE_UPDATE_COUNT_MISMATCH');
  assert.deepEqual(Object.keys(values).sort(),Object.keys(registered.edgeValuesAtEnd).sort());
  for(const key of gateKeys)
   assert.equal(values[key],registered.edgeValuesAtEnd[key],
     'D1_FULL_PRECISION_FINAL_V_MISMATCH_TAPE_'+tapeNo+'_EDGE_'+key);
 }
 return {arm,tape:tapeNo,absorptionStep:absorb,movingSteps:moves,
  zone1Choices,chosen1to2:chosen,
  rate1to2Per1000MovingSteps:1000*chosen/moves,
  rate1to2Per1000RegisteredSteps:1000*chosen/T,
  ...(arm==='D1'?{terminalValues:values,consequenceUpdates:updates}:{})};
}
const observations:Observation[]=[];
for(let k=1;k<=32;k++){
 const b=run('B',k),d=run('D1',k);
 observations.push(b,d);
 console.log('DEV1_D1_ACCEPTED_CHOICE_REPLAY_TAPE',JSON.stringify({
  tape:k,Bstep:b.absorptionStep,D1step:d.absorptionStep,
  B12:b.chosen1to2,D1_12:d.chosen1to2,
  B_rate1000:b.rate1to2Per1000MovingSteps,D1_rate1000:d.rate1to2Per1000MovingSteps,
  D1FinalVValidatedExact:true}));
}
const pairs=Array.from({length:32},(_,i)=>{
 const b=observations[2*i],d=observations[2*i+1];
 assert(b.arm==='B'&&d.arm==='D1'&&b.tape===i+1&&d.tape===i+1);
 return {tape:i+1,B:{absorptionStep:b.absorptionStep,movingSteps:b.movingSteps,
  zone1Choices:b.zone1Choices,chosen1to2:b.chosen1to2,
  per1000MovingSteps:b.rate1to2Per1000MovingSteps,
  per1000Full10000StepTape:b.rate1to2Per1000RegisteredSteps},
  D1:{absorptionStep:d.absorptionStep,movingSteps:d.movingSteps,
  zone1Choices:d.zone1Choices,chosen1to2:d.chosen1to2,
  per1000MovingSteps:d.rate1to2Per1000MovingSteps,
  per1000Full10000StepTape:d.rate1to2Per1000RegisteredSteps,
  finalV:d.terminalValues}};
});
const sum=(arm:'B'|'D1',field:keyof Observation)=>observations
 .filter(o=>o.arm===arm).reduce((total,o)=>total+(typeof o[field]==='number'?o[field] as number:0),0);
const counts=Object.fromEntries(['B','D1'].map(a=>{
 const arm=a as 'B'|'D1';
 const moving=sum(arm,'movingSteps'),chosen=sum(arm,'chosen1to2');
 const zone1=sum(arm,'zone1Choices');
 return [arm,{chosen1to2:chosen,zone1Choices:zone1,
    movingSteps:moving,per1000PooledMovingSteps:1000*chosen/moving,
    per1000FullRegisteredTapeSteps:1000*chosen/(32*T),
    conditionalShareAtZone1:zone1?chosen/zone1:null}];
}));
assert.equal(counts.B.movingSteps,baseline.localSelectorMemoryAblation.exitChoices);
assert.equal(counts.D1.movingSteps,d1.rows.reduce((s:number,r:any)=>s+r.movingExits,0));
assert.equal(pairs[1].D1.finalV!['1->8'],d1.rows[1].edgeValuesAtEnd['1->8']);
const output={
 schema:'DEV1_D1_ACCEPTED_POSTHOC_CHOICE_AUDIT_V1',
 classification:'EXPLORATORY_UNREGISTERED_RETROSPECTIVE_READ_ONLY',
 noAdditionalArmsRun:true,syntheticOnly:true,
 originalSealedConstantsSHA256:sha(constantsRaw),
 originalBDataSHA256:sha(readFileSync(PREFIX+'DEV1_BASELINE_CALIBRATION.json')),
 originalD1DataSHA256:sha(readFileSync(PREFIX+'DEV1_D1_RESULT.json')),
 source:'exact read-only replay of previously registered 32 B and D1 synthetic tapes',
 denominator:'per1000MovingSteps = 1000 * number_of_actual_1_to_2_transitions / preabsorption_moving_transition_count',
 supplementalDenominator:'per1000Full10000StepTape = 1000 * count / 10000; includes terminal dwell and is not suitable for preabsorption route hazard comparisons',
 deterministicCohortIdentitiesVerified:true,
 D1FinalVEveryEdgeFullPrecisionVerified:true,
 summary:counts,pairs
};
const json=JSON.stringify(output,null,2)+'\n';
const report=['# DEV-1 D1 accepted — read-only 32-tape edge-value and choice audit',
 '',
 '**Status:** post hoc, exploratory and unregistered diagnostic, NOT a new developmental arm, not the registered D1 O1/O2 analysis and not an AM3 correction.',
 '',
 'Both B and D1 are **exact replays of the already published synthetic tapes**, with all 32 absorption steps reproduced. All **352 individual final D1 edge values** were compared at full JavaScript numeric precision to the original sealed-result JSON; no value was fitted, replaced or silently recomputed in the reported source.',
 '',
 '## Denominator',
 '',
 '- **Primary rate:** number of observed directed **1→2** transitions × 1,000 / actual moving steps from birth (step 1) through and including terminal zone-5 entry. Every individual absorbed within 10,000, so moving steps equal registered absorption step. This prevents the terminal zone-5 dwell until step 10,000 from diluting the rate.',
 '- **Supplementary rate:** number of 1→2 transitions × 1,000 / 10,000 full registered B tape steps. It includes post-absorption dwell and must not be compared as a survival-normalised rate.',
 '- Each 1→2 is a source-zone-1 choice actually selecting target 2; not the number of times an input cued 2 and not an invented transition.',
 '',
 '## 32 matched tapes: observed 1→2 counts and per 1,000 moving steps',
 '',
 '| Tape | B absorption | D1 absorption | B 1→2 count | B per 1k moving | D1 1→2 count | D1 per 1k moving |',
 '|---:|---:|---:|---:|---:|---:|---:|',
 ...pairs.map(p=>'| '+p.tape+' | '+p.B.absorptionStep+' | '+p.D1.absorptionStep+' | '+p.B.chosen1to2+
  ' | '+p.B.per1000MovingSteps.toFixed(3)+' | '+p.D1.chosen1to2+
  ' | '+p.D1.per1000MovingSteps.toFixed(3)+' |'),
 '',
 '## Pooled rates (denominator = total pre-absorption moving steps over all 32)',
 '',
 '| Arm | 1→2 selections | Zone-1 choices | Moving steps | 1→2 per 1,000 moving | 1→2 per 1,000 full 10k timeline steps |',
 '|---|---:|---:|---:|---:|---:|',
 ...(['B','D1'] as const).map(a=>'| '+a+' | '+counts[a].chosen1to2+' | '+counts[a].zone1Choices+
  ' | '+counts[a].movingSteps+' | '+counts[a].per1000PooledMovingSteps.toFixed(4)+
  ' | '+counts[a].per1000FullRegisteredTapeSteps.toFixed(4)+' |'),
 '',
 '## All 32 final D1 V tables, one row per tape (full precision in JSON)',
 '',
 '| Tape | '+gateKeys.join(' | ')+' |',
 '|---:|'+gateKeys.map(()=>'---:').join('|')+'|',
 ...pairs.map(p=>'| '+p.tape+' | '+gateKeys.map(k=>p.D1.finalV![k].toFixed(6)).join(' | ')+' |'),
 '',
 '## Interpretation and strict review boundary',
 '',
 '- Tape 2 safe circuit final values 1→8, 8→9, 9→1 are about −0.604071, −0.616240, −0.660234. Post hoc examination supports a **credit-assignment specification defect**: repeated safe traversal can acquire negative mobility-change value, suppressing 1→8 and potentially favoring 1→2. This is an operator-attributed specification defect, not a newly alleged code bug.',
 '- No prospective claim or registered inference rests on these rates. Tape-level rates and pooled rates have different weighting; both are provided openly.',
 '- Original B, D1 reports and manifests remain byte-identical. No D2, primed or lineage arm was created or run; AM3 remains awaited.',
 '- JSON full precision and B/D1 absorption and V replay validation archived. JSON SHA-256: `'+sha(json)+'`.',
 ''
].join('\n');
writeFileSync(PREFIX+'DEV1_D1_ACCEPTED_CHOICE_AUDIT.json',json);
writeFileSync(PREFIX+'DEV1_D1_ACCEPTED_CHOICE_AUDIT.md',report);
console.log('DEV1_D1_ACCEPTED_READ_ONLY_AUDIT_SUCCESS',JSON.stringify({
 counts,exactFullPrecisionValueChecks:32*gateKeys.length,
 matchedAbsorptionSteps:64,
 artifactSha256:sha(json),
 D2Run:false,AM3Implemented:false
}));
