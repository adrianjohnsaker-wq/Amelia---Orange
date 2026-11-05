// SXI-1R fast harness (see REGISTRATION.md): the same repaired runtime, observer and neutral pointer step as the
// coordinator, without the evidence ledger (equivalence with the ledgered path: equivalence.sh). One body seed hears its
// stream segment as received (j = 0) and S order-shuffles of it (j = 1..S).
//   node --import tsx fast.ts <stream.json> <segment m> <L> <seed> <S> <ALPHA> <label> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { run, streamFor } from './touch';
const [STREAM, M, L, SEED, S, ALPHA, LABEL, OUT] = process.argv.slice(2);
const zones = JSON.parse(readFileSync(STREAM, 'utf8')).zones as number[];
const runs = [];
for (let j = 0; j <= Number(S); j++) runs.push({ shuffle: j, ...run(streamFor(zones, Number(M), Number(L), j, LABEL), Number(SEED), Number(ALPHA), Number(L)) });
writeFileSync(OUT, JSON.stringify({ label: LABEL, segment: Number(M), seed: Number(SEED), alpha: Number(ALPHA), L: Number(L), S: Number(S), runs }));
