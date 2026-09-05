/**
 * runStageAV3AtlasCli.ts
 *
 * Command-line runner for Stage A execution of PAPER_6_C1_POTENTIATION_GRAMMAR_V3.
 */

import { Paper6C1PotentiationGrammarV3Preflight, V3PreflightReport } from './Paper6C1PotentiationGrammarV3Preflight';
import { StageAV3MatrixExecutor, V3ExecutionResult } from './executePaper6StageAPotentiationGrammarV3';
import { StageAV3ArchiveAuditor, V3ArchiveClosureRecord } from './stageAV3ArchiveAuditAndClosure';

export async function runV3PreflightAndStageA(): Promise<{
  preflightReport: V3PreflightReport;
  stageAResult: V3ExecutionResult;
  closureRecord: V3ArchiveClosureRecord;
}> {
  console.log('================================================================');
  console.log('PAPER 6 C1 POTENTIATION GRAMMAR V3 — PREFLIGHT & STAGE-A RUN');
  console.log('================================================================');

  // 1. Run Preflight
  const preflight = new Paper6C1PotentiationGrammarV3Preflight();
  const preflightReport = await preflight.runFullPreflight();

  for (const phase of preflightReport.phases) {
    const symbol = phase.passed ? '✓ [PASS]' : '✗ [FAIL]';
    console.log(`${symbol} ${phase.phaseId}: ${phase.name}`);
    console.log(`    ${phase.details}`);
  }

  if (!preflightReport.allPhasesPassed) {
    throw new Error(`[V3 Protocol Error] Preflight failed. Release boundary cannot be sealed.`);
  }

  console.log('----------------------------------------------------------------');
  console.log(`V3 PREFLIGHT STATUS:       ${preflightReport.status}`);
  console.log(`V3 RELEASE BOUNDARY SEAL:  ${preflightReport.preflightSealDigest}`);
  console.log(`Total Replays Verified:    ${preflightReport.summary.totalReplays} (11,817 EXACT)`);
  console.log(`Raw Step Records Verified: ${preflightReport.summary.totalRawSteps} (2,127,060 EXACT)`);
  console.log('================================================================\n');

  // 2. Execute Stage A Matrix
  console.log('Executing Fixed Stage-A Potency Map Matrix (11,817 replays)...');
  const executor = new StageAV3MatrixExecutor();
  const stageAResult = await executor.executeV3Matrix();

  console.log('\n--- 1. OPENING APERTURE / NECESSITY PROFILE (CANONICAL Z9 RETARGETED TO EVEN-POLE) ---');
  console.log('| Block | Retargeted Pole | Min Per-Seed JSD | Modal Shift Across All 3 Seeds | Sensitivity Status |');
  console.log('|-------|-----------------|------------------|--------------------------------|--------------------|');
  for (const ap of stageAResult.openingAperture) {
    const pole = [0, 2, 4, 6, 8][ap.blockIndex % 5];
    const jsd = ap.minimumPerSeedJsd.toFixed(4);
    const shift = ap.allSeedModalShift ? 'YES' : 'NO';
    const status = ap.allSeedModalShift ? 'CO-SENSITIVE APERTURE SITE' : 'SUB-THRESHOLD';
    console.log(`| B${String(ap.blockIndex).padEnd(4)} | Pole ${String(pole).padEnd(10)} | ${jsd.padEnd(16)} | ${shift.padEnd(30)} | ${status.padEnd(26)} |`);
  }

  console.log('\n--- 2. RESCUE SCAN / SUFFICIENCY PROFILE (INJECTED ONTO MATCHED NEUTRAL HISTORY) ---');
  console.log('| Kernel Name     | Target Blocks           | Length | Seed 101 Modal | Seed 202 Modal | Seed 303 Modal | Rescue Outcome |');
  console.log('|-----------------|-------------------------|--------|----------------|----------------|----------------|----------------|');
  for (const r of stageAResult.rescueProfile) {
    const s101 = Object.entries(r.rescueBySeed[101].mass).sort((a, b) => b[1] - a[1])[0][0].slice(0, 14);
    const s202 = Object.entries(r.rescueBySeed[202].mass).sort((a, b) => b[1] - a[1])[0][0].slice(0, 14);
    const s303 = Object.entries(r.rescueBySeed[303].mass).sort((a, b) => b[1] - a[1])[0][0].slice(0, 14);
    const success = s101.includes('CANALIZED') && s202.includes('CANALIZED') && s303.includes('CANALIZED');
    console.log(`| ${r.name.padEnd(15)} | ${r.kernel.join(',').slice(0, 23).padEnd(23)} | ${String(r.kernel.length).padEnd(6)} | ${s101.padEnd(14)} | ${s202.padEnd(14)} | ${s303.padEnd(14)} | ${success ? 'RESCUED (SUFFICIENT)' : 'FAILED'} |`);
  }

  // 3. Complete Raw-Bound Archive Audit & Closure
  console.log('\n--- 3. RAW-BOUND ARCHIVE AUDIT & CRYPTOGRAPHIC MASTER SEAL ---');
  const auditor = new StageAV3ArchiveAuditor();
  const closureRecord = await auditor.auditArchiveAndGenerateClosure();

  console.log(`Archive Manifest Digest:   ${closureRecord.matrixVerification.manifestDigest}`);
  console.log(`Raw Replays Digest Chain:  ${closureRecord.matrixVerification.rawReplaysDigestChain}`);
  console.log(`Audited Replay Count:      ${closureRecord.matrixVerification.totalReplays} (Verified against raw manifest)`);
  console.log(`Audited Step Records:      ${closureRecord.matrixVerification.rawStepRecords} (Verified against raw manifest)`);
  console.log(`Closure Timestamp:         ${closureRecord.closureTimestamp}`);
  console.log(`Closure Disposition:       ${closureRecord.closureDisposition}`);
  console.log(`Aperture Description:      ${closureRecord.apertureProfile.apertureWording}`);
  console.log(`Master Archival Seal:      ${closureRecord.masterArchivalSeal}`);
  console.log('================================================================');

  return { preflightReport, stageAResult, closureRecord };
}

if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('runStageAV3AtlasCli')) {
  runV3PreflightAndStageA().catch((err) => {
    console.error('V3 Stage A Execution Error:', err);
  });
}
