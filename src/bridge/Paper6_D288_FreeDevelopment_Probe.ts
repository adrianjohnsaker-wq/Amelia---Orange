/**
 * Paper6_D288_FreeDevelopment_Probe.ts
 *
 * BRIDGE PAPER6 — D288-FREE-DEVELOPMENT
 * DEPTH 288
 * SEEDS 101, 202, 303
 * MODE unguided-autonomous
 * OBS_WINDOW 360
 *
 * Runs through src/ai/runtime/cycle.ts -> runCycleWithBridge
 */

import { runCycleWithBridge, CycleExecutionSummary } from '../ai/runtime/cycle';
import { canonicalSha256 } from '../lib/sha256';

export interface FreeDevCapsule {
  lineageId: string;
  depth: number;
  seed: number;
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
  suppressRelaySteering: boolean;
}

export function runD288FreeDevelopment(
  seeds: number[] = [101, 202, 303],
  obsWindow: number = 360,
  suppressRelaySteering: boolean = true
): { capsules: FreeDevCapsule[]; auditEnvelope: string; noAdvancementClaims: boolean } {
  const depth = 288;
  const capsules: FreeDevCapsule[] = [];

  for (const seed of seeds) {
    const summary = runCycleWithBridge({
      depth,
      seed,
      suppressRelaySteering,
      obsWindow,
      advisoryWeight: 0.0,
      momentumDamping: 0.88,
    });

    capsules.push({
      lineageId: summary.lineageId,
      depth: summary.depth,
      seed: summary.seed,
      pfmEvents: summary.pfmEvents,
      obsWindow: summary.obsWindow,
      zoneCount: summary.zoneCount,
      zonePct: summary.zonePct,
      evenZoneTotal: summary.evenZoneTotal,
      oddZoneTotal: summary.oddZoneTotal,
      evenZoneBalance: summary.evenZoneBalance,
      z4Emergence: summary.z4Emergence,
      first30Zones: summary.first30Zones,
      rawStepDigest: summary.rawStepDigest,
      capsuleDigest: summary.capsuleDigest,
      suppressRelaySteering,
    });
  }

  const auditEnvelope = canonicalSha256(JSON.stringify(capsules.map((c) => c.capsuleDigest)));

  return {
    capsules,
    auditEnvelope,
    noAdvancementClaims: true,
  };
}
