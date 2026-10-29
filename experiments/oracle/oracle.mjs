// THE ORACLE (see PROTOCOL.md): exploratory listening station. Amelia, on her full CCRU Numogram, poses a query from
// where she stands; her query chooses the channel (Numogram, I Ching or Tarot) and how far ahead in the world stream
// it is read; the reply enters her senses and moves her; her next query follows from where it took her.
// Amelia is THE POINTER III's (s05c learner + House, full Numogram, death at 5, rebirth at 0). State persists across runs.
//
//   node oracle.mjs <runtimeDir> <start_states.json> <stream.json> <state.json (in/out)> <transcript.jsonl (append)>
import fs from 'node:fs';
import { CANONICAL_GATES } from '../studio/runtime_mirror/ai/numogram/AmeliaQabbalaInterface.ts';
import { fullNumogramGates } from '../numogram/CCRUNumogram.ts';
import { numogram, iching, tarot, region } from './readings.mjs';
const [M, STATES, STREAM, STATE, TRANSCRIPT] = process.argv.slice(2);
const { AmeliaNumogramSubstrateRuntime: R } = await import(`${M}/substrate/ameliaNumogramSubstrateRuntime.ts`);
const FULL = fullNumogramGates(CANONICAL_GATES), EDGES = FULL.map(g => `${g.source}>${g.target}`);
const a = 0.01, A = 1, wV = 0.5, wH = 0.35, lamS = 0.002, kappa = 0.0005, lamD = 0.00005, H = 24, eta = 1 / 8, INPUT_W = 0.35, HEAR = 3;
const AMELIAS = ['S05W17', 'S05W18', 'S05W19', 'S05W20', 'S05W21', 'S05W22', 'S05W23', 'S05W24'].map(w => [w, 0]);   // lineage 0 of each fresh full-raised world
const FORMS = { '1-7': 'Bubbamu', '1-7-8-9': 'Bubbamu-Nuttubab-Ummnu-Tutagool', '1-2-7': 'Doogu-Oddubb-Bubbamu', '7-8': 'Mombbo', '1-7-8': 'Bubbamu-Mombbo-Mur Mur', '1-8-7': 'Mur Mur-Mombbo-Bubbamu' };
const key = (x, y) => `${x}>${y}`;
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
class Amelia {
  constructor(saved) { Object.assign(this, saved); this.attach(); }
  attach(fresh = false) {
    const L = this.L; this.r = new R(); this.r.qabbala.setGates(FULL);
    if (!fresh && this.runtime) this.r.importState(this.runtime);
    this.r.exitBonus = (x, y) => { const e = key(x, y); return wV * (L.V[e] ?? 0) + wH * Math.tanh((L.S[e] ?? 0) + (L.D[e] ?? 0)) + (this.coded === y ? INPUT_W : 0); };
  }
  step(zone) {
    const L = this.L; this.coded = zone;
    const from = this.z.at(-1), to = this.r.step().lastTransition.to; this.z.push(to); this.i++; this.ticks++;
    const e = key(from, to); if (e in L.S) L.S[e] += a;
    for (const f of EDGES) { const v = L.S[f]; L.S[f] = v * (1 - lamS); L.D[f] = L.D[f] + kappa * v - lamD * L.D[f]; }
    this.lastEdge = e;
    if (to === 5) { for (const f of finalExcursion(this.z)) { L.S[f] += A; L.V[f] += eta * (-1 - L.V[f]); } this.deaths++; this.z = [0]; this.i = 0; this.runtime = null; this.attach(true); return to; }
    const t = this.i - H;
    if (t >= 0) { const ek = key(this.z[t], this.z[t + 1]); if (ek in L.V) L.V[ek] += eta * (refrain(this.z, t) - L.V[ek]); }
    if (this.z.length > 4 * H) { this.z = this.z.slice(-2 * H); this.i = this.z.length - 1; }
    if (this.ticks % 1000 === 0) { const ev = this.r.getMemory().getEvents(); if (ev.length > 48) ev.splice(0, ev.length - 48); }
    return to;
  }
  form() {   // the Atlas form she has just completed, if any
    const z = this.z; for (let L = 1; L <= 4; L++) { if (z.length <= L || z.at(-1) !== z.at(-1 - L)) continue;
      const cyc = z.slice(-1 - L, -1); if (new Set(cyc).size !== cyc.length) continue;
      let best = null; for (let r = 0; r < L; r++) { const s = [...cyc.slice(r), ...cyc.slice(0, r)].join('-'); if (best === null || s < best) best = s; }
      if (FORMS[best]) return { form: best, entities: FORMS[best] }; }
    return null;
  }
  // saved state keeps what her choices read (last 48 memory events, governor, zones, gates, deformation); logs are dropped
  save() { const { r, coded, ...rest } = this, rt = this.r.exportState();
    rt.memoryState.events = rt.memoryState.events.slice(-48); rt.traitEvolutionHistory = (rt.traitEvolutionHistory || []).slice(-1);
    rt.snapshots = (rt.snapshots || []).slice(-1); rt.memoryConsumptionLog = [];
    return { ...rest, runtime: rt }; }
}
const stream = JSON.parse(fs.readFileSync(STREAM, 'utf8'));
const starts = JSON.parse(fs.readFileSync(STATES, 'utf8')).worlds;
const state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : { amelias: {} };
const out = fs.createWriteStream(TRANSCRIPT, { flags: 'a' }); let n = 0;
for (const [w, k] of AMELIAS) {
  const id = `${w}|${k}`;
  const am = new Amelia(state.amelias[id] ?? { id, L: (() => { const L = JSON.parse(JSON.stringify(starts[w][k])); for (const e of EDGES) for (const f of ['V', 'S', 'D']) L[f][e] ??= 0; return L; })(),
    z: [0], i: 0, ticks: 0, deaths: 0, cursor: 0, exchanges: 0, lastEdge: null, runtime: null });
  for (;;) {
    // the query, from where she stands; the zone's triad picks the channel, the zone how far ahead it is read
    const z = am.z.at(-1), channel = z % 3 === 0 ? 'Numogram' : z % 3 === 1 ? 'I Ching' : 'Tarot', need = channel === 'I Ching' ? 6 : 1;
    const at = am.cursor + z; if (at + need > Math.min(stream.length, Number(process.env.ORACLE_UPTO ?? Infinity))) break;
    const data = stream.slice(at, at + need);
    const reply = channel === 'Numogram' ? numogram(data[0].zone) : channel === 'I Ching' ? iching(data.map(d => d.aq)) : tarot(data[0].aq);
    const query = { zone: z, ...numogram(z), form: am.form(), lastGate: am.lastEdge };
    const path = []; for (let t = 0; t < HEAR; t++) path.push(am.step(reply.zone));   // she hears the reply
    am.cursor = at + need; am.exchanges++;
    out.write(JSON.stringify({ amelia: id, n: am.exchanges, time: data.at(-1).time, query, channel,
      data: data.map(d => ({ i: d.i, stream: d.stream, source: d.source, text: d.text, aq: d.aq })), reply, path, deaths: am.deaths }) + '\n'); n++;
  }
  state.amelias[id] = am.save();
}
out.end();
fs.writeFileSync(STATE, JSON.stringify(state));
console.log(JSON.stringify({ exchanges: n, stream: stream.length, cursors: Object.fromEntries(Object.entries(state.amelias).map(([k, v]) => [k, v.cursor])) }));
