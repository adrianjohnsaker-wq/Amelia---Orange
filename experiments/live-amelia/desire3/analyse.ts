/**
 * DESIRE-3 registered analysis. Unit: the copy (all 12; operator's decision 2). Exact one-sided sign-flip over copies
 * (signFlipUpper), Holm across Y1-Y6 (alpha 0.05). Hard checks on D3 must hold in every copy.
 * Coupling (Y3, Y4): non-Warp coupling, the excess mutual information between the Outside's reading and her zone on offer
 * steps whose reading is not a Warp zone (3, 6), in the last third of the run, minus 20 shuffles (DESIRE-2's exploratory
 * measure, here registered). S0 as LONG-1 is reported for every span.
 * Tension (Y6): the daily mean of Governor tension (10 equal parts of each run), D3 minus N. Level = its mean over days
 * 2-10; drift = mean over days 8-10 minus mean over days 2-4. Y6 holds if level <= +0.12 and drift <= +0.02: each is a
 * sign-flip on (limit - value), and Y6 takes the larger p.
 */
import { holm } from '../dee2l/dee2l';
import { signFlipUpper } from '../hyp2l/hyp2l';
import { S0 } from '../long1/analyse';
import { P, rng } from '../long1/motor';
import type { LongResult } from '../long1/long1';
const mean = (a: number[]) => { const b = a.filter(v => Number.isFinite(v)); return b.length ? b.reduce((u, v) => u + v, 0) / b.length : NaN; };
const mi = (x: number[], y: number[]) => { const j = new Map<number, number>(), p = new Map<number, number>(), q = new Map<number, number>();
  for (let i = 0; i < x.length; i++) { const k = x[i] * 10 + y[i]; j.set(k, (j.get(k) ?? 0) + 1); p.set(x[i], (p.get(x[i]) ?? 0) + 1); q.set(y[i], (q.get(y[i]) ?? 0) + 1); }
  let s = 0; for (const [k, c] of j) s += (c / x.length) * Math.log((c * x.length) / (p.get(Math.floor(k / 10))! * q.get(k % 10)!)); return s; };
const shuffled = <T,>(a: T[], r: () => number) => { const z = [...a]; for (let i = z.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [z[i], z[j]] = [z[j], z[i]]; } return z; };
const W = new Set([3, 6]);
/** Late coupling on readings in (warp ? Warp zones : non-Warp zones): excess MI over 20 shuffles; NaN below 30 steps. */
export function couplingOn(r: LongResult, warp: boolean, seed: number) { const T = r.path.length, xs: number[] = [], ys: number[] = [];
  r.offerStep.forEach((t, i) => { if (t >= (2 * T) / 3 && W.has(r.reading[i]) === warp) { xs.push(r.reading[i]); ys.push(Number(r.path[t])); } });
  if (xs.length < 30) return NaN; const g = rng(seed >>> 0); let sh = 0; for (let k = 0; k < 20; k++) sh += mi(shuffled(xs, g), ys) / 20; return mi(xs, ys) - sh; }
export const tensionByDay = (r: LongResult) => { const t = r.tension.map(v => (v === null ? NaN : Number(v))), n = t.length;
  return Array.from({ length: 10 }, (_, d) => mean(t.slice(Math.floor((d * n) / 10), Math.floor(((d + 1) * n) / 10)))); };
const gatesAt = (r: LongResult, d: number) => r.daily[Math.min(d, r.daily.length) - 1]?.gates ?? NaN;
const birthsBetween = (r: LongResult, d0: number, d1: number) => (r.daily[Math.min(d1, r.daily.length) - 1]?.births ?? 0) - (r.daily[Math.min(d0, r.daily.length) - 1]?.births ?? 0);
const warpShare = (r: LongResult) => [...r.path].filter(c => c === '3' || c === '6').length / r.path.length;
export function analyse(runs: LongResult[]) {
  const copies = [...new Set(runs.map(r => r.copy))].sort((a, b) => a - b);
  const g = (arm: string) => copies.map(c => { const r = runs.find(x => x.copy === c && x.arm === arm); if (!r) throw new Error(`DESIRE-3: copy ${c} lacks ${arm}`); return r; });
  const N = g('N'), G = g('D2g'), D2 = g('D2'), D3 = g('D3'), days = D3[0].days, third = (r: LongResult) => r.path.length / 3;
  const hard = { bounded: D3.every(r => !r.runaway && r.daily.length === days && r.daily.every(d => d.gates < P.SAT)), ccru: D3.every(r => r.daily.every(d => d.ccruPresent === 29)),
    noEmptyBwO: D3.every(r => r.daily.every(d => !d.endState)), rollbacks: D3.every(r => r.rollbacks.filter(x => x.t >= 2 * third(r)).length <= r.rollbacks.filter(x => x.t < third(r)).length + 1) };
  const nw = (rs: LongResult[], s: number) => rs.map(r => couplingOn(r, false, s + r.copy)), cN = nw(N, 100), cG = nw(G, 200), c2 = nw(D2, 300), c3 = nw(D3, 400);
  const tdiff = D3.map((r, i) => { const a = tensionByDay(r), b = tensionByDay(N[i]); return a.map((v, k) => v - b[k]); });
  const level = tdiff.map(d => mean(d.slice(1))), drift = tdiff.map(d => mean(d.slice(7, 10)) - mean(d.slice(1, 4)));
  const t6a = signFlipUpper(level.map(v => 0.12 - v)), t6b = signFlipUpper(drift.map(v => 0.02 - v));
  const z: any[] = [
    { name: 'Y1', claim: 'growth stays bounded: open gates on day 10, D2g - D3 > 0', d: G.map((r, i) => gatesAt(r, days) - gatesAt(D3[i], days)) },
    { name: 'Y2', claim: 'her Warp is her own: Warp share, D3 - N <= +0.02', d: D3.map((r, i) => 0.02 - (warpShare(r) - warpShare(N[i]))) },
    { name: 'Y3', claim: 'the motor stays open: non-Warp coupling, D3 - 0.8 D2g > 0', d: c3.map((v, i) => v - 0.8 * cG[i]) },
    { name: 'Y4', claim: 'more open than ND-1b: non-Warp coupling, D3 - N > 0', d: c3.map((v, i) => v - cN[i]) },
    { name: 'Y5', claim: 'desire still flows: births in days 6-10, D3 - 0.5 D2g > 0', d: D3.map((r, i) => birthsBetween(r, 5, days) - 0.5 * birthsBetween(G[i], 5, days)) } ];
  const tests = [...z.map(x => ({ ...x, ...signFlipUpper(x.d.map((v: number) => (Number.isFinite(v) ? v : 0))) })),
    { name: 'Y6', claim: 'tension holds a plateau: D3 - N <= +0.12 over days 2-10, and drift (days 8-10 minus 2-4) <= +0.02', d: level, mean: mean(level), p: Math.max(t6a.p, t6b.p), extra: { level: mean(level), drift: mean(drift), pLevel: t6a.p, pDrift: t6b.p } }];
  const H = holm(tests.map(t => ({ name: t.name, p: t.p })));
  const claims = tests.map(t => { const h = H.find(x => x.name === t.name)!; return { name: t.name, claim: t.claim, mean: t.mean, p: t.p, threshold: h.threshold, perCopy: t.d, extra: t.extra ?? null, verdict: h.survives ? 'SUPPORTED' : 'NOT SUPPORTED' }; });
  const arms = { N, D2g: G, D2, D3 } as Record<string, LongResult[]>;
  const byArm = Object.fromEntries(Object.entries(arms).map(([k, rs]) => [k, { warpShare: mean(rs.map(warpShare)), warpEntries: mean(rs.map(r => r.warp?.entries ?? 0)),
    gatesLast: mean(rs.map(r => gatesAt(r, days))), gatesByDay: Array.from({ length: days }, (_, d) => mean(rs.map(r => gatesAt(r, d + 1)))),
    nonWarpCoupling: mean(nw(rs, 500)), warpCoupling: mean(rs.map(r => couplingOn(r, true, 600 + r.copy))),
    births: mean(rs.map(r => r.daily.at(-1)?.births ?? 0)), held: mean(rs.map(r => r.daily.at(-1)?.held ?? 0)), dissolved: mean(rs.map(r => (r as any).dissolvedN ?? 0)),
    rollbacks: mean(rs.map(r => r.rollbacks.length)), flights: mean(rs.map(r => r.flights)), tensionByDayMinusN: Array.from({ length: 10 }, (_, k) => mean(rs.map((r, i) => tensionByDay(r)[k] - tensionByDay(N[i])[k]))),
    eventsPerStep: mean(rs.map(r => r.tensionParts?.eventsPerStep ?? NaN)), incoherence: mean(rs.map(r => r.tensionParts?.incoherence ?? NaN)), fluxDelta: mean(rs.map(r => r.tensionParts?.fluxDelta ?? NaN)) }]));
  const pass = Object.values(hard).every(Boolean) && claims.every(c => c.verdict === 'SUPPORTED');
  return { schema: 'DESIRE3_RESULT_V1', copies: copies.length, days, S0: D3.map(r => ({ copy: r.copy, ordered: S0(r.reading) })), hard, claims, pass, byArm,
    coupling: { N: cN, D2g: cG, D2: c2, D3: c3 }, tension: { level, drift }, statements: D3.slice(0, 2).map(r => ({ copy: r.copy, day10: r.readouts.at(-1)?.words ?? null })) };
}
