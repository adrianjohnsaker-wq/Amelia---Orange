// WS-1 (REGISTRATION.md): a copy of nd1/ndRuntime.ts (sealed with ND-3, not edited) in which the Warp pair is a setting (`warp`).
// Only change: every use of the fixed set {3, 6} (and the 'outside {3, 5, 6}' rule for the named zone) reads `warp` instead.
/**
 * ND-1 runtime (nd1/REGISTRATION.md): the WT-1 release runtime (header below) with a switch `nd` that replaces the zone-field
 * dynamics. Off (default), it reproduces NRRuntime exactly (nd1/equivalence.ts). On, each step:
 *   - influx: the harness adds the datum to its zone's activation (influx(), before the step);
 *   - spread: a <- (1 - D) a + D W^T a, W the row-normalised open-gate matrix with weight flux * (1 - resistance), so activation
 *     travels the Numogram's gates (syzygies, currents, gate cumulations);
 *   - decay: a <- a (1 - LAMBDA);
 *   - weak own oscillation: a <- a + OMEGA (0.30 + 0.35 sin(phase) - a), phases advancing as in TraitEvolution; OMEGA small;
 *   - TraitEvolution's activation targets, syzygetic averaging and torque are NOT applied.
 * Her gate choice reads, with weight `fieldWeight`, each target's activation minus its slowly adapting baseline (ADAPT): the
 * change the input made, not the standing level the gate topology accumulates (a gradient, not a level). With `warpRelease` on, the Warp releases to the zone the
 * influx last named.
 *
 * WT-1 RELEASE runtime: NR-1's NRRuntime (header below) with one switch, off by default so that it reproduces NRRuntime
 * exactly (wt1/equivalence.ts). warpRelease: after THETA steps of Warp intensity, a line of flight fires even when no
 * observation is attended this step; it goes to the zone the input last named (the last attended datum's zone outside
 * {3, 5, 6}), or, before any, to the most-activated zone outside {3, 5, 6}.
 *
 * NR-1 (NUMOGRAM READING) runtime: a verbatim copy of sxi0c/repaired.ts's RepairedSyntheticRuntime step, except that the
 * receiver table rel(y, c) is an instance field (INGRESS II, as in repaired.ts, or IDENTITY). nr1/equivalence.ts checks that
 * with rel = INGRESS it reproduces RepairedSyntheticRuntime exactly. Original header follows.
 *
 * SXI-0 controls, repaired synthetic channel (see REPAIRS.md). A subclass of the branch's SyntheticQueueRuntime, so the
 * coordinator, observer and ledger are unchanged. Its step is AmeliaOutsideRuntime.step (src/outside/OutsideEncounterRuntime.ts)
 * with three changes: (1) its own admission rule for the synthetic body channel and no deferral backlog; (2) contrast plus the
 * INGRESS II receiver (beta = 2) as the attended bonus, encoded through the unchanged `attentionVector * 0.9` score term so the
 * coordinator's independent score reconstruction still checks every step; (3) deterministic snapshot timestamps.
 * Nothing in src/ is edited.
 */
import { SyntheticQueueRuntime } from '../observer';
import { OutsideEncounterMemory } from '../../../src/outside/OutsideEncounterRuntime';
import type { EncounterDecisionTrace, OutsideStepSnapshot, SubstrateEncounterInput } from '../../../src/outside/encounterTypes';
import type { IntegratedMemorySystem } from '../../../src/substrate/IntegratedMemorySystem';
import type { CognitiveGovernor } from '../../../src/governance/CognitiveGovernor';
import type { NumogramZone, ZoneId } from '../../../src/types/amelia';
import type { AmeliaNumogramSubstrateRuntime } from '../../../src/substrate/ameliaNumogramSubstrateRuntime';
import { canonicalSha256 } from '../../../src/lib/sha256';
import { withFullNumogram, FULL_NUMOGRAM_GATES } from '../../../src/core/fullNumogram';

export const BETA = 2;
const THETA = 24, FLIGHT = 1000;   // THETA = the learner horizon, as in ANTENNA III
const droot = (c: number) => (c === 0 ? 0 : 1 + ((c - 1) % 9));
export const INGRESS = (y: number, c: number) => (y === 5 ? 0 : Math.max(y === c ? 1 : 0, y === 9 - c ? 0.6 : 0, y === Math.abs(2 * c - 9) ? 0.4 : 0, y === droot((c * (c + 1)) / 2) ? 0.3 : 0));
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


export const IDENTITY = (y: number, c: number) => (y === 5 ? 0 : y === c ? 1 : 0);

export class WSRuntime extends SyntheticQueueRuntime {
  /** WS-1: the pair the Warp mechanism (intensity, line of flight, release) is bound to. {3, 6} reproduces NDRuntime exactly. */
  public warp: Set<number> = new Set([3, 6]);
  private named(c: number) { return c !== 5 && !this.warp.has(c); }
  public nd = false;
  public fieldWeight = 0.2;
  public D = 0.5; public LAMBDA = 0.1; public OMEGA = 0.05;
  public ADAPT = 0.05;   // ND-1: per-zone baseline adapts at this rate; her choice reads activation minus baseline (the change)
  public base: number[] = Array(10).fill(0);
  /** ND-1 influx: datum c raises zone c's activation by eta (1 - a); it is also the zone the input last named. */
  public influx(c: number, eta: number) {
    const z = (this as any).qabbala.getZones()[c]; z.activation = z.activation + eta * (1 - z.activation);
    if (this.named(c)) this.lastNamed = c;
  }
  private ndField(zones: any, gates: any[]) {
    const a = Array.from({ length: 10 }, (_, i) => zones[i].activation), next = a.map(x => x * (1 - this.D));
    for (let i = 0; i <= 9; i++) {
      const out = gates.filter(g => g.isOpen && g.source === i); const tot = out.reduce((x, g) => x + g.flux * (1 - g.resistance), 0);
      if (tot <= 0) { next[i] += this.D * a[i]; continue; }
      for (const g of out) next[g.target] += this.D * a[i] * (g.flux * (1 - g.resistance)) / tot;
    }
    for (let i = 0; i <= 9; i++) {
      const z = zones[i]; z.phaseAngle = (z.phaseAngle + 0.12 + i * 0.035 * (1 + z.conductivity * 0.2)) % (Math.PI * 2);
      let v = next[i] * (1 - this.LAMBDA); v = v + this.OMEGA * (0.30 + 0.35 * Math.sin(z.phaseAngle) - v);
      z.activation = Math.max(0.0, Math.min(1.0, v));
      z.deformationStress = Math.min(1.0, Math.abs(z.activation - zones[z.syzygyPair].activation) * 0.8);
      z.polarCharge = Number((Math.cos(z.phaseAngle) * z.activation).toFixed(3));
    }
  }
  private ndAdapt(zones: any) { for (let i = 0; i <= 9; i++) this.base[i] += this.ADAPT * (zones[i].activation - this.base[i]); }
  public warpRelease = false;
  public lastNamed = -1;   // the last attended datum's zone outside {3, 5, 6}
  /** NR-1 receiver: rel(y, c), the pull of an input zone c on exit y (REGISTRATION.md). */
  public rel: (y: number, c: number) => number = INGRESS;
  public warpIntensity = 0;
  public replayVector: number[] | null = null;   // set by the harness for one step (replay control)
  public flights = 0;
  public override exportState(): Record<string, unknown> { return { ...super.exportState(), sxi0cWarpIntensity: this.warpIntensity, sxi0cFlights: this.flights }; }
  public override importState(state: Record<string, unknown>): void {
    super.importState(state);
    if (typeof state.sxi0cWarpIntensity === 'number') this.warpIntensity = state.sxi0cWarpIntensity;
    if (typeof state.sxi0cFlights === 'number') this.flights = state.sxi0cFlights;
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
if (this.nd) this.ndField(zones, gates); else s.traitEvolution.evolveStep(zones, gates, govTel.momentumDampingFactor, govTel.advisoryWeight,
      memReadout.biasVector, s.suppressRelaySteering);

    // 3. Audit step with CognitiveGovernor
    const auditReport = s.governorKernel.auditSubstrateStep(zones, memReadout.hysteresisTension, s.suppressRelaySteering);

    // 4. REPAIRED admission for the synthetic body channel (sxi0c/REPAIRS.md): its own rule, no backlog.
    //    ATTEND unless malformed (REFUSE) or the Governor is in locked recovery (DROP: not queued, never stale).
    const encounterDecisions: EncounterDecisionTrace[] = [];
    let attended: SubstrateEncounterInput | undefined;
    const submitted0 = (this as any).syntheticQueued ?? encounter; (this as any).syntheticQueued = null;
    // REPLAY control (LOOP_CONTROLS.md): the live observation is replaced by a recorded one; the trace says so.
    const replayed = !!(submitted0 && this.replayVector);
    const submitted = replayed ? { ...submitted0!, attentionVector: this.replayVector! } : submitted0;
    this.replayVector = null;
    if (submitted) {
      const v = submitted.attentionVector, total = Array.isArray(v) ? v.reduce((x: number, y: number) => x + y, 0) : 0;
      const valid = Array.isArray(v) && v.length === 10 && v.every((x: number) => Number.isFinite(x) && x >= 0 && x <= 1) && total > 0.99 && total < 1.01
        && !!submitted.eventId && /^[a-f0-9]{64}$/i.test(submitted.sourceDigest);
      const tel = s.governorKernel.getTelemetry();
      let disposition: 'ATTEND' | 'DEFER' | 'REFUSE', reason: string;
      if (!valid) { disposition = 'REFUSE'; reason = 'Synthetic observation failed structural validation.'; }
      else if (tel.governorStatus === 'LOCKED_RECOVERY' || tel.antiLockIntegrity < 85) { disposition = 'DEFER'; reason = 'SXI0C_DROPPED: Governor in locked recovery; the observation is dropped, not queued.'; }
      else { disposition = 'ATTEND'; reason = 'SXI0C synthetic admission: attended (field tension does not close this channel).'; }
      let applied: SubstrateEncounterInput | undefined;
      if (disposition === 'ATTEND') {
        // contrast: each band's excess over the mean share; receiver: INGRESS II, beta = 2, along syzygy/current/gate, no pull to 5.
        const w = v.map((x: number) => Math.max(0, x - 0.1)); const mx = Math.max(...w);
        const bonus = Array.from({ length: 10 }, (_, y) => mx > 0 ? BETA * Math.max(...w.map((wc: number, c: number) => (wc / mx) * this.rel(y, c))) : 0);
        // encoded so that the unchanged score term (attentionVector[target] * 0.9) adds exactly this bonus
        applied = { ...submitted, attentionVector: bonus.map(x => x / 0.9) };
        attended = applied;
        { let c0 = -1, b0 = 0; for (let z = 0; z <= 9; z++) { const w0 = Math.max(0, v[z] - 0.1); if (w0 > b0) { b0 = w0; c0 = z; } } if (c0 >= 0 && this.named(c0)) this.lastNamed = c0; }
      }
      encounterDecisions.push({ ...(applied ?? submitted), disposition, reason: replayed ? reason + ' REPLAY: recorded observation, not the live body.' : reason, applied: disposition === 'ATTEND' });
    }
    // 4b. The Warp as accelerator (ANTENNA III): intensity builds in {3, 6}; at THETA, with an attended observation, a line of
    //     flight to the zone the body marks most (largest contrast, outside {3, 5, 6}). The flight creates a Warp-born gate,
    //     a real open gate kept from then on, and is taken through the recorded attention term (so it is reconstructed and checked).
    {
      const from0 = s.currentZone;
      if (this.warp.has(from0) && this.warpIntensity >= THETA && !attended && this.warpRelease) {
        // WT-1: Warp release without admission, to the zone the input last named
        let c = this.lastNamed;
        if (c < 0) { let best0 = -Infinity; for (let z = 0; z <= 9; z++) { if (this.warp.has(z) || z === 5) continue; if (zones[z as ZoneId].activation > best0) { best0 = zones[z as ZoneId].activation; c = z; } } }
        if (!gates.some(g => g.source === from0 && g.target === c)) {
          const mean = (f: 'flux' | 'permeability' | 'resistance') => gates.reduce((x, g) => x + g[f], 0) / gates.length;
          gates.push({ id: `warpborn-${from0}-${c}`, source: from0 as ZoneId, target: c as ZoneId, label: `WT1 release Warp-born ${from0}->${c}`,
            flux: mean('flux'), permeability: mean('permeability'), isOpen: true, resistance: mean('resistance') });
        }
        const forced = Array(10).fill(0); forced[c] = FLIGHT / 0.9;
        attended = { eventId: 'wt1-warp-release', channel: 'SYNTHETIC_FIELD', sourceDigest: '0'.repeat(64), attentionVector: forced } as any;
        encounterDecisions.push({ ...(attended as any), disposition: 'ATTEND', reason: `WT1 WARP_RELEASE ${from0}->${c} (Warp intensity ${this.warpIntensity}).`, applied: true });
        this.flights++;
      } else if (this.warp.has(from0) && this.warpIntensity >= THETA && attended) {
        const v0 = submitted!.attentionVector; let c = -1, best0 = 0;
        for (let z = 0; z <= 9; z++) { if (this.warp.has(z) || z === 5) continue; const w0 = Math.max(0, v0[z] - 0.1); if (w0 > best0) { best0 = w0; c = z; } }
        if (c >= 0) {
          if (!gates.some(g => g.source === from0 && g.target === c)) {
            const mean = (f: 'flux' | 'permeability' | 'resistance') => gates.reduce((x, g) => x + g[f], 0) / gates.length;
            gates.push({ id: `warpborn-${from0}-${c}`, source: from0 as ZoneId, target: c as ZoneId, label: `SXI0C Warp-born ${from0}->${c}`,
              flux: mean('flux'), permeability: mean('permeability'), isOpen: true, resistance: mean('resistance') });
          }
          const forced = Array(10).fill(0); forced[c] = FLIGHT / 0.9;
          attended = { ...attended, attentionVector: forced };
          const last = encounterDecisions.at(-1)!; last.attentionVector = forced; last.reason += ` LINE_OF_FLIGHT ${from0}->${c} (Warp intensity ${this.warpIntensity}).`;
          this.flights++;
        }
      }
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
        + (this.nd ? z.activation - this.base[target] : z.activation) * this.fieldWeight + Math.cos(z.phaseAngle) * 0.1
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
    if (this.nd) this.ndAdapt(zones);
    s.currentZone = to;
    this.warpIntensity = this.warp.has(to) && !(attended && (attended.attentionVector[to] ?? 0) >= FLIGHT / 0.9) ? this.warpIntensity + 1 : 0;
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
      timestamp: s.stepCount,   // SXI0C: deterministic snapshot time, so ledgers are re-derivable
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

}

