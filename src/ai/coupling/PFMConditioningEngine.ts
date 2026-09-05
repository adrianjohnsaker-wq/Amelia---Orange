/**
 * PFMConditioningEngine.ts
 *
 * Implements the Process-Formation Memory (PFM) Conditioning Protocol.
 * Directly interfaces with the live AmeliaNumogramSubstrateRuntime.
 * Appends each PFMRecord into runtime.getMemory() prior to runtime.step() consumption.
 * Supports targeted conditioning (e.g. Zone-9, or Neutral uniform/alternating conditioning).
 */

import { computeShaDigest } from '../../lib/hashUtils';
import { AmeliaNumogramSubstrateRuntime } from '../../substrate/ameliaNumogramSubstrateRuntime';
import { ZoneId } from '../../types/amelia';
import { PFMRecord } from './ProcessFieldMemory';

export interface PFMEvent {
  blockIndex: number;
  depth: number;
  targetZone: number;
  fluxDelta: number;
  phaseCoherence: number;
  strainRelaxation: number;
  eventDigest: string;
}

export interface PFMSnapshot {
  depth: number;
  seed: number;
  arm: 'Z9' | 'NEUTRAL' | 'D0';
  totalBlocks: number;
  pfmEventsCount: number;
  pfmEvents: PFMEvent[];
  finalCoherence: number;
  preChallengeFieldCoherence: number;
  snapshotDigest: string;
}

export class PFMConditioningEngine {
  private pfmEvents: PFMEvent[] = [];
  private runtime: AmeliaNumogramSubstrateRuntime;

  constructor(runtime?: AmeliaNumogramSubstrateRuntime) {
    this.runtime = runtime ?? new AmeliaNumogramSubstrateRuntime();
  }

  public getRuntime(): AmeliaNumogramSubstrateRuntime {
    return this.runtime;
  }

  /**
   * Integrates a single conditioning block into ProcessFieldMemory and advances runtime dynamics.
   */
  public integrate(blockIndex: number, depth: number, targetZone: number, seed: number): PFMEvent {
    const qabbala = this.runtime.getQabbala();
    const zones = qabbala.getZones();
    const targetZ = zones[targetZone as ZoneId] ?? zones[9];

    // Read pre-step state
    const syzygyCoherence = qabbala.computeSyzygyCoherence();
    const fluxDelta = targetZ?.activation ?? 0.5;
    const phaseCoherence = syzygyCoherence;
    const strainRelaxation = targetZ?.deformationStress ?? 0.1;

    const eventPayload = {
      blockIndex,
      depth,
      targetZone,
      fluxDelta: Number(fluxDelta.toFixed(5)),
      phaseCoherence: Number(phaseCoherence.toFixed(5)),
      strainRelaxation: Number(strainRelaxation.toFixed(5)),
      seed,
    };

    const eventDigest = computeShaDigest(JSON.stringify(eventPayload));

    const record: PFMRecord = {
      blockIndex,
      depth,
      targetZone,
      fluxDelta: eventPayload.fluxDelta,
      phaseCoherence: eventPayload.phaseCoherence,
      strainRelaxation: eventPayload.strainRelaxation,
      eventDigest,
      timestamp: Date.now(),
    };

    // 1. Append to runtime ProcessFieldMemory BEFORE step
    this.runtime.getMemory().append(record);

    // 2. Drive live runtime step (which consumes updated memory bias)
    this.runtime.step();

    const event: PFMEvent = {
      blockIndex,
      depth,
      targetZone,
      fluxDelta: eventPayload.fluxDelta,
      phaseCoherence: eventPayload.phaseCoherence,
      strainRelaxation: eventPayload.strainRelaxation,
      eventDigest,
    };

    this.pfmEvents.push(event);
    return event;
  }

  /**
   * Executes conditioning for depth D, seed S, and specified arm ('Z9' | 'NEUTRAL').
   */
  public runConditioning(
    depth: number,
    seed: number,
    arm: 'Z9' | 'NEUTRAL' | 'D0' = 'Z9'
  ): PFMSnapshot {
    this.pfmEvents = [];
    this.runtime.getMemory().reset();

    // Seed/orient runtime phase dynamics
    this.runtime.setMomentumDamping(0.88 + (seed % 10) * 0.005);
    this.runtime.setAdvisoryWeight(0.70 + (seed % 7) * 0.02);

    // Baseline step
    this.runtime.step();
    const initialCoherence = this.runtime.getQabbala().computeSyzygyCoherence();

    // Conditioning block loop: 1:1 ratio
    for (let block = 0; block < depth; block++) {
      let targetZone = 9;
      if (arm === 'NEUTRAL') {
        // Neutral arm distributes conditioning uniformly across all 10 zones
        targetZone = (block + seed) % 10;
      }
      this.integrate(block, depth, targetZone, seed);
    }

    const finalCoherence = this.runtime.getQabbala().computeSyzygyCoherence();
    const preChallengeFC = depth === 0
      ? Number(initialCoherence.toFixed(4))
      : Number(finalCoherence.toFixed(4));

    const snapshotPayload = {
      depth,
      seed,
      arm,
      totalBlocks: depth,
      pfmEventsCount: this.pfmEvents.length,
      preChallengeFieldCoherence: preChallengeFC,
      finalCoherence: Number(finalCoherence.toFixed(4)),
      lastEventDigest: this.pfmEvents[this.pfmEvents.length - 1]?.eventDigest ?? 'NONE',
    };

    const snapshotDigest = computeShaDigest(JSON.stringify(snapshotPayload));

    return {
      depth,
      seed,
      arm,
      totalBlocks: depth,
      pfmEventsCount: this.pfmEvents.length,
      pfmEvents: this.pfmEvents,
      finalCoherence: Number(finalCoherence.toFixed(4)),
      preChallengeFieldCoherence: preChallengeFC,
      snapshotDigest,
    };
  }

  public static verifyCanaryD288(seed: number = 101): PFMSnapshot {
    const engine = new PFMConditioningEngine();
    return engine.runConditioning(288, seed, 'Z9');
  }
}
