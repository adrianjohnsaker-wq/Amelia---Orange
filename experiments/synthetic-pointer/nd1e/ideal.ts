// Instrument check (descriptive, not a registered test): a perfect reader whose passage copies the input exactly, through the
// same order harness (NR-2 rule, same shuffles). RELABEL copies the permuted input.   node --import tsx ideal.ts <stream> <m> <label> <out>
import { readFileSync, writeFileSync } from 'node:fs';
import { streamFor } from '../sxi1r/touch';
import { graphFor } from '../nr1/graphs';
const [STREAM, M, LABEL, OUT] = process.argv.slice(2); const zones = JSON.parse(readFileSync(STREAM, 'utf8')).zones as number[]; const m = Number(M);
const perm = graphFor('RELABEL', m).perm!; const runs: any[] = [];
for (let j = 0; j <= 49; j++) { const input = streamFor(zones, m, 1000, j, LABEL); runs.push({ shuffle: j, canonical: [0, ...input], relabel: [0, ...input.map(c => perm[c])] }); }
writeFileSync(OUT, JSON.stringify({ label: LABEL, segment: m, L: 1000, S: 49, runs }));
