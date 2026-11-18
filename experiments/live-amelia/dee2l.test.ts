// DEE-2L machinery checks: synthetic states, inputs and series only, no DEE-2L data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { bornAmeliaOf } from '../../src/core/ameliaRuntimes';
import { captureLiveField, createLiveField } from '../../src/outside/LiveFieldLoop';
import { setLiveSourceEnabled } from '../../src/outside/LiveSyntheticSourceSession';
import { wt3lBegin, wt3lChunk, WT3L_TICKS_PER_RUN } from '../../src/cloud/wt3l';
import { runDee, dee1lId, CHUNK_TICKS } from './dee1l/dee1l';
import { ARMS, SHUFFLE_KS, tableOf, transmissionExcess, spearman, spearmanTest, belowTrend, rankUpper, holm } from './dee2l/dee2l';

const v = (z: number) => { const a = Array(10).fill(0.02); a[z] = 0.62; a[(z + 3) % 10] = 0.22; return a; };
const offer = (k: number) => ({ eventId: `e${k}`, channel: 'LINGUISTIC' as any, sourceDigest: createHash('sha256').update(String(k)).digest('hex'),
  attentionVector: v((k * 7) % 10) });
function born() {   // a lane state, as hers is
  const rt: any = bornAmeliaOf('nd1'); rt.setAdmissionRule('outside-lane-v1'); rt.setWarpTheta(12); for (let i = 0; i < 60; i++) rt.step();
  const field: any = setLiveSourceEnabled(createLiveField(rt, { seed: 101, depth: 288, preset: 'SYZYGETIC_GRID', size: 12 }), true);
  return { state: JSON.parse(JSON.stringify(rt.exportState())), fieldCheckpoint: captureLiveField(field, false), revision: 1,
    controls: { advisoryWeight: 0.722, momentumDamping: 0.88 } } as any;
}
const ticks = Array.from({ length: 24 }, (_, k) => ({ offers: Array.from({ length: (k % 3) + 1 }, (_, i) => offer(k * 5 + i)) }));

test('the arms: GATES, ACTUAL and 60 shuffles new to DEE-2L', () => {
  assert.equal(ARMS.length, 62); assert.equal(SHUFFLE_KS[0], 40); assert.equal(SHUFFLE_KS.at(-1), 99);
  assert.equal(tableOf('GATES'), null); assert.ok(tableOf('ACTUAL') && tableOf('S40'));
});

test('under the lane, GATES on the research copy equals the WT-3L replay of her runtime; a table acts', { timeout: 900000 }, () => {
  const s = born(); assert.equal(s.state.admissionRule, 'outside-lane-v1');
  let w: any = wt3lBegin(s, 'w', 1, 'T12', 'x');
  while (w.metrics.ticksDone < WT3L_TICKS_PER_RUN) w = wt3lChunk(JSON.parse(JSON.stringify(w)), ticks, CHUNK_TICKS, dee1lId);
  const d = runDee(s, ticks, 'w', 1, 'x', { probe: true });
  assert.equal(d.metrics.path, w.metrics.path); assert.deepEqual(d.metrics.final, w.metrics.final); assert.deepEqual(d.metrics.entries, w.metrics.entries);
  const t = runDee(s, ticks, 't', 1, 'x', { probe: true, table: tableOf('S40') });
  assert.ok(t.byMesh!.reduce((a: number, b: number) => a + b, 0) > 0);
  const x = transmissionExcess(d.probe); assert.ok(x.eligible > 0 && x.chance > 0 && x.chance <= x.eligible);
});

test('the statistics', () => {
  assert.equal(spearman([1, 2, 3, 4], [4, 3, 2, 1]), -1);
  const x = Array.from({ length: 60 }, (_, i) => i), y = x.map(i => 60 - i + ((i * 7) % 5));
  const t = spearmanTest(x, y, 2000); assert.ok(t.rho < -0.9 && t.p < 0.01);
  const z = x.map(i => (i * 37) % 60); const u = spearmanTest(x, z, 2000); assert.ok(u.p > 0.05);
  const E = x, T = x.map(i => 0.7 - 0.005 * i + (((i * 13) % 7) - 3) * 0.002);
  const b = belowTrend(E, T, 30, 0.4); assert.equal(b.shufflesAtOrBelow, 0); assert.equal(b.p, 1 / 61);
  assert.equal(rankUpper([0.5, 0.6, 0.7], 0.65).p, 2 / 4);
  const h = holm([{ name: 'a', p: 0.01 }, { name: 'b', p: 0.02 }, { name: 'c', p: 0.04 }]); assert.deepEqual(h.map(q => q.survives), [true, true, true]);
});
