/**
 * seed101CohortRawComparator.ts
 *
 * Bounded Read-Only Comparator across the matched Seed-101 cohort:
 * V3 RESCUE_84_92 (101 topologies × 3 branch seeds = 303 replays)
 * vs
 * V4 NATIVE_84_92_REFERENCE (101 topologies × 3 branch seeds = 303 replays)
 *
 * Compares:
 * 1. Classifier digest reconciliation.
 * 2. Complete raw step-digest chain across all 303 pairs (54,540 total steps).
 * 3. Exact equality or first divergent step for each pair.
 * 4. Rigorous analysis of underlying substrate dynamics and classification outcome.
 */

import { canonicalSha256 } from '../lib/sha256';
import { Paper6C1PotentiationGrammarV4Preflight } from './Paper6C1PotentiationGrammarV4Preflight';
import { LiveC1NativeReplayAdapter, RawTrajectoryStepRecord } from './LiveC1NativeReplayAdapter';
import { AmeliaNumogramSubstrateRuntime } from '../substrate/ameliaNumogramSubstrateRuntime';
import { v4Replacements, V3_CLOSED_ARCHIVE_BINDING } from './Paper6C1PotentiationGrammarV4';
import { EVEN_POLES } from './stageAV3ArchiveAuditAndClosure';

export interface PairedReplayComparisonResult {
  pairIndex: number;
  topologyIndex: number;
  topologyKind: string;
  branchSeed: number;
  v3StepChainDigest: string;
  v4StepChainDigest: string;
  isStepChainIdentical: boolean;
  firstDivergentStep: number | null;
  v3ObservedRegime: string;
  v4ObservedRegime: string;
  isRegimeIdentical: boolean;
  divergenceDetails?: string;
}

export async function runSeed101CohortRawComparator() {
  console.log('================================================================================');
  console.log('  PAPER 6: BOUNDED SEED-101 COHORT RAW STEP-CHAIN COMPARATOR (303 REPLAYS)');
  console.log('  Assay: V3 RESCUE_84_92  <--->  V4 NATIVE_84_92_REFERENCE');
  console.log('================================================================================\n');

  // --- PART 1: CLASSIFIER DIGEST RECONCILIATION ---
  console.log('--- PART 1: CLASSIFIER DIGEST & SPECIFICATION RECONCILIATION ---');
  const v4Preflight = new Paper6C1PotentiationGrammarV4Preflight();
  const v3Binding = await v4Preflight.constructV4ArchiveBinding();
  const sampleAdapter = new LiveC1NativeReplayAdapter();
  const sampleRecord = await sampleAdapter.stepAndObserve(0);
  const sampleTrajectory = Array.from({ length: 180 }, () => sampleRecord);
  const sampleClassification = await sampleAdapter.classifyFullTrajectory(sampleTrajectory);

  const sealedClassifierDigest = v3Binding.classifierDigest;
  const runtimeClassifierDigest = sampleClassification.classifierDigest;
  const canonicalRuleSpec = JSON.stringify({
    rule: 'FULL_TRAJECTORY_REGIME_CLASSIFIER_V1',
    windows: ['steps_1_60', 'steps_61_120', 'steps_121_180'],
    prohibitedEndpointSubstitute: 'FINAL_ZONE_9_OCCUPANCY_ALONE',
  });
  const canonicalRuleDigest = canonicalSha256(canonicalRuleSpec);

  console.log(`  Sealed V3 Classifier Digest (V3 Binding)   : ${sealedClassifierDigest}`);
  console.log(`  Runtime Classifier Digest (Live C1 Adapter): ${runtimeClassifierDigest}`);
  console.log(`  Canonical Specification SHA-256 Digest     : ${canonicalRuleDigest}`);
  console.log(`  Classifier Digest Reconciliation Status    : ${sealedClassifierDigest === runtimeClassifierDigest && runtimeClassifierDigest === canonicalRuleDigest ? '100% BIT-IDENTICAL MATCH' : 'MISMATCH'}`);

  // --- PART 2: D108 CONDITIONING RECONSTRUCTION ---
  console.log('\n--- PART 2: RECONSTRUCTING MATCHED SEED-101 D108 CHECKPOINTS ---');
  const { neutralD72BySeed } = await v4Preflight.generateSealedNeutralCheckpoints();
  const d72_101 = neutralD72BySeed[101];

  // V3 D108 Checkpoint Generation (Explicit V3 StageAV3ArchiveAuditor logic)
  const rtV3 = new AmeliaNumogramSubstrateRuntime();
  const adV3 = new LiveC1NativeReplayAdapter(rtV3);
  adV3.setConditioningTargetZone(0);
  await adV3.hydrateCompleteCheckpoint(d72_101);
  const memV3 = rtV3.getMemory();
  const kernel84_92 = [84, 85, 86, 87, 88, 89, 90, 91, 92];
  const repSet = new Set<number>(kernel84_92);

  for (let s = 72; s < 108; s++) {
    const targetZone = repSet.has(s) ? 9 : EVEN_POLES[s % EVEN_POLES.length];
    const fluxDelta = 0.25 + 0.15 * Math.sin(s * 0.05 + 101 * 0.01);
    const phaseCoherence = 0.82 + 0.12 * Math.cos(s * 0.03);
    const strainRelaxation = 0.10;
    const eventDigest = canonicalSha256(`pfm-step-${s}-z${targetZone}-f${fluxDelta.toFixed(3)}`);

    memV3.append({
      blockIndex: s,
      depth: s,
      targetZone,
      fluxDelta,
      phaseCoherence,
      strainRelaxation,
      seed: 101,
      eventDigest,
      timestamp: 1000000 + s * 100 + 101,
    });
    rtV3.step();
  }
  const v3D108Cp = await adV3.captureCompleteCheckpoint();

  // V4 D108 Checkpoint Generation (Explicit V4 StageBV4ArchiveAuditor logic)
  const adV4 = new LiveC1NativeReplayAdapter();
  const v4D108Cp = await adV4.replayConditioningIntervalWithReplacements({
    lowerCheckpoint: d72_101,
    upperDepth: 108,
    replacements: v4Replacements('NATIVE_84_92_REFERENCE'),
  });

  console.log(`  V3 D108 Checkpoint Digest : ${v3D108Cp.checkpointDigest}`);
  console.log(`  V4 D108 Checkpoint Digest : ${v4D108Cp.checkpointDigest}`);
  console.log(`  D108 Parity               : ${v3D108Cp.checkpointDigest === v4D108Cp.checkpointDigest ? 'BIT-IDENTICAL' : 'DIVERGENT'}`);

  // --- PART 3: TOPOLOGY ENSEMBLE CONSTRUCTION ---
  console.log('\n--- PART 3: TOPOLOGY ENSEMBLE PREPARATION ---');
  await adV4.hydrateCompleteCheckpoint(d72_101);
  const baseTopology = await adV4.captureTopology();
  const nullTopologies = await adV4.createDegreePreservingNulls({
    topology: baseTopology,
    count: 100,
    namespace: 'P6-V4-SEED101-COMPARATOR-source-101',
  });

  const topologyCohort = [
    { kind: 'N0', index: 0, topology: baseTopology },
    ...nullTopologies.map((t, i) => ({ kind: `NULL_${i + 1}`, index: i + 1, topology: t })),
  ];
  console.log(`  Topology Ensemble Count   : ${topologyCohort.length} (1 N0 + 100 Nulls)`);

  // --- PART 4: 303 PAIRED REPLAYS STEP-CHAIN COMPARISON ---
  console.log('\n--- PART 4: EXECUTING & AUDITING ALL 303 PAIRED REPLAYS (54,540 STEPS) ---');
  const branchSeeds = [101, 202, 303];
  const comparisonResults: PairedReplayComparisonResult[] = [];

  let identicalChainCount = 0;
  let divergentChainCount = 0;
  let identicalRegimeCount = 0;

  let pairIndex = 0;
  for (const topItem of topologyCohort) {
    for (const bSeed of branchSeeds) {
      pairIndex++;

      // 1. Sealed Phase-Resolved Challenge
      const challengeV3 = await adV3.createSealedPhaseResolvedChallenge({ sourceSeed: 101, branchSeed: bSeed });
      const challengeV4 = await adV4.createSealedPhaseResolvedChallenge({ sourceSeed: 101, branchSeed: bSeed });

      // 2. V3 Replay Execution
      // Exact sequence from stageAV3ArchiveAuditAndClosure:
      await adV3.hydrateCompleteCheckpoint(v3D108Cp);
      await adV3.applyTopology(topItem.topology);
      await adV3.setGuidanceOffAndSuppressRelaySteering();
      await adV3.restoreBranchPrng({ sourceSeed: 101, branchSeed: bSeed });

      const rawStepsV3: RawTrajectoryStepRecord[] = [];
      for (let s = 0; s < 180; s++) {
        await adV3.applyPhaseResolvedChallengeStep(challengeV3, s);
        const st = await adV3.stepAndObserve(s);
        rawStepsV3.push(st);
      }
      const obsV3 = await adV3.classifyFullTrajectory(rawStepsV3);
      const v3StepChain = canonicalSha256(
        rawStepsV3.map((st) => `${st.step}:${st.dominantZone}:${st.syzygyCoherence.toFixed(4)}:${st.deformationTension.toFixed(4)}:${st.pfmTraceDigest}`).join(';')
      );

      // 3. V4 Replay Execution
      // Exact sequence from stageBV4ArchiveAuditAndExecution:
      await adV4.hydrateCompleteCheckpoint(v4D108Cp);
      await adV4.applyTopology(topItem.topology);
      await adV4.restoreBranchPrng({ sourceSeed: 101, branchSeed: bSeed });
      await adV4.setGuidanceOffAndSuppressRelaySteering();

      const rawStepsV4: RawTrajectoryStepRecord[] = [];
      for (let s = 0; s < 180; s++) {
        await adV4.applyPhaseResolvedChallengeStep(challengeV4, s);
        const st = await adV4.stepAndObserve(s);
        rawStepsV4.push(st);
      }
      const obsV4 = await adV4.classifyFullTrajectory(rawStepsV4);
      const v4StepChain = canonicalSha256(
        rawStepsV4.map((st) => `${st.step}:${st.dominantZone}:${st.syzygyCoherence.toFixed(4)}:${st.deformationTension.toFixed(4)}:${st.pfmTraceDigest}`).join(';')
      );

      // 4. Step-by-step raw chain comparison
      let firstDivergentStep: number | null = null;
      let divergenceDetails: string | undefined = undefined;

      for (let s = 0; s < 180; s++) {
        const s3 = rawStepsV3[s];
        const s4 = rawStepsV4[s];

        const match =
          s3.dominantZone === s4.dominantZone &&
          Math.abs(s3.syzygyCoherence - s4.syzygyCoherence) < 1e-4 &&
          Math.abs(s3.deformationTension - s4.deformationTension) < 1e-4 &&
          s3.pfmTraceDigest === s4.pfmTraceDigest &&
          s3.stepDigest === s4.stepDigest;

        if (!match) {
          firstDivergentStep = s;
          divergenceDetails = `Step ${s}: V3(dom=${s3.dominantZone}, coh=${s3.syzygyCoherence.toFixed(4)}, tens=${s3.deformationTension.toFixed(4)}) vs V4(dom=${s4.dominantZone}, coh=${s4.syzygyCoherence.toFixed(4)}, tens=${s4.deformationTension.toFixed(4)})`;
          break;
        }
      }

      const isChainMatch = v3StepChain === v4StepChain && firstDivergentStep === null;
      const isRegimeMatch = obsV3.label === obsV4.label;

      if (isChainMatch) identicalChainCount++;
      else divergentChainCount++;

      if (isRegimeMatch) identicalRegimeCount++;

      comparisonResults.push({
        pairIndex,
        topologyIndex: topItem.index,
        topologyKind: topItem.kind,
        branchSeed: bSeed,
        v3StepChainDigest: v3StepChain,
        v4StepChainDigest: v4StepChain,
        isStepChainIdentical: isChainMatch,
        firstDivergentStep,
        v3ObservedRegime: obsV3.label,
        v4ObservedRegime: obsV4.label,
        isRegimeIdentical: isRegimeMatch,
        divergenceDetails,
      });

      if (pairIndex <= 5 || pairIndex === 303 || !isChainMatch) {
        console.log(`  Pair #${pairIndex} [${topItem.kind}, Branch ${bSeed}]:`);
        console.log(`    Chain Identical  : ${isChainMatch ? 'YES (100% BIT-FOR-BIT)' : 'NO'}`);
        console.log(`    V3 Step Chain    : ${v3StepChain}`);
        console.log(`    V4 Step Chain    : ${v4StepChain}`);
        console.log(`    V3 Regime        : ${obsV3.label}`);
        console.log(`    V4 Regime        : ${obsV4.label}`);
        if (!isChainMatch) {
          console.log(`    [DIVERGENCE] First Divergent Step: ${firstDivergentStep}`);
          console.log(`    Details: ${divergenceDetails}`);
        }
      }
    }
  }

  // --- PART 5: AGGREGATE SUMMARY & REGIME DISTRIBUTION ON SEED 101 ---
  console.log('\n--- PART 5: AGGREGATE SUMMARY & SEED-101 REGIME BEHAVIOR ---');
  console.log(`  Total Replay Pairs Compared        : ${comparisonResults.length}`);
  console.log(`  Bit-Identical Step Chains (180/180): ${identicalChainCount} / 303 (${(identicalChainCount / 303 * 100).toFixed(2)}%)`);
  console.log(`  Divergent Step Chains              : ${divergentChainCount} / 303`);
  console.log(`  Identical Regime Classifications   : ${identicalRegimeCount} / 303 (${(identicalRegimeCount / 303 * 100).toFixed(2)}%)`);

  // Count distribution across all 303 replays for V3 vs V4
  const v3RegimeCounts: Record<string, number> = {};
  const v4RegimeCounts: Record<string, number> = {};
  for (const r of comparisonResults) {
    v3RegimeCounts[r.v3ObservedRegime] = (v3RegimeCounts[r.v3ObservedRegime] ?? 0) + 1;
    v4RegimeCounts[r.v4ObservedRegime] = (v4RegimeCounts[r.v4ObservedRegime] ?? 0) + 1;
  }

  console.log('\n  Cohort Regime Distribution (All 303 Replays of Seed 101):');
  for (const label of Object.keys(v4RegimeCounts)) {
    console.log(`    ${label}:`);
    console.log(`      V3: ${v3RegimeCounts[label] ?? 0} / 303 (${((v3RegimeCounts[label] ?? 0)/303*100).toFixed(1)}%)`);
    console.log(`      V4: ${v4RegimeCounts[label] ?? 0} / 303 (${((v4RegimeCounts[label] ?? 0)/303*100).toFixed(1)}%)`);
  }

  // N0 branches specifically (3 replays)
  const n0Results = comparisonResults.filter((r) => r.topologyKind === 'N0');
  console.log('\n  Native Base Topology (N0) Breakdown for Seed 101 (3 Branches):');
  for (const n0r of n0Results) {
    console.log(`    Branch ${n0r.branchSeed}: V3=${n0r.v3ObservedRegime} | V4=${n0r.v4ObservedRegime} | StepChainEqual=${n0r.isStepChainIdentical}`);
  }

  return {
    sealedClassifierDigest,
    runtimeClassifierDigest,
    totalPairs: comparisonResults.length,
    identicalChainCount,
    divergentChainCount,
    identicalRegimeCount,
    comparisonResults,
  };
}

runSeed101CohortRawComparator().catch((err) => {
  console.error('[COMPARATOR ERROR]', err);
  process.exit(1);
});
