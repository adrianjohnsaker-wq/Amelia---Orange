// NR-3 harness (REGISTRATION.md): field ingress versus exit-bias ingress. The NR-1 runtime, unchanged; no pinned file edited.
//   EXIT  : NR-1's ingress. Datum c is a one-hot observation; it adds 2 * rel(y, c) (IDENTITY receiver) to the score of
//           exit y. The Numogram field (zone activation, phase, conductivity) is not touched by the datum.
//   FIELD : material influx. No observation is submitted and no exit receives a bonus. Before the step, datum c raises
//           zone c's activation by kappa * (0.98 - a) and its conductivity by kappa/2 * (0.99 - k). The runtime's own field
//           dynamics (TraitEvolution: gate transfer, syzygetic torque, phase) then carry the change; she moves through
//           the deformed field by her unchanged gate choice, whose score already reads zone activation and phase.
// Outputs per run: her passage (path), and the field's own trajectory (fieldPath: the most-activated zone after each step).
//   node --import tsx run3.ts <stream.json> <label> <L> <M> <kappas comma-sep> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { withFullNumogram } from '../../../src/core/fullNumogram';
import { NRRuntime, IDENTITY } from '../nr1/nrRuntime';
import { graphFor, type GraphArm } from '../nr1/graphs';
export function walk3(zones: number[], graph: GraphArm, mode: 'EXIT' | 'FIELD', kappa: number, unit: number) {
  const rt = new NRRuntime(); withFullNumogram(rt); rt.setSuppressRelaySteering(true);
  const { gates, perm } = graphFor(graph, unit); rt.getQabbala().setGates(gates); rt.rel = IDENTITY;
  const Z = () => rt.getQabbala().getZones() as any;
  const peak = () => { const z = Z(); let b = 0; for (let i = 1; i <= 9; i++) if (z[i].activation > z[b].activation) b = i; return b; };
  const path = [rt.getCurrentZone() as number], fieldPath = [peak()];
  for (let t = 0; t < zones.length; t++) {
    const c = perm ? perm[zones[t]] : zones[t];   // RELABEL arms present datum c as zone perm[c]
    if (mode === 'EXIT') {
      const v = Array(10).fill(0); v[c] = 1;
      rt.queueSynthetic({ eventId: `nr3:${unit}:${t}`, channel: 'SYNTHETIC_FIELD', sourceDigest: createHash('sha256').update(`nr3|${unit}|${t}|${zones[t]}`).digest('hex'), attentionVector: v } as any);
    } else {
      const z = Z()[c]; z.activation = z.activation + kappa * (0.98 - z.activation); z.conductivity = z.conductivity + (kappa / 2) * (0.99 - z.conductivity);
    }
    rt.step(); path.push(rt.getCurrentZone() as number); fieldPath.push(peak());
  }
  return { path, fieldPath, perm, flights: rt.flights };
}
if (/nr3\/run3\.ts$/.test(process.argv[1] ?? '')) {
  const [STREAM, LABEL, L, M, KAPPAS, OUT] = process.argv.slice(2);
  const all = JSON.parse(readFileSync(STREAM, 'utf8')).zones as number[], len = Number(L), units = Number(M), kappas = KAPPAS.split(',').map(Number);
  const runs: any[] = [];
  for (let u = 0; u < units; u++) {
    const input = all.slice(u * len, (u + 1) * len); if (input.length < len) throw new Error('stream too short');
    for (const graph of ['CANONICAL', 'RELABEL', 'REWIRED'] as GraphArm[]) {
      runs.push({ unit: u, graph, mode: 'EXIT', kappa: 0, input, ...walk3(input, graph, 'EXIT', 0, u) });
      for (const k of kappas) runs.push({ unit: u, graph, mode: 'FIELD', kappa: k, input, ...walk3(input, graph, 'FIELD', k, u) });
    }
  }
  writeFileSync(OUT, JSON.stringify({ label: LABEL, L: len, M: units, kappas, runs }));
}
