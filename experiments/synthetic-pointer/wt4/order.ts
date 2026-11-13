// WT-4 order test: NR-2's order harness (same rule; shuffles via sxi1r streamFor) through walkW. The comparison arm's (P12 for a one-use arm)
// unshuffled canonical path is stored as `exitCanonical` (here: the OTHER theta), so nd1c/motif.py and nd1d/summarise.py pair them.
//   node --import tsx order.ts <stream.json> <segment m> <L> <S> <label> <P12|O8|O6> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { streamFor } from '../sxi1r/touch';
import { walkW, type WArm } from './run';
const [STREAM, M, L, S, LABEL, ARM, OUT] = process.argv.slice(2);
if (!['P12', 'O12', 'O8', 'O6'].includes(ARM)) throw new Error('bad arm');
const zones = JSON.parse(readFileSync(STREAM, 'utf8')).zones as number[], m = Number(M), len = Number(L), nS = Number(S); const a = ARM as WArm, other: WArm = a === 'P12' ? 'O8' : 'P12';
const runs: any[] = [];
for (let j = 0; j <= nS; j++) { const input = streamFor(zones, m, len, j, LABEL);
  runs.push({ shuffle: j, canonical: walkW(input, 'CANONICAL', a, m).path, relabel: walkW(input, 'RELABEL', a, m).path }); }
const exitCanonical = walkW(streamFor(zones, m, len, 0, LABEL), 'CANONICAL', other, m).path;
writeFileSync(OUT, JSON.stringify({ label: LABEL, segment: m, L: len, S: nS, arch: a, comparison: other, runs, exitCanonical }));
