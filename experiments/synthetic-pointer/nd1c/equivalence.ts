// ND-1c: candidate B reproduces ND-1b (ndb/run.ts HYBRID) and arch EXIT reproduces ndb EXIT, step for step (3 units x 1000).
import { walkB } from '../ndb/run';
import { walkC, CANDIDATES } from './run';
import { createHash } from 'node:crypto';
let ok = true;
for (let u = 0; u < 3; u++) { const z = Array.from({ length: 1000 }, (_, t) => 1 + createHash('sha256').update(`eq1c|${u}|${t}`).digest()[0] % 9);
  for (const g of ['CANONICAL', 'RELABEL', 'REWIRED'] as const) {
    ok = ok && JSON.stringify(walkB(z, g, 'HYBRID', u).path) === JSON.stringify(walkC(z, g, 'C', u, CANDIDATES.B).path);
    ok = ok && JSON.stringify(walkB(z, g, 'EXIT', u).path) === JSON.stringify(walkC(z, g, 'EXIT', u, CANDIDATES.B).path); } }
console.log(ok ? 'EQUIVALENT' : 'DIFFERENT'); if (!ok) process.exit(1);
