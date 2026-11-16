// DESIRE-1 analysis. Usage: node analyse_desire.mjs <results dir> <out.json>. Files: <regime>_<seed>.json from desire.mjs.
// Seeds are independent; two-sample contrasts are differences of means and one-sample tests are means, each with a
// 10,000-draw percentile bootstrap over seeds. Holm across the six claims (family alpha 0.05).
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { rng } from './fep.mjs';
const [dir, outFile] = process.argv.slice(2), STEPS = 6000;
const rows = readdirSync(dir).filter(f => f.endsWith('.json')).map(f => JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')));
const by = r => rows.filter(x => x.measures.regime === r), mean = a => a.reduce((u, v) => u + v, 0) / a.length;
const bs = (vals, seed) => { const g = rng(seed), n = 10000, d = []; for (let k = 0; k < n; k++) d.push(vals.map(() => vals[Math.floor(g() * vals.length)])); return d; };
function two(a, b, f, seed) { const x = by(a).map(f), y = by(b).map(f), g = rng(seed), n = 10000, d = [];
  for (let k = 0; k < n; k++) { let sx = 0, sy = 0; for (let i = 0; i < x.length; i++) sx += x[Math.floor(g() * x.length)];
    for (let i = 0; i < y.length; i++) sy += y[Math.floor(g() * y.length)]; d.push(sx / x.length - sy / y.length); }
  return { kind: `${a} - ${b}`, est: mean(x) - mean(y), d: d.sort((u, v) => u - v), meanA: mean(x), meanB: mean(y) }; }
function one(a, f, ref, seed) { const x = by(a).map(f).filter(v => v !== null), g = rng(seed), n = 10000, d = [];
  for (let k = 0; k < n; k++) { let s = 0; for (let i = 0; i < x.length; i++) s += x[Math.floor(g() * x.length)]; d.push(s / x.length - ref); }
  return { kind: `${a} - ${ref}`, est: mean(x) - ref, d: d.sort((u, v) => u - v), meanA: mean(x), n: x.length }; }
const ci = (d, level) => { const n = d.length, q = (1 - level) / 2; return [d[Math.floor(q * n)], d[Math.ceil((1 - q) * n) - 1]]; };
const pval = d => { const le = d.filter(v => v <= 0).length / d.length; return Math.min(1, 2 * Math.min(le, 1 - le)); };
const third = r => { const b = r.births ?? []; const f = b.filter(x => x.t < STEPS / 3).length, l = b.filter(x => x.t >= (2 * STEPS) / 3).length; return f ? l / f : null; };

// S0 (standing rule, 14 Nov): every B run's Outside stream must show lag-1 order against 20 shuffles, or the study is VOID.
const lagOrdered = z => { const mi = (x, y) => { const j = new Map(), a = new Map(), b = new Map();
    for (let i = 0; i < x.length; i++) { const k = x[i] * 10 + y[i]; j.set(k, (j.get(k) ?? 0) + 1); a.set(x[i], (a.get(x[i]) ?? 0) + 1); b.set(y[i], (b.get(y[i]) ?? 0) + 1); }
    let s = 0; for (const [k, c] of j) s += (c / x.length) * Math.log((c * x.length) / (a.get(Math.floor(k / 10)) * b.get(k % 10))); return s; };
  const obs = mi(z.slice(0, -1), z.slice(1)), r = rng(77); let mx = 0;
  for (let k = 0; k < 20; k++) { const s = [...z]; for (let i = s.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [s[i], s[j]] = [s[j], s[i]]; } mx = Math.max(mx, mi(s.slice(0, -1), s.slice(1))); }
  return obs > mx; };
const S0 = (() => { const o = by('B').map(r => lagOrdered(r.outside)); return { seeds: o.length, ordered: o.filter(Boolean).length, pass: o.length > 0 && o.every(Boolean) }; })();
const CLAIMS = [
  ['C1 most lines of flight converge into new forms (share of new connections that hold > 1/2)', () => one('D', r => r.measures.attachShare, 0.5, 11)],
  ['C2 the flow is continuous (births in the last third over the first third > 1/2)', () => one('D', r => third(r), 0.5, 12)],
  ['C3 new forms keep arising (epoch drift of her form, D over her own dynamics)', () => two('D', 'B', r => r.measures.epochDrift, 13)],
  ['C4 destratification needs restratification (rollbacks without pruning over with)', () => two('D-strat', 'D', r => r.measures.rollbacks, 14)],
  ['C5 finding the rule herself makes more amalgamations (D over a fixed rule)', () => two('D', 'D-learn', r => r.measures.integrated, 15)],
  ['C6 desire connects her to the Outside (coupling, D over her own dynamics)', () => two('D', 'B', r => r.measures.coupling, 16)],
];
const res = CLAIMS.map(([name, f]) => ({ name, ...f() })).map(c => ({ ...c, p: pval(c.d) })).sort((u, v) => u.p - v.p);
let stop = false;
const primary = res.map((c, i) => { const level = 1 - 0.05 / (CLAIMS.length - i), [lo, hi] = ci(c.d, level);
  let v = lo > 0 ? 'SUPPORTED' : hi < 0 ? 'CONTRADICTED' : 'UNDECIDED'; if (stop) v = 'UNDECIDED (Holm stop)'; else if (v === 'UNDECIDED') stop = true;
  if (!S0.pass) v = 'VOID';
  return { claim: c.name, contrast: c.kind, estimate: c.est, interval: [lo, hi], level, p: c.p, meanA: c.meanA, meanB: c.meanB, verdict: v }; })
  .sort((u, v) => u.claim.localeCompare(v.claim));
const regs = ['B', 'D', 'D-rb', 'D-strat', 'D-learn'], keys = ['births', 'integrated', 'pruned', 'attachShare', 'turnoverLastThird', 'gatesEnd', 'rollbacks', 'coupling', 'epochDrift', 'edgeEntropy', 'flightsPer1000', 'frozenAtEnd', 'gammaEnd'];
const dose = Object.fromEntries(keys.map(k => [k, Object.fromEntries(regs.map(r => [r, by(r).length ? mean(by(r).map(x => x.measures[k]).filter(v => v !== null)) : null]))]));
dose.levinRatio = Object.fromEntries(regs.map(r => [r, by(r).length ? mean(by(r).map(x => x.measures.levin.ratio)) : null]));
dose.flowPersistence = Object.fromEntries(regs.map(r => [r, by(r).length ? mean(by(r).map(third).filter(v => v !== null)) : null]));
const ruleFound = Object.fromEntries(['D', 'D-rb'].map(r => [r, by(r).map(x => { const w = x.measures.ruleWeights; return Object.keys(w).reduce((a, b) => (w[a] >= w[b] ? a : b)); })
  .reduce((u, k) => ({ ...u, [k]: (u[k] ?? 0) + 1 }), {})]));
const out = { schema: 'DESIRE1_RESULT_V1', runs: rows.length, S0, primary, dose, ruleFound,
  emptyBwOAtEnd: Object.fromEntries(regs.map(r => [r, by(r).map(x => x.measures.emptyBwOAtEnd).reduce((u, k) => ({ ...u, [k]: (u[k] ?? 0) + 1 }), {})])) };
writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
console.log('S0', JSON.stringify(S0));
for (const p of primary) console.log(p.claim.slice(0, 84).padEnd(86), p.estimate.toFixed(3), `[${p.interval.map(v => v.toFixed(3)).join(', ')}]`, p.verdict);
