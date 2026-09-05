/**
 * IntegratedMemorySystem.ts
 *
 * Full Process Field Memory (PFM) integration with constitutive deformation:
 * - Tracks encounter events, phase coherence, strain relaxation, and memory bias across 10 zones
 * - Calculates hysteresis tension tensor and deformation history vectors
 * - Provides memory bias readout to steer or relax Numogrammatic zone trajectories
 * - Ensures auditability and zero-data loss across sessions
 */

import { ZoneId } from '../types/amelia';
import { canonicalSha256 } from '../lib/sha256';

export interface PFMEventRecord {
  blockIndex: number;
  depth: number;
  targetZone: ZoneId | number;
  fluxDelta: number;
  phaseCoherence: number;
  strainRelaxation: number;
  seed?: number;
  eventDigest: string;
  timestamp: number;
}

export interface MemoryReadout {
  biasVector: number[];
  hysteresisTension: number;
  dominantDeformedZone: ZoneId;
  historyLength: number;
  meanPhaseCoherence: number;
}

export class IntegratedMemorySystem {
  private events: PFMEventRecord[] = [];
  private zoneStrainHistory: number[] = new Array(10).fill(0.0);
  private hysteresisTension: number = 0.05;
  private cachedDigest: string | null = null;

  public append(event: PFMEventRecord): void {
    this.cachedDigest = null;
    const formattedEvent: PFMEventRecord = {
      ...event,
      seed: event.seed ?? 0,
    };
    this.events.push(formattedEvent);

    // Update strain history
    const z = event.targetZone;
    this.zoneStrainHistory[z] = Math.min(
      1.0,
      this.zoneStrainHistory[z] * (1.0 - event.strainRelaxation) + event.fluxDelta * 1.5
    );

    // Dynamic hysteresis tension accumulation
    this.hysteresisTension = Math.min(
      0.95,
      this.hysteresisTension * 0.96 + (1.0 - event.phaseCoherence) * 0.15 + event.fluxDelta * 0.10
    );
  }

  public readMemoryBias(): MemoryReadout {
    const biasVector: number[] = new Array(10).fill(0);
    let maxStrain = -1;
    let dominantZone: ZoneId = 0;
    let totalCoherence = 0;

    const recentEvents = this.events.slice(-48);
    for (const ev of recentEvents) {
      biasVector[ev.targetZone] += ev.fluxDelta * ev.phaseCoherence * 0.12;
      totalCoherence += ev.phaseCoherence;
    }

    for (let i = 0; i <= 9; i++) {
      biasVector[i] = Number((biasVector[i] + this.zoneStrainHistory[i] * 0.08).toFixed(4));
      if (this.zoneStrainHistory[i] > maxStrain) {
        maxStrain = this.zoneStrainHistory[i];
        dominantZone = i as ZoneId;
      }
    }

    const meanPhaseCoherence = recentEvents.length > 0
      ? totalCoherence / recentEvents.length
      : 0.95;

    return {
      biasVector,
      hysteresisTension: Number(this.hysteresisTension.toFixed(4)),
      dominantDeformedZone: dominantZone,
      historyLength: this.events.length,
      meanPhaseCoherence: Number(meanPhaseCoherence.toFixed(4)),
    };
  }

  public getEvents(): PFMEventRecord[] {
    return this.events;
  }

  public getHistory(): PFMEventRecord[] {
    return this.events;
  }

  public exportHistoryDigest(): string {
    return this.computeMemoryDigest();
  }

  public exportState(): { events: PFMEventRecord[]; zoneStrainHistory: number[]; hysteresisTension: number } {
    return {
      events: JSON.parse(JSON.stringify(this.events)),
      zoneStrainHistory: [...this.zoneStrainHistory],
      hysteresisTension: this.hysteresisTension,
    };
  }

  public importState(state: { events: PFMEventRecord[]; zoneStrainHistory?: number[]; hysteresisTension?: number }): void {
    this.cachedDigest = null;
    this.events = JSON.parse(JSON.stringify(state.events || []));
    this.zoneStrainHistory = state.zoneStrainHistory ? [...state.zoneStrainHistory] : new Array(10).fill(0.0);
    this.hysteresisTension = typeof state.hysteresisTension === 'number' ? state.hysteresisTension : 0.05;
  }

  public reset(): void {
    this.cachedDigest = null;
    this.events = [];
    this.zoneStrainHistory = new Array(10).fill(0.0);
    this.hysteresisTension = 0.05;
  }

  public computeMemoryDigest(): string {
    if (!this.cachedDigest) {
      this.cachedDigest = canonicalSha256(JSON.stringify(this.events.map(e => e.eventDigest)));
    }
    return this.cachedDigest;
  }
}
