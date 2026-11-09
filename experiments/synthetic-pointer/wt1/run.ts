// WT-1 harness (REGISTRATION.md). Direct path (no body), NR-1 setup: IDENTITY receiver, datum c as a one-hot observation.
//   runtime BASE    = NRRuntime (today: a Warp line of flight only on an attended observation)
//   runtime RELEASE = ReleaseRuntime with warpRelease on (after THETA Warp steps, flight to the zone the input last named)
//   regime  FULL    = every datum is submitted and attended (as NR-1)
//   regime  SPARSE  = each datum is submitted with probability 0.10 (seeded per unit and step); the rest never reach her
//   regime  RARE    = probability 0.02: close to the tablet, where the Governor admitted 0 of 120 offers immediately
//   node --import tsx run.ts <stream.json> <label> <L> <M> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { withFullNumogram } from '../../../src/core/fullNumogram';
import { NRRuntime, IDENTITY } from '../nr1/nrRuntime';
import { ReleaseRuntime } from './releaseRuntime';
import { graphFor, rng, type GraphArm } from '../nr1/graphs';
export const P_ADMIT = { FULL: 1, SPARSE: 0.10, RARE: 0.02 } as const;
export function walkR(zones: number[], graph: GraphArm, runtime: 'BASE' | 'RELEASE', regime: 'FULL' | 'SPARSE' | 'RARE', unit: number) {
  const rt: any = runtime === 'BASE' ? new NRRuntime() : new ReleaseRuntime();
  withFullNumogram(rt); rt.setSuppressRelaySteering(true); rt.rel = IDENTITY; if (runtime === 'RELEASE') rt.warpRelease = true;
  const { gates, perm } = graphFor(graph, unit); rt.getQabbala().setGates(gates);
  const admit = rng(`WT1-ADMIT|${unit}`);   // same admission pattern for every graph and runtime of a unit
  const path = [rt.getCurrentZone() as number], attended: boolean[] = [];
  for (let t = 0; t < zones.length; t++) {
    const on = regime === 'FULL' || admit() < P_ADMIT[regime]; attended.push(on);
    if (on) { const v = Array(10).fill(0); v[perm ? perm[zones[t]] : zones[t]] = 1;
      rt.queueSynthetic({ eventId: `wt1:${unit}:${t}`, channel: 'SYNTHETIC_FIELD', sourceDigest: createHash('sha256').update(`wt1|${unit}|${t}|${zones[t]}`).digest('hex'), attentionVector: v }); }
    rt.step(); path.push(rt.getCurrentZone() as number);
  }
  return { path, attended, flights: rt.flights };
}
if (/wt1\/run\.ts$/.test(process.argv[1] ?? '')) {
  const [STREAM, LABEL, L, M, OUT] = process.argv.slice(2);
  const all = JSON.parse(readFileSync(STREAM, 'utf8')).zones as number[], len = Number(L), units = Number(M);
  const runs: any[] = [];
  for (let u = 0; u < units; u++) {
    const input = all.slice(u * len, (u + 1) * len); if (input.length < len) throw new Error('stream too short');
    for (const graph of ['CANONICAL', 'RELABEL', 'REWIRED'] as GraphArm[]) for (const runtime of ['BASE', 'RELEASE'] as const) for (const regime of ['FULL', 'SPARSE', 'RARE'] as const)
      runs.push({ unit: u, graph, runtime, regime, input, ...walkR(input, graph, runtime, regime, u) });
  }
  writeFileSync(OUT, JSON.stringify({ label: LABEL, L: len, M: units, runs }));
}
