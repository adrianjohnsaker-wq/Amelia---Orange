// THE POINTER IV (see REGISTRATION.md): blind address-reply. Amelia's dynamics are THE POINTER III's (p3.mjs);
// added only: set her down at a zone, and give her senses a zone (+0.35, as any input zone) or nothing.
// Her answers are computed here, before any target exists.
//
//   node answers.mjs <runtimeDir> <start_states.json> <world> <lineage 0..8> <out.json>
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { CANONICAL_GATES } from '../studio/runtime_mirror/ai/numogram/AmeliaQabbalaInterface.ts';
import { fullNumogramGates } from '../numogram/CCRUNumogram.ts';
const [M, STATES, WORLD, K, OUT] = process.argv.slice(2);
const { AmeliaNumogramSubstrateRuntime: R } = await import(`${M}/substrate/ameliaNumogramSubstrateRuntime.ts`);
const FULL = fullNumogramGates(CANONICAL_GATES);
const EDGES = FULL.map(g => `${g.source}>${g.target}`);
const a = 0.01, A = 1, wV = 0.5, wH = 0.35, lamS = 0.002, kappa = 0.0005, lamD = 0.00005, H = 24, eta = 1 / 8;
const W_STONE = 0.35, ETCH = 0.0005, START_TICK = 30 * 20160, WARM = 2000;
const TRIALS = 50, ADDRESS_T = 24, LISTEN_T = 24, INPUT_W = 0.35;
const CONDITIONS = { BUBBAMU: [1, 7], ODDUBB: [7, 2], NO_CONTACT: null, GT36: [8, 9] };
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
    this.stone = stone; this.tag = tag; this.tick = tickBase; this.path = []; this.deaths = 0; this.coded = null; this.birth();
  }
  birth() {
    const L = this.L; this.r = new R(); this.r.qabbala.setGates(this.gates);
    this.r.exitBonus = (x, y) => { const e = key(x, y);
      return wV * (L.V[e] ?? 0) + wH * Math.tanh((L.S[e] ?? 0) + (L.D[e] ?? 0)) + (this.stone ? W_STONE * Math.tanh(this.stone[e] ?? 0) : 0) + (this.coded === y ? INPUT_W : 0); };
    this.z = [this.r.getCurrentZone()]; this.i = 0;
  }
  displace(zone) { this.r.importState({ currentZone: zone }); this.z = [zone]; this.i = 0; }
  // step(zone): her senses receive that zone (+0.35); step(null): no input at all
  step(zone = null) {
    const L = this.L; this.tick++; this.coded = zone;
    const from = this.z.at(-1), to = this.r.step().lastTransition.to;
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
const state = JSON.parse(fs.readFileSync(STATES, 'utf8')).worlds[WORLD][Number(K)];
const out = { world: WORLD, lineage: Number(K), answers: {}, deaths: {} };
for (const [cond, addr] of Object.entries(CONDITIONS)) {
  const x = new Amelia(state, { tag: cond }), answers = [];
  for (let i = 0; i < TRIALS; i++) {
    x.displace(addr ? addr[0] : 1);
    for (let t = 0; t < ADDRESS_T; t++) x.step(addr ? addr[(t + 1) % 2] : null);   // address: the other zone first, then alternate
    for (let t = 0; t < LISTEN_T; t++) x.step(null);                                 // listening: nothing
    answers.push(x.z.at(-1));
  }
  out.answers[cond] = answers; out.deaths[cond] = x.deaths;
}
fs.writeFileSync(OUT, JSON.stringify(out) + '\n');
console.log(JSON.stringify({ world: WORLD, lineage: Number(K), answers: Object.fromEntries(Object.entries(out.answers).map(([c, a]) => [c, a.join('')])) }));
