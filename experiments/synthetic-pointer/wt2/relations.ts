// WT-2 relations: both arms on the held-out stream, 12 units x 1000, CANONICAL / RELABEL / REWIRED.
//   node --import tsx relations.ts <stream.json> <label> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { walkT } from './run';
const [STREAM, LABEL, OUT] = process.argv.slice(2); const all = JSON.parse(readFileSync(STREAM, 'utf8')).zones as number[]; const runs: any[] = [];
for (let u = 0; u < 12; u++) { const input = all.slice(u * 1000, (u + 1) * 1000);
  for (const graph of ['CANONICAL', 'RELABEL', 'REWIRED'] as const) for (const arm of ['T12', 'T24'] as const) runs.push({ unit: u, graph, arm, input, ...walkT(input, graph, arm, u) }); }
writeFileSync(OUT, JSON.stringify({ label: LABEL, runs }));
