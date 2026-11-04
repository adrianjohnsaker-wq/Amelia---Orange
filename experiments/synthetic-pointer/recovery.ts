/** A purely descriptive recovery measure. Never feed this score back as a reward. */
export function recovery(reference: readonly number[], damaged: readonly number[], later: readonly number[], minInjury = 1e-9) {
  if (!reference.length || reference.length !== damaged.length || reference.length !== later.length ||
      !Number.isFinite(minInjury) || minInjury <= 0 ||
      [...reference, ...damaged, ...later].some(x => !Number.isFinite(x))) {
    throw new Error('Invalid recovery measurement');
  }
  const distance = (a: readonly number[], b: readonly number[]) =>
    Math.sqrt(a.reduce((sum, value, i) => sum + (value - b[i]) ** 2, 0));
  const initialDistance = distance(damaged, reference);
  if (initialDistance < minInjury) throw new Error('Injury is too small for a meaningful recovery ratio');
  const laterDistance = distance(later, reference);
  return {
    metric: 'sxi.euclidean-recovery/v1' as const,
    initialDistance, laterDistance,
    recovery: (initialDistance - laterDistance) / initialDistance,
  };
}
