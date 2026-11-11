// WT-2: arm T24 reproduces FLOW (flow/run.ts arch FLOW) step for step (3 units x 1000, three graphs).
import { createHash } from 'node:crypto';
import { walkF } from '../flow/run';
import { walkT } from './run';
let ok = true;
for (let u = 0; u < 3; u++) { const z = Array.from({ length: 1000 }, (_, t) => 1 + createHash('sha256').update(`eqwt2|${u}|${t}`).digest()[0] % 9);
  for (const g of ['CANONICAL', 'RELABEL', 'REWIRED'] as const) ok = ok && JSON.stringify(walkF(z, g, 'FLOW', u).path) === JSON.stringify(walkT(z, g, 'T24', u).path); }
console.log(ok ? 'EQUIVALENT' : 'DIFFERENT'); if (!ok) process.exit(1);
