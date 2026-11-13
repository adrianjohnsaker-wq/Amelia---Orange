// WT-4 relations: both arms on the held-out stream, 12 units x 1000, CANONICAL / RELABEL / REWIRED; FRESH (new runtime per unit,
// as WT-2) and MATURED (the same runtime first lives 6,000 steps of the warm-up stream's segment u, not recorded).
//   node --import tsx relations.ts <stream.json> <warm.json> <label> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { walkW } from './run';
const [STREAM, WARM, LABEL, OUT] = process.argv.slice(2);
const all = JSON.parse(readFileSync(STREAM, 'utf8')).zones as number[], wall = JSON.parse(readFileSync(WARM, 'utf8')).zones as number[]; const runs: any[] = [];
for (let u = 0; u < 12; u++) { const input = all.slice(u * 1000, (u + 1) * 1000), warm = wall.slice(u * 6000, (u + 1) * 6000);
  for (const graph of ['CANONICAL', 'RELABEL', 'REWIRED'] as const) for (const arm of ['O12', 'P12'] as const) {
    runs.push({ unit: u, graph, arm, cond: 'FRESH', input, ...walkW(input, graph, arm, u) });
    runs.push({ unit: u, graph, arm, cond: 'MATURED', input, ...walkW(input, graph, arm, u, warm) }); } }
writeFileSync(OUT, JSON.stringify({ label: LABEL, runs }));
