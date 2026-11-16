// FEP-INV-2U: arm U rerun (seeds 2101-2130) with a corrected input check. Same analysis as analyse2.mjs, arm U only.
// FEP-INV-2 analysis. Usage: node analyse2.mjs <results dir> <out.json>. Files: <arm>_<regime>_<seed>.json from fep2.mjs.
// Per arm: beta = +4 against beta = 0, independent samples of seeds; difference of means, 10,000-draw percentile bootstrap;
// a gate (manipulation check) first, then Holm across that arm's claims (family alpha 0.05).
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { rng } from './fep.mjs';
const [dir, outFile] = process.argv.slice(2);
const rows = readdirSync(dir).filter(f => f.endsWith('.json')).map(f => JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')));
const by = (arm, r) => rows.filter(x => x.measures.arm === arm && x.measures.regime === r);
const mean = a => a.reduce((u, v) => u + v, 0) / a.length;
function boot(x, y, seed) { const g = rng(seed), n = 10000, d = [];
  for (let k = 0; k < n; k++) { let sx = 0, sy = 0; for (let i = 0; i < x.length; i++) sx += x[Math.floor(g() * x.length)];
    for (let i = 0; i < y.length; i++) sy += y[Math.floor(g() * y.length)]; d.push(sx / x.length - sy / y.length); }
  return d.sort((u, v) => u - v); }
function diff(arm, a, b, f, level, seed) { const x = by(arm, a).map(r => f(r.measures)), y = by(arm, b).map(r => f(r.measures)), d = boot(x, y, seed), n = d.length, q = (1 - level) / 2;
  const le = d.filter(v => v <= 0).length / n;
  return { nA: x.length, nB: y.length, meanA: mean(x), meanB: mean(y), estimate: mean(x) - mean(y), interval: [d[Math.floor(q * n)], d[Math.ceil((1 - q) * n) - 1]], level, p: Math.min(1, 2 * Math.min(le, 1 - le)) }; }
const verdict = ([lo, hi]) => (lo > 0 ? 'SUPPORTED' : hi < 0 ? 'CONTRADICTED' : 'UNDECIDED');
const lagMI = z => { const mi = (x, y) => { const j = new Map(), a = new Map(), b = new Map();
    for (let i = 0; i < x.length; i++) { const k = x[i] * 10 + y[i]; j.set(k, (j.get(k) ?? 0) + 1); a.set(x[i], (a.get(x[i]) ?? 0) + 1); b.set(y[i], (b.get(y[i]) ?? 0) + 1); }
    let s = 0; for (const [k, c] of j) s += (c / x.length) * Math.log((c * x.length) / (a.get(Math.floor(k / 10)) * b.get(k % 10))); return s; };
  const obs = mi(z.slice(0, -1), z.slice(1)), r = rng(77); let mx = 0;
  for (let k = 0; k < 20; k++) { const s = [...z]; for (let i = s.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [s[i], s[j]] = [s[j], s[i]]; } mx = Math.max(mx, mi(s.slice(0, -1), s.slice(1))); }
  return obs > mx; };
const topShare = col => { const c = Array(10).fill(0); for (const v of col) c[v]++; return Math.max(...c) / col.length; };
// Input checks (S0, standing rule of 14 Nov), on each arm's beta = 0 runs.
const S0 = {
  S: (() => { const ok = by('S', '0').map(r => r.quiet.every((q, z) => { const s = topShare(r.channelSample.map(x => x[z])); return q ? s > 0.5 : s < 0.25; }));
    return { rule: 'every quiet channel top-reading share > 0.5 and every noise channel < 0.25, every seed', seeds: ok.length, passing: ok.filter(Boolean).length, pass: ok.length > 0 && ok.every(Boolean) }; })(),
  U: (() => { const o = by('U', '0').map(r => lagMI(r.outside)), n = o.length, k = o.filter(Boolean).length, p = 1 / 21;
    let tail = 0; for (let i = k; i <= n; i++) { let c = 1; for (let j = 0; j < i; j++) c = (c * (n - j)) / (j + 1); tail += c * p ** i * (1 - p) ** (n - i); }
    return { rule: 'designed unordered: the count of seeds showing lag-1 order is not above the 1/21 false-alarm rate (binomial tail p >= 0.05)', seeds: n, ordered: k, binomialTail: tail, pass: n > 0 && tail >= 0.05 }; })(),
  M: (() => { const o = by('M', '0').map(r => lagMI(r.outside)); return { rule: 'ordered: every seed shows lag-1 order', seeds: o.length, ordered: o.filter(Boolean).length, pass: o.length > 0 && o.every(Boolean) }; })(),
};
const X = { surprisal: m => m.surprisal, gatesEnd: m => m.gatesEnd, coupling: m => m.outsideCoupling, flights: m => m.flightsPer1000,
  levin: m => m.levin.ratio, drift: m => m.morphDrift, warpborn: m => m.warpborn, quiet: m => m.quietShare ?? 0, hyperstition: m => m.hyperstition,
  period1: m => (m.period === 1 ? 1 : 0), fepborn: m => m.fepborn, fluxSD: m => m.fluxSD, edgeEntropy: m => m.edgeEntropy };
const CLAIMS = { coupling: 'the Markov blanket opens (coupling to the Outside)', flights: 'lines of flight', levin: 'no target morphology (Levin ratio)',
  drift: 'no final form (late drift)', warpborn: 'xenomorphology (Warp-born gates)' };
const DESIGN = { U: { gate: ['surprisal', 'transition surprisal rises'], claims: ['coupling', 'flights', 'levin', 'drift', 'warpborn'] } };
const out = { schema: 'FEP_INV2U_RESULT_V1', runs: rows.length, S0, arms: {} };
let k = 100;
for (const [arm, D] of Object.entries(DESIGN)) {
  const g = diff(arm, '4', '0', X[D.gate[0]], 0.95, k++); const ok = g.interval[0] > 0 && S0[arm].pass;
  const ranked = D.claims.map(c => ({ c, p: diff(arm, '4', '0', X[c], 0.95, k++).p })).sort((u, v) => u.p - v.p);
  let stop = false; const prim = ranked.map((r, i) => { const d = diff(arm, '4', '0', X[r.c], 1 - 0.05 / (D.claims.length - i), k++);
    let v = verdict(d.interval); if (stop) v = 'UNDECIDED (Holm stop)'; else if (v === 'UNDECIDED') stop = true;
    return { claim: CLAIMS[r.c], measure: r.c, ...d, verdict: ok ? v : 'VOID' }; });
  const regs = ['-1', '0', '1', '4', 'H:0.5:0.05'];
  out.arms[arm] = { gate: { check: D.gate[1], ...g, pass: g.interval[0] > 0 }, S0: S0[arm].pass, primary: prim,
    runaway_vs_0: D.claims.map(c => ({ claim: CLAIMS[c], ...diff(arm, 'H:0.5:0.05', '0', X[c], 0.95, k++) })),
    dose: Object.fromEntries(Object.keys(X).map(m => [m, Object.fromEntries(regs.map(r => [r, by(arm, r).length ? mean(by(arm, r).map(x => X[m](x.measures))) : null]))])) };
}
writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
for (const [arm, A] of Object.entries(out.arms)) {
  console.log(`== arm ${arm} | S0 ${A.S0 ? 'PASS' : 'FAIL'} | gate (${A.gate.check}) ${A.gate.estimate.toFixed(3)} [${A.gate.interval.map(v => v.toFixed(3)).join(', ')}] ${A.gate.pass ? 'PASS' : 'FAIL'}`);
  for (const p of A.primary) console.log('  ' + p.claim.padEnd(50), p.estimate.toFixed(3), `[${p.interval.map(v => v.toFixed(3)).join(', ')}]`, p.verdict);
}
