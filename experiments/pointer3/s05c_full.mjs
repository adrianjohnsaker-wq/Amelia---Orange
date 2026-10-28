// Studio 05c rebuilt from committed code (receiver.mjs lineage loop + two_subjects.mjs house), from the
// Studio 05c notes of 24 October 2026. Not the original 05c runner, which was never saved.
// Life-heavy house a=0.01, A=1, house weight 0.35, her weight 0.5. Nine lineages, each with its own house,
// on a continuous clock; rebirth at zone 0 on entry to zone 5. Fiction: S = D = d on 1>2, 2>4, 4>5.
//
//   node s05c.mjs <runtimeDir> <world> <dose|alone> <seasons> <out.json> [stateIn.json] [intervention]
//   intervention: none | erase27 | eraseDetour | unchanged | erase27_unchanged | erase27_blankcode
import fs from 'node:fs';
// THE POINTER III (C): identical to ../pointer2/s05c.mjs except (1) each newborn runtime receives the full CCRU
// Numogram's 29 gates and (2) her learner and House carry all 29 edges, starting at 0.
import { CANONICAL_GATES } from '../studio/runtime_mirror/ai/numogram/AmeliaQabbalaInterface.ts';
import { fullNumogramGates } from '../numogram/CCRUNumogram.ts';
const GATES = fullNumogramGates(CANONICAL_GATES);
const [M, WORLD, DOSE, SEASONS, OUT, STATE_IN, INTERVENTION = 'none'] = process.argv.slice(2);
const { AmeliaNumogramSubstrateRuntime: R } = await import(`${M}/substrate/ameliaNumogramSubstrateRuntime.ts`);
const EDGES = GATES.map(g => `${g.source}>${g.target}`);
const a = 0.01, A = 1, wV = 0.5, lamS = 0.002, kappa = 0.0005, lamD = 0.00005, H = 24, eta = 1 / 8, K = 9, T = 20160;
const wH = DOSE === 'alone' ? 0 : 0.35, d = DOSE === 'alone' ? 0 : Number(DOSE);
const learner = !INTERVENTION.includes('unchanged');
const key = (x, y) => `${x}>${y}`, zero = () => Object.fromEntries(EDGES.map(e => [e, 0]));
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
// lineage memories: from a converged state, or fresh with the planted fiction
const lin = STATE_IN ? JSON.parse(fs.readFileSync(STATE_IN, 'utf8')).lineages
  : Array.from({ length: K }, () => {
      const S = zero(), D = zero(); for (const e of ['1>2', '2>4', '4>5']) { S[e] = d; D[e] = d; }
      return { V: zero(), S, D };
    });
for (const L of lin) {
  if (INTERVENTION.startsWith('erase27')) { L.S['2>7'] = 0; L.D['2>7'] = 0; }
  if (INTERVENTION === 'erase27_blankcode') for (const e of EDGES) L.V[e] = 0; // her code wiped at the same moment
  if (INTERVENTION === 'eraseDetour') for (const e of ['1>2', '2>7', '7>8']) { L.S[e] = 0; L.D[e] = 0; }
}
const nS = Number(SEASONS), seasons = [];
const tickOffset = STATE_IN ? JSON.parse(fs.readFileSync(STATE_IN, 'utf8')).ticksDone : 0;
const st = lin.map(() => ({ r: null, z: null, i: 0 }));
const birth = k => {
  const L = lin[k], s = st[k]; s.r = new R(); s.r.qabbala.setGates(GATES); s.z = [s.r.getCurrentZone()]; s.i = 0;
  s.r.exitBonus = (x, y) => { const e = key(x, y); return (learner ? wV * (L.V[e] ?? 0) : 0) + wH * Math.tanh((L.S[e] ?? 0) + (L.D[e] ?? 0)); };
};
for (let k = 0; k < K; k++) birth(k);
for (let season = 0; season < nS; season++) {
  const deaths = Array(K).fill(0), routes = [];
  if (process.env.S05C_SEASON_REBIRTH === '1' && season > 0) for (let k = 0; k < K; k++) birth(k); // each season opens with a fresh life at zone 0
  for (let k = 0; k < K; k++) {
    const L = lin[k], s = st[k], used = new Set();
    for (let n = 1; n <= T; n++) {
      const tick = tickOffset + season * T + n;
      const from = s.z.at(-1), to = s.r.step(`${WORLD}|${k}|${tick}`).lastTransition.to; s.z.push(to); s.i++;
      const e = key(from, to); used.add(e);
      if (e in L.S) L.S[e] += a;
      for (const f of EDGES) { const v = L.S[f]; L.S[f] = v * (1 - lamS); L.D[f] = L.D[f] + kappa * v - lamD * L.D[f]; }
      if (to === 5) {
        for (const f of finalExcursion(s.z)) { L.S[f] += A; if (learner) L.V[f] += eta * (-1 - L.V[f]); }
        deaths[k]++; birth(k); continue;
      }
      const t = s.i - H;
      if (learner && t >= 0) { const ek = key(s.z[t], s.z[t + 1]); if (ek in L.V) L.V[ek] += eta * (refrain(s.z, t) - L.V[ek]); }
      if (s.z.length > 4 * H) { s.z = s.z.slice(-2 * H); s.i = s.z.length - 1; } // bounded history; refrain needs 2H
      // the runtime's choices read only its last 48 memory events; dropping older ones leaves every path
      // identical (checked over 60,000 steps) and keeps deathless 400,000-tick lives inside memory
      if (n % 1000 === 0) { const ev = s.r.getMemory().getEvents(); if (ev.length > 48) ev.splice(0, ev.length - 48); }
    }
    routes.push(used.size);
  }
  const pull = e => lin.reduce((x, L) => x + Math.tanh(L.S[e] + L.D[e]), 0) / K;
  const mean = f => lin.reduce((x, L) => x + f(L), 0) / K;
  seasons.push({ season, deaths, deathsTotal: deaths.reduce((x, y) => x + y, 0), routes: routes.reduce((x, y) => x + y, 0) / K,
    pull: Object.fromEntries(['1>2', '2>7', '7>8', '2>4', '4>5'].map(e => [e, +pull(e).toFixed(4)])),
    V: Object.fromEntries(['4>5', '2>4', '1>2', '2>7'].map(e => [e, +mean(L => L.V[e]).toFixed(4)])) });
}
fs.writeFileSync(OUT, JSON.stringify({ world: WORLD, dose: DOSE, intervention: INTERVENTION, seasons,
  lineages: lin, ticksDone: tickOffset + nS * T }) + '\n');
const last = seasons.at(-1);
console.log(JSON.stringify({ world: WORLD, dose: DOSE, intervention: INTERVENTION, lastDeaths: last.deathsTotal, routes: +last.routes.toFixed(2),
  pull27: last.pull['2>7'], pull45: last.pull['4>5'], V45: last.V['4>5'] }));
