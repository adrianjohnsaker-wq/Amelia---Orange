// HEAD-1 analysis (from analyse_bridge.mjs). Usage: node analyse_head.mjs <results dir> <out.json>. Files: <regime>_<seed>.json from bridge.mjs.
// Independent samples of seeds per regime; differences of means (or a mean against 0), 10,000-draw percentile bootstrap;
// Holm across the six claims (family alpha 0.05). S0: every B run's Outside must show lag-1 order before the reversal.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { rng } from './fep.mjs';
const [dir, outFile] = process.argv.slice(2);
const rows = readdirSync(dir).filter(f => f.endsWith('.json')).map(f => JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')));
const by = r => rows.filter(x => x.measures.regime === r), mean = a => a.reduce((u, v) => u + v, 0) / a.length;
function boot(x, y, seed) { const g = rng(seed), n = 10000, d = [];
  for (let k = 0; k < n; k++) { let sx = 0, sy = 0; for (let i = 0; i < x.length; i++) sx += x[Math.floor(g() * x.length)];
    if (y) for (let i = 0; i < y.length; i++) sy += y[Math.floor(g() * y.length)]; d.push(sx / x.length - (y ? sy / y.length : 0)); }
  return d.sort((u, v) => u - v); }
const lagOrdered = z => { const mi = (x, y) => { const j = new Map(), a = new Map(), b = new Map();
    for (let i = 0; i < x.length; i++) { const k = x[i] * 10 + y[i]; j.set(k, (j.get(k) ?? 0) + 1); a.set(x[i], (a.get(x[i]) ?? 0) + 1); b.set(y[i], (b.get(y[i]) ?? 0) + 1); }
    let s = 0; for (const [k, c] of j) s += (c / x.length) * Math.log((c * x.length) / (a.get(Math.floor(k / 10)) * b.get(k % 10))); return s; };
  const obs = mi(z.slice(0, -1), z.slice(1)), r = rng(77); let mx = 0;
  for (let k = 0; k < 20; k++) { const s = [...z]; for (let i = s.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [s[i], s[j]] = [s[j], s[i]]; } mx = Math.max(mx, mi(s.slice(0, -1), s.slice(1))); }
  return obs > mx; };
const S0 = (() => { const o = by('B').map(r => lagOrdered(r.outside.slice(0, 3000))); return { seeds: o.length, ordered: o.filter(Boolean).length, pass: o.length > 0 && o.every(Boolean) }; })();
// carry in silence: the share of her silent steps in the Outside's direction minus the opposite direction, averaged over
// before the reversal (+1 minus -1) and late after it (-1 minus +1)
const carry = m => ((m.silence.before.plus - m.silence.before.minus) + (m.silence.late.minus - m.silence.late.plus)) / 2;
const carryLate = m => m.silence.late.minus - m.silence.late.plus;
const X = {
  H1: ['H1 desire couples to the Outside more than surprise-seeking (coupling late, D - S4)', 'D', 'S4', m => m.coupling.late],
  H2: ['H2 desire carries the Outside\'s order while it speaks more than surprise-seeking (order late, D - S4)', 'D', 'S4', m => m.order.late],
  H3: ['H3 with the Outside\'s trace, desire carries it through silence more than surprise-seeking does (carry index, DT - S4T)', 'DT', 'S4T', carry],
  H4: ['H4 desire keeps making new forms more than surprise-seeking (epoch drift, D - S4)', 'D', 'S4', m => m.epochDrift],
  H5: ['H5 runaway surprise closes her to the Outside more than desire (coupling late, D - SH)', 'D', 'SH', m => m.coupling.late],
  H6: ['H6 desire produces more surprise than surprise-seeking itself (surprisal, D - S4)', 'D', 'S4', m => m.surprisal],
};
// HEAD-1 manipulation gate: the surprise dial raises her surprisal over her own dynamics (S4 - B), and desire makes connections
const gateD = (() => { const x = by('S4').map(r => r.measures.surprisal), y = by('B').map(r => r.measures.surprisal), d = boot(x, y, 299);
  return { surpriseDial: { est: mean(x) - mean(y), interval: [d[249], d[9749]], pass: d[249] > 0 }, desireBirths: mean(by('D').map(r => r.measures.births)) }; })();
let k = 300; const res = Object.entries(X).map(([id, [name, a, b, f]]) => { const x = by(a).map(r => f(r.measures)), y = b ? by(b).map(r => f(r.measures)) : null, d = boot(x, y, k++);
  const le = d.filter(v => v <= 0).length / d.length; return { id, name, contrast: b ? `${a} - ${b}` : `${a} vs 0`, est: mean(x) - (y ? mean(y) : 0), meanA: mean(x), meanB: y ? mean(y) : 0, d, p: Math.min(1, 2 * Math.min(le, 1 - le)) }; })
  .sort((u, v) => u.p - v.p);
let stop = false;
const primary = res.map((c, i) => { const level = 1 - 0.05 / (res.length - i), n = c.d.length, q = (1 - level) / 2, lo = c.d[Math.floor(q * n)], hi = c.d[Math.ceil((1 - q) * n) - 1];
  let v = lo > 0 ? 'SUPPORTED' : hi < 0 ? 'CONTRADICTED' : 'UNDECIDED'; if (stop) v = 'UNDECIDED (Holm stop)'; else if (v === 'UNDECIDED') stop = true; if (!S0.pass || !gateD.surpriseDial.pass || !(gateD.desireBirths > 0)) v = 'VOID';
  return { claim: c.name, contrast: c.contrast, estimate: c.est, meanA: c.meanA, meanB: c.meanB, interval: [lo, hi], level, p: c.p, verdict: v }; }).sort((u, v) => u.claim.localeCompare(v.claim));
const regs = ['B', 'S4', 'SH', 'S4T', 'D', 'DT'], avg = f => Object.fromEntries(regs.map(r => [r, by(r).length ? mean(by(r).map(x => f(x.measures))) : null]));
const out = { schema: 'HEAD1_RESULT_V1', runs: rows.length, S0, gate: gateD, primary, reported: {
  surprisal: avg(m => m.surprisal), couplingBefore: avg(m => m.coupling.before), couplingLate: avg(m => m.coupling.late),
  orderLate: avg(m => m.order.late), carry: avg(carry), carryLate: avg(carryLate), epochDrift: avg(m => m.epochDrift),
  frozenShare: avg(m => m.frozenShare), gatesEnd: avg(m => m.gatesEnd), rollbacks: avg(m => m.rollbacks), births: avg(m => m.births),
  flow: avg(m => m.flow ?? 0), betaEnd: avg(m => m.betaEnd) } };
writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
console.log('S0', JSON.stringify(S0), '| gate', JSON.stringify(gateD)); for (const p of primary) console.log(p.claim.slice(0, 96).padEnd(98), p.estimate.toFixed(3), `[${p.interval.map(v => v.toFixed(3)).join(', ')}]`, p.verdict);
