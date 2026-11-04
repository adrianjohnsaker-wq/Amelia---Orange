// ANTENNA II traveller (see REGISTRATION.md). Amelia (POINTER III learner) on her full CCRU Numogram, with
//  - a sensitive receiver: the datum's zone c pulls each open exit y by beta * rel(y, c), where rel follows the
//    Numogram's own relations: y = c (1.0), y = syzygy of c (0.6), y = current of c (0.4), y = gate of c (0.3);
//  - the Warp as accelerator: every tick in the Warp {3, 6} adds 1 to her intensity I; receptivity is (1 + I / THETA);
//    when I reaches THETA and the datum names a zone outside the Warp she takes a line of flight there (I resets);
//  - creation: each flight lays down (or reinforces) a Warp-born gate from her Warp zone to where she landed. It is a
//    real gate of her Numogram, biased by her learned weight W, which decays when unused; a faded gate is removed.
// One season over one stream, then the same season over SHUFFLES order-shuffles of that stream (same zones, order
// destroyed). Output: per run, detection counts per entity (PF-1 scanner) and per Warp-born gate (flights).
//
//   node traveller2.mjs <runtimeDir> <start_states.json> <stream.json> <world> <lineage> <beta> <shuffles> <label> <out.json>
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { load } from '../pf1/PF1_A1_R2_SCORER.mjs';
import { scanCounts } from '../antenna/scan.mjs';
import { CANONICAL_GATES } from '../studio/runtime_mirror/ai/numogram/AmeliaQabbalaInterface.ts';
import { fullNumogramGates } from '../numogram/CCRUNumogram.ts';

const [M, STATES, STREAM, WORLD, K, BETA, SHUFFLES, LABEL, OUT] = process.argv.slice(2);
const { AmeliaNumogramSubstrateRuntime: R } = await import(`${M}/substrate/ameliaNumogramSubstrateRuntime.ts`);
const beta = Number(BETA), S = Number(SHUFFLES);
const ZONES = JSON.parse(fs.readFileSync(STREAM, 'utf8')).zones;
const droot = c => (c === 0 ? 0 : 1 + ((c - 1) % 9));
const syz = c => 9 - c, cur = c => Math.abs(2 * c - 9), gate = c => droot((c * (c + 1)) / 2);
const rel = (y, c) => Math.max(y === c ? 1 : 0, y === syz(c) ? 0.6 : 0, y === cur(c) ? 0.4 : 0, y === gate(c) ? 0.3 : 0);
const WARP = new Set([3, 6]);
// fixed constants (registered): learner as POINTER III / THE ANTENNA; Warp threshold = the learner's horizon H
const a = 0.01, A = 1, wV = 0.5, wH = 0.35, lamS = 0.002, kappa = 0.0005, lamD = 0.00005, H = 24, eta = 1 / 8;
const THETA = H, GAMMA = 1, wB = 0.5, lamW = 0.002, W_MIN = 0.01, FORCE = 1000;
const BASE = fullNumogramGates(CANONICAL_GATES);
const mean = f => CANONICAL_GATES.reduce((x, g) => x + g[f], 0) / CANONICAL_GATES.length;
const key = (x, y) => `${x}>${y}`, sha = s => createHash('sha256').update(s).digest('hex');
const BASE_EDGES = BASE.map(g => key(g.source, g.target));

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

function travel(state, zones) {
  const L = JSON.parse(JSON.stringify(state)); L.W = {};
  const edges = new Set(BASE_EDGES);
  for (const e of edges) for (const f of ['V', 'S', 'D']) L[f][e] ??= 0;
  const born = new Map();                         // Warp-born gate key -> flights that laid or reinforced it
  let r, z, i, life, c = null, force = null, I = 0, flights = 0, deaths = 0, warpTicks = 0;
  const lives = [];
  const addGate = (s, t) => {
    const e = key(s, t);
    if (!r.qabbala.getGates().some(g => g.source === s && g.target === t))
      r.qabbala.getGates().push({ id: `warpborn-${s}-${t}`, source: s, target: t, label: `Warp-born ${s}->${t}`,
        flux: mean('flux'), permeability: mean('permeability'), isOpen: true, resistance: mean('resistance') });
    if (!edges.has(e)) { edges.add(e); for (const f of ['V', 'S', 'D']) L[f][e] ??= 0; }
  };
  const birth = () => {
    r = new R(); r.qabbala.setGates(BASE);
    for (const e of Object.keys(L.W)) { const [s, t] = e.split('>').map(Number); addGate(s, t); }
    r.exitBonus = (x, y) => {
      const e = key(x, y);
      if (force !== null) return y === force ? FORCE : 0;
      const recept = WARP.has(x) ? 1 + Math.min(I, THETA) / THETA : 1;
      return wV * (L.V[e] ?? 0) + wH * Math.tanh((L.S[e] ?? 0) + (L.D[e] ?? 0)) + wB * (L.W[e] ?? 0)
        + (c === null ? 0 : beta * recept * rel(y, c));
    };
    z = [r.getCurrentZone()]; i = 0; life = [z[0]]; lives.push(life); I = 0;
  };
  birth();
  for (let n = 0; n < zones.length; n++) {
    c = zones[n];
    const from = z.at(-1);
    force = null;
    if (WARP.has(from) && I >= THETA && !WARP.has(c)) { addGate(from, c); force = c; }   // line of flight
    const to = r.step().lastTransition.to; z.push(to); i++; life.push(to);
    const e = key(from, to);
    if (force !== null) {
      flights++; I = 0; L.W[e] = (L.W[e] ?? 0) + GAMMA; born.set(e, (born.get(e) ?? 0) + 1);
    } else if (WARP.has(to)) { I += 1; warpTicks++; } else { I = 0; }
    if (e in L.S) L.S[e] += a;
    for (const f of edges) { const v = L.S[f]; L.S[f] = v * (1 - lamS); L.D[f] = L.D[f] + kappa * v - lamD * L.D[f]; }
    for (const w of Object.keys(L.W)) {
      L.W[w] *= 1 - lamW;
      if (L.W[w] < W_MIN) {                         // a faded Warp-born gate is removed (never a base gate)
        delete L.W[w];
        if (!BASE_EDGES.includes(w)) { const [s, t] = w.split('>').map(Number); const G = r.qabbala.getGates();
          const j = G.findIndex(g => g.source === s && g.target === t && String(g.id).startsWith('warpborn-')); if (j >= 0) G.splice(j, 1); }
      }
    }
    if (to === 5) {
      deaths++;
      for (const f of finalExcursion(z)) { L.S[f] = (L.S[f] ?? 0) + A; L.V[f] = (L.V[f] ?? 0) + eta * (-1 - (L.V[f] ?? 0)); }
      birth(); continue;
    }
    const t = i - H;
    if (t >= 0) { const ek = key(z[t], z[t + 1]); if (ek in L.V) L.V[ek] += eta * (refrain(z, t) - L.V[ek]); }
    if (z.length > 4 * H) { z = z.slice(-2 * H); i = z.length - 1; }
    if (n % 1000 === 0) { const ev = r.getMemory().getEvents(); if (ev.length > 48) ev.splice(0, ev.length - 48); }
  }
  return { lives, flights, deaths, warpTicks, born: Object.fromEntries(born) };
}

function shuffled(zones, label) {                  // Fisher-Yates, mulberry32 seeded from SHA-256 of the label
  let st = parseInt(sha(`ANTENNA2-SHUFFLE|${label}`).slice(0, 8), 16) >>> 0;
  const rand = () => { st = (st + 0x6D2B79F5) >>> 0; let x = st; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  const s = zones.slice();
  for (let j = s.length - 1; j > 0; j--) { const q = Math.floor(rand() * (j + 1)); [s[j], s[q]] = [s[q], s[j]]; }
  return s;
}

const scope = load();
const graph = [...scope.graph];
for (const g of BASE) if (!graph.some(e => e.source === g.source && e.target === g.target)) graph.push({ source: g.source, target: g.target, id: `g-${g.source}-${g.target}` });
for (const s of WARP) for (let t = 0; t <= 9; t++) if (!graph.some(e => e.source === s && e.target === t)) graph.push({ source: s, target: t, id: `wb-${s}-${t}` });
const scan = lives => { const out = {}; for (const l of lives) for (const [kk, v] of Object.entries(scanCounts(l, graph))) out[kk] = (out[kk] || 0) + v; return out; };

const state = JSON.parse(fs.readFileSync(STATES, 'utf8')).worlds[WORLD][Number(K)];
const runs = [];
for (let j = 0; j <= S; j++) {
  const zs = j === 0 ? ZONES : shuffled(ZONES, `${LABEL}|${WORLD}|${K}|${j}`);
  const res = travel(state, zs);
  runs.push({ shuffle: j, counts: scan(res.lives), born: res.born, flights: res.flights, deaths: res.deaths, warpTicks: res.warpTicks });
}
fs.writeFileSync(OUT, JSON.stringify({ world: WORLD, lineage: Number(K), beta, shuffles: S, label: LABEL, n: ZONES.length, runs }));
