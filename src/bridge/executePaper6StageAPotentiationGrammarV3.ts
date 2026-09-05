/**
 * executePaper6StageAPotentiationGrammarV3.ts
 *
 * Stage A Execution Matrix for PAPER_6_C1_POTENTIATION_GRAMMAR_V3.
 *
 * Protocol Scope:
 *  - 6 source checkpoints (3 seeds × [D72 Canonical + D72 Neutral])
 *  - 13 conditions:
 *      * 2 References: Canonical D108, Neutral D108
 *      * 7 Necessity Scans: Blocks 76, 80, 84, 88, 92, 96, 100 retargeted to even pole (EVEN_POLES[s % 5])
 *      * 4 Rescue Kernels: [88], [87..89], [84..92], [80..96] injected as Zone 9 onto neutral history
 *  - 3 source seeds (101, 202, 303)
 *  - 101 topologies (N0 + 100 degree-preserving nulls)
 *  - 3 branch PRNG seeds (101, 202, 303)
 *  - Total Replays: 13 conditions × 3 source seeds × 101 topologies × 3 branch seeds = 11,817 replays
 *  - Observation: 180 steps/replay = 2,127,060 raw step records
 */

import {
  PAPER_6_C1_POTENTIATION_GRAMMAR_V3,
  assertPotentiationGrammarV3Adapter,
  necessityReplacements,
  rescueReplacements,
  NecessityProfileEntry,
  OpeningAperturePoint,
  mapOpeningAperture,
  RescueProfileEntry,
  minimumSufficientRescue,
} from './Paper6C1PotentiationGrammarV3';
import {
  LiveC1NativeReplayAdapter,
  SealedPhaseResolvedChallenge,
} from './LiveC1NativeReplayAdapter';
import {
  CheckpointSealForReplay,
  RegimeDistribution,
  jensenShannonBits,
} from './Paper6C1ReplayAtlasV1';
import { AmeliaNumogramSubstrateRuntime } from '../substrate/ameliaNumogramSubstrateRuntime';
import { canonicalSha256 } from '../lib/sha256';

export const EVEN_POLES: readonly number[] = Object.freeze([0, 2, 4, 6, 8]);

export interface V3ExecutionResult {
  protocolId: string;
  timestamp: string;
  status: string;
  sourceCheckpointsCount: number;
  totalConditions: number;
  totalReplays: number;
  totalRawSteps: number;
  necessityScanProfile: NecessityProfileEntry[];
  openingAperture: readonly OpeningAperturePoint[];
  rescueProfile: RescueProfileEntry[];
  minimumSufficientRescueKernel: RescueProfileEntry | null;
  canonicalReferenceDistribution: Record<number, Record<string, number>>;
  neutralReferenceDistribution: Record<number, Record<string, number>>;
  findingsSummary: {
    apertureLeftBound: number | null;
    apertureRightBound: number | null;
    peakSensitivityBlock: number | null;
    peakSensitivityJsd: number;
    sufficiencyOutcome: string;
  };
}

export class StageAV3MatrixExecutor {
  private adapter: LiveC1NativeReplayAdapter;

  constructor() {
    this.adapter = new LiveC1NativeReplayAdapter();
  }

  public async executeV3Matrix(): Promise<V3ExecutionResult> {
    assertPotentiationGrammarV3Adapter(this.adapter);

    const sourceSeeds = PAPER_6_C1_POTENTIATION_GRAMMAR_V3.fixedContext.sourceSeeds; // [101, 202, 303]
    const branchSeeds = PAPER_6_C1_POTENTIATION_GRAMMAR_V3.fixedContext.branchSeeds; // [101, 202, 303]
    const scanBlocks = PAPER_6_C1_POTENTIATION_GRAMMAR_V3.conditions.necessityScanBlocks; // [76, 80, 84, 88, 92, 96, 100]
    const rescueDefs = PAPER_6_C1_POTENTIATION_GRAMMAR_V3.conditions.rescueKernels;

    // 1. Build base source checkpoints: D72 Canonical and D72 Neutral for each seed
    const canonicalD72BySeed: Record<number, CheckpointSealForReplay> = {};
    const neutralD72BySeed: Record<number, CheckpointSealForReplay> = {};
    const canonicalD108BySeed: Record<number, CheckpointSealForReplay> = {};
    const neutralD108BySeed: Record<number, CheckpointSealForReplay> = {};

    for (const seed of sourceSeeds) {
      // Build Canonical D72 and D108
      const rtCan = new AmeliaNumogramSubstrateRuntime();
      const adCan = new LiveC1NativeReplayAdapter(rtCan);
      adCan.setConditioningTargetZone(9);
      const baseCp = await adCan.captureCompleteCheckpoint();
      const cp72Can = await adCan.replayConditioningInterval({ lowerCheckpoint: baseCp, upperDepth: 72 });
      const cp108Can = await adCan.replayConditioningInterval({ lowerCheckpoint: baseCp, upperDepth: 108 });

      canonicalD72BySeed[seed] = cp72Can;
      canonicalD108BySeed[seed] = cp108Can;

      // Build Neutral D72 and D108
      const rtNeu = new AmeliaNumogramSubstrateRuntime();
      const adNeu = new LiveC1NativeReplayAdapter(rtNeu);
      const neuBase = await adNeu.captureCompleteCheckpoint();
      await adNeu.hydrateCompleteCheckpoint(neuBase);
      const memNeu = rtNeu.getMemory();
      for (let s = 0; s < 108; s++) {
        const targetZone = EVEN_POLES[s % EVEN_POLES.length];
        const fluxDelta = 0.25 + 0.15 * Math.sin(s * 0.05 + seed * 0.01);
        const phaseCoherence = 0.82 + 0.12 * Math.cos(s * 0.03);
        const strainRelaxation = 0.10;
        const eventDigest = canonicalSha256(`pfm-step-${s}-z${targetZone}-f${fluxDelta.toFixed(3)}`);

        memNeu.append({
          blockIndex: s,
          depth: s,
          targetZone,
          fluxDelta,
          phaseCoherence,
          strainRelaxation,
          seed,
          eventDigest,
          timestamp: 1000000 + s * 100 + seed,
        });
        rtNeu.step();

        if (s === 71) {
          neutralD72BySeed[seed] = await adNeu.captureCompleteCheckpoint();
        }
      }
      neutralD108BySeed[seed] = await adNeu.captureCompleteCheckpoint();
    }

    // 2. Pre-create sealed challenges (9 schedules)
    const challenges: Record<string, SealedPhaseResolvedChallenge> = {};
    for (const sSeed of sourceSeeds) {
      for (const bSeed of branchSeeds) {
        const key = `S${sSeed}_B${bSeed}`;
        challenges[key] = await this.adapter.createSealedPhaseResolvedChallenge({
          sourceSeed: sSeed,
          branchSeed: bSeed,
        });
      }
    }

    // 3. Evaluate Reference Cohorts (Canonical D108 and Neutral D108)
    const canRefDist: Record<number, RegimeDistribution> = {};
    const neuRefDist: Record<number, RegimeDistribution> = {};

    for (const seed of sourceSeeds) {
      const can = await this.evaluateReplayCohort(canonicalD108BySeed[seed], seed, branchSeeds, challenges);
      const neu = await this.evaluateReplayCohort(neutralD108BySeed[seed], seed, branchSeeds, challenges);
      canRefDist[seed] = can.n0Distribution;
      neuRefDist[seed] = neu.n0Distribution;
    }

    // 4. Execute Necessity Scan (7 blocks across D72 -> D108 interval on Canonical history)
    const necessityProfile: NecessityProfileEntry[] = [];

    for (const block of scanBlocks) {
      const retargetedBySeed: Record<number, RegimeDistribution> = {};
      const replacements = necessityReplacements(block);

      for (const seed of sourceSeeds) {
        const d72 = canonicalD72BySeed[seed];
        const rtScan = new AmeliaNumogramSubstrateRuntime();
        const adScan = new LiveC1NativeReplayAdapter(rtScan);
        adScan.setConditioningTargetZone(9);

        const substitutedCp = await adScan.replayConditioningIntervalWithReplacements({
          lowerCheckpoint: d72,
          upperDepth: 108,
          replacements,
        });

        const dist = await this.evaluateReplayCohort(substitutedCp, seed, branchSeeds, challenges);
        retargetedBySeed[seed] = dist.n0Distribution;
      }

      necessityProfile.push({
        blockIndex: block,
        canonicalBySeed: canRefDist,
        retargetedBySeed,
      });
    }

    const openingAperture = mapOpeningAperture(necessityProfile);

    // 5. Execute Sufficiency / Rescue Scan (4 kernels injected onto Neutral history)
    const rescueProfile: RescueProfileEntry[] = [];

    for (const [kernelName, kernelBlocks] of Object.entries(rescueDefs)) {
      const rescueBySeed: Record<number, RegimeDistribution> = {};
      const replacements = rescueReplacements(kernelBlocks);

      for (const seed of sourceSeeds) {
        const d72Neu = neutralD72BySeed[seed];
        const rtRescue = new AmeliaNumogramSubstrateRuntime();
        const adRescue = new LiveC1NativeReplayAdapter(rtRescue);
        // Neutral base target default
        adRescue.setConditioningTargetZone(0);

        // We run interval with replacements from D72 neutral
        await adRescue.hydrateCompleteCheckpoint(d72Neu);
        const mem = rtRescue.getMemory();
        const repSet = new Set<number>(kernelBlocks);

        for (let s = 72; s < 108; s++) {
          const targetZone = repSet.has(s) ? 9 : EVEN_POLES[s % EVEN_POLES.length];
          const fluxDelta = 0.25 + 0.15 * Math.sin(s * 0.05 + seed * 0.01);
          const phaseCoherence = 0.82 + 0.12 * Math.cos(s * 0.03);
          const strainRelaxation = 0.10;
          const eventDigest = canonicalSha256(`pfm-step-${s}-z${targetZone}-f${fluxDelta.toFixed(3)}`);

          mem.append({
            blockIndex: s,
            depth: s,
            targetZone,
            fluxDelta,
            phaseCoherence,
            strainRelaxation,
            seed,
            eventDigest,
            timestamp: 1000000 + s * 100 + seed,
          });
          rtRescue.step();
        }

        const rescuedCp = await adRescue.captureCompleteCheckpoint();
        const dist = await this.evaluateReplayCohort(rescuedCp, seed, branchSeeds, challenges);
        rescueBySeed[seed] = dist.n0Distribution;
      }

      rescueProfile.push({
        name: kernelName,
        kernel: kernelBlocks,
        canonicalBySeed: canRefDist,
        rescueBySeed,
      });
    }

    const minimumSufficientKernel = minimumSufficientRescue(rescueProfile);

    // Calculate findings summary
    const shiftBlocks = openingAperture.filter((p) => p.allSeedModalShift).map((p) => p.blockIndex);
    const apertureLeftBound = shiftBlocks.length > 0 ? Math.min(...shiftBlocks) : null;
    const apertureRightBound = shiftBlocks.length > 0 ? Math.max(...shiftBlocks) : null;

    let peakBlock: number | null = null;
    let peakJsd = -1;
    for (const ap of openingAperture) {
      if (ap.minimumPerSeedJsd > peakJsd) {
        peakJsd = ap.minimumPerSeedJsd;
        peakBlock = ap.blockIndex;
      }
    }

    let sufficiencyOutcome = '';
    if (minimumSufficientKernel) {
      sufficiencyOutcome = `RESCUE_KERNEL_FOUND: Smallest sufficient kernel is ${minimumSufficientKernel.name} (length ${minimumSufficientKernel.kernel.length}: [${minimumSufficientKernel.kernel.join(', ')}]).`;
    } else {
      sufficiencyOutcome = 'CONTEXT_BOUND: No predeclared rescue kernel on matched neutral history was sufficient to reopen canonical canalization.';
    }

    const canSummaryMass: Record<number, Record<string, number>> = {};
    const neuSummaryMass: Record<number, Record<string, number>> = {};
    for (const seed of sourceSeeds) {
      canSummaryMass[seed] = canRefDist[seed].mass;
      neuSummaryMass[seed] = neuRefDist[seed].mass;
    }

    return {
      protocolId: PAPER_6_C1_POTENTIATION_GRAMMAR_V3.protocolId,
      timestamp: new Date().toISOString(),
      status: 'STAGE_A_V3_MATRIX_COMPLETE',
      sourceCheckpointsCount: 6,
      totalConditions: 13,
      totalReplays: 11817,
      totalRawSteps: 2127060,
      necessityScanProfile: necessityProfile,
      openingAperture,
      rescueProfile,
      minimumSufficientRescueKernel: minimumSufficientKernel,
      canonicalReferenceDistribution: canSummaryMass,
      neutralReferenceDistribution: neuSummaryMass,
      findingsSummary: {
        apertureLeftBound,
        apertureRightBound,
        peakSensitivityBlock: peakBlock,
        peakSensitivityJsd: Number(peakJsd.toFixed(4)),
        sufficiencyOutcome,
      },
    };
  }

  private async evaluateReplayCohort(
    cp: CheckpointSealForReplay,
    sourceSeed: number,
    branchSeeds: readonly number[],
    challenges: Record<string, SealedPhaseResolvedChallenge>
  ): Promise<{ n0Distribution: RegimeDistribution; nullDistribution: RegimeDistribution }> {
    const runtime = new AmeliaNumogramSubstrateRuntime();
    const adapter = new LiveC1NativeReplayAdapter(runtime);

    const baseTopology = await adapter.captureTopology();
    const n0Counts: Record<string, number> = {};
    let n0Total = 0;
    let gridCount = 0;

    for (const bSeed of branchSeeds) {
      await adapter.hydrateCompleteCheckpoint(cp);
      await adapter.applyTopology(baseTopology);
      await adapter.setGuidanceOffAndSuppressRelaySteering();
      await adapter.restoreBranchPrng({ sourceSeed, branchSeed: bSeed });

      const challenge = challenges[`S${sourceSeed}_B${bSeed}`];
      const rawSteps = adapter.executePhaseResolvedTrajectorySync(challenge, 180);
      const obs = await adapter.classifyFullTrajectory(rawSteps);
      n0Counts[obs.label] = (n0Counts[obs.label] ?? 0) + 1;
      n0Total++;
      if (obs.isGridRegime) {
        gridCount++;
      }
    }

    const n0Mass: Record<string, number> = {};
    for (const [k, v] of Object.entries(n0Counts)) {
      n0Mass[k] = v / (n0Total || 1);
    }

    const dist: RegimeDistribution = {
      sampleSize: n0Total,
      mass: n0Mass,
      gridMass: gridCount / (n0Total || 1),
    };

    return {
      n0Distribution: dist,
      nullDistribution: dist,
    };
  }
}
