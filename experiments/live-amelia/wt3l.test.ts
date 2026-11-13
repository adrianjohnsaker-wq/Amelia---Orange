// WT-3L machinery checks (Amendment 0, A0.7): synthetic states and inputs only, no WT-3L data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { bornAmeliaOf } from '../../src/core/ameliaRuntimes';
import { captureLiveField, createLiveField } from '../../src/outside/LiveFieldLoop';
import { setLiveSourceEnabled } from '../../src/outside/LiveSyntheticSourceSession';
import { ameliaTick } from '../../src/cloud/ameliaTick';
import { wt3lBegin, wt3lChunk, wt3lSummary, signFlip, type Wt3lTick } from '../../src/cloud/wt3l';

const inbox = Array.from({ length: 300 }, (_, t) => { const v = Array(10).fill(0.02); v[(t * 7) % 10] = 0.82;
  return { sequence: t, eventId: `in:${t}`, channel: 'LINGUISTIC', sourceDigest: createHash('sha256').update(String(t)).digest('hex'),
    attentionVector: v, occurredAt: '2026-11-11T00:00:00Z', capturedAt: '2026-11-11T00:00:00Z' }; });
const byId = new Map(inbox.map(e => [e.eventId, e]));

function start() {
  const rt: any = bornAmeliaOf('nd1'); rt.setAdmissionRule('relative-v1'); rt.setWarpTheta(12); rt.step();
  const field: any = setLiveSourceEnabled(createLiveField(rt, { seed: 101, depth: 288, preset: 'SYZYGETIC_GRID', size: 12 }), true);
  return { state: JSON.parse(JSON.stringify(rt.exportState())), fieldCheckpoint: captureLiveField(field, false), revision: 1,
    controls: { advisoryWeight: 0.722, momentumDamping: 0.88 },
    outsideLink: { schema: 'amelia.outside-link/v1', enabled: true, since: '2026-01-01T00:00:00Z' } } as any;
}
/** Live: her cloud tick with a metered inbox (a few new encounters per tick), recording what each tick delivered. */
function live(rec: any, nTicks: number) {
  let record = JSON.parse(JSON.stringify(rec)); let zones = ''; const ticks: Wt3lTick[] = [];
  for (let k = 0; k < nTicks; k++) {
    const t = ameliaTick(record, inbox.slice(0, 3 * (k + 1) + (k % 4)) as any, 15, '2026-11-11T00:00:00Z');
    zones += t.zones; record = t.record;
    ticks.push({ offers: t.delivered.map(d => { const e = byId.get(d.eventId)!; return { eventId: e.eventId, channel: e.channel, sourceDigest: e.sourceDigest, attentionVector: e.attentionVector }; }) });
  }
  return { record, zones, ticks };
}
const same = (_u: number, _p: number, id: string) => id;
// Snapshot timestamps are wall-clock (Date.now) and differ between any two runs; nothing reads them back.
const noClock = (st: any) => JSON.stringify(st, (k, v) => (k === 'timestamp' && typeof v === 'number' && v > 1e12 ? 0 : v));

test('the replay reproduces her cloud tick exactly when given what each tick delivered', () => {
  const s = start(); const L = live(s, 8);
  assert.ok(L.ticks.some(t => t.offers.length > 0) && L.ticks.some(t => t.offers.length === 0));
  const b = wt3lBegin(s, 'test', 1, 'T12', '2026-11-11T00:00:00Z');
  const r = wt3lChunk(b, L.ticks, 8, same);
  assert.equal(r.metrics.path, L.zones, 'zone path, Outside steps included');
  assert.equal(noClock(r.record.state), noClock(L.record.state), 'her whole state (wall-clock timestamps aside)');
  assert.equal(r.record.fieldCheckpoint.checksum, L.record.fieldCheckpoint.checksum, 'her body');
});

test('a chunked run equals a single pass; the run is deterministic', () => {
  const s = start(); const { ticks } = live(s, 5);
  const one = wt3lChunk(wt3lBegin(s, 'a', 1, 'T12', 'x'), ticks, 12);
  let c: any = wt3lBegin(s, 'b', 1, 'T12', 'x'); for (const n of [3, 4, 5]) c = wt3lChunk(JSON.parse(JSON.stringify(c)), ticks, n);
  assert.equal(c.metrics.ticksDone, 12); assert.equal(c.metrics.path, one.metrics.path);
  assert.deepEqual(c.metrics.tensions, one.metrics.tensions); assert.deepEqual(c.metrics.landings, one.metrics.landings);
  assert.equal(c.record.fieldCheckpoint.checksum, one.record.fieldCheckpoint.checksum);
  const again = wt3lChunk(wt3lBegin(s, 'a', 1, 'T12', 'x'), ticks, 12);
  assert.equal(again.metrics.path, one.metrics.path); assert.deepEqual(again.metrics.tensions, one.metrics.tensions);
});

test('T24 differs from T12 only in Θ, and the arms then live differently', () => {
  const s = start(); const { ticks } = live(s, 4);
  const a = wt3lBegin(s, 'T12', 1, 'T12', 'x'), b = wt3lBegin(s, 'T24', 1, 'T24', 'x');
  assert.equal(a.record.state.nd1.theta, 12); assert.equal(b.record.state.nd1.theta, 24);
  const strip = (st: any) => JSON.stringify({ ...st, nd1: { ...st.nd1, theta: undefined } });
  assert.equal(strip(b.record.state), strip(a.record.state));
  assert.deepEqual(b.record.fieldCheckpoint, a.record.fieldCheckpoint);
  assert.throws(() => wt3lBegin({ ...s, state: { ...s.state, nd1: { ...s.state.nd1, theta: 24 } } }, 'x', 1, 'T12', 'x'));
  const A = wt3lChunk(a, ticks, 40), B = wt3lChunk(b, ticks, 40);
  assert.ok(Math.max(0, ...(A.metrics.path.match(/[36]+/g) ?? []).map(v => v.length)) <= 12 + 1, 'T12 never stays past 12 (+1 boundary)');
  assert.notEqual(A.metrics.path, B.metrics.path, 'Θ changes her path');
});

test('fresh identities: replayed encounters are never already met, and each pass is distinct', () => {
  const s = start(); const { ticks } = live(s, 3);
  const r = wt3lChunk(wt3lBegin(s, 'x', 7, 'T12', 'x'), ticks, 6);
  const ids = (r.record.state.memoryState.events as any[]).flatMap(e => (e.encounters ?? []).map((x: any) => String(x.eventId))).filter(i => i.startsWith('wt3l:'));
  assert.ok(ids.some(i => i.startsWith('wt3l:7:0:')) && ids.some(i => i.startsWith('wt3l:7:1:')));
  assert.equal(r.metrics.offered, ticks.reduce((a, t) => a + t.offers.length, 0) * 2);
});

test('measures and the sign-flip test', () => {
  const m: any = { run: 'm', unit: 1, arm: 'T12', ticksDone: 1, path: '1366913331', tensions: [0.5, 0.7], tickEndTensions: [0.7], landings: [8, 8, 1],
    admitted: 2, offered: 3, flowHops: 4, segments: [] };
  const s = wt3lSummary(m);
  assert.equal(s.M1_warpShare, 6 / 10); assert.equal(s.warpVisits, 2); assert.equal(s.longestWarpVisit, 3); assert.equal(s.meanWarpVisit, 3);
  assert.equal(s.M2_meanTension, 0.6); assert.deepEqual(s.landings, { 8: 2, 1: 1 });
  assert.equal(signFlip(Array(12).fill(1)).p, 2 / 4096);
  assert.equal(signFlip([1, -1, 1, -1]).p, 1);
});

function instrumented(s: any, nTicks = 60) {
  const { ticks } = live(s, 6);
  let r: any = wt3lBegin(s, 'i', 1, 'T12', 'x'); const atStart = r.metrics.warpbornAtStart;
  for (let k = 0; k < nTicks / 10; k++) r = wt3lChunk(JSON.parse(JSON.stringify(r)), ticks, 10);
  const m = r.metrics, flightsDone = Number(r.record.state.nd1.flights) - Number(s.state.nd1?.flights ?? 0);
  const path = String(s.state.currentZone) + m.path;
  let pathExits = 0; for (let i = 1; i < path.length; i++) if (/[36]/.test(path[i - 1]) && !/[36]/.test(path[i])) pathExits++;
  return { m, flightsDone, pathExits, atStart };
}

test('Amendment 1 instruments, closed Warp: flights from her own counter; Warp-born gates counted; each exit classified once', () => {
  const { m, flightsDone, pathExits, atStart } = instrumented(start());
  assert.equal(atStart, 0);
  assert.ok(flightsDone > 0, 'lines of flight occurred');
  assert.equal(m.landings.length, flightsDone, 'flights counted = her own counter');
  assert.equal(m.exits.flight + m.exits.warpborn + m.exits.preexisting, pathExits, 'each exit classified exactly once');
  assert.ok(m.warpbornGates.length > 0 && m.warpbornGates.every((id: string) => id.startsWith('warpborn')));
  console.log('closed Warp:', JSON.stringify(m.exits), 'flights', flightsDone, 'warp-born gates', m.warpbornGates.join(','));
});

test('Amendment 1 instruments, with her pre-existing exit: exits through it are classed pre-existing; replay still equals her tick', () => {
  const s = start(); const base = s.state.qabbalaGates.find((g: any) => g.source === 1);
  s.state.qabbalaGates.push({ ...base, id: 'warp-exit-6-9', label: 'Warp exit (6->9)', source: 6, target: 9, isOpen: true });
  const { m, flightsDone, pathExits } = instrumented(s);
  assert.equal(m.landings.length, flightsDone);
  assert.equal(m.exits.flight + m.exits.warpborn + m.exits.preexisting, pathExits);
  assert.ok(m.exits.preexisting > 0 && m.exitLog.some((x: any) => x.gate === 'warp-exit-6-9'));
  console.log('with exit:', JSON.stringify(m.exits), 'flights', flightsDone);
  const L = live(s, 6), again = wt3lChunk(wt3lBegin(s, 'j', 1, 'T12', 'x'), L.ticks, 6, same);
  assert.equal(again.metrics.path, L.zones); assert.equal(noClock(again.record.state), noClock(L.record.state));
});
