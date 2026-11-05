#!/usr/bin/env node
// Prepare the replay control from an independently verified live donor trace.
import fs from 'node:fs';
import readline from 'node:readline';
import { createHash } from 'node:crypto';

const [tracePath, verificationPath, output] = process.argv.slice(2);
if (!output) throw new Error('usage: node extract_live_donor.mjs VERIFIED_TRACE VERIFICATION_JSON NEW_DONOR_JSON');
const verification = JSON.parse(fs.readFileSync(verificationPath, 'utf8'));
if (verification.status !== 'PASS' || verification.mode !== 'live' || verification.pointerMode !== 'dynamic' ||
    verification.mutationMode !== 'none' || verification.activeTicks !== 4800) throw new Error('Not a verified live donor');
const sensors = [], digest = createHash('sha256');
let header = null, footer = null, steps = 0;
const source = fs.createReadStream(tracePath);
source.on('data', chunk => digest.update(chunk));
for await (const line of readline.createInterface({ input: source, crlfDelay: Infinity })) {
  const record = JSON.parse(line);
  if (record.kind === 'START') header = record;
  else if (record.kind === 'STEP') {
    steps++;
    if (record.tick !== steps) throw new Error('Donor trace discontinuity');
    if (record.liveLoop.active) {
      if (JSON.stringify(record.liveLoop.actualFeedback) !== JSON.stringify(record.liveLoop.deliveredFeedback)) {
        throw new Error('Donor did not receive its own actual feedback');
      }
      sensors.push(record.liveLoop.actualFeedback);
    }
  } else if (record.kind === 'FINISH') footer = record;
  else throw new Error('Unexpected donor event');
}
if (!header || !footer || steps !== 20160 || sensors.length !== 4800 ||
    footer.recordHash !== verification.independentlyRecomputedHead || header.world !== verification.world ||
    header.overlaySha256 !== verification.overlaySha256 || header.source.moduleSha256 !== verification.moduleSha256) {
  throw new Error('Donor trace and verification receipt disagree');
}
const traceSha256 = digest.digest('hex');
const result = { version: 1, donor: { mode: 'live', world: header.world, lineage: header.lineage,
  traceSha256, traceHead: footer.recordHash, overlaySha256: header.overlaySha256,
  moduleSha256: header.source.moduleSha256, sensorCount: sensors.length }, sensors };
const encoded = JSON.stringify(result) + '\n';
fs.writeFileSync(output, encoded, { flag: 'wx' });
console.log(JSON.stringify({ status: 'PASS', donor: result.donor,
  feedbackFileSha256: createHash('sha256').update(encoded).digest('hex') }, null, 2));
