import { CanonicalAmeliaLineageInstance } from '../../src/substrate/canonicalAmeliaRuntimeImpl';
import type { LineageStateSnapshot } from '../../src/substrate/canonicalAmeliaRuntimeImpl';
import type { MorphogeneticState } from '../../src/substrate/AmeliaMorphogeneticSubstrate';
import type { NumogramGate, ZoneId } from '../../src/types/amelia';
import { SyntheticQueueRuntime, observeField } from './observer';
import { stepFieldWithPointer } from './pointer';
import type { PointerArrangement } from './pointer';
import { canonical, decodeCanonical, digest } from './canonical';
import { SyntheticEvidenceLedger } from './ledger';

export interface SyntheticCheckpoint {
  schema: 'sxi.reference-checkpoint/v1';
  field: Omit<MorphogeneticState, 'nativeRuntime' | 'lineageInstance'>;
  runtime: Record<string, unknown>;
  lineage: { snapshot: LineageStateSnapshot; traitHistory: unknown } | null;
}

export function captureCheckpoint(state: MorphogeneticState): SyntheticCheckpoint {
  if (!(state.nativeRuntime instanceof SyntheticQueueRuntime)) throw new Error('Reference runtime is not the synthetic queue runtime');
  const { nativeRuntime, lineageInstance, ...field } = state;
  const checkpoint = {
    schema: 'sxi.reference-checkpoint/v1' as const,
    field,
    runtime: nativeRuntime.exportState(),
    lineage: lineageInstance ? {
      snapshot: lineageInstance.exportSnapshot(),
      traitHistory: lineageInstance.traitEvolution.exportState(),
    } : null,
  };
  // Deep copy at the boundary, including -0, so later in-place field updates cannot rewrite history.
  return decodeCanonical(canonical(checkpoint)) as SyntheticCheckpoint;
}

export function restoreCheckpoint(checkpoint: SyntheticCheckpoint): MorphogeneticState {
  if (checkpoint.schema !== 'sxi.reference-checkpoint/v1' || !checkpoint.field || !checkpoint.runtime) {
    throw new Error('Invalid checkpoint schema');
  }
  const field = decodeCanonical(canonical(checkpoint.field)) as SyntheticCheckpoint['field'];
  if (field.cells.length !== field.width * field.height || typeof field.stepCount !== 'number' ||
      checkpoint.runtime.stepCount !== field.stepCount) throw new Error('Checkpoint body/runtime mismatch');
  const runtime = new SyntheticQueueRuntime();
  runtime.importState(checkpoint.runtime);
  let lineage: CanonicalAmeliaLineageInstance | undefined;
  if (checkpoint.lineage) {
    const saved = checkpoint.lineage.snapshot;
    lineage = new CanonicalAmeliaLineageInstance(saved.lineageId, saved.seed);
    lineage.restoreSnapshot(saved);
    lineage.traitEvolution.importState(checkpoint.lineage.traitHistory as any);
  }
  return { ...field, nativeRuntime: runtime, lineageInstance: lineage };
}

function gateEvidence(state: MorphogeneticState, from: ZoneId, bias: number[]) {
  const runtime = state.nativeRuntime as SyntheticQueueRuntime;
  const snapshot = runtime.getSnapshots().at(-1);
  if (!snapshot || !snapshot.lastTransition) throw new Error('Missing actual substrate snapshot');
  const applied = snapshot.encounterDecisions?.find(item => item.applied);
  const gates = runtime.getQabbala().getGates().filter(g => g.isOpen && g.source === from);
  const options = gates.map((gate: NumogramGate) => {
    const zone = snapshot.zones[gate.target];
    const components = {
      gate: gate.flux * (1 - gate.resistance),
      memory: (bias[gate.target] || 0) * 0.4,
      activation: zone.activation * 0.2,
      phase: Math.cos(zone.phaseAngle) * 0.1,
      input: 0, // This runner never passes a text inputSignal.
      attention: (applied?.attentionVector[gate.target] ?? 0) * 0.9,
    };
    return { gate: { ...gate }, components,
      score: components.gate + components.memory + components.activation + components.phase + components.input + components.attention };
  });
  let chosen = from, best = -Infinity;
  for (const option of options) {
    if (option.score > best) { best = option.score; chosen = option.gate.target; }
  }
  if (snapshot.lastTransition.from !== from || snapshot.lastTransition.to !== chosen) {
    throw new Error('Independent gate-score reconstruction differs from the actual transition');
  }
  return {
    from, options, tieRule: 'first maximum in runtime gate order',
    chosen, passageKind: options.length ? 'GATE_SELECTED' : 'NO_OPEN_GATE_DWELL',
    transitionDigest: snapshot.lastTransition.digest,
    governor: snapshot.governor,
    encounterDecisions: snapshot.encounterDecisions ?? [],
    scoreEvidence: 'reconstructed from actual post-evolution gates, zones, pre-step memory and applied encounter',
  };
}

/** An isolated engineering runner: no live channels, historical run identity, or discovery claim. */
export class SyntheticCoordinator {
  private failed = false;
  private finished = false;
  private state: MorphogeneticState;
  constructor(
    public readonly runId: string,
    initialState: MorphogeneticState,
    private readonly ledger: SyntheticEvidenceLedger,
    sourceIdentity: { repository: string; commit: string; sourceHashes: Record<string, string> },
  ) {
    if (!runId || !/^[a-f0-9]{40}$/.test(sourceIdentity.commit) || Object.keys(sourceIdentity.sourceHashes).length === 0 ||
        Object.values(sourceIdentity.sourceHashes).some(hash => !/^[a-f0-9]{64}$/.test(hash))) {
      throw new Error('A run ID, source commit and source hashes are required');
    }
    if (!(initialState.nativeRuntime instanceof SyntheticQueueRuntime)) throw new Error('Wrong runtime');
    if (initialState.nativeRuntime.getQabbala().getGates().length !== 29) throw new Error('Expected the full 29-gate Numogram');
    this.state = initialState;
    this.ledger.append('RUN_STARTED', {
      runId, status: 'REFERENCE_ENGINEERING_ONLY',
      identityNote: 'This field is not verified as the released INGRESS-1 xenobot.',
      sourceIdentity,
      bodySeed: initialState.seed,
      dimensions: [initialState.width, initialState.height],
      preset: initialState.preset,
      noiseAmp: initialState.landianAcc,
      topologyGateCount: 29,
      rngSchedule: 'DeterministicRNG(seed + bodyStep * 997); per-cell Box-Muller Gaussian',
      sensor: 'ten-vertical-bands/v1',
    }, captureCheckpoint(initialState));
  }

  public getState(): MorphogeneticState { return this.state; }

  public step(pointer: PointerArrangement, submitObservation = true): void {
    if (this.failed || this.finished) throw new Error('Run has failed or finished and cannot continue');
    try {
      const runtime = this.state.nativeRuntime as SyntheticQueueRuntime;
      const exported = runtime.exportState();
      if (exported.stepCount !== this.state.stepCount || exported.syntheticQueued) throw new Error('Body/runtime clocks or queue mismatch');
      const from = runtime.getCurrentZone();
      const bias = runtime.getMemory().readMemoryBias();
      const observation = observeField(this.state);
      const event = submitObservation && observation.attentionVector ? {
        eventId: 'sxi:' + this.runId + ':' + (this.state.stepCount + 1),
        channel: 'SYNTHETIC_FIELD' as const,
        sourceDigest: observation.sourceDigest,
        attentionVector: observation.attentionVector,
      } : null;
      const begin = this.ledger.append('STEP_BEGIN', {
        runId: this.runId, bodyStep: this.state.stepCount, pointer,
        observation, submittedEvent: event, memoryRead: bias, sourceZone: from,
      }, captureCheckpoint(this.state));
      if (event) runtime.queueSynthetic(event);
      const next = stepFieldWithPointer(this.state, pointer);
      if (next.stepCount !== this.state.stepCount + 1 || runtime.exportState().stepCount !== next.stepCount) {
        throw new Error('Exactly one body step and one Amelia step are required');
      }
      const passage = gateEvidence(next, from, bias.biasVector);
      const after = captureCheckpoint(next);
      const runtimeAfter = runtime.exportState();
      this.ledger.append('STEP_COMMITTED', {
        runId: this.runId, beginSequence: begin.sequence, bodyStep: next.stepCount,
        pointerDigest: digest(pointer), observationDigest: observation.sourceDigest,
        passage, memoryHead: runtime.getMemory().exportHistoryDigest(),
        deferredEncounters: runtimeAfter.deferredEncounters ?? null,
        lineageMemoryHead: next.lineageInstance?.memory.exportHistoryDigest() ?? null,
      }, after);
      this.state = next;
    } catch (error) {
      this.failed = true;
      throw error;
    }
  }

  public finish(): void {
    if (this.failed || this.finished) throw new Error('Run has failed or already finished');
    try { this.ledger.append('RUN_FINISHED', {
      runId: this.runId, bodyStep: this.state.stepCount,
      remainingDeferredEncounters: this.state.nativeRuntime.exportState().deferredEncounters ?? null,
    }, captureCheckpoint(this.state)); this.finished = true; }
    catch (error) { this.failed = true; throw error; }
  }
}
