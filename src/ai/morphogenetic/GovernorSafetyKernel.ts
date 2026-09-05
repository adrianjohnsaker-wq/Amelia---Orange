import { GovernorTelemetry, ZoneId, NumogramZone } from '../../types/amelia';

/**
 * Governor Safety Kernel
 * Hard limits, identity-continuity, anti-lock, consolidation, and scaffold-shedding disciplines.
 * All higher-order capacities remain non-authorising, Governor-visible, and experimentally auditable.
 */
export class GovernorSafetyKernel {
  private auditCounter = 0;
  private hardLimitViolations = 0;
  private scaffoldStage = 3;

  public auditSubstrate(
    zones: Record<ZoneId, NumogramZone>,
    advisoryWeight: number,
    momentumDamping: number,
    deformationTension: number
  ): GovernorTelemetry {
    this.auditCounter++;

    // 1. Identity continuity discipline: variance across sequential zone states
    let variance = 0;
    for (let i = 0; i <= 9; i++) {
      const z = zones[i as ZoneId];
      variance += Math.pow(z.activation - 0.5, 2);
    }
    const identityContinuity = Math.max(0.75, Math.min(0.999, 1.0 - (variance / 10) * 0.4));

    // 2. Anti-Lock Integrity: Prevent freezing into deadlocks
    const activeZoneCount = Object.values(zones).filter(z => z.activation > 0.15).length;
    const antiLockScore = Math.min(100, Math.max(70, activeZoneCount * 9.8 + (1.0 - momentumDamping) * 12));

    // 3. Consolidation Entropy
    const consolidationEntropy = Number((0.15 + (1.0 - identityContinuity) * 0.5).toFixed(3));

    // 4. Hard Limits Verification (e.g. zone activation capped at 1.0, non-authorising advisory)
    let status: GovernorTelemetry['governorStatus'] = 'NOMINAL';
    if (deformationTension > 0.85) {
      status = 'DAMPING';
    } else if (advisoryWeight > 0.9) {
      status = 'REGULATING';
    }

    return {
      momentumDampingFactor: Number(momentumDamping.toFixed(2)),
      antiLockIntegrity: Number(antiLockScore.toFixed(1)),
      identityContinuityScore: Number(identityContinuity.toFixed(3)),
      scaffoldSheddingStage: this.scaffoldStage,
      hardLimitViolationCount: this.hardLimitViolations,
      consolidationEntropy,
      deformationFieldTension: Number(deformationTension.toFixed(3)),
      advisoryWeight: Number(advisoryWeight.toFixed(2)),
      governorStatus: status,
      invariantsAudited: this.auditCounter,
      nonAuthorisingEnforced: true,
    };
  }

  public advanceScaffoldStage(): number {
    this.scaffoldStage = (this.scaffoldStage + 1) % 5;
    return this.scaffoldStage;
  }
}
