// ND-1b order test: NR-2's order harness through the HYBRID architecture (see run.ts). Same rule, streams and shuffles.
//   node --import tsx order.ts <stream.json> <segment m> <L> <S> <label> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { streamFor } from '../sxi1r/touch';
import { walkB } from './run';
const [STREAM, M, L, S, LABEL, OUT] = process.argv.slice(2);
const zones = JSON.parse(readFileSync(STREAM, 'utf8')).zones as number[], m = Number(M), len = Number(L), nS = Number(S);
const runs: any[] = [];
for (let j = 0; j <= nS; j++) { const input = streamFor(zones, m, len, j, LABEL);
  runs.push({ shuffle: j, canonical: walkB(input, 'CANONICAL', 'HYBRID', m).path, relabel: walkB(input, 'RELABEL', 'HYBRID', m).path }); }
writeFileSync(OUT, JSON.stringify({ label: LABEL, segment: m, L: len, S: nS, runs }));
