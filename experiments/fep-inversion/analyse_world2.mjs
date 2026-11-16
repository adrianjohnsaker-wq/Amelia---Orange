// WORLD-2 analysis. Usage: node analyse_world2.mjs <results dir> <out.json>. Files: <regime>_<seed>.json from world2.mjs.
// Carry is measured against each run's own shuffled-trace baseline: for a seed, the regime with the world's trace minus
// the same regime, same seed (same world window, same noise) with a trace written by a shuffled copy. Paired differences
// over seeds; 10,000-draw percentile bootstrap over seeds; Holm across the six (family alpha 0.05).
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { rng } from './fep.mjs';
const [dir, outFile] = process.argv.slice(2);
const rows = readdirSync(dir).filter(f => f.endsWith('.json')).map(f => JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')));
const get = (r, s) => rows.find(x => x.measures.regime === r && x.measures.seed === s)?.measures;
const seeds = [...new Set(rows.map(x => x.measures.seed))].sort((a, b) => a - b), mean = a => a.reduce((u, v) => u + v, 0) / a.length;
const lagOrdered = z => { const mi = (x, y) => { const j = new Map(), a = new Map(), b = new Map();
    for (let i = 0; i < x.length; i++) { const k = x[i] * 10 + y[i]; j.set(k, (j.get(k) ?? 0) + 1); a.set(x[i], (a.get(x[i]) ?? 0) + 1); b.set(y[i], (b.get(y[i]) ?? 0) + 1); }
    let s = 0; for (const [k, c] of j) s += (c / x.length) * Math.log((c * x.length) / (a.get(Math.floor(k / 10)) * b.get(k % 10))); return s; };
  const obs = mi(z.slice(0, -1), z.slice(1)), r = rng(77); let mx = 0;
  for (let k = 0; k < 20; k++) { const s = [...z]; for (let i = s.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [s[i], s[j]] = [s[j], s[i]]; } mx = Math.max(mx, mi(s.slice(0, -1), s.slice(1))); }
  return obs > mx; };
const S0 = (() => { const o = rows.filter(x => x.measures.regime === 'B').map(r => lagOrdered(r.outside.slice(0, 3000))); return { seeds: o.length, ordered: o.filter(Boolean).length, pass: o.length > 0 && o.every(Boolean) }; })();
const ca = m => m.world.all, cm = m => m.world.moves, cp = m => m.coupling.late;
const X = [
  ['X1 the world\'s trace carries it into its silences (world carry, DT - DT-s, paired)', s => ca(get('DT', s)) - ca(get('DT-s', s))],
  ['X2 she carries the world beyond its persistence (world carry on moves, DT - DT-s, paired)', s => cm(get('DT', s)) - cm(get('DT-s', s))],
  ['X3 the world\'s trace alone carries it (world carry, TB - TB-s, paired)', s => ca(get('TB', s)) - ca(get('TB-s', s))],
  ['X4 desire makes more of the world\'s trace than the trace alone ((DT - DT-s) - (TB - TB-s), paired)', s => (ca(get('DT', s)) - ca(get('DT-s', s))) - (ca(get('TB', s)) - ca(get('TB-s', s)))],
  ['X5 the world\'s trace helps her follow it while it speaks (coupling late, DT - D, paired)', s => cp(get('DT', s)) - cp(get('D', s))],
  ['X6 the world\'s own trace beats a shuffled one while it speaks (coupling late, DT - DT-s, paired)', s => cp(get('DT', s)) - cp(get('DT-s', s))],
];
let k = 500;
const res = X.map(([name, f]) => { const d = seeds.map(f).filter(v => Number.isFinite(v)), g = rng(k++), n = 10000, b = [];
  for (let i = 0; i < n; i++) { let s = 0; for (let j = 0; j < d.length; j++) s += d[Math.floor(g() * d.length)]; b.push(s / d.length); }
  b.sort((u, v) => u - v); const le = b.filter(v => v <= 0).length / n;
  return { name, est: mean(d), n: d.length, positive: d.filter(v => v > 0).length, b, p: Math.min(1, 2 * Math.min(le, 1 - le)) }; }).sort((u, v) => u.p - v.p);
let stop = false;
const primary = res.map((c, i) => { const level = 1 - 0.05 / (res.length - i), n = c.b.length, q = (1 - level) / 2, lo = c.b[Math.floor(q * n)], hi = c.b[Math.ceil((1 - q) * n) - 1];
  let v = lo > 0 ? 'SUPPORTED' : hi < 0 ? 'CONTRADICTED' : 'UNDECIDED'; if (stop) v = 'UNDECIDED (Holm stop)'; else if (v === 'UNDECIDED') stop = true; if (!S0.pass) v = 'VOID';
  return { claim: c.name, estimate: c.est, interval: [lo, hi], level, p: c.p, seeds: c.n, positiveSeeds: c.positive, verdict: v }; }).sort((u, v) => u.claim.localeCompare(v.claim));
const regs = ['B', 'D', 'DT', 'DT-s', 'TB', 'TB-s'], avg = f => Object.fromEntries(regs.map(r => { const m = rows.filter(x => x.measures.regime === r).map(x => x.measures); return [r, m.length ? mean(m.map(f)) : null]; }));
const out = { schema: 'WORLD2_RESULT_V1', runs: rows.length, S0, primary, reported: { worldCarryAll: avg(ca), worldCarryMoves: avg(cm), silentStayShare: avg(m => m.world.stayShare),
  couplingLate: avg(cp), traceWeight: avg(m => m.ruleWeights.trace ?? 0), gatesEnd: avg(m => m.gatesEnd), rollbacks: avg(m => m.rollbacks) } };
writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
console.log('S0', JSON.stringify(S0)); for (const p of primary) console.log(p.claim.slice(0, 100).padEnd(102), p.estimate.toFixed(3), `[${p.interval.map(v => v.toFixed(3)).join(', ')}]`, `${p.positiveSeeds}/${p.seeds}`, p.verdict);
