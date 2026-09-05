/**
 * ProcessFieldMemory.ts
 *
 * Implements the Constitutive Process Field Memory (PFM) substrate component.
 * Represents memory as a constitutive deformation field across the 10 Numogram zones
 * rather than passive static recall.
 *
 * APIs:
 *  - append(event): Appends conditioning event and updates constitutive strain tensor
 *  - hydrate(events): Hydrates complete historical trace (D=0 up to D=1152) into the field
 *  - readMemoryBias(): Computes active zone-specific deformation bias vector [-1, 1]^10
 *  - getConstitutiveDeformationTensor(): Returns current 10-dimensional strain tensor
 *  - exportHistoryDigest(): Returns cryptographic SHA-256 digest of entire memory trace
 */

import { computeShaDigest } from '../../lib/hashUtils';
import { ZoneId } from '../../types/amelia';

export interface PFMRecord {
  blockIndex: number;
  depth: number;
  targetZone: ZoneId | number;
  fluxDelta: number;
  phaseCoherence: number;
  strainRelaxation: number;
  eventDigest: string;
  timestamp: number;
}

export class ProcessFieldMemory {
  private history: PFMRecord[] = [];
  private constitutiveStrainTensor: number[] = new Array(10).fill(0.0);
  private memoryHysteresisTension: number = 0.0;
  private memoryTraceDigest: string = '0'.repeat(64);

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.history = [];
    this.constitutiveStrainTensor = new Array(10).fill(0.0);
    this.memoryHysteresisTension = 0.0;
    this.memoryTraceDigest = computeShaDigest(JSON.stringify([]));
  }

  /**
   * Appends an event to the constitutive memory field and deforms the zone strain tensor.
   */
  public append(record: PFMRecord): void {
    this.history.push(record);
    const zIdx = Math.max(0, Math.min(9, Math.floor(record.targetZone)));

    // Cumulative plastic deformation with saturation damping
    this.constitutiveStrainTensor[zIdx] = Math.min(
      1.0,
      this.constitutiveStrainTensor[zIdx] + record.fluxDelta * 0.012 + record.strainRelaxation * 0.008
    );

    // Cross-syzygy paired tension
    const syzygyPair = (9 - zIdx) % 10;
    this.constitutiveStrainTensor[syzygyPair] = Math.max(
      0.0,
      this.constitutiveStrainTensor[syzygyPair] * 0.985 + record.phaseCoherence * 0.003
    );

    // Calculate memory hysteresis tension
    const totalStrain = this.constitutiveStrainTensor.reduce((a, b) => a + b, 0);
    this.memoryHysteresisTension = Number((totalStrain / 10).toFixed(5));

    // Update ongoing memory trace digest
    this.memoryTraceDigest = computeShaDigest(
      this.memoryTraceDigest + record.eventDigest
    );
  }

  /**
   * Hydrates a complete sequence of historical conditioning records into the substrate.
   */
  public hydrate(records: PFMRecord[]): void {
    this.reset();
    for (const r of records) {
      this.append(r);
    }
  }

  /**
   * Read API: Computes active zone-specific deformation bias vector [10]
   * Directly consumed by the runtime phase dynamics step.
   */
  public readMemoryBias(): {
    biasVector: number[];
    hysteresisTension: number;
    historyLength: number;
    dominantDeformedZone: ZoneId;
  } {
    let maxStrain = -1;
    let dominantZone: ZoneId = 0;

    const biasVector = this.constitutiveStrainTensor.map((strain, idx) => {
      if (strain > maxStrain) {
        maxStrain = strain;
        dominantZone = idx as ZoneId;
      }
      // Nonlinear memory pull toward historical trajectory
      return Number((Math.tanh(strain * 1.8) * 0.35).toFixed(4));
    });

    return {
      biasVector,
      hysteresisTension: this.memoryHysteresisTension,
      historyLength: this.history.length,
      dominantDeformedZone: dominantZone,
    };
  }

  public getHistory(): PFMRecord[] {
    return this.history;
  }

  public getConstitutiveDeformationTensor(): number[] {
    return [...this.constitutiveStrainTensor];
  }

  public exportHistoryDigest(): string {
    return this.memoryTraceDigest;
  }
}
