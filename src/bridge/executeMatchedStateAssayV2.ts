/**
 * executeMatchedStateAssayV2.ts
 *
 * Amelia — Constitutive History: Prospective Matched-State Assay V2
 * Corrective Implementation and Sealed Execution
 *
 * Replaces the legacy Poincare-return assay with one prospectively specified
 * matched-state experiment directly testing whether retained PFM deformation
 * produces differentiated future trajectories when every non-PFM operative
 * condition is held identical.
 */

import {
  CanonicalAmeliaRuntimeImpl,
  CanonicalAmeliaLineageInstance,
  SEALED_NUMOGRAM_TOPOLOGY_PROOF,
} from '../substrate/canonicalAmeliaRuntimeImpl';
import {
  BoundedSolicitation,
  CanonicalTransitionRequest,
} from '../substrate/AmeliaHistoryConditionedTransitionSubstrate';
import { canonicalSha256 } from '../lib/sha256';
import { ZoneId } from '../types/amelia';

// ── Types and Interfaces ──────────────────────────────────────────────────

export interface PoincarePoint {
  readonly u: number;
  readonly v: number;
}

export type HistoryLabel = 'H_ALPHA' | 'H_BETA' | 'H_GAMMA';
export type AssayCondition = 'HISTORY_RETAINED' | 'ABLATED' | 'NEUTRAL_RESET' | 'TENSOR_PERMUTED';

export interface TriadReplicateResult {
  readonly depth: number;
  readonly replicateIndex: number;
  readonly condition: AssayCondition;
  readonly pairDistances: {
    readonly pair: [HistoryLabel, HistoryLabel];
    readonly distance: number;
  }[];
  readonly meanDistance: number;
}

export interface DepthSummaryStats {
  readonly depth: number;
  readonly condition: AssayCondition;
  readonly nTriads: number;
  readonly nPairsPerTriad: number;
  readonly nTotalPairs: number;
  readonly triadMean: number;
  readonly standardDeviation: number;
  readonly standardErrorOfMean: number;
  readonly minTriadMean: number;
  readonly maxTriadMean: number;
}

export interface SensitivityGridResult {
  readonly eta: number;
  readonly kappa: number;
  readonly depthResults: {
    readonly depth: number;
    readonly historyRetainedMean: number;
    readonly ablatedMean: number;
    readonly neutralResetMean: number;
  }[];
}

// ── Deterministic PRNG ─────────────────────────────────────────────────────

export function createDeterministicRng(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ── Prospective V2 Angular Embedding & Poincare Projection ────────────────

export const V2_ANGULAR_EMBEDDING_TABLE: readonly number[] = Object.freeze(
  Array.from({ length: 10 }, (_, z) => (2 * Math.PI * z) / 10)
);

export function projectToPoincareDiskV2(
  occupancy: readonly number[],
  pfm: readonly (readonly number[])[],
  governorTension: number
): PoincarePoint {
  let rawX = 0;
  let rawY = 0;

  for (let z = 0; z < 10; z++) {
    let strainZ = 0;
    for (let c = 0; c < 10; c++) {
      strainZ += pfm[z][c];
    }
    const weightZ = occupancy[z] * (1.0 + 0.8 * Math.tanh(strainZ));
    const thetaZ = V2_ANGULAR_EMBEDDING_TABLE[z];
    rawX += weightZ * Math.cos(thetaZ);
    rawY += weightZ * Math.sin(thetaZ);
  }

  const rawRadius = Math.sqrt(rawX * rawX + rawY * rawY);
  if (rawRadius < 1e-12) {
    return { u: 0.0, v: 0.0 };
  }

  const targetRadius = Math.min(0.95, Math.tanh(rawRadius * 1.5 + governorTension * 0.05));
  return {
    u: (rawX / rawRadius) * targetRadius,
    v: (rawY / rawRadius) * targetRadius,
  };
}

export function poincareDistance(p: PoincarePoint, q: PoincarePoint): number {
  const normPSq = p.u * p.u + p.v * p.v;
  const normQSq = q.u * q.u + q.v * q.v;
  const diffSq = (p.u - q.u) * (p.u - q.u) + (p.v - q.v) * (p.v - q.v);
  const denom = (1.0 - normPSq) * (1.0 - normQSq);

  if (diffSq < 1e-24 || denom <= 1e-12) {
    return 0.0;
  }

  const arg = Math.max(1.0, 1.0 + (2.0 * diffSq) / denom);
  return Math.acosh(arg);
}

// ── PFM Update Law ─────────────────────────────────────────────────────────

export function conditionDonorTensor(
  seed: number,
  depth: number,
  eta: number,
  kappa: number,
  historyLabel: HistoryLabel
): number[][] {
  let pool: ZoneId[] = [0, 9, 1, 4, 8];
  if (historyLabel === 'H_BETA') pool = [2, 5, 7];
  else if (historyLabel === 'H_GAMMA') pool = [3, 6];

  const rng = createDeterministicRng(seed * 100000 + depth * 100 + Math.round(eta * 10000));
  const M: number[][] = Array.from({ length: 10 }, (_, r) =>
    Array.from({ length: 10 }, (_, c) => (r === c ? 0.25 : 0.05))
  );

  for (let step = 0; step < depth; step++) {
    const poolIdx = Math.floor(rng() * pool.length);
    const targetZone = pool[poolIdx];
    const baseFlux = 0.05 + rng() * 0.12;
    const fluxDelta = Math.max(0.01, baseFlux);

    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const isTarget = r === targetZone || c === targetZone;
        const isSyzygy = r + c === 9;
        const coupling = isTarget ? fluxDelta * (eta / 0.05) * 0.08 : 0.0;
        const resonance = isSyzygy ? kappa * 0.02 : 0.0;

        M[r][c] = Math.min(1.0, M[r][c] * (1.0 - eta * 0.12) + coupling + resonance);
      }
    }
  }

  return M;
}

// ── Canonical Matched Return State s* Definition ───────────────────────────

export interface SerializedNonPfmState {
  readonly currentZone: number;
  readonly eventIndex: number;
  readonly zoneVisitCounts: readonly number[];
  readonly qabbala: {
    readonly zones: Record<string, unknown>;
    readonly gates: readonly unknown[];
  };
  readonly memory: {
    readonly events: readonly unknown[];
    readonly zoneStrainHistory: readonly number[];
    readonly hysteresisTension: number;
  };
  readonly governor: Record<string, unknown>;
  readonly traitEvolution: readonly unknown[];
  readonly suppressRelaySteering: boolean;
  readonly noRelaySteering: boolean;
}

export function buildCanonicalMatchedState(): {
  sStar: SerializedNonPfmState;
  matchedStateDigestExcludingPFM: string;
} {
  const baseInst = new CanonicalAmeliaLineageInstance('canonical_matched_state_base', 0);
  baseInst.currentZone = 0;
  baseInst.eventIndex = 0;
  baseInst.zoneVisitCounts = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10];

  const sStar: SerializedNonPfmState = {
    currentZone: baseInst.currentZone,
    eventIndex: baseInst.eventIndex,
    zoneVisitCounts: [...baseInst.zoneVisitCounts],
    qabbala: {
      zones: JSON.parse(JSON.stringify(baseInst.qabbala.getZones())),
      gates: JSON.parse(JSON.stringify(baseInst.qabbala.getGates())),
    },
    memory: JSON.parse(JSON.stringify(baseInst.memory.exportState())),
    governor: JSON.parse(JSON.stringify(baseInst.governor.exportState())),
    traitEvolution: JSON.parse(JSON.stringify(baseInst.traitEvolution.getHistory())),
    suppressRelaySteering: true,
    noRelaySteering: true,
  };

  const matchedStateDigestExcludingPFM = canonicalSha256(JSON.stringify(sStar));
  return { sStar, matchedStateDigestExcludingPFM };
}

// ── Native Regime Classifier ───────────────────────────────────────────────

export const REGIME_CLASSIFIER_SOURCE = `
function classifyNativeRegime(input: {
  zoneOccupancy: readonly number[];
  gateState: readonly { isOpen: boolean; flux: number; resistance: number }[];
  governorTelemetry: { antiLockIntegrity: number; deformationFieldTension: number };
  noRelaySteering: boolean;
}): { label: string; isGridRegime: boolean; digest: string } {
  const isSyzygyBalanced = [
    Math.abs(input.zoneOccupancy[0] - input.zoneOccupancy[9]),
    Math.abs(input.zoneOccupancy[1] - input.zoneOccupancy[8]),
    Math.abs(input.zoneOccupancy[2] - input.zoneOccupancy[7]),
    Math.abs(input.zoneOccupancy[3] - input.zoneOccupancy[6]),
    Math.abs(input.zoneOccupancy[4] - input.zoneOccupancy[5]),
  ].every(diff => diff < 0.20);

  let label: string;
  let isGridRegime: boolean;

  if (input.noRelaySteering && isSyzygyBalanced && input.governorTelemetry.antiLockIntegrity >= 80.0) {
    label = 'SYZYGETIC_GRID';
    isGridRegime = true;
  } else if (input.zoneOccupancy[9] > 0.65) {
    label = 'REGIME_HYPERSTITION_CANALIZED_Z9';
    isGridRegime = true;
  } else if (input.zoneOccupancy[0] > 0.40) {
    label = 'REGIME_ABYSSAL_DESCENT_Z0';
    isGridRegime = false;
  } else {
    label = 'REGIME_DIFFUSE_MULTICENTRIC_FLUX';
    isGridRegime = false;
  }

  const digest = canonicalSha256(JSON.stringify({ label, isGridRegime, input }));
  return { label, isGridRegime, digest };
}
`.trim();

export function classifyNativeRegime(input: {
  zoneOccupancy: readonly number[];
  gateState: readonly { isOpen: boolean; flux: number; resistance: number }[];
  governorTelemetry: { antiLockIntegrity: number; deformationFieldTension: number };
  noRelaySteering: boolean;
}): { label: string; isGridRegime: boolean; digest: string } {
  const isSyzygyBalanced = [
    Math.abs(input.zoneOccupancy[0] - input.zoneOccupancy[9]),
    Math.abs(input.zoneOccupancy[1] - input.zoneOccupancy[8]),
    Math.abs(input.zoneOccupancy[2] - input.zoneOccupancy[7]),
    Math.abs(input.zoneOccupancy[3] - input.zoneOccupancy[6]),
    Math.abs(input.zoneOccupancy[4] - input.zoneOccupancy[5]),
  ].every((diff) => diff < 0.2);

  let label: string;
  let isGridRegime: boolean;

  if (input.noRelaySteering && isSyzygyBalanced && input.governorTelemetry.antiLockIntegrity >= 80.0) {
    label = 'SYZYGETIC_GRID';
    isGridRegime = true;
  } else if (input.zoneOccupancy[9] > 0.65) {
    label = 'REGIME_HYPERSTITION_CANALIZED_Z9';
    isGridRegime = true;
  } else if (input.zoneOccupancy[0] > 0.4) {
    label = 'REGIME_ABYSSAL_DESCENT_Z0';
    isGridRegime = false;
  } else {
    label = 'REGIME_DIFFUSE_MULTICENTRIC_FLUX';
    isGridRegime = false;
  }

  const digest = canonicalSha256(JSON.stringify({ label, isGridRegime, input }));
  return { label, isGridRegime, digest };
}

// ── Matched Observation Projection o* ──────────────────────────────────────

export function buildObservationProjection(sStar: SerializedNonPfmState): {
  oStar: Record<string, unknown>;
  observedProjectionDigest: string;
} {
  const totalVisits = sStar.zoneVisitCounts.reduce((a, b) => a + b, 0) || 1;
  const zoneOccupancy = sStar.zoneVisitCounts.map((v) => Number((v / totalVisits).toFixed(6)));

  const oStar = {
    zoneOccupancy,
    currentZone: sStar.currentZone,
    eventIndex: sStar.eventIndex,
    governor: {
      antiLockIntegrity: (sStar.governor as any).antiLockIntegrity,
      consolidationEntropy: (sStar.governor as any).consolidationEntropy,
      deformationFieldTension: (sStar.governor as any).deformationTension,
      advisoryWeight: (sStar.governor as any).advisoryWeight,
      momentumDamping: (sStar.governor as any).momentumDamping,
    },
    topologyDigest: SEALED_NUMOGRAM_TOPOLOGY_PROOF.topologyDigest,
  };

  const observedProjectionDigest = canonicalSha256(JSON.stringify(oStar));
  return { oStar, observedProjectionDigest };
}

// ── 20-Step Return Evaluator ───────────────────────────────────────────────

export interface ReturnEvaluationOutput {
  readonly coords: PoincarePoint;
  readonly terminalDeformationTensor: number[][];
  readonly terminalOccupancy: readonly number[];
  readonly governorTelemetryHistory: {
    readonly step: number;
    readonly disposition: string;
    readonly tension: number;
    readonly antiLockIntegrity: number;
  }[];
  readonly preReturnDigestMatch: boolean;
}

export async function execute20StepReturn(
  sStar: SerializedNonPfmState,
  matchedStateDigestExcludingPFM: string,
  injectedTensor: readonly (readonly number[])[],
  lineageLabel: string
): Promise<ReturnEvaluationOutput> {
  const runtime = new CanonicalAmeliaRuntimeImpl();
  const lineageId = `v2_ret_${lineageLabel}_${canonicalSha256(JSON.stringify(injectedTensor)).slice(0, 8)}`;
  const inst = new CanonicalAmeliaLineageInstance(lineageId, 0);

  // 1. Hydrate EVERY non-PFM field byte-for-byte from s*
  inst.eventIndex = sStar.eventIndex;
  inst.currentZone = sStar.currentZone as any;
  inst.zoneVisitCounts = [...sStar.zoneVisitCounts];
  inst.qabbala.setZones(JSON.parse(JSON.stringify(sStar.qabbala.zones)));
  inst.qabbala.setGates(JSON.parse(JSON.stringify(sStar.qabbala.gates)));
  inst.memory.importState(JSON.parse(JSON.stringify(sStar.memory)));
  inst.governor.importState(JSON.parse(JSON.stringify(sStar.governor)));

  // 2. Pre-execution verification of non-PFM digest
  const reconstructedNonPfm: SerializedNonPfmState = {
    currentZone: inst.currentZone,
    eventIndex: inst.eventIndex,
    zoneVisitCounts: [...inst.zoneVisitCounts],
    qabbala: {
      zones: JSON.parse(JSON.stringify(inst.qabbala.getZones())),
      gates: JSON.parse(JSON.stringify(inst.qabbala.getGates())),
    },
    memory: JSON.parse(JSON.stringify(inst.memory.exportState())),
    governor: JSON.parse(JSON.stringify(inst.governor.exportState())),
    traitEvolution: JSON.parse(JSON.stringify(inst.traitEvolution.getHistory())),
    suppressRelaySteering: true,
    noRelaySteering: true,
  };

  const preDigest = canonicalSha256(JSON.stringify(reconstructedNonPfm));
  if (preDigest !== matchedStateDigestExcludingPFM) {
    throw new Error(
      `[V2 Matched-State Fail-Closed] Non-PFM state digest mismatch prior to return. Expected ${matchedStateDigestExcludingPFM}, got ${preDigest}`
    );
  }

  // 3. Inject donor PFM tensor
  inst.deformationTensor = injectedTensor.map((row) => [...row]);
  (runtime as any).lineages.set(lineageId, inst);

  const protocolId = `PROTO_V2_${lineageId}`;
  const runId = `RUN_V2_${lineageId}`;
  const protocolDigest = canonicalSha256(`PROTO:${protocolId}`);

  const governorTelemetryHistory: {
    step: number;
    disposition: string;
    tension: number;
    antiLockIntegrity: number;
  }[] = [];

  // 4. Run exactly 20 native discrete transition steps (0..19)
  for (let step = 0; step < 20; step++) {
    const beforeObs = await runtime.inspectLineage(lineageId);
    const solicitationId = `sol_${lineageId}_step_${step}`;
    const solicitation: BoundedSolicitation = {
      solicitationId,
      solicitationDigest: canonicalSha256(`SOL:${solicitationId}`),
      nativePayloadRef: `CHALLENGE_${step}`,
      protocolDigest,
      noTargetVector: true,
      noOutcomeBlueprint: true,
      noRelaySteering: true,
    };

    const govDecision = await runtime.decideSolicitation({
      protocolId,
      runId,
      observation: beforeObs,
      solicitation,
    });

    const tel = inst.governor.getTelemetry();
    governorTelemetryHistory.push({
      step,
      disposition: govDecision.disposition,
      tension: tel.deformationFieldTension,
      antiLockIntegrity: tel.antiLockIntegrity,
    });

    if (govDecision.disposition === 'ADMIT') {
      const request: CanonicalTransitionRequest = {
        protocolId,
        runId,
        before: beforeObs,
        solicitation,
        governorDecision: govDecision,
      };
      await runtime.advanceLineage(request);
    }
  }

  // 5. Final terminal state S_20,M(s*)
  const finalObs = await runtime.inspectLineage(lineageId);
  const finalGov = inst.governor.getTelemetry();

  const coords = projectToPoincareDiskV2(
    finalObs.zoneOccupancy,
    inst.deformationTensor,
    finalGov.deformationFieldTension
  );

  return {
    coords,
    terminalDeformationTensor: inst.deformationTensor.map((r) => [...r]),
    terminalOccupancy: [...finalObs.zoneOccupancy],
    governorTelemetryHistory,
    preReturnDigestMatch: true,
  };
}
