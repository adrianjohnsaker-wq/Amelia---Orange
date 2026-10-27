// THE STONE TAPE (A) (see REGISTRATION.md). Her full CCRU Numogram is the place; a stone on its 29 edges holds
// the world's transitions (THE ANTENNA's zones); she lives one season in it with no input, the stone acting on
// her exits and her passage etching the stone. Dynamics otherwise THE ANTENNA's `full` arm (../antenna/antenna.mjs).
//
//   node stonetape.mjs <runtimeDir> <start_states.json> <inputs.json> <world> <lineage 0..8> <out.json>
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { load } from '../pf1/PF1_A1_R2_SCORER.mjs';
import { scanCounts } from '../antenna/scan.mjs';
import { CANONICAL_GATES } from '../studio/runtime_mirror/ai/numogram/AmeliaQabbalaInterface.ts';
import { fullNumogramGates } from '../numogram/CCRUNumogram.ts';
const [M, STATES, INPUTS, WORLD, K, OUT] = process.argv.slice(2);
const { AmeliaNumogramSubstrateRuntime: R } = await import(`${M}/substrate/ameliaNumogramSubstrateRuntime.ts`);
const GATES = fullNumogramGates(CANONICAL_GATES);
const EDGES = GATES.map(g => `${g.source}>${g.target}`);
const a = 0.01, A = 1, wV = 0.5, wH = 0.35, lamS = 0.002, kappa = 0.0005, lamD = 0.00005, H = 24, eta = 1 / 8;
const T = 20160, W_STONE = 0.35, PLAYBACK = 0.35, ETCH = 0.0005;
const key = (x, y) => `${x}>${y}`, sha = s => createHash('sha256').update(s).digest('hex');
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
// etching: every consecutive pair of the sequence that is an edge of the place; normalised so the strongest edge is 1
export function etch(zs) {
  const c = Object.fromEntries(EDGES.map(e => [e, 0]));
  for (let i = 0; i + 1 < zs.length; i++) { const e = key(zs[i], zs[i + 1]); if (e in c) c[e]++; }
  const m = Math.max(...Object.values(c));
  return Object.fromEntries(EDGES.map(e => [e, m > 0 ? c[e] / m : 0]));
}
const INP = JSON.parse(fs.readFileSync(INPUTS, 'utf8'));
const half = zs => zs.slice(0, Math.floor(zs.length / 2));
const STONES = {
  world: etch(INP.zones.world), beacon: etch(INP.zones.beacon), shuffled: etch(INP.zones.shuffled),
  blank: Object.fromEntries(EDGES.map(e => [e, 0])),
  'world-old': etch(half(INP.zones.world)), 'beacon-old': etch(half(INP.zones.beacon)),
};
// one season in the place with one stone (it acts on her exits and plays its recording back to her senses); returns lives, her edge use per quarter, and the stone before Q4 and at the end
function encounter(state, T0) {
  const L = JSON.parse(JSON.stringify(state)), lives = [], stone = { ...T0 };
  for (const e of EDGES) for (const f of ['V', 'S', 'D']) L[f][e] ??= 0;
  const quarters = Array.from({ length: 4 }, () => Object.fromEntries(EDGES.map(e => [e, 0])));
  let r, z, i, life, stoneQ4 = null, played = null;
  // playback: one fixed chance stream per traveller (identical across stones), mulberry32 seeded from SHA-256
  let st = parseInt(sha(`STONE-PLAYBACK|${WORLD}|${K}`).slice(0, 8), 16) >>> 0;
  const rand = () => { st = (st + 0x6D2B79F5) >>> 0; let x = st; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  const playback = (zone, u) => {   // the stone at her zone plays one recorded exit, in proportion to what it holds
    const ex = GATES.filter(g => g.source === zone), w = ex.map(g => stone[key(g.source, g.target)] ?? 0), s = w.reduce((x, y) => x + y, 0);
    if (s <= 0) return null;
    let v = u * s; for (let j = 0; j < ex.length; j++) { if (v < w[j]) return ex[j].target; v -= w[j]; } return ex.at(-1).target;
  };
  const birth = () => { r = new R(); r.qabbala.setGates(GATES);
    r.exitBonus = (x, y) => { const e = key(x, y); return wV * (L.V[e] ?? 0) + wH * Math.tanh((L.S[e] ?? 0) + (L.D[e] ?? 0)) + W_STONE * Math.tanh(stone[e] ?? 0) + (played === y ? PLAYBACK : 0); };
    z = [r.getCurrentZone()]; i = 0; life = [z[0]]; lives.push(life); };
  birth();
  for (let n = 1; n <= T; n++) {
    const q = Math.min(3, Math.floor((n - 1) / (T / 4)));
    if (q === 3 && stoneQ4 === null) stoneQ4 = { ...stone };
    played = playback(z.at(-1), rand());
    const from = z.at(-1), to = r.step().lastTransition.to; z.push(to); i++; life.push(to);
    const e = key(from, to);
    if (e in stone) { stone[e] += ETCH; quarters[q][e]++; }
    if (e in L.S) L.S[e] += a;
    for (const f of EDGES) { const v = L.S[f]; L.S[f] = v * (1 - lamS); L.D[f] = L.D[f] + kappa * v - lamD * L.D[f]; }
    if (to === 5) { for (const f of finalExcursion(z)) { L.S[f] += A; L.V[f] += eta * (-1 - L.V[f]); } birth(); continue; }
    const t = i - H;
    if (t >= 0) { const ek = key(z[t], z[t + 1]); if (ek in L.V) L.V[ek] += eta * (refrain(z, t) - L.V[ek]); }
    if (z.length > 4 * H) { z = z.slice(-2 * H); i = z.length - 1; }
    if (n % 1000 === 0) { const ev = r.getMemory().getEvents(); if (ev.length > 48) ev.splice(0, ev.length - 48); }
  }
  return { lives, quarters, stoneQ4, stoneEnd: stone };
}
const scope = load();
const graph = GATES.map(g => ({ source: g.source, target: g.target, id: `g-${g.source}-${g.target}` }));
const scan = lives => { const c = {}; for (const l of lives) for (const [kk, v] of Object.entries(scanCounts(l, graph))) c[kk] = (c[kk] || 0) + v; return c; };
const k = Number(K);
const state = JSON.parse(fs.readFileSync(STATES, 'utf8')).worlds[WORLD][k];
const out = { world: WORLD, lineage: k, edges: EDGES, stones: STONES, runs: {} };
for (const [name, T0] of Object.entries(STONES)) {
  const res = encounter(state, T0);
  out.runs[name] = { quarters: res.quarters, stoneQ4: res.stoneQ4, stoneEnd: res.stoneEnd, counts: scan(res.lives),
    deaths: res.lives.length - 1, pathSha256: sha(res.lives.map(l => l.join('')).join('|')) };
}
fs.writeFileSync(OUT, JSON.stringify(out) + '\n');
console.log(JSON.stringify({ world: WORLD, lineage: k, deaths: Object.fromEntries(Object.entries(out.runs).map(([s, v]) => [s, v.deaths])) }));
