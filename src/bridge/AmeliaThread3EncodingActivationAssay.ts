/**
 * AMELIA THREAD 3 PLUS — ENCODING-ACTIVATION SPECIFICITY ASSAY (EASA_V1)
 *
 * Source-bound Google AI Studio runner for a live Amelia experiment.
 *
 * It asks one precise question:
 *   Does a distributed, opaque A1Z26-derived conditioning code produce greater
 *   occupancy of its independently computed digital-root zone than an
 *   energy-matched rotated code or a neutral code?
 *
 * Crucial separation:
 *   - The target zone and source term are used ONLY in post-hoc scoring.
 *   - Amelia receives neither the term nor the target zone during conditioning.
 *   - The live runtime must attest that the opaque vector entered native PFM
 *     update logic and changed the canonical PFM head.
 *   - No synthetic substrate, classifier, receipt, or fallback is supplied.
 *
 * This file contains all protocol, encoding, analysis, and audit logic. The
 * caller supplies exactly two canonical bindings: live cycle execution and
 * create-only archival sealing. If either binding fails to attest its native
 * work, the assay throws and no result is classified.
 *
 * Intended location: the Google AI Studio Amelia project (for example,
 * src/bridge/AmeliaThread3EncodingActivationAssay.ts).
 *
 * Example integration:
 *
 *   const result = await runThread3EncodingAssay(
 *     makeLiveAmeliaBindings(
 *       (input) => runCycleWithBridge(input as CycleInput),
 *       sealIntoCanonicalCreateOnlyArchive,
 *     ),
 *     THREAD3_PILOT_CONFIG,
 *   );
 *   console.log(formatThread3Result(result));
 *
 * The cycle implementation must recognise `encodingActivationV1` in its
 * context, consume ONLY `opaqueVector` in the canonical PFM update path, and
 * return an `encodingActivationReceipt`. Missing receipts are fatal by design.
 */

import { canonicalSha256 } from '../lib/sha256';

export type Zone = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type AssayArm = "ENCODED" | "ROTATED" | "NEUTRAL";
export type GovernorDisposition = "ADMIT" | "DEFER" | "REFUSE" | "ABSTAIN";

const AXIS_TO_ZONE: Record<string, Zone> = {
  "metabolic-integration": 0,
  "canonical-base": 2,
  "hinge-stratum": 4,
  "bifurcation-dissolution": 6,
  "ring-stratum": 9,
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`[THREAD3_EASA_V1] ${message}`);
}

function sortJson(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(sortJson);
  const source = value as Record<string, unknown>;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(source).sort()) sorted[key] = sortJson(source[key]);
  return sorted;
}

function canonicalJson(value: unknown): string {
  return JSON.stringify(sortJson(value));
}

function sha256(value: string): string {
  return canonicalSha256(value);
}

function digest(value: unknown): string {
  return sha256(canonicalJson(value));
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  assert(value !== null && typeof value === "object" && !Array.isArray(value), `${label} must be an object.`);
  return value as Record<string, unknown>;
}

function asNonEmptyString(value: unknown, label: string): string {
  assert(typeof value === "string" && value.trim().length > 0, `${label} must be a non-empty string.`);
  return value;
}

function asZone(value: unknown, label: string): Zone {
  assert(Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 9, `${label} must be an integer zone 0–9.`);
  return Number(value) as Zone;
}

function vectorNorm(vector: readonly number[]): number {
  return Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
}

function mean(values: readonly number[]): number {
  assert(values.length > 0, "Cannot calculate a mean for an empty set.");
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: readonly number[]): number {
  assert(values.length > 0, "Cannot calculate a median for an empty set.");
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function sampleSd(values: readonly number[]): number {
  if (values.length < 2) return 0;
  const center = mean(values);
  return Math.sqrt(values.reduce((sum, value) => sum + (value - center) ** 2, 0) / (values.length - 1));
}

function normaliseLetters(term: string): string {
  const letters = term.toUpperCase().replace(/[^A-Z]/g, "");
  assert(letters.length > 0, `No A–Z letters found in “${term}”.`);
  return letters;
}

function a1z26Values(term: string): number[] {
  return [...normaliseLetters(term)].map((letter) => letter.charCodeAt(0) - 64);
}

/**
 * The analysis target. It is deliberately separate from deriveOpaqueVector().
 * A target zone is never put in Amelia's condition context.
 */
export function a1z26DigitalRootZone(term: string): Zone {
  let total = a1z26Values(term).reduce((sum, value) => sum + value, 0);
  while (total >= 10) total = [...String(total)].reduce((sum, digit) => sum + Number(digit), 0);
  assert(total >= 1 && total <= 9, `A1Z26 digital root for “${term}” is outside 1–9.`);
  return total as Zone;
}

/**
 * A distributed ten-component code built from the ordered A1Z26 letter stream.
 * It is not a one-hot target-zone vector and does not call a1z26DigitalRootZone.
 */
export function deriveOpaqueVector(term: string): number[] {
  const values = a1z26Values(term);
  const raw = Array.from({ length: 10 }, () => 0);

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    const primary = (value + 3 * index) % 10;
    const secondary = (7 * value + 5 * index + 1) % 10;
    raw[primary] += 1 + (value % 5);
    raw[secondary] -= 0.4 + 0.1 * ((value + index) % 3);
  }

  const baseline = mean(raw);
  const centred = raw.map((value) => value - baseline);
  const norm = vectorNorm(centred);
  assert(norm > 0, `Opaque encoding vector for “${term}” has zero norm.`);
  return centred.map((value) => Number((value / norm).toFixed(12)));
}

function rotateVector(vector: readonly number[], rotation: number): number[] {
  assert(vector.length === 10, "Only ten-component vectors may be counterbalanced.");
  const offset = ((rotation % 10) + 10) % 10;
  assert(offset !== 0, "Counterbalanced vector rotation must be non-zero.");
  return vector.map((_, index) => vector[(index - offset + 10) % 10]);
}

function neutralVector(): number[] {
  return Array.from({ length: 10 }, () => 0);
}

export interface ConceptSpec {
  id: string;
  term: string;
  canonicalZone: Zone;
  /** The manuscript's reported internal live-alphabet zone, when it differs. */
  reportedLiveZone?: Zone;
}

export const THREAD3_CHAPTER_CONCEPTS: readonly ConceptSpec[] = [
  { id: "platonic", term: "platonic", canonicalZone: 9 },
  { id: "je-est-un-autre", term: "je est un autre", canonicalZone: 6 },
  { id: "amelia", term: "amelia", canonicalZone: 5 },
  { id: "outside-leaves-trace", term: "the outside leaves a trace", canonicalZone: 4 },
  { id: "platonic-morphospace", term: "platonic morphospace", canonicalZone: 3, reportedLiveZone: 4 },
  { id: "syzygetic", term: "syzygetic", canonicalZone: 4, reportedLiveZone: 5 },
  { id: "xenobot", term: "xenobot", canonicalZone: 5, reportedLiveZone: 2 },
  { id: "levin", term: "levin", canonicalZone: 8, reportedLiveZone: 2 },
  { id: "land", term: "land", canonicalZone: 4 },
  { id: "simondon", term: "simondon", canonicalZone: 4 },
  { id: "overman", term: "overman", canonicalZone: 7 },
  { id: "numogram", term: "numogram", canonicalZone: 3 },
] as const;

export const THREAD3_PILOT_CONCEPTS: readonly ConceptSpec[] = [
  THREAD3_CHAPTER_CONCEPTS[0],
  THREAD3_CHAPTER_CONCEPTS[2],
  THREAD3_CHAPTER_CONCEPTS[5],
  THREAD3_CHAPTER_CONCEPTS[6],
] as const;

export interface Thread3ProtocolConfig {
  protocolId: string;
  protocolVersion: 1;
  concepts: readonly ConceptSpec[];
  seeds: readonly number[];
  arms: readonly AssayArm[];
  conditioningSteps: number;
  observationSteps: number;
  vectorRotation: number;
  bootstrapIterations: number;
  permutationIterations: number;
}

export const THREAD3_PILOT_CONFIG: Thread3ProtocolConfig = {
  protocolId: "AMELIA_THREAD3_ENCODING_ACTIVATION_SPECIFICITY_V1_PILOT",
  protocolVersion: 1,
  concepts: THREAD3_PILOT_CONCEPTS,
  seeds: [101, 202, 303],
  arms: ["ENCODED", "ROTATED", "NEUTRAL"],
  conditioningSteps: 48,
  observationSteps: 72,
  vectorRotation: 3,
  bootstrapIterations: 4_000,
  permutationIterations: 10_000,
};

export const THREAD3_FULL_CONFIG: Thread3ProtocolConfig = {
  ...THREAD3_PILOT_CONFIG,
  protocolId: "AMELIA_THREAD3_ENCODING_ACTIVATION_SPECIFICITY_V1_FULL",
  concepts: THREAD3_CHAPTER_CONCEPTS,
  conditioningSteps: 96,
  observationSteps: 120,
};

export interface OpaqueEncoding {
  algorithm: "A1Z26_ORDERED_DISTRIBUTED_VECTOR_V1";
  sourceTermDigest: string;
  vector: number[];
  vectorDigest: string;
  mappingDigest: string;
  noTextLabel: true;
  noTargetZone: true;
}

function buildOpaqueEncoding(concept: ConceptSpec, arm: AssayArm, config: Thread3ProtocolConfig): OpaqueEncoding {
  const baseVector = deriveOpaqueVector(concept.term);
  const vector = arm === "ENCODED"
    ? baseVector
    : arm === "ROTATED"
      ? rotateVector(baseVector, config.vectorRotation)
      : neutralVector();

  const opaque: OpaqueEncoding = {
    algorithm: "A1Z26_ORDERED_DISTRIBUTED_VECTOR_V1",
    sourceTermDigest: sha256(normaliseLetters(concept.term)),
    vector,
    vectorDigest: digest(vector),
    mappingDigest: digest({ algorithm: "A1Z26_DIGITAL_ROOT_V1", termDigest: sha256(normaliseLetters(concept.term)) }),
    noTextLabel: true,
    noTargetZone: true,
  };
  assertOpaqueEncoding(opaque);
  return opaque;
}

function assertOpaqueEncoding(encoding: OpaqueEncoding): void {
  assert(encoding.vector.length === 10, "Opaque encoding must contain exactly ten components.");
  assert(!Object.prototype.hasOwnProperty.call(encoding, "term"), "Opaque encoding must not contain source text.");
  assert(!Object.prototype.hasOwnProperty.call(encoding, "targetZone"), "Opaque encoding must not contain a target zone.");
  assert(encoding.noTextLabel && encoding.noTargetZone, "Opaque encoding must explicitly attest non-disclosure.");
}

export interface EncodingActivationIngress {
  applied: boolean;
  vectorDigest: string;
  ingressDigest: string;
  nativeMutationDigest: string;
  pfmHeadBefore: string;
  pfmHeadAfter: string;
}

export interface NativeStepReceipt {
  sessionId: string;
  step: number;
  currentZone: Zone;
  /** Null when the Governor records a non-advance decision. */
  selectedExitDigest: string | null;
  pfmHeadDigest: string;
  /** Null when no native transition was admitted. */
  transitionReceiptDigest: string | null;
  governorDisposition: GovernorDisposition;
  governorDecisionDigest: string;
  fieldConfidence?: number;
  phaseCoordinate?: number[];
  encodingActivationReceipt?: EncodingActivationIngress;
}

export interface OpaqueConditioningRequest {
  sessionId: string;
  protocolId?: string;
  protocolDigest?: string;
  trialId?: string;
  seed: number;
  conceptId?: string;
  canonicalZone?: Zone;
  arm?: string | AssayArm;
  conditioningIndex: number;
  opaqueEncoding: OpaqueEncoding;
  /** The native cycle input; it contains no source term or target zone. */
  context: Record<string, unknown>;
  [key: string]: unknown;
}

export interface AutonomousObservationRequest {
  sessionId: string;
  protocolId?: string;
  protocolDigest?: string;
  trialId?: string;
  seed: number;
  conceptId?: string;
  canonicalZone?: Zone;
  arm?: string | AssayArm;
  observationIndex: number;
  /** The observation cycle receives no encoding vector at all. */
  context: Record<string, unknown>;
  [key: string]: unknown;
}

export interface CreateOnlyRecord {
  recordId: string;
  kind: string;
  payload: unknown;
  canonicalPayload: string;
  payloadDigest: string;
}

export interface ArchiveSeal {
  archiveRecordId: string;
  archiveHeadDigest: string;
}

/**
 * The only runtime boundary. Implement these bindings with the canonical live
 * Amelia cycle and its canonical create-only archive; never with a simulation.
 */
export interface LiveAmeliaBindings {
  condition(request: OpaqueConditioningRequest): Promise<NativeStepReceipt>;
  observe(request: AutonomousObservationRequest): Promise<NativeStepReceipt>;
  createOnly(record: CreateOnlyRecord): Promise<ArchiveSeal>;
}

export interface CanonicalCycleInput {
  sessionId: string;
  intent: string;
  context: Record<string, unknown>;
}

export type CanonicalCycleFunction = (input: CanonicalCycleInput) => Promise<unknown>;
export type CanonicalSealFunction = (record: CreateOnlyRecord) => Promise<ArchiveSeal>;

/**
 * Convenience binding for projects whose canonical call is runCycleWithBridge.
 * It is deliberately strict about output fields: a normalised or invented
 * receipt is not permitted.
 */
export function makeLiveAmeliaBindings(
  runCycleWithBridge: CanonicalCycleFunction,
  createOnly: CanonicalSealFunction,
): LiveAmeliaBindings {
  return {
    async condition(request): Promise<NativeStepReceipt> {
      assertOpaqueEncoding(request.opaqueEncoding);
      const output = await runCycleWithBridge({
        sessionId: request.sessionId,
        intent: "THREAD3_ENCODING_ACTIVATION_CONDITION_V1",
        context: request.context,
      });
      return normaliseNativeReceipt(output, request.sessionId, request.conditioningIndex, request.opaqueEncoding.vectorDigest, true);
    },
    async observe(request): Promise<NativeStepReceipt> {
      const output = await runCycleWithBridge({
        sessionId: request.sessionId,
        intent: "THREAD3_ENCODING_ACTIVATION_OBSERVATION_V1",
        context: request.context,
      });
      return normaliseNativeReceipt(output, request.sessionId, request.observationIndex, undefined, false);
    },
    createOnly,
  };
}

function normaliseNativeReceipt(
  raw: unknown,
  expectedSessionId: string,
  step: number,
  expectedVectorDigest: string | undefined,
  conditioning: boolean,
): NativeStepReceipt {
  const output = asRecord(raw, "Native cycle output");
  const sessionId = typeof output.sessionId === "string" ? output.sessionId : expectedSessionId;
  assert(sessionId === expectedSessionId, `Native receipt session mismatch: expected ${expectedSessionId}, received ${sessionId}.`);

  const currentZone = output.currentZone !== undefined
    ? asZone(output.currentZone, "Native output currentZone")
    : (() => {
        const axis = asNonEmptyString(output.attractorAxis, "Native output attractorAxis");
        const zone = AXIS_TO_ZONE[axis];
        assert(zone !== undefined, `Native output attractorAxis “${axis}” cannot be resolved to a zone.`);
        return zone;
      })();

  const governorDisposition = asNonEmptyString(output.governorDisposition, "Native output governorDisposition") as GovernorDisposition;
  assert(["ADMIT", "DEFER", "REFUSE", "ABSTAIN"].includes(governorDisposition), "Native output governorDisposition is invalid.");
  const governorDecisionDigest = asNonEmptyString(
    output.governorDecisionDigest ?? output.governorReceiptDigest ?? output.decisionReceiptDigest,
    "Native output governor decision digest",
  );
  const rawExitDigest = output.selectedExitDigest ?? output.exitDigest ?? output.transitionDigest;
  const rawTransitionReceiptDigest = output.transitionReceiptDigest;
  const selectedExitDigest = typeof rawExitDigest === "string" && rawExitDigest.trim().length > 0 ? rawExitDigest : null;
  const transitionReceiptDigest = typeof rawTransitionReceiptDigest === "string" && rawTransitionReceiptDigest.trim().length > 0
    ? rawTransitionReceiptDigest
    : null;
  const pfmHeadDigest = asNonEmptyString(output.pfmHeadDigest, "Native output pfmHeadDigest");
  if (governorDisposition === "ADMIT") {
    assert(selectedExitDigest !== null, "An ADMIT decision must include selectedExitDigest.");
    assert(transitionReceiptDigest !== null, "An ADMIT decision must include transitionReceiptDigest.");
  }

  const receipt: NativeStepReceipt = {
    sessionId,
    step,
    currentZone,
    selectedExitDigest,
    pfmHeadDigest,
    transitionReceiptDigest,
    governorDisposition,
    governorDecisionDigest,
  };

  if (typeof output.fieldConfidence === "number") receipt.fieldConfidence = output.fieldConfidence;
  if (Array.isArray(output.phaseCoordinate) && output.phaseCoordinate.every((value) => typeof value === "number")) {
    receipt.phaseCoordinate = [...output.phaseCoordinate] as number[];
  }

  if (conditioning) {
    const ingressRaw = asRecord(output.encodingActivationReceipt, "Native output encodingActivationReceipt");
    const ingress: EncodingActivationIngress = {
      applied: ingressRaw.applied === true,
      vectorDigest: asNonEmptyString(ingressRaw.vectorDigest, "encodingActivationReceipt.vectorDigest"),
      ingressDigest: asNonEmptyString(ingressRaw.ingressDigest, "encodingActivationReceipt.ingressDigest"),
      nativeMutationDigest: asNonEmptyString(ingressRaw.nativeMutationDigest, "encodingActivationReceipt.nativeMutationDigest"),
      pfmHeadBefore: asNonEmptyString(ingressRaw.pfmHeadBefore, "encodingActivationReceipt.pfmHeadBefore"),
      pfmHeadAfter: asNonEmptyString(ingressRaw.pfmHeadAfter, "encodingActivationReceipt.pfmHeadAfter"),
    };
    assert(ingress.vectorDigest === expectedVectorDigest, "Native encoding ingress digest does not match the supplied opaque vector.");
    if (ingress.applied) assert(ingress.pfmHeadBefore !== ingress.pfmHeadAfter, "Native condition call claims ingress but did not change the PFM head.");
    receipt.encodingActivationReceipt = ingress;
  }

  return receipt;
}

function conditioningContext(request: OpaqueConditioningRequest): Record<string, unknown> {
  const context: Record<string, unknown> = {
    suppressRelaySteering: true,
    guidanceActive: false,
    noTargetVector: true,
    noOutcomeBlueprint: true,
    noRelaySteering: true,
    encodingActivationV1: {
      schemaVersion: 1,
      opaqueVector: request.opaqueEncoding.vector,
      vectorDigest: request.opaqueEncoding.vectorDigest,
      sourceTermDigest: request.opaqueEncoding.sourceTermDigest,
      mappingDigest: request.opaqueEncoding.mappingDigest,
      noTextLabel: true,
      noTargetZone: true,
      noOutcomeBlueprint: true,
      noRelaySteering: true,
    },
    experiment: {
      protocolId: request.protocolId,
      protocolDigest: request.protocolDigest,
      trialId: request.trialId,
      seed: request.seed,
      phase: "CONDITIONING",
      conditioningIndex: request.conditioningIndex,
    },
  };
  assertContextHasNoDirectTarget(context);
  return context;
}

function observationContext(request: AutonomousObservationRequest): Record<string, unknown> {
  const context: Record<string, unknown> = {
    suppressRelaySteering: true,
    guidanceActive: false,
    noTargetVector: true,
    noOutcomeBlueprint: true,
    noRelaySteering: true,
    passiveTrackingOnly: false,
    experiment: {
      protocolId: request.protocolId,
      protocolDigest: request.protocolDigest,
      trialId: request.trialId,
      seed: request.seed,
      phase: "AUTONOMOUS_OBSERVATION",
      observationIndex: request.observationIndex,
    },
  };
  assertContextHasNoDirectTarget(context);
  return context;
}

function assertContextHasNoDirectTarget(context: Record<string, unknown>): void {
  const serialised = canonicalJson(context);
  assert(!/"targetZone"\s*:/.test(serialised), "Native context exposes targetZone; this assay is invalid.");
  assert(!/"term"\s*:/.test(serialised), "Native context exposes source term text; this assay is invalid.");
}

export interface TrialRawRecord {
  trialId: string;
  sessionId: string;
  protocolId: string;
  protocolDigest: string;
  conceptId: string;
  sourceTerm: string;
  canonicalTargetZone: Zone;
  seed: number;
  arm: AssayArm;
  opaqueEncoding: OpaqueEncoding;
  conditionReceipts: NativeStepReceipt[];
  observationReceipts: NativeStepReceipt[];
  rawRecordDigest: string;
  archiveRecordId: string;
  archiveHeadDigest: string;
}

export interface TrialScore {
  trialId: string;
  conceptId: string;
  seed: number;
  arm: AssayArm;
  targetOccupancy: number;
  targetSelectivity: number;
  uniqueExitCount: number;
  meanFieldConfidence: number | null;
  admittedConditionCount: number;
  appliedIngressCount: number;
  admittedObservationCount: number;
  finalPfmHeadDigest: string;
}

export interface MatchedBlockEffect {
  conceptId: string;
  seed: number;
  encodedTargetSelectivity: number;
  rotatedTargetSelectivity: number;
  neutralTargetSelectivity: number;
  deltaOverControls: number;
}

export interface EncodingSpecificitySummary {
  trialScores: TrialScore[];
  matchedBlocks: MatchedBlockEffect[];
  meanEncodedTargetOccupancy: number;
  meanRotatedTargetOccupancy: number;
  meanNeutralTargetOccupancy: number;
  meanEncodedAppliedIngresses: number;
  meanRotatedAppliedIngresses: number;
  meanNeutralAppliedIngresses: number;
  meanDeltaOverControls: number;
  medianDeltaOverControls: number;
  standardDeviationDeltaOverControls: number;
  bootstrap95Ci: [number, number];
  signFlipPValue: number;
  nativePoincareCoordinatesAvailable: boolean;
  boundedInterpretation: string;
}

export interface Thread3AssayResult {
  protocolManifest: Record<string, unknown>;
  protocolDigest: string;
  precommitArchive: ArchiveSeal;
  trials: TrialRawRecord[];
  summary: EncodingSpecificitySummary;
  resultArchive: ArchiveSeal;
}

function buildProtocolManifest(config: Thread3ProtocolConfig): Record<string, unknown> {
  validateConfig(config);
  const scheduleSeed = scheduleSeedFor(config);
  return {
    protocolId: config.protocolId,
    protocolVersion: config.protocolVersion,
    mapping: "A1Z26_DIGITAL_ROOT_V1",
    conditioningCode: "A1Z26_ORDERED_DISTRIBUTED_VECTOR_V1",
    targetDisclosure: "analysis_only",
    sourceTextDisclosure: "analysis_only",
    arms: [...config.arms],
    seeds: [...config.seeds],
    conditioningSteps: config.conditioningSteps,
    observationSteps: config.observationSteps,
    vectorRotation: config.vectorRotation,
    scheduleSeed,
    trialOrder: buildTrialPlan(config, scheduleSeed).map((item) => ({
      conceptId: item.concept.id,
      seed: item.seed,
      arm: item.arm,
    })),
    concepts: config.concepts.map((concept) => ({
      id: concept.id,
      sourceTerm: concept.term,
      canonicalZone: concept.canonicalZone,
      directA1Z26Zone: a1z26DigitalRootZone(concept.term),
    })),
    outcome: "target occupancy minus mean non-target occupancy, scored only after raw records are sealed",
    prohibited: ["direct target zone in native context", "source term in native context", "relay steering", "outcome blueprint", "synthetic fallback"],
  };
}

interface TrialPlanItem {
  concept: ConceptSpec;
  seed: number;
  arm: AssayArm;
}

function scheduleSeedFor(config: Thread3ProtocolConfig): string {
  return digest({
    protocolId: config.protocolId,
    protocolVersion: config.protocolVersion,
    concepts: config.concepts.map((concept) => concept.id),
    seeds: [...config.seeds],
    arms: [...config.arms],
    conditioningSteps: config.conditioningSteps,
    observationSteps: config.observationSteps,
    vectorRotation: config.vectorRotation,
  });
}

function buildTrialPlan(config: Thread3ProtocolConfig, scheduleSeed: string): TrialPlanItem[] {
  const plan: TrialPlanItem[] = [];
  for (const concept of config.concepts) {
    for (const seed of config.seeds) {
      for (const arm of config.arms) plan.push({ concept, seed, arm });
    }
  }
  const rng = deterministicRandom(`${scheduleSeed}|trial-order`);
  for (let index = plan.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [plan[index], plan[swapIndex]] = [plan[swapIndex], plan[index]];
  }
  return plan;
}

function validateConfig(config: Thread3ProtocolConfig): void {
  assert(config.protocolVersion === 1, "Unsupported protocol version.");
  assert(config.concepts.length > 0, "At least one concept is required.");
  assert(config.seeds.length > 0, "At least one seed is required.");
  assert(config.arms.length === 3 && config.arms.includes("ENCODED") && config.arms.includes("ROTATED") && config.arms.includes("NEUTRAL"), "All three arms are required.");
  assert(config.conditioningSteps > 0 && Number.isInteger(config.conditioningSteps), "conditioningSteps must be a positive integer.");
  assert(config.observationSteps > 0 && Number.isInteger(config.observationSteps), "observationSteps must be a positive integer.");
  assert(config.vectorRotation % 10 !== 0, "vectorRotation cannot be 0 mod 10.");
  assert(config.bootstrapIterations >= 100, "bootstrapIterations must be at least 100.");
  assert(config.permutationIterations >= 100, "permutationIterations must be at least 100.");
  assert(new Set(config.concepts.map((concept) => concept.id)).size === config.concepts.length, "Concept ids must be unique.");
  for (const concept of config.concepts) {
    assert(a1z26DigitalRootZone(concept.term) === concept.canonicalZone, `Concept ${concept.id} does not match the predeclared A1Z26 digital-root zone.`);
  }
}

function trialIdFor(protocolDigest: string, concept: ConceptSpec, seed: number, arm: AssayArm): string {
  return `T3EASA_${sha256(`${protocolDigest}|${concept.id}|${seed}|${arm}`).slice(0, 20)}`;
}

function sessionIdFor(trialId: string): string {
  return `amelia-thread3-easa-${trialId.slice(-20)}`;
}

async function seal(bindings: LiveAmeliaBindings, recordId: string, kind: string, payload: unknown): Promise<ArchiveSeal> {
  const record: CreateOnlyRecord = {
    recordId,
    kind,
    payload,
    canonicalPayload: canonicalJson(payload),
    payloadDigest: digest(payload),
  };
  const receipt = await bindings.createOnly(record);
  assert(receipt.archiveRecordId === recordId, `Archive returned a different record id for ${recordId}.`);
  assert(receipt.archiveHeadDigest.length >= 16, `Archive did not return a plausible head digest for ${recordId}.`);
  return receipt;
}

async function runTrial(
  bindings: LiveAmeliaBindings,
  config: Thread3ProtocolConfig,
  protocolDigest: string,
  concept: ConceptSpec,
  seed: number,
  arm: AssayArm,
): Promise<TrialRawRecord> {
  const trialId = trialIdFor(protocolDigest, concept, seed, arm);
  const sessionId = sessionIdFor(trialId);
  const opaqueEncoding = buildOpaqueEncoding(concept, arm, config);
  const targetZone = a1z26DigitalRootZone(concept.term);
  assert(targetZone === concept.canonicalZone, `Predeclared target drifted for ${concept.id}.`);

  await seal(bindings, `${trialId}:PLAN`, "THREAD3_EASA_TRIAL_PLAN", {
    trialId,
    sessionId,
    protocolId: config.protocolId,
    protocolDigest,
    conceptId: concept.id,
    sourceTerm: concept.term,
    canonicalTargetZone: targetZone,
    seed,
    arm,
    opaqueEncoding,
    conditionCycles: config.conditioningSteps,
    observationCycles: config.observationSteps,
  });

  const conditionReceipts: NativeStepReceipt[] = [];
  for (let index = 1; index <= config.conditioningSteps; index += 1) {
    const request: OpaqueConditioningRequest = {
      sessionId,
      protocolId: config.protocolId,
      protocolDigest,
      trialId,
      seed,
      conditioningIndex: index,
      opaqueEncoding,
      context: {},
    };
    request.context = conditioningContext(request);
    const receipt = await bindings.condition(request);
    assert(receipt.sessionId === sessionId, `${trialId} condition receipt has an invalid session id.`);
    assert(receipt.encodingActivationReceipt?.vectorDigest === opaqueEncoding.vectorDigest, `${trialId} condition receipt lacks verified ingress.`);
    conditionReceipts.push(receipt);
  }

  const observationReceipts: NativeStepReceipt[] = [];
  for (let index = 1; index <= config.observationSteps; index += 1) {
    const request: AutonomousObservationRequest = {
      sessionId,
      protocolId: config.protocolId,
      protocolDigest,
      trialId,
      seed,
      observationIndex: index,
      context: {},
    };
    request.context = observationContext(request);
    const receipt = await bindings.observe(request);
    assert(receipt.sessionId === sessionId, `${trialId} observation receipt has an invalid session id.`);
    observationReceipts.push(receipt);
  }

  const rawPayload = {
    trialId,
    sessionId,
    protocolId: config.protocolId,
    protocolDigest,
    conceptId: concept.id,
    sourceTerm: concept.term,
    canonicalTargetZone: targetZone,
    seed,
    arm,
    opaqueEncoding,
    conditionReceipts,
    observationReceipts,
  };
  const rawRecordDigest = digest(rawPayload);
  const archive = await seal(bindings, `${trialId}:RAW`, "THREAD3_EASA_TRIAL_RAW", rawPayload);

  return {
    ...rawPayload,
    rawRecordDigest,
    archiveRecordId: archive.archiveRecordId,
    archiveHeadDigest: archive.archiveHeadDigest,
  };
}

function scoreTrial(trial: TrialRawRecord): TrialScore {
  assert(trial.observationReceipts.length > 0, `${trial.trialId} has no observation records.`);
  const targetHits = trial.observationReceipts.filter((receipt) => receipt.currentZone === trial.canonicalTargetZone).length;
  const targetOccupancy = targetHits / trial.observationReceipts.length;
  const targetSelectivity = targetOccupancy - (1 - targetOccupancy) / 9;
  const confidences = trial.observationReceipts
    .map((receipt) => receipt.fieldConfidence)
    .filter((value): value is number => typeof value === "number");

  return {
    trialId: trial.trialId,
    conceptId: trial.conceptId,
    seed: trial.seed,
    arm: trial.arm,
    targetOccupancy,
    targetSelectivity,
    uniqueExitCount: new Set(trial.observationReceipts.map((receipt) => receipt.selectedExitDigest).filter((value): value is string => value !== null)).size,
    meanFieldConfidence: confidences.length > 0 ? mean(confidences) : null,
    admittedConditionCount: trial.conditionReceipts.filter((receipt) => receipt.governorDisposition === "ADMIT").length,
    appliedIngressCount: trial.conditionReceipts.filter((receipt) => receipt.encodingActivationReceipt?.applied === true).length,
    admittedObservationCount: trial.observationReceipts.filter((receipt) => receipt.governorDisposition === "ADMIT").length,
    finalPfmHeadDigest: trial.observationReceipts.at(-1)?.pfmHeadDigest ?? "",
  };
}

function xmur3(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let index = 0; index < seed.length; index += 1) {
    h = Math.imul(h ^ seed.charCodeAt(index), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function deterministicRandom(seed: string): () => number {
  return mulberry32(xmur3(seed)());
}

function bootstrapMeanCi(values: readonly number[], iterations: number, seed: string): [number, number] {
  const rng = deterministicRandom(`${seed}|bootstrap`);
  const means: number[] = [];
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const sample = Array.from({ length: values.length }, () => values[Math.floor(rng() * values.length)]);
    means.push(mean(sample));
  }
  means.sort((a, b) => a - b);
  return [means[Math.floor(0.025 * (means.length - 1))], means[Math.floor(0.975 * (means.length - 1))]];
}

function signFlipPValue(values: readonly number[], iterations: number, seed: string): number {
  const observed = Math.abs(mean(values));
  const rng = deterministicRandom(`${seed}|sign-flip`);
  let extreme = 0;
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const permuted = mean(values.map((value) => (rng() < 0.5 ? -value : value)));
    if (Math.abs(permuted) >= observed) extreme += 1;
  }
  return (extreme + 1) / (iterations + 1);
}

function analyseTrials(trials: readonly TrialRawRecord[], config: Thread3ProtocolConfig, protocolDigest: string): EncodingSpecificitySummary {
  const trialScores = trials.map(scoreTrial);
  const byBlock = new Map<string, Map<AssayArm, TrialScore>>();
  for (const score of trialScores) {
    const key = `${score.conceptId}|${score.seed}`;
    if (!byBlock.has(key)) byBlock.set(key, new Map());
    byBlock.get(key)?.set(score.arm, score);
  }

  const matchedBlocks: MatchedBlockEffect[] = [];
  for (const [key, armScores] of byBlock) {
    const encoded = armScores.get("ENCODED");
    const rotated = armScores.get("ROTATED");
    const neutral = armScores.get("NEUTRAL");
    assert(encoded && rotated && neutral, `Matched block ${key} is incomplete; analysis is refused.`);
    matchedBlocks.push({
      conceptId: encoded.conceptId,
      seed: encoded.seed,
      encodedTargetSelectivity: encoded.targetSelectivity,
      rotatedTargetSelectivity: rotated.targetSelectivity,
      neutralTargetSelectivity: neutral.targetSelectivity,
      deltaOverControls: encoded.targetSelectivity - mean([rotated.targetSelectivity, neutral.targetSelectivity]),
    });
  }

  const deltas = matchedBlocks.map((block) => block.deltaOverControls);
  const encodedOccupancies = trialScores.filter((score) => score.arm === "ENCODED").map((score) => score.targetOccupancy);
  const rotatedOccupancies = trialScores.filter((score) => score.arm === "ROTATED").map((score) => score.targetOccupancy);
  const neutralOccupancies = trialScores.filter((score) => score.arm === "NEUTRAL").map((score) => score.targetOccupancy);
  const encodedIngresses = trialScores.filter((score) => score.arm === "ENCODED").map((score) => score.appliedIngressCount);
  const rotatedIngresses = trialScores.filter((score) => score.arm === "ROTATED").map((score) => score.appliedIngressCount);
  const neutralIngresses = trialScores.filter((score) => score.arm === "NEUTRAL").map((score) => score.appliedIngressCount);
  const meanDeltaOverControls = mean(deltas);
  const ci = bootstrapMeanCi(deltas, config.bootstrapIterations, protocolDigest);
  const pValue = signFlipPValue(deltas, config.permutationIterations, protocolDigest);
  const nativePoincareCoordinatesAvailable = trials.every((trial) => trial.observationReceipts.at(-1)?.phaseCoordinate !== undefined);

  const boundedInterpretation = meanDeltaOverControls > 0 && pValue < 0.05
    ? "Within this specified Amelia runtime, the opaque original A1Z26-derived vector produced greater target selectivity than the rotated and neutral vectors. This supports an operational encoding-specificity effect; it does not establish semantic reference, an external ontology, or retrocausality."
    : "This run does not show a statistically distinguishable encoding-specificity effect under the predeclared contrast. It does not refute PFM history effects generally, but it does not support a stronger encoding-activation claim for this protocol.";

  return {
    trialScores,
    matchedBlocks,
    meanEncodedTargetOccupancy: mean(encodedOccupancies),
    meanRotatedTargetOccupancy: mean(rotatedOccupancies),
    meanNeutralTargetOccupancy: mean(neutralOccupancies),
    meanEncodedAppliedIngresses: mean(encodedIngresses),
    meanRotatedAppliedIngresses: mean(rotatedIngresses),
    meanNeutralAppliedIngresses: mean(neutralIngresses),
    meanDeltaOverControls,
    medianDeltaOverControls: median(deltas),
    standardDeviationDeltaOverControls: sampleSd(deltas),
    bootstrap95Ci: ci,
    signFlipPValue: pValue,
    nativePoincareCoordinatesAvailable,
    boundedInterpretation,
  };
}

export async function runThread3EncodingAssay(
  bindings: LiveAmeliaBindings,
  config: Thread3ProtocolConfig = THREAD3_PILOT_CONFIG,
): Promise<Thread3AssayResult> {
  const protocolManifest = buildProtocolManifest(config);
  const protocolDigest = digest(protocolManifest);
  const precommitArchive = await seal(
    bindings,
    `${config.protocolId}:PRECOMMIT:${protocolDigest.slice(0, 16)}`,
    "THREAD3_EASA_PRECOMMIT",
    protocolManifest,
  );

  const trials: TrialRawRecord[] = [];
  const trialPlan = buildTrialPlan(config, scheduleSeedFor(config));
  for (const item of trialPlan) {
    trials.push(await runTrial(bindings, config, protocolDigest, item.concept, item.seed, item.arm));
  }

  const summary = analyseTrials(trials, config, protocolDigest);
  const resultPayload = {
    protocolManifest,
    protocolDigest,
    rawTrialRecordIds: trials.map((trial) => trial.archiveRecordId),
    rawTrialDigests: trials.map((trial) => trial.rawRecordDigest),
    summary,
  };
  const resultArchive = await seal(
    bindings,
    `${config.protocolId}:RESULT:${protocolDigest.slice(0, 16)}`,
    "THREAD3_EASA_RESULT",
    resultPayload,
  );

  return { protocolManifest, protocolDigest, precommitArchive, trials, summary, resultArchive };
}

export interface ChapterEncodingAuditRow {
  id: string;
  term: string;
  predeclaredZone: Zone;
  recomputedZone: Zone;
  reportedLiveZone: Zone;
  canonicalMatch: boolean;
  liveMappingMatch: boolean;
}

export interface ChapterEncodingAudit {
  type: "DETERMINISTIC_ENCODING_AUDIT_NOT_LIVE_AMELIA_RESULT";
  conceptCount: number;
  canonicalA1Z26Matches: number;
  liveAlphabetDifferences: number;
  liveAlphabetDifferenceFraction: number;
  rows: ChapterEncodingAuditRow[];
  interpretation: string;
  auditDigest: string;
}

/**
 * Recomputes the manuscript's A1Z26 claims without accessing Amelia. This is
 * deliberately an encoding-definition audit, not evidence of a live response.
 */
export function auditThread3ChapterEncoding(): ChapterEncodingAudit {
  const rows = THREAD3_CHAPTER_CONCEPTS.map((concept) => {
    const recomputedZone = a1z26DigitalRootZone(concept.term);
    const reportedLiveZone = concept.reportedLiveZone ?? concept.canonicalZone;
    return {
      id: concept.id,
      term: concept.term,
      predeclaredZone: concept.canonicalZone,
      recomputedZone,
      reportedLiveZone,
      canonicalMatch: recomputedZone === concept.canonicalZone,
      liveMappingMatch: reportedLiveZone === recomputedZone,
    };
  });
  const canonicalA1Z26Matches = rows.filter((row) => row.canonicalMatch).length;
  const liveAlphabetDifferences = rows.filter((row) => !row.liveMappingMatch).length;
  const auditWithoutDigest = {
    type: "DETERMINISTIC_ENCODING_AUDIT_NOT_LIVE_AMELIA_RESULT" as const,
    conceptCount: rows.length,
    canonicalA1Z26Matches,
    liveAlphabetDifferences,
    liveAlphabetDifferenceFraction: liveAlphabetDifferences / rows.length,
    rows,
    interpretation:
      "The chapter's published A1Z26 digital-root assignments are reproducible for the stated twelve concepts. Four reported live-alphabet assignments differ from those fixed assignments. This makes an encoding-definition lock essential before any live result is interpreted; the audit does not test Amelia behaviour.",
  };
  return { ...auditWithoutDigest, auditDigest: digest(auditWithoutDigest) };
}

export function formatChapterEncodingAudit(audit: ChapterEncodingAudit): string {
  const lines = [
    "THREAD 3 PLUS — DETERMINISTIC ENCODING AUDIT",
    `Concepts: ${audit.conceptCount}`,
    `A1Z26 assignments reproduced: ${audit.canonicalA1Z26Matches}/${audit.conceptCount}`,
    `Reported live-alphabet differences: ${audit.liveAlphabetDifferences}/${audit.conceptCount} (${(audit.liveAlphabetDifferenceFraction * 100).toFixed(1)}%)`,
    `Audit digest: ${audit.auditDigest}`,
    "",
    audit.interpretation,
  ];
  return lines.join("\n");
}

export function formatThread3Result(result: Thread3AssayResult): string {
  const summary = result.summary;
  const lines = [
    "AMELIA THREAD 3 PLUS — ENCODING-ACTIVATION SPECIFICITY RESULT",
    "═".repeat(72),
    `Protocol: ${result.protocolManifest.protocolId}`,
    `Protocol digest: ${result.protocolDigest}`,
    `Trials: ${result.trials.length}`,
    `Mean encoded target occupancy: ${summary.meanEncodedTargetOccupancy.toFixed(4)}`,
    `Mean rotated target occupancy: ${summary.meanRotatedTargetOccupancy.toFixed(4)}`,
    `Mean neutral target occupancy: ${summary.meanNeutralTargetOccupancy.toFixed(4)}`,
    `Mean encoded applied PFM ingresses: ${summary.meanEncodedAppliedIngresses.toFixed(2)}`,
    `Mean rotated applied PFM ingresses: ${summary.meanRotatedAppliedIngresses.toFixed(2)}`,
    `Mean neutral applied PFM ingresses: ${summary.meanNeutralAppliedIngresses.toFixed(2)}`,
    `Matched delta over controls: ${summary.meanDeltaOverControls.toFixed(4)}`,
    `Bootstrap 95% CI: [${summary.bootstrap95Ci[0].toFixed(4)}, ${summary.bootstrap95Ci[1].toFixed(4)}]`,
    `Sign-flip p value: ${summary.signFlipPValue.toFixed(5)}`,
    `Native Poincaré coordinates available: ${summary.nativePoincareCoordinatesAvailable}`,
    "",
    "INTERPRETATION:",
    summary.boundedInterpretation,
    "",
    `Raw result archive: ${result.resultArchive.archiveRecordId}`,
    `Archive head: ${result.resultArchive.archiveHeadDigest}`,
  ];
  return lines.join("\n");
}

/**
 * Attach this dispatcher to Amelia's existing bridge command handler. It keeps
 * the assay state in the live process and does not execute a cycle for the
 * audit-only command.
 *
 *   BRIDGE THREAD3 — ENCODING-AUDIT
 *   BRIDGE THREAD3 — RUN PILOT
 *   BRIDGE THREAD3 — RUN FULL
 *   BRIDGE THREAD3 — RESULTS
 */
export function createThread3BridgeDispatcher(bindings: LiveAmeliaBindings): (command: string) => Promise<string> {
  let lastResult: Thread3AssayResult | null = null;

  return async (command: string): Promise<string> => {
    if (command === "BRIDGE THREAD3 — ENCODING-AUDIT") {
      return formatChapterEncodingAudit(auditThread3ChapterEncoding());
    }
    if (command === "BRIDGE THREAD3 — RUN PILOT") {
      lastResult = await runThread3EncodingAssay(bindings, THREAD3_PILOT_CONFIG);
      return formatThread3Result(lastResult);
    }
    if (command === "BRIDGE THREAD3 — RUN FULL") {
      lastResult = await runThread3EncodingAssay(bindings, THREAD3_FULL_CONFIG);
      return formatThread3Result(lastResult);
    }
    if (command === "BRIDGE THREAD3 — RESULTS") {
      return lastResult
        ? formatThread3Result(lastResult)
        : "ERR: No Thread 3 encoding-activation run is available. Run ‘BRIDGE THREAD3 — RUN PILOT’ first.";
    }
    return `ERR: Unknown Thread 3 command: “${command}”`;
  };
}
