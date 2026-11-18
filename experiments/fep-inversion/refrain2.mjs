// REFRAIN-2: the operator's guardrails (18 Nov). refrain.mjs (REFRAIN-1) with the changes marked REFRAIN-2; DTR is REFRAIN-1's
// refrain unchanged, kept as the anchor.
// RELATIONAL TERRITORIES (inclusive indexing). Each hop realises relations of the CCRU Numogram (its gate G, current C,
// syzygy S, Pandemonium pair P; the region R is too coarse to make a territory and is left out). A MOTIF is one relation of
// a hop followed by one relation of the next hop (l1 then l2), for every such pair at once, whichever zones carry it.
// NODE TERRITORIES (the control for indexing). A motif is a 3-zone segment a -> b -> c, as in REFRAIN-1.
// Both are inscribed in every regime on their own surfaces: + (1 - m)/8, half-life HL2 = 250 steps (faster decay). Her
// territories are the at most K2 = 3 strongest motifs whose mark has reached THETA2 = 0.6.
// THE PULL. At an exit f -> to, after the hop that brought her to f: each territory whose first term the last hop realised
// and whose second term this exit realises gives min(CEIL2, mark); she gains WF * gate * the largest of them.
// gate = 1 in the Outside's silences; GV = 0.15 while it speaks (a background rhythm); 1 always in DTR2V (the replay control).
// THE CEILING AND THE LINE OF FLIGHT. The pull never exceeds WF * CEIL2: visits to a territory at its ceiling add nothing.
// She is AT HOME on a step whose last hop completed one of her territories. After DWELL consecutive steps at home, the pull
// is suspended and every exit that completes none of her territories gains WL (a line of flight), until she leaves.
// Regimes: B; DT (the benchmark); DTR (REFRAIN-1's refrain); DTR2 (relational, silence-gated); DTR2V (relational, always on);
// DTN (node territories, silence-gated). In B and DT both surfaces are inscribed and measured but nothing reads them.
// (REFRAIN-1's header follows.)
// REFRAIN-1: the refrain reads its territories off the inclusive record. disj2.mjs (DISJ-2) with the changes marked REFRAIN-1.
// The inclusive record is inscribed in every regime and never read at her exits (WV = WS = 0: DISJ-2's finding). It gains one
// relation family, Q: each 3-zone segment of her passage (a -> b -> c), marked as the other relations are (+ (1 - m)/8,
// half-life 500). A segment whose mark reaches THETA is a TERRITORY; HOME is the union of the zones of her territories.
// The refrain (DTR, DTRW): when she stands outside home, each exit into a home zone gains
//   WF * pull * min(1, away / AWAY),   pull = the strongest mark among the territories containing that zone,
// where away counts her steps since she was last at home. At home there is no pull, so she leaves freely.
// DTR: territories fade (half-life 500) and the pull has an intensity ceiling (pull <= CEIL = 0.85).
// DTRW (the well, control): territories never fade and the pull has no ceiling.
// Regimes: B her own dynamics; DT desire + the Outside's trace (DISJ-2's DT); DTR DT + the refrain; DTRW DT + the well.
// In B and DT the territories are inscribed and measured but nothing reads them.
// (DISJ-2's header follows.)
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
  ALPHA: 1 / 8, DECAY: Math.LN2 / 500, W: 0.5,   // BRIDGE-3: the trace
  THETA: 0.8, K: 2, WF: 0.5, CEIL: 0.85, AWAY: 25,   // REFRAIN-1: territories and the refrain
  HL2: 250, THETA2: 0.6, K2: 3, CEIL2: 0.85, GV: 0.15, DWELL: 20, WL: 0.5 };   // REFRAIN-2
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
    test, T: Array(100).fill(0), traced: ['DT', 'DTR', 'DTR2', 'DTR2V', 'DTN'].includes(regime),   // REFRAIN-2
    rec: new Map(), recMode: 'incl', WR: 0, WV: 0, WS: 0,   // REFRAIN-1: inscribed in every regime, never read at her exits
    refrain: ['DTR', 'DTRW'].includes(regime), well: regime === 'DTRW', hist: [], home: new Set(), pullOf: Array(10).fill(0), away: 0,   // REFRAIN-1
    homeLog: [],
    mode2: { DTR2: 'M', DTR2V: 'M', DTN: 'N' }[regime] ?? null, always: regime === 'DTR2V', M: new Map(), N: new Map(), prevHop: null,   // REFRAIN-2
    terrM: [], terrN: [], atHome: false, dwell: 0, flights: 0, logM: [], logN: [], homeSteps: 0,
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
// REFRAIN-1: her territories, the (at most K) strongest segments whose mark has reached THETA
const territories = a => [...a.rec].filter(([k, v]) => k[0] === 'Q' && v >= P.THETA).sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1)).slice(0, P.K);
// REFRAIN-2: relations a hop realises that can make a territory (region left out), and the territories on each surface
const rel2 = (f, t) => relations(f, t).filter(k => k[0] !== 'R');
const top2 = m => [...m].filter(([, v]) => v >= P.THETA2).sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1)).slice(0, P.K2);
const motifsM = (h0, h1) => { const out = []; for (const l1 of rel2(h0[0], h0[1])) for (const l2 of rel2(h1[0], h1[1])) out.push(`${l1}|${l2}`); return out; };
const motifN = (h0, h1) => `${h0[0]}${h0[1]}${h1[1]}`;
/** The largest territory mark this exit would complete (0 if none), on surface s ('M' or 'N'). */
function completes(a, s, f, to) { const h0 = a.prevHop; if (!h0 || h0[1] !== f) return 0; const terr = s === 'M' ? a.terrM : a.terrN;
  if (!terr.length) return 0; const ks = new Set(s === 'M' ? motifsM(h0, [f, to]) : [motifN(h0, [f, to])]); let best = 0;
  for (const [k, v] of terr) if (ks.has(k)) best = Math.max(best, v); return best; }
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
    if (a.refrain && !a.home.has(f) && a.home.has(to)) b += P.WF * a.pullOf[to] * Math.min(1, a.away / P.AWAY);   // REFRAIN-1
    if (a.mode2) { const c = completes(a, a.mode2, f, to);   // REFRAIN-2: the pull, gated by the Outside; the line of flight
      if (a.dwell >= P.DWELL) { if (c === 0) b += P.WL; }
      else b += P.WF * (inZone === null || a.always ? 1 : P.GV) * Math.min(P.CEIL2, c); }
    return b; };
  a.rt.step(inZone === null ? undefined : TOKEN[inZone]);
  // BRIDGE-3: the Outside writes its move on the edge it moved along (only on received steps); all marks fade
  if (a.traced) { for (let i = 0; i < 100; i++) a.T[i] *= 1 - P.DECAY;
    if (inZone !== null && t > 0 && !silent(t - 1)) { const e = a.test[t - 1] * 10 + a.test[t]; a.T[e] += P.ALPHA * (1 - a.T[e]); } }
  const route = [...a.rt.lastRoute], to = a.rt.getCurrentZone();
  if (a.recMode) { for (const [k, v] of a.rec) if (!(a.well && k[0] === 'Q')) a.rec.set(k, v * (1 - P.DECAY)); for (let i = 1; i < route.length; i++) writeRec(a, route[i - 1], route[i]); }   // DISJ-1
  // REFRAIN-1: her passage's 3-zone segments are inscribed under Q; territories and home are read off the record
  if (!a.hist.length) a.hist.push(from);
  for (const z of route.slice(1)) { a.hist.push(z); if (a.hist.length > 3) a.hist.shift();
    if (a.hist.length === 3) { const k = `Q${a.hist.join('')}`, v = a.rec.get(k) ?? 0; a.rec.set(k, v + (1 - v) / 8); } }
  a.home = new Set(); a.pullOf.fill(0);
  for (const [k, v] of territories(a)) for (const c of k.slice(1)) { const z = Number(c); a.home.add(z);
    a.pullOf[z] = Math.max(a.pullOf[z], a.well ? v : Math.min(P.CEIL, v)); }
  // REFRAIN-2: inscribe each hop's motifs on both surfaces (half-life HL2), then read the territories off them
  { const d2 = 1 - Math.LN2 / P.HL2; for (const m of [a.M, a.N]) for (const [k, v] of m) m.set(k, v * d2);
    let home = false; const was = a.dwell >= P.DWELL;
    for (let i = 1; i < route.length; i++) { const h = [route[i - 1], route[i]];
      if (a.prevHop && a.prevHop[1] === h[0]) { const tM = a.mode2 === 'M' ? a.terrM : a.terrN, sM = a.mode2 === 'M';
        if (a.mode2) { const ks = sM ? motifsM(a.prevHop, h) : [motifN(a.prevHop, h)]; home = tM.some(([k]) => ks.includes(k)); }
        for (const k of motifsM(a.prevHop, h)) { const v = a.M.get(k) ?? 0; a.M.set(k, v + (1 - v) / 8); }
        { const k = motifN(a.prevHop, h), v = a.N.get(k) ?? 0; a.N.set(k, v + (1 - v) / 8); } }
      a.prevHop = h; }
    if (route.length > 1) a.atHome = home;
    a.dwell = a.atHome ? a.dwell + 1 : 0; if (!was && a.dwell >= P.DWELL) a.flights++; if (a.atHome) a.homeSteps++;
    a.terrM = top2(a.M); a.terrN = top2(a.N); a.logM.push(a.terrM.map(x => x[0]).join(',')); a.logN.push(a.terrN.map(x => x[0]).join(',')); }
  a.away = a.home.has(to) ? 0 : a.away + 1; a.homeLog.push(a.home.size ? [...a.home].reduce((u, z) => u | (1 << z), 0) : 0);
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

// REFRAIN-1: home, departures and returns, dwelling and limit cycles, late (4,500-6,000)
export function refrainMeasures(a, path, seed) { const t0 = 4500, t1 = path.length, H = a.homeLog, inH = t => (H[t] >> path[t]) & 1;
  let dep = 0, ret = 0, dwell = 0, size = 0, exc = [], farDep = 0, farRet = 0; const FAR = 8;
  for (let t = t0; t < t1; t++) { dwell += inH(t); size += H[t].toString(2).split('1').length - 1;
    if (t > 0 && ((H[t - 1] >> path[t - 1]) & 1) && !inH(t)) { dep++; let back = null; for (let u = t + 1; u <= Math.min(t1 - 1, t + 50); u++) if (inH(u)) { back = u - t; break; }
      if (back !== null) { ret++; exc.push(back); } let far = true; for (let u = t; u < t + FAR; u++) if (u >= t1 || inH(u)) { far = false; break; }
      if (far) { farDep++; if (back !== null) farRet++; } } }
  const per = z => { let best = 0; for (let q = 2; q <= 8; q++) { let c = 0; for (let t = q; t < z.length; t++) c += z[t] === z[t - q]; best = Math.max(best, c / (z.length - q)); } return best; };
  const late = path.slice(t0, t1), r = rng((seed ^ 0x7E44) >>> 0); let sh = 0;
  for (let k = 0; k < 20; k++) { const z = [...late]; for (let i = z.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [z[i], z[j]] = [z[j], z[i]]; } sh += per(z) / 20; }
  const bits = x => x.toString(2).split('1').length - 1, jac = (x, y) => (x | y) ? bits(x & y) / bits(x | y) : 1;
  let pers = 0; for (let t = t0; t < t1; t++) pers += jac(H[t], H[t - 250]);   // home now against home 250 steps before
  const n = t1 - t0, territories = [...a.rec].filter(([k, v]) => k[0] === 'Q' && v >= P.THETA).length;   // above THETA, before the cap K
  return { departures: dep, returns: ret, returnShare: dep ? ret / dep : 0, farDepartures: farDep, farReturnShare: farDep ? farRet / farDep : null, meanExcursion: exc.length ? exc.reduce((u, v) => u + v, 0) / exc.length : null,
    dwell: dwell / n, homeSize: size / n, persistence: pers / n, periodicity: per(late) - sh, territoriesEnd: territories }; }

// REFRAIN-2: persistence of each surface's territories (Jaccard of the territory sets, now against 250 steps before), late
export function refrain2Measures(a, n) { const t0 = 4500, jac = (x, y) => { const X = new Set(x ? x.split(',') : []), Y = new Set(y ? y.split(',') : []);
    const u = new Set([...X, ...Y]); if (!u.size) return 1; let i = 0; for (const k of X) if (Y.has(k)) i++; return i / u.size; };
  // steps on which neither set holds a territory are left out of the persistence (an empty home is not a persistent one)
  let pm = 0, pn = 0, cm = 0, cn = 0, em = 0, en = 0; for (let t = t0; t < n; t++) {
    if (a.logM[t] || a.logM[t - 250]) { pm += jac(a.logM[t], a.logM[t - 250]); cm++; } if (a.logN[t] || a.logN[t - 250]) { pn += jac(a.logN[t], a.logN[t - 250]); cn++; }
    em += a.logM[t] === '' ? 1 : 0; en += a.logN[t] === '' ? 1 : 0; }
  const L = n - t0; return { persistM: cm ? pm / cm : 0, persistN: cn ? pn / cn : 0, noTerritoryM: em / L, noTerritoryN: en / L,
    territoriesM: [...a.M.values()].filter(v => v >= P.THETA2).length, territoriesN: [...a.N.values()].filter(v => v >= P.THETA2).length,
    homeShare: a.homeSteps / n, flights: a.flights }; }

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
    refrain: refrainMeasures(a, path, seed), refrain2: refrain2Measures(a, path.length), birthsLate: L.births.filter(x => x.t >= 4000).length,
    rollbacks: L.rollbacks.length, gatesEnd: gateCount(a.rt), gateTrace: gTrace, ruleWeights: a.w, gammaEnd: a.gamma };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [regime, seed, steps, file] = process.argv.slice(2), R = run(regime, Number(seed), Number(steps)), m = measures(R, regime, Number(seed), Number(steps));
  writeFileSync(file, JSON.stringify({ measures: m, path: R.path.join(''), outside: R.out, bridges: R.a.log.bridges, dissolved: R.a.log.dissolved }) + '\n');
  console.log(JSON.stringify(m));
}
