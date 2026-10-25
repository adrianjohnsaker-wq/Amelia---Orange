/**
 * Studio 08 E0b: a deliberately "tainted" readout negative control.
 * SYNTHETIC QA ONLY. No learner-house, no new science, no beacon fetching.
 *
 * The frozen runtime's input-digest is archival when +0.35 is off, BUT its
 * PFM eventDigest includes input metadata. A NEW self-cue which hashes
 * PFM.exportHistoryDigest() therefore turns that archival difference back
 * into an operative cue. This test contrasts that bad readout with a
 * zone-trajectory-only projection at the same full-state fork.
 *
 * Both readouts are computed before the next choice, never using future input.
 * No assumption is made that Studio 07 used either serialization.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {AmeliaNumogramSubstrateRuntime as Original} from '../../studio/runtime_mirror/substrate/ameliaNumogramSubstrateRuntime.ts';
import {AmeliaNumogramSubstrateRuntime as Mirror} from '../runtime_mirror/substrate/ameliaNumogramSubstrateRuntime.ts';

const sha=x=>createHash('sha256').update(x).digest('hex');
const hashZone = s => parseInt(sha(s).slice(0,8),16)%10;
function sensitiveCue(runtime) {
  return hashZone(runtime.getMemory().computeMemoryDigest());
}
function projectedCue(runtime) {
  const events=runtime.getMemory().getEvents();
  const last24=events.slice(-24).map(ev=>ev.targetZone);
  return hashZone(JSON.stringify(last24));
}
function sourceCausalState(runtime) {
  const snap=runtime.exportState();
  delete snap.snapshots;   // telemetry wall-clock
  delete snap.lastTransition; // input-dependent event hash
  snap.memoryState.events=snap.memoryState.events.map(ev=>{
    const {inputDigest,inputZone,eventDigest,...operative}=ev;
    return operative;
  });
  return snap;
}
const source=new Original();
for(let i=0;i<32;i++) source.step(sha('STUDIO08-TAINTED-PREFIX|'+i));
const checkpoint=source.exportState();
const forks=Array.from({length:3},()=>new Mirror());
for(const f of forks){f.importState(checkpoint);f.inputCueEnabled=false}
let sensitiveChanges=0, safeChanges=0, transitions=0;
for(let step=0;step<128;step++){
  // These are exactly the state available BEFORE the next choice.
  const sensitive=forks.map(sensitiveCue);
  const projected=forks.map(projectedCue);
  if(sensitive.some(x=>x!==sensitive[0])) sensitiveChanges++;
  if(projected.some(x=>x!==projected[0])) safeChanges++;
  assert(projected.every(x=>x===projected[0]),
    'zone-history-only cue changed under irrelevant input history');
  const input=[sha('STUDIO08-TAINTED-VARY|'+step),'STUDIO08-FIXED',undefined];
  const next=forks.map((f,k)=>f.step(input[k]).lastTransition.to);
  assert(next.every(z=>z===next[0]));
  assert.deepEqual(sourceCausalState(forks[0]),sourceCausalState(forks[1]));
  assert.deepEqual(sourceCausalState(forks[0]),sourceCausalState(forks[2]));
  transitions++;
}
assert(sensitiveChanges>=100,'tainted readout unexpectedly invariant');
assert.equal(safeChanges,0);
assert.equal(transitions,128);
console.log(JSON.stringify({
 schema:'STUDIO08_INPUT_METADATA_HASH_NEGATIVE_CONTROL_V1',
 status:'PASS_SYNTHETIC_SOURCE_LEAKAGE_QA_NOT_STUDIO_OUTCOME',
 matchedFullStateFork:32, pairedTicks:transitions,
 preChoiceReadoutDifferences:{
  hashesOfInputBearingPFM:sensitiveChanges,
  hashesOfTrajectoryZoneProjection:safeChanges
 },
 implication:'An input-bearing memory digest can produce source-dependent self-cues even when cue-disabled operative substrate states match',
 noStoneTapeHouse:true, noVerifiedBeaconRead:true, noScientificAgencyClaim:true
}));
