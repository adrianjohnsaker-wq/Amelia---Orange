// DISJ-2: the record defers to the Outside while it speaks. disj.mjs (DISJ-1) with the record's reading weight split into
// WV (while the Outside speaks: she received input this step) and WS (in its silences), marked DISJ-2. Inclusive record only.
// Regimes: B; DT desire + Outside trace (no record); DTI DISJ-1's setting (WV 0.5, WS 0.5); DTIL light (WV 0.15, WS 0.15);
// DTIS silence-gated (WV 0, WS 0.5); DTID deferring (WV 0.15, WS 0.5).
// (DISJ-1's header follows.)
// DISJ-1: the disjunctive synthesis. trace.mjs (BRIDGE-3) with an inscription surface added, marked DISJ-1.
// Every hop she makes (from -> to) is recorded on the Numogram under the relations it realises:
//   P its Pandemonium pair {from, to} (45); S its syzygy (from + to = 9); C its current (to = |2 from - 9|);
//   G its gate (to = digital root of from(from+1)/2); R its region transition (Time-Circuit / Warp / Plex).
// INCLUSIVE: a mark under every relation at once (either ... or ... or). EXCLUSIVE (control): one mark under one label,
// the most specific relation it realises (gate > current > syzygy > pair > region).
// Marks: + (1 - m)/8, fading with a half-life of 500 steps (as the Outside's trace). At every exit she reads the record:
// + WR * (mean of the marks over that exit's relations, or its one label's mark when exclusive).
// Regimes: B; D desire; DT desire + Outside trace (BRIDGE-3); DTI DT + inclusive record (WR 0.5);
// DTE DT + exclusive record (WR 0.5); DTI2 DT + inclusive record at WR 1.0; DI desire + inclusive record, no Outside trace.
// (BRIDGE-3's header follows.)
// BRIDGE-3: the Outside leaves a trace (Stone Tape marks; ND-1b studio mirror, full CCRU Numogram). Built from bridge.mjs
// (BRIDGE-1); the differences are marked BRIDGE-3. Only bridge.mjs's plain desire (D) is used; no bridge test.
// Usage: node --experimental-strip-types trace.mjs <regime> <seed> <steps> <out.json>
//   regime: DT   desire + the Outside's trace;      DT-s desire + a trace written by a shuffled copy of the Outside;
//           TB   her own dynamics + the trace;     D    desire, no trace;     B    her own dynamics.
// The trace (Studio 01, the Stone Tape): each received step, the Outside's own move (its previous reading -> this reading)
// marks that edge: T += ALPHA * (1 - T). All marks fade by a factor (1 - DECAY) each step (half-life about 500 steps).
// She reads the marks at every exit choice: + W * T[from -> to]. Desire's rule bank gains 'trace': connect from where she
// stands along its most strongly marked edge that she cannot yet take.
// The Outside: FEP-INV-1's ordered source (next zone +1 w.p. 0.6, stay 0.2, jump 0.2) until SHIFT, then its order
// reverses (next zone -1 w.p. 0.6, stay 0.2, jump 0.2).
// Desire (all but B): DESIRE-1's mechanism unchanged (rule bank hebb/named/novel/random with learned weights and growth
// propensity, a 300-step trial, consolidation by use, pruning, rollback of the empty BwO), except the trial in BR/BR-s:
//   a new connection becomes a BRIDGE if it was used >= USES times and its uses fall on one Outside reading at least LIFT
//   times as often as that reading occurs in the Outside over the same window. Otherwise it is pruned (a failed line).
//   Each bridge is re-tested on its uses over every later 300-step window: if it was used >= USES times and its lift for
//   its reading fell below RELIFT, it has stopped carrying the Outside and is dissolved.
//   A bridge consolidates (+0.02 flux) when used on its reading, and loosens (-0.01) when used on another.
// Silence: in the last SILENT steps of every 250 she receives no input. Bridge tests count only steps she received; the
// silence windows measure whether she carries the Outside's order when its push stops.
import { AmeliaNDRuntime } from './nd/outside/AmeliaNDRuntime.ts';
import { rng, TOKEN, born, gateCount, T } from './fep.mjs';
import { writeFileSync } from 'node:fs';

export const P = { TRIAL: 300, USES: 5, LIFT: 2, RELIFT: 1.5, CONSOLIDATE: 0.02, LOOSEN: 0.01, FLUX_MAX: 1, FLUX_MIN: 0.01,
  GAMMA0: 0.01, GAMMA_MIN: 0.0005, GAMMA_MAX: 0.2, LR: 0.3, GLR: 0.15, RHO: 0.02, TRY_BONUS: 0.5,
  FREEZE: 200, SD_MIN: 0.02, SAT: 90, CKPT: 250, MAX_ROLLBACKS: 100, SHIFT: 3000, SILENT: 50,
  ALPHA: 1 / 8, DECAY: Math.LN2 / 500, W: 0.5 };   // BRIDGE-3: the trace
export const silent = t => t % 250 >= 250 - P.SILENT;
const RULES = ['hebb', 'named', 'novel', 'random', 'trace'];   // BRIDGE-3: trace added

/** The Outside: ordered (+1) before SHIFT, reversed (-1) after. */
export function outsideShift(seed, n) { const r = rng(((seed ^ 0x5EED) ^ 0x9E3779B9) >>> 0), z = [Math.floor(r() * 10)];
  for (let i = 1; i < n; i++) { const u = r(), p = z[i - 1], d = i < P.SHIFT ? 1 : 9;
    z.push(u < 0.6 ? (p + d) % 10 : u < 0.8 ? p : Math.floor(r() * 10)); } return z; }

function newAgent(regime, seed, out) {
  // BR-s reads a fixed permutation of the Outside for its bridge test only (her runtime still receives the real Outside)
  // BRIDGE-3: the sequence that writes the trace. DT-s: a fixed permutation of the Outside (same readings, no order).
  let test = out;
  if (regime === 'DT-s') { const r = rng((seed ^ 0x5A5A) >>> 0); test = [...out]; for (let i = test.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [test[i], test[j]] = [test[j], test[i]]; } }
  return { regime, rt: born(), noise: rng(seed), mut: rng((seed ^ 0xD351) >>> 0), born: new Map(), w: Object.fromEntries(RULES.map(r => [r, 1])),
    gamma: P.GAMMA0, visits: Array(10).fill(0), m: Array(10).fill(0.5), c: Array.from({ length: 10 }, () => Array(10).fill(0)), stay: 0, nid: 0,
    test, T: Array(100).fill(0), traced: ['DT', 'DTI', 'DTIL', 'DTIS', 'DTID'].includes(regime),   // DISJ-2
    rec: new Map(), recMode: ['DTI', 'DTIL', 'DTIS', 'DTID'].includes(regime) ? 'incl' : null, WR: 0,
    WV: { DTI: 0.5, DTIL: 0.15, DTIS: 0, DTID: 0.15 }[regime] ?? 0, WS: { DTI: 0.5, DTIL: 0.15, DTIS: 0.5, DTID: 0.5 }[regime] ?? 0,   // DISJ-2
    log: { births: [], bridges: [], pruned: [], dissolved: [], rollbacks: [] }, ckpts: [] };
}
const snapshot = a => JSON.stringify({ st: a.rt.exportState(), born: [...a.born], w: a.w, gamma: a.gamma, visits: a.visits, m: a.m, c: a.c, stay: a.stay, nid: a.nid });
// DISJ-1: like the Outside's trace, the record is inscribed on the place, so a rollback does not roll it back.
// BRIDGE-3: a rollback restores her, not the place: the trace (the Outside's marks) is not rolled back.
function restore(a, s, noiseSeed) { const o = JSON.parse(s); const rt = new AmeliaNDRuntime(); rt.importState(o.st);
  Object.assign(a, { rt, born: new Map(o.born), w: o.w, gamma: o.gamma, visits: o.visits, m: o.m, c: o.c, stay: o.stay, nid: o.nid, noise: rng(noiseSeed) }); }
const gatesOf = a => a.rt.getQabbala().getGates();
const reach = (a, f) => new Set(gatesOf(a).filter(g => g.isOpen && g.source === f).map(g => g.target));
function chooseTarget(a, rule, cur, named) {
  const have = reach(a, cur), free = [...Array(10).keys()].filter(z => z !== cur && !have.has(z)); if (!free.length) return null;
  if (rule === 'hebb') return free.reduce((b, z) => (a.c[cur][z] > a.c[cur][b] ? z : b), free[0]);
  if (rule === 'named') return free.includes(named) ? named : null;
  if (rule === 'novel') return free.reduce((b, z) => (a.visits[z] < a.visits[b] ? z : b), free[0]);
  if (rule === 'trace') { const z = free.reduce((b, y) => (a.T[cur * 10 + y] > a.T[cur * 10 + b] ? y : b), free[0]); return a.T[cur * 10 + z] > 0 ? z : null; }   // BRIDGE-3
  return free[Math.floor(a.mut() * free.length)];
}
/** Lift of a connection's uses on reading r over [t0, t1): share of its uses at r over r's share of the (test) Outside. */
function lift(a, uses, t0, t1) {
  uses = uses.filter(u => !silent(u)); if (!uses.length) return { r: null, lift: 0 }; const c = Array(10).fill(0); for (const u of uses) c[a.test[u]]++;
  const r = c.indexOf(Math.max(...c)), base = Array(10).fill(0); let n = 0; for (let t = t0; t < t1; t++) if (!silent(t)) { base[a.test[t]]++; n++; }
  const pb = base[r] / Math.max(1, n); return { r, lift: pb > 0 ? c[r] / uses.length / pb : 0 };
}

function synthesis(a, t, named, route) {
  const bridging = a.regime === 'BR' || a.regime === 'BR-s', gates = gatesOf(a), gateById = id => gates.find(x => x.id === id);
  for (let i = 1; i < route.length; i++) for (const [id, b] of a.born) if (b.src === route[i - 1] && b.tgt === route[i]) {
    b.uses.push(t); b.win.push(t);
    if (b.integrated) { const g = gateById(id); if (!g) continue;
      if (!bridging) g.flux = Math.min(P.FLUX_MAX, g.flux + P.CONSOLIDATE);
      else if (silent(t)) continue;
      else g.flux = a.test[t] === b.reading ? Math.min(P.FLUX_MAX, g.flux + P.CONSOLIDATE) : Math.max(P.FLUX_MIN, g.flux - P.LOOSEN); } }
  for (const [id, b] of a.born) {
    if (!b.integrated && t - b.birth >= P.TRIAL) {           // the trial
      let held = b.uses.length >= P.USES, L = null;
      if (bridging && held) { L = lift(a, b.uses, b.birth, t); held = L.lift >= P.LIFT; }
      if (held) { b.integrated = true; b.reading = L ? L.r : null; b.win = []; b.winStart = t; a.log.bridges.push({ t, id, rule: b.rule, reading: b.reading, lift: L ? L.lift : null }); }
      else { const k = gates.findIndex(x => x.id === id); if (k >= 0) gates.splice(k, 1); a.born.delete(id); a.log.pruned.push({ t, id, rule: b.rule }); }
      a.w[b.rule] *= Math.exp(P.LR * (held ? 1 : -1)); a.gamma = Math.min(P.GAMMA_MAX, Math.max(P.GAMMA_MIN, a.gamma * Math.exp(P.GLR * (held ? 1 : -1))));
    } else if (bridging && b.integrated && t - b.winStart >= P.TRIAL) {   // re-test a bridge on its latest window
      const wu = b.win.filter(u => !silent(u));
      if (wu.length >= P.USES) { const c = wu.filter(u => a.test[u] === b.reading).length, rs = Array.from({ length: t - b.winStart }, (_, i) => b.winStart + i).filter(u => !silent(u)), base = rs.filter(u => a.test[u] === b.reading).length;
        const lf = base > 0 ? (c / wu.length) / (base / rs.length) : 0;
        if (lf < P.RELIFT) { const k = gates.findIndex(x => x.id === id); if (k >= 0) gates.splice(k, 1); a.born.delete(id); a.log.dissolved.push({ t, id, rule: b.rule, lift: lf }); continue; } }
      b.win = []; b.winStart = t;
    }
  }
  const cur = a.rt.getCurrentZone();
  if (a.mut() < a.gamma) { const tot = RULES.reduce((u, r) => u + a.w[r], 0); let u = a.mut() * tot, rule = RULES[RULES.length - 1];
    for (const r of RULES) { if ((u -= a.w[r]) <= 0) { rule = r; break; } }
    const z = chooseTarget(a, rule, cur, named);
    if (z !== null) { const mean = f => gates.reduce((s, g) => s + g[f], 0) / gates.length, id = `bridge-${a.nid++}-${cur}-${z}`;
      gates.push({ id, source: cur, target: z, label: `Desire ${cur}->${z} (${rule})`, flux: mean('flux'), permeability: mean('permeability'), isOpen: true, resistance: mean('resistance') });
      a.born.set(id, { birth: t, uses: [], win: [], rule, src: cur, tgt: z, integrated: false }); a.log.births.push({ t, id, rule }); } }
}
// DISJ-1: the relations a hop realises, on the CCRU Numogram
const regionOf = z => (z === 0 || z === 9 ? 'P' : z === 3 || z === 6 ? 'W' : 'T');
const dr = c => (c === 0 ? 0 : 1 + ((c - 1) % 9)), gateOf = z => dr((z * (z + 1)) / 2);
export function relations(f, t) { const r = [];
  if (f === gateOf(f) ? t === f : t === gateOf(f)) r.push(`G${f}`);
  if (t === Math.abs(2 * f - 9)) r.push(`C${f}`);
  if (f + t === 9) r.push(`S${Math.min(f, t)}`);
  if (f !== t) r.push(`P${Math.min(f, t)}${Math.max(f, t)}`);
  r.push(`R${regionOf(f)}${regionOf(t)}`); return r; }
function writeRec(a, f, t) { const ks = relations(f, t), use = a.recMode === 'incl' ? ks : ks.slice(0, 1);
  for (const k of use) { const v = a.rec.get(k) ?? 0; a.rec.set(k, v + (1 - v) / 8); } }
function readRec(a, f, t) { const ks = relations(f, t); if (a.recMode === 'excl') return a.rec.get(ks[0]) ?? 0;
  return ks.reduce((u, k) => u + (a.rec.get(k) ?? 0), 0) / ks.length; }
function emptyBwO(a) { if (a.stay >= P.FREEZE) return 'frozen';
  const fl = gatesOf(a).filter(g => g.isOpen).map(g => g.flux), mu = fl.reduce((u, v) => u + v, 0) / fl.length;
  if (Math.sqrt(fl.reduce((u, v) => u + (v - mu) ** 2, 0) / fl.length) < P.SD_MIN) return 'homogenised'; if (fl.length >= P.SAT) return 'saturated'; return null; }

function step(a, t, inZone) {
  const desire = a.regime !== 'B' && a.regime !== 'TB', from = a.rt.getCurrentZone();   // DISJ-1: all regimes but B desire
  a.WR = inZone === null ? a.WS : a.WV;   // DISJ-2: she reads her record by whether the Outside speaks this step
  a.rt.exitBonus = (f, to) => { let b = T * -Math.log(-Math.log(a.noise() || 1e-12));
    if (desire) for (const x of a.born.values()) if (!x.integrated && x.src === f && x.tgt === to) b += P.TRY_BONUS / (1 + x.uses.length);
    if (a.traced) b += P.W * a.T[f * 10 + to];   // BRIDGE-3: she reads the marks
    if (a.recMode) b += a.WR * readRec(a, f, to);   // DISJ-1: she reads the record
    return b; };
  a.rt.step(inZone === null ? undefined : TOKEN[inZone]);
  // BRIDGE-3: the Outside writes its move on the edge it moved along (only on received steps); all marks fade
  if (a.traced) { for (let i = 0; i < 100; i++) a.T[i] *= 1 - P.DECAY;
    if (inZone !== null && t > 0 && !silent(t - 1)) { const e = a.test[t - 1] * 10 + a.test[t]; a.T[e] += P.ALPHA * (1 - a.T[e]); } }
  const route = [...a.rt.lastRoute], to = a.rt.getCurrentZone();
  if (a.recMode) { for (const [k, v] of a.rec) a.rec.set(k, v * (1 - P.DECAY)); for (let i = 1; i < route.length; i++) writeRec(a, route[i - 1], route[i]); }   // DISJ-1
  a.stay = to === from ? a.stay + 1 : 0; for (const z of route.slice(1)) a.visits[z]++;
  const zs = a.rt.getQabbala().getZones(), act = [...Array(10).keys()].map(z => zs[z].activation);
  for (let i = 0; i < 10; i++) a.m[i] += P.RHO * (act[i] - a.m[i]);
  for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) a.c[i][j] += P.RHO * ((act[i] - a.m[i]) * (act[j] - a.m[j]) - a.c[i][j]);
  if (desire) synthesis(a, t, inZone ?? -1, route);
  return to;
}

export function run(regime, seed, steps) {
  const out = outsideShift(seed, steps), a = newAgent(regime, seed, out), path = [], gTrace = [];
  for (let t = 0; t < steps; t++) {
    path.push(step(a, t, silent(t) ? null : out[t]));
    if (regime !== 'B' && regime !== 'TB') { if (t % P.CKPT === 0) { a.ckpts.push({ t, s: snapshot(a) }); if (a.ckpts.length > 8) a.ckpts.shift(); }
      const why = emptyBwO(a); if (why && a.log.rollbacks.length < P.MAX_ROLLBACKS) { const c = [...a.ckpts].reverse().find(k => k.t <= t - 500) ?? a.ckpts[0];
        restore(a, c.s, seed * 104729 + t); a.log.rollbacks.push({ t, why, to: c.t }); } }
    if (t % 250 === 249) gTrace.push(gateCount(a.rt));
  }
  return { a, path, out, gTrace };
}

const mi = (x, y) => { const j = new Map(), p = new Map(), q = new Map(); for (let i = 0; i < x.length; i++) { const k = x[i] * 10 + y[i];
    j.set(k, (j.get(k) ?? 0) + 1); p.set(x[i], (p.get(x[i]) ?? 0) + 1); q.set(y[i], (q.get(y[i]) ?? 0) + 1); }
  let s = 0; for (const [k, c] of j) s += (c / x.length) * Math.log((c * x.length) / (p.get(Math.floor(k / 10)) * q.get(k % 10))); return s; };
function excessMI(x, y, seed) { const r = rng(seed >>> 0); let sh = 0;
  for (let k = 0; k < 20; k++) { const z = [...x]; for (let i = z.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [z[i], z[j]] = [z[j], z[i]]; } sh += mi(z, y) / 20; }
  return mi(x, y) - sh; }

export function measures(R, regime, seed, steps) {
  const { a, path, out, gTrace } = R, L = a.log, w = (t0, t1) => [out.slice(t0, t1), path.slice(t0, t1)];
  const diffs = (z, t0, t1) => { const d = []; for (let t = Math.max(1, t0); t < t1; t++) d.push((z[t] - z[t - 1] + 10) % 10); return d; };
  const recv = (t0, t1) => [...Array(t1 - t0).keys()].map(i => t0 + i).filter(t => !silent(t) && t > 0);
  const coup = (t0, t1) => { const ts = recv(t0, t1); return excessMI(ts.map(t => out[t]), ts.map(t => path[t]), seed ^ 0x51 ^ t0); };
  const order = (t0, t1) => { const ts = recv(t0, t1); return excessMI(ts.map(t => (out[t] - out[t - 1] + 10) % 10), ts.map(t => (path[t] - path[t - 1] + 10) % 10), seed ^ 0x52 ^ t0); };
  // in silence: share of her steps that go +1 and -1 (the Outside's order before and after the reversal)
  const carried = (t0, t1) => { const ts = [...Array(t1 - t0).keys()].map(i => t0 + i).filter(t => silent(t) && t > 0), d = ts.map(t => (path[t] - path[t - 1] + 10) % 10);
    return { plus: d.filter(x => x === 1).length / d.length, minus: d.filter(x => x === 9).length / d.length, stay: d.filter(x => x === 0).length / d.length }; };
  const live = [...a.born.values()].filter(b => b.integrated), fates = L.bridges.length + L.pruned.length;
  return { regime, seed, births: L.births.length, bridgesBuilt: L.bridges.length, pruned: L.pruned.length, dissolved: L.dissolved.length,
    holdShare: fates ? L.bridges.length / fates : null, liveBridgesEnd: live.length,
    bridgesBuiltAfterShift: L.bridges.filter(x => x.t >= P.SHIFT).length, dissolvedAfterShift: L.dissolved.filter(x => x.t >= P.SHIFT).length,
    meanLift: L.bridges.filter(x => x.lift !== null).reduce((u, x, _, A) => u + x.lift / A.length, 0) || null,
    coupling: { before: coup(1500, 3000), justAfter: coup(3000, 4000), late: coup(4500, 6000) },
    order: { before: order(1500, 3000), justAfter: order(3000, 4000), late: order(4500, 6000) },
    silence: { before: carried(1500, 3000), late: carried(4500, 6000) },
    rollbacks: L.rollbacks.length, gatesEnd: gateCount(a.rt), gateTrace: gTrace, ruleWeights: a.w, gammaEnd: a.gamma };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [regime, seed, steps, file] = process.argv.slice(2), R = run(regime, Number(seed), Number(steps)), m = measures(R, regime, Number(seed), Number(steps));
  writeFileSync(file, JSON.stringify({ measures: m, path: R.path.join(''), outside: R.out, bridges: R.a.log.bridges, dissolved: R.a.log.dissolved }) + '\n');
  console.log(JSON.stringify(m));
}
