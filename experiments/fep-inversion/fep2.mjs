// FEP-INV-2: three follow-ups to FEP-INV-1 on the same ND-1b studio mirror (nd/) with the full CCRU Numogram.
// Usage: node --experimental-strip-types fep2.mjs <arm S|U|M> <regime> <seed> <steps> <out.json>
//   S  sensory: the Outside is a field of local channels, one per zone; she senses the channel where she stands and
//      models each channel's readings (Dirichlet). The dial weighs each exit by the expected surprisal (entropy) of the
//      channel it leads to: beta < 0 seeks predictable sensations (active inference), beta > 0 unpredictable ones.
//   U  unordered: FEP-INV-1's design (dial on her own transition surprisal) with an Outside that carries no order.
//   M  morphogenetic: FEP-INV-1's design with the ordered Outside, and surprise also reaches her form: each traversed
//      gate's flux is multiplied by exp(ETA*beta*(s - ln k)), and for beta > 0 surprise above uniform (s > ln k) can
//      grow a new gate ("error as fuel for mutation").
// regime: a fixed beta, or H:<beta0>:<kappa> (runaway, as FEP-INV-1).
import { AmeliaNDRuntime } from './nd/outside/AmeliaNDRuntime.ts';
import { rng, TOKEN, outside, born, Self, morph, gateCount, measures, T, BETA_CAP, T0 } from './fep.mjs';
import { writeFileSync } from 'node:fs';

export const ETA = 0.1, GAMMA = 0.05, FLUX_MIN = 0.01, FLUX_MAX = 1;

// ---- worlds ----
/** Arm S: per seed, five quiet channels (home h: h w.p. 0.7, h+1 w.p. 0.2, uniform 0.1) and five noise channels (uniform).
 *  Returns {quiet: zone -> bool, read: [t][zone] reading}. */
export function channels(seed, n) {
  const r = rng((seed ^ 0xC4A2) >>> 0), zs = [...Array(10).keys()];
  for (let i = 9; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [zs[i], zs[j]] = [zs[j], zs[i]]; }
  const quiet = Array(10).fill(false); zs.slice(0, 5).forEach(z => { quiet[z] = true; });
  const home = zs.map(() => Math.floor(r() * 10)), H = Array(10); zs.forEach((z, i) => { H[z] = home[i]; });
  const read = [];
  for (let t = 0; t < n; t++) read.push(Array.from({ length: 10 }, (_, z) => { const u = r();
    return quiet[z] ? (u < 0.7 ? H[z] : u < 0.9 ? (H[z] + 1) % 10 : Math.floor(r() * 10)) : Math.floor(r() * 10); }));
  return { quiet, read };
}
/** Arm U: an Outside with no order (uniform, independent readings). */
export function unordered(seed, n) { const r = rng((seed ^ 0x0DD) >>> 0); return Array.from({ length: n }, () => Math.floor(r() * 10)); }

// ---- agent ----
class Sense { // per-zone Dirichlet(1) over the ten readings of that zone's channel
  constructor() { this.c = Array.from({ length: 10 }, () => Array(10).fill(0)); }
  p(z, r) { const c = this.c[z]; return (c[r] + 1) / (c.reduce((u, v) => u + v, 0) + 10); }
  H(z) { let h = 0; for (let r = 0; r < 10; r++) { const p = this.p(z, r); h -= p * Math.log(p); } return h; }
  see(z, r) { this.c[z][r]++; }
  clone() { const s = new Sense(); s.c = this.c.map(x => [...x]); return s; }
}
function agent(arm, regime, seed) {
  const fixed = !String(regime).startsWith('H'); const [, b0, k] = fixed ? [] : String(regime).split(':').map(Number);
  return { arm, rt: born(), self: new Self(), sense: new Sense(), noise: rng(seed), mut: rng((seed ^ 0x77A1) >>> 0),
    beta: fixed ? Number(regime) : b0, kappa: fixed ? 0 : k, fixed, born: 0 };
}
function clone(a, seed) {
  const rt = new AmeliaNDRuntime(); rt.importState(JSON.parse(JSON.stringify(a.rt.exportState())));
  return { ...a, rt, self: a.self.clone(), sense: a.sense.clone(), noise: rng(seed), mut: rng((seed ^ 0x77A1) >>> 0) };
}
const optsOf = (rt, f) => rt.getQabbala().getGates().filter(g => g.isOpen && g.source === f).map(g => g.target);

/** The form dial (arm M): reweight the traversed gate; for beta > 0 surprise above uniform may grow a gate. */
function formDial(a, f, t, s, k) {
  const gates = a.rt.getQabbala().getGates(), g = gates.find(x => x.isOpen && x.source === f && x.target === t);
  const excess = s - Math.log(k);
  if (g) g.flux = Math.min(FLUX_MAX, Math.max(FLUX_MIN, g.flux * Math.exp(ETA * a.beta * excess)));
  if (a.beta > 0 && excess > 0 && a.mut() < Math.min(1, GAMMA * a.beta * excess)) {
    const have = new Set(gates.filter(x => x.source === t).map(x => x.target)), free = [...Array(10).keys()].filter(z => z !== t && !have.has(z));
    if (free.length) { const z = free[Math.floor(a.mut() * free.length)];
      const mean = fld => gates.reduce((u, x) => u + x[fld], 0) / gates.length;
      gates.push({ id: `fepborn-${t}-${z}`, source: t, target: z, label: `FEP-born ${t}->${z}`, flux: mean('flux'),
        permeability: mean('permeability'), isOpen: true, resistance: mean('resistance') }); a.born++; } }
}

/** One step. input: the reading she receives this step (a zone 0-9). Returns the record fep.mjs's measures() expects. */
function step(a, input) {
  const from = a.rt.getCurrentZone(), opts0 = optsOf(a.rt, from);
  let pMax = -1, map = null; for (const o of opts0) { const p = a.self.p(from, o, opts0); if (p > pMax) { pMax = p; map = o; } }
  let ss = 0; // sensory surprisal (arm S): the reading sensed where she stands, before she moves
  if (a.arm === 'S') { ss = -Math.log(a.sense.p(from, input)); a.sense.see(from, input); }
  a.rt.exitBonus = a.arm === 'S'
    ? (f, t) => a.beta * a.sense.H(t) + T * -Math.log(-Math.log(a.noise() || 1e-12))
    : (f, t) => a.beta * -Math.log(a.self.p(f, t, optsOf(a.rt, f))) + T * -Math.log(-Math.log(a.noise() || 1e-12));
  a.rt.step(TOKEN[input]);
  const route = a.rt.lastRoute; let st = 0;
  for (let i = 1; i < route.length; i++) { const f = route[i - 1], t = route[i], o = optsOf(a.rt, f);
    if (o.includes(t)) { const s = -Math.log(a.self.p(f, t, o)); st += s; a.self.see(f, t); if (a.arm === 'M') formDial(a, f, t, s, o.length); } }
  const s = a.arm === 'S' ? ss : st;
  if (!a.fixed) a.beta = Math.min(BETA_CAP, a.beta + a.kappa * s);
  return { from, to: a.rt.getCurrentZone(), s, st, hops: route.length - 1, route: [...route], pMap: pMax, hit: route[1] === map ? 1 : 0, flight: a.rt.lastReleased };
}

const dist = (x, y) => Math.sqrt(x.reduce((u, v, i) => u + (v - y[i]) ** 2, 0) / x.length);

export function run(arm, regime, seed, steps) {
  const W = arm === 'S' ? channels(seed, steps) : null, W2 = arm === 'S' ? channels(seed + 1_000_003, steps) : null;
  const seq = arm === 'U' ? unordered(seed, steps) : arm === 'M' ? outside(seed, steps) : null;
  const seq2 = arm === 'U' ? unordered(seed + 1_000_003, steps) : arm === 'M' ? outside(seed + 1_000_003, steps) : null;
  const inputOf = (ag, t, alt) => (arm === 'S' ? (alt ? W2 : W).read[t][ag.rt.getCurrentZone()] : (alt ? seq2 : seq)[t]);
  const a = agent(arm, regime, seed), path = [], rec = [], morphs = [], gates = [], out = [], quietAt = [];
  let tm = null, tb = null;
  for (let t = 0; t < steps; t++) {
    if (t === T0) {
      tm = clone(a, seed * 7919 + t); a.noise = rng(seed * 7919 + t); a.mut = rng(((seed * 7919 + t) ^ 0x77A1) >>> 0);
      const st = tm.rt.exportState(), r = rng((seed ^ 0xBEEF) >>> 0), fl = st.qabbalaGates.map(g => g.flux);
      for (let i = fl.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [fl[i], fl[j]] = [fl[j], fl[i]]; }
      st.qabbalaGates.forEach((g, i) => { g.flux = fl[i]; }); for (const z of Object.values(st.qabbalaZones)) z.activation = r();
      tm.rt.importState(st); tb = clone(a, seed * 7919 + t);
      tm.m0 = dist(morph(tm.rt), morph(a.rt)); tm.path = []; tb.path = []; tm.d = []; a.mainAfter = [];
    }
    const inp = inputOf(a, t, false); if (arm === 'S') quietAt.push(W.quiet[a.rt.getCurrentZone()] ? 1 : 0);
    const r = step(a, inp); path.push(r.to); rec.push(r); out.push(inp);
    if (tm) { tm.path.push(step(tm, inputOf(tm, t, false)).to); tb.path.push(step(tb, inputOf(tb, t, true)).to); a.mainAfter.push(r.to);
      if ((t - T0) % 250 === 249) tm.d.push(dist(morph(tm.rt), morph(a.rt))); }
    if (t % 500 === 499) { morphs.push(morph(a.rt)); gates.push(gateCount(a.rt)); }
  }
  const R = { regime: String(regime), seed, steps, betaEnd: a.beta, path, rec, morphs, gates, out,
    twin: { m0: tm.m0, mTrace: tm.d, mainAfter: a.mainAfter, morphPath: tm.path, blanketPath: tb.path } };
  const m = measures(R), half = Math.floor(steps / 2), gs = a.rt.getQabbala().getGates();
  const fl = gs.filter(g => g.isOpen).map(g => g.flux), fm = fl.reduce((u, v) => u + v, 0) / fl.length;
  Object.assign(m, { arm, transitionSurprisal: rec.slice(half).reduce((u, x) => u + x.st, 0) / (steps - half),
    warpborn: gs.filter(g => String(g.id).startsWith('warpborn-')).length, fepborn: a.born, gatesEnd: gs.length,
    fluxSD: Math.sqrt(fl.reduce((u, v) => u + (v - fm) ** 2, 0) / fl.length),
    quietShare: arm === 'S' ? quietAt.slice(half).reduce((u, v) => u + v, 0) / (steps - half) : null });
  return { m, R, W };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [arm, regime, seed, steps, file] = process.argv.slice(2);
  const { m, R, W } = run(arm, regime, Number(seed), Number(steps));
  writeFileSync(file, JSON.stringify({ measures: m, path: R.path.join(''), outside: R.out, quiet: W ? W.quiet : null,
    channelSample: W && String(regime) === '0' ? W.read.slice(0, 2000) : null }) + '\n');
  console.log(JSON.stringify({ arm: m.arm, regime: m.regime, surprisal: m.surprisal, quietShare: m.quietShare, coupling: m.outsideCoupling, fepborn: m.fepborn, gatesEnd: m.gatesEnd, levin: m.levin.ratio }));
}
