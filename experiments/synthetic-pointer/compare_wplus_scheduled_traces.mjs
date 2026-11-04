#!/usr/bin/env node
// Compare two independently verified, matched scheduled engineering traces.
import fs from 'node:fs';
const [leftPath, rightPath] = process.argv.slice(2);
if (!rightPath) throw new Error('usage: node compare_wplus_scheduled_traces.mjs LEFT RIGHT');
const read = path => fs.readFileSync(path, 'utf8').trimEnd().split('\n').map(JSON.parse);
const left = read(leftPath), right = read(rightPath);
const a = left[0], b = right[0];
if (left.length !== right.length || a.kind !== 'START' || b.kind !== 'START' ||
    left.at(-1).kind !== 'FINISH' || right.at(-1).kind !== 'FINISH' ||
    a.world !== b.world || a.lineage !== b.lineage || a.season !== b.season ||
    a.overlaySha256 !== b.overlaySha256 || JSON.stringify(a.runtimeHashes) !== JSON.stringify(b.runtimeHashes)) {
  throw new Error('Traces are not the same paired fixture');
}
const intervals = { before: { steps: 0, differentDestination: 0 },
  during: { steps: 0, differentDestination: 0 }, after: { steps: 0, differentDestination: 0 } };
let firstDifferentDestination = null;
for (let i = 1; i < left.length - 1; i++) {
  const x = left[i], y = right[i];
  if (x.kind !== 'STEP' || y.kind !== 'STEP' || x.tick !== y.tick || x.inputDigest !== y.inputDigest) {
    throw new Error('Unpaired transition: ' + i);
  }
  const interval = x.tick < 501 ? intervals.before : x.tick <= 5300 ? intervals.during : intervals.after;
  interval.steps++;
  if (x.to !== y.to) {
    interval.differentDestination++;
    if (firstDifferentDestination === null) firstDifferentDestination = x.tick;
  }
  if (x.tick < 501 && (x.from !== y.from || x.to !== y.to || x.transitionDigest !== y.transitionDigest ||
      x.organDigest !== y.organDigest || x.houseDigest !== y.houseDigest)) throw new Error('Pre-intervention mismatch');
}
console.log(JSON.stringify({ status: 'PASS', world: a.world, lineage: a.lineage,
  arms: [a.pointer.schedule.arm, b.pointer.schedule.arm], firstDifferentDestination, intervals,
  note: 'A single synthetic engineering fixture; differences do not establish a population effect or an ingressing organisation.' }, null, 2));
