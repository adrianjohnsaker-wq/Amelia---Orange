import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AmeliaOutsideRuntime } from '../../src/outside/OutsideEncounterRuntime';
import { withFullNumogram } from '../../src/core/fullNumogram';
import { initMorphogeneticState, stepAmeliaSubstrate } from '../../src/substrate/AmeliaMorphogeneticSubstrate';
import type { MorphogeneticState } from '../../src/substrate/AmeliaMorphogeneticSubstrate';
import { canonical, decodeCanonical } from './canonical';
import { SyntheticCoordinator, captureCheckpoint, restoreCheckpoint } from './coordinator';
import { SyntheticEvidenceLedger, readCheckpoint, verifyLedger } from './ledger';
import { createReferenceField, observeField, SyntheticQueueRuntime } from './observer';
import { stepFieldWithPointer } from './pointer';
import { recovery } from './recovery';

const seedConfig = { width: 12, height: 10, preset: 'CORAL_REEF' as const, seed: 33, noiseAmp: 0.003 };
const neutral = { id: 'neutral', edges: [] };
const source = { repository: 'engineering-fixture', commit: 'a'.repeat(40), sourceHashes: { fixture: 'b'.repeat(64) } };

function originalField(config = seedConfig): MorphogeneticState {
  const runtime = new AmeliaOutsideRuntime();
  withFullNumogram(runtime);
  runtime.setSuppressRelaySteering(true);
  return initMorphogeneticState(config.width, config.height, config.preset, config.seed, config.noiseAmp, undefined, runtime);
}
function comparable(state: MorphogeneticState) {
  const { nativeRuntime, lineageInstance, ...field } = state;
  const runtime = nativeRuntime.exportState();
  delete runtime.syntheticQueued;
  runtime.snapshots = (runtime.snapshots as Array<Record<string, unknown>>).map(({ timestamp, ...rest }) => rest);
  return { field, runtime, lineage: lineageInstance?.exportSnapshot(), trait: lineageInstance?.traitEvolution.exportState() };
}

test('canonical checkpoint encoding preserves negative zero and rejects non-finite values', () => {
  const decoded = decodeCanonical(canonical({ x: -0, y: 0.1 })) as { x: number; y: number };
  assert.ok(Object.is(decoded.x, -0));
  assert.equal(decoded.y, 0.1);
  assert.throws(() => canonical({ x: Number.NaN }), /Non-finite/);
});

test('full Numogram and neutral overlay match the original field and actual runtime', () => {
  for (const seed of [3, 33, 78]) {
    const config = { ...seedConfig, seed };
    let original = originalField(config);
    let candidate = createReferenceField(config);
    assert.equal(candidate.nativeRuntime.getQabbala().getGates().length, 29);
    assert.equal(canonical(comparable(original)), canonical(comparable(candidate)));
    for (let i = 0; i < 24; i++) {
      original = stepAmeliaSubstrate(original);
      // Force the independent reconstructed diffusion path to validate the neutral formula.
      candidate = stepFieldWithPointer(candidate, neutral, true);
      assert.equal(canonical(comparable(original)), canonical(comparable(candidate)), 'seed ' + seed + ', step ' + (i + 1));
    }
  }
});

test('neutral field reconstruction stays identical with active body-to-Numogram feedback', () => {
  let base = createReferenceField(seedConfig), candidate = createReferenceField(seedConfig);
  for (let i = 0; i < 24; i++) {
    for (const state of [base, candidate]) {
      const observation = observeField(state);
      if (observation.attentionVector) (state.nativeRuntime as SyntheticQueueRuntime).queueSynthetic({
        eventId: 'feedback-fixture:' + i, channel: 'SYNTHETIC_FIELD',
        sourceDigest: observation.sourceDigest, attentionVector: observation.attentionVector,
      });
    }
    base = stepFieldWithPointer(base, neutral);
    candidate = stepFieldWithPointer(candidate, neutral, true);
    assert.equal(canonical(comparable(base)), canonical(comparable(candidate)), 'feedback step ' + (i + 1));
  }
});

test('a bounded pointer acts on real neighbour coupling and restores neutral mode', () => {
  let base = createReferenceField(seedConfig), changed = createReferenceField(seedConfig);
  base.cells[0].A = changed.cells[0].A = 0.8;
  base.cells[1].A = changed.cells[1].A = 0.8;
  base.cells[0].B = changed.cells[0].B = 0.1;
  base.cells[1].B = changed.cells[1].B = 0.4;
  base = stepFieldWithPointer(base, neutral);
  changed = stepFieldWithPointer(changed, { id: 'bounded', edges: [{ a: 0, b: 1, multiplier: 0.4 }] });
  assert.notEqual(changed.cells[0].B, base.cells[0].B);
  assert.notEqual(changed.cells[1].B, base.cells[1].B);
  assert.equal(changed.stepCount, 1);
  assert.equal(changed.nativeRuntime.exportState().stepCount, 1);
  changed = stepFieldWithPointer(changed, neutral);
  assert.equal(changed.stepCount, 2);
  assert.throws(() => stepFieldWithPointer(changed, { id: 'bad', edges: [{ a: 0, b: 2, multiplier: 0.5 }] }), /neighbour/);
  assert.equal(changed.nativeRuntime.exportState().stepCount, 2, 'invalid pointer must fail before a runtime step');
});

test('observation is a bounded body measurement and zero activation abstains', () => {
  const state = createReferenceField(seedConfig);
  const observation = observeField(state);
  assert.equal(observation.regionMeans.length, 10);
  assert.ok(observation.attentionVector);
  assert.ok(Math.abs(observation.attentionVector!.reduce((a, b) => a + b, 0) - 1) < 1e-12);
  assert.match(observation.sourceDigest, /^[a-f0-9]{64}$/);
  for (const c of state.cells) c.B = 0;
  const empty = observeField(state);
  assert.equal(empty.attentionVector, null);
  assert.equal(empty.noObservationReason, 'TOTAL_AT_OR_BELOW_EPSILON');
});

test('synthetic observation follows the existing defer queue and can later be attended', () => {
  const runtime = new SyntheticQueueRuntime();
  withFullNumogram(runtime);
  runtime.setSuppressRelaySteering(true);
  runtime.getGovernorKernel().importState({ antiLockIntegrity: 60 });
  runtime.queueSynthetic({
    eventId: 'field:test:1', channel: 'SYNTHETIC_FIELD', sourceDigest: 'a'.repeat(64),
    attentionVector: Array(10).fill(0.1),
  });
  const deferred = runtime.step();
  assert.equal(deferred.encounterDecisions?.[0].disposition, 'DEFER');
  assert.equal((runtime.exportState().deferredEncounters as unknown[]).length, 1);
  runtime.getGovernorKernel().importState({ antiLockIntegrity: 99, isAntiLockActive: false, deformationTension: 0.1 });
  const attended = runtime.step();
  assert.equal(attended.encounterDecisions?.[0].disposition, 'ATTEND');
  assert.equal(attended.encounterDecisions?.[0].eventId, 'field:test:1');
  assert.equal((runtime.exportState().deferredEncounters as unknown[]).length, 0);
});

test('one body step produces one governed passage and a verifiable full checkpoint', () => {
  const dir = join(mkdtempSync(join(tmpdir(), 'sxi0-test-')), 'run');
  const ledger = new SyntheticEvidenceLedger(dir);
  const run = new SyntheticCoordinator('fixture', createReferenceField(seedConfig), ledger, source);
  run.step({ id: 'A', edges: [{ a: 0, b: 1, multiplier: 0.5 }] });
  run.step(neutral);
  run.finish();
  const check = verifyLedger(dir, { requireComplete: true });
  verifyLedger(dir, { expectedHead: check.head! });
  assert.throws(() => verifyLedger(dir, { expectedHead: '0'.repeat(64) }), /external receipt/);
  assert.equal(check.count, 6);
  const begins = check.records.filter(r => r.kind === 'STEP_BEGIN');
  const commits = check.records.filter(r => r.kind === 'STEP_COMMITTED');
  assert.equal(begins.length, 2);
  assert.equal(commits.length, 2);
  const first = commits[0].data as any;
  assert.equal(first.bodyStep, 1);
  assert.equal(first.passage.from, 0);
  assert.equal(first.passage.encounterDecisions[0].channel, 'SYNTHETIC_FIELD');
  assert.ok(first.passage.options.length > 0);
  assert.ok(first.passage.options.some((o: any) => o.gate.target === first.passage.chosen));
  const checkpoint = readCheckpoint(dir, commits[0].checkpoint!) as any;
  const restored = restoreCheckpoint(checkpoint);
  assert.equal(canonical(captureCheckpoint(restored)), canonical(checkpoint));
  assert.equal(restored.nativeRuntime.exportState().stepCount, 1);
  assert.equal(restored.lineageInstance?.memory.getEvents().length, 256);
  assert.equal(restored.nativeRuntime.getMemory().getEvents().length, 1);
  assert.throws(() => new SyntheticEvidenceLedger(dir), /EEXIST/);
  assert.throws(() => run.step(neutral), /finished/);
});

test('a failed step cannot be marked complete or silently continued', () => {
  const dir = join(mkdtempSync(join(tmpdir(), 'sxi0-failed-')), 'run');
  const run = new SyntheticCoordinator('invalid', createReferenceField(seedConfig), new SyntheticEvidenceLedger(dir), source);
  assert.throws(() => run.step({ id: 'bad', edges: [{ a: 0, b: 2, multiplier: 0.5 }] }), /neighbour/);
  assert.throws(() => run.finish(), /failed/);
  assert.throws(() => run.step(neutral), /failed/);
  assert.throws(() => verifyLedger(dir, { requireComplete: true }), /incomplete/);
});

test('a restored checkpoint preserves the subsequent scientific trajectory', () => {
  const original = createReferenceField(seedConfig);
  const runtime = original.nativeRuntime as SyntheticQueueRuntime;
  const observation = observeField(original);
  runtime.queueSynthetic({ eventId: 'restore:test:1', channel: 'SYNTHETIC_FIELD',
    sourceDigest: observation.sourceDigest, attentionVector: observation.attentionVector! });
  let state = stepFieldWithPointer(original, { id: 'A', edges: [{ a: 0, b: 1, multiplier: 0.5 }] });
  let restored = restoreCheckpoint(captureCheckpoint(state));
  for (let i = 0; i < 12; i++) {
    state = stepFieldWithPointer(state, neutral);
    restored = stepFieldWithPointer(restored, neutral);
    assert.equal(canonical(comparable(state)), canonical(comparable(restored)));
  }
});

test('ledger rejects checkpoint tampering and incomplete final records', () => {
  const dir = join(mkdtempSync(join(tmpdir(), 'sxi0-tamper-')), 'run');
  const ledger = new SyntheticEvidenceLedger(dir);
  const record = ledger.append('FIXTURE', { case: 'tamper' }, { x: 1 });
  verifyLedger(dir);
  const checkpointPath = join(dir, record.checkpoint!.file);
  writeFileSync(checkpointPath, readFileSync(checkpointPath, 'utf8') + ' ');
  assert.throws(() => verifyLedger(dir), /Checkpoint hash mismatch/);

  const second = join(mkdtempSync(join(tmpdir(), 'sxi0-partial-')), 'run');
  const ledger2 = new SyntheticEvidenceLedger(second);
  ledger2.append('FIXTURE', {}, { x: 1 });
  appendFileSync(join(second, 'events.jsonl'), '{');
  assert.throws(() => verifyLedger(second), /Incomplete final/);
});

test('recovery distinguishes an engineered positive control from a stationary null', () => {
  const reference = [0.2, 0.5, 0.7], injured = [0.8, 0.1, 0.2];
  let repaired = [...injured];
  for (let i = 0; i < 20; i++) repaired = repaired.map((x, j) => x + 0.3 * (reference[j] - x));
  assert.ok(recovery(reference, injured, repaired).recovery > 0.99);
  assert.equal(recovery(reference, injured, injured).recovery, 0);
  assert.throws(() => recovery(reference, reference, repaired), /too small/);
});

test('a planted repair controller is distinguishable from passive recovery in the coupled reference field', () => {
  let passive = createReferenceField(seedConfig), planted = createReferenceField(seedConfig);
  const targetCells = planted.cells.map(cell => cell.B);
  const reference = observeField(planted).regionMeans;
  for (const state of [passive, planted]) {
    for (let i = 0; i < state.cells.length; i++) if (i % state.width < 6) state.cells[i].B = 0;
  }
  const damaged = observeField(planted).regionMeans;
  for (let t = 0; t < 15; t++) {
    for (const state of [passive, planted]) {
      const obs = observeField(state);
      if (obs.attentionVector) (state.nativeRuntime as SyntheticQueueRuntime).queueSynthetic({
        eventId: 'planted-control:' + t, channel: 'SYNTHETIC_FIELD',
        sourceDigest: obs.sourceDigest, attentionVector: obs.attentionVector,
      });
    }
    passive = stepFieldWithPointer(passive, neutral);
    planted = stepFieldWithPointer(planted, neutral);
    // Deliberately programmed target: calibration only, never a discovered pattern.
    planted.cells.forEach((cell, i) => { cell.B += 0.8 * (targetCells[i] - cell.B); });
  }
  const passiveRecovery = recovery(reference, damaged, observeField(passive).regionMeans).recovery;
  const plantedRecovery = recovery(reference, damaged, observeField(planted).regionMeans).recovery;
  assert.ok(plantedRecovery > 0.98);
  assert.ok(plantedRecovery > passiveRecovery + 0.5);
});
