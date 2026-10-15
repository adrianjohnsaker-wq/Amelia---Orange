/**
 * PCI-1 registered prospective specificity protocol.
 * Predictions: experiments/pci1/registration.json, committed before EXECUTE gate.
 * This runner DOES NOT update, choose or optimize the registered hypotheses.
 * Counts all 12 deterministic conditioning tapes. Scientific failures are
 * recorded as negative verdicts (not hidden as CI errors).
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { AmeliaNumogramSubstrateRuntime } from '../substrate/ameliaNumogramSubstrateRuntime';
import { initMorphogeneticState, stepAmeliaSubstrate } from '../substrate/AmeliaMorphogeneticSubstrate';
import { canonicalSha256 } from '../lib/sha256';

type Arm = AmeliaNumogramSubstrateRuntime;
type Prediction = {
  id: string; metric: string; direction: '>' | '<='; threshold: number;
  unit: string; requiredPairs: number;
};
type Registration = {
  protocol:string; version:string; deterministicConditioningTapes:number[];
  conditioning: {steps:string; input:string; type:string};
  pairing: {perturbation:{fluxDelta:number;phaseCoherence:number;strainRelaxation:number},
    sham:{fluxDelta:number;phaseCoherence:number;strainRelaxation:number},
    observationSteps:number;
    fieldProbe:{width:number;height:number;preset:string;noiseAmp:number;observationSteps:number}};
  predictions:Prediction[];
};
function sha(b:string):string { return createHash('sha256').update(b).digest('hex'); }
function zones(rt:Arm) { return rt.getQabbala().getZones(); }
function getAct(rt:Arm,z:number) { return zones(rt)[z as keyof ReturnType<typeof zones>].activation; }
function activationDifference(a:Arm,b:Arm):number {
  return Array.from({length:10},(_,z)=>Math.abs(getAct(a,z)-getAct(b,z))).reduce((x,y)=>x+y,0);
}
function maxActivationDifference(a:Arm,b:Arm):number {
  return Math.max(...Array.from({length:10},(_,z)=>Math.abs(getAct(a,z)-getAct(b,z))));
}
function clone(state:Record<string,unknown>):Arm {
  const rt=new AmeliaNumogramSubstrateRuntime();
  rt.importState(JSON.parse(JSON.stringify(state)));
  return rt;
}
function reset(state:Record<string,unknown>):Arm {
  const rt=clone(state);
  rt.getMemory().reset();
  return rt;
}
function inject(rt:Arm,zone:number,params:{fluxDelta:number;phaseCoherence:number;strainRelaxation:number},label:string) {
  const before=rt.getSnapshots().at(-1)?.step ?? 0;
  const eventBody={protocol:'PCI-1',label, step:before, zone,
    fluxDelta:params.fluxDelta,phaseCoherence:params.phaseCoherence,
    strainRelaxation:params.strainRelaxation};
  rt.getMemory().append({
    blockIndex: before,depth:before,targetZone:zone,
    fluxDelta:params.fluxDelta,phaseCoherence:params.phaseCoherence,
    strainRelaxation:params.strainRelaxation,seed:0,
    eventDigest:canonicalSha256(JSON.stringify(eventBody)),timestamp:before,
    kind:'OTHER',fromZone:rt.getCurrentZone()
  });
}
function stateIdentity(rt:Arm) {
  return {
    step:rt.getSnapshots().at(-1)?.step ?? 0,
    zones:rt.getQabbala().getZones(),
    gates:rt.getQabbala().getGates(),
    governor:rt.getGovernorKernel().exportState(),
    currentZone:rt.getCurrentZone()
  };
}
function meanBDifference(a:ReturnType<typeof stepAmeliaSubstrate>,b:ReturnType<typeof stepAmeliaSubstrate>):number {
  assert.equal(a.cells.length,b.cells.length);
  return a.cells.reduce((sum,c,i)=>sum+Math.abs(c.B-b.cells[i].B),0)/a.cells.length;
}
function record(seed:number, reg:Registration) {
  const base=new AmeliaNumogramSubstrateRuntime();
  const precondition=12+(seed%7);
  for(let i=0;i<precondition;i++) base.step('PCI1-HISTORY-'+seed+'-'+(i%5));
  const baselineState=JSON.parse(JSON.stringify(base.exportState())) as Record<string,unknown>;
  const basePresentDigest=sha(JSON.stringify(stateIdentity(base)));
  const retain=clone(baselineState),nullMemory=reset(baselineState);
  const h9=reset(baselineState),h0=reset(baselineState);
  const sham=reset(baselineState),neutral=reset(baselineState);
  const all=[retain,nullMemory,h9,h0,sham,neutral];
  for(const rt of all) {
    assert.equal(sha(JSON.stringify(stateIdentity(rt))),basePresentDigest,
      'PRE-CHALLENGE PRESENT STATE mismatch for tape '+seed);
  }
  assert.equal(retain.getMemory().getEvents().length,precondition);
  assert.equal(nullMemory.getMemory().getEvents().length,0);
  inject(h9,9,reg.pairing.perturbation,'H9');
  inject(h0,0,reg.pairing.perturbation,'H0');
  inject(sham,9,reg.pairing.sham,'SHAM');
  const firstR=retain.step(), firstM=nullMemory.step();
  const p1=activationDifference(retain,nullMemory);
  const firstH9=h9.step(),firstH0=h0.step();
  const p2=firstH9.zones[9].activation-firstH0.zones[9].activation;
  const p3=firstH0.zones[0].activation-firstH9.zones[0].activation;
  sham.step();neutral.step();
  const p4=maxActivationDifference(sham,neutral);
  // Downstream morphological specificity: same initial field, different PFM.
  const fieldH9=reset(baselineState),fieldH0=reset(baselineState);
  inject(fieldH9,9,reg.pairing.perturbation,'H9');
  inject(fieldH0,0,reg.pairing.perturbation,'H0');
  const setup=reg.pairing.fieldProbe;
  assert.equal(setup.observationSteps,1);
  assert.equal(setup.preset,'SYZYGETIC_GRID');
  const a=initMorphogeneticState(setup.width,setup.height,'SYZYGETIC_GRID',seed,setup.noiseAmp,undefined,fieldH9);
  const b=initMorphogeneticState(setup.width,setup.height,'SYZYGETIC_GRID',seed,setup.noiseAmp,undefined,fieldH0);
  assert.equal(sha(JSON.stringify(a.cells)),sha(JSON.stringify(b.cells)),
    'FIELD INITIALIZATION mismatch for tape '+seed);
  const afterA=stepAmeliaSubstrate(a),afterB=stepAmeliaSubstrate(b);
  const p5=meanBDifference(afterA,afterB);
  for(let i=1;i<reg.pairing.observationSteps;i++) {
    retain.step();nullMemory.step();
  }
  const longDistance=activationDifference(retain,nullMemory);
  const eventsRetained=retain.getMemory().getEvents();
  const firstInputDigest=base.getMemory().getEvents()[0]?.inputDigest;
  assert(firstInputDigest && firstInputDigest.length===64,
    'Endogenous PFM did not record numeric intervention tape');
  return {
    tape:seed, conditioningSteps:precondition, presentStateDigest:basePresentDigest,
    prechallenge:{samePresent:true, retainedEvents:precondition,resetEvents:0,
      retainedMemoryHead:base.getMemory().exportHistoryDigest()},
    outcomes:{P1:p1,P2:p2,P3:p3,P4:p4,P5:p5},
    exploratory:{activationDifferenceAtStep8:longDistance,
      discreteExitRetainFirst:firstR.lastTransition?.to,
      discreteExitResetFirst:firstM.lastTransition?.to,
      discreteExitRetainLast:retain.getLastTransition()?.to,
      discreteExitResetLast:nullMemory.getLastTransition()?.to,
      memoryHeadRetainedAfter8:retain.getMemory().exportHistoryDigest(),
      memoryHeadResetAfter8:nullMemory.getMemory().exportHistoryDigest(),
      finalRetainedEventCount:eventsRetained.length,
      fieldAEntropy:afterA.entropy,fieldBEntropy:afterB.entropy,
      fieldAEventCount:fieldH9.getMemory().getEvents().length,
      fieldBEventCount:fieldH0.getMemory().getEvents().length},
    firstStep:{retainGovernor:firstR.governor,resetGovernor:firstM.governor,
      H9Transition:firstH9.lastTransition,H0Transition:firstH0.lastTransition}
  };
}
function evaluate(predictions:Prediction[], pairs:ReturnType<typeof record>[]) {
  assert.deepEqual(predictions.map(x=>x.id),['P1','P2','P3','P4','P5']);
  return predictions.map(p=>{
    const measures=pairs.map(pair=>({tape:pair.tape,value:pair.outcomes[p.id as keyof typeof pair.outcomes]}));
    const pairVerdicts=measures.map(m=>({ ...m, meets: p.direction==='>' ?
      m.value>p.threshold : m.value<=p.threshold }));
    return {
      id:p.id,metric:p.metric,direction:p.direction,threshold:p.threshold,
      requiredPairs:p.requiredPairs,observedPairs:pairVerdicts.length,
      passedPairs:pairVerdicts.filter(m=>m.meets).length,
      minimum:Math.min(...measures.map(m=>m.value)),
      maximum:Math.max(...measures.map(m=>m.value)),
      allPairsPass:pairVerdicts.length===p.requiredPairs && pairVerdicts.every(m=>m.meets),
      pairVerdicts
    };
  });
}
function main() {
  const args=process.argv;
  const outFlag=args.indexOf('--out');
  const outDir=outFlag>=0 ? args[outFlag+1] : 'pci1-results/primary';
  if(!outDir || outDir.startsWith('--')) throw new Error('Missing --out directory');
  const registrationPath='experiments/pci1/registration.json';
  const bytes=readFileSync(registrationPath,'utf8');
  const reg=JSON.parse(bytes) as Registration;
  assert.equal(reg.protocol,'PCI-1');
  assert.equal(reg.version,'1.0.0');
  assert.equal(reg.deterministicConditioningTapes.length,12);
  assert.equal(reg.pairing.observationSteps,8);
  assert.equal(reg.predictions.length,5);
  const pairs=reg.deterministicConditioningTapes.map(seed=>record(seed,reg));
  const verdicts=evaluate(reg.predictions,pairs);
  const supported=verdicts.every(v=>v.allPairsPass);
  mkdirSync(outDir,{recursive:true});
  const raw=pairs.map(p=>JSON.stringify(p)).join('\n')+'\n';
  const verdictDoc={
    protocol:'PCI-1', registrationSha256:sha(bytes),
    preregisteredPairs:pairs.length, verdict:supported?'SUPPORTED':'NOT_SUPPORTED',
    analysis:'All-pairs directional decision. No inferential p-values or optional stopping.',
    predictions:verdicts
  };
  const provenance={
    protocol:'PCI-1',registrationPath,registrationSha256:sha(bytes),
    sourceCommit:process.env.GITHUB_SHA??'LOCAL_UNSEALED',
    runId:process.env.GITHUB_RUN_ID??'LOCAL_UNSEALED',
    runAttempt:process.env.GITHUB_RUN_ATTEMPT??'1',
    recordedAt:new Date().toISOString(),
    rawSha256:sha(raw),verdictSha256:sha(JSON.stringify(verdictDoc,null,2)+'\n'),
    software:['src/substrate/ameliaNumogramSubstrateRuntime.ts',
      'src/substrate/AmeliaMorphogeneticSubstrate.ts',
      'src/substrate/IntegratedMemorySystem.ts',
      'src/substrate/TraitEvolution.ts'],
    registrationConstraint:'Outcome workflow triggered in separate commit after prediction registration; source at execution SHA.'
  };
  writeFileSync(join(outDir,'registration_copy.json'),bytes);
  writeFileSync(join(outDir,'raw_pairs.jsonl'),raw);
  writeFileSync(join(outDir,'prediction_verdicts.json'),JSON.stringify(verdictDoc,null,2)+'\n');
  writeFileSync(join(outDir,'provenance.json'),JSON.stringify(provenance,null,2)+'\n');
  const lines=[
    '# PCI-1 Prospective Causal Incorporation',
    '',
    'Registration SHA-256: '+sha(bytes),
    'Source revision: '+provenance.sourceCommit,
    '',
    '**Outcome: '+verdictDoc.verdict+'** (precommitted, all 12 deterministic tapes).',
    '',
    '| Hypothesis | All-pairs success | Minimum | Maximum |',
    '|---|---:|---:|---:|',
    ...verdicts.map(v=>'| '+v.id+' | '+v.passedPairs+'/'+v.requiredPairs+' | '+
      v.minimum.toPrecision(7)+' | '+v.maximum.toPrecision(7)+' |'),
    '',
    'Interpretation: activation/field specificity in this software substrate only.',
    'The runs are 12 deterministic conditioning tapes, not independent random samples.',
    'Observed condition effects do not demonstrate consciousness, genuine autonomy, or access to the Outside.',
    'The baseline exploratory discovery in earlier 2026-10-15 tests is declared in the registration.',
    'All code, registration, raw individual measurements and checksums must be retained to audit the verdict.',
    ''
  ];
  writeFileSync(join(outDir,'report.md'),lines.join('\n'));
  const files=['registration_copy.json','raw_pairs.jsonl','prediction_verdicts.json','provenance.json','report.md'];
  writeFileSync(join(outDir,'SHA256SUMS.txt'),files.map(f=>
    sha(readFileSync(join(outDir,f),'utf8'))+'  '+f).join('\n')+'\n');
  console.log(JSON.stringify({protocol:'PCI-1',source:provenance.sourceCommit,
    registrationSha256:provenance.registrationSha256,
    verdict:verdictDoc.verdict,pairs:pairs.length,
    predictions:verdicts.map(v=>({id:v.id,passed:v.passedPairs,
      total:v.requiredPairs,min:v.minimum,max:v.maximum}))},null,2));
}
try { main(); } catch(e) { console.error('PCI-1 INSTRUMENTATION FAILURE',e); process.exitCode=1; }
