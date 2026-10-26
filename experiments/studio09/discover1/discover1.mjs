// DISCOVER-1: does a receptor that learns from its own deaths do better than one that doesn't?
// Uses the E1C machinery unchanged (episode receptor, META1 UCB gate, sensors, Outside tapes, Studio 03
// lineage/house). The loop below follows e1c_integrated_runner.mjs step for step, without per-tick traces.
//
//   node discover1.mjs <runtimeDir> <worldId> <seedHex> <arm> <out.json> [yokedRewards.json]
//   arm: feedback | fixed | yoked      (feedback also writes carry and reset held-out results)
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { E1CEpisodeReceptor, E1C_EPISODE_WINDOW } from '../e1c/e1c_episode_receptor.mjs';
import { e1EncounterInput, e1TransferInput } from '../code/e1_outside_tapes.mjs';
import { SENSOR_IDS } from '../../studio08/code/closed_circuit_sensors.mjs';
import { S1LearningCueGate, S1_CUE_STRENGTH, S1_REWARD_WINDOW } from '../../studio08/code/learning_cue_gate.mjs';

const EDGES = ['0>9','1>8','2>7','3>6','4>5','1>2','2>4','4>7','7>8','8>9','9>1'];
const a = 0.002, A = 1, wV = 0.5, wH = 0.35, lamS = 0.002, kappa = 0.0005, lamD = 0.00005, H = 24, eta = 1 / 8;
const key = (x, y) => `${x}>${y}`, zero = () => Object.fromEntries(EDGES.map(e => [e, 0]));
const sha = s => createHash('sha256').update(s).digest('hex');
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
function afterTransition(L, z, i, from, to) {
  const e = key(from, to); if (e in L.S) L.S[e] += a;
  for (const f of EDGES) { const s = L.S[f]; L.S[f] = s * (1 - lamS); L.D[f] = L.D[f] + kappa * s - lamD * L.D[f]; }
  if (to === 5) { for (const f of finalExcursion(z)) { L.S[f] += A; L.V[f] += eta * (-1 - L.V[f]); } return true; }
  const t = i - H;
  if (t >= 0) { const ek = key(z[t], z[t + 1]); if (ek in L.V) L.V[ek] += eta * (refrain(z, t) - L.V[ek]); }
  return false;
}

// Yoked control: identical receptor, but each completed episode is credited with the reward that another
// world's feedback receptor earned for its episode of the same index. It can rewire just as readily; its
// credit is unrelated to its own life. completeTransition is E1CEpisodeReceptor's, with one substitution.
class YokedReceptor extends E1CEpisodeReceptor {
  constructor(rewards) { super('feedback'); this.yoked = rewards; }
  completeTransition({ tick, from, to, death }) {
    const p = this.pendingEpisode;
    const edge = from + '>' + to; if (!p.edges.includes(edge)) p.edges.push(edge);
    p.age++;
    if (!death && p.age < E1C_EPISODE_WINDOW) return null;
    const ownReward = death ? -1 : Math.max(0, Math.min(1, (p.edges.length - 4) / 7));
    const reward = this.yoked[this.completedEpisodes % this.yoked.length]; // the one substitution
    const credit = { id: p.id, startTick: p.startTick, endTick: tick, episodeTransitions: p.age, sensor: p.sensor,
      initialEncoding: p.encoding, distinctEdges: p.edges.length, death, reward, ownReward };
    let structuralChange = null;
    if (death) this.fatalEpisodes++;
    this.completedEpisodes++;
    if (p.sensor !== null) {
      const sensor = p.sensor; this.episodesBySensor[sensor]++;
      if (!this.frozen && p.encoding === this.wiring[sensor]) {
        const w = this.window[sensor];
        w.values.push(reward); if (w.values.length > 8) w.values.shift();
        w.sum = w.values.reduce((x, y) => x + y, 0); w.n = w.values.length; this.sinceFlip[sensor]++;
        if (w.n >= 8 && w.sum / w.n < -0.25 && this.switches[sensor] < 4 && this.sinceFlip[sensor] >= 24) {
          const old = this.wiring[sensor], settledMean = w.sum / w.n;
          this.wiring[sensor] = 1 - old; this.switches[sensor]++; this.sinceFlip[sensor] = 0;
          this.window[sensor] = { values: [], sum: 0, n: 0 };
          structuralChange = { sequence: this.events.length + 1, sensor, from: old, to: 1 - old, triggeringEpisode: p.id,
            settledMean, deathEpisodesInWindow: w.values.filter(x => x === -1).length };
          this.events.push(structuralChange);
        }
      }
    }
    this.lastEndTick = tick; this.pendingEpisode = null;
    return { credit, structuralChange };
  }
}

async function main() {
  const [dir, worldId, seed, arm, out, yokedPath] = process.argv.slice(2);
  const { AmeliaNumogramSubstrateRuntime: R } = await import(`${dir}/substrate/ameliaNumogramSubstrateRuntime.ts`);
  // genesis: Studio 03 schedule, as in E1C
  const L = { V: zero(), S: zero(), D: zero() }; let genesisDeaths = 0;
  for (let g = 0; g < 24; g++) {
    const r = new R(); r.exitBonus = (x, y) => wV * L.V[key(x, y)] + wH * Math.tanh(L.S[key(x, y)] + L.D[key(x, y)]);
    const z = [r.getCurrentZone()];
    for (let i = 1; i <= 5000; i++) { const from = z.at(-1), to = r.step(`S1G|${seed}|${g}|${i}`).lastTransition.to; z.push(to); if (afterTransition(L, z, i, from, to)) { genesisDeaths++; break; } }
  }
  const S = { L, gate: new S1LearningCueGate('adaptive'),
    receptor: arm === 'yoked' ? new YokedReceptor(JSON.parse(fs.readFileSync(yokedPath, 'utf8'))) : new E1CEpisodeReceptor(arm === 'fixed' ? 'fixed' : 'feedback'),
    pending: new Map(), snaps: [], deaths: 0, life: 0, i: 0, z: null, r: null, target: null, steps: 0, rewards: [] };
  const born = () => {
    S.r = new R(); S.z = [S.r.getCurrentZone()]; S.i = 0;
    S.r.exitBonus = (x, y) => { const e = key(x, y); return wV * (S.L.V[e] ?? 0) + wH * Math.tanh((S.L.S[e] ?? 0) + (S.L.D[e] ?? 0)) + (S.target !== null && y === S.target ? S1_CUE_STRENGTH : 0); };
  };
  const stamp = () => ({ house: { surface: { ...S.L.S }, deep: { ...S.L.D } }, code: { V: { ...S.L.V } } });
  born(); S.snaps.push(stamp());
  const step = (input, tick) => {
    const proposals = S.snaps.length >= 25 ? S.receptor.propose(S.snaps.slice(-25)) : SENSOR_IDS.map(id => ({ id, target: null }));
    const d = S.gate.choose(proposals); S.target = d.target;
    if (S.receptor.pendingEpisode === null) S.receptor.beginEpisode({ tick, sensor: d.sensor });
    if (d.token) S.pending.set(d.token, { start: S.gate.tick, edges: new Set() });
    const from = S.z.at(-1), to = S.r.step(input).lastTransition.to; S.z.push(to); S.i++; S.steps++;
    const edge = key(from, to), death = afterTransition(S.L, S.z, S.i, from, to);
    for (const p of S.pending.values()) p.edges.add(edge);
    const res = S.receptor.completeTransition({ tick, from, to, death });
    if (res?.credit) S.rewards.push(res.credit.reward);
    for (const [tok, p] of [...S.pending]) if (death || S.gate.tick === p.start + S1_REWARD_WINDOW - 1) {
      S.gate.settle(tok, { observedAt: S.gate.tick, distinctEdges: p.edges.size, deathWithin24: death }); S.pending.delete(tok);
    }
    if (death) { S.deaths++; S.life++; born(); }
    S.snaps.push(stamp()); if (S.snaps.length > 25) S.snaps.shift();
    return death;
  };
  const encDeaths = [0, 0];
  for (let t = 1; t <= 10000; t++) { const season = t <= 5000 ? 1 : 2; if (step(e1EncounterInput(seed, season, ((t - 1) % 5000) + 1, 'ordered'), t)) encDeaths[season - 1]++; }
  const encRewards = S.rewards.slice();
  const rec = S.receptor;
  const encounter = { deathsFirstHalf: encDeaths[0], deathsSecondHalf: encDeaths[1], episodes: rec.completedEpisodes,
    fatalEpisodes: rec.fatalEpisodes, structuralChanges: rec.events.map(e => ({ sensor: e.sensor, to: e.to, episode: e.triggeringEpisode })), wiring: { ...rec.wiring } };
  // held-out transfer, exactly as E1C freezeTransfer + transfer
  const boundary = { L: deep(S.L), gate: S.gate.exportState(), receptor: rec.exportState(), snaps: deep(S.snaps), runtime: S.r.exportState(),
    z: deep(S.z), i: S.i, life: S.life, steps: S.steps, target: S.target, deaths: S.deaths };
  const heldOut = reset => {
    S.L = deep(boundary.L); S.gate = new S1LearningCueGate('adaptive').importState(boundary.gate);
    // frozen at the boundary, so no further credit is used; the yoked list is irrelevant here
    const Rc = arm === 'yoked' ? new YokedReceptor([0]) : new E1CEpisodeReceptor(arm === 'fixed' ? 'fixed' : 'feedback');
    S.receptor = Rc.importState(boundary.receptor); S.pending = new Map(); S.snaps = deep(boundary.snaps);
    S.z = deep(boundary.z); S.i = boundary.i; S.life = boundary.life; S.steps = boundary.steps; S.target = boundary.target; S.deaths = boundary.deaths;
    S.r = new R(); S.r.importState(boundary.runtime);
    S.r.exitBonus = (x, y) => { const e = key(x, y); return wV * (S.L.V[e] ?? 0) + wH * Math.tanh((S.L.S[e] ?? 0) + (S.L.D[e] ?? 0)) + (S.target !== null && y === S.target ? S1_CUE_STRENGTH : 0); };
    const g = S.gate.exportState(); g.pending = {}; S.gate.importState(g);
    S.receptor.freezeAtBoundary(S.steps); if (reset) S.receptor.resetWiring();
    let n = 0; for (let t = 1; t <= 2000; t++) if (step(e1TransferInput(seed, t <= 1000 ? 1 : 2, ((t - 1) % 1000) + 1), 10000 + t)) n++;
    return n;
  };
  const result = { worldId, seed, arm, genesisDeaths, encounter, encounterRewards: encRewards,
    heldOutDeaths: heldOut(false), heldOutDeathsReset: arm === 'feedback' ? heldOut(true) : null };
  fs.writeFileSync(out, JSON.stringify(result) + '\n');
  console.log(JSON.stringify({ worldId, arm, d1: encDeaths[0], d2: encDeaths[1], changes: encounter.structuralChanges.length,
    heldOut: result.heldOutDeaths, reset: result.heldOutDeathsReset }));
}
await main();
