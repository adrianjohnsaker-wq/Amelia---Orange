// Quatermass measure (see QUESTION.md). Dynamics are double_video_v2.mjs unchanged: own noise per lineage plus one
// Outside channel. Records X (the Outside's cue to A) and Y (A's zone before each move), then measures
// how much of X is A's own past returned.
// Dynamics copied from experiments/studio05c_rebuild/s05c.mjs
// (life-heavy house a=0.01, A=1, wH=0.35, learner wV=0.5, season-start rebirth), with no external input:
// the only cue is +0.35 on the exit to the zone named by the arm's source.
//
//   node quatermass.mjs <runtimeDir> <start_states.json> <world> <pairIndex 0..3> <out.json>
import fs from 'node:fs';
import { createHash } from 'node:crypto';
const [M, STATES, WORLD, PAIR, OUT] = process.argv.slice(2);
const { AmeliaNumogramSubstrateRuntime: R } = await import(`${M}/substrate/ameliaNumogramSubstrateRuntime.ts`);
const EDGES = ['0>9','1>8','2>7','3>6','4>5','1>2','2>4','4>7','7>8','8>9','9>1'];
const a = 0.01, A = 1, wV = 0.5, wH = 0.35, lamS = 0.002, kappa = 0.0005, lamD = 0.00005, H = 24, eta = 1 / 8;
const T = 20160, SEASONS = 6, N = T * SEASONS, DELAY = 1000, CUE = 0.35;
const key = (x, y) => `${x}>${y}`, sha = s => createHash('sha256').update(s).digest('hex');
const deep = x => JSON.parse(JSON.stringify(x));
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
class Lineage {
  constructor(state, role) { this.L = deep(state); this.cue = []; this.role = role; this.seasons = []; this.birth(); this.openSeason(); }
  birth() {
    this.r = new R(); this.z = [this.r.getCurrentZone()]; this.i = 0;
    this.r.exitBonus = (x, y) => { const e = key(x, y), L = this.L;
      return wV * (L.V[e] ?? 0) + wH * Math.tanh((L.S[e] ?? 0) + (L.D[e] ?? 0)) + this.cue.reduce((s, c) => s + (c === y ? CUE : 0), 0); };
  }
  openSeason() { this.used = new Set(); this.deaths = 0; }
  closeSeason() {
    const p = e => Math.tanh(this.L.S[e] + this.L.D[e]);
    this.seasons.push({ deaths: this.deaths, routes: this.used.size, pull27: p('2>7'), pull45: p('4>5'), pull12: p('1>2'), V45: this.L.V['4>5'] });
  }
  get zone() { return this.z.at(-1); }
  step(cue, n) {
    const L = this.L; this.cue = [noise(this.role, n), ...(cue === null ? [] : [cue])];
    const from = this.zone, to = this.r.step(undefined).lastTransition.to; this.z.push(to); this.i++;
    const e = key(from, to); this.used.add(e);
    if (e in L.S) L.S[e] += a;
    for (const f of EDGES) { const v = L.S[f]; L.S[f] = v * (1 - lamS); L.D[f] = L.D[f] + kappa * v - lamD * L.D[f]; }
    if (to === 5) { for (const f of finalExcursion(this.z)) { L.S[f] += A; L.V[f] += eta * (-1 - L.V[f]); } this.deaths++; this.birth(); return; }
    const t = this.i - H;
    if (t >= 0) { const ek = key(this.z[t], this.z[t + 1]); if (ek in L.V) L.V[ek] += eta * (refrain(this.z, t) - L.V[ek]); }
    if (this.z.length > 4 * H) { this.z = this.z.slice(-2 * H); this.i = this.z.length - 1; }
    if (n % 1000 === 0) { const ev = this.r.getMemory().getEvents(); if (ev.length > 48) ev.splice(0, ev.length - 48); }
  }
}
// run lineages for N ticks; cueFor gives each one's Outside cue before anyone moves. A is lineages[0].
function run(lineages, cueFor) {
  const X = new Uint8Array(N + 1), Y = new Uint8Array(N + 1), hist = [];
  for (let n = 1; n <= N; n++) {
    if (n > 1 && (n - 1) % T === 0) for (const x of lineages) { x.closeSeason(); x.openSeason(); x.birth(); }
    const cues = lineages.map((x, j) => cueFor(n, j, lineages, hist));
    X[n] = cues[0]; Y[n] = lineages[0].zone;
    hist.push(lineages[0].zone); if (hist.length > 24) hist.shift();
    lineages.forEach((x, j) => x.step(cues[j], n));
  }
  for (const x of lineages) x.closeSeason();
  return { X, Y };
}
const entropy = (counts, total) => { let h = 0; for (const c of counts) if (c) h -= (c / total) * Math.log2(c / total); return h; };
// conditional entropy H(target | context), contexts given as integer keys
function condH(target, ctx, from, to) {
  const m = new Map(); let total = 0;
  for (let n = from; n <= to; n++) { let row = m.get(ctx(n)); if (!row) m.set(ctx(n), row = new Array(10).fill(0)); row[target[n]]++; total++; }
  let h = 0; for (const row of m.values()) { const s = row.reduce((a, b) => a + b, 0); h += (s / total) * entropy(row, s); }
  return h;
}
function measure(X, Y) {
  const from = 3, to = N;
  const hX = condH(X, n => X[n - 1], from, to);
  const te = (Ys) => hX - condH(X, n => X[n - 1] * 100 + Ys(n - 1) * 10 + Ys(n - 2), from, to);
  const teXY_raw = condH(Y, n => Y[n - 1], from, to) - condH(Y, n => Y[n - 1] * 100 + X[n - 1] * 10 + X[n - 2], from, to);
  const real = te(n => Y[n]);
  const surrogates = Array.from({ length: 20 }, (_, j) => { const s = 5000 + 5000 * j; return te(n => Y[((n - 1 + s) % N) + 1]); });
  const mean = surrogates.reduce((a, b) => a + b, 0) / 20, corrected = real - mean, significant = real > Math.max(...surrogates);
  const Q = hX > 0 ? corrected / hX : 0;
  const cls = Q >= 0.5 ? 'us' : (significant ? 'attending other' : 'indifferent other');
  return { H_X: hX, TE_herToOutside: real, surrogateMean: mean, surrogateMax: Math.max(...surrogates), correctedTE: corrected,
    significant, Q, class: cls, TE_outsideToHer_raw: teXY_raw };
}
const noise = (role, n) => parseInt(sha(`DV2-NOISE|${WORLD}|${PAIR}|${role}|${n}`).slice(0, 2), 16) % 10;
const states = JSON.parse(fs.readFileSync(STATES, 'utf8')).worlds[WORLD];
const p = Number(PAIR), SA = states[2 * p], SB = states[2 * p + 1];
const out = { world: WORLD, pair: p, outsides: {} };
const mode = arr => { const c = new Array(10).fill(0); for (const z of arr) c[z]++; let b = 0; for (let k = 1; k < 10; k++) if (c[k] > c[b]) b = k; return b; };
const arms = {
  live: () => { const A1 = new Lineage(SA, 'A'), B1 = new Lineage(SB, 'B'); return [[A1, B1], (n, j, xs) => xs[1 - j].zone]; },
  monologue: () => { const A1 = new Lineage(SA, 'A'), B1 = new Lineage(SB, 'B'); return [[A1, B1], (n, j, xs) => j === 0 ? xs[1].zone : null]; },
  mirror: () => { const A1 = new Lineage(SA, 'A'); return [[A1], (n, j, xs, hist) => hist.length ? mode(hist) : xs[0].zone]; },
  noise: () => { const A1 = new Lineage(SA, 'A'); return [[A1], n => parseInt(sha(`DV2-SECOND|${WORLD}|${p}|${n}`).slice(0, 2), 16) % 10]; },
};
for (const [name, make] of Object.entries(arms)) {
  const [ls, cueFor] = make(); const { X, Y } = run(ls, cueFor);
  out.outsides[name] = { ...measure(X, Y), pull27: ls[0].seasons.at(-1).pull27, routes: ls[0].seasons.at(-1).routes };
}
fs.writeFileSync(OUT, JSON.stringify(out) + '\n');
console.log(JSON.stringify({ world: WORLD, pair: p, classes: Object.fromEntries(Object.entries(out.outsides).map(([k, v]) => [k, [v.class, +v.Q.toFixed(3)]])) }));
