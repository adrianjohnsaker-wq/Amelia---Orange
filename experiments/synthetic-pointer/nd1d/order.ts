// ND-1d order test: as nd1c/order.ts, with the architecture under test as an argument (C = candidate CFG, EXIT = today's
// architecture, run through the same order harness so its detection on the same streams is reported alongside).
//   node --import tsx order.ts <stream.json> <segment m> <L> <S> <label> <cfg name> <C|EXIT> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { streamFor } from '../sxi1r/touch';
import { walkC, CANDIDATES } from '../nd1c/run';
const [STREAM, M, L, S, LABEL, CFG, ARCH, OUT] = process.argv.slice(2);
const zones = JSON.parse(readFileSync(STREAM, 'utf8')).zones as number[], m = Number(M), len = Number(L), nS = Number(S), cfg = CANDIDATES[CFG];
if (!cfg || (ARCH !== 'C' && ARCH !== 'EXIT')) throw new Error('bad args');
const a = ARCH as 'C' | 'EXIT'; const runs: any[] = [];
for (let j = 0; j <= nS; j++) { const input = streamFor(zones, m, len, j, LABEL);
  runs.push({ shuffle: j, canonical: walkC(input, 'CANONICAL', a, m, cfg).path, relabel: walkC(input, 'RELABEL', a, m, cfg).path }); }
const exitCanonical = walkC(streamFor(zones, m, len, 0, LABEL), 'CANONICAL', 'EXIT', m, cfg).path;
writeFileSync(OUT, JSON.stringify({ label: LABEL, segment: m, L: len, S: nS, cfg, arch: a, runs, exitCanonical }));
