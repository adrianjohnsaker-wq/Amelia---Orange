import test from 'node:test';
import assert from 'node:assert/strict';
import { bornAmelia } from '../../src/core/fullNumogram';
import { advanceLiveField, captureLiveField, createLiveField, observeLiveField, restoreLiveField } from '../../src/outside/LiveFieldLoop';

function fresh() {
  const runtime = bornAmelia();
  // A continuing runtime can be older than the newly attached field.
  for (let i = 0; i < 5; i++) runtime.step();
  const body = createLiveField(runtime, {seed:101, depth:256, preset:'SYZYGETIC_GRID', size:12});
  return {runtime, body};
}

test('one actual body step feeds the existing Governor and Numogram and records the encounter', () => {
  const {runtime, body} = fresh();
  const before = runtime.exportState() as any;
  const measured = observeLiveField(body);
  const result = advanceLiveField(body);
  assert.equal(result.state.nativeRuntime, runtime);
  assert.equal(result.state.stepCount, 1);
  assert.equal((runtime.exportState() as any).stepCount, before.stepCount + 1);
  const event = runtime.getMemory().getEvents().at(-1) as any;
  const decision = event.encounters.find((e:any) => e.channel === 'SYNTHETIC_FIELD');
  assert.ok(decision);
  assert.equal(decision.sourceDigest, measured.sourceDigest);
  assert.deepEqual(decision.attentionVector, measured.attentionVector);
  assert.ok(['ATTEND','DEFER','REFUSE'].includes(decision.disposition));
  assert.equal(result.snapshot.lastTransition?.digest, event.eventDigest);
  assert.equal(runtime.getQabbala().getGates().length, 29);
});

test('different current body states produce different field observations in the same runtime context', () => {
  const {body} = fresh();
  const before = observeLiveField(body);
  body.cells[0].B = body.cells[0].B > 0.5 ? 0 : 1;
  const after = observeLiveField(body);
  assert.notEqual(after.sourceDigest, before.sourceDigest);
  assert.notDeepEqual(after.attentionVector, before.attentionVector);
});

test('changing the body changes the Governor-admitted signal and the next memory readout', () => {
  const original = fresh();
  const savedRuntime = JSON.parse(JSON.stringify(original.runtime.exportState()));
  const savedField = captureLiveField(original.body, false);
  const twinRuntime = bornAmelia(); twinRuntime.importState(savedRuntime);
  const twin = restoreLiveField(JSON.parse(JSON.stringify(savedField)), twinRuntime);
  for (let i = 0; i < original.body.cells.length; i++) {
    if (i % original.body.width < 2) {
      original.body.cells[i].B = 0;
      twin.cells[i].B = 1;
    }
  }
  const a = advanceLiveField(original.body), b = advanceLiveField(twin);
  assert.notDeepEqual(a.observation.attentionVector, b.observation.attentionVector);
  assert.equal(a.snapshot.encounterDecisions?.at(-1)?.disposition, 'ATTEND');
  assert.equal(b.snapshot.encounterDecisions?.at(-1)?.disposition, 'ATTEND');
  assert.notDeepEqual(original.runtime.getMemory().readMemoryBias().biasVector, twinRuntime.getMemory().readMemoryBias().biasVector);
});

test('experimental controls preserve the attention dose and a permutation preserves its distribution', () => {
  const original = fresh();
  const savedRuntime = JSON.parse(JSON.stringify(original.runtime.exportState()));
  const savedField = JSON.parse(JSON.stringify(captureLiveField(original.body, false)));
  function twin() {
    const runtime = bornAmelia(); runtime.importState(savedRuntime);
    return restoreLiveField(savedField, runtime);
  }
  const native = advanceLiveField(twin());
  const shuffled = advanceLiveField(twin(), { permutation: [3, 8, 1, 6, 4, 9, 0, 5, 2, 7] });
  const uniform = advanceLiveField(twin(), 'uniform');
  const vector = (x: typeof native) => x.snapshot.encounterDecisions!.at(-1)!.attentionVector;
  assert.deepEqual([...vector(shuffled)].sort((a, b) => a - b), [...vector(native)].sort((a, b) => a - b));
  assert.notDeepEqual(vector(shuffled), vector(native));
  assert.ok(Math.abs(vector(uniform).reduce((a, b) => a + b, 0) - 1) < 1e-12);
  assert.equal(native.observation.sourceDigest, shuffled.observation.sourceDigest);
  assert.notDeepEqual(native.state.nativeRuntime.getMemory().readMemoryBias().biasVector,
    shuffled.state.nativeRuntime.getMemory().readMemoryBias().biasVector);
  assert.throws(() => advanceLiveField(twin(), { permutation: Array(10).fill(0) }), /Invalid experimental/);
});

test('Governor deferral survives a checkpoint and is admitted after recovery', () => {
  const {runtime, body} = fresh();
  const gov = runtime.getGovernorKernel();
  gov.importState({ ...gov.exportState(), antiLockIntegrity: 60, isAntiLockActive: true });
  const first = advanceLiveField(body);
  const deferred = first.snapshot.encounterDecisions?.find(e => e.sourceDigest === first.observation.sourceDigest);
  assert.equal(deferred?.disposition, 'DEFER');
  const savedRuntime = JSON.parse(JSON.stringify(runtime.exportState()));
  assert.equal(savedRuntime.deferredEncounters.length, 1);
  const savedField = captureLiveField(first.state, false);
  const restoredRuntime = bornAmelia(); restoredRuntime.importState(savedRuntime);
  const restoredField = restoreLiveField(JSON.parse(JSON.stringify(savedField)), restoredRuntime);
  const restoredGov = restoredRuntime.getGovernorKernel();
  restoredGov.importState({ ...restoredGov.exportState(), antiLockIntegrity: 99, isAntiLockActive: false, deformationFieldTension: 0.1 });
  const second = advanceLiveField(restoredField);
  assert.ok(second.snapshot.encounterDecisions?.some(e => e.eventId === deferred?.eventId && e.disposition === 'ATTEND' && e.applied));
});

test('sustained field deferral keeps the latest observation without crowding out other channels', () => {
  let {runtime, body} = fresh();
  const gov = runtime.getGovernorKernel();
  const lock = () => gov.importState({ ...gov.exportState(), antiLockIntegrity: 60, isAntiLockActive: true });
  lock();
  const tarot = { eventId: 'test-tarot', channel: 'TAROT' as const,
    sourceDigest: 'a'.repeat(64), attentionVector: Array(10).fill(0.1) };
  assert.equal(runtime.step(undefined, tarot).encounterDecisions?.at(-1)?.disposition, 'DEFER');
  let latest = '';
  for (let i = 0; i < 50; i++) {
    lock();
    const result = advanceLiveField(body); body = result.state;
    const offered = result.snapshot.encounterDecisions?.at(-1);
    assert.equal(offered?.disposition, 'DEFER');
    latest = offered!.eventId;
  }
  const state = JSON.parse(JSON.stringify(runtime.exportState()));
  assert.deepEqual(state.deferredEncounters.map((e:any) => e.channel), ['TAROT', 'SYNTHETIC_FIELD']);
  assert.equal(state.deferredEncounters[1].eventId, latest);
  const recorded = runtime.getMemory().getEvents().flatMap((e:any) => e.encounters || [])
    .filter((e:any) => e.channel === 'SYNTHETIC_FIELD' && e.eventId === latest);
  assert.ok(recorded.length > 0);
  const savedField = captureLiveField(body, false);
  const restored = bornAmelia(); restored.importState(state);
  restoreLiveField(savedField, restored);
  const recovery = () => restored.getGovernorKernel().importState({ ...restored.getGovernorKernel().exportState(),
    antiLockIntegrity: 99, isAntiLockActive: false, deformationFieldTension: 0.1 });
  recovery();
  assert.ok(restored.step().encounterDecisions?.some(e => e.eventId === tarot.eventId && e.disposition === 'ATTEND'));
  recovery();
  assert.ok(restored.step().encounterDecisions?.some(e => e.eventId === latest && e.disposition === 'ATTEND'));
});

test('whole field and lineage restore with the shared runtime and continue identically', () => {
  let {runtime, body} = fresh();
  for (let i = 0; i < 6; i++) body = advanceLiveField(body).state;
  const savedRuntime = JSON.parse(JSON.stringify(runtime.exportState()));
  const savedField = captureLiveField(body, true);
  const savedFieldJson = JSON.parse(JSON.stringify(savedField));
  const restoredRuntime = bornAmelia();
  restoredRuntime.importState(savedRuntime);
  const restoredField = restoreLiveField(savedFieldJson, restoredRuntime);
  assert.deepEqual(captureLiveField(restoredField, true), savedFieldJson);
  assert.equal(restoredField.nativeRuntime, restoredRuntime);
  const originalNext = advanceLiveField(body), restoredNext = advanceLiveField(restoredField);
  assert.equal(originalNext.observation.sourceDigest, restoredNext.observation.sourceDigest);
  assert.equal(originalNext.snapshot.lastTransition?.digest, restoredNext.snapshot.lastTransition?.digest);
  assert.deepEqual(originalNext.state.cells, restoredNext.state.cells);
  assert.deepEqual(originalNext.state.lineageInstance!.deformationTensor, restoredNext.state.lineageInstance!.deformationTensor);
  assert.equal(runtime.getMemory().exportHistoryDigest(), restoredRuntime.getMemory().exportHistoryDigest());
});

test('damaged or incomplete field checkpoints are refused', () => {
  const {runtime, body} = fresh();
  const saved = captureLiveField(body, false);
  saved.payload += ' ';
  assert.throws(() => restoreLiveField(saved, runtime), /checksum mismatch/);
});

test('pausing a restored field preserves its checksum and body until a new checkpoint is captured', () => {
  const {runtime, body} = fresh();
  const saved = captureLiveField(body, true);
  const pristine = JSON.parse(JSON.stringify(saved));
  assert.throws(() => restoreLiveField({ ...saved, running: false }, runtime), /metadata mismatch/);
  const restored = restoreLiveField(saved, runtime);
  assert.deepEqual(saved, pristine);
  const paused = captureLiveField(restored, false);
  assert.equal(paused.running, false);
  assert.deepEqual(restoreLiveField(paused, runtime).cells, body.cells);
  assert.deepEqual(saved, pristine);
});

test('checkpoint survives JSON storage and preserves negative zero and Unicode', () => {
  const {runtime, body} = fresh();
  body.cells[0].A = -0;
  body.cells[0].sessionId = 'Amelia · 1→8';
  const saved = JSON.parse(JSON.stringify(captureLiveField(body, false)));
  const reordered = { running:saved.running, checksum:saved.checksum, payload:saved.payload,
    schema:saved.schema, runtimeStep:saved.runtimeStep };
  const restored = restoreLiveField(reordered, runtime);
  assert.equal(Object.is(restored.cells[0].A, -0), true);
  assert.equal(restored.cells[0].sessionId, 'Amelia · 1→8');
});
