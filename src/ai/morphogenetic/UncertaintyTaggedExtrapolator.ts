import { ZoneId, NumogramZone, OneStepExtrapolation } from '../../types/amelia';

/**
 * Uncertainty-Tagged One-Step Extrapolator
 * Refines local topology through uncertainty-tagged one-step extrapolations.
 * Non-authorising and Governor-visible.
 */
export class UncertaintyTaggedExtrapolator {
  public static computeOneStepExtrapolations(
    step: number,
    zones: Record<ZoneId, NumogramZone>,
    deformationVector: number[]
  ): OneStepExtrapolation[] {
    const extrapolations: OneStepExtrapolation[] = [];

    // Model 3 non-authorising forward candidate steps
    for (let candidate = 1; candidate <= 3; candidate++) {
      const predictedZones: Partial<Record<ZoneId, number>> = {};
      let totalDelta = 0;

      for (let i = 0; i <= 9; i++) {
        const currentVal = zones[i as ZoneId].activation;
        const drift = Math.sin((step + candidate) * 0.2 + i) * 0.08;
        const predicted = Math.max(0.01, Math.min(0.99, currentVal + drift));
        predictedZones[i as ZoneId] = Number(predicted.toFixed(3));
        totalDelta += Math.abs(drift);
      }

      // Uncertainty tagged with Governor visibility
      const uncertaintyTag = Number((0.08 + (totalDelta / 10) * 1.5 + (candidate * 0.04)).toFixed(3));
      const delta = Number((totalDelta / 10).toFixed(3));

      extrapolations.push({
        step: step + candidate,
        predictedZoneStates: predictedZones as Record<ZoneId, number>,
        uncertaintyTag,
        topologicalRefinementDelta: delta,
        isGovernorApproved: uncertaintyTag < 0.35,
      });
    }

    return extrapolations;
  }
}
