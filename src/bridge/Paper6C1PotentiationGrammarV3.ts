/**
 * PAPER_6_C1_POTENTIATION_GRAMMAR_V3
 *
 * A finite, prospective live-C1 map of how the D72→D108 opening composes its
 * force: its local necessity profile, its persistence window, and the minimum
 * Zone-9 kernel that can rescue the opening on an event-matched neutral path.
 *
 * V3 never regenerates a synthetic substrate and never alters V1 or V2.
 */

import {
  type CheckpointSealForReplay,
  type PFMEventForReplay,
  type RegimeDistribution,
  jensenShannonBits,
} from "./Paper6C1ReplayAtlasV1";
import { type PhaseResolvedReplayAdapter } from "./Paper6C1ReplayAtlasV2";

const EVEN_POLES = [0, 2, 4, 6, 8] as const;
const NECESSITY_SCAN_BLOCKS = [76, 80, 84, 88, 92, 96, 100] as const;

export const PAPER_6_C1_POTENTIATION_GRAMMAR_V3 = Object.freeze({
  protocolId: "PAPER_6_C1_POTENTIATION_GRAMMAR_V3",
  status: "PROSPECTIVE_INTEGRATION_READY_NOT_EXECUTED",
  predecessors: {
    V1: {
      archiveDigest: "1e1b1f2de377fa290c5090cdc5142cd3f1dce677c8c3a6596c0610d0437f6d24",
      disposition: "IMMUTABLE_CLOSED_NOT_REANALYSED",
    },
    V2: {
      closureSeal: "47e94c8b2fa8104399e525164d78b87ce01d89886d34e94b0f9aa42e1281cb9f",
      disposition: "IMMUTABLE_CLOSED_NOT_REANALYSED",
    },
  },
  question:
    "Where, within the D72-to-D108 opening, does Zone-9 history widen, hold, and close; and what minimum Zone-9 kernel is sufficient to reopen the later canalized regime on a matched neutral history?",
  fixedContext: {
    sourceSeeds: [101, 202, 303],
    lowerCheckpointDepth: 72,
    upperCheckpointDepth: 108,
    sourceCheckpoints: ["D72_CANONICAL_Z9", "D72_EVEN_POLE_NEUTRAL"],
    challenge: "REUSE_EXACT_V2_PHASE_RESOLVED_WITHIN_GRID_SEALED_SCHEDULES",
    topology: "N0_PLUS_100_DEGREE_PRESERVING_NULLS",
    branchSeeds: [101, 202, 303],
    observationSteps: 180,
    guidance: "OFF",
    relaySteering: "SUPPRESSED",
  },
  conditions: {
    references: ["CANONICAL_REFERENCE", "NEUTRAL_REFERENCE"],
    necessityScanBlocks: NECESSITY_SCAN_BLOCKS,
    rescueKernels: {
      RESCUE_88: [88],
      RESCUE_87_89: [87, 88, 89],
      RESCUE_84_92: [84, 85, 86, 87, 88, 89, 90, 91, 92],
      RESCUE_80_96: [80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96],
    },
  },
  preflight: {
    canonicalRegeneration: "D72_CANONICAL_TO_D108_MUST_MATCH_SEALED_V2_D108_DIGEST_PER_SEED",
    neutralRegeneration: "D72_NEUTRAL_TO_D108_MUST_MATCH_SEALED_V2_NEUTRAL_D108_DIGEST_PER_SEED",
    replacementParity: [
      "all_non_replaced_event_digests_identical",
      "event_count_block_timing_flux_and_strain_preserved",
      "complete_non_topology_state_and_branch_randomness_preserved",
      "exact_V2_challenge_schedule_digest_reused",
    ],
  },
  interpretation: {
    necessity: "A scanned event is open-sensitive only when every source seed changes modal full-trajectory regime relative to canonical.",
    aperture: "The opening profile is the ordered all-seed necessity curve; its sampled left/right bounds are reported without threshold retuning.",
    sufficiency: "The smallest predeclared neutral-history rescue kernel whose modal regime matches canonical for every seed is the minimum sufficient kernel within the tested family.",
    noMatch: "If no rescue kernel matches canonical, the opening is context-bound in this tested family rather than event-sufficient.",
    nonAuthorising: true,
  },
  integrity: {
    rawBeforeScoring: true,
    appendOnlyArchive: true,
    noPostHocAdditionalBlocks: true,
    noSyntheticSubstrate: true,
    failClosed: true,
  },
} as const);

export interface ConditioningTargetReplacement {
  blockIndex: number;
  targetZone: number;
}

/** The V3 adapter extends the already live V2 adapter only for multi-event histories. */
export interface PotentiationGrammarV3Adapter extends PhaseResolvedReplayAdapter {
  replayConditioningIntervalWithReplacements(args: {
    lowerCheckpoint: CheckpointSealForReplay;
    upperDepth: number;
    replacements: readonly ConditioningTargetReplacement[];
  }): Promise<CheckpointSealForReplay>;
}

export function assertPotentiationGrammarV3Adapter(
  value: unknown,
): asserts value is PotentiationGrammarV3Adapter {
  if (!value || typeof value !== "object") throw new Error("V3 requires the native live C1 adapter.");
  const adapter = value as Record<string, unknown>;
  if (adapter.kind !== "LIVE_C1_NATIVE" || adapter.synthetic !== false) {
    throw new Error("V3 rejects fresh, reduced, and synthetic runtimes.");
  }
  if (typeof adapter.replayConditioningIntervalWithReplacements !== "function") {
    throw new Error("V3 live capability missing: replayConditioningIntervalWithReplacements");
  }
}

export function neutralTargetFor(blockIndex: number): number {
  return EVEN_POLES[blockIndex % EVEN_POLES.length];
}

export function necessityReplacements(blockIndex: number): readonly ConditioningTargetReplacement[] {
  if (!NECESSITY_SCAN_BLOCKS.includes(blockIndex as (typeof NECESSITY_SCAN_BLOCKS)[number])) {
    throw new Error("Block is not in the predeclared V3 necessity scan.");
  }
  return [{ blockIndex, targetZone: neutralTargetFor(blockIndex) }];
}

export function rescueReplacements(blocks: readonly number[]): readonly ConditioningTargetReplacement[] {
  return blocks.map((blockIndex) => ({ blockIndex, targetZone: 9 }));
}

export function v3ConditionCount(): number {
  return PAPER_6_C1_POTENTIATION_GRAMMAR_V3.conditions.references.length
    + PAPER_6_C1_POTENTIATION_GRAMMAR_V3.conditions.necessityScanBlocks.length
    + Object.keys(PAPER_6_C1_POTENTIATION_GRAMMAR_V3.conditions.rescueKernels).length;
}

export function expectedV3ReplayCount(): number {
  const fixed = PAPER_6_C1_POTENTIATION_GRAMMAR_V3.fixedContext;
  const count = v3ConditionCount()
    * fixed.sourceSeeds.length
    * 101
    * fixed.branchSeeds.length;

  if (count !== 11_817) {
    throw new Error(
      `[V3 Fail-Closed Arithmetic Error] expectedV3ReplayCount must equal exactly 11,817, received ${count}`
    );
  }
  return count;
}

export function expectedV3RawStepCount(): number {
  const count = expectedV3ReplayCount() * PAPER_6_C1_POTENTIATION_GRAMMAR_V3.fixedContext.observationSteps;
  if (count !== 2_127_060) {
    throw new Error(
      `[V3 Fail-Closed Arithmetic Error] expectedV3RawStepCount must equal exactly 2,127,060, received ${count}`
    );
  }
  return count;
}

function modalRegime(distribution: RegimeDistribution): string {
  const entries = Object.entries(distribution.mass).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  if (entries.length === 0) throw new Error("A full-trajectory regime distribution cannot be empty.");
  return entries[0][0];
}

export interface NecessityProfileEntry {
  blockIndex: number;
  canonicalBySeed: Readonly<Record<number, RegimeDistribution>>;
  retargetedBySeed: Readonly<Record<number, RegimeDistribution>>;
}

export interface OpeningAperturePoint {
  blockIndex: number;
  minimumPerSeedJsd: number;
  allSeedModalShift: boolean;
}

/**
 * Returns the potency curve itself. V3 deliberately reports the sampled
 * aperture instead of imposing a new numeric threshold onto a living process.
 */
export function mapOpeningAperture(
  profile: readonly NecessityProfileEntry[],
): readonly OpeningAperturePoint[] {
  const seeds = PAPER_6_C1_POTENTIATION_GRAMMAR_V3.fixedContext.sourceSeeds;
  return [...profile]
    .sort((a, b) => a.blockIndex - b.blockIndex)
    .map((entry) => {
      const perSeedJsd = seeds.map((seed) => {
        const canonical = entry.canonicalBySeed[seed];
        const retargeted = entry.retargetedBySeed[seed];
        if (!canonical || !retargeted) throw new Error("Missing V3 distribution for source seed " + seed);
        return jensenShannonBits(canonical, retargeted);
      });
      const allSeedModalShift = seeds.every((seed) =>
        modalRegime(entry.canonicalBySeed[seed]) !== modalRegime(entry.retargetedBySeed[seed]),
      );
      return {
        blockIndex: entry.blockIndex,
        minimumPerSeedJsd: Math.min(...perSeedJsd),
        allSeedModalShift,
      };
    });
}

export interface RescueProfileEntry {
  name: string;
  kernel: readonly number[];
  canonicalBySeed: Readonly<Record<number, RegimeDistribution>>;
  rescueBySeed: Readonly<Record<number, RegimeDistribution>>;
}

/**
 * No later rescue family may be appended after results. This selects only the
 * smallest successful kernel from the four already-sealed V3 kernels.
 */
export function minimumSufficientRescue(
  profile: readonly RescueProfileEntry[],
): RescueProfileEntry | null {
  const seeds = PAPER_6_C1_POTENTIATION_GRAMMAR_V3.fixedContext.sourceSeeds;
  const successful = profile.filter((entry) => seeds.every((seed) =>
    modalRegime(entry.canonicalBySeed[seed]) === modalRegime(entry.rescueBySeed[seed]),
  ));
  successful.sort((a, b) => a.kernel.length - b.kernel.length || a.name.localeCompare(b.name));
  return successful[0] ?? null;
}

export function validateV3CandidateEvents(events: readonly PFMEventForReplay[]): void {
  const present = new Set(events.filter((event) => event.targetZone === 9).map((event) => event.blockIndex));
  for (const blockIndex of NECESSITY_SCAN_BLOCKS) {
    if (!present.has(blockIndex)) throw new Error("Canonical V3 history lacks required Zone-9 block " + blockIndex);
  }
}

export function v3PreflightSummary() {
  return Object.freeze({
    protocolId: PAPER_6_C1_POTENTIATION_GRAMMAR_V3.protocolId,
    status: PAPER_6_C1_POTENTIATION_GRAMMAR_V3.status,
    sourceCheckpoints: 6,
    conditions: v3ConditionCount(),
    stageAReplays: expectedV3ReplayCount(),
    rawSteps: expectedV3RawStepCount(),
    necessityScanBlocks: [...NECESSITY_SCAN_BLOCKS],
    rescueKernels: PAPER_6_C1_POTENTIATION_GRAMMAR_V3.conditions.rescueKernels,
  });
}
