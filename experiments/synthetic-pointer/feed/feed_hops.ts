// The Pandemonium Feed's life again, at hop level: the same headlines (from a feed.json), the same runtime and steps as
// feed.ts, recording every hop of each step (from -> chosen gate -> flow hops), the edge kind's source (base app gate, CCRU
// edge, Warp-born) and every line of flight.   node --import tsx feed_hops.ts <feed.json> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { withFullNumogram } from '../../../src/core/fullNumogram';
import { reduceLinguisticMaterial } from '../../../src/outside/LinguisticReduction';
import { IDENTITY } from '../nr1/nrRuntime';
import { WT4Runtime } from '../wt4/wt4Runtime';
import { graphFor } from '../nr1/graphs';
const [FEED, OUT] = process.argv.slice(2); const H = JSON.parse(readFileSync(FEED, 'utf8')).headlines;
const rt: any = new WT4Runtime(); withFullNumogram(rt); rt.setSuppressRelaySteering(true); rt.rel = IDENTITY;
rt.nd = true; rt.fieldWeight = 2.0; rt.warpRelease = true; rt.D = 0.6; rt.flow = true; rt.theta = 12; rt.oneUse = false;
rt.getQabbala().setGates(graphFor('CANONICAL', 0).gates);
let t = 0; const hops: any[] = [];
const ids = () => new Map(rt.getQabbala().getGates().map((g: any) => [`${g.source}>${g.target}`, String(g.id)]));
const step = (z: number | null, hl: number, phase: string) => {
  const from = rt.getCurrentZone() as number, f0 = rt.flights;
  if (z !== null) { const v = Array(10).fill(0); v[z] = 1;
    rt.queueSynthetic({ eventId: `feed:${t}`, channel: 'SYNTHETIC_FIELD', sourceDigest: createHash('sha256').update(`feed|${t}|${z}`).digest('hex'), attentionVector: v });
    rt.influx(z, 0.5); }
  rt.step(); t++; const g = ids(); const route = [from, ...(rt.lastRoute ?? [rt.getCurrentZone()])];
  route.slice(1).forEach((b, i) => { const a = route[i]; if (a !== b) hops.push({ t, hl, phase, from: a, to: b, gateId: g.get(`${a}>${b}`) ?? null, flight: rt.flights > f0 && i === 0 }); });
  if (route.length === 1 || route.every(x => x === from)) hops.push({ t, hl, phase, from, to: from, gateId: null, dwell: true });
};
H.forEach((h: any, i: number) => { const r = reduceLinguisticMaterial(h.text, 'A1Z26');
  for (const w of r.wordReductions) step(w.zone, i, 'word'); step(r.resultZone, i, 'result'); for (let k = 0; k < 3; k++) step(null, i, 'listen'); });
writeFileSync(OUT, JSON.stringify({ steps: t, hops, flights: rt.flights }));
console.log('steps', t, 'hops', hops.filter(h => !h.dwell).length, 'flights', rt.flights);
