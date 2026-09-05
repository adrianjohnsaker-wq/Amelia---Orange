/**
 * runMidPlexSweepCli.ts
 *
 * CLI runner for Paper 6 Mid-Plex Sweep, Canary Verification, and D1152-NEUTRAL control arm.
 * Driven directly by live substrate step cycles, ProcessFieldMemory, and cryptographic SHA-256 digests.
 */

import { MidPlexSweepRunner, MidPlexSweepReport } from '../ai/coupling/MidPlexSweepRunner';
import { PFMConditioningEngine } from '../ai/coupling/PFMConditioningEngine';
import * as fs from 'node:fs';
import * as path from 'node:path';

export function runCanaryD288Verification() {
  console.log('================================================================');
  console.log('[CANARY] Running D=288 Canary Verification on live substrate...');
  console.log('================================================================');
  const engine = new PFMConditioningEngine();
  const snapshot = engine.runConditioning(288, 101, 'Z9');
  const runtime = engine.getRuntime();
  const memHistory = runtime.getMemory().getHistory();
  const lastConsumption = runtime.getMemoryConsumptionLog().at(-1);

  console.log(`[CANARY] Depth Scheduled:             ${snapshot.depth}`);
  console.log(`[CANARY] PFM Events Ingested:          ${snapshot.pfmEventsCount}`);
  console.log(`[CANARY] Runtime Memory Events:        ${memHistory.length}`);
  console.log(`[CANARY] Last Consumed History Length: ${lastConsumption?.memoryHistoryLength}`);
  console.log(`[CANARY] Applied Bias Vector (Z9):     ${lastConsumption?.appliedBiasVector[9]}`);
  console.log(`[CANARY] Pre-Challenge FC:             ${snapshot.preChallengeFieldCoherence}`);
  console.log(`[CANARY] SHA-256 Digest:               ${snapshot.snapshotDigest}`);
  
  const isVerified = snapshot.pfmEventsCount === 288 && memHistory.length === 288 && (lastConsumption?.appliedBiasVector[9] ?? 0) > 0;
  console.log(`[CANARY] Coupling Status:              ${isVerified ? 'VERIFIED (Causal PFM Active)' : 'FAILED'}`);
  if (!isVerified) {
    throw new Error('[FAIL-CLOSED] Canary verification failed.');
  }
  return snapshot;
}

export function runMidPlexSweepCli(): MidPlexSweepReport {
  console.log('\n================================================================');
  console.log('[PAPER 6] Executing Sealed Mid-Plex Sweep (Depths: 0, 144, 288, 576, 864, 1152 | Seeds: 101, 202, 303)');
  console.log('================================================================\n');

  const report = MidPlexSweepRunner.executeFullMidPlexSweep();

  // Print table of aggregates
  console.log('| Depth / Arm    | Mean PFM | Mean Pre-FC | Mean Z-9 % | Mean Z-0 % | 5-Pole Balance | Canalization C | Recovery Latency | Metabolic |');
  console.log('|:--------------:|:--------:|:-----------:|:----------:|:----------:|:--------------:|:--------------:|:----------------:|:---------:|');
  for (const agg of report.aggregates) {
    const label = agg.arm === 'NEUTRAL' ? `D=${agg.depth}-NEUT` : `D=${agg.depth}`;
    console.log(
      `| ${label.padEnd(14)} ` +
      `| ${agg.meanPfmEvents.toFixed(0).padStart(8)} ` +
      `| ${agg.meanPreFC.toFixed(4).padStart(11)} ` +
      `| ${(agg.meanZone9Pct + '%').padStart(10)} ` +
      `| ${(agg.meanZone0Pct + '%').padStart(10)} ` +
      `| ${agg.meanFivePoleBalance.toFixed(4).padStart(14)} ` +
      `| ${agg.meanCanalizationC.toFixed(4).padStart(14)} ` +
      `| ${(agg.meanRecoveryLatency.toFixed(1) + ' steps').padStart(16)} ` +
      `| ${agg.meanMetabolic.toFixed(4).padStart(9)} |`
    );
  }

  console.log('\n----------------------------------------------------------------');
  console.log(`[SEALED CAPSULES] Total Capsules: ${report.totalCapsules} (Append-sealed to disk prior to scoring)`);
  console.log(`[MANIFEST DIGEST] SHA-256: ${report.manifestDigest}`);
  console.log(`[H1 COMPARISON]   D1152-Z9: ${report.d1152Comparison.z9MeanZone9Pct}% vs D1152-NEUTRAL: ${report.d1152Comparison.neutralMeanZone9Pct}% (D0 Baseline: ${report.d1152Comparison.d0MeanZone9Pct}%)`);
  console.log(`[H1 OUTCOME]      Hypothesis 1 Supported: ${report.d1152Comparison.hypothesis1Supported ? 'YES' : 'NO'}`);
  console.log('----------------------------------------------------------------\n');

  // Archive full JSON report
  const archiveDir = path.join(process.cwd(), 'audit_archive');
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }
  const archivePath = path.join(archiveDir, 'paper6_raw_capsules.json');
  fs.writeFileSync(archivePath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`[AUDIT ARCHIVE] Sealed raw capsule report written to: ${archivePath}`);

  return report;
}

if (typeof process !== 'undefined' && process?.argv?.[1]?.includes('runMidPlexSweepCli')) {
  runCanaryD288Verification();
  runMidPlexSweepCli();
}
