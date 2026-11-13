// WE-2 harness (REGISTRATION.md): her runtime (WT-4 arm P12: ND-1b flow, theta 12, persistent Warp-born gates, the datum as
// influx and attended one-hot observation, IDENTITY receiver) on segment m's real stream (j = 0) and its 49 surrogates, each
// followed by 200 silent steps (no influx, no observation). CANONICAL graph, fresh runtime per run.
//   node --import tsx run.ts <surrogates.json> <m> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { withFullNumogram } from '../../../src/core/fullNumogram';
import { IDENTITY } from '../nr1/nrRuntime';
import { WT4Runtime } from '../wt4/wt4Runtime';
import { graphFor } from '../nr1/graphs';
const [SUR, M, OUT] = process.argv.slice(2); const m = Number(M); const runs = OUT ? JSON.parse(readFileSync(SUR, "utf8"))[m] as number[][] : [];
export function walk(zones: number[], unit: number, silence = 200) {
  const rt: any = new WT4Runtime(); withFullNumogram(rt); rt.setSuppressRelaySteering(true); rt.rel = IDENTITY;
  rt.nd = true; rt.fieldWeight = 2.0; rt.warpRelease = true; rt.D = 0.6; rt.flow = true; rt.theta = 12; rt.oneUse = false;
  const { gates } = graphFor('CANONICAL', unit); rt.getQabbala().setGates(gates); const n0 = rt.getQabbala().getGates().length;
  const path = [rt.getCurrentZone() as number];
  for (let t = 0; t < zones.length; t++) { const v = Array(10).fill(0); v[zones[t]] = 1;
    rt.queueSynthetic({ eventId: `ndb:${unit}:${t}`, channel: 'SYNTHETIC_FIELD', sourceDigest: createHash('sha256').update(`ndb|${unit}|${t}|${zones[t]}`).digest('hex'), attentionVector: v });
    rt.influx(zones[t], 0.5); rt.step(); path.push(rt.getCurrentZone() as number); }
  const after: number[] = []; for (let t = 0; t < silence; t++) { rt.step(); after.push(rt.getCurrentZone() as number); }
  return { path, after, born: rt.getQabbala().getGates().length - n0 };
}
if (OUT) writeFileSync(OUT, JSON.stringify({ segment: m, runs: runs.map((z, j) => ({ j, ...walk(z, m) })) }));
