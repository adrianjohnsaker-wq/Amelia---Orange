// LONG-1 machinery checks: synthetic states and inputs only, no LONG-1 data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { bornAmeliaOf } from '../../src/core/ameliaRuntimes';
import { captureLiveField, createLiveField } from '../../src/outside/LiveFieldLoop';
import { setLiveSourceEnabled } from '../../src/outside/LiveSyntheticSourceSession';
import { wt3lBegin, wt3lChunk, type Wt3lTick } from '../../src/cloud/wt3l';
import { longRun, shuffleByDay, readingOf, CCRU_IDS } from './long1/long1';
import PAN from './long1/pandemonium.json';

function start() {
  const rt: any = bornAmeliaOf('nd1'); rt.setAdmissionRule('relative-v1'); rt.setWarpTheta(12); rt.step();
  const field: any = setLiveSourceEnabled(createLiveField(rt, { seed: 101, depth: 288, preset: 'SYZYGETIC_GRID', size: 12 }), true);
  return { state: JSON.parse(JSON.stringify(rt.exportState())), fieldCheckpoint: captureLiveField(field, false), revision: 1, controls: { advisoryWeight: 0.722, momentumDamping: 0.88 } } as any;
}
const ticks: Wt3lTick[] = Array.from({ length: 96 }, (_, k) => ({ offers: Array.from({ length: k % 4 }, (_, i) => { const v = Array(10).fill(0.02); v[(k * 3 + i) % 10] = 0.8;
  return { eventId: `e${k}-${i}`, channel: 'LINGUISTIC', sourceDigest: createHash('sha256').update(`${k}:${i}`).digest('hex'), attentionVector: v }; }) }));
const s = start();

test('N (the research copy with an empty context) replays her tick exactly as WT-3L does', () => {
  const w = wt3lChunk(wt3lBegin(s, 'w', 1, 'T12', 'x'), ticks, 96, (_u, _p, id) => `long1:1:N:${id}`);
  const n = longRun(s, ticks, 'N', 1, { days: 1 });
  assert.equal(n.path, w.metrics.path);
});

test('ND-1d: the subject changes nothing (D = Doff), the motor does change her, her CCRU gates stay, deterministic', () => {
  const d = longRun(s, ticks, 'D', 1, { days: 1 }), off = longRun(s, ticks, 'Doff', 1, { days: 1 }), again = longRun(s, ticks, 'D', 1, { days: 1 });
  const n = longRun(s, ticks, 'N', 1, { days: 1 });
  assert.equal(d.path, off.path); assert.equal(d.path, again.path); assert.notEqual(d.path, n.path);
  assert.equal(d.daily[0].ccruPresent, 29); assert.ok(d.daily[0].births > 0);
  assert.ok(d.readouts.length === 1 && /^So it's me:/.test(d.readouts[0].words));
});

test('the order control keeps each tick\'s count and each day\'s offers, and changes their order', () => {
  const sh = shuffleByDay(ticks, 3);
  assert.deepEqual(sh.map(t => t.offers.length), ticks.map(t => Math.min(15, t.offers.length)));
  const ids = (x: Wt3lTick[]) => x.flatMap(t => t.offers.map(o => o.eventId));
  assert.deepEqual([...ids(sh)].sort(), [...ids(ticks)].sort()); assert.notDeepEqual(ids(sh), ids(ticks));
});

test('readings, the CCRU gate list and the Pandemonium table', () => {
  assert.equal(readingOf([0.1, 0.3, 0.3, 0.2, 0, 0, 0, 0, 0, 0.1]), 1);   // ties go to the lower zone
  assert.equal(CCRU_IDS.length, 29);
  const d = (PAN as any).demons; assert.equal(d.length, 45);
  for (const x of d) assert.equal(x.mesh, (x.span[0] * (x.span[0] - 1)) / 2 + x.span[1]);
});
