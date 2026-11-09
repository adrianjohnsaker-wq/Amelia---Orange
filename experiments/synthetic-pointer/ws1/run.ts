// WS-1 harness (REGISTRATION.md). ND-1b (HYBRID: influx + attended one-hot, IDENTITY receiver, eta 0.5, D 0.6, field weight
// 2.0) with the Warp mechanism bound to: F36 = {3, 6} (ND-1b as it is), F27 = {2, 7} (the syzygy the pasted claim pairs with it),
// NONE = no pair (no intensity, no line of flight, no release).
//   node --import tsx run.ts <stream.json> <label> <out.json>      12 units x 1000, graphs CANONICAL and RELABEL
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { withFullNumogram } from '../../../src/core/fullNumogram';
import { IDENTITY } from '../nr1/nrRuntime';
import { WSRuntime } from './wsRuntime';
import { graphFor, type GraphArm } from '../nr1/graphs';
export type Arm = 'F36' | 'F27' | 'NONE';
export const PAIR: Record<Arm, number[]> = { F36: [3, 6], F27: [2, 7], NONE: [] };
export function walkW(zones: number[], graph: GraphArm, arm: Arm, unit: number) {
  const rt: any = new WSRuntime(); withFullNumogram(rt); rt.setSuppressRelaySteering(true); rt.rel = IDENTITY;
  rt.nd = true; rt.fieldWeight = 2.0; rt.warpRelease = true; rt.D = 0.6; rt.warp = new Set(PAIR[arm]);
  const { gates, perm } = graphFor(graph, unit); rt.getQabbala().setGates(gates);
  const path = [rt.getCurrentZone() as number];
  for (let t = 0; t < zones.length; t++) {
    const c = perm ? perm[zones[t]] : zones[t]; const v = Array(10).fill(0); v[c] = 1;
    rt.queueSynthetic({ eventId: `ndb:${unit}:${t}`, channel: 'SYNTHETIC_FIELD', sourceDigest: createHash('sha256').update(`ndb|${unit}|${t}|${zones[t]}`).digest('hex'), attentionVector: v });
    rt.influx(c, 0.5); rt.step(); path.push(rt.getCurrentZone() as number);
  }
  return { path, flights: rt.flights };
}
if (/ws1\/run\.ts$/.test(process.argv[1] ?? '')) {
  const [STREAM, LABEL, OUT] = process.argv.slice(2); const all = JSON.parse(readFileSync(STREAM, 'utf8')).zones as number[]; const runs: any[] = [];
  for (let u = 0; u < 12; u++) { const input = all.slice(u * 1000, (u + 1) * 1000);
    for (const graph of ['CANONICAL', 'RELABEL'] as GraphArm[]) for (const arm of ['F36', 'F27', 'NONE'] as Arm[]) runs.push({ unit: u, graph, arm, input, ...walkW(input, graph, arm, u) }); }
  writeFileSync(OUT, JSON.stringify({ label: LABEL, runs }));
}
