// THE POINTER II (see REGISTRATION.md): THE POINTER (../pointer/pointer.mjs, revisions 1 and 2) unchanged, plus
//  - arms with one Numogram element closed (noGt28: 7>1, noCur17: 1>7, noGt10: 4>1) for the dissection,
//  - order-2 and order-3 her-statistics walkers over the same assays (full arm),
//  - assay 3 again with the stone's playback switched off (full arm),
//  - her catalogue over assays 1, 2 and generation 0 of 3 alone (every arm).
//
//   node pointer2.mjs <runtimeDir> <start_states.json> <world> <lineage 0..8> <full|noGt28|noCur17|noGt10> <out.json>
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { load } from '../pf1/PF1_A1_R2_SCORER.mjs';
import { scanCounts } from '../antenna/scan.mjs';
import { CANONICAL_GATES } from '../studio/runtime_mirror/ai/numogram/AmeliaQabbalaInterface.ts';
import { fullNumogramGates, currentOf } from '../numogram/CCRUNumogram.ts';
const [M, STATES, WORLD, K, ARM, OUT] = process.argv.slice(2);
const { AmeliaNumogramSubstrateRuntime: R } = await import(`${M}/substrate/ameliaNumogramSubstrateRuntime.ts`);
const REMOVED = { full: null, noGt28: '7>1', noCur17: '1>7', noGt10: '4>1' }[ARM];
if (REMOVED === undefined) throw new Error('UNKNOWN_ARM');
const GATES = fullNumogramGates(CANONICAL_GATES).filter(g => `${g.source}>${g.target}` !== REMOVED);
const EDGES = GATES.map(g => `${g.source}>${g.target}`);
const CANON = new Set(CANONICAL_GATES.map(g => `${g.source}>${g.target}`));
const a = 0.01, A = 1, wV = 0.5, wH = 0.35, lamS = 0.002, kappa = 0.0005, lamD = 0.00005, H = 24, eta = 1 / 8;
const WARM = 2000, TRIAL = 240, AT_HOME = 24, BARRIER_T = 2000, GEN_T = 5000, GENS = 5;
const W_STONE = 0.35, PLAYBACK = 0.35, ETCH = 0.0005, START_TICK = 30 * 20160;
const key = (x, y) => `${x}>${y}`, sha = s => createHash('sha256').update(s).digest('hex');
const k = Number(K);
const rng = name => { let st = parseInt(sha(`POINTER|${WORLD}|${K}|${name}`).slice(0, 8), 16) >>> 0;
  return () => { st = (st + 0x6D2B79F5) >>> 0; let x = st; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; };
function finalExcursion(z) {
  const ta = z.length - 1;
  for (let t = Math.max(0, ta - H); t < ta; t++) {
    const th = new Set(t > 0 ? z.slice(Math.max(0, t - H), t) : [z[0]]);
    if (th.has(z[t + 1])) continue;
    let ok = true; for (let s = t + 1; s <= ta; s++) if (th.has(z[s])) { ok = false; break; }
    if (ok) { const e = new Set(); for (let s = t; s < ta; s++) e.add(key(z[s], z[s + 1])); return [...e]; }
  }
  return [key(z[ta - 1], z[ta])];
}
function refrain(z, t) {
  const th = new Set(t > 0 ? z.slice(Math.max(0, t - H), t) : [z[0]]);
  if (th.has(z[t + 1])) return 0;
  for (let s = t + 2; s <= t + H; s++) if (th.has(z[s])) {
    const prev = new Set(); for (let u = Math.max(0, t - H); u < t; u++) prev.add(key(z[u], z[u + 1]));
    const exc = new Set(); for (let u = t; u < s; u++) exc.add(key(z[u], z[u + 1]));
    let n = 0; for (const e of exc) if (!prev.has(e)) n++;
    return n / 11;
  }
  return 0;
}
const zeroL = () => ({ V: Object.fromEntries(EDGES.map(e => [e, 0])), S: Object.fromEntries(EDGES.map(e => [e, 0])), D: Object.fromEntries(EDGES.map(e => [e, 0])) });

// An Amelia (or newborn / ablated Amelia) living on the place. Every step is recorded in `path` as [from, to];
// a displacement starts a new segment (recorded as null).
class Amelia {
  constructor(L, { wVf = 1, wHf = 1, stone = null, label, playback = true }) {
    this.pb = playback;
    this.L = JSON.parse(JSON.stringify(L)); for (const e of EDGES) for (const f of ['V', 'S', 'D']) this.L[f][e] ??= 0;
    this.wVf = wVf; this.wHf = wHf; this.stone = stone; this.gates = GATES.map(g => ({ ...g }));
    this.rand = rng(`playback|${label}`); this.tick = 0; this.path = []; this.deaths = 0; this.played = null; this.birth();
  }
  birth() {
    const L = this.L; this.r = new R(); this.r.qabbala.setGates(this.gates);
    this.r.exitBonus = (x, y) => { const e = key(x, y);
      return this.wVf * wV * (L.V[e] ?? 0) + this.wHf * wH * Math.tanh((L.S[e] ?? 0) + (L.D[e] ?? 0))
        + (this.stone ? W_STONE * Math.tanh(this.stone[e] ?? 0) : 0) + (this.played === y ? PLAYBACK : 0); };
    this.z = [this.r.getCurrentZone()]; this.i = 0;
  }
  block(edge) { for (const g of this.gates) if (`${g.source}>${g.target}` === edge) g.isOpen = false; this.r.qabbala.setGates(this.gates); }
  displace(zone) { this.r.importState({ currentZone: zone }); this.z = [zone]; this.i = 0; this.path.push(null); }
  get zone() { return this.z.at(-1); }
  playback(zone) {
    const u = this.rand(); if (!this.stone || !this.pb) return null;
    const ex = this.gates.filter(g => g.isOpen && g.source === zone), w = ex.map(g => this.stone[key(g.source, g.target)] ?? 0), s = w.reduce((x, y) => x + y, 0);
    if (s <= 0) return null; let v = u * s; for (let j = 0; j < ex.length; j++) { if (v < w[j]) return ex[j].target; v -= w[j]; } return ex.at(-1).target;
  }
  step() {
    const L = this.L; this.tick++;
    this.played = this.playback(this.zone);
    const from = this.zone, to = this.r.step(`${WORLD}|${K}|${START_TICK + this.tick}`).lastTransition.to;
    this.z.push(to); this.i++; this.path.push([from, to]);
    const e = key(from, to);
    if (this.stone && e in this.stone) this.stone[e] += ETCH;
    if (e in L.S) L.S[e] += a;
    for (const f of EDGES) { const v = L.S[f]; L.S[f] = v * (1 - lamS); L.D[f] = L.D[f] + kappa * v - lamD * L.D[f]; }
    if (to === 5) { for (const f of finalExcursion(this.z)) { L.S[f] += A; L.V[f] += eta * (-1 - L.V[f]); } this.deaths++; this.birth(); return [from, to]; }
    const t = this.i - H;
    if (t >= 0) { const ek = key(this.z[t], this.z[t + 1]); if (ek in L.V) L.V[ek] += eta * (refrain(this.z, t) - L.V[ek]); }
    if (this.z.length > 4 * H) { this.z = this.z.slice(-2 * H); this.i = this.z.length - 1; }
    if (this.tick % 1000 === 0) { const ev = this.r.getMemory().getEvents(); if (ev.length > 48) ev.splice(0, ev.length - 48); }
    return [from, to];
  }
}
// Her statistics: a walker drawn from her own warm-up transition counts over open exits (uniform where she never left)
class Walker {
  constructor(counts, label, stone = null) { this.counts = counts; this.rand = rng(`walker|${label}`); this.gates = GATES.map(g => ({ ...g }));
    this.cur = 0; this.path = []; this.deaths = 0; this.stone = stone; }
  block(edge) { for (const g of this.gates) if (`${g.source}>${g.target}` === edge) g.isOpen = false; }
  displace(zone) { this.cur = zone; this.path.push(null); }
  get zone() { return this.cur; }
  step() {
    const from = this.cur, ex = this.gates.filter(g => g.isOpen && g.source === from).map(g => g.target);
    let w = ex.map(t => this.counts[from][t]); if (w.reduce((x, y) => x + y, 0) === 0) w = ex.map(() => 1);
    const s = w.reduce((x, y) => x + y, 0); let v = this.rand() * s, to = ex.at(-1);
    for (let j = 0; j < ex.length; j++) { if (v < w[j]) { to = ex[j]; break; } v -= w[j]; }
    this.path.push([from, to]); if (this.stone && key(from, to) in this.stone) this.stone[key(from, to)] += ETCH;
    if (to === 5) { this.deaths++; this.cur = 0; } else this.cur = to;
    return [from, to];
  }
}
// Her statistics of order n: the next zone drawn from her warm-up counts given her last n zones (within a life),
// falling back to lower orders, then to her open exits
class WalkerN {
  constructor(path, order, label, stone = null) {
    this.order = order; this.rand = rng(`walker${order}|${label}`); this.gates = GATES.map(g => ({ ...g }));
    this.cur = 0; this.hist = [0]; this.path = []; this.deaths = 0; this.stone = stone;
    this.ctx = Array.from({ length: order + 1 }, () => new Map()); let h = [];
    for (const p of path) {
      if (p === null) { h = []; continue; }
      if (!h.length) h = [p[0]];
      for (let o = 1; o <= order; o++) if (h.length >= o) { const c = h.slice(-o).join(','); if (!this.ctx[o].has(c)) this.ctx[o].set(c, new Array(10).fill(0)); this.ctx[o].get(c)[p[1]]++; }
      if (p[1] === 5) h = []; else h.push(p[1]);
    }
  }
  block(edge) { for (const g of this.gates) if (`${g.source}>${g.target}` === edge) g.isOpen = false; }
  displace(zone) { this.cur = zone; this.hist = [zone]; this.path.push(null); }
  get zone() { return this.cur; }
  step() {
    const from = this.cur, ex = this.gates.filter(g => g.isOpen && g.source === from).map(g => g.target);
    let w = null;
    for (let o = this.order; o >= 1 && !w; o--) if (this.hist.length >= o) { const c = this.ctx[o].get(this.hist.slice(-o).join(','));
      if (c) { const ww = ex.map(t => c[t]); if (ww.reduce((x, y) => x + y, 0) > 0) w = ww; } }
    if (!w) w = ex.map(() => 1);
    const s = w.reduce((x, y) => x + y, 0); let v = this.rand() * s, to = ex.at(-1);
    for (let j = 0; j < ex.length; j++) { if (v < w[j]) { to = ex[j]; break; } v -= w[j]; }
    this.path.push([from, to]); if (this.stone && key(from, to) in this.stone) this.stone[key(from, to)] += ETCH;
    if (to === 5) { this.deaths++; this.cur = 0; this.hist = [0]; } else { this.cur = to; this.hist.push(to); if (this.hist.length > 8) this.hist = this.hist.slice(-4); }
    return [from, to];
  }
}
const visitsHome = path => { const v = new Array(10).fill(0), last = path.filter(Boolean).slice(-TRIAL); for (const [, t] of last) v[t]++;
  return new Set(v.map((c, z) => [c, z]).filter(([c]) => c >= 0.05 * last.length).map(([, z]) => z)); };
const countsOf = path => { const c = Array.from({ length: 10 }, () => new Array(10).fill(0)); for (const p of path) if (p) c[p[0]][p[1]]++; return c; };
const edgeSet = path => new Set(path.filter(Boolean).map(([f, t]) => key(f, t)));
const useOf = path => { const u = Object.fromEntries(EDGES.map(e => [e, 0])); for (const p of path) if (p && key(p[0], p[1]) in u) u[key(p[0], p[1])]++; return u; };

// Assay 1: 45 displacements, up to 240 ticks each
function homeostasis(x, home, experienced) {
  const trials = [];
  for (let rep = 0; rep < 5; rep++) for (const d of [0, 1, 2, 3, 4, 6, 7, 8, 9]) {
    x.displace(d); let run = 0, t = 0, back = null; const used = [];
    while (t < TRIAL) { const [, to] = x.step(); t++; used.push(key(x.path.at(-1)[0], to));
      run = home.has(to) ? run + 1 : 0; if (run >= AT_HOME) { back = t; break; } }
    trials.push({ from: d, back, novel: back !== null && used.some(e => !experienced.has(e)) });
  }
  const score = trials.reduce((s, q) => s + (q.back === null ? 0 : 1 - q.back / TRIAL), 0) / trials.length;
  const ok = trials.filter(q => q.back !== null);
  return { score, success: ok.length / trials.length, novelShare: ok.length ? ok.filter(q => q.novel).length / ok.length : 0, trials };
}
// Assay 2: barrier on her most-used home edge; recovery and delayed gratification
function distToHome(gates, home) {
  const d = new Array(10).fill(Infinity), q = []; for (const h of home) { d[h] = 0; q.push(h); }
  while (q.length) { const z = q.shift(); for (const g of gates) if (g.isOpen && g.target === z && d[g.source] === Infinity) { d[g.source] = d[z] + 1; q.push(g.source); } }
  return d;
}
function barrier(x, home, blocked) {
  x.block(blocked); const dist = distToHome(x.gates, home);
  let run = 0, recovered = null, exc = null; let excursions = 0, dg = 0;
  for (let t = 1; t <= BARRIER_T; t++) {
    const [, to] = x.step();
    run = home.has(to) ? run + 1 : 0; if (recovered === null && run >= AT_HOME) recovered = t;
    if (!home.has(to)) { exc ??= []; exc.push(dist[to]); }
    else if (exc) { excursions++; if (exc.some((v, j) => j > 0 && v > exc[j - 1])) dg++; exc = null; }
  }
  const dgRate = excursions ? dg / excursions : 0;
  return { recovered, recovery: recovered === null ? 0 : 1 - recovered / BARRIER_T, excursions, dgRate, score: (recovered === null ? 0 : 1 - recovered / BARRIER_T) + dgRate };
}
// Catalogue: simple cycles (length <= 6, self-loops included) completed >= 3 times within 240 ticks
function cycles(path) {
  const comp = new Map(); let seg = [], t = 0;
  const flush = () => { seg = []; };
  for (const p of path) {
    t++; if (p === null) { flush(); continue; }
    if (!seg.length) seg.push(p[0]); seg.push(p[1]);
    const n = seg.length - 1, z = seg[n];
    for (let L = 1; L <= 6 && n - L >= 0; L++) if (seg[n - L] === z) {
      const cyc = seg.slice(n - L, n); if (new Set(cyc).size !== cyc.length) break;
      let best = null; for (let r = 0; r < L; r++) { const rot = [...cyc.slice(r), ...cyc.slice(0, r)].join('-'); if (best === null || rot < best) best = rot; }
      if (!comp.has(best)) comp.set(best, []); comp.get(best).push(t); break;
    }
    if (seg.length > 64) seg = seg.slice(-16);
    if (p[1] === 5) flush();   // revision 2: death at 5 ends the life; the next life starts at 0, no cycle crosses it
  }
  const out = {};
  for (const [f, ts] of comp) { let ok = false; for (let i = 2; i < ts.length; i++) if (ts[i] - ts[i - 2] < TRIAL) { ok = true; break; } if (ok) out[f] = ts.length; }
  return out;
}
const scope = load();
const graph = GATES.map(g => ({ source: g.source, target: g.target, id: `g-${g.source}-${g.target}` }));
const coords = form => { const z = form.split('-').map(Number), p = []; for (let i = 0; i < 12; i++) p.push(...z); p.push(z[0]); return Object.keys(scanCounts(p, graph)); };
const written = form => {
  const z = form.split('-').map(Number), es = z.map((x, i) => [x, z[(i + 1) % z.length]]);
  if (z.length === 1) return 'self-loop';
  if (z.length === 2 && z[0] + z[1] === 9) return 'syzygy';
  if (es.every(([x, y]) => CANON.has(key(x, y)))) return 'original-graph';
  if (es.every(([x, y]) => currentOf(x) === y)) return 'currents';
  return null;
};

const state = JSON.parse(fs.readFileSync(STATES, 'utf8')).worlds[WORLD][k];
const out = { world: WORLD, lineage: k, assay1: {}, assay2: {}, assay3: {}, catalogue: {} };
const warm = x => { for (let t = 0; t < WARM; t++) x.step(); return x; };
// her warm-up defines her home, experienced edges and the statistics walker
const her = warm(new Amelia(state, { label: 'her-a1' }));
const herHome = visitsHome(her.path), herExp = edgeSet(her.path), herCounts = countsOf(her.path), herWarmPath = her.path.slice();
out.home = [...herHome].sort(); out.herWarmDeaths = her.deaths;
const constructs = {
  her: () => her,
  stats: () => new Walker(herCounts, 'a1'),
  newborn: () => warm(new Amelia(zeroL(), { label: 'newborn-a1' })),
  noLearner: () => warm(new Amelia(state, { wVf: 0, label: 'nol-a1' })),
  noHouse: () => warm(new Amelia(state, { wHf: 0, label: 'noh-a1' })),
};
const amPaths = [her], stPaths = [];
for (const [name, mk] of Object.entries(constructs)) {
  const x = mk(), own = x instanceof Walker ? [herHome, herExp] : [visitsHome(x.path), edgeSet(x.path)];
  const res = homeostasis(x, own[0], own[1]); delete res.trials; out.assay1[name] = { ...res, home: [...own[0]].sort() };
  if (name === 'stats') stPaths.push(x);
}
// assay 2: fresh lives from the same states
const homeEdge = path => { const u = {}; for (const p of path.filter(Boolean).slice(-TRIAL)) if (herHome.has(p[0]) && herHome.has(p[1])) { const e = key(p[0], p[1]); u[e] = (u[e] || 0) + 1; } return Object.entries(u).sort((x, y) => y[1] - x[1])[0]?.[0] ?? null; };
const her2 = warm(new Amelia(state, { label: 'her-a2' })), blocked = homeEdge(her2.path);
out.blocked = blocked;
if (blocked) {
  const make2 = { her: () => her2, stats: () => new Walker(herCounts, 'a2'), newborn: () => warm(new Amelia(zeroL(), { label: 'newborn-a2' })),
    noLearner: () => warm(new Amelia(state, { wVf: 0, label: 'nol-a2' })), noHouse: () => warm(new Amelia(state, { wHf: 0, label: 'noh-a2' })) };
  for (const [name, mk] of Object.entries(make2)) {
    const x = mk(); if (x instanceof Walker) { for (let t = 0; t < 1; t++) x.displace(her2.zone); }
    const home = x instanceof Walker || name === 'her' ? herHome : visitsHome(x.path);
    out.assay2[name] = barrier(x, home, blocked); if (name === 'her') amPaths.push(x); if (name === 'stats') stPaths.push(x);
  }
}
// assay 3: replication through the place
function lineage(gen0, playback = true) {
  const stone = gen0.stone, forms = [useOf(gen0.path)], lives = [gen0];
  for (let g = 1; g <= GENS; g++) { const nb = new Amelia(zeroL(), { stone, playback, label: `gen${g}|${gen0 instanceof Walker ? 'w' : 'a'}${playback ? '' : '|np'}` });
    for (let t = 0; t < GEN_T; t++) nb.step(); forms.push(useOf(nb.path)); lives.push(nb); }
  return { forms, lives };
}
const blank = () => Object.fromEntries(EDGES.map(e => [e, 0]));
const g0 = new Amelia(state, { stone: blank(), label: 'gen0' }); for (let t = 0; t < GEN_T; t++) g0.step();
const w0 = new Walker(herCounts, 'a3', blank()); for (let t = 0; t < GEN_T; t++) w0.step();
const L1 = lineage(g0), L2 = lineage(w0);
// control (revision 1): a newborn with no stone at all; newborns are deterministic from birth, so one life stands for every generation
const nb0 = new Amelia(zeroL(), { label: 'nostone' }); for (let t = 0; t < GEN_T; t++) nb0.step();
out.assay3 = { herForms: L1.forms, statsForms: L2.forms, noStoneForm: useOf(nb0.path), herDeaths: L1.lives.map(x => x.deaths) };
for (const x of L1.lives) amPaths.push(x); stPaths.push(w0);
// catalogue
if (ARM === 'full') {
  // assay 3 without playback: only the exit bonus and the etching remain
  const g0np = new Amelia(state, { stone: blank(), playback: false, label: 'gen0np' }); for (let t = 0; t < GEN_T; t++) g0np.step();
  const w0np = new Walker(herCounts, 'a3np', blank()); for (let t = 0; t < GEN_T; t++) w0np.step();
  const N1 = lineage(g0np, false), N2 = lineage(w0np, false);
  out.assay3np = { herForms: N1.forms, statsForms: N2.forms, noStoneForm: out.assay3.noStoneForm };
}
const tally = xs => { const c = {}; let ticks = 0; for (const x of xs) { ticks += x.path.length; for (const [f, n] of Object.entries(cycles(x.path))) c[f] = (c[f] || 0) + n; } return { c, ticks }; };
const A1 = tally(amPaths), S1 = tally(stPaths);
out.catalogue = { her: A1.c, herTicks: A1.ticks, stats: S1.c, statsTicks: S1.ticks,
  gen5Dominant: (() => { const c = cycles(L1.lives.at(-1).path); return Object.entries(c).sort((x, y) => y[1] - x[1])[0]?.[0] ?? null; })(),
  gen0Dominant: (() => { const c = cycles(L1.lives[0].path); return Object.entries(c).sort((x, y) => y[1] - x[1])[0]?.[0] ?? null; })() };
out.catalogue.herCore = (() => { const t = tally([her, ...(blocked ? amPaths.slice(1, 2) : []), g0]); return { c: t.c, ticks: t.ticks }; })();
out.arm = ARM; out.removed = REMOVED;
if (ARM === 'full') for (const order of [2, 3]) {
  // the same assays as the order-1 walker: 45 displacements, the barrier, 5,000 steps of generation 0
  const xs = [], w1 = new WalkerN(herWarmPath, order, 'a1'); homeostasis(w1, herHome, herExp); xs.push(w1);
  if (blocked) { const w2 = new WalkerN(herWarmPath, order, 'a2'); w2.displace(her2.zone); barrier(w2, herHome, blocked); xs.push(w2); }
  const w3 = new WalkerN(herWarmPath, order, 'a3', blank()); for (let t = 0; t < GEN_T; t++) w3.step(); xs.push(w3);
  const T = tally(xs); out.catalogue[`stats${order}`] = T.c; out.catalogue[`stats${order}Ticks`] = T.ticks;
}
out.forms = Object.fromEntries([...new Set([...Object.keys(A1.c), ...Object.keys(S1.c)])].map(f => [f, { written: written(f), coords: coords(f) }]));
fs.writeFileSync(OUT, JSON.stringify(out) + '\n');
console.log(JSON.stringify({ world: WORLD, lineage: k, home: out.home, blocked, a1: Object.fromEntries(Object.entries(out.assay1).map(([n, v]) => [n, +v.score.toFixed(3)])),
  a2: Object.fromEntries(Object.entries(out.assay2).map(([n, v]) => [n, +v.score.toFixed(3)])) }));
