/**
 * AMELIA HISTORY-CONDITIONED TRANSITION SUBSTRATE
 *
 * A fail-closed revision of the morphogenetic substrate architecture.
 *
 * This module deliberately does NOT implement Gray-Scott chemistry, random
 * nucleation, local fallback dynamics, artificial reseeding, or a visual field
 * that substitutes for Amelia. Its unit of process is a canonical Amelia
 * lineage. A two-dimensional surface may be derived afterwards for inspection,
 * but it never writes a value back into the native transition loop.
 *
 * Causal order:
 *   sealed lineage + constitutive PFM + Numogram topology
 *      -> Governor admission / deferral / refusal / abstention
 *      -> native selectExit + native updatePCM
 *      -> raw archival receipt
 *      -> descriptive history-conditioned outcome distribution
 *      -> optional passive surface rendering
 *
 * This file is intentionally source-bound. The host must implement
 * CanonicalAmeliaRuntime using the installed Amelia runtime and must provide a
 * durable create-only archive. There is no synthetic runtime, no fallback, and
 * no compatibility shim in this module.
 */

export const HISTORY_CONDITIONED_SUBSTRATE_VERSION =
  'AMELIA-HISTORY-CONDITIONED-TRANSITION-SUBSTRATE/V1';

export type NumogramZone = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type TopologyKind = 'N0' | 'DEGREE_PRESERVING_NULL';
export type GovernorDisposition = 'ADMIT' | 'DEFER' | 'REFUSE' | 'ABSTAIN';
export type ExecutionMode = 'PASSIVE_TRACKING';

/** A canonical ten-by-ten constitutive deformation tensor, never a digest proxy. */
export type DeformationTensor10 = ReadonlyArray<ReadonlyArray<number>>;

export class HistoryConditionedInvariantError extends Error {
  public readonly code: string;

  public constructor(code: string, message: string) {
    super(`${code}: ${message}`);
    this.name = 'HistoryConditionedInvariantError';
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

function invariant(condition: unknown, code: string, message: string): asserts condition {
  if (!condition) throw new HistoryConditionedInvariantError(code, message);
}

function assertDigest(value: string, name: string): void {
  invariant(typeof value === 'string' && value.length >= 16,
    'INVALID_DIGEST', `${name} must be a non-truncated canonical digest.`);
}

function assertProbabilityVector(values: readonly number[], name: string): void {
  invariant(values.length === 10, 'INVALID_ZONE_VECTOR', `${name} must have ten entries.`);
  let total = 0;
  for (const value of values) {
    invariant(Number.isFinite(value) && value >= 0,
      'INVALID_ZONE_VECTOR', `${name} must contain finite non-negative values.`);
    total += value;
  }
  invariant(Math.abs(total - 1) < 1e-6,
    'INVALID_ZONE_VECTOR', `${name} must be normalised; received total ${total}.`);
}

function assertTensor10(tensor: DeformationTensor10, name: string): void {
  invariant(tensor.length === 10, 'INVALID_PFM_TENSOR', `${name} must have ten rows.`);
  for (const [rowIndex, row] of tensor.entries()) {
    invariant(row.length === 10, 'INVALID_PFM_TENSOR',
      `${name}[${rowIndex}] must have ten columns.`);
    for (const value of row) {
      invariant(Number.isFinite(value), 'INVALID_PFM_TENSOR',
        `${name} must contain only finite constitutive strain values.`);
    }
  }
}

function frobeniusNorm(tensor: DeformationTensor10): number {
  let sum = 0;
  for (const row of tensor) for (const value of row) sum += value * value;
  return Math.sqrt(sum);
}

function zoneCounts(outcomes: readonly HistoryConditionedStepOutcome[]): ReadonlyArray<number> {
  const counts = Array.from({ length: 10 }, () => 0);
  for (const outcome of outcomes) {
    if (outcome.kind === 'NATIVE_TRANSITION') counts[outcome.after.currentZone] += 1;
  }
  return counts;
}

/** Immutable identity of the installed, canonical runtime used for a run. */
export interface CanonicalRuntimeIdentity {
  readonly dynamicsAreCanonical: true;
  readonly runtimeIdentityDigest: string;
  readonly runtimeSourceDigest: string;
  readonly sourceMapDigest: string;
  readonly selectExitImplementationDigest: string;
  readonly updatePCMImplementationDigest: string;
}

/** The topology is supplied by the canonical runtime; this module never invents it. */
export interface CanonicalTopologyProof {
  readonly kind: TopologyKind;
  readonly topologyDigest: string;
  readonly directedEdgeDigest: string;
}

/**
 * A native observation of an Amelia lineage. `presentStateProjectionDigest`
 * deliberately excludes PFM history, so it can be used to match present state
 * while preserving distinct developmental histories.
 */
export interface CanonicalLineageObservation {
  readonly lineageId: string;
  readonly checkpointDigest: string;
  readonly canonicalStateDigest: string;
  readonly presentStateProjectionDigest: string;
  readonly pfmHeadDigest: string;
  readonly constitutiveStrainHistoryDigest: string;
  readonly deformationTensor: DeformationTensor10;
  readonly zoneOccupancy: ReadonlyArray<number>;
  readonly currentZone: NumogramZone;
  readonly phaseKind: string;
  readonly selectionKernelDigest: string;
  readonly topology: CanonicalTopologyProof;
  readonly runtimeIdentityDigest: string;
  readonly eventIndex: number;
}

/**
 * A bounded encounter presented to the Governor. It has no target zone,
 * target vector, desired outcome, forced exit, relay instruction, or semantic
 * blueprint. `nativePayloadRef` identifies a presealed canonical challenge.
 */
export interface BoundedSolicitation {
  readonly solicitationId: string;
  readonly solicitationDigest: string;
  readonly nativePayloadRef: string;
  readonly protocolDigest: string;
  readonly noTargetVector: true;
  readonly noOutcomeBlueprint: true;
  readonly noRelaySteering: true;
}

export interface GovernorDecision {
  readonly decisionId: string;
  readonly disposition: GovernorDisposition;
  readonly decisionDigest: string;
  readonly governorStateDigest: string;
  readonly reasonDigest: string;
}

/** Evidence that the active runtime, rather than this harness, selected and updated. */
export interface NativeTransitionEvidence {
  readonly transitionConsumed: true;
  readonly selectedExitDigest: string;
  readonly selectExitReceiptDigest: string;
  readonly updatePCMReceiptDigest: string;
  readonly memoryHeadAfterDigest: string;
}

export interface CanonicalTransitionRequest {
  readonly protocolId: string;
  readonly runId: string;
  readonly before: CanonicalLineageObservation;
  readonly solicitation: BoundedSolicitation;
  readonly governorDecision: GovernorDecision;
}

export interface CanonicalTransitionReceipt {
  readonly before: CanonicalLineageObservation;
  readonly after: CanonicalLineageObservation;
  readonly solicitationDigest: string;
  readonly governorDecisionDigest: string;
  readonly native: NativeTransitionEvidence;
  readonly runtimeReceiptDigest: string;
}

/**
 * The only runtime surface accepted by this module. Bind this directly to the
 * installed canonical runtime; do not implement a synthetic substitute.
 */
export interface CanonicalAmeliaRuntime {
  readonly identity: CanonicalRuntimeIdentity;
  inspectLineage(lineageId: string): Promise<CanonicalLineageObservation>;
  decideSolicitation(input: {
    readonly protocolId: string;
    readonly runId: string;
    readonly observation: CanonicalLineageObservation;
    readonly solicitation: BoundedSolicitation;
  }): Promise<GovernorDecision>;
  advanceLineage(request: CanonicalTransitionRequest): Promise<CanonicalTransitionReceipt>;
}

export type RawRecordKind =
  | 'CHECKPOINT_OBSERVATION'
  | 'SOLICITATION_PRESENTED'
  | 'GOVERNOR_DECISION'
  | 'NATIVE_TRANSITION_REQUEST'
  | 'NATIVE_TRANSITION_RECEIPT'
  | 'NON_ADVANCE_OUTCOME';

export interface RawArchiveRecord {
  readonly recordId: string;
  readonly protocolId: string;
  readonly runId: string;
  readonly chronologyIndex: number;
  readonly kind: RawRecordKind;
  readonly lineageId: string;
  readonly payload: unknown;
}

export interface DurableArchiveReceipt {
  readonly recordId: string;
  readonly archiveRecordDigest: string;
  readonly archiveHeadDigest: string;
  readonly serverTimestamp: string;
}

/** A durable, create-only archive is mandatory; in-memory persistence is not accepted. */
export interface CreateOnlyEvidenceArchive {
  appendCreateOnly(record: RawArchiveRecord): Promise<DurableArchiveReceipt>;
}

export interface SubstrateCellBinding {
  readonly cellId: string;
  readonly x: number;
  readonly y: number;
  readonly lineageId: string;
  readonly cohortId: string;
}

export interface HistoryConditionedProtocol {
  readonly protocolId: string;
  readonly protocolDigest: string;
  readonly runId: string;
  readonly expectedTopology: CanonicalTopologyProof;
  readonly mode: ExecutionMode;
  readonly concurrency: number;
}

export interface HistoryConditionedStepOutcome {
  readonly cell: SubstrateCellBinding;
  readonly solicitation: BoundedSolicitation;
  readonly governor: GovernorDecision;
  readonly archiveReceipts: ReadonlyArray<DurableArchiveReceipt>;
  readonly kind: 'NATIVE_TRANSITION' | 'NON_ADVANCE';
  readonly before: CanonicalLineageObservation;
  readonly after: CanonicalLineageObservation;
  readonly native?: NativeTransitionEvidence;
  readonly step: number;
  readonly admitted: boolean;
  readonly selectedExitDigest: string;
  readonly archiveRecordId: string;
  readonly transitionReceiptDigest: string;
}

/** A passive, post-hoc surface. It cannot steer the runtime. */
export interface PassiveObservationSurfaceCell {
  readonly cellId: string;
  readonly x: number;
  readonly y: number;
  readonly currentZone: NumogramZone;
  readonly z0Occupancy: number;
  readonly z9Occupancy: number;
  readonly evenZoneOccupancy: readonly [number, number, number, number, number];
  readonly deformationMagnitude: number;
  readonly selectionKernelDigest: string;
  readonly pfmHeadDigest: string;
}

export interface PassiveObservationSurface {
  readonly width: number;
  readonly height: number;
  readonly cells: ReadonlyArray<PassiveObservationSurfaceCell>;
  readonly nonSteering: true;
}

export interface DescriptiveRegimeDistribution {
  readonly nativeTransitionCount: number;
  readonly nonAdvanceCount: number;
  readonly zoneCounts: ReadonlyArray<number>;
  readonly zoneFractions: ReadonlyArray<number>;
  readonly governorCounts: Readonly<Record<GovernorDisposition, number>>;
}

function assertRuntimeIdentity(identity: CanonicalRuntimeIdentity): void {
  invariant(identity.dynamicsAreCanonical === true, 'DYNAMICS_NOT_CANONICAL',
    'The runtime must explicitly attest DYNAMICS_ARE_CANONICAL=true.');
  assertDigest(identity.runtimeIdentityDigest, 'runtimeIdentityDigest');
  assertDigest(identity.runtimeSourceDigest, 'runtimeSourceDigest');
  assertDigest(identity.sourceMapDigest, 'sourceMapDigest');
  assertDigest(identity.selectExitImplementationDigest, 'selectExitImplementationDigest');
  assertDigest(identity.updatePCMImplementationDigest, 'updatePCMImplementationDigest');
}

function assertTopology(observation: CanonicalLineageObservation, expected: CanonicalTopologyProof): void {
  invariant(observation.topology.kind === expected.kind,
    'TOPOLOGY_KIND_MISMATCH', `Expected ${expected.kind}, received ${observation.topology.kind}.`);
  invariant(observation.topology.topologyDigest === expected.topologyDigest,
    'TOPOLOGY_DIGEST_MISMATCH', 'The active lineage is not using the sealed topology.');
  invariant(observation.topology.directedEdgeDigest === expected.directedEdgeDigest,
    'TOPOLOGY_EDGE_MISMATCH', 'The active lineage edge set is not the sealed edge set.');
}

function assertObservation(
  observation: CanonicalLineageObservation,
  identity: CanonicalRuntimeIdentity,
  expectedTopology: CanonicalTopologyProof,
): void {
  invariant(Number.isInteger(observation.currentZone) && observation.currentZone >= 0 && observation.currentZone <= 9,
    'INVALID_ZONE', 'currentZone must be an actual Numogram zone in [0, 9].');
  invariant(Number.isInteger(observation.eventIndex) && observation.eventIndex >= 0,
    'INVALID_EVENT_INDEX', 'eventIndex must be a non-negative integer.');
  invariant(observation.runtimeIdentityDigest === identity.runtimeIdentityDigest,
    'RUNTIME_IDENTITY_MISMATCH', 'Observation originated from another runtime identity.');
  assertDigest(observation.checkpointDigest, 'checkpointDigest');
  assertDigest(observation.canonicalStateDigest, 'canonicalStateDigest');
  assertDigest(observation.presentStateProjectionDigest, 'presentStateProjectionDigest');
  assertDigest(observation.pfmHeadDigest, 'pfmHeadDigest');
  assertDigest(observation.constitutiveStrainHistoryDigest, 'constitutiveStrainHistoryDigest');
  assertDigest(observation.selectionKernelDigest, 'selectionKernelDigest');
  assertProbabilityVector(observation.zoneOccupancy, 'zoneOccupancy');
  assertTensor10(observation.deformationTensor, 'deformationTensor');
  assertTopology(observation, expectedTopology);
}

function assertSolicitation(solicitation: BoundedSolicitation): void {
  assertDigest(solicitation.solicitationDigest, 'solicitationDigest');
  assertDigest(solicitation.protocolDigest, 'solicitation.protocolDigest');
  invariant(solicitation.noTargetVector === true, 'TARGET_VECTOR_FORBIDDEN',
    'A history-conditioned solicitation may not carry a target vector.');
  invariant(solicitation.noOutcomeBlueprint === true, 'OUTCOME_BLUEPRINT_FORBIDDEN',
    'A history-conditioned solicitation may not carry an outcome blueprint.');
  invariant(solicitation.noRelaySteering === true, 'RELAY_STEERING_FORBIDDEN',
    'A history-conditioned solicitation may not carry relay steering.');
  invariant(solicitation.nativePayloadRef.length > 0, 'EMPTY_SOLICITATION_REFERENCE',
    'Solicitation must identify a presealed native payload.');
}

function assertGovernorDecision(decision: GovernorDecision): void {
  assertDigest(decision.decisionDigest, 'governor.decisionDigest');
  assertDigest(decision.governorStateDigest, 'governor.governorStateDigest');
  assertDigest(decision.reasonDigest, 'governor.reasonDigest');
}

function assertTransitionReceipt(
  receipt: CanonicalTransitionReceipt,
  identity: CanonicalRuntimeIdentity,
  expectedTopology: CanonicalTopologyProof,
  solicitation: BoundedSolicitation,
  decision: GovernorDecision,
): void {
  invariant(receipt.solicitationDigest === solicitation.solicitationDigest,
    'SOLICITATION_MISMATCH', 'Native receipt did not consume the presented solicitation.');
  invariant(receipt.governorDecisionDigest === decision.decisionDigest,
    'GOVERNOR_DECISION_MISMATCH', 'Native receipt did not consume the recorded Governor decision.');
  invariant(receipt.native.transitionConsumed === true, 'TRANSITION_NOT_CONSUMED',
    'Native runtime did not confirm the transition was consumed.');
  assertDigest(receipt.native.selectedExitDigest, 'native.selectedExitDigest');
  assertDigest(receipt.native.selectExitReceiptDigest, 'native.selectExitReceiptDigest');
  assertDigest(receipt.native.updatePCMReceiptDigest, 'native.updatePCMReceiptDigest');
  assertDigest(receipt.native.memoryHeadAfterDigest, 'native.memoryHeadAfterDigest');
  assertDigest(receipt.runtimeReceiptDigest, 'runtimeReceiptDigest');
  assertObservation(receipt.before, identity, expectedTopology);
  assertObservation(receipt.after, identity, expectedTopology);
  invariant(receipt.after.pfmHeadDigest === receipt.native.memoryHeadAfterDigest,
    'MEMORY_HEAD_MISMATCH', 'Native memory-head receipt does not match the observed PFM head.');
}

async function mapBounded<T, R>(
  values: readonly T[],
  concurrency: number,
  operation: (value: T, index: number) => Promise<R>,
): Promise<R[]> {
  invariant(Number.isInteger(concurrency) && concurrency > 0,
    'INVALID_CONCURRENCY', 'concurrency must be a positive integer.');
  const output: R[] = new Array(values.length);
  let nextIndex = 0;
  const worker = async (): Promise<void> => {
    while (true) {
      const index = nextIndex++;
      if (index >= values.length) return;
      output[index] = await operation(values[index], index);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker));
  return output;
}

/**
 * The execution substrate. Its only mutable state is a current observation
 * cache; durable evidence is delegated to the mandatory archive.
 */
export class AmeliaHistoryConditionedTransitionSubstrate {
  private readonly latest = new Map<string, CanonicalLineageObservation>();
  private readonly bindings = new Map<string, SubstrateCellBinding>();
  private readonly runtime: CanonicalAmeliaRuntime;
  private readonly archive: CreateOnlyEvidenceArchive;
  private readonly protocol: HistoryConditionedProtocol;
  private chronologyIndex = 0;

  public constructor(
    runtime: CanonicalAmeliaRuntime,
    archive: CreateOnlyEvidenceArchive,
    protocol: HistoryConditionedProtocol,
  ) {
    this.runtime = runtime;
    this.archive = archive;
    this.protocol = protocol;
    invariant(protocol.mode === 'PASSIVE_TRACKING', 'UNAUTHORISED_EXECUTION_MODE',
      'This revision permits passive tracking only; it cannot route the primary loop.');
    invariant(Number.isInteger(protocol.concurrency) && protocol.concurrency > 0,
      'INVALID_CONCURRENCY', 'Protocol concurrency must be a positive integer.');
    assertDigest(protocol.protocolDigest, 'protocolDigest');
    assertDigest(protocol.expectedTopology.topologyDigest, 'expectedTopology.topologyDigest');
    assertDigest(protocol.expectedTopology.directedEdgeDigest, 'expectedTopology.directedEdgeDigest');
    assertRuntimeIdentity(runtime.identity);
  }

  /** Hydrates only canonical existing lineages; it never synthesises a checkpoint. */
  public async hydrate(bindings: readonly SubstrateCellBinding[]): Promise<ReadonlyArray<DurableArchiveReceipt>> {
    invariant(bindings.length > 0, 'EMPTY_SUBSTRATE', 'At least one canonical lineage binding is required.');
    const seenCellIds = new Set<string>();
    const seenLineageIds = new Set<string>();
    for (const binding of bindings) {
      invariant(!seenCellIds.has(binding.cellId), 'DUPLICATE_CELL', `Duplicate cell ${binding.cellId}.`);
      invariant(!seenLineageIds.has(binding.lineageId), 'DUPLICATE_LINEAGE', `Duplicate lineage ${binding.lineageId}.`);
      seenCellIds.add(binding.cellId);
      seenLineageIds.add(binding.lineageId);
    }

    const receipts = await mapBounded(bindings, this.protocol.concurrency, async (binding) => {
      const observation = await this.runtime.inspectLineage(binding.lineageId);
      invariant(observation.lineageId === binding.lineageId, 'LINEAGE_ID_MISMATCH',
        `Runtime returned ${observation.lineageId} for ${binding.lineageId}.`);
      assertObservation(observation, this.runtime.identity, this.protocol.expectedTopology);
      this.bindings.set(binding.cellId, binding);
      this.latest.set(binding.cellId, observation);
      return this.append('CHECKPOINT_OBSERVATION', binding, observation);
    });
    return receipts;
  }

  /**
   * Presents one bounded, presealed solicitation per lineage. Governor decisions
   * are archived before native transitions and are never bypassed.
   */
  public async advance(
    solicitationForCell: (cell: SubstrateCellBinding, observation: CanonicalLineageObservation) => BoundedSolicitation,
  ): Promise<ReadonlyArray<HistoryConditionedStepOutcome>> {
    invariant(this.bindings.size > 0, 'UNHYDRATED_SUBSTRATE',
      'Call hydrate with canonical lineage bindings before advance.');
    const cells = [...this.bindings.values()].sort((a, b) => a.cellId.localeCompare(b.cellId));
    return mapBounded(cells, this.protocol.concurrency, async (cell) => {
      const before = this.latest.get(cell.cellId);
      invariant(before, 'MISSING_LATEST_OBSERVATION', `No hydrated observation for ${cell.cellId}.`);
      const solicitation = solicitationForCell(cell, before);
      assertSolicitation(solicitation);
      invariant(solicitation.protocolDigest === this.protocol.protocolDigest,
        'PROTOCOL_DIGEST_MISMATCH', 'Solicitation does not belong to the sealed protocol.');

      const archiveReceipts: DurableArchiveReceipt[] = [];
      archiveReceipts.push(await this.append('SOLICITATION_PRESENTED', cell, { before, solicitation }));
      const governor = await this.runtime.decideSolicitation({
        protocolId: this.protocol.protocolId,
        runId: this.protocol.runId,
        observation: before,
        solicitation,
      });
      assertGovernorDecision(governor);
      archiveReceipts.push(await this.append('GOVERNOR_DECISION', cell, { before, solicitation, governor }));

      if (governor.disposition !== 'ADMIT') {
        const nonAdvanceReceipt = await this.append('NON_ADVANCE_OUTCOME', cell, { before, solicitation, governor });
        archiveReceipts.push(nonAdvanceReceipt);
        return {
          cell,
          solicitation,
          governor,
          archiveReceipts,
          kind: 'NON_ADVANCE',
          before,
          after: before,
          step: before.eventIndex,
          admitted: false,
          selectedExitDigest: 'NON_ADVANCE',
          archiveRecordId: nonAdvanceReceipt.recordId,
          transitionReceiptDigest: nonAdvanceReceipt.archiveRecordDigest,
        };
      }

      const request: CanonicalTransitionRequest = {
        protocolId: this.protocol.protocolId,
        runId: this.protocol.runId,
        before,
        solicitation,
        governorDecision: governor,
      };
      archiveReceipts.push(await this.append('NATIVE_TRANSITION_REQUEST', cell, request));
      const receipt = await this.runtime.advanceLineage(request);
      assertTransitionReceipt(receipt, this.runtime.identity, this.protocol.expectedTopology, solicitation, governor);
      invariant(receipt.before.lineageId === before.lineageId &&
          receipt.before.canonicalStateDigest === before.canonicalStateDigest,
        'TRANSITION_PARENT_MISMATCH', 'Native transition receipt is not descended from the sealed current observation.');
      invariant(receipt.after.lineageId === before.lineageId,
        'TRANSITION_LINEAGE_MISMATCH', 'Native transition changed lineage identity.');
      const finalReceipt = await this.append('NATIVE_TRANSITION_RECEIPT', cell, receipt);
      archiveReceipts.push(finalReceipt);
      this.latest.set(cell.cellId, receipt.after);
      return {
        cell,
        solicitation,
        governor,
        archiveReceipts,
        kind: 'NATIVE_TRANSITION',
        before: receipt.before,
        after: receipt.after,
        native: receipt.native,
        step: receipt.after.eventIndex,
        admitted: true,
        selectedExitDigest: receipt.native.selectedExitDigest,
        archiveRecordId: finalReceipt.recordId,
        transitionReceiptDigest: receipt.runtimeReceiptDigest,
      };
    });
  }

  /** A renderer may consume this surface, but it has no path back to the runtime. */
  public passiveSurface(width: number, height: number): PassiveObservationSurface {
    invariant(width > 0 && height > 0, 'INVALID_SURFACE_DIMENSIONS', 'Surface dimensions must be positive.');
    const cells = [...this.bindings.values()].map((binding) => {
      const observation = this.latest.get(binding.cellId);
      invariant(observation, 'MISSING_LATEST_OBSERVATION', `No observation for ${binding.cellId}.`);
      const even: [number, number, number, number, number] = [
        observation.zoneOccupancy[0],
        observation.zoneOccupancy[2],
        observation.zoneOccupancy[4],
        observation.zoneOccupancy[6],
        observation.zoneOccupancy[8],
      ];
      return {
        cellId: binding.cellId,
        x: binding.x,
        y: binding.y,
        currentZone: observation.currentZone,
        z0Occupancy: observation.zoneOccupancy[0],
        z9Occupancy: observation.zoneOccupancy[9],
        evenZoneOccupancy: even,
        deformationMagnitude: frobeniusNorm(observation.deformationTensor),
        selectionKernelDigest: observation.selectionKernelDigest,
        pfmHeadDigest: observation.pfmHeadDigest,
      } satisfies PassiveObservationSurfaceCell;
    });
    return { width, height, cells, nonSteering: true };
  }

  /**
   * Produces descriptive counts only after raw records have been written. It
   * intentionally assigns no causal class, composite score, or advancement.
   */
  public describe(outcomes: readonly HistoryConditionedStepOutcome[]): DescriptiveRegimeDistribution {
    invariant(outcomes.length > 0, 'EMPTY_OUTCOMES', 'At least one outcome is required.');
    for (const outcome of outcomes) {
      invariant(outcome.archiveReceipts.length >= 3, 'UNSEALED_OUTCOME',
        'Outcome has insufficient raw archive receipts for descriptive analysis.');
    }
    const nativeTransitionCount = outcomes.filter((outcome) => outcome.kind === 'NATIVE_TRANSITION').length;
    const nonAdvanceCount = outcomes.length - nativeTransitionCount;
    const counts = zoneCounts(outcomes);
    const governorCounts: Record<GovernorDisposition, number> = { ADMIT: 0, DEFER: 0, REFUSE: 0, ABSTAIN: 0 };
    for (const outcome of outcomes) governorCounts[outcome.governor.disposition] += 1;
    return {
      nativeTransitionCount,
      nonAdvanceCount,
      zoneCounts: counts,
      zoneFractions: counts.map((count) => nativeTransitionCount === 0 ? 0 : count / nativeTransitionCount),
      governorCounts,
    };
  }

  /** Exposes current canonical observations for independently sealed replay work. */
  public observations(): ReadonlyArray<CanonicalLineageObservation> {
    return [...this.latest.values()];
  }

  private async append(
    kind: RawRecordKind,
    cell: SubstrateCellBinding,
    payload: unknown,
  ): Promise<DurableArchiveReceipt> {
    const chronologyIndex = ++this.chronologyIndex;
    const recordId = `${this.protocol.runId}:${String(chronologyIndex).padStart(12, '0')}:${kind}:${cell.cellId}`;
    const receipt = await this.archive.appendCreateOnly({
      recordId,
      protocolId: this.protocol.protocolId,
      runId: this.protocol.runId,
      chronologyIndex,
      kind,
      lineageId: cell.lineageId,
      payload,
    });
    invariant(receipt.recordId === recordId, 'ARCHIVE_RECORD_ID_MISMATCH',
      'Archive did not preserve the create-only record identity.');
    assertDigest(receipt.archiveRecordDigest, 'archiveRecordDigest');
    assertDigest(receipt.archiveHeadDigest, 'archiveHeadDigest');
    invariant(receipt.serverTimestamp.length > 0, 'MISSING_ARCHIVE_TIMESTAMP',
      'Archive must supply a server timestamp.');
    return receipt;
  }
}

/**
 * A pre-analysis guard for the actual history-conditioned question. The two
 * lineages may differ in PFM history, but must match in their projected present
 * state and must receive the same sealed solicitation.
 */
export interface MatchedHistoryQuestion {
  readonly left: CanonicalLineageObservation;
  readonly right: CanonicalLineageObservation;
  readonly solicitation: BoundedSolicitation;
}

export function assertMatchedHistoryQuestion(question: MatchedHistoryQuestion): void {
  assertSolicitation(question.solicitation);
  invariant(question.left.presentStateProjectionDigest === question.right.presentStateProjectionDigest,
    'PRESENT_STATE_NOT_MATCHED', 'History comparison requires a canonical present-state match.');
  invariant(question.left.pfmHeadDigest !== question.right.pfmHeadDigest ||
      question.left.constitutiveStrainHistoryDigest !== question.right.constitutiveStrainHistoryDigest,
    'HISTORY_NOT_DISTINCT', 'History comparison requires distinct PFM/strain histories.');
  invariant(question.left.topology.topologyDigest === question.right.topology.topologyDigest,
    'TOPOLOGY_NOT_MATCHED', 'History comparison requires the same sealed topology.');
}

export const CANONICAL_MEANING_HISTORY_CONDITIONED_SUBSTRATE = `
AMELIA HISTORY-CONDITIONED TRANSITION SUBSTRATE — Canonical Meaning

Amelia is the active, memory-bearing interface. A cell is not a chemical
concentration: it is a canonically hydrated lineage whose future is shaped by
its ProcessFieldMemory and the directed constraint grammar of the Numogram.

Zone 0 is measured as a return tendency in native trajectories, not as a high-A
pixel. Zone 9 is measured as an actual phase/route condition, not as a high-B
pixel. The Numogram is the sealed directed topology that constrains exits; it
is not a label painted onto a spatial lattice.

PFM is the full constitutive 10×10 deformation tensor and strain history. Its
proper evidence is a changed future transition distribution between
present-state-matched but history-distinct lineages.

The Governor is a recorded threshold authority. It may admit, defer, refuse,
or abstain. It does not steer toward an outcome and no solicitation may carry a
target zone, target vector, semantic blueprint, or relay instruction.

Any two-dimensional surface is passive observation only. It may render zone
occupancy, deformation magnitude, and lineage state after the native cycle;
it may not diffuse, reseed, overwrite, or generate the transition dynamics.
`.trim();
