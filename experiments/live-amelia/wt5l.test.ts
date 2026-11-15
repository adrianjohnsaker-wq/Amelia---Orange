// WT-5L machinery checks: synthetic states and inputs only, no WT-5L data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { bornAmeliaOf } from '../../src/core/ameliaRuntimes';
import { captureLiveField, createLiveField } from '../../src/outside/LiveFieldLoop';
import { setLiveSourceEnabled } from '../../src/outside/LiveSyntheticSourceSession';
import { wt3lBegin, wt3lChunk } from '../../src/cloud/wt3l';
import { convertAtSwitch, begin, runWt5l, preContent, liveSpan, fidelity, a1Reading, sameId, wt5lId } from './wt5l/wt5l';

const v = (z: number) => { const a = Array(10).fill(0.02); a[z] = 0.82; return a; };   // sums to 1
const offer = (k: number) => ({ eventId: `e${k}`, channel: 'LINGUISTIC', sourceDigest: createHash('sha256').update(String(k)).digest('hex'), attentionVector: v((k * 7) % 10) });
const ticks = Array.from({ length: 20 }, (_, k) => ({ offers: Array.from({ length: k % 3 }, (_, i) => offer(k * 5 + i)) }));
function bornRecord(kind: 'classic' | 'nd1', theta?: number) {
  const rt: any = bornAmeliaOf(kind); rt.setAdmissionRule('relative-v1'); if (theta) rt.setWarpTheta(theta); rt.step();
  const field: any = setLiveSourceEnabled(createLiveField(rt, { seed: 101, depth: 288, preset: 'SYZYGETIC_GRID', size: 12 }), true);
  return { state: JSON.parse(JSON.stringify(rt.exportState())), fieldCheckpoint: captureLiveField(field, false), revision: 1,
    controls: { advisoryWeight: 0.722, momentumDamping: 0.88 } } as any;
}

test('the switch conversion is the cloud tick path: Classic imported into ND-1b, Θ = 24, no steps', () => {
  const classic = bornRecord('classic'); assert.notEqual(classic.state.runtimeKind, 'nd1');
  const c = convertAtSwitch(classic, 'x');
  const ref: any = bornAmeliaOf('nd1'); const old: any = bornAmeliaOf('classic'); old.importState(JSON.parse(JSON.stringify(classic.state)));
  ref.importState(old.exportState());
  const noTime = (st: any) => JSON.stringify({ ...st, snapshots: (st.snapshots ?? []).map((x: any) => ({ ...x, timestamp: 0 })) });
  assert.equal(noTime(c.state), noTime(ref.exportState()));
  assert.equal(c.state.nd1.theta, 24); assert.equal(c.state.stepCount, classic.state.stepCount);
});

test('the step logger leaves the replay unchanged and logs every runtime step', { timeout: 600000 }, () => {
  const s = bornRecord('nd1', 12);
  const plain = wt3lChunk(wt3lBegin(s, 'p', 1, 'T12', 'x'), ticks, 96, wt5lId);
  const logged = runWt5l(s, ticks, 'p', 1, 96, wt5lId);
  assert.equal(logged.metrics.path, plain.metrics.path); assert.deepEqual(logged.metrics.final, plain.metrics.final);
  assert.equal(logged.log.length, logged.metrics.path.length);
  logged.log.forEach((x, i) => { assert.equal(x.step, logged.log[0].step + i); assert.equal(String(x.to), logged.metrics.path[i]); });
});

test('once through with original ids: her own instrument on the replay\'s memory reproduces the log exactly (FAITHFUL on itself)', { timeout: 600000 }, () => {
  const s = convertAtSwitch(bornRecord('classic'), 'x');
  const r = runWt5l(s, ticks, 'a1', 0, ticks.length, sameId);
  assert.equal(r.metrics.ticksDone, ticks.length);
  const ids = new Set(r.record.state.memoryState.events.flatMap((e: any) => (e.encounters ?? []).map((d: any) => d.eventId)));
  assert.ok(ids.has('e5') && ![...ids].some((i: any) => String(i).startsWith('wt5l:')), 'original ids kept');
  const first = r.log[0].step, last = r.log.at(-1)!.step;
  const live = liveSpan(r.record.state.memoryState.events, first, last, Number(s.state.currentZone));
  const f = fidelity(r.log, live.steps);
  assert.equal(f.zoneShare, 1); assert.equal(f.digestShare, 1);
  assert.deepEqual(live.entries, r.metrics.entries); assert.equal(live.flowSteps, r.metrics.flowSteps);
  assert.ok(Math.abs(live.warpShare - r.summary.M1_warpShare) < 1e-12);
  assert.equal(a1Reading(f, { E: r.summary.E!, warpShare: r.summary.M1_warpShare }, live), 'FAITHFUL');
  // A one-step perturbation is caught.
  const bad = live.steps.map((x, i) => i === 7 ? { ...x, to: (x.to + 1) % 10 } : x);
  assert.equal(fidelity(r.log, bad).firstZoneDivergence, live.steps[7].step);
});

test('PRE-CONTENT keeps ticks, slots and ids and replaces content in order from offset 14(u-1), cycled', () => {
  const pool = Array.from({ length: 30 }, (_, k) => ({ channel: `C${k}`, sourceDigest: 'a'.repeat(63) + (k % 10), attentionVector: v(k % 10) }));
  const out = preContent(ticks, pool, 3); let j = 0;
  out.forEach((t, k) => { assert.equal(t.offers.length, ticks[k].offers.length);
    t.offers.forEach((o, i) => { assert.equal(o.eventId, ticks[k].offers[i].eventId); assert.equal(o.channel, pool[(28 + j++) % 30].channel); }); });
  assert.ok(j > 2);
  const b = begin(bornRecord('nd1'), 'b', 1); assert.equal(b.metrics.ticksDone, 0);
});
