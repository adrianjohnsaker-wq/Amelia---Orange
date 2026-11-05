#!/usr/bin/env node
// Compare independently verified live and feedback-replay engineering traces.
import fs from 'node:fs';
import readline from 'node:readline';
const [leftPath, rightPath, leftReceiptPath, rightReceiptPath] = process.argv.slice(2);
if (!rightReceiptPath) throw new Error('usage: node compare_live_feedback.mjs LEFT RIGHT LEFT_RECEIPT RIGHT_RECEIPT');
const aReceipt = JSON.parse(fs.readFileSync(leftReceiptPath, 'utf8'));
const bReceipt = JSON.parse(fs.readFileSync(rightReceiptPath, 'utf8'));
if (aReceipt.status !== 'PASS' || bReceipt.status !== 'PASS' || aReceipt.world !== bReceipt.world ||
    aReceipt.lineage !== bReceipt.lineage || aReceipt.overlaySha256 !== bReceipt.overlaySha256 ||
    aReceipt.moduleSha256 !== bReceipt.moduleSha256 || aReceipt.mutationMode !== 'none' || bReceipt.mutationMode !== 'none') {
  throw new Error('Traces do not form a matched feedback comparison');
}
if (['replay','shuffled'].includes(aReceipt.mode) && ['replay','shuffled'].includes(bReceipt.mode) &&
    aReceipt.donorSha256 !== bReceipt.donorSha256) throw new Error('Replay controls use different donors');
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const reader = p => readline.createInterface({ input: fs.createReadStream(p), crlfDelay: Infinity })[Symbol.asyncIterator]();
const ai = reader(leftPath), bi = reader(rightPath);
const periods = { before: { steps: 0, differentDestinations: 0 },
  exposed: { steps: 0, differentDestinations: 0, differentSymbols: 0, differentAddresses: 0 },
  withdrawn: { steps: 0, differentDestinations: 0 } };
let steps = 0, firstDifferentDestination = null;
for (;;) {
  const [av, bv] = await Promise.all([ai.next(), bi.next()]);
  if (av.done !== bv.done) throw new Error('Trace length mismatch');
  if (av.done) break;
  const a = JSON.parse(av.value), b = JSON.parse(bv.value);
  if (a.kind !== b.kind) throw new Error('Event kind mismatch');
  if (a.kind !== 'STEP') continue;
  steps++;
  if (a.tick !== steps || b.tick !== steps || a.inputDigest !== b.inputDigest) throw new Error('Input pairing mismatch');
  const p = steps < 501 ? periods.before : steps <= 5300 ? periods.exposed : periods.withdrawn;
  p.steps++;
  if (a.to !== b.to) { p.differentDestinations++; if (firstDifferentDestination === null) firstDifferentDestination = steps; }
  if (steps < 501 && (a.from !== b.from || a.to !== b.to || a.organDigest !== b.organDigest ||
      a.houseDigest !== b.houseDigest || a.transitionDigest !== b.transitionDigest ||
      a.liveLoop.address !== b.liveLoop.address || !eq(a.liveLoop.bankAfter, b.liveLoop.bankAfter))) {
    throw new Error('States differ before feedback exposure');
  }
  if (steps >= 501 && steps <= 5300) {
    if (a.liveLoop.emittedSymbol !== b.liveLoop.emittedSymbol) p.differentSymbols++;
    if (a.liveLoop.address !== b.liveLoop.address) p.differentAddresses++;
  }
}
if (steps !== 20160) throw new Error('Incomplete comparison');
console.log(JSON.stringify({ status: 'PASS', world: aReceipt.world,
  modes: [aReceipt.mode, bReceipt.mode], firstDifferentDestination, periods,
  donorSha256: aReceipt.donorSha256 ?? bReceipt.donorSha256,
  note: 'Exploratory single-world engineering comparison; not a test of a discovered agency.' }, null, 2));
