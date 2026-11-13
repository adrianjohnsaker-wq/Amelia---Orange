// Outside linguistics feed (exploratory). Headlines from world-live, reduced by main's A1Z26 linguistic reduction, read by one
// continuing Amelia in the research harness (her runtime: ND-1b flow, theta 12, persistent Warp-born gates). For each headline,
// each word's zone is one step of her life (attended one-hot + influx), then the result zone, then 3 listening steps.
//   node --import tsx feed.ts <world-live dir> <n headlines> <out.json>
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { withFullNumogram } from '../../../src/core/fullNumogram';
import { reduceLinguisticMaterial, compareLemurianPair } from '../../../src/outside/LinguisticReduction';
import { IDENTITY } from '../nr1/nrRuntime';
import { WT4Runtime } from '../wt4/wt4Runtime';
import { graphFor } from '../nr1/graphs';
const [LIVE, N, OUT] = process.argv.slice(2);
const seen = new Set<string>(); const items: any[] = [];
for (const f of readdirSync(`${LIVE}/batches`).sort()) for (const x of JSON.parse(readFileSync(`${LIVE}/batches/${f}`, 'utf8')).items) {
  const k = `${x.source}|${x.id}`; if (x.stream !== 'words' || seen.has(k)) continue; seen.add(k); items.push(x); }
items.sort((a, b) => a.seenAt < b.seenAt ? -1 : a.seenAt > b.seenAt ? 1 : 0);
const take = items.slice(-Number(N));
const rt: any = new WT4Runtime(); withFullNumogram(rt); rt.setSuppressRelaySteering(true); rt.rel = IDENTITY;
rt.nd = true; rt.fieldWeight = 2.0; rt.warpRelease = true; rt.D = 0.6; rt.flow = true; rt.theta = 12; rt.oneUse = false;
rt.getQabbala().setGates(graphFor('CANONICAL', 0).gates);
let t = 0;
const step = (z: number | null) => { if (z !== null) { const v = Array(10).fill(0); v[z] = 1;
  rt.queueSynthetic({ eventId: `feed:${t}`, channel: 'SYNTHETIC_FIELD', sourceDigest: createHash('sha256').update(`feed|${t}|${z}`).digest('hex'), attentionVector: v });
  rt.influx(z, 0.5); } rt.step(); t++; return rt.getCurrentZone() as number; };
const demon = (a: number, b: number) => { const m: any = compareLemurianPair(a as any, b as any); return m ? { name: m.name, netSpan: m.netSpan, classification: m.classification, pitch: m.pitch } : null; };
const out: any[] = [];
for (const x of take) {
  const r = reduceLinguisticMaterial(x.text, 'A1Z26'); const start = rt.getCurrentZone() as number; const her: number[] = [start];
  for (const w of r.wordReductions) her.push(step(w.zone));
  her.push(step(r.resultZone)); const listen: number[] = []; for (let k = 0; k < 3; k++) listen.push(step(null));
  const full = [...her, ...listen]; const passage: any[] = [];
  for (let i = 1; i < full.length; i++) if (full[i] !== full[i - 1]) passage.push({ from: full[i - 1], to: full[i], demon: demon(full[i - 1], full[i]), listening: i > her.length - 1 });
  out.push({ seenAt: x.seenAt, source: x.source, text: x.text, words: r.wordReductions.map(w => ({ token: w.token, number: w.number, zone: w.zone })),
    aggregate: r.aggregateNumber, resultZone: r.resultZone, inputDemons: r.loreComparisons.filter(c => c.match).map(c => ({ from: c.fromZone, to: c.toZone, name: (c.match as any).name })),
    herRoute: full, herPassage: passage, warpBorn: rt.getQabbala().getGates().filter((g: any) => String(g.id).startsWith('warpborn-')).map((g: any) => `${g.source}→${g.target}`) });
}
writeFileSync(OUT, JSON.stringify({ generated: new Date().toISOString(), headlines: out }, null, 1));
console.log('headlines', out.length, 'steps', t);
