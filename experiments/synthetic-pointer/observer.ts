import { AmeliaOutsideRuntime } from '../../src/outside/OutsideEncounterRuntime';
import type { OutsideStepSnapshot, SubstrateEncounterInput } from '../../src/outside/encounterTypes';
import { withFullNumogram, FULL_NUMOGRAM_GATES } from '../../src/core/fullNumogram';
import { initMorphogeneticState } from '../../src/substrate/AmeliaMorphogeneticSubstrate';
import type { MorphogeneticPreset, MorphogeneticState } from '../../src/substrate/AmeliaMorphogeneticSubstrate';
import { digest } from './canonical';

export interface FieldObservation {
  version: 'sxi.field-observation/v1';
  bodyStep: number;
  regionMap: 'ten-vertical-bands/v1';
  width: number;
  height: number;
  regionMeans: number[];
  attentionVector: number[] | null;
  noObservationReason: string | null;
  epsilon: number;
  sourceDigest: string;
}

/** The mapping is an explicit sensor convention, not a claim about intrinsic zone identities. */
export function observeField(state: MorphogeneticState, epsilon = 1e-12): FieldObservation {
  const { width, height, cells, stepCount } = state;
  if (!Number.isInteger(width) || width < 10 || !Number.isInteger(height) || height < 3 ||
      cells.length !== width * height || !Number.isFinite(epsilon) || epsilon <= 0) {
    throw new Error('Invalid dimensions or observation tolerance');
  }
  const sums = Array<number>(10).fill(0);
  const counts = Array<number>(10).fill(0);
  for (let i = 0; i < cells.length; i++) {
    const b = cells[i].B;
    if (!Number.isFinite(b) || b < 0 || b > 1) throw new Error('Invalid field activation');
    const zone = Math.floor(10 * (i % width) / width);
    sums[zone] += b;
    counts[zone]++;
  }
  const regionMeans = sums.map((sum, z) => sum / counts[z]);
  const total = regionMeans.reduce((a, b) => a + b, 0);
  const attentionVector = total > epsilon ? regionMeans.map(x => x / total) : null;
  const body = {
    version: 'sxi.field-observation/v1' as const,
    bodyStep: stepCount,
    regionMap: 'ten-vertical-bands/v1' as const,
    width, height, regionMeans, attentionVector,
    noObservationReason: attentionVector ? null : 'TOTAL_AT_OR_BELOW_EPSILON',
    epsilon,
  };
  return { ...body, sourceDigest: digest(body) };
}

/** Queue one field observation for the step already called by stepAmeliaSubstrate. */
export class SyntheticQueueRuntime extends AmeliaOutsideRuntime {
  private syntheticQueued: SubstrateEncounterInput | null = null;

  public queueSynthetic(input: SubstrateEncounterInput): void {
    if (this.syntheticQueued) throw new Error('A synthetic observation is already queued');
    if (input.channel !== 'SYNTHETIC_FIELD') throw new Error('Expected a labelled synthetic field observation');
    this.syntheticQueued = JSON.parse(JSON.stringify(input));
  }

  public override step(inputSignal?: string, encounter?: SubstrateEncounterInput): OutsideStepSnapshot {
    if (this.syntheticQueued && encounter) throw new Error('Cannot combine two newly submitted encounters in one step');
    const submitted = this.syntheticQueued ?? encounter;
    this.syntheticQueued = null;
    // Existing runtime retains responsibility for validation, deferral, refusal and gate choice.
    return super.step(inputSignal, submitted);
  }

  public override exportState(): Record<string, unknown> {
    return { ...super.exportState(), syntheticQueued: this.syntheticQueued ? JSON.parse(JSON.stringify(this.syntheticQueued)) : null };
  }

  public override importState(state: Record<string, unknown>): void {
    super.importState(state);
    this.syntheticQueued = state.syntheticQueued ? JSON.parse(JSON.stringify(state.syntheticQueued)) as SubstrateEncounterInput : null;
  }
}

export function createReferenceField(config: {
  width: number; height: number; preset: MorphogeneticPreset; seed: number; noiseAmp: number;
}): MorphogeneticState {
  if (config.width < 10 || config.height < 5) throw new Error('Reference field requires at least a 10 x 5 grid');
  const runtime = new SyntheticQueueRuntime();
  withFullNumogram(runtime);
  runtime.setSuppressRelaySteering(true);
  if (runtime.getQabbala().getGates().length !== FULL_NUMOGRAM_GATES.length) throw new Error('Full Numogram installation failed');
  return initMorphogeneticState(config.width, config.height, config.preset, config.seed, config.noiseAmp, undefined, runtime);
}
