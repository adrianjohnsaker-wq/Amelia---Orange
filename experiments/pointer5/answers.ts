// THE POINTER V (REGISTRATION.md): THE POINTER IV's blind address-reply, unchanged in design, with Amelia on the runtime she
// now lives on: the app's ND-1b flow runtime (src/outside/AmeliaNDRuntime.ts via src/core/ameliaRuntimes.ts), Warp line of
// flight at 12 steps, admission rule 'relative-v1' (GATE-1). Her answers are computed here, before any target exists.
//   node --import tsx answers.ts <out.json> [world,world,...]   (default: all eight worlds)
import { writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { bornAmeliaOf } from '../../src/core/ameliaRuntimes';
const OUT = process.argv[2], ONLY = process.argv[3]?.split(',');
export const WORLDS = ['S5V01', 'S5V02', 'S5V03', 'S5V04', 'S5V05', 'S5V06', 'S5V07', 'S5V08'], LINEAGES = 9;
export const RAISE = 3000, TRIALS = 50, ADDRESS_T = 24, LISTEN_T = 24;
export const CONDITIONS: Record<string, number[] | null> = { BUBBAMU: [1, 7], ODDUBB: [7, 2], NO_CONTACT: null, GT36: [8, 9] };
const sha = (s: string) => createHash('sha256').update(s).digest('hex');
// A life's input: zones 1..9, the digital roots of SHA-256 counter words (as the calibration streams).
function life(world: string, k: number, n: number) {
  const out: number[] = []; let i = 0;
  while (out.length < n) { const d = createHash('sha256').update(`POINTER5-LIFE|${world}|${k}|${i++}`).digest();
    for (let j = 0; j < 32 && out.length < n; j += 4) { const c = d.readUInt32BE(j); out.push(c === 0 ? 0 : 1 + (c - 1) % 9); } }
  return out;
}
let ev = 0;
const enc = (zone: number, tag: string) => { const v = Array(10).fill(0); v[zone] = 1;
  return { eventId: `p5:${tag}:${ev++}`, channel: 'NUMOGRAM' as const, sourceDigest: sha(`p5|${tag}|${ev}`), attentionVector: v }; };
function newborn() { const rt: any = bornAmeliaOf('nd1'); rt.setAdmissionRule('relative-v1'); if (rt.getWarpTheta() !== 12) throw new Error('theta'); return rt; }
// set her down at a zone (as THE POINTER IV's displace): her position only; the Warp count starts afresh there
function setDown(rt: any, zone: number) { rt.currentZone = zone; rt.warpIntensity = 0; }
export function traveller(world: string, k: number) {
  ev = 0;   // encounter ids depend only on this traveller, not on which process or order ran it
  const raised = newborn(); const L = life(world, k, RAISE);
  for (let t = 0; t < RAISE; t++) raised.step(undefined, enc(L[t], `raise|${world}|${k}`));
  const state = raised.exportState();
  const answers: Record<string, number[]> = {}, admitted: Record<string, number> = {}, flights: Record<string, number> = {};
  for (const [cond, addr] of Object.entries(CONDITIONS)) {
    const rt = newborn(); rt.importState(JSON.parse(JSON.stringify(state))); const a: number[] = []; let adm = 0; const f0 = rt.getNDStatus().flights;
    for (let i = 0; i < TRIALS; i++) {
      setDown(rt, addr ? addr[0] : 1);
      for (let t = 0; t < ADDRESS_T; t++) { const s = rt.step(undefined, addr ? enc(addr[(t + 1) % 2], `${cond}|${world}|${k}`) : undefined);
        adm += (s.encounterDecisions ?? []).filter((d: any) => d.applied).length; }
      for (let t = 0; t < LISTEN_T; t++) rt.step();
      a.push(rt.getCurrentZone());
    }
    answers[cond] = a; admitted[cond] = adm; flights[cond] = rt.getNDStatus().flights - f0;
  }
  return { world, lineage: k, answers, admitted, flights, raisedStateDigest: sha(JSON.stringify(state.memoryState ?? '') + String(state.currentZone)) };
}
if (OUT) {
  const runs: any[] = [];
  for (const w of WORLDS.filter(x => !ONLY || ONLY.includes(x))) for (let k = 0; k < LINEAGES; k++) { runs.push(traveller(w, k)); process.stderr.write(`${w}/${k} `); }
  writeFileSync(OUT, JSON.stringify(runs));
}
