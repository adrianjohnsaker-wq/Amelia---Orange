/**
 * Studio08 ENGINEERING ONLY — audit the causal source paths into the frozen runtime.
 * Runs against the original Studio mirror and an isolated byte-identical copy whose
 * only change is inputCueEnabled=true (default) / false (experimental).
 *
 * Synthetic deterministic input strings are QA fixtures, not beacon observations.
 * No Stone Tape house/learner experiment is implemented here.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {AmeliaNumogramSubstrateRuntime as Original} from '../../studio/runtime_mirror/substrate/ameliaNumogramSubstrateRuntime.ts';
import {AmeliaNumogramSubstrateRuntime as Mirrored} from '../runtime_mirror/substrate/ameliaNumogramSubstrateRuntime.ts';

const hash = str => createHash('sha256').update(str).digest('hex');
const constant = 'STUDIO08-INPUT-CONSTANT-V1';
const N = 192;
function observation(x, retainInputMetadata=false) {
  const state = x.exportState();
  // Timestamps in snapshots originate from Date.now(), not from evolution.
  delete state.snapshots;
  if (!retainInputMetadata) {
    // The eventDigest and lastTransition.digest hash the *input label*. That makes
    // them intentionally different between A, B, C, but does not steer choices
    // in this archived runtime. Strip metadata only, not strain or targetZone.
    delete state.lastTransition;
    state.memoryState.events = state.memoryState.events.map(ev => {
      const {inputDigest,inputZone,eventDigest,...causal} = ev;
      return causal;
    });
  }
  return state;
}

const original = new Original();
const mirrorDefault = new Mirrored();
const varied = new Mirrored();
const fixed = new Mirrored();
const absent = new Mirrored();
const cueActive = new Mirrored();
for (const r of [varied,fixed,absent]) r.inputCueEnabled = false;

let cueChangesChoices = 0;
let inputRecordChanges = 0;
let identicalCausalStateSteps = 0;
const paths = {original:[],mirrored:[],varied:[],fixed:[],absent:[],cueActive:[]};

for (let i = 0; i < N; i++) {
  const signal = hash('STUDIO08-NONBEACON-INPUT-FIXTURE|' + i);
  const o = original.step(signal);
  const m = mirrorDefault.step(signal);
  const a = varied.step(signal);
  const b = fixed.step(constant);
  const c = absent.step();
  const d = cueActive.step(signal);
  const to = r => r.lastTransition.to;
  for (const [name,snapshot] of Object.entries({original:o,mirrored:m,varied:a,fixed:b,absent:c,cueActive:d}))
    paths[name].push(to(snapshot));

  assert.equal(to(o),to(m), 'default toggle changed original transition at ' + i);
  assert.deepEqual(observation(original,true),observation(mirrorDefault,true),
    'default-on mirror diverged from original, tick ' + i);
  assert.equal(to(a),to(b), 'varied/constant cue-disabled paths differ at ' + i);
  assert.equal(to(a),to(c), 'varied/absent cue-disabled paths differ at ' + i);
  if (to(a) !== to(d)) cueChangesChoices++;
  const ea=varied.getMemory().getEvents().at(-1);
  const eb=fixed.getMemory().getEvents().at(-1);
  if (ea.inputDigest!==eb.inputDigest) inputRecordChanges++;

  if ((i+1)%16===0) {
    assert.deepEqual(observation(varied),observation(fixed),
      'input changed causal runtime state even with cue-off, tick ' + i);
    assert.deepEqual(observation(varied),observation(absent),
      'absence changed causal runtime state even with cue-off, tick ' + i);
    identicalCausalStateSteps++;
  }
}
assert.equal(inputRecordChanges,N,
  'the input metadata check failed: our test may not exercise the archival path');
assert(cueChangesChoices>0,
  'the synthetic fixture never demonstrated that the original +0.35 cue can matter');
assert.deepEqual(paths.original,paths.mirrored);
assert.deepEqual(paths.varied,paths.fixed);
assert.deepEqual(paths.varied,paths.absent);
const report = {
 schema:'STUDIO08_RUNTIME_PATHWAY_ENGINEERING_AUDIT_V1',
 status:'PASS_ENGINEERING_ONLY_NOT_STONE_TAPE_RESULT',
 parentOriginal:'experiments/studio/runtime_mirror/substrate/ameliaNumogramSubstrateRuntime.ts',
 isolatedMirror:'experiments/studio08/runtime_mirror/substrate/ameliaNumogramSubstrateRuntime.ts',
 steps:N, originalDefaultParitySteps:N,
 disabledDirectCueThreeInputPathParitySteps:N,
 fullCausalStateAuditCheckpoints:identicalCausalStateSteps,
 archivedInputMetadataStillDiffersAtSteps:inputRecordChanges,
 directCueOnVsOffChoiceDivergences:cueChangesChoices,
 syntheticFixtureOnly:true, noLiveBeaconRead:true,
 noPF1PF2C1PF4Mutation:true, noHouseLearnerOutcome:true
};
console.log(JSON.stringify(report));
