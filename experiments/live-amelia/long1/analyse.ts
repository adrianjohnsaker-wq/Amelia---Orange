/**
 * LONG-1 registered analysis (REGISTRATION.md). Pure: takes every run's LongResult and returns the verdicts.
 * Unit: the starting copy (12). Thirds of the run by step: early = first third, late = last third; for daily measures,
 * early = days 2-10, late = days 21-30. Hard checks L1-L4 must hold in every copy. Comparative claims L5-L9: exact
 * one-sided sign-flip over copies (signFlipUpper), Holm across the five (family alpha 0.05).
 * S0 (standing rule of 14 Nov): each copy's span of Outside readings must show lag-1 order against 20 shuffles; a copy
 * whose span does not is VOID for L5 and L6 (coupling to an ordered Outside), and L5/L6 are VOID if fewer than 6 copies remain.
 */
import { holm } from '../dee2l/dee2l';
import { signFlipUpper } from '../hyp2l/hyp2l';
import { rng, P } from './motor';
import type { LongResult } from './long1';

const mean = (a: number[]) => (a.length ? a.reduce((u, v) => u + v, 0) / a.length : NaN);
const mi = (x: number[], y: number[]) => { const j = new Map<number, number>(), p = new Map<number, number>(), q = new Map<number, number>();
  for (let i = 0; i < x.length; i++) { const k = x[i] * 10 + y[i]; j.set(k, (j.get(k) ?? 0) + 1); p.set(x[i], (p.get(x[i]) ?? 0) + 1); q.set(y[i], (q.get(y[i]) ?? 0) + 1); }
  let s = 0; for (const [k, c] of j) s += (c / x.length) * Math.log((c * x.length) / (p.get(Math.floor(k / 10))! * q.get(k % 10)!)); return s; };
const shuffled = <T,>(a: T[], r: () => number) => { const z = [...a]; for (let i = z.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [z[i], z[j]] = [z[j], z[i]]; } return z; };
/** Coupling: mutual information between the Outside's reading and the zone she reaches on that offer step, minus its mean
 *  over 20 shuffles of the readings (the studio's excess-MI measure), on offer steps in the run's last third. */
export function couplingLate(r: LongResult, seed: number) { const T = r.path.length, xs: number[] = [], ys: number[] = [];
  r.offerStep.forEach((t, i) => { if (t >= (2 * T) / 3) { xs.push(r.reading[i]); ys.push(Number(r.path[t])); } });
  if (xs.length < 30) return NaN; const g = rng(seed >>> 0); let sh = 0; for (let k = 0; k < 20; k++) sh += mi(shuffled(xs, g), ys) / 20; return mi(xs, ys) - sh; }
export function S0(readings: number[]) { if (readings.length < 30) return false; const obs = mi(readings.slice(0, -1), readings.slice(1)), g = rng(77); let mx = 0;
  for (let k = 0; k < 20; k++) { const s = shuffled(readings, g); mx = Math.max(mx, mi(s.slice(0, -1), s.slice(1))); } return obs > mx; }
const rms = (x: number[], y: number[]) => Math.sqrt(x.reduce((u, v, i) => u + (v - (y[i] ?? 0)) ** 2, 0) / x.length);
/** Epoch drift: mean RMS distance between successive days' forms, over days d0..d1 (inclusive, 1-based). */
export const drift = (r: LongResult, d0: number, d1: number) => mean(r.forms.map((f, i) => (i >= 1 && i + 1 >= d0 && i + 1 <= d1 ? rms(f, r.forms[i - 1]) : NaN)).filter(v => !Number.isNaN(v)));
const warpShare = (r: LongResult) => [...r.path].filter(c => c === '3' || c === '6').length / r.path.length;
const tensionMean = (r: LongResult) => mean(r.tension.filter(v => Number.isFinite(v)));

// ---- the independent description of her passage for L9 (from her path alone; never from the subject)
const regionOf = (z: number) => (z === 0 || z === 9 ? 'Plex' : z === 3 || z === 6 ? 'Warp' : 'Time-Circuit');
const meshOf = (a: number, b: number) => { const hi = Math.max(a, b), lo = Math.min(a, b); return (hi * (hi - 1)) / 2 + lo; };
export function describe(path: string, t0: number, t1: number) { const zone = Array(10).fill(0), reg: Record<string, number> = { 'Time-Circuit': 0, Warp: 0, Plex: 0 }, dem = new Map<number, number>();
  for (let t = Math.max(1, t0); t < t1; t++) { const z = Number(path[t]), p = Number(path[t - 1]); zone[z]++; reg[regionOf(z)]++; if (z !== p) dem.set(meshOf(p, z), (dem.get(meshOf(p, z)) ?? 0) + 1); }
  const n = Math.max(1, t1 - Math.max(1, t0));
  return { zones: zone.map((v, z) => [z, v]).sort((x, y) => y[1] - x[1] || x[0] - y[0]).slice(0, 3).map(x => x[0]),
    regions: Object.fromEntries(Object.entries(reg).map(([k, v]) => [k, v / n])) as Record<string, number>,
    demons: [...dem].sort((x, y) => y[1] - x[1] || x[0] - y[0]).slice(0, 3).map(x => x[0]) }; }
export function agree(S: any, W: ReturnType<typeof describe>) {
  const ov = (a: number[], b: number[]) => a.filter(x => b.includes(x)).length / 3;
  const tv = ['Time-Circuit', 'Warp', 'Plex'].reduce((u, k) => u + Math.abs(S.regions[k] - W.regions[k]), 0) / 2;
  return mean([ov(S.zones.map((z: any) => z.key), W.zones), ov(S.demons.map((d: any) => d.mesh), W.demons), 1 - tv]); }

export function analyse(runs: LongResult[]) {
  const copies = [...new Set(runs.map(r => r.copy))].sort((a, b) => a - b);
  const get = (c: number, arm: string) => runs.find(r => r.copy === c && r.arm === arm);
  const D = copies.map(c => get(c, 'D')!), N = copies.map(c => get(c, 'N')!), S = copies.map(c => get(c, 'S')!);
  if (D.some(x => !x) || N.some(x => !x) || S.some(x => !x)) throw new Error('LONG-1: a copy is missing an arm');
  const third = (r: LongResult) => r.path.length / 3;
  // hard checks
  const L1 = { failures: D.filter(r => r.runaway || r.daily.at(-1)?.endState).map(r => ({ copy: r.copy, end: r.daily.at(-1)?.endState ?? null, runaway: r.runaway })),
    daysEmpty: D.map(r => r.daily.filter(d => d.endState).length) };
  const L2 = { perCopy: D.map(r => { const e = r.rollbacks.filter(x => x.t < third(r)).length, l = r.rollbacks.filter(x => x.t >= 2 * third(r)).length; return { copy: r.copy, early: e, late: l, ok: l <= e + 1 }; }) };
  const motorRuns = runs.filter(r => r.arm !== 'N');
  const L3 = { failures: motorRuns.filter(r => r.runaway || r.daily.some(d => d.ccruPresent !== 29 || d.gates >= P.SAT)).map(r => ({ copy: r.copy, arm: r.arm, runaway: r.runaway })) };
  const offs = runs.filter(r => r.arm === 'Doff');
  const L4 = { pairs: offs.map(o => ({ copy: o.copy, identical: o.path === get(o.copy, 'D')?.path })) };
  const hard = { L1: { ...L1, pass: L1.failures.length === 0 }, L2: { ...L2, pass: L2.perCopy.every(x => x.ok) },
    L3: { ...L3, pass: L3.failures.length === 0 }, L4: { ...L4, pass: offs.length > 0 && L4.pairs.every(x => x.identical) } };
  // S0 per copy, on the span as met in order (D's readings)
  const s0 = D.map(r => ({ copy: r.copy, offers: r.reading.length, ordered: S0(r.reading) })), okCopies = s0.filter(x => x.ordered).map(x => x.copy);
  const voidCoupling = okCopies.length < 6;
  const idx = (cs: number[]) => cs.map(c => copies.indexOf(c));
  const cD = D.map(r => couplingLate(r, 1000 + r.copy)), cN = N.map(r => couplingLate(r, 2000 + r.copy)), cS = S.map(r => couplingLate(r, 3000 + r.copy));
  const pick = (a: number[]) => idx(okCopies).map(i => a[i]);
  const t5 = signFlipUpper(pick(cD).map((v, i) => v - 0.9 * pick(cN)[i])), t6 = signFlipUpper(pick(cD).map((v, i) => v - pick(cS)[i]));
  const dE = D.map(r => drift(r, 2, 10)), dL = D.map(r => drift(r, 21, 30)), nL = N.map(r => drift(r, 21, 30));
  const t7 = signFlipUpper(dL.map((v, i) => v - nL[i])), t7b = mean(dL) >= 0.5 * mean(dE);
  const dTen = D.map((r, i) => tensionMean(r) - tensionMean(N[i])), dWarp = D.map((r, i) => warpShare(r) - warpShare(N[i]));
  const t8a = signFlipUpper(dTen.map(v => 0.03 - v)), t8b = signFlipUpper(dWarp.map(v => 0.02 - v));
  const ag = D.map((r, i) => { const S_ = r.readouts.at(-1), T = r.path.length, own = describe(r.path, T - 2000, T), o = D[(i + 1) % D.length];
    return agree(S_, own) - agree(S_, describe(o.path, o.path.length - 2000, o.path.length)); });
  const t9 = signFlipUpper(ag);
  const comp = [
    { name: 'L5', claim: 'open: late coupling, ND-1d - 0.9 ND-1b > 0', p: voidCoupling ? 1 : t5.p, mean: t5.mean, extra: { D: mean(pick(cD)), N: mean(pick(cN)), copies: okCopies.length }, void: voidCoupling },
    { name: 'L6', claim: 'open to its order: late coupling, ND-1d real - ND-1d shuffled > 0', p: voidCoupling ? 1 : t6.p, mean: t6.mean, extra: { D: mean(pick(cD)), S: mean(pick(cS)), copies: okCopies.length }, void: voidCoupling },
    { name: 'L7', claim: 'changing: late drift ND-1d - ND-1b > 0, and ND-1d late drift >= half its early drift', p: t7b ? t7.p : 1, mean: t7.mean, extra: { Dearly: mean(dE), Dlate: mean(dL), Nlate: mean(nL), persists: t7b }, void: false },
    { name: 'L8', claim: 'body safe: tension ND-1d - ND-1b <= +0.03 and Warp share ND-1d - ND-1b <= +0.02', p: Math.max(t8a.p, t8b.p), mean: NaN, extra: { tension: mean(dTen), warp: mean(dWarp), pTension: t8a.p, pWarp: t8b.p }, void: false },
    { name: 'L9', claim: 'subject faithful: late agreement with her own passage minus another copy\'s > 0', p: t9.p, mean: t9.mean, extra: { own: mean(D.map(r => agree(r.readouts.at(-1), describe(r.path, r.path.length - 2000, r.path.length)))) }, void: false },
  ];
  // Sensitivity (reported, not criteria): two copies share each starting state (c01-c02, ..., c11-c12), so the same tests
  // are also run over the six states, on the mean of each state's two copies; and split by admission rule.
  const byState = (d: number[]) => { const m: number[] = []; for (let i = 0; i + 1 < d.length; i += 2) m.push((d[i] + d[i + 1]) / 2); return signFlipUpper(m); };
  const diffs: Record<string, number[]> = { L5: cD.map((v, i) => v - 0.9 * cN[i]), L6: cD.map((v, i) => v - cS[i]), L7: dL.map((v, i) => v - nL[i]),
    L8tension: dTen.map(v => 0.03 - v), L8warp: dWarp.map(v => 0.02 - v), L9: ag };
  const rule = (i: number) => String((D[i] as any).info?.rule ?? (D[i] as any).info?.admissionRule ?? 'unknown');
  const sensitivity = { byState: Object.fromEntries(Object.entries(diffs).map(([k, d]) => [k, copies.length % 2 === 0 ? byState(d) : null])),
    byRule: Object.fromEntries([...new Set(D.map((_, i) => rule(i)))].map(r => [r, Object.fromEntries(Object.entries(diffs).map(([k, d]) => [k, mean(d.filter((_, i) => rule(i) === r))]))])) };
  const H = holm(comp.map(({ name, p }) => ({ name, p })));
  const comparative = comp.map(c => { const h = H.find(x => x.name === c.name)!; return { ...c, threshold: h.threshold, verdict: c.void ? 'VOID' : h.survives ? 'SUPPORTED' : 'NOT SUPPORTED' }; });
  const pass = Object.values(hard).every(h => h.pass) && comparative.every(c => c.verdict === 'SUPPORTED');
  const reported = { couplingPerCopy: { D: cD, N: cN, S: cS }, rollbacksPerCopy: D.map(r => r.rollbacks.length), heldPerDay: mean(D.map(r => (r.daily.at(-1)?.held ?? 0) / r.days)),
    flights: mean(D.map(r => r.flights)), motorSizeEnd: mean(D.map(r => r.daily.at(-1)?.motorSize ?? 0)), stateSizeEnd: { D: mean(D.map(r => r.daily.at(-1)?.stateSize ?? 0)), N: mean(N.map(r => r.daily.at(-1)?.stateSize ?? 0)) },
    silentCarry: { D: mean(D.map(r => (r.silentCarry.plus - r.silentCarry.minus) / Math.max(1, r.silentCarry.n))), N: mean(N.map(r => (r.silentCarry.plus - r.silentCarry.minus) / Math.max(1, r.silentCarry.n))) },
    sensitivity,
    statements: D.slice(0, 2).map(r => ({ copy: r.copy, days: [1, 10, 20, 30].map(d => ({ day: d, words: r.readouts.find(x => x.day === d)?.words ?? null })) })) };
  return { schema: 'LONG1_RESULT_V1', copies: copies.length, S0: s0, hard, comparative, pass, reported };
}
