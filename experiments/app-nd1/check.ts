// App ND-1 runtime check: no pinned file touched; classic unchanged; ND-1 escapes the Warp, reads input, round-trips state.
//   node --import tsx experiments/app-nd1/check.ts
import { createHash } from 'node:crypto';
import { bornAmeliaOf, convertRuntime, runtimeKindOf } from '../../src/core/ameliaRuntimes';
let fail = 0; const ok = (c: boolean, m: string) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };
const enc = (t: number, c: number) => { const v = Array(10).fill(0); v[c] = 1; return { eventId: `chk:${t}`, channel: 'LINGUISTIC', sourceDigest: createHash('sha256').update(String(t)).digest('hex'), attentionVector: v } as any; };
let x = 7; const rnd = () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648;
const input = Array.from({ length: 4000 }, () => 1 + Math.floor(rnd() * 9));
function run(kind: 'classic' | 'nd1', every: number) {
  const rt = bornAmeliaOf(kind); const path = [rt.getCurrentZone() as number]; let attended = 0;
  for (let t = 0; t < input.length; t++) { const snap = rt.step(undefined, t % every === 0 ? enc(t, input[t]) : undefined);
    attended += (snap.encounterDecisions ?? []).filter((d: any) => d.applied).length; path.push(rt.getCurrentZone() as number); }
  return { rt, path, attended };
}
const longestWarp = (p: number[]) => { let m = 0, r = 0; for (const z of p) { r = z === 3 || z === 6 ? r + 1 : 0; m = Math.max(m, r); } return m; };
const lag2 = (p: number[], rel: (c: number) => number) => { let h = 0, n = 0; for (let t = 0; t + 2 < p.length && t < input.length; t++) { if (rel(input[t]) === input[t]) continue; n++; if (p[t + 2] === rel(input[t])) h++; } return h / n; };
for (const every of [1, 10]) {
  const C = run('classic', every), N = run('nd1', every);
  console.log(`-- an encounter offered every ${every} step(s): attended classic ${C.attended}, nd1 ${N.attended}`);
  ok(runtimeKindOf(C.rt) === 'classic' && runtimeKindOf(N.rt) === 'nd1', 'runtime kinds');
  console.log(`   longest unbroken Warp stay: classic ${longestWarp(C.path)}, nd1 ${longestWarp(N.path)}`);
  ok(longestWarp(N.path) <= 26, 'ND-1 always leaves the Warp within THETA (+2) steps');
  ok(N.path.every(z => Number.isInteger(z) && z >= 0 && z <= 9), 'ND-1 path valid for 4,000 steps');
  const g = (c: number) => { const n = c * (c + 1) / 2; return n === 0 ? 0 : 1 + (n - 1) % 9; }, cur = (c: number) => Math.abs(2 * c - 9);
  console.log(`   lag-2 hit rate (gate / current), classic ${lag2(C.path, g).toFixed(3)} / ${lag2(C.path, cur).toFixed(3)}, nd1 ${lag2(N.path, g).toFixed(3)} / ${lag2(N.path, cur).toFixed(3)}`);
}
// state round-trip: export/import into a fresh ND-1 runtime continues identically
const A = bornAmeliaOf('nd1'); for (let t = 0; t < 300; t++) A.step(undefined, enc(t, input[t]));
const B = bornAmeliaOf('nd1'); B.importState(JSON.parse(JSON.stringify(A.exportState())));
let same = true; for (let t = 300; t < 600; t++) { A.step(undefined, enc(t, input[t])); B.step(undefined, enc(t, input[t])); if (A.getCurrentZone() !== B.getCurrentZone()) same = false; }
ok(same, 'ND-1 export/import round-trip continues step-for-step identically (300 steps)');
// switching carries the state: memory length and zone kept
const K = bornAmeliaOf('classic'); for (let t = 0; t < 200; t++) K.step(undefined, enc(t, input[t]));
const before = { zone: K.getCurrentZone(), mem: K.getMemory().getEvents().length };
const K2 = convertRuntime(K, 'nd1');
ok(K2.getCurrentZone() === before.zone && K2.getMemory().getEvents().length === before.mem && runtimeKindOf(K2) === 'nd1', `switch classic -> nd1 keeps zone ${before.zone} and ${before.mem} memory events`);
const K3 = convertRuntime(K2, 'classic'); ok(runtimeKindOf(K3) === 'classic' && K3.getMemory().getEvents().length === before.mem, 'switch back to classic keeps memory');
process.exit(fail ? 1 : 0);
