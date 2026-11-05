#!/usr/bin/env node
// Independently verify source exposure, challenge, PFM and W+ transition trace.
import fs from 'node:fs';
import { createHash } from 'node:crypto';

const [tracePath, summaryPath, statePath, overlayPath, runtimeDir, schedulePath] = process.argv.slice(2);
if (!schedulePath) throw new Error('usage: node verify_wplus_challenge_trace.mjs TRACE S0 STATE_S0 OVERLAY RUNTIME_DIR SCHEDULE');
const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const scheduleText = fs.readFileSync(schedulePath, 'utf8');
const schedule = JSON.parse(scheduleText);
const text = fs.readFileSync(tracePath, 'utf8');
if (!text.endsWith('\n')) throw new Error('Partial trace line');
const lines = text.slice(0, -1).split('\n');
let previous = null, header = null, footer = null, pfmChain = '0'.repeat(64);
let lastZone = null, steps = 0, activeTicks = 0, affectedChoices = 0, samples = 0;
let realisedAbsoluteDelta = 0, realisedSquaredDelta = 0;
let choicesWithAlternatives = 0;
let challengeReference = null, injuryEvents = 0, plantedRepairEvents = 0;
const scheduledEdgeTicks = {};
let prefix = '0'.repeat(64);
const routeCounts = {};
for (const line of lines) {
  const record = JSON.parse(line);
  const { recordHash, ...body } = record;
  if (record.sequence !== steps + (header ? 2 : 1) && record.kind !== 'FINISH') {
    throw new Error('Unexpected sequence');
  }
  if (record.previousHash !== previous || hash(body) !== recordHash) throw new Error('Trace chain mismatch');
  previous = recordHash;
  if (record.kind === 'START') {
    if (header || record.sequence !== 1) throw new Error('Unexpected header');
    header = record;
    if (header.runtimeIdentity !== 'INGRESS1_VT_M_HASHES_CHECKED_ON_START' ||
        header.nativePfmHeadAvailable !== false || header.topologyEdgeCount !== 30 ||
        header.pointerGovernance !== 'SCHEDULED_EXTERNAL_INTERVENTION_NOT_GOVERNOR_GATED' || header.governorRecord !== 'AUDIT_ONLY' ||
        header.settings.externalStream !== false) throw new Error('Unexpected run identity');
    if (hash(fs.readFileSync(overlayPath, 'utf8')) !== header.overlaySha256) throw new Error('Overlay hash mismatch');
    if (hash(scheduleText) !== header.pointer.scheduleSha256 ||
        JSON.stringify(schedule) !== JSON.stringify(header.pointer.schedule)) throw new Error('Schedule mismatch');
    if (header.status !== 'SYNTHETIC_SOURCE_CHALLENGE' ||
        header.pointer.selector !== 'LABEL_MODULO_OPEN_GATE_COUNT_IN_RUNTIME_ORDER' ||
        Math.abs(header.pointer.scoreDelta + 0.05) > 1e-12) throw new Error('Incorrect dose model');
    if (!['none','injured','positive'].includes(header.challenge.mode) || header.challenge.at !== 12000 ||
        header.challenge.readAt !== 12100 || header.challenge.component !== 'S' ||
        header.challenge.additionPerEdge !== 0.1 || header.challenge.plantedGain !== 0.55) {
      throw new Error('Incorrect challenge definition');
    }
    for (const [name, digest] of Object.entries(header.runtimeHashes)) {
      if (hash(fs.readFileSync(runtimeDir + '/' + name, 'utf8')) !== digest) throw new Error('Runtime hash mismatch: ' + name);
    }
    continue;
  }
  if (!header) throw new Error('Missing header');
  if (record.kind === 'FINISH') { footer = record; continue; }
  if (footer || record.kind !== 'STEP') throw new Error('Unexpected record');
  steps++;
  if (record.tick !== steps || (lastZone !== null && record.from !== lastZone)) throw new Error('Trajectory discontinuity');
  lastZone = record.to;
  const window = schedule.windows.find(w => steps >= w.start && steps <= w.end);
  const active = !!window;
  if (record.pointerActive !== active) throw new Error('Incorrect pointer timing');
  if (steps > 5300 && active) throw new Error('Synthetic source was not withdrawn');
  if (active) { activeTicks++; scheduledEdgeTicks[window.edge] = (scheduledEdgeTicks[window.edge] || 0) + 1; }
  if (active && !record.options.length) throw new Error('No available gate for active pointer');
  let mask = [];
  if (active) {
    const [source, target] = window.edge.split('>').map(Number);
    const selected = record.options[(10 * source + target) % record.options.length];
    mask = [selected.source + '>' + selected.target];
    if (record.options.length > 1) choicesWithAlternatives++;
  }
  if (record.options.filter(option => option.pointerEdge).length !== (active ? 1 : 0)) {
    throw new Error('Expected exactly one exposed gate on each active tick');
  }
  let chosen = record.from, best = -Infinity;
  for (const option of record.options) {
    if (option.source !== record.from || option.pointerEdge !== mask.includes(option.source + '>' + option.target)) {
      throw new Error('Invalid gate option or pointer label');
    }
    const p = option.parts;
    const expectedDelta = option.pointerEdge ? header.pointer.scoreDelta : 0;
    if (!Number.isFinite(option.unscaledHouse) || !Number.isFinite(option.pointerDelta) ||
        Math.abs(expectedDelta - option.pointerDelta) > 1e-12) throw new Error('Pointer magnitude mismatch');
    realisedAbsoluteDelta += Math.abs(option.pointerDelta);
    realisedSquaredDelta += option.pointerDelta * option.pointerDelta;
    const score = p.gate + p.memory + p.activation + p.phase + p.input + p.organHouse;
    if (Math.abs(score - option.score) > 1e-10) throw new Error('Incorrect recorded score');
    if (active && option.pointerEdge) affectedChoices++;
    if (score > best) { best = score; chosen = option.target; }
  }
  if (chosen !== record.to) throw new Error('Recorded winner disagrees with passage');
  const pfm = record.pfmEvent;
  if (pfm.blockIndex !== steps || pfm.fromZone !== record.from || pfm.targetZone !== record.to ||
      pfm.eventDigest !== record.transitionDigest || pfm.inputDigest !== record.inputDigest) throw new Error('PFM passage mismatch');
  pfmChain = hash(pfmChain + '|' + pfm.eventDigest);
  if (pfmChain !== record.supplementalPfmChain) throw new Error('Supplemental PFM chain mismatch');
  if (record.stateSample) {
    const s = record.stateSample;
    if (hash(s.organ) !== record.organDigest || hash({ V: s.V, S: s.S, D: s.D, E: s.E }) !== record.houseDigest) {
      throw new Error('State sample digest mismatch');
    }
    for (const option of record.options) {
      const edge = option.source + '>' + option.target;
      const house = 0.35 * Math.tanh(s.S[edge] + s.D[edge] + s.E[edge]);
      const total = 0.5 * s.V[edge] + house + option.pointerDelta + (record.selfCue === option.target ? 0.35 : 0);
      if (Math.abs(house - option.unscaledHouse) > 1e-12 || Math.abs(total - option.parts.organHouse) > 1e-12) {
        throw new Error('Sampled house/pointer score mismatch');
      }
    }
    samples++;
  }
  const challenge = record.challenge;
  if (steps === 12000) {
    if (!challenge || challenge.kind !== 'INJURY' || challenge.mode !== header.challenge.mode || !record.stateSample) {
      throw new Error('Missing recorded injury');
    }
    challengeReference = challenge.reference;
    const keys = Object.keys(challengeReference);
    if (keys.length !== 30 || JSON.stringify([...keys].sort()) !== JSON.stringify(Object.keys(challenge.delta).sort())) {
      throw new Error('Incorrect injury edge set');
    }
    for (const edge of keys) {
      const expected = header.challenge.mode === 'none' ? 0 : 0.1;
      if (Math.abs(challenge.delta[edge] - expected) > 1e-12 ||
          Math.abs(record.stateSample.S[edge] - challengeReference[edge] - expected) > 1e-12) {
        throw new Error('Incorrect injury magnitude');
      }
    }
    injuryEvents++;
  } else if (header.challenge.mode === 'positive' && steps > 12000 && steps <= 12100) {
    if (!challenge || challenge.kind !== 'PLANTED_REPAIR' || challenge.mode !== 'positive' || !challengeReference) {
      throw new Error('Missing planted repair');
    }
    for (const edge of Object.keys(challengeReference)) {
      const expected = 0.55 * (challengeReference[edge] - challenge.before[edge]);
      if (Math.abs(challenge.delta[edge] - expected) > 1e-12 ||
          (record.stateSample && Math.abs(record.stateSample.S[edge] - challenge.before[edge] - expected) > 1e-12)) {
        throw new Error('Incorrect planted repair');
      }
    }
    plantedRepairEvents++;
  } else if (challenge !== null) throw new Error('Unexpected challenge action');
  const edge = record.from + '>' + record.to;
  routeCounts[edge] = (routeCounts[edge] || 0) + 1;
  if (steps <= 500) prefix = hash(prefix + '|' + JSON.stringify({
    tick: record.tick, from: record.from, to: record.to, inputDigest: record.inputDigest,
    selfCue: record.selfCue, transitionDigest: record.transitionDigest,
    organDigest: record.organDigest, houseDigest: record.houseDigest,
  }));
}
if (!header || !footer || footer.sequence !== lines.length || footer.ticks !== header.expectedTicks ||
    steps !== header.expectedTicks || footer.supplementalPfmChain !== pfmChain) throw new Error('Incomplete run');
if (injuryEvents !== 1 || plantedRepairEvents !== (header.challenge.mode === 'positive' ? 100 : 0)) {
  throw new Error('Incorrect number of challenge events');
}
if (Math.abs(realisedAbsoluteDelta - activeTicks * Math.abs(header.pointer.scoreDelta)) > 1e-7 ||
    Math.abs(realisedSquaredDelta - activeTicks * header.pointer.scoreDelta ** 2) > 1e-7) {
  throw new Error('Realised score-dose mismatch');
}
const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
const savedState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
if (summary.length !== 1 || JSON.stringify(sort(routeCounts)) !== JSON.stringify(sort(summary[0].ec))) throw new Error('Trace counts disagree with original summary');
if (JSON.stringify(footer.seasonEndState) !== JSON.stringify(savedState[0])) throw new Error('Season-end state mismatch');
if (footer.runtimeState.memoryState.events.length !== steps) throw new Error('Native PFM event count mismatch');
function sort(o) { return Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b))); }
console.log(JSON.stringify({
  status: 'PASS', steps, traceRecords: lines.length, topologyEdges: header.topologyEdgeCount,
  pointerActiveTicks: activeTicks, pointerAffectedGateOptions: affectedChoices,
  scheduledEdgeTicks, scheduledAbsoluteDose: activeTicks * Math.abs(header.pointer.scoreDelta),
  scheduledSquaredDose: activeTicks * header.pointer.scoreDelta ** 2,
  realisedAbsoluteDelta, realisedSquaredDelta, choicesWithAlternatives,
  challengeMode: header.challenge.mode, injuryEvents, plantedRepairEvents,
  rawStateSamples: samples, nativePfmEvents: footer.runtimeState.memoryState.events.length,
  independentlyRecomputedHead: previous, prefix500Digest: prefix,
  sourceRunnerSha256: header.sourceRunnerSha256, overlaySha256: header.overlaySha256,
  runtimeIdentity: header.runtimeIdentity,
}, null, 2));
