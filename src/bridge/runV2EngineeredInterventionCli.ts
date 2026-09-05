/**
 * runV2EngineeredInterventionCli.ts
 *
 * CLI execution runner for the PAPER_6_C1_REPLAY_ATLAS_V2 Engineered Cohort.
 */

import {
  V2EngineeredInterventionExecutor,
  V2EngineeredReplayResult,
} from './executePaper6V2EngineeredIntervention';

export async function runV2EngineeredCohort(): Promise<V2EngineeredReplayResult> {
  console.log('================================================================');
  console.log('PAPER 6 C1 REPLAY ATLAS V2 - ENGINEERED REPLAY COHORT');
  console.log('Single-Event Retargeting: Block 88 -> Zone 6 (EVEN_POLES[88 % 5])');
  console.log('================================================================');

  const executor = new V2EngineeredInterventionExecutor();
  const result = await executor.executeEngineeredCohort();

  console.log(`Execution Timestamp:       ${result.timestamp}`);
  console.log(`Status:                    ${result.status}`);
  console.log(`Interval:                  D${result.selectedInterval.lowerDepth} -> D${result.selectedInterval.upperDepth}`);
  console.log(`Retargeted Candidate:      Block ${result.candidateEvent.blockIndex} (Zone ${result.candidateEvent.originalTarget} -> Zone ${result.candidateEvent.retargetedTarget})`);
  console.log(`Engineered Replays:        ${result.engineeredCohortSize} (3 seeds × 101 topologies × 3 branch seeds)`);
  console.log(`Raw Step Records:          ${result.rawStepsCount}`);

  console.log('\n--- 1. CANONICAL D108 REGENERATION EQUALITY CHECKS ---');
  for (const check of result.canonicalRegenerationChecks) {
    const symbol = check.digestEqualityVerified ? '✓ [PASS]' : '✗ [FAIL]';
    console.log(`${symbol} Seed ${check.sourceSeed}: Exact D108 Digest Match`);
    console.log(`    Sealed D108:      ${check.sealedD108Digest}`);
    console.log(`    Regenerated D108: ${check.regeneratedD108Digest}`);
  }

  console.log('\n--- 2. DISTRIBUTION COMPARISONS (CANONICAL vs NEUTRAL vs ENGINEERED D108) ---');
  for (const comp of result.distributionComparison) {
    console.log(`\n[SOURCE SEED ${comp.sourceSeed}]`);
    console.log(`  Canonical D108:  ${JSON.stringify(comp.canonicalD108Distribution)}`);
    console.log(`  Neutral D108:    ${JSON.stringify(comp.neutralD108Distribution)}`);
    console.log(`  Engineered D108: ${JSON.stringify(comp.engineeredD108Distribution)}`);
    console.log(`  JSD(Eng vs Can): ${comp.jsdEngineeredVsCanonical.toFixed(4)} bits`);
    console.log(`  JSD(Eng vs Neu): ${comp.jsdEngineeredVsNeutral.toFixed(4)} bits`);
    console.log(`  Outcome:         ${comp.phenotypeShiftConclusion}`);
  }

  console.log('\n--- 3. ENSEMBLE SUMMARY & OUTCOME ---');
  console.log(`Canonical Modal:   ${result.ensembleSummary.canonicalModalRegime}`);
  console.log(`Neutral Modal:     ${result.ensembleSummary.neutralModalRegime}`);
  console.log(`Engineered Modal:  ${result.ensembleSummary.engineeredModalRegime}`);
  console.log(`Cohort Outcome:    ${result.ensembleSummary.interventionOutcome}`);
  console.log('================================================================');

  return result;
}

if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('runV2EngineeredInterventionCli')) {
  runV2EngineeredCohort().catch((err) => {
    console.error('Engineered Cohort Execution Error:', err);
  });
}
