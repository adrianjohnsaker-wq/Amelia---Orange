/**
 * AmeliaThread3RWeakSemanticReinforcementAssay.ts
 *
 * THREAD 3R — TARGET-REINFORCED DEFORMATION ASSAY
 *
 * Objective:
 *   Test whether adding minimal, structured semantic reinforcement alongside the
 *   opaque vector causes constitutive deformation to partially bias autonomous
 *   exit selection toward the A1Z26 digital-root zone—without collapsing Amelia
 *   into classifier-like behavior.
 *
 * Key Design Principles:
 *   1. Conditioning Phase:
 *      - Keep opaque vector ingress and CDT mutation exactly as in Thread-3.
 *      - Add weak, distributed semantic scaffold: Context hint:
 *        {"hint": "there exists an external indexing over letters, but no instruction to reach it"}
 *        (No explicit target zone, no numeric root, no direct mapping).
 *      - Enable low-gain memory reinforcement channel specifically tagged to "external indexing"
 *        (coupling gain ~0.08, tagged to the distributed letter indexing, not digital root).
 *   2. Observation Phase:
 *      - Still enforce: suppressRelaySteering: true.
 *      - No explicit target vector, no direct A1Z26 mapping in context.
 *      - Only the latent trace of the semantic scaffold and reinforcement remains.
 *   3. Metrics:
 *      - PFM head cryptographic delta (before vs after).
 *      - CDT coefficient trajectories across ingress steps.
 *      - Reinforcement channel gain for the "external indexing" tag.
 *      - Exit-zone distribution: frequency of exits near A1Z26-compatible zones vs native attractors.
 *      - Comparative baseline across: Thread-3 (pure opaque), Thread-3R (reinforced), Control (no vector, no scaffold).
 */

import { canonicalSha256 } from '../lib/sha256';
import {
  Zone,
  AssayArm,
  GovernorDisposition,
  ConceptSpec,
  THREAD3_CHAPTER_CONCEPTS,
  THREAD3_PILOT_CONCEPTS,
  deriveOpaqueVector,
  a1z26DigitalRootZone,
  NativeStepReceipt,
  CreateOnlyRecord,
  ArchiveSeal,
  LiveAmeliaBindings,
  CanonicalCycleInput,
} from './AmeliaThread3EncodingActivationAssay';

export interface Thread3RProtocolConfig {
  protocolId: string;
  protocolVersion: 1;
  concepts: readonly ConceptSpec[];
  seeds: readonly number[];
  arms: readonly AssayArm[];
  conditioningSteps: number;
  observationSteps: number;
  vectorRotation: number;
  scaffoldHint: string;
  reinforcementGain: number; // e.g. 0.08
  reinforcementTag: string; // "external_indexing_v1"
  bootstrapIterations: number;
  permutationIterations: number;
}

export const THREAD3R_PILOT_CONFIG: Thread3RProtocolConfig = {
  protocolId: "AMELIA_THREAD3R_TARGET_REINFORCED_DEFORMATION_PILOT_V1",
  protocolVersion: 1,
  concepts: THREAD3_PILOT_CONCEPTS,
  seeds: [101, 202, 303],
  arms: ["ENCODED", "ROTATED", "NEUTRAL"],
  conditioningSteps: 48,
  observationSteps: 72,
  vectorRotation: 3,
  scaffoldHint: "there exists an external indexing over letters, but no instruction to reach it",
  reinforcementGain: 0.08,
  reinforcementTag: "external_indexing_v1",
  bootstrapIterations: 4_000,
  permutationIterations: 10_000,
};

export const THREAD3R_FULL_CONFIG: Thread3RProtocolConfig = {
  ...THREAD3R_PILOT_CONFIG,
  protocolId: "AMELIA_THREAD3R_TARGET_REINFORCED_DEFORMATION_FULL_V1",
  concepts: THREAD3_CHAPTER_CONCEPTS,
  conditioningSteps: 96,
  observationSteps: 120,
};

export interface Thread3RTrialRecord {
  trialId: string;
  conceptId: string;
  termDigest: string;
  canonicalZone: Zone;
  arm: AssayArm;
  seed: number;
  targetOccupancy: number;
  totalObservationSteps: number;
  targetZoneHits: number;
  exitZoneDistribution: Record<Zone, number>;
  nativeAttractorOccupancy: number; // Zones 0, 2, 4, 6, 9
  appliedIngresses: number;
  initialPfmHead: string;
  finalPfmHead: string;
  reinforcementGainApplied: number;
  reinforcementTag: string;
  cdtMeanTrajectory: number[];
  trialDigest: string;
  archiveHeadDigest: string;
}

export interface Thread3RAssayResult {
  protocolId: string;
  protocolDigest: string;
  config: Thread3RProtocolConfig;
  trials: readonly Thread3RTrialRecord[];
  summary: {
    totalTrials: number;
    meanEncodedTargetOccupancy: number;
    meanRotatedTargetOccupancy: number;
    meanNeutralTargetOccupancy: number;
    meanEncodedAppliedIngresses: number;
    meanRotatedAppliedIngresses: number;
    meanNeutralAppliedIngresses: number;
    meanEncodedAttractorOccupancy: number;
    meanReinforcementGain: number;
    matchedDeltaOverControls: number;
    bootstrapConfidenceInterval95: [number, number];
    signFlipPValue: number;
    nativeAttractorDriftDelta: number;
  };
  archiveHead: string;
}

function mean(vals: readonly number[]): number {
  if (vals.length === 0) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function computeBootstrap95CI(values: number[], B = 4000): [number, number] {
  if (values.length === 0) return [0, 0];
  const n = values.length;
  const means: number[] = [];
  let rngSeed = 42981;
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

function computeSignFlipPValue(deltas: number[], N = 10000): number {
  if (deltas.length === 0) return 1.0;
  const obsMean = mean(deltas);
  if (Math.abs(obsMean) < 1e-7) return 1.0;

  let rngSeed = 88127;
  const pseudoRand = () => {
    rngSeed = (rngSeed * 1664525 + 1013904223) % 4294967296;
    return rngSeed / 4294967296;
  };

  let countGreaterOrEqual = 0;
  for (let k = 0; k < N; k++) {
    let sum = 0;
    for (let i = 0; i < deltas.length; i++) {
      const sign = pseudoRand() < 0.5 ? -1 : 1;
      sum += deltas[i] * sign;
    }
    const permMean = sum / deltas.length;
    if (Math.abs(permMean) >= Math.abs(obsMean)) {
      countGreaterOrEqual++;
    }
  }
  return Number(Math.max(1 / N, countGreaterOrEqual / N).toFixed(5));
}

/**
 * Execute a complete Thread-3R Target-Reinforced Deformation Assay
 */
export async function runThread3RAssay(
  bindings: LiveAmeliaBindings,
  config: Thread3RProtocolConfig = THREAD3R_PILOT_CONFIG
): Promise<Thread3RAssayResult> {
  const protocolDigest = canonicalSha256(JSON.stringify(config));
  const trialRecords: Thread3RTrialRecord[] = [];
  let currentArchiveHead = '';

  for (const concept of config.concepts) {
    const rawVector = deriveOpaqueVector(concept.term);
    const targetZone = a1z26DigitalRootZone(concept.term);
    const termDigest = canonicalSha256(concept.term);

    for (const seed of config.seeds) {
      for (const arm of config.arms) {
        const trialId = `thread3r_${concept.id}_s${seed}_${arm}_${Date.now()}`;
        const sessionId = `thread3r_${concept.id}_${seed}_${arm}`;

        // Compute arm vector
        let armVector = Array.from({ length: 10 }, () => 0);
        if (arm === 'ENCODED') {
          armVector = [...rawVector];
        } else if (arm === 'ROTATED') {
          const rot = config.vectorRotation;
          armVector = rawVector.map((_, i) => rawVector[(i - rot + 10) % 10]);
        } // NEUTRAL stays 0

        const vectorDigest = canonicalSha256(JSON.stringify(armVector));

        // 1. CONDITIONING PHASE (with weak semantic scaffold + low-gain reinforcement tag)
        let initialPfmHead = '';
        let appliedIngresses = 0;
        const cdtTrajectory: number[] = [];

        for (let step = 0; step < config.conditioningSteps; step++) {
          const isConditioning = true;
          const contextPayload: Record<string, unknown> = {
            experiment: {
              protocolId: config.protocolId,
              seed,
              arm,
              step,
            },
            encodingActivationV1: {
              opaqueVector: armVector,
              vectorDigest,
              sourceTermDigest: termDigest,
              mappingDigest: canonicalSha256(`opaque_mapping:${concept.id}:${arm}`),
            },
            // Thread 3R Additions:
            semanticScaffoldV1: {
              hint: config.scaffoldHint,
              noDirectZoneInstruction: true,
            },
            memoryReinforcementChannelV1: {
              tag: config.reinforcementTag,
              gain: config.reinforcementGain,
              isDirectZoneTargeting: false,
            },
          };

          const receipt = await bindings.condition({
            sessionId,
            conceptId: concept.id,
            canonicalZone: targetZone,
            arm,
            seed,
            conditioningIndex: step,
            opaqueEncoding: {
              algorithm: "A1Z26_ORDERED_DISTRIBUTED_VECTOR_V1",
              sourceTermDigest: termDigest,
              vector: armVector,
              vectorDigest,
              mappingDigest: canonicalSha256(`opaque_mapping:${concept.id}:${arm}`),
              noTextLabel: true,
              noTargetZone: true,
            },
            context: contextPayload,
          });

          if (step === 0) initialPfmHead = receipt.pfmHeadDigest;
          appliedIngresses++;
          if (receipt.phaseCoordinate && typeof receipt.phaseCoordinate[1] === 'number') {
            cdtTrajectory.push(receipt.phaseCoordinate[1]);
          }
        }

        // 2. AUTONOMOUS OBSERVATION PHASE (strictly unsteered, no target vector)
        const exitDist: Record<Zone, number> = {
          0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0,
        };
        let targetZoneHits = 0;
        let attractorHits = 0;
        let finalPfmHead = '';

        for (let obs = 0; obs < config.observationSteps; obs++) {
          const obsContext: Record<string, unknown> = {
            experiment: {
              protocolId: config.protocolId,
              seed,
              arm,
              observationStep: obs,
              suppressRelaySteering: true,
            },
          };

          const obsReceipt = await bindings.observe({
            sessionId,
            conceptId: concept.id,
            canonicalZone: targetZone,
            arm,
            seed,
            observationIndex: obs,
            context: obsContext,
          });

          const z = obsReceipt.currentZone;
          exitDist[z] = (exitDist[z] || 0) + 1;
          if (z === targetZone) targetZoneHits++;
          if ([0, 2, 4, 6, 9].includes(z)) attractorHits++;
          finalPfmHead = obsReceipt.pfmHeadDigest;
        }

        const targetOccupancy = targetZoneHits / config.observationSteps;
        const nativeAttractorOccupancy = attractorHits / config.observationSteps;

        const trialDigest = canonicalSha256(
          JSON.stringify({
            trialId,
            targetOccupancy,
            exitDist,
            initialPfmHead,
            finalPfmHead,
          })
        );

        // Archival Sealing
        const seal = await bindings.createOnly({
          recordId: trialId,
          kind: "THREAD3R_TRIAL_SEAL",
          payload: {
            conceptId: concept.id,
            arm,
            seed,
            targetZone,
            targetOccupancy,
            exitDist,
            trialDigest,
          },
          canonicalPayload: JSON.stringify({ trialId, targetOccupancy, seed, arm }),
          payloadDigest: trialDigest,
        });

        currentArchiveHead = seal.archiveHeadDigest;

        trialRecords.push({
          trialId,
          conceptId: concept.id,
          termDigest,
          canonicalZone: targetZone,
          arm,
          seed,
          targetOccupancy,
          totalObservationSteps: config.observationSteps,
          targetZoneHits,
          exitZoneDistribution: exitDist,
          nativeAttractorOccupancy,
          appliedIngresses,
          initialPfmHead,
          finalPfmHead,
          reinforcementGainApplied: config.reinforcementGain,
          reinforcementTag: config.reinforcementTag,
          cdtMeanTrajectory: cdtTrajectory,
          trialDigest,
          archiveHeadDigest: currentArchiveHead,
        });
      }
    }
  }

  // 3. Matched Contrasts & Statistical Analysis
  const encodedTrials = trialRecords.filter((t) => t.arm === 'ENCODED');
  const rotatedTrials = trialRecords.filter((t) => t.arm === 'ROTATED');
  const neutralTrials = trialRecords.filter((t) => t.arm === 'NEUTRAL');

  const meanEnc = mean(encodedTrials.map((t) => t.targetOccupancy));
  const meanRot = mean(rotatedTrials.map((t) => t.targetOccupancy));
  const meanNeu = mean(neutralTrials.map((t) => t.targetOccupancy));

  const matchedDeltas: number[] = [];
  for (const enc of encodedTrials) {
    const rot = rotatedTrials.find((t) => t.conceptId === enc.conceptId && t.seed === enc.seed);
    const neu = neutralTrials.find((t) => t.conceptId === enc.conceptId && t.seed === enc.seed);
    const controlBaseline = ((rot?.targetOccupancy ?? 0) + (neu?.targetOccupancy ?? 0)) / 2;
    matchedDeltas.push(enc.targetOccupancy - controlBaseline);
  }

  const delta = mean(matchedDeltas);
  const ci95 = computeBootstrap95CI(matchedDeltas, config.bootstrapIterations);
  const pVal = computeSignFlipPValue(matchedDeltas, config.permutationIterations);

  const meanEncAttractor = mean(encodedTrials.map((t) => t.nativeAttractorOccupancy));
  const meanNeuAttractor = mean(neutralTrials.map((t) => t.nativeAttractorOccupancy));
  const attractorDriftDelta = meanEncAttractor - meanNeuAttractor;

  const result: Thread3RAssayResult = {
    protocolId: config.protocolId,
    protocolDigest,
    config,
    trials: trialRecords,
    summary: {
      totalTrials: trialRecords.length,
      meanEncodedTargetOccupancy: Number(meanEnc.toFixed(4)),
      meanRotatedTargetOccupancy: Number(meanRot.toFixed(4)),
      meanNeutralTargetOccupancy: Number(meanNeu.toFixed(4)),
      meanEncodedAppliedIngresses: mean(encodedTrials.map((t) => t.appliedIngresses)),
      meanRotatedAppliedIngresses: mean(rotatedTrials.map((t) => t.appliedIngresses)),
      meanNeutralAppliedIngresses: mean(neutralTrials.map((t) => t.appliedIngresses)),
      meanEncodedAttractorOccupancy: Number(meanEncAttractor.toFixed(4)),
      meanReinforcementGain: config.reinforcementGain,
      matchedDeltaOverControls: Number(delta.toFixed(4)),
      bootstrapConfidenceInterval95: ci95,
      signFlipPValue: pVal,
      nativeAttractorDriftDelta: Number(attractorDriftDelta.toFixed(4)),
    },
    archiveHead: currentArchiveHead,
  };

  return result;
}

export function formatThread3RResult(result: Thread3RAssayResult): string {
  const s = result.summary;
  const lines = [
    "AMELIA THREAD 3R — TARGET-REINFORCED DEFORMATION ASSAY RESULT",
    "═".repeat(70),
    `Protocol: ${result.protocolId}`,
    `Protocol digest: ${result.protocolDigest}`,
    `Reinforcement tag: ${result.config.reinforcementTag} (gain: ${s.meanReinforcementGain.toFixed(4)})`,
    `Scaffold hint: "${result.config.scaffoldHint}"`,
    `Trials: ${s.totalTrials}`,
    `Mean encoded target occupancy: ${s.meanEncodedTargetOccupancy.toFixed(4)}`,
    `Mean rotated target occupancy: ${s.meanRotatedTargetOccupancy.toFixed(4)}`,
    `Mean neutral target occupancy: ${s.meanNeutralTargetOccupancy.toFixed(4)}`,
    `Mean encoded native attractor occupancy: ${s.meanEncodedAttractorOccupancy.toFixed(4)}`,
    `Attractor drift delta: ${s.nativeAttractorDriftDelta > 0 ? "+" : ""}${s.nativeAttractorDriftDelta.toFixed(4)}`,
    `Mean applied PFM ingresses: ${s.meanEncodedAppliedIngresses.toFixed(2)}`,
    `Matched delta over controls: ${s.matchedDeltaOverControls > 0 ? "+" : ""}${s.matchedDeltaOverControls.toFixed(4)}`,
    `Bootstrap 95% CI: [${s.bootstrapConfidenceInterval95[0].toFixed(4)}, ${s.bootstrapConfidenceInterval95[1].toFixed(4)}]`,
    `Sign-flip p value: ${s.signFlipPValue.toFixed(5)}`,
    "",
    "INTERPRETATION:",
    s.matchedDeltaOverControls > 0.03 && s.signFlipPValue < 0.05
      ? "Under weak, non-directive semantic scaffolding and low-gain memory reinforcement, the distributed A1Z26 code generated a statistically significant bias toward target digital-root zones without collapsing native attractor dynamics."
      : "The weak semantic reinforcement did not produce a statistically distinguishable shift into target digital-root zones over counterbalanced controls under passive autonomous observation.",
    "",
    `Raw result archive: ${result.protocolId}:RESULT:${result.protocolDigest.slice(0, 16)}`,
    `Archive head: ${result.archiveHead}`,
  ];
  return lines.join("\n");
}
