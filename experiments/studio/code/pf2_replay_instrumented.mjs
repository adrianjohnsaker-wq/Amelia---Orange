// PF-2 "The Receiver" — reference implementation (studio).
// A lineage of Amelias on a continuous clock. Each individual is the unchanged canonical runtime; the lineage carries one
// memory V over the 11 canonical edges, read at every exit choice as +W_V * V(e), added last to the canonical score.
// V learns by the refrain signal (AM3 o''): an edge that departs the recent territory (zones of the previous 24 steps) and
// returns to it within 24 steps earns r = (new edges in the excursion)/11; otherwise 0. At absorption (entry to zone 5),
// each distinct edge of the final excursion (AM5) receives one update toward -1; pending outcomes in the window are dropped.
// Update: V <- V + (o - V)/8. On absorption a successor is born at zone 0 with a fresh canonical runtime and the same V.
// Mode 'learner' uses V; mode 'unchanged' never reads or writes V (control: reborn unchanged Amelias).
// Inputs: one string per tick; the canonical runtime hashes it to a cue zone (first byte of SHA-256 mod 10).
import fs from 'node:fs';
import { createHash } from 'node:crypto';
const [M, mode, CHUNKDIR, OUT] = process.argv.slice(2);
const files = fs.readdirSync(CHUNKDIR).filter(f => f.endsWith('.json')).sort();
const RAND = [];
for (const f of files) for (const row of JSON.parse(fs.readFileSync(`${CHUNKDIR}/${f}`, 'utf8')).rows) RAND.push(row.randomness);
const pf2Input = (hex, k) => k === 0 ? Buffer.from(hex, 'hex').toString('hex') : createHash('sha256').update(Buffer.concat([Buffer.from('PF2-REF-' + k + '|', 'ascii'), Buffer.from(hex, 'hex')])).digest('hex');
const K = '9', TICKS = String(RAND.length), NS = 'PF2LIVE';
const { AmeliaNumogramSubstrateRuntime } = await import(`${M}/substrate/ameliaNumogramSubstrateRuntime.ts`);
const { CANONICAL_GATES } = await import(`${M}/ai/numogram/AmeliaQabbalaInterface.ts`);
const W_V = 0.5, H = 24, ETA = 1 / 8, nK = Number(K), nT = Number(TICKS);
const EDGES = ['0>9','1>8','2>7','3>6','4>5','1>2','2>4','4>7','7>8','8>9','9>1'];
const key = (x, y) => `${x}>${y}`;
const cueOf = s => parseInt(createHash('sha256').update(s.trim()).digest('hex').slice(0, 2), 16) % 10;
const OUT_OF = { 0: [9], 1: [8, 2], 2: [7, 4], 3: [6], 4: [5, 7], 5: [], 6: [], 7: [8], 8: [9], 9: [1] };

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

const lineages = [];
for (let k = 0; k < nK; k++) {
  const V = Object.fromEntries(EDGES.map(e => [e, 0]));
  const lives = [], choice = { 1: { cuedPit: 0, followPit: 0, cuedOther: 0, followOther: 0 }, 2: { cuedPit: 0, followPit: 0, cuedOther: 0, followOther: 0 }, 4: { cuedPit: 0, followPit: 0, cuedOther: 0, followOther: 0, uncued: 0, uncuedPit: 0 } };
  const PIT = { 1: 2, 2: 4, 4: 5 };
  let r = null, z = null, born = 0; const trace = createHash('sha256'); const zl = [], cl = [], dl = [], lifeStart = [0];
  const birth = tick => { r = new AmeliaNumogramSubstrateRuntime(); if (mode === 'learner') r.exitBonus = (x, y) => W_V * V[key(x, y)]; z = [r.getCurrentZone()]; born = tick; };
  birth(0);
  for (let tick = 1; tick <= nT; tick++) {
    const input = pf2Input(RAND[tick - 1], k), cue = cueOf(input), from = z.at(-1);
    const biasBefore = r.getMemory().readMemoryBias().biasVector;
    const snap = r.step(input); const to = snap.lastTransition.to; z.push(to); trace.update(`${tick}:${to};`);
    let code = 0;
    const opts = r.getQabbala().getGates().filter(g => g.isOpen && g.source === from);
    if (opts.length > 1) {
      const comp = opts.map(g => { const zt = snap.zones[g.target];
        return { t: g.target, base: g.flux * (1 - g.resistance) + (biasBefore[g.target] || 0) * 0.4 + zt.activation * 0.2 + Math.cos(zt.phaseAngle) * 0.1,
          cue: cue === g.target ? 0.35 : 0, v: mode === 'learner' ? W_V * V[key(from, g.target)] : 0 }; });
      const pick = f => comp.reduce((b, c) => (f(c) > f(b) ? c : b)).t;
      const full = pick(c => c.base + c.cue + c.v);
      if (full !== to) throw new Error(`decomposition mismatch k${k} t${tick}`);
      code = 8; // a real choice
      if (pick(c => c.base + c.v) !== full) code |= 1;   // the Outside's cue settles it
      if (pick(c => c.base + c.cue) !== full) code |= 2; // her lineage memory settles it
    }
    zl.push(to); cl.push(cue); dl.push(code);
    if (PIT[from] !== undefined) { // a real choice point
      const c = choice[from], pit = PIT[from];
      if (OUT_OF[from].includes(cue)) { if (cue === pit) { c.cuedPit++; if (to === pit) c.followPit++; } else { c.cuedOther++; if (to === cue) c.followOther++; } }
      else if (from === 4) { c.uncued++; if (to === pit) c.uncuedPit++; }
    }
    if (to === 5) {
      const fin = finalExcursion(z);
      if (mode === 'learner') for (const e of fin) V[e] += ETA * (-1 - V[e]);
      lives.push({ bornTick: born, length: tick - born, cuedIntoSink: cue === 5, finalExcursion: fin });
      lifeStart.push(tick); birth(tick); continue;
    }
    const i = z.length - 1, t = i - H;
    if (mode === 'learner' && t >= 0) { const ek = key(z[t], z[t + 1]); if (ek in V) V[ek] += ETA * (refrain(z, t) - V[ek]); }
  }
  lineages.push({ k, traceSha256: trace.digest('hex'), zones: zl, cues: cl, decisions: dl, lifeStart, lives, openLife: nT - born, finalV: Object.fromEntries(EDGES.map(e => [e, Number(V[e].toFixed(6))])), choice });
}
fs.writeFileSync(OUT, JSON.stringify({ mode, ticks: nT, ns: NS, W_V, H, ETA, lineages }));
const all = lineages.flatMap(l => l.lives);
const late = lineages.flatMap(l => l.lives.slice(3));
console.log(JSON.stringify({ mode, lineages: nK, ticks: nT, deaths: all.length, deathsPerLineage: +(all.length / nK).toFixed(2),
  lateDeaths: late.length, lateCuedIntoSink: late.filter(x => x.cuedIntoSink).length,
  medianOpenLife: lineages.map(l => l.openLife).sort((a, b) => a - b)[Math.floor(nK / 2)] }));
