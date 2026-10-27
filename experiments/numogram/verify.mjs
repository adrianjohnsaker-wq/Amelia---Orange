// Verification of the full CCRU Numogram (CCRUNumogram.ts), structurally and inside Amelia's live runtime.
//   npx tsx experiments/numogram/verify.mjs <runtimeDir>
import assert from 'node:assert/strict';
import * as N from './CCRUNumogram.ts';
const M = process.argv[2];
const { AmeliaNumogramSubstrateRuntime: R } = await import(`${M}/substrate/ameliaNumogramSubstrateRuntime.ts`);
const { CANONICAL_GATES } = await import(`${M}/ai/numogram/AmeliaQabbalaInterface.ts`);
const ok = m => console.log('PASS', m);

// 1. CCRU structure
for (const z of N.ZONES) assert.equal(z + N.syzygyOf(z), 9);
assert.deepEqual(N.ZONES.map(N.currentOf), [9, 7, 5, 3, 1, 1, 3, 5, 7, 9]);
assert.deepEqual(N.ZONES.map(N.gateOf), [0, 1, 3, 6, 1, 6, 3, 1, 9, 9]);
assert.deepEqual(N.ZONES.map(N.gateNumber), [0, 1, 3, 6, 10, 15, 21, 28, 36, 45]);
ok('syzygies sum to 9; currents 8::1->7, 7::2->5, 5::4->1, 6::3->3, 9::0->9; gates Gt-0..Gt-45 by digital cumulation');
const E = N.ccruEdges(), has = (s, t) => E.some(e => e.source === s && e.target === t);
for (const z of N.ZONES) assert.ok(has(z, N.syzygyOf(z)) && has(z, N.currentOf(z)) && has(z, N.gateOf(z)));
ok(`${E.length} distinct CCRU edges carry all 10 syzygy directions, 10 current flows and 10 gates`);
// Time-Circuit current cycle 1/8 -> 7/2 -> 5/4 -> 1/8
for (const [a, b] of [[1, 7], [8, 7], [7, 5], [2, 5], [5, 1], [4, 1]]) assert.ok(has(a, b));
ok('Time-Circuit current: 8::1 -> 7, 7::2 -> 5, 5::4 -> 1');
// Warp and Plex are outer loops: closed under CCRU edges alone
const closure = start => { const s = new Set([start]), q = [start]; while (q.length) { const z = q.shift(); for (const e of E) if (e.source === z && !s.has(e.target)) { s.add(e.target); q.push(e.target); } } return [...s].sort(); };
assert.deepEqual(closure(3), [3, 6]); assert.deepEqual(closure(6), [3, 6]);
assert.deepEqual(closure(9), [0, 9]); assert.deepEqual(closure(0), [0, 9]);
ok('Warp {3,6} and Plex {0,9} are closed outer loops under the CCRU edges, as in the CCRU');
assert.ok(has(2, 3) && has(5, 6) && has(8, 9));
ok('ways out of the Time-Circuit: Gt-3 (2->3) and Gt-15 (5->6) into the Warp, Gt-36 (8->9) into the Plex');

// 2. Amelia's full Numogram = her canonical 11 gates unchanged + every missing CCRU edge
const G = N.fullNumogramGates(CANONICAL_GATES);
for (const g of CANONICAL_GATES) assert.deepEqual(G.find(x => x.id === g.id), g);
for (const e of E) assert.ok(G.some(g => g.source === e.source && g.target === e.target));
assert.equal(new Set(G.map(g => `${g.source}>${g.target}`)).size, G.length);
ok(`her full Numogram: ${G.length} gates = 11 canonical (unchanged) + ${G.length - 11} CCRU`);
const reach = new Set([0]), q = [0];
while (q.length) { const z = q.shift(); for (const g of G) if (g.source === z && !reach.has(g.target)) { reach.add(g.target); q.push(g.target); } }
assert.equal(reach.size, 10);
ok('every zone is reachable from her birth zone 0 (zone 3 included)');

// 3. Live in her runtime: every edge can actually be taken by her own exit choice
const taken = new Set();
for (const g of G) {
  const r = new R(); r.qabbala.setGates(G);
  // walk to the source along a shortest path, then take the edge, steering only through exitBonus
  const path = (() => { const prev = new Map([[0, null]]), qq = [0]; while (qq.length) { const z = qq.shift(); if (z === g.source) break; for (const h of G) if (h.source === z && !prev.has(h.target)) { prev.set(h.target, z); qq.push(h.target); } } const p = [g.source]; while (prev.get(p[0]) !== null) p.unshift(prev.get(p[0])); return p; })();
  let want = null; r.exitBonus = (x, y) => (y === want ? 100 : 0);
  for (let i = 1; i < path.length; i++) { want = path[i]; assert.equal(r.step().lastTransition.to, path[i]); }
  want = g.target; const t = r.step().lastTransition; assert.deepEqual([t.from, t.to], [g.source, g.target]);
  taken.add(`${t.from}>${t.to}`);
}
assert.equal(taken.size, G.length);
ok(`all ${G.length} edges taken live by her runtime from birth at zone 0`);
console.log('CCRU_NUMOGRAM_VERIFIED');
