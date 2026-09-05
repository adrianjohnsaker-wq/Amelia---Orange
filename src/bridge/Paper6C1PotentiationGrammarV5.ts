/**
 * PAPER_6_C1_POTENTIATION_GRAMMAR_V5
 *
 * Fresh-Lineage Late-Window Replication: A prospective, native-C1-only assay
 * testing whether the 92–100 Zone-9 kernel prospectively induces a distinct
 * canalized future from matched-neutral D72 histories in independent lineages.
 *
 * Fresh Source Seeds: [404, 505, 606] (Independent of V3/V4 source lineages).
 * Fixed Conditions:
 *  - NEUTRAL_REFERENCE       : Matched baseline (0 replacements)
 *  - EARLY_76_84             : Displaced control (9 replacements)
 *  - NATIVE_84_92_REFERENCE  : Secondary placement comparator (9 replacements)
 *  - LATE_92_100             : Primary hypothesis arm (9 replacements)
 *
 * Scope & Denominator:
 *  - 4 Conditions × 3 Fresh Source Seeds × 101 Topologies × 3 Branch Seeds = 3,636 Replays.
 *  - 180 Observation Steps per replay = 654,480 Raw Trajectory Records.
 *
 * Prespecified Primary Success Rule:
 *  - Across all 3 fresh seeds (404, 505, 606), late placement (LATE_92_100) has a
 *    Zone-9-canalized modal full-trajectory regime while matched neutral (NEUTRAL_REFERENCE) does not.
 *  - Early and Native are reported as secondary placement profiles, NOT gates inherited
 *    from prior invalid aggregate interpretation records.
 */

import {
  distributionFromRegimes,
  jensenShannonBits,
  type CheckpointSealForReplay,
  type RegimeDistribution,
  type RegimeObservation,
} from "./Paper6C1ReplayAtlasV1";
import {
  assertPotentiationGrammarV3Adapter,
  type ConditioningTargetReplacement,
  type PotentiationGrammarV3Adapter,
} from "./Paper6C1PotentiationGrammarV3";

export const V5_SOURCE_SEEDS = [404, 505, 606] as const;
export const V5_BRANCH_SEEDS = [101, 202, 303] as const;
export const V5_LOWER_DEPTH = 72;
export const V5_UPPER_DEPTH = 108;
export const V5_OBSERVATION_STEPS = 180;
export const V5_DEGREE_PRESERVING_NULL_COUNT = 100;
export const V5_TOPOLOGY_COUNT = 1 + V5_DEGREE_PRESERVING_NULL_COUNT;
export const V5_KERNEL_LENGTH = 9;

export const V5_CONDITIONS = [
  {
    id: "NEUTRAL_REFERENCE",
    role: "MATCHED_BASELINE",
    kernel: [],
    description: "Exact matched-neutral D72→D108 continuation in fresh lineage; no address replacement.",
  },
  {
    id: "EARLY_76_84",
    role: "DISPLACED_CONTROL",
    kernel: [76, 77, 78, 79, 80, 81, 82, 83, 84],
    description: "The nine-event Zone-9 kernel placed at developmental blocks 76..84.",
  },
  {
    id: "NATIVE_84_92_REFERENCE",
    role: "SECONDARY_PLACEMENT_COMPARATOR",
    kernel: [84, 85, 86, 87, 88, 89, 90, 91, 92],
    description: "The nine-event Zone-9 kernel placed at native developmental blocks 84..92.",
  },
  {
    id: "LATE_92_100",
    role: "PRIMARY_HYPOTHESIS_ARM",
    kernel: [92, 93, 94, 95, 96, 97, 98, 99, 100],
    description: "The nine-event Zone-9 kernel placed at late developmental blocks 92..100.",
  },
] as const;

export type V5ConditionId = (typeof V5_CONDITIONS)[number]["id"];
export type V5Condition = (typeof V5_CONDITIONS)[number];

export type V5PrimaryDisposition =
  | "LATE_WINDOW_CANALIZATION_REPLICATED"
  | "LATE_WINDOW_CANALIZATION_NOT_REPLICATED";

export const PAPER_6_C1_POTENTIATION_GRAMMAR_V5 = Object.freeze({
  protocolId: "PAPER_6_C1_POTENTIATION_GRAMMAR_V5",
  title: "Fresh-Lineage Late-Window Replication",
  status: "PROSPECTIVE_SPECIFICATION_LOCKED",
  lineages: {
    nature: "INDEPENDENT_FRESH_SEEDS",
    sourceSeeds: V5_SOURCE_SEEDS,
  },
  question:
    "Can the 92–100 Zone-9 kernel prospectively induce a distinct canalized future from matched-neutral D72 histories in independent lineages?",
  fixedContext: {
    sourceCheckpoints: ["D72_EVEN_POLE_NEUTRAL"],
    sourceSeeds: V5_SOURCE_SEEDS,
    conditioningInterval: [V5_LOWER_DEPTH, V5_UPPER_DEPTH],
    topology: "N0_PLUS_100_DEGREE_PRESERVING_NULLS",
    branchSeeds: V5_BRANCH_SEEDS,
    observationSteps: V5_OBSERVATION_STEPS,
    guidance: "OFF",
    relaySteering: "SUPPRESSED",
  },
  conditions: V5_CONDITIONS,
  primarySuccessRule: {
    criterion: "ALL_FRESH_SEEDS_LATE_Z9_CANALIZED_MODAL_WHILE_NEUTRAL_NOT",
    description:
      "Across all three fresh seeds (404, 505, 606), late placement (92–100) exhibits a Zone-9-canalized modal full-trajectory regime while matched neutral does not.",
    secondaryProfiles:
      "Early (76–84) and Native (84–92) reported as secondary placement profiles, not gates.",
  },
} as const);

export const v5ConditionCount = (): number => V5_CONDITIONS.length;
export const expectedV5ReplayCount = (): number =>
  V5_CONDITIONS.length * V5_SOURCE_SEEDS.length * V5_TOPOLOGY_COUNT * V5_BRANCH_SEEDS.length;
export const expectedV5RawStepCount = (): number =>
  expectedV5ReplayCount() * V5_OBSERVATION_STEPS;

export function v5Replacements(conditionId: V5ConditionId): readonly ConditioningTargetReplacement[] {
  const cond = V5_CONDITIONS.find((c) => c.id === conditionId);
  if (!cond) {
    throw new Error(`[V5] Unknown condition id: ${conditionId}`);
  }
  return cond.kernel.map((blockIndex) => ({
    blockIndex,
    targetZone: 9,
  }));
}

export interface V5RawReplayRecord {
  conditionId: V5ConditionId;
  sourceSeed: number;
  topologyId: string;
  topologyKind: "N0" | "NULL";
  topologyIndex: number;
  branchSeed: number;
  stepDigestChain: string;
  observedRegime: string;
  rawStepCount: number;
}

export function modalRegimeLabel(distribution: RegimeDistribution): string {
  const entries = Object.entries(distribution.mass);
  if (entries.length === 0) return "UNKNOWN";
  return entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
}

export interface V5ConditionSummary {
  conditionId: V5ConditionId;
  role: string;
  kernel: readonly number[];
  replays: number;
  distributionBySeed: Record<number, RegimeDistribution>;
  modalRegimeBySeed: Record<number, string>;
  countsBySeed: Record<number, Record<string, number>>;
  aggregateDistribution: RegimeDistribution;
  aggregateModalRegime: string;
  z9CanalizedModalBySeed: Record<number, boolean>;
  allSeedsZ9Modal: boolean;
  neutralJsdBySeed: Record<number, number>;
  meanNeutralJsd: number;
}

export interface V5Analysis {
  protocolId: string;
  totalReplays: number;
  totalRawSteps: number;
  sourceSeeds: readonly number[];
  conditions: Record<V5ConditionId, V5ConditionSummary>;
  primaryEvaluation: {
    rule: string;
    passed: boolean;
    neutralNonZ9ModalAllSeeds: boolean;
    lateZ9ModalAllSeeds: boolean;
    perSeedBreakdown: {
      seed: number;
      neutralMode: string;
      neutralIsZ9: boolean;
      lateMode: string;
      lateIsZ9: boolean;
      lateVsNeutralJsdBits: number;
      earlyVsNeutralJsdBits: number;
      nativeVsNeutralJsdBits: number;
    }[];
  };
  secondaryProfiles: {
    early76_84: {
      allSeedsZ9Modal: boolean;
      meanJsdVsNeutral: number;
    };
    native84_92: {
      allSeedsZ9Modal: boolean;
      meanJsdVsNeutral: number;
    };
  };
  disposition: V5PrimaryDisposition;
  summaryText: string;
}

export function analyseV5Replication(records: readonly V5RawReplayRecord[]): V5Analysis {
  if (records.length !== expectedV5ReplayCount()) {
    throw new Error(
      `[V5] Incomplete replay matrix. Expected ${expectedV5ReplayCount()}, received ${records.length}.`
    );
  }

  const byCondition: Record<V5ConditionId, V5RawReplayRecord[]> = {
    NEUTRAL_REFERENCE: [],
    EARLY_76_84: [],
    NATIVE_84_92_REFERENCE: [],
    LATE_92_100: [],
  };

  for (const r of records) {
    byCondition[r.conditionId].push(r);
  }

  const conditionSummaries: Record<V5ConditionId, V5ConditionSummary> = {} as any;

  for (const cond of V5_CONDITIONS) {
    const condRecs = byCondition[cond.id];
    const distributionBySeed: Record<number, RegimeDistribution> = {};
    const modalRegimeBySeed: Record<number, string> = {};
    const countsBySeed: Record<number, Record<string, number>> = {};
    const z9CanalizedModalBySeed: Record<number, boolean> = {};

    for (const seed of V5_SOURCE_SEEDS) {
      const seedRecs = condRecs.filter((r) => r.sourceSeed === seed);
      const observations: RegimeObservation[] = seedRecs.map((r) => ({
        label: r.observedRegime,
        isGridRegime: r.observedRegime === "REGIME_HYPERSTITION_CANALIZED_Z9",
        signature: [],
        classifierDigest: "",
      }));
      const dist = distributionFromRegimes(observations);
      distributionBySeed[seed] = dist;
      const mode = modalRegimeLabel(dist);
      modalRegimeBySeed[seed] = mode;

      const counts: Record<string, number> = {};
      for (const r of seedRecs) {
        counts[r.observedRegime] = (counts[r.observedRegime] ?? 0) + 1;
      }
      countsBySeed[seed] = counts;
      z9CanalizedModalBySeed[seed] = mode === "REGIME_HYPERSTITION_CANALIZED_Z9";
    }

    const allObs: RegimeObservation[] = condRecs.map((r) => ({
      label: r.observedRegime,
      isGridRegime: r.observedRegime === "REGIME_HYPERSTITION_CANALIZED_Z9",
      signature: [],
      classifierDigest: "",
    }));
    const aggregateDistribution = distributionFromRegimes(allObs);
    const aggregateModalRegime = modalRegimeLabel(aggregateDistribution);
    const allSeedsZ9Modal = V5_SOURCE_SEEDS.every((s) => z9CanalizedModalBySeed[s]);

    conditionSummaries[cond.id] = {
      conditionId: cond.id,
      role: cond.role,
      kernel: cond.kernel,
      replays: condRecs.length,
      distributionBySeed,
      modalRegimeBySeed,
      countsBySeed,
      aggregateDistribution,
      aggregateModalRegime,
      z9CanalizedModalBySeed,
      allSeedsZ9Modal,
      neutralJsdBySeed: {},
      meanNeutralJsd: 0,
    };
  }

  // Compute JSD vs Neutral for each condition
  const neutralSummary = conditionSummaries["NEUTRAL_REFERENCE"];
  for (const cond of V5_CONDITIONS) {
    if (cond.id === "NEUTRAL_REFERENCE") continue;
    const summary = conditionSummaries[cond.id];
    let jsdSum = 0;
    for (const seed of V5_SOURCE_SEEDS) {
      const jsd = jensenShannonBits(
        neutralSummary.distributionBySeed[seed],
        summary.distributionBySeed[seed]
      );
      summary.neutralJsdBySeed[seed] = jsd;
      jsdSum += jsd;
    }
    summary.meanNeutralJsd = jsdSum / V5_SOURCE_SEEDS.length;
  }

  // Primary evaluation rule
  const neutralNonZ9ModalAllSeeds = V5_SOURCE_SEEDS.every(
    (s) => neutralSummary.modalRegimeBySeed[s] !== "REGIME_HYPERSTITION_CANALIZED_Z9"
  );
  const lateSummary = conditionSummaries["LATE_92_100"];
  const lateZ9ModalAllSeeds = lateSummary.allSeedsZ9Modal;

  const perSeedBreakdown = V5_SOURCE_SEEDS.map((seed) => ({
    seed,
    neutralMode: neutralSummary.modalRegimeBySeed[seed],
    neutralIsZ9: neutralSummary.modalRegimeBySeed[seed] === "REGIME_HYPERSTITION_CANALIZED_Z9",
    lateMode: lateSummary.modalRegimeBySeed[seed],
    lateIsZ9: lateSummary.modalRegimeBySeed[seed] === "REGIME_HYPERSTITION_CANALIZED_Z9",
    lateVsNeutralJsdBits: lateSummary.neutralJsdBySeed[seed],
    earlyVsNeutralJsdBits: conditionSummaries["EARLY_76_84"].neutralJsdBySeed[seed],
    nativeVsNeutralJsdBits: conditionSummaries["NATIVE_84_92_REFERENCE"].neutralJsdBySeed[seed],
  }));

  const primaryPassed = neutralNonZ9ModalAllSeeds && lateZ9ModalAllSeeds;
  const disposition: V5PrimaryDisposition = primaryPassed
    ? "LATE_WINDOW_CANALIZATION_REPLICATED"
    : "LATE_WINDOW_CANALIZATION_NOT_REPLICATED";

  const earlySummary = conditionSummaries["EARLY_76_84"];
  const nativeSummary = conditionSummaries["NATIVE_84_92_REFERENCE"];

  const summaryText = primaryPassed
    ? `V5 Replication SUCCESS: Late-window placement (92–100) induced Zone-9 modal canalization across all three fresh lineages (Seeds ${V5_SOURCE_SEEDS.join(", ")}), whereas matched-neutral histories produced zero Zone-9 modal outcomes. Primary success rule satisfied independently.`
    : `V5 Replication RESULT: Late-window placement (92–100) did not uniformly achieve Zone-9 modal canalization across all fresh lineages. Status: ${disposition}.`;

  return {
    protocolId: PAPER_6_C1_POTENTIATION_GRAMMAR_V5.protocolId,
    totalReplays: records.length,
    totalRawSteps: records.length * V5_OBSERVATION_STEPS,
    sourceSeeds: V5_SOURCE_SEEDS,
    conditions: conditionSummaries,
    primaryEvaluation: {
      rule: "ALL_FRESH_SEEDS_LATE_Z9_CANALIZED_MODAL_WHILE_NEUTRAL_NOT",
      passed: primaryPassed,
      neutralNonZ9ModalAllSeeds,
      lateZ9ModalAllSeeds,
      perSeedBreakdown,
    },
    secondaryProfiles: {
      early76_84: {
        allSeedsZ9Modal: earlySummary.allSeedsZ9Modal,
        meanJsdVsNeutral: earlySummary.meanNeutralJsd,
      },
      native84_92: {
        allSeedsZ9Modal: nativeSummary.allSeedsZ9Modal,
        meanJsdVsNeutral: nativeSummary.meanNeutralJsd,
      },
    },
    disposition,
    summaryText,
  };
}
