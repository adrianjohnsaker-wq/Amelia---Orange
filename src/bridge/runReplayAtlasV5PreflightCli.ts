/**
 * runReplayAtlasV5PreflightCli.ts
 *
 * Command-line runner for PAPER_6_C1_POTENTIATION_GRAMMAR_V5 Preflight.
 */

import { Paper6C1PotentiationGrammarV5Preflight } from './Paper6C1PotentiationGrammarV5Preflight';

async function main() {
  console.log('================================================================');
  console.log('  PAPER 6 (C1 NATIVE): V5 FRESH-LINEAGE LATE-WINDOW PREFLIGHT   ');
  console.log('  Assay: Prospective Late-Window Canalization in Fresh Lineages  ');
  console.log('================================================================\n');

  const preflight = new Paper6C1PotentiationGrammarV5Preflight();
  const report = await preflight.runFullPreflight();

  console.log('--- PREFLIGHT PHASE RESULTS ---');
  for (const ph of report.phases) {
    console.log(`[${ph.passed ? '✓ PASS' : '✗ FAIL'}] ${ph.phaseId}: ${ph.name}`);
    console.log(`       Details: ${ph.details}`);
  }

  console.log('\n--- FRESH SOURCE SEEDS & NEUTRAL CHECKPOINTS ---');
  for (const s of report.freshSourceSeeds) {
    console.log(`  Fresh Seed ${s}:`);
    console.log(`    D72 Checkpoint : ${report.neutralD72Checkpoints[s]}`);
    console.log(`    D108 Checkpoint: ${report.neutralD108Checkpoints[s]}`);
  }

  console.log('\n--- FRESH PHASE-RESOLVED CHALLENGE SCHEDULES (9 SCHEDULES) ---');
  for (const [k, d] of Object.entries(report.challengeScheduleDigests)) {
    console.log(`    Seed ${k} : ${d}`);
  }

  console.log('\n--- MATRIX DENOMINATOR ---');
  console.log(`  Conditions    : ${report.denominator.conditions}`);
  console.log(`  Fresh Seeds   : ${report.denominator.sourceSeeds}`);
  console.log(`  Topologies    : ${report.denominator.topologies}`);
  console.log(`  Branch Seeds  : ${report.denominator.branchSeeds}`);
  console.log(`  Total Replays : ${report.denominator.totalReplays}`);
  console.log(`  Raw Steps     : ${report.denominator.rawStepRecords}`);

  console.log('\n================================================================');
  console.log(`  PREFLIGHT DISPOSITION : ${report.status}`);
  console.log(`  Preflight Seal Digest : ${report.preflightSealDigest}`);
  console.log('================================================================\n');
}

main().catch((err) => {
  console.error('[V5 Preflight Error]', err);
  process.exit(1);
});
