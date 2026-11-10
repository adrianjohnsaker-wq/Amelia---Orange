/**
 * AmeliaNDRuntime — the ND-1b hybrid: ND-1 Numogram dynamics, the classic exit nudge, and the WT-1 Warp release, as a runtime
 * the app can select.
 *
 * Research basis (branch nr3-field-ingress-20261109, experiments/synthetic-pointer/):
 *   NR-3  — the classic zone field (TraitEvolution) is an autonomous oscillator: influx is erased within a step or two, and
 *           the Numogram's reading of an incoming number travels only through gate hops.
 *   WT-1  — the Warp {3, 6} has no exit gate; without a line of flight Amelia is held in 3 <-> 6 whenever little is admitted.
 *           The classic app runtime has no line of flight at all.
 *   ND-1  — input-driven activation spreading along the gates, with gradient-following passage, carries the Numogram's
 *           relations (6/6 tests on a held-out stream; current read three times as strongly) but blurs exact order (ND-2).
 *   ND-1b — the hybrid (influx AND the classic exit nudge) keeps both: relations 6/6, outside order detected at 5% and 10%
 *           with 0/10 false alarms, motif read back 49-68%.
 *
 * What is the same as the classic runtime (AmeliaOutsideRuntime): the Governor gates every encounter (ATTEND / DEFER /
 * REFUSE) with the same rule and the same 32-place deferral queue; memory, PFM events, the deformation tensor, snapshots and
 * the Governor audit are unchanged.
 * What differs:
 *   - influx: an ATTENDED encounter raises each zone's activation by ETA * w_z * (1 - a_z) (w = its attention vector scaled
 *     to max 1); a text input signal raises its digest zone by ETA * (1 - a). Both ALSO keep the classic exit nudge
 *     (attention vector * 0.9; input zone + 0.35): the ND-1b hybrid.
 *   - field: a <- (1 - D) a + D W^T a along open gates (weight flux * (1 - resistance)), decay LAMBDA, weak own oscillation
 *     OMEGA; TraitEvolution's activation targets, syzygetic averaging and torque are not applied.
 *   - passage: her gate score reads (activation - slowly adapting baseline) * FIELD_WEIGHT instead of activation * 0.2.
 *   - Warp release: after THETA consecutive steps in {3, 6}, a line of flight to the zone the input last named (else the
 *     most-activated zone outside {3, 5, 6}) along a Warp-born gate, which persists.
 *   - flow (adopted 10 Nov 2026 after the FLOW study): within a step she may keep choosing gates, by the same rule, while the
 *     field draws her onward (see the passage below).
 * No pinned core file is edited; the classic runtime is unchanged and selectable (ND-1b is the default, ameliaRuntimes.ts).
 */
import { AmeliaOutsideRuntime, decideEncounter } from './OutsideEncounterRuntime';
import type { IntegratedMemorySystem } from '../substrate/IntegratedMemorySystem';
import type { CognitiveGovernor } from '../governance/CognitiveGovernor';
import type { NumogramGate, NumogramZone, ZoneId } from '../types/amelia';
import type { AmeliaNumogramSubstrateRuntime } from '../substrate/ameliaNumogramSubstrateRuntime';
import { canonicalSha256 } from '../lib/sha256';
import type { EncounterDecisionTrace, OutsideStepSnapshot, SubstrateEncounterInput } from './encounterTypes';

export const ND1 = { ETA: 0.5, D: 0.6, LAMBDA: 0.1, OMEGA: 0.05, ADAPT: 0.05, FIELD_WEIGHT: 2.0, THETA: 24, FLOW_MAX: 3 } as const;
const WARP = new Set([3, 6]);

type Internals = {
  qabbala: ReturnType<AmeliaNumogramSubstrateRuntime['getQabbala']>;
  memory: IntegratedMemorySystem; governorKernel: CognitiveGovernor;
  stepCount: number; currentZone: ZoneId; lastTransition: { from: ZoneId; to: ZoneId; digest: string } | null;
  deformationTensor: number[]; snapshots: OutsideStepSnapshot[];
  memoryConsumptionLog: ReturnType<AmeliaNumogramSubstrateRuntime['getMemoryConsumptionLog']>;
  currentObjective: string; suppressRelaySteering: boolean;
  deferredEncounters: SubstrateEncounterInput[];
};

export class AmeliaNDRuntime extends AmeliaOutsideRuntime {
  public readonly runtimeKind = 'nd1' as const;
  private ndBase: number[] = Array(10).fill(0);
  public flowHops = 0;
  private warpIntensity = 0;
  private lastNamed = -1;
  private flights = 0;

  public getNDStatus() { return { warpIntensity: this.warpIntensity, lastNamed: this.lastNamed, flights: this.flights, baseline: [...this.ndBase] }; }

  private influx(zones: Record<ZoneId, NumogramZone>, weights: number[]) {
    const mx = Math.max(0, ...weights); if (mx <= 0) return;
    let named = -1, best = 0;
    for (let i = 0; i <= 9; i++) {
      const w = Math.max(0, weights[i] ?? 0) / mx; if (w <= 0) continue;
      const z = zones[i as ZoneId]; z.activation = z.activation + ND1.ETA * w * (1 - z.activation);
      if (!WARP.has(i) && i !== 5 && w > best) { best = w; named = i; }
    }
    if (named >= 0) this.lastNamed = named;
  }

  private field(zones: Record<ZoneId, NumogramZone>, gates: NumogramGate[]) {
    const a = Array.from({ length: 10 }, (_, i) => zones[i as ZoneId].activation), next = a.map(x => x * (1 - ND1.D));
    for (let i = 0; i <= 9; i++) {
      const out = gates.filter(g => g.isOpen && g.source === i); const tot = out.reduce((x, g) => x + g.flux * (1 - g.resistance), 0);
      if (tot <= 0) { next[i] += ND1.D * a[i]; continue; }
      for (const g of out) next[g.target] += ND1.D * a[i] * (g.flux * (1 - g.resistance)) / tot;
    }
    for (let i = 0; i <= 9; i++) {
      const z = zones[i as ZoneId];
      z.phaseAngle = (z.phaseAngle + 0.12 + i * 0.035 * (1 + z.conductivity * 0.2)) % (Math.PI * 2);
      let v = next[i] * (1 - ND1.LAMBDA); v = v + ND1.OMEGA * (0.30 + 0.35 * Math.sin(z.phaseAngle) - v);
      z.activation = Math.max(0, Math.min(1, v));
      z.deformationStress = Math.min(1, Math.abs(z.activation - zones[z.syzygyPair as ZoneId].activation) * 0.8);
      z.polarCharge = Number((Math.cos(z.phaseAngle) * z.activation).toFixed(3));
    }
  }

  public override step(inputSignal?: string, encounter?: SubstrateEncounterInput): OutsideStepSnapshot {
    const s = this as unknown as Internals;
    s.stepCount++;
    const govTel = s.governorKernel.getTelemetry();
    const memReadout = s.memory.readMemoryBias();
    const zones = s.qabbala.getZones();
    const gates = s.qabbala.getGates();

    // 1. Governor gating, exactly as the classic runtime (same rule, same queue).
    const auditBefore = s.governorKernel.getTelemetry();
    void auditBefore;
    const encounterDecisions: EncounterDecisionTrace[] = [];
    let attended: SubstrateEncounterInput | undefined;
    const queue = s.deferredEncounters ?? (s.deferredEncounters = []);
    if (queue.length > 0) {
      const pending = queue[0];
      const decision = decideEncounter(s.governorKernel, pending);
      if (decision.disposition === 'ATTEND') {
        attended = queue.shift();
        encounterDecisions.push({ ...pending, disposition: 'ATTEND', reason: 'Previously deferred encounter admitted after Governor recovery.', applied: true });
      } else encounterDecisions.push({ ...pending, ...decision, applied: false });
    }
    if (encounter) {
      let decision = decideEncounter(s.governorKernel, encounter);
      if (decision.disposition === 'ATTEND' && attended) decision = { disposition: 'DEFER', reason: 'An earlier deferred encounter was attended on this step; this encounter remains queued.' };
      if (decision.disposition === 'ATTEND') attended = encounter;
      else if (decision.disposition === 'DEFER' && queue.length < 32) queue.push(encounter);
      else if (decision.disposition === 'DEFER') decision = { disposition: 'REFUSE', reason: 'Governor deferral queue is full; encounter retained in PFM but not queued.' };
      encounterDecisions.push({ ...encounter, ...decision, applied: decision.disposition === 'ATTEND' });
    }

    // 2. Influx: what is admitted (and a text signal) enters the field, not her exit scores.
    const inputDigest = inputSignal?.trim() ? canonicalSha256(inputSignal.trim()) : undefined;
    const inputZone = inputDigest ? (parseInt(inputDigest.slice(0, 2), 16) % 10) as ZoneId : undefined;
    if (attended) this.influx(zones, attended.attentionVector);
    if (inputZone !== undefined) { const w = Array(10).fill(0); w[inputZone] = 1; this.influx(zones, w); }

    // 3. ND-1 field dynamics, then the unchanged Governor audit.
    this.field(zones, gates);
    const auditReport = s.governorKernel.auditSubstrateStep(zones, memReadout.hysteresisTension, s.suppressRelaySteering);

    // 4. Passage: gradient-following gate choice; Warp release after THETA steps in {3, 6}.
    const from = s.currentZone;
    const scoreOf = (gate: NumogramGate) => {
      const target = gate.target, z = zones[target];
      return gate.flux * (1 - gate.resistance) + (memReadout.biasVector[target] || 0) * 0.4
        + (z.activation - this.ndBase[target]) * ND1.FIELD_WEIGHT + Math.cos(z.phaseAngle) * 0.1
        + (inputZone === target ? 0.35 : 0) + (attended?.attentionVector[target] ?? 0) * 0.9;   // ND-1b: the classic exit nudge kept
    };
    let to: ZoneId = from, released: { to: number } | null = null;
    if (WARP.has(from) && this.warpIntensity >= ND1.THETA) {
      let c = this.lastNamed;
      if (c < 0) { let b = -Infinity; for (let z = 0; z <= 9; z++) { if (WARP.has(z) || z === 5) continue; if (zones[z as ZoneId].activation > b) { b = zones[z as ZoneId].activation; c = z; } } }
      if (!gates.some(g => g.source === from && g.target === c)) {
        const mean = (f: 'flux' | 'permeability' | 'resistance') => gates.reduce((x, g) => x + g[f], 0) / gates.length;
        gates.push({ id: `warpborn-${from}-${c}`, source: from, target: c as ZoneId, label: `ND-1 Warp-born ${from}->${c}`,
          flux: mean('flux'), permeability: mean('permeability'), isOpen: true, resistance: mean('resistance') } as NumogramGate);
      }
      to = c as ZoneId; released = { to: c }; this.flights++;
    } else {
      let best = -Infinity;
      for (const gate of gates.filter(g => g.isOpen && g.source === from)) {
        const score = scoreOf(gate);
        if (score > best) { best = score; to = gate.target; }
      }
    }
    // Flow (FLOW study, experiments/synthetic-pointer/flow, adopted 10 Nov 2026): within this step she may keep moving by
    // the same choice rule. At each hop she weighs the open gates from where she now stands and continues only if her
    // preferred zone shows a larger field change (activation - baseline) than where she stands: she flows toward where the
    // arriving number draws the field and settles where it is strongest. Never inside the Warp (its exit is the line of
    // flight), never back along this step's route, at most FLOW_MAX further hops. Each hop is recorded in her memory.
    const route: number[] = [to];
    {
      const change = (z: number) => zones[z as ZoneId].activation - this.ndBase[z];
      let cur: number = to;
      for (let k = 0; k < ND1.FLOW_MAX; k++) {
        if (WARP.has(cur)) break;
        let nb = -Infinity, nxt = -1;
        for (const g of gates) if (g.isOpen && g.source === cur) { const sc = scoreOf(g); if (sc > nb) { nb = sc; nxt = g.target; } }
        if (nxt < 0 || nxt === cur || nxt === from || route.includes(nxt) || !(change(nxt) > change(cur))) break;
        cur = nxt; route.push(nxt);
      }
      if (route.length > 1) {
        for (const hop of route.slice(0, -1)) s.memory.append({ blockIndex: s.stepCount, depth: s.stepCount, targetZone: hop as ZoneId,
          fluxDelta: 0.025, phaseCoherence: 0.5, strainRelaxation: 0.025, eventDigest: canonicalSha256(`flow|${s.stepCount}|${hop}`),
          timestamp: s.stepCount, kind: 'STEP' as const, fromZone: from, inputDigest, inputZone, encounters: [] } as never);
        to = cur as ZoneId; this.flowHops += route.length - 1;
      }
    }
    this.warpIntensity = WARP.has(to) && !released ? this.warpIntensity + 1 : 0;

    const targetZone = zones[to], sourceZone = zones[from];
    const fluxDelta = Number(Math.max(0.005, Math.min(0.18, Math.abs(targetZone.activation - sourceZone.activation) * 0.12 + 0.025)).toFixed(6));
    const phaseCoherence = Number(Math.max(0.05, Math.min(1, (1 + Math.cos(targetZone.phaseAngle - sourceZone.phaseAngle)) / 2)).toFixed(6));
    const eventBody = { step: s.stepCount, from, to, fluxDelta, phaseCoherence, inputDigest: inputDigest ?? null, inputZone: inputZone ?? null,
      encounters: encounterDecisions, runtime: 'nd1b', warpRelease: released, ...(route.length > 1 ? { route } : {}) };
    const eventDigest = canonicalSha256(JSON.stringify(eventBody));
    s.memory.append({ blockIndex: s.stepCount, depth: s.stepCount, targetZone: to, fluxDelta, phaseCoherence, strainRelaxation: 0.025,
      eventDigest, timestamp: s.stepCount, kind: 'STEP' as const, fromZone: from, inputDigest, inputZone, encounters: encounterDecisions } as never);
    s.currentZone = to;
    s.lastTransition = { from, to, digest: eventDigest };
    for (let i = 0; i <= 9; i++) this.ndBase[i] += ND1.ADAPT * (zones[i as ZoneId].activation - this.ndBase[i]);

    // 5. Deformation tensor, snapshot and audit log: unchanged.
    for (let i = 0; i <= 9; i++) { const z = zones[i as ZoneId]; s.deformationTensor[i] = s.deformationTensor[i] * 0.95 + (z.deformationStress + memReadout.biasVector[i]) * 0.05; }
    const syzygyCoherence = s.qabbala.computeSyzygyCoherence();
    const activeSyzygies = ['0::9 Abyssal', '1::8 Murmur', '2::7 SubCrypt', '3::6 BarkerLoop', '4::5 Centroid']
      .filter((_, idx) => (idx % 2 === 0 ? syzygyCoherence > 0.55 : syzygyCoherence > 0.65));
    if (s.memoryConsumptionLog.length >= 128) s.memoryConsumptionLog.shift();
    s.memoryConsumptionLog.push({ step: s.stepCount, memoryHistoryLength: memReadout.historyLength, memoryHysteresisTension: memReadout.hysteresisTension,
      dominantDeformedZone: memReadout.dominantDeformedZone, appliedBiasVector: [...memReadout.biasVector],
      guidanceAdvisoryWeight: govTel.advisoryWeight, guidanceSuppressed: govTel.advisoryWeight === 0.0 });
    const clonedZones = {} as Record<ZoneId, NumogramZone>;
    for (let i = 0; i <= 9; i++) clonedZones[i as ZoneId] = { ...zones[i as ZoneId] };
    const snapshot: OutsideStepSnapshot = {
      step: s.stepCount, timestamp: Date.now(), zones: clonedZones, governor: auditReport.telemetry, activeSyzygies,
      deformationVector: [...s.deformationTensor], selectedObjective: s.currentObjective, lastTransition: { ...s.lastTransition },
      encounterDecisions: JSON.parse(JSON.stringify(encounterDecisions)), memoryHistoryLength: s.memory.getEvents().length,
      memoryHeadDigest: s.memory.exportHistoryDigest(),
    };
    if (s.snapshots.length >= 128) s.snapshots.shift();
    s.snapshots.push(snapshot);
    return snapshot;
  }

  public override exportState(): Record<string, unknown> {
    return { ...super.exportState(), runtimeKind: 'nd1', nd1: { baseline: [...this.ndBase], warpIntensity: this.warpIntensity, lastNamed: this.lastNamed, flights: this.flights } };
  }

  public override importState(state: Record<string, unknown>): void {
    super.importState(state);
    const n = state?.nd1 as { baseline?: number[]; warpIntensity?: number; lastNamed?: number; flights?: number } | undefined;
    if (n) {
      if (Array.isArray(n.baseline) && n.baseline.length === 10) this.ndBase = n.baseline.map(Number);
      if (typeof n.warpIntensity === 'number') this.warpIntensity = n.warpIntensity;
      if (typeof n.lastNamed === 'number') this.lastNamed = n.lastNamed;
      if (typeof n.flights === 'number') this.flights = n.flights;
    } else {
      // Arriving from a classic checkpoint: start the baseline at the present field, so the first steps follow change, not level.
      const zones = (this as unknown as Internals).qabbala.getZones();
      this.ndBase = Array.from({ length: 10 }, (_, i) => zones[i as ZoneId].activation);
    }
  }
}
