/**
 * PAPER_6_C1_REPLAY_ATLAS_V2
 *
 * A new prospective early-boundary experiment. It does not reopen or retune
 * V1: it asks whether the D0→D144 intra-grid transition is Zone-9-specific or
 * merely the consequence of event-matched conditioning exposure.
 */

import {
  type LiveC1ReplayAdapter,
  type PFMEventForReplay,
  type RegimeDistribution,
  jensenShannonBits,
} from "./Paper6C1ReplayAtlasV1";

export const PAPER_6_C1_REPLAY_ATLAS_V2 = Object.freeze({
  protocolId: "PAPER_6_C1_REPLAY_ATLAS_V2",
  status: "PROSPECTIVE_INTEGRATION_READY_NOT_EXECUTED",
  predecessor: {
    protocolId: "PAPER_6_C1_REPLAY_ATLAS_V1",
    archiveDigest: "1e1b1f2de377fa290c5090cdc5142cd3f1dce677c8c3a6596c0610d0437f6d24",
    disposition: "IMMUTABLE_CLOSED_NOT_REANALYSED",
  },
  question:
    "Does the early D0-to-D144 intra-grid transition depend on Zone-9 history rather than matched conditioning exposure, under a held-out phase-resolved within-grid perturbation?",
  source: {
    sourceSeeds: [101, 202, 303],
    depths: [0, 36, 72, 108, 144],
    historyArms: {
      D0_NAIVE: {
        depth: 0,
        targetSequence: "NONE",
      },
      Z9_CANONICAL: {
        depths: [36, 72, 108, 144],
        targetSequence: "ZONE_9_EVERY_CONDITIONING_BLOCK",
      },
      EVEN_POLE_NEUTRAL: {
        depths: [36, 72, 108, 144],
        targetSequence: "EVEN_POLES[blockIndex_mod_5] where EVEN_POLES=[0,2,4,6,8]",
        requiredZone9Exposure: 0,
        matchedToCanonical: [
          "event_count",
          "block_timing",
          "flux_delta",
          "strain_relaxation",
          "trace_magnitude_norm",
          "runtime_exposure",
        ],
      },
    },
    completeCheckpointState: "SAME_LIVE_C1_COMPLETE_STATE_CONTRACT_AS_V1",
  },
  downstream: {
    nativeTopology: "N0",
    degreePreservingNullCount: 100,
    branchSeeds: [101, 202, 303],
    observationSteps: 180,
    challenge: {
      id: "TYPE_B_PHASE_RESOLVED_WITHIN_GRID_HELD_OUT_PERTURBATION",
      constraints: [
        "phase_resolved_not_endpoint_targeted",
        "zero_net_activation_impulse_over_each_complete_schedule",
        "no_history_or_classifier_input",
        "sealed_per_source_seed_and_branch_seed_before_lineage_execution",
        "guidance_off_and_relay_steering_suppressed",
      ],
      distinguishabilityGate:
        "D0_FULL_TRAJECTORY_SIGNATURES_MUST_NOT_ALL_BE_BYTE_IDENTICAL; OTHERWISE_ABORT_V2_WITHOUT_RETUNING",
    },
    commonRandomNumbers: "IDENTICAL_CHALLENGE_AND_BRANCH_PRNG_STATE_ACROSS_HISTORY_ARMS_AND_TOPOLOGIES",
  },
  analysis: {
    primary: "FULL_TRAJECTORY_REGIME_DISTRIBUTIONS_AND_SIX_DIMENSIONAL_SIGNATURES",
    windows: ["steps_1_60", "steps_61_120", "steps_121_180"],
    primaryContrasts: [
      "Z9_CANONICAL(depth)_vs_EVEN_POLE_NEUTRAL(depth)",
      "Z9_CANONICAL(depth)_vs_D0_NAIVE",
      "adjacent_Z9_CANONICAL_depths",
    ],
    forbidden: ["FINAL_ZONE_9_OCCUPANCY_ALONE", "POST_HOC_CHALLENGE_RETUNING"],
    observedEarlyOpening: [
      "one_regime_support_changes_between_adjacent_Z9_depths_for_every_source_seed",
      "the_same_support_change_is_not_present_in_its_event_matched_neutral_arm",
      "N0_probability_exceeds_matched_null_95th_percentile_for_every_source_seed",
    ],
  },
  engineeredReplay: {
    release: "ONLY_AFTER_COMPLETE_V2_STAGE_A_ARCHIVE_AUDIT",
    selectedInterval: [
      "unique_maximum_of_minimum_per_seed_JSD_across_adjacent_Z9_CANONICAL_depths",
      "same_modal_regime_transition_for_all_three_source_seeds",
      "matched_neutral_does_not_show_the_same_transition",
    ],
    candidate: "MAXIMUM_ABS_FLUX_TIMES_PHASE_COHERENCE_PLUS_ABS_STRAIN_ZONE_9_EVENT_IN_SELECTED_INTERVAL",
    intervention:
      "replay_from_lower_sealed_checkpoint_with_only_candidate_event_retargeted_to_EVEN_POLES[blockIndex_mod_5]",
    preservation: [
      "event_count_time_flux_and_strain",
      "all_non_candidate_event_digests",
      "topology_branch_seed_and_challenge_schedule",
      "canonical_regeneration_matches_sealed_upper_checkpoint_before_intervention",
    ],
  },
  integrity: {
    rawBeforeScoring: true,
    appendOnlyArchive: true,
    failClosed: true,
    nonAuthorisingInterpretation: true,
  },
} as const);

export interface PhaseResolvedReplayAdapter extends LiveC1ReplayAdapter {
  createSealedPhaseResolvedChallenge(args: { sourceSeed: number; branchSeed: number }): Promise<unknown>;
  applyPhaseResolvedChallengeStep(challenge: unknown, stepIndex: number): Promise<void>;
  phaseResolvedChallengeDigest(challenge: unknown): Promise<string>;
}

export function assertPhaseResolvedReplayAdapter(value: unknown): asserts value is PhaseResolvedReplayAdapter {
  if (!value || typeof value !== "object") throw new Error("V2 requires a live native C1 adapter.");
  const adapter = value as Record<string, unknown>;
  if (adapter.kind !== "LIVE_C1_NATIVE" || adapter.synthetic !== false) {
    throw new Error("V2 rejects fresh, reduced, or synthetic runtimes.");
  }
  for (const method of [
    "createSealedPhaseResolvedChallenge",
    "applyPhaseResolvedChallengeStep",
    "phaseResolvedChallengeDigest",
  ]) {
    if (typeof adapter[method] !== "function") throw new Error("V2 live capability missing: " + method);
  }
}

export function expectedV2CheckpointCount(): number {
  // One D0 arm plus four depths in each of the two event-matched history arms.
  return PAPER_6_C1_REPLAY_ATLAS_V2.source.sourceSeeds.length * 9;
}

export function expectedV2StageAReplayCount(): number {
  return expectedV2CheckpointCount()
    * (1 + PAPER_6_C1_REPLAY_ATLAS_V2.downstream.degreePreservingNullCount)
    * PAPER_6_C1_REPLAY_ATLAS_V2.downstream.branchSeeds.length;
}

export function expectedV2RawStepCount(): number {
  return expectedV2StageAReplayCount() * PAPER_6_C1_REPLAY_ATLAS_V2.downstream.observationSteps;
}

export interface EarlyBoundaryRow {
  depth: number;
  canonicalBySeed: Readonly<Record<number, RegimeDistribution>>;
  neutralBySeed: Readonly<Record<number, RegimeDistribution>>;
}

export interface EarlyBoundaryInterval {
  lowerDepth: number;
  upperDepth: number;
  minimumPerSeedJsd: number;
  lowerModalRegime: string;
  upperModalRegime: string;
}

function modalLabel(distribution: RegimeDistribution): string {
  const entries = Object.entries(distribution.mass).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  if (entries.length === 0) throw new Error("Cannot select a modal regime from an empty distribution.");
  return entries[0][0];
}

/**
 * V2 makes an intra-grid regime change eligible without reclassifying V1.
 * It requires an identical, all-seed modal shift that the matched neutral
 * history does not reproduce.
 */
export function selectEarlyBoundaryInterval(rows: readonly EarlyBoundaryRow[]): EarlyBoundaryInterval | null {
  const seeds = PAPER_6_C1_REPLAY_ATLAS_V2.source.sourceSeeds;
  const ordered = [...rows].sort((a, b) => a.depth - b.depth);
  const candidates: EarlyBoundaryInterval[] = [];
  for (let index = 0; index < ordered.length - 1; index++) {
    const lower = ordered[index];
    const upper = ordered[index + 1];
    const lowerLabels = seeds.map((seed) => modalLabel(lower.canonicalBySeed[seed]));
    const upperLabels = seeds.map((seed) => modalLabel(upper.canonicalBySeed[seed]));
    const neutralReproduces = seeds.every((seed) =>
      modalLabel(lower.neutralBySeed[seed]) === lowerLabels[0]
      && modalLabel(upper.neutralBySeed[seed]) === upperLabels[0],
    );
    const canonicalShift = lowerLabels.every((label) => label === lowerLabels[0])
      && upperLabels.every((label) => label === upperLabels[0])
      && lowerLabels[0] !== upperLabels[0];
    if (!canonicalShift || neutralReproduces) continue;
    const jsds = seeds.map((seed) => jensenShannonBits(lower.canonicalBySeed[seed], upper.canonicalBySeed[seed]));
    candidates.push({
      lowerDepth: lower.depth,
      upperDepth: upper.depth,
      minimumPerSeedJsd: Math.min(...jsds),
      lowerModalRegime: lowerLabels[0],
      upperModalRegime: upperLabels[0],
    });
  }
  candidates.sort((a, b) => b.minimumPerSeedJsd - a.minimumPerSeedJsd);
  if (candidates.length === 0) return null;
  if (candidates.length > 1 && candidates[0].minimumPerSeedJsd === candidates[1].minimumPerSeedJsd) return null;
  return candidates[0];
}

export function selectV2PotentiatingEvent(
  events: readonly PFMEventForReplay[],
  interval: EarlyBoundaryInterval,
): PFMEventForReplay | null {
  const eligible = events.filter((event) =>
    event.targetZone === 9
    && event.blockIndex >= interval.lowerDepth
    && event.blockIndex < interval.upperDepth,
  );
  if (eligible.length === 0) return null;
  return [...eligible].sort((a, b) => {
    const scoreA = Math.abs(a.fluxDelta) * a.phaseCoherence + Math.abs(a.strainRelaxation);
    const scoreB = Math.abs(b.fluxDelta) * b.phaseCoherence + Math.abs(b.strainRelaxation);
    return scoreB - scoreA || a.blockIndex - b.blockIndex;
  })[0];
}

export function v2PreflightSummary() {
  return Object.freeze({
    protocolId: PAPER_6_C1_REPLAY_ATLAS_V2.protocolId,
    status: PAPER_6_C1_REPLAY_ATLAS_V2.status,
    sealedSourceCheckpoints: expectedV2CheckpointCount(),
    stageAReplays: expectedV2StageAReplayCount(),
    rawSteps: expectedV2RawStepCount(),
    V1Archive: PAPER_6_C1_REPLAY_ATLAS_V2.predecessor.archiveDigest,
  });
}
