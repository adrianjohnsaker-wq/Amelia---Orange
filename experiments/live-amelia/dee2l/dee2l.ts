/**
 * DEE-2L machinery (experiments/live-amelia/dee2l/REGISTRATION.md). DEE-1L's research runtime, table, replay and T,
 * unchanged and imported, with new shuffles (k = 40..99), T_excess, and the registered statistics. Pure.
 */
import { makeTable, transmission, isStudyOffer } from '../dee1l/dee1l';
import type { DeeProbeRow } from '../../../src/outside/AmeliaNDRuntimeDee';

export const GAIN = 0.24;                                   // DEE-1L's registered gain, held fixed
export const SHUFFLE_KS = Array.from({ length: 60 }, (_, i) => 40 + i);   // shuffleSeed 1584040..1584099, new to DEE-2L
export const ARMS = ['GATES', 'ACTUAL', ...SHUFFLE_KS.map(k => `S${k}`)];
export const tableOf = (arm: string) => arm === 'GATES' ? null : makeTable(arm === 'ACTUAL' ? 0 : Number(arm.slice(1)), GAIN);
export { transmission };

/** T_excess: as T, minus the chance of a hit, 1 / (number of open targets), summed over eligible steps. */
export function transmissionExcess(probe: DeeProbeRow[]) {
  let eligible = 0, hits = 0, chance = 0;
  for (const r of probe) {
    if (!isStudyOffer(r.offerId) || !r.attention) continue;
    const mx = Math.max(...r.attention); const top = new Set(r.open.filter((_, i) => r.attention![i] === mx));
    if (top.size !== 1) continue;
    eligible++; chance += 1 / r.open.length; if (r.hop === [...top][0]) hits++;
  }
  return { eligible, hits, chance, Texcess: eligible ? (hits - chance) / eligible : null };
}

/** Average ranks (ties share the mean rank). */
export function ranks(a: number[]) {
  const idx = a.map((x, i) => [x, i] as const).sort((p, q) => p[0] - q[0]); const r = Array(a.length).fill(0);
  for (let i = 0; i < idx.length;) { let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
    for (let k = i; k <= j; k++) r[idx[k][1]] = (i + j) / 2 + 1; i = j + 1; }
  return r;
}
const pearson = (x: number[], y: number[]) => { const n = x.length, mx = x.reduce((a, b) => a + b, 0) / n, my = y.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; }
  return sxy / Math.sqrt(sxx * syy); };
export const spearman = (x: number[], y: number[]) => pearson(ranks(x), ranks(y));

/** mulberry32: the registered seeded generator. */
export function rng(seed: number) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a;
  t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/** Two-sided permutation test of Spearman's rho: B random permutations of y (seed fixed), p = (1 + #|rho*| >= |rho|) / (B + 1). */
export function spearmanTest(x: number[], y: number[], B = 100000, seed = 1584) {
  const rho = spearman(x, y), rx = ranks(x), ry = ranks(y), r = rng(seed), p = [...ry]; let extreme = 0;
  for (let b = 0; b < B; b++) {
    for (let i = p.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
    if (Math.abs(pearson(rx, p)) >= Math.abs(rho) - 1e-12) extreme++;
  }
  return { rho, p: (1 + extreme) / (B + 1), permutations: B };
}

/** Least-squares line of y on x. */
const fit = (x: number[], y: number[]) => { const n = x.length, mx = x.reduce((a, b) => a + b, 0) / n, my = y.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0; for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; }
  const b = sxy / sxx; return { a: my - b * mx, b }; };

/**
 * ACTUAL against the trend: its residual from the shuffles' line of T on E, ranked among the shuffles' leave-one-out
 * residuals (each shuffle's residual from the line fitted to the other shuffles). One-sided, lower:
 * p = (1 + #shuffles with residual <= ACTUAL's) / (n + 1).
 */
export function belowTrend(E: number[], T: number[], eA: number, tA: number) {
  const f = fit(E, T), rA = tA - (f.a + f.b * eA);
  const loo = E.map((_, i) => { const e = E.filter((_, j) => j !== i), t = T.filter((_, j) => j !== i), g = fit(e, t); return T[i] - (g.a + g.b * E[i]); });
  const atMost = loo.filter(r => r <= rA).length;
  return { slope: f.b, intercept: f.a, residualActual: rA, shufflesAtOrBelow: atMost, p: (1 + atMost) / (E.length + 1) };
}

/** DEE-1L's hypothesis under the lane: p = (1 + #shuffles with T >= ACTUAL's) / (n + 1), one-sided, upper. */
export const rankUpper = (T: number[], tA: number) => { const atLeast = T.filter(t => t >= tA).length; return { shufflesAtLeast: atLeast, p: (1 + atLeast) / (T.length + 1) }; };

/** Holm over named p values at alpha. */
export function holm(tests: Array<{ name: string; p: number }>, alpha = 0.05) {
  const order = [...tests].sort((a, b) => a.p - b.p); let stop = false; const out = new Map<string, { survives: boolean; threshold: number }>();
  order.forEach((t, i) => { const threshold = alpha / (order.length - i); const ok = !stop && t.p <= threshold; if (!ok) stop = true; out.set(t.name, { survives: ok, threshold }); });
  return tests.map(t => ({ ...t, ...out.get(t.name)! }));
}
