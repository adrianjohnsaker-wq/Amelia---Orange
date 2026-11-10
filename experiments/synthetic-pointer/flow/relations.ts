// FLOW K4: FLOW's passage on a fresh held-out stream, 12 units x 1000, CANONICAL / RELABEL / REWIRED; mode 'HYBRID' = FLOW,
// 'EXIT' = today's architecture (layout read by nd1c/relations.py).   node --import tsx relations.ts <stream.json> <label> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { walkF } from './run';
const [STREAM, LABEL, OUT] = process.argv.slice(2); const all = JSON.parse(readFileSync(STREAM, 'utf8')).zones as number[]; const runs: any[] = [];
for (let u = 0; u < 12; u++) { const input = all.slice(u * 1000, (u + 1) * 1000);
  for (const graph of ['CANONICAL', 'RELABEL', 'REWIRED'] as const) {
    runs.push({ unit: u, graph, mode: 'HYBRID', input, ...walkF(input, graph, 'FLOW', u) });
    runs.push({ unit: u, graph, mode: 'EXIT', input, ...walkF(input, graph, 'EXIT', u) }); } }
writeFileSync(OUT, JSON.stringify({ label: LABEL, cfg: 'FLOW', runs }));
