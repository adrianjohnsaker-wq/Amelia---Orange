// CONJ-1: the residual subject rides on her passage (conj_core.mjs = REFRAIN-2 + an observer hook; subject.mjs).
// Usage: node --experimental-strip-types conj.mjs <regime> <seed> <steps> <out.json> <on|off>
//   regime: B her own dynamics; D desire; DT desire + the Outside's trace; DTR2 the motor M (DT + the inclusive record,
//   unread, + REFRAIN-2's guarded relational refrain).
//   on: the subject consumes every step; it is asked for a readout every 500 steps (t = 499, 999, ...).
//   off: no observer at all (the non-steering twin).
// For DTR2 with the subject on, a second subject is fed her passage with time scrambled within each 500-step block
// (the confabulation control): each step keeps its own zone and activations, its hops are re-derived from the scrambled
// zone order, and it carries no trace marks, connections, rollbacks or territories.
import { run, measures } from './conj_core.mjs';
import { Subject } from './subject.mjs';
import { rng } from './fep.mjs';
import { writeFileSync } from 'node:fs';

const [regime, seedS, stepsS, file, mode] = process.argv.slice(2), seed = Number(seedS), steps = Number(stepsS), on = mode === 'on';
const subject = new Subject(), readouts = [], routes = [], evs = [];
const R = run(regime, seed, steps, on ? (t, ev) => { subject.consume(ev); routes.push(ev.route.join(''));
  if (regime === 'DTR2') evs.push({ zone: ev.zone, act: ev.act, base: ev.base });
  if (t % 500 === 499) readouts.push({ t, ...subject.readout() }); } : null);
const m = measures(R, regime, seed, steps);
let scrambled = null;
if (on && regime === 'DTR2') { const r = rng((seed ^ 0x5C4A) >>> 0), order = [];
  for (let b = 0; b < steps; b += 500) { const blk = [...Array(Math.min(500, steps - b)).keys()].map(i => b + i);
    for (let i = blk.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [blk[i], blk[j]] = [blk[j], blk[i]]; } order.push(...blk); }
  const sub = new Subject(); scrambled = [];
  order.forEach((s, t) => { const e = evs[s], prev = t > 0 ? evs[order[t - 1]].zone : e.zone;
    sub.consume({ zone: e.zone, hops: prev !== e.zone ? [[prev, e.zone]] : [], act: e.act, base: e.base });
    if (t % 500 === 499) scrambled.push({ t, ...sub.readout() }); }); }
writeFileSync(file, JSON.stringify({ measures: m, subject: on, path: R.path.join(''), routes: on ? routes : null, outside: R.out, readouts: on ? readouts : null, scrambled }) + '\n');
if (on) console.log(readouts.at(-1).words);
