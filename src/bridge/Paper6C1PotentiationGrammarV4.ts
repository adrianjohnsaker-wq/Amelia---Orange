/**
 * PAPER_6_C1_POTENTIATION_GRAMMAR_V4
 *
 * Temporal Transposition: a prospective, native-C1-only assay of whether the
 * V3 minimum sufficient Zone-9 kernel is portable across the D72→D108
 * interval or depends on its native developmental placement.
 *
 * This module is deliberately a new source artifact.  It reads the sealed V3
 * archive only through an explicit binding and does not mutate, re-score, or
 * re-seal V1, V2, or V3.
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

export const V4_SOURCE_SEEDS = [101, 202, 303] as const;
export const V4_BRANCH_SEEDS = [101, 202, 303] as const;
export const V4_LOWER_DEPTH = 72;
export const V4_UPPER_DEPTH = 108;
export const V4_OBSERVATION_STEPS = 180;
export const V4_DEGREE_PRESERVING_NULL_COUNT = 100;
export const V4_TOPOLOGY_COUNT = 1 + V4_DEGREE_PRESERVING_NULL_COUNT;
export const V4_KERNEL_LENGTH = 9;

/**
 * These are placements of exactly the same nine Zone-9 addresses.  They are
 * fixed before execution: early, native, and late are not selected from V4
 * outcomes.  The single-block overlap at 84 and 92 is intentional: the
 * kernel is transposed by eight developmental blocks in either direction.
 */
export const V4_CONDITIONS = [
  {
    id: "NEUTRAL_REFERENCE",
    role: "REFERENCE",
    kernel: [],
    description: "Exact matched-neutral D72→D108 continuation; no address replacement.",
  },
  {
    id: "EARLY_76_84",
    role: "TRANSPOSITION",
    kernel: [76, 77, 78, 79, 80, 81, 82, 83, 84],
    description: "The V3 nine-event Zone-9 kernel transposed eight blocks early.",
  },
  {
    id: "NATIVE_84_92_REFERENCE",
    role: "FIXED_V3_REFERENCE",
    kernel: [84, 85, 86, 87, 88, 89, 90, 91, 92],
    description: "The exact V3 RESCUE_84_92 placement, regenerated as V4's fixed reference.",
  },
  {
    id: "LATE_92_100",
    role: "TRANSPOSITION",
    kernel: [92, 93, 94, 95, 96, 97, 98, 99, 100],
    description: "The V3 nine-event Zone-9 kernel transposed eight blocks late.",
  },
] as const;

export type V4ConditionId = (typeof V4_CONDITIONS)[number]["id"];
export type V4Condition = (typeof V4_CONDITIONS)[number];
export type V4Conclusion =
  | "REFERENCE_CONTRAST_NOT_REPRODUCED"
  | "PHASE_POSITIONED_WITHIN_TESTED_WINDOW"
  | "PORTABLE_WITHIN_TESTED_WINDOW"
  | "POSITION_SENSITIVE_MIXED";

/** Immutable V3 materials to which V4 is bound, never a writable archive. */
export const V3_CLOSED_ARCHIVE_BINDING = Object.freeze({
  authoritativePreflightSeal: "09a79f2d79972d3f79e2572948cc47c05871629b3024166a4b40bab720a82ef3",
  archiveManifestDigest: "d88402a655939bacf79ec56b04bb90c434a9b868a99e0d89a247715c3c6ebe8f",
  rawReplayDigestChain: "b86710553dea4dbcc02cfecd8bd07c3c97cb445d0dd019c3c29f55325106a2f8",
  masterArchivalSeal: "246561bc32f850096fc3423a2002095b0002a76e4db11cd594600c1db27aa500",
  closureDisposition: "HISTORY_CONDITIONED_TEMPORAL_APERTURE_KERNEL_IDENTIFIED",
} as const);

export const PAPER_6_C1_POTENTIATION_GRAMMAR_V4 = Object.freeze({
  protocolId: "PAPER_6_C1_POTENTIATION_GRAMMAR_V4",
  status: "PROSPECTIVE_INTEGRATION_READY_UNSEALED",
  predecessors: {
    V1: {
      archiveDigest: "1e1b1f2de377fa290c5090cdc5142cd3f1dce677c8c3a6596c0610d0437f6d24",
      disposition: "IMMUTABLE_CLOSED_NOT_REANALYSED",
    },
    V2: {
      closureSeal: "47e94c8b2fa8104399e525164d78b87ce01d89886d34e94b0f9aa42e1281cb9f",
      disposition: "IMMUTABLE_CLOSED_NOT_REANALYSED",
    },
    V3: V3_CLOSED_ARCHIVE_BINDING,
  },
  question:
    "Is the V3 84-to-92 Zone-9 kernel sufficient because of its nine-event composition, or only because it arrives at the native developmental phase?",
  fixedContext: {
    sourceCheckpoints: ["D72_EVEN_POLE_NEUTRAL"],
    sourceSeeds: V4_SOURCE_SEEDS,
    conditioningInterval: [V4_LOWER_DEPTH, V4_UPPER_DEPTH],
    exactV2PhaseResolvedChallenge: "REUSE_SEALED_V3_PER_SOURCE_SEED_AND_BRANCH_SEED_SCHEDULE_DIGESTS",
    topology: "N0_PLUS_100_DEGREE_PRESERVING_NULLS",
    branchSeeds: V4_BRANCH_SEEDS,
    observationSteps: V4_OBSERVATION_STEPS,
    guidance: "OFF",
    relaySteering: "SUPPRESSED",
  },
  conditions: V4_CONDITIONS,
  preflight: {
    neutralRegeneration: "D72_NEUTRAL_TO_D108_MUST_MATCH_SEALED_V3_NEUTRAL_D108_DIGEST_PER_SEED",
    replayParity: [
      "complete_native_C1_and_full_PFM_history_preserved",
      "only_predeclared_target_addresses_replaced",
      "event_count_block_timing_flux_and_strain_preserved",
      "all_non_replaced_event_digests_preserved",
      "topology_and_non_topology_state_preserved_before_downstream_replay",
      "exact_V3_phase_resolved_challenge_schedule_reused",
    ],
    rawBeforeScoring: true,
  },
  interpretation: {
    phasePositioned:
      "The native 84–92 reference reproduces the sealed V3 native reference, while neither early nor late placement does so across all source seeds.",
    portable:
      "Early, native, and late placements all reproduce the sealed V3 native reference across all source seeds.",
    mixed:
      "At least one non-native placement reproduces the native reference and at least one does not; report the placement profile without promoting a binary conclusion.",
    nonAuthorising: true,
  },
  integrity: {
    rawBeforeScoring: true,
    appendOnlyNewV4Archive: true,
    noPostHocPlacementOrKernelChanges: true,
    noSyntheticSubstrate: true,
    failClosed: true,
  },
} as const);

export interface V3SealedReference {
  sourceSeed: number;
  conditionId: "NEUTRAL_REFERENCE" | "RESCUE_84_92";
  distribution: RegimeDistribution;
}

/**
 * The integration layer must read this data from the sealed V3 archive.  The
 * values are not duplicated into V4 source code, preventing a mutable source
 * module from standing in for raw archival evidence.
 */
export interface V4ArchiveBinding {
  authoritativePreflightSeal: string;
  archiveManifestDigest: string;
  rawReplayDigestChain: string;
  masterArchivalSeal: string;
  classifierDigest: string;
  phaseResolvedChallengeDigests: Readonly<Record<string, string>>;
  neutralReferenceBySeed: Readonly<Record<number, V3SealedReference>>;
  nativeRescue84To92BySeed: Readonly<Record<number, V3SealedReference>>;
}

export interface ConditioningIntervalAudit {
  sourceSeed: number;
  lowerCheckpointDigest: string;
  upperCheckpointDigest: string;
  appliedReplacements: readonly ConditioningTargetReplacement[];
  eventCountPreserved: boolean;
  nonReplacedEventDigestsPreserved: boolean;
  blockTimingPreserved: boolean;
  fluxAndStrainPreserved: boolean;
  topologyPreserved: boolean;
  nonTopologyStatePreserved: boolean;
}

/**
 * V4 requires an active audit of each native conditioning replay.  A runtime
 * that cannot expose this verification is inadmissible rather than silently
 * approximated by a test harness.
 */
export interface TemporalTranspositionV4Adapter extends PotentiationGrammarV3Adapter {
  auditConditioningIntervalReplay(args: {
    lowerCheckpoint: CheckpointSealForReplay;
    upperCheckpoint: CheckpointSealForReplay;
    upperDepth: number;
    replacements: readonly ConditioningTargetReplacement[];
  }): Promise<ConditioningIntervalAudit>;
}

export interface V4PreflightInput {
  adapter: unknown;
  neutralD72Checkpoints: readonly CheckpointSealForReplay[];
  expectedNeutralD108CheckpointDigests: Readonly<Record<number, string>>;
  archiveBinding: V4ArchiveBinding;
}

export interface V4PreflightReport {
  protocolId: string;
  sourceCheckpointCount: number;
  conditionCount: number;
  expectedReplays: number;
  expectedRawStepRecords: number;
  regeneratedNeutralD108BySeed: Readonly<Record<number, CheckpointSealForReplay>>;
}

export interface V4RawReplayRecord {
  protocolId: string;
  executionId: string;
  sourceSeed: number;
  conditionId: V4ConditionId;
  replacementBlocks: readonly number[];
  topologyKind: "N0" | "DEGREE_PRESERVING_NULL";
  topologyIndex: number;
  branchSeed: number;
  lowerCheckpointDigest: string;
  conditioningCheckpointDigest: string;
  conditioningAudit: ConditioningIntervalAudit;
  phaseResolvedChallengeDigest: string;
  rawSteps: readonly unknown[];
  regime: RegimeObservation;
}

export interface V4ArchiveReceipt {
  recordId: string;
  recordDigest: string;
}

export interface V4ExecutionInput extends V4PreflightInput {
  executionId: string;
  appendRawReplay(record: V4RawReplayRecord): Promise<V4ArchiveReceipt>;
}

export interface V4ArchivedReplay {
  record: V4RawReplayRecord;
  receipt: V4ArchiveReceipt;
}

export interface V4PlacementComparison {
  conditionId: V4ConditionId;
  allSourceSeedsMatchV3Native: boolean;
  minimumPerSeedJsdToV3Native: number;
  perSeed: Readonly<Record<number, { modalMatch: boolean; jsdBits: number }>>;
}

export interface V4Analysis {
  distributionsByCondition: Readonly<Record<V4ConditionId, Readonly<Record<number, RegimeDistribution>>>>;
  neutralReferenceReproduced: boolean;
  neutralRemainsDistinctFromNative: boolean;
  comparisons: readonly V4PlacementComparison[];
  conclusion: V4Conclusion;
}

export interface V4ExecutionResult {
  preflight: V4PreflightReport;
  archivedReplays: readonly V4ArchivedReplay[];
  analysis: V4Analysis;
}

const SHA256_HEX = /^[a-f0-9]{64}$/;

function assertSha256(value: string, name: string): void {
  if (!SHA256_HEX.test(value)) throw new Error(`${name} must be a lower-case SHA-256 digest.`);
}

function assertDistribution(distribution: RegimeDistribution, label: string): void {
  if (!Number.isSafeInteger(distribution.sampleSize) || distribution.sampleSize <= 0) {
    throw new Error(`${label} has an invalid sampleSize.`);
  }
  if (!Number.isFinite(distribution.gridMass) || distribution.gridMass < 0 || distribution.gridMass > 1) {
    throw new Error(`${label} has an invalid gridMass.`);
  }
  const entries = Object.entries(distribution.mass);
  if (entries.length === 0) throw new Error(`${label} has an empty regime distribution.`);
  const totalMass = entries.reduce((sum, [, mass]) => {
    if (!Number.isFinite(mass) || mass < 0) throw new Error(`${label} has an invalid regime mass.`);
    return sum + mass;
  }, 0);
  if (Math.abs(totalMass - 1) > 1e-9) throw new Error(`${label} regime mass does not sum to one.`);
}

function modalLabel(distribution: RegimeDistribution): string {
  assertDistribution(distribution, "Regime distribution");
  return Object.entries(distribution.mass)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0][0];
}

function challengeKey(sourceSeed: number, branchSeed: number): string {
  return `${sourceSeed}:${branchSeed}`;
}

function conditionById(conditionId: V4ConditionId): V4Condition {
  const condition = V4_CONDITIONS.find((candidate) => candidate.id === conditionId);
  if (!condition) throw new Error(`Unknown V4 condition: ${conditionId}`);
  return condition;
}

function assertNineBlockKernel(condition: V4Condition): void {
  if (condition.id === "NEUTRAL_REFERENCE") {
    if (condition.kernel.length !== 0) throw new Error("Neutral reference cannot contain a replacement kernel.");
    return;
  }
  if (condition.kernel.length !== V4_KERNEL_LENGTH) {
    throw new Error(`${condition.id} must contain exactly ${V4_KERNEL_LENGTH} blocks.`);
  }
  for (let index = 0; index < condition.kernel.length; index++) {
    const expected = condition.kernel[0] + index;
    if (condition.kernel[index] !== expected) throw new Error(`${condition.id} must be contiguous.`);
    if (condition.kernel[index] <= V4_LOWER_DEPTH || condition.kernel[index] >= V4_UPPER_DEPTH) {
      throw new Error(`${condition.id} lies outside the open D72→D108 conditioning interval.`);
    }
  }
}

for (const condition of V4_CONDITIONS) assertNineBlockKernel(condition);

export function v4Replacements(conditionId: V4ConditionId): readonly ConditioningTargetReplacement[] {
  const condition = conditionById(conditionId);
  return condition.kernel.map((blockIndex) => ({ blockIndex, targetZone: 9 }));
}

export function v4ConditionCount(): number {
  return V4_CONDITIONS.length;
}

export function expectedV4ReplayCount(): number {
  const count = v4ConditionCount() * V4_SOURCE_SEEDS.length * V4_TOPOLOGY_COUNT * V4_BRANCH_SEEDS.length;
  if (count !== 3_636) {
    throw new Error(`[V4 Fail-Closed Arithmetic Error] expected exactly 3,636 replays, received ${count}.`);
  }
  return count;
}

export function expectedV4RawStepCount(): number {
  const count = expectedV4ReplayCount() * V4_OBSERVATION_STEPS;
  if (count !== 654_480) {
    throw new Error(`[V4 Fail-Closed Arithmetic Error] expected exactly 654,480 raw step records, received ${count}.`);
  }
  return count;
}

function assertReference(reference: V3SealedReference, seed: number, expectedCondition: V3SealedReference["conditionId"]): void {
  if (reference.sourceSeed !== seed) throw new Error(`V3 reference is assigned to the wrong source seed: ${seed}.`);
  if (reference.conditionId !== expectedCondition) {
    throw new Error(`V3 ${seed} reference must be ${expectedCondition}.`);
  }
  assertDistribution(reference.distribution, `V3 ${expectedCondition} reference for source seed ${seed}`);
}

export function assertV4ArchiveBinding(binding: V4ArchiveBinding): void {
  if (binding.authoritativePreflightSeal !== V3_CLOSED_ARCHIVE_BINDING.authoritativePreflightSeal) {
    throw new Error("V4 rejects a V3 binding with a different authoritative preflight seal.");
  }
  if (binding.archiveManifestDigest !== V3_CLOSED_ARCHIVE_BINDING.archiveManifestDigest) {
    throw new Error("V4 rejects a V3 binding with a different archive manifest digest.");
  }
  if (binding.rawReplayDigestChain !== V3_CLOSED_ARCHIVE_BINDING.rawReplayDigestChain) {
    throw new Error("V4 rejects a V3 binding with a different raw replay digest chain.");
  }
  if (binding.masterArchivalSeal !== V3_CLOSED_ARCHIVE_BINDING.masterArchivalSeal) {
    throw new Error("V4 rejects a V3 binding with a different master archival seal.");
  }
  assertSha256(binding.classifierDigest, "V3 classifier digest");
  for (const sourceSeed of V4_SOURCE_SEEDS) {
    assertReference(binding.neutralReferenceBySeed[sourceSeed], sourceSeed, "NEUTRAL_REFERENCE");
    assertReference(binding.nativeRescue84To92BySeed[sourceSeed], sourceSeed, "RESCUE_84_92");
    for (const branchSeed of V4_BRANCH_SEEDS) {
      assertSha256(
        binding.phaseResolvedChallengeDigests[challengeKey(sourceSeed, branchSeed)],
        `V3 phase-resolved challenge digest for ${sourceSeed}/${branchSeed}`,
      );
    }
  }
}

export function assertTemporalTranspositionV4Adapter(value: unknown): asserts value is TemporalTranspositionV4Adapter {
  assertPotentiationGrammarV3Adapter(value);
  const adapter = value as unknown as Record<string, unknown>;
  if (typeof adapter.auditConditioningIntervalReplay !== "function") {
    throw new Error("V4 live capability missing: auditConditioningIntervalReplay");
  }
}

function checkpointBySourceSeed(
  checkpoints: readonly CheckpointSealForReplay[],
): Readonly<Record<number, CheckpointSealForReplay>> {
  if (checkpoints.length !== V4_SOURCE_SEEDS.length) {
    throw new Error("V4 requires exactly one sealed matched-neutral D72 checkpoint per source seed.");
  }
  const result: Record<number, CheckpointSealForReplay> = Object.create(null);
  for (const checkpoint of checkpoints) {
    if (!V4_SOURCE_SEEDS.includes(checkpoint.sourceSeed as (typeof V4_SOURCE_SEEDS)[number])) {
      throw new Error(`Unexpected V4 source seed: ${checkpoint.sourceSeed}.`);
    }
    if (checkpoint.conditioningDepth !== V4_LOWER_DEPTH) {
      throw new Error(`V4 source seed ${checkpoint.sourceSeed} is not a D72 checkpoint.`);
    }
    if (result[checkpoint.sourceSeed]) throw new Error(`Duplicate V4 D72 checkpoint for source seed ${checkpoint.sourceSeed}.`);
    assertSha256(checkpoint.checkpointDigest, `D72 checkpoint digest for source seed ${checkpoint.sourceSeed}`);
    assertSha256(checkpoint.nonTopologyDigest, `D72 non-topology digest for source seed ${checkpoint.sourceSeed}`);
    assertSha256(checkpoint.topologyDigest, `D72 topology digest for source seed ${checkpoint.sourceSeed}`);
    assertSha256(checkpoint.pfmTraceDigest, `D72 PFM digest for source seed ${checkpoint.sourceSeed}`);
    result[checkpoint.sourceSeed] = checkpoint;
  }
  for (const seed of V4_SOURCE_SEEDS) {
    if (!result[seed]) throw new Error(`Missing V4 D72 checkpoint for source seed ${seed}.`);
  }
  return result;
}

function sameReplacements(
  left: readonly ConditioningTargetReplacement[],
  right: readonly ConditioningTargetReplacement[],
): boolean {
  return left.length === right.length
    && left.every((replacement, index) =>
      replacement.blockIndex === right[index]?.blockIndex && replacement.targetZone === right[index]?.targetZone,
    );
}

function assertReplayAudit(
  audit: ConditioningIntervalAudit,
  sourceSeed: number,
  lowerCheckpoint: CheckpointSealForReplay,
  upperCheckpoint: CheckpointSealForReplay,
  replacements: readonly ConditioningTargetReplacement[],
): void {
  if (audit.sourceSeed !== sourceSeed) throw new Error(`V4 replay audit has the wrong source seed: ${sourceSeed}.`);
  if (audit.lowerCheckpointDigest !== lowerCheckpoint.checkpointDigest) {
    throw new Error(`V4 replay audit does not bind the D72 checkpoint for source seed ${sourceSeed}.`);
  }
  if (audit.upperCheckpointDigest !== upperCheckpoint.checkpointDigest) {
    throw new Error(`V4 replay audit does not bind the D108 checkpoint for source seed ${sourceSeed}.`);
  }
  if (!sameReplacements(audit.appliedReplacements, replacements)) {
    throw new Error(`V4 replay audit replacement mismatch for source seed ${sourceSeed}.`);
  }
  for (const [name, passed] of Object.entries({
    eventCountPreserved: audit.eventCountPreserved,
    nonReplacedEventDigestsPreserved: audit.nonReplacedEventDigestsPreserved,
    blockTimingPreserved: audit.blockTimingPreserved,
    fluxAndStrainPreserved: audit.fluxAndStrainPreserved,
    topologyPreserved: audit.topologyPreserved,
    nonTopologyStatePreserved: audit.nonTopologyStatePreserved,
  })) {
    if (passed !== true) throw new Error(`V4 replay audit failed ${name} for source seed ${sourceSeed}.`);
  }
}

/**
 * This is the V4 release gate.  It executes only deterministic regeneration
 * of the sealed neutral D72→D108 path and returns no result scoring.
 */
export async function runV4Preflight(input: V4PreflightInput): Promise<V4PreflightReport> {
  assertTemporalTranspositionV4Adapter(input.adapter);
  assertV4ArchiveBinding(input.archiveBinding);
  const adapter = input.adapter;
  const sourceCheckpoints = checkpointBySourceSeed(input.neutralD72Checkpoints);
  const regeneratedNeutralD108BySeed: Record<number, CheckpointSealForReplay> = Object.create(null);

  for (const sourceSeed of V4_SOURCE_SEEDS) {
    const lowerCheckpoint = sourceCheckpoints[sourceSeed];
    const expectedDigest = input.expectedNeutralD108CheckpointDigests[sourceSeed];
    assertSha256(expectedDigest, `Sealed V3 neutral D108 checkpoint digest for source seed ${sourceSeed}`);
    const replacements: readonly ConditioningTargetReplacement[] = [];
    const regenerated = await adapter.replayConditioningIntervalWithReplacements({
      lowerCheckpoint,
      upperDepth: V4_UPPER_DEPTH,
      replacements,
    });
    if (regenerated.sourceSeed !== sourceSeed || regenerated.conditioningDepth !== V4_UPPER_DEPTH) {
      throw new Error(`V4 neutral regeneration returned the wrong checkpoint for source seed ${sourceSeed}.`);
    }
    if (regenerated.checkpointDigest !== expectedDigest) {
      throw new Error(`V4 neutral regeneration does not match the sealed V3 D108 digest for source seed ${sourceSeed}.`);
    }
    const audit = await adapter.auditConditioningIntervalReplay({
      lowerCheckpoint,
      upperCheckpoint: regenerated,
      upperDepth: V4_UPPER_DEPTH,
      replacements,
    });
    assertReplayAudit(audit, sourceSeed, lowerCheckpoint, regenerated, replacements);
    regeneratedNeutralD108BySeed[sourceSeed] = regenerated;
  }

  return Object.freeze({
    protocolId: PAPER_6_C1_POTENTIATION_GRAMMAR_V4.protocolId,
    sourceCheckpointCount: V4_SOURCE_SEEDS.length,
    conditionCount: v4ConditionCount(),
    expectedReplays: expectedV4ReplayCount(),
    expectedRawStepRecords: expectedV4RawStepCount(),
    regeneratedNeutralD108BySeed: Object.freeze(regeneratedNeutralD108BySeed),
  });
}

interface TopologyCase {
  kind: "N0" | "DEGREE_PRESERVING_NULL";
  index: number;
  topology: unknown;
}

async function createFixedTopologyCohort(
  adapter: TemporalTranspositionV4Adapter,
  lowerCheckpoint: CheckpointSealForReplay,
  sourceSeed: number,
  executionId: string,
): Promise<readonly TopologyCase[]> {
  await adapter.hydrateCompleteCheckpoint(lowerCheckpoint);
  const nativeTopology = await adapter.captureTopology();
  const nulls = await adapter.createDegreePreservingNulls({
    topology: nativeTopology,
    count: V4_DEGREE_PRESERVING_NULL_COUNT,
    namespace: `P6-V4-${executionId}-source-${sourceSeed}`,
  });
  if (nulls.length !== V4_DEGREE_PRESERVING_NULL_COUNT) {
    throw new Error(`V4 topology cohort is incomplete for source seed ${sourceSeed}.`);
  }
  return [
    { kind: "N0" as const, index: 0, topology: nativeTopology },
    ...nulls.map((topology, index) => ({ kind: "DEGREE_PRESERVING_NULL" as const, index: index + 1, topology })),
  ];
}

async function executeOneV4Replay(args: {
  adapter: TemporalTranspositionV4Adapter;
  archiveBinding: V4ArchiveBinding;
  executionId: string;
  sourceSeed: number;
  condition: V4Condition;
  lowerCheckpoint: CheckpointSealForReplay;
  conditioningCheckpoint: CheckpointSealForReplay;
  conditioningAudit: ConditioningIntervalAudit;
  topology: TopologyCase;
  branchSeed: number;
}): Promise<V4RawReplayRecord> {
  const {
    adapter,
    archiveBinding,
    executionId,
    sourceSeed,
    condition,
    lowerCheckpoint,
    conditioningCheckpoint,
    conditioningAudit,
    topology,
    branchSeed,
  } = args;

  await adapter.hydrateCompleteCheckpoint(conditioningCheckpoint);
  if (await adapter.digestNonTopologyState() !== conditioningCheckpoint.nonTopologyDigest) {
    throw new Error(`V4 hydration changes non-topology state for source seed ${sourceSeed}.`);
  }
  await adapter.applyTopology(topology.topology);
  if (await adapter.digestNonTopologyState() !== conditioningCheckpoint.nonTopologyDigest) {
    throw new Error(`V4 topology application changes non-topology state for source seed ${sourceSeed}.`);
  }
  await adapter.restoreBranchPrng({ sourceSeed, branchSeed });
  await adapter.setGuidanceOffAndSuppressRelaySteering();
  const challenge = await adapter.createSealedPhaseResolvedChallenge({ sourceSeed, branchSeed });
  const phaseResolvedChallengeDigest = await adapter.phaseResolvedChallengeDigest(challenge);
  const expectedChallengeDigest = archiveBinding.phaseResolvedChallengeDigests[challengeKey(sourceSeed, branchSeed)];
  if (phaseResolvedChallengeDigest !== expectedChallengeDigest) {
    throw new Error(`V4 does not reproduce the sealed V3 challenge schedule for ${sourceSeed}/${branchSeed}.`);
  }

  const rawSteps: unknown[] = [];
  for (let stepIndex = 0; stepIndex < V4_OBSERVATION_STEPS; stepIndex++) {
    await adapter.applyPhaseResolvedChallengeStep(challenge, stepIndex);
    rawSteps.push(await adapter.stepAndObserve(stepIndex));
  }
  const regime = await adapter.classifyFullTrajectory(rawSteps);
  if (regime.classifierDigest !== archiveBinding.classifierDigest) {
    throw new Error(`V4 classifier digest differs from the sealed V3 classifier for source seed ${sourceSeed}.`);
  }

  return {
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
}

function assertArchiveReceipt(receipt: V4ArchiveReceipt): void {
  if (!receipt.recordId) throw new Error("V4 raw archive returned an empty record identifier.");
  assertSha256(receipt.recordDigest, "V4 raw archive record digest");
}

function sameNumberSequence(left: readonly number[], right: readonly number[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function assertArchivedReplayRecord(record: V4RawReplayRecord, archiveBinding: V4ArchiveBinding): void {
  if (record.protocolId !== PAPER_6_C1_POTENTIATION_GRAMMAR_V4.protocolId) {
    throw new Error("V4 archive contains a raw record from another protocol.");
  }
  if (!V4_SOURCE_SEEDS.includes(record.sourceSeed as (typeof V4_SOURCE_SEEDS)[number])) {
    throw new Error(`V4 archive contains an unexpected source seed: ${record.sourceSeed}.`);
  }
  if (!V4_BRANCH_SEEDS.includes(record.branchSeed as (typeof V4_BRANCH_SEEDS)[number])) {
    throw new Error(`V4 archive contains an unexpected branch seed: ${record.branchSeed}.`);
  }
  if (!V4_CONDITIONS.some((condition) => condition.id === record.conditionId)) {
    throw new Error(`V4 archive contains an unknown condition: ${record.conditionId}.`);
  }
  const condition = conditionById(record.conditionId);
  if (!sameNumberSequence(record.replacementBlocks, condition.kernel)) {
    throw new Error(`V4 archive replacement blocks do not match ${record.conditionId}.`);
  }
  if (!Number.isSafeInteger(record.topologyIndex) || record.topologyIndex < 0 || record.topologyIndex >= V4_TOPOLOGY_COUNT) {
    throw new Error("V4 archive contains an invalid topology index.");
  }
  if ((record.topologyIndex === 0 && record.topologyKind !== "N0")
    || (record.topologyIndex > 0 && record.topologyKind !== "DEGREE_PRESERVING_NULL")) {
    throw new Error("V4 archive topology kind does not match its fixed cohort index.");
  }
  if (record.rawSteps.length !== V4_OBSERVATION_STEPS) {
    throw new Error("V4 archive contains a replay with the wrong observation length.");
  }
  assertSha256(record.lowerCheckpointDigest, "V4 archived lower checkpoint digest");
  assertSha256(record.conditioningCheckpointDigest, "V4 archived conditioning checkpoint digest");
  if (record.regime.classifierDigest !== archiveBinding.classifierDigest) {
    throw new Error("V4 archive contains a regime classified by a non-sealed classifier.");
  }
  if (record.phaseResolvedChallengeDigest !== archiveBinding.phaseResolvedChallengeDigests[
    challengeKey(record.sourceSeed, record.branchSeed)
  ]) {
    throw new Error("V4 archive contains a replay using a non-sealed phase-resolved challenge.");
  }
  if (record.conditioningAudit.sourceSeed !== record.sourceSeed
    || record.conditioningAudit.lowerCheckpointDigest !== record.lowerCheckpointDigest
    || record.conditioningAudit.upperCheckpointDigest !== record.conditioningCheckpointDigest
    || !sameReplacements(record.conditioningAudit.appliedReplacements, v4Replacements(record.conditionId))) {
    throw new Error("V4 archive conditioning audit does not bind its raw replay.");
  }
  for (const passed of [
    record.conditioningAudit.eventCountPreserved,
    record.conditioningAudit.nonReplacedEventDigestsPreserved,
    record.conditioningAudit.blockTimingPreserved,
    record.conditioningAudit.fluxAndStrainPreserved,
    record.conditioningAudit.topologyPreserved,
    record.conditioningAudit.nonTopologyStatePreserved,
  ]) {
    if (passed !== true) throw new Error("V4 archive contains a replay whose interval audit did not pass.");
  }
}

function conditionDistributionsFromArchive(
  archivedReplays: readonly V4ArchivedReplay[],
  archiveBinding: V4ArchiveBinding,
): Readonly<Record<V4ConditionId, Readonly<Record<number, RegimeDistribution>>>> {
  if (archivedReplays.length !== expectedV4ReplayCount()) {
    throw new Error("V4 cannot score an incomplete raw replay archive.");
  }
  const expectedPerConditionAndSeed = V4_TOPOLOGY_COUNT * V4_BRANCH_SEEDS.length;
  const seenReplayKeys = new Set<string>();
  const results = Object.create(null) as Record<V4ConditionId, Record<number, RegimeDistribution>>;

  for (const condition of V4_CONDITIONS) results[condition.id] = Object.create(null);
  for (const { record, receipt } of archivedReplays) {
    assertArchivedReplayRecord(record, archiveBinding);
    assertArchiveReceipt(receipt);
    const key = `${record.executionId}:${record.conditionId}:${record.sourceSeed}:${record.topologyIndex}:${record.branchSeed}`;
    if (seenReplayKeys.has(key)) throw new Error(`V4 archive contains a duplicate replay: ${key}.`);
    seenReplayKeys.add(key);
  }
  for (const condition of V4_CONDITIONS) {
    for (const sourceSeed of V4_SOURCE_SEEDS) {
      const matching = archivedReplays.filter(({ record }) =>
        record.conditionId === condition.id && record.sourceSeed === sourceSeed,
      );
      if (matching.length !== expectedPerConditionAndSeed) {
        throw new Error(`V4 archive is incomplete for ${condition.id} / source seed ${sourceSeed}.`);
      }
      results[condition.id][sourceSeed] = distributionFromRegimes(matching.map(({ record }) => record.regime));
    }
  }
  if (seenReplayKeys.size !== expectedV4ReplayCount()) {
    throw new Error("V4 archive replay denominator does not match the fixed matrix.");
  }
  return results;
}

function compareConditionToV3Native(
  conditionId: V4ConditionId,
  distributions: Readonly<Record<number, RegimeDistribution>>,
  archiveBinding: V4ArchiveBinding,
): V4PlacementComparison {
  const perSeed: Record<number, { modalMatch: boolean; jsdBits: number }> = Object.create(null);
  for (const sourceSeed of V4_SOURCE_SEEDS) {
    const observed = distributions[sourceSeed];
    const native = archiveBinding.nativeRescue84To92BySeed[sourceSeed].distribution;
    const jsdBits = jensenShannonBits(observed, native);
    perSeed[sourceSeed] = { modalMatch: modalLabel(observed) === modalLabel(native), jsdBits };
  }
  return {
    conditionId,
    allSourceSeedsMatchV3Native: V4_SOURCE_SEEDS.every((sourceSeed) => perSeed[sourceSeed].modalMatch),
    minimumPerSeedJsdToV3Native: Math.min(...V4_SOURCE_SEEDS.map((sourceSeed) => perSeed[sourceSeed].jsdBits)),
    perSeed,
  };
}

/**
 * Scores only a complete, receipt-verified V4 archive.  The decision uses the
 * already specified all-seed modal correspondence; JSD is reported as a
 * continuous descriptive distance rather than a post-hoc cutoff.
 */
export function analyseV4TemporalTransposition(
  archivedReplays: readonly V4ArchivedReplay[],
  archiveBinding: V4ArchiveBinding,
): V4Analysis {
  assertV4ArchiveBinding(archiveBinding);
  const distributionsByCondition = conditionDistributionsFromArchive(archivedReplays, archiveBinding);
  const neutralReferenceReproduced = V4_SOURCE_SEEDS.every((sourceSeed) =>
    modalLabel(distributionsByCondition.NEUTRAL_REFERENCE[sourceSeed])
      === modalLabel(archiveBinding.neutralReferenceBySeed[sourceSeed].distribution),
  );
  const neutralRemainsDistinctFromNative = V4_SOURCE_SEEDS.every((sourceSeed) =>
    modalLabel(distributionsByCondition.NEUTRAL_REFERENCE[sourceSeed])
      !== modalLabel(archiveBinding.nativeRescue84To92BySeed[sourceSeed].distribution),
  );
  const comparisons = V4_CONDITIONS
    .filter((condition) => condition.id !== "NEUTRAL_REFERENCE")
    .map((condition) => compareConditionToV3Native(condition.id, distributionsByCondition[condition.id], archiveBinding));
  const native = comparisons.find((comparison) => comparison.conditionId === "NATIVE_84_92_REFERENCE");
  const early = comparisons.find((comparison) => comparison.conditionId === "EARLY_76_84");
  const late = comparisons.find((comparison) => comparison.conditionId === "LATE_92_100");
  if (!native || !early || !late) throw new Error("V4 condition registry is incomplete.");

  let conclusion: V4Conclusion;
  if (!neutralReferenceReproduced || !neutralRemainsDistinctFromNative || !native.allSourceSeedsMatchV3Native) {
    conclusion = "REFERENCE_CONTRAST_NOT_REPRODUCED";
  } else if (early.allSourceSeedsMatchV3Native && late.allSourceSeedsMatchV3Native) {
    conclusion = "PORTABLE_WITHIN_TESTED_WINDOW";
  } else if (!early.allSourceSeedsMatchV3Native && !late.allSourceSeedsMatchV3Native) {
    conclusion = "PHASE_POSITIONED_WITHIN_TESTED_WINDOW";
  } else {
    conclusion = "POSITION_SENSITIVE_MIXED";
  }

  return { distributionsByCondition, neutralReferenceReproduced, neutralRemainsDistinctFromNative, comparisons, conclusion };
}

/**
 * The runner is provided for the live integration layer but is intentionally
 * not invoked at module load.  Running it creates a new V4 archive only; it
 * cannot alter the closed V1–V3 archive chain.
 */
export async function executeV4TemporalTransposition(input: V4ExecutionInput): Promise<V4ExecutionResult> {
  const preflight = await runV4Preflight(input);
  assertTemporalTranspositionV4Adapter(input.adapter);
  const adapter = input.adapter;
  const sourceCheckpoints = checkpointBySourceSeed(input.neutralD72Checkpoints);
  const archivedReplays: V4ArchivedReplay[] = [];

  for (const sourceSeed of V4_SOURCE_SEEDS) {
    const lowerCheckpoint = sourceCheckpoints[sourceSeed];
    const topologyCohort = await createFixedTopologyCohort(adapter, lowerCheckpoint, sourceSeed, input.executionId);
    for (const condition of V4_CONDITIONS) {
      const replacements = v4Replacements(condition.id);
      const conditioningCheckpoint = condition.id === "NEUTRAL_REFERENCE"
        ? preflight.regeneratedNeutralD108BySeed[sourceSeed]
        : await adapter.replayConditioningIntervalWithReplacements({
          lowerCheckpoint,
          upperDepth: V4_UPPER_DEPTH,
          replacements,
        });
      if (conditioningCheckpoint.sourceSeed !== sourceSeed || conditioningCheckpoint.conditioningDepth !== V4_UPPER_DEPTH) {
        throw new Error(`V4 ${condition.id} returned the wrong D108 checkpoint for source seed ${sourceSeed}.`);
      }
      const conditioningAudit = await adapter.auditConditioningIntervalReplay({
        lowerCheckpoint,
        upperCheckpoint: conditioningCheckpoint,
        upperDepth: V4_UPPER_DEPTH,
        replacements,
      });
      assertReplayAudit(conditioningAudit, sourceSeed, lowerCheckpoint, conditioningCheckpoint, replacements);

      for (const topology of topologyCohort) {
        for (const branchSeed of V4_BRANCH_SEEDS) {
          const record = await executeOneV4Replay({
            adapter,
            archiveBinding: input.archiveBinding,
            executionId: input.executionId,
            sourceSeed,
            condition,
            lowerCheckpoint,
            conditioningCheckpoint,
            conditioningAudit,
            topology,
            branchSeed,
          });
          const receipt = await input.appendRawReplay(record);
          assertArchiveReceipt(receipt);
          archivedReplays.push({ record, receipt });
        }
      }
    }
  }
  if (archivedReplays.length !== expectedV4ReplayCount()) {
    throw new Error("V4 execution ended before the fixed replay matrix completed.");
  }
  const rawStepCount = archivedReplays.reduce((total, entry) => total + entry.record.rawSteps.length, 0);
  if (rawStepCount !== expectedV4RawStepCount()) {
    throw new Error("V4 raw step denominator does not match the fixed matrix.");
  }
  return { preflight, archivedReplays, analysis: analyseV4TemporalTransposition(archivedReplays, input.archiveBinding) };
}

export function v4PreflightSummary() {
  return Object.freeze({
    protocolId: PAPER_6_C1_POTENTIATION_GRAMMAR_V4.protocolId,
    status: PAPER_6_C1_POTENTIATION_GRAMMAR_V4.status,
    sourceCheckpoints: V4_SOURCE_SEEDS.length,
    conditions: v4ConditionCount(),
    replays: expectedV4ReplayCount(),
    rawStepRecords: expectedV4RawStepCount(),
    placements: V4_CONDITIONS.map(({ id, kernel }) => ({ id, kernel: [...kernel] })),
    predecessorMasterSeal: V3_CLOSED_ARCHIVE_BINDING.masterArchivalSeal,
  });
}

if (process.argv[1]?.endsWith("Paper6C1PotentiationGrammarV4.ts")) {
  console.log(JSON.stringify(v4PreflightSummary(), null, 2));
}
