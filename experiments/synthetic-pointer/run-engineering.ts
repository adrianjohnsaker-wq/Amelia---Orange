/**
 * SXI-0 engineering reference run only. This is not an INGRESS-1 rerun,
 * a registered experiment, or identification of the released xenobot.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { sha256 } from './canonical';
import { SyntheticCoordinator } from './coordinator';
import { SyntheticEvidenceLedger, verifyLedger } from './ledger';
import { createReferenceField } from './observer';

const root = process.cwd();
const requested = process.argv[2];
if (!requested) throw new Error('Supply a new output directory outside the repository');
const output = resolve(requested);
if (output === root || output.startsWith(root + sep)) throw new Error('Engineering evidence must be outside the checkout');
if (existsSync(output) || existsSync(output + '.receipt.json')) throw new Error('Output or receipt already exists');
const paths = [
  'src/substrate/AmeliaMorphogeneticSubstrate.ts',
  'src/substrate/AmeliaHistoryConditionedTransitionSubstrate.ts',
  'src/substrate/ameliaNumogramSubstrateRuntime.ts',
  'src/substrate/canonicalAmeliaRuntimeImpl.ts',
  'src/substrate/IntegratedMemorySystem.ts',
  'src/substrate/TraitEvolution.ts',
  'src/outside/OutsideEncounterRuntime.ts',
  'src/outside/encounterTypes.ts',
  'src/ai/numogram/AmeliaQabbalaInterface.ts',
  'src/core/fullNumogram.ts',
  'src/governance/CognitiveGovernor.ts',
  'src/lib/sha256.ts',
  'src/types/amelia.ts',
  'experiments/synthetic-pointer/canonical.ts',
  'experiments/synthetic-pointer/ledger.ts',
  'experiments/synthetic-pointer/observer.ts',
  'experiments/synthetic-pointer/pointer.ts',
  'experiments/synthetic-pointer/recovery.ts',
  'experiments/synthetic-pointer/coordinator.ts',
  'experiments/synthetic-pointer/sxi0.test.ts',
  'experiments/synthetic-pointer/run-engineering.ts',
];
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const dirty = execFileSync('git', ['status', '--porcelain', '--', ...paths], { cwd: root, encoding: 'utf8' });
if (dirty.trim()) throw new Error('Source files are not committed; refuse to make a source-bound receipt: ' + dirty);
const sourceHashes: Record<string, string> = {};
for (const path of paths) sourceHashes[path] = sha256(readFileSync(resolve(root, path)));

const ledger = new SyntheticEvidenceLedger(output);
const sourceIdentity = {
  repository: 'adrianjohnsaker-wq/Amelia---Orange',
  commit, sourceHashes,
  execution: { node: process.version, platform: process.platform, arch: process.arch, versions: process.versions },
};
const config = { width: 12, height: 10, preset: 'CORAL_REEF' as const, seed: 33, noiseAmp: 0.003 };
const run = new SyntheticCoordinator('sxi0-reference-engineering-20261104', createReferenceField(config), ledger, sourceIdentity);
const sham = { id: 'neutral', edges: [] };
const pointer = { id: 'engineering-patch', edges: [
  { a: 0, b: 1, multiplier: 0.5 }, { a: 1, b: 2, multiplier: 0.5 },
  { a: 2, b: 3, multiplier: 0.5 }, { a: 3, b: 4, multiplier: 0.5 },
] };
for (let step = 0; step < 12; step++) run.step(step >= 4 && step < 8 ? pointer : sham);
run.finish();
const verified = verifyLedger(output, { requireComplete: true });
const committed = verified.records.filter(r => r.kind === 'STEP_COMMITTED');
const dispositions: Record<string, number> = {};
const passages: Array<{ from: number; to: number }> = [];
for (const record of committed) {
  const data = record.data as any;
  passages.push({ from: data.passage.from, to: data.passage.chosen });
  for (const decision of data.passage.encounterDecisions) {
    dispositions[decision.disposition] = (dispositions[decision.disposition] ?? 0) + 1;
  }
}
const receipt = {
  schema: 'sxi.reference-engineering-receipt/v1',
  status: 'REFERENCE_ENGINEERING_ONLY',
  originalXenobotIdentified: false,
  sourceCommit: commit,
  records: verified.count,
  checkpoints: verified.records.filter(r => r.checkpoint).length,
  head: verified.head,
  steps: committed.length,
  topologyGateCount: 29,
  pointerInterval: 'body steps 5–8; baseline before and restored after',
  observationDispositions: dispositions,
  passages,
  note: 'Engineering fixture only. No SXI-1 experiment or discovery claim.',
};
writeFileSync(output + '.receipt.json', JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify(receipt, null, 2));
