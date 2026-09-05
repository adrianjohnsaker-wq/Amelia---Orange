/**
 * PAPER 6 — D=288 PER-ZONE OCCUPANCY BREAKDOWN
 * Syzygetic Grid Confirmation on the Plex Current Arc
 *
 * Runs through src/ai/runtime/cycle.ts -> runCycleWithBridge with support for
 * both C1 syzygetic grid mode (suppressRelaySteering: true) and polar Plex mode.
 */

import { canonicalSha256 } from '../lib/sha256';
import { runCycleWithBridge } from '../ai/runtime/cycle';

export const ZONE_NAMES: Record<number, string> = {
  0: 'Z0 — Uttunex (metabolic-integration)',
  1: 'Z1 — current 1::8',
  2: 'Z2 — attractor 2::7',
  3: 'Z3 — Surge current',
  4: 'Z4 — ATTRACTOR 4::5 (Platonic ingression site)',
  5: 'Z5 — current 4::5',
  6: 'Z6 — Surge attractor',
  7: 'Z7 — current 7::2',
  8: 'Z8 — peripheral Ring attractor',
  9: 'Z9 — UTTUNUL (Plex current 9::0)',
};

export interface SyzygeticGridVerdict {
  passes: boolean;
  z4Emerges: boolean;
  evenZoneBalance: number;
  evenZoneDominant: boolean;
  noSingleDominant: boolean;
  oddZoneBelow35: boolean;
  basis: string;
}

export function evaluateSyzygeticGrid(
  zoneOccupancy: Record<number, number>,
  total: number
): SyzygeticGridVerdict {
  const pct = (z: number) => (total > 0 ? (zoneOccupancy[z] ?? 0) / total : 0);

  const evenTotal = [0, 2, 4, 6, 8].reduce((s, z) => s + pct(z), 0);
  const oddTotal = [1, 3, 5, 7, 9].reduce((s, z) => s + pct(z), 0);

  const z4Pct = pct(4);
  const z4Emerges = z4Pct >= 0.10;

  const idealEvenShare = evenTotal / 5;
  const evenHistIntersect = [0, 2, 4, 6, 8].reduce((s, z) => {
    return s + Math.min(pct(z), idealEvenShare);
  }, 0);
  const evenZoneBalance = idealEvenShare > 0 ? evenHistIntersect / evenTotal : 0;

  const evenZoneDominant = evenTotal >= 0.65;
  const noSingleDominant = [0, 2, 4, 6, 8].every((z) => pct(z) <= 0.40);
  const oddZoneBelow35 = oddTotal <= 0.35;

  const passes =
    z4Emerges &&
    evenZoneBalance >= 0.65 &&
    evenZoneDominant &&
    noSingleDominant &&
    oddZoneBelow35;

  const basis = passes
    ? `SYZYGETIC GRID CONFIRMED: Z4=${(z4Pct * 100).toFixed(1)}%, ` +
      `even-zone balance=${evenZoneBalance.toFixed(3)}, ` +
      `even total=${(evenTotal * 100).toFixed(1)}%, odd total=${(oddTotal * 100).toFixed(1)}%`
    : `SYZYGETIC GRID NOT MET: Z4=${(z4Pct * 100).toFixed(1)}% ` +
      `(need ≥10%), balance=${evenZoneBalance.toFixed(3)} (need ≥0.65), ` +
      `even=${(evenTotal * 100).toFixed(1)}%, odd=${(oddTotal * 100).toFixed(1)}%`;

  return {
    passes,
    z4Emerges,
    evenZoneBalance: Number(evenZoneBalance.toFixed(4)),
    evenZoneDominant,
    noSingleDominant,
    oddZoneBelow35,
    basis,
  };
}

export interface ZoneBreakdownCapsule {
  lineageId: string;
  depth: number;
  seed: number;
  pfmEvents: number;
  preFc: number;
  pfmSnapshotDigest: string;
  zoneCount: Record<number, number>;
  zonePct: Record<number, number>;
  evenZoneTotal: number;
  oddZoneTotal: number;
  z4Occupancy: number;
  first20Zones: number[];
  syzygeticGrid: SyzygeticGridVerdict;
  rawStepDigest: string;
  capsuleDigest: string;
}

export async function runZoneBreakdown(
  depth: number,
  seed: number,
  obsWindow: number = 180,
  suppressRelaySteering: boolean = true
): Promise<ZoneBreakdownCapsule> {
  const summary = runCycleWithBridge({
    depth,
    seed,
    suppressRelaySteering,
    obsWindow,
    advisoryWeight: 0.0,
    momentumDamping: 0.88,
  });

  const syzygeticGrid = evaluateSyzygeticGrid(summary.zoneCount, obsWindow);

  return {
    lineageId: summary.lineageId,
    depth: summary.depth,
    seed: summary.seed,
    pfmEvents: summary.pfmEvents,
    preFc: 0.945,
    pfmSnapshotDigest: summary.capsuleDigest.slice(0, 16),
    zoneCount: summary.zoneCount,
    zonePct: summary.zonePct,
    evenZoneTotal: summary.evenZoneTotal,
    oddZoneTotal: summary.oddZoneTotal,
    z4Occupancy: summary.zonePct[4] ?? 0.0,
    first20Zones: summary.first30Zones.slice(0, 20),
    syzygeticGrid,
    rawStepDigest: summary.rawStepDigest,
    capsuleDigest: summary.capsuleDigest,
  };
}

export async function runD288ZoneBreakdown(
  suppressRelaySteering: boolean = true
): Promise<{
  capsules: ZoneBreakdownCapsule[];
  auditEnvelope: string;
  syzygeticAtD288: boolean;
  z4EmergenceAtD288: boolean;
  plexArcComparison: string;
  noAdvancementClaims: boolean;
}> {
  const DEPTHS = [0, 288, 1152] as const;
  const SEEDS = [101, 202, 303] as const;
  const capsules: ZoneBreakdownCapsule[] = [];

  for (const depth of DEPTHS) {
    for (const seed of SEEDS) {
      capsules.push(await runZoneBreakdown(depth, seed, 180, suppressRelaySteering));
    }
  }

  const d288Capsules = capsules.filter((c) => c.depth === 288);
  const syzygeticAtD288 = d288Capsules.every((c) => c.syzygeticGrid.passes);
  const z4EmergenceAtD288 = d288Capsules.every((c) => c.syzygeticGrid.z4Emerges);

  function meanZonePct(depth: number, zone: number): number {
    const cs = capsules.filter((c) => c.depth === depth);
    return cs.reduce((s, c) => s + (c.zonePct[zone] ?? 0), 0) / cs.length;
  }

  const plexArcLines: string[] = [
    'PLEX CURRENT ARC — MEAN ZONE OCCUPANCY (180-step post-challenge)',
    'Zone   D=0        D=288      D=1152',
    '─────────────────────────────────────',
  ];
  for (let z = 0; z <= 9; z++) {
    const isEven = [0, 2, 4, 6, 8].includes(z);
    const marker = z === 4 ? ' ← Z4 INGRESSION' : isEven ? ' (even)' : ' (odd)';
    plexArcLines.push(
      `Z${z}     ${(meanZonePct(0, z) * 100).toFixed(1).padEnd(10)}` +
        `${(meanZonePct(288, z) * 100).toFixed(1).padEnd(10)}` +
        `${(meanZonePct(1152, z) * 100).toFixed(1)}${marker}`
    );
  }

  const plexArcComparison = plexArcLines.join('\n');
  const auditEnvelope = canonicalSha256(JSON.stringify(capsules.map((c) => c.capsuleDigest)));

  return {
    capsules,
    auditEnvelope,
    syzygeticAtD288,
    z4EmergenceAtD288,
    plexArcComparison,
    noAdvancementClaims: true,
  };
}
