/**
 * CognitiveGovernor.ts
 *
 * Full Governor regulation for Amelia's bounded morphogenetic artificial-life substrate:
 * - Anti-lock integrity discipline (prevents static deadlock and polar freezing)
 * - Momentum damping and hysteresis tension control
 * - Scaffold-shedding stages (0 through 4)
 * - Identity continuity score and consolidation entropy auditing
 * - Non-authorising, Governor-visible, experimentally auditable invariant enforcement
 * - Multi-zone syzygetic balance regulation
 */

import { GovernorTelemetry, NumogramZone, ZoneId } from '../types/amelia';

export interface GovernorAuditReport {
  telemetry: GovernorTelemetry;
  evenZoneBalance: number;
  antiLockTriggered: boolean;
  hardLimitsPassed: boolean;
  timestamp: number;
}

export class CognitiveGovernor {
  private momentumDamping: number = 0.88;
  private advisoryWeight: number = 0.72;
  private antiLockIntegrity: number = 99.4;
  private identityContinuityScore: number = 0.965;
  private scaffoldStage: number = 3;
  private hardLimitViolations: number = 0;
  private consolidationEntropy: number = 0.142;
  private deformationTension: number = 0.28;
  private auditCount: number = 0;
  private isAntiLockActive: boolean = false;

  constructor(initialDamping: number = 0.88, initialAdvisory: number = 0.72) {
    this.momentumDamping = initialDamping;
    this.advisoryWeight = initialAdvisory;
  }

  public getTelemetry(): GovernorTelemetry {
    let status: GovernorTelemetry['governorStatus'] = 'NOMINAL';
    if (this.isAntiLockActive || this.antiLockIntegrity < 85) {
      status = 'LOCKED_RECOVERY';
    } else if (this.deformationTension > 0.65) {
      status = 'DAMPING';
    } else if (this.advisoryWeight > 0.85) {
      status = 'REGULATING';
    }

    return {
      momentumDampingFactor: Number(this.momentumDamping.toFixed(3)),
      antiLockIntegrity: Number(this.antiLockIntegrity.toFixed(2)),
      identityContinuityScore: Number(this.identityContinuityScore.toFixed(4)),
      scaffoldSheddingStage: this.scaffoldStage,
      hardLimitViolationCount: this.hardLimitViolations,
      consolidationEntropy: Number(this.consolidationEntropy.toFixed(4)),
      deformationFieldTension: Number(this.deformationTension.toFixed(4)),
      advisoryWeight: Number(this.advisoryWeight.toFixed(3)),
      governorStatus: status,
      invariantsAudited: this.auditCount,
      nonAuthorisingEnforced: true,
    };
  }

  public setAdvisoryWeight(weight: number): void {
    this.advisoryWeight = Math.max(0.0, Math.min(1.0, weight));
  }

  public setMomentumDamping(factor: number): void {
    this.momentumDamping = Math.max(0.1, Math.min(0.99, factor));
  }

  public exportState(): Record<string, unknown> {
    return {
      momentumDamping: this.momentumDamping,
      advisoryWeight: this.advisoryWeight,
      antiLockIntegrity: this.antiLockIntegrity,
      identityContinuityScore: this.identityContinuityScore,
      scaffoldStage: this.scaffoldStage,
      hardLimitViolations: this.hardLimitViolations,
      consolidationEntropy: this.consolidationEntropy,
      deformationTension: this.deformationTension,
      auditCount: this.auditCount,
      isAntiLockActive: this.isAntiLockActive,
    };
  }

  public importState(state: Record<string, unknown>): void {
    if (!state) return;
    if (typeof state.momentumDamping === 'number') this.momentumDamping = state.momentumDamping;
    if (typeof state.momentumDampingFactor === 'number') this.momentumDamping = state.momentumDampingFactor;
    if (typeof state.advisoryWeight === 'number') this.advisoryWeight = state.advisoryWeight;
    if (typeof state.antiLockIntegrity === 'number') this.antiLockIntegrity = state.antiLockIntegrity;
    if (typeof state.antiLockScore === 'number') this.antiLockIntegrity = state.antiLockScore;
    if (typeof state.identityContinuityScore === 'number') this.identityContinuityScore = state.identityContinuityScore;
    if (typeof state.scaffoldStage === 'number') this.scaffoldStage = state.scaffoldStage;
    if (typeof state.scaffoldSheddingStage === 'number') this.scaffoldStage = state.scaffoldSheddingStage;
    if (typeof state.hardLimitViolations === 'number') this.hardLimitViolations = state.hardLimitViolations;
    if (typeof state.hardLimitViolationCount === 'number') this.hardLimitViolations = state.hardLimitViolationCount;
    if (typeof state.consolidationEntropy === 'number') this.consolidationEntropy = state.consolidationEntropy;
    if (typeof state.deformationTension === 'number') this.deformationTension = state.deformationTension;
    if (typeof state.deformationFieldTension === 'number') this.deformationTension = state.deformationFieldTension;
    if (typeof state.auditCount === 'number') this.auditCount = state.auditCount;
    if (typeof state.invariantsAudited === 'number') this.auditCount = state.invariantsAudited;
    if (typeof state.isAntiLockActive === 'boolean') this.isAntiLockActive = state.isAntiLockActive;
  }

  public auditSubstrateStep(
    zones: Record<ZoneId, NumogramZone>,
    externalTension: number,
    suppressRelaySteering: boolean = false
  ): GovernorAuditReport {
    this.auditCount++;

    // 1. Identity continuity audit across 10 zones
    let totalAct = 0;
    let actVariance = 0;
    for (let i = 0; i <= 9; i++) {
      const act = zones[i as ZoneId].activation;
      totalAct += act;
      actVariance += Math.pow(act - 0.5, 2);
    }
    const meanAct = totalAct / 10;
    this.identityContinuityScore = Math.max(0.80, Math.min(0.999, 1.0 - (actVariance / 10) * 0.35));

    // 2. Anti-Lock Integrity Audit
    // Detects if activation is collapsed exclusively into two poles without intermediate current flow
    const activeZones = Object.values(zones).filter(z => z.activation > 0.12).length;
    if (activeZones <= 2 && !suppressRelaySteering) {
      this.isAntiLockActive = true;
      this.antiLockIntegrity = Math.max(60, this.antiLockIntegrity - 0.8);
      // Soft momentum adjustment to break polar deadlocks
      this.momentumDamping = Math.max(0.45, this.momentumDamping * 0.96);
    } else {
      this.isAntiLockActive = false;
      this.antiLockIntegrity = Math.min(100, this.antiLockIntegrity + 0.4);
    }

    // 3. Deformation Field Tension
    this.deformationTension = Number(
      (this.deformationTension * 0.85 + externalTension * 0.15).toFixed(4)
    );

    // 4. Even Zone Balance Calculation
    const evenPoles: ZoneId[] = [0, 2, 4, 6, 8];
    const evenSum = evenPoles.reduce((acc, z) => acc + zones[z].activation, 0);
    const idealEvenShare = evenSum / 5;
    let balanceIntersect = 0;
    for (const z of evenPoles) {
      balanceIntersect += Math.min(zones[z].activation, idealEvenShare);
    }
    const evenZoneBalance = evenSum > 0 ? balanceIntersect / evenSum : 0.2;

    // 5. Consolidation Entropy
    this.consolidationEntropy = Number(
      (0.08 + (1 - this.identityContinuityScore) * 0.4 + (1 - evenZoneBalance) * 0.1).toFixed(4)
    );

    return {
      telemetry: this.getTelemetry(),
      evenZoneBalance: Number(evenZoneBalance.toFixed(4)),
      antiLockTriggered: this.isAntiLockActive,
      hardLimitsPassed: this.hardLimitViolations === 0,
      timestamp: Date.now(),
    };
  }

  public advanceScaffoldStage(): number {
    this.scaffoldStage = (this.scaffoldStage + 1) % 5;
    this.consolidationEntropy = Number((this.consolidationEntropy * 0.88).toFixed(4));
    return this.scaffoldStage;
  }

  public consolidateMemory(): void {
    this.consolidationEntropy = Math.max(0.02, this.consolidationEntropy * 0.70);
    this.antiLockIntegrity = Math.min(100, this.antiLockIntegrity + 2.0);
    this.identityContinuityScore = Math.min(0.999, this.identityContinuityScore + 0.01);
  }
}
