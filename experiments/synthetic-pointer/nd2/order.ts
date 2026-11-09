// ND-2 order test (REGISTRATION.md): as NR-2's order.ts, but through the ND-1 medium (NDRuntime: nd on, eta 0.5, D 0.6,
// fieldWeight 2.0, Warp release). Unit m hears its segment as received (j = 0) and S order-shuffles (j = 1..S); her passage
// on CANONICAL (the test arm) and RELABEL (descriptive) is recorded, with the field's own trajectory.
//   node --import tsx order.ts <stream.json> <segment m> <L> <S> <label> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { streamFor } from '../sxi1r/touch';
import { walkND } from '../nd1/run';
export const ETA = 0.5, D = 0.6;
const [STREAM, M, L, S, LABEL, OUT] = process.argv.slice(2);
const zones = JSON.parse(readFileSync(STREAM, 'utf8')).zones as number[], m = Number(M), len = Number(L), nS = Number(S);
const runs: any[] = [];
for (let j = 0; j <= nS; j++) {
  const input = streamFor(zones, m, len, j, LABEL);
  const c = walkND(input, 'CANONICAL', 'ND', ETA, D, m), r = walkND(input, 'RELABEL', 'ND', ETA, D, m);
  runs.push({ shuffle: j, canonical: c.path, relabel: r.path, canonicalField: c.fieldPath });
}
writeFileSync(OUT, JSON.stringify({ label: LABEL, segment: m, L: len, S: nS, runs }));
