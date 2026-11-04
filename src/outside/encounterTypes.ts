/**
 * Outside-encounter types. They live here, outside the PF-pinned paths (src/substrate, src/governance,
 * src/ai/numogram, src/types/amelia.ts), so that the encounter channel can grow without touching the frozen core.
 */
import type { SubstrateStepSnapshot } from '../types/amelia';

// Synthetic observations carry their provenance explicitly.  The experimental
// adapter is isolated under experiments/synthetic-pointer; this type extension
// does not enable a stream or change how existing encounters are governed.
export type OutsideChannel = 'NUMOGRAM' | 'ICHING' | 'TAROT' | 'LINGUISTIC' | 'SUBDECADENCE' | 'SYNTHETIC_FIELD';
export type EncounterDisposition = 'ATTEND' | 'DEFER' | 'REFUSE';
export interface SubstrateEncounterInput { eventId: string; channel: OutsideChannel; sourceDigest: string; attentionVector: number[]; }
export interface EncounterDecisionTrace extends SubstrateEncounterInput { disposition: EncounterDisposition; reason: string; applied: boolean; }
export type OutsideStepSnapshot = SubstrateStepSnapshot & { encounterDecisions?: EncounterDecisionTrace[] };
