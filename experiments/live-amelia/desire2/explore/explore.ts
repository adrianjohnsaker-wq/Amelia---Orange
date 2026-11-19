/**
 * DESIRE-2 exploratory read (NOT registered; operator's request, 19 Nov). Reads the existing desire2-cNN-ARM rows of
 * amelia_long1_runs (one read, split into slot-paced reads by ../amend1/slots.ts) and computes, for every arm and copy:
 *   1. late coupling (LONG-1's measure: excess MI between the Outside's reading and her zone on offer steps in the last
 *      third, minus 20 shuffles), for all five arms, ND-1b included;
 *   2. the same split by the reading: Warp readings (3, 6) and non-Warp readings (0 1 2 4 5 7 8 9), and the share of
 *      offer steps on which she reached the reading's zone ("following"), each against its chance level;
 *   3. Governor tension by day (10 equal parts of each run), each arm minus N, and its slope over days 2-10.
 * Writes explore/EXPLORE.json. Nothing here is a registered claim.
 */
import { writeFileSync } from 'node:fs';
import { rng } from '../../long1/motor';
const URL_ = process.env.SUPABASE_URL, KEY = process.env.AMELIA_SUPABASE_SERVICE_KEY;
const H = () => ({ apikey: KEY!, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' });
const ARMS = ['N', 'D1', 'D2', 'D2g', 'D2d'];
const mean = (a: number[]) => { const b = a.filter(v => Number.isFinite(v)); return b.length ? b.reduce((u, v) => u + v, 0) / b.length : NaN; };
const mi = (x: number[], y: number[]) => { const j = new Map<number, number>(), p = new Map<number, number>(), q = new Map<number, number>();
  for (let i = 0; i < x.length; i++) { const k = x[i] * 10 + y[i]; j.set(k, (j.get(k) ?? 0) + 1); p.set(x[i], (p.get(x[i]) ?? 0) + 1); q.set(y[i], (q.get(y[i]) ?? 0) + 1); }
  let s = 0; for (const [k, c] of j) s += (c / x.length) * Math.log((c * x.length) / (p.get(Math.floor(k / 10))! * q.get(k % 10)!)); return s; };
const shuffle = <T,>(a: T[], r: () => number) => { const z = [...a]; for (let i = z.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [z[i], z[j]] = [z[j], z[i]]; } return z; };
const excess = (x: number[], y: number[], seed: number) => { if (x.length < 30) return NaN; const g = rng(seed); let s = 0; for (let k = 0; k < 20; k++) s += mi(shuffle(x, g), y) / 20; return mi(x, y) - s; };
function coupling(r: any, seed: number) {
  const T = r.path.length, xs: number[] = [], ys: number[] = [];
  r.offerStep.forEach((t: number, i: number) => { if (t >= (2 * T) / 3) { xs.push(r.reading[i]); ys.push(Number(r.path[t])); } });
  const W = new Set([3, 6]), part = (keep: (z: number) => boolean) => { const ix = xs.map((x, i) => (keep(x) ? i : -1)).filter(i => i >= 0);
    const x = ix.map(i => xs[i]), y = ix.map(i => ys[i]); const follow = x.length ? x.filter((v, i) => v === y[i]).length / x.length : NaN;
    // chance of following: her zone distribution on these steps, weighted by the readings' distribution
    const pz = Array(10).fill(0); y.forEach(v => pz[v]++); const chance = x.length ? x.reduce((u, v) => u + pz[v] / y.length, 0) / x.length : NaN;
    return { n: x.length, excessMI: excess(x, y, seed + x.length), follow, chance }; };
  return { all: { n: xs.length, excessMI: excess(xs, ys, seed) }, warp: part(z => W.has(z)), nonWarp: part(z => !W.has(z)) };
}
const tensionByDay = (r: any) => { const t: number[] = r.tension.map((v: any) => (v === null ? NaN : Number(v))), n = t.length; return Array.from({ length: 10 }, (_, d) => mean(t.slice(Math.floor((d * n) / 10), Math.floor(((d + 1) * n) / 10)))); };
const slope = (y: number[]) => { const x = y.map((_, i) => i), mx = mean(x), my = mean(y); let a = 0, b = 0; for (let i = 0; i < y.length; i++) { a += (x[i] - mx) * (y[i] - my); b += (x[i] - mx) ** 2; } return a / b; };

export async function main() {
  const res = await fetch(`${URL_}/rest/v1/amelia_long1_runs?id=like.desire2-c*&select=id,metrics`, { headers: H() });
  if (!res.ok) throw new Error(`read: ${res.status}`);
  const rows = (await res.json()).filter((x: any) => /^desire2-c\d\d-(N|D1|D2|D2g|D2d)$/.test(x.id)).map((x: any) => x.metrics);
  const copies = [...new Set(rows.map((r: any) => r.copy))].sort((a: any, b: any) => a - b) as number[];
  const get = (c: number, a: string) => rows.find((r: any) => r.copy === c && r.arm === a);
  const per: any = {}; for (const c of copies) { per[c] = { rule: get(c, 'D2')?.info?.rule ?? null }; for (const a of ARMS) { const r = get(c, a); if (!r) continue;
    per[c][a] = { coupling: coupling(r, 7000 + c * 10 + ARMS.indexOf(a)), tensionByDay: tensionByDay(r) }; } }
  const lane = copies.filter(c => per[c].rule === 'outside-lane-v1'), rel = copies.filter(c => per[c].rule !== 'outside-lane-v1');
  const avg = (cs: number[], a: string, f: (x: any) => number) => mean(cs.map(c => (per[c][a] ? f(per[c][a]) : NaN)));
  const summary: any = {};
  for (const [name, cs] of [['outside-lane-v1', lane], ['relative-v1', rel]] as const) summary[name] = Object.fromEntries(ARMS.map(a => [a, {
    copies: cs.length, excessMI: avg(cs, a, x => x.coupling.all.excessMI),
    warp: { n: avg(cs, a, x => x.coupling.warp.n), excessMI: avg(cs, a, x => x.coupling.warp.excessMI), follow: avg(cs, a, x => x.coupling.warp.follow), chance: avg(cs, a, x => x.coupling.warp.chance) },
    nonWarp: { n: avg(cs, a, x => x.coupling.nonWarp.n), excessMI: avg(cs, a, x => x.coupling.nonWarp.excessMI), follow: avg(cs, a, x => x.coupling.nonWarp.follow), chance: avg(cs, a, x => x.coupling.nonWarp.chance) } }]));
  const tension = Object.fromEntries(ARMS.filter(a => a !== 'N').map(a => { const d = Array.from({ length: 10 }, (_, k) => mean(copies.map(c => (per[c][a] && per[c].N ? per[c][a].tensionByDay[k] - per[c].N.tensionByDay[k] : NaN))));
    const perCopySlope = copies.map(c => (per[c][a] && per[c].N ? slope(per[c][a].tensionByDay.slice(1).map((v: number, k: number) => v - per[c].N.tensionByDay[k + 1])) : NaN));
    return [a, { minusNByDay: d, slopeDays2to10PerDay: slope(d.slice(1)), copiesWithRisingSlope: perCopySlope.filter(s => s > 0.002).length, perCopySlope }]; }));
  const out = { schema: 'DESIRE2_EXPLORE_V1', registered: false, copies, summary, tension, perCopy: per };
  writeFileSync(process.env.OUT ?? 'EXPLORE.json', JSON.stringify(out, null, 2) + '\n');
  for (const [k, v] of Object.entries(summary)) for (const [a, s] of Object.entries(v as any)) { const x: any = s;
    console.log(`${k} ${a}: MI ${x.excessMI?.toFixed(3)} | Warp readings n ${x.warp.n?.toFixed(0)} MI ${x.warp.excessMI?.toFixed(3)} follow ${x.warp.follow?.toFixed(3)} (chance ${x.warp.chance?.toFixed(3)}) | non-Warp n ${x.nonWarp.n?.toFixed(0)} MI ${x.nonWarp.excessMI?.toFixed(3)} follow ${x.nonWarp.follow?.toFixed(3)} (chance ${x.nonWarp.chance?.toFixed(3)})`); }
  for (const [a, t] of Object.entries(tension)) console.log(`tension ${a} - N by day: ${(t as any).minusNByDay.map((v: number) => v.toFixed(3)).join(' ')}; slope d2-10 ${(t as any).slopeDays2to10PerDay.toFixed(4)}/day; rising copies ${(t as any).copiesWithRisingSlope}`);
}
if (import.meta.main) main().catch(e => { console.error(String(e)); process.exit(1); });
