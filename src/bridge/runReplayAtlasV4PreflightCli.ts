/**
 * runReplayAtlasV4PreflightCli.ts
 *
 * Standalone CLI runner to execute PAPER_6_C1_POTENTIATION_GRAMMAR_V4 preflight,
 * print detailed raw-bound cryptographic receipts, audit logs, and status.
 */

import { Paper6C1PotentiationGrammarV4Preflight } from './Paper6C1PotentiationGrammarV4Preflight';

async function main() {
  console.log('================================================================');
  console.log('  PAPER 6 (C1 NATIVE): V4 POTENTIATION GRAMMAR NATIVE PREFLIGHT ');
  console.log('  Assay: Temporal Transposition of Minimum Sufficient Kernel    ');
  console.log('================================================================\n');

  const preflightEngine = new Paper6C1PotentiationGrammarV4Preflight();
  const manifest = await preflightEngine.runFullPreflight();

  console.log('--- PREFLIGHT PHASE RESULTS ---');
  for (const phase of manifest.phases) {
    const status = phase.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`[${status}] ${phase.phaseId}: ${phase.name}`);
    console.log(`       Details: ${phase.details}\n`);
  }

  console.log('--- V3 CLOSED ARCHIVE BINDING VERIFICATION ---');
  console.log(`  Authoritative Preflight Seal : ${manifest.v3ArchiveBinding.authoritativePreflightSeal}`);
  console.log(`  Archive Manifest Digest      : ${manifest.v3ArchiveBinding.archiveManifestDigest}`);
  console.log(`  Raw Replay Digest Chain      : ${manifest.v3ArchiveBinding.rawReplayDigestChain}`);
  console.log(`  Master Archival Seal         : ${manifest.v3ArchiveBinding.masterArchivalSeal}`);
  console.log(`  Classifier Digest            : ${manifest.v3ArchiveBinding.classifierDigest}`);
  console.log('  Challenge Digests (9 schedules):');
  for (const [key, digest] of Object.entries(manifest.v3ArchiveBinding.challengeDigests)) {
    console.log(`    Seed ${key.padEnd(7)} : ${digest}`);
  }

  console.log('\n--- SOURCE CHECKPOINTS & REGENERATION DIGESTS ---');
  for (const [seed, d72Digest] of Object.entries(manifest.sourceCheckpoints.neutralD72Digests)) {
    const d108Digest = manifest.sourceCheckpoints.regeneratedNeutralD108Digests[Number(seed)];
    console.log(`  Seed ${seed}:`);
    console.log(`    Sealed Neutral D72  : ${d72Digest}`);
    console.log(`    Regenerated Neu D108: ${d108Digest}`);
  }

  console.log('\n--- FIXED V4 INTERVENTION CONDITIONS (EXACT 9-EVENT KERNELS) ---');
  for (const cond of manifest.conditions) {
    const kernelStr = cond.kernel.length === 0 ? '[] (0 replacements)' : `[${cond.kernel.join(', ')}] (${cond.kernelLength} replacements)`;
    console.log(`  Condition: ${cond.id.padEnd(26)} [${cond.role}]`);
    console.log(`    Kernel Array : ${kernelStr}`);
    console.log(`    Description  : ${cond.description}`);
  }

  console.log('\n--- CONDITIONING INTERVAL AUDIT RECORDS (ALL CONDITIONS & SEEDS) ---');
  for (const audit of manifest.intervalAuditRecords) {
    const status = audit.auditPassed ? 'PASSED' : 'FAILED';
    const repStr = `[${audit.appliedReplacements.map((r) => r.blockIndex).join(', ')}] (${audit.appliedReplacementsCount} events)`;
    console.log(`  Seed ${audit.sourceSeed} | Condition ${audit.conditionId.padEnd(24)} : Audit ${status}`);
    console.log(`    Applied Replacements: ${repStr}`);
    console.log(`    Lower CP (D72)      : ${audit.lowerCheckpointDigest.slice(0, 20)}...`);
    console.log(`    Upper CP (D108)     : ${audit.upperCheckpointDigest.slice(0, 20)}...`);
  }

  console.log('\n--- MATRIX DIMENSIONS & REPLAY DENOMINATOR ---');
  console.log(`  Conditions        : ${manifest.matrixDimensions.conditions} (NEUTRAL_REFERENCE, EARLY_76_84, NATIVE_84_92_REFERENCE, LATE_92_100)`);
  console.log(`  Source Seeds      : ${manifest.matrixDimensions.sourceCheckpoints} (101, 202, 303)`);
  console.log(`  Topologies        : ${manifest.matrixDimensions.topologies} (N0 + 100 Degree-Preserving Nulls)`);
  console.log(`  Branch Seeds      : ${manifest.matrixDimensions.branchSeeds} (101, 202, 303)`);
  console.log(`  Total Replays     : ${manifest.matrixDimensions.totalReplays}`);
  console.log(`  Total Raw Steps   : ${manifest.matrixDimensions.rawStepRecords}`);

  console.log(`\n================================================================`);
  console.log(`  PREFLIGHT DISPOSITION    : ${manifest.status}`);
  console.log(`  Preflight Manifest Digest: ${manifest.preflightManifestDigest}`);
  console.log(`  Matrix Execution Status  : HELD (Unsealed, Awaiting Release Seal)`);
  console.log(`================================================================\n`);
}

main().catch((err) => {
  console.error('[V4 Preflight Critical Error]', err);
  process.exit(1);
});
