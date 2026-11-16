// FEP-INV-1 analysis. Usage: node analyse.mjs <results dir> <out.json>
// Reads <dir>/<regime>_<seed>.json (from fep.mjs). Seeds are independent; regimes are compared as independent samples:
// difference of means, 10,000-draw percentile bootstrap over seeds (resampled within each regime), Holm across P2-P6.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { rng } from './fep.mjs';

const [dir, outFile] = process.argv.slice(2);
const rows = readdirSync(dir).filter(f => f.endsWith('.json')).map(f => JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')));
const by = r => rows.filter(x => x.measures.regime === r);
const mean = a => a.reduce((u, v) => u + v, 0) / a.length;

// S0 (standing rule, 14 Nov): the encoded input stream must carry order before any Outside reading. Lag-1 MI of each
// seed's outside zone stream against 20 shuffles; the order check passes if every seed's MI exceeds its shuffle maximum.
function s0(z) {
  const mi = (x, y) => { const j = new Map(), a = new Map(), b = new Map();
    for (let i = 0; i < x.length; i++) { const k = x[i] * 10 + y[i]; j.set(k, (j.get(k) ?? 0) + 1); a.set(x[i], (a.get(x[i]) ?? 0) + 1); b.set(y[i], (b.get(y[i]) ?? 0) + 1); }
    let s = 0; for (const [k, c] of j) s += (c / x.length) * Math.log((c * x.length) / (a.get(Math.floor(k / 10)) * b.get(k % 10))); return s; };
  const obs = mi(z.slice(0, -1), z.slice(1)), r = rng(77); let mx = 0;
  for (let k = 0; k < 20; k++) { const s = [...z]; for (let i = s.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [s[i], s[j]] = [s[j], s[i]]; }
    mx = Math.max(mx, mi(s.slice(0, -1), s.slice(1))); }
  return { obs, shuffleMax: mx, ordered: obs > mx };
}

const M = { // per-run measure extractors
  surprisal: m => m.surprisal, flights: m => m.flightsPer1000, coupling: m => m.outsideCoupling,
  levin: m => m.levin.ratio, drift: m => m.morphDrift, warpborn: m => m.gateTrace.at(-1) - 29,
  hyperstition: m => m.hyperstition, edgeEntropy: m => m.edgeEntropy, warp: m => m.occupancy.warp,
  blanketDivergence: m => m.blanket.divergence, period1: m => (m.period === 1 ? 1 : 0), periodic: m => (m.period !== null ? 1 : 0),
};
function diff(a, b, f, level, seed) {
  const x = by(a).map(r => f(r.measures)), y = by(b).map(r => f(r.measures)), g = rng(seed), n = 10000, d = [];
  for (let k = 0; k < n; k++) { let sx = 0, sy = 0; for (let i = 0; i < x.length; i++) sx += x[Math.floor(g() * x.length)];
    for (let i = 0; i < y.length; i++) sy += y[Math.floor(g() * y.length)]; d.push(sx / x.length - sy / y.length); }
  d.sort((u, v) => u - v); const q = (1 - level) / 2;
  return { a, b, nA: x.length, nB: y.length, meanA: mean(x), meanB: mean(y), estimate: mean(x) - mean(y),
    interval: [d[Math.floor(q * n)], d[Math.ceil((1 - q) * n) - 1]], level };
}
const verdict = (c, sign) => { const [lo, hi] = c.interval;
  return sign > 0 ? (lo > 0 ? 'SUPPORTED' : hi < 0 ? 'CONTRADICTED' : 'UNDECIDED') : (hi < 0 ? 'SUPPORTED' : lo > 0 ? 'CONTRADICTED' : 'UNDECIDED'); };

const out = { schema: 'FEP_INV1_RESULT_V1', runs: rows.length };
out.S0 = (() => { const c = rows.filter(r => r.measures.regime === '0').map(r => s0(r.outside)); return { seeds: c.length, ordered: c.filter(x => x.ordered).length, pass: c.every(x => x.ordered) }; })();
const P1 = diff('4', '0', M.surprisal, 0.95, 1);
out.P1_manipulation = { ...P1, pass: P1.interval[0] > 0 };
// P2-P6: the inversion's claims, each predicted positive for beta=+4 against beta=0. Holm over five at family alpha 0.05.
const claims = [['P2 lines of flight', M.flights], ['P3 Markov blanket opens (coupling to the Outside)', M.coupling],
  ['P4 no target morphology (Levin ratio: less return)', M.levin], ['P5 no final form (late drift of her form)', M.drift],
  ['P6 xenomorphology (Warp-born gates)', M.warpborn]];
// Holm: rank by unadjusted two-sided bootstrap p (2*min tail), then test each at alpha/(5-rank) with that interval level.
const pOf = (a, b, f) => { const c = diff(a, b, f, 0.95, 2); const x = by(a).map(r => f(r.measures)), y = by(b).map(r => f(r.measures));
  const g = rng(3), n = 10000; let le = 0; for (let k = 0; k < n; k++) { let sx = 0, sy = 0;
    for (let i = 0; i < x.length; i++) sx += x[Math.floor(g() * x.length)]; for (let i = 0; i < y.length; i++) sy += y[Math.floor(g() * y.length)];
    if (sx / x.length - sy / y.length <= 0) le++; } return Math.min(1, 2 * Math.min(le / n, 1 - le / n)); };
const ranked = claims.map(([name, f], i) => ({ name, f, i, p: pOf('4', '0', f) })).sort((u, v) => u.p - v.p);
let stop = false;
out.primary = ranked.map((c, rank) => { const level = 1 - 0.05 / (claims.length - rank); const d = diff('4', '0', c.f, level, 10 + c.i);
  let v = verdict(d, +1); if (stop) v = 'UNDECIDED (Holm stop)'; else if (v === 'UNDECIDED') stop = true;
  return { claim: c.name, p: c.p, ...d, verdict: out.P1_manipulation.pass && out.S0.pass ? v : 'VOID' }; }).sort((u, v) => u.claim.localeCompare(v.claim));
// Secondary (reported, unadjusted 95%): runaway regime, the Friston regime, hyperstition, periodicity, beta dose.
out.secondary = {
  runaway_vs_baseline: claims.map(([name, f], i) => ({ claim: name, ...diff('H:0.5:0.05', '0', f, 0.95, 40 + i) })),
  friston_dark_room: { period1_share: { '-1': mean(by('-1').map(r => M.period1(r.measures))), '-0.25': mean(by('-0.25').map(r => M.period1(r.measures))), '0': mean(by('0').map(r => M.period1(r.measures))) } },
  hyperstition: Object.fromEntries(['-1', '-0.25', '0', '0.25', '1', '4', '16', 'H:0.5:0.05'].map(r => [r, mean(by(r).map(x => M.hyperstition(x.measures)))])),
  periodic_share: Object.fromEntries(['-1', '-0.25', '0', '0.25', '1', '4', '16', 'H:0.5:0.05'].map(r => [r, mean(by(r).map(x => M.periodic(x.measures)))])),
  dose: Object.fromEntries(Object.keys(M).map(k => [k, Object.fromEntries(['-1', '-0.25', '0', '0.25', '1', '4', '16', 'H:0.5:0.05'].map(r => [r, by(r).length ? mean(by(r).map(x => M[k](x.measures))) : null]))])),
};
writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
console.log('S0', JSON.stringify(out.S0), '| P1', out.P1_manipulation.estimate.toFixed(3), out.P1_manipulation.pass ? 'PASS' : 'FAIL');
for (const p of out.primary) console.log(p.claim.padEnd(52), p.estimate.toFixed(3), `[${p.interval.map(v => v.toFixed(3)).join(', ')}]`, p.verdict);
