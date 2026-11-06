// NR-1 Numogram arms (REGISTRATION.md). CANONICAL: the full 29-gate CCRU Numogram (src/core/fullNumogram.ts).
// RELABEL / RELABEL_B: an exactly isomorphic Numogram. The runtime is canonical in every respect (gates, zones, Warp, start);
// instead each datum c is presented as zone p[c], one uniformly random permutation p per unit (two independent families).
// This is the same as relabelling the whole Numogram, Warp and all: it breaks only the correspondence between the numbers
// and the Numogram's structure (implemented in run.ts). REWIRED: degree-preserving rewiring
// (each zone keeps its out- and in-degree; 2,000 edge-swap attempts; no new self-edges, no duplicates; existing self-edges kept).
// Every gate keeps its own flux, permeability and resistance. All randomness: mulberry32 from SHA-256 of a label.
import { createHash } from 'node:crypto';
import { FULL_NUMOGRAM_GATES } from '../../../src/core/fullNumogram';
import type { NumogramGate, ZoneId } from '../../../src/types/amelia';
export type GraphArm = 'CANONICAL' | 'RELABEL' | 'RELABEL_B' | 'REWIRED';
export function rng(label: string) {
  let st = parseInt(createHash('sha256').update(`NR1|${label}`).digest('hex').slice(0, 8), 16) >>> 0;
  return () => { st = (st + 0x6D2B79F5) >>> 0; let x = st; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}
export function permutation(label: string): number[] {
  const r = rng(label), p = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let j = 9; j > 0; j--) { const q = Math.floor(r() * (j + 1)); [p[j], p[q]] = [p[q], p[j]]; } return p;
}
export function graphFor(arm: GraphArm, unit: number): { gates: NumogramGate[]; perm: number[] | null } {
  const base = FULL_NUMOGRAM_GATES.map(g => ({ ...g }));
  if (arm === 'CANONICAL') return { gates: base, perm: null };
  if (arm === 'RELABEL' || arm === 'RELABEL_B') return { gates: base, perm: permutation(`${arm}|${unit}`) };
  const r = rng(`REWIRED|${unit}`), g = base.map(x => ({ ...x })), key = (s: number, t: number) => `${s}>${t}`;
  for (let k = 0; k < 2000; k++) {
    const i = Math.floor(r() * g.length), j = Math.floor(r() * g.length);
    if (i === j || g[i].source === g[i].target || g[j].source === g[j].target) continue;
    const a = g[i].source, b = g[i].target, c = g[j].source, d = g[j].target;
    if (a === d || c === b) continue;
    const have = new Set(g.map(x => key(x.source, x.target)));
    if (have.has(key(a, d)) || have.has(key(c, b))) continue;
    g[i] = { ...g[i], target: d as ZoneId, id: `nr1-${a}-${d}` }; g[j] = { ...g[j], target: b as ZoneId, id: `nr1-${c}-${b}` };
  }
  return { gates: g, perm: null };
}
