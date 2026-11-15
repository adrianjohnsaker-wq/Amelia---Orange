// WT-6L / WT-7L machinery checks: synthetic states and inputs only, no study data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { bornAmeliaOf } from '../../src/core/ameliaRuntimes';
import { captureLiveField, createLiveField } from '../../src/outside/LiveFieldLoop';
import { setLiveSourceEnabled } from '../../src/outside/LiveSyntheticSourceSession';
import { runWt5l, wt5lId, sameId } from './wt5l/wt5l';
import { pre24, structureStats, onceThrough, holm, stateDiff } from './wt6l7l/wt6l7l';

const v = (z: number) => { const a = Array(10).fill(0.02); a[z] = 0.82; return a; };
const offer = (k: number) => ({ eventId: `e${k}`, channel: 'LINGUISTIC', sourceDigest: createHash('sha256').update(String(k)).digest('hex'), attentionVector: v((k * 7) % 10) });
const ticks = Array.from({ length: 96 }, (_, k) => ({ offers: Array.from({ length: k % 4 }, (_, i) => offer(k * 5 + i)) }));
function bornRecord() {
  const rt: any = bornAmeliaOf('nd1'); rt.setAdmissionRule('relative-v1'); rt.step();
  const field: any = setLiveSourceEnabled(createLiveField(rt, { seed: 101, depth: 288, preset: 'SYZYGETIC_GRID', size: 12 }), true);
  return { state: JSON.parse(JSON.stringify(rt.exportState())), fieldCheckpoint: captureLiveField(field, false), revision: 1,
    controls: { advisoryWeight: 0.722, momentumDamping: 0.88 } } as any;
}

test('PRE-24 takes 24 consecutive ticks from 5(u-1), wrapping', () => {
  const pre = Array.from({ length: 65 }, (_, k) => ({ offers: [offer(k)] }));
  assert.deepEqual(pre24(pre, 1).map(t => t.offers[0].eventId), Array.from({ length: 24 }, (_, k) => `e${k}`));
  assert.deepEqual(pre24(pre, 12).map(t => t.offers[0].eventId), Array.from({ length: 24 }, (_, k) => `e${(55 + k) % 65}`));
  const s = structureStats([{ offers: [offer(1), offer(2)] }, { offers: [] }], 4);
  assert.deepEqual(s, { offersPerTick: 1, shareTicks4plus: 0, meanIterationsBetweenOffers: (1 + 29 + 1) / 3, offers: 4 });
});

test('once through in slices equals a single pass', { timeout: 600000 }, () => {
  const s = bornRecord();
  const single = runWt5l(s, ticks, 'o', 1, 96, sameId);
  const sliced = onceThrough(s, ticks, 'o', 1, sameId, 48);
  assert.equal(sliced.metrics.path, single.metrics.path);
  assert.deepEqual(sliced.metrics.entries, single.metrics.entries); assert.equal(sliced.metrics.flowSteps, single.metrics.flowSteps);
  assert.equal(sliced.record.fieldCheckpoint.checksum, single.record.fieldCheckpoint.checksum);
  assert.equal(sliced.summary.E, single.summary.E);
  const d = stateDiff(s, single.record); assert.equal(d.S837.step + single.metrics.path.length, d.S1981.step);
  void wt5lId;
});

test('Holm over two contrasts', () => {
  assert.deepEqual(holm([{ name: 'C1', mean: 1, p: 0.02 }, { name: 'C2', mean: 1, p: 0.04 }]).map(x => x.survives), [true, true]);
  assert.deepEqual(holm([{ name: 'C1', mean: 1, p: 0.03 }, { name: 'C2', mean: 1, p: 0.04 }]).map(x => x.survives), [false, false]);
  assert.deepEqual(holm([{ name: 'C1', mean: 1, p: 0.001 }, { name: 'C2', mean: 1, p: 0.2 }]).map(x => x.survives), [true, false]);
});
