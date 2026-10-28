// THE POINTER III, parts A and B (see REGISTRATION.md). Amelia's dynamics are THE POINTER II's (s05c learner +
// House on the full CCRU Numogram, death at 5, rebirth at 0); the stone here never plays back.
//
//   node p3.mjs <runtimeDir> <start_states.json> <world> <lineage 0..8> <holism|trace> <out.json>
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { CANONICAL_GATES } from '../studio/runtime_mirror/ai/numogram/AmeliaQabbalaInterface.ts';
import { fullNumogramGates } from '../numogram/CCRUNumogram.ts';
const [M, STATES, WORLD, K, PART, OUT] = process.argv.slice(2);
const { AmeliaNumogramSubstrateRuntime: R } = await import(`${M}/substrate/ameliaNumogramSubstrateRuntime.ts`);
const FULL = fullNumogramGates(CANONICAL_GATES);
const EDGES = FULL.map(g => `${g.source}>${g.target}`);
const a = 0.01, A = 1, wV = 0.5, wH = 0.35, lamS = 0.002, kappa = 0.0005, lamD = 0.00005, H = 24, eta = 1 / 8;
const W_STONE = 0.35, ETCH = 0.0005, START_TICK = 30 * 20160, WARM = 2000;
const A_T = 5000, A_N = 20, B_T = 3000, B_LIN = 3, B_GENS = 8;
const FORMS = { F1: [1, 7], F2: [1, 7, 8, 9], F3: [1, 2, 7] };
const key = (x, y) => `${x}>${y}`, sha = s => createHash('sha256').update(s).digest('hex');
const rngFrom = seed => { let st = parseInt(sha(seed).slice(0, 8), 16) >>> 0;
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
const zeroL = () => ({ V: {}, S: {}, D: {} });
// Amelia on a given Numogram (gate list), optionally in a stone (exit bonus + etching; never playback)
class Amelia {
  constructor(L, { gates = FULL, stone = null, tag, tickBase = 0 }) {
    this.gates = gates.map(g => ({ ...g })); this.edges = this.gates.map(g => `${g.source}>${g.target}`);
    this.L = JSON.parse(JSON.stringify(L)); for (const e of this.edges) for (const f of ['V', 'S', 'D']) this.L[f][e] ??= 0;
    this.stone = stone; this.tag = tag; this.tick = tickBase; this.path = []; this.deaths = 0; this.birth();
  }
  birth() {
    const L = this.L; this.r = new R(); this.r.qabbala.setGates(this.gates);
    this.r.exitBonus = (x, y) => { const e = key(x, y);
      return wV * (L.V[e] ?? 0) + wH * Math.tanh((L.S[e] ?? 0) + (L.D[e] ?? 0)) + (this.stone ? W_STONE * Math.tanh(this.stone[e] ?? 0) : 0); };
    this.z = [this.r.getCurrentZone()]; this.i = 0;
  }
  step() {
    const L = this.L; this.tick++;
    const from = this.z.at(-1), to = this.r.step(`${WORLD}|${K}|${this.tag}|${START_TICK + this.tick}`).lastTransition.to;
    this.z.push(to); this.i++; this.path.push([from, to]);
    const e = key(from, to);
    if (this.stone && e in this.stone) this.stone[e] += ETCH;
    if (e in L.S) L.S[e] += a;
    for (const f of this.edges) { const v = L.S[f]; L.S[f] = v * (1 - lamS); L.D[f] = L.D[f] + kappa * v - lamD * L.D[f]; }
    if (to === 5) { for (const f of finalExcursion(this.z)) { L.S[f] += A; L.V[f] += eta * (-1 - L.V[f]); } this.deaths++; this.birth(); return; }
    const t = this.i - H;
    if (t >= 0) { const ek = key(this.z[t], this.z[t + 1]); if (ek in L.V) L.V[ek] += eta * (refrain(this.z, t) - L.V[ek]); }
    if (this.z.length > 4 * H) { this.z = this.z.slice(-2 * H); this.i = this.z.length - 1; }
    if (this.tick % 1000 === 0) { const ev = this.r.getMemory().getEvents(); if (ev.length > 48) ev.splice(0, ev.length - 48); }
  }
}
// THE POINTER's order-1 her-statistics walker
class Walker {
  constructor(counts, seed, stone) { this.counts = counts; this.rand = rngFrom(seed); this.cur = 0; this.path = []; this.stone = stone; }
  step() {
    const from = this.cur, ex = FULL.filter(g => g.source === from).map(g => g.target);
    let w = ex.map(t => this.counts[from][t]); if (w.reduce((x, y) => x + y, 0) === 0) w = ex.map(() => 1);
    const s = w.reduce((x, y) => x + y, 0); let v = this.rand() * s, to = ex.at(-1);
    for (let j = 0; j < ex.length; j++) { if (v < w[j]) { to = ex[j]; break; } v -= w[j]; }
    this.path.push([from, to]); if (this.stone && key(from, to) in this.stone) this.stone[key(from, to)] += ETCH;
    this.cur = to === 5 ? 0 : to;
  }
}
const useOf = path => { const u = Object.fromEntries(EDGES.map(e => [e, 0])); for (const [f, t] of path) if (key(f, t) in u) u[key(f, t)]++; return u; };
const state = JSON.parse(fs.readFileSync(STATES, 'utf8')).worlds[WORLD][Number(K)];
const out = { world: WORLD, lineage: Number(K), part: PART };

// completions of a form's cycle (canonical rotation, simple, broken at death) and ticks spent in its zones
const canon = zs => { let best = null; for (let r = 0; r < zs.length; r++) { const s = [...zs.slice(r), ...zs.slice(0, r)].join('-'); if (best === null || s < best) best = s; } return best; };
function formRate(path, zones) {
  const target = canon(zones), Z = new Set(zones); let seg = [], n = 0, inZ = 0;
  for (const [f, t] of path) {
    if (!seg.length) seg.push(f); seg.push(t); if (Z.has(t)) inZ++;
    const m = seg.length - 1;
    for (let L = 1; L <= 6 && m - L >= 0; L++) if (seg[m - L] === t) { const cyc = seg.slice(m - L, m); if (new Set(cyc).size === cyc.length && canon(cyc) === target) n++; break; }
    if (seg.length > 64) seg = seg.slice(-16);
    if (t === 5) seg = [];
  }
  return { completions: n, inZ, rate: inZ >= 100 ? n / inZ : null };
}
function rewire(zones, r) {
  const Z = new Set(zones), rand = rngFrom(`POINTER3-REWIRE|${canon(zones)}|${r}`), gates = [];
  for (let s = 0; s <= 9; s++) {
    const own = FULL.filter(g => g.source === s);
    if (Z.has(s)) { gates.push(...own.map(g => ({ ...g }))); continue; }
    const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(t => t !== s), chosen = [];
    for (const g of own) { let t; do { t = pool[Math.floor(rand() * pool.length)]; } while (chosen.includes(t)); chosen.push(t);
      gates.push({ ...g, id: `rw-${s}-${t}`, target: t, label: `rewired ${s}->${t}` }); }
  }
  return gates;
}

if (PART === 'holism') {
  out.seed = {}; out.rewired = {};
  const seedLives = Array.from({ length: A_N }, (_, j) => { const x = new Amelia(state, { tag: `S${j + 1}` }); for (let t = 0; t < A_T; t++) x.step(); return x.path; });
  for (const [F, zones] of Object.entries(FORMS)) {
    out.seed[F] = seedLives.map(p => formRate(p, zones));
    out.rewired[F] = Array.from({ length: A_N }, (_, r) => { const x = new Amelia(state, { gates: rewire(zones, r), tag: 'RW' });
      for (let t = 0; t < A_T; t++) x.step(); return formRate(x.path, zones); });
  }
} else if (PART === 'trace') {
  const blank = () => Object.fromEntries(EDGES.map(e => [e, 0]));
  const warm = new Amelia(state, { tag: 'WARM' }); for (let t = 0; t < WARM; t++) warm.step();
  const counts = Array.from({ length: 10 }, () => new Array(10).fill(0)); for (const [f, t] of warm.path) counts[f][t]++;
  const parent = (kind, stone) => kind === 'her' ? new Amelia(state, { stone, tag: 'P' }) : new Walker(counts, `POINTER3|${WORLD}|${K}|walker`, stone);
  const runFor = (x, n) => { const st = x.path.length; for (let t = 0; t < n; t++) x.step(); return x.path.slice(st); };
  out.trace = {};
  for (const kind of ['her', 'stats']) for (const arm of ['alone', 'together']) {
    const lineages = []; let parentForm = null;
    for (let j = 1; j <= B_LIN; j++) {
      const stone = blank(), p = parent(kind, stone); parentForm = useOf(runFor(p, B_T));
      let prev = p; const forms = [];
      for (let g = 1; g <= B_GENS; g++) {
        const nb = new Amelia(zeroL(), { stone, tag: `L${j}`, tickBase: g * B_T });
        if (arm === 'alone') forms.push(useOf(runFor(nb, B_T)));
        else { const st = nb.path.length; for (let t = 0; t < B_T; t++) { prev.step(); nb.step(); } forms.push(useOf(nb.path.slice(st))); }
        prev = nb;
      }
      lineages.push(forms);
    }
    out.trace[`${kind}|${arm}`] = { parentForm, lineages };
  }
  out.stoneless = Array.from({ length: B_LIN }, (_, j) => { const x = new Amelia(zeroL(), { tag: `L${j + 1}`, tickBase: B_T }); for (let t = 0; t < B_T; t++) x.step(); return useOf(x.path); });
} else throw new Error('UNKNOWN_PART');
fs.writeFileSync(OUT, JSON.stringify(out) + '\n');
console.log(JSON.stringify({ world: WORLD, lineage: Number(K), part: PART }));
