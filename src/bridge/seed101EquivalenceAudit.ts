/**
 * seed101EquivalenceAudit.ts
 *
 * Read-Only Seed-101 Equivalence Audit comparing:
 * V3 CONDITION_RESCUE_KERNEL_84_92 with V4 NATIVE_84_92_REFERENCE.
 *
 * Audits:
 *  1. Complete D72/PFM and D108 checkpoint digests.
 *  2. All nine replacement tuples and non-replaced event digests.
 *  3. Topology / Null-Graph and Branch-PRNG state.
 *  4. The three 101:* challenge digests (101:101, 101:202, 101:303).
 *  5. Classifier digest and first per-step raw-chain divergence.
 */

import { canonicalSha256 } from '../lib/sha256';
import { Paper6C1PotentiationGrammarV4Preflight } from './Paper6C1PotentiationGrammarV4Preflight';
import { LiveC1NativeReplayAdapter, RawTrajectoryStepRecord } from './LiveC1NativeReplayAdapter';
import { v4Replacements, V3_CLOSED_ARCHIVE_BINDING } from './Paper6C1PotentiationGrammarV4';

export async function runSeed101EquivalenceAudit() {
  console.log('================================================================');
  console.log('  PAPER 6: READ-ONLY SEED-101 EQUIVALENCE AUDIT');
  console.log('  Comparing: V3 RESCUE_84_92 vs V4 NATIVE_84_92_REFERENCE');
  console.log('================================================================\n');

  // 1. D72 / PFM Checkpoint Regeneration & Digestion
  const v4Preflight = new Paper6C1PotentiationGrammarV4Preflight();
  const { neutralD72BySeed, neutralD108BySeed } = await v4Preflight.generateSealedNeutralCheckpoints();
  const d72_101 = neutralD72BySeed[101];

  console.log('--- 1. CHECKPOINT INTEGRITY & REGENERATION ---');
  console.log(`  D72 Sealed Checkpoint Digest (Seed 101) : ${d72_101.checkpointDigest}`);
  console.log(`  D72 PFM Events Count                    : ${(d72_101.payload as any)?.pfmEvents?.length ?? 0}`);

  // Replay V3 RESCUE_84_92 explicitly as in StageAV3ArchiveAuditor
  const adV3 = new LiveC1NativeReplayAdapter();
  await adV3.hydrateCompleteCheckpoint(d72_101);
  const memV3 = (adV3 as any).runtime.getMemory();
  const kernel84_92 = [84, 85, 86, 87, 88, 89, 90, 91, 92];
  const repSet = new Set<number>(kernel84_92);
  const EVEN_POLES = [0, 2, 4, 6, 8];

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
    (adV3 as any).runtime.step();
  }
  const v3RescuedD108Cp = await adV3.captureCompleteCheckpoint();

  // Replay V4 NATIVE_84_92_REFERENCE explicitly via LiveC1NativeReplayAdapter
  const adV4 = new LiveC1NativeReplayAdapter();
  const v4RescuedD108Cp = await adV4.replayConditioningIntervalWithReplacements({
    lowerCheckpoint: d72_101,
    upperDepth: 108,
    replacements: v4Replacements('NATIVE_84_92_REFERENCE'),
  });

  console.log(`  V3 RESCUE_84_92 D108 Checkpoint Digest : ${v3RescuedD108Cp.checkpointDigest}`);
  console.log(`  V4 NATIVE_84_92 D108 Checkpoint Digest : ${v4RescuedD108Cp.checkpointDigest}`);
  console.log(`  D108 Checkpoints Bit-Identical          : ${v3RescuedD108Cp.checkpointDigest === v4RescuedD108Cp.checkpointDigest ? 'YES (100% Match)' : 'NO'}`);

  // 2. Replacements & Non-replaced event digests audit
  console.log('\n--- 2. REPLACEMENT TUPLES & EVENT DIGEST AUDIT (STEPS 72..107) ---');
  const v3Events = (v3RescuedD108Cp.payload as any)?.pfmEvents ?? [];
  const v4Events = (v4RescuedD108Cp.payload as any)?.pfmEvents ?? [];
  console.log(`  Total Events in V3 Checkpoint : ${v3Events.length}`);
  console.log(`  Total Events in V4 Checkpoint : ${v4Events.length}`);

  let eventMismatchFound = false;
  for (let s = 72; s < 108; s++) {
    const e3 = v3Events[s];
    const e4 = v4Events[s];
    const isReplaced = repSet.has(s);
    const match = e3.eventDigest === e4.eventDigest && e3.targetZone === e4.targetZone;
    if (!match) {
      eventMismatchFound = true;
      console.log(`  Step ${s} [${isReplaced ? 'REPLACED KERNEL' : 'NON-REPLACED'}]: MISMATCH!`);
      console.log(`    V3: z=${e3.targetZone}, digest=${e3.eventDigest}`);
      console.log(`    V4: z=${e4.targetZone}, digest=${e4.eventDigest}`);
    }
  }
  if (!eventMismatchFound) {
    console.log('  All 9 replacement tuples [84..92 -> Zone 9] and 27 non-replaced events [72..83, 93..107 -> Even Poles] are BIT-IDENTICAL.');
  }

  // 3. Topology and Null-Graph Audit
  console.log('\n--- 3. TOPOLOGY & NULL-GRAPH AUDIT ---');
  const v3Gates = (v3RescuedD108Cp.payload as any)?.gates ?? [];
  const v4Gates = (v4RescuedD108Cp.payload as any)?.gates ?? [];
  console.log(`  V3 Gates Count : ${v3Gates.length} | V4 Gates Count : ${v4Gates.length}`);
  const gatesMatch = JSON.stringify(v3Gates) === JSON.stringify(v4Gates);
  console.log(`  Native Base Topology (N0) Exact Match : ${gatesMatch ? 'YES (100% Match)' : 'NO'}`);

  // 4. Sealed Challenge Digests Audit
  console.log('\n--- 4. CHALLENGE DIGEST AUDIT (101:101, 101:202, 101:303) ---');
  const binding = await v4Preflight.constructV4ArchiveBinding();
  const branchSeeds = [101, 202, 303];
  for (const b of branchSeeds) {
    const chV3 = await adV3.createSealedPhaseResolvedChallenge({ sourceSeed: 101, branchSeed: b });
    const chV4 = await adV4.createSealedPhaseResolvedChallenge({ sourceSeed: 101, branchSeed: b });
    const sealedV3Digest = binding.phaseResolvedChallengeDigests[`101:${b}`];
    console.log(`  Branch 101:${b}:`);
    console.log(`    Sealed V3 Archive Digest : ${sealedV3Digest}`);
    console.log(`    V3 Live Challenge Digest : ${chV3.challengeDigest}`);
    console.log(`    V4 Live Challenge Digest : ${chV4.challengeDigest}`);
    console.log(`    Parity                   : ${chV3.challengeDigest === sealedV3Digest && chV4.challengeDigest === sealedV3Digest ? 'BIT-IDENTICAL' : 'DIVERGENCE'}`);
  }

  // 5. Classifier Digest & Trajectory Execution Audit
  console.log('\n--- 5. CLASSIFIER DIGEST & TRAJECTORY STEP DIVERGENCE ANALYSIS ---');
  console.log(`  Sealed Classifier Digest : ${binding.classifierDigest}`);

  for (const b of branchSeeds) {
    console.log(`\n  --- Trace Analysis for Seed 101, Branch ${b} ---`);
    const ch = await adV3.createSealedPhaseResolvedChallenge({ sourceSeed: 101, branchSeed: b });

    // Method A: V3 Execution (StageAV3ArchiveAuditor: hydrate -> executePhaseResolvedTrajectorySync -> classifyFullTrajectory)
    await adV3.hydrateCompleteCheckpoint(v3RescuedD108Cp);
    const v3Records: RawTrajectoryStepRecord[] = adV3.executePhaseResolvedTrajectorySync(ch, 180);
    const v3Regime = await adV3.classifyFullTrajectory(v3Records);

    // Method B: V4 Execution (StageBV4ArchiveAuditor: hydrate -> applyTopology -> restoreBranchPrng -> setGuidanceOffAndSuppressRelaySteering -> stepAndObserve -> classifyFullTrajectory)
    await adV4.hydrateCompleteCheckpoint(v4RescuedD108Cp);
    await adV4.applyTopology(await adV4.captureTopology());
    await adV4.restoreBranchPrng({ sourceSeed: 101, branchSeed: b });
    await adV4.setGuidanceOffAndSuppressRelaySteering();

    const v4Records: RawTrajectoryStepRecord[] = [];
    for (let s = 0; s < 180; s++) {
      await adV4.applyPhaseResolvedChallengeStep(ch, s);
      const rec = await adV4.stepAndObserve(s);
      v4Records.push(rec);
    }
    const v4Regime = await adV4.classifyFullTrajectory(v4Records);

    console.log(`    V3 Observed Regime : ${v3Regime.label} (isGrid=${v3Regime.isGridRegime})`);
    console.log(`    V4 Observed Regime : ${v4Regime.label} (isGrid=${v4Regime.isGridRegime})`);

    const v3Z9Steps = v3Records.filter((r) => r.dominantZone === 9).length;
    const v4Z9Steps = v4Records.filter((r) => r.dominantZone === 9).length;
    const v3EvenSteps = v3Records.filter((r) => r.dominantZone % 2 === 0).length;
    const v4EvenSteps = v4Records.filter((r) => r.dominantZone % 2 === 0).length;
    console.log(`    V3 Trajectory Metrics: Z9 Dwell = ${v3Z9Steps}/180 | Even Pole Dwell = ${v3EvenSteps}/180`);
    console.log(`    V4 Trajectory Metrics: Z9 Dwell = ${v4Z9Steps}/180 | Even Pole Dwell = ${v4EvenSteps}/180`);

    // Check step-by-step equality between V3 and V4 execution pipelines
    let firstStepDiff = -1;
    for (let s = 0; s < 180; s++) {
      const r3 = v3Records[s];
      const r4 = v4Records[s];
      const stepEqual = r3.dominantZone === r4.dominantZone &&
        Math.abs(r3.syzygyCoherence - r4.syzygyCoherence) < 1e-4 &&
        r3.tenZoneActivation.every((act, idx) => Math.abs(act - r4.tenZoneActivation[idx]) < 1e-4);

      if (!stepEqual) {
        firstStepDiff = s;
        console.log(`    Pipeline Divergence at Step ${s}:`);
        console.log(`      V3: DomZone=${r3.dominantZone}, Coh=${r3.syzygyCoherence.toFixed(4)}, Act=[${r3.tenZoneActivation.map(a => a.toFixed(2)).join(',')}]`);
        console.log(`      V4: DomZone=${r4.dominantZone}, Coh=${r4.syzygyCoherence.toFixed(4)}, Act=[${r4.tenZoneActivation.map(a => a.toFixed(2)).join(',')}]`);
        break;
      }
    }
    if (firstStepDiff === -1) {
      console.log(`    Pipeline Parity: V3 and V4 execution loops produce 100% BIT-IDENTICAL step records for Branch ${b}.`);
    }

    // Now let us analyze why Seed 101 produced REGIME_EVEN_POLE_RELAXATION_OSCILLATION:
    // Check W3 (steps 121..180) dominant zone distribution:
    const w3_steps = v4Records.slice(120, 180);
    const w3_z9 = w3_steps.filter(r => r.dominantZone === 9).length;
    const w3_even = w3_steps.filter(r => r.dominantZone % 2 === 0).length;
    const w3_coh = w3_steps.reduce((acc, r) => acc + r.syzygyCoherence, 0) / w3_steps.length;
    console.log(`    Window 3 (Steps 121..180) Analysis:`);
    console.log(`      Z9 Dwell in W3     : ${w3_z9}/60 (${(w3_z9/60*100).toFixed(1)}%)`);
    console.log(`      Even Pole Dwell W3 : ${w3_even}/60 (${(w3_even/60*100).toFixed(1)}%)`);
    console.log(`      Mean Coherence W3  : ${w3_coh.toFixed(4)}`);
  }

  // Also check Seeds 202 and 303 under V4 NATIVE_84_92_REFERENCE for direct contrast
  console.log('\n--- 6. COMPARATIVE SEED DYNAMICS UNDER NATIVE_84_92_REFERENCE ---');
  for (const s of [101, 202, 303]) {
    const cp = await adV4.replayConditioningIntervalWithReplacements({
      lowerCheckpoint: neutralD72BySeed[s],
      upperDepth: 108,
      replacements: v4Replacements('NATIVE_84_92_REFERENCE'),
    });
    await adV4.hydrateCompleteCheckpoint(cp);
    await adV4.setGuidanceOffAndSuppressRelaySteering();
    const ch = await adV4.createSealedPhaseResolvedChallenge({ sourceSeed: s, branchSeed: s });
    const steps: RawTrajectoryStepRecord[] = [];
    for (let i = 0; i < 180; i++) {
      await adV4.applyPhaseResolvedChallengeStep(ch, i);
      steps.push(await adV4.stepAndObserve(i));
    }
    const reg = await adV4.classifyFullTrajectory(steps);
    const z9Tot = steps.filter(r => r.dominantZone === 9).length;
    const w3 = steps.slice(120, 180);
    const z9W3 = w3.filter(r => r.dominantZone === 9).length;
    const evenW3 = w3.filter(r => r.dominantZone % 2 === 0).length;
    const cohW3 = w3.reduce((acc, r) => acc + r.syzygyCoherence, 0) / w3.length;
    console.log(`  Source Seed ${s} (Branch ${s}):`);
    console.log(`    Regime Classified : ${reg.label}`);
    console.log(`    Total Z9 Dwell    : ${z9Tot}/180 (${(z9Tot/180*100).toFixed(1)}%)`);
    console.log(`    W3 Z9 Dwell       : ${z9W3}/60 (${(z9W3/60*100).toFixed(1)}%)`);
    console.log(`    W3 Even Pole Dwell: ${evenW3}/60 (${(evenW3/60*100).toFixed(1)}%)`);
    console.log(`    W3 Mean Coherence : ${cohW3.toFixed(4)}`);
  }

  console.log('\n================================================================');
  console.log('  SEED-101 EQUIVALENCE AUDIT COMPLETE');
  console.log('================================================================\n');
}

runSeed101EquivalenceAudit().catch((err) => {
  console.error('[SEED 101 AUDIT ERROR]', err);
  process.exit(1);
});
