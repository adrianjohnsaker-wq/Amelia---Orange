import type { ExternalDevelopmentalRhythm } from '../types/amelia';

export interface LiveControlsCheckpoint {
  schema: 'amelia.live-controls/v1';
  advisoryWeight: number;
  momentumDamping: number;
  rhythms: Array<{ id: string; active: boolean }>;
  provenance: 'recorded' | 'legacy-assumed';
}

/** Preserve the operator's untuned values, not the last tuned Governor output. */
export function captureLiveControls(
  advisoryWeight: number,
  momentumDamping: number,
  rhythms: ExternalDevelopmentalRhythm[],
  provenance: LiveControlsCheckpoint['provenance'],
): LiveControlsCheckpoint {
  return readLiveControls({
    schema: 'amelia.live-controls/v1', advisoryWeight, momentumDamping,
    rhythms: rhythms.map(({ id, active }) => ({ id, active })), provenance,
  }, { advisoryWeight, momentumDamping }, rhythms);
}

/** Old checkpoints never recorded these settings; their values remain assumptions. */
export function readLiveControls(
  saved: unknown,
  fallback: { advisoryWeight: number; momentumDamping: number },
  defaultRhythms: ExternalDevelopmentalRhythm[],
): LiveControlsCheckpoint {
  const value = saved === undefined ? {
    schema: 'amelia.live-controls/v1', ...fallback,
    rhythms: defaultRhythms.map(({ id, active }) => ({ id, active })),
    provenance: 'legacy-assumed',
  } : saved;
  if (!value || typeof value !== 'object') throw new Error('Invalid saved live controls');
  const candidate = value as Partial<LiveControlsCheckpoint>;
  if (candidate.schema !== 'amelia.live-controls/v1' ||
      typeof candidate.advisoryWeight !== 'number' || !Number.isFinite(candidate.advisoryWeight) ||
      candidate.advisoryWeight < 0 || candidate.advisoryWeight > 1 ||
      typeof candidate.momentumDamping !== 'number' || !Number.isFinite(candidate.momentumDamping) ||
      candidate.momentumDamping < 0.1 || candidate.momentumDamping > 0.99 ||
      (candidate.provenance !== 'recorded' && candidate.provenance !== 'legacy-assumed') ||
      !Array.isArray(candidate.rhythms)) throw new Error('Invalid saved live controls');
  const expectedIds = new Set(defaultRhythms.map(r => r.id));
  const seen = new Set<string>();
  for (const rhythm of candidate.rhythms) {
    if (!rhythm || typeof rhythm.id !== 'string' || typeof rhythm.active !== 'boolean' ||
        !expectedIds.has(rhythm.id) || seen.has(rhythm.id)) throw new Error('Invalid saved live rhythms');
    seen.add(rhythm.id);
  }
  if (seen.size !== expectedIds.size) throw new Error('Incomplete saved live rhythms');
  return {
    schema: 'amelia.live-controls/v1', advisoryWeight: candidate.advisoryWeight,
    momentumDamping: candidate.momentumDamping, provenance: candidate.provenance,
    rhythms: defaultRhythms.map(({ id }) => ({ id, active: candidate.rhythms!.find(r => r.id === id)!.active })),
  };
}
