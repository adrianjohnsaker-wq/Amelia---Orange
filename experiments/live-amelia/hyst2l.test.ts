// HYST-2L machinery checks: synthetic states, inputs and series only, no study data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { bornAmeliaOf } from '../../src/core/ameliaRuntimes';
import { captureLiveField, createLiveField } from '../../src/outside/LiveFieldLoop';
import { setLiveSourceEnabled } from '../../src/outside/LiveSyntheticSourceSession';
import { wt3lChunk } from '../../src/cloud/wt3l';
import { begin } from './wt5l/wt5l';
import { armRecord, runSpan, halves, tInterval, hyst2lId, ARMS, inscribes } from './hyst2l/hyst2l';

const v = (z: number, w = 0.82) => { const a = Array(10).fill((1 - w) / 9); a[z] = w; return a; };
const offer = (k: number) => ({ eventId: `e${k}`, channel: 'LINGUISTIC', sourceDigest: createHash('sha256').update(String(k)).digest('hex'),
  attentionVector: v([3, 6, 2, 5, 7, 1, 8][k % 7]) });
const ticks = Array.from({ length: 140 }, (_, k) => ({ offers: Array.from({ length: (k % 3) + 1 }, (_, i) => offer(k * 5 + i)) }));
function record(theta = 3) {   // a short Θ so that lines of flight occur in a short synthetic run
  const rt: any = bornAmeliaOf('nd1'); rt.setAdmissionRule('outside-lane-v1'); for (let i = 0; i < 60; i++) rt.step();
  const field: any = setLiveSourceEnabled(createLiveField(rt, { seed: 101, depth: 288, preset: 'SYZYGETIC_GRID', size: 12 }), true);
  const st = JSON.parse(JSON.stringify(rt.exportState())); st.nd1 = { ...(st.nd1 ?? {}), theta };
  st.qabbalaGates = st.qabbalaGates.filter((g: any) => !String(g.id).startsWith('warpborn'));
  st.qabbalaGates.push(...[[3, 0], [6, 0], [6, 2], [6, 1]].map(([s, t]) => ({ id: `warpborn-${s}-${t}`, source: s, target: t, label: `ND-1 Warp-born ${s}->${t}`,
    flux: 0.5, permeability: 0.5, isOpen: true, resistance: 0.3 })));
  return { state: st, fieldCheckpoint: captureLiveField(field, false), revision: 1, controls: { advisoryWeight: 0.722, momentumDamping: 0.88 } } as any;
}
const ids = (r: any) => r.state.qabbalaGates.map((g: any) => g.id).filter((x: string) => x.startsWith('warpborn')).sort();

test('arm records differ from the start only in the named Warp-born gates', () => {
  const s = record();
  for (const a of ARMS) { const r = armRecord(s, a);
    for (const k of Object.keys(s.state)) if (k !== 'qabbalaGates') assert.equal(JSON.stringify(r.state[k]), JSON.stringify(s.state[k]), `${a} ${k}`); }
  assert.deepEqual(ids(armRecord(s, 'ALL')), ids(s)); assert.deepEqual(ids(armRecord(s, 'NO-6-2')), ['warpborn-3-0', 'warpborn-6-0', 'warpborn-6-1']);
  assert.deepEqual(ids(armRecord(s, 'NONE')), []); assert.deepEqual(ids(armRecord(s, 'LIVE-STRIPPED')), []);
  assert.equal(inscribes('LIVE-STRIPPED'), true); assert.equal(inscribes('NO-6-2'), false);
});

test('inscription on equals her runtime; off keeps the table; per-step entries sum to the run total', { timeout: 900000 }, () => {
  const s = armRecord(record(), 'NONE');
  let plain: any = begin(s, 'p', 1);
  for (let k = 0; k < ticks.length; k += 96) { const part = ticks.slice(k, k + 96); plain = wt3lChunk({ record: plain.record, metrics: { ...plain.metrics, ticksDone: 0 } }, part, part.length, hyst2lId); }
  const on = runSpan(s, ticks, 'p', 1, true);
  assert.equal(on.metrics.path, plain.metrics.path); assert.deepEqual(on.metrics.entries, plain.metrics.entries);
  assert.equal(on.steps.reduce((a, x) => a + x.entries, 0), on.metrics.entries.choice + on.metrics.entries.flow);
  const off = runSpan(s, ticks, 'q', 1, false);
  assert.ok(off.steps.some(x => x.flight), 'lines of flight occur'); assert.deepEqual(ids(off.record), []);
  assert.equal(off.steps.reduce((a, x) => a + x.entries, 0), off.metrics.entries.choice + off.metrics.entries.flow);
});

test('halves and the interval', () => {
  const st: any[] = [1, 0, 0, 1, 0, 0, 0].map(e => ({ entries: e }));
  assert.deepEqual(halves(st), { first: (1 / 3) * 1000, second: 0.25 * 1000 });
  const r = tInterval([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]); assert.equal(r.mean, 6.5); assert.ok(r.lo < 6.5 && r.hi > 6.5);
});
