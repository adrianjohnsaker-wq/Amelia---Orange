/**
 * AMELIA NATIVE DEVELOPMENTAL PROFILE MAP
 * Pure reader of the sealed HistoryConditionedStepOutcome stream.
 * Never executes a cycle. Never synthesises a receipt. Fails closed.
 *
 * Two digests per profile:
 *
 *   fullProfileDigest =
 *     sha256(canonical(exits, zones, pfmHeads, occupancies, phases))
 *   Complete provenance: confirms histories were genuinely distinct.
 *
 *   effectiveTopologyDigest =
 *     sha256(canonical(exits, zones, occupancies, phases))
 *   The actual comparison key. PFM heads are excluded because they
 *   differ across lineages by design (distinct seeds/depths), so
 *   including them would classify the known Plex-binary ground state
 *   as HISTORY_DIFFERENTIATED_EFFECTIVE_TOPOLOGY. This digest answers
 *   the correct question: does history alter effective route access,
 *   independent of the fact that PFM states diverge?
 *
 * Decisive logic:
 *   PFM histories different, effectiveTopologyDigests same
 *     → PLEX_BINARY_RETAINED
 *   PFM histories different, effectiveTopologyDigests different
 *     → HISTORY_DIFFERENTIATED_EFFECTIVE_TOPOLOGY
 *
 * Two-way outcome only. Intermediate-zone access characterises
 * HISTORY_DIFFERENTIATED_EFFECTIVE_TOPOLOGY; it is not a gate.
 *
 * Non-admission events are recorded as observed Governor behaviour,
 * not treated as malformed steps.
 *
 * sealedAt and archive evidence are read from the create-only archive
 * receipt, not from new Date() or assumed API methods.
 *
 * HistoryConditionedStepOutcome is imported from the transition
 * substrate; it is not locally redefined here.
 */

import { canonicalSha256 } from '../lib/sha256';
// Import the canonical type from the transition substrate.
import type {
  HistoryConditionedStepOutcome,
} from '../substrate/AmeliaHistoryConditionedTransitionSubstrate';
import { BridgePhaseArchive } from '../firebase/bridgePhaseArchive';

// ── Canonical infrastructure ──────────────────────────────────────────────

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

// ── Ground-state baseline ─────────────────────────────────────────────────
// Read from sealed archive record, not hardcoded.

export interface GroundStateBaselineRecord {
  protocolId:                string;
  runId:                     string;
  archiveHead:               string;
  effectiveTopologyDigest:   string; // The comparison key from the unhindered run
  zoneDistribution:          Record<number, number>;
  description:               string;
}

export const GROUND_STATE_ARCHIVE_KEY = 'AMELIA_UNHINDERED_GROUND_STATE_V1';

// ── The five sequences constituting a native profile ──────────────────────

export interface FiveSequences {
  exitDigests:     string[];  // [1] selectedExitDigest per step
  zoneTransitions: string[];  // [2] "Z{from}→Z{to}" per step
  pfmHeads:        string[];  // [3] after.pfmHeadDigest per step
  zoneOccupancies: string[];  // [4] cj(after.zoneOccupancy) per step
  phaseKinds:      string[];  // [5] after.phaseKind per step
}

export function buildFiveSequences(
  steps: HistoryConditionedStepOutcome[],
): FiveSequences {
  const sorted = [...steps].sort((a, b) => a.step - b.step);
  return {
    exitDigests:     sorted.map(s => s.selectedExitDigest),
    zoneTransitions: sorted.map(s =>
      `Z${s.before.currentZone}→Z${s.after.currentZone}`),
    pfmHeads:        sorted.map(s => s.after.pfmHeadDigest),
    zoneOccupancies: sorted.map(s => cj(s.after.zoneOccupancy)),
    phaseKinds:      sorted.map(s => s.after.phaseKind),
  };
}

// ── Two digests ───────────────────────────────────────────────────────────

export function computeFullProfileDigest(seq: FiveSequences): string {
  return sha256(cj({
    exits:       seq.exitDigests,
    transitions: seq.zoneTransitions,
    pfmHeads:    seq.pfmHeads,        // retained for provenance
    occupancies: seq.zoneOccupancies,
    phases:      seq.phaseKinds,
  }));
}

export function computeEffectiveTopologyDigest(seq: FiveSequences): string {
  // PFM heads excluded: they differ across lineages by design.
  // This digest answers: did history alter effective route access?
  return sha256(cj({
    exits:       seq.exitDigests,
    transitions: seq.zoneTransitions,
    occupancies: seq.zoneOccupancies,
    phases:      seq.phaseKinds,
  }));
}

// ── Native developmental profile ─────────────────────────────────────────

export interface NativeDevelopmentalProfile {
  lineageId:     string;
  seed:          number;
  depth:         number;
  stepCount:     number;
  admittedCount: number;  // admitted steps
  deferredCount: number;  // non-admitted Governor events (recorded, not erased)
  sequences:     FiveSequences;

  // Two digests — see module header for their distinct roles
  fullProfileDigest:          string;
  effectiveTopologyDigest:    string;

  // Descriptive characterisation — not comparison gates
  zoneOccupancySummary:    Record<number, number>; // mean across admitted steps
  intermediateZonesVisited:number[];               // Z2,Z4,Z6,Z8 if any
  uniqueExitCount:         number;
  plexBinaryOnly:          boolean;

  // Provenance from the sealed receipts
  archiveRecordIds:    string[];
  receiptDigestChain:  string; // sha256(sorted transitionReceiptDigests)
}

// ── Build profile — fail closed on structural absence; record non-admission
// A non-admitted step is Governor behaviour, not a malformed receipt.

export function buildNativeDevelopmentalProfile(
  lineageId: string,
  seed:      number,
  depth:     number,
  outcomes:  HistoryConditionedStepOutcome[],
): NativeDevelopmentalProfile {
  if (outcomes.length === 0)
    throw new Error(
      `[ProfileMap] No outcomes for lineage ${lineageId}. Fail closed.`
    );

  // Structural validation — required fields must be present on every outcome.
  // Non-admission is valid Governor behaviour; absence of required fields is not.
  for (const o of outcomes) {
    if (
      o.selectedExitDigest === undefined ||
      o.after?.pfmHeadDigest === undefined ||
      o.after?.currentZone  === undefined ||
      o.archiveRecordId     === undefined ||
      o.transitionReceiptDigest === undefined
    ) {
      throw new Error(
        `[ProfileMap] Outcome at step ${o.step} lineage ${lineageId} ` +
        `missing required fields. Fail closed.`
      );
    }
  }

  // Partition admitted vs Governor-deferred
  const admitted = outcomes.filter(o => o.admitted);
  const deferred = outcomes.filter(o => !o.admitted);

  // Profile sequences are built from admitted steps only.
  // Deferral counts are retained in the profile as observed Governor evidence.
  if (admitted.length === 0)
    throw new Error(
      `[ProfileMap] All steps Governor-deferred for lineage ${lineageId}. ` +
      `No admitted transitions to profile. Fail closed.`
    );

  const sequences              = buildFiveSequences(admitted);
  const fullProfileDigest      = computeFullProfileDigest(sequences);
  const effectiveTopologyDigest = computeEffectiveTopologyDigest(sequences);

  // Descriptive: mean zone occupancy across admitted steps
  const zoneOccupancySummary: Record<number, number> = {};
  for (let z = 0; z <= 9; z++) {
    const vals = admitted.map(o => o.after.zoneOccupancy[z] ?? 0);
    zoneOccupancySummary[z] = vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  const intermediateZones = new Set([2, 4, 6, 8]);
  const zonesVisited = new Set(
    admitted.flatMap(o => [o.before.currentZone, o.after.currentZone])
  );
  const intermediateZonesVisited = [...zonesVisited]
    .filter(z => intermediateZones.has(z))
    .sort((a, b) => a - b);
  const plexBinaryOnly = intermediateZonesVisited.length === 0 &&
    [...zonesVisited].every(z => z === 0 || z === 9);
  const uniqueExitCount = new Set(sequences.exitDigests).size;

  const archiveRecordIds   = outcomes.map(o => o.archiveRecordId);
  const receiptDigestChain = sha256(
    [...outcomes]
      .sort((a, b) => a.step - b.step)
      .map(o => o.transitionReceiptDigest)
      .join('|')
  );

  return {
    lineageId, seed, depth,
    stepCount:     outcomes.length,
    admittedCount: admitted.length,
    deferredCount: deferred.length,
    sequences,
    fullProfileDigest,
    effectiveTopologyDigest,
    zoneOccupancySummary,
    intermediateZonesVisited,
    uniqueExitCount,
    plexBinaryOnly,
    archiveRecordIds,
    receiptDigestChain,
  };
}

// ── Two-way comparison ────────────────────────────────────────────────────

export type ProfileOutcome =
  | 'PLEX_BINARY_RETAINED'
  | 'HISTORY_DIFFERENTIATED_EFFECTIVE_TOPOLOGY';

export interface NativeProfileComparison {
  outcomeProtocolId:      'AMELIA_NATIVE_PROFILE_MAP_V1';
  profiles:               NativeDevelopmentalProfile[];
  lineageCount:           number;

  // effectiveTopologyDigest is the comparison key
  uniqueEffectiveTopologyCount: number;
  outcome:                      ProfileOutcome;

  // fullProfileDigest confirms histories were genuinely distinct
  uniqueFullProfileCount:       number;
  pfmHistoriesWereDistinct:     boolean;

  // Descriptive characterisation
  description:             string;
  intermediateZonesSeen:   number[];
  allPlexBinaryOnly:       boolean;
  differentiatedLineages:  string[]; // lineageIds with distinct effectiveTopologyDigest

  // Baseline comparison
  groundStateEffectiveDig: string | null;
  matchesGroundState:      boolean | null;

  // Provenance — populated from archive receipt after sealing
  comparisonDigest:        string;
  archiveReceiptId:        string | null;
  archiveHeadDigest:       string | null;
}

export function compareNativeProfiles(
  profiles:                NativeDevelopmentalProfile[],
  groundStateEffectiveDig: string | null = null,
): NativeProfileComparison {
  if (profiles.length === 0)
    throw new Error('[ProfileMap] Cannot compare zero profiles. Fail closed.');

  // Comparison uses effectiveTopologyDigest only
  const effectiveDigs = profiles.map(p => p.effectiveTopologyDigest);
  const uniqueEffective = new Set(effectiveDigs);
  const uniqueEffectiveTopologyCount = uniqueEffective.size;

  // fullProfileDigest confirms PFM histories were distinct
  const fullDigs = profiles.map(p => p.fullProfileDigest);
  const uniqueFullProfileCount    = new Set(fullDigs).size;
  const pfmHistoriesWereDistinct  = uniqueFullProfileCount > 1;

  const referenceEffective = effectiveDigs[0];
  const outcome: ProfileOutcome = uniqueEffectiveTopologyCount === 1
    ? 'PLEX_BINARY_RETAINED'
    : 'HISTORY_DIFFERENTIATED_EFFECTIVE_TOPOLOGY';

  const differentiatedLineages = profiles
    .filter(p => p.effectiveTopologyDigest !== referenceEffective)
    .map(p => p.lineageId);

  const allPlexBinaryOnly = profiles.every(p => p.plexBinaryOnly);
  const intermediateZonesSeen = [
    ...new Set(profiles.flatMap(p => p.intermediateZonesVisited)),
  ].sort((a, b) => a - b);

  const matchesGroundState =
    groundStateEffectiveDig === null
      ? null
      : outcome === 'PLEX_BINARY_RETAINED' &&
        referenceEffective === groundStateEffectiveDig;

  let description: string;
  if (outcome === 'PLEX_BINARY_RETAINED') {
    description =
      `All ${profiles.length} lineages share the same effectiveTopologyDigest ` +
      `(${referenceEffective.slice(0, 16)}…) despite distinct PFM histories ` +
      `(${uniqueFullProfileCount} distinct fullProfileDigests). ` +
      (allPlexBinaryOnly
        ? 'Only Z0 and Z9 visited across all lineages — strict Plex binary. '
        : 'Exit and occupancy sequences identical; some zone variation within Z0/Z9 envelope. ') +
      'Developmental history has not altered effective route access. ' +
      (matchesGroundState === true
        ? 'Effective-topology signature matches the unhindered ground-state baseline.'
        : matchesGroundState === false
        ? 'Effective-topology signature differs from the unhindered ground-state baseline.'
        : 'Ground-state baseline not available for comparison.');
  } else {
    description =
      `${uniqueEffectiveTopologyCount} distinct effectiveTopologyDigests across ` +
      `${profiles.length} lineages (${uniqueFullProfileCount} distinct fullProfileDigests). ` +
      'Developmental history is altering effective route access. ' +
      (intermediateZonesSeen.length > 0
        ? `Intermediate zones accessed: [${intermediateZonesSeen.map(z => `Z${z}`).join(', ')}]. `
        : 'No intermediate-zone access yet — differentiation is within the Z0/Z9 exit envelope. ') +
      `Lineages with distinct effective topology: [${differentiatedLineages.join(', ')}]. ` +
      'This is the decisive contrast with the unhindered ground-state phenotype.';
  }

  const comparisonDigest = dig({
    effectiveDigs: [...effectiveDigs].sort(),
    outcome,
    uniqueEffectiveTopologyCount,
  });

  return {
    outcomeProtocolId:            'AMELIA_NATIVE_PROFILE_MAP_V1',
    profiles,
    lineageCount:                 profiles.length,
    uniqueEffectiveTopologyCount,
    outcome,
    uniqueFullProfileCount,
    pfmHistoriesWereDistinct,
    description,
    intermediateZonesSeen,
    allPlexBinaryOnly,
    differentiatedLineages,
    groundStateEffectiveDig,
    matchesGroundState,
    comparisonDigest,
    archiveReceiptId:    null, // populated after sealProfileComparison
    archiveHeadDigest:   null, // populated after sealProfileComparison
  };
}

// ── Archive loaders ───────────────────────────────────────────────────────

export async function loadLineageOutcomes(
  lineageId: string,
  archive:   BridgePhaseArchive,
): Promise<HistoryConditionedStepOutcome[]> {
  const record = await archive.get(`LINEAGE_OUTCOMES_${lineageId}`);
  if (!record?.payload)
    throw new Error(
      `[ProfileMap] Archive record not found for lineage ${lineageId}. Fail closed.`
    );
  const outcomes = record.payload as HistoryConditionedStepOutcome[];
  for (const o of outcomes) {
    if (
      o.selectedExitDigest      === undefined ||
      o.archiveRecordId         === undefined ||
      o.transitionReceiptDigest === undefined
    )
      throw new Error(
        `[ProfileMap] Malformed outcome step ${o.step} lineage ${lineageId}. Fail closed.`
      );
  }
  return outcomes;
}

export async function loadGroundStateBaseline(
  archive: BridgePhaseArchive,
): Promise<GroundStateBaselineRecord | null> {
  const record = await archive.get(GROUND_STATE_ARCHIVE_KEY);
  return (record?.payload as GroundStateBaselineRecord) ?? null;
}

// ── Seal into create-only archive — sealedAt from receipt ────────────────

export async function sealProfileComparison(
  comparison: NativeProfileComparison,
  archive:    BridgePhaseArchive,
): Promise<NativeProfileComparison> {
  const receipt = await archive.createOnly(
    `PROFILE_MAP_${comparison.comparisonDigest.slice(0, 16)}`,
    {
      phaseKey:               'AMELIA_NATIVE_PROFILE_MAP_V1',
      payload:                comparison,
      canonicalPayload:       cj({
        outcome:                       comparison.outcome,
        uniqueEffectiveTopologyCount:  comparison.uniqueEffectiveTopologyCount,
        pfmHistoriesWereDistinct:      comparison.pfmHistoriesWereDistinct,
        comparisonDigest:              comparison.comparisonDigest,
      }),
      canonicalPayloadDigest: comparison.comparisonDigest,
    }
  );

  // Populate provenance from the archive receipt
  return {
    ...comparison,
    archiveReceiptId:  receipt?.id          ?? null,
    archiveHeadDigest: receipt?.headDigest  ?? null,
  };
}

// ── Format for bridge display ─────────────────────────────────────────────

export function formatProfileComparisonForBridge(
  r: NativeProfileComparison
): string {
  const lines: string[] = [
    'BRIDGE MORPHOGENETIC — NATIVE PROFILE MAP RESULT',
    '═'.repeat(72),
    `Protocol:                     ${r.outcomeProtocolId}`,
    `Outcome:                      ${r.outcome}`,
    `Lineages:                     ${r.lineageCount}`,
    `Unique effective topologies:  ${r.uniqueEffectiveTopologyCount}`,
    `Unique full profiles:         ${r.uniqueFullProfileCount}`,
    `PFM histories were distinct:  ${r.pfmHistoriesWereDistinct}`,
    `Matches ground-state:         ${r.matchesGroundState ?? 'unknown (baseline not loaded)'}`,
    '',
    'DESCRIPTION:',
    r.description,
    '',
    'PER-LINEAGE PROFILES:',
    'Lineage'.padEnd(24) +
      'effectiveTopo (16c)'.padEnd(20) +
      'fullProfile (16c)'.padEnd(20) +
      'Plex?  IntZones  Admits/Defers',
    '─'.repeat(84),
  ];

  for (const p of r.profiles) {
    const iz = p.intermediateZonesVisited.length > 0
      ? p.intermediateZonesVisited.map(z => `Z${z}`).join(',')
      : '—';
    lines.push(
      p.lineageId.padEnd(24) +
      p.effectiveTopologyDigest.slice(0, 16).padEnd(20) +
      p.fullProfileDigest.slice(0, 16).padEnd(20) +
      String(p.plexBinaryOnly).padEnd(7) +
      iz.padEnd(9) +
      `${p.admittedCount}/${p.deferredCount}`
    );
  }

  lines.push('');
  if (r.archiveReceiptId)
    lines.push(`Archive receipt:   ${r.archiveReceiptId}`);
  if (r.archiveHeadDigest)
    lines.push(`Archive head:      ${r.archiveHeadDigest}`);
  lines.push(`Comparison digest: ${r.comparisonDigest}`);
  lines.push('noAdvancementClaims: true');
  lines.push('status: PROFILE_MAP_SEALED');
  return lines.join('\n');
}

// ── Canonical meaning ─────────────────────────────────────────────────────

export const CANONICAL_MEANING = `
AMELIA NATIVE DEVELOPMENTAL PROFILE MAP — Canonical Meaning

Pure reader of HistoryConditionedStepOutcome from the transition substrate.
Never executes a cycle. Never synthesises a receipt. Fails closed.
Non-admitted steps are recorded Governor events, not errors.

Two digests per profile:
  fullProfileDigest =
    sha256(canonical(exits, zones, pfmHeads, occupancies, phases))
  Complete provenance. Confirms histories were genuinely distinct.
  Will differ across lineages by design (different seeds/depths).

  effectiveTopologyDigest =
    sha256(canonical(exits, zones, occupancies, phases))
  The comparison key. PFM heads excluded.
  Answers: did history alter effective route access?
  Identical across the Plex-binary ground state despite distinct PFM heads.

Decisive logic:
  PFM distinct + effectiveTopology same → PLEX_BINARY_RETAINED
  PFM distinct + effectiveTopology different → HISTORY_DIFFERENTIATED_EFFECTIVE_TOPOLOGY

Intermediate-zone access describes what differentiation looks like.
It is not a gate for the two-way outcome.

Ground-state baseline read from sealed archive record
AMELIA_UNHINDERED_GROUND_STATE_V1 — not hardcoded.
sealedAt and archive evidence from create-only receipt — not new Date().
`.trim();
