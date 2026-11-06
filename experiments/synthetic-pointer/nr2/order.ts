// NR-2 order test (REGISTRATION.md): unit m hears its own disjoint segment m of L data as received (j = 0) and S
// order-shuffles of it (j = 1..S), directly (no body), through the NR-1 runtime: CANONICAL Numogram, IDENTITY receiver
// (the order-test arm) and RELABEL (descriptive). Her zone path is recorded for each.
//   node --import tsx order.ts <stream.json> <segment m> <L> <S> <label> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { streamFor } from '../sxi1r/touch';
import { walk } from '../nr1/run';
const [STREAM, M, L, S, LABEL, OUT] = process.argv.slice(2);
const zones = JSON.parse(readFileSync(STREAM, 'utf8')).zones as number[], m = Number(M), len = Number(L), nS = Number(S);
const runs: any[] = [];
for (let j = 0; j <= nS; j++) {
  const input = streamFor(zones, m, len, j, LABEL);
  runs.push({ shuffle: j, canonical: walk(input, 'CANONICAL', 'IDENTITY', m).path, relabel: walk(input, 'RELABEL', 'IDENTITY', m).path });
}
writeFileSync(OUT, JSON.stringify({ label: LABEL, segment: m, L: len, S: nS, runs }));
