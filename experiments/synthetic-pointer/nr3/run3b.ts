// NR-3 amendment 1 harness: COUPLED = FIELD influx (as run3.ts) + CoupledRuntime with fieldWeight 2.0 and field-triggered
// Warp line of flight. Her passage is the readout (path); fieldPath recorded as in run3.ts.
//   node --import tsx run3b.ts <stream.json> <label> <L> <M> <kappa> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { withFullNumogram } from '../../../src/core/fullNumogram';
import { IDENTITY } from '../nr1/nrRuntime';
import { CoupledRuntime } from './coupledRuntime';
import { graphFor, type GraphArm } from '../nr1/graphs';
export const FIELD_WEIGHT = 2.0;
export function walkCoupled(zones: number[], graph: GraphArm, kappa: number, unit: number) {
  const rt = new CoupledRuntime(); withFullNumogram(rt); rt.setSuppressRelaySteering(true);
  const { gates, perm } = graphFor(graph, unit); rt.getQabbala().setGates(gates); (rt as any).rel = IDENTITY;
  rt.fieldWeight = FIELD_WEIGHT; rt.fieldFlight = true;
  const Z = () => rt.getQabbala().getZones() as any;
  const peak = () => { const z = Z(); let b = 0; for (let i = 1; i <= 9; i++) if (z[i].activation > z[b].activation) b = i; return b; };
  const path = [rt.getCurrentZone() as number], fieldPath = [peak()];
  for (let t = 0; t < zones.length; t++) {
    const c = perm ? perm[zones[t]] : zones[t];
    const z = Z()[c]; z.activation = z.activation + kappa * (0.98 - z.activation); z.conductivity = z.conductivity + (kappa / 2) * (0.99 - z.conductivity);
    rt.step(); path.push(rt.getCurrentZone() as number); fieldPath.push(peak());
  }
  return { path, fieldPath, perm, flights: rt.flights };
}
if (/nr3\/run3b\.ts$/.test(process.argv[1] ?? '')) {
  const [STREAM, LABEL, L, M, KAPPA, OUT] = process.argv.slice(2);
  const all = JSON.parse(readFileSync(STREAM, 'utf8')).zones as number[], len = Number(L), units = Number(M), k = Number(KAPPA);
  const runs: any[] = [];
  for (let u = 0; u < units; u++) {
    const input = all.slice(u * len, (u + 1) * len); if (input.length < len) throw new Error('stream too short');
    for (const graph of ['CANONICAL', 'RELABEL', 'REWIRED'] as GraphArm[]) runs.push({ unit: u, graph, mode: 'COUPLED', kappa: k, input, ...walkCoupled(input, graph, k, u) });
  }
  writeFileSync(OUT, JSON.stringify({ label: LABEL, L: len, M: units, kappas: [k], runs }));
}
