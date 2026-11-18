// WHEELER-1L machinery checks: synthetic data only.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readings, contrasts, choiceOf, signTestUpper, calibrate, windowOf, WINDOWS } from './wheeler1l/wheeler1l';

test('the two readings', () => {
  const a = readings('3333333333'); assert.ok(Math.abs(a.A - 1) < 1e-12); assert.equal(a.B, 0); assert.equal(a.warpSyzygy, 1);
  const b = readings('3636363636'); assert.equal(b.B, 1); assert.ok(Math.abs(b.A - 1) < 1e-12);     // 3 and 6 share one syzygy
  const c = readings('0123456789'); assert.ok(c.A < 0.2); assert.equal(c.B, 1 / 9);   // only 4-5 is a partner move
  const d = readings('18181722'); assert.equal(d.B, 5 / 6);   // 1-8, 8-1, 1-8, 8-1 and 7-2 are partners; 1-7 is not
  assert.equal(windowOf(1).from.toISOString(), '2026-11-19T00:00:00.000Z'); assert.equal(windowOf(WINDOWS).to.toISOString(), '2026-11-25T00:00:00.000Z');
});

test('contrasts, the choice and the exact meet-in-the-middle sign test', () => {
  const c = contrasts([{ A: 0.1, B: 0.5 }, { A: 0.3, B: 0.4 }, { A: 0.5, B: 0.3 }]); assert.ok(Math.abs(c.zA.reduce((x, y) => x + y, 0)) < 1e-12);
  assert.ok([1, -1].includes(choiceOf('ab'.repeat(32), 3)));
  let even = 0; for (let i = 0; i < 4000; i++) if (choiceOf(i.toString(16).padStart(64, '0'), 5) === 1) even++; assert.ok(even > 1800 && even < 2200);
  const d = Array.from({ length: 14 }, (_, i) => ((i * 5) % 7) - 2.7);
  for (const S of [-3, 0, 2.5, 9]) { let k = 0; for (let m = 0; m < 1 << 14; m++) { let t = 0; for (let i = 0; i < 14; i++) t += (m >> i) & 1 ? -d[i] : d[i]; if (t >= S - 1e-9) k++; }
    assert.ok(Math.abs(signTestUpper(d, S) - k / (1 << 14)) < 1e-12, `S ${S}`); }
  const cal = calibrate(Array.from({ length: 20 }, (_, i) => Math.sin(i + 1)), 3000); assert.ok(cal.typeI <= 0.06); assert.ok(cal.power.at(-1)!.power > 0.5);
});
