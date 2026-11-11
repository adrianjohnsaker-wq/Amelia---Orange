// WT-2 harness (REGISTRATION.md). ND-1b flow exactly as in FLOW (flow/run.ts arch FLOW: eta 0.5, D 0.6, field weight 2.0,
// ADAPT 0.05, LAMBDA 0.1, Warp release, flow on; the datum is influx AND the attended one-hot observation, IDENTITY receiver),
// with the Warp's line of flight at theta steps: T24 (as she runs) or T12 (the quicker passage).
import { createHash } from 'node:crypto';
import { withFullNumogram } from '../../../src/core/fullNumogram';
import { IDENTITY } from '../nr1/nrRuntime';
import { WT2Runtime } from './wt2Runtime';
import { graphFor, type GraphArm } from '../nr1/graphs';
export type TArm = 'T24' | 'T12';
export function walkT(zones: number[], graph: GraphArm, arm: TArm, unit: number) {
  const rt: any = new WT2Runtime(); withFullNumogram(rt); rt.setSuppressRelaySteering(true); rt.rel = IDENTITY;
  rt.nd = true; rt.fieldWeight = 2.0; rt.warpRelease = true; rt.D = 0.6; rt.flow = true; rt.theta = arm === 'T12' ? 12 : 24;
  const { gates, perm } = graphFor(graph, unit); rt.getQabbala().setGates(gates);
  const path = [rt.getCurrentZone() as number];
  for (let t = 0; t < zones.length; t++) {
    const c = perm ? perm[zones[t]] : zones[t]; const v = Array(10).fill(0); v[c] = 1;
    rt.queueSynthetic({ eventId: `ndb:${unit}:${t}`, channel: 'SYNTHETIC_FIELD', sourceDigest: createHash('sha256').update(`ndb|${unit}|${t}|${zones[t]}`).digest('hex'), attentionVector: v });
    rt.influx(c, 0.5); rt.step(); path.push(rt.getCurrentZone() as number);
  }
  return { path, flights: rt.flights, hops: rt.hops };
}
