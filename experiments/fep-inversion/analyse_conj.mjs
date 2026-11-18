// CONJ-1 analysis. Usage: node analyse_conj.mjs <results dir> <out.json>. Files: <regime>_<seed>_<on|off>.json from conj.mjs.
// GATE (any failure makes every verdict VOID): (1) non-steering: for every regime and seed, her passage with the subject on
// is identical, step for step, to her passage with it off; (2) S0: every B run's Outside shows lag-1 order before the reversal.
// Faithfulness is judged against an INDEPENDENT description computed here from the logged passage (path and routes), never
// from the subject: plain counts over the 1,000 steps up to each readout.
// C1 paired bootstrap (own minus another seed's passage); C2 permutation test (10,000 relabellings); C3, C6 bootstrap of
// differences; C4, C5 bootstrap of correlations. Holm across the six (family alpha 0.05), ordered by p.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { rng } from './fep.mjs';
const [dir, outFile] = process.argv.slice(2);
const files = readdirSync(dir).filter(f => f.endsWith('.json'));
const runs = files.map(f => JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')));
const get = (r, s, on) => runs.find(x => x.measures.regime === r && x.measures.seed === s && x.subject === on);
const seedsOf = r => [...new Set(runs.filter(x => x.measures.regime === r && x.subject).map(x => x.measures.seed))].sort((a, b) => a - b);
const mean = a => a.reduce((u, v) => u + v, 0) / a.length;
// ---- the gate
const pairs = []; for (const r of ['B', 'D', 'DT', 'DTR2']) for (const s of seedsOf(r)) { const a = get(r, s, true), b = get(r, s, false); pairs.push(!!(a && b && a.path === b.path)); }
const NONSTEER = { pairs: pairs.length, identical: pairs.filter(Boolean).length, pass: pairs.length > 0 && pairs.every(Boolean) };
const lagOrdered = z => { const mi = (x, y) => { const j = new Map(), a = new Map(), b = new Map();
    for (let i = 0; i < x.length; i++) { const k = x[i] * 10 + y[i]; j.set(k, (j.get(k) ?? 0) + 1); a.set(x[i], (a.get(x[i]) ?? 0) + 1); b.set(y[i], (b.get(y[i]) ?? 0) + 1); }
    let s = 0; for (const [k, c] of j) s += (c / x.length) * Math.log((c * x.length) / (a.get(Math.floor(k / 10)) * b.get(k % 10))); return s; };
  const obs = mi(z.slice(0, -1), z.slice(1)), r = rng(77); let mx = 0;
  for (let k = 0; k < 20; k++) { const s = [...z]; for (let i = s.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [s[i], s[j]] = [s[j], s[i]]; } mx = Math.max(mx, mi(s.slice(0, -1), s.slice(1))); }
  return obs > mx; };
const S0 = (() => { const o = seedsOf('B').map(s => lagOrdered(get('B', s, true).outside.slice(0, 3000))); return { seeds: o.length, ordered: o.filter(Boolean).length, pass: o.length > 0 && o.every(Boolean) }; })();
const GATE = NONSTEER.pass && S0.pass;
// ---- the independent description of her passage over (t0, t1]
const regionOf = z => (z === 0 || z === 9 ? 'Plex' : z === 3 || z === 6 ? 'Warp' : 'Time-Circuit');
const dr = c => (c === 0 ? 0 : 1 + ((c - 1) % 9)), gateOf = z => dr((z * (z + 1)) / 2);
const meshOf = (a, b) => { const hi = Math.max(a, b), lo = Math.min(a, b); return hi * (hi - 1) / 2 + lo; };   // Mesh-NN = hi(hi-1)/2 + lo
function describe(run, t0, t1) { const zone = Array(10).fill(0), reg = { 'Time-Circuit': 0, Warp: 0, Plex: 0 }, dem = new Map(), syz = new Map(), cur = new Map();
  let plus = 0, minus = 0, hops = 0; const add = (m, k) => m.set(k, (m.get(k) ?? 0) + 1);
  for (let t = Math.max(0, t0 + 1); t <= t1; t++) { const z = Number(run.path[t]); zone[z]++; reg[regionOf(z)]++;
    const rt = run.routes[t]; for (let i = 1; i < rt.length; i++) { const f = Number(rt[i - 1]), g = Number(rt[i]); if (f === g) continue;
      add(dem, meshOf(f, g)); if (f + g === 9) add(syz, `${Math.max(f, g)}::${Math.min(f, g)}`); if (g === Math.abs(2 * f - 9)) add(cur, f);
      const s = (g - f + 10) % 10; hops++; if (s === 1) plus++; if (s === 9) minus++; } }
  const n = t1 - Math.max(0, t0 + 1) + 1, topk = (m, k) => [...m].sort((x, y) => y[1] - x[1] || (String(x[0]) < String(y[0]) ? -1 : 1)).slice(0, k).map(x => x[0]);
  return { zoneShare: zone.map(v => v / n), zones: zone.map((v, z) => [z, v]).sort((x, y) => y[1] - x[1] || x[0] - y[0]).slice(0, 3).map(x => x[0]),
    regions: Object.fromEntries(Object.entries(reg).map(([k, v]) => [k, v / n])), demons: topk(dem, 3), syz: topk(syz, 2), cur: topk(cur, 2), dir: hops ? (plus - minus) / hops : 0 }; }
const overlap = (a, b, k) => a.filter(x => b.includes(x)).length / k;
function agree(S, W) { const tv = ['Time-Circuit', 'Warp', 'Plex'].reduce((u, k) => u + Math.abs(S.regions[k] - W.regions[k]), 0) / 2;
  return mean([overlap(S.zones.map(z => z.key), W.zones, 3), overlap(S.demons.map(d => d.mesh), W.demons, 3),
    overlap(S.syzygies.map(x => x.key), W.syz, 2), overlap(S.currents.map(x => Number(x.key)), W.cur.map(Number), 2), 1 - tv]); }
const LATE = [4999, 5499, 5999], rd = (run, t) => run.readouts.find(x => x.t === t), sc = (run, t) => run.scrambled.find(x => x.t === t);
// ---- statistics
function boot(f, xs, seed) { const g = rng(seed), d = []; for (let k = 0; k < 10000; k++) { const s = xs.map(x => x.map(() => x[Math.floor(g() * x.length)])); d.push(f(...s)); } return d.sort((u, v) => u - v); }
const corr = (x, y) => { const mx = mean(x), my = mean(y); let a = 0, b = 0, c = 0; for (let i = 0; i < x.length; i++) { a += (x[i] - mx) * (y[i] - my); b += (x[i] - mx) ** 2; c += (y[i] - my) ** 2; } return b && c ? a / Math.sqrt(b * c) : 0; };
const M = seedsOf('DTR2'), Mr = M.map(s => get('DTR2', s, true));
const claims = [];
{ // C1 accuracy, paired over seeds: own passage minus the next seed's passage
  const d = Mr.map((r, i) => { const o = Mr[(i + 1) % Mr.length]; return mean(LATE.map(t => agree(rd(r, t), describe(r, t - 1000, t)) - agree(rd(r, t), describe(o, t - 1000, t)))); });
  const own = mean(Mr.map(r => mean(LATE.map(t => agree(rd(r, t), describe(r, t - 1000, t))))));
  claims.push({ id: 'C1', name: 'C1 it is accurate (agreement with her own recent passage minus another run\'s)', est: mean(d), extra: { ownAgreement: own }, d: boot(x => mean(x), [d], 501) }); }
{ // C2 it is hers: blind matching at the final readout against 10,000 random relabellings
  const W = Mr.map(r => describe(r, 4999, 5999)), sc2 = Mr.map(r => W.map(w => agree(rd(r, 5999), w)));
  const pick = sc2.map(row => row.indexOf(Math.max(...row))), hits = pick.filter((j, i) => j === i).length, g = rng(502); let ge = 0;
  for (let k = 0; k < 10000; k++) { const p = [...pick.keys()]; for (let i = p.length - 1; i > 0; i--) { const j = Math.floor(g() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
    if (pick.filter((j, i) => j === p[i]).length >= hits) ge++; }
  claims.push({ id: 'C2', name: 'C2 it is hers (blind matching of the motor\'s statements to their passages)', est: hits / Mr.length, extra: { hits, of: Mr.length, chance: 1 / Mr.length }, pPerm: (ge + 1) / 10001 }); }
{ // C3 it follows her becoming: stated direction +1 before the reversal and -1 late, motor minus her own dynamics
  const turned = r => (rd(r, 2499).direction.sign > 0 && rd(r, 5999).direction.sign < 0 ? 1 : 0);
  const x = Mr.map(turned), y = seedsOf('B').map(s => turned(get('B', s, true)));
  claims.push({ id: 'C3', name: 'C3 it follows her becoming (share whose stated direction turns, motor minus B)', est: mean(x) - mean(y), extra: { motor: mean(x), B: mean(y) }, d: boot((a, b) => mean(a) - mean(b), [x, y], 503) }); }
{ // C4 it is nomadic: change between successive readouts tracks the change in her passage (mean within-seed correlation)
  const vec = (zs, regs, dir) => { const v = Array(10).fill(0); for (const [z, s] of zs) v[z] = s; return [...v, regs['Time-Circuit'], regs.Warp, regs.Plex, dir]; };
  const L1 = (a, b) => a.reduce((u, v, i) => u + Math.abs(v - b[i]), 0);
  const rs = Mr.map(r => { const ts = r.readouts.map(x => x.t), ds = [], dp = [];
    for (let k = 1; k < ts.length; k++) { const a = rd(r, ts[k - 1]), b = rd(r, ts[k]);
      ds.push(L1(vec(a.zones.map(z => [z.key, z.share]), a.regions, a.direction.value), vec(b.zones.map(z => [z.key, z.share]), b.regions, b.direction.value)));
      const wa = describe(r, ts[k - 1] - 500, ts[k - 1]), wb = describe(r, ts[k] - 500, ts[k]);
      dp.push(L1([...wa.zoneShare, wa.regions['Time-Circuit'], wa.regions.Warp, wa.regions.Plex, wa.dir], [...wb.zoneShare, wb.regions['Time-Circuit'], wb.regions.Warp, wb.regions.Plex, wb.dir])); }
    return corr(ds, dp); });
  claims.push({ id: 'C4', name: 'C4 it is nomadic (its change between readouts tracks the change in her passage)', est: mean(rs), d: boot(x => mean(x), [rs], 504) }); }
{ // C5 it knows the Outside's part: stated trace strength against the run's carry through silence, over the motor's seeds
  const carry = m => ((m.silence.before.plus - m.silence.before.minus) + (m.silence.late.minus - m.silence.late.plus)) / 2;
  const pr = Mr.map(r => [rd(r, 5999).outside, carry(r.measures)]);
  claims.push({ id: 'C5', name: 'C5 it knows the Outside\'s part (stated trace strength vs carry through silence)', est: corr(pr.map(p => p[0]), pr.map(p => p[1])),
    d: boot(p => corr(p.map(q => q[0]), p.map(q => q[1])), [pr], 505) }); }
{ // C6 it does not confabulate: stated direction agrees with her passage's, real subject minus the scrambled one (paired)
  const ag = (S, r, t) => (S.direction.sign === Math.sign(Math.round(describe(r, t - 1000, t).dir * 100)) ? 1 : 0);
  const d = Mr.map(r => mean(LATE.map(t => ag(rd(r, t), r, t) - ag(sc(r, t), r, t))));
  claims.push({ id: 'C6', name: 'C6 it does not confabulate (direction agreement, real minus scrambled)', est: mean(d),
    extra: { real: mean(Mr.map(r => mean(LATE.map(t => ag(rd(r, t), r, t))))), scrambled: mean(Mr.map(r => mean(LATE.map(t => ag(sc(r, t), r, t))))) }, d: boot(x => mean(x), [d], 506) }); }
for (const c of claims) if (c.d) { const le = c.d.filter(v => v <= 0).length / c.d.length; c.p = Math.min(1, 2 * Math.min(le, 1 - le)); } else c.p = c.pPerm;
claims.sort((u, v) => u.p - v.p); let stop = false;
const primary = claims.map((c, i) => { const level = 1 - 0.05 / (claims.length - i); let v, iv = null;
  if (c.d) { const n = c.d.length, q = (1 - level) / 2; iv = [c.d[Math.floor(q * n)], c.d[Math.ceil((1 - q) * n) - 1]]; v = iv[0] > 0 ? 'SUPPORTED' : iv[1] < 0 ? 'CONTRADICTED' : 'UNDECIDED'; }
  else v = c.p <= 1 - level ? 'SUPPORTED' : 'UNDECIDED';
  if (stop) v = 'UNDECIDED (Holm stop)'; else if (v === 'UNDECIDED') stop = true; if (!GATE) v = 'VOID';
  return { claim: c.name, estimate: c.est, interval: iv, p: c.p, level, verdict: v, ...(c.extra ? { extra: c.extra } : {}) }; }).sort((u, v) => u.claim.localeCompare(v.claim));
const sample = Object.fromEntries(['B', 'D', 'DT', 'DTR2'].map(r => { const s = seedsOf(r)[0], x = s !== undefined ? get(r, s, true) : null;
  return [r, x ? { seed: s, t2499: rd(x, 2499).words, t5999: rd(x, 5999).words } : null]; }));
const lagTurn = Mr.map(r => { const t = r.readouts.find(x => x.t > 3000 && x.direction.sign < 0); return t ? t.t - 3000 : null; }).filter(v => v !== null);
const out = { schema: 'CONJ1_RESULT_V1', runs: runs.length, gate: { nonSteering: NONSTEER, S0, pass: GATE }, primary,
  reported: { sampleStatements: sample, turnLagSteps: lagTurn.length ? mean(lagTurn) : null, turnedSeeds: lagTurn.length,
    rollbacksSeenD: mean(seedsOf('D').map(s => rd(get('D', s, true), 5999).rollbacks)),
    ownAgreementByRegime: Object.fromEntries(['B', 'D', 'DT', 'DTR2'].map(r => [r, mean(seedsOf(r).map(s => { const x = get(r, s, true); return mean(LATE.map(t => agree(rd(x, t), describe(x, t - 1000, t)))); }))])) } };
writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
console.log('GATE', JSON.stringify(out.gate)); for (const p of primary) console.log(p.claim.slice(0, 96).padEnd(98), p.estimate.toFixed(3), p.interval ? `[${p.interval.map(v => v.toFixed(3)).join(', ')}]` : `p=${p.p.toFixed(4)}`, p.verdict);
