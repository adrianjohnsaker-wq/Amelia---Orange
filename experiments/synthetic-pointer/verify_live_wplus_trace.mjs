#!/usr/bin/env node
// Reconstruct pointer, source dynamics, actual feedback, gates and PFM events.
import fs from 'node:fs';
import readline from 'node:readline';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

const [tracePath, summaryPath, statePath, overlayPath, runtimeDir, modulePath, donorPath] = process.argv.slice(2);
if (!modulePath) throw new Error('usage: node verify_live_wplus_trace.mjs TRACE S0 STATE_S0 OVERLAY RUNTIME MODULE [DONOR]');
const { pointerReading, mutateOrgan, feedbackFromBody, initialBank, advanceBank,
        counterfactualFeedback, shuffledIndices } = await import(pathToFileURL(modulePath).href);
const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const stat = fs.statSync(tracePath);
const fd = fs.openSync(tracePath, 'r');
const finalByte = Buffer.alloc(1);
fs.readSync(fd, finalByte, 0, 1, stat.size - 1); fs.closeSync(fd);
if (finalByte[0] !== 10) throw new Error('Partial trace line');
let previous = null, header = null, footer = null, pfmChain = '0'.repeat(64), bank = initialBank();
let previousAddress = null, frozenAddress = null, lastZone = null, steps = 0, lines = 0;
let activeTicks = 0, choicesWithAlternatives = 0, addressChanges = 0, samples = 0;
let absoluteDose = 0, squaredDose = 0, differentFeedback = 0, feedbackStateEffects = 0, feedbackSymbolEffects = 0;
let mutation = null, atMutation = null, prefix = '0'.repeat(64), donor = null, order = null;
const sourceTicks = { A: 0, B: 0 }, routeCounts = {};
for await (const line of readline.createInterface({ input: fs.createReadStream(tracePath), crlfDelay: Infinity })) {
  lines++;
  const record = JSON.parse(line), { recordHash, ...body } = record;
  if (record.previousHash !== previous || hash(body) !== recordHash) throw new Error('Trace chain mismatch');
  previous = recordHash;
  if (record.kind === 'START') {
    if (header || record.sequence !== 1) throw new Error('Unexpected header');
    header = record;
    if (header.status !== 'ENDOGENOUS_LIVE_LOOP_ENGINEERING' ||
        header.runtimeIdentity !== 'INGRESS1_VT_M_HASHES_CHECKED_ON_START' ||
        header.nativePfmHeadAvailable !== false || header.topologyEdgeCount !== 30 ||
        header.pointerGovernance !== 'SCHEDULED_EXTERNAL_INTERVENTION_NOT_GOVERNOR_GATED' ||
        header.governorRecord !== 'AUDIT_ONLY' || header.settings.externalStream !== false ||
        header.pointer.start !== 501 || header.pointer.end !== 5300 || header.pointer.mutationAt !== 700 ||
        header.pointer.scoreDelta !== -0.05 || header.source.timing !== 'PRE_STEP_BODY_STATE') {
      throw new Error('Unexpected live-loop identity');
    }
    if (hash(fs.readFileSync(overlayPath, 'utf8')) !== header.overlaySha256 ||
        hash(fs.readFileSync(modulePath, 'utf8')) !== header.source.moduleSha256) throw new Error('Source hash mismatch');
    for (const [name, digest] of Object.entries(header.runtimeHashes)) {
      if (hash(fs.readFileSync(runtimeDir + '/' + name, 'utf8')) !== digest) throw new Error('Runtime hash mismatch: ' + name);
    }
    if (['replay','shuffled'].includes(header.source.mode)) {
      if (!donorPath) throw new Error('Missing donor file');
      const donorText = fs.readFileSync(donorPath, 'utf8');
      if (hash(donorText) !== header.source.donorSha256) throw new Error('Donor hash mismatch');
      donor = JSON.parse(donorText);
      if (donor.version !== 1 || donor.donor.mode !== 'live' || donor.sensors.length !== 4800 ||
          !eq(donor.donor, header.source.donor)) throw new Error('Donor identity mismatch');
      if (header.source.mode === 'shuffled') order = shuffledIndices(4800, header.source.shuffleSeed);
    } else if (header.source.donorSha256 !== null || donorPath) throw new Error('Unexpected donor');
    continue;
  }
  if (!header) throw new Error('Missing header');
  if (record.kind === 'FINISH') { if (footer) throw new Error('Duplicate footer'); footer = record; continue; }
  if (footer || record.kind !== 'STEP') throw new Error('Unexpected trace event');
  steps++;
  if (record.sequence !== steps + 1 || record.tick !== steps || (lastZone !== null && record.from !== lastZone)) {
    throw new Error('Trajectory discontinuity');
  }
  lastZone = record.to;
  const loop = record.liveLoop, b = loop.body;
  if (b.zone !== record.from || loop.previousAddress !== previousAddress) throw new Error('Body/pointer sequence mismatch');
  const organ = { w: [b.w0, b.w1], th: [0, b.theta1, b.theta2] };
  const derived = pointerReading(organ, previousAddress);
  if (!eq(derived, loop.derived)) throw new Error('Address was not derived from recorded organ state');
  if (steps === 700 && header.pointer.mutation !== 'none') {
    mutation = loop.mutation;
    if (!mutation || hash(mutation.preOrgan) !== mutation.preOrganDigest) throw new Error('Missing intervention source state');
    const expected = mutateOrgan(mutation.preOrgan, previousAddress, header.pointer.mutation);
    for (const key of ['mode','before','after','targetTheta','matchedDelta','actualL2']) {
      if (!eq(expected.event[key], mutation[key])) throw new Error('Organ intervention mismatch: ' + key);
    }
    if (hash(expected.organ) !== record.organDigest) throw new Error('Organ intervention was not applied as recorded');
    if (header.pointer.mode === 'frozen') frozenAddress = expected.event.before.address;
  } else if (loop.mutation !== null) throw new Error('Unexpected organ intervention');
  if (previousAddress !== null && derived.address !== previousAddress) addressChanges++;
  previousAddress = derived.address;
  const address = frozenAddress ?? derived.address;
  if (loop.address !== address || loop.frozenAddress !== frozenAddress) throw new Error('Incorrect source address');
  const active = header.source.mode !== 'sham' && steps >= 501 && steps <= 5300;
  if (loop.active !== active || record.pointerActive !== active) throw new Error('Incorrect source timing');
  if (active) { activeTicks++; sourceTicks[address]++; if (record.options.length > 1) choicesWithAlternatives++; }
  const actual = feedbackFromBody(b.zone, organ, b.houseS, b.houseD, b.houseE);
  if (!eq(actual, loop.actualFeedback)) throw new Error('Feedback was not derived from the body');
  let delivered = null, donorIndex = null;
  if (active && header.source.mode === 'live') delivered = actual;
  if (active && donor) {
    const ordinal = steps - 501;
    donorIndex = order ? order[ordinal] : ordinal;
    delivered = donor.sensors[donorIndex];
  }
  if (!eq(delivered, loop.deliveredFeedback) || donorIndex !== loop.donorIndex) throw new Error('Feedback stream mismatch');
  if (active && !eq(delivered, actual)) differentFeedback++;
  if (!eq(bank, loop.bankBefore)) throw new Error('Source-state discontinuity');
  const expected = advanceBank(bank, address, delivered);
  const alternative = active ? advanceBank(bank, address, counterfactualFeedback(delivered)) : null;
  if (!eq(expected.bank, loop.bankAfter) || expected.symbol !== loop.emittedSymbol ||
      !eq(alternative?.bank ?? null, loop.counterfactualBank) ||
      (alternative?.symbol ?? null) !== loop.counterfactualSymbol) throw new Error('Live source transition mismatch');
  if (active && !eq(expected.bank, alternative.bank)) feedbackStateEffects++;
  if (active && expected.symbol !== alternative.symbol) feedbackSymbolEffects++;
  bank = expected.bank;
  if (active && !record.options.length) throw new Error('No open gate');
  const selected = active ? record.options[expected.symbol % record.options.length] : null;
  const selectedEdge = selected ? selected.source + '>' + selected.target : null;
  if (loop.selectedEdge !== selectedEdge || record.options.filter(x => x.pointerEdge).length !== (active ? 1 : 0)) {
    throw new Error('Source signal was not applied to the expected gate');
  }
  if (steps === 700 && mutation) atMutation = { priorAddress: mutation.before.address,
    derivedAddress: derived.address, usedAddress: address, emittedSymbol: expected.symbol,
    selectedEdge, actualFeedback: actual, bankBefore: loop.bankBefore };
  let chosen = record.from, best = -Infinity;
  for (const option of record.options) {
    if (option.source !== record.from || option.pointerEdge !== (option.source + '>' + option.target === selectedEdge)) {
      throw new Error('Gate/source mismatch');
    }
    const expectedDelta = option.pointerEdge ? -0.05 : 0;
    if (!Number.isFinite(option.unscaledHouse) || Math.abs(option.pointerDelta - expectedDelta) > 1e-12) throw new Error('Dose mismatch');
    absoluteDose += Math.abs(option.pointerDelta); squaredDose += option.pointerDelta ** 2;
    const p = option.parts, score = p.gate + p.memory + p.activation + p.phase + p.input + p.organHouse;
    if (Math.abs(score - option.score) > 1e-10) throw new Error('Gate score mismatch');
    if (score > best) { best = score; chosen = option.target; }
  }
  if (chosen !== record.to) throw new Error('Gate winner mismatch');
  const pfm = record.pfmEvent;
  if (pfm.blockIndex !== steps || pfm.fromZone !== record.from || pfm.targetZone !== record.to ||
      pfm.eventDigest !== record.transitionDigest || pfm.inputDigest !== record.inputDigest) throw new Error('PFM passage mismatch');
  pfmChain = hash(pfmChain + '|' + pfm.eventDigest);
  if (pfmChain !== record.supplementalPfmChain) throw new Error('Supplemental PFM chain mismatch');
  if (record.stateSample) {
    const s = record.stateSample;
    if (hash(s.organ) !== record.organDigest || hash({ V: s.V, S: s.S, D: s.D, E: s.E }) !== record.houseDigest ||
        s.organ.w[0] !== b.w0 || s.organ.w[1] !== b.w1 || s.organ.th[1] !== b.theta1 || s.organ.th[2] !== b.theta2 ||
        s.S['1>8'] !== b.houseS || s.D['1>8'] !== b.houseD || s.E['1>8'] !== b.houseE) throw new Error('Body sample mismatch');
    for (const option of record.options) {
      const edge = option.source + '>' + option.target;
      const house = 0.35 * Math.tanh(s.S[edge] + s.D[edge] + s.E[edge]);
      const total = 0.5 * s.V[edge] + house + option.pointerDelta + (record.selfCue === option.target ? 0.35 : 0);
      if (Math.abs(house - option.unscaledHouse) > 1e-12 || Math.abs(total - option.parts.organHouse) > 1e-12) {
        throw new Error('Sampled score mismatch');
      }
    }
    samples++;
  }
  const edge = record.from + '>' + record.to;
  routeCounts[edge] = (routeCounts[edge] || 0) + 1;
  if (steps < 700) prefix = hash(prefix + '|' + JSON.stringify({ tick: steps, from: record.from, to: record.to,
    inputDigest: record.inputDigest, transitionDigest: record.transitionDigest, organDigest: record.organDigest,
    houseDigest: record.houseDigest, address: loop.address, bankAfter: loop.bankAfter }));
}
if (!header || !footer || footer.sequence !== lines || footer.ticks !== header.expectedTicks ||
    steps !== header.expectedTicks || footer.supplementalPfmChain !== pfmChain) throw new Error('Incomplete trace');
if (Math.abs(absoluteDose - activeTicks * 0.05) > 1e-7 || Math.abs(squaredDose - activeTicks * 0.05 ** 2) > 1e-7 ||
    activeTicks !== (header.source.mode === 'sham' ? 0 : 4800)) throw new Error('Total dose mismatch');
if ((header.pointer.mutation === 'none') !== (mutation === null)) throw new Error('Missing organ intervention');
const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8')), saved = JSON.parse(fs.readFileSync(statePath, 'utf8'));
const sort = o => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
let runtimeState = footer.runtimeState;
if (footer.runtimeStateSidecar) {
  const sidecar = footer.runtimeStateSidecar;
  if (sidecar.encoding !== 'gzip-json' || path.basename(sidecar.name) !== sidecar.name || sidecar.events !== steps) {
    throw new Error('Invalid native-runtime sidecar');
  }
  const bytes = fs.readFileSync(path.join(path.dirname(tracePath), sidecar.name));
  if (createHash('sha256').update(bytes).digest('hex') !== sidecar.sha256) throw new Error('Runtime sidecar hash mismatch');
  runtimeState = JSON.parse(gunzipSync(bytes).toString('utf8'));
}
if (!runtimeState || runtimeState.memoryState.events.length !== steps) throw new Error('Missing native PFM events');
let nativeChain = '0'.repeat(64);
for (const event of runtimeState.memoryState.events) nativeChain = hash(nativeChain + '|' + event.eventDigest);
if (nativeChain !== pfmChain) throw new Error('Native PFM events differ from the recorded chain');
if (summary.length !== 1 || !eq(sort(routeCounts), sort(summary[0].ec)) || !eq(footer.seasonEndState, saved[0]) ||
    runtimeState.memoryState.events.length !== steps) throw new Error('Season-end record mismatch');
console.log(JSON.stringify({ status: 'PASS', world: header.world, lineage: header.lineage, steps,
  mode: header.source.mode, pointerMode: header.pointer.mode, mutationMode: header.pointer.mutation,
  pointerAddressChanges: addressChanges, sourceTicks, activeTicks, absoluteDose, squaredDose,
  choicesWithAlternatives, deliveredDifferentFromBodyTicks: differentFeedback,
  feedbackStateCounterfactualTicks: feedbackStateEffects, feedbackSymbolCounterfactualTicks: feedbackSymbolEffects,
  rawStateSamples: samples, mutation, atMutation, prefix699Digest: prefix, independentlyRecomputedHead: previous,
  sourceRunnerSha256: header.sourceRunnerSha256, overlaySha256: header.overlaySha256,
  moduleSha256: header.source.moduleSha256, donorSha256: header.source.donorSha256,
}, null, 2));
