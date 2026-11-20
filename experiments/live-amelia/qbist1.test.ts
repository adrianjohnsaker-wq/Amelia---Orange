// QBIST-1 machinery checks: synthetic states and inputs only, no study data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { bornAmeliaOf } from '../../src/core/ameliaRuntimes';
import { captureLiveField, createLiveField } from '../../src/outside/LiveFieldLoop';
import { setLiveSourceEnabled } from '../../src/outside/LiveSyntheticSourceSession';
import { runDee } from './dee1l/dee1l';
import { runQb, measures, structure, novelty, LADDER } from './qbist1/qbist1';
import { Organ, structureCheck, basis, eigvals, entropy, coherenceL1, offerKraus, CHANNEL_ANGLE } from './qbist1/organ';

const v = (z: number) => { const a = Array(10).fill(0.02); a[z] = 0.62; a[(z + 3) % 10] = 0.22; return a; };
const CH = ['TAROT', 'ICHING', 'LINGUISTIC', 'SUBDECADENCE'];
const offer = (k: number) => ({ eventId: `e${k}`, channel: CH[k % 4] as any, sourceDigest: createHash('sha256').update(String(k)).digest('hex'), attentionVector: v((k * 7) % 10) });
function born() {
  const rt: any = bornAmeliaOf('nd1'); rt.setAdmissionRule('outside-lane-v1'); rt.setWarpTheta(12); for (let i = 0; i < 80; i++) rt.step();
  const field: any = setLiveSourceEnabled(createLiveField(rt, { seed: 101, depth: 288, preset: 'SYZYGETIC_GRID', size: 12 }), true);
  return { state: JSON.parse(JSON.stringify(rt.exportState())), fieldCheckpoint: captureLiveField(field, false), revision: 1, controls: { advisoryWeight: 0.722, momentumDamping: 0.88 } } as any;
}
const ticks = Array.from({ length: 24 }, (_, k) => ({ offers: Array.from({ length: (k % 3) + 1 }, (_, i) => offer(k * 5 + i)) }));

test('the organ: bases, eigenvalues, the QQ equality and the coherence term', () => {
  const U = basis(Math.PI / 4); const UtU = U[0].map((_, j) => U[0].map((_, k) => U.reduce((s, r) => s + r[j] * r[k], 0)));
  UtU.forEach((r, i) => r.forEach((x, j) => assert.ok(Math.abs(x - (i === j ? 1 : 0)) < 1e-12)));
  assert.equal(CHANNEL_ANGLE.TAROT, Math.PI / 4);
  const p = Array(10).fill(0.1); const o = new Organ({ lambda: 0.5, gamma: 4, decohere: false, seed: 1, p0: p, q: p });
  assert.ok(Math.abs(eigvals(o.rho).reduce((a, b) => a + b, 0) - 1) < 1e-9); assert.ok(entropy(o.rho) >= -1e-12);
  for (let k = 0; k < 40; k++) { o.offer(offer(k)); o.land((k * 3) % 10); }
  assert.ok(coherenceL1(o.rho) > 0.01, 'coherence persists'); assert.ok(eigvals(o.rho).every(l => l > -1e-9));
  for (const sc of structureCheck(o.rho)) { assert.ok(Math.abs(sc.qq) < 1e-9); assert.ok(Math.abs(sc.coherenceTerm - sc.rho) < 1e-9); }
  const d = new Organ({ lambda: 0.5, gamma: 4, decohere: true, seed: 1, p0: p, q: p }); for (let k = 0; k < 40; k++) { d.offer(offer(k)); d.land((k * 3) % 10); }
  assert.equal(coherenceL1(d.rho), 0);
  const M = offerKraus(v(3), Math.PI / 4); M.forEach((r, i) => r.forEach((x, j) => assert.ok(Math.abs(x - M[j][i]) < 1e-12)));
  assert.equal(novelty('0123'), 1000 * 2 / 4); assert.equal(LADDER.length, 9);
});

test('with no organ the research runtime equals DEE-1L GATES; QB and DEC run and differ only by coherence', { timeout: 900000 }, () => {
  const s = born();
  const a = runQb(s, ticks, 'w', 1, 'x', 'ND1B', { lambda: 0.5, gamma: 4 }), b = runDee(s, ticks, 'w', 1, 'x', { probe: true });
  assert.equal(a.metrics.path, b.metrics.path); assert.deepEqual(a.metrics.entries, b.metrics.entries);
  const q = runQb(s, ticks, 'q', 1, 'x', 'QB', { lambda: 0.5, gamma: 4 }, 20), d = runQb(s, ticks, 'q', 1, 'x', 'DEC', { lambda: 0.5, gamma: 4 }, 20);
  const mq = measures(q), md = measures(d);
  assert.ok(mq.organChoices > 20 && mq.offersRead > 0 && mq.landingsRead > 0, JSON.stringify(mq).slice(0, 300));
  assert.ok((mq.meanCoherence ?? 0) > 0 && md.meanCoherence === 0);
  const st = structure(q.states, d.states); assert.equal(st.pass, true, JSON.stringify(st));
  const r2 = runQb(s, ticks, 'q', 1, 'x', 'QB', { lambda: 0.5, gamma: 4 }); assert.equal(r2.metrics.path, q.metrics.path, 'determinism');
  console.log('synthetic QB', JSON.stringify({ T: mq.T_excess, nov: mq.novelty, E: mq.E, diff: mq.differsFromHer, prec: mq.precursorDecided, coh: mq.meanCoherence, zones: mq.zonesVisited }),
    'DEC', JSON.stringify({ T: md.T_excess, nov: md.novelty, E: md.E, diff: md.differsFromHer, zones: md.zonesVisited }));
});
