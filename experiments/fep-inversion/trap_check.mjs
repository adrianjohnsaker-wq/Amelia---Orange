// Studio substrate runtime + full CCRU Numogram: is the Warp {3,6} absorbing, and who falls in? (disclosed pilot)
// Same self-model, choice rule (beta*surprisal + T*Gumbel) and Outside as fep.mjs; seeds 1-20, 3,000 steps per regime.
import { AmeliaNumogramSubstrateRuntime } from './m/substrate/ameliaNumogramSubstrateRuntime.ts';
import { withFullNumogram } from './m/core/fullNumogram.ts';
import { Self, rng, outside, TOKEN, T } from './fep.mjs';
const g = withFullNumogram(new AmeliaNumogramSubstrateRuntime()).getQabbala().getGates();
console.log('exits from the Warp:', g.filter(x => (x.source === 3 || x.source === 6) && x.isOpen).map(x => `${x.source}->${x.target}`).join(' '));
for (const beta of [-4, -1, 0, 1, 4, 16]) {
  const entry = [];
  for (let seed = 1; seed <= 20; seed++) {
    const rt = withFullNumogram(new AmeliaNumogramSubstrateRuntime()), self = new Self(), noise = rng(seed), out = outside(seed, 3000);
    let first = -1;
    for (let t = 0; t < 3000; t++) {
      const from = rt.getCurrentZone(), opts = rt.getQabbala().getGates().filter(x => x.isOpen && x.source === from).map(x => x.target);
      rt.exitBonus = (f, to) => beta * -Math.log(self.p(f, to, opts)) + T * -Math.log(-Math.log(noise() || 1e-12));
      rt.step(TOKEN[out[t]]); const to = rt.getCurrentZone(); if (opts.length) self.see(from, to);
      if (first < 0 && (to === 3 || to === 6)) first = t;
    }
    entry.push(first);
  }
  const ins = entry.filter(x => x >= 0).sort((a, b) => a - b);
  console.log(`beta ${String(beta).padStart(3)}: in the Warp ${ins.length}/20; median entry step ${ins.length ? ins[Math.floor(ins.length / 2)] : '-'}; last entry ${ins.at(-1) ?? '-'}`);
}
