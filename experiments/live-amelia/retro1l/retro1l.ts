/**
 * RETRO-1L machinery (experiments/live-amelia/retro1l/REGISTRATION.md). Pure functions: window measures from her tick
 * log and her Outside stream, base-rate-free target ranks, the exact null by convolution, the target draw from drand,
 * and the calibration simulations. Observation only: nothing here runs or changes her.
 */
import { createHash } from 'node:crypto';

export const WINDOWS = 48, HOURS = 3, FIRST = Date.parse('2026-11-19T00:00:00Z');
export const QUICKNET = '52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971', GENESIS = 1692803367, PERIOD = 3;
export const windowOf = (w: number) => ({ from: new Date(FIRST + (w - 1) * HOURS * 3600e3), to: new Date(FIRST + w * HOURS * 3600e3) });
/** The first quicknet round at or after the window's end plus 10 minutes. */
export const roundOf = (w: number) => Math.ceil((windowOf(w).to.getTime() / 1000 + 600 - GENESIS) / PERIOD) + 1;
/** T_w = SHA-256(randomness hex || "RETRO-1L:" || w) mod 10. */
export function targetOf(randomnessHex: string, w: number) {
  const h = createHash('sha256').update(Buffer.concat([Buffer.from(randomnessHex, 'hex'), Buffer.from(`RETRO-1L:${w}`)])).digest('hex');
  return Number(BigInt('0x' + h) % 10n);
}

export interface WindowData { path: string; attention: number[] }   // path: her end zones, in order; attention: summed over offers, zones 0-9
/** Occupancy shares, arrival shares (steps entering z from another zone) and the stream's attention shares. */
export function measuresOf(d: WindowData) {
  const z = [...d.path].map(Number), occ = Array(10).fill(0), arr = Array(10).fill(0);
  z.forEach((x, i) => { occ[x]++; if (i > 0 && z[i - 1] !== x) arr[x]++; });
  const n = Math.max(1, z.length), na = Math.max(1, arr.reduce((a, b) => a + b, 0)), ta = d.attention.reduce((a, b) => a + b, 0);
  return { steps: z.length, occupancy: occ.map(x => x / n), arrivals: arr.map(x => x / na), attention: d.attention.map(x => ta > 0 ? x / ta : 0.1) };
}

/** Deviation of each zone's share from its own mean over the windows; then doubled mid-ranks (2 = most above its mean). */
export function doubledRanks(shares: number[][]) {
  const mean = Array.from({ length: 10 }, (_, z) => shares.reduce((a, s) => a + s[z], 0) / shares.length);
  return shares.map(s => { const d = s.map((x, z) => x - mean[z]);
    return d.map(v => { const above = d.filter(u => u > v + 1e-15).length, ties = d.filter(u => Math.abs(u - v) <= 1e-15).length; return 2 * above + ties + 1; }); });
}

/** Exact P(R' <= R) where R' is the sum over windows of the doubled rank of a uniformly drawn zone. */
export function exactLowerP(ranks: number[][], R: number) {
  let dist = new Map<number, number>([[0, 1]]);
  for (const r of ranks) { const next = new Map<number, number>();
    for (const [s, p] of dist) for (const v of r) next.set(s + v, (next.get(s + v) ?? 0) + p / 10); dist = next; }
  let p = 0; for (const [s, q] of dist) if (s <= R + 1e-9) p += q; return p;
}
export function rankTest(ranks: number[][], targets: number[]) {
  const R = targets.reduce((a, t, w) => a + ranks[w][t], 0);
  return { R, meanRank: R / 2 / targets.length, chanceMeanRank: 5.5, p: exactLowerP(ranks, R) };
}

/** Holm over named p values. */
export function holm(tests: Array<{ name: string; p: number }>, alpha = 0.05) {
  const order = [...tests].sort((a, b) => a.p - b.p); let stop = false; const out = new Map<string, { survives: boolean; threshold: number }>();
  order.forEach((t, i) => { const threshold = alpha / (order.length - i); const ok = !stop && t.p <= threshold; if (!ok) stop = true; out.set(t.name, { survives: ok, threshold }); });
  return tests.map(t => ({ ...t, ...out.get(t.name)! }));
}

/** mulberry32 */
export function rng(seed: number) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a;
  t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/** Calibration: type I error with random targets, and power with a planted lean (in a share q of windows the target is the
 *  zone most above its own mean). Uses a precomputed table of p by R for speed. */
export function calibrate(ranks: number[][], sims = 10000, seed = 1584500) {
  const r = rng(seed), maxR = ranks.length * 20, pOf = new Map<number, number>();
  const p = (R: number) => { if (!pOf.has(R)) pOf.set(R, exactLowerP(ranks, R)); return pOf.get(R)!; };
  let rej = 0; for (let i = 0; i < sims; i++) { let R = 0; for (const w of ranks) R += w[Math.floor(r() * 10)]; if (p(R) <= 0.05) rej++; }
  const power: Array<{ share: number; power: number }> = [];
  for (const q of [0.1, 0.2, 0.3, 0.4, 0.5, 0.6]) { let k = 0;
    for (let i = 0; i < 2000; i++) { let R = 0; for (const w of ranks) R += r() < q ? Math.min(...w) : w[Math.floor(r() * 10)]; if (p(R) <= 0.05) k++; }
    power.push({ share: q, power: k / 2000 }); }
  void maxR; return { typeI: rej / sims, power };
}
