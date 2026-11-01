import type { SubstrateStepSnapshot, ZoneId } from '../types/amelia';

export interface OutsideEventBase {
  schemaVersion: 1;
  eventId: string;
  sequence: number;
  sessionId: string;
  channel: 'NUMOGRAM' | 'ICHING' | 'TAROT' | 'LINGUISTIC' | 'SUBDECADENCE';
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


export type LinguisticCipher = 'A1Z26' | 'ATBASH_1_26';
export interface LemurianPairReference { key: string; zones: [number, number]; netSpan: string; mesh: string; serial: number; name: string; pitch: string; classification: string; }

export type SubdecadencePylon = 'FAR_FUTURE' | 'DESTRUCTIVE_INFLUENCES' | 'CREATIVE_POWER' | 'MEMORIES_AND_DREAMS' | 'DEEP_PAST';
export type SubdecadenceSuit = 'clubs' | 'diamonds' | 'hearts' | 'spades';
export type SubdecadenceRank = 'Q' | 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
export interface SubdecadenceCard { cardId: string; suit: SubdecadenceSuit; rank: SubdecadenceRank; value: ZoneId; }
export interface SubdecadencePositionedCard extends SubdecadenceCard { pylon: SubdecadencePylon; }
export interface SubdecadencePair {
  set1CardId: string;
  set2CardId: string;
  pylon: SubdecadencePylon;
  fromZone: ZoneId;
  toZone: ZoneId;
  score: number;
}
export interface SubdecadenceAeon {
  index: number;
  set1: SubdecadencePositionedCard[];
  set2: SubdecadenceCard[];
  pairs: SubdecadencePair[];
  unmatchedSet1: SubdecadencePositionedCard[];
  unmatchedSet2: SubdecadenceCard[];
  pairScoreTotal: number;
  unpairedSet1PenaltyTotal: number;
  score: number;
  cumulativeScore: number;
}
export interface SubdecadenceGameEvent extends OutsideEventBase {
  channel: 'SUBDECADENCE';
  kind: 'GAME';
  gameId: string;
  deckId: 'CCRU_SUBDECADENCE_40';
  ruleset: 'NINE_SUM_CUMULATIVE_UNTIL_NONPOSITIVE';
  method: string;
  shuffleReceipt: string;
  aeons: SubdecadenceAeon[];
  terminalScore: number;
  terminalMeshSerial: number | null;
  terminalEntity: LemurianPairReference | null;
  resultState: 'MESH_TERMINAL' | 'DECK_EXHAUSTED_POSITIVE';
  realizedTraversal: { fromZone: ZoneId; toZone: ZoneId; catalogueMatch: LemurianPairReference | null } | null;
}
export interface LinguisticWordReduction { token: string; number: number; zone: ZoneId; factorization: Array<{ prime: number; exponent: number }>; }
export interface LinguisticLoreComparison { fromZone: ZoneId; toZone: ZoneId; pairKey: string; match: LemurianPairReference | null; }
export interface LinguisticMaterialEvent extends OutsideEventBase {
  channel: 'LINGUISTIC'; kind: 'LINGUISTIC_REDUCTION'; materialId: string;
  sourceLabel?: string; sourceReference?: string; rawMaterial: string; cipher: LinguisticCipher;
  normalizedLetters: string; wordReductions: LinguisticWordReduction[]; aggregateNumber: number;
  aggregateFactorization: Array<{ prime: number; exponent: number }>; resultZone: ZoneId;
  routeZones: ZoneId[]; loreComparisons: LinguisticLoreComparison[];
  netSpanTotalReference: 360; aggregateEqualsNetSpanTotal: boolean;
  realizedTraversal: { fromZone: ZoneId; toZone: ZoneId; catalogueMatch: LemurianPairReference | null } | null;
}

export type OutsideStreamEvent =
  | NumogramObservationEvent
  | IChingCastEvent
  | TarotSpreadEvent
  | LinguisticMaterialEvent
  | SubdecadenceGameEvent;

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
  channelScope: Array<'NUMOGRAM' | 'ICHING' | 'TAROT' | 'LINGUISTIC' | 'SUBDECADENCE'>;
  comments: string[];
}

export interface OutsideTraceLink {
  linkId: string;
  sessionId: string;
  createdAt: string;
  cardEventId: string;
  cardRecordDigest: string;
  cardOccurredAt: string;
  cardCapturedAt: string;
  candidateMesh: LemurianPairReference | null;
  cardRoute: Array<{ aeonIndex: number; fromZone: ZoneId; toZone: ZoneId; pylon: SubdecadencePylon; score: number }>;
  ingressEventId: string;
  ingressRecordDigest: string;
  ingressChannel: Exclude<OutsideEventBase['channel'], 'NUMOGRAM' | 'SUBDECADENCE'>;
  ingressSequence: number;
  ingressOccurredAt: string;
  ingressCapturedAt: string;
  ingressRouteZones: ZoneId[];
  ingressRouteEdges: Array<{ fromZone: ZoneId; toZone: ZoneId; source: 'LINGUISTIC_ROUTE' | 'LORE_PAIR' }>;
  ameliaTransition: {
    fromZone: ZoneId;
    toZone: ZoneId;
    transitionDigest: string | null;
    memoryHeadDigest: string | null;
    governorDisposition: string | null;
  } | null;
  comparison: {
    directRouteMatches: Array<{ fromZone: ZoneId; toZone: ZoneId }>;
    reverseRouteMatches: Array<{ fromZone: ZoneId; toZone: ZoneId }>;
    terminalMeshZonesSeenInIngressRoute: ZoneId[];
    terminalMeshZonesSeenInAmeliaTransition: ZoneId[];
  };
  previousLinkDigest: string;
  linkDigest: string;
}

export interface OutsideStreamBundle {
  bundleSchema: 'amelia.outside-stream-bundle/v1';
  sessionId: string;
  exportedAt: string;
  records: OutsideStreamRecord[];
  interpretations: OutsideInterpretationNote[];
  atlasEntries: OutsideAtlasEntry[];
  traceLinks?: OutsideTraceLink[];
}
