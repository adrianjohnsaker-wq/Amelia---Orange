// WT-4: arm P12 reproduces WT-2's T12 (wt2/run.ts) step for step (3 units x 1000, three graphs); O12 never adds a gate.
import { createHash } from 'node:crypto';
import { walkT } from '../wt2/run';
import { walkW } from './run';
let ok = true, kept = 0, flights = 0;
for (let u = 0; u < 3; u++) { const z = Array.from({ length: 1000 }, (_, t) => 1 + createHash('sha256').update(`eqwt4|${u}|${t}`).digest()[0] % 9);
  for (const g of ['CANONICAL', 'RELABEL', 'REWIRED'] as const) { ok = ok && JSON.stringify(walkT(z, g, 'T12', u).path) === JSON.stringify(walkW(z, g, 'P12', u).path);
    const o = walkW(z, g, 'O12', u); kept += o.bornAtEnd; flights += o.flights; } }
console.log(ok ? 'P12_EQUIVALENT_TO_WT2_T12' : 'DIFFERENT', `O12 gates kept: ${kept} over ${flights} flights`); if (!ok || kept !== 0 || flights === 0) process.exit(1);
