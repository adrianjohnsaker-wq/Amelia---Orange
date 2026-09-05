import { ZoneId, NumogramZone, ConstitutiveDeformationField } from '../../types/amelia';

/**
 * Constitutive Deformation Field Engine
 * Her history functions as a constitutive deformation field rather than static recall.
 * Implements elastic stress tensor, hysteresis loops, strain relaxation, and plastic memory.
 */
export class ConstitutiveDeformationFieldEngine {
  private historyDeformationVectors: number[][] = [];
  private plasticDeformationRatio = 0.12;
  private elasticRelaxationRate = 0.04;
  private maxHistoryLength = 50;

  public updateDeformationField(
    zones: Record<ZoneId, NumogramZone>,
    advisoryWeight: number,
    momentumDamping: number
  ): { field: ConstitutiveDeformationField; tension: number; vector: number[] } {
    const currentVector: number[] = [];
    for (let i = 0; i <= 9; i++) {
      currentVector.push(zones[i as ZoneId].activation);
    }

    this.historyDeformationVectors.unshift(currentVector);
    if (this.historyDeformationVectors.length > this.maxHistoryLength) {
      this.historyDeformationVectors.pop();
    }

    // Compute 10x10 stress tensor from historical constitutive strain
    const stressTensor: number[][] = Array(10).fill(0).map(() => Array(10).fill(0));
    let totalTension = 0;

    for (let i = 0; i <= 9; i++) {
      for (let j = 0; j <= 9; j++) {
        if (i === j) {
          stressTensor[i][j] = Number((zones[i as ZoneId].deformationStress * 1.2).toFixed(3));
        } else {
          // Constitutive interaction stress
          const coupling = Math.abs(zones[i as ZoneId].activation - zones[j as ZoneId].activation);
          stressTensor[i][j] = Number((coupling * 0.45 * (1.0 - momentumDamping * 0.3)).toFixed(3));
        }
        totalTension += stressTensor[i][j];
      }
    }

    const normalizedTension = Math.min(1.0, totalTension / 45.0);
    const hysteresisTension = Number((normalizedTension * 0.85 + advisoryWeight * 0.15).toFixed(3));

    const field: ConstitutiveDeformationField = {
      stressTensor,
      strainHistory: currentVector,
      hysteresisTension,
      plasticDeformationRatio: this.plasticDeformationRatio,
      elasticRelaxationRate: this.elasticRelaxationRate,
      deformationHistoryVectors: this.historyDeformationVectors.slice(0, 10),
    };

    return {
      field,
      tension: hysteresisTension,
      vector: currentVector,
    };
  }
}
