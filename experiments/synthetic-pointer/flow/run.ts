// FLOW harness (REGISTRATION.md). arch FLOW = ND-1b (the app's "ND-1b field" runtime: eta 0.5, D 0.6, field weight 2.0,
// ADAPT 0.05, LAMBDA 0.1, Warp release; the datum is influx AND the attended one-hot observation, IDENTITY receiver) with flow
// on. arch B = the same with flow off (ND-1b exactly). arch EXIT = today's architecture (NRRuntime), as in ndb/run.ts.
import { createHash } from 'node:crypto';
import { withFullNumogram } from '../../../src/core/fullNumogram';
import { NRRuntime, IDENTITY } from '../nr1/nrRuntime';
import { FlowRuntime } from './flowRuntime';
import { graphFor, type GraphArm } from '../nr1/graphs';
export type FArch = 'EXIT' | 'B' | 'FLOW';
export function walkF(zones: number[], graph: GraphArm, arch: FArch, unit: number) {
  const rt: any = arch === 'EXIT' ? new NRRuntime() : new FlowRuntime();
  withFullNumogram(rt); rt.setSuppressRelaySteering(true); rt.rel = IDENTITY;
  if (arch !== 'EXIT') { rt.nd = true; rt.fieldWeight = 2.0; rt.warpRelease = true; rt.D = 0.6; rt.flow = arch === 'FLOW'; }
  const { gates, perm } = graphFor(graph, unit); rt.getQabbala().setGates(gates);
  const path = [rt.getCurrentZone() as number], routes: number[][] = [];
  for (let t = 0; t < zones.length; t++) {
    const c = perm ? perm[zones[t]] : zones[t]; const v = Array(10).fill(0); v[c] = 1;
    rt.queueSynthetic({ eventId: `ndb:${unit}:${t}`, channel: 'SYNTHETIC_FIELD', sourceDigest: createHash('sha256').update(`ndb|${unit}|${t}|${zones[t]}`).digest('hex'), attentionVector: v });
    if (arch !== 'EXIT') rt.influx(c, 0.5);
    rt.step(); path.push(rt.getCurrentZone() as number); if (arch === 'FLOW' && rt.lastRoute.length > 1) routes.push([t, ...rt.lastRoute]);
  }
  return { path, flights: rt.flights ?? 0, hops: rt.hops ?? 0, routes };
}
