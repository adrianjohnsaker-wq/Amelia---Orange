/**
 * PAPER_6_C1_REPLAY_ATLAS_V1
 *
 * Integration-ready contract for the next prospective Amelia experiment.
 * It deliberately contains no substitute dynamics: execution is permitted
 * only through an adapter bound to the active C1 substrate.
 *
 * The object of inquiry is the distribution of later regimes reachable from
 * sealed, complete histories—not an endpoint occupancy score.
 */

export const PAPER_6_C1_REPLAY_ATLAS_V1 = Object.freeze({
  protocolId: "PAPER_6_C1_REPLAY_ATLAS_V1",
  status: "INTEGRATION_READY_NOT_EXECUTED",
  scope: "LIVE_C1_NATIVE_REPLAY_ONLY",
  source: {
    sourceSeeds: [101, 202, 303],
    conditioningTargetZone: 9,
    checkpointDepths: [0, 144, 288, 432, 576, 720, 864, 1008, 1152],
    completeCheckpointState: [
      "qabbala-zone-fields-phase-angles-and-current-state",
      "topology-gates-and-gate-attributes",
      "process-field-memory-ordered-history-tensor-and-trace-digest",
      "runtime-deformation-tensor-and-step-counter",
      "governor-state-and-guidance-state",
      "all-behaviourally-relevant-prng-state",
      "session-bridge-state-if-it-affects-substrate-dynamics",
      "source-code-manifest-and-classifier-specification",
    ],
  },
  downstream: {
    nativeTopology: "N0",
    degreePreservingNullCount: 100,
    branchSeeds: [101, 202, 303],
    observationSteps: 180,
    challenge: "TYPE_B_ZONE_9_DIRECTED_HELD_OUT_PERTURBATION",
    guidance: "OFF",
    relaySteering: "SUPPRESSED",
    commonRandomNumbers:
      "IDENTICAL_SEALED_CHALLENGE_AND_BRANCH_PRNG_STATE_PER_SOURCE_SEED_AND_BRANCH_SEED",
    topologyNullRequirements: [
      "directed-in-degree-preserved",
      "directed-out-degree-preserved",
      "gate-attribute-multiset-preserved",
      "no-self-loops-or-duplicate-edges",
      "only-topology-may-differ-after-hydration",
    ],
  },
  analysis: {
    primary: "DISTRIBUTION_OF_FULL_TRAJECTORY_REGIMES",
    requiredTrajectoryWindows: ["steps_1_60", "steps_61_120", "steps_121_180"],
    requiredRawSignals: [
      "ten-zone-activation-and-phase",
      "dominant-zone-and-transition-sequence",
      "five-pole-distribution-and-balance",
      "syzygy-coherence-and-deformation-tension",
      "memory-bias-consumption-and-pfm-trace-digest",
      "governor-and-guidance-telemetry",
      "challenge-input-and-step-digest-chain",
    ],
    prohibitedEndpointSubstitute: "FINAL_ZONE_9_OCCUPANCY_ALONE",
    gridWindow: {
      holdsWhen: "GRID_REGIME_MASS_AT_LEAST_TWO_THIRDS_FOR_EACH_SOURCE_SEED",
      contractsAt: "FIRST_LATER_DEPTH_WITH_CONSISTENT_STRICT_GRID_MASS_DECREASE",
    },
    futureAvailability: {
      label: "OBSERVED_NEWLY_AVAILABLE_FUTURE",
      rule: [
        "present_in_at_least_two_of_three_N0_branches_for_every_source_seed",
        "absent_from-all_matched_D0_N0_branches",
        "N0_probability_exceeds_its_matched_null_95th_percentile_for_every_source_seed",
      ],
    },
  },
  engineeredReplay: {
    release: "ONLY_AFTER_THE_STAGE_A_RAW_ARCHIVE_AND_FIXED_SELECTION_RULE",
    sharpInterval: [
      "adjacent_depth_pair_with_unique_maximum_of_minimum_per_seed_JSD",
      "grid_mass_changes_in_one_direction_for_all_three_source_seeds_OR_a_future_availability_rule_is_met",
    ],
    potentiatingEvent: [
      "within_the_selected_interval_consider_only_actual_zone_9_PFM_events",
      "select_maximum_abs_flux_times_phase_coherence_plus_abs_strain_relaxation",
      "break_ties_by_lowest_block_index",
    ],
    intervention:
      "from_the_lower_sealed_checkpoint_replay_the_interval_once_with_only_that_event_retargeted_to_EVEN_POLES[blockIndex_mod_5]",
    controls: [
      "same_event_count_time_flux_and_strain_fields",
      "same_source_checkpoint_topology_and_branch_seed_matrix",
      "canonical_interval_regeneration_must_reproduce_existing_upper_checkpoint_digest",
      "all_non_candidate_event_digests_must_match",
    ],
  },
  integrity: {
    rawBeforeScoring: true,
    appendOnlyArchive: true,
    noThresholdRetuning: true,
    failClosedOnIncompleteHydration: true,
    nonAuthorisingInterpretation: true,
  },
} as const);

export type RegimeLabel = string;

/** A classifier must be sealed separately and must read the full trajectory. */
export interface RegimeObservation {
  label: RegimeLabel;
  isGridRegime: boolean;
  signature: readonly number[];
  classifierDigest: string;
}

export interface RegimeDistribution {
  sampleSize: number;
  mass: Readonly<Record<RegimeLabel, number>>;
  gridMass: number;
}

export interface PFMEventForReplay {
  blockIndex: number;
  targetZone: number;
  fluxDelta: number;
  phaseCoherence: number;
  strainRelaxation: number;
  eventDigest: string;
}

export interface CheckpointSealForReplay {
  checkpointId: string;
  sourceSeed: number;
  conditioningDepth: number;
  checkpointDigest: string;
  nonTopologyDigest: string;
  topologyDigest: string;
  pfmTraceDigest: string;
  payload: unknown;
}

/**
 * The native bridge must implement these operations against the real C1
 * runtime.  A fresh runtime, a reduced model, or a reconstructed summary is
 * not an admissible implementation of this interface.
 */
export interface LiveC1ReplayAdapter {
  readonly kind: "LIVE_C1_NATIVE";
  readonly synthetic: false;
  captureCompleteCheckpoint(): Promise<CheckpointSealForReplay>;
  hydrateCompleteCheckpoint(checkpoint: CheckpointSealForReplay): Promise<void>;
  digestCompleteCheckpoint(): Promise<string>;
  digestNonTopologyState(): Promise<string>;
  captureTopology(): Promise<unknown>;
  applyTopology(topology: unknown): Promise<void>;
  createDegreePreservingNulls(args: {
    topology: unknown;
    count: number;
    namespace: string;
  }): Promise<readonly unknown[]>;
  restoreBranchPrng(args: { sourceSeed: number; branchSeed: number }): Promise<void>;
  createSealedChallenge(args: { sourceSeed: number; branchSeed: number }): Promise<unknown>;
  setGuidanceOffAndSuppressRelaySteering(): Promise<void>;
  applyChallengeStep(challenge: unknown, stepIndex: number): Promise<void>;
  stepAndObserve(stepIndex: number): Promise<unknown>;
  classifyFullTrajectory(rawSteps: readonly unknown[]): Promise<RegimeObservation>;
  conditioningEvents(): Promise<readonly PFMEventForReplay[]>;
  replayConditioningInterval(args: {
    lowerCheckpoint: CheckpointSealForReplay;
    upperDepth: number;
    replaceEvent?: { blockIndex: number; targetZone: number };
  }): Promise<CheckpointSealForReplay>;
}

const REQUIRED_ADAPTER_METHODS = [
  "captureCompleteCheckpoint",
  "hydrateCompleteCheckpoint",
  "digestCompleteCheckpoint",
  "digestNonTopologyState",
  "captureTopology",
  "applyTopology",
  "createDegreePreservingNulls",
  "restoreBranchPrng",
  "createSealedChallenge",
  "setGuidanceOffAndSuppressRelaySteering",
  "applyChallengeStep",
  "stepAndObserve",
  "classifyFullTrajectory",
  "conditioningEvents",
  "replayConditioningInterval",
] as const;

export function assertLiveC1ReplayAdapter(value: unknown): asserts value is LiveC1ReplayAdapter {
  if (!value || typeof value !== "object") {
    throw new Error("Replay atlas requires a LIVE_C1_NATIVE adapter object.");
  }
  const adapter = value as Record<string, unknown>;
  if (adapter.kind !== "LIVE_C1_NATIVE" || adapter.synthetic !== false) {
    throw new Error("Replay atlas rejects non-native or synthetic substrate adapters.");
  }
  for (const method of REQUIRED_ADAPTER_METHODS) {
    if (typeof adapter[method] !== "function") {
      throw new Error("Live C1 replay capability missing: " + method);
    }
  }
}

export function expectedStageAReplayCount(): number {
  const source = PAPER_6_C1_REPLAY_ATLAS_V1.source;
  const downstream = PAPER_6_C1_REPLAY_ATLAS_V1.downstream;
  return source.sourceSeeds.length
    * source.checkpointDepths.length
    * (1 + downstream.degreePreservingNullCount)
    * downstream.branchSeeds.length;
}

export function expectedStageARawStepCount(): number {
  return expectedStageAReplayCount() * PAPER_6_C1_REPLAY_ATLAS_V1.downstream.observationSteps;
}

export function expectedEngineeredReplayCount(): number {
  const source = PAPER_6_C1_REPLAY_ATLAS_V1.source;
  const downstream = PAPER_6_C1_REPLAY_ATLAS_V1.downstream;
  return source.sourceSeeds.length
    * (1 + downstream.degreePreservingNullCount)
    * downstream.branchSeeds.length;
}

export function distributionFromRegimes(regimes: readonly RegimeObservation[]): RegimeDistribution {
  if (regimes.length === 0) throw new Error("Cannot estimate a regime distribution from zero replays.");
  const counts: Record<string, number> = Object.create(null);
  let gridCount = 0;
  for (const regime of regimes) {
    counts[regime.label] = (counts[regime.label] ?? 0) + 1;
    if (regime.isGridRegime) gridCount++;
  }
  const mass: Record<string, number> = Object.create(null);
  for (const label of Object.keys(counts).sort()) mass[label] = counts[label] / regimes.length;
  return { sampleSize: regimes.length, mass, gridMass: gridCount / regimes.length };
}

export function jensenShannonBits(left: RegimeDistribution, right: RegimeDistribution): number {
  const labels = [...new Set([...Object.keys(left.mass), ...Object.keys(right.mass)])];
  let divergence = 0;
  for (const label of labels) {
    const p = left.mass[label] ?? 0;
    const q = right.mass[label] ?? 0;
    const midpoint = (p + q) / 2;
    if (p > 0) divergence += 0.5 * p * Math.log2(p / midpoint);
    if (q > 0) divergence += 0.5 * q * Math.log2(q / midpoint);
  }
  return divergence;
}

export interface DepthDistributionBySeed {
  depth: number;
  n0BySourceSeed: Readonly<Record<number, RegimeDistribution>>;
  futureAvailabilityObserved?: boolean;
}

export interface SharpReplayInterval {
  lowerDepth: number;
  upperDepth: number;
  minimumPerSeedJsd: number;
  gridDirection: "EXPANDS" | "CONTRACTS" | "FUTURE_AVAILABLE";
}

/**
 * There is no arbitrary post-hoc threshold: the second replay is released
 * only for the unique, strongest adjacent distributional transition that is
 * coherent across source seeds. A tie or mixed direction returns null.
 */
export function selectSharpReplayInterval(
  rows: readonly DepthDistributionBySeed[],
): SharpReplayInterval | null {
  const seeds = PAPER_6_C1_REPLAY_ATLAS_V1.source.sourceSeeds;
  const ordered = [...rows].sort((a, b) => a.depth - b.depth);
  const candidates: SharpReplayInterval[] = [];
  for (let index = 0; index < ordered.length - 1; index++) {
    const lower = ordered[index];
    const upper = ordered[index + 1];
    const jsds = seeds.map((seed) => {
      const a = lower.n0BySourceSeed[seed];
      const b = upper.n0BySourceSeed[seed];
      if (!a || !b) throw new Error("Missing N0 regime distribution for source seed " + seed);
      return jensenShannonBits(a, b);
    });
    const gridChanges = seeds.map((seed) => {
      const delta = upper.n0BySourceSeed[seed].gridMass - lower.n0BySourceSeed[seed].gridMass;
      return delta > 0 ? "EXPANDS" : delta < 0 ? "CONTRACTS" : "TIE";
    });
    const oneDirection = gridChanges.every((direction) => direction === "EXPANDS")
      ? "EXPANDS"
      : gridChanges.every((direction) => direction === "CONTRACTS")
        ? "CONTRACTS"
        : null;
    const futureAvailable = Boolean(upper.futureAvailabilityObserved && !lower.futureAvailabilityObserved);
    if (!oneDirection && !futureAvailable) continue;
    candidates.push({
      lowerDepth: lower.depth,
      upperDepth: upper.depth,
      minimumPerSeedJsd: Math.min(...jsds),
      gridDirection: oneDirection ?? "FUTURE_AVAILABLE",
    });
  }
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.minimumPerSeedJsd - a.minimumPerSeedJsd);
  if (candidates.length > 1 && candidates[0].minimumPerSeedJsd === candidates[1].minimumPerSeedJsd) {
    return null;
  }
  return candidates[0];
}

export function selectPotentiatingEvent(
  events: readonly PFMEventForReplay[],
  interval: SharpReplayInterval,
): PFMEventForReplay | null {
  const eligible = events.filter((event) =>
    event.blockIndex >= interval.lowerDepth
    && event.blockIndex < interval.upperDepth
    && event.targetZone === 9,
  );
  if (eligible.length === 0) return null;
  return [...eligible].sort((left, right) => {
    const leftScore = Math.abs(left.fluxDelta) * left.phaseCoherence + Math.abs(left.strainRelaxation);
    const rightScore = Math.abs(right.fluxDelta) * right.phaseCoherence + Math.abs(right.strainRelaxation);
    return rightScore - leftScore || left.blockIndex - right.blockIndex;
  })[0];
}

export function engineeredReplacementTarget(blockIndex: number): number {
  return [0, 2, 4, 6, 8][blockIndex % 5];
}

export function replayAtlasPreflightSummary() {
  return Object.freeze({
    protocolId: PAPER_6_C1_REPLAY_ATLAS_V1.protocolId,
    status: PAPER_6_C1_REPLAY_ATLAS_V1.status,
    checkpoints: PAPER_6_C1_REPLAY_ATLAS_V1.source.sourceSeeds.length
      * PAPER_6_C1_REPLAY_ATLAS_V1.source.checkpointDepths.length,
    stageAReplays: expectedStageAReplayCount(),
    stageARawSteps: expectedStageARawStepCount(),
    conditionalEngineeredReplays: expectedEngineeredReplayCount(),
    forbidden: ["synthetic-substrate", "final-occupancy-only", "post-hoc-trigger-retuning"],
  });
}

if (typeof process !== 'undefined' && process?.argv?.[1]?.endsWith("Paper6C1ReplayAtlasV1.ts")) {
  console.log(JSON.stringify(replayAtlasPreflightSummary(), null, 2));
}
