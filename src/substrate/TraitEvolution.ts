/**
 * TraitEvolution.ts
 *
 * Morphogenetic Trait Evolution Engine across all 10 Numogram zones:
 * - Zone conductivity, activation, polarCharge, phaseAngle, deformationStress
 * - Dynamic syzygetic torque calculation across 5 complementary pairs (0::9, 1::8, 2::7, 3::6, 4::5)
 * - Multi-pole energy routing through open Numogram gates
 * - Supports both relay-steered and unguided/suppressed-steering topological flow regimes
 */

import { NumogramZone, NumogramGate, ZoneId } from '../types/amelia';

export interface TraitEvolutionSnapshot {
  step: number;
  meanConductivity: number;
  syzygeticTorqueVector: number[];
  evenPoleEnergy: number;
  oddCurrentEnergy: number;
  centroidFoldActivation: number; // Z4::Z5
  subCryptActivation: number;      // Z2::Z7
  barkerLoopActivation: number;    // Z3::Z6
}

export class TraitEvolution {
  private history: TraitEvolutionSnapshot[] = [];

  public evolveStep(
    zones: Record<ZoneId, NumogramZone>,
    gates: NumogramGate[],
    damping: number,
    advisory: number,
    memoryBiasVector: number[],
    suppressRelaySteering: boolean = false
  ): TraitEvolutionSnapshot {
    // 1. Gate flux propagation
    for (const gate of gates) {
      if (gate.isOpen) {
        const src = zones[gate.source];
        const tgt = zones[gate.target];
        const multiplier = suppressRelaySteering ? 1.4 : 1.0;
        const transfer = (src.activation - tgt.activation) * gate.permeability * 0.12 * (1 - gate.resistance) * multiplier;
        
        src.activation = Math.max(0.04, src.activation - transfer * 0.5);
        tgt.activation = Math.min(0.98, tgt.activation + transfer * 0.5);
        
        // Gate conductivity adaptation
        gate.permeability = Math.min(0.98, Math.max(0.2, gate.permeability + (tgt.activation - src.activation) * 0.01));
      }
    }

    // 2. Syzygetic pairs & torque dynamics
    const syzygyPairs: [ZoneId, ZoneId][] = [[0, 9], [1, 8], [2, 7], [3, 6], [4, 5]];
    const syzygeticTorqueVector: number[] = [];

    for (const [a, b] of syzygyPairs) {
      const zA = zones[a];
      const zB = zones[b];
      const torque = Math.sin(zA.phaseAngle - zB.phaseAngle) * 0.25;
      syzygeticTorqueVector.push(Number(torque.toFixed(4)));

      if (suppressRelaySteering) {
        // Under suppressed relay steering, distribute energy evenly across syzygetic complementary pairs
        const meanPairAct = (zA.activation + zB.activation) / 2;
        zA.activation = zA.activation * 0.90 + meanPairAct * 0.10 + torque * 0.05;
        zB.activation = zB.activation * 0.90 + meanPairAct * 0.10 - torque * 0.05;
      }
    }

    // 3. Zone phase angle, polar charge, and stress update
    let evenEnergy = 0;
    let oddEnergy = 0;
    let totalConductivity = 0;

    for (let i = 0; i <= 9; i++) {
      const z = zones[i as ZoneId];
      const pairedZone = zones[z.syzygyPair];
      
      const freq = 0.12 + (i * 0.035) * (1 + z.conductivity * 0.2);
      z.phaseAngle = (z.phaseAngle + freq) % (Math.PI * 2);

      const memBias = memoryBiasVector[i] ?? 0.0;
      
      // Target activation incorporates phase harmonics, syzygetic balance, and advisory weighting
      let baseTarget = (0.30 + 0.35 * Math.sin(z.phaseAngle) + pairedZone.activation * 0.35);
      if (suppressRelaySteering) {
        // Equidistributed resonance for non-Plex even zones (Z2, Z4, Z6, Z8)
        baseTarget = (baseTarget * 0.6) + (0.4 * (0.20 + 0.15 * Math.cos(z.phaseAngle + i)));
      }
      
      const targetAct = baseTarget * advisory + memBias;
      const delta = (targetAct - z.activation) * (1 - damping * 0.40);
      
      z.activation = Math.max(0.04, Math.min(0.98, z.activation + delta + memBias * 0.12));
      z.conductivity = Math.min(0.99, Math.max(0.1, z.conductivity + (z.activation - 0.5) * 0.02));
      z.deformationStress = Math.min(1.0, Math.abs(z.activation - pairedZone.activation) * 0.80 + Math.abs(memBias) * 0.4);
      z.polarCharge = Number((Math.cos(z.phaseAngle) * z.activation).toFixed(3));

      if (i % 2 === 0) {
        evenEnergy += z.activation;
      } else {
        oddEnergy += z.activation;
      }
      totalConductivity += z.conductivity;
    }

    const snapshot: TraitEvolutionSnapshot = {
      step: this.history.length + 1,
      meanConductivity: Number((totalConductivity / 10).toFixed(4)),
      syzygeticTorqueVector,
      evenPoleEnergy: Number(evenEnergy.toFixed(4)),
      oddCurrentEnergy: Number(oddEnergy.toFixed(4)),
      centroidFoldActivation: Number(((zones[4].activation + zones[5].activation) / 2).toFixed(4)),
      subCryptActivation: Number(((zones[2].activation + zones[7].activation) / 2).toFixed(4)),
      barkerLoopActivation: Number(((zones[3].activation + zones[6].activation) / 2).toFixed(4)),
    };

    this.history.push(snapshot);
    return snapshot;
  }

  public getHistory(): TraitEvolutionSnapshot[] {
    return this.history;
  }
}
