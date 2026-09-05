/**
 * stageCV5ArchiveAuditAndExecution.ts
 *
 * Complete Stage C Raw-Bound Execution, Ledger Auditing, and Analysis Engine for
 * PAPER_6_C1_POTENTIATION_GRAMMAR_V5 (Fresh-Lineage Late-Window Replication).
 *
 * Matrix Structure:
 *  - 4 Fixed Conditions:
 *      * NEUTRAL_REFERENCE (Matched baseline)
 *      * EARLY_76_84 (Displaced control)
 *      * NATIVE_84_92_REFERENCE (Secondary placement comparator)
 *      * LATE_92_100 (Primary hypothesis arm)
 *  - 3 Fresh Source Seeds: 404, 505, 606
 *  - 101 Topologies: N0 + 100 Degree-Preserving Nulls per source seed
 *  - 3 Branch Seeds: 101, 202, 303
 *  - 180 Observation Steps per replay
 *  - Total Replays: 3,636
 *  - Total Raw Steps: 654,480
 *
 * Primary Success Rule:
 *  - Across all three fresh seeds (404, 505, 606), late placement (92–100) exhibits a
 *    Zone-9-canalized modal full-trajectory regime while matched neutral does not.
 */

import { canonicalSha256 } from '../lib/sha256';
import {
  PAPER_6_C1_POTENTIATION_GRAMMAR_V5,
  V5_CONDITIONS,
  V5_SOURCE_SEEDS,
  V5_BRANCH_SEEDS,
  V5_LOWER_DEPTH,
  V5_UPPER_DEPTH,
  V5_OBSERVATION_STEPS,
  v5Replacements,
  expectedV5ReplayCount,
  expectedV5RawStepCount,
  analyseV5Replication,
  type V5ConditionId,
  type V5RawReplayRecord,
  type V5Analysis,
} from './Paper6C1PotentiationGrammarV5';
import {
  Paper6C1PotentiationGrammarV5Preflight,
  type V5PreflightReport,
} from './Paper6C1PotentiationGrammarV5Preflight';
import {
  LiveC1NativeReplayAdapter,
  RawTrajectoryStepRecord,
} from './LiveC1NativeReplayAdapter';
import { CheckpointSealForReplay } from './Paper6C1ReplayAtlasV1';

export interface V5ExecutionResult {
  preflightReport: V5PreflightReport;
  rawReplayRecords: V5RawReplayRecord[];
  totalRawReplays: number;
  totalRawSteps: number;
  rawDigestChain: string;
  manifestDigest: string;
  analysis: V5Analysis;
}

export class StageCV5ArchiveAuditor {
  private adapter: LiveC1NativeReplayAdapter;
  private preflight: Paper6C1PotentiationGrammarV5Preflight;

  constructor() {
    this.adapter = new LiveC1NativeReplayAdapter();
    this.preflight = new Paper6C1PotentiationGrammarV5Preflight();
  }

  public async executeFullV5Matrix(): Promise<V5ExecutionResult> {
    // 1. Execute Preflight
    const preflightReport = await this.preflight.runFullPreflight();
    if (preflightReport.status !== 'V5_PREFLIGHT_PASSED') {
      throw new Error(`[StageCV5] Preflight failed: ${preflightReport.status}`);
    }

    const { neutralD72BySeed } = await this.preflight.generateSealedNeutralCheckpoints();

    // 2. Prepare Condition Checkpoints across all (Condition × Fresh Seed) pairs (12 Checkpoints)
    const conditionCheckpoints: Record<string, CheckpointSealForReplay> = {};
    for (const cond of V5_CONDITIONS) {
      for (const seed of V5_SOURCE_SEEDS) {
        const key = `${cond.id}:${seed}`;
        const d72 = neutralD72BySeed[seed];
        const repl = v5Replacements(cond.id as V5ConditionId);
        const d108 = await this.adapter.replayConditioningIntervalWithReplacements({
          lowerCheckpoint: d72,
          upperDepth: V5_UPPER_DEPTH,
          replacements: repl,
        });
        conditionCheckpoints[key] = d108;
      }
    }

    // 3. Prepare Topologies (N0 + 100 Degree-Preserving Nulls per fresh seed)
    const topologyCohortsBySeed: Record<number, { kind: 'N0' | 'NULL'; index: number; id: string; topology: unknown }[]> = {};
    for (const seed of V5_SOURCE_SEEDS) {
      await this.adapter.hydrateCompleteCheckpoint(neutralD72BySeed[seed]);
      const baseTop = await this.adapter.captureTopology();
      const nulls = await this.adapter.createDegreePreservingNulls({
        topology: baseTop,
        count: 100,
        namespace: `P6-V5-FRESH-source-${seed}`,
      });
      topologyCohortsBySeed[seed] = [
        { kind: 'N0', index: 0, id: `N0-seed${seed}`, topology: baseTop },
        ...nulls.map((t, idx) => ({
          kind: 'NULL' as const,
          index: idx + 1,
          id: `NULL_${idx + 1}-seed${seed}`,
          topology: t,
        })),
      ];
    }

    // 4. Precompute Phase-Resolved Challenges (9 schedules)
    const challengesByKey: Record<string, any> = {};
    for (const sSeed of V5_SOURCE_SEEDS) {
      for (const bSeed of V5_BRANCH_SEEDS) {
        const key = `${sSeed}:${bSeed}`;
        challengesByKey[key] = await this.adapter.createSealedPhaseResolvedChallenge({
          sourceSeed: sSeed,
          branchSeed: bSeed,
        });
      }
    }

    // 5. Execute All 3,636 Replays (Raw-First Append Ledger)
    const rawReplayRecords: V5RawReplayRecord[] = [];
    const stepChainList: string[] = [];

    for (const cond of V5_CONDITIONS) {
      for (const sSeed of V5_SOURCE_SEEDS) {
        const condKey = `${cond.id}:${sSeed}`;
        const d108Cp = conditionCheckpoints[condKey];
        const topCohort = topologyCohortsBySeed[sSeed];

        for (const topItem of topCohort) {
          for (const bSeed of V5_BRANCH_SEEDS) {
            const chKey = `${sSeed}:${bSeed}`;
            const challenge = challengesByKey[chKey];

            // Replay execution sequence:
            await this.adapter.hydrateCompleteCheckpoint(d108Cp);
            await this.adapter.applyTopology(topItem.topology);
            await this.adapter.restoreBranchPrng({ sourceSeed: sSeed, branchSeed: bSeed });
            await this.adapter.setGuidanceOffAndSuppressRelaySteering();

            const rawSteps: RawTrajectoryStepRecord[] = [];
            for (let step = 0; step < V5_OBSERVATION_STEPS; step++) {
              await this.adapter.applyPhaseResolvedChallengeStep(challenge, step);
              const stepRec = await this.adapter.stepAndObserve(step);
              rawSteps.push(stepRec);
            }

            const observation = await this.adapter.classifyFullTrajectory(rawSteps);
            const stepDigestChain = canonicalSha256(
              rawSteps
                .map(
                  (st) =>
                    `${st.step}:${st.dominantZone}:${st.syzygyCoherence.toFixed(4)}:${st.deformationTension.toFixed(4)}:${st.pfmTraceDigest}`
                )
                .join(';')
            );

            stepChainList.push(stepDigestChain);

            rawReplayRecords.push({
              conditionId: cond.id as V5ConditionId,
              sourceSeed: sSeed,
              topologyId: topItem.id,
              topologyKind: topItem.kind,
              topologyIndex: topItem.index,
              branchSeed: bSeed,
              stepDigestChain,
              observedRegime: observation.label,
              rawStepCount: rawSteps.length,
            });
          }
        }
      }
    }

    if (rawReplayRecords.length !== expectedV5ReplayCount()) {
      throw new Error(
        `[StageCV5] Matrix Denominator mismatch. Expected ${expectedV5ReplayCount()}, produced ${rawReplayRecords.length}`
      );
    }

    const rawDigestChain = canonicalSha256(stepChainList.join('::'));
    const manifestPayload = {
      protocolId: PAPER_6_C1_POTENTIATION_GRAMMAR_V5.protocolId,
      preflightSeal: preflightReport.preflightSealDigest,
      totalReplays: rawReplayRecords.length,
      totalRawSteps: rawReplayRecords.length * V5_OBSERVATION_STEPS,
      rawDigestChain,
      freshSourceSeeds: V5_SOURCE_SEEDS,
      conditions: V5_CONDITIONS.map((c) => c.id),
    };
    const manifestDigest = canonicalSha256(JSON.stringify(manifestPayload));

    // 6. Perform Analysis & Evaluation
    const analysis = analyseV5Replication(rawReplayRecords);

    return {
      preflightReport,
      rawReplayRecords,
      totalRawReplays: rawReplayRecords.length,
      totalRawSteps: rawReplayRecords.length * V5_OBSERVATION_STEPS,
      rawDigestChain,
      manifestDigest,
      analysis,
    };
  }
}
