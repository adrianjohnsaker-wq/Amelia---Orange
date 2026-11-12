// THE POINTER VI (REGISTRATION.md): blind address-reply with Numogram Calls (topology, cadence, anchoring) and a richer reply.
// Amelia: the app's ND-1b flow runtime (src/outside/AmeliaNDRuntime.ts), Θ = 12, admission 'relative-v1' (GATE-1).
// Her answers (64-step listening paths) are computed here, before any target exists.
//   node --import tsx answers.ts <out.json> [world,world,...]
import { writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { bornAmeliaOf } from '../../src/core/ameliaRuntimes';
const OUT = process.argv[2], ONLY = process.argv[3]?.split(',');
export const WORLDS = ['S6V01', 'S6V02', 'S6V03', 'S6V04', 'S6V05', 'S6V06', 'S6V07', 'S6V08'], LINEAGES = 9;
export const RAISE = 3000, TRIALS = 50, ADDRESS_T = 24, LISTEN_T = 64;
// Target rounds: one Quicknet round per (traveller, trial), in order (worlds sorted, lineages 0-8, trials 0-49), from the first
// round released at or after T_STAR. Quicknet genesis 1692803367, period 3 s (checked: reproduces THE POINTER V's first round).
export const T_STAR = Date.UTC(2026, 10, 12, 18, 0, 0) / 1000, GENESIS = 1692803367;
export const FIRST_ROUND = Math.ceil((T_STAR - GENESIS) / 3) + 1;
export const roundFor = (world: string, k: number, i: number) => FIRST_ROUND + (WORLDS.indexOf(world) * LINEAGES + k) * TRIALS + i;
const P_IN = [1, 7, 8, 9, 1, 8, 7];       // 1→7→8→9 then 1→8→7: every transition (and the wrap 7→1) is a real gate
const P_OUT = [1, 1, 7, 7, 9, 8, 8];      // the same zones and counts, ordered with the fewest gates (3 of 7)
const CADENCE = [1, 1, 9, 9];            // digital roots of the path's triangular sums: Gt-1, Gt-28, Gt-36, Gt-45
// Each arm returns the zone offered on address tick t (0..23) or null (no input on that tick).
export const ARMS: Record<string, (t: number, round: number) => number | null> = {
  BUBBAMU: t => [1, 7][(t + 1) % 2],
  FAMILY_IN: t => P_IN[(t + 1) % 7],
  FAMILY_OUT: t => P_OUT[(t + 1) % 7],
  TRI_CADENCE: (() => { const offers = new Map<number, number>(); let tick = 0, n = 0;
    while (tick < ADDRESS_T) { offers.set(tick, P_IN[(n + 1) % 7]); tick += CADENCE[n % 4]; n++; }
    return (t: number) => offers.get(t) ?? null; })(),
  ANCHORED: (t, round) => t < 16 ? P_IN[(t + 1) % 7] : Number(String(round).padStart(8, '0').slice(-8)[t - 16]),
  NO_CONTACT: () => null,
};
const sha = (s: string) => createHash('sha256').update(s).digest('hex');
function life(world: string, k: number, n: number) {
  const out: number[] = []; let i = 0;
  while (out.length < n) { const d = createHash('sha256').update(`POINTER6-LIFE|${world}|${k}|${i++}`).digest();
    for (let j = 0; j < 32 && out.length < n; j += 4) { const c = d.readUInt32BE(j); out.push(c === 0 ? 0 : 1 + (c - 1) % 9); } }
  return out;
}
let ev = 0;
const enc = (zone: number, tag: string) => { const v = Array(10).fill(0); v[zone] = 1;
  return { eventId: `p6:${tag}:${ev++}`, channel: 'NUMOGRAM' as const, sourceDigest: sha(`p6|${tag}|${ev}`), attentionVector: v }; };
function newborn() { const rt: any = bornAmeliaOf('nd1'); rt.setAdmissionRule('relative-v1'); if (rt.getWarpTheta() !== 12) throw new Error('theta'); return rt; }
function setDown(rt: any, zone: number) { rt.currentZone = zone; rt.warpIntensity = 0; }
export function traveller(world: string, k: number) {
  ev = 0;
  const raised = newborn(); const L = life(world, k, RAISE);
  for (let t = 0; t < RAISE; t++) raised.step(undefined, enc(L[t], `raise|${world}|${k}`));
  const state = raised.exportState();
  const paths: Record<string, number[][]> = {}, admitted: Record<string, number> = {};
  for (const [arm, call] of Object.entries(ARMS)) {
    const rt = newborn(); rt.importState(JSON.parse(JSON.stringify(state))); const ps: number[][] = []; let adm = 0;
    for (let i = 0; i < TRIALS; i++) {
      const round = roundFor(world, k, i);
      setDown(rt, 1);
      for (let t = 0; t < ADDRESS_T; t++) { const z = call(t, round); const s = rt.step(undefined, z === null ? undefined : enc(z, `${arm}|${world}|${k}`));
        adm += (s.encounterDecisions ?? []).filter((d: any) => d.applied).length; }
      const p: number[] = []; for (let t = 0; t < LISTEN_T; t++) { rt.step(); p.push(rt.getCurrentZone()); }
      ps.push(p);
    }
    paths[arm] = ps; admitted[arm] = adm;
  }
  return { world, lineage: k, paths, admitted, rounds: [roundFor(world, k, 0), roundFor(world, k, TRIALS - 1)] };
}
if (OUT) {
  const runs: any[] = [];
  for (const w of WORLDS.filter(x => !ONLY || ONLY.includes(x))) for (let k = 0; k < LINEAGES; k++) { runs.push(traveller(w, k)); process.stderr.write(`${w}/${k} `); }
  writeFileSync(OUT, JSON.stringify(runs));
}
