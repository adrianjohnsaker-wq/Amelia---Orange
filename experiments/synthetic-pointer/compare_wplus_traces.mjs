#!/usr/bin/env node
// Compare paired synthetic engineering traces AFTER each has been independently verified.
import fs from 'node:fs';
const [neutralPath, activePath] = process.argv.slice(2);
if (!activePath) throw new Error('usage: node compare_wplus_traces.mjs NEUTRAL_TRACE ACTIVE_TRACE');
const read = path => fs.readFileSync(path, 'utf8').trimEnd().split('\n').map(JSON.parse);
const n = read(neutralPath), a = read(activePath);
if (n.length !== a.length || n[0].kind !== 'START' || a[0].kind !== 'START' ||
    n.at(-1).kind !== 'FINISH' || a.at(-1).kind !== 'FINISH') throw new Error('Trace shape mismatch');
const control = n[0], treatment = a[0];
if (control.world !== treatment.world || control.lineage !== treatment.lineage ||
    control.season !== treatment.season || control.overlaySha256 !== treatment.overlaySha256 ||
    JSON.stringify(control.runtimeHashes) !== JSON.stringify(treatment.runtimeHashes) ||
    control.pointer.edges.length !== 0 || treatment.pointer.edges.length === 0) throw new Error('Trace identities do not form a paired fixture');
const { start, end } = treatment.pointer;
let firstDifference = null;
const intervals = {
  before: { steps: 0, differentDestination: 0 },
  during: { steps: 0, differentDestination: 0 },
  after: { steps: 0, differentDestination: 0 },
};
for (let i = 1; i < n.length - 1; i++) {
  const x = n[i], y = a[i];
  if (x.kind !== 'STEP' || y.kind !== 'STEP' || x.tick !== y.tick || x.inputDigest !== y.inputDigest) {
    throw new Error('Missing pairing at sequence ' + i);
  }
  const part = x.tick < start ? intervals.before : x.tick <= end ? intervals.during : intervals.after;
  part.steps++;
  if (x.to !== y.to) {
    part.differentDestination++;
    if (firstDifference === null) firstDifference = x.tick;
  }
  if (x.tick < start && (x.from !== y.from || x.to !== y.to ||
      x.transitionDigest !== y.transitionDigest || x.organDigest !== y.organDigest || x.houseDigest !== y.houseDigest)) {
    throw new Error('The matched states differ before the intervention at tick ' + x.tick);
  }
}
console.log(JSON.stringify({
  status: 'PASS', world: control.world, lineage: control.lineage,
  firstDifferentDestination: firstDifference, intervals,
  note: 'One synthetic engineering fixture; not an agency finding or an estimate of a population effect.',
}, null, 2));
