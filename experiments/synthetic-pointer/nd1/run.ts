// ND-1 harness (REGISTRATION.md). Direct path, no body.
//   EXIT : today's architecture (NRRuntime, IDENTITY receiver, datum as attended one-hot observation; field = TraitEvolution)
//   ND   : the redesign (NDRuntime: nd on, fieldWeight 2.0, warpRelease on). Datum c is influx into zone c's activation
//          (eta); no observation, no exit bonus. Activation spreads along the gates (D), decays (LAMBDA 0.1), weak own
//          oscillation (OMEGA 0.05). She moves by her gate choice reading the field.
// Readouts: path (her passage) and fieldPath (the most-activated zone after each step).
//   node --import tsx run.ts <stream.json> <label> <L> <M> <configs "eta:D,eta:D"> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { withFullNumogram } from '../../../src/core/fullNumogram';
import { NRRuntime, IDENTITY } from '../nr1/nrRuntime';
import { NDRuntime } from './ndRuntime';
import { graphFor, type GraphArm } from '../nr1/graphs';
export function walkND(zones: number[], graph: GraphArm, mode: 'EXIT' | 'ND', eta: number, D: number, unit: number) {
  const rt: any = mode === 'EXIT' ? new NRRuntime() : new NDRuntime();
  withFullNumogram(rt); rt.setSuppressRelaySteering(true); rt.rel = IDENTITY;
  if (mode === 'ND') { rt.nd = true; rt.fieldWeight = 2.0; rt.warpRelease = true; rt.D = D; }
  const { gates, perm } = graphFor(graph, unit); rt.getQabbala().setGates(gates);
  const Z = () => rt.getQabbala().getZones();
  const peak = () => { const z = Z(); let b = 0; for (let i = 1; i <= 9; i++) if (z[i].activation > z[b].activation) b = i; return b; };
  const path = [rt.getCurrentZone() as number], fieldPath = [peak()];
  for (let t = 0; t < zones.length; t++) {
    const c = perm ? perm[zones[t]] : zones[t];
    if (mode === 'EXIT') { const v = Array(10).fill(0); v[c] = 1;
      rt.queueSynthetic({ eventId: `nd1:${unit}:${t}`, channel: 'SYNTHETIC_FIELD', sourceDigest: createHash('sha256').update(`nd1|${unit}|${t}|${zones[t]}`).digest('hex'), attentionVector: v }); }
    else rt.influx(c, eta);
    rt.step(); path.push(rt.getCurrentZone() as number); fieldPath.push(peak());
  }
  return { path, fieldPath, perm, flights: rt.flights };
}
if (/nd1\/run\.ts$/.test(process.argv[1] ?? '')) {
  const [STREAM, LABEL, L, M, CONFIGS, OUT] = process.argv.slice(2);
  const all = JSON.parse(readFileSync(STREAM, 'utf8')).zones as number[], len = Number(L), units = Number(M);
  const configs = CONFIGS.split(',').map(x => x.split(':').map(Number));
  const runs: any[] = [];
  for (let u = 0; u < units; u++) {
    const input = all.slice(u * len, (u + 1) * len); if (input.length < len) throw new Error('stream too short');
    for (const graph of ['CANONICAL', 'RELABEL', 'REWIRED'] as GraphArm[]) {
      runs.push({ unit: u, graph, mode: 'EXIT', eta: 0, D: 0, input, ...walkND(input, graph, 'EXIT', 0, 0, u) });
      for (const [eta, D] of configs) runs.push({ unit: u, graph, mode: 'ND', eta, D, input, ...walkND(input, graph, 'ND', eta, D, u) });
    }
  }
  writeFileSync(OUT, JSON.stringify({ label: LABEL, L: len, M: units, configs, runs }));
}
