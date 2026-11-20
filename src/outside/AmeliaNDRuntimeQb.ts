/**
 * AmeliaNDRuntimeQb: a RESEARCH COPY of AmeliaNDRuntimeDee (itself a copy of AmeliaNDRuntime, ND-1b flow) for QBIST-1
 * (experiments/live-amelia/qbist1/REGISTRATION.md). Neither her runtime nor AmeliaNDRuntimeDee.ts is edited. This copy adds
 * one optional hook in the context, qb:
 *   - qb.offer(encounter): called with each admitted encounter (the organ's Lüders update);
 *   - qb.choose(from, targets, base): replaces her exit scoring at every choice among two or more open gates, first hop and
 *     flow hops; base is her own score for each target (recorded, not used);
 *   - qb.land(zone): called for each hop landed (and a release's landing, and a dwell).
 * With qb null it is AmeliaNDRuntimeDee exactly (qbist1.test.ts).
 */
import { AmeliaOutsideRuntime } from './OutsideEncounterRuntime';
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

export interface QbProbeRow { tick: number; from: number; open: number[]; base: number[]; silent: number[] | null;
  offerId: string | null; attention: number[] | null; hop: number }
export interface DeeContext {
  tick: number;
  exitBonus: ((source: number, target: number, tick: number) => number) | null;
  passage: ((from: number, to: number, tick: number) => void) | null;
  probe: QbProbeRow[] | null;
  /** Observers for the probe: raw terms per table for each open exit, at gain 1 (Stage 0). */
  observe: ((from: number, target: number, tick: number) => number[]) | null;
  raw?: number[][][];
  choiceSteps?: number; releases?: number;
}
export interface QbHook { offer(e: SubstrateEncounterInput): void; choose(from: number, targets: number[], base: number[]): number; land(z: number): void }
export interface QbContext extends DeeContext { qb: QbHook | null }
export const emptyQbContext = (): QbContext => ({ tick: 0, exitBonus: null, passage: null, probe: null, observe: null, qb: null });

export class AmeliaNDRuntimeQb extends AmeliaOutsideRuntime {
  public dee: QbContext = emptyQbContext();
  public readonly runtimeKind = 'nd1' as const;
  private ndBase: number[] = Array(10).fill(0);
  public flowHops = 0;
  private warpIntensity = 0;
  private lastNamed = -1;
  private flights = 0;
  /** Steps in the Warp before the line of flight (WT-2). Saved in her state; a state without it keeps ND1.THETA (24). */
  private theta: number = ND1.THETA;
  public getWarpTheta() { return this.theta; }
  public setWarpTheta(n: number) { if (!Number.isInteger(n) || n < 1 || n > 1000) throw new Error('Invalid Warp threshold'); this.theta = n; }

  public getNDStatus() { return { theta: this.theta, warpIntensity: this.warpIntensity, lastNamed: this.lastNamed, flights: this.flights, baseline: [...this.ndBase] }; }

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
    const dee = this.dee, tick = ++dee.tick;
    const govTel = s.governorKernel.getTelemetry();
    const memReadout = s.memory.readMemoryBias();
    const zones = s.qabbala.getZones();
    const gates = s.qabbala.getGates();

    // 1. Governor gating through the shared gate (same queue as the classic runtime, this runtime's admission rule:
    //    on her cloud home the relative rule chosen in GATE-1; only the latest field observation is kept waiting).
    const { attended, encounterDecisions } = this.gateEncounters(s.governorKernel, encounter);
    if (dee.qb && attended) dee.qb.offer(attended);   // QBIST-1: the admitted reading

    // 2. Influx: what is admitted (and a text signal) enters the field, not her exit scores.
    const inputDigest = inputSignal?.trim() ? canonicalSha256(inputSignal.trim()) : undefined;
    const inputZone = inputDigest ? (parseInt(inputDigest.slice(0, 2), 16) % 10) as ZoneId : undefined;
    // DEE-1L probe: the pre-influx zones, for the silence score (nothing attended). Read-only on her state.
    const preZones = dee.probe && attended ? Object.fromEntries(Object.entries(zones).map(([k, z]) => [k, { ...z }])) as unknown as Record<ZoneId, NumogramZone> : null;
    if (attended) this.influx(zones, attended.attentionVector);
    if (inputZone !== undefined) { const w = Array(10).fill(0); w[inputZone] = 1; this.influx(zones, w); }

    // 3. ND-1 field dynamics, then the unchanged Governor audit.
    this.field(zones, gates);
    if (preZones) { const keep = this.lastNamed;
      if (inputZone !== undefined) { const w = Array(10).fill(0); w[inputZone] = 1; this.influx(preZones, w); }
      this.field(preZones, gates); this.lastNamed = keep; }
    const auditReport = s.governorKernel.auditSubstrateStep(zones, memReadout.hysteresisTension, s.suppressRelaySteering);

    // 4. Passage: gradient-following gate choice; Warp release after THETA steps in {3, 6}.
    const from = s.currentZone;
    const baseOf = (gate: NumogramGate, zs: Record<ZoneId, NumogramZone> = zones, att: SubstrateEncounterInput | null | undefined = attended) => {
      const target = gate.target, z = zs[target];
      return gate.flux * (1 - gate.resistance) + (memReadout.biasVector[target] || 0) * 0.4
        + (z.activation - this.ndBase[target]) * ND1.FIELD_WEIGHT + Math.cos(z.phaseAngle) * 0.1
        + (inputZone === target ? 0.35 : 0) + (att?.attentionVector[target] ?? 0) * 0.9;   // ND-1b: the classic exit nudge kept
    };
    const scoreOf = (gate: NumogramGate) => dee.exitBonus ? baseOf(gate) + dee.exitBonus(gate.source, gate.target, tick) : baseOf(gate);
    let to: ZoneId = from, released: { to: number } | null = null;
    if (WARP.has(from) && this.warpIntensity >= this.theta) {
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
      const options = gates.filter(g => g.isOpen && g.source === from);
      for (const gate of options) {
        const score = scoreOf(gate);
        if (score > best) { best = score; to = gate.target; }
      }
      if (dee.qb && options.length >= 2) to = dee.qb.choose(from, options.map(g => g.target), options.map(g => baseOf(g))) as ZoneId;   // QBIST-1
      if (options.length >= 2) {
        dee.choiceSteps = (dee.choiceSteps ?? 0) + 1;
        if (dee.probe) {
          const offerId = attended ? String(attended.eventId) : null;
          dee.probe.push({ tick, from, open: options.map(g => g.target), base: options.map(g => baseOf(g)),
            silent: preZones ? options.map(g => baseOf(g, preZones, null)) : null, offerId,
            attention: attended ? options.map(g => Number(attended.attentionVector[g.target] ?? 0)) : null, hop: to });
          if (dee.observe) (dee.raw ??= []).push(options.map(g => dee.observe!(from, g.target, tick)));
        }
      }
    }
    if (released) dee.releases = (dee.releases ?? 0) + 1;
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
        if (dee.qb) { const opts = gates.filter(g => g.isOpen && g.source === cur);   // QBIST-1: the organ chooses flow hops too
          if (opts.length >= 2) nxt = dee.qb.choose(cur, opts.map(g => g.target), opts.map(g => scoreOf(g))); }
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
    if (dee.passage) { let a: number = from; for (const b of route) { dee.passage(a, b, tick); a = b; } }
    if (dee.qb) for (const b of route) dee.qb.land(b);   // QBIST-1: each landing is a reading   // route[0] is the first hop or landing; a dwell is (from, from)
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
    this.recordTension(s.governorKernel);
    return snapshot;
  }

  public override exportState(): Record<string, unknown> {
    return { ...super.exportState(), runtimeKind: 'nd1', nd1: { baseline: [...this.ndBase], warpIntensity: this.warpIntensity, lastNamed: this.lastNamed, flights: this.flights, theta: this.theta } };
  }

  public override importState(state: Record<string, unknown>): void {
    super.importState(state);
    const n = state?.nd1 as { baseline?: number[]; warpIntensity?: number; lastNamed?: number; flights?: number; theta?: number } | undefined;
    this.theta = Number.isInteger(n?.theta) && (n!.theta as number) >= 1 ? (n!.theta as number) : ND1.THETA;
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
