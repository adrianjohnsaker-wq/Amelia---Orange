/**
 * Exploratory post-recovery calibration and whole-PFM intervention.
 * Reads one pinned checkpoint and a pre-created plan. It never writes to live data.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { OutsideRecoveryRuntime } from '../../src/outside/OutsideRecoveryRuntime.ts';
import { fullNumogramGates } from '../../src/core/fullNumogram.ts';

const [statePath, planPath, outputDir] = process.argv.slice(2);
if (!statePath || !planPath || !outputDir) throw Error('Usage: node --import tsx adaptive-calibration.ts STATE PLAN EMPTY_OUTPUT_DIR');
const H = (x: string | Buffer) => createHash('sha256').update(x).digest('hex');
const raw = readFileSync(statePath);
assert.equal(H(raw), 'c4329e0c5406d131e0dab3b9883774dc3c169b5701f663ec383a7eb767880ba3', 'Wrong saved state');
const saved = JSON.parse(raw.toString()).runtimeState;
const plan = JSON.parse(readFileSync(planPath, 'utf8'));
assert.equal(plan.schema, 'amelia.warp-recovery-calibration/v1');
assert.equal(plan.checkpointSha256, H(raw));
if (plan.scriptSha256) assert.equal(plan.scriptSha256,H(readFileSync(process.argv[1])),'Wrong calibration script');
const weights: number[] = plan.weights;
assert.deepEqual(weights, [0.235,0.185,0.145,0.115,0.095,0.075,0.055,0.045,0.03,0.02]);
assert.ok(Array.isArray(plan.histories) && plan.histories.length > 0 && plan.histories.length <= 16);
assert.ok(Number.isInteger(plan.exposureSteps) && plan.exposureSteps > 0 && plan.exposureSteps <= 64);
assert.ok(Number.isInteger(plan.followSteps) && plan.followSteps > 0 && plan.followSteps <= 48);
assert.ok(Number.isInteger(plan.burnInSteps) && plan.burnInSteps > 0 && plan.burnInSteps <= 32);
mkdirSync(outputDir, {recursive:false});
const tracePath = join(outputDir, 'trace.jsonl');
const traceRecords:string[] = [];
const trace = (row: unknown) => traceRecords.push(JSON.stringify(row) + '\n');
const clone = <T>(x:T):T => structuredClone(x);
const vector = (target:number) => Array.from({length:10}, (_,i) => Number(i===target));
const offer = (id:string, v:number[]) => ({eventId:id, channel:'SYNTHETIC_FIELD' as const,
  sourceDigest:H(id), attentionVector:[...v]});
const rand = (seed:string, label:string, t:number, modulo:number) =>
  parseInt(H(`${seed}:${label}:${t}`).slice(0,8),16) % modulo;

/** Same ten adaptive-source weights in both arms, with zones 3 and 6 swapped. */
function profiles(seed:string, t:number): {target3:number[];target6:number[]} {
  const hi = 3, lo = 6; // adaptive source uses 0.115 versus 0.055
  const rest = weights.map((w,i) => ({w,i})).filter(x=>x.i!==hi && x.i!==lo);
  for (let i=rest.length-1;i>0;i--) {
    const j=rand(seed,`shuffle-${i}`,t,i+1); [rest[i],rest[j]]=[rest[j],rest[i]];
  }
  const a = Array<number>(10).fill(0); a[3]=weights[hi]; a[6]=weights[lo];
  [0,1,2,4,5,7,8,9].forEach((z,i)=>a[z]=rest[i].w);
  const b = [...a]; [b[3],b[6]]=[b[6],b[3]];
  assert.equal(a.reduce((x,y)=>x+y,0).toFixed(6),'1.000000');
  assert.deepEqual([...a].sort((x,y)=>x-y), [...weights].sort((x,y)=>x-y));
  return {target3:a,target6:b};
}
function fromState(state:any):OutsideRecoveryRuntime {
  const r = new OutsideRecoveryRuntime(); r.importState(clone(state)); return r;
}

// A clearly documented strong two-offer intervention places the preserved
// live-derived state in the Warp before adaptive-strength testing starts.
const augmented = clone(saved);
assert.equal(augmented.currentZone,1);
assert.equal(augmented.deferredEncounters.length,0);
augmented.qabbalaGates=fullNumogramGates(augmented.qabbalaGates);
const entry = fromState(augmented);
for(const [i,z] of [2,3].entries()) {
  const s=entry.step(undefined,offer(`warp-calibration-entry-${i+1}`,vector(z)));
  assert.equal(s.encounterDecisions?.find(d=>d.eventId===`warp-calibration-entry-${i+1}`)?.disposition,'ATTEND');
  assert.deepEqual([s.lastTransition?.from,s.lastTransition?.to],i===0?[1,2]:[2,3]);
}
const founder=entry.exportState() as any;
assert.equal(founder.currentZone,3);
assert.equal(founder.qabbalaGates.length,29);
assert.equal(founder.deferredEncounters.length,0);

function score(r:OutsideRecoveryRuntime, snapshot:any) {
  const from=snapshot.lastTransition.from;
  const admitted=snapshot.encounterDecisions.find((d:any)=>d.disposition==='ATTEND'&&d.applied);
  const bias=r.getMemoryConsumptionLog().at(-1)?.appliedBiasVector;
  assert.ok(bias);
  const zones=r.getQabbala().getZones();
  const candidates=r.getQabbala().getGates().filter(g=>g.isOpen&&g.source===from).map(g=>{
    const z=zones[g.target];
    const gate=g.flux*(1-g.resistance),memory=(bias[g.target]||0)*0.4,
      activation=z.activation*0.2,phase=Math.cos(z.phaseAngle)*0.1,
      attention=(admitted?.attentionVector[g.target]??0)*0.9;
    return {id:g.id,target:g.target,gate,memory,activation,phase,attention,
      without:gate+memory+activation+phase,with:gate+memory+activation+phase+attention};
  });
  if(!candidates.length) return {admitted,candidates,without:from,with:from};
  const win=(key:'without'|'with')=>candidates.reduce((best,x)=>x[key]>best[key]?x:best).target;
  assert.equal(win('with'),snapshot.lastTransition.to,'Score reconstruction disagrees with native winner');
  return {admitted,candidates,without:win('without'),with:win('with')};
}

/** Replay one admission from the same pre-step state using uniform attention.
 * Its constant score contribution preserves the no-attention gate ordering. */
function verifyWithout(prior:any, present:any, admitted:any, expected:number) {
  const state=clone(prior); const current=present?clone(present):undefined;
  const q=state.deferredEncounters as any[];
  const queued=q.find(x=>x.eventId===admitted.eventId);
  if(queued) queued.attentionVector=Array(10).fill(0.1);
  else { assert.equal(current?.eventId,admitted.eventId); current.attentionVector=Array(10).fill(0.1); }
  const r=fromState(state); const snap=r.step(undefined,current);
  assert.equal(snap.lastTransition?.to,expected,'Uniform-vector replay disagrees with no-attention scoring');
}

function runExposure(h:any, mode:'drained'|'queued', arm:'target3'|'target6', prepared:any) {
  const state=clone(prepared);
  // Stress the delayed path without falsifying a past offer: this seed is
  // expressly preloaded as an intervention, not counted as an offered item.
  const seedId=`preloaded-${h.id}-${mode}`;
  if(mode==='queued') state.deferredEncounters=[offer(seedId,Array(10).fill(0.1))];
  const r=fromState(state); const originalOfferStep=new Map<string,number>();
  let admitted=0,delayed=0,pivotal=0,refused=0,deferred=0,checks=0;
  const delayValues:number[]=[];
  function tick(current?:ReturnType<typeof offer>) {
    const prior=checks<2?r.exportState():undefined;
    const snap=r.step(undefined,current) as any;
    if(current) {
      originalOfferStep.set(current.eventId,snap.step);
      const d=snap.encounterDecisions.find((x:any)=>x.eventId===current.eventId);
      assert.ok(d,'Offer lacks decision');
      if(d.disposition==='REFUSE')refused++;
      if(d.disposition==='DEFER')deferred++;
    }
    const s=score(r,snap); const a=s.admitted;
    let lag:number|null=null, isPivotal=false;
    if(a && a.eventId!==seedId) {
      assert.ok(originalOfferStep.has(a.eventId),'Admission lacks original offer time');
      lag=snap.step-originalOfferStep.get(a.eventId)!;
      assert.ok(lag>=0); delayValues.push(lag); admitted++; if(lag>0)delayed++;
      isPivotal=s.with!==s.without; if(isPivotal)pivotal++;
      if(checks<2) { verifyWithout(prior,current,a,s.without); checks++; }
    }
    trace({kind:'step',history:h.id,mode,arm,step:snap.step,offered:current??null,
      decisions:snap.encounterDecisions,admittedOriginalStep:a&&a.eventId!==seedId?originalOfferStep.get(a.eventId):null,
      lag,from:snap.lastTransition.from,to:snap.lastTransition.to,withoutAttention:s.without,
      pivotal:isPivotal,governorTension:snap.governor.deformationFieldTension,
      queueLength:r.getDeferredInputs().length,candidates:s.candidates});
  }
  for(let t=0;t<plan.exposureSteps;t++) {
    // The live collector drains before making a new offer. Queued mode is an
    // intentional stress intervention testing delayed-admission bookkeeping.
    if(mode==='drained') { let n=0; while(r.getDeferredInputs().length) { tick(); if(++n>512)throw Error('Drain failed'); } }
    const p=profiles(h.seed,t);
    tick(offer(`plant-${h.id}-${mode}-${arm}-${t+1}`,p[arm]));
  }
  let n=0;while(r.getDeferredInputs().length){tick();if(++n>512)throw Error('Final drain failed');}
  assert.equal(refused,0);assert.equal(admitted,plan.exposureSteps);
  assert.equal(checks,2);
  const final=r.exportState() as any;
  assert.equal(final.governorState.hardLimitViolations,saved.governorState.hardLimitViolations);
  return {state:final,summary:{offered:plan.exposureSteps,admitted,deferred,refused,delayed,pivotal,
    delayValues,checks,finalZone:final.currentZone,finalStep:final.stepCount,
    memorySha256:H(JSON.stringify(final.memoryState))}};
}
function follow(background:any, memory:any, h:any, mode:string, label:string) {
  const s=clone(background);s.memoryState=clone(memory);
  const stripped=(x:any)=>{const y=clone(x);delete y.memoryState;return H(JSON.stringify(y));};
  assert.equal(stripped(s),stripped(background),'A non-memory component changed during swap');
  const r=fromState(s);const targets:number[]=[];let dwell3=0,cross36=0;
  for(let t=0;t<plan.followSteps;t++) {
    const snap=r.step() as any;const from=snap.lastTransition.from,to=snap.lastTransition.to;
    targets.push(to);if(from===3&&to===3)dwell3++;if(from===3&&to===6)cross36++;
  }
  return {label,targets,dwell3,cross36,finalQueue:r.getDeferredInputs().length,
    violations:r.getGovernor().hardLimitViolationCount};
}

function prepareHistory(h:any) {
  const r=fromState(founder); let steps=0;
  for(let t=0;t<plan.burnInSteps;t++) {
    const p=profiles(h.seed,1000+t);
    const arm=rand(h.seed,'burn-direction',t,2)===0?'target3':'target6';
    const current=offer(`burn-${h.id}-${t+1}`,p[arm]);
    let s=r.step(undefined,current) as any; let scored=score(r,s); steps++;
    trace({kind:'burn-in',history:h.id,step:s.step,offered:current,decisions:s.encounterDecisions,
      from:s.lastTransition.from,to:s.lastTransition.to,withoutAttention:scored.without,candidates:scored.candidates});
    let drain=0;
    while(r.getDeferredInputs().length){
      s=r.step() as any; scored=score(r,s); steps++;
      trace({kind:'burn-in',history:h.id,step:s.step,offered:null,decisions:s.encounterDecisions,
        from:s.lastTransition.from,to:s.lastTransition.to,withoutAttention:scored.without,candidates:scored.candidates});
      if(++drain>512)throw Error('Burn-in drain failed');
    }
  }
  const state=r.exportState() as any;
  return {state,summary:{steps,zone:state.currentZone,memorySha256:H(JSON.stringify(state.memoryState))}};
}

const result:any={schema:'amelia.warp-recovery-calibration-result/v1',status:'COMPLETE',
  checkpointSha256:H(raw),planSha256:H(readFileSync(planPath)),
  founder:{step:founder.stepCount,zone:founder.currentZone,gates:founder.qabbalaGates.length,
    memorySha256:H(JSON.stringify(founder.memoryState)),entry:'strong offers 2 then 3'},histories:[]};
for(const h of plan.histories){
  const prepared=prepareHistory(h);
  const record:any={id:h.id,seed:h.seed,burnIn:prepared.summary,modes:{}};
  for(const mode of ['drained','queued'] as const){
    const runs:any={};for(const arm of h.executionOrder)runs[arm]=runExposure(h,mode,arm,prepared.state);
    const a=runs.target3.state,b=runs.target6.state;
    const aa=follow(a,a.memoryState,h,mode,'background3-memory3');
    const ab=follow(a,b.memoryState,h,mode,'background3-memory6');
    const ba=follow(b,a.memoryState,h,mode,'background6-memory3');
    const bb=follow(b,b.memoryState,h,mode,'background6-memory6');
    for(const x of [aa,ab,ba,bb]){assert.equal(x.finalQueue,0);assert.equal(x.violations,saved.governorState.hardLimitViolations);}
    const dif=(x:any,y:any)=>x.targets.filter((z:number,i:number)=>z!==y.targets[i]).length;
    record.modes[mode]={target3:runs.target3.summary,target6:runs.target6.summary,
      follow:{aa,ab,ba,bb},contrasts:{background3ChangedSteps:dif(aa,ab),background6ChangedSteps:dif(ba,bb),
        background3Dwell3Difference:aa.dwell3-ab.dwell3,background6Dwell3Difference:ba.dwell3-bb.dwell3}};
  }
  result.histories.push(record);
  console.log(`Completed history ${h.id}/${plan.histories.length}`);
}
const traceBytes=Buffer.from(traceRecords.join(''));
writeFileSync(tracePath,traceBytes);
result.traceSha256=H(traceBytes);
result.scriptSha256=H(readFileSync(process.argv[1]));
writeFileSync(join(outputDir,'result.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,histories:result.histories.length,traceSha256:result.traceSha256}));
