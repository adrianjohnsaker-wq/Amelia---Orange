/**
 * The Outside inbox: a small public file the continuous receiver writes each cycle
 * (branch outside-live-ledger, outside-inbox.json), which the tablet reads to deliver
 * the same encounters to Amelia through her native path: runtime.step(undefined, encounter).
 * Only the encounter itself travels (channel, source digest, attention vector).
 * The receiver's own Governor decisions are not carried: Amelia's Governor decides for her.
 */
import type { SubstrateEncounterInput } from './encounterTypes';

export const OUTSIDE_INBOX_SCHEMA = 'amelia.outside-inbox/v1';
export const OUTSIDE_INBOX_URL =
  'https://raw.githubusercontent.com/adrianjohnsaker-wq/Amelia---Orange/outside-live-ledger/outside-inbox.json';
export const OUTSIDE_INBOX_SIZE = 500;

export interface OutsideInboxEntry {
  sequence: number;
  eventId: string;
  channel: string;
  sourceDigest: string;
  attentionVector: number[];
  occurredAt: string;
  capturedAt: string;
}
export interface OutsideInbox { schema: typeof OUTSIDE_INBOX_SCHEMA; updatedAt: string; cycle: string; entries: OutsideInboxEntry[] }

type LedgerRecord = { sequence: number; event: { eventId: string; channel: string; occurredAt?: string; capturedAt?: string };
  snapshotAfter?: { encounterDecisions?: Array<{ eventId?: string; channel?: string; sourceDigest?: string; attentionVector?: number[] }> } };

/** Receiver side: each ledger record's own encounter (never the re-decided head of a deferral queue). */
export function buildOutsideInbox(records: LedgerRecord[], cycle: string, updatedAt: string): OutsideInbox {
  const entries: OutsideInboxEntry[] = [];
  for (const r of records) {
    const own = r.snapshotAfter?.encounterDecisions?.find(d => d.eventId === r.event.eventId);
    if (!own || !Array.isArray(own.attentionVector) || typeof own.sourceDigest !== 'string') continue;
    entries.push({ sequence: r.sequence, eventId: r.event.eventId, channel: own.channel ?? r.event.channel,
      sourceDigest: own.sourceDigest, attentionVector: [...own.attentionVector],
      occurredAt: r.event.occurredAt ?? '', capturedAt: r.event.capturedAt ?? '' });
  }
  return { schema: OUTSIDE_INBOX_SCHEMA, updatedAt, cycle, entries: entries.slice(-OUTSIDE_INBOX_SIZE) };
}

function validEntry(e: any): e is OutsideInboxEntry {
  const v = e?.attentionVector;
  const total = Array.isArray(v) ? v.reduce((a: number, b: number) => a + b, 0) : 0;
  return !!e && Number.isSafeInteger(e.sequence) && typeof e.eventId === 'string' && /^[\w:.-]{1,160}$/.test(e.eventId)
    && typeof e.channel === 'string' && /^[a-f0-9]{64}$/i.test(String(e.sourceDigest))
    && Array.isArray(v) && v.length === 10 && v.every((x: unknown) => typeof x === 'number' && Number.isFinite(x) && x >= 0 && x <= 1)
    && total > 0.99 && total < 1.01 && !Number.isNaN(Date.parse(e.capturedAt));
}

/** Tablet side: accept only well-formed entries; malformed ones are dropped, never repaired. */
export function parseOutsideInbox(value: unknown): OutsideInboxEntry[] {
  const inbox = value as Partial<OutsideInbox>;
  if (!inbox || inbox.schema !== OUTSIDE_INBOX_SCHEMA || !Array.isArray(inbox.entries)) throw new Error('Not an Amelia Outside inbox');
  return inbox.entries.filter(validEntry);
}

/** Every encounter already met by her: decided at any time (attended, deferred or refused) or still queued. */
export function seenEncounterIds(state: { memoryState?: { events?: Array<{ encounters?: Array<{ eventId?: string }> }> };
  deferredEncounters?: Array<{ eventId?: string }> }): Set<string> {
  const seen = new Set<string>();
  for (const ev of state.memoryState?.events ?? []) for (const x of ev.encounters ?? []) if (x.eventId) seen.add(x.eventId);
  for (const x of state.deferredEncounters ?? []) if (x.eventId) seen.add(x.eventId);
  return seen;
}

/** Encounters captured since the link was switched on and not yet met, oldest first. */
export function pendingOutside(entries: OutsideInboxEntry[], seen: Set<string>, since: string): OutsideInboxEntry[] {
  const t0 = Date.parse(since);
  return entries.filter(e => !seen.has(e.eventId) && Date.parse(e.capturedAt) >= t0).sort((a, b) => a.sequence - b.sequence);
}

export function toEncounter(e: OutsideInboxEntry): SubstrateEncounterInput {
  return { eventId: e.eventId, channel: e.channel as SubstrateEncounterInput['channel'], sourceDigest: e.sourceDigest,
    attentionVector: [...e.attentionVector] };
}

export interface OutsideLinkSettings { schema: 'amelia.outside-link/v1'; enabled: boolean; since: string }
export function readOutsideLink(value: unknown): OutsideLinkSettings | null {
  const v = value as Partial<OutsideLinkSettings>;
  if (!v || v.schema !== 'amelia.outside-link/v1' || typeof v.enabled !== 'boolean' || Number.isNaN(Date.parse(String(v.since)))) return null;
  return { schema: 'amelia.outside-link/v1', enabled: v.enabled, since: String(v.since) };
}
