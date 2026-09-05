/**
 * runReplayAtlasV6PreflightCli.ts
 *
 * Command-line runner for PAPER_6_C1_POTENTIATION_GRAMMAR_V6 Preflight.
 */

import { Paper6C1PotentiationGrammarV6Preflight } from './Paper6C1PotentiationGrammarV6Preflight';

async function main() {
  console.log('================================================================================');
  console.log('  PAPER 6 (C1 NATIVE): V6 LINEAGE ACCESSIBILITY PROFILE MAP PREFLIGHT           ');
  console.log('  Protocol: PAPER_6_C1_POTENTIATION_GRAMMAR_V6                                  ');
  console.log('================================================================================\n');

  const preflight = new Paper6C1PotentiationGrammarV6Preflight();
  const seeds = [707, 808, 909, 111, 222, 333, 444, 555, 666, 741, 852, 963];
  const specDigest = '910ab82d0c60a437a241cf41c4f4a949f84180c2ae078d69c6a65c7a55ea6b12';
  const classifierDigest = '8776dd36506ebff9a5fce19d01ac876582a0c771fdba6f1d96d745076802477c';
  const expectedReplays = 14544;
  const expectedRawSteps = 2617920;

  const report = await preflight.runFullPreflight(
    seeds,
    classifierDigest,
    specDigest,
    expectedReplays,
    expectedRawSteps
  );

  console.log('--- 1. PREFLIGHT VERIFICATION PHASES (8 PHASES) ---');
  for (const ph of report.phases) {
    console.log(`[${ph.passed ? '✓ PASS' : '✗ FAIL'}] ${ph.phaseId}: ${ph.name}`);
    console.log(`       Details: ${ph.details}`);
  }

  console.log('\n--- 2. LINEAGE CHECKPOINTS (N=12) ---');
  for (const s of report.proposedSeeds) {
    console.log(`  Lineage Seed ${s}:`);
    console.log(`    D72 Checkpoint : ${report.neutralD72Checkpoints[s]}`);
    console.log(`    D108 Checkpoint: ${report.neutralD108Checkpoints[s]}`);
  }

  console.log('\n--- 3. REPLICATION MATRIX DENOMINATOR ---');
  console.log(`  Lineages (N)           : ${report.denominator.lineages}`);
  console.log(`  Conditions per Lineage : ${report.denominator.conditionsPerLineage}`);
  console.log(`  Topologies per Lineage : ${report.denominator.topologiesPerLineage}`);
  console.log(`  Branch Seeds           : ${report.denominator.branchSeeds}`);
  console.log(`  Replays per Lineage    : ${report.denominator.replaysPerLineage}`);
  console.log(`  Total Replays Asserted : ${report.denominator.totalExpectedReplays}`);
  console.log(`  Total Raw Steps Assert : ${report.denominator.totalExpectedRawSteps}`);

  console.log('\n================================================================================');
  console.log(`  PREFLIGHT DISPOSITION : ${report.status}`);
  console.log(`  Spec Digest           : ${report.specDigest}`);
  console.log(`  Classifier Digest     : ${report.classifierDigest}`);
  console.log(`  Manifest Digest       : ${report.manifestDigest}`);
  console.log('  Release Boundary Seal : HELD PENDING REVIEW');
  console.log('  Matrix Execution      : HELD PENDING REVIEW');
  console.log('================================================================================\n');
}

main().catch((err) => {
  console.error('[V6 Preflight Error]', err);
  process.exit(1);
});
