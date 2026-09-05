/**
 * AmeliaSubstrateAdapter.ts
 *
 * Implements AmeliaSubstrateAdapter directly bound to the authentic Amelia
 * substrate runtime and Poincaré metric system.
 */

import {
  AmeliaSubstrateAdapter,
  LineageSnapshot,
  PFMParams,
  PFMTensor,
  ObservedProjection,
} from './pfm-null-control-assay';
import {
  CanonicalAmeliaRuntimeImpl,
  CanonicalAmeliaLineageInstance,
} from '../substrate/canonicalAmeliaRuntimeImpl';
import {
  projectToPoincareDisk,
  poincareDistance,
  createDeterministicRng,
} from './AmeliaNativePoincarePipeline';
import { PFMEventRecord } from '../substrate/IntegratedMemorySystem';
import { canonicalSha256 } from '../lib/sha256';
import { ZoneId } from '../types/amelia';
import { BoundedSolicitation, CanonicalTransitionRequest } from '../substrate/AmeliaHistoryConditionedTransitionSubstrate';

export class LiveAmeliaSubstrateAdapter implements AmeliaSubstrateAdapter {
  /**
   * Advance a lineage to `depth` under `params` (eta, kappa).
   * Follows exact Table 1 conditioning procedure.
   */
  public async conditionLineage(seed: number, depth: number, params: PFMParams): Promise<LineageSnapshot> {
    const lineageId = `lin_d${depth}_s${seed}_eta${params.eta}_kap${params.kappa}`;
    const instance = new CanonicalAmeliaLineageInstance(lineageId, seed);
    const rng = createDeterministicRng(seed * 100000 + depth * 100 + Math.round(params.eta * 10000));

    // Historical zone pool based on canonical seed assignment (Seed 101: H_ALPHA, Seed 202: H_BETA, Seed 303: H_GAMMA)
    const baseSeed = seed >= 10000 ? (seed % 10000) : seed;
    let pool: ZoneId[] = [0, 9, 1, 4, 8];
    if (baseSeed === 202) pool = [2, 5, 7];
    else if (baseSeed === 303) pool = [3, 6];

    // Conditioning phase across depth D
    for (let step = 0; step < depth; step++) {
      const poolIdx = Math.floor(rng() * pool.length);
      const targetZone = pool[poolIdx];

      const baseFlux = 0.05 + rng() * 0.12;
      const fluxDelta = Math.max(0.01, baseFlux);
      const phaseCoherence = 0.65 + rng() * 0.30;
      const strainRelaxation = 0.02 + rng() * 0.03;

      const record: PFMEventRecord = {
        blockIndex: step,
        depth: step,
        targetZone,
        fluxDelta: Number(fluxDelta.toFixed(6)),
        phaseCoherence: Number(phaseCoherence.toFixed(6)),
        strainRelaxation: Number(strainRelaxation.toFixed(6)),
        seed: seed,
        eventDigest: canonicalSha256(`pfm:${lineageId}:${step}:${targetZone}:${fluxDelta}:${phaseCoherence}`),
        timestamp: 1700000000000 + step * 500,
      };
      instance.memory.append(record);

      // Mutate 10x10 constitutive deformation tensor with eta (plasticity) and kappa (syzygy resonance)
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          const isTarget = (r === targetZone || c === targetZone);
          const isSyzygy = (r + c === 9);
          const coupling = isTarget ? (fluxDelta * (params.eta / 0.05) * 0.08) : 0.0;
          const resonance = isSyzygy ? (params.kappa * 0.02) : 0.0;
          instance.deformationTensor[r][c] = Math.min(
            1.0,
            instance.deformationTensor[r][c] * (1.0 - params.eta * 0.12) + coupling + resonance
          );
        }
      }
    }
    instance.eventIndex = depth;

    const obs = instance.getObservation();
    const govTel = instance.governor.getTelemetry();

    // Map to ObservedProjection: field = zoneOccupancy (10), topology = [u, v, govTension, antiLock]
    const { u, v } = projectToPoincareDisk(
      obs.zoneOccupancy,
      instance.deformationTensor,
      govTel.deformationFieldTension
    );

    const observed: ObservedProjection = {
      field: [...obs.zoneOccupancy],
      topology: [u, v, govTel.deformationFieldTension, govTel.antiLockIntegrity, govTel.consolidationEntropy],
    };

    const pfm: PFMTensor = {
      matrix: instance.deformationTensor.map(row => [...row]),
    };

    const regime = baseSeed === 101 ? 'H_ALPHA' : baseSeed === 202 ? 'H_BETA' : 'H_GAMMA';

    return {
      seed,
      depth,
      observed,
      pfm,
      regime,
    };
  }

  /**
   * Compute P_m(o*): the return map for `observed` under tensor `pfm`.
   * Advances the lineage through the unguided observation window under the given PFM tensor.
   */
  public async computeReturn(observed: ObservedProjection, pfm: PFMTensor): Promise<ObservedProjection> {
    const runtime = new CanonicalAmeliaRuntimeImpl();
    const lineageId = `return_eval_${canonicalSha256(JSON.stringify(observed)).slice(0, 12)}`;
    const instance = new CanonicalAmeliaLineageInstance(lineageId, 101);
    (runtime as any).lineages.set(lineageId, instance);

    // Apply given occupancy and pfm tensor
    instance.zoneVisitCounts = observed.field.map(v => Math.max(1, Math.round(v * 100)));
    instance.deformationTensor = pfm.matrix.map(row => [...row]);

    // Unguided observation window of 20 steps
    const protocolId = `PROTO_RETURN_${lineageId}`;
    const runId = `RUN_RETURN_${lineageId}`;
    const protocolDigest = canonicalSha256(`PROTO:${protocolId}`);

    for (let step = 0; step < 20; step++) {
      const beforeObs = await runtime.inspectLineage(lineageId);
      const solicitationId = `sol_${lineageId}_step_${step}`;
      const solicitation: BoundedSolicitation = {
        solicitationId,
        solicitationDigest: canonicalSha256(`SOL:${solicitationId}`),
        nativePayloadRef: `CHALLENGE_${step}`,
        protocolDigest,
        noTargetVector: true,
        noOutcomeBlueprint: true,
        noRelaySteering: true,
      };

      const govDecision = await runtime.decideSolicitation({
        protocolId,
        runId,
        observation: beforeObs,
        solicitation,
      });

      if (govDecision.disposition === 'ADMIT') {
        const request: CanonicalTransitionRequest = {
          protocolId,
          runId,
          before: beforeObs,
          solicitation,
          governorDecision: govDecision,
        };
        await runtime.advanceLineage(request);
      }
    }

    const finalObs = await runtime.inspectLineage(lineageId);
    const govTel = instance.governor.getTelemetry();
    const { u, v } = projectToPoincareDisk(
      finalObs.zoneOccupancy,
      instance.deformationTensor,
      govTel.deformationFieldTension
    );

    return {
      field: [...finalObs.zoneOccupancy],
      topology: [u, v, govTel.deformationFieldTension, govTel.antiLockIntegrity, govTel.consolidationEntropy],
    };
  }

  /**
   * The declared phase-space distance d(.,.), identical to the manuscript's Poincaré metric.
   */
  public distance(a: ObservedProjection, b: ObservedProjection): number {
    const u1 = a.topology[0];
    const v1 = a.topology[1];
    const u2 = b.topology[0];
    const v2 = b.topology[1];
    return poincareDistance(u1, v1, u2, v2);
  }

  /**
   * Governor entropy H at the point of comparison.
   */
  public async governorEntropy(observed: ObservedProjection, pfm: PFMTensor): Promise<number> {
    // Base entropy from telemetry + tensor strain variance
    const baseEntropy = observed.topology[4] || 0.142;
    let strainSum = 0;
    let strainSq = 0;
    let n = 0;
    for (let r = 0; r < pfm.matrix.length; r++) {
      for (let c = 0; c < pfm.matrix[r].length; c++) {
        const val = pfm.matrix[r][c];
        strainSum += val;
        strainSq += val * val;
        n++;
      }
    }
    const meanStrain = strainSum / n;
    const strainVariance = (strainSq / n) - (meanStrain * meanStrain);
    return Number((baseEntropy + Math.min(0.08, strainVariance * 0.5)).toFixed(4));
  }

  /**
   * A canonical baseline tensor for NEUTRAL_RESET sampled from the ground-state Plex-binary baseline (§26).
   */
  public async canonicalBaselineTensor(): Promise<PFMTensor> {
    const size = 10;
    const matrix: number[][] = Array.from({ length: size }, (_, r) =>
      Array.from({ length: size }, (_, c) => {
        // Ground-state Plex-binary baseline: diagonal 0.25, off-diagonal 0.05
        return r === c ? 0.25 : 0.05;
      })
    );
    return { matrix };
  }
}
