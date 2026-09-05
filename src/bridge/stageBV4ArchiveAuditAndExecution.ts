/**
 * stageBV4ArchiveAuditAndExecution.ts
 *
 * Stage B Execution, Raw Archive Auditing, and Analysis Engine for
 * PAPER_6_C1_POTENTIATION_GRAMMAR_V4.
 *
 * Requirements:
 *  1. Release Boundary Seal: Cryptographically binds the authoritative preflight
 *     manifest (81ca4ae61c6b3e839e557bfa3eec81cb28a8d052fcb025dc4bfa56a655762024),
 *     the provisional preflight manifest (d3025782c08658ef2a86d3a587a7079346f3030533852a424ec8d846c28ef946),
 *     and the immutable V3 closed archive chain.
 *  2. Matrix Denominator: Exactly 3,636 replays and 654,480 raw step records.
 *  3. Raw-First Archiving: Every replay record is sealed and appended to the raw digest chain
 *     before aggregate scoring.
 *  4. Strict Non-Authorising Execution: Returns the complete raw-bound audit ledger,
 *     per-condition distributions, JSD comparisons, and empirical findings.
 *     Does NOT issue a Master Archival Seal (release held pending user review).
 */

import { canonicalSha256 } from '../lib/sha256';
import {
  PAPER_6_C1_POTENTIATION_GRAMMAR_V4,
  V3_CLOSED_ARCHIVE_BINDING,
  V4_CONDITIONS,
  V4_SOURCE_SEEDS,
  V4_BRANCH_SEEDS,
  V4_LOWER_DEPTH,
  V4_UPPER_DEPTH,
  V4_OBSERVATION_STEPS,
  V4_DEGREE_PRESERVING_NULL_COUNT,
  V4_TOPOLOGY_COUNT,
  v4ConditionCount,
  expectedV4ReplayCount,
  expectedV4RawStepCount,
  v4Replacements,
  assertV4ArchiveBinding,
  assertTemporalTranspositionV4Adapter,
  analyseV4TemporalTransposition,
  type V4ConditionId,
  type V4Condition,
  type V4ArchiveBinding,
  type V4RawReplayRecord,
  type V4ArchivedReplay,
  type V4ArchiveReceipt,
  type V4Analysis,
} from './Paper6C1PotentiationGrammarV4';
import {
  Paper6C1PotentiationGrammarV4Preflight,
} from './Paper6C1PotentiationGrammarV4Preflight';
import {
  LiveC1NativeReplayAdapter,
  CompleteCheckpointPayload,
  SealedPhaseResolvedChallenge,
  EVEN_POLES,
} from './LiveC1NativeReplayAdapter';
import {
  CheckpointSealForReplay,
  RegimeDistribution,
  RegimeObservation,
  jensenShannonBits,
} from './Paper6C1ReplayAtlasV1';
import { AmeliaNumogramSubstrateRuntime } from '../substrate/ameliaNumogramSubstrateRuntime';

export const PROVISIONAL_PREFLIGHT_MANIFEST_DIGEST = 'd3025782c08658ef2a86d3a587a7079346f3030533852a424ec8d846c28ef946';
export const AUTHORITATIVE_PREFLIGHT_MANIFEST_DIGEST = '81ca4ae61c6b3e839e557bfa3eec81cb28a8d052fcb025dc4bfa56a655762024';

export interface V4ReleaseBoundarySealPayload {
  protocolId: string;
  authoritativePreflightManifestDigest: string;
  provisionalPreflightManifestDigest: string;
  v3ArchiveBinding: {
    authoritativePreflightSeal: string;
    archiveManifestDigest: string;
    rawReplayDigestChain: string;
    masterArchivalSeal: string;
  };
  matrixDimensions: {
    conditions: number;
    sourceSeeds: readonly number[];
    topologies: number;
    branchSeeds: readonly number[];
    totalReplays: number;
    rawStepRecords: number;
  };
  conditions: readonly {
    id: string;
    role: string;
    kernel: readonly number[];
  }[];
}

export interface V4RawReplayArchiveManifest {
  protocolId: string;
  executionId: string;
  releaseBoundarySeal: string;
  totalReplaysArchived: number;
  totalRawStepsArchived: number;
  sourceSeeds: readonly number[];
  branchSeeds: readonly number[];
  replaysDigestChain: string;
  archiveManifestDigest: string;
}

export interface V4ExecutionAuditReport {
  protocolId: string;
  executionId: string;
  executionTimestamp: string;
  disposition: 'V4_EXECUTION_COMPLETED_HELD_FOR_REVIEW';
  releaseBoundarySeal: string;
  provisionalPreflightManifest: string;
  authoritativePreflightManifest: string;
  matrixVerification: {
    conditionsCount: number;
    sourceSeedsCount: number;
    topologiesCount: number;
    branchSeedsCount: number;
    totalReplaysAudited: number;
    totalRawStepsAudited: number;
    observationStepsPerReplay: number;
    archiveManifestDigest: string;
    rawReplaysDigestChain: string;
  };
  conditioningIntervalAudits: {
    sourceSeed: number;
    conditionId: string;
    appliedReplacementsCount: number;
    auditPassed: boolean;
  }[];
  analysis: V4Analysis;
  empiricalSummary: {
    neutralReproduced: boolean;
    nativeRescueReproduced: boolean;
    earlyPortability: {
      allSourceSeedsMatchV3Native: boolean;
      minimumPerSeedJsd: number;
      perSeedModalMatch: Record<number, boolean>;
    };
    latePortability: {
      allSourceSeedsMatchV3Native: boolean;
      minimumPerSeedJsd: number;
      perSeedModalMatch: Record<number, boolean>;
    };
    conclusion: string;
  };
}

export class StageBV4ArchiveAuditor {
  private adapter: LiveC1NativeReplayAdapter;

  constructor() {
    this.adapter = new LiveC1NativeReplayAdapter();
  }

  /**
   * Generates the immutable V4 Release-Boundary Seal.
   */
  public generateReleaseBoundarySeal(): {
    releaseBoundarySeal: string;
    payload: V4ReleaseBoundarySealPayload;
  } {
    const payload: V4ReleaseBoundarySealPayload = {
      protocolId: PAPER_6_C1_POTENTIATION_GRAMMAR_V4.protocolId,
      authoritativePreflightManifestDigest: AUTHORITATIVE_PREFLIGHT_MANIFEST_DIGEST,
      provisionalPreflightManifestDigest: PROVISIONAL_PREFLIGHT_MANIFEST_DIGEST,
      v3ArchiveBinding: {
        authoritativePreflightSeal: V3_CLOSED_ARCHIVE_BINDING.authoritativePreflightSeal,
        archiveManifestDigest: V3_CLOSED_ARCHIVE_BINDING.archiveManifestDigest,
        rawReplayDigestChain: V3_CLOSED_ARCHIVE_BINDING.rawReplayDigestChain,
        masterArchivalSeal: V3_CLOSED_ARCHIVE_BINDING.masterArchivalSeal,
      },
      matrixDimensions: {
        conditions: v4ConditionCount(),
        sourceSeeds: V4_SOURCE_SEEDS,
        topologies: V4_TOPOLOGY_COUNT,
        branchSeeds: V4_BRANCH_SEEDS,
        totalReplays: expectedV4ReplayCount(),
        rawStepRecords: expectedV4RawStepCount(),
      },
      conditions: V4_CONDITIONS.map((c) => ({
        id: c.id,
        role: c.role,
        kernel: c.kernel,
      })),
    };

    const releaseBoundarySeal = canonicalSha256(JSON.stringify(payload));
    return { releaseBoundarySeal, payload };
  }

  /**
   * Executes the complete fixed V4 Matrix (3,636 replays / 654,480 raw steps),
   * builds the raw-first archive chain, verifies every record, and scores the assay.
   */
  public async executeAndAuditV4Matrix(): Promise<{
    auditReport: V4ExecutionAuditReport;
    archivedReplays: readonly V4ArchivedReplay[];
    manifest: V4RawReplayArchiveManifest;
  }> {
    const preflightEngine = new Paper6C1PotentiationGrammarV4Preflight();
    const preflightManifest = await preflightEngine.runFullPreflight();
    const archiveBinding = await preflightEngine.constructV4ArchiveBinding();
    const { neutralD72BySeed, neutralD108BySeed } = await preflightEngine.generateSealedNeutralCheckpoints();

    assertV4ArchiveBinding(archiveBinding);
    assertTemporalTranspositionV4Adapter(this.adapter);

    const { releaseBoundarySeal } = this.generateReleaseBoundarySeal();
    const executionId = `V4-EXEC-${canonicalSha256(releaseBoundarySeal).slice(0, 12)}`;
    const executionTimestamp = new Date().toISOString();

    const rawReplays: V4ArchivedReplay[] = [];
    let rollingRawDigestChain = canonicalSha256(`V4-CHAIN-INIT-${releaseBoundarySeal}`);

    const conditioningIntervalAudits: {
      sourceSeed: number;
      conditionId: string;
      appliedReplacementsCount: number;
      auditPassed: boolean;
    }[] = [];

    // Execute across all 3 source seeds
    for (const sourceSeed of V4_SOURCE_SEEDS) {
      const lowerCheckpoint = neutralD72BySeed[sourceSeed];

      // Topology ensemble: N0 + 100 Nulls
      await this.adapter.hydrateCompleteCheckpoint(lowerCheckpoint);
      const nativeTopology = await this.adapter.captureTopology();
      const nulls = await this.adapter.createDegreePreservingNulls({
        topology: nativeTopology,
        count: V4_DEGREE_PRESERVING_NULL_COUNT,
        namespace: `P6-V4-${executionId}-source-${sourceSeed}`,
      });
      const topologyCohort = [
        { kind: 'N0' as const, index: 0, topology: nativeTopology },
        ...nulls.map((t, i) => ({ kind: 'DEGREE_PRESERVING_NULL' as const, index: i + 1, topology: t })),
      ];

      // Execute each of the 4 conditions
      for (const condition of V4_CONDITIONS) {
        const replacements = v4Replacements(condition.id);

        const conditioningCheckpoint = condition.id === 'NEUTRAL_REFERENCE'
          ? neutralD108BySeed[sourceSeed]
          : await this.adapter.replayConditioningIntervalWithReplacements({
              lowerCheckpoint,
              upperDepth: V4_UPPER_DEPTH,
              replacements,
            });

        const conditioningAudit = await this.adapter.auditConditioningIntervalReplay({
          lowerCheckpoint,
          upperCheckpoint: conditioningCheckpoint,
          upperDepth: V4_UPPER_DEPTH,
          replacements,
        });

        const auditPassed = conditioningAudit.eventCountPreserved &&
          conditioningAudit.nonReplacedEventDigestsPreserved &&
          conditioningAudit.blockTimingPreserved &&
          conditioningAudit.fluxAndStrainPreserved &&
          conditioningAudit.topologyPreserved &&
          conditioningAudit.nonTopologyStatePreserved;

        if (!auditPassed) {
          throw new Error(`[V4 Fail-Closed] Interval audit failed for seed ${sourceSeed} / condition ${condition.id}`);
        }

        conditioningIntervalAudits.push({
          sourceSeed,
          conditionId: condition.id,
          appliedReplacementsCount: replacements.length,
          auditPassed,
        });

        // Downstream challenge replays across 101 topologies × 3 branch seeds
        for (const topology of topologyCohort) {
          for (const branchSeed of V4_BRANCH_SEEDS) {
            // 1. Hydrate upper conditioning checkpoint
            await this.adapter.hydrateCompleteCheckpoint(conditioningCheckpoint);
            // 2. Apply topology
            await this.adapter.applyTopology(topology.topology);
            // 3. Restore branch PRNG
            await this.adapter.restoreBranchPrng({ sourceSeed, branchSeed });
            // 4. Set guidance OFF & suppress relay steering
            await this.adapter.setGuidanceOffAndSuppressRelaySteering();

            // 5. Sealed phase-resolved challenge
            const challenge = await this.adapter.createSealedPhaseResolvedChallenge({ sourceSeed, branchSeed });
            const phaseResolvedChallengeDigest = challenge.challengeDigest;

            // 6. Run 180 observation steps
            const rawSteps: unknown[] = [];
            let stepChain = '';
            for (let stepIndex = 0; stepIndex < V4_OBSERVATION_STEPS; stepIndex++) {
              await this.adapter.applyPhaseResolvedChallengeStep(challenge, stepIndex);
              const stepRecord = await this.adapter.stepAndObserve(stepIndex);
              rawSteps.push(stepRecord);
              stepChain = canonicalSha256(`${stepChain}:${stepRecord.stepDigest}`);
            }

            // 7. Full trajectory regime classification
            const regime = await this.adapter.classifyFullTrajectory(rawSteps);

            const record: V4RawReplayRecord = {
              protocolId: PAPER_6_C1_POTENTIATION_GRAMMAR_V4.protocolId,
              executionId,
              sourceSeed,
              conditionId: condition.id,
              replacementBlocks: condition.kernel,
              topologyKind: topology.kind,
              topologyIndex: topology.index,
              branchSeed,
              lowerCheckpointDigest: lowerCheckpoint.checkpointDigest,
              conditioningCheckpointDigest: conditioningCheckpoint.checkpointDigest,
              conditioningAudit,
              phaseResolvedChallengeDigest,
              rawSteps,
              regime,
            };

            const recordDigest = canonicalSha256(JSON.stringify({
              protocolId: record.protocolId,
              executionId: record.executionId,
              sourceSeed: record.sourceSeed,
              conditionId: record.conditionId,
              topologyIndex: record.topologyIndex,
              branchSeed: record.branchSeed,
              stepChain,
              regimeDigest: canonicalSha256(JSON.stringify(regime)),
            }));

            const receipt: V4ArchiveReceipt = {
              recordId: `P6-V4-${executionId}-${sourceSeed}-${condition.id}-${topology.index}-${branchSeed}`,
              recordDigest,
            };

            rollingRawDigestChain = canonicalSha256(`${rollingRawDigestChain}:${recordDigest}`);
            rawReplays.push({ record, receipt });
          }
        }
      }
    }

    // Matrix denominator assertions
    if (rawReplays.length !== expectedV4ReplayCount()) {
      throw new Error(`[V4 Fail-Closed Denominator Error] Expected 3,636 replays, got ${rawReplays.length}`);
    }

    const totalRawSteps = rawReplays.reduce((acc, r) => acc + r.record.rawSteps.length, 0);
    if (totalRawSteps !== expectedV4RawStepCount()) {
      throw new Error(`[V4 Fail-Closed Step Denominator Error] Expected 654,480 raw steps, got ${totalRawSteps}`);
    }

    // Raw-first scoring analysis
    const analysis = analyseV4TemporalTransposition(rawReplays, archiveBinding);

    // Compute Raw Replay Archive Manifest
    const archiveManifestPayload = {
      protocolId: PAPER_6_C1_POTENTIATION_GRAMMAR_V4.protocolId,
      executionId,
      releaseBoundarySeal,
      totalReplaysArchived: rawReplays.length,
      totalRawStepsArchived: totalRawSteps,
      sourceSeeds: V4_SOURCE_SEEDS,
      branchSeeds: V4_BRANCH_SEEDS,
      replaysDigestChain: rollingRawDigestChain,
    };
    const archiveManifestDigest = canonicalSha256(JSON.stringify(archiveManifestPayload));

    const manifest: V4RawReplayArchiveManifest = {
      ...archiveManifestPayload,
      archiveManifestDigest,
    };

    const earlyComp = analysis.comparisons.find((c) => c.conditionId === 'EARLY_76_84')!;
    const lateComp = analysis.comparisons.find((c) => c.conditionId === 'LATE_92_100')!;

    const auditReport: V4ExecutionAuditReport = {
      protocolId: PAPER_6_C1_POTENTIATION_GRAMMAR_V4.protocolId,
      executionId,
      executionTimestamp,
      disposition: 'V4_EXECUTION_COMPLETED_HELD_FOR_REVIEW',
      releaseBoundarySeal,
      provisionalPreflightManifest: PROVISIONAL_PREFLIGHT_MANIFEST_DIGEST,
      authoritativePreflightManifest: AUTHORITATIVE_PREFLIGHT_MANIFEST_DIGEST,
      matrixVerification: {
        conditionsCount: v4ConditionCount(),
        sourceSeedsCount: V4_SOURCE_SEEDS.length,
        topologiesCount: V4_TOPOLOGY_COUNT,
        branchSeedsCount: V4_BRANCH_SEEDS.length,
        totalReplaysAudited: rawReplays.length,
        totalRawStepsAudited: totalRawSteps,
        observationStepsPerReplay: V4_OBSERVATION_STEPS,
        archiveManifestDigest,
        rawReplaysDigestChain: rollingRawDigestChain,
      },
      conditioningIntervalAudits,
      analysis,
      empiricalSummary: {
        neutralReproduced: analysis.neutralReferenceReproduced,
        nativeRescueReproduced: analysis.neutralRemainsDistinctFromNative &&
          (analysis.comparisons.find((c) => c.conditionId === 'NATIVE_84_92_REFERENCE')?.allSourceSeedsMatchV3Native ?? false),
        earlyPortability: {
          allSourceSeedsMatchV3Native: earlyComp.allSourceSeedsMatchV3Native,
          minimumPerSeedJsd: earlyComp.minimumPerSeedJsdToV3Native,
          perSeedModalMatch: {
            101: earlyComp.perSeed[101].modalMatch,
            202: earlyComp.perSeed[202].modalMatch,
            303: earlyComp.perSeed[303].modalMatch,
          },
        },
        latePortability: {
          allSourceSeedsMatchV3Native: lateComp.allSourceSeedsMatchV3Native,
          minimumPerSeedJsd: lateComp.minimumPerSeedJsdToV3Native,
          perSeedModalMatch: {
            101: lateComp.perSeed[101].modalMatch,
            202: lateComp.perSeed[202].modalMatch,
            303: lateComp.perSeed[303].modalMatch,
          },
        },
        conclusion: analysis.conclusion,
      },
    };

    return {
      auditReport,
      archivedReplays: rawReplays,
      manifest,
    };
  }
}
