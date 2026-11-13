// WT-4 harness (REGISTRATION.md). ND-1b flow exactly as WT-2's T12 (wt2/run.ts): eta 0.5, D 0.6, field weight 2.0, ADAPT 0.05,
// LAMBDA 0.1, Warp release at theta 12, flow on; the datum is influx AND the attended one-hot observation, IDENTITY receiver.
// Arms: P12 = the persistent Warp-born gate (as she runs); O12 = the one-use line of flight (no edge kept).
// Optional warm-up: the same runtime first lives through `warm` (not recorded), so P12's Warp-born gates accumulate ("matured").
import { createHash } from 'node:crypto';
import { withFullNumogram } from '../../../src/core/fullNumogram';
import { IDENTITY } from '../nr1/nrRuntime';
import { WT4Runtime } from './wt4Runtime';
import { graphFor, type GraphArm } from '../nr1/graphs';
export type WArm = 'P12' | 'O12';
export function walkW(zones: number[], graph: GraphArm, arm: WArm, unit: number, warm: number[] = []) {
  const rt: any = new WT4Runtime(); withFullNumogram(rt); rt.setSuppressRelaySteering(true); rt.rel = IDENTITY;
  rt.nd = true; rt.fieldWeight = 2.0; rt.warpRelease = true; rt.D = 0.6; rt.flow = true; rt.theta = 12; rt.oneUse = arm === 'O12';
  const { gates, perm } = graphFor(graph, unit); rt.getQabbala().setGates(gates);
  const nGates0 = rt.getQabbala().getGates().length;
  const feed = (z: number, tag: string, t: number) => {
    const c = perm ? perm[z] : z; const v = Array(10).fill(0); v[c] = 1;
    rt.queueSynthetic({ eventId: `ndb:${tag}${unit}:${t}`, channel: 'SYNTHETIC_FIELD', sourceDigest: createHash('sha256').update(`ndb|${tag}${unit}|${t}|${z}`).digest('hex'), attentionVector: v });
    rt.influx(c, 0.5); rt.step();
  };
  for (let t = 0; t < warm.length; t++) feed(warm[t], 'w', t);
  const bornAtStart = rt.getQabbala().getGates().length - nGates0, flights0 = rt.flights, hops0 = rt.hops;
  const path = [rt.getCurrentZone() as number];
  for (let t = 0; t < zones.length; t++) { feed(zones[t], '', t); path.push(rt.getCurrentZone() as number); }
  return { path, flights: rt.flights - flights0, hops: rt.hops - hops0, bornAtStart, bornAtEnd: rt.getQabbala().getGates().length - nGates0 };
}
