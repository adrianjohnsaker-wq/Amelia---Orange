// SXI-0 controls: one arm x one seed through SyntheticCoordinator + SyntheticEvidenceLedger (see REGISTRATION.md).
//   node --import tsx experiments/synthetic-pointer/sxi0c/run_arm.ts <arm> <seed> <steps> <outdir> <commit>
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { sha256 } from '../canonical';
import { SyntheticCoordinator } from '../coordinator';
import { SyntheticEvidenceLedger, verifyLedger } from '../ledger';
import { createReferenceField } from '../observer';
import { createRepairedField } from './repaired';
import { streamFor, touch } from '../sxi1r/touch';
const [ARM, SEED, STEPS, OUT, COMMIT, KEEP, FIELD] = process.argv.slice(2);   // FIELD: 'repaired' uses sxi0c/repaired.ts
const seed = Number(SEED), steps = Number(STEPS), W = 12, H = 10, WIN = [50, 249], BAND = 7;
const paths = ['experiments/synthetic-pointer/coordinator.ts', 'experiments/synthetic-pointer/observer.ts', 'experiments/synthetic-pointer/ledger.ts',
  'experiments/synthetic-pointer/pointer.ts', 'experiments/synthetic-pointer/sxi0c/run_arm.ts', 'experiments/synthetic-pointer/sxi0c/repaired.ts', 'experiments/synthetic-pointer/sxi1r/touch.ts', 'src/outside/OutsideEncounterRuntime.ts', 'src/governance/CognitiveGovernor.ts'];
const sourceHashes = Object.fromEntries(paths.map(p => [p, sha256(readFileSync(resolve(p)))]));
const bodySeed = ARM === 'NULLNOISE' ? seed + 5000 : seed;
const REPLAY = ARM === 'PLANT_REPLAY' || ARM === 'PLANT_REPLAY_TRUNC' ? JSON.parse(readFileSync(resolve(OUT, '..', `PLANT_${seed}.metrics.json`), 'utf8')).rows.map((r: any) => r.obs) : null;
const ledger = new SyntheticEvidenceLedger(OUT);
const make = FIELD === 'repaired' ? createRepairedField : createReferenceField;
const run = new SyntheticCoordinator(`sxi0c${FIELD === 'repaired' ? 'r' : ''}-${ARM}-${seed}`, make({ width: W, height: H, preset: 'CORAL_REEF', seed: bodySeed, noiseAmp: 0.003 }), ledger,
  { repository: 'adrianjohnsaker-wq/Amelia---Orange', commit: COMMIT, sourceHashes });
const neutral = { id: 'neutral', edges: [] };
const edges = (c0: number) => { const e = []; for (const r of [0, 1]) for (let c = c0; c < c0 + 5; c++) e.push({ a: r * W + c, b: r * W + c + 1, multiplier: 0.3 }); return e; };
const PA = { id: 'POINTER_A', edges: edges(0) }, PB = { id: 'POINTER_B', edges: edges(6) };
// LOOP_CONTROLS.md: stronger pointers, full column-boundary cuts (multiplier 0, all rows)
const cut = (c: number, id: string) => ({ id, edges: Array.from({ length: H }, (_, r) => ({ a: r * W + c, b: r * W + c + 1, multiplier: 0 })) });
const PA2 = cut(2, 'POINTER_A2'), PB2 = cut(8, 'POINTER_B2');
// LOOP_CONTROLS_2.md: cuts across rows. A3/B3: every vertical coupling across row boundary 2|3 / 7|8 (12 edges).
// A4/B4: every vertical coupling inside one band's column (band 2 = column 3, band 7 = column 9; 9 edges).
const rowCut = (r: number, id: string) => ({ id, edges: Array.from({ length: W }, (_, c) => ({ a: r * W + c, b: (r + 1) * W + c, multiplier: 0 })) });
const colCut = (c: number, id: string) => ({ id, edges: Array.from({ length: H - 1 }, (_, r) => ({ a: r * W + c, b: (r + 1) * W + c, multiplier: 0 })) });
const PA3 = rowCut(2, 'POINTER_A3'), PB3 = rowCut(7, 'POINTER_B3'), PA4 = colCut(3, 'POINTER_A4'), PB4 = colCut(9, 'POINTER_B4');
// LOOP_CONTROLS_2.md: forced stress. At body steps 100 and 180 the Governor is put under stress through its own public
// importState: deformation tension 0.95 and anti-lock integrity 80 (below the 85 floor). It recovers by its own rules.
const STRESS_AT = new Set([100, 180]);
// LOOP_CONTROLS_3.md: band pointers. Isolate one whole band from its neighbours: every horizontal coupling across both
// sides of that band's column(s), all rows, multiplier 0 (20 edges, at the admission limit). Band 7 = column 9; band 2 = column 3.
const bandIso = (c: number, id: string) => ({ id, edges: Array.from({ length: H }, (_, r) => [{ a: r * W + c - 1, b: r * W + c, multiplier: 0 }, { a: r * W + c, b: r * W + c + 1, multiplier: 0 }]).flat() });
const PI7 = bandIso(9, 'POINTER_ISO7'), PI2 = bandIso(3, 'POINTER_ISO2');
// LOOP_CONTROLS.md: the Governor admits or refuses each pointer change (same safety rule as the synthetic channel)
const pointerDecisions: Array<{ bodyStep: number; pointer: string; decision: string }> = [];
const stressLog: Array<{ bodyStep: number; before: any; after: any }> = [];
function admitPointer(arr: { id: string; edges: any[] }, bodyStep: number) {
  if (arr.edges.length === 0) return arr;
  const tel = (run.getState().nativeRuntime as any).getGovernorKernel().getTelemetry();
  const ok = arr.edges.length <= 20 && arr.edges.every((e: any) => e.multiplier >= 0 && e.multiplier <= 1) && tel.governorStatus !== 'LOCKED_RECOVERY' && tel.antiLockIntegrity >= 85;
  pointerDecisions.push({ bodyStep, pointer: arr.id, decision: ok ? 'ADMIT' : 'REFUSE', status: tel.governorStatus, antiLock: tel.antiLockIntegrity, tension: tel.deformationFieldTension } as any);
  return ok ? arr : neutral;
}
const planted: number[] = [];
// SXI-1R (../sxi1r/REGISTRATION.md): TOUCH arm, the ledgered path. Stream, segment, shuffle and alpha from the environment.
const TOUCH = ARM === 'TOUCH' ? streamFor(JSON.parse(readFileSync(process.env.SXI1R_STREAM!, 'utf8')).zones, Number(process.env.SXI1R_SEGMENT),
  steps, Number(process.env.SXI1R_SHUFFLE), process.env.SXI1R_LABEL!) : null;
const touchAlpha = Number(process.env.SXI1R_ALPHA ?? 0);
const bandCells = Array.from({ length: W * H }, (_, i) => i).filter(i => Math.floor(10 * (i % W) / W) === BAND);
for (let s = 0; s < steps; s++) {
  const active = s >= WIN[0] && s <= WIN[1];
  if (ARM === 'PLANT' && active) {   // planted, closed loop
    const st = run.getState(); for (const i of bandCells) st.cells[i].B = 0.9;
    planted.push(st.stepCount);   // also visible in that step's STEP_BEGIN checkpoint (the body carries B = 0.9)
  }
  if (ARM === 'PLANT_OPEN' && active) { const st = run.getState(); for (const i of bandCells) st.cells[i].B = 0.9; planted.push(st.stepCount); }
  if (TOUCH) touch(run.getState(), TOUCH[s], touchAlpha);
  if (REPLAY) (run.getState().nativeRuntime as any).replayVector = ARM === 'PLANT_REPLAY_TRUNC' && s > WIN[1] ? null : (REPLAY[s] ?? null);
  if (ARM.startsWith('STRESS_') && STRESS_AT.has(s)) {
    const gk = (run.getState().nativeRuntime as any).getGovernorKernel(); const before = gk.getTelemetry();
    gk.importState({ deformationTension: 0.95, antiLockIntegrity: 80 }); stressLog.push({ bodyStep: run.getState().stepCount, before, after: gk.getTelemetry() });
  }
  const want = ARM === 'POINTER_A' && active ? PA : ARM === 'POINTER_B' && active ? PB : ARM === 'POINTER_A2' && active ? PA2 : ARM === 'POINTER_B2' && active ? PB2
    : ARM === 'POINTER_A3' && active ? PA3 : ARM === 'POINTER_B3' && active ? PB3 : ARM === 'POINTER_A4' && active ? PA4 : ARM === 'POINTER_B4' && active ? PB4
    : ARM === 'STRESS_A3' && active ? PA3
    : (ARM === 'POINTER_ISO7' || ARM === 'STRESS_ISO7') && active ? PI7 : ARM === 'POINTER_ISO2' && active ? PI2 : neutral;
  const pointer = admitPointer(want, run.getState().stepCount);
  run.step(pointer, !['WITHHELD', 'SHAM_OPEN', 'PLANT_OPEN'].includes(ARM));
}
run.finish();
const v = verifyLedger(OUT, { requireComplete: true });
const begins = v.records.filter(r => r.kind === 'STEP_BEGIN').map(r => r.data as any);
const steps_ = v.records.filter(r => r.kind === 'STEP_COMMITTED').map(r => r.data as any);
const rows = steps_.map((d, k) => {
  const opts = d.passage.options; let noAttn = d.passage.from, best = -Infinity;
  for (const o of opts) { const sc = o.score - o.components.attention; if (sc > best) { best = sc; noAttn = o.gate.target; } }
  const dec = d.passage.encounterDecisions.map((x: any) => (x.applied ? 'ATTEND' : x.disposition));
  const b = begins[k];
  return { step: d.bodyStep, from: d.passage.from, to: d.passage.chosen, noAttn, dec, bands: b.observation.regionMeans.map((x: number) => +x.toFixed(5)), obs: b.observation.attentionVector, replayed: d.passage.encounterDecisions.some((x: any) => String(x.reason).includes('REPLAY')) };
});
writeFileSync(OUT + '.metrics.json', JSON.stringify({ arm: ARM, field: FIELD === 'repaired' ? 'repaired' : 'reference', seed, bodySeed, steps, head: v.head, records: v.count,
  pointerDecisions, stressLog, touch: TOUCH ? { stream: process.env.SXI1R_STREAM, segment: Number(process.env.SXI1R_SEGMENT), shuffle: Number(process.env.SXI1R_SHUFFLE), label: process.env.SXI1R_LABEL, alpha: touchAlpha } : null, plantedControl: ['PLANT', 'PLANT_OPEN'].includes(ARM) ? { band: BAND, cells: bandCells, setB: 0.9, bodySteps: planted, note: 'planted positive control: imposed on the body, not discovered' } : null, rows }));
if (KEEP !== 'keep') rmSync(resolve(OUT, 'checkpoints'), { recursive: true, force: true });
console.log(ARM, seed, 'records', v.count, 'head', v.head.slice(0, 12));
