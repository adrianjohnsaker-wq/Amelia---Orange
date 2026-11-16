// WT-9L / WT-10L machinery checks: synthetic states and inputs only, no study data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { bornAmeliaOf } from '../../src/core/ameliaRuntimes';
import { captureLiveField, createLiveField } from '../../src/outside/LiveFieldLoop';
import { setLiveSourceEnabled } from '../../src/outside/LiveSyntheticSourceSession';
import { wt3lChunk } from '../../src/cloud/wt3l';
import { begin, convertAtSwitch, wt5lId } from './wt5l/wt5l';
import { choose, runLogged, wt9lId, precededEntries, slotStats, swap, partitionCheck, canon, PARTS, type Part } from './wt9l10l/machinery';

const v = (z: number, w = 0.82) => { const a = Array(10).fill((1 - w) / 9); a[z] = w; return a; };
const offer = (k: number) => ({ eventId: `e${k}`, channel: 'LINGUISTIC', sourceDigest: createHash('sha256').update(String(k)).digest('hex'), attentionVector: v((k * 7) % 10) });
const ticks = Array.from({ length: 23 }, (_, k) => ({ offers: Array.from({ length: (k % 3) + 1 }, (_, i) => offer(k * 5 + i)) }));
function bornRecord(kind: 'classic' | 'nd1', steps = 1) {
  const rt: any = bornAmeliaOf(kind); rt.setAdmissionRule('relative-v1'); for (let i = 0; i < steps; i++) rt.step();
  const field: any = setLiveSourceEnabled(createLiveField(rt, { seed: 101, depth: 288, preset: 'SYZYGETIC_GRID', size: 12 }), true);
  return { state: JSON.parse(JSON.stringify(rt.exportState())), fieldCheckpoint: captureLiveField(field, false), revision: 1,
    controls: { advisoryWeight: 0.722, momentumDamping: 0.88 } } as any;
}

test('the selectors choose by the registered rules, ties to the earliest', () => {
  const pool = [offer(0), offer(1), offer(2), offer(3)]; // attention peaks at 0, 7, 4, 1
  assert.equal(choose('RECORDED', pool, 7), 0);
  assert.equal(choose('TOWARD', pool, 9), 0); assert.equal(choose('AWAY', pool, 9), 0);
  const p2 = [{ ...offer(9), attentionVector: v(3) }, { ...offer(8), attentionVector: v(6) }, { ...offer(7), attentionVector: v(3) }];
  assert.equal(choose('TOWARD', p2, 2), 0); assert.equal(choose('TOWARD', p2, 5), 1); assert.equal(choose('AWAY', p2, 2), 1);
  assert.equal(choose('BLIND', [offer(0), { ...offer(1), attentionVector: v(5) }], 0), 1);
});

test('RECORDED equals the plain replay; the logger changes nothing; every pass delivers the window\'s offers in its slots', { timeout: 900000 }, () => {
  const s = bornRecord('nd1');
  const plain = wt3lChunk(begin(s, 'p', 1), ticks, 96, wt9lId);
  const rec = runLogged(s, ticks, 'p', 1, wt9lId, 'RECORDED');
  assert.equal(rec.metrics.path, plain.metrics.path); assert.deepEqual(rec.metrics.entries, plain.metrics.entries);
  assert.equal(rec.steps.length, rec.metrics.path.length);
  rec.steps.forEach((x, i) => assert.equal(String(x.zone), rec.metrics.path[i]));
  const tw = runLogged(s, ticks, 't', 1, wt9lId, 'TOWARD');
  const delivered = tw.record.state.memoryState.events.flatMap((e: any) => (e.encounters ?? []).map((d: any) => String(d.eventId))).filter((id: string) => id.startsWith('wt9l:1:0:'));
  const firstPass = new Set(delivered.map((id: string) => id.split(':')[3]));
  const window = new Set(ticks.flatMap(t => t.offers.map(o => o.eventId)));
  assert.ok([...firstPass].every(id => window.has(id)), 'only window offers');
  assert.equal(slotStats(tw.steps).slots, rec.metrics.offered);
  assert.ok(precededEntries(rec.steps).every(e => e.zonesBefore.length <= 3));
});

test('a part swap changes only its own keys; all five reproduce the donor; shared parts are checked', { timeout: 600000 }, () => {
  // As with her two states: the donor is the receiver lived on in ND-1b (which leaves the gate table as it is), with another body.
  const a = convertAtSwitch(bornRecord('classic', 3), 'x');
  const rt: any = bornAmeliaOf('nd1'); rt.importState(JSON.parse(JSON.stringify(a.state))); for (let i = 0; i < 40; i++) rt.step(undefined, i % 3 ? undefined : offer(i));
  const b = { ...a, state: JSON.parse(JSON.stringify(rt.exportState())), fieldCheckpoint: bornRecord('classic', 40).fieldCheckpoint, controls: { advisoryWeight: 0.7, momentumDamping: 0.9 } };
  b.state.qabbalaGates = JSON.parse(JSON.stringify(a.state.qabbalaGates));   // her two real states share the gate table (checked at run time); a newborn may write a Warp-born gate
  assert.notEqual(canon(a.state.qabbalaZones), canon(b.state.qabbalaZones));
  for (const p of Object.keys(PARTS) as Part[]) {
    const r = swap(a, b, [p]); const P = PARTS[p];
    for (const k of Object.keys(r.state)) if (!(P.state as readonly string[]).includes(k) && k !== 'nd1') assert.equal(canon(r.state[k]), canon(a.state[k]), `${p} changed ${k}`);
    for (const k of Object.keys(r.state.nd1 ?? {})) if (!(P.nd1 as readonly string[]).includes(k)) assert.equal(canon(r.state.nd1[k]), canon(a.state.nd1[k]));
  }
  const c = partitionCheck(a, b); assert.deepEqual(c.partitionDiffer, []); assert.ok(c.ok, JSON.stringify(c));
  const g = { ...b, state: { ...b.state, admissionRule: 'fixed-0.72' } };
  assert.deepEqual(partitionCheck(a, g).sharedDiffer, ['admissionRule']);
  void wt5lId;
});
