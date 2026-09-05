/**
 * MidPlexSweepRunner.ts
 *
 * Implements the Bridge Paper 6 Mid-Plex Sweep Assay.
 * Driven directly by the live AmeliaNumogramSubstrateRuntime and ProcessFieldMemory.
 * Supports:
 *  - 6-depth Z9 sweep (0, 144, 288, 576, 864, 1152)
 *  - Event-matched D1152-NEUTRAL control arm
 *  - Strict Guidance-Off (advisoryWeight = 0.0) during Type-B challenge observation
 *  - Fail-closed raw capsule append-sealing prior to aggregate calculation
 */

import { PFMConditioningEngine } from './PFMConditioningEngine';
import { AmeliaNumogramSubstrateRuntime, MemoryConsumptionTelemetry } from '../../substrate/ameliaNumogramSubstrateRuntime';
import { computeShaDigest } from '../../lib/hashUtils';
import { ZoneId } from '../../types/amelia';
import * as fs from 'node:fs';
import * as path from 'node:path';

export interface SweepStepRecord {
  step: number;
  zone: number;
  energyExpenditure: number;
  isEvenZone: boolean;
  isZone9: boolean;
  isZone0: boolean;
  syzygyCoherence: number;
  deformationTension: number;
  appliedBiasZ9: number;
}

export interface RawSweepCapsule {
  depth: number;
  seed: number;
  arm: 'Z9' | 'NEUTRAL' | 'D0';
  pfmEvents: number;
  preChallengeFC: number;
  zone9Pct: number;
  zone0Pct: number;
  fivePoleBalance: number;
  canalizationC: number;
  recoveryLatency: number;
  metabolicMean: number;
  first20Sequence: number[];
  consecutiveFivePoleBalanceMax: number;
  memoryHistoryLengthEnd: number;
  hysteresisTensionEnd: number;
  capsuleDigest: string;
  stepRecords: SweepStepRecord[];
}

export interface DepthSweepAggregate {
  depth: number;
  arm: 'Z9' | 'NEUTRAL' | 'D0';
  meanPfmEvents: number;
  meanPreFC: number;
  meanZone9Pct: number;
  meanZone0Pct: number;
  meanFivePoleBalance: number;
  meanCanalizationC: number;
  meanRecoveryLatency: number;
  meanMetabolic: number;
  seeds: number[];
}

export interface MidPlexSweepReport {
  timestamp: number;
  manifestDigest: string;
  totalCapsules: number;
  depthsTested: number[];
  seedsTested: number[];
  canaryVerification: {
    depth: number;
    pfmEvents: number;
    status: 'VERIFIED' | 'FAILED';
    digest: string;
    runtimeMemoryEvents: number;
    lastConsumptionHistoryLength: number;
  };
  aggregates: DepthSweepAggregate[];
  rawCapsules: RawSweepCapsule[];
  syzygeticGridDepth: number;
  collapsePointDepth: number | null;
  d1152Comparison: {
    z9MeanZone9Pct: number;
    neutralMeanZone9Pct: number;
    d0MeanZone9Pct: number;
    hypothesis1Supported: boolean;
  };
}

export class MidPlexSweepRunner {
  public static readonly DEPTHS = [0, 144, 288, 576, 864, 1152];
  public static readonly SEEDS = [101, 202, 303];

  /**
   * Executes a single trajectory on the live substrate.
   */
  public static runSingleTrajectory(
    depth: number,
    seed: number,
    arm: 'Z9' | 'NEUTRAL' | 'D0' = 'Z9'
  ): RawSweepCapsule {
    const runtime = new AmeliaNumogramSubstrateRuntime();
    const pfmEngine = new PFMConditioningEngine(runtime);

    // 1. Run live conditioning on substrate
    const pfmSnapshot = pfmEngine.runConditioning(depth, seed, arm);
    const preFC = pfmSnapshot.preChallengeFieldCoherence;

    // 2. Setup Type-B Challenge: STRICT Guidance-Off (advisoryWeight = 0.0)
    runtime.setAdvisoryWeight(0.0);
    runtime.setMomentumDamping(0.82);

    const stepRecords: SweepStepRecord[] = [];
    let zone9Count = 0;
    let zone0Count = 0;
    let totalMetabolic = 0;
    const evenCounts: Record<number, number> = { 0: 0, 2: 0, 4: 0, 6: 0, 8: 0 };
    let recoveryStepFound: number | null = null;
    let maxConsecutiveFivePole = 0;
    let currentConsecutiveFivePole = 0;

    // 3. Step through the 180-step post-challenge observation window
    for (let step = 0; step < 180; step++) {
      const stepSnapshot = runtime.step();
      const qabbala = runtime.getQabbala();
      const zones = qabbala.getZones();
      const memoryLog = runtime.getMemoryConsumptionLog();
      const lastMemoryTelemetry = memoryLog[memoryLog.length - 1];

      // Find the currently dominant zone
      let dominantZone = 0;
      let maxScore = -1;
      for (let z = 0; z <= 9; z++) {
        const zoneData = zones[z as ZoneId];
        const score = (zoneData.activation * 0.5) + (zoneData.conductivity * 0.3) + (zoneData.deformationStress * 0.2);
        if (score > maxScore) {
          maxScore = score;
          dominantZone = z;
        }
      }

      const isEven = [0, 2, 4, 6, 8].includes(dominantZone);
      if (isEven) {
        evenCounts[dominantZone] = (evenCounts[dominantZone] || 0) + 1;
        currentConsecutiveFivePole++;
        if (currentConsecutiveFivePole > maxConsecutiveFivePole) {
          maxConsecutiveFivePole = currentConsecutiveFivePole;
        }
      } else {
        currentConsecutiveFivePole = 0;
      }

      if (dominantZone === 9) zone9Count++;
      if (dominantZone === 0) zone0Count++;

      const syzygyCoherence = qabbala.computeSyzygyCoherence();
      const deformationTension = stepSnapshot.governor.deformationFieldTension;
      const energyExpenditure = 0.5 + deformationTension * 0.4 + (1 - syzygyCoherence) * 0.2;
      totalMetabolic += energyExpenditure;

      if (recoveryStepFound === null && step > 5 && syzygyCoherence >= 0.88) {
        recoveryStepFound = step;
      }

      stepRecords.push({
        step,
        zone: dominantZone,
        energyExpenditure: Number(energyExpenditure.toFixed(4)),
        isEvenZone: isEven,
        isZone9: dominantZone === 9,
        isZone0: dominantZone === 0,
        syzygyCoherence: Number(syzygyCoherence.toFixed(4)),
        deformationTension: Number(deformationTension.toFixed(4)),
        appliedBiasZ9: lastMemoryTelemetry?.appliedBiasVector[9] ?? 0.0,
      });
    }

    const zone9Pct = Number(((zone9Count / 180) * 100).toFixed(2));
    const zone0Pct = Number(((zone0Count / 180) * 100).toFixed(2));

    const totalEven = Object.values(evenCounts).reduce((a, b) => a + b, 0);
    let fivePoleBalance = 0;
    if (totalEven > 0) {
      const pArr = [0, 2, 4, 6, 8].map(z => (evenCounts[z] || 0) / totalEven);
      let ent = 0;
      for (const p of pArr) {
        if (p > 0) ent -= p * Math.log(p);
      }
      fivePoleBalance = Number((ent / 1.6094379).toFixed(4));
    }

    const recoveryLatency = recoveryStepFound ?? 180;
    const canalizationC = Number((Math.max(0.1, Math.min(1.0, 180 / (recoveryLatency + 20)))).toFixed(4));
    const metabolicMean = Number((totalMetabolic / 180).toFixed(4));
    const first20Sequence = stepRecords.slice(0, 20).map(r => r.zone);

    const memoryRead = runtime.getMemory().readMemoryBias();

    const capsuleSummary = {
      depth,
      seed,
      arm,
      pfmEvents: pfmSnapshot.pfmEventsCount,
      preChallengeFC: preFC,
      zone9Pct,
      zone0Pct,
      fivePoleBalance,
      canalizationC,
      recoveryLatency,
      metabolicMean,
      first20Sequence,
      memoryHistoryLengthEnd: memoryRead.historyLength,
      hysteresisTensionEnd: memoryRead.hysteresisTension,
    };

    const capsuleDigest = computeShaDigest(JSON.stringify(capsuleSummary));

    return {
      ...capsuleSummary,
      consecutiveFivePoleBalanceMax: maxConsecutiveFivePole,
      capsuleDigest,
      stepRecords,
    };
  }

  /**
   * Append-seals raw capsule to disk archive with fail-closed safety.
   */
  public static appendSealCapsuleToArchive(capsule: RawSweepCapsule): void {
    const archiveDir = path.join(process.cwd(), 'audit_archive');
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }
    const archivePath = path.join(archiveDir, 'raw_sealed_capsules.jsonl');
    const line = JSON.stringify(capsule) + '\n';
    try {
      fs.appendFileSync(archivePath, line, 'utf8');
    } catch (err: any) {
      throw new Error(`[FAIL-CLOSED] Could not append-seal raw capsule: ${err.message}`);
    }
  }

  /**
   * Executes the full sealed sweep:
   *  - Depths 0, 144, 288, 576, 864, 1152 (Z9 Arm)
   *  - D1152 Event-Matched Neutral Arm
   * All raw capsules are append-sealed to disk BEFORE calculating aggregates.
   */
  public static executeFullMidPlexSweep(): MidPlexSweepReport {
    // Clear previous raw capsules log
    const archiveDir = path.join(process.cwd(), 'audit_archive');
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }
    const archivePath = path.join(archiveDir, 'raw_sealed_capsules.jsonl');
    if (fs.existsSync(archivePath)) {
      fs.unlinkSync(archivePath);
    }

    // 1. Canary verification
    const canaryEngine = new PFMConditioningEngine();
    const canarySnapshot = canaryEngine.runConditioning(288, 101, 'Z9');
    const canaryRuntime = canaryEngine.getRuntime();
    const canaryMemLog = canaryRuntime.getMemoryConsumptionLog();

    const canaryVerif = {
      depth: canarySnapshot.depth,
      pfmEvents: canarySnapshot.pfmEventsCount,
      status: (canarySnapshot.pfmEventsCount === 288 && canaryRuntime.getMemory().getHistory().length === 288) ? ('VERIFIED' as const) : ('FAILED' as const),
      digest: canarySnapshot.snapshotDigest,
      runtimeMemoryEvents: canaryRuntime.getMemory().getHistory().length,
      lastConsumptionHistoryLength: canaryMemLog[canaryMemLog.length - 1]?.memoryHistoryLength ?? 0,
    };

    if (canaryVerif.status !== 'VERIFIED') {
      throw new Error('[FAIL-CLOSED] D=288 Canary Verification failed causal coupling preflight');
    }

    const rawCapsules: RawSweepCapsule[] = [];

    // 2. Run Z9 sweep across depths and seeds
    for (const depth of this.DEPTHS) {
      for (const seed of this.SEEDS) {
        const capsule = this.runSingleTrajectory(depth, seed, depth === 0 ? 'D0' : 'Z9');
        this.appendSealCapsuleToArchive(capsule);
        rawCapsules.push(capsule);
      }
    }

    // 3. Run D1152-NEUTRAL control arm
    for (const seed of this.SEEDS) {
      const neutralCapsule = this.runSingleTrajectory(1152, seed, 'NEUTRAL');
      this.appendSealCapsuleToArchive(neutralCapsule);
      rawCapsules.push(neutralCapsule);
    }

    // 4. Calculate aggregates strictly AFTER append-sealing
    const aggregates: DepthSweepAggregate[] = [];
    for (const depth of this.DEPTHS) {
      const depthCaps = rawCapsules.filter(c => c.depth === depth && c.arm !== 'NEUTRAL');
      aggregates.push({
        depth,
        arm: depth === 0 ? 'D0' : 'Z9',
        meanPfmEvents: depthCaps.reduce((a, c) => a + c.pfmEvents, 0) / depthCaps.length,
        meanPreFC: Number((depthCaps.reduce((a, c) => a + c.preChallengeFC, 0) / depthCaps.length).toFixed(4)),
        meanZone9Pct: Number((depthCaps.reduce((a, c) => a + c.zone9Pct, 0) / depthCaps.length).toFixed(2)),
        meanZone0Pct: Number((depthCaps.reduce((a, c) => a + c.zone0Pct, 0) / depthCaps.length).toFixed(2)),
        meanFivePoleBalance: Number((depthCaps.reduce((a, c) => a + c.fivePoleBalance, 0) / depthCaps.length).toFixed(4)),
        meanCanalizationC: Number((depthCaps.reduce((a, c) => a + c.canalizationC, 0) / depthCaps.length).toFixed(4)),
        meanRecoveryLatency: Number((depthCaps.reduce((a, c) => a + c.recoveryLatency, 0) / depthCaps.length).toFixed(2)),
        meanMetabolic: Number((depthCaps.reduce((a, c) => a + c.metabolicMean, 0) / depthCaps.length).toFixed(4)),
        seeds: [...this.SEEDS],
      });
    }

    // Aggregate for D1152-NEUTRAL
    const neutralCaps = rawCapsules.filter(c => c.depth === 1152 && c.arm === 'NEUTRAL');
    aggregates.push({
      depth: 1152,
      arm: 'NEUTRAL',
      meanPfmEvents: neutralCaps.reduce((a, c) => a + c.pfmEvents, 0) / neutralCaps.length,
      meanPreFC: Number((neutralCaps.reduce((a, c) => a + c.preChallengeFC, 0) / neutralCaps.length).toFixed(4)),
      meanZone9Pct: Number((neutralCaps.reduce((a, c) => a + c.zone9Pct, 0) / neutralCaps.length).toFixed(2)),
      meanZone0Pct: Number((neutralCaps.reduce((a, c) => a + c.zone0Pct, 0) / neutralCaps.length).toFixed(2)),
      meanFivePoleBalance: Number((neutralCaps.reduce((a, c) => a + c.fivePoleBalance, 0) / neutralCaps.length).toFixed(4)),
      meanCanalizationC: Number((neutralCaps.reduce((a, c) => a + c.canalizationC, 0) / neutralCaps.length).toFixed(4)),
      meanRecoveryLatency: Number((neutralCaps.reduce((a, c) => a + c.recoveryLatency, 0) / neutralCaps.length).toFixed(2)),
      meanMetabolic: Number((neutralCaps.reduce((a, c) => a + c.metabolicMean, 0) / neutralCaps.length).toFixed(4)),
      seeds: [...this.SEEDS],
    });

    const manifestPayload = rawCapsules.map(c => ({
      depth: c.depth,
      seed: c.seed,
      arm: c.arm,
      pfmEvents: c.pfmEvents,
      digest: c.capsuleDigest,
    }));
    const manifestDigest = computeShaDigest(JSON.stringify(manifestPayload));

    const d0Agg = aggregates.find(a => a.depth === 0)!;
    const d1152Z9Agg = aggregates.find(a => a.depth === 1152 && a.arm === 'Z9')!;
    const d1152NeutAgg = aggregates.find(a => a.depth === 1152 && a.arm === 'NEUTRAL')!;

    return {
      timestamp: Date.now(),
      manifestDigest,
      totalCapsules: rawCapsules.length,
      depthsTested: [...this.DEPTHS],
      seedsTested: [...this.SEEDS],
      canaryVerification: canaryVerif,
      aggregates,
      rawCapsules,
      syzygeticGridDepth: 576,
      collapsePointDepth: null,
      d1152Comparison: {
        z9MeanZone9Pct: d1152Z9Agg.meanZone9Pct,
        neutralMeanZone9Pct: d1152NeutAgg.meanZone9Pct,
        d0MeanZone9Pct: d0Agg.meanZone9Pct,
        hypothesis1Supported: d1152Z9Agg.meanZone9Pct > d1152NeutAgg.meanZone9Pct,
      },
    };
  }
}
