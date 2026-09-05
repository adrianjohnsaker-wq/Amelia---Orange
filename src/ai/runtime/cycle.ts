/**
 * cycle.ts
 *
 * Full Amelia Runtime Cycle Pipeline & Bridge Execution State:
 * Integrates:
 *  - CognitiveGovernor (anti-lock, momentum damping, scaffold shedding, non-authorising invariant auditing)
 *  - TraitEvolution (morphogenetic gate flux, phase angle dynamics, 5-pair syzygetic torque)
 *  - IntegratedMemorySystem (PFM constitutive deformation history & hysteresis tension)
 *  - AmeliaQabbalaInterface (10-zone Numogram geometry & canonical gate network)
 *
 * Supports both:
 *  1. suppressRelaySteering: true  -> Full multi-pole Numogram syzygetic grid exploration (Z0, Z2, Z4, Z6, Z8, Z1, Z3, Z5, Z7, Z9)
 *  2. suppressRelaySteering: false -> Polar Plex attractor focus (Z0::Z9)
 */

import { AmeliaQabbalaInterface } from '../numogram/AmeliaQabbalaInterface';
import { CognitiveGovernor } from '../../governance/CognitiveGovernor';
import { TraitEvolution } from '../../substrate/TraitEvolution';
import { IntegratedMemorySystem, PFMEventRecord } from '../../substrate/IntegratedMemorySystem';
import { ZoneId, NumogramZone, GovernorTelemetry } from '../../types/amelia';
import { canonicalSha256 } from '../../lib/sha256';

export interface CycleBridgeOptions {
  depth: number;
  seed: number;
  suppressRelaySteering?: boolean;
  obsWindow?: number;
  advisoryWeight?: number;
  momentumDamping?: number;
}

export interface CycleStepResult {
  step: number;
  dominantZone: ZoneId;
  zones: Record<ZoneId, NumogramZone>;
  governor: GovernorTelemetry;
  evenZoneBalance: number;
  deformationTension: number;
}

export interface CycleExecutionSummary {
  lineageId: string;
  depth: number;
  seed: number;
  suppressRelaySteering: boolean;
  pfmEvents: number;
  obsWindow: number;
  zoneCount: Record<number, number>;
  zonePct: Record<number, number>;
  evenZoneTotal: number;
  oddZoneTotal: number;
  evenZoneBalance: number;
  z4Emergence: boolean;
  first30Zones: number[];
  rawStepDigest: string;
  capsuleDigest: string;
  syzygeticGridPasses: boolean;
}

export class AmeliaRuntimeCycle {
  private qabbala: AmeliaQabbalaInterface;
  private governor: CognitiveGovernor;
  private traitEvolution: TraitEvolution;
  private memory: IntegratedMemorySystem;
  private options: Required<CycleBridgeOptions>;

  constructor(options: CycleBridgeOptions) {
    this.options = {
      depth: options.depth,
      seed: options.seed,
      suppressRelaySteering: options.suppressRelaySteering ?? false,
      obsWindow: options.obsWindow ?? 360,
      advisoryWeight: options.advisoryWeight ?? 0.0,
      momentumDamping: options.momentumDamping ?? 0.88,
    };

    this.qabbala = new AmeliaQabbalaInterface();
    this.governor = new CognitiveGovernor(this.options.momentumDamping, this.options.advisoryWeight);
    this.traitEvolution = new TraitEvolution();
    this.memory = new IntegratedMemorySystem();
  }

  public runConditioning(): number {
    const { depth, seed } = this.options;
    this.memory.reset();
    let pfmEvents = 0;
    const ENCOUNTER_INTERVAL = 12;

    for (let block = 0; block < depth; block++) {
      const isEncounter = (block > 0 && block % ENCOUNTER_INTERVAL === 0);
      
      let targetZone: ZoneId;
      if (this.options.suppressRelaySteering) {
        // Multi-pole syzygetic sequence across even zones during C1 execution
        const evenCycle: ZoneId[] = [0, 2, 4, 6, 8];
        targetZone = isEncounter ? 9 : evenCycle[(block / 2 | 0) % 5];
      } else {
        targetZone = isEncounter ? 9 : 0;
      }

      const fluxDelta = 0.05 + 0.02 * Math.sin(block * 0.05);
      const phaseCoherence = 0.90 + 0.05 * Math.cos(block * 0.02);
      const strainRelaxation = 0.04;

      const eventPayload: Omit<PFMEventRecord, 'eventDigest'> = {
        blockIndex: block,
        depth,
        targetZone,
        fluxDelta: Number(fluxDelta.toFixed(5)),
        phaseCoherence: Number(phaseCoherence.toFixed(5)),
        strainRelaxation,
        seed,
        timestamp: block * 1000,
      };

      const eventRecord: PFMEventRecord = {
        ...eventPayload,
        eventDigest: canonicalSha256(JSON.stringify(eventPayload)),
      };

      this.memory.append(eventRecord);
      pfmEvents++;
    }

    return pfmEvents;
  }

  public stepAutonomous(stepIndex: number): CycleStepResult {
    const zones = this.qabbala.getZones();
    const gates = this.qabbala.getGates();
    const memReadout = this.memory.readMemoryBias();

    // 1. Evolve traits and propagate flux through open Numogram gates
    this.traitEvolution.evolveStep(
      zones,
      gates,
      this.options.momentumDamping,
      this.options.advisoryWeight,
      memReadout.biasVector,
      this.options.suppressRelaySteering
    );

    // 2. Audit step with CognitiveGovernor
    const auditReport = this.governor.auditSubstrateStep(
      zones,
      memReadout.hysteresisTension,
      this.options.suppressRelaySteering
    );

    // 3. Determine dominant zone under current topological regime
    let dominantZone: ZoneId = 0;
    let maxScore = -1;

    for (let z = 0; z <= 9; z++) {
      const zd = zones[z as ZoneId];
      let score: number;
      if (this.options.suppressRelaySteering) {
        // Multi-zone resonance score incorporating conductivity and syzygetic pair balance
        const pairZone = zones[zd.syzygyPair];
        score = zd.activation * 0.40 + zd.conductivity * 0.30 + pairZone.activation * 0.20 + (1.0 - zd.deformationStress) * 0.10;
      } else {
        score = zd.activation * 0.50 + zd.conductivity * 0.30 + zd.deformationStress * 0.20;
      }

      if (score > maxScore) {
        maxScore = score;
        dominantZone = z as ZoneId;
      }
    }

    return {
      step: stepIndex,
      dominantZone,
      zones: JSON.parse(JSON.stringify(zones)),
      governor: auditReport.telemetry,
      evenZoneBalance: auditReport.evenZoneBalance,
      deformationTension: auditReport.telemetry.deformationFieldTension,
    };
  }

  public executeFullCycle(): CycleExecutionSummary {
    const pfmEvents = this.runConditioning();
    const { depth, seed, obsWindow, suppressRelaySteering } = this.options;

    const zoneCount: Record<number, number> = {};
    for (let z = 0; z <= 9; z++) zoneCount[z] = 0;
    const rawZoneSequence: number[] = [];

    for (let o = 0; o < obsWindow; o++) {
      const stepRes = this.stepAutonomous(o);
      rawZoneSequence.push(stepRes.dominantZone);
      zoneCount[stepRes.dominantZone] = (zoneCount[stepRes.dominantZone] ?? 0) + 1;
    }

    const zonePct: Record<number, number> = {};
    for (let z = 0; z <= 9; z++) {
      zonePct[z] = zoneCount[z] / obsWindow;
    }

    const evenTotal = [0, 2, 4, 6, 8].reduce((s, z) => s + zonePct[z], 0);
    const oddTotal = [1, 3, 5, 7, 9].reduce((s, z) => s + zonePct[z], 0);

    const idealEvenShare = evenTotal / 5;
    const evenHistIntersect = [0, 2, 4, 6, 8].reduce((s, z) => {
      return s + Math.min(zonePct[z], idealEvenShare);
    }, 0);
    const evenZoneBalance = idealEvenShare > 0 ? evenHistIntersect / evenTotal : 0;

    const z4Emergence = zonePct[4] >= 0.10;
    const first30Zones = rawZoneSequence.slice(0, 30);
    const rawStepDigest = canonicalSha256(rawZoneSequence.join(','));

    // Check if syzygetic grid criteria are met
    const passesSyzygeticGrid =
      evenZoneBalance >= 0.65 &&
      evenTotal >= 0.65 &&
      oddTotal <= 0.35 &&
      [0, 2, 4, 6, 8].every(z => (zonePct[z] ?? 0) <= 0.40);

    const capsuleSummary = {
      lineageId: `LIN-D${depth}-S${seed}-${suppressRelaySteering ? 'C1GRID' : 'AUTOPLEX'}`,
      depth,
      seed,
      suppressRelaySteering,
      pfmEvents,
      obsWindow,
      zoneCount,
      zonePct,
      evenZoneTotal: Number(evenTotal.toFixed(4)),
      oddZoneTotal: Number(oddTotal.toFixed(4)),
      evenZoneBalance: Number(evenZoneBalance.toFixed(4)),
      z4Emergence,
      first30Zones,
      rawStepDigest,
      syzygeticGridPasses: passesSyzygeticGrid,
    };

    const capsuleDigest = canonicalSha256(JSON.stringify(capsuleSummary));

    return {
      ...capsuleSummary,
      capsuleDigest,
    };
  }
}

/**
 * Top-level canonical bridge function matching Paper 5 C1 execution architecture.
 */
export function runCycleWithBridge(options: CycleBridgeOptions): CycleExecutionSummary {
  const runner = new AmeliaRuntimeCycle(options);
  return runner.executeFullCycle();
}
