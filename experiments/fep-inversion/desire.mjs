// DESIRE-1: desire as connective synthesis in Amelia (ND-1b studio mirror, full CCRU Numogram, ordered Outside).
// Usage: node --experimental-strip-types desire.mjs <regime> <seed> <steps> <out.json>
//   regime: D (full), D-rb (no rollback), D-strat (no restratification: no pruning, no consolidation), D-learn (fixed rule
//           bank weights and fixed growth propensity), B (her own dynamics: no growth).
// Connective synthesis: at each step she may form a new connection (gate) from where she stands. Her rule bank:
//   hebb   toward the zone whose field activation co-varies most with hers (her own field decides);
//   named  toward the zone the Outside names this step;
//   novel  toward the zone she has visited least;
//   random toward any zone she cannot yet reach.
// She learns the rule weights (multiplicative weights) and her growth propensity from the fate of her connections:
// a connection that holds raises the weight of its rule and the propensity; a failed line lowers them.
// Restratification: a new connection is on trial for TRIAL steps. Used at least USES times, it is integrated (an
// amalgamation) and consolidates with use; otherwise it is pruned (a failed line). Her 29 Numogram gates and the runtime's
// own Warp-born gates are never pruned.
// The empty BwO is rolled back: if she freezes (one zone for FREEZE steps), homogenises (flux SD < SD_MIN) or saturates
// (>= SAT gates), she returns to her checkpoint from at least 500 steps earlier and continues with a new noise stream.
import { AmeliaNDRuntime } from './nd/outside/AmeliaNDRuntime.ts';
import { rng, TOKEN, outside, born, morph, gateCount, T, T0 } from './fep.mjs';
import { writeFileSync } from 'node:fs';

export const P = { TRIAL: 300, USES: 5, CONSOLIDATE: 0.02, FLUX_MAX: 1, GAMMA0: 0.01, GAMMA_MIN: 0.0005, GAMMA_MAX: 0.2,
  LR: 0.3, GLR: 0.15, RHO: 0.02, TRY_BONUS: 0.5, FREEZE: 200, SD_MIN: 0.02, SAT: 90, CKPT: 250, MAX_ROLLBACKS: 100 };
const RULES = ['hebb', 'named', 'novel', 'random'];

function newAgent(regime, seed) {
  return { regime, rt: born(), noise: rng(seed), mut: rng((seed ^ 0xD351) >>> 0), born: new Map(), // id -> {birth, uses, rule, src, tgt}
    w: Object.fromEntries(RULES.map(r => [r, 1])), gamma: P.GAMMA0, visits: Array(10).fill(0),
    m: Array(10).fill(0.5), c: Array.from({ length: 10 }, () => Array(10).fill(0)), stay: 0, nid: 0,
    log: { births: [], integrated: [], pruned: [], rollbacks: [] }, ckpts: [] };
}
const snapshot = a => JSON.stringify({ st: a.rt.exportState(), born: [...a.born], w: a.w, gamma: a.gamma, visits: a.visits, m: a.m, c: a.c, stay: a.stay, nid: a.nid });
function restore(a, s, noiseSeed) {
  const o = JSON.parse(s); const rt = new AmeliaNDRuntime(); rt.importState(o.st);
  Object.assign(a, { rt, born: new Map(o.born), w: o.w, gamma: o.gamma, visits: o.visits, m: o.m, c: o.c, stay: o.stay, nid: o.nid, noise: rng(noiseSeed) });
}
function cloneAgent(a, seed) { const b = { ...a, log: { births: [], integrated: [], pruned: [], rollbacks: [] }, ckpts: [] };
  restore(b, snapshot(a), seed); b.mut = rng((seed ^ 0xD351) >>> 0); return b; }

const gatesOf = a => a.rt.getQabbala().getGates();
const reach = (a, f) => new Set(gatesOf(a).filter(g => g.isOpen && g.source === f).map(g => g.target));

function chooseTarget(a, rule, cur, named) {
  const have = reach(a, cur), free = [...Array(10).keys()].filter(z => z !== cur && !have.has(z));
  if (!free.length) return null;
  if (rule === 'hebb') return free.reduce((b, z) => (a.c[cur][z] > a.c[cur][b] ? z : b), free[0]);
  if (rule === 'named') return free.includes(named) ? named : null;
  if (rule === 'novel') return free.reduce((b, z) => (a.visits[z] < a.visits[b] ? z : b), free[0]);
  return free[Math.floor(a.mut() * free.length)];
}

/** Connective synthesis + restratification after a step at time t. */
function synthesis(a, t, named, route) {
  const learn = a.regime !== 'D-learn', strat = a.regime !== 'D-strat', gates = gatesOf(a);
  // use: every traversal of a born gate counts; integrated gates consolidate with use
  for (let i = 1; i < route.length; i++) for (const [id, b] of a.born) if (b.src === route[i - 1] && b.tgt === route[i]) {
    b.uses++; if (strat && b.integrated) { const g = gates.find(x => x.id === id); if (g) g.flux = Math.min(P.FLUX_MAX, g.flux + P.CONSOLIDATE); } }
  // fate of connections on trial
  for (const [id, b] of a.born) {
    if (b.integrated !== false || t - b.birth < P.TRIAL) continue;
    const held = b.uses >= P.USES;
    if (held) { b.integrated = true; a.log.integrated.push({ t, id, rule: b.rule }); }
    else if (strat) { const k = gates.findIndex(x => x.id === id); if (k >= 0) gates.splice(k, 1); a.born.delete(id); a.log.pruned.push({ t, id, rule: b.rule }); }
    else { b.integrated = null; } // without restratification a failed line simply stays
    if (learn && b.integrated !== null) { a.w[b.rule] *= Math.exp(P.LR * (held ? 1 : -1));
      a.gamma = Math.min(P.GAMMA_MAX, Math.max(P.GAMMA_MIN, a.gamma * Math.exp(P.GLR * (held ? 1 : -1)))); }
  }
  // a new connection
  const cur = a.rt.getCurrentZone();
  if (a.mut() < a.gamma) {
    const tot = RULES.reduce((u, r) => u + a.w[r], 0); let u = a.mut() * tot, rule = RULES[RULES.length - 1];
    for (const r of RULES) { if ((u -= a.w[r]) <= 0) { rule = r; break; } }
    const z = chooseTarget(a, rule, cur, named);
    if (z !== null) { const mean = f => gates.reduce((s, g) => s + g[f], 0) / gates.length, id = `desire-${a.nid++}-${cur}-${z}`;
      gates.push({ id, source: cur, target: z, label: `Desire ${cur}->${z} (${rule})`, flux: mean('flux'), permeability: mean('permeability'), isOpen: true, resistance: mean('resistance') });
      a.born.set(id, { birth: t, uses: 0, rule, src: cur, tgt: z, integrated: false }); a.log.births.push({ t, id, rule }); }
  }
}

function emptyBwO(a) {
  if (a.stay >= P.FREEZE) return 'frozen';
  const fl = gatesOf(a).filter(g => g.isOpen).map(g => g.flux), mu = fl.reduce((u, v) => u + v, 0) / fl.length;
  if (Math.sqrt(fl.reduce((u, v) => u + (v - mu) ** 2, 0) / fl.length) < P.SD_MIN) return 'homogenised';
  if (fl.length >= P.SAT) return 'saturated';
  return null;
}

function step(a, t, inZone) {
  const desire = a.regime !== 'B', from = a.rt.getCurrentZone();
  a.rt.exitBonus = (f, to) => { let b = T * -Math.log(-Math.log(a.noise() || 1e-12));
    if (desire) for (const x of a.born.values()) if (!x.integrated && x.src === f && x.tgt === to) b += P.TRY_BONUS / (1 + x.uses);
    return b; };
  a.rt.step(TOKEN[inZone]);
  const route = [...a.rt.lastRoute], to = a.rt.getCurrentZone();
  a.stay = to === from ? a.stay + 1 : 0; for (const z of route.slice(1)) a.visits[z]++;
  const zs = a.rt.getQabbala().getZones(); const act = [...Array(10).keys()].map(z => zs[z].activation);
  for (let i = 0; i < 10; i++) a.m[i] += P.RHO * (act[i] - a.m[i]);
  for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) a.c[i][j] += P.RHO * ((act[i] - a.m[i]) * (act[j] - a.m[j]) - a.c[i][j]);
  if (desire) synthesis(a, t, inZone, route);
  return { from, to, route, flight: a.rt.lastReleased };
}

const dist = (x, y) => Math.sqrt(x.reduce((u, v, i) => u + (v - y[i]) ** 2, 0) / x.length);

export function run(regime, seed, steps) {
  const a = newAgent(regime, seed), out = outside(seed, steps), path = [], gTrace = [], morphs = [], flights = [];
  let tm = null, tb = null; const out2 = outside(seed + 1_000_003, steps);
  for (let t = 0; t < steps; t++) {
    if (t === T0) { tm = cloneAgent(a, seed * 7919 + t); a.noise = rng(seed * 7919 + t);
      const st = tm.rt.exportState(), r = rng((seed ^ 0xBEEF) >>> 0), fl = st.qabbalaGates.map(g => g.flux);
      for (let i = fl.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [fl[i], fl[j]] = [fl[j], fl[i]]; }
      st.qabbalaGates.forEach((g, i) => { g.flux = fl[i]; }); for (const z of Object.values(st.qabbalaZones)) z.activation = r();
      tm.rt.importState(st); tb = cloneAgent(a, seed * 7919 + t); tm.m0 = dist(morph(tm.rt), morph(a.rt)); tm.d = []; tm.path = []; tb.path = []; a.after = []; }
    const r = step(a, t, out[t]); path.push(r.to); flights.push(r.flight ? 1 : 0);
    if (tm) { tm.path.push(step(tm, t, out[t]).to); tb.path.push(step(tb, t, out2[t]).to); a.after.push(r.to);
      if ((t - T0) % 250 === 249) tm.d.push(dist(morph(tm.rt), morph(a.rt))); }
    // checkpoints and the rollback of the empty BwO (D, D-strat, D-learn)
    if (regime !== 'B' && regime !== 'D-rb') {
      if (t % P.CKPT === 0) { a.ckpts.push({ t, s: snapshot(a) }); if (a.ckpts.length > 8) a.ckpts.shift(); }
      const why = emptyBwO(a);
      if (why && a.log.rollbacks.length < P.MAX_ROLLBACKS) { const c = [...a.ckpts].reverse().find(k => k.t <= t - 500) ?? a.ckpts[0];
        restore(a, c.s, seed * 104729 + t); a.log.rollbacks.push({ t, why, to: c.t }); }
    }
    if (t % 250 === 249) { gTrace.push(gateCount(a.rt)); morphs.push(morph(a.rt)); }
  }
  return { a, path, out, gTrace, morphs, flights, tm, tb };
}

export function measures(R, regime, seed, steps) {
  const { a, path, out, gTrace, morphs, flights, tm, tb } = R, half = Math.floor(steps / 2), third = Math.floor((2 * steps) / 3);
  const mean = xs => (xs.length ? xs.reduce((u, v) => u + v, 0) / xs.length : 0);
  const L = a.log, births = L.births.length, integ = L.integrated.length, pruned = L.pruned.length;
  const mi = (x, y) => { const j = new Map(), p = new Map(), q = new Map(); for (let i = 0; i < x.length; i++) { const k = x[i] * 10 + y[i];
      j.set(k, (j.get(k) ?? 0) + 1); p.set(x[i], (p.get(x[i]) ?? 0) + 1); q.set(y[i], (q.get(y[i]) ?? 0) + 1); }
    let s = 0; for (const [k, c] of j) s += (c / x.length) * Math.log((c * x.length) / (p.get(Math.floor(k / 10)) * q.get(k % 10))); return s; };
  const ox = out.slice(half), py = path.slice(half), r = rng((seed ^ 0x51) >>> 0); let sh = 0;
  for (let k = 0; k < 20; k++) { const z = [...ox]; for (let i = z.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [z[i], z[j]] = [z[j], z[i]]; } sh += mi(z, py) / 20; }
  const edges = new Map(); for (let i = half + 1; i < path.length; i++) { const k = `${path[i - 1]}>${path[i]}`; edges.set(k, (edges.get(k) ?? 0) + 1); }
  const n = path.length - half - 1, H = -[...edges.values()].reduce((u, c) => u + (c / n) * Math.log(c / n), 0);
  // drift between successive 1,000-step epochs of her form (morphs every 250 steps), averaged over the second half
  const ep = morphs.filter((_, i) => i % 4 === 3), drifts = []; for (let i = Math.ceil(ep.length / 2); i < ep.length; i++) drifts.push(dist(ep[i], ep[i - 1]));
  const fates = L.integrated.length + L.pruned.length;
  return { regime, seed, births, integrated: integ, pruned, attachShare: fates ? integ / fates : null,
    turnoverLastThird: L.births.filter(x => x.t >= third).length + L.pruned.filter(x => x.t >= third).length,
    birthsLastThird: L.births.filter(x => x.t >= third).length,
    gatesEnd: gateCount(a.rt), gateTrace: gTrace, ruleWeights: a.w, gammaEnd: a.gamma,
    ruleOfIntegrated: Object.fromEntries(RULES.map(q => [q, L.integrated.filter(x => x.rule === q).length])),
    rollbacks: L.rollbacks.length, rollbackWhy: L.rollbacks.reduce((u, x) => ({ ...u, [x.why]: (u[x.why] ?? 0) + 1 }), {}),
    emptyBwOAtEnd: (() => { const w = emptyBwO(a); return w ?? 'none'; })(),
    coupling: mi(ox, py) - sh, edgeEntropy: H, epochDrift: mean(drifts), flightsPer1000: 1000 * mean(flights.slice(half)),
    frozenAtEnd: a.stay >= P.FREEZE ? 1 : 0,
    levin: { m0: tm.m0, ratio: tm.d.at(-1) / tm.m0 },
    blanketDivergence: 1 - tb.path.slice(0, 1000).filter((z, i) => z === a.after[i]).length / 1000 };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [regime, seed, steps, file] = process.argv.slice(2);
  const R = run(regime, Number(seed), Number(steps)), m = measures(R, regime, Number(seed), Number(steps));
  writeFileSync(file, JSON.stringify({ measures: m, path: R.path.join(''), outside: R.out, births: R.a.log.births, rollbacks: R.a.log.rollbacks }) + '\n');
  console.log(JSON.stringify({ regime, seed, births: m.births, integrated: m.integrated, pruned: m.pruned, attach: m.attachShare, turnover3: m.turnoverLastThird, gates: m.gatesEnd, rollbacks: m.rollbacks, w: m.ruleWeights, gamma: m.gammaEnd, coupling: m.coupling, drift: m.epochDrift, levin: m.levin.ratio }));
}
