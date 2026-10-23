// Studio prototype: The Stone Tape. A lineage of unchanged Amelias in a house that records their deaths.
// LS: the place (the gates) carries marks T(e) written at each absorption on the final excursion only (AM5 rule);
//     every new individual is canonical and fresh, and reads the marks with weight 0.5 at its exit choices.
// L0: same lineages, no marks (each individual alone).  LSY: marks taken from a different lineage's house.
import fs from 'node:fs';
const [M, arm, K, G, CAP, OUT, LSFILE] = process.argv.slice(2);
const { AmeliaNumogramSubstrateRuntime } = await import(`${M}/substrate/ameliaNumogramSubstrateRuntime.ts`);
const nK = Number(K), nG = Number(G), cap = Number(CAP), W = 0.5, H = 24;
const key = (a, b) => `${a}>${b}`;
const lsTapes = arm === 'LSY' ? JSON.parse(fs.readFileSync(LSFILE, 'utf8')).tapes : null;

function finalExcursion(z) { // z[0..ta], z[ta] = 5
  const ta = z.length - 1;
  for (let t = Math.max(0, ta - H); t < ta; t++) {
    const th = new Set(t > 0 ? z.slice(Math.max(0, t - H), t) : [z[0]]);
    if (th.has(z[t + 1])) continue;
    let ok = true; for (let s = t + 1; s <= ta; s++) if (th.has(z[s])) { ok = false; break; }
    if (ok) { const e = new Set(); for (let s = t; s < ta; s++) e.add(key(z[s], z[s + 1])); return [...e]; }
  }
  return [key(z[ta - 1], z[ta])];
}

const rows = [], tapes = [];
for (let k = 0; k < nK; k++) {
  let T = {}; tapes.push([]); let inherited = null;
  for (let g = 0; g < nG; g++) {
    tapes[k].push({ ...T });
    const read = arm === 'LS' ? T : arm === 'LSY' ? lsTapes[(k + 1) % nK][g] : {};
    const r = new AmeliaNumogramSubstrateRuntime();
    if (arm === 'Q' && inherited) r.getMemory().importState(inherited);
    r.exitBonus = (a, b) => W * (read[key(a, b)] || 0);
    const z = [r.getCurrentZone()];
    let absorbed = null, deps12 = 0, cued45 = 0, at4 = 0, to47 = 0;
    for (let i = 1; i <= cap; i++) {
      const from = z.at(-1);
      const snap = r.step(`ST|${k}|${g}|${i}`);
      const to = snap.lastTransition.to; z.push(to);
      if (from === 1 && to === 2) deps12++;
      if (from === 4) { at4++; if (to === 7) to47++; }
      if (to === 5) { absorbed = i; break; }
    }
    const moving = absorbed ?? cap;
    const edges = new Set(); for (let s = 0; s < z.length - 1; s++) edges.add(key(z[s], z[s + 1]));
    let marked = [];
    if (absorbed !== null) {
      marked = finalExcursion(z);
      if (arm === 'Q') inherited = r.getMemory().exportState();
      if (arm === 'LS') for (const e of marked) T[e] = (T[e] || 0) + (-1 - (T[e] || 0)) / 8;
    }
    rows.push({ k, g, survival: moving, censored: absorbed === null, distinctEdges: edges.size,
      explorationPer1k: Number((1000 * edges.size / moving).toFixed(3)), departures12: deps12,
      departures12Per1k: Number((1000 * deps12 / moving).toFixed(3)), zone4Visits: at4, zone4To7: to47,
      route: absorbed !== null ? z.slice(-4).join('>') : null, markedFinalExcursion: marked,
      tapeRead: Object.fromEntries(Object.entries(read).map(([e, v]) => [e, Number(v.toFixed(4))])) });
  }
}
fs.writeFileSync(OUT, JSON.stringify({ arm, K: nK, G: nG, cap, rows, tapes }));
const byG = g => rows.filter(r => r.g === g);
for (const g of [0, 1, 2, 3, 5, 9, nG - 1].filter((v, i, a) => v < nG && a.indexOf(v) === i)) {
  const R = byG(g), surv = R.map(r => r.survival).sort((a, b) => a - b);
  console.log(arm, 'gen', g, 'median survival', surv[Math.floor(surv.length / 2)], 'censored', R.filter(r => r.censored).length, '/', R.length,
    'mean distinct edges', (R.reduce((a, r) => a + r.distinctEdges, 0) / R.length).toFixed(2),
    'mean 1>2 per1k', (R.reduce((a, r) => a + r.departures12Per1k, 0) / R.length).toFixed(2));
}
