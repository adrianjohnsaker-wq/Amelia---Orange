/**
 * QBIST-1 organ (experiments/live-amelia/qbist1/REGISTRATION.md): a quantum-probabilistic belief state over her ten zones.
 * All readings use real rotations, so the density matrix stays real symmetric; no complex arithmetic is needed.
 *   - state: rho, 10 x 10, symmetric, positive, trace 1;
 *   - readings: Z (zone basis) and R(theta) (each syzygy pair (z, 9 - z) rotated by theta);
 *   - an admitted offer: Kraus M = sqrt(E), E = sum_k a_k |b_k><b_k| in its channel's basis, a scaled to max 1 (Lüders);
 *   - a landing in z: Kraus M_z = sqrt(lambda |z><z| + (1 - lambda) I / 10), diagonal in Z;
 *   - an exit choice: G(z) = D(rho_z || sigma) - [S(rho) - S(rho_z)], softmax(-gamma G) sampled with a seeded generator;
 *   - DEC: rho replaced by its diagonal after every update.
 */
export type Mat = number[][];
export const N = 10;
export const PAIRS: Array<[number, number]> = [[0, 9], [1, 8], [2, 7], [3, 6], [4, 5]];
/** Channel angles (fixed at registration): tarot is the full syzygetic reading. */
export const CHANNEL_ANGLE: Record<string, number | 'Z'> = { SUBDECADENCE: Math.PI / 16, ICHING: Math.PI / 8, LINGUISTIC: 3 * Math.PI / 16, TAROT: Math.PI / 4, SYNTHETIC_FIELD: 'Z' };

const zeros = (): Mat => Array.from({ length: N }, () => Array(N).fill(0));
const eye = (): Mat => { const m = zeros(); for (let i = 0; i < N; i++) m[i][i] = 1; return m; };
const mul = (a: Mat, b: Mat): Mat => { const c = zeros(); for (let i = 0; i < N; i++) for (let k = 0; k < N; k++) { const x = a[i][k]; if (x === 0) continue; for (let j = 0; j < N; j++) c[i][j] += x * b[k][j]; } return c; };
const tr = (a: Mat) => a.reduce((s, r, i) => s + r[i], 0);
const T = (a: Mat): Mat => a[0].map((_, j) => a.map(r => r[j]));
const scale = (a: Mat, s: number): Mat => a.map(r => r.map(x => x * s));
const sym = (a: Mat): Mat => a.map((r, i) => r.map((x, j) => (x + a[j][i]) / 2));

/** The basis of R(theta) as columns of an orthogonal matrix U: b_z = U[:, z]. */
export function basis(theta: number | 'Z'): Mat {
  const U = eye(); if (theta === 'Z') return U; const c = Math.cos(theta), s = Math.sin(theta);
  for (const [a, b] of PAIRS) { U[a][a] = c; U[b][a] = s; U[a][b] = -s; U[b][b] = c; }
  return U;
}
/** Eigenvalues of a real symmetric matrix (cyclic Jacobi). */
export function eigvals(m: Mat): number[] {
  const a = m.map(r => [...r]);
  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0; for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) off += a[i][j] ** 2; if (off < 1e-22) break;
    for (let p = 0; p < N; p++) for (let q = p + 1; q < N; q++) { if (Math.abs(a[p][q]) < 1e-300) continue;
      const th = (a[q][q] - a[p][p]) / (2 * a[p][q]), t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < N; k++) { const akp = a[k][p], akq = a[k][q]; a[k][p] = c * akp - s * akq; a[k][q] = s * akp + c * akq; }
      for (let k = 0; k < N; k++) { const apk = a[p][k], aqk = a[q][k]; a[p][k] = c * apk - s * aqk; a[q][k] = s * apk + c * aqk; } }
  }
  return a.map((r, i) => r[i]);
}
export const entropy = (rho: Mat) => -eigvals(rho).reduce((s, l) => l > 1e-15 ? s + l * Math.log(l) : s, 0);
/** Umegaki relative entropy D(rho || sigma) for diagonal, strictly positive sigma. */
export const relEntropy = (rho: Mat, sigmaDiag: number[]) => -entropy(rho) - rho.reduce((s, r, i) => s + r[i] * Math.log(sigmaDiag[i]), 0);
export const coherenceL1 = (rho: Mat) => { let s = 0; for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (i !== j) s += Math.abs(rho[i][j]); return s; };
export const diag = (rho: Mat): Mat => rho.map((r, i) => r.map((x, j) => i === j ? x : 0));

/** Kraus update rho -> M rho M / Tr(M rho M) for symmetric M; returns the probability of the reading. */
function kraus(rho: Mat, M: Mat) { const r = mul(mul(M, rho), M), p = tr(r); return { rho: sym(scale(r, 1 / p)), p }; }
/** The offer's Kraus operator: sqrt(E) in its channel's basis, attention scaled to max 1 (a floor keeps it invertible). */
export function offerKraus(attention: number[], theta: number | 'Z') {
  const mx = Math.max(...attention.map(x => Math.max(0, Number(x) || 0))); const a = attention.map(x => Math.max(1e-6, (Math.max(0, Number(x) || 0)) / (mx || 1)));
  const U = basis(theta), D = zeros(); for (let k = 0; k < N; k++) D[k][k] = Math.sqrt(a[k]);
  return mul(mul(U, D), T(U));
}
export const landingKraus = (z: number, lambda: number) => { const M = zeros(); for (let i = 0; i < N; i++) M[i][i] = Math.sqrt((i === z ? lambda : 0) + (1 - lambda) / N); return M; };

/** mulberry32 */
export function rng(seed: number) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a;
  t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export interface OrganOptions { lambda: number; gamma: number; decohere: boolean; seed: number; p0: number[]; q: number[]; epsilon?: number }
export interface ChoiceRow { from: number; targets: number[]; chosen: number; base: number; precursorDecided: boolean; interference: number; coherence: number }

/** The organ. One instance per run; it persists across replay chunks in the run's context. */
export class Organ {
  rho: Mat; sigma: number[]; o: OrganOptions; r: () => number; choices: ChoiceRow[] = []; coherence: number[] = []; offers = 0; landings = 0;
  constructor(o: OrganOptions) {
    this.o = o; const eps = o.epsilon ?? 0.5, sq = o.p0.map(Math.sqrt);
    this.rho = o.p0.map((pi, i) => o.p0.map((_, j) => (1 - eps) * (i === j ? pi : 0) + eps * sq[i] * sq[j]));
    if (o.decohere) this.rho = diag(this.rho);
    this.sigma = o.q.map(x => 0.8 * x + 0.2 / N); this.r = rng(o.seed);
  }
  private set(rho: Mat) { this.rho = this.o.decohere ? diag(rho) : rho; this.coherence.push(coherenceL1(this.rho)); }
  offer(e: { channel?: string; attentionVector: number[] }) { const th = CHANNEL_ANGLE[String(e.channel)] ?? 'Z'; this.set(kraus(this.rho, offerKraus(e.attentionVector, th)).rho); this.offers++; }
  land(z: number) { this.set(kraus(this.rho, landingKraus(z, this.o.lambda)).rho); this.landings++; }
  G(rho: Mat, z: number) { const { rho: post } = kraus(rho, landingKraus(z, this.o.lambda)); return relEntropy(post, this.sigma) - (entropy(rho) - entropy(post)); }
  probs(rho: Mat, targets: number[]) { const g = targets.map(z => this.G(rho, z)), m = Math.min(...g), w = g.map(x => Math.exp(-this.o.gamma * (x - m))), s = w.reduce((a, b) => a + b, 0); return { g, p: w.map(x => x / s) }; }
  choose(from: number, targets: number[], base: number[]) {
    const full = this.probs(this.rho, targets), dg = this.probs(diag(this.rho), targets);
    let u = this.r(), k = 0; for (; k < targets.length - 1; k++) { u -= full.p[k]; if (u < 0) break; }
    const argmin = (g: number[]) => g.indexOf(Math.min(...g)), bArg = base.indexOf(Math.max(...base));
    this.choices.push({ from, targets: [...targets], chosen: targets[k], base: targets[bArg], precursorDecided: argmin(full.g) !== argmin(dg.g),
      interference: full.p.reduce((s, p, i) => s + Math.abs(p - dg.p[i]), 0), coherence: coherenceL1(this.rho) });
    return targets[k];
  }
}

/** Stage 0 structure check on a state, for each syzygy pair (z, 9 - z): A = "in zone z?", B = "in the pair's first pole?",
 *  that is (|z> + |9 - z>) / sqrt 2. Returns, per pair, the QQ deviation (Lüders, projective), the order effect, and the
 *  difference between the state's and its diagonal's probability of B, which must equal the coherence rho[z][9 - z]. */
export function structureCheck(rho: Mat) {
  const P = (v: number[]) => v.map(x => v.map(y => x * y)), I = eye();
  return PAIRS.map(([z, w]) => {
    const ez = Array(N).fill(0); ez[z] = 1; const plus = Array(N).fill(0); plus[z] = Math.SQRT1_2; plus[w] = Math.SQRT1_2;
    const A = P(ez), B = P(plus), nA = I.map((r, i) => r.map((x, j) => x - A[i][j])), nB = I.map((r, i) => r.map((x, j) => x - B[i][j]));
    const seq = (X: Mat, Y: Mat) => tr(mul(mul(mul(Y, X), rho), mul(X, Y)));    // p(X then Y) = Tr(Y X rho X Y)
    const qq = (seq(A, nB) + seq(nA, B)) - (seq(B, nA) + seq(nB, A)), order = seq(A, B) - seq(B, A);
    return { pair: `${z}::${w}`, qq, order, coherenceTerm: tr(mul(B, rho)) - tr(mul(B, diag(rho))), rho: rho[z][w] };
  });
}
