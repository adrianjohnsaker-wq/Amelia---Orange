#!/usr/bin/env node
// Independently verify the scheduled intervention and the W+ trace.
import fs from 'node:fs';
import { createHash } from 'node:crypto';

const [tracePath, summaryPath, statePath, overlayPath, runtimeDir, schedulePath] = process.argv.slice(2);
if (!schedulePath) throw new Error('usage: node verify_wplus_scheduled_trace.mjs TRACE S0 STATE_S0 OVERLAY RUNTIME_DIR SCHEDULE');
const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const scheduleText = fs.readFileSync(schedulePath, 'utf8');
const schedule = JSON.parse(scheduleText);
const text = fs.readFileSync(tracePath, 'utf8');
if (!text.endsWith('\n')) throw new Error('Partial trace line');
const lines = text.slice(0, -1).split('\n');
let previous = null, header = null, footer = null, pfmChain = '0'.repeat(64);
let lastZone = null, steps = 0, activeTicks = 0, affectedChoices = 0, samples = 0;
let realisedAbsoluteDelta = 0, realisedSquaredDelta = 0;
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
  const mask = window ? [window.edge] : [];
  const active = !!window;
  if (record.pointerActive !== active) throw new Error('Incorrect pointer timing');
  if (active) { activeTicks++; scheduledEdgeTicks[window.edge] = (scheduledEdgeTicks[window.edge] || 0) + 1; }
  let chosen = record.from, best = -Infinity;
  for (const option of record.options) {
    if (option.source !== record.from || option.pointerEdge !== mask.includes(option.source + '>' + option.target)) {
      throw new Error('Invalid gate option or pointer label');
    }
    const p = option.parts;
    const expectedDelta = option.pointerEdge ? (schedule.factor - 1) * option.unscaledHouse : 0;
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
const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
const savedState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
if (summary.length !== 1 || JSON.stringify(sort(routeCounts)) !== JSON.stringify(sort(summary[0].ec))) throw new Error('Trace counts disagree with original summary');
if (JSON.stringify(footer.seasonEndState) !== JSON.stringify(savedState[0])) throw new Error('Season-end state mismatch');
if (footer.runtimeState.memoryState.events.length !== steps) throw new Error('Native PFM event count mismatch');
function sort(o) { return Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b))); }
console.log(JSON.stringify({
  status: 'PASS', steps, traceRecords: lines.length, topologyEdges: header.topologyEdgeCount,
  pointerActiveTicks: activeTicks, pointerAffectedGateOptions: affectedChoices,
  scheduledEdgeTicks, scheduledAbsoluteDose: activeTicks * (1 - schedule.factor),
  scheduledSquaredDose: activeTicks * (1 - schedule.factor) ** 2,
  realisedAbsoluteDelta, realisedSquaredDelta,
  rawStateSamples: samples, nativePfmEvents: footer.runtimeState.memoryState.events.length,
  independentlyRecomputedHead: previous, prefix500Digest: prefix,
  sourceRunnerSha256: header.sourceRunnerSha256, overlaySha256: header.overlaySha256,
  runtimeIdentity: header.runtimeIdentity,
}, null, 2));
