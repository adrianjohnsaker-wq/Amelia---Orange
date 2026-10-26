// THE DOORS (see REGISTRATION.md). One traveller through every door: Studio 05c Amelia (learner + house,
// s05c.mjs dynamics, unchanged), her Numogram read by the canonical PF-1 scanner, against walks drawn from
// her own transition frequencies.
//
//   node doors.mjs <runtimeDir> <start_states.json> <tarot_deck.json> <world> <lineage 0..8> <out.json>
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { load } from '../pf1/PF1_A1_R2_SCORER.mjs';
import { scanCounts } from './scan.mjs';
import { pf2InputForArm } from '../pf2/PF2_REFERENCE_INPUT.mjs';
const [M, STATES, DECK, WORLD, K, OUT] = process.argv.slice(2);
const { AmeliaNumogramSubstrateRuntime: R } = await import(`${M}/substrate/ameliaNumogramSubstrateRuntime.ts`);
const EDGES = ['0>9','1>8','2>7','3>6','4>5','1>2','2>4','4>7','7>8','8>9','9>1'];
const a = 0.01, A = 1, wV = 0.5, wH = 0.35, lamS = 0.002, kappa = 0.0005, lamD = 0.00005, H = 24, eta = 1 / 8;
const T = 20160, START_TICK = 20 * 20160, CARD_EVERY = 60, SURROGATES = 200;
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
const k = Number(K), world = WORLD, w = Number(WORLD.replace('S05W', '')) - 1;
const deck = JSON.parse(fs.readFileSync(DECK, 'utf8')).randomness;
const DOORS = {
  closed:     { input: n => `${world}|${k}|${START_TICK + n}` },
  fasting:    { input: () => undefined },
  fatigue:    { input: n => `${world}|${k}|${START_TICK + n}`, setup: r => r.setMomentumDamping(0.1) },
  madness:    { input: n => `${world}|${k}|${START_TICK + n}`, setup: r => { r.setAdvisoryWeight(0); r.setSuppressRelaySteering(true); } },
  meditation: { input: n => `${world}|${k}|${START_TICK + n}`, setup: r => r.setMomentumDamping(0.99) },
  tarot:      { input: n => n % CARD_EVERY === 0 ? pf2InputForArm(deck[336 * w + n / CARD_EVERY - 1], k) : `${world}|${k}|${START_TICK + n}` },
};
// one season through one door; returns her lives as zone sequences
function travel(state, door) {
  const L = JSON.parse(JSON.stringify(state)), lives = [];
  let r, z, i, life;
  const birth = () => { r = new R(); door.setup?.(r);
    r.exitBonus = (x, y) => { const e = key(x, y); return wV * (L.V[e] ?? 0) + wH * Math.tanh((L.S[e] ?? 0) + (L.D[e] ?? 0)); };
    z = [r.getCurrentZone()]; i = 0; life = [z[0]]; lives.push(life); };
  birth();
  for (let n = 1; n <= T; n++) {
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
const scope = load();
const scan = lives => { const c = {}; for (const l of lives) for (const [kk, v] of Object.entries(scanCounts(l, scope.graph))) c[kk] = (c[kk] || 0) + v; return c; };
const state = JSON.parse(fs.readFileSync(STATES, 'utf8')).worlds[WORLD][k];
const out = { world: WORLD, lineage: k, doors: {} };
for (const [name, door] of Object.entries(DOORS)) {
  const lives = travel(state, door), counts = scan(lives);
  const sur = Array.from({ length: SURROGATES }, (_, j) => scan(surrogate(lives, `${WORLD}|${k}|${name}|${j}`)));
  const p95 = {};
  for (const kk of scope.names.keys()) { const v = sur.map(c => c[kk] || 0).sort((x, y) => x - y); p95[kk] = v[Math.floor(0.95 * (SURROGATES - 1))]; }
  out.doors[name] = { counts, chanceP95: p95, lives: lives.length, deaths: lives.length - 1,
    pathSha256: sha(lives.map(l => l.join('')).join('|')) };
}
fs.writeFileSync(OUT, JSON.stringify(out) + '\n');
console.log(JSON.stringify({ world: WORLD, lineage: k, deaths: Object.fromEntries(Object.entries(out.doors).map(([d, v]) => [d, v.deaths])) }));
