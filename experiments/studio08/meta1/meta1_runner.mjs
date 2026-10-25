// STUDIO08 META1 — committed Studio01–04 source-based meta-learning assay.
 // NEW scientific version, no Studio07 executable source requested or implied.
 // The evolving coupled learner+house is preserved; each paired arm receives
 // IDENTICAL deterministic fresh input, so this is an OPEN-input experiment,
 // NOT a no-Outside or closed-circuit result. Frozen model update order.
 // Designed and preregistered before any META1 registered seed run.
// The living: unchanged canonical runtime per life, lineage code V. The house: surface S and deep D.
// Dynamics, constants and update order are copied from experiments/studio/code/two_subjects.mjs
// ("contested_learn": a=0.002, A=1, wV=0.5). Sensors and selector are the committed Studio 08 modules.
//
//   node s1_committed_runner.mjs genesis <runtimeDir> <worldId> <seedHex> <checkpoint.json>
//   node s1_committed_runner.mjs run <runtimeDir> <checkpoint.json> <worldId> <intact|lesion> <arm> <trace.jsonl.gz> <summary.json>
//
// Genesis is the only phase that receives input. The test phase steps with no input at all.
import fs from 'node:fs';
import zlib from 'node:zlib';
import { createHash } from 'node:crypto';
import { closedCircuitSensorCandidates, SENSOR_IDS } from '../code/closed_circuit_sensors.mjs';
import { S1LearningCueGate, S1_CUE_STRENGTH, S1_REWARD_WINDOW } from '../code/learning_cue_gate.mjs';

const EDGES = ['0>9','1>8','2>7','3>6','4>5','1>2','2>4','4>7','7>8','8>9','9>1'];
const a = 0.002, A = 1, wV = 0.5, wH = 0.35, lamS = 0.002, kappa = 0.0005, lamD = 0.00005, H = 24, eta = 1 / 8;
const GENESIS_GENERATIONS = 24, GENESIS_CAP = 5000;
const SEASON_TICKS = 5000, SEASONS = 7, LESION = -5, LESION_EDGE = '2>7';
const ARMS = ['adaptive','round_robin','no_cue'];
const SCENARIOS = ['intact','lesion'];
const key = (x, y) => `${x}>${y}`;
const zero = () => Object.fromEntries(EDGES.map(e => [e, 0]));
const sha = s => createHash('sha256').update(s).digest('hex');
const fail = m => { throw new Error(m); };

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
// One Studio 03 tick of lineage bookkeeping after a transition; returns true on death.
function afterTransition(L, z, i, from, to) {
  const e = key(from, to); if (e in L.S) L.S[e] += a;
  for (const f of EDGES) { const s = L.S[f]; L.S[f] = s * (1 - lamS); L.D[f] = L.D[f] + kappa * s - lamD * L.D[f]; }
  if (to === 5) {
    for (const f of finalExcursion(z)) { L.S[f] += A; L.V[f] += eta * (-1 - L.V[f]); }
    return true;
  }
  const t = i - H;
  if (t >= 0) { const ek = key(z[t], z[t + 1]); if (ek in L.V) L.V[ek] += eta * (refrain(z, t) - L.V[ek]); }
  return false;
}
const lineageJson = L => JSON.stringify({ V: EDGES.map(e => L.V[e]), S: EDGES.map(e => L.S[e]), D: EDGES.map(e => L.D[e]) });

async function loadRuntime(dir) {
  return (await import(`${dir}/substrate/ameliaNumogramSubstrateRuntime.ts`)).AmeliaNumogramSubstrateRuntime;
}

async function genesis(dir, worldId, seedHex, out) {
  const pilot = /^META1-P([01])$/.exec(worldId);
  const registered = /^META1-W(0[0-9]|[12][0-9]|3[01])$/.test(worldId);
  if (!pilot && !registered) fail('META1 only: 32 registered worlds or P0/P1 engineering QA');
  const expected = pilot ? sha('STUDIO08-META1-PILOT-V1|' + worldId)
                         : sha('STUDIO08-META1-V1|' + worldId);
  if (seedHex !== expected) fail('seed does not match registered derivation');
  const R = await loadRuntime(dir);
  const L = { V: zero(), S: zero(), D: zero() };
  let deaths = 0;
  for (let g = 0; g < GENESIS_GENERATIONS; g++) {
    const r = new R();
    r.exitBonus = (x, y) => wV * L.V[key(x, y)] + wH * Math.tanh(L.S[key(x, y)] + L.D[key(x, y)]);
    const z = [r.getCurrentZone()];
    for (let i = 1; i <= GENESIS_CAP; i++) {
      const from = z.at(-1); const to = r.step(`S1G|${seedHex}|${g}|${i}`).lastTransition.to; z.push(to);
      if (afterTransition(L, z, i, from, to)) { deaths++; break; }
    }
  }
  const body = lineageJson(L);
  const ck = { schema: 'STUDIO08_S1_COMMITTED_CHECKPOINT_V1', worldId, seedHex, generations: GENESIS_GENERATIONS,
    cap: GENESIS_CAP, genesisDeaths: deaths, edges: EDGES, lineage: JSON.parse(body), lineageSha256: sha(body) };
  fs.writeFileSync(out, JSON.stringify(ck) + '\n');
  console.log(JSON.stringify({ worldId, lineageSha256: ck.lineageSha256, genesisDeaths: deaths }));
}

function asmTarget(zh, L) {
  const zones = zh.slice(-24).join(',');
  const v = EDGES.map(e => L.V[e].toFixed(6)).join(',');
  const h = EDGES.map(e => (L.S[e] + L.D[e]).toFixed(6)).join(',');
  return parseInt(sha(`SELF|${zones}|${v}|${h}`).slice(0, 2), 16) % 10;
}

async function run(dir, ckPath, worldId, scenario, arm, tracePath, summaryPath) {
  if (!ARMS.includes(arm) || !SCENARIOS.includes(scenario)) fail('unknown arm or scenario');
  const ck = JSON.parse(fs.readFileSync(ckPath, 'utf8'));
  if (ck.worldId !== worldId || sha(JSON.stringify(ck.lineage)) !== ck.lineageSha256) fail('checkpoint identity');
  const R = await loadRuntime(dir);
  const L = { V: {}, S: {}, D: {} };
  EDGES.forEach((e, k) => { L.V[e] = ck.lineage.V[k]; L.S[e] = ck.lineage.S[k]; L.D[e] = ck.lineage.D[k]; });
  const learning = arm === 'adaptive' || arm === 'round_robin';
  const gate = learning ? new S1LearningCueGate(arm) : null;
  const pending = new Map(); // token -> {start, edges:Set}
  const snaps = []; const snap = () => ({ house: { surface: { ...L.S }, deep: { ...L.D } }, code: { V: { ...L.V } } });
  const rows = [];
  let life = 0, r, z, i, target = null, lesionActive = false, options = [];
  const zh = []; // continuous lineage zone history (all lives), for asm_textual only
  const stateDigest = (tick) => sha(JSON.stringify({ tick, life, lifeStep: i, zone: z.at(-1), lineage: JSON.parse(lineageJson(L)) }));
  const born = () => {
    r = new R(); z = [r.getCurrentZone()]; i = 0;
    r.exitBonus = (x, y) => {
      const e = key(x, y), code = wV * (L.V[e] ?? 0), house = wH * Math.tanh((L.S[e] ?? 0) + (L.D[e] ?? 0));
      const lesion = lesionActive && e === LESION_EDGE ? LESION : 0, cue = target !== null && y === target ? S1_CUE_STRENGTH : 0;
      options.push({ to: y, code: +code.toFixed(9), house: +house.toFixed(9), lesion, cue });
      return code + house + lesion + cue;
    };
    zh.push(z[0]);
  };
  born(); snaps.push(snap());
  const season = { deaths: Array(SEASONS).fill(0), segments: Array.from({ length: SEASONS }, () => []) };
  let segEdges = new Set();
  const selCount = Object.fromEntries(SENSOR_IDS.map(s => [s, 0])); let cueTicks = 0, zone2Opp = 0, zone2To7 = 0;
  const T = SEASON_TICKS * SEASONS;
  for (let tick = 1; tick <= T; tick++) {
    const sIdx = Math.floor((tick - 1) / SEASON_TICKS);
    lesionActive = scenario === 'lesion' && sIdx === 0;
    if ((tick - 1) % SEASON_TICKS === 0 && tick > 1) { season.segments[sIdx - 1].push(segEdges.size); segEdges = new Set(); }
    const pre = stateDigest(tick - 1);
    const warm = snaps.length >= 25;
    const cands = (arm !== 'no_cue' && arm !== 'asm_textual' && warm) ? closedCircuitSensorCandidates(snaps.slice(-25)) : null;
    let decision = null; target = null;
    if (learning) {
      decision = gate.choose(cands ? cands.map(c => ({ id: c.id, target: c.target })) : SENSOR_IDS.map(id => ({ id, target: null })));
      target = decision.target;
      if (decision.token) { pending.set(decision.token, { start: tick, edges: new Set() }); selCount[decision.sensor]++; }
      if (gate.tick !== tick) fail('selector clock out of step with model clock');
    } else if (arm === 'fixed_surface_decline24' && cands) target = cands[0].target;
    else if (arm === 'fixed_house_flux24' && cands) target = cands[1].target;
    else if (arm === 'asm_textual' && zh.length >= 24) target = asmTarget(zh, L);
    options = [];
    const from = z.at(-1);
    // Common deterministic source is shared by all paired arms in this world.
    // It is not a self-generated cue and must not be called closed-circuit.
    const input = 'STUDIO08-META1-INPUT-V1|' + ck.seedHex + '|' + tick;
    const to = r.step(input).lastTransition.to; z.push(to); i++; zh.push(to);
    if (from === 2) { zone2Opp++; if (to === 7) zone2To7++; }
    if (target !== null) cueTicks++;
    const edge = key(from, to); segEdges.add(edge);
    const death = afterTransition(L, z, i, from, to);
    const credits = [];
    if (learning) {
      for (const p of pending.values()) p.edges.add(edge);
      for (const [tok, p] of [...pending]) {
        if (death || tick === p.start + S1_REWARD_WINDOW - 1) {
          const s = gate.settle(tok, { observedAt: tick, distinctEdges: [...p.edges].filter(e => EDGES.includes(e)).length, deathWithin24: death });
          credits.push({ token: tok, decisionTick: p.start, observedAt: tick, deathWithin24: death, reward: s.reward });
          pending.delete(tok);
        }
      }
    }
    if (death) { season.deaths[sIdx]++; season.segments[sIdx].push(segEdges.size); segEdges = new Set(); life++; }
    const row = { schema: 'S1_COMMITTED_MODEL_RAW_TRANSITION_V1', worldId, scenario, arm, tick, season: sIdx + 1, life: death ? life - 1 : life,
      sourceInput: 'STUDIO08-META1-INPUT-V1|' + ck.seedHex + '|' + tick, from, to, death, lesionActive, preChoiceStateSha256: pre, postChoiceStateSha256: null,
      candidateReadouts: cands ? cands.map(c => c.target) : null, selectedTarget: target,
      selectedSensor: decision?.sensor ?? (target === null ? null : arm), selectedCueMagnitude: target === null ? 0 : S1_CUE_STRENGTH,
      selectedToken: decision?.token ?? null, options, creditsSettled: credits, pendingRewards: pending.size };
    if (death) born();
    snaps.push(snap()); if (snaps.length > 25) snaps.shift();
    // post-state digest is taken after rebirth bookkeeping, so it equals the next row's pre-state digest
    row.postChoiceStateSha256 = stateDigest(tick);
    // These hashes describe lineage and counters, NOT the complete runtime;
    // stronger claims need independently audited full-substrate snapshots.
    rows.push(JSON.stringify(row));
  }
  season.segments[SEASONS - 1].push(segEdges.size);
  const jsonl = rows.join('\n') + '\n';
  const gz = zlib.gzipSync(Buffer.from(jsonl), { level: 9 });
  fs.writeFileSync(tracePath, gz);
  const seg = season.segments[SEASONS - 1], mean = seg.reduce((s, x) => s + x, 0) / seg.length;
  const pull = e => Math.tanh(L.S[e] + L.D[e]);
  const summary = { schema: 'STUDIO08_META1_REGISTERED_RUN_SUMMARY_V1', worldId, scenario, arm,
    initialWorldSha256: ck.lineageSha256, traceSha256: sha(gz), traceJsonlSha256: sha(jsonl), traceRows: rows.length,
    lastSeasonDeaths: season.deaths[SEASONS - 1], lesionSeasonDeaths: season.deaths[0], deathsBySeason: season.deaths,
    lastSeasonRoutes: mean, lastSeasonPull27: pull('2>7'), lastSeasonPull45: pull('4>5'),
    cueActiveTicks: cueTicks, sensorSelections: learning ? selCount : null,
    learnedReceiverFinalState: learning ? gate.exportState() : null,
    zone2Opportunities: zone2Opp, zone2To7, lives: life + 1,
    censoredCredits: pending.size, finalLineageSha256: sha(lineageJson(L)) };
  fs.writeFileSync(summaryPath, JSON.stringify(summary) + '\n');
  console.log(JSON.stringify({ worldId, scenario, arm, deaths: season.deaths, routes: +mean.toFixed(3), pull27: +summary.lastSeasonPull27.toFixed(3) }));
}

const [cmd, ...args] = process.argv.slice(2);
if (cmd === 'genesis') await genesis(...args);
else if (cmd === 'run') await run(...args);
else fail('usage: genesis|run');
