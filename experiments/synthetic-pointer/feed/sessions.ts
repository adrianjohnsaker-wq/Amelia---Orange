// Run sessions of zone input through one continuing Amelia each (the same runtime and steps as feed.ts / feed_hops.ts):
// per headline, each word zone is one step, then the result zone, then 3 listening steps. Records every hop.
//   node --import tsx sessions.ts <sessions.json> <out.json>     sessions.json: [{name, headlines: [{zones: [...], result}]}]
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { withFullNumogram } from '../../../src/core/fullNumogram';
import { IDENTITY } from '../nr1/nrRuntime';
import { WT4Runtime } from '../wt4/wt4Runtime';
import { graphFor } from '../nr1/graphs';
const [IN, OUT] = process.argv.slice(2); const S = JSON.parse(readFileSync(IN, 'utf8'));
function life(H: { zones: number[]; result: number }[]) {
  const rt: any = new WT4Runtime(); withFullNumogram(rt); rt.setSuppressRelaySteering(true); rt.rel = IDENTITY;
  rt.nd = true; rt.fieldWeight = 2.0; rt.warpRelease = true; rt.D = 0.6; rt.flow = true; rt.theta = 12; rt.oneUse = false;
  rt.getQabbala().setGates(graphFor('CANONICAL', 0).gates);
  let t = 0; const hops: any[] = []; const ends: number[] = [rt.getCurrentZone()];
  const step = (z: number | null, hl: number) => {
    const from = rt.getCurrentZone() as number, f0 = rt.flights;
    if (z !== null) { const v = Array(10).fill(0); v[z] = 1;
      rt.queueSynthetic({ eventId: `feed:${t}`, channel: 'SYNTHETIC_FIELD', sourceDigest: createHash('sha256').update(`feed|${t}|${z}`).digest('hex'), attentionVector: v });
      rt.influx(z, 0.5); }
    rt.step(); t++; const ids = new Map(rt.getQabbala().getGates().map((g: any) => [`${g.source}>${g.target}`, String(g.id)]));
    const route = [from, ...(rt.lastRoute ?? [rt.getCurrentZone()])];
    route.slice(1).forEach((b, i) => { const a = route[i]; if (a !== b) hops.push({ t, hl, from: a, to: b, gateId: ids.get(`${a}>${b}`) ?? null, flight: rt.flights > f0 && i === 0 }); });
    ends.push(rt.getCurrentZone());
  };
  H.forEach((h, i) => { for (const z of h.zones) step(z, i); step(h.result, i); for (let k = 0; k < 3; k++) step(null, i); });
  return { steps: t, hops, ends, flights: rt.flights };
}
writeFileSync(OUT, JSON.stringify(S.map((s: any) => ({ name: s.name, ...life(s.headlines) }))));
