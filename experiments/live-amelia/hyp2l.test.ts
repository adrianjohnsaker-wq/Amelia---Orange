// HYPERSTITION-2L machinery checks: synthetic states only, and the stream file; no study data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { bornAmeliaOf } from '../../src/core/ameliaRuntimes';
import { captureLiveField, createLiveField } from '../../src/outside/LiveFieldLoop';
import { setLiveSourceEnabled } from '../../src/outside/LiveSyntheticSourceSession';
import { portion as portion1 } from './hyp1l/hyp1l';
import { STREAM, STREAM_SHA256, streamDigest, portion, offset, armStream, transmission, windows, fulfilment, adjacency, signFlipUpper,
  SIGNS, HOLD, STEPS, UNITS } from './hyp2l/hyp2l';

function record(theta = 3) {
  const rt: any = bornAmeliaOf('nd1'); rt.setAdmissionRule('outside-lane-v1'); for (let i = 0; i < 60; i++) rt.step();
  const field: any = setLiveSourceEnabled(createLiveField(rt, { seed: 101, depth: 288, preset: 'SYZYGETIC_GRID', size: 12 }), true);
  const st = JSON.parse(JSON.stringify(rt.exportState())); st.nd1 = { ...(st.nd1 ?? {}), theta };
  return { state: st, fieldCheckpoint: captureLiveField(field, false), revision: 1, controls: { advisoryWeight: 0.722, momentumDamping: 0.88 } } as any;
}

test('the stream, the portions and the orderings', () => {
  assert.equal(streamDigest(STREAM), STREAM_SHA256); assert.equal(SIGNS, 240); assert.equal(STEPS, 1440);
  const key = (a: number[]) => [...a].sort().join('');
  for (let u = 1; u <= UNITS; u++) {
    const p = portion(u); assert.equal(p.length, SIGNS);
    assert.equal(key(armStream('Sh', u)), key(p)); assert.deepEqual(armStream('Rv', u), [...p].reverse());
    const mk = armStream('Mk', u); assert.equal(mk.length, SIGNS); assert.equal(mk[0], p[0]);
    for (let v = 1; v <= 12; v++) { const o1 = Math.floor((v - 1) * STREAM.length / 12); assert.ok(offset(u) + SIGNS <= o1 || offset(u) >= o1 + 720, `unit ${u} overlaps HYPERSTITION-1L portion ${v}`); }
  }
  assert.deepEqual(portion1(1).slice(0, 3), STREAM.slice(0, 3));
});

test('every sign is held for exactly 6 steps; study offers carry it; the lane admits on arrival', { timeout: 900000 }, () => {
  const s = record(); const r = transmission(s, 'H', 1, 't');
  assert.equal(r.steps.length, STEPS);
  for (let k = 0; k < SIGNS; k++) assert.ok(r.steps.slice(k * HOLD, (k + 1) * HOLD).every(x => x.sign === k), `sign ${k}`);
  assert.ok(r.steps.filter(x => x.study).length === STEPS / 2, 'one study offer per iteration');
  assert.ok(r.steps.some(x => x.onArrival));
  const f = fulfilment(r.signs, windows(r.steps)); assert.ok(f > 0 && f <= 1);
  const adj = adjacency(r.signs, s); assert.ok(adj.joined !== null && adj.joined >= 0 && adj.joined <= 1);
});

test('the exact one-sided sign-flip', () => {
  assert.deepEqual(signFlipUpper([1, 1, 1]), { mean: 1, p: 1 / 8, patterns: 8 });
  assert.equal(signFlipUpper([1, -1]).p, 3 / 4);
  const d = Array.from({ length: 16 }, (_, i) => (i % 5) - 1.5);   // brute force agrees
  let k = 0; const obs = d.reduce((a, b) => a + b, 0);
  for (let m = 0; m < 1 << 16; m++) { let t = 0; for (let i = 0; i < 16; i++) t += (m >> i) & 1 ? -d[i] : d[i]; if (t >= obs - 1e-9) k++; }
  assert.equal(signFlipUpper(d).p, k / 65536);
});
