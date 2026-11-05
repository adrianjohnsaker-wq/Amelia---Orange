/** The live morphogenetic field's connection to the existing governed runtime. */
import { canonicalSha256 } from '../lib/sha256';
import { CanonicalAmeliaLineageInstance, type LineageStateSnapshot } from '../substrate/canonicalAmeliaRuntimeImpl';
import { initMorphogeneticState, stepAmeliaSubstrate } from '../substrate/AmeliaMorphogeneticSubstrate';
import type { MorphogeneticPreset, MorphogeneticState } from '../substrate/AmeliaMorphogeneticSubstrate';
import { AmeliaOutsideRuntime } from './OutsideEncounterRuntime';
import type { OutsideStepSnapshot, SubstrateEncounterInput } from './encounterTypes';

type FieldBody = Omit<MorphogeneticState, 'nativeRuntime' | 'lineageInstance'>;
export interface LiveFieldCheckpoint {
  schema: 'amelia.live-field/v1';
  payload: string;
  runtimeStep: number;
  running: boolean;
  checksum: string;
}

type FieldPayload = { schema: 'amelia.live-field/v1'; body: FieldBody;
  lineage: { snapshot: LineageStateSnapshot; traitHistory: unknown }; runtimeStep: number; running: boolean };
const NEGATIVE_ZERO = '$amelia_negative_zero';
function canonicalValue(value: any, inArray = false): any {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Non-finite live field checkpoint value');
    return Object.is(value, -0) ? { [NEGATIVE_ZERO]: true } : value;
  }
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (value === undefined && inArray) return null;
  if (Array.isArray(value)) return value.map(v => canonicalValue(v, true));
  if (value && typeof value === 'object') {
    if (Object.prototype.hasOwnProperty.call(value, NEGATIVE_ZERO)) throw new Error('Reserved live field checkpoint key');
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort()) if (value[key] !== undefined) out[key] = canonicalValue(value[key]);
    return out;
  }
  throw new Error('Unsupported live field checkpoint value');
}
function encodePayload(value: FieldPayload): string {
  // ASCII JSON makes the browser and Node SHA implementations agree, including Unicode names.
  return JSON.stringify(canonicalValue(value)).replace(/[^\x00-\x7f]/g, c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);
}
function decodePayload(value: string): FieldPayload {
  return JSON.parse(value, (_key, item) => item && typeof item === 'object' && !Array.isArray(item) &&
    Object.keys(item).length === 1 && item[NEGATIVE_ZERO] === true ? -0 : item) as FieldPayload;
}

export interface LiveFieldObservation {
  bodyStep: number;
  regionMap: 'ten-vertical-bands/v1';
  regionMeans: number[];
  attentionVector: number[] | null;
  sourceDigest: string;
}

function currentRuntimeStep(runtime: AmeliaOutsideRuntime): number {
  return runtime.getSnapshots().at(-1)?.step ?? Number(runtime.exportState().stepCount);
}

/** The ten regions are a fixed measurement convention, not intrinsic zone identities. */
export function observeLiveField(state: MorphogeneticState): LiveFieldObservation {
  const { width, height, cells, stepCount } = state;
  if (!Number.isInteger(width) || width < 10 || !Number.isInteger(height) || height < 1 || cells.length !== width * height)
    throw new Error('Invalid live field dimensions');
  const sums = Array<number>(10).fill(0), counts = Array<number>(10).fill(0);
  for (let i = 0; i < cells.length; i++) {
    const { A, B } = cells[i];
    if (!Number.isFinite(A) || !Number.isFinite(B) || A < 0 || A > 1 || B < 0 || B > 1)
      throw new Error('Invalid live field cell');
    const zone = Math.floor(10 * (i % width) / width);
    sums[zone] += B; counts[zone]++;
  }
  const regionMeans = sums.map((sum, i) => sum / counts[i]);
  const total = regionMeans.reduce((a, b) => a + b, 0);
  const attentionVector = total > 1e-12 ? regionMeans.map(v => v / total) : null;
  const sourceDigest = canonicalSha256(JSON.stringify({ schema: 'amelia.live-field-observation/v1',
    bodyStep: stepCount, width, height, seed: state.seed, preset: state.preset,
    cells: cells.map(({ A, B }) => [A, B]), regionMeans }));
  return { bodyStep: stepCount, regionMap: 'ten-vertical-bands/v1', regionMeans, attentionVector, sourceDigest };
}

export function createLiveField(runtime: AmeliaOutsideRuntime, config: {
  seed: number; depth: number; preset: MorphogeneticPreset; size: number;
}): MorphogeneticState {
  const lineage = new CanonicalAmeliaLineageInstance(`amelia-lineage-s${config.seed}-d${config.depth}`, config.seed);
  lineage.memory.importState(runtime.getMemory().exportState());
  lineage.eventIndex = runtime.getMemory().getEvents().length;
  lineage.currentZone = runtime.getCurrentZone();
  return initMorphogeneticState(config.size, config.size, config.preset, config.seed, 0.003, lineage, runtime);
}

/**
 * The application uses the live mapping. The other mappings are for use on
 * isolated experimental copies: uniform preserves total attention, while a
 * permutation preserves both total attention and the distribution of weights.
 */
export interface SyntheticSourceOffer {
  schema: 'amelia.synthetic-source-offer/v1';
  bodyDigest: string;
  sourceId: string;
  sourceStep: number;
  sourceStateDigest: string;
  attentionVector: number[];
  /** Opt-in application recording; absent in the registered headless study. */
  recordContext?: boolean;
}
export type FieldMapping = 'live' | 'uniform' | { permutation: number[] } | { source: SyntheticSourceOffer };

/** Binds the recorded source response to the body observation that produced it. */
export function syntheticSourceOfferDigest(offer: SyntheticSourceOffer): string {
  return canonicalSha256(JSON.stringify({ schema: offer.schema, bodyDigest: offer.bodyDigest,
    sourceId: offer.sourceId, sourceStep: offer.sourceStep, sourceStateDigest: offer.sourceStateDigest,
    attentionVector: offer.attentionVector }));
}

/** Advance the field and the existing runtime exactly once, with Governor-gated body feedback. */
export function advanceLiveField(state: MorphogeneticState, mapping: FieldMapping = 'live'): {
  state: MorphogeneticState; observation: LiveFieldObservation; snapshot: OutsideStepSnapshot;
} {
  const runtime = state.nativeRuntime;
  if (!(runtime instanceof AmeliaOutsideRuntime) || !state.lineageInstance) throw new Error('Live field requires the shared Amelia runtime and lineage');
  const observation = observeLiveField(state);
  const runtimeStep = currentRuntimeStep(runtime);
  let attentionVector = observation.attentionVector;
  let sourceDigest = observation.sourceDigest;
  let eventId = `field:${runtimeStep + 1}:${observation.bodyStep}:${sourceDigest.slice(0, 16)}`;
  let sourceContext: SubstrateEncounterInput['sourceContext'];
  if (typeof mapping === 'object' && 'source' in mapping) {
    const source = mapping.source;
    const v = source?.attentionVector;
    if (!source || source.schema !== 'amelia.synthetic-source-offer/v1' || source.bodyDigest !== observation.sourceDigest ||
        !/^[a-z0-9._-]{1,64}$/.test(source.sourceId) || !Number.isSafeInteger(source.sourceStep) || source.sourceStep < 1 ||
        !/^[a-f0-9]{64}$/.test(source.sourceStateDigest) || !Array.isArray(v) || v.length !== 10 ||
        v.some(x => !Number.isFinite(x) || x < 0 || x > 1) || Math.abs(v.reduce((a,b) => a + b, 0) - 1) > 1e-9)
      throw new Error('Invalid or stale synthetic source offer');
    attentionVector = [...v];
    sourceDigest = syntheticSourceOfferDigest(source);
    eventId = `source:${runtimeStep + 1}:${observation.bodyStep}:${sourceDigest.slice(0, 16)}`;
    if (source.recordContext) {
      if (!observation.attentionVector) throw new Error('Cannot record source context without a body observation');
      sourceContext = { schema: 'amelia.live-source-context/v1', bodyDigest: observation.sourceDigest,
        sourceId: source.sourceId, sourceStep: source.sourceStep, sourceStateDigest: source.sourceStateDigest,
        pointerVector: [...observation.attentionVector], regionMeans: [...observation.regionMeans] };
    }
  } else if (typeof mapping === 'object' && 'permutation' in mapping) {
    if (!Array.isArray(mapping.permutation) || mapping.permutation.length !== 10 ||
        new Set(mapping.permutation).size !== 10 || mapping.permutation.some(i => !Number.isInteger(i) || i < 0 || i > 9))
      throw new Error('Invalid experimental field-zone permutation');
    if (attentionVector) attentionVector = mapping.permutation.map(i => attentionVector![i]);
  } else if (mapping === 'uniform' && attentionVector) {
    attentionVector = Array<number>(10).fill(0.1);
  } else if (mapping !== 'live' && mapping !== 'uniform') throw new Error('Invalid experimental field mapping');
  const encounter: SubstrateEncounterInput | undefined = attentionVector ? {
    eventId, channel: 'SYNTHETIC_FIELD', sourceDigest, attentionVector, ...(sourceContext ? { sourceContext } : {}),
  } : undefined;
  let stepped = false;
  // The native field function already steps the runtime. A temporary proxy supplies its
  // encounter without replacing the shared runtime or modifying the PF-pinned core.
  const proxied = new Proxy(runtime, {
    get(target, property) {
      if (property === 'step') return (input?: string) => {
        if (stepped) throw new Error('A field step attempted to advance the runtime twice');
        stepped = true;
        return target.step(input, encounter);
      };
      const value = Reflect.get(target, property, target);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
  const next = stepAmeliaSubstrate({ ...state, nativeRuntime: proxied });
  if (!stepped || currentRuntimeStep(runtime) !== runtimeStep + 1 || next.stepCount !== state.stepCount + 1)
    throw new Error('Live field/runtime step mismatch');
  next.nativeRuntime = runtime;
  const lineage = next.lineageInstance!;
  const chosen = runtime.getCurrentZone();
  lineage.memory.importState(runtime.getMemory().exportState());
  lineage.eventIndex = runtime.getMemory().getEvents().length;
  lineage.currentZone = chosen;
  lineage.zoneVisitCounts[chosen]++;
  for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) {
    lineage.deformationTensor[r][c] = r === chosen || c === chosen
      ? Math.min(1, lineage.deformationTensor[r][c] * 0.992 + 0.012)
      : lineage.deformationTensor[r][c] * 0.998;
  }
  const snapshot = runtime.getSnapshots().at(-1) as OutsideStepSnapshot | undefined;
  if (!snapshot || snapshot.step !== runtimeStep + 1) throw new Error('Missing live runtime snapshot');
  return { state: next, observation, snapshot };
}

/** Full field and lineage state; the matching runtime is saved in the same app record. */
export function captureLiveField(state: MorphogeneticState, running: boolean): LiveFieldCheckpoint {
  if (!state.lineageInstance) throw new Error('Cannot save a live field without its lineage');
  const { nativeRuntime, lineageInstance, ...body } = state;
  const runtimeStep = currentRuntimeStep(nativeRuntime as AmeliaOutsideRuntime);
  const payload = encodePayload({ schema: 'amelia.live-field/v1', body,
    lineage: { snapshot: lineageInstance.exportSnapshot(), traitHistory: lineageInstance.traitEvolution.exportState() },
    runtimeStep, running });
  return { schema: 'amelia.live-field/v1', payload, runtimeStep, running, checksum: canonicalSha256(payload) };
}

export function restoreLiveField(saved: LiveFieldCheckpoint, runtime: AmeliaOutsideRuntime): MorphogeneticState {
  if (!saved || saved.schema !== 'amelia.live-field/v1' || typeof saved.payload !== 'string' || typeof saved.checksum !== 'string') throw new Error('Invalid live field checkpoint');
  if (canonicalSha256(saved.payload) !== saved.checksum) throw new Error('Live field checkpoint checksum mismatch');
  const decoded = decodePayload(saved.payload);
  if (decoded.schema !== saved.schema || decoded.running !== saved.running || decoded.runtimeStep !== saved.runtimeStep)
    throw new Error('Live field checkpoint metadata mismatch');
  const body = decoded.body, snap = decoded.lineage?.snapshot;
  if (!body || !snap || !Number.isInteger(body.width) || body.width < 10 || !Number.isInteger(body.height) || body.height < 1 ||
      !Array.isArray(body.cells) || body.cells.length !== body.width * body.height || !Number.isInteger(body.stepCount) ||
      !Number.isFinite(saved.runtimeStep) || typeof saved.running !== 'boolean') throw new Error('Invalid saved live field');
  const lineage = new CanonicalAmeliaLineageInstance(snap.lineageId, snap.seed);
  lineage.restoreSnapshot(snap);
  lineage.traitEvolution.importState(decoded.lineage.traitHistory as any);
  const field = body;
  const restored = { ...field, nativeRuntime: runtime, lineageInstance: lineage };
  const session = (restored as MorphogeneticState & { syntheticSourceSession?: any }).syntheticSourceSession;
  if (session && (session.schema !== 'amelia.live-synthetic-source/v1' || typeof session.enabled !== 'boolean' ||
      !session.sourceState || !Number.isSafeInteger(session.sourceState.step) || session.sourceState.step < 0 ||
      !Number.isFinite(session.sourceState.smoothedCentroid) || session.sourceState.smoothedCentroid < 0 ||
      session.sourceState.smoothedCentroid > 1 || ![0, 1].includes(session.sourceState.address)))
    throw new Error('Invalid saved synthetic source session');
  observeLiveField(restored); // Reject malformed cell values rather than silently resetting the body.
  return restored;
}
