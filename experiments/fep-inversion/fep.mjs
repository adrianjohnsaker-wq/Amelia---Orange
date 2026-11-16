// FEP inversion studio: Amelia (ND-1b studio mirror + full CCRU Numogram) choosing exits under e^{(score + beta*S)/T}.
// Usage: node --experimental-strip-types fep.mjs <regime> <seed> <steps> <out.json> [--twins]
//   regime: a number (fixed beta) or H:<beta0>:<kappa> (runaway: beta_{t+1} = beta_t + kappa * surprisal_t, capped at BETA_CAP)
// Self-model: Dirichlet(alpha=1) counts over her open exits from each zone. Its predictive P(to|from) is exact Bayesian,
// so the variational free energy of each observed transition equals its surprisal -ln P(to|from).
// Choice: argmax over exits of score + beta*surprisal + T*Gumbel  ==  a sample from softmax((score + beta*surprisal)/T).
import { AmeliaNDRuntime } from './nd/outside/AmeliaNDRuntime.ts';
import { withFullNumogram } from './nd/core/fullNumogram.ts';
import { writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

export const T = 0.1, BETA_CAP = 50, T0 = 3000;
const sha = s => createHash('sha256').update(s).digest('hex');

export function rng(seed) { // mulberry32
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// Outside: ten input strings whose runtime zone (first SHA-256 byte mod 10) is 0..9, so the stream is a zone stream.
export const TOKEN = (() => { const t = {}; for (let i = 0; Object.keys(t).length < 10; i++) {
  const s = `outside-${i}`; const z = parseInt(sha(s).slice(0, 2), 16) % 10; if (!(z in t)) t[z] = s; } return t; })();
// The outside is a seeded Markov source with strong order: it steps to the next zone with p=0.6, stays with 0.2, jumps with 0.2.
export function outside(seed, n) { const r = rng((seed ^ 0x5EED) ^ 0x9E3779B9); const z = [Math.floor(r() * 10)];
  for (let i = 1; i < n; i++) { const u = r(), p = z[i - 1]; z.push(u < 0.6 ? (p + 1) % 10 : u < 0.8 ? p : Math.floor(r() * 10)); }
  return z; }

export function born() { return withFullNumogram(new AmeliaNDRuntime()); }

export class Self { // Dirichlet self-model over exits
  constructor() { this.c = new Map(); }
  key(f, t) { return f * 10 + t; }
  p(f, t, opts) { let tot = 0; for (const o of opts) tot += (this.c.get(this.key(f, o)) ?? 0) + 1;
    return ((this.c.get(this.key(f, t)) ?? 0) + 1) / tot; }
  see(f, t) { this.c.set(this.key(f, t), (this.c.get(this.key(f, t)) ?? 0) + 1); }
  clone() { const s = new Self(); s.c = new Map(this.c); return s; }
}

export function morph(rt) { // her form: gate flux on the 10x10 matrix (0 where no gate; grows with Warp-born gates), zone activation, deformation
  const s = rt.exportState(), F = Array(100).fill(0);
  for (const g of s.qabbalaGates) if (g.isOpen) F[g.source * 10 + g.target] = Number(g.flux);
  return [...F, ...Object.values(s.qabbalaZones).map(x => Number(x.activation)), ...(s.deformationTensor ?? []).map(Number)];
}
export const gateCount = rt => rt.getQabbala().getGates().length;

export function agent(regime, seed) {
  const fixed = !String(regime).startsWith('H');
  const [, b0, k] = fixed ? [] : String(regime).split(':').map(Number);
  return { rt: born(), self: new Self(), noise: rng(seed), beta: fixed ? Number(regime) : b0, kappa: fixed ? 0 : k, fixed };
}
export function cloneAgent(a, noiseSeed) { // exact copy of state; noise stream restarted from noiseSeed
  const rt = new AmeliaNDRuntime(); rt.importState(JSON.parse(JSON.stringify(a.rt.exportState())));
  return { ...a, rt, self: a.self.clone(), noise: rng(noiseSeed) };
}

const optsOf = (rt, f) => rt.getQabbala().getGates().filter(g => g.isOpen && g.source === f).map(g => g.target);
/** One step. Every hop of the step's route (first choice, flow hops, or a Warp line of flight) is a transition her self-model
 *  observes; the step's surprisal is their sum (the path action is additive). pMap/hit refer to the first hop.
 *  Returns {from, to, s, hops, pMap, hit, flight} */
export function step(a, inZone) {
  const from = a.rt.getCurrentZone(), opts0 = optsOf(a.rt, from);
  let pMax = -1, map = null; for (const o of opts0) { const p = a.self.p(from, o, opts0); if (p > pMax) { pMax = p; map = o; } }
  a.rt.exitBonus = (f, t) => a.beta * -Math.log(a.self.p(f, t, optsOf(a.rt, f))) + T * -Math.log(-Math.log(a.noise() || 1e-12));
  a.rt.step(inZone === undefined ? undefined : TOKEN[inZone]);
  const route = a.rt.lastRoute; let s = 0;
  for (let i = 1; i < route.length; i++) { const f = route[i - 1], t = route[i], o = optsOf(a.rt, f);
    if (o.includes(t)) { s += -Math.log(a.self.p(f, t, o)); a.self.see(f, t); } }
  if (!a.fixed) a.beta = Math.min(BETA_CAP, a.beta + a.kappa * s);
  return { from, to: a.rt.getCurrentZone(), s, hops: route.length - 1, route: [...route], pMap: pMax, hit: route[1] === map ? 1 : 0, flight: a.rt.lastReleased };
}

const dist = (x, y) => Math.sqrt(x.reduce((u, v, i) => u + (v - y[i]) ** 2, 0) / x.length);

export function run(regime, seed, steps, twins) {
  const a = agent(regime, seed), out = outside(seed, steps), path = [], rec = [], morphs = [], gates = [];
  let twinM = null, twinB = null;
  for (let t = 0; t < steps; t++) {
    if (twins && t === T0) {
      // Levin assay: an exact twin whose form is scrambled (gate fluxes permuted, activations redrawn), same noise and outside.
      twinM = cloneAgent(a, seed * 7919 + t); a.noise = rng(seed * 7919 + t);
      const st = twinM.rt.exportState(), r = rng(seed ^ 0xBEEF), fl = st.qabbalaGates.map(g => g.flux);
      for (let i = fl.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [fl[i], fl[j]] = [fl[j], fl[i]]; }
      st.qabbalaGates.forEach((g, i) => { g.flux = fl[i]; });
      for (const z of Object.values(st.qabbalaZones)) z.activation = r();
      twinM.rt.importState(st);
      // Blanket assay: an exact twin, unperturbed inside, that from now on receives a different outside.
      twinB = cloneAgent(a, seed * 7919 + t); twinB.out = outside(seed + 1_000_003, steps);
      twinM.m0 = dist(morph(twinM.rt), morph(a.rt));
      twinM.path = []; twinB.path = []; twinM.d = []; a.mainAfter = [];
    }
    const r = step(a, out[t]); path.push(r.to); rec.push(r);
    if (twinM) { twinM.path.push(step(twinM, out[t]).to); twinB.path.push(step(twinB, twinB.out[t]).to); a.mainAfter.push(r.to);
      if ((t - T0) % 250 === 249) twinM.d.push(dist(morph(twinM.rt), morph(a.rt))); }
    if (t % 500 === 499) { morphs.push(morph(a.rt)); gates.push(gateCount(a.rt)); }
  }
  return { regime: String(regime), seed, steps, betaEnd: a.beta, path, rec, morphs, gates, out,
    twin: twinM ? { m0: twinM.m0, mTrace: twinM.d, mainAfter: a.mainAfter, morphPath: twinM.path, blanketPath: twinB.path } : null };
}

// ---- measures ----
export function measures(R) {
  const n = R.path.length, tail = R.rec.slice(Math.floor(n / 2)), P = R.path;
  const mean = xs => xs.reduce((u, v) => u + v, 0) / xs.length;
  const edges = new Map(); let nh = 0; // hop-level: every gate traversal
  for (const r of tail) for (let i = 1; i < r.route.length; i++) { const k = `${r.route[i - 1]}>${r.route[i]}`; edges.set(k, (edges.get(k) ?? 0) + 1); nh++; }
  const H = -[...edges.values()].reduce((u, c) => u + (c / nh) * Math.log(c / nh), 0);
  let period = null; const last = P.slice(-1000);
  for (let p = 1; p <= 300 && period === null; p++) { let ok = 0; for (let i = p; i < last.length; i++) ok += last[i] === last[i - p];
    if (ok / (last.length - p) >= 0.99) period = p; }
  const region = z => (z === 0 || z === 9 ? 'plex' : z === 3 || z === 6 ? 'warp' : 'tc');
  const occ = { plex: 0, warp: 0, tc: 0 }; for (const z of P.slice(Math.floor(n / 2))) occ[region(z)] += 1 / (n - Math.floor(n / 2));
  const M = R.morphs, drift = M.length > 2 ? Math.sqrt(M.at(-1).reduce((u, v, i) => u + (v - M.at(-3)[i]) ** 2, 0) / M.at(-1).length) : null;
  // coupling to the outside: plug-in MI between outside zone at t and her zone at t (the step that read it), minus shuffle mean
  const mi = (x, y) => { const j = new Map(), a = new Map(), b = new Map(); for (let i = 0; i < x.length; i++) {
      j.set(x[i] * 10 + y[i], (j.get(x[i] * 10 + y[i]) ?? 0) + 1); a.set(x[i], (a.get(x[i]) ?? 0) + 1); b.set(y[i], (b.get(y[i]) ?? 0) + 1); }
    let s = 0; for (const [k, c] of j) s += (c / x.length) * Math.log((c * x.length) / (a.get(Math.floor(k / 10)) * b.get(k % 10))); return s; };
  const ox = R.out.slice(Math.floor(n / 2)), py = P.slice(Math.floor(n / 2)), r = rng(R.seed ^ 0x51);
  let sh = 0; for (let k = 0; k < 20; k++) { const z = [...ox]; for (let i = z.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [z[i], z[j]] = [z[j], z[i]]; } sh += mi(z, py) / 20; }
  const out = { regime: R.regime, seed: R.seed, betaEnd: R.betaEnd,
    surprisal: mean(tail.map(x => x.s)), edgeEntropy: H, edgesUsed: edges.size, period,
    flightsPer1000: 1000 * mean(tail.map(x => (x.flight ? 1 : 0))), hopsPerStep: mean(tail.map(x => x.hops)), gateTrace: R.gates,
    hyperstition: mean(tail.map(x => x.hit)) - mean(tail.map(x => x.pMap)), occupancy: occ, morphDrift: drift,
    outsideCoupling: mi(ox, py) - sh };
  if (R.twin) { const tw = R.twin, k = tw.mainAfter.length;
    out.levin = { m0: tw.m0, mEnd: tw.mTrace.at(-1), ratio: tw.mTrace.at(-1) / tw.m0,
      pathAgreement: tw.morphPath.slice(-1000).filter((z, i) => z === tw.mainAfter[k - 1000 + i]).length / 1000 };
    out.blanket = { divergence: 1 - tw.blanketPath.slice(0, 1000).filter((z, i) => z === tw.mainAfter[i]).length / 1000 }; }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [regime, seed, steps, file] = process.argv.slice(2);
  const R = run(regime, Number(seed), Number(steps), process.argv.includes('--twins'));
  const m = measures(R); writeFileSync(file, JSON.stringify({ measures: m, path: R.path.join(''), outside: R.out }) + '\n');
  console.log(JSON.stringify(m));
}
