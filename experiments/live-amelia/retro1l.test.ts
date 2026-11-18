// RETRO-1L machinery checks: synthetic data only.
import test from 'node:test';
import assert from 'node:assert/strict';
import { windowOf, roundOf, targetOf, measuresOf, doubledRanks, exactLowerP, rankTest, calibrate, WINDOWS, GENESIS, PERIOD } from './retro1l/retro1l';

test('windows, rounds and draws', () => {
  assert.equal(windowOf(1).from.toISOString(), '2026-11-19T00:00:00.000Z'); assert.equal(windowOf(WINDOWS).to.toISOString(), '2026-11-25T00:00:00.000Z');
  const r = roundOf(1), t = GENESIS + (r - 1) * PERIOD;       // round r is published at genesis + (r - 1) * period
  assert.ok(t >= windowOf(1).to.getTime() / 1000 + 600 && t < windowOf(1).to.getTime() / 1000 + 600 + 2 * PERIOD);
  const x = targetOf('ab'.repeat(32), 1); assert.ok(x >= 0 && x <= 9); assert.equal(targetOf('ab'.repeat(32), 1), x);
  const counts = Array(10).fill(0); for (let i = 0; i < 5000; i++) counts[targetOf(i.toString(16).padStart(64, '0'), 7)]++; assert.ok(counts.every(c => c > 400 && c < 600));
});

test('measures, ranks and the exact null', () => {
  const m = measuresOf({ path: '1111990033', attention: [0, 1, 0, 0, 0, 0, 0, 0, 0, 1] });
  assert.equal(m.steps, 10); assert.equal(m.occupancy[1], 0.4); assert.equal(m.arrivals[9], 1 / 3); assert.equal(m.attention[1], 0.5);
  const shares = [[0.5, 0.5, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0.5, 0.5, 0, 0, 0, 0, 0, 0]].map(s => s);
  const rk = doubledRanks(shares); rk.forEach(r => assert.equal(r.reduce((a, b) => a + b, 0), 2 * 55));
  // exact P against brute force over all 10^3 target assignments
  const ranks = [[2, 4, 6, 8, 10, 12, 14, 16, 18, 20], [3, 3, 6, 8, 10, 12, 14, 16, 18, 20], [11, 11, 11, 11, 11, 11, 11, 11, 11, 11]];
  for (const R of [20, 30, 40, 55]) { let k = 0; for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) for (let c = 0; c < 10; c++) if (ranks[0][a] + ranks[1][b] + ranks[2][c] <= R) k++;
    assert.ok(Math.abs(exactLowerP(ranks, R) - k / 1000) < 1e-12); }
  assert.equal(rankTest(ranks, [0, 0, 0]).R, 2 + 3 + 11);
  const big = Array.from({ length: 48 }, (_, w) => Array.from({ length: 10 }, (_, z) => 2 * ((z + w) % 10) + 2));
  const c = calibrate(big, 2000); assert.ok(c.typeI <= 0.06); assert.ok(c.power.at(-1)!.power > c.power[0].power);
});
