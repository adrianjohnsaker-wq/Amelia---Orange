/**
 * runReplayAtlasV4ExecutionCli.ts
 *
 * CLI Execution Runner for Paper 6 (C1 Native) V4 Temporal Transposition Protocol.
 */

import {
  StageBV4ArchiveAuditor,
  PROVISIONAL_PREFLIGHT_MANIFEST_DIGEST,
  AUTHORITATIVE_PREFLIGHT_MANIFEST_DIGEST,
} from './stageBV4ArchiveAuditAndExecution';

async function main() {
  console.log('================================================================');
  console.log('  PAPER 6 (C1 NATIVE): V4 POTENTIATION GRAMMAR MATRIX EXECUTION');
  console.log('  Assay: Temporal Transposition of Minimum Sufficient Kernel    ');
  console.log('================================================================');

  const auditor = new StageBV4ArchiveAuditor();

  const { releaseBoundarySeal, payload } = auditor.generateReleaseBoundarySeal();
  console.log('\n--- V4 RELEASE-BOUNDARY SEAL GENERATION ---');
  console.log(`  Release Boundary Seal    : ${releaseBoundarySeal}`);
  console.log(`  Auth Preflight Manifest  : ${AUTHORITATIVE_PREFLIGHT_MANIFEST_DIGEST}`);
  console.log(`  Prov Preflight Manifest  : ${PROVISIONAL_PREFLIGHT_MANIFEST_DIGEST} (Superseded)`);
  console.log(`  Predecessor Master Seal  : ${payload.v3ArchiveBinding.masterArchivalSeal}`);
  console.log(`  Predecessor Raw Chain    : ${payload.v3ArchiveBinding.rawReplayDigestChain}`);

  console.log('\n--- EXECUTING FIXED V4 MATRIX (3,636 REPLAYS / 654,480 STEPS) ---');
  const startTime = Date.now();
  const { auditReport, manifest } = await auditor.executeAndAuditV4Matrix();
  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[✓ PASS] V4 Matrix Replays completed in ${elapsedSec}s.`);

  console.log('\n--- RAW REPLAY ARCHIVE MANIFEST & LEDGER ---');
  console.log(`  Execution ID             : ${auditReport.executionId}`);
  console.log(`  Archive Manifest Digest  : ${manifest.archiveManifestDigest}`);
  console.log(`  Raw Replays Digest Chain : ${manifest.replaysDigestChain}`);
  console.log(`  Total Replays Archived   : ${manifest.totalReplaysArchived}`);
  console.log(`  Total Raw Steps Archived : ${manifest.totalRawStepsArchived}`);

  console.log('\n--- CONDITIONING INTERVAL AUDITS (12 OF 12 VERIFIED) ---');
  for (const audit of auditReport.conditioningIntervalAudits) {
    console.log(`  Seed ${audit.sourceSeed} | ${audit.conditionId.padEnd(24)} | Replacements: ${audit.appliedReplacementsCount} | Audit: ${audit.auditPassed ? 'PASSED' : 'FAILED'}`);
  }

  console.log('\n--- V4 ASSAY EMPIRICAL DISTRIBUTIONS & COMPARISONS ---');
  for (const cond of auditReport.analysis.comparisons) {
    console.log(`\n  Condition: ${cond.conditionId}`);
    console.log(`    All Seeds Match V3 Native: ${cond.allSourceSeedsMatchV3Native ? 'YES (100% Modal Rescue)' : 'NO'}`);
    console.log(`    Min JSD to V3 Native     : ${cond.minimumPerSeedJsdToV3Native.toFixed(6)} bits`);
    for (const s of [101, 202, 303]) {
      const p = cond.perSeed[s];
      console.log(`      Seed ${s}: ModalMatch=${p.modalMatch} | JSD=${p.jsdBits.toFixed(6)} bits`);
    }
  }

  console.log('\n--- EMPIRICAL SUMMARY & THEORETICAL INTERPRETATION ---');
  console.log(`  Neutral Reference Reproduced : ${auditReport.empiricalSummary.neutralReproduced}`);
  console.log(`  Native 84-92 Rescue Reproduced: ${auditReport.empiricalSummary.nativeRescueReproduced}`);
  console.log(`  Early [76..84] Transposition : ${auditReport.empiricalSummary.earlyPortability.allSourceSeedsMatchV3Native ? 'RESCUES (Portable Early)' : 'FAILS (Position-Sensitive)'}`);
  console.log(`  Late  [92..100] Transposition: ${auditReport.empiricalSummary.latePortability.allSourceSeedsMatchV3Native ? 'RESCUES (Portable Late)' : 'FAILS (Position-Sensitive)'}`);
  console.log(`  Derived Conclusion           : ${auditReport.empiricalSummary.conclusion}`);

  console.log('\n================================================================');
  console.log(`  V4 EXECUTION DISPOSITION : ${auditReport.disposition}`);
  console.log(`  Release Boundary Seal    : ${auditReport.releaseBoundarySeal}`);
  console.log(`  Archive Manifest Digest  : ${manifest.archiveManifestDigest}`);
  console.log(`  Raw Digest Chain         : ${manifest.replaysDigestChain}`);
  console.log('  Archival Status          : HELD (Awaiting Review; Master Seal Unissued)');
  console.log('================================================================\n');
}

main().catch((err) => {
  console.error('[FATAL EXECUTION ERROR]', err);
  process.exit(1);
});
