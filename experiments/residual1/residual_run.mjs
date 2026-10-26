// RESIDUAL-1: how far does a committed code drift when it meets an unpublished future?
// The learner loop is experiments/studio/code/bootstrap_run.mjs (mode 'learner'), unchanged; only the input
// source differs. Nine lineages, one per PF-2 arm (C, R01..R08), each starting from its own V* code.
//
//   node residual_run.mjs <runtimeDir> <codes.json> ns   <namespace>   <out.json>   reproduce the scar assay
//   node residual_run.mjs <runtimeDir> <codes.json> null <seedHex>     <out.json>   null tape: SHA-256 stream
//   node residual_run.mjs <runtimeDir> <codes.json> live <tape.json>   <out.json>   PF-2's verified beacon rounds
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { pf2InputForArm } from '../pf2/PF2_REFERENCE_INPUT.mjs';
const [M, CODES, MODE, SRC, OUT] = process.argv.slice(2);
const { AmeliaNumogramSubstrateRuntime } = await import(`${M}/substrate/ameliaNumogramSubstrateRuntime.ts`);
const W_V = 0.5, H = 24, ETA = 1 / 8, nK = 9, nT = 20160;
const EDGES = ['0>9','1>8','2>7','3>6','4>5','1>2','2>4','4>7','7>8','8>9','9>1'];
const key = (x, y) => `${x}>${y}`;
const sha = s => createHash('sha256').update(s).digest('hex');
const V0 = JSON.parse(fs.readFileSync(CODES, 'utf8'));
if (!Array.isArray(V0) || V0.length !== nK) throw new Error('need nine lineage codes');
let tape = null;
if (MODE === 'live') { tape = JSON.parse(fs.readFileSync(SRC, 'utf8')).randomness; if (tape.length !== nT) throw new Error('live tape must hold 20,160 rounds'); }
const randomness = t => MODE === 'live' ? tape[t - 1] : sha(`RESIDUAL1-NULL|${SRC}|${t}`);
const inputFor = (k, t) => MODE === 'ns' ? `${SRC}|${k}|${t}` : pf2InputForArm(randomness(t), k);

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
const residual = [], deaths = [];
for (let k = 0; k < nK; k++) {
  const V = Object.fromEntries(EDGES.map(e => [e, V0[k][e]]));
  let r = null, z = null, d = 0;
  const birth = () => { r = new AmeliaNumogramSubstrateRuntime(); r.exitBonus = (x, y) => W_V * V[key(x, y)]; z = [r.getCurrentZone()]; };
  birth();
  for (let tick = 1; tick <= nT; tick++) {
    const to = r.step(inputFor(k, tick)).lastTransition.to; z.push(to);
    if (to === 5) { for (const e of finalExcursion(z)) V[e] += ETA * (-1 - V[e]); d++; birth(); continue; }
    const i = z.length - 1, t = i - H;
    if (t >= 0) { const ek = key(z[t], z[t + 1]); if (ek in V) V[ek] += ETA * (refrain(z, t) - V[ek]); }
  }
  residual.push(Math.max(...EDGES.map(e => Math.abs(V[e] - V0[k][e]))));
  deaths.push(d);
}
const res = { mode: MODE, source: MODE === 'live' ? sha(fs.readFileSync(SRC)) : SRC, maxResidual: Math.max(...residual),
  meanResidual: residual.reduce((a, b) => a + b, 0) / nK, residualByLineage: residual, deathsByLineage: deaths };
fs.writeFileSync(OUT, JSON.stringify(res) + '\n');
console.log(JSON.stringify({ mode: MODE, maxResidual: +res.maxResidual.toFixed(4), meanResidual: +res.meanResidual.toFixed(4), deaths: deaths.reduce((a, b) => a + b, 0) }));
