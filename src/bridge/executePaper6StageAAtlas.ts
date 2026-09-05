/**
 * executePaper6StageAAtlas.ts
 *
 * Full-scale executor for Stage A of the PAPER_6_C1_REPLAY_ATLAS_V1 protocol.
 * Bound to the Live C1 Substrate Native Replay Adapter.
 *
 * Release Boundary: Preflight SHA-256 Seal 22680a1989c5322866607c0103a7e78b89c4d7bfaf027ab6b711f95803776841
 */

import {
  PAPER_6_C1_REPLAY_ATLAS_V1,
  CheckpointSealForReplay,
  RegimeObservation,
  RegimeDistribution,
  distributionFromRegimes,
  jensenShannonBits,
  DepthDistributionBySeed,
  selectSharpReplayInterval,
  selectPotentiatingEvent,
  engineeredReplacementTarget,
  PFMEventForReplay,
} from './Paper6C1ReplayAtlasV1';
import {
  LiveC1NativeReplayAdapter,
  RawTrajectoryStepRecord,
} from './LiveC1NativeReplayAdapter';
import { canonicalSha256 } from '../lib/sha256';

export const STAGE_A_PREFLIGHT_BOUNDARY_SEAL = '22680a1989c5322866607c0103a7e78b89c4d7bfaf027ab6b711f95803776841';

export interface StageAReplayManifest {
  manifestId: string;
  sourceSeed: number;
  depth: number;
  topologyKind: 'N0' | 'NULL';
  topologyIndex: number; // 0 for N0, 1..100 for Null
  branchSeed: number;
  checkpointDigest: string;
  challengeDigest: string;
  trajectoryDigest: string;
  regime: RegimeObservation;
}

export interface NullEnsembleStats {
  depth: number;
  sourceSeed: number;
  sampleSize: number;
  meanGridMass: number;
  p95GridMass: number;
  regimeMassP95: Record<string, number>;
  regimeMassDistribution: RegimeDistribution;
}

export interface GridMapEntry {
  depth: number;
  gridMassBySeed: Record<number, number>;
  gridHolds: boolean;
  meanGridMass: number;
  nullEnsembleMeanGridMass: number;
}

export interface FutureAvailabilityObservation {
  depth: number;
  regimeLabel: string;
  isObservedNewlyAvailable: boolean;
  n0BranchCountBySeed: Record<number, number>;
  d0Present: boolean;
  exceedsNullP95BySeed: Record<number, boolean>;
  n0MassBySeed: Record<number, number>;
  nullP95MassBySeed: Record<number, number>;
}

export interface StageAExecutionResults {
  protocolId: string;
  preflightBoundarySeal: string;
  timestamp: string;
  checkpointsCount: number;
  replayManifestsCount: number;
  rawStepRecordsCount: number;
  sealedSourceCheckpoints: CheckpointSealForReplay[];
  depthDistributions: DepthDistributionBySeed[];
  nullEnsembles: NullEnsembleStats[];
  gridHoldMap: GridMapEntry[];
  firstContractionDepth: number | null;
  futureAvailability: FutureAvailabilityObservation[];
  selectedSharpInterval: ReturnType<typeof selectSharpReplayInterval>;
  selectedPotentiatingEvent: PFMEventForReplay | null;
  engineeredTargetZone: number | null;
  stageAArchiveSeal: string;
}

export class StageAAtlasExecutor {
  private adapter: LiveC1NativeReplayAdapter;

  constructor(adapter?: LiveC1NativeReplayAdapter) {
    this.adapter = adapter ?? new LiveC1NativeReplayAdapter();
  }

  public async executeStageA(
    onProgress?: (progress: { phase: string; percent: number; details: string }) => void
  ): Promise<StageAExecutionResults> {
    const protocol = PAPER_6_C1_REPLAY_ATLAS_V1;
    const sourceSeeds = protocol.source.sourceSeeds;
    const depths = protocol.source.checkpointDepths;
    const branchSeeds = protocol.downstream.branchSeeds;
    const nullCount = protocol.downstream.degreePreservingNullCount;

    onProgress?.({
      phase: 'CHECKPOINT_HARVESTING',
      percent: 0,
      details: 'Generating 27 sealed canonical source checkpoints across 9 depths...',
    });

    // 1. Generate and seal the 27 source checkpoints
    const sealedSourceCheckpoints: CheckpointSealForReplay[] = [];
    const checkpointsBySeedAndDepth: Map<string, CheckpointSealForReplay> = new Map();

    for (let sIdx = 0; sIdx < sourceSeeds.length; sIdx++) {
      const seed = sourceSeeds[sIdx];
      // Initialize a fresh adapter runtime for each seed
      const seedAdapter = new LiveC1NativeReplayAdapter();
      // Restore initial seed state
      await seedAdapter.restoreBranchPrng({ sourceSeed: seed, branchSeed: seed });

      // Depth 0 checkpoint
      const d0Checkpoint = await seedAdapter.captureCompleteCheckpoint();
      sealedSourceCheckpoints.push(d0Checkpoint);
      checkpointsBySeedAndDepth.set(`${seed}-0`, d0Checkpoint);

      let prevCheckpoint = d0Checkpoint;
      for (let dIdx = 1; dIdx < depths.length; dIdx++) {
        const targetDepth = depths[dIdx];
        const conditionedCheckpoint = await seedAdapter.replayConditioningInterval({
          lowerCheckpoint: prevCheckpoint,
          upperDepth: targetDepth,
        });
        sealedSourceCheckpoints.push(conditionedCheckpoint);
        checkpointsBySeedAndDepth.set(`${seed}-${targetDepth}`, conditionedCheckpoint);
        prevCheckpoint = conditionedCheckpoint;
      }
    }

    if (sealedSourceCheckpoints.length !== 27) {
      throw new Error(`Stage A integrity failure: expected 27 source checkpoints, got ${sealedSourceCheckpoints.length}`);
    }

    onProgress?.({
      phase: 'REPLAY_MATRIX_EXECUTION',
      percent: 10,
      details: 'Executing 8,181 replays (1,472,580 raw step records)...',
    });

    // 2. Execute 8,181 Replays (27 checkpoints * 101 topologies * 3 branch seeds)
    const manifests: StageAReplayManifest[] = [];
    let totalStepsProduced = 0;

    // Cache degree-preserving null topologies per checkpoint
    const topologiesByCheckpoint: Map<string, { n0: unknown; nulls: readonly unknown[] }> = new Map();
    for (const chk of sealedSourceCheckpoints) {
      const top = (chk.payload as any).gates;
      const nulls = await this.adapter.createDegreePreservingNulls({
        topology: top,
        count: nullCount,
        namespace: `stage-a-nulls-${chk.checkpointId}`,
      });
      topologiesByCheckpoint.set(chk.checkpointId, { n0: top, nulls });
    }

    // Regimes mapped by depth -> sourceSeed -> { n0: RegimeObservation[], nulls: RegimeObservation[] }
    const regimesByDepthAndSeed: Map<
      number,
      Map<number, { n0Regimes: RegimeObservation[]; nullRegimes: RegimeObservation[] }>
    > = new Map();

    for (const d of depths) {
      const seedMap = new Map<number, { n0Regimes: RegimeObservation[]; nullRegimes: RegimeObservation[] }>();
      for (const s of sourceSeeds) {
        seedMap.set(s, { n0Regimes: [], nullRegimes: [] });
      }
      regimesByDepthAndSeed.set(d, seedMap);
    }

    // Progress counter
    let completedReplays = 0;
    const totalReplays = sourceSeeds.length * depths.length * (1 + nullCount) * branchSeeds.length; // 8181

    for (const depth of depths) {
      for (const seed of sourceSeeds) {
        const checkpoint = checkpointsBySeedAndDepth.get(`${seed}-${depth}`)!;
        const { n0, nulls } = topologiesByCheckpoint.get(checkpoint.checkpointId)!;
        const bucket = regimesByDepthAndSeed.get(depth)!.get(seed)!;

        // Run N0 topology across all 3 branch seeds
        for (const branchSeed of branchSeeds) {
          await this.adapter.hydrateCompleteCheckpoint(checkpoint);
          await this.adapter.applyTopology(n0);
          await this.adapter.restoreBranchPrng({ sourceSeed: seed, branchSeed });
          await this.adapter.setGuidanceOffAndSuppressRelaySteering();

          const challenge = await this.adapter.createSealedChallenge({ sourceSeed: seed, branchSeed });
          const rawSteps = this.adapter.executeFullTrajectorySync(challenge, protocol.downstream.observationSteps);
          totalStepsProduced += rawSteps.length;

          const regime = await this.adapter.classifyFullTrajectory(rawSteps);
          bucket.n0Regimes.push(regime);

          const trajDigest = canonicalSha256(rawSteps.map((s) => s.stepDigest).join(':'));
          manifests.push({
            manifestId: `manifest-s${seed}-d${depth}-N0-b${branchSeed}`,
            sourceSeed: seed,
            depth,
            topologyKind: 'N0',
            topologyIndex: 0,
            branchSeed,
            checkpointDigest: checkpoint.checkpointDigest,
            challengeDigest: (challenge as any).challengeDigest,
            trajectoryDigest: trajDigest,
            regime,
          });

          completedReplays++;
        }

        // Run Null topologies across all 3 branch seeds
        for (let nullIdx = 0; nullIdx < nulls.length; nullIdx++) {
          const nullTop = nulls[nullIdx];
          for (const branchSeed of branchSeeds) {
            await this.adapter.hydrateCompleteCheckpoint(checkpoint);
            await this.adapter.applyTopology(nullTop);
            await this.adapter.restoreBranchPrng({ sourceSeed: seed, branchSeed });
            await this.adapter.setGuidanceOffAndSuppressRelaySteering();

            const challenge = await this.adapter.createSealedChallenge({ sourceSeed: seed, branchSeed });
            const rawSteps = this.adapter.executeFullTrajectorySync(challenge, protocol.downstream.observationSteps);
            totalStepsProduced += rawSteps.length;

            const regime = await this.adapter.classifyFullTrajectory(rawSteps);
            bucket.nullRegimes.push(regime);

            const trajDigest = canonicalSha256(rawSteps.map((s) => s.stepDigest).join(':'));
            manifests.push({
              manifestId: `manifest-s${seed}-d${depth}-Null${nullIdx + 1}-b${branchSeed}`,
              sourceSeed: seed,
              depth,
              topologyKind: 'NULL',
              topologyIndex: nullIdx + 1,
              branchSeed,
              checkpointDigest: checkpoint.checkpointDigest,
              challengeDigest: (challenge as any).challengeDigest,
              trajectoryDigest: trajDigest,
              regime,
            });

            completedReplays++;
          }
        }
      }

      const percent = Math.round(10 + (completedReplays / totalReplays) * 75);
      onProgress?.({
        phase: 'REPLAY_MATRIX_EXECUTION',
        percent,
        details: `Depth D${depth} processed. Completed ${completedReplays}/${totalReplays} replays (${totalStepsProduced} steps)...`,
      });
    }

    if (manifests.length !== 8181 || totalStepsProduced !== 1472580) {
      throw new Error(
        `Stage A matrix verification mismatch: expected 8,181 manifests and 1,472,580 steps, produced ${manifests.length} manifests and ${totalStepsProduced} steps.`
      );
    }

    onProgress?.({
      phase: 'DISTRIBUTION_AND_GRID_ANALYSIS',
      percent: 88,
      details: 'Computing N0 and Null-Ensemble distributions, Grid-Hold map, and Future-Availability rules...',
    });

    // 3. Compute N0 and Null-Ensemble regime distributions
    const depthDistributions: DepthDistributionBySeed[] = [];
    const nullEnsembles: NullEnsembleStats[] = [];

    // All possible unique regime labels encountered
    const allEncounteredLabels = new Set<string>();
    for (const m of manifests) {
      allEncounteredLabels.add(m.regime.label);
    }

    // Compute Null ensemble stats per depth and seed
    for (const depth of depths) {
      const n0BySourceSeed: Record<number, RegimeDistribution> = {};
      for (const seed of sourceSeeds) {
        const bucket = regimesByDepthAndSeed.get(depth)!.get(seed)!;
        const n0Dist = distributionFromRegimes(bucket.n0Regimes);
        n0BySourceSeed[seed] = n0Dist;

        // Null stats (300 replays per seed-depth)
        const nullDist = distributionFromRegimes(bucket.nullRegimes);
        const nullGridMasses: number[] = [];
        // Break into individual null runs (3 branch runs per null topology)
        for (let nI = 0; nI < nullCount; nI++) {
          const slice = bucket.nullRegimes.slice(nI * branchSeeds.length, (nI + 1) * branchSeeds.length);
          const gridCount = slice.filter((r) => r.isGridRegime).length;
          nullGridMasses.push(gridCount / slice.length);
        }
        nullGridMasses.sort((a, b) => a - b);
        const p95Idx = Math.floor(0.95 * nullGridMasses.length);
        const p95GridMass = nullGridMasses[Math.min(p95Idx, nullGridMasses.length - 1)];

        // Compute 95th percentile mass for each regime label in the null ensemble
        const regimeMassP95: Record<string, number> = {};
        for (const label of allEncounteredLabels) {
          const labelMasses: number[] = [];
          for (let nI = 0; nI < nullCount; nI++) {
            const slice = bucket.nullRegimes.slice(nI * branchSeeds.length, (nI + 1) * branchSeeds.length);
            const count = slice.filter((r) => r.label === label).length;
            labelMasses.push(count / slice.length);
          }
          labelMasses.sort((a, b) => a - b);
          regimeMassP95[label] = labelMasses[Math.min(p95Idx, labelMasses.length - 1)];
        }

        nullEnsembles.push({
          depth,
          sourceSeed: seed,
          sampleSize: bucket.nullRegimes.length,
          meanGridMass: nullDist.gridMass,
          p95GridMass,
          regimeMassP95,
          regimeMassDistribution: nullDist,
        });
      }

      depthDistributions.push({
        depth,
        n0BySourceSeed,
      });
    }

    // 4. Future-Availability Rule Verification
    // Rule:
    // 1. Present in >= 2 of 3 N0 branches for EVERY source seed
    // 2. Absent from all matched D0 N0 branches
    // 3. N0 probability exceeds matched null 95th percentile for EVERY source seed
    const futureAvailability: FutureAvailabilityObservation[] = [];

    // Find D0 N0 branch presences
    const d0PresentLabels = new Set<string>();
    for (const seed of sourceSeeds) {
      const d0N0Regimes = regimesByDepthAndSeed.get(0)!.get(seed)!.n0Regimes;
      for (const r of d0N0Regimes) {
        d0PresentLabels.add(r.label);
      }
    }

    for (const depth of depths) {
      let depthHasFutureAvailable = false;

      for (const label of allEncounteredLabels) {
        const n0BranchCountBySeed: Record<number, number> = {};
        const exceedsNullP95BySeed: Record<number, boolean> = {};
        const n0MassBySeed: Record<number, number> = {};
        const nullP95MassBySeed: Record<number, number> = {};

        let allSeedsHaveAtLeastTwo = true;
        let allSeedsExceedNullP95 = true;

        for (const seed of sourceSeeds) {
          const bucket = regimesByDepthAndSeed.get(depth)!.get(seed)!;
          const count = bucket.n0Regimes.filter((r) => r.label === label).length;
          n0BranchCountBySeed[seed] = count;
          const mass = count / bucket.n0Regimes.length;
          n0MassBySeed[seed] = mass;

          if (count < 2) allSeedsHaveAtLeastTwo = false;

          const nullStat = nullEnsembles.find((ne) => ne.depth === depth && ne.sourceSeed === seed)!;
          const p95 = nullStat.regimeMassP95[label] ?? 0;
          nullP95MassBySeed[seed] = p95;

          const exceeds = mass > p95;
          exceedsNullP95BySeed[seed] = exceeds;
          if (!exceeds) allSeedsExceedNullP95 = false;
        }

        const isAbsentD0 = !d0PresentLabels.has(label);
        const isObservedNewlyAvailable = allSeedsHaveAtLeastTwo && isAbsentD0 && allSeedsExceedNullP95;

        if (isObservedNewlyAvailable) {
          depthHasFutureAvailable = true;
        }

        futureAvailability.push({
          depth,
          regimeLabel: label,
          isObservedNewlyAvailable,
          n0BranchCountBySeed,
          d0Present: !isAbsentD0,
          exceedsNullP95BySeed,
          n0MassBySeed,
          nullP95MassBySeed,
        });
      }

      const depthDist = depthDistributions.find((dd) => dd.depth === depth)!;
      depthDist.futureAvailabilityObserved = depthHasFutureAvailable;
    }

    // 5. Grid-Hold / Contraction Map
    // holdsWhen: gridMass >= 2/3 for EACH source seed
    // contractsAt: first later depth with consistent strict grid mass decrease
    const gridHoldMap: GridMapEntry[] = [];
    let firstContractionDepth: number | null = null;

    for (let dI = 0; dI < depths.length; dI++) {
      const depth = depths[dI];
      const gridMassBySeed: Record<number, number> = {};
      let allSeedsAtLeastTwoThirds = true;
      let totalN0Grid = 0;
      let totalNullGrid = 0;

      for (const seed of sourceSeeds) {
        const bucket = regimesByDepthAndSeed.get(depth)!.get(seed)!;
        const n0Dist = distributionFromRegimes(bucket.n0Regimes);
        gridMassBySeed[seed] = n0Dist.gridMass;
        if (n0Dist.gridMass < 2 / 3) {
          allSeedsAtLeastTwoThirds = false;
        }
        totalN0Grid += n0Dist.gridMass;

        const nullStat = nullEnsembles.find((ne) => ne.depth === depth && ne.sourceSeed === seed)!;
        totalNullGrid += nullStat.meanGridMass;
      }

      const meanGridMass = totalN0Grid / sourceSeeds.length;
      const nullEnsembleMeanGridMass = totalNullGrid / sourceSeeds.length;

      gridHoldMap.push({
        depth,
        gridMassBySeed,
        gridHolds: allSeedsAtLeastTwoThirds,
        meanGridMass,
        nullEnsembleMeanGridMass,
      });

      // Check strict decrease across all seeds relative to previous depth
      if (dI > 0 && firstContractionDepth === null) {
        const prev = gridHoldMap[dI - 1];
        const allDecreased = sourceSeeds.every(
          (seed) => gridMassBySeed[seed] < prev.gridMassBySeed[seed]
        );
        if (allDecreased) {
          firstContractionDepth = depth;
        }
      }
    }

    onProgress?.({
      phase: 'SHARP_INTERVAL_SELECTION',
      percent: 96,
      details: 'Evaluating unique sharp replay interval and potentiating event candidates...',
    });

    // 6. Select Sharp Replay Interval
    const selectedSharpInterval = selectSharpReplayInterval(depthDistributions);

    // 7. Evaluate Potentiating Event Candidate within Selected Interval
    let selectedPotentiatingEvent: PFMEventForReplay | null = null;
    let engineeredTargetZone: number | null = null;

    if (selectedSharpInterval) {
      // Gather canonical conditioning PFM events from the upper checkpoint of the interval
      const upperCheckpoint = checkpointsBySeedAndDepth.get(
        `${sourceSeeds[0]}-${selectedSharpInterval.upperDepth}`
      )!;
      const pfmEventsRaw = (upperCheckpoint.payload as any).pfmEvents as any[];
      const pfmEvents: PFMEventForReplay[] = pfmEventsRaw.map((ev) => ({
        blockIndex: ev.blockIndex,
        targetZone: ev.targetZone,
        fluxDelta: ev.fluxDelta,
        phaseCoherence: ev.phaseCoherence,
        strainRelaxation: ev.strainRelaxation,
        eventDigest: ev.eventDigest,
      }));

      selectedPotentiatingEvent = selectPotentiatingEvent(pfmEvents, selectedSharpInterval);
      if (selectedPotentiatingEvent) {
        engineeredTargetZone = engineeredReplacementTarget(selectedPotentiatingEvent.blockIndex);
      }
    }

    // 8. Seal the Entire Stage A Execution Archive
    const archivePayload = {
      protocolId: protocol.protocolId,
      preflightBoundarySeal: STAGE_A_PREFLIGHT_BOUNDARY_SEAL,
      sourceSeeds,
      depths,
      checkpointsCount: sealedSourceCheckpoints.length,
      replayManifestsCount: manifests.length,
      rawStepRecordsCount: totalStepsProduced,
      depthDistributions,
      nullEnsembleSummaries: nullEnsembles.map((ne) => ({
        depth: ne.depth,
        seed: ne.sourceSeed,
        meanGridMass: ne.meanGridMass,
        p95GridMass: ne.p95GridMass,
      })),
      gridHoldMap,
      firstContractionDepth,
      selectedSharpInterval,
      selectedPotentiatingEvent,
      engineeredTargetZone,
      firstManifestDigest: manifests[0].trajectoryDigest,
      lastManifestDigest: manifests[manifests.length - 1].trajectoryDigest,
    };

    const stageAArchiveSeal = canonicalSha256(JSON.stringify(archivePayload));

    onProgress?.({
      phase: 'STAGE_A_COMPLETED',
      percent: 100,
      details: `Stage A complete. Cryptographic seal: ${stageAArchiveSeal}`,
    });

    return {
      protocolId: protocol.protocolId,
      preflightBoundarySeal: STAGE_A_PREFLIGHT_BOUNDARY_SEAL,
      timestamp: new Date().toISOString(),
      checkpointsCount: sealedSourceCheckpoints.length,
      replayManifestsCount: manifests.length,
      rawStepRecordsCount: totalStepsProduced,
      sealedSourceCheckpoints,
      depthDistributions,
      nullEnsembles,
      gridHoldMap,
      firstContractionDepth,
      futureAvailability,
      selectedSharpInterval,
      selectedPotentiatingEvent,
      engineeredTargetZone,
      stageAArchiveSeal,
    };
  }
}
