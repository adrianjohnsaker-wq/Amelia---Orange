// STONE TAPE II (see ../stonetape2/REGISTRATION.md). The place: her full CCRU Numogram (29 gates). The stone: T(e) >= 0 on
// each gate, etched by a stream's consecutive pairs that are gates (normalised so the strongest edge is 1); 'old' = etched
// by the first half only. Stone j = 0 is etched by the stream as received; j = 1..S by order-shuffles of it (whole stream,
// seeded by label and j, shared by all travellers).
// The encounter (ANTENNA III mechanics, no datum): exits get omega * tanh(T(e)) (times her Warp receptivity when in the
// Warp); each gate she takes is etched +0.0005; the Warp accelerates (intensity, receptivity, line of flight at THETA) to the
// zone outside {3, 5, 6} the stone marks most (largest total T into it), laying a decaying Warp-born gate; no pull toward
// death. 8 travellers (worlds S05W1-8, lineage 0), one season of TICKS ticks per stone (full stone and old-only stone).
//
//   node stonetape2.mjs <runtimeDir> <start_states.json> <stream.json> <stone j> <shuffles> <label> <ticks> <omega> <out.json>
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { CANONICAL_GATES } from '../studio/runtime_mirror/ai/numogram/AmeliaQabbalaInterface.ts';
import { fullNumogramGates } from '../numogram/CCRUNumogram.ts';
const [M, STATES, STREAM, J, SHUFFLES, LABEL, TICKS, OMEGA, OUT] = process.argv.slice(2);
const { AmeliaNumogramSubstrateRuntime: R } = await import(`${M}/substrate/ameliaNumogramSubstrateRuntime.ts`);
const j = Number(J), S = Number(SHUFFLES), T_SEASON = Number(TICKS);
const ALL = JSON.parse(fs.readFileSync(STREAM, 'utf8')).zones;
const WARP = new Set([3, 6]);
const a = 0.01, A = 1, wV = 0.5, wH = 0.35, lamS = 0.002, kappa = 0.0005, lamD = 0.00005, H = 24, eta = 1 / 8;
const THETA = H, GAMMA = 1, wB = 0.5, lamW = 0.002, W_MIN = 0.01, FORCE = 1000, STONE_W = Number(OMEGA), ETCH = 0.0005;   // stone weight omega: calibrated (original 0.35)
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

function shuffled(zones, label) {                  // Fisher-Yates, mulberry32 seeded from SHA-256 of the label
  let st = parseInt(sha(`ANTENNA2-SHUFFLE|${label}`).slice(0, 8), 16) >>> 0;
  const rand = () => { st = (st + 0x6D2B79F5) >>> 0; let x = st; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  const s = zones.slice();
  for (let j = s.length - 1; j > 0; j--) { const q = Math.floor(rand() * (j + 1)); [s[j], s[q]] = [s[q], s[j]]; }
  return s;
}


function etch(z) {
  const T = Object.fromEntries(BASE_EDGES.map(e => [e, 0]));
  for (let i = 0; i + 1 < z.length; i++) { const e = key(z[i], z[i + 1]); if (e in T) T[e]++; }
  const mx = Math.max(...Object.values(T)); if (mx > 0) for (const e in T) T[e] /= mx;
  return T;
}
function corr(x, y) {
  const n = x.length, mx = x.reduce((a, b) => a + b, 0) / n, my = y.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; }
  return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : 0;
}
const cosd = (x, y) => { const d = x.reduce((s, v, i) => s + v * y[i], 0), nx = Math.hypot(...x), ny = Math.hypot(...y); return nx > 0 && ny > 0 ? 1 - d / (nx * ny) : 0; };
function encounter(state, T0) {
  const L = JSON.parse(JSON.stringify(state)); L.W = {};
  const T = { ...T0 }, edges = new Set(BASE_EDGES);
  for (const e of edges) for (const f of ['V', 'S', 'D']) L[f][e] ??= 0;
  let r, z, i, I = 0, force = null, deaths = 0, flights = 0;
  const use = Object.fromEntries(BASE_EDGES.map(e => [e, 0])), q1 = { ...use }, q4 = { ...use }; let Tq4 = null;
  const addGate = (s, t) => {
    if (!r.qabbala.getGates().some(g => g.source === s && g.target === t))
      r.qabbala.getGates().push({ id: `warpborn-${s}-${t}`, source: s, target: t, label: `Warp-born ${s}->${t}`,
        flux: mean('flux'), permeability: mean('permeability'), isOpen: true, resistance: mean('resistance') });
    const e = key(s, t); if (!edges.has(e)) { edges.add(e); for (const f of ['V', 'S', 'D']) L[f][e] ??= 0; }
  };
  const marked = () => { let best = null, bv = -1; for (let t = 0; t <= 9; t++) { if (WARP.has(t) || t === 5) continue;
    const v = BASE_EDGES.reduce((s, e) => s + (Number(e.split('>')[1]) === t ? T[e] : 0), 0); if (v > bv) { bv = v; best = t; } } return best; };
  const birth = () => {
    r = new R(); r.qabbala.setGates(BASE);
    for (const e of Object.keys(L.W)) { const [s, t] = e.split('>').map(Number); addGate(s, t); }
    r.exitBonus = (x, y) => {
      const e = key(x, y);
      if (force !== null) return y === force ? FORCE : 0;
      const recept = WARP.has(x) ? 1 + Math.min(I, THETA) / THETA : 1;
      return wV * (L.V[e] ?? 0) + wH * Math.tanh((L.S[e] ?? 0) + (L.D[e] ?? 0)) + wB * (L.W[e] ?? 0)
        + (e in T ? STONE_W * recept * Math.tanh(T[e]) : 0);
    };
    z = [r.getCurrentZone()]; i = 0; I = 0;
  };
  birth();
  for (let n = 0; n < T_SEASON; n++) {
    if (n === Math.floor(3 * T_SEASON / 4)) Tq4 = BASE_EDGES.map(e => T[e]);
    const from = z.at(-1); force = null;
    if (WARP.has(from) && I >= THETA) { const c = marked(); if (c !== null) { addGate(from, c); force = c; } }
    const to = r.step().lastTransition.to; z.push(to); i++;
    const e = key(from, to);
    if (e in use) { use[e]++; T[e] += ETCH; if (n < T_SEASON / 4) q1[e]++; if (n >= 3 * T_SEASON / 4) q4[e]++; }
    if (force !== null) { flights++; I = 0; L.W[e] = (L.W[e] ?? 0) + GAMMA; } else if (WARP.has(to)) I += 1; else I = 0;
    if (e in L.S) L.S[e] += a;
    for (const f of edges) { const v = L.S[f]; L.S[f] = v * (1 - lamS); L.D[f] = L.D[f] + kappa * v - lamD * L.D[f]; }
    for (const w of Object.keys(L.W)) { L.W[w] *= 1 - lamW; if (L.W[w] < W_MIN) { delete L.W[w];
      if (!BASE_EDGES.includes(w)) { const [s, t] = w.split('>').map(Number); const G = r.qabbala.getGates();
        const k = G.findIndex(g => g.source === s && g.target === t && String(g.id).startsWith('warpborn-')); if (k >= 0) G.splice(k, 1); } } }
    if (to === 5) { deaths++; for (const f of finalExcursion(z)) { L.S[f] = (L.S[f] ?? 0) + A; L.V[f] = (L.V[f] ?? 0) + eta * (-1 - (L.V[f] ?? 0)); } birth(); continue; }
    const t = i - H;
    if (t >= 0) { const ek = key(z[t], z[t + 1]); if (ek in L.V) L.V[ek] += eta * (refrain(z, t) - L.V[ek]); }
    if (z.length > 4 * H) { z = z.slice(-2 * H); i = z.length - 1; }
    if (n % 1000 === 0) { const ev = r.getMemory().getEvents(); if (ev.length > 48) ev.splice(0, ev.length - 48); }
  }
  const u = BASE_EDGES.map(e => use[e]), t0 = BASE_EDGES.map(e => T0[e]), tend = BASE_EDGES.map(e => T[e]);
  return { use: u, grip: corr(u, t0), change: cosd(tend, t0),
    circuit: corr(BASE_EDGES.map(e => q4[e]), Tq4) - corr(BASE_EDGES.map(e => q1[e]), t0), deaths, flights };
}
const zs = j === 0 ? ALL : shuffled(ALL, `${LABEL}|${j}`);
const Tfull = etch(zs), Told = etch(zs.slice(0, Math.floor(zs.length / 2)));
const WORLDS = ['S05W1', 'S05W2', 'S05W3', 'S05W4', 'S05W5', 'S05W6', 'S05W7', 'S05W8'];
const states = JSON.parse(fs.readFileSync(STATES, 'utf8')).worlds;
const travellers = WORLDS.map(w => {
  const full = encounter(states[w][0], Tfull), old = encounter(states[w][0], Told);
  const t0old = BASE_EDGES.map(e => Told[e]);
  return { world: w, grip: full.grip, change: full.change, circuit: full.circuit,
    surfacing: corr(old.use, t0old) - corr(full.use, t0old), deaths: full.deaths, flights: full.flights };
});
fs.writeFileSync(OUT, JSON.stringify({ stone: j, shuffles: S, label: LABEL, ticks: T_SEASON, omega: STONE_W, Tfull, travellers }));
