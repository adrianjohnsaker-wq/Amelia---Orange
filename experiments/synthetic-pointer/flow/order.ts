// FLOW order test: NR-2's order harness (same rule; shuffles via sxi1r streamFor) through walkF.
//   node --import tsx order.ts <stream.json> <segment m> <L> <S> <label> <FLOW|EXIT> <out.json>   (exitCanonical: EXIT, unshuffled)
import { readFileSync, writeFileSync } from 'node:fs';
import { streamFor } from '../sxi1r/touch';
import { walkF } from './run';
const [STREAM, M, L, S, LABEL, ARCH, OUT] = process.argv.slice(2);
if (ARCH !== 'FLOW' && ARCH !== 'EXIT') throw new Error('bad arch');
const zones = JSON.parse(readFileSync(STREAM, 'utf8')).zones as number[], m = Number(M), len = Number(L), nS = Number(S); const a = ARCH as 'FLOW' | 'EXIT';
const runs: any[] = [];
for (let j = 0; j <= nS; j++) { const input = streamFor(zones, m, len, j, LABEL);
  runs.push({ shuffle: j, canonical: walkF(input, 'CANONICAL', a, m).path, relabel: walkF(input, 'RELABEL', a, m).path }); }
const exitCanonical = walkF(streamFor(zones, m, len, 0, LABEL), 'CANONICAL', 'EXIT', m).path;
writeFileSync(OUT, JSON.stringify({ label: LABEL, segment: m, L: len, S: nS, arch: a, runs, exitCanonical }));
