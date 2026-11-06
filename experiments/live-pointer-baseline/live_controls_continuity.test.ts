import test from 'node:test';
import assert from 'node:assert/strict';
import { ExternalRhythmHarmonizer } from '../../src/ai/morphogenetic/ExternalRhythmHarmonizer';
import { captureLiveControls, readLiveControls } from '../../src/app/liveControlsCheckpoint';
import { bornAmelia } from '../../src/core/fullNumogram';
import { captureLiveField, createLiveField, restoreLiveField } from '../../src/outside/LiveFieldLoop';
import { advanceWithLiveSource, getLiveSourceSession, setLiveSourceEnabled } from '../../src/outside/LiveSyntheticSourceSession';

test('saved untuned controls reproduce the subsequent source, field and memory after restoration', () => {
  const runtime = bornAmelia();
  runtime.step();
  const harmonizer = new ExternalRhythmHarmonizer();
  harmonizer.toggleRhythm('RHYTHM_CIRCADIAN_DIURNAL');
  harmonizer.toggleRhythm('RHYTHM_PANDEMONIUM_FLUX');
  const baseline = 0.431, damping = 0.63;
  let field = setLiveSourceEnabled(createLiveField(runtime, {
    seed: 101, depth: 256, preset: 'SYZYGETIC_GRID', size: 12,
  }), true);
  function prepare(r: typeof runtime, h: ExternalRhythmHarmonizer, base: number, damp: number) {
    const step = (r.getSnapshots().at(-1)?.step ?? 0) + 1;
    r.setAdvisoryWeight(h.computeAdvisoryTuning(base, step));
    r.setMomentumDamping(damp);
  }
  for (let i = 0; i < 9; i++) {
    prepare(runtime, harmonizer, baseline, damping);
    field = advanceWithLiveSource(field).state;
  }
  const saved = JSON.parse(JSON.stringify({
    state: runtime.exportState(), field: captureLiveField(field, true),
    controls: captureLiveControls(baseline, damping, harmonizer.getRhythms(), 'recorded'),
  }));
  assert.notEqual(saved.state.governorState.advisoryWeight, baseline);
  const resumed = bornAmelia();
  resumed.importState(saved.state);
  let resumedField = restoreLiveField(saved.field, resumed);
  const resumedHarmonizer = new ExternalRhythmHarmonizer();
  const controls = readLiveControls(saved.controls, { advisoryWeight: 0.72, momentumDamping: 0.88 }, resumedHarmonizer.getRhythms());
  for (const desired of controls.rhythms) {
    if (resumedHarmonizer.getRhythms().find(r => r.id === desired.id)!.active !== desired.active) {
      resumedHarmonizer.toggleRhythm(desired.id);
    }
  }
  assert.equal(controls.advisoryWeight, baseline);
  assert.equal(controls.momentumDamping, damping);
  assert.equal(getLiveSourceSession(resumedField)?.sourceState.step, 9);
  for (let i = 0; i < 5; i++) {
    prepare(runtime, harmonizer, baseline, damping);
    prepare(resumed, resumedHarmonizer, controls.advisoryWeight, controls.momentumDamping);
    const a = advanceWithLiveSource(field), b = advanceWithLiveSource(resumedField);
    assert.deepEqual(a.sourceReading, b.sourceReading);
    assert.deepEqual(a.state.cells, b.state.cells);
    assert.equal(a.snapshot.lastTransition?.digest, b.snapshot.lastTransition?.digest);
    assert.equal(runtime.getMemory().exportHistoryDigest(), resumed.getMemory().exportHistoryDigest());
    field = a.state;
    resumedField = b.state;
  }
});

test('older checkpoints are identified as assumptions and retain their default rhythm profile', () => {
  const defaults = new ExternalRhythmHarmonizer().getRhythms();
  const controls = readLiveControls(undefined, { advisoryWeight: 0.725, momentumDamping: 0.88 }, defaults);
  assert.equal(controls.provenance, 'legacy-assumed');
  assert.deepEqual(controls.rhythms, defaults.map(({ id, active }) => ({ id, active })));
  assert.equal(controls.advisoryWeight, 0.725);
  assert.equal(captureLiveControls(controls.advisoryWeight, controls.momentumDamping, defaults, controls.provenance).provenance, 'legacy-assumed');
});

test('incomplete, duplicated or invalid controls are rejected', () => {
  const defaults = new ExternalRhythmHarmonizer().getRhythms();
  const valid = captureLiveControls(0.5, 0.88, defaults, 'recorded');
  const fallback = { advisoryWeight: 0.72, momentumDamping: 0.88 };
  assert.throws(() => readLiveControls({ ...valid, advisoryWeight: NaN }, fallback, defaults), /Invalid saved live controls/);
  assert.throws(() => readLiveControls({ ...valid, rhythms: valid.rhythms.slice(1) }, fallback, defaults), /Incomplete saved live rhythms/);
  assert.throws(() => readLiveControls({ ...valid, rhythms: [valid.rhythms[0], ...valid.rhythms] }, fallback, defaults), /Invalid saved live rhythms/);
  assert.throws(() => readLiveControls(null, fallback, defaults), /Invalid saved live controls/);
});
