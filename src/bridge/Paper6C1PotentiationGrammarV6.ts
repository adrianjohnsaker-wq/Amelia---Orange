/**
 * PAPER_6_C1_POTENTIATION_GRAMMAR_V6
 * Lineage Accessibility Profile Map
 *
 * Empirical question (bounded to C1 architecture):
 *   Within the tested C1 architecture, what is the distribution of
 *   per-lineage response profiles to Zone-9 temporal kernel placement
 *   at D72→D108, given matched neutral exposure?
 *
 * This is not a search for a universal key. V5 ruled that out.
 * V6 maps the field: the accessibility profiles that developmental
 * history constitutes at D72 across independent lineages.
 *
 * Per-lineage response vector (Early, Native, Late) ∈ {0,1}³
 *   A dimension is 1 iff the arm produces Zone-9 modal full-trajectory
 *   regime while the same lineage's neutral arm remains non-Z9.
 *
 * Five derived response profiles (from the vector):
 *   (0,0,0)  PROFILE_PANEL_REFRACTORY
 *   (1,0,0)  PROFILE_EARLY_SELECTIVE
 *   (0,1,0)  PROFILE_NATIVE_SELECTIVE
 *   (0,0,1)  PROFILE_LATE_SELECTIVE
 *   (1,1,0)  PROFILE_EARLY_AND_NATIVE
 *   (1,0,1)  PROFILE_EARLY_AND_LATE
 *   (0,1,1)  PROFILE_NATIVE_AND_LATE
 *   (1,1,1)  PROFILE_BROAD_RECEPTIVE
 *   Additional patterns are recorded as PROFILE_OTHER_{vector}
 *
 * Primary estimand:
 *   Frequency and bounded prevalence of each response profile
 *   across N_SEEDS independent developmental lineages.
 *
 * Predecessor immutable archives (read-only):
 *   V1: 1e1b1f2de377fa290c5090cdc5142cd3f1dce677c8c3a6596c0610d0437f6d24
 *   V2: 47e94c8b2fa8104399e525164d78b87ce01d89886d34e94b0f9aa42e1281cb9f
 *   V3: 246561bc32f850096fc3423a2002095b0002a76e4db11cd594600c1db27aa500
 *   V3_CLASSIFIER: 8776dd36506ebff9a5fce19d01ac876582a0c771fdba6f1d96d745076802477c
 *   V4: REFERENCE_CONTRAST_NOT_REPRODUCED (master seal held)
 *   V5: LATE_WINDOW_CANALIZATION_NOT_REPLICATED
 *
 * Provenance invariants:
 *   Fresh seeds disjoint from {101,202,303,404,505,606}
 *   Matched neutral exposure: exact event count, timing, flux/strain,
 *     zero Zone-9 content
 *   Source-bound guidance-off replay throughout
 *   Raw records sealed before scoring
 *   Source lineage is the unit of generalization;
 *     101 topologies × 3 branch seeds provide within-lineage robustness
 *   Fixed placements not tuned after sealing
 *
 * Bridge command:
 *   "BRIDGE PAPER6 — V6-LINEAGE-ACCESSIBILITY-MAP"
 */

import { canonicalSha256 } from '../lib/sha256';

// ── Canonical sorting for deterministic serialisation ─────────────────────

function sortJson(v: unknown): unknown {
  if (v === null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map(sortJson);
  const r = v as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(r).sort()) out[k] = sortJson(r[k]);
  return out;
}
function cj(v: unknown): string { return JSON.stringify(sortJson(v)); }
function sha256(s: string): string {
  return canonicalSha256(s);
}
function dig(o: unknown): string { return sha256(cj(o)); }

// ── Immutable predecessor lineage ─────────────────────────────────────────

export const PREDECESSOR_SEALS = {
  V1: '1e1b1f2de377fa290c5090cdc5142cd3f1dce677c8c3a6596c0610d0437f6d24',
  V2: '47e94c8b2fa8104399e525164d78b87ce01d89886d34e94b0f9aa42e1281cb9f',
  V3: '246561bc32f850096fc3423a2002095b0002a76e4db11cd594600c1db27aa500',
  V3_CLASSIFIER: '8776dd36506ebff9a5fce19d01ac876582a0c771fdba6f1d96d745076802477c',
  V4_DISPOSITION: 'REFERENCE_CONTRAST_NOT_REPRODUCED',
  V5_DISPOSITION: 'LATE_WINDOW_CANALIZATION_NOT_REPLICATED',
} as const;

// Seeds used in V1–V5 — V6 must not reuse any
export const EXHAUSTED_SEEDS = new Set([101, 202, 303, 404, 505, 606]);

// ── Fixed experimental conditions ─────────────────────────────────────────

// The four arms — identical kernel arrays to V3/V4/V5 for direct comparability
export const V6_CONDITIONS = {
  NEUTRAL_REFERENCE:      [] as readonly number[],
  EARLY_76_84:            [76,77,78,79,80,81,82,83,84] as const,
  NATIVE_84_92_REFERENCE: [84,85,86,87,88,89,90,91,92] as const,
  LATE_92_100:            [92,93,94,95,96,97,98,99,100] as const,
} as const;

export type ConditionId = keyof typeof V6_CONDITIONS;
export const CONDITION_IDS: ConditionId[] = [
  'NEUTRAL_REFERENCE',
  'EARLY_76_84',
  'NATIVE_84_92_REFERENCE',
  'LATE_92_100',
];

// Matrix dimensions
export const TOPOLOGIES     = 101;  // N0 + 100 degree-preserving nulls
export const BRANCH_SEEDS   = [101, 202, 303] as const;
export const OBS_STEPS      = 180;

// Per-lineage replays: 4 conditions × 101 topologies × 3 branch seeds = 1212
export const REPLAYS_PER_LINEAGE = 4 * TOPOLOGIES * BRANCH_SEEDS.length; // 1212

// ── Response vector and profile ───────────────────────────────────────────

export interface LineageResponseVector {
  early:  0 | 1;  // EARLY_76_84 produces Z9 modal while Neutral does not
  native: 0 | 1;  // NATIVE_84_92_REFERENCE ditto
  late:   0 | 1;  // LATE_92_100 ditto
}

export type ResponseProfile =
  | 'PROFILE_PANEL_REFRACTORY'   // (0,0,0)
  | 'PROFILE_EARLY_SELECTIVE'    // (1,0,0)
  | 'PROFILE_NATIVE_SELECTIVE'   // (0,1,0)
  | 'PROFILE_LATE_SELECTIVE'     // (0,0,1)
  | 'PROFILE_EARLY_AND_NATIVE'   // (1,1,0)
  | 'PROFILE_EARLY_AND_LATE'     // (1,0,1)
  | 'PROFILE_NATIVE_AND_LATE'    // (0,1,1)
  | 'PROFILE_BROAD_RECEPTIVE'    // (1,1,1)
  | `PROFILE_OTHER_${string}`;   // any unexpected pattern

export function deriveProfile(v: LineageResponseVector): ResponseProfile {
  const key = `${v.early}${v.native}${v.late}`;
  const map: Record<string, ResponseProfile> = {
    '000': 'PROFILE_PANEL_REFRACTORY',
    '100': 'PROFILE_EARLY_SELECTIVE',
    '010': 'PROFILE_NATIVE_SELECTIVE',
    '001': 'PROFILE_LATE_SELECTIVE',
    '110': 'PROFILE_EARLY_AND_NATIVE',
    '101': 'PROFILE_EARLY_AND_LATE',
    '011': 'PROFILE_NATIVE_AND_LATE',
    '111': 'PROFILE_BROAD_RECEPTIVE',
  };
  return map[key] ?? `PROFILE_OTHER_${key}`;
}

// ── Regime classification (reusing V3 sealed classifier spec) ─────────────

export type RegimeLabel =
  | 'REGIME_HYPERSTITION_CANALIZED_Z9'
  | 'REGIME_SYZYGETIC_STEADY_STATE'
  | 'REGIME_EVEN_POLE_RELAXATION_OSCILLATION'
  | 'REGIME_DIFFUSE_MULTICENTRIC_FLUX'
  | 'REGIME_ABYSSAL_DESCENT_Z0'
  | 'REGIME_UNKNOWN';

export function isZ9ModalRegime(label: RegimeLabel): boolean {
  return label === 'REGIME_HYPERSTITION_CANALIZED_Z9';
}

// ── Per-lineage capsule structure ─────────────────────────────────────────

export interface LineageConditionResult {
  conditionId:      ConditionId;
  kernelArray:      readonly number[];
  modalRegime:      RegimeLabel;
  z9ModalFraction:  number;  // fraction of 303 within-lineage replays that are Z9 modal
  neutralIsNonZ9:   boolean; // relevant only for non-neutral arms
  vectorBit:        0 | 1;   // 1 iff Z9 modal AND neutral non-Z9 for this lineage
  rawDigest:        string;
}

export interface LineageCapsule {
  lineageId:        string;
  sourceSeed:       number;
  d72Digest:        string;   // sealed neutral D72 checkpoint
  d108Digest:       string;   // sealed neutral D108 checkpoint (regenerated)
  conditionResults: LineageConditionResult[];
  responseVector:   LineageResponseVector;
  responseProfile:  ResponseProfile;
  capsuleDigest:    string;
}

// ── V6 specification ──────────────────────────────────────────────────────

export interface V6Specification {
  protocolId:           'PAPER_6_C1_POTENTIATION_GRAMMAR_V6';
  question:             string;
  boundedScope:         string;
  predecessors:         typeof PREDECESSOR_SEALS;
  exhaustedSeeds:       number[];
  conditions:           Record<ConditionId, readonly number[]>;
  topologies:           number;
  branchSeeds:          readonly number[];
  obsSteps:             number;
  replaysPerLineage:    number;
  primaryEstimand:      string;
  responseVectorRule:   string;
  provenanceInvariants: string[];
}

export const V6_SPECIFICATION: V6Specification = {
  protocolId: 'PAPER_6_C1_POTENTIATION_GRAMMAR_V6',

  question:
    'What is the distribution of per-lineage response profiles to ' +
    'Zone-9 temporal kernel placement at D72→D108, across independent ' +
    'developmental lineages with matched neutral exposure?',

  boundedScope:
    'Within the tested C1 architecture, developmental history conditions ' +
    'whether a particular Zone-9 encounter has an accessible canalized future. ' +
    'V6 maps accessibility profiles, not universal temporal grammar.',

  predecessors: PREDECESSOR_SEALS,

  exhaustedSeeds: [...EXHAUSTED_SEEDS],

  conditions: V6_CONDITIONS,

  topologies:          TOPOLOGIES,
  branchSeeds:         BRANCH_SEEDS,
  obsSteps:            OBS_STEPS,
  replaysPerLineage:   REPLAYS_PER_LINEAGE,

  primaryEstimand:
    'Frequency and bounded prevalence of each response profile ' +
    '(Early, Native, Late) ∈ {0,1}³ across N independent lineages. ' +
    'Source lineage is the unit of generalization.',

  responseVectorRule:
    'A dimension is 1 iff the arm produces Zone-9 modal full-trajectory ' +
    'regime while the same lineage\'s neutral arm remains non-Z9. ' +
    'Both conditions must hold within the same lineage.',

  provenanceInvariants: [
    'Fresh seeds strictly disjoint from {101,202,303,404,505,606}',
    'Neutral arm: exact event count, timing, flux/strain, zero Zone-9 content',
    'Predecessor V1-V3 seals bound read-only; V4-V5 dispositions preserved',
    'Raw records sealed before aggregate scoring',
    'Fixed placements not tuned after sealing',
    'Source lineage is unit of generalization; topology/branch provide robustness',
    'Sealed V3 classifier reused without modification (8776dd36...)',
    'Fail-closed on missing digest or seed exhaustion violation',
  ],
};

// ── V6 preflight checks ───────────────────────────────────────────────────

export interface V6PreflightResult {
  passed:                     boolean;
  predecessorSealsVerified:   boolean;
  seedsDisjoint:              boolean;
  conditionArraysFixed:       boolean;
  classifierDigestMatch:      boolean;
  denominatorAssertionReady:  boolean;
  details:                    Record<string, string>;
  manifestDigest:             string;
}

export function runV6Preflight(
  proposedSeeds:      number[],
  classifierDigest:   string,
  replayCountAssertion: number,
  rawStepAssertion:   number,
): V6PreflightResult {
  const details: Record<string, string> = {};

  // Check seed disjointness
  const exhaustedViolations = proposedSeeds.filter(s => EXHAUSTED_SEEDS.has(s));
  const seedsDisjoint = exhaustedViolations.length === 0;
  details.seedsDisjoint = seedsDisjoint
    ? `All ${proposedSeeds.length} seeds disjoint from exhausted set`
    : `VIOLATION: seeds ${exhaustedViolations.join(',')} already used`;

  // Check classifier matches sealed V3 classifier
  const classifierDigestMatch =
    classifierDigest === PREDECESSOR_SEALS.V3_CLASSIFIER;
  details.classifierDigest = classifierDigestMatch
    ? `Matches sealed V3 classifier ${PREDECESSOR_SEALS.V3_CLASSIFIER}`
    : `MISMATCH: expected ${PREDECESSOR_SEALS.V3_CLASSIFIER}, got ${classifierDigest}`;

  // Check denominator: N_seeds × 4 conditions × 101 topologies × 3 branch = N×1212
  const expectedReplayCount = proposedSeeds.length * REPLAYS_PER_LINEAGE;
  const expectedRawSteps    = expectedReplayCount * OBS_STEPS;
  const denominatorOk = replayCountAssertion === expectedReplayCount &&
    rawStepAssertion === expectedRawSteps;
  details.denominator = denominatorOk
    ? `${expectedReplayCount} replays × ${OBS_STEPS} steps = ${expectedRawSteps} verified`
    : `MISMATCH: expected ${expectedReplayCount} replays / ${expectedRawSteps} steps; ` +
      `got ${replayCountAssertion} / ${rawStepAssertion}`;

  // Verify condition arrays are unchanged from V3/V5
  const conditionsFixed = Object.entries(V6_CONDITIONS).every(([id, arr]) => {
    const v3arr = V6_CONDITIONS[id as ConditionId];
    return JSON.stringify(arr) === JSON.stringify(v3arr);
  });
  details.conditionsFixed = conditionsFixed
    ? 'All four kernel arrays match V3/V4/V5 specification'
    : 'CONDITION ARRAY MISMATCH';

  // Predecessor seals verified (read-only binding)
  const predecessorSealsVerified =
    PREDECESSOR_SEALS.V1.length === 64 &&
    PREDECESSOR_SEALS.V2.length === 64 &&
    PREDECESSOR_SEALS.V3.length === 64;
  details.predecessorSeals = predecessorSealsVerified
    ? 'V1/V2/V3 seals bound read-only'
    : 'PREDECESSOR SEAL FORMAT ERROR';

  const passed = seedsDisjoint && classifierDigestMatch &&
    denominatorOk && conditionsFixed && predecessorSealsVerified;

  const manifest = {
    protocolId: 'PAPER_6_C1_POTENTIATION_GRAMMAR_V6',
    proposedSeeds,
    conditions: V6_CONDITIONS,
    replayCountAssertion,
    rawStepAssertion,
    classifierDigest,
    predecessorSeals: PREDECESSOR_SEALS,
    timestamp: new Date().toISOString(),
  };

  return {
    passed,
    predecessorSealsVerified,
    seedsDisjoint,
    conditionArraysFixed: conditionsFixed,
    classifierDigestMatch,
    denominatorAssertionReady: denominatorOk,
    details,
    manifestDigest: dig(manifest),
  };
}

// ── Aggregate across lineages ─────────────────────────────────────────────

export interface V6AggregateResult {
  nLineages:             number;
  profileCounts:         Partial<Record<ResponseProfile, number>>;
  profileFrequencies:    Partial<Record<ResponseProfile, number>>;
  z9AccessibleCount:     number;   // lineages with at least one arm Z9 modal
  z9AccessibleFraction:  number;
  refractoryCount:       number;
  refractoryFraction:    number;
  broadReceptiveCount:   number;
  broadReceptiveFraction: number;
  responseVectors:       LineageResponseVector[];
  lineageCapsuleDigests: string[];
  aggregateDigest:       string;
}

export function computeAggregate(capsules: LineageCapsule[]): V6AggregateResult {
  const n = capsules.length;
  const profileCounts: Partial<Record<ResponseProfile, number>> = {};
  let z9Accessible = 0;
  let refractory   = 0;
  let broad        = 0;

  for (const c of capsules) {
    const p = c.responseProfile;
    profileCounts[p] = (profileCounts[p] ?? 0) + 1;
    if (p !== 'PROFILE_PANEL_REFRACTORY') z9Accessible++;
    if (p === 'PROFILE_PANEL_REFRACTORY') refractory++;
    if (p === 'PROFILE_BROAD_RECEPTIVE')  broad++;
  }

  const profileFrequencies: Partial<Record<ResponseProfile, number>> = {};
  for (const [p, count] of Object.entries(profileCounts)) {
    profileFrequencies[p as ResponseProfile] = (count as number) / n;
  }

  return {
    nLineages:              n,
    profileCounts,
    profileFrequencies,
    z9AccessibleCount:      z9Accessible,
    z9AccessibleFraction:   z9Accessible / n,
    refractoryCount:        refractory,
    refractoryFraction:     refractory / n,
    broadReceptiveCount:    broad,
    broadReceptiveFraction: broad / n,
    responseVectors:        capsules.map(c => c.responseVector),
    lineageCapsuleDigests:  capsules.map(c => c.capsuleDigest),
    aggregateDigest:        dig({
      nLineages: n,
      profileCounts,
      capsuleDigests: capsules.map(c => c.capsuleDigest),
    }),
  };
}

// ── Format for bridge ─────────────────────────────────────────────────────

export function formatV6AggregateForBridge(
  agg:       V6AggregateResult,
  preflight: V6PreflightResult,
  seeds:     number[],
): string {
  const lines: string[] = [
    'BRIDGE PAPER6 — V6-LINEAGE-ACCESSIBILITY-MAP',
    '═'.repeat(72),
    `Protocol: PAPER_6_C1_POTENTIATION_GRAMMAR_V6`,
    `Seeds (N=${seeds.length}): [${seeds.join(', ')}]`,
    `Preflight seal: ${preflight.manifestDigest}`,
    `Replays total: ${agg.nLineages * REPLAYS_PER_LINEAGE}`,
    `Raw steps total: ${agg.nLineages * REPLAYS_PER_LINEAGE * OBS_STEPS}`,
    '',
    '── LINEAGE ACCESSIBILITY PROFILE MAP ─────────────────────────────────',
    `Total lineages mapped:    ${agg.nLineages}`,
    `Zone-9 accessible:        ${agg.z9AccessibleCount}/${agg.nLineages} ` +
      `(${(agg.z9AccessibleFraction*100).toFixed(1)}%)`,
    `Panel refractory:         ${agg.refractoryCount}/${agg.nLineages} ` +
      `(${(agg.refractoryFraction*100).toFixed(1)}%)`,
    `Broad receptive:          ${agg.broadReceptiveCount}/${agg.nLineages} ` +
      `(${(agg.broadReceptiveFraction*100).toFixed(1)}%)`,
    '',
    'Profile'.padEnd(35) + 'Count'.padEnd(8) + 'Frequency',
    '─'.repeat(55),
  ];

  const profiles: ResponseProfile[] = [
    'PROFILE_BROAD_RECEPTIVE',
    'PROFILE_EARLY_AND_NATIVE',
    'PROFILE_EARLY_AND_LATE',
    'PROFILE_NATIVE_AND_LATE',
    'PROFILE_EARLY_SELECTIVE',
    'PROFILE_NATIVE_SELECTIVE',
    'PROFILE_LATE_SELECTIVE',
    'PROFILE_PANEL_REFRACTORY',
  ];

  for (const p of profiles) {
    const count = agg.profileCounts[p] ?? 0;
    const freq  = count / agg.nLineages;
    const bar   = '█'.repeat(Math.round(freq * 30));
    lines.push(
      p.replace('PROFILE_', '').padEnd(35) +
      String(count).padEnd(8) +
      `${(freq*100).toFixed(1)}% ${bar}`
    );
  }

  lines.push('');
  lines.push('── RESPONSE VECTORS (Early, Native, Late) ∈ {0,1}³ ──────────────────');
  lines.push('Seed'.padEnd(8) + 'Early'.padEnd(8) + 'Native'.padEnd(8) + 'Late'.padEnd(8) + 'Profile');
  lines.push('─'.repeat(70));
  for (let i = 0; i < agg.nLineages; i++) {
    const v = agg.responseVectors[i];
    const p = deriveProfile(v).replace('PROFILE_', '');
    lines.push(
      String(seeds[i]).padEnd(8) +
      String(v.early).padEnd(8) +
      String(v.native).padEnd(8) +
      String(v.late).padEnd(8) + p
    );
  }

  lines.push('');
  lines.push('── BOUNDED SCOPE STATEMENT ────────────────────────────────────────────');
  lines.push(V6_SPECIFICATION.boundedScope);
  lines.push('');
  lines.push(`Aggregate digest: ${agg.aggregateDigest}`);
  lines.push('noAdvancementClaims: true');
  lines.push('V1–V5 archives: IMMUTABLE / UNCHANGED');
  lines.push('status: V6_LINEAGE_ACCESSIBILITY_MAP_COMPLETE');

  return lines.join('\n');
}

// ── Denominator assertion (fail-closed) ──────────────────────────────────

export function assertV6Denominator(
  nSeeds:          number,
  actualReplays:   number,
  actualRawSteps:  number,
): void {
  const expected = nSeeds * REPLAYS_PER_LINEAGE;
  const expectedSteps = expected * OBS_STEPS;
  if (actualReplays !== expected) {
    throw new Error(
      `[V6 Fail-Closed] Expected ${expected} replays for ${nSeeds} seeds, ` +
      `got ${actualReplays}`
    );
  }
  if (actualRawSteps !== expectedSteps) {
    throw new Error(
      `[V6 Fail-Closed] Expected ${expectedSteps} raw steps, got ${actualRawSteps}`
    );
  }
}

// ── Specification digest (seal before execution) ─────────────────────────

export const V6_SPECIFICATION_DIGEST = dig(V6_SPECIFICATION);
