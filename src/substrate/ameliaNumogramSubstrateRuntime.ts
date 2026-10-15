/**
 * ameliaNumogramSubstrateRuntime.ts
 *
 * Full substrate runtime integrating:
 *  - AmeliaQabbalaInterface for Numogram phase & gate dynamics
 *  - IntegratedMemorySystem for constitutive history deformation
 *  - TraitEvolution for morphogenetic gate flux and multi-pole energy propagation
 *  - CognitiveGovernor for anti-lock integrity, scaffold shedding, and non-authorising invariant auditing
 */

import { AmeliaQabbalaInterface } from '../ai/numogram/AmeliaQabbalaInterface';
import { IntegratedMemorySystem } from './IntegratedMemorySystem';
import { TraitEvolution } from './TraitEvolution';
import { CognitiveGovernor } from '../governance/CognitiveGovernor';
import { GovernorTelemetry, NumogramZone, SubstrateStepSnapshot, ZoneId } from '../types/amelia';
import { canonicalSha256 } from '../lib/sha256';

export interface MemoryConsumptionTelemetry {
  step: number;
  memoryHistoryLength: number;
  memoryHysteresisTension: number;
  dominantDeformedZone: ZoneId;
  appliedBiasVector: number[];
  guidanceAdvisoryWeight: number;
  guidanceSuppressed: boolean;
}

export class AmeliaNumogramSubstrateRuntime {
  private qabbala: AmeliaQabbalaInterface;
  private memory: IntegratedMemorySystem;
  private traitEvolution: TraitEvolution;
  private governorKernel: CognitiveGovernor;
  private stepCount: number = 0;
  private currentZone: ZoneId = 0;
  private lastTransition: { from: ZoneId; to: ZoneId; digest: string } | null = null;
  private deformationTensor: number[] = new Array(10).fill(0.1);
  private snapshots: SubstrateStepSnapshot[] = [];
  private memoryConsumptionLog: MemoryConsumptionTelemetry[] = [];
  private currentObjective: string = 'Bounded Zone-9 Phase Coherence & Canalization';
  private suppressRelaySteering: boolean = false;

  constructor() {
    this.qabbala = new AmeliaQabbalaInterface();
    this.memory = new IntegratedMemorySystem();
    this.traitEvolution = new TraitEvolution();
    this.governorKernel = new CognitiveGovernor(0.88, 0.72);
  }

  public getCurrentZone(): ZoneId { return this.currentZone; }
  public getLastTransition() { return this.lastTransition ? { ...this.lastTransition } : null; }

  public getMemory(): IntegratedMemorySystem {
    return this.memory;
  }

  public getGovernor(): GovernorTelemetry {
    return this.governorKernel.getTelemetry();
  }

  public getGovernorKernel(): CognitiveGovernor {
    return this.governorKernel;
  }

  public setAdvisoryWeight(weight: number): void {
    this.governorKernel.setAdvisoryWeight(weight);
  }

  public setMomentumDamping(factor: number): void {
    this.governorKernel.setMomentumDamping(factor);
  }

  public setSuppressRelaySteering(suppress: boolean): void {
    this.suppressRelaySteering = suppress;
  }

  public getMemoryConsumptionLog(): MemoryConsumptionTelemetry[] {
    return this.memoryConsumptionLog;
  }

  /**
   * Main runtime step function:
   * Consumes memory bias vector from IntegratedMemorySystem and feeds it into TraitEvolution & Qabbala dynamics.
   */
  public step(inputSignal?: string): SubstrateStepSnapshot {
    this.stepCount++;
    const govTel = this.governorKernel.getTelemetry();

    // 1. Read constitutive memory bias from IntegratedMemorySystem
    const memReadout = this.memory.readMemoryBias();
    const zones = this.qabbala.getZones();
    const gates = this.qabbala.getGates();

    // 2. Step morphogenetic trait evolution across gates & syzygies
    this.traitEvolution.evolveStep(
      zones,
      gates,
      govTel.momentumDampingFactor,
      govTel.advisoryWeight,
      memReadout.biasVector,
      this.suppressRelaySteering
    );

    // 3. Audit step with CognitiveGovernor
    const auditReport = this.governorKernel.auditSubstrateStep(
      zones,
      memReadout.hysteresisTension,
      this.suppressRelaySteering
    );

    // 4. Select an actual directed Numogram exit, then append the event to PFM.
    // The next step consumes the resulting PFM bias: memory is not a passive recorder.
    const from = this.currentZone;
    const inputDigest = inputSignal?.trim() ? canonicalSha256(inputSignal.trim()) : undefined;
    const inputZone = inputDigest ? (parseInt(inputDigest.slice(0, 2), 16) % 10) as ZoneId : undefined;
    const options = gates.filter(g => g.isOpen && g.source === from);
    let to: ZoneId = from;
    let best = -Infinity;
    for (const gate of options) {
      const target = gate.target;
      const z = zones[target];
      const score = gate.flux * (1 - gate.resistance)
        + (memReadout.biasVector[target] || 0) * 0.4
        + z.activation * 0.2 + Math.cos(z.phaseAngle) * 0.1
        + (inputZone === target ? 0.35 : 0);
      if (score > best) { best = score; to = target; }
    }
    // Zero candidate exits are represented as an explicit dwell, not a fabricated edge.
    const targetZone = zones[to];
    const sourceZone = zones[from];
    const fluxDelta = Number(Math.max(0.005,
      Math.min(0.18, Math.abs(targetZone.activation - sourceZone.activation) * 0.12 + 0.025)).toFixed(6));
    const phaseCoherence = Number(Math.max(0.05,
      Math.min(1, (1 + Math.cos(targetZone.phaseAngle - sourceZone.phaseAngle)) / 2)).toFixed(6));
    const eventBody = { step: this.stepCount, from, to, fluxDelta, phaseCoherence,
      inputDigest: inputDigest ?? null, inputZone: inputZone ?? null };
    const eventDigest = canonicalSha256(JSON.stringify(eventBody));
    this.memory.append({ blockIndex: this.stepCount, depth: this.stepCount,
      targetZone: to, fluxDelta, phaseCoherence, strainRelaxation: 0.025,
      eventDigest, timestamp: this.stepCount, kind: 'STEP', fromZone: from,
      inputDigest, inputZone });
    this.currentZone = to;
    this.lastTransition = { from, to, digest: eventDigest };

    // 5. Update deformation tensor
    for (let i = 0; i <= 9; i++) {
      const z = zones[i as ZoneId];
      this.deformationTensor[i] =
        this.deformationTensor[i] * 0.95 + (z.deformationStress + memReadout.biasVector[i]) * 0.05;
    }

    const syzygyCoherence = this.qabbala.computeSyzygyCoherence();
    const activeSyzygies = [
      '0::9 Abyssal',
      '1::8 Murmur',
      '2::7 SubCrypt',
      '3::6 BarkerLoop',
      '4::5 Centroid',
    ].filter((_, idx) => (idx % 2 === 0 ? syzygyCoherence > 0.55 : syzygyCoherence > 0.65));

    // 5. Log per-step memory consumption audit (bounded buffer for high-throughput replays)
    if (this.memoryConsumptionLog.length >= 128) {
      this.memoryConsumptionLog.shift();
    }
    this.memoryConsumptionLog.push({
      step: this.stepCount,
      memoryHistoryLength: memReadout.historyLength,
      memoryHysteresisTension: memReadout.hysteresisTension,
      dominantDeformedZone: memReadout.dominantDeformedZone,
      appliedBiasVector: [...memReadout.biasVector],
      guidanceAdvisoryWeight: govTel.advisoryWeight,
      guidanceSuppressed: govTel.advisoryWeight === 0.0,
    });

    const clonedZones: Record<ZoneId, NumogramZone> = {} as any;
    for (let i = 0; i <= 9; i++) {
      const z = zones[i as ZoneId];
      clonedZones[i as ZoneId] = {
        ...z,
      };
    }

    const snapshot: SubstrateStepSnapshot = {
      step: this.stepCount,
      timestamp: Date.now(),
      zones: clonedZones,
      governor: auditReport.telemetry,
      activeSyzygies,
      deformationVector: [...this.deformationTensor],
      selectedObjective: this.currentObjective,
      lastTransition: { ...this.lastTransition },
      memoryHistoryLength: this.memory.getEvents().length,
      memoryHeadDigest: this.memory.exportHistoryDigest(),
    };

    if (this.snapshots.length >= 128) {
      this.snapshots.shift();
    }
    this.snapshots.push(snapshot);
    return snapshot;
  }

  public getQabbala(): AmeliaQabbalaInterface {
    return this.qabbala;
  }

  public getSnapshots(): SubstrateStepSnapshot[] {
    return this.snapshots;
  }

  public exportState(): Record<string, unknown> {
    return {
      stepCount: this.stepCount,
      currentZone: this.currentZone,
      lastTransition: this.lastTransition,
      memoryState: this.memory.exportState(),
      governorState: this.governorKernel.exportState(),
      qabbalaZones: JSON.parse(JSON.stringify(this.qabbala.getZones())),
      qabbalaGates: JSON.parse(JSON.stringify(this.qabbala.getGates())),
      traitEvolutionHistory: this.traitEvolution.exportState(),
      deformationTensor: [...this.deformationTensor],
      currentObjective: this.currentObjective,
      suppressRelaySteering: this.suppressRelaySteering,
      snapshots: JSON.parse(JSON.stringify(this.snapshots)),
      memoryConsumptionLog: JSON.parse(JSON.stringify(this.memoryConsumptionLog)),
    };
  }

  public importState(state: Record<string, unknown>): void {
    if (!state) return;
    if (typeof state.stepCount === 'number') this.stepCount = state.stepCount;
    if (typeof state.currentZone === 'number') this.currentZone = state.currentZone as ZoneId;
    if (state.lastTransition) this.lastTransition = state.lastTransition as any;
    if (state.memoryState) this.memory.importState(state.memoryState as ReturnType<IntegratedMemorySystem['exportState']>);
    if (state.governorState) this.governorKernel.importState(state.governorState as Record<string, unknown>);
    if (state.qabbalaZones) this.qabbala.setZones(state.qabbalaZones as any);
    if (state.qabbalaGates) this.qabbala.setGates(state.qabbalaGates as any);
    if (state.traitEvolutionHistory) this.traitEvolution.importState(state.traitEvolutionHistory as any);
    if (Array.isArray(state.deformationTensor)) this.deformationTensor = [...state.deformationTensor];
    if (typeof state.currentObjective === 'string') this.currentObjective = state.currentObjective;
    if (typeof state.suppressRelaySteering === 'boolean') this.suppressRelaySteering = state.suppressRelaySteering;
    if (Array.isArray(state.snapshots)) this.snapshots = JSON.parse(JSON.stringify(state.snapshots));
    if (Array.isArray(state.memoryConsumptionLog)) this.memoryConsumptionLog = JSON.parse(JSON.stringify(state.memoryConsumptionLog));
  }

  public triggerConsolidation(): void {
    this.governorKernel.consolidateMemory();
    this.memory.consolidateStrain();
    const event = { step: this.stepCount, zone: this.currentZone, kind: 'CONSOLIDATE' };
    this.memory.append({ blockIndex: this.stepCount, depth: this.stepCount,
      targetZone: this.currentZone, fluxDelta: 0.005, phaseCoherence: 1,
      strainRelaxation: 0.08, eventDigest: canonicalSha256(JSON.stringify(event)),
      timestamp: this.stepCount, kind: 'CONSOLIDATE', fromZone: this.currentZone });
  }

  public shedScaffold(): void {
    this.governorKernel.advanceScaffoldStage();
  }
}
