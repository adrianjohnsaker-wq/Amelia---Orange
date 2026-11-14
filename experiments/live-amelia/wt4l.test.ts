// WT-4L machinery checks: synthetic states and inputs only, no WT-4L data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { bornAmeliaOf } from '../../src/core/ameliaRuntimes';
import { captureLiveField, createLiveField } from '../../src/outside/LiveFieldLoop';
import { setLiveSourceEnabled } from '../../src/outside/LiveSyntheticSourceSession';
import { wt3lBegin, wt3lChunk } from '../../src/cloud/wt3l';
import { armRecord, holm, ARMS } from './wt4l/run_actions';

function born() {
  const rt: any = bornAmeliaOf('nd1'); rt.setAdmissionRule('relative-v1'); rt.setWarpTheta(12); rt.step();
  const field: any = setLiveSourceEnabled(createLiveField(rt, { seed: 101, depth: 288, preset: 'SYZYGETIC_GRID', size: 12 }), true);
  return { state: JSON.parse(JSON.stringify(rt.exportState())), fieldCheckpoint: captureLiveField(field, false), revision: 1,
    controls: { advisoryWeight: 0.722, momentumDamping: 0.88 } } as any;
}
const v = (z: number) => { const a = Array(10).fill(0.02); a[z] = 0.82; return a; };
const ticks = Array.from({ length: 24 }, (_, k) => ({ offers: Array.from({ length: k % 3 }, (_, i) => ({ eventId: `e${k}.${i}`, channel: 'LINGUISTIC',
  sourceDigest: createHash('sha256').update(`${k}.${i}`).digest('hex'), attentionVector: v((k * 7 + i) % 10) })) }));
const W = new Set([3, 6]);

/** Independent recount from the memory records a run wrote: per step (blockIndex), records in order. */
function recount(events: any[], from: number, startZone: number) {
  let choice = 0, flow = 0, flowSteps = 0, zone = startZone, i = from;
  while (i < events.length) {
    const bi = events[i].blockIndex; let k = 0, prev = zone;
    for (; i < events.length && events[i].blockIndex === bi; i++, k++) { const t = Number(events[i].targetZone);
      if (!W.has(prev) && W.has(t)) k === 0 ? choice++ : flow++; prev = t; }
    if (k > 1) flowSteps++; zone = prev;
  }
  return { choice, flow, flowSteps };
}

test('the entry counter equals an independent hop-by-hop recount of her memory', { timeout: 600000 }, () => {
  const s = born(); const n0 = s.state.memoryState.events.length;
  const r = wt3lChunk(wt3lBegin(s, 'x', 1, 'T12', 'x'), ticks, 30);
  const re = recount(r.record.state.memoryState.events, n0, Number(s.state.currentZone));
  assert.deepEqual(r.metrics.entries, { choice: re.choice, flow: re.flow });
  assert.equal(r.metrics.flowSteps, re.flowSteps);
  assert.ok(re.choice + re.flow > 0 && re.flowSteps > 0, `entries ${JSON.stringify(re)}`);
  console.log('entries', JSON.stringify(r.metrics.entries), 'flow steps', r.metrics.flowSteps, 'of', r.metrics.path.length);
});

test('the arms change only what the registration says', { timeout: 600000 }, () => {
  const backup = born();
  let sc: any = wt3lBegin(backup, 'grow', 1, 'T12', 'x'); for (let k = 0; k < 6; k++) sc = wt3lChunk(JSON.parse(JSON.stringify(sc)), ticks, 10);
  const start = sc.record; const wb = start.state.qabbalaGates.filter((g: any) => g.id.startsWith('warpborn'));
  assert.ok(wb.length > 0, 'the grown copy has Warp-born gates');
  const base = armRecord(start, backup, 'BASE'), nowb = armRecord(start, backup, 'NO-WB'), bl = armRecord(start, backup, 'BASELINE-1981');
  const old = armRecord(start, backup, 'STATE-1981');
  assert.equal(JSON.stringify(base), JSON.stringify(start));
  assert.equal(nowb.state.qabbalaGates.length, start.state.qabbalaGates.length - wb.length);
  assert.ok(nowb.state.qabbalaGates.every((g: any) => !g.id.startsWith('warpborn')));
  assert.deepEqual(bl.state.nd1.baseline, backup.state.nd1.baseline);
  assert.notDeepEqual(start.state.nd1.baseline, backup.state.nd1.baseline);
  assert.equal(old.state.nd1.theta, 12); assert.equal(old.state.stepCount, backup.state.stepCount);
  assert.deepEqual(old.fieldCheckpoint, backup.fieldCheckpoint);
  for (const arm of ARMS) assert.equal(armRecord(start, backup, arm).state.nd1.theta, 12);
  const n = wt3lChunk(wt3lBegin(nowb, 'n', 1, 'T12', 'x'), ticks, 2); assert.equal(n.metrics.warpbornAtStart, 0);
});

test('Holm over three arms at 0.05', () => {
  const h = holm([{ arm: 'A', mean: -1, p: 0.01 }, { arm: 'B', mean: -1, p: 0.02 }, { arm: 'C', mean: 1, p: 0.04 }]);
  assert.deepEqual(h.map(x => [x.arm, x.survives, x.lowersE]), [['A', true, true], ['B', true, true], ['C', true, false]]);
  const h2 = holm([{ arm: 'A', mean: -1, p: 0.02 }, { arm: 'B', mean: -1, p: 0.001 }, { arm: 'C', mean: -1, p: 0.5 }]);
  assert.deepEqual(h2.map(x => [x.arm, x.survives]), [['A', true], ['B', true], ['C', false]]);
  const h3 = holm([{ arm: 'A', mean: -1, p: 0.02 }, { arm: 'B', mean: -1, p: 0.03 }, { arm: 'C', mean: -1, p: 0.04 }]);
  assert.ok(h3.every(x => !x.survives), 'smallest p 0.02 > 0.05/3 stops Holm at once');
});
