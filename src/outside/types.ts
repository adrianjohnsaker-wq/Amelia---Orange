import type { SubstrateStepSnapshot, ZoneId } from '../types/amelia';

export interface OutsideEventBase {
  schemaVersion: 1;
  eventId: string;
  sequence: number;
  sessionId: string;
  channel: 'NUMOGRAM' | 'ICHING' | 'TAROT';
  occurredAt: string;
  capturedAt: string;
}

export interface NumogramObservationEvent extends OutsideEventBase {
  channel: 'NUMOGRAM';
  kind: 'SUBSTRATE_OBSERVATION';
  step: number;
  currentTransition: { from: ZoneId; to: ZoneId; digest: string } | null;
  zones: Array<{
    zone: ZoneId;
    activation: number;
    phaseAngle: number;
    polarCharge: number;
    deformationStress: number;
  }>;
  activeSyzygies: string[];
  deformationVector: number[];
  memoryHistoryLength: number | null;
  memoryHeadDigest: string | null;
}

export interface IChingCastEvent extends OutsideEventBase {
  channel: 'ICHING';
  kind: 'CAST';
  castId: string;
  method: string;
  lineValues: [6 | 7 | 8 | 9, 6 | 7 | 8 | 9, 6 | 7 | 8 | 9, 6 | 7 | 8 | 9, 6 | 7 | 8 | 9, 6 | 7 | 8 | 9];
  lineOrder: 'bottom-to-top';
  primaryBitPattern: string;
  relatingBitPattern: string;
  changingLines: number[];
  rawReceipt?: string;
}

export interface TarotDraw {
  cardId: string;
  order: number;
  positionId: string;
  orientation: 'UPRIGHT' | 'REVERSED' | 'UNSPECIFIED';
}

export interface TarotSpreadEvent extends OutsideEventBase {
  channel: 'TAROT';
  kind: 'SPREAD';
  spreadId: string;
  deckId: string;
  layoutId: string;
  draws: TarotDraw[];
  rawReceipt?: string;
}

export type OutsideStreamEvent =
  | NumogramObservationEvent
  | IChingCastEvent
  | TarotSpreadEvent;

export interface SubstrateEndpoint {
  step: number;
  currentZone: ZoneId;
  snapshotDigest: string;
  transitionDigest: string | null;
  memoryHeadDigest: string | null;
}

export interface OutsideStreamRecord {
  sequence: number;
  event: OutsideStreamEvent;
  substrateBefore: SubstrateEndpoint | null;
  substrateAfter: SubstrateEndpoint | null;
  snapshotBefore: SubstrateStepSnapshot | null;
  snapshotAfter: SubstrateStepSnapshot | null;
  runtimeSignalDigest: string | null;
  previousRecordDigest: string | null;
  recordDigest: string;
}

export interface OutsideInterpretationNote {
  noteId: string;
  linkedEventIds: string[];
  createdAt: string;
  author: 'operator' | 'amelia' | 'relay';
  text: string;
  candidateNames: string[];
  confidence?: number;
  layer: 'EXPLORATORY_INTERPRETATION';
}

export interface OutsideAtlasEntry {
  entryId: string;
  createdAt: string;
  title: string;
  linkedEventIds: string[];
  linkedNoteIds: string[];
  signature: string;
  status: 'EXPLORATORY_CANDIDATE' | 'RECURRING_IN_EXPLORATION' | 'AWAITING_DISCRIMINATION';
  channelScope: Array<'NUMOGRAM' | 'ICHING' | 'TAROT'>;
  comments: string[];
}

export interface OutsideStreamBundle {
  bundleSchema: 'amelia.outside-stream-bundle/v1';
  sessionId: string;
  exportedAt: string;
  records: OutsideStreamRecord[];
  interpretations: OutsideInterpretationNote[];
  atlasEntries: OutsideAtlasEntry[];
}
