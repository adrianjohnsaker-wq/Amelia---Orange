/**
 * Studio 08 E0 checkpoint/fork rehearsal, synthetic fixtures only.
 *
 * Non-scientific preflight. The original runtime's *entire* exported state
 * is staged before branching, then imported into three isolated copies.
 * Direct input cue is switched OFF after each import. We assert the CAUSALLY
 * RELEVANT evolution is exactly invariant to varying vs constant vs absent
 * new input for 128 matched steps.
 *
 * IMPORTANT: Event inputDigest, inputZone and eventDigest continue to differ.
 * Such differences MUST NOT be ignored if a *new* self-hash reads them.
 * Not a substitute for the Studio 07 self-cue original runner.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {AmeliaNumogramSubstrateRuntime as Original} from '../../studio/runtime_mirror/substrate/ameliaNumogramSubstrateRuntime.ts';
import {AmeliaNumogramSubstrateRuntime as TestMirror} from '../runtime_mirror/substrate/ameliaNumogramSubstrateRuntime.ts';

const h=s=>createHash('sha256').update(s).digest('hex');
function causalSnapshot(runtime) {
  const s=runtime.exportState();
  delete s.snapshots; // Date.now telemetry; do NOT claim bitwise entire export.
  delete s.lastTransition; // digest includes inputDigest inputZone
  s.memoryState.events=s.memoryState.events.map(x=>{
    const {inputDigest,inputZone,eventDigest,...rest}=x;
    return rest;
  });
  return s;
}
const source=new Original();
for(let tick=0;tick<64;tick++) source.step(h('STUDIO08-SYNTHETIC-PREFIX|'+tick));
const fullState=source.exportState();
assert.equal(fullState.stepCount,64);
const forks=Array.from({length:3},()=>new TestMirror());
for(const f of forks) {
  f.importState(fullState);
  f.inputCueEnabled=false;
}
assert.deepEqual(forks[0].exportState(),forks[1].exportState());
assert.deepEqual(forks[0].exportState(),forks[2].exportState());

let divergingMetadata=0;
for(let tick=0;tick<128;tick++) {
  const vary=h('STUDIO08-SYNTHETIC-FORK|'+tick);
  const inputs=[vary, 'STUDIO08-FIXED-INPUT', undefined];
  const snapshots=forks.map((f,i)=>f.step(inputs[i]));
  assert.equal(snapshots[0].lastTransition.to,snapshots[1].lastTransition.to,
    'incompatible transition after constant input');
  assert.equal(snapshots[0].lastTransition.to,snapshots[2].lastTransition.to,
    'incompatible transition after input absence');
  assert.deepEqual(causalSnapshot(forks[0]),causalSnapshot(forks[1]),
    'causal state varies with archived input metadata, constant fork');
  assert.deepEqual(causalSnapshot(forks[0]),causalSnapshot(forks[2]),
    'causal state varies with archived input metadata, absent fork');
  if(forks[0].getMemory().getEvents().at(-1).eventDigest !==
     forks[1].getMemory().getEvents().at(-1).eventDigest)
       divergingMetadata++;
}
assert.equal(divergingMetadata,128);
console.log(JSON.stringify({
 status:'STUDIO08_FULL_STATE_FORK_PATHWAY_AUDIT_PASS_NOT_SCIENCE',
 syntheticOnly:true, prefixSteps:64, forkSteps:128,
 distinctSourceHistories:3, pairedCausalParitySteps:128,
 metadataDifferenceSteps:divergingMetadata,
 fullStateImportUsed:true, fullStateForkCloned:true,
 originalRuntimeUsedOnlyForReadOnlyReference:true
}));
