import type {
  LemurianPairReference,
  SubdecadenceAeon,
  SubdecadenceCard,
  SubdecadenceGameEvent,
  SubdecadencePair,
  SubdecadencePylon,
  SubdecadencePositionedCard,
  SubdecadenceRank,
  SubdecadenceSuit,
} from './types';
import { lemurianEntryBySerial } from './LinguisticReduction';

export type SubdecadenceGameDraft = Pick<
  SubdecadenceGameEvent,
  'gameId' | 'deckId' | 'ruleset' | 'method' | 'shuffleReceipt' | 'aeons' |
  'terminalScore' | 'terminalMeshSerial' | 'terminalEntity' | 'resultState'
>;

const SUITS: SubdecadenceSuit[] = ['clubs', 'diamonds', 'hearts', 'spades'];
const RANKS: Array<{ rank: SubdecadenceRank; value: number }> = [
  { rank: 'Q', value: 0 }, { rank: 'A', value: 1 }, { rank: '2', value: 2 },
  { rank: '3', value: 3 }, { rank: '4', value: 4 }, { rank: '5', value: 5 },
  { rank: '6', value: 6 }, { rank: '7', value: 7 }, { rank: '8', value: 8 },
  { rank: '9', value: 9 },
];
export const SUBDECADENCE_PYLON_ORDER: SubdecadencePylon[] = [
  'FAR_FUTURE', 'DESTRUCTIVE_INFLUENCES', 'CREATIVE_POWER',
  'MEMORIES_AND_DREAMS', 'DEEP_PAST',
];
const RULES = '40-card pack; Queens=0, A=1…9; Set-1 cross order top/left/right/center/bottom; reveal Set-2 in order; pair with first available Set-1 card summing to 9; pair score is absolute difference; unmatched Set-1 values subtract; signed Aeon scores accumulate until cumulative score is non-positive or the deck is exhausted.';

function secureReceipt(): string {
  if (!globalThis.crypto?.getRandomValues) throw new Error('Web Crypto is required for a Subdecadence shuffle.');
  const bytes = new Uint8Array(1024);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}
function receiptBytes(hex: string): Uint8Array {
  if (!/^(?:[0-9a-fA-F]{2})+$/.test(hex)) throw new Error('Shuffle receipt must be an even-length hexadecimal string.');
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  if (bytes.length < 128) throw new Error('Shuffle receipt is too short for an auditable deck shuffle.');
  return bytes;
}
function shuffleWithReceipt<T>(items: T[], bytes: Uint8Array): T[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let wordIndex = 0;
  const below = (limit: number): number => {
    const range = 0x100000000;
    const cutoff = Math.floor(range / limit) * limit;
    while (wordIndex * 4 + 4 <= bytes.length) {
      const word = view.getUint32(wordIndex * 4, false);
      wordIndex += 1;
      if (word < cutoff) return word % limit;
    }
    throw new Error('Shuffle receipt exhausted during unbiased Fisher–Yates shuffle.');
  };
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = below(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
function makeDeck(): SubdecadenceCard[] {
  return SUITS.flatMap(suit => RANKS.map(({ rank, value }) => ({
    cardId: suit + '-' + rank,
    suit,
    rank,
    value: value as SubdecadenceCard['value'],
  })));
}
function meshForScore(score: number): { serial: number | null; entity: LemurianPairReference | null } {
  if (score > 0) return { serial: null, entity: null };
  const serial = Math.abs(score);
  if (serial > 44) throw new Error('Terminal Subdecadence score falls outside Mesh 00–44.');
  const entity = lemurianEntryBySerial(serial);
  if (!entity) throw new Error('Pandemonium Matrix is missing Mesh serial ' + String(serial).padStart(2, '0') + '.');
  return { serial, entity };
}

/** Draw and score one complete Subdecadence session using a replayable Web Crypto receipt. */
export function createSubdecadenceDraft(gameId: string, suppliedReceipt?: string): SubdecadenceGameDraft {
  if (!gameId.trim()) throw new Error('A Subdecadence gameId is required.');
  const shuffleReceipt = suppliedReceipt ?? secureReceipt();
  const deck = shuffleWithReceipt(makeDeck(), receiptBytes(shuffleReceipt));
  const aeons: SubdecadenceAeon[] = [];
  let cumulativeScore = 0;

  while (deck.length >= 10) {
    const set1: SubdecadencePositionedCard[] = deck.splice(0, 5).map((card, i) => ({
      ...card, pylon: SUBDECADENCE_PYLON_ORDER[i],
    }));
    const set2: SubdecadenceCard[] = deck.splice(0, 5);
    const available = [...set1];
    const pairs: SubdecadencePair[] = [];
    const unmatchedSet2: SubdecadenceCard[] = [];

    for (const revealed of set2) {
      const index = available.findIndex(card => card.value + revealed.value === 9);
      if (index < 0) {
        unmatchedSet2.push(revealed);
        continue;
      }
      const matched = available.splice(index, 1)[0];
      pairs.push({
        set1CardId: matched.cardId,
        set2CardId: revealed.cardId,
        pylon: matched.pylon,
        fromZone: matched.value,
        toZone: revealed.value,
        score: Math.abs(matched.value - revealed.value),
      });
    }

    const pairScoreTotal = pairs.reduce((sum, pair) => sum + pair.score, 0);
    const unpairedSet1PenaltyTotal = available.reduce((sum, card) => sum + card.value, 0);
    const score = pairScoreTotal - unpairedSet1PenaltyTotal;
    cumulativeScore += score;
    aeons.push({
      index: aeons.length + 1,
      set1,
      set2,
      pairs,
      unmatchedSet1: available,
      unmatchedSet2,
      pairScoreTotal,
      unpairedSet1PenaltyTotal,
      score,
      cumulativeScore,
    });
    if (cumulativeScore <= 0) break;
  }

  const terminal = meshForScore(cumulativeScore);
  return {
    gameId,
    deckId: 'CCRU_SUBDECADENCE_40',
    ruleset: 'NINE_SUM_CUMULATIVE_UNTIL_NONPOSITIVE',
    method: RULES,
    shuffleReceipt,
    aeons,
    terminalScore: cumulativeScore,
    terminalMeshSerial: terminal.serial,
    terminalEntity: terminal.entity,
    resultState: terminal.serial === null ? 'DECK_EXHAUSTED_POSITIVE' : 'MESH_TERMINAL',
  };
}
