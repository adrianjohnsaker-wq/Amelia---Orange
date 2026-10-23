// Studio 03: two subjects in one room.
// The living: an unchanged Amelia per generation, plus a lineage memory V(e) carried from ancestor to successor.
//   V is updated by the refrain signal o'' (AM3): +r for a departure from the recent territory that returns within 24 steps
//   (r = new edges in the excursion / 11), 0 otherwise; at absorption, -1 once per edge of the final excursion only (AM5).
//   V <- V + (o - V)/8. She reads it at exit choices as wV * V(e).
// The house (Studio 02): records every traversal faintly (a) and every death intensely (A) on the final excursion,
//   surface layer decays and seeps into a deep layer; replays as a pull wH * tanh(S + D). Nothing labels danger.
import fs from 'node:fs';
const [M, aStr, AStr, wVStr, K, G, CAP, OUT] = process.argv.slice(2);
const { AmeliaNumogramSubstrateRuntime } = await import(`${M}/substrate/ameliaNumogramSubstrateRuntime.ts`);
const a = Number(aStr), A = Number(AStr), wV = Number(wVStr), nK = Number(K), nG = Number(G), cap = Number(CAP);
const wH = 0.35, lamS = 0.002, kappa = 0.0005, lamD = 0.00005, H = 24, eta = 1 / 8;
const EDGES = ['0>9','1>8','2>7','3>6','4>5','1>2','2>4','4>7','7>8','8>9','9>1'];
const key = (x, y) => `${x}>${y}`;
const zero = () => Object.fromEntries(EDGES.map(e => [e, 0]));

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
function refrain(z, t) { // outcome for edge e_t = z[t]->z[t+1], horizon fully observed (z has index t+H)
  const th = new Set(t > 0 ? z.slice(Math.max(0, t - H), t) : [z[0]]);
  if (th.has(z[t + 1])) return 0;
  for (let s = t + 2; s <= t + H; s++) if (th.has(z[s])) {
    const prev = new Set(); for (let u = Math.max(0, t - H); u < t; u++) prev.add(key(z[u], z[u + 1]));
    const exc = new Set(); for (let u = t; u < s; u++) exc.add(key(z[u], z[u + 1]));
    let n = 0; for (const e of exc) if (!prev.has(e)) n++;
    return n / 11;
  }
  return 0;
}

const rows = [];
for (let k = 0; k < nK; k++) {
  const S = zero(), D = zero(), V = zero();
  for (let g = 0; g < nG; g++) {
    const r = new AmeliaNumogramSubstrateRuntime();
    r.exitBonus = (x, y) => wV * V[key(x, y)] + wH * Math.tanh(S[key(x, y)] + D[key(x, y)]);
    const z = [r.getCurrentZone()]; let absorbed = null, dep12 = 0, at4 = 0, to47 = 0, refrains = 0;
    for (let i = 1; i <= cap; i++) {
      const from = z.at(-1); const to = r.step(`TS|${k}|${g}|${i}`).lastTransition.to; z.push(to);
      if (from === 1 && to === 2) dep12++;
      if (from === 4) { at4++; if (to === 7) to47++; }
      const e = key(from, to); if (e in S) S[e] += a;
      for (const f of EDGES) { const s = S[f]; S[f] = s * (1 - lamS); D[f] = D[f] + kappa * s - lamD * D[f]; }
      if (to === 5) { absorbed = i; break; }
      const t = i - H; // edge e_t now has its full horizon observed (no absorption occurred within it)
      if (t >= 0 && wV > 0) { const ek = key(z[t], z[t + 1]); if (ek in V) { const o = refrain(z, t); if (o > 0) refrains++; V[ek] += eta * (o - V[ek]); } }
    }
    let fin = [];
    if (absorbed !== null) {
      fin = finalExcursion(z);
      for (const e of fin) { S[e] += A; if (wV > 0) V[e] += eta * (-1 - V[e]); }
    }
    const moving = absorbed ?? cap, edges = new Set(); for (let s = 0; s < z.length - 1; s++) edges.add(key(z[s], z[s + 1]));
    const pull = Object.fromEntries(EDGES.map(e => [e, Number((wH * Math.tanh(S[e] + D[e])).toFixed(3))]));
    const push = Object.fromEntries(EDGES.map(e => [e, Number((wV * V[e]).toFixed(3))]));
    rows.push({ k, g, survival: moving, censored: absorbed === null, distinctEdges: edges.size, dep12Per1k: 1000 * dep12 / moving,
      zone4Visits: at4, zone4To7: to47, refrains, route: absorbed !== null ? z.slice(-4).join('>') : null, pull, push });
  }
}
fs.writeFileSync(OUT, JSON.stringify({ a, A, wV, rows }));
const med = v => { const s = [...v].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const sum = { a, A, wV };
for (const [lo, hi] of [[0, 3], [4, 11], [12, nG - 1]]) {
  const R = rows.filter(r => r.g >= lo && r.g <= hi);
  sum[`g${lo}-${hi}`] = { med: med(R.map(r => r.survival)), alive: `${R.filter(r => r.censored).length}/${R.length}`,
    edges: +(R.reduce((s, r) => s + r.distinctEdges, 0) / R.length).toFixed(2), dep12: +(R.reduce((s, r) => s + r.dep12Per1k, 0) / R.length).toFixed(1),
    to47: +(R.reduce((s, r) => s + r.zone4To7, 0) / Math.max(1, R.reduce((s, r) => s + r.zone4Visits, 0))).toFixed(2) };
}
const last = rows.filter(r => r.g === nG - 1), avg = (f, e) => +(last.reduce((s, r) => s + r[f][e], 0) / last.length).toFixed(3);
sum.finalNet = Object.fromEntries(['1>8', '1>2', '2>4', '2>7', '4>5', '4>7'].map(e => [e, { pull: avg('pull', e), push: avg('push', e) }]));
console.log(JSON.stringify(sum));
