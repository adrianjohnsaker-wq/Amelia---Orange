/**
 * runReplayAtlasV5ExecutionCli.ts
 *
 * Full Stage C Matrix Execution Runner for PAPER_6_C1_POTENTIATION_GRAMMAR_V5
 * (Fresh-Lineage Late-Window Replication: Seeds 404, 505, 606).
 */

import { StageCV5ArchiveAuditor } from './stageCV5ArchiveAuditAndExecution';

async function main() {
  console.log('================================================================================');
  console.log('  PAPER 6 (C1 NATIVE): V5 FRESH-LINEAGE LATE-WINDOW EXECUTION (STAGE C)');
  console.log('  Assay: Prospective 92–100 Zone-9 Kernel Replication in Fresh Lineages');
  console.log('================================================================================\n');

  const auditor = new StageCV5ArchiveAuditor();
  const startTime = Date.now();
  const result = await auditor.executeFullV5Matrix();
  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('--- 1. PREFLIGHT & INTEGRITY SEALS ---');
  console.log(`  Preflight Seal Digest  : ${result.preflightReport.preflightSealDigest}`);
  console.log(`  Manifest Digest        : ${result.manifestDigest}`);
  console.log(`  Raw Digest Chain       : ${result.rawDigestChain}`);
  console.log(`  Total Replays Audited  : ${result.totalRawReplays}`);
  console.log(`  Total Raw Steps Audited: ${result.totalRawSteps}`);
  console.log(`  Execution Duration     : ${durationSec}s`);

  console.log('\n--- 2. PRIMARY HYPOTHESIS EVALUATION ---');
  console.log(`  Primary Success Rule   : ${result.analysis.primaryEvaluation.rule}`);
  console.log(`  Rule Satisfied         : ${result.analysis.primaryEvaluation.passed ? 'YES (SUCCESSFULLY SATISFIED)' : 'NO (NOT SATISFIED)'}`);
  console.log(`  Disposition            : ${result.analysis.disposition}`);

  console.log('\n--- 3. PER-SEED BREAKDOWN (FRESH LINEAGES) ---');
  for (const b of result.analysis.primaryEvaluation.perSeedBreakdown) {
    console.log(`  Fresh Seed ${b.seed}:`);
    console.log(`    Matched Neutral Mode : ${b.neutralMode} (Is Z9 Modal: ${b.neutralIsZ9})`);
    console.log(`    Late (92–100) Mode   : ${b.lateMode} (Is Z9 Modal: ${b.lateIsZ9})`);
    console.log(`    Late vs Neutral JSD  : ${b.lateVsNeutralJsdBits.toFixed(4)} bits`);
    console.log(`    Early vs Neutral JSD : ${b.earlyVsNeutralJsdBits.toFixed(4)} bits`);
    console.log(`    Native vs Neutral JSD: ${b.nativeVsNeutralJsdBits.toFixed(4)} bits`);
  }

  console.log('\n--- 4. DETAILED REGIME DISTRIBUTIONS BY CONDITION ---');
  for (const [condId, sum] of Object.entries(result.analysis.conditions)) {
    console.log(`  Condition: ${condId} [Role: ${sum.role}]`);
    console.log(`    Kernel: [${sum.kernel.join(', ')}] (${sum.kernel.length} replacements)`);
    console.log(`    All Seeds Z9 Modal: ${sum.allSeedsZ9Modal ? 'YES' : 'NO'}`);
    console.log(`    Mean JSD vs Neutral: ${sum.meanNeutralJsd.toFixed(4)} bits`);
    console.log('    Per-Seed Modal Regimes:');
    for (const seed of result.analysis.sourceSeeds) {
      const mode = sum.modalRegimeBySeed[seed];
      const counts = sum.countsBySeed[seed];
      console.log(`      Seed ${seed}: Mode = ${mode} (Counts: Z9=${counts['REGIME_HYPERSTITION_CANALIZED_Z9'] ?? 0}, EvenPole=${counts['REGIME_EVEN_POLE_RELAXATION_OSCILLATION'] ?? 0}, Diffuse=${counts['REGIME_DIFFUSE_MULTICENTRIC_FLUX'] ?? 0}, Z0=${counts['REGIME_ABYSSAL_DESCENT_Z0'] ?? 0})`);
    }
  }

  console.log('\n--- 5. SECONDARY PLACEMENT PROFILES ---');
  console.log(`  Early 76–84  : All Seeds Z9 Modal = ${result.analysis.secondaryProfiles.early76_84.allSeedsZ9Modal ? 'YES' : 'NO'} | Mean JSD = ${result.analysis.secondaryProfiles.early76_84.meanJsdVsNeutral.toFixed(4)} bits`);
  console.log(`  Native 84–92 : All Seeds Z9 Modal = ${result.analysis.secondaryProfiles.native84_92.allSeedsZ9Modal ? 'YES' : 'NO'} | Mean JSD = ${result.analysis.secondaryProfiles.native84_92.meanJsdVsNeutral.toFixed(4)} bits`);

  console.log('\n================================================================================');
  console.log(`  FINAL VERDICT: ${result.analysis.summaryText}`);
  console.log('================================================================================\n');
}

main().catch((err) => {
  console.error('[V5 Execution Error]', err);
  process.exit(1);
});
