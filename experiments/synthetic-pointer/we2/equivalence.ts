// WE-2: its walk reproduces WT-4's arm P12 (wt4/run.ts walkW, CANONICAL) step for step (3 units x 1000).
import { createHash } from 'node:crypto';
import { walkW } from '../wt4/run';
import { walk } from './run';
let ok = true;
for (let u = 0; u < 3; u++) { const z = Array.from({ length: 1000 }, (_, t) => 1 + createHash('sha256').update(`eqwe2|${u}|${t}`).digest()[0] % 9);
  ok = ok && JSON.stringify(walk(z, u, 0).path) === JSON.stringify(walkW(z, 'CANONICAL', 'P12', u).path); }
console.log(ok ? 'WE2_WALK_EQUIVALENT_TO_WT4_P12' : 'DIFFERENT'); if (!ok) process.exit(1);
