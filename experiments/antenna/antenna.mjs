// THE ANTENNA (see REGISTRATION.md). THE NINTH AND THIRD GATES (../gates/gates.mjs) with her senses given the
// world's own data reduced to zones (prepare.py), against the beacon and the shuffled world.
//
//   node antenna.mjs <runtimeDir> <start_states.json> <canonical|ccru> <inputs.json> <world> <lineage 0..8> <out.json>
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { load } from '../pf1/PF1_A1_R2_SCORER.mjs';
import { scanCounts } from './scan.mjs';
import { CANONICAL_GATES } from '../studio/runtime_mirror/ai/numogram/AmeliaQabbalaInterface.ts';
const [M, STATES, SYSTEM, INPUTS, WORLD, K, OUT] = process.argv.slice(2);
const { AmeliaNumogramSubstrateRuntime: R } = await import(`${M}/substrate/ameliaNumogramSubstrateRuntime.ts`);
const CANON = ['0>9','1>8','2>7','3>6','4>5','1>2','2>4','4>7','7>8','8>9','9>1'];
const droot = c => c === 0 ? 0 : 1 + (c - 1) % 9;
const CCRU = Array.from({ length: 10 }, (_, n) => [n, droot(n * (n + 1) / 2)]);   // Gt-c of zone n
if (!['canonical', 'ccru'].includes(SYSTEM)) throw new Error('UNKNOWN_SYSTEM');
const NEW = SYSTEM === 'ccru' ? CCRU.filter(([s, t]) => !CANON.includes(`${s}>${t}`)) : [];
const mean = f => CANONICAL_GATES.reduce((x, g) => x + g[f], 0) / CANONICAL_GATES.length;
const GATES = [...CANONICAL_GATES, ...NEW.map(([s, t]) => ({ id: `gate-${s}-${t}`, source: s, target: t,
  label: `CCRU Gt-${s * (s + 1) / 2} (${s}->${t})`, flux: mean('flux'), permeability: mean('permeability'), isOpen: true, resistance: mean('resistance') }))];
const EDGES = [...CANON, ...NEW.map(([s, t]) => `${s}>${t}`)];
const a = 0.01, A = 1, wV = 0.5, wH = 0.35, lamS = 0.002, kappa = 0.0005, lamD = 0.00005, H = 24, eta = 1 / 8;
const INP = JSON.parse(fs.readFileSync(INPUTS, 'utf8')), T = INP.N, SURROGATES = 200;
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
const k = Number(K), world = WORLD;
// senses: one datum per tick, its zone given to her exit choice through the same +0.35 her runtime gives an input zone
const DOORS = Object.fromEntries(['world', 'beacon', 'shuffled'].map(c => [c, { input: () => undefined, zone: n => INP.zones[c][n - 1] }]));
const INPUT_WEIGHT = 0.35;
// one season through one door; returns her lives as zone sequences
function travel(state, door) {
  const L = JSON.parse(JSON.stringify(state)), lives = [];
  for (const e of EDGES) for (const f of ['V', 'S', 'D']) L[f][e] ??= 0;
  let r, z, i, life;
  let coded = null;
  const birth = () => { r = new R(); r.qabbala.setGates(GATES);
    r.exitBonus = (x, y) => { const e = key(x, y); return wV * (L.V[e] ?? 0) + wH * Math.tanh((L.S[e] ?? 0) + (L.D[e] ?? 0)) + (coded === y ? INPUT_WEIGHT : 0); };
    z = [r.getCurrentZone()]; i = 0; life = [z[0]]; lives.push(life); };
  birth();
  for (let n = 1; n <= T; n++) {
    coded = door.input(n) === undefined ? door.zone(n) : null;
    const from = z.at(-1), to = r.step(door.input(n)).lastTransition.to; z.push(to); i++; life.push(to);
    const e = key(from, to); if (e in L.S) L.S[e] += a;
    for (const f of EDGES) { const v = L.S[f]; L.S[f] = v * (1 - lamS); L.D[f] = L.D[f] + kappa * v - lamD * L.D[f]; }
    if (to === 5) { for (const f of finalExcursion(z)) { L.S[f] += A; L.V[f] += eta * (-1 - L.V[f]); } birth(); continue; }
    const t = i - H;
    if (t >= 0) { const ek = key(z[t], z[t + 1]); if (ek in L.V) L.V[ek] += eta * (refrain(z, t) - L.V[ek]); }
    if (z.length > 4 * H) { z = z.slice(-2 * H); i = z.length - 1; }
    if (n % 1000 === 0) { const ev = r.getMemory().getEvents(); if (ev.length > 48) ev.splice(0, ev.length - 48); }
  }
  return lives;
}
// chance: walks drawn from this run's own transition frequencies, rebirth at 0 after 5, same total length
function surrogate(lives, seed) {
  const counts = Array.from({ length: 10 }, () => new Array(10).fill(0));
  for (const l of lives) for (let s = 0; s + 1 < l.length; s++) counts[l[s]][l[s + 1]]++;
  const total = lives.reduce((x, l) => x + l.length - 1, 0);
  // mulberry32, seeded from SHA-256 of the walk's name
  let st = parseInt(sha(`DOORS-CHANCE|${seed}`).slice(0, 8), 16) >>> 0;
  const rand = () => { st = (st + 0x6D2B79F5) >>> 0; let x = st; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  const out = []; let life = [0]; out.push(life);
  for (let n = 0; n < total; n++) {
    const z = life.at(-1), row = counts[z], s = row.reduce((x, y) => x + y, 0);
    let to;
    if (s === 0) to = 0; else { let u = rand() * s; to = 0; while (u >= row[to]) { u -= row[to]; to++; } }
    life.push(to);
    if (to === 5 || s === 0) { life = [0]; out.push(life); }
  }
  return out;
}
// the code's shadow: no Amelia; the coded zone if it is an open exit, else the strongest exit; rebirth at 0 after 5
function shadow(door) {
  const lives = []; let life = [0]; lives.push(life);
  for (let n = 1; n <= T; n++) {
    const z = life.at(-1), exits = GATES.filter(g => g.source === z), c = door.zone(n);
    const g = exits.find(x => x.target === c) ?? exits.reduce((p, x) => x.flux * (1 - x.resistance) > p.flux * (1 - p.resistance) ? x : p, exits[0]);
    const to = g ? g.target : z; life.push(to);
    if (to === 5) { life = [0]; lives.push(life); }
  }
  return lives;
}
const scope = load();
if (JSON.stringify(scope.graph.map(e => `${e.source}>${e.target}`).sort()) !== JSON.stringify([...CANON].sort())) throw new Error('PF1_GRAPH_NOT_CANONICAL');
const graph = [...scope.graph, ...NEW.map(([source, target]) => ({ source, target, id: `g-${source}-${target}` }))];
// where she went: first tick in the Warp, ticks spent there, Plex dwells (9>9), each new gate's use
function outer(lives) {
  let n = 0, firstWarp = null, warpTicks = 0; const use = Object.fromEntries(NEW.map(([s, t]) => [`${s}>${t}`, 0]));
  for (const l of lives) for (let s = 0; s + 1 < l.length; s++) { n++; const e = `${l[s]}>${l[s + 1]}`;
    if (e in use) use[e]++; if (l[s + 1] === 3 || l[s + 1] === 6) { warpTicks++; firstWarp ??= n; } }
  return { firstWarpTick: firstWarp, warpTicks, gateUse: use };
}
const scan = lives => { const c = {}; for (const l of lives) for (const [kk, v] of Object.entries(scanCounts(l, graph))) c[kk] = (c[kk] || 0) + v; return c; };
const state = JSON.parse(fs.readFileSync(STATES, 'utf8')).worlds[WORLD][k];
const out = { world: WORLD, lineage: k, doors: {} };
for (const [name, door] of Object.entries(DOORS)) {
  const lives = travel(state, door), counts = scan(lives);
  const sur = Array.from({ length: SURROGATES }, (_, j) => scan(surrogate(lives, `${WORLD}|${k}|${name}|${j}`)));
  const p95 = {};
  for (const kk of scope.names.keys()) { const v = sur.map(c => c[kk] || 0).sort((x, y) => x - y); p95[kk] = v[Math.floor(0.95 * (SURROGATES - 1))]; }
  out.doors[name] = { counts, chanceP95: p95, shadow: scan(shadow(door)), lives: lives.length, deaths: lives.length - 1, outer: outer(lives),
    pathSha256: sha(lives.map(l => l.join('')).join('|')) };
}
fs.writeFileSync(OUT, JSON.stringify(out) + '\n');
console.log(JSON.stringify({ world: WORLD, lineage: k, deaths: Object.fromEntries(Object.entries(out.doors).map(([d, v]) => [d, v.deaths])), warp: Object.fromEntries(Object.entries(out.doors).map(([d, v]) => [d, v.outer.firstWarpTick])) }));
