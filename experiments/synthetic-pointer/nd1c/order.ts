// ND-1c order test: NR-2's order harness (same rule, shuffles via sxi1r streamFor) through walkC with candidate CFG.
//   node --import tsx order.ts <stream.json> <segment m> <L> <S> <label> <cfg name> <out.json>
// Also records EXIT's unshuffled canonical path (for the paired motif read-back comparison).
import { readFileSync, writeFileSync } from 'node:fs';
import { streamFor } from '../sxi1r/touch';
import { walkC, CANDIDATES } from './run';
const [STREAM, M, L, S, LABEL, CFG, OUT] = process.argv.slice(2);
const zones = JSON.parse(readFileSync(STREAM, 'utf8')).zones as number[], m = Number(M), len = Number(L), nS = Number(S), cfg = CANDIDATES[CFG];
if (!cfg) throw new Error('unknown cfg');
const runs: any[] = [];
for (let j = 0; j <= nS; j++) { const input = streamFor(zones, m, len, j, LABEL);
  runs.push({ shuffle: j, canonical: walkC(input, 'CANONICAL', 'C', m, cfg).path, relabel: walkC(input, 'RELABEL', 'C', m, cfg).path }); }
const exitCanonical = walkC(streamFor(zones, m, len, 0, LABEL), 'CANONICAL', 'EXIT', m, cfg).path;
writeFileSync(OUT, JSON.stringify({ label: LABEL, segment: m, L: len, S: nS, cfg, runs, exitCanonical }));
