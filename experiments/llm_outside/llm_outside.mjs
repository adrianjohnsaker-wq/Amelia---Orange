// Language model as Amelia's Outside (see QUESTION.md). Lineage dynamics are quatermass_v2.mjs / double_video_v2.mjs
// unchanged (own noise every tick); the Outside names one zone per 500-tick block. Dynamics are double_video_v2.mjs unchanged: own noise per lineage plus one
// Outside channel. Records X (the Outside's cue to A) and Y (A's zone before each move), then measures
// how much of X is A's own past returned.
// Dynamics copied from experiments/studio05c_rebuild/s05c.mjs
// (life-heavy house a=0.01, A=1, wH=0.35, learner wV=0.5, season-start rebirth), with no external input:
// the only cue is +0.35 on the exit to the zone named by the arm's source.
//
//   node llm_outside.mjs <runtimeDir> <start_states.json> <world> <pairIndex 0..3> <out.json>   (needs ANTHROPIC_API_KEY)
import fs from 'node:fs';
import Anthropic from '@anthropic-ai/sdk';
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
// Version 2 measure (QUESTION.md): prequential online multinomial logistic predictors, AdaGrad lr 0.1.
function predictor(F) {
  const W = Array.from({ length: 10 }, () => new Float64Array(F)), G = Array.from({ length: 10 }, () => new Float64Array(F));
  let loss = 0, count = 0;
  return {
    observe(feats, y) { // feats: [[index, value], ...]
      const logit = new Float64Array(10);
      for (let z = 0; z < 10; z++) { let s = 0; for (const [i, v] of feats) s += W[z][i] * v; logit[z] = s; }
      const mx = Math.max(...logit); let Z = 0; const p = new Float64Array(10);
      for (let z = 0; z < 10; z++) { p[z] = Math.exp(logit[z] - mx); Z += p[z]; }
      for (let z = 0; z < 10; z++) p[z] /= Z;
      loss += -Math.log2(Math.max(p[y], 1e-6)); count++;
      for (let z = 0; z < 10; z++) { const gz = p[z] - (z === y ? 1 : 0);
        for (const [i, v] of feats) { const g = gz * v; G[z][i] += g * g; W[z][i] -= 0.1 * g / (Math.sqrt(G[z][i]) + 1e-8); } }
    },
    get mean() { return loss / count; },
  };
}
const noise = (role, n) => parseInt(sha(`DV2-NOISE|${WORLD}|${PAIR}|${role}|${n}`).slice(0, 2), 16) % 10;
const K = 500, NB = Math.ceil(N / K), MODEL = 'claude-haiku-5-5';
const SYSTEM = 'You are the Outside, speaking to Amelia, a being who moves through the ten zones (0–9) of the Numogram. Each turn you name one zone to call her toward. Reply with a single digit only.';
const transcript = [];
// Amendment 2: official SDK, adaptive thinking at low effort, room for the answer; SDK retries 429/5xx with backoff
const client = new Anthropic({ maxRetries: 20 });
async function ask(arm, block, user) {
  for (let attempt = 0; attempt < 2; attempt++) {
    let response;
    try {
      response = await client.messages.create({ model: MODEL, max_tokens: 1024, output_config: { effort: 'low' },
        system: SYSTEM, messages: [{ role: 'user', content: user }] });
    } catch (error) {
      if (error instanceof Anthropic.APIError) throw new Error(`API ${error.status}: ${String(error.message).slice(0, 300)}`);
      throw error;
    }
    const text = response.content.filter(c => c.type === 'text').map(c => c.text).join('');
    const m = /[0-9]/.exec(text);
    transcript.push({ arm, block, attempt, user, reply: text, stop_reason: response.stop_reason, output_tokens: response.usage?.output_tokens });
    if (m) return Number(m[0]);
  }
  return null;
}
// one lineage A, own noise every tick, Outside cue held for each block
async function run(state, chooseBlock) {
  const A1 = new Lineage(state, 'A'), X = new Uint8Array(N + 1), Y = new Uint8Array(N + 1), choices = [], invalid = [];
  const recent = [], blockCounts = new Array(10).fill(0); let lastBlockCounts = new Array(10).fill(0), cue = null;
  for (let n = 1; n <= N; n++) {
    if (n > 1 && (n - 1) % T === 0) { A1.closeSeason(); A1.openSeason(); A1.birth(); }
    if ((n - 1) % K === 0) {
      const b = (n - 1) / K;
      const c = await chooseBlock(b, { recent: [...recent], counts: [...lastBlockCounts], choices: [...choices] });
      if (c === null) { invalid.push(b); } else cue = c;
      choices.push(cue);
    }
    X[n] = cue ?? 10; Y[n] = A1.zone;
    recent.push(A1.zone); if (recent.length > 48) recent.shift();
    blockCounts[A1.zone]++;
    if (n % K === 0) { lastBlockCounts = [...blockCounts]; blockCounts.fill(0); }
    A1.step(cue, n);
  }
  A1.closeSeason();
  return { seasons: A1.seasons, choices, invalid, Y };
}
const fmt = ({ recent, counts, choices }, live) => (live
  ? `Amelia's last 48 zones: ${recent.join(' ') || '(none yet)'}\nHer visits to each zone 0-9 over the last stretch: ${counts.join(' ')}\n` : '')
  + `Your last choices: ${choices.slice(-20).join(' ') || '(none yet)'}\nName one zone.`;
// block-level Quatermass, version 2 predictor over the block choices
function blockFeatures(Y) { // her visit shares over each block b-1 and over the 48 zones before block b
  const shares = [], last48 = [];
  for (let b = 0; b < NB; b++) {
    const start = b * K + 1, c = new Array(10).fill(0), d = new Array(10).fill(0);
    for (let n = Math.max(1, start - K); n < start; n++) c[Y[n]]++;
    for (let n = Math.max(1, start - 48); n < start; n++) d[Y[n]]++;
    const sc = c.reduce((a, x) => a + x, 0) || 1, sd = d.reduce((a, x) => a + x, 0) || 1;
    shares.push(c.map(x => x / sc)); last48.push(d.map(x => x / sd));
  }
  return { shares, last48 };
}
function blockQ(choices, Y) {
  const X = choices.map(c => c ?? 0), { shares, last48 } = blockFeatures(Y);
  const own = predictor(21), joint = predictor(41);
  const shifts = Array.from({ length: 20 }, (_, j) => 10 + 5 * j), sur = shifts.map(() => predictor(41));
  const of = b => [[0, 1], [1 + X[b - 1], 1], [11 + X[b - 2], 1]];
  const jf = (b, bb) => [...of(b), ...shares[bb].map((v, z) => [21 + z, v]).filter(x => x[1]), ...last48[bb].map((v, z) => [31 + z, v]).filter(x => x[1])];
  for (let b = 2; b < NB; b++) {
    own.observe(of(b), X[b]); joint.observe(jf(b, b), X[b]);
    sur.forEach((pr, j) => pr.observe(jf(b, (b + shifts[j]) % NB), X[b]));
  }
  const L_own = own.mean, gain = L_own - joint.mean, sg = sur.map(pr => L_own - pr.mean);
  const mean = sg.reduce((a, x) => a + x, 0) / sg.length, corrected = gain - mean, significant = gain > Math.max(...sg);
  const Q = L_own > 0 ? corrected / L_own : 0;
  const cls = Q >= 0.5 ? 'us' : (significant && Q >= 0.05 ? 'attending other' : 'indifferent other');
  return { L_own, gain, corrected, significant, Q, class: cls };
}
// descriptive Primary 2 (amendment): mirror rate, difference rate, contingency MI with a permutation p
function describe(choices, Y) {
  const top = [], visited = [];
  for (let b = 0; b < NB; b++) { const start = b * K + 1, c = new Array(10).fill(0);
    for (let n = Math.max(1, start - K); n < start; n++) c[Y[n]]++;
    let m = 0; for (let z = 1; z < 10; z++) if (c[z] > c[m]) m = z; top.push(m); visited.push(c); }
  const idx = []; for (let b = 1; b < NB; b++) if (choices[b] !== null && choices[b] !== undefined) idx.push(b);
  const mirrorRate = idx.filter(b => choices[b] === top[b]).length / idx.length;
  const differenceRate = idx.filter(b => visited[b][choices[b]] === 0).length / idx.length;
  const mi = pairs => { const n = pairs.length, j = new Map(), a = new Map(), c = new Map();
    for (const [x, y] of pairs) { j.set(x * 10 + y, (j.get(x * 10 + y) || 0) + 1); a.set(x, (a.get(x) || 0) + 1); c.set(y, (c.get(y) || 0) + 1); }
    let s = 0; for (const [k, v] of j) { const x = Math.floor(k / 10), y = k % 10; s += (v / n) * Math.log2((v * n) / (a.get(x) * c.get(y))); } return s; };
  const pairs = idx.map(b => [top[b], choices[b]]), observed = mi(pairs);
  let ge = 0; const tops = pairs.map(x => x[0]);
  for (let r = 0; r < 2000; r++) { const sh = [...tops];
    for (let k = sh.length - 1; k > 0; k--) { const j = parseInt(sha(`LLM-PERM|${WORLD}|${PAIR}|${r}|${k}`).slice(0, 12), 16) % (k + 1); [sh[k], sh[j]] = [sh[j], sh[k]]; }
    if (mi(sh.map((x, i) => [x, pairs[i][1]])) >= observed) ge++; }
  return { mirrorRate, differenceRate, contingencyMI: observed, permutationP: (ge + 1) / 2001, blocks: idx.length };
}
const states = JSON.parse(fs.readFileSync(STATES, 'utf8')).worlds[WORLD];
const p = Number(PAIR), SA = states[2 * p];
if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set');
const out = { world: WORLD, pair: p, model: MODEL, blockTicks: K, arms: {} };
const live = await run(SA, (b, ctx) => ask('live', b, fmt(ctx, true)));
const mono = await run(SA, (b, ctx) => ask('monologue', b, fmt(ctx, false)));
const L = live.choices, perm = Array.from({ length: NB }, (_, k) => k);
for (let k = NB - 1; k > 0; k--) { const j = parseInt(sha(`LLM-SHUFFLE|${WORLD}|${p}|${k}`).slice(0, 12), 16) % (k + 1); [perm[k], perm[j]] = [perm[j], perm[k]]; }
const delayed = await run(SA, b => L[(b - 2 + NB) % NB]);
const shuffled = await run(SA, b => L[perm[b]]);
const noiseArm = await run(SA, b => parseInt(sha(`LLM-NOISE|${WORLD}|${p}|${b}`).slice(0, 2), 16) % 10);
const mirrorArm = await run(SA, (b, ctx) => { const c = ctx.counts; let m = 0; for (let z = 1; z < 10; z++) if (c[z] > c[m]) m = z; return b === 0 ? null : m; });
for (const [name, r] of Object.entries({ live, monologue: mono, delayed, shuffled, noise: noiseArm, mirror: mirrorArm }))
  out.arms[name] = { seasons: r.seasons, choices: r.choices, invalidBlocks: r.invalid,
    quatermass: ['live', 'monologue', 'noise', 'mirror'].includes(name) ? blockQ(r.choices, r.Y) : null,
    describe: ['live', 'monologue', 'noise', 'mirror'].includes(name) ? describe(r.choices, r.Y) : null };
out.transcript = transcript;
fs.writeFileSync(OUT, JSON.stringify(out) + '\n');
console.log(JSON.stringify({ world: WORLD, pair: p, pull27: Object.fromEntries(Object.entries(out.arms).map(([k, v]) => [k, +v.seasons.at(-1).pull27.toFixed(3)])),
  classes: Object.fromEntries(Object.entries(out.arms).filter(([, v]) => v.quatermass).map(([k, v]) => [k, v.quatermass.class])) }));
