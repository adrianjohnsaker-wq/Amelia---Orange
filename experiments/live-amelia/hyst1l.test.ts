// HYST-1L machinery checks: synthetic states, inputs and series only, no study data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { bornAmeliaOf } from '../../src/core/ameliaRuntimes';
import { captureLiveField, createLiveField } from '../../src/outside/LiveFieldLoop';
import { setLiveSourceEnabled } from '../../src/outside/LiveSyntheticSourceSession';
import { wt3lChunk } from '../../src/cloud/wt3l';
import { begin } from './wt5l/wt5l';
import { armRecord, runSpan, h1, h2, h3, hyst1lId, ARMS, inscribes } from './hyst1l/hyst1l';

const v = (z: number, w = 0.82) => { const a = Array(10).fill((1 - w) / 9); a[z] = w; return a; };
const offer = (k: number) => ({ eventId: `e${k}`, channel: 'LINGUISTIC', sourceDigest: createHash('sha256').update(String(k)).digest('hex'),
  attentionVector: v([3, 6, 2, 5, 7, 1, 8][k % 7]) });
const ticks = Array.from({ length: 140 }, (_, k) => ({ offers: Array.from({ length: (k % 3) + 1 }, (_, i) => offer(k * 5 + i)) }));
function record(theta = 3) {   // a short Θ so that lines of flight occur in a short synthetic run
  const rt: any = bornAmeliaOf('nd1'); rt.setAdmissionRule('outside-lane-v1'); for (let i = 0; i < 60; i++) rt.step();
  const field: any = setLiveSourceEnabled(createLiveField(rt, { seed: 101, depth: 288, preset: 'SYZYGETIC_GRID', size: 12 }), true);
  const st = JSON.parse(JSON.stringify(rt.exportState())); st.nd1 = { ...(st.nd1 ?? {}), theta };
  st.qabbalaGates = st.qabbalaGates.filter((g: any) => !String(g.id).startsWith('warpborn'));   // a known set, as hers is
  st.qabbalaGates.push(...[[3, 0], [6, 0], [3, 7], [6, 1]].map(([s, t]) => ({ id: `warpborn-${s}-${t}`, source: s, target: t, label: `ND-1 Warp-born ${s}->${t}`,
    flux: 0.5, permeability: 0.5, isOpen: true, resistance: 0.3 })));
  return { state: st, fieldCheckpoint: captureLiveField(field, false), revision: 1, controls: { advisoryWeight: 0.722, momentumDamping: 0.88 } } as any;
}
const ids = (r: any) => r.state.qabbalaGates.map((g: any) => g.id).filter((x: string) => x.startsWith('warpborn')).sort();

test('arm records differ from the start only in the named Warp-born gates', () => {
  const s = record();
  for (const a of ARMS) { const r = armRecord(s, a);
    for (const k of Object.keys(s.state)) if (k !== 'qabbalaGates') assert.equal(JSON.stringify(r.state[k]), JSON.stringify(s.state[k]), `${a} ${k}`);
    assert.equal(JSON.stringify(r.state.qabbalaGates.filter((g: any) => !g.id.startsWith('warpborn'))), JSON.stringify(s.state.qabbalaGates.filter((g: any) => !g.id.startsWith('warpborn')))); }
  assert.deepEqual(ids(armRecord(s, 'ALL')), ids(s)); assert.deepEqual(ids(armRecord(s, 'NO-PLEX')), ['warpborn-3-7', 'warpborn-6-1']);
  assert.deepEqual(ids(armRecord(s, 'NONE')), []); assert.equal(inscribes('LIVE-STRIPPED'), true); assert.equal(inscribes('NONE'), false);
});

test('with inscription on the logger changes nothing; with it off lines of flight occur and the gate table never changes', { timeout: 900000 }, () => {
  const s = armRecord(record(), 'NONE');
  let plain: any = begin(s, 'p', 1);
  for (let k = 0; k < ticks.length; k += 96) { const part = ticks.slice(k, k + 96); plain = wt3lChunk({ record: plain.record, metrics: { ...plain.metrics, ticksDone: 0 } }, part, part.length, hyst1lId); }
  const on = runSpan(s, ticks, 'p', 1, true);
  assert.equal(on.metrics.path, plain.metrics.path); assert.deepEqual(on.metrics.entries, plain.metrics.entries);
  assert.equal(on.steps.length, on.metrics.path.length); on.steps.forEach((x, i) => assert.equal(String(x.zone), on.metrics.path[i]));
  const off = runSpan(s, ticks, 'q', 1, false);
  assert.ok(off.steps.some(x => x.flight), 'lines of flight occur');
  assert.deepEqual(ids(off.record), []);
  assert.ok(on.steps.some(x => x.newGates.length) || ids(on.record).length > 0, 'with inscription on, gates are written');
});

test('the measures', () => {
  assert.deepEqual(h1([3, 1, 1, 6, 0, 9]), { exits: 2, censored: 1, mean: 2 });          // out 2 steps, then out 2 to the end (censored)
  const t = [...Array(48).fill(0.5).map((x, i) => x + (i % 2) * 0.02), 0.9, 0.8, 0.4, 0.95, 0.4];
  const r = h2(t); assert.equal(r.spikes, 2); assert.equal(r.median, 1.5);              // spikes at 48 (recovers at 50: 2) and 51 (52: 1)
  const st: any[] = [{ applied: v(2), flight: false, open: [2, 4], firstHop: 2 }, { applied: v(4), flight: false, open: [2, 4], firstHop: 2 },
    { applied: v(2), flight: false, open: [2], firstHop: 2 }, { applied: null, flight: false, open: [2, 4], firstHop: 4 }];
  const h = h3(st as any); assert.equal(h.eligible, 2); assert.equal(h.hits, 1); assert.equal(h.Texcess, 0);
});
