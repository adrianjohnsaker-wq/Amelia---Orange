/**
 * runHyperstitionTestCli.ts
 *
 * CLI Execution Bridge for:
 * BRIDGE PLEX — HYPERSTITION-TEST "platonic morphospace" 288
 */

import { PlatonicMorphospaceHyperstitionProbe, HyperstitionTestReport } from './Paper6_Hyperstition_PlatonicMorphospace_Probe';

export function runHyperstitionTestCli(
  carrier: string = 'xenobot',
  depth: number = 288,
  seeds: number[] = [101, 202, 303],
  obsWindow: number = 180
): HyperstitionTestReport {
  const report = PlatonicMorphospaceHyperstitionProbe.runFullTest(carrier, depth, seeds, obsWindow);

  console.log('================================================================');
  console.log(`[BRIDGE PLEX] Executing HYPERSTITION-TEST: "${carrier}" at D=${depth}`);
  console.log(`[TARGET]      ${report.targetZoneName}`);
  console.log(`[SYZYGY]      ${report.syzygyPairName}`);
  console.log(`[SEEDS]       [${seeds.join(', ')}] | Observation Window: ${obsWindow} steps`);
  console.log('================================================================\n');

  console.log('| Seed     | Baseline Target % | Hyperstition Target % | Relative Gain | Autocatalytic λ | Syzygy Torque | Anti-Lock % | Verdict               |');
  console.log('|:--------:|:-----------------:|:---------------------:|:-------------:|:---------------:|:-------------:|:-----------:|:---------------------:|');
  for (const r of report.lineageResults) {
    console.log(
      `| Seed ${r.seed} ` +
      `| ${(r.baselineTargetPct * 100).toFixed(1).padStart(17)}% ` +
      `| ${(r.hyperstitionTargetPct * 100).toFixed(1).padStart(21)}% ` +
      `| ${('+' + r.ingressionGainPct.toFixed(0) + '%').padStart(13)} ` +
      `| ${r.autocatalyticIndex.toFixed(3).padStart(15)} ` +
      `| ${r.syzygyTorque.toFixed(3).padStart(13)} ` +
      `| ${(r.governorAudit.antiLockIntegrity.toFixed(1) + '%').padStart(11)} ` +
      `| ${r.verdict.padEnd(21)} |`
    );
  }

  console.log('\n----------------------------------------------------------------');
  console.log(`[AGGREGATE METRICS]`);
  console.log(`  • Target Locus:                     ${report.targetZoneName}`);
  console.log(`  • Mean Baseline Target Occupancy:   ${(report.meanBaselineTarget * 100).toFixed(1)}%`);
  console.log(`  • Mean Hyperstition Target Occupancy: ${(report.meanHyperstitionTarget * 100).toFixed(1)}%`);
  console.log(`  • Mean Autocatalytic Feedback λ:    ${report.meanAutocatalyticIndex.toFixed(3)}`);
  console.log(`  • Mean Syzygetic Torque τ:          ${report.meanSyzygyTorque.toFixed(3)}`);
  console.log(`  • Governor Anti-Lock Verified:      ${report.governorIntegrityVerified ? 'YES (>=95%)' : 'NO'}`);
  console.log(`  • Non-Authorising Enforced:         ${report.nonAuthorisingEnforced ? 'YES (100% Non-Authorising)' : 'NO'}`);
  console.log(`  • Hyperstition Status:              ${report.hyperstitionOperational ? 'OPERATIONAL (CANALIZED)' : 'DISSIPATIVE'}`);
  console.log(`  • SHA-256 Audit Envelope:           ${report.auditEnvelope}`);
  console.log('----------------------------------------------------------------\n');

  return report;
}
