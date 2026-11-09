// WS-1: arm F36 reproduces ND-1b (ndb/run.ts HYBRID) step for step (3 units x 1000, three graphs).
import { createHash } from 'node:crypto';
import { walkB } from '../ndb/run';
import { walkW } from './run';
let ok = true;
for (let u = 0; u < 3; u++) { const z = Array.from({ length: 1000 }, (_, t) => 1 + createHash('sha256').update(`eqws|${u}|${t}`).digest()[0] % 9);
  for (const g of ['CANONICAL', 'RELABEL', 'REWIRED'] as const) ok = ok && JSON.stringify(walkB(z, g, 'HYBRID', u).path) === JSON.stringify(walkW(z, g, 'F36', u).path); }
console.log(ok ? 'EQUIVALENT' : 'DIFFERENT'); if (!ok) process.exit(1);
