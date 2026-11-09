// ND-1b harness (REGISTRATION.md). Direct path. Three architectures on the same input:
//   EXIT   : today (NRRuntime, IDENTITY receiver; datum = attended one-hot observation)
//   ND     : ND-1 (NDRuntime nd on, eta 0.5, D 0.6, field weight 2.0, Warp release; datum = influx only)
//   HYBRID : ND-1b — the ND-1 runtime and settings, and the datum does BOTH: influx into the field AND the attended one-hot
//            observation (today's exit nudge, 2 * rel(y, c) with the IDENTITY receiver).
//   node --import tsx run.ts <stream.json> <label> <L> <M> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { withFullNumogram } from '../../../src/core/fullNumogram';
import { NRRuntime, IDENTITY } from '../nr1/nrRuntime';
import { NDRuntime } from '../nd1/ndRuntime';
import { graphFor, type GraphArm } from '../nr1/graphs';
export const ETA = 0.5, D = 0.6;
export type Arch = 'EXIT' | 'ND' | 'HYBRID';
export function walkB(zones: number[], graph: GraphArm, arch: Arch, unit: number) {
  const rt: any = arch === 'EXIT' ? new NRRuntime() : new NDRuntime();
  withFullNumogram(rt); rt.setSuppressRelaySteering(true); rt.rel = IDENTITY;
  if (arch !== 'EXIT') { rt.nd = true; rt.fieldWeight = 2.0; rt.warpRelease = true; rt.D = D; }
  const { gates, perm } = graphFor(graph, unit); rt.getQabbala().setGates(gates);
  const Z = () => rt.getQabbala().getZones();
  const peak = () => { const z = Z(); let b = 0; for (let i = 1; i <= 9; i++) if (z[i].activation > z[b].activation) b = i; return b; };
  const path = [rt.getCurrentZone() as number], fieldPath = [peak()];
  for (let t = 0; t < zones.length; t++) {
    const c = perm ? perm[zones[t]] : zones[t];
    if (arch !== 'ND') { const v = Array(10).fill(0); v[c] = 1;
      rt.queueSynthetic({ eventId: `ndb:${unit}:${t}`, channel: 'SYNTHETIC_FIELD', sourceDigest: createHash('sha256').update(`ndb|${unit}|${t}|${zones[t]}`).digest('hex'), attentionVector: v }); }
    if (arch !== 'EXIT') rt.influx(c, ETA);
    rt.step(); path.push(rt.getCurrentZone() as number); fieldPath.push(peak());
  }
  return { path, fieldPath, perm, flights: rt.flights };
}
if (/ndb\/run\.ts$/.test(process.argv[1] ?? '')) {
  const [STREAM, LABEL, L, M, OUT] = process.argv.slice(2);
  const all = JSON.parse(readFileSync(STREAM, 'utf8')).zones as number[], len = Number(L), units = Number(M);
  const runs: any[] = [];
  for (let u = 0; u < units; u++) {
    const input = all.slice(u * len, (u + 1) * len); if (input.length < len) throw new Error('stream too short');
    for (const graph of ['CANONICAL', 'RELABEL', 'REWIRED'] as GraphArm[]) for (const arch of ['EXIT', 'ND', 'HYBRID'] as Arch[])
      runs.push({ unit: u, graph, mode: arch, eta: arch === 'EXIT' ? 0 : ETA, D: arch === 'EXIT' ? 0 : D, input, ...walkB(input, graph, arch, u) });
  }
  writeFileSync(OUT, JSON.stringify({ label: LABEL, L: len, M: units, runs }));
}
