#!/usr/bin/env node
// Compare independently verified, matched-body live-pointer engineering traces.
import fs from 'node:fs';
import readline from 'node:readline';

const [leftPath, rightPath, leftReceiptPath, rightReceiptPath] = process.argv.slice(2);
if (!rightReceiptPath) throw new Error('usage: node compare_live_wplus_traces.mjs LEFT RIGHT LEFT_RECEIPT RIGHT_RECEIPT');
const aReceipt = JSON.parse(fs.readFileSync(leftReceiptPath, 'utf8'));
const bReceipt = JSON.parse(fs.readFileSync(rightReceiptPath, 'utf8'));
if (aReceipt.status !== 'PASS' || bReceipt.status !== 'PASS' || aReceipt.world !== bReceipt.world ||
    aReceipt.lineage !== bReceipt.lineage || aReceipt.overlaySha256 !== bReceipt.overlaySha256 ||
    aReceipt.moduleSha256 !== bReceipt.moduleSha256 || aReceipt.prefix699Digest !== bReceipt.prefix699Digest) {
  throw new Error('Traces were not independently verified as a matched prefix');
}
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const makeReader = path => readline.createInterface({ input: fs.createReadStream(path), crlfDelay: Infinity })[Symbol.asyncIterator]();
const ai = makeReader(leftPath), bi = makeReader(rightPath);
const intervals = { before: { steps: 0, differentDestinations: 0 },
  exposed: { steps: 0, differentDestinations: 0 }, withdrawn: { steps: 0, differentDestinations: 0 } };
let atIntervention = null, firstDifferentDestination = null, steps = 0;
for (;;) {
  const [av, bv] = await Promise.all([ai.next(), bi.next()]);
  if (av.done !== bv.done) throw new Error('Trace length mismatch');
  if (av.done) break;
  const a = JSON.parse(av.value), b = JSON.parse(bv.value);
  if (a.kind !== b.kind) throw new Error('Event kind mismatch');
  if (a.kind !== 'STEP') continue;
  steps++;
  if (a.tick !== b.tick || a.tick !== steps || a.inputDigest !== b.inputDigest) throw new Error('Unmatched ticks or ordinary input');
  const interval = steps < 700 ? intervals.before : steps <= 5300 ? intervals.exposed : intervals.withdrawn;
  interval.steps++;
  if (a.to !== b.to) { interval.differentDestinations++; if (firstDifferentDestination === null) firstDifferentDestination = steps; }
  if (steps < 700 && (a.from !== b.from || a.to !== b.to || a.organDigest !== b.organDigest ||
      a.houseDigest !== b.houseDigest || a.transitionDigest !== b.transitionDigest ||
      a.liveLoop.address !== b.liveLoop.address || !eq(a.liveLoop.bankAfter, b.liveLoop.bankAfter))) {
    throw new Error('Matched states differ before intervention');
  }
  if (steps === 700) {
    atIntervention = { sameOrganAfterMutation: a.organDigest === b.organDigest,
      sameHouse: a.houseDigest === b.houseDigest, sameFeedback: eq(a.liveLoop.actualFeedback, b.liveLoop.actualFeedback),
      sameSourceStateBefore: eq(a.liveLoop.bankBefore, b.liveLoop.bankBefore),
      left: { derivedAddress: a.liveLoop.derived.address, usedAddress: a.liveLoop.address,
        symbol: a.liveLoop.emittedSymbol, selectedEdge: a.liveLoop.selectedEdge },
      right: { derivedAddress: b.liveLoop.derived.address, usedAddress: b.liveLoop.address,
        symbol: b.liveLoop.emittedSymbol, selectedEdge: b.liveLoop.selectedEdge } };
  }
}
if (steps !== 20160 || !atIntervention) throw new Error('Incomplete paired traces');
console.log(JSON.stringify({ status: 'PASS', world: aReceipt.world,
  arms: [{ mode: aReceipt.mode, pointer: aReceipt.pointerMode, mutation: aReceipt.mutationMode },
         { mode: bReceipt.mode, pointer: bReceipt.pointerMode, mutation: bReceipt.mutationMode }],
  firstDifferentDestination, atIntervention, intervals,
  note: 'Exploratory matched fixture: an engineered causal comparison, not a discovered organisation.' }, null, 2));
