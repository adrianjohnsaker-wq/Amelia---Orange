// SXI-0 controls: one arm x one seed through SyntheticCoordinator + SyntheticEvidenceLedger (see REGISTRATION.md).
//   node --import tsx experiments/synthetic-pointer/sxi0c/run_arm.ts <arm> <seed> <steps> <outdir> <commit>
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { sha256 } from '../canonical';
import { SyntheticCoordinator } from '../coordinator';
import { SyntheticEvidenceLedger, verifyLedger } from '../ledger';
import { createReferenceField } from '../observer';
const [ARM, SEED, STEPS, OUT, COMMIT, KEEP] = process.argv.slice(2);
const seed = Number(SEED), steps = Number(STEPS), W = 12, H = 10, WIN = [50, 249], BAND = 7;
const paths = ['experiments/synthetic-pointer/coordinator.ts', 'experiments/synthetic-pointer/observer.ts', 'experiments/synthetic-pointer/ledger.ts',
  'experiments/synthetic-pointer/pointer.ts', 'experiments/synthetic-pointer/sxi0c/run_arm.ts', 'src/outside/OutsideEncounterRuntime.ts', 'src/governance/CognitiveGovernor.ts'];
const sourceHashes = Object.fromEntries(paths.map(p => [p, sha256(readFileSync(resolve(p)))]));
const bodySeed = ARM === 'NULLNOISE' ? seed + 5000 : seed;
const ledger = new SyntheticEvidenceLedger(OUT);
const run = new SyntheticCoordinator(`sxi0c-${ARM}-${seed}`, createReferenceField({ width: W, height: H, preset: 'CORAL_REEF', seed: bodySeed, noiseAmp: 0.003 }), ledger,
  { repository: 'adrianjohnsaker-wq/Amelia---Orange', commit: COMMIT, sourceHashes });
const neutral = { id: 'neutral', edges: [] };
const edges = (c0: number) => { const e = []; for (const r of [0, 1]) for (let c = c0; c < c0 + 5; c++) e.push({ a: r * W + c, b: r * W + c + 1, multiplier: 0.3 }); return e; };
const PA = { id: 'POINTER_A', edges: edges(0) }, PB = { id: 'POINTER_B', edges: edges(6) };
const planted: number[] = [];
const bandCells = Array.from({ length: W * H }, (_, i) => i).filter(i => Math.floor(10 * (i % W) / W) === BAND);
for (let s = 0; s < steps; s++) {
  const active = s >= WIN[0] && s <= WIN[1];
  if (ARM === 'PLANT' && active) {
    const st = run.getState(); for (const i of bandCells) st.cells[i].B = 0.9;
    planted.push(st.stepCount);   // also visible in that step's STEP_BEGIN checkpoint (the body carries B = 0.9)
  }
  const pointer = ARM === 'POINTER_A' && active ? PA : ARM === 'POINTER_B' && active ? PB : neutral;
  run.step(pointer, ARM !== 'WITHHELD');
}
run.finish();
const v = verifyLedger(OUT, { requireComplete: true });
const steps_ = v.records.filter(r => r.kind === 'STEP_COMMITTED').map(r => r.data as any);
const rows = steps_.map(d => {
  const opts = d.passage.options; let noAttn = d.passage.from, best = -Infinity;
  for (const o of opts) { const sc = o.score - o.components.attention; if (sc > best) { best = sc; noAttn = o.gate.target; } }
  const dec = d.passage.encounterDecisions.map((x: any) => (x.applied ? 'ATTEND' : x.disposition));
  return { step: d.bodyStep, from: d.passage.from, to: d.passage.chosen, noAttn, dec };
});
writeFileSync(OUT + '.metrics.json', JSON.stringify({ arm: ARM, seed, bodySeed, steps, head: v.head, records: v.count,
  plantedControl: ARM === 'PLANT' ? { band: BAND, cells: bandCells, setB: 0.9, bodySteps: planted, note: 'planted positive control: imposed on the body, not discovered' } : null, rows }));
if (KEEP !== 'keep') rmSync(resolve(OUT, 'checkpoints'), { recursive: true, force: true });
console.log(ARM, seed, 'records', v.count, 'head', v.head.slice(0, 12));
