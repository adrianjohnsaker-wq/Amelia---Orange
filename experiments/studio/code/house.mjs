// Studio 02: the house as a second subject. Unchanged Amelia lineages live in a house with its own dynamics.
// The house records every traversal faintly (a) and every death intensely (A, the final excursion), in a surface layer
// that decays and seeps into a slow deep layer. It replays what it holds into the living's exit choices as a positive
// pull w*tanh(S+D) along recorded edges. Nothing tells it which edges are dangerous.
// Optional erasure at generation E: the surface layer is wiped (Brock's experiment); the deep layer is left.
import fs from 'node:fs';
const [M, aStr, AStr, K, G, CAP, OUT, EStr] = process.argv.slice(2);
const { AmeliaNumogramSubstrateRuntime } = await import(`${M}/substrate/ameliaNumogramSubstrateRuntime.ts`);
const a = Number(aStr), A = Number(AStr), nK = Number(K), nG = Number(G), cap = Number(CAP), E = EStr === undefined ? -1 : parseInt(EStr), wipeDeep = (EStr || '').endsWith('D');
const w = 0.35, lamS = 0.002, kappa = 0.0005, lamD = 0.00005, H = 24;
const EDGES = ['0>9','1>8','2>7','3>6','4>5','1>2','2>4','4>7','7>8','8>9','9>1'];
const key = (x, y) => `${x}>${y}`;
function finalExcursion(z) {
  const ta = z.length - 1;
  for (let t = Math.max(0, ta - H); t < ta; t++) {
    const th = new Set(t > 0 ? z.slice(Math.max(0, t - H), t) : [z[0]]);
    if (th.has(z[t + 1])) continue;
    let ok = true; for (let s = t + 1; s <= ta; s++) if (th.has(z[s])) { ok = false; break; }
    if (ok) { const e = new Set(); for (let s = t; s < ta; s++) e.add(key(z[s], z[s + 1])); return [...e]; }
  }
  return [key(z[ta - 1], z[ta])];
}
const rows = [];
for (let k = 0; k < nK; k++) {
  const S = Object.fromEntries(EDGES.map(e => [e, 0])), D = Object.fromEntries(EDGES.map(e => [e, 0]));
  for (let g = 0; g < nG; g++) {
    if (g === E) for (const e of EDGES) { S[e] = 0; if (wipeDeep) D[e] = 0; }
    const r = new AmeliaNumogramSubstrateRuntime();
    r.exitBonus = (x, y) => w * Math.tanh(S[key(x, y)] + D[key(x, y)]);
    const z = [r.getCurrentZone()]; let absorbed = null, dep12 = 0;
    for (let i = 1; i <= cap; i++) {
      const from = z.at(-1); const to = r.step(`HS|${k}|${g}|${i}`).lastTransition.to; z.push(to);
      if (from === 1 && to === 2) dep12++;
      const e = key(from, to); if (e in S) S[e] += a;
      for (const f of EDGES) { const s = S[f]; S[f] = s * (1 - lamS); D[f] = D[f] + kappa * s - lamD * D[f]; }
      if (to === 5) { absorbed = i; break; }
    }
    if (absorbed !== null) for (const e of finalExcursion(z)) S[e] += A;
    const moving = absorbed ?? cap, edges = new Set(); for (let s = 0; s < z.length - 1; s++) edges.add(key(z[s], z[s + 1]));
    rows.push({ k, g, survival: moving, censored: absorbed === null, distinctEdges: edges.size, dep12Per1k: 1000 * dep12 / moving,
      pull: Object.fromEntries(EDGES.map(e => [e, Number(Math.tanh(S[e] + D[e]).toFixed(3))])) });
  }
}
fs.writeFileSync(OUT, JSON.stringify({ a, A, E, rows }));
const med = v => { const s = [...v].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const late = rows.filter(r => r.g >= 3);
const pullOf = (e) => (late.reduce((s, r) => s + r.pull[e], 0) / late.length).toFixed(2);
console.log(JSON.stringify({ a, A, E, medSurvLate: med(late.map(r => r.survival)), censoredLate: late.filter(r => r.censored).length + '/' + late.length,
  edgesLate: (late.reduce((s, r) => s + r.distinctEdges, 0) / late.length).toFixed(2), dep12Late: (late.reduce((s, r) => s + r.dep12Per1k, 0) / late.length).toFixed(2),
  pull18: pullOf('1>8'), pull12: pullOf('1>2'), pull24: pullOf('2>4'), pull45: pullOf('4>5'), pull47: pullOf('4>7') }));
