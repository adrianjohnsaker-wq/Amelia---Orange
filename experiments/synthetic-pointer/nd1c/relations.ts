// ND-1c K4: the candidate's passage on a fresh held-out stream, 12 units x 1000, CANONICAL / RELABEL / REWIRED (ndb/run.ts layout;
// the candidate is mode 'HYBRID', today's architecture 'EXIT').   node --import tsx relations.ts <stream.json> <label> <cfg> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { walkC, CANDIDATES } from './run';
const [STREAM, LABEL, CFG, OUT] = process.argv.slice(2); const cfg = CANDIDATES[CFG]; if (!cfg) throw new Error('unknown cfg');
const all = JSON.parse(readFileSync(STREAM, 'utf8')).zones as number[]; const runs: any[] = [];
for (let u = 0; u < 12; u++) { const input = all.slice(u * 1000, (u + 1) * 1000);
  for (const graph of ['CANONICAL', 'RELABEL', 'REWIRED'] as const) {
    runs.push({ unit: u, graph, mode: 'HYBRID', input, ...walkC(input, graph, 'C', u, cfg) });
    runs.push({ unit: u, graph, mode: 'EXIT', input, ...walkC(input, graph, 'EXIT', u, cfg) });
writeFileSync(OUT, JSON.stringify({ label: LABEL, cfg, runs }));
