// WT-2 order test: NR-2's order harness (same rule; shuffles via sxi1r streamFor) through walkT. The comparison arm's
// unshuffled canonical path is stored as `exitCanonical` (here: the OTHER theta), so nd1c/motif.py and nd1d/summarise.py pair them.
//   node --import tsx order.ts <stream.json> <segment m> <L> <S> <label> <T12|T24> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { streamFor } from '../sxi1r/touch';
import { walkT, type TArm } from './run';
const [STREAM, M, L, S, LABEL, ARM, OUT] = process.argv.slice(2);
if (ARM !== 'T12' && ARM !== 'T24') throw new Error('bad arm');
const zones = JSON.parse(readFileSync(STREAM, 'utf8')).zones as number[], m = Number(M), len = Number(L), nS = Number(S); const a = ARM as TArm, other: TArm = a === 'T12' ? 'T24' : 'T12';
const runs: any[] = [];
for (let j = 0; j <= nS; j++) { const input = streamFor(zones, m, len, j, LABEL);
  runs.push({ shuffle: j, canonical: walkT(input, 'CANONICAL', a, m).path, relabel: walkT(input, 'RELABEL', a, m).path }); }
const exitCanonical = walkT(streamFor(zones, m, len, 0, LABEL), 'CANONICAL', other, m).path;
writeFileSync(OUT, JSON.stringify({ label: LABEL, segment: m, L: len, S: nS, arch: a, comparison: other, runs, exitCanonical }));
