// POS-1L machinery checks: synthetic states and inputs only, no study data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { bornAmeliaOf } from '../../src/core/ameliaRuntimes';
import { captureLiveField, createLiveField } from '../../src/outside/LiveFieldLoop';
import { setLiveSourceEnabled } from '../../src/outside/LiveSyntheticSourceSession';
import { runGate } from './gate2l/machinery';
import { runArm, queueStart, edgeEntries, ARMS } from './pos1l/pos1l';

const v = (z: number, w = 0.82) => { const a = Array(10).fill((1 - w) / 9); a[z] = w; return a; };
const offer = (k: number) => ({ eventId: `e${k}`, channel: 'LINGUISTIC', sourceDigest: createHash('sha256').update(String(k)).digest('hex'), attentionVector: v((k * 7) % 10) });
const ticks = Array.from({ length: 23 }, (_, k) => ({ offers: Array.from({ length: (k % 3) + 1 }, (_, i) => offer(k * 5 + i)) }));
function laneRecord() {
  const rt: any = bornAmeliaOf('nd1'); rt.setAdmissionRule('outside-lane-v1'); for (let i = 0; i < 60; i++) rt.step();
  const field: any = setLiveSourceEnabled(createLiveField(rt, { seed: 101, depth: 288, preset: 'SYZYGETIC_GRID', size: 12 }), true);
  return { state: JSON.parse(JSON.stringify(rt.exportState())), fieldCheckpoint: captureLiveField(field, false), revision: 1,
    controls: { advisoryWeight: 0.722, momentumDamping: 0.88 } } as any;
}

test('the QUEUE start differs from her copy only in the admission rule; LANE-RECORDED equals the plain replay under her rule', { timeout: 900000 }, () => {
  const s = laneRecord(); assert.equal(s.state.admissionRule, 'outside-lane-v1');
  const q = queueStart(s); assert.equal(q.state.admissionRule, 'relative-v1');
  for (const k of new Set([...Object.keys(s.state), ...Object.keys(q.state)])) if (k !== 'admissionRule') assert.equal(JSON.stringify(q.state[k]), JSON.stringify(s.state[k]), k);
  const rec = runArm(s, q, ticks, 1, 'LANE-RECORDED'), plain = runGate(s, ticks, 'u01-LANE-RECORDED', 1, 'CURRENT');
  assert.equal(rec.metrics.path, plain.metrics.path); assert.deepEqual(rec.metrics.entries, plain.metrics.entries);
  assert.ok(rec.arrivals.some(a => a.admittedAt === a.at), 'the lane admits on arrival');
  const qr = runArm(s, q, ticks, 1, 'QUEUE-TOWARD'); assert.equal(qr.record.state.admissionRule, 'relative-v1');
  assert.ok(qr.arrivals.every(a => a.admittedAt !== a.at), 'the queue never admits on arrival here');
});

test('every arm delivers the same number of offers in the same slots', { timeout: 900000 }, () => {
  const s = laneRecord(), q = queueStart(s);
  const counts = ARMS.map(a => runArm(s, q, ticks, 1, a).arrivals.map(x => x.at).join(','));
  for (const c of counts.slice(1)) assert.equal(c, counts[0]);
});

test('edge entries count the delivery step and the 4 after it, split by her zone before delivery', () => {
  const r: any = { zones: [7, 2, 3, 3, 9, 1, 5, 6, 0], arrivals: [{ at: 1 }, { at: 5 }] };
  const e = edgeEntries(r);
  assert.deepEqual(e.edge, { deliveries: 1, entries: 1 });                 // before step 1 she stood at 7: landings 2,3,3,9,1 -> one entry
  assert.deepEqual(e.elsewhere, { deliveries: 1, entries: 1 });            // before step 5 she stood at 9: landings 1,5,6,0 -> one entry
});
