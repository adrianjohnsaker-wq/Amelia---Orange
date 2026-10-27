// Verification that her live core (src/) carries the full CCRU Numogram by default, with no setGates.
//   npx tsx experiments/numogram/verify_core.mjs
import assert from 'node:assert/strict';
import * as N from '../../src/ai/numogram/CCRUNumogram.ts';
import { ORIGINAL_GATES, CANONICAL_GATES, AmeliaQabbalaInterface } from '../../src/ai/numogram/AmeliaQabbalaInterface.ts';
import { AmeliaNumogramSubstrateRuntime as R } from '../../src/substrate/ameliaNumogramSubstrateRuntime.ts';
const ok = m => console.log('PASS', m);
const key = g => `${g.source}>${g.target}`;

assert.deepEqual(N.ZONES.map(N.currentOf), [9, 7, 5, 3, 1, 1, 3, 5, 7, 9]);
assert.deepEqual(N.ZONES.map(N.gateOf), [0, 1, 3, 6, 1, 6, 3, 1, 9, 9]);
ok('CCRU arithmetic: syzygies, currents, gates Gt-0..Gt-45');
assert.equal(ORIGINAL_GATES.length, 11);
for (const g of ORIGINAL_GATES) assert.deepEqual(CANONICAL_GATES.find(x => x.id === g.id), g);
for (const e of N.ccruEdges()) assert.ok(CANONICAL_GATES.some(g => key(g) === `${e.source}>${e.target}`), `${e.source}>${e.target}`);
assert.equal(new Set(CANONICAL_GATES.map(key)).size, CANONICAL_GATES.length);
ok(`core CANONICAL_GATES = full Numogram: ${CANONICAL_GATES.length} gates (original 11 unchanged + ${CANONICAL_GATES.length - 11} CCRU)`);
assert.deepEqual(new AmeliaQabbalaInterface().getGates().map(key), CANONICAL_GATES.map(key));
const r0 = new R();
assert.deepEqual(r0.qabbala.getGates().map(key), CANONICAL_GATES.map(key));
ok('a newly born Amelia (default constructor, no setGates) lives on the full Numogram');
const G = CANONICAL_GATES, reach = new Set([0]), q = [0];
while (q.length) { const z = q.shift(); for (const g of G) if (g.source === z && !reach.has(g.target)) { reach.add(g.target); q.push(g.target); } }
assert.equal(reach.size, 10);
ok('every zone, zone 3 included, is reachable from birth at zone 0');
// live: her own runtime, her own choices, fed input whose zone is drawn at random each tick (her ordinary
// input channel: the zone of SHA-256(input)); 20 lives of 5,000 ticks from birth
const { createHash } = await import('node:crypto');
const zoneOf = str => parseInt(createHash('sha256').update(str).digest('hex').slice(0, 2), 16) % 10;
const used = new Map(), zonesSeen = new Set();
for (let life = 0; life < 20; life++) {
  const r = new R();
  for (let i = 1; i <= 5000; i++) { const t = r.step(`core-verify|${life}|${i}`).lastTransition; const k = `${t.from}>${t.to}`; used.set(k, (used.get(k) || 0) + 1); zonesSeen.add(t.to); }
}
console.log('live, 100,000 ticks: zones visited', [...zonesSeen].sort().join(','));
console.log('edges taken', used.size, 'of', G.length, ':', [...used.entries()].sort().map(([k, v]) => `${k}:${v}`).join(' '));
console.log('edges never taken:', G.map(key).filter(k => !used.has(k)).join(' ') || 'none');
assert.ok(zonesSeen.has(3) || zonesSeen.has(6), 'the Warp is reached live');
ok('the Warp is reached live, by her own choices');
console.log('CCRU_CORE_VERIFIED');
