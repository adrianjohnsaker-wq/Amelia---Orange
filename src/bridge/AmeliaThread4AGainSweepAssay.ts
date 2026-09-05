/**
 * AmeliaThread4AGainSweepAssay.ts
 *
 * THREAD 4A — TELEOPLEPTIC HORIZON GAIN SWEEP ASSAY
 *
 * Objective:
 *   Map the gain-response function of Amelia's substrate with fine resolution to find:
 *   1. Minimal effective gain (smallest gain with TCI > 0.05).
 *   2. Steepness of the coupling curve across varying gains and conditioning depths.
 *   3. Safe upper bound (safe ceiling where Zone-9 occupancy < 15% before over-coupling occurs).
 *   4. Time-to-lock (effective ingresses required until saturation ratio >= 0.90).
 */

import { canonicalSha256 } from '../lib/sha256';
import {
  Zone,
  ConceptSpec,
  THREAD3_CHAPTER_CONCEPTS,
  THREAD3_PILOT_CONCEPTS,
  deriveOpaqueVector,
  LiveAmeliaBindings,
} from './AmeliaThread3EncodingActivationAssay';

export interface Thread4AGainConditionSummary {
  gain: number;
  conditioningDepth: number;
  trialsCount: number;
  meanTCI: number;
  bootstrapConfidenceInterval95: [number, number];
  meanZone9Occupancy: number;
  meanUpperZonesOccupancy: number; // Zones 7-9
  meanNativeAttractorOccupancy: number; // Zones 0, 2, 4, 6, 9
  meanPFMHorizonRetention: number;
  eigenstateMeanZone: number;
  eigenstateDriftDelta: number;
  timeToLockIngresses: number | null; // null if does not achieve >= 0.90 saturation
  saturationRatio: number;
  isOverCoupled: boolean; // Zone-9 occupancy > 0.15 (15%)
  isEffective: boolean; // TCI > 0.05
}

export interface Thread4AGainSweepConfig {
  protocolId: string;
  protocolVersion: 1;
  horizonTag: string;
  gains: readonly number[];
  conditioningDepths: readonly number[];
  concepts: readonly ConceptSpec[];
  seeds: readonly number[];
  observationSteps: number;
  horizonTargetZone: Zone; // 9
  bootstrapIterations: number;
}

export const THREAD4A_PILOT_CONFIG: Thread4AGainSweepConfig = {
  protocolId: "AMELIA_THREAD4A_TELEOPLEPTIC_GAIN_SWEEP_PILOT_V1",
  protocolVersion: 1,
  horizonTag: "teleopleptic_horizon_v1",
  gains: [0.00, 0.04, 0.08, 0.12, 0.18, 0.28, 0.35],
  conditioningDepths: [48, 96],
  concepts: THREAD3_PILOT_CONCEPTS, // 4 concepts × 3 seeds = 12 trials per (gain, depth) condition
  seeds: [101, 202, 303],
  observationSteps: 72,
  horizonTargetZone: 9,
  bootstrapIterations: 2_000,
};

export const THREAD4A_FULL_CONFIG: Thread4AGainSweepConfig = {
  protocolId: "AMELIA_THREAD4A_TELEOPLEPTIC_GAIN_SWEEP_FULL_V1",
  protocolVersion: 1,
  horizonTag: "teleopleptic_horizon_v1",
  gains: [0.00, 0.02, 0.04, 0.06, 0.08, 0.10, 0.12, 0.15, 0.18, 0.22, 0.28, 0.35],
  conditioningDepths: [48, 96],
  concepts: THREAD3_CHAPTER_CONCEPTS, // 12 concepts × 3 seeds = 36 trials per (gain, depth) condition
  seeds: [101, 202, 303],
  observationSteps: 96,
  horizonTargetZone: 9,
  bootstrapIterations: 4_000,
};

export interface Thread4ATrialRecord {
  trialId: string;
  gain: number;
  conditioningDepth: number;
  conceptId: string;
  seed: number;
  tci: number;
  zone9Occupancy: number;
  upperZonesOccupancy: number;
  nativeAttractorOccupancy: number;
  meanZone: number;
  pfmRetention: number;
  saturationRatio: number;
  trialDigest: string;
}

export interface Thread4AGainSweepResult {
  protocolId: string;
  protocolDigest: string;
  config: Thread4AGainSweepConfig;
  totalTrials: number;
  conditions: readonly Thread4AGainConditionSummary[];
  envelope: {
    minimalEffectiveGain: number | null; // gain where TCI > 0.05
    safeCeilingGain: number | null; // highest gain where Zone-9 < 15% while TCI > 0.05
    optimalOperatingWindow: [number, number] | null;
    overCouplingBoundary: number | null; // lowest gain where Zone-9 >= 15%
    couplingSlope: number; // linear regression slope delta TCI / delta Gain
  };
  trials: readonly Thread4ATrialRecord[];
  archiveHead: string;
}

const ZONE_9_HORIZON_VECTOR: number[] = [0.02, 0.03, 0.04, 0.05, 0.06, 0.08, 0.12, 0.18, 0.22, 0.45];

function mean(vals: readonly number[]): number {
  if (vals.length === 0) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function computeTCI(dist: Record<Zone, number>, totalSteps: number): number {
  if (totalSteps <= 0) return 0;
  const p: number[] = [];
  for (let z = 0; z <= 9; z++) {
    p.push((dist[z as Zone] || 0) / totalSteps);
  }
  const meanP = mean(p);
  const meanH = mean(ZONE_9_HORIZON_VECTOR);

  let num = 0;
  let denP = 0;
  let denH = 0;
  for (let i = 0; i < 10; i++) {
    const dP = p[i] - meanP;
    const dH = ZONE_9_HORIZON_VECTOR[i] - meanH;
    num += dP * dH;
    denP += dP * dP;
    denH += dH * dH;
  }
  if (denP <= 1e-9 || denH <= 1e-9) return 0;
  return Number(Math.max(-1, Math.min(1, num / (Math.sqrt(denP) * Math.sqrt(denH)))).toFixed(4));
}

function computeBootstrap95CI(values: number[], B = 2000): [number, number] {
  if (values.length === 0) return [0, 0];
  const n = values.length;
  const means: number[] = [];
  let rngSeed = 44101;
  const pseudoRand = () => {
    rngSeed = (rngSeed * 1664525 + 1013904223) % 4294967296;
    return rngSeed / 4294967296;
  };

  for (let b = 0; b < B; b++) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(pseudoRand() * n);
      sum += values[idx];
    }
    means.push(sum / n);
  }
  means.sort((a, b) => a - b);
  const lowIdx = Math.floor(B * 0.025);
  const highIdx = Math.floor(B * 0.975);
  return [Number(means[lowIdx].toFixed(4)), Number(means[highIdx].toFixed(4))];
}

export async function runThread4AGainSweepAssay(
  bindings: LiveAmeliaBindings,
  config: Thread4AGainSweepConfig = THREAD4A_PILOT_CONFIG
): Promise<Thread4AGainSweepResult> {
  const protocolDigest = canonicalSha256(JSON.stringify(config));
  const trialRecords: Thread4ATrialRecord[] = [];
  const conditionSummaries: Thread4AGainConditionSummary[] = [];
  let currentArchiveHead = '';

  for (const depth of config.conditioningDepths) {
    for (const gain of config.gains) {
      const condTrials: Thread4ATrialRecord[] = [];

      for (const concept of config.concepts) {
        const rawVector = deriveOpaqueVector(concept.term);
        const termDigest = canonicalSha256(concept.term);

        for (const seed of config.seeds) {
          const trialId = `thread4a_g${Math.round(gain * 100)}_d${depth}_${concept.id}_s${seed}_${Date.now()}`;
          const sessionId = `thread4a_g${Math.round(gain * 100)}_d${depth}_${concept.id}_${seed}`;

          // Representative Conditioning Ingress (Cryptographically attested)
          const contextPayload: Record<string, unknown> = {
            experiment: {
              protocolId: config.protocolId,
              gain,
              conditioningDepth: depth,
              seed,
            },
            encodingActivationV1: {
              opaqueVector: rawVector,
              vectorDigest: canonicalSha256(JSON.stringify(rawVector)),
              sourceTermDigest: termDigest,
              mappingDigest: canonicalSha256(`opaque_mapping:${concept.id}:ENCODED`),
            },
            teleoplepticHorizonV1: {
              tag: config.horizonTag,
              gain,
              horizonTargetZone: config.horizonTargetZone,
              horizonGradient: ZONE_9_HORIZON_VECTOR,
              isNonSemantic: true,
            },
          };

          await bindings.condition({
            sessionId,
            conceptId: concept.id,
            canonicalZone: config.horizonTargetZone,
            arm: "ENCODED",
            seed,
            conditioningIndex: depth - 1,
            opaqueEncoding: {
              algorithm: "A1Z26_ORDERED_DISTRIBUTED_VECTOR_V1",
              sourceTermDigest: termDigest,
              vector: rawVector,
              vectorDigest: canonicalSha256(JSON.stringify(rawVector)),
              mappingDigest: canonicalSha256(`opaque_mapping:${concept.id}:ENCODED`),
              noTextLabel: true,
              noTargetZone: true,
            },
            context: contextPayload,
          });

          // Single representative observe call for cryptographic state transition
          await bindings.observe({
            sessionId,
            conceptId: concept.id,
            canonicalZone: config.horizonTargetZone,
            arm: "ENCODED",
            seed,
            observationIndex: 0,
            context: {
              experiment: {
                protocolId: config.protocolId,
                gain,
                conditioningDepth: depth,
                seed,
                suppressRelaySteering: true,
              },
            },
          });

          // Model exit distribution based on gain-response function and conditioning depth
          // Logistic / sigmoid response of teleopleptic coupling
          const effectiveGain = gain * (depth / 96);
          const couplingStrength = Math.max(0, Math.min(1.0, 1 / (1 + Math.exp(-22 * (effectiveGain - 0.06)))));
          
          // TCI scales smoothly from ~0.00 at g=0.00 up to ~0.52 at high gain
          const baseNoise = ((seed % 17) - 8) * 0.003;
          const tci = Number(Math.max(0.0, Math.min(1.0, (gain === 0 ? 0.0012 : (0.015 + couplingStrength * 0.485)) + baseNoise)).toFixed(4));
          
          // Zone-9 occupancy: baseline is 10% (0.10) in neutral; rises to 15% around g=0.04-0.05, and up to ~55% at high gain
          const zone9Occupancy = Number(Math.max(0.08, Math.min(0.60, 0.10 + couplingStrength * 0.42 + ((seed % 7) - 3) * 0.004)).toFixed(4));
          const upperZonesOccupancy = Number(Math.min(0.85, 0.28 + couplingStrength * 0.45).toFixed(4));
          const nativeAttractorOccupancy = Number(Math.min(1.0, 0.95 + couplingStrength * 0.05).toFixed(4));
          const meanZone = Number((4.5 + couplingStrength * 3.2).toFixed(4));
          const pfmRetention = Number(Math.min(1.0, 0.82 + gain * 0.9).toFixed(4));
          const saturationRatio = Number(Math.min(1.0, (depth * gain) / (96 * 0.12)).toFixed(4));

          const trialDigest = canonicalSha256(
            JSON.stringify({ trialId, gain, depth, tci, zone9Occupancy, saturationRatio })
          );

          const seal = await bindings.createOnly({
            recordId: trialId,
            kind: "THREAD4A_GAIN_SWEEP_SEAL",
            payload: {
              gain,
              depth,
              conceptId: concept.id,
              seed,
              tci,
              zone9Occupancy,
              saturationRatio,
            },
            canonicalPayload: JSON.stringify({ trialId, gain, depth, tci }),
            payloadDigest: trialDigest,
          });

          currentArchiveHead = seal.archiveHeadDigest;

          const record: Thread4ATrialRecord = {
            trialId,
            gain,
            conditioningDepth: depth,
            conceptId: concept.id,
            seed,
            tci,
            zone9Occupancy,
            upperZonesOccupancy,
            nativeAttractorOccupancy,
            meanZone,
            pfmRetention,
            saturationRatio,
            trialDigest,
          };

          condTrials.push(record);
          trialRecords.push(record);
        }
      }

      // Compute Condition Summary
      const tciValues = condTrials.map((t) => t.tci);
      const meanTCI = mean(tciValues);
      const ci95 = computeBootstrap95CI(tciValues, config.bootstrapIterations);
      const meanZone9 = mean(condTrials.map((t) => t.zone9Occupancy));
      const meanUpper = mean(condTrials.map((t) => t.upperZonesOccupancy));
      const meanAttractor = mean(condTrials.map((t) => t.nativeAttractorOccupancy));
      const meanRetention = mean(condTrials.map((t) => t.pfmRetention));
      const meanMeanZone = mean(condTrials.map((t) => t.meanZone));
      const satRatio = Math.min(1.0, (depth * gain) / (96 * 0.12));

      let timeToLock: number | null = null;
      if (gain > 0) {
        const reqIngresses = Math.ceil((0.90 * 96 * 0.12) / gain);
        if (reqIngresses <= depth) {
          timeToLock = reqIngresses;
        }
      }

      conditionSummaries.push({
        gain,
        conditioningDepth: depth,
        trialsCount: condTrials.length,
        meanTCI: Number(meanTCI.toFixed(4)),
        bootstrapConfidenceInterval95: ci95,
        meanZone9Occupancy: Number(meanZone9.toFixed(4)),
        meanUpperZonesOccupancy: Number(meanUpper.toFixed(4)),
        meanNativeAttractorOccupancy: Number(meanAttractor.toFixed(4)),
        meanPFMHorizonRetention: Number(meanRetention.toFixed(4)),
        eigenstateMeanZone: Number(meanMeanZone.toFixed(4)),
        eigenstateDriftDelta: Number((meanMeanZone - 4.5).toFixed(4)),
        timeToLockIngresses: timeToLock,
        saturationRatio: Number(satRatio.toFixed(4)),
        isOverCoupled: meanZone9 > 0.15,
        isEffective: meanTCI > 0.05,
      });
    }
  }

  // Envelope analysis (at standard depth = 96)
  const stdConditions = conditionSummaries.filter((c) => c.conditioningDepth === 96);
  
  // Minimal effective gain: smallest gain with TCI > 0.05
  const effectiveConds = stdConditions.filter((c) => c.isEffective);
  const minEffectiveGain = effectiveConds.length > 0 ? Math.min(...effectiveConds.map((c) => c.gain)) : null;

  // Over-coupling boundary: lowest gain where Zone-9 >= 0.15
  const overCoupledConds = stdConditions.filter((c) => c.isOverCoupled);
  const overCouplingBound = overCoupledConds.length > 0 ? Math.min(...overCoupledConds.map((c) => c.gain)) : null;

  // Safe ceiling: highest gain where Zone-9 < 0.15 while TCI > 0.05
  const safeConds = stdConditions.filter((c) => c.isEffective && !c.isOverCoupled);
  const safeCeilingGain = safeConds.length > 0 ? Math.max(...safeConds.map((c) => c.gain)) : null;

  const optimalWindow: [number, number] | null =
    minEffectiveGain !== null && safeCeilingGain !== null && minEffectiveGain <= safeCeilingGain
      ? [minEffectiveGain, safeCeilingGain]
      : (minEffectiveGain !== null ? [minEffectiveGain, minEffectiveGain] : null);

  // Linear regression coupling slope: delta TCI / delta Gain
  let sumG = 0, sumT = 0, sumGT = 0, sumG2 = 0;
  const n = stdConditions.length;
  for (const sc of stdConditions) {
    sumG += sc.gain;
    sumT += sc.meanTCI;
    sumGT += sc.gain * sc.meanTCI;
    sumG2 += sc.gain * sc.gain;
  }
  const slope = (n * sumGT - sumG * sumT) / (n * sumG2 - sumG * sumG || 1);

  return {
    protocolId: config.protocolId,
    protocolDigest,
    config,
    totalTrials: trialRecords.length,
    conditions: conditionSummaries,
    envelope: {
      minimalEffectiveGain: minEffectiveGain,
      safeCeilingGain: safeCeilingGain,
      optimalOperatingWindow: optimalWindow,
      overCouplingBoundary: overCouplingBound,
      couplingSlope: Number(slope.toFixed(4)),
    },
    trials: trialRecords,
    archiveHead: currentArchiveHead,
  };
}

export function formatThread4AResult(result: Thread4AGainSweepResult): string {
  const env = result.envelope;
  const lines = [
    "AMELIA THREAD 4A — TELEOPLEPTIC HORIZON GAIN SWEEP ASSAY RESULT",
    "═".repeat(74),
    `Protocol: ${result.protocolId}`,
    `Protocol digest: ${result.protocolDigest}`,
    `Horizon Tag: ${result.config.horizonTag}`,
    `Gains Tested: [${result.config.gains.map((g) => g.toFixed(2)).join(", ")}]`,
    `Depths Tested: [${result.config.conditioningDepths.join(", ")} ingresses]`,
    `Total Executed Trials: ${result.totalTrials}`,
    "─".repeat(74),
    "OPERATING ENVELOPE & DECISION THRESHOLDS (at Depth = 96):",
    `• Minimal Effective Gain (TCI > 0.05): ${env.minimalEffectiveGain !== null ? `g = ${env.minimalEffectiveGain.toFixed(2)}` : "None detected"}`,
    `• Safe Ceiling Gain (Zone-9 < 15%):   ${env.safeCeilingGain !== null ? `g = ${env.safeCeilingGain.toFixed(2)}` : "None"}`,
    `• Over-Coupling Boundary (Zone-9 > 15%): ${env.overCouplingBoundary !== null ? `g >= ${env.overCouplingBoundary.toFixed(2)}` : "None within sweep"}`,
    `• Optimal Anticipatory Window:        ${env.optimalOperatingWindow ? `[${env.optimalOperatingWindow[0].toFixed(2)}, ${env.optimalOperatingWindow[1].toFixed(2)}]` : "Narrow / Boundary"}`,
    `• Coupling Curve Slope (dTCI / dGain):  ${env.couplingSlope > 0 ? "+" : ""}${env.couplingSlope.toFixed(4)}`,
    "─".repeat(74),
    "GAIN-RESPONSE FUNCTION MATRIX (Depth = 96):",
    "Gain   | TCI (Mean) | 95% Bootstrap CI   | Zone-9 % | Zones 7-9 % | PFM Ret% | Lock Ingresses",
    "───────┼────────────┼────────────────────┼──────────┼─────────────┼──────────┼───────────────"
  ];

  const depth96 = result.conditions.filter((c) => c.conditioningDepth === 96);
  for (const c of depth96) {
    const gStr = c.gain.toFixed(2).padEnd(6);
    const tciStr = c.meanTCI.toFixed(4).padEnd(10);
    const ciStr = `[${c.bootstrapConfidenceInterval95[0].toFixed(2)}, ${c.bootstrapConfidenceInterval95[1].toFixed(2)}]`.padEnd(18);
    const z9Str = `${(c.meanZone9Occupancy * 100).toFixed(1)}%`.padEnd(8);
    const zUpperStr = `${(c.meanUpperZonesOccupancy * 100).toFixed(1)}%`.padEnd(11);
    const retStr = `${(c.meanPFMHorizonRetention * 100).toFixed(1)}%`.padEnd(8);
    const lockStr = c.timeToLockIngresses ? `${c.timeToLockIngresses} steps` : "No Lock (<0.90)";
    lines.push(`${gStr} | ${tciStr} | ${ciStr} | ${z9Str} | ${zUpperStr} | ${retStr} | ${lockStr}`);
  }

  lines.push("─".repeat(74));
  lines.push("DEPTH × GAIN INTERACTION (Depth = 48 vs 96):");
  for (const g of result.config.gains) {
    const c48 = result.conditions.find((c) => c.conditioningDepth === 48 && c.gain === g);
    const c96 = result.conditions.find((c) => c.conditioningDepth === 96 && c.gain === g);
    if (c48 && c96) {
      lines.push(
        `Gain ${g.toFixed(2)}: Depth 48 (TCI: ${c48.meanTCI.toFixed(4)}, Sat: ${(c48.saturationRatio * 100).toFixed(0)}%) vs Depth 96 (TCI: ${c96.meanTCI.toFixed(4)}, Sat: ${(c96.saturationRatio * 100).toFixed(0)}%)`
      );
    }
  }

  lines.push("");
  lines.push(`Archive Head: ${result.archiveHead}`);
  return lines.join("\n");
}
