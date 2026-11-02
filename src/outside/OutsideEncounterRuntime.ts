/**
 * AmeliaOutsideRuntime: Amelia's Numogram runtime with the governed Outside-encounter channel
 * (Numogram, I Ching, Tarot, linguistic and Subdecadence encounters).
 *
 * The frozen core (src/substrate, src/governance, src/ai/numogram, src/types/amelia.ts) is pinned byte-for-byte
 * by PF-1 and PF-2. The encounter channel therefore lives here as an extension of that core rather than as edits
 * to it. Its behaviour is exactly that of the in-core version merged in fd9efe3:
 *   - the Governor gates each encounter (ATTEND / DEFER / REFUSE) before open exits are scored;
 *   - an attended encounter adds 0.9 x its attention weight to the score of each extant outgoing gate
 *     (attention cannot invent a passage);
 *   - every step's PFM event carries its encounter decisions, and attended encounters keep biasing memory
 *     (0.045 x attention) for the next 48 events;
 *   - up to 32 deferred encounters are queued and re-offered one per step.
 * A plain AmeliaNumogramSubstrateRuntime is unaffected.
 */
import { AmeliaNumogramSubstrateRuntime } from '../substrate/ameliaNumogramSubstrateRuntime';
import { IntegratedMemorySystem, type MemoryReadout } from '../substrate/IntegratedMemorySystem';
import type { CognitiveGovernor } from '../governance/CognitiveGovernor';
import type { NumogramZone, ZoneId } from '../types/amelia';
import { canonicalSha256 } from '../lib/sha256';
import type { EncounterDecisionTrace, EncounterDisposition, OutsideStepSnapshot, SubstrateEncounterInput } from './encounterTypes';

export type { EncounterDecisionTrace, EncounterDisposition, OutsideChannel, OutsideStepSnapshot, SubstrateEncounterInput } from './encounterTypes';

/** Gate channel attention before it can bias passage through the Numogram. */
export function decideEncounter(governor: CognitiveGovernor, input: SubstrateEncounterInput): { disposition: EncounterDisposition; reason: string } {
  const vector = input.attentionVector;
  const total = Array.isArray(vector) ? vector.reduce((sum, value) => sum + value, 0) : 0;
  const valid = Array.isArray(vector) && vector.length === 10
    && vector.every(value => Number.isFinite(value) && value >= 0 && value <= 1)
    && total > 0.99 && total < 1.01;
  if (!input.eventId || !/^[a-f0-9]{64}$/i.test(input.sourceDigest) || !valid)
    return { disposition: 'REFUSE', reason: 'Encounter failed structural validation; no attention was applied.' };
  const telemetry = governor.getTelemetry();
  if (telemetry.governorStatus === 'LOCKED_RECOVERY' || telemetry.antiLockIntegrity < 85)
    return { disposition: 'DEFER', reason: 'Governor is in locked recovery; encounter retained pending recovery.' };
  if (telemetry.deformationFieldTension >= 0.72)
    return { disposition: 'DEFER', reason: 'Field tension exceeds the Governor attention threshold; encounter retained for later review.' };
  return { disposition: 'ATTEND', reason: 'Encounter admitted to Numogram-weighted passage.' };
}

type MemoryInternals = { events: (IntegratedMemorySystem['getEvents'] extends () => (infer E)[] ? E & { encounters?: EncounterDecisionTrace[] } : never)[];
  zoneStrainHistory: number[]; hysteresisTension: number };

/** PFM whose memory bias also carries attended encounters (0.045 x attention, over the last 48 events). */
export class OutsideEncounterMemory extends IntegratedMemorySystem {
  public override readMemoryBias(): MemoryReadout {
    const m = this as unknown as MemoryInternals;
    const biasVector: number[] = new Array(10).fill(0);
    let maxStrain = -1;
    let dominantZone: ZoneId = 0;
    let totalCoherence = 0;
    const recentEvents = m.events.slice(-48);
    for (const ev of recentEvents) {
      biasVector[ev.targetZone] += ev.fluxDelta * ev.phaseCoherence * 0.12;
      for (const encounter of ev.encounters ?? []) {
        if (encounter.disposition === 'ATTEND' && encounter.applied) {
          encounter.attentionVector.forEach((weight, zone) => { biasVector[zone] += weight * 0.045; });
        }
      }
      totalCoherence += ev.phaseCoherence;
    }
    for (let i = 0; i <= 9; i++) {
      biasVector[i] = Number((biasVector[i] + m.zoneStrainHistory[i] * 0.08).toFixed(4));
      if (m.zoneStrainHistory[i] > maxStrain) { maxStrain = m.zoneStrainHistory[i]; dominantZone = i as ZoneId; }
    }
    const meanPhaseCoherence = recentEvents.length > 0 ? totalCoherence / recentEvents.length : 0.95;
    return { biasVector, hysteresisTension: Number(m.hysteresisTension.toFixed(4)), dominantDeformedZone: dominantZone,
      historyLength: m.events.length, meanPhaseCoherence: Number(meanPhaseCoherence.toFixed(4)) };
  }
}

/** The frozen core's private fields, reached from this extension without editing the core. */
type RuntimeInternals = {
  qabbala: ReturnType<AmeliaNumogramSubstrateRuntime['getQabbala']>;
  memory: IntegratedMemorySystem; governorKernel: CognitiveGovernor;
  traitEvolution: { evolveStep(...a: unknown[]): void };
  stepCount: number; currentZone: ZoneId; lastTransition: { from: ZoneId; to: ZoneId; digest: string } | null;
  deformationTensor: number[]; snapshots: OutsideStepSnapshot[];
  memoryConsumptionLog: ReturnType<AmeliaNumogramSubstrateRuntime['getMemoryConsumptionLog']>;
  currentObjective: string; suppressRelaySteering: boolean;
};

export class AmeliaOutsideRuntime extends AmeliaNumogramSubstrateRuntime {
  private deferredEncounters: SubstrateEncounterInput[] = [];

  constructor() {
    super();
    (this as unknown as RuntimeInternals).memory = new OutsideEncounterMemory();
  }

  public override step(inputSignal?: string, encounter?: SubstrateEncounterInput): OutsideStepSnapshot {
    const s = this as unknown as RuntimeInternals;
    s.stepCount++;
    const govTel = s.governorKernel.getTelemetry();

    // 1. Read constitutive memory bias from IntegratedMemorySystem
    const memReadout = s.memory.readMemoryBias();
    const zones = s.qabbala.getZones();
    const gates = s.qabbala.getGates();

    // 2. Step morphogenetic trait evolution across gates & syzygies
    s.traitEvolution.evolveStep(zones, gates, govTel.momentumDampingFactor, govTel.advisoryWeight,
      memReadout.biasVector, s.suppressRelaySteering);

    // 3. Audit step with CognitiveGovernor
    const auditReport = s.governorKernel.auditSubstrateStep(zones, memReadout.hysteresisTension, s.suppressRelaySteering);

    // 4. The Governor gates channel attention before open Numogram exits are scored.
    const encounterDecisions: EncounterDecisionTrace[] = [];
    let attended: SubstrateEncounterInput | undefined;
    if (this.deferredEncounters.length > 0) {
      const pending = this.deferredEncounters[0];
      const decision = decideEncounter(s.governorKernel, pending);
      if (decision.disposition === 'ATTEND') {
        attended = this.deferredEncounters.shift();
        encounterDecisions.push({ ...pending, disposition: 'ATTEND',
          reason: 'Previously deferred encounter admitted after Governor recovery.', applied: true });
      } else {
        encounterDecisions.push({ ...pending, ...decision, applied: false });
      }
    }
    if (encounter) {
      let decision = decideEncounter(s.governorKernel, encounter);
      if (decision.disposition === 'ATTEND' && attended) {
        decision = { disposition: 'DEFER',
          reason: 'An earlier deferred encounter was attended on this step; this encounter remains queued.' };
      }
      if (decision.disposition === 'ATTEND') attended = encounter;
      else if (decision.disposition === 'DEFER' && this.deferredEncounters.length < 32) {
        this.deferredEncounters.push(encounter);
      } else if (decision.disposition === 'DEFER') {
        decision = { disposition: 'REFUSE',
          reason: 'Governor deferral queue is full; encounter retained in PFM but not queued.' };
      }
      encounterDecisions.push({ ...encounter, ...decision, applied: decision.disposition === 'ATTEND' });
    }

    // A signal can bias only an extant outgoing gate. Attention cannot invent a passage.
    const from = s.currentZone;
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
        + (inputZone === target ? 0.35 : 0)
        + (attended?.attentionVector[target] ?? 0) * 0.9;
      if (score > best) { best = score; to = target; }
    }
    // Zero candidate exits are represented as an explicit dwell, not a fabricated edge.
    const targetZone = zones[to];
    const sourceZone = zones[from];
    const fluxDelta = Number(Math.max(0.005,
      Math.min(0.18, Math.abs(targetZone.activation - sourceZone.activation) * 0.12 + 0.025)).toFixed(6));
    const phaseCoherence = Number(Math.max(0.05,
      Math.min(1, (1 + Math.cos(targetZone.phaseAngle - sourceZone.phaseAngle)) / 2)).toFixed(6));
    const eventBody = { step: s.stepCount, from, to, fluxDelta, phaseCoherence,
      inputDigest: inputDigest ?? null, inputZone: inputZone ?? null, encounters: encounterDecisions };
    const eventDigest = canonicalSha256(JSON.stringify(eventBody));
    const pfmEvent = { blockIndex: s.stepCount, depth: s.stepCount,
      targetZone: to, fluxDelta, phaseCoherence, strainRelaxation: 0.025,
      eventDigest, timestamp: s.stepCount, kind: 'STEP' as const, fromZone: from,
      inputDigest, inputZone, encounters: encounterDecisions };
    s.memory.append(pfmEvent);
    s.currentZone = to;
    s.lastTransition = { from, to, digest: eventDigest };

    // 5. Update deformation tensor
    for (let i = 0; i <= 9; i++) {
      const z = zones[i as ZoneId];
      s.deformationTensor[i] = s.deformationTensor[i] * 0.95 + (z.deformationStress + memReadout.biasVector[i]) * 0.05;
    }

    const syzygyCoherence = s.qabbala.computeSyzygyCoherence();
    const activeSyzygies = ['0::9 Abyssal', '1::8 Murmur', '2::7 SubCrypt', '3::6 BarkerLoop', '4::5 Centroid']
      .filter((_, idx) => (idx % 2 === 0 ? syzygyCoherence > 0.55 : syzygyCoherence > 0.65));

    // 6. Log per-step memory consumption audit (bounded buffer for high-throughput replays)
    if (s.memoryConsumptionLog.length >= 128) s.memoryConsumptionLog.shift();
    s.memoryConsumptionLog.push({
      step: s.stepCount,
      memoryHistoryLength: memReadout.historyLength,
      memoryHysteresisTension: memReadout.hysteresisTension,
      dominantDeformedZone: memReadout.dominantDeformedZone,
      appliedBiasVector: [...memReadout.biasVector],
      guidanceAdvisoryWeight: govTel.advisoryWeight,
      guidanceSuppressed: govTel.advisoryWeight === 0.0,
    });

    const clonedZones: Record<ZoneId, NumogramZone> = {} as Record<ZoneId, NumogramZone>;
    for (let i = 0; i <= 9; i++) clonedZones[i as ZoneId] = { ...zones[i as ZoneId] };

    const snapshot: OutsideStepSnapshot = {
      step: s.stepCount,
      timestamp: Date.now(),
      zones: clonedZones,
      governor: auditReport.telemetry,
      activeSyzygies,
      deformationVector: [...s.deformationTensor],
      selectedObjective: s.currentObjective,
      lastTransition: { ...s.lastTransition },
      encounterDecisions: JSON.parse(JSON.stringify(encounterDecisions)),
      memoryHistoryLength: s.memory.getEvents().length,
      memoryHeadDigest: s.memory.exportHistoryDigest(),
    };
    if (s.snapshots.length >= 128) s.snapshots.shift();
    s.snapshots.push(snapshot);
    return snapshot;
  }

  public override getSnapshots(): OutsideStepSnapshot[] {
    return super.getSnapshots();
  }

  public override exportState(): Record<string, unknown> {
    const { snapshots, memoryConsumptionLog, ...rest } = super.exportState();
    return { ...rest, deferredEncounters: JSON.parse(JSON.stringify(this.deferredEncounters)), snapshots, memoryConsumptionLog };
  }

  public override importState(state: Record<string, unknown>): void {
    super.importState(state);
    if (state && Array.isArray(state.deferredEncounters)) this.deferredEncounters = JSON.parse(JSON.stringify(state.deferredEncounters));
  }
}
