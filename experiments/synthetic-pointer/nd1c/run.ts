// ND-1c harness (REGISTRATION.md). ND-1b (ndb/run.ts, HYBRID) with the field's memory as the only variable:
//   cfg.ADAPT  : rate of the per-zone baseline her gate choice subtracts (ND-1b 0.05; 1.0 = she reads the field's change this step)
//   cfg.LAMBDA : field decay per step (ND-1b 0.1)
// Everything else is ND-1b: eta 0.5, D 0.6, field weight 2.0, Warp release, and the datum is both influx and the attended
// one-hot observation (IDENTITY receiver). arch 'EXIT' is today's architecture (NRRuntime), exactly as in ndb/run.ts.
import { createHash } from 'node:crypto';
import { withFullNumogram } from '../../../src/core/fullNumogram';
import { NRRuntime, IDENTITY } from '../nr1/nrRuntime';
import { NDRuntime } from '../nd1/ndRuntime';
import { graphFor, type GraphArm } from '../nr1/graphs';
export type Cfg = { name: string; ADAPT: number; LAMBDA: number; FW?: number };   // FW: field weight in her gate choice (default 2.0, ND-1b)
export const CANDIDATES: Record<string, Cfg> = {
  B:     { name: 'B',     ADAPT: 0.05, LAMBDA: 0.1 },   // ND-1b itself
  DERIV: { name: 'DERIV', ADAPT: 1.0,  LAMBDA: 0.1 },
  FAST:  { name: 'FAST',  ADAPT: 0.05, LAMBDA: 0.3 },
  BOTH:  { name: 'BOTH',  ADAPT: 1.0,  LAMBDA: 0.3 },
  // ND-1d (nd1d/REGISTRATION.md): DERIV with a lower field weight
  D15:   { name: 'D15',   ADAPT: 1.0,  LAMBDA: 0.1, FW: 1.5 },
  D10:   { name: 'D10',   ADAPT: 1.0,  LAMBDA: 0.1, FW: 1.0 },
  D05:   { name: 'D05',   ADAPT: 1.0,  LAMBDA: 0.1, FW: 0.5 },
};
export function walkC(zones: number[], graph: GraphArm, arch: 'EXIT' | 'C', unit: number, cfg: Cfg) {
  const rt: any = arch === 'EXIT' ? new NRRuntime() : new NDRuntime();
  withFullNumogram(rt); rt.setSuppressRelaySteering(true); rt.rel = IDENTITY;
  if (arch === 'C') { rt.nd = true; rt.fieldWeight = cfg.FW ?? 2.0; rt.warpRelease = true; rt.D = 0.6; rt.ADAPT = cfg.ADAPT; rt.LAMBDA = cfg.LAMBDA; }
  const { gates, perm } = graphFor(graph, unit); rt.getQabbala().setGates(gates);
  const path = [rt.getCurrentZone() as number];
  for (let t = 0; t < zones.length; t++) {
    const c = perm ? perm[zones[t]] : zones[t]; const v = Array(10).fill(0); v[c] = 1;
    rt.queueSynthetic({ eventId: `nd1c:${unit}:${t}`, channel: 'SYNTHETIC_FIELD', sourceDigest: createHash('sha256').update(`nd1c|${unit}|${t}|${zones[t]}`).digest('hex'), attentionVector: v });
    if (arch === 'C') rt.influx(c, 0.5);
    rt.step(); path.push(rt.getCurrentZone() as number);
  }
  return { path, flights: rt.flights };
}
