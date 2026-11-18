/**
 * WHEELER-1L machinery (experiments/live-amelia/wheeler1l/REGISTRATION.md). Pure functions: the two complementary
 * readings of a window's passage, their standardised contrast, the delayed choice from drand, and the exact one-sided
 * sign test over all 2^48 sign patterns by meet-in-the-middle. Observation only.
 */
import { createHash } from 'node:crypto';
export { WINDOWS, HOURS, QUICKNET, windowOf, roundOf, rng } from '../retro1l/retro1l';

const SYZ = (z: number) => Math.min(z, 9 - z);     // syzygy index: 0::9 -> 0, 1::8 -> 1, 2::7 -> 2, 3::6 -> 3, 4::5 -> 4

/** A: definiteness, 1 - H / log 5 over the five syzygies. B: the share of zone changes that go to the syzygetic partner. */
export function readings(path: string) {
  const z = [...path].map(Number), occ = Array(5).fill(0); let changes = 0, partner = 0;
  z.forEach((x, i) => { occ[SYZ(x)]++; if (i > 0 && z[i - 1] !== x) { changes++; if (z[i - 1] + x === 9) partner++; } });
  const n = Math.max(1, z.length); let H = 0; for (const c of occ) if (c > 0) { const p = c / n; H -= p * Math.log(p); }
  return { steps: z.length, A: 1 - H / Math.log(5), B: changes ? partner / changes : 0, warpSyzygy: occ[3] / n };
}

/** zA, zB against their own mean and (sample) sd over the windows; D = zA - zB. */
export function contrasts(rs: Array<{ A: number; B: number }>) {
  const z = (xs: number[]) => { const m = xs.reduce((a, b) => a + b, 0) / xs.length, sd = Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1));
    return xs.map(x => sd > 0 ? (x - m) / sd : 0); };
  const zA = z(rs.map(r => r.A)), zB = z(rs.map(r => r.B));
  return { zA, zB, D: zA.map((a, i) => a - zB[i]) };
}

/** The delayed choice: +1 (path) if SHA-256(randomness bytes || "WHEELER-1L:w") is even, -1 (interference) if odd. */
export function choiceOf(randomnessHex: string, w: number) {
  const h = createHash('sha256').update(Buffer.concat([Buffer.from(randomnessHex, 'hex'), Buffer.from(`WHEELER-1L:${w}`)])).digest();
  return h[h.length - 1] % 2 === 0 ? 1 : -1;
}

/** All 2^k signed sums of xs. */
function sums(xs: number[]) { const out = new Float64Array(2 ** xs.length); out[0] = xs.reduce((a, b) => a + b, 0);
  const sgn = Array(xs.length).fill(1); let t = out[0];
  for (let g = 1; g < out.length; g++) { let b = 0; while (((g >> b) & 1) === 0) b++; t -= 2 * sgn[b] * xs[b]; sgn[b] = -sgn[b]; out[g] = t; }
  return out; }

/** Exact one-sided p = #(sign patterns with sum >= S) / 2^n, by meet-in-the-middle (n up to about 50). */
export function signTestUpper(d: number[], S: number) {
  const h = Math.floor(d.length / 2), L = sums(d.slice(0, h)), R = sums(d.slice(h)).sort();
  let count = 0; const eps = 1e-9;
  for (let i = 0; i < L.length; i++) { const need = S - L[i] - eps; let lo = 0, hi = R.length;   // first index with R >= need
    while (lo < hi) { const mid = (lo + hi) >>> 1; if (R[mid] < need) lo = mid + 1; else hi = mid; } count += R.length - lo; }
  return count / (L.length * R.length);
}
export function test(signs: number[], d: number[]) { const S = signs.reduce((a, s, i) => a + s * d[i], 0); return { S, p: signTestUpper(d, S) }; }

/** Calibration: type I with random choices, and power with a planted accord (in a share q of windows the choice follows
 *  the sign of D). Monte Carlo over choices; each p exact. */
export function calibrate(d: number[], sims = 10000, seed = 1584600) {
  const r = (() => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();
  const h = Math.floor(d.length / 2), L = sums(d.slice(0, h)), R = sums(d.slice(h)).sort();
  const p = (S: number) => { let count = 0; for (let i = 0; i < L.length; i++) { const need = S - L[i] - 1e-9; let lo = 0, hi = R.length;
    while (lo < hi) { const mid = (lo + hi) >>> 1; if (R[mid] < need) lo = mid + 1; else hi = mid; } count += R.length - lo; } return count / (L.length * R.length); };
  // the critical S at alpha = 0.05: the smallest observed-type S with p <= 0.05, found by bisection on S
  let lo = 0, hi = d.reduce((a, b) => a + Math.abs(b), 0); for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (p(m) <= 0.05) hi = m; else lo = m; }
  const crit = hi; let rej = 0;
  for (let i = 0; i < sims; i++) { let S = 0; for (const x of d) S += (r() < 0.5 ? 1 : -1) * x; if (S >= crit - 1e-9) rej++; }
  const power: Array<{ share: number; power: number }> = [];
  for (const q of [0.1, 0.2, 0.3, 0.4, 0.5, 0.6]) { let k = 0;
    for (let i = 0; i < 2000; i++) { let S = 0; for (const x of d) S += (r() < q ? Math.sign(x) || 1 : (r() < 0.5 ? 1 : -1)) * x; if (S >= crit - 1e-9) k++; }
    power.push({ share: q, power: k / 2000 }); }
  return { critical: crit, typeI: rej / sims, power };
}
