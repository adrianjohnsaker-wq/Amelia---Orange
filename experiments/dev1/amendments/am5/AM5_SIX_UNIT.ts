/** All six AM5 §4 mandatory constructed units. NO registered D2–Y arms run. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {AmeliaNumogramSubstrateRuntime} from '../../../../src/substrate/ameliaNumogramSubstrateRuntime';
import {AM5SelectorTraces,AM5_ALPHA_F,AM5_ALPHA_S,am5D2Step,
 am5ConsolidationBoundary,AM5SecondOrderMonitor,AM5_CANONICAL_WEIGHTS,
 am5FixtureDeterministicDraw,am5HomeostatStep,am5YokedOutcomeAt}
 from '../../../../src/developmental/DEV1AM5Mechanisms';
const r=JSON.parse(readFileSync('experiments/dev1/amendments/am5/seal/receipt.json','utf8'));
assert.equal(r.status,'PASS');
assert.deepEqual(r.onlyExistingDevelopmentalDataAtSeal,['B','D1','D1″']);
const close=(a:number,b:number)=>assert(Math.abs(a-b)<1e-10,JSON.stringify({a,b}));
// 1 exact α and sums after any step; zero until first step.
{
 const t=new AM5SelectorTraces();
 assert(t.selectorBias().every(v=>v===0));
 const aF=1-Math.exp(-1/48),aS=1-Math.exp(-1/2400);
 close(AM5_ALPHA_F,aF);close(AM5_ALPHA_S,aS);
 t.observe(9);close(t.fast[9],aF);close(t.slow[9],aS);
 close(t.normalized().F.reduce((a,b)=>a+b),1);
 close(t.normalized().S.reduce((a,b)=>a+b),1);
 close(t.selectorBias()[9],1);
 t.observe(1);
 close(t.fast[9],aF*(1-aF));close(t.fast[1],aF);
 close(t.slow[9],aS*(1-aS));close(t.slow[1],aS);
 close(t.normalized().F.reduce((a,b)=>a+b),1);
 close(t.normalized().S.reduce((a,b)=>a+b),1);
 close(t.selectorBias().reduce((a,b)=>a+b),1);
 console.log('AM5_UNIT_1_FAST_SLOW_ALPHA_AND_NORMALIZED_TRACE_PASS');
}
// 2 every multiple 48 strain-only, never triggerConsolidation.
{
 const rt=new AmeliaNumogramSubstrateRuntime();
 let consolidate=0, trigger=0;
 const m=rt.getMemory() as any;
 const c=m.consolidateStrain.bind(m);
 m.consolidateStrain=()=>{consolidate++;c()};
 (rt as any).triggerConsolidation=()=>{trigger++;throw Error('NEVER_TRIGGER_CONSOLIDATION')};
 const at:number[]=[];
 for(let t=1;t<=144;t++)if(am5ConsolidationBoundary(rt,t))at.push(t);
 assert.deepEqual(at,[48,96,144]);assert.equal(consolidate,3);assert.equal(trigger,0);
 assert.equal(rt.getMemory().getEvents().length,0);
 console.log('AM5_UNIT_2_CONSOLIDATION_ONLY_AT_48_MULTIPLES_PASS',JSON.stringify({at,trigger}));
}
// 3 guaranteed identical canonical trait evolution with a fixed matching path.
// 0->9,9->1 are single-exit, so D2 selector cannot alter the target;
// neither early step is consolidated. Compare actual canonical zone / gate
// evolution and prove TraitEvolution saw same canonical memory bias.
{
 const b=new AmeliaNumogramSubstrateRuntime(),d=new AmeliaNumogramSubstrateRuntime();
 b.setSuppressRelaySteering(true);d.setSuppressRelaySteering(true);
 const traces=new AM5SelectorTraces();
 const input=(i:number)=>createHash('sha256').update('DEV1-TAPE-1|'+i).digest('hex');
 for(let i=0;i<2;i++){
  const x=input(i);
  const originalBiasB=b.getMemory().readMemoryBias().biasVector;
  const originalBiasD=d.getMemory().readMemoryBias().biasVector;
  assert.deepEqual(originalBiasD,originalBiasB);
  let observedTraitBias:number[]|null=null;
  const trait=(d as any).traitEvolution;
  const f=trait.evolveStep.bind(trait);
  trait.evolveStep=(zones:any,gates:any,damping:any,advisory:any,bias:any,suppress:any)=>{
    observedTraitBias=[...bias];return f(zones,gates,damping,advisory,bias,suppress);
  };
  const a=b.step(x),z=am5D2Step(d,traces,{},x);
  trait.evolveStep=f;
  assert.deepEqual(observedTraitBias,originalBiasD);
  assert.equal(b.getCurrentZone(),d.getCurrentZone());
  assert.deepEqual(b.getQabbala().getZones(),d.getQabbala().getZones());
  assert.deepEqual(b.getQabbala().getGates(),d.getQabbala().getGates());
  assert.equal(z.consolidated,false);
  assert.equal(a.lastTransition.to,z.result.lastTransition.to);
 }
 assert.equal(d.getCurrentZone(),1);
 console.log('AM5_UNIT_3_CANONICAL_TRAIT_EVOLUTION_AND_MATCHED_EXITS_PASS');
}
// 4 D3: independently seeded deterministic fixture draws; no D3 cohort.
// E2 outside for 24 consecutive steps, then redraw on 24, not 23;
// no new redraw during 24-step refractory; next possible at 49.
{
 const a=new AM5SecondOrderMonitor();
 const draw=am5FixtureDeterministicDraw(7);
 const changes:any[]=[];
 for(let step=1;step<=49;step++){
  const result=a.observe(step,null,0.70,AM5_CANONICAL_WEIGHTS,draw);
  if(result.redraw)changes.push({step,weights:result.weights});
 }
 assert.deepEqual(changes.map(x=>x.step),[24,49]);
 const b=new AM5SecondOrderMonitor(),draw2=am5FixtureDeterministicDraw(7);
 const second:any[]=[];
 for(let step=1;step<=49;step++){
  const out=b.observe(step,null,0.70,AM5_CANONICAL_WEIGHTS,draw2);
  if(out.redraw)second.push({step,weights:out.weights});
 }
 assert.deepEqual(second,changes);
 for(const row of changes){
  const w=row.weights;
  assert(w.w_bias>=0&&w.w_bias<=0.8);
  assert(w.w_act>=0&&w.w_act<=0.4);
  assert(w.w_phase>=0&&w.w_phase<=0.2);
  assert(w.w_input>=0&&w.w_input<=0.7);
  assert.equal(w.w_V,0.5);
 }
 const early=new AM5SecondOrderMonitor();
 for(let t=1;t<=23;t++)assert.equal(early.observe(t,null,0.7,AM5_CANONICAL_WEIGHTS,()=>0.5).redraw,false);
 // Independent E1 alone requires 24 assessments, and cannot start until step48.
 const e=new AM5SecondOrderMonitor();
 for(let t=1;t<71;t++)assert.equal(e.observe(t,t<48?null:2,0.28,AM5_CANONICAL_WEIGHTS,()=>0.5).redraw,false);
 assert.equal(e.observe(71,2,0.28,AM5_CANONICAL_WEIGHTS,()=>0.5).redraw,true);
 console.log('AM5_UNIT_4_D3_24_BAD_STREAK_REFRACTORY_REPLAY_PASS',JSON.stringify(changes));
}
// 5 D4 homeostat exact ±0.01; lower and upper damping clamps.
{
 const rt=new AmeliaNumogramSubstrateRuntime();
 close(am5HomeostatStep(rt,0.13),0.89);
 close(am5HomeostatStep(rt,0.70),0.88);
 close(am5HomeostatStep(rt,0.40),0.88);
 rt.setMomentumDamping(0.99);
 close(am5HomeostatStep(rt,0.11),0.99);
 rt.setMomentumDamping(0.45);
 close(am5HomeostatStep(rt,0.80),0.45);
 console.log('AM5_UNIT_5_D4_HOMEOSTAT_STEP_AND_BOUNDS_PASS');
}
// 6 Y identical o″ partner by t, independent of own trajectory; zero only
// AFTER partner absorption (t 3 and later), never invent missing pre-absorb.
{
 const partner={0:0.273,1:0,2:-1};
 assert.equal(am5YokedOutcomeAt(0,partner,3),0.273);
 assert.equal(am5YokedOutcomeAt(1,partner,3),0);
 assert.equal(am5YokedOutcomeAt(2,partner,3),-1);
 assert.equal(am5YokedOutcomeAt(3,partner,3),0);
 assert.equal(am5YokedOutcomeAt(4,partner,3),0);
 assert.throws(()=>am5YokedOutcomeAt(1,{0:1},3),/UNRESOLVED/);
 console.log('AM5_UNIT_6_Y_STEP_INDEXED_PARTNER_AND_POSTDEATH_ZERO_PASS');
}
console.log('AM5_ALL_SIX_CONSTRUCTED_UNIT_TESTS_PASS_D2_GATE');
