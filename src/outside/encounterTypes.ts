/**
 * Outside-encounter types. They live here, outside the PF-pinned paths (src/substrate, src/governance,
 * src/ai/numogram, src/types/amelia.ts), so that the encounter channel can grow without touching the frozen core.
 */
import type { SubstrateStepSnapshot } from '../types/amelia';

export type OutsideChannel = 'NUMOGRAM' | 'ICHING' | 'TAROT' | 'LINGUISTIC' | 'SUBDECADENCE' | 'SYNTHETIC_FIELD';
export type EncounterDisposition = 'ATTEND' | 'DEFER' | 'REFUSE';
export interface SyntheticSourceContext {
  schema: 'amelia.live-source-context/v1';
  bodyDigest: string;
  sourceId: string;
  sourceStep: number;
  sourceStateDigest: string;
  pointerVector: number[];
  regionMeans: number[];
}
export interface SubstrateEncounterInput { eventId: string; channel: OutsideChannel; sourceDigest: string; attentionVector: number[];
  sourceContext?: SyntheticSourceContext; }
export interface EncounterDecisionTrace extends SubstrateEncounterInput { disposition: EncounterDisposition; reason: string; applied: boolean; }
export type OutsideStepSnapshot = SubstrateStepSnapshot & { encounterDecisions?: EncounterDecisionTrace[] };
