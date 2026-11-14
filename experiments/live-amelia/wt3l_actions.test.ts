// WT-3L GitHub Actions runner (Amendment 2): synthetic states and inputs only, no WT-3L data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { bornAmeliaOf } from '../../src/core/ameliaRuntimes';
import { captureLiveField, createLiveField } from '../../src/outside/LiveFieldLoop';
import { setLiveSourceEnabled } from '../../src/outside/LiveSyntheticSourceSession';
import { runOne, sameRun, analyse } from './wt3l/run_actions';

function start() {
  const rt: any = bornAmeliaOf('nd1'); rt.setAdmissionRule('relative-v1'); rt.setWarpTheta(12); rt.step();
  const field: any = setLiveSourceEnabled(createLiveField(rt, { seed: 101, depth: 288, preset: 'SYZYGETIC_GRID', size: 12 }), true);
  return { state: JSON.parse(JSON.stringify(rt.exportState())), fieldCheckpoint: captureLiveField(field, false), revision: 1,
    controls: { advisoryWeight: 0.722, momentumDamping: 0.88 } } as any;
}
const v = (z: number) => { const a = Array(10).fill(0.02); a[z] = 0.82; return a; };
const ticks = Array.from({ length: 24 }, (_, k) => ({ offers: Array.from({ length: k % 3 }, (_, i) => ({ eventId: `e${k}.${i}`, channel: 'LINGUISTIC',
  sourceDigest: createHash('sha256').update(`${k}.${i}`).digest('hex'), attentionVector: v((k * 7 + i) % 10) })) }));

test('runner: a full run is deterministic, Θ = 24 differs, and the summary carries the registered measures', { timeout: 600000 }, () => {
  const s = start();
  const a = runOne(s, ticks, 'u01-T12', 1, 'T12', 'x'), b = runOne(s, ticks, 'u01-T12-rep', 1, 'T12', 'x');
  assert.deepEqual(sameRun(a.metrics, b.metrics), []);
  assert.equal(a.metrics.ticksDone, 96); assert.equal(a.summary.iterations, 1440); assert.equal(a.chunks, 24);
  const c = runOne(s, ticks, 'u01-T24', 1, 'T24', 'x');
  assert.notDeepEqual(sameRun(a.metrics, c.metrics), []);
  assert.equal(c.summary.final.theta, 24); assert.equal(a.summary.final.theta, 12);
  for (const k of ['M1_warpShare', 'M2_meanTension', 'linesOfFlight', 'warpExits', 'warpbornAtStart', 'warpbornAtEnd']) assert.ok(k in a.summary, k);
});

test('analysis applies the registered decision rule', () => {
  const mk = (d1: number, d2: number) => Array.from({ length: 12 }, (_, i) => ({ unit: i + 1,
    T12: { M1_warpShare: 0.10 + d1, M2_meanTension: 0.70 + d2 }, T24: { M1_warpShare: 0.10, M2_meanTension: 0.70 } }));
  assert.equal(analyse(mk(0.01, 0.01)).decision, 'THETA-12 HOLDS');
  assert.equal(analyse(mk(0.05, 0.0)).decision, 'THETA-12 RAISES WARP SHARE OR TENSION');      // all 12 positive: p = 2/4096
  const mixed = mk(0, 0).map((r, i) => ({ ...r, T12: { ...r.T12, M1_warpShare: 0.10 + (i < 7 ? 0.08 : -0.06) } }));
  const m = analyse(mixed); assert.ok(m.M1.meanDifference > 0.02 && m.M1.p > 0.05); assert.equal(m.decision, 'INCONCLUSIVE');
});
