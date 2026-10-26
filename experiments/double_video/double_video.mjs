// Double-video assay (see QUESTION.md). Dynamics copied from experiments/studio05c_rebuild/s05c.mjs
// (life-heavy house a=0.01, A=1, wH=0.35, learner wV=0.5, season-start rebirth), with no external input:
// the only cue is +0.35 on the exit to the zone named by the arm's source.
//
//   node double_video.mjs <runtimeDir> <start_states.json> <world> <pairIndex 0..3> <out.json>
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
  constructor(state) { this.L = deep(state); this.cue = null; this.seasons = []; this.birth(); this.openSeason(); }
  birth() {
    this.r = new R(); this.z = [this.r.getCurrentZone()]; this.i = 0;
    this.r.exitBonus = (x, y) => { const e = key(x, y), L = this.L;
      return wV * (L.V[e] ?? 0) + wH * Math.tanh((L.S[e] ?? 0) + (L.D[e] ?? 0)) + (this.cue !== null && y === this.cue ? CUE : 0); };
  }
  openSeason() { this.used = new Set(); this.deaths = 0; }
  closeSeason() {
    const p = e => Math.tanh(this.L.S[e] + this.L.D[e]);
    this.seasons.push({ deaths: this.deaths, routes: this.used.size, pull27: p('2>7'), pull45: p('4>5'), pull12: p('1>2'), V45: this.L.V['4>5'] });
  }
  get zone() { return this.z.at(-1); }
  step(cue, n) {
    const L = this.L; this.cue = cue;
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
// run one or two lineages for N ticks; cueFor(n, self, other) gives each one's cue before anyone moves
function run(lineages, cueFor) {
  for (let n = 1; n <= N; n++) {
    if (n > 1 && (n - 1) % T === 0) for (const x of lineages) { x.closeSeason(); x.openSeason(); x.birth(); }
    const cues = lineages.map((x, j) => cueFor(n, j, lineages));
    lineages.forEach((x, j) => x.step(cues[j], n));
  }
  for (const x of lineages) x.closeSeason();
}
const states = JSON.parse(fs.readFileSync(STATES, 'utf8')).worlds[WORLD];
const p = Number(PAIR), SA = states[2 * p], SB = states[2 * p + 1];
const out = { world: WORLD, pair: p, arms: {} };
// live: mutual contingency; B's stream to A is recorded
const stream = new Array(N + 1);
{ const A1 = new Lineage(SA), B1 = new Lineage(SB);
  run([A1, B1], (n, j, xs) => { const other = xs[1 - j].zone; if (j === 0) stream[n] = other; return other; });
  out.arms.live = A1.seasons; out.partnerLive = B1.seasons; }
{ const A1 = new Lineage(SA); run([A1], n => stream[((n - 1 - DELAY + N) % N) + 1]); out.arms.delayed = A1.seasons; }
{ const perm = Array.from({ length: N }, (_, k) => k + 1);
  for (let k = N - 1; k > 0; k--) { const j = parseInt(sha(`DV-SHUFFLE|${WORLD}|${p}|${k}`).slice(0, 12), 16) % (k + 1); [perm[k], perm[j]] = [perm[j], perm[k]]; }
  const A1 = new Lineage(SA); run([A1], n => stream[perm[n - 1]]); out.arms.shuffled = A1.seasons; }
{ const A1 = new Lineage(SA), B1 = new Lineage(SB);
  run([A1, B1], (n, j, xs) => j === 0 ? xs[1].zone : null); out.arms.monologue = A1.seasons; }
{ const A1 = new Lineage(SA); run([A1], n => parseInt(sha(`DV-NOISE|${WORLD}|${p}|${n}`).slice(0, 2), 16) % 10); out.arms.noise = A1.seasons; }
{ const A1 = new Lineage(SA); run([A1], () => null); out.arms.alone = A1.seasons; }
out.liveStreamSha256 = sha(stream.slice(1).join(','));
fs.writeFileSync(OUT, JSON.stringify(out) + '\n');
console.log(JSON.stringify({ world: WORLD, pair: p, routes: Object.fromEntries(Object.entries(out.arms).map(([k, v]) => [k, v.at(-1).routes])) }));
