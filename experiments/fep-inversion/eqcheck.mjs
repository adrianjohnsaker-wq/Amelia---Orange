// ND-1b studio mirror equivalence: hook off, nd/ must reproduce nd0/ (the unhooked mirror of src/) exactly, step for step.
import { AmeliaNDRuntime as A } from './nd0/outside/AmeliaNDRuntime.ts';
import { AmeliaNDRuntime as B } from './nd/outside/AmeliaNDRuntime.ts';
import { withFullNumogram as wa } from './nd0/core/fullNumogram.ts';
import { withFullNumogram as wb } from './nd/core/fullNumogram.ts';
import { outside, TOKEN } from './fep.mjs';
const n = Number(process.argv[2] ?? 3000), a = wa(new A()), b = wb(new B()), z = outside(1, n);
const strip = s => { const x = JSON.parse(JSON.stringify(s)); return JSON.stringify(x, (k, v) => (k === 'timestamp' ? 0 : v)); };
let same = true;
for (let t = 0; t < n; t++) { a.step(TOKEN[z[t]]); b.step(TOKEN[z[t]]);
  if (a.getCurrentZone() !== b.getCurrentZone()) { same = false; console.log('diverged at', t); break; } }
const ea = strip(a.exportState()), eb = strip(b.exportState());
console.log('path identical:', same, '| final state identical:', ea === eb, '| flights', a.getNDStatus().flights, '| gates', a.getQabbala().getGates().length);
console.log(same && ea === eb ? 'MIRROR_EQUIVALENT' : 'DIFFERENT');
