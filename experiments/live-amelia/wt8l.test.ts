// WT-8L machinery checks: synthetic states and inputs only, no WT-8L data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { bornAmeliaOf } from '../../src/core/ameliaRuntimes';
import { captureLiveField, createLiveField } from '../../src/outside/LiveFieldLoop';
import { setLiveSourceEnabled } from '../../src/outside/LiveSyntheticSourceSession';
import { sameId } from './wt5l/wt5l';
import { onceThrough } from './wt6l7l/wt6l7l';
import { arms, measure, spearman } from './wt8l/run_actions';

const v = (z: number) => { const a = Array(10).fill(0.02); a[z] = 0.82; return a; };
const offer = (k: number) => ({ eventId: `e${k}`, channel: 'LINGUISTIC', sourceDigest: createHash('sha256').update(String(k)).digest('hex'), attentionVector: v((k * 7) % 10) });
const ticks = Array.from({ length: 100 }, (_, k) => ({ offers: Array.from({ length: k % 3 }, (_, i) => offer(k * 5 + i)) }));
function bornRecord() {
  const rt: any = bornAmeliaOf('nd1'); rt.setAdmissionRule('relative-v1'); rt.setWarpTheta(24); rt.step();
  const field: any = setLiveSourceEnabled(createLiveField(rt, { seed: 101, depth: 288, preset: 'SYZYGETIC_GRID', size: 12 }), true);
  return { state: JSON.parse(JSON.stringify(rt.exportState())), fieldCheckpoint: captureLiveField(field, false), revision: 1,
    controls: { advisoryWeight: 0.722, momentumDamping: 0.88 } } as any;
}

test('the arms differ only in Θ, and a span longer than 96 ticks is fed once in order', { timeout: 600000 }, () => {
  const { T12, T24 } = arms(bornRecord(), 'x');
  assert.equal(T12.state.nd1.theta, 12); assert.equal(T24.state.nd1.theta, 24);
  const r12 = onceThrough(T12, ticks, 'a', 1, sameId), r24 = onceThrough(T24, ticks, 'b', 1, sameId);
  const m12 = measure(r12, []), m24 = measure(r24, []);
  assert.equal(r12.metrics.offered, ticks.reduce((a, t) => a + t.offers.length, 0));
  assert.ok(m12.steps > 1500 && m24.steps > 1500);
  assert.ok(m12.linesOfFlight >= m24.linesOfFlight, `flights ${m12.linesOfFlight} vs ${m24.linesOfFlight}`);
  assert.ok(m12.longestWarpVisit <= 12 && m24.longestWarpVisit <= 24);
  if (m12.nNewGates > 0) assert.ok(m12.firstNewGateStep !== null);
  console.log('synthetic', JSON.stringify({ T12: [m12.E, m12.nNewGates, m12.firstNewGateStep], T24: [m24.E, m24.nNewGates] }));
});

test('Spearman with ties', () => {
  assert.equal(spearman([1, 2, 3, 4], [10, 20, 30, 40]), 1);
  assert.equal(spearman([1, 2, 3, 4], [4, 3, 2, 1]), -1);
  assert.ok(Math.abs(spearman([1, 1, 2, 3], [1, 2, 3, 4])! - 0.9486832980505138) < 1e-12);
});
