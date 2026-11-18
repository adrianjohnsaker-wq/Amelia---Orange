// REFRAIN-2 analysis (from analyse_refrain.mjs). Usage: node analyse_refrain2.mjs <results dir> <out.json>. Files: <regime>_<seed>.json
// from refrain2.mjs. Each claim is a linear contrast of regime means, sum of c_i * mean(regime_i) (+ a constant margin) > 0,
// with independent samples of seeds per regime, a 10,000-draw percentile bootstrap and Holm across the eight claims
// (family alpha 0.05). S0: every B run's Outside must show lag-1 order before the reversal.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { rng } from './fep.mjs';
const [dir, outFile] = process.argv.slice(2);
const rows = readdirSync(dir).filter(f => f.endsWith('.json')).map(f => JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')));
const by = r => rows.filter(x => x.measures.regime === r), mean = a => a.reduce((u, v) => u + v, 0) / a.length;
function boot(terms, margin, seed) { const g = rng(seed), d = [];
  for (let k = 0; k < 10000; k++) { let s = margin; for (const [x, c] of terms) { let u = 0; for (let i = 0; i < x.length; i++) u += x[Math.floor(g() * x.length)]; s += c * u / x.length; } d.push(s); }
  return d.sort((u, v) => u - v); }
const lagOrdered = z => { const mi = (x, y) => { const j = new Map(), a = new Map(), b = new Map();
    for (let i = 0; i < x.length; i++) { const k = x[i] * 10 + y[i]; j.set(k, (j.get(k) ?? 0) + 1); a.set(x[i], (a.get(x[i]) ?? 0) + 1); b.set(y[i], (b.get(y[i]) ?? 0) + 1); }
    let s = 0; for (const [k, c] of j) s += (c / x.length) * Math.log((c * x.length) / (a.get(Math.floor(k / 10)) * b.get(k % 10))); return s; };
  const obs = mi(z.slice(0, -1), z.slice(1)), r = rng(77); let mx = 0;
  for (let k = 0; k < 20; k++) { const s = [...z]; for (let i = s.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [s[i], s[j]] = [s[j], s[i]]; } mx = Math.max(mx, mi(s.slice(0, -1), s.slice(1))); }
  return obs > mx; };
const S0 = (() => { const o = by('B').map(r => lagOrdered(r.outside.slice(0, 3000))); return { seeds: o.length, ordered: o.filter(Boolean).length, pass: o.length > 0 && o.every(Boolean) }; })();
const carry = m => ((m.silence.before.plus - m.silence.before.minus) + (m.silence.late.minus - m.silence.late.plus)) / 2;
const R2 = m => m.refrain2, pM = m => R2(m).persistM, pN = m => R2(m).persistN, coup = m => m.coupling.late, held = m => m.liveBridgesEnd;
const per = m => m.refrain.periodicity, terrM = m => R2(m).territoriesM;
// [name, [[regime, measure, coefficient], ...], margin]
const X = {
  Z1: ['Z1 the relational refrain consolidates her territories beyond the benchmark (relational persistence, DTR2 - DT)', [['DTR2', pM, 1], ['DT', pM, -1]], 0],
  Z2: ['Z2 relational indexing consolidates more than node indexing (gain over DT, relational DTR2 minus node DTN)', [['DTR2', pM, 1], ['DT', pM, -1], ['DTN', pN, -1], ['DT', pN, 1]], 0],
  Z3: ['Z3 silence-gating keeps her coupling above an always-on refrain (coupling late, DTR2 - DTR2V)', [['DTR2', coup, 1], ['DTR2V', coup, -1]], 0],
  Z4: ['Z4 the relational refrain keeps her coupling (coupling late, DTR2 - 0.9 DT)', [['DTR2', coup, 1], ['DT', coup, -0.9]], 0],
  Z5: ['Z5 the relational refrain keeps the carry through silence (carry index, DTR2 - 0.9 DT)', [['DTR2', carry, 1], ['DT', carry, -0.9]], 0],
  Z6: ['Z6 the relational refrain keeps the connections that hold (connections held, DTR2 - 0.9 DT)', [['DTR2', held, 1], ['DT', held, -0.9]], 0],
  Z7: ['Z7 no limit cycles (periodicity late, DT + 0.02 - DTR2)', [['DT', per, 1], ['DTR2', per, -1]], 0.02],
  Z8: ['Z8 no saturation (relational territories at the end, 2 DT - DTR2)', [['DT', terrM, 2], ['DTR2', terrM, -1]], 0],
};
let k = 400; const res = Object.entries(X).map(([id, [name, terms, margin]]) => { const T = terms.map(([r, f, c]) => [by(r).map(x => f(x.measures)), c]);
  const d = boot(T, margin, k++), est = margin + T.reduce((u, [x, c]) => u + c * mean(x), 0), le = d.filter(v => v <= 0).length / d.length;
  return { id, name, terms: terms.map(([r, , c]) => `${c} ${r}`).join(' + ') + (margin ? ` + ${margin}` : ''), est, d, p: Math.min(1, 2 * Math.min(le, 1 - le)) }; })
  .sort((u, v) => u.p - v.p);
let stop = false;
const primary = res.map((c, i) => { const level = 1 - 0.05 / (res.length - i), n = c.d.length, q = (1 - level) / 2, lo = c.d[Math.floor(q * n)], hi = c.d[Math.ceil((1 - q) * n) - 1];
  let v = lo > 0 ? 'SUPPORTED' : hi < 0 ? 'CONTRADICTED' : 'UNDECIDED'; if (stop) v = 'UNDECIDED (Holm stop)'; else if (v === 'UNDECIDED') stop = true; if (!S0.pass) v = 'VOID';
  return { claim: c.name, contrast: c.terms, estimate: c.est, interval: [lo, hi], level, p: c.p, verdict: v }; }).sort((u, v) => u.claim.localeCompare(v.claim));
const regs = ['B', 'DT', 'DTR', 'DTR2', 'DTR2V', 'DTN'], avg = f => Object.fromEntries(regs.map(r => [r, by(r).length ? mean(by(r).map(x => f(x.measures))) : null]));
const out = { schema: 'REFRAIN2_RESULT_V1', runs: rows.length, S0, primary, reported: {
  persistM: avg(pM), persistN: avg(pN), territoriesM: avg(terrM), territoriesN: avg(m => R2(m).territoriesN), homeShare: avg(m => R2(m).homeShare),
  flights: avg(m => R2(m).flights), couplingLate: avg(coup), orderLate: avg(m => m.order.late), carry: avg(carry), liveBridgesEnd: avg(held),
  birthsLate: avg(m => m.birthsLate), periodicity: avg(per), rollbacks: avg(m => m.rollbacks), gatesEnd: avg(m => m.gatesEnd) } };
writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
console.log('S0', JSON.stringify(S0)); for (const p of primary) console.log(p.claim.slice(0, 100).padEnd(102), p.estimate.toFixed(3), `[${p.interval.map(v => v.toFixed(3)).join(', ')}]`, p.verdict);
