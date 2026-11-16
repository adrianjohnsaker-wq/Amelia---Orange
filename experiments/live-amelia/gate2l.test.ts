// GATE-2L machinery checks: synthetic states, inputs and stubs only, no study data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { bornAmeliaOf } from '../../src/core/ameliaRuntimes';
import { captureLiveField, createLiveField } from '../../src/outside/LiveFieldLoop';
import { setLiveSourceEnabled } from '../../src/outside/LiveSyntheticSourceSession';
import { attachLane, runGate, measures, coupling } from './gate2l/machinery';

const v = (z: number, w = 0.82) => { const a = Array(10).fill((1 - w) / 9); a[z] = w; return a; };
const offer = (k: number) => ({ eventId: `e${k}`, channel: 'LINGUISTIC', sourceDigest: createHash('sha256').update(String(k)).digest('hex'), attentionVector: v((k * 7) % 10) });
const ticks = Array.from({ length: 23 }, (_, k) => ({ offers: Array.from({ length: (k % 3) + 1 }, (_, i) => offer(k * 5 + i)) }));
function bornRecord() {
  const rt: any = bornAmeliaOf('nd1'); rt.setAdmissionRule('relative-v1'); rt.step();
  const field: any = setLiveSourceEnabled(createLiveField(rt, { seed: 101, depth: 288, preset: 'SYZYGETIC_GRID', size: 12 }), true);
  return { state: JSON.parse(JSON.stringify(rt.exportState())), fieldCheckpoint: captureLiveField(field, false), revision: 1,
    controls: { advisoryWeight: 0.722, momentumDamping: 0.88 } } as any;
}

// A stub runtime: the standard gate is recorded as called; tension history calm and flat unless set.
function stub(queue: any[], opts: { locked?: boolean; tension?: number; hist?: number[] } = {}) {
  const calls: string[] = [];
  const rt: any = { deferredEncounters: [...queue], tensionHistory: opts.hist ?? Array.from({ length: 48 }, (_, i) => 0.5 + (i % 2) * 0.02),
    decide: (_g: any, e: any) => e.bad ? { disposition: 'REFUSE', reason: 'x' } : { disposition: 'DEFER', reason: 'Field tension exceeds' },
    gateEncounters: () => { calls.push('standard'); return { attended: undefined, encounterDecisions: [] }; } };
  const gov = { getTelemetry: () => ({ governorStatus: opts.locked ? 'LOCKED_RECOVERY' : 'NOMINAL', antiLockIntegrity: 99, deformationFieldTension: opts.tension ?? 0.5 }) };
  return { rt: attachLane(rt), gov, calls };
}
const body = (k: number) => ({ eventId: `b${k}`, channel: 'SYNTHETIC_FIELD' });
const out = (k: number, bad = false) => ({ eventId: `o${k}`, channel: 'TAROT', bad });

test('the lane: an arriving Outside encounter is admitted on arrival and the body head waits; order is kept within the lane', () => {
  let { rt, gov } = stub([body(1)]);
  let r = rt.gateEncounters(gov, out(1));
  assert.equal(r.attended.eventId, 'o1'); assert.deepEqual(rt.deferredEncounters.map((x: any) => x.eventId), ['b1']);
  assert.deepEqual(r.encounterDecisions.map((d: any) => [d.eventId, d.disposition]), [['b1', 'DEFER'], ['o1', 'ATTEND']]);
  ({ rt, gov } = stub([body(1), out(1)]));                                  // a waiting Outside encounter goes first; the arrival queues behind it
  r = rt.gateEncounters(gov, out(2));
  assert.equal(r.attended.eventId, 'o1'); assert.deepEqual(rt.deferredEncounters.map((x: any) => x.eventId), ['b1', 'o2']);
  ({ rt, gov } = stub([body(1)]));                                          // a structurally invalid Outside encounter is still refused
  r = rt.gateEncounters(gov, out(3, true)); assert.equal(r.attended, undefined);
  assert.equal(r.encounterDecisions.at(-1).disposition, 'REFUSE');
  ({ rt, gov } = stub([body(1)]));                                          // a body arrival replaces the waiting body observation, as now
  r = rt.gateEncounters(gov, body(2)); assert.deepEqual(rt.deferredEncounters.map((x: any) => x.eventId), ['b2']);
});

test('excessive load (locked, strained, crowded, short history) returns to the standard gate', () => {
  for (const o of [{ locked: true }, { tension: 0.9 }, { hist: [0.5] }]) { const { rt, gov, calls } = stub([], o); rt.gateEncounters(gov, out(1)); assert.deepEqual(calls, ['standard']); }
  const { rt, gov, calls } = stub(Array.from({ length: 16 }, (_, i) => body(i))); rt.gateEncounters(gov, out(1)); assert.deepEqual(calls, ['standard']);
});

test('LANE with load forced excessive equals CURRENT; LANE admits on arrival and loses nothing', { timeout: 900000 }, () => {
  const s = bornRecord();
  const cur = runGate(s, ticks, 'c', 1, 'CURRENT'), forced = runGate(s, ticks, 'f', 1, 'LANE', undefined, true);
  assert.equal(forced.metrics.path, cur.metrics.path); assert.deepEqual(forced.metrics.entries, cur.metrics.entries);
  assert.equal(forced.record.state.memoryState.events.at(-1).eventDigest, cur.record.state.memoryState.events.at(-1).eventDigest);
  const lane = runGate(s, ticks, 'l', 1, 'LANE'); const mc = measures(cur), ml = measures(lane);
  assert.ok(ml.onArrival > mc.onArrival, `on arrival ${ml.onArrival} vs ${mc.onArrival}`);
  assert.equal(ml.refused, 0);
  const queued = new Set((lane.record.state.deferredEncounters ?? []).map((e: any) => String(e.eventId)));
  for (const a of lane.arrivals) assert.ok(a.admittedAt !== null || queued.has(a.id), `lost ${a.id}`);
  assert.equal(lane.zones.length, lane.metrics.path.length);
});

test('coupling counts the 5-step window from admission against the rotation', () => {
  const arr = [{ id: 'a', at: 0, admittedAt: 0, refused: false, peak: 4 }, { id: 'b', at: 3, admittedAt: 5, refused: false, peak: 1 }];
  const c = coupling(arr as any, [9, 9, 4, 9, 9, 9, 9, 9, 9, 9, 1]);
  assert.equal(c.hits, 0.5); assert.equal(c.chance, 0); assert.equal(c.C, 0.5);
});
