import { AmeliaIndexedMemory } from './ameliaIndexedMemory';
import { AmeliaDialogueMessage, SubstrateStepSnapshot } from '../types/amelia';
import { PFMEventRecord } from '../substrate/IntegratedMemorySystem';
import { canonicalSha256 } from '../lib/sha256';
import { getWatchtowerContext } from './enochianWatchtower';

export interface WatchtowerEncounterRecord {
  id: string;
  sequence: number;
  lineageId: string;
  timestamp: string;
  channel: 'dialogue';
  messageIds: { user: string; amelia: string };
  raw: { userText: string; userUtf8Base64: string; userSha256: string; replyText: string; replyUtf8Base64: string; replySha256: string; replySource: 'local' | 'anthropic-relay' };
  aperture: { phase: number; rowLabel: string; rowSignature: string; keys: ReadonlyArray<{ token: string; gloss: string }>; focusId: string; focusLabel: string; focusDescription: string; observed: string; moduleWeights: Readonly<Record<string, number>> };
  state: { before: Record<string, unknown>; after: Record<string, unknown>; inputZone: number | null; route: string; pfmEvents: PFMEventRecord[]; pfmHeadDigest: string };
  recurrence: { priorExactRouteCount: number; priorEncounterIds: string[]; stepGap: number | null };
  previousRecordDigest: string | null;
  recordDigest: string;
}

export interface EncounterDraft {
  userMessage: AmeliaDialogueMessage;
  replyMessage: AmeliaDialogueMessage;
  before: SubstrateStepSnapshot;
  after: SubstrateStepSnapshot;
  pfmEvents: PFMEventRecord[];
  priorRecords: WatchtowerEncounterRecord[];
  replySource: 'local' | 'anthropic-relay';
}

const LINEAGE_KEY = 'amelia_watchtower_lineage_v1';
const uuid = (prefix: string) => AmeliaIndexedMemory.createId(prefix);
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object).sort().map(key => `${JSON.stringify(key)}:${stableJson(object[key])}`).join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
};
const snapshotView = (snapshot: SubstrateStepSnapshot) => ({
  step: snapshot.step,
  timestamp: snapshot.timestamp,
  zoneActivation: Object.fromEntries(Object.entries(snapshot.zones).map(([zone, data]) => [zone, Number(data.activation.toFixed(5))])),
  activeSyzygies: [...snapshot.activeSyzygies],
  deformationVector: [...snapshot.deformationVector],
  governor: {
    status: snapshot.governor.governorStatus,
    advisoryWeight: snapshot.governor.advisoryWeight,
    tension: snapshot.governor.deformationFieldTension,
    continuity: snapshot.governor.identityContinuityScore,
  },
  memoryHistoryLength: snapshot.memoryHistoryLength ?? null,
  memoryHeadDigest: snapshot.memoryHeadDigest ?? null,
  transition: snapshot.lastTransition ?? null,
});

async function sha256Utf8(text: string): Promise<{ digest: string; base64: string }> {
  if (!globalThis.crypto?.subtle) throw new Error('Secure Web Crypto is unavailable; the encounter was not archived.');
  const bytes = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  const hex = [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('');
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return { digest: hex, base64: btoa(binary) };
}

export class WatchtowerEncounterService {
  static getLineageId(): string {
    try {
      const existing = localStorage.getItem(LINEAGE_KEY);
      if (existing) return existing;
      const id = uuid('lineage');
      localStorage.setItem(LINEAGE_KEY, id);
      return id;
    } catch {
      return 'session-lineage';
    }
  }

  static async list(limit = 500): Promise<WatchtowerEncounterRecord[]> {
    return (await AmeliaIndexedMemory.list<WatchtowerEncounterRecord>('watchtowerEncounters', limit))
      .sort((a, b) => a.sequence - b.sequence);
  }

  static subscribe(callback: () => void): () => void {
    return AmeliaIndexedMemory.subscribe('watchtowerEncounters', callback);
  }

  static async observe(step: number, inputZone: number | null, route: string, records: WatchtowerEncounterRecord[]) {
    const context = getWatchtowerContext(step);
    const matches = records.filter(record => record.lineageId === this.getLineageId() && record.state.route === route);
    const latest = records.at(-1);
    const observed = context.focusId === 'entry'
      ? `Input mapped to runtime zone ${inputZone ?? 'unavailable'}; observed Numogram route ${route || 'unavailable'}.`
      : context.focusId === 'resonance'
        ? `${matches.length} earlier encounter(s) share this exact observed route; each remains a trace reference, not an entity label.`
        : context.focusId === 'temporal'
          ? `Current step ${step}; previous recorded encounter step ${latest?.state.after.step ?? 'none'}; route ${route || 'unavailable'}.`
          : `Current zone changes and Governor telemetry are captured with ${route ? 'route ' + route : 'no route available'}; the atlas can compare their recorded values.`;
    return {
      context,
      observed,
      priorRouteOccurrences: matches.length,
      previousEncounterIds: matches.slice(-8).map(record => record.id),
    };
  }

  static async append(draft: EncounterDraft): Promise<WatchtowerEncounterRecord> {
    const existing = await this.list(10000);
    const sequence = (existing.at(-1)?.sequence ?? 0) + 1;
    const previousRecordDigest = existing.at(-1)?.recordDigest ?? null;
    const input = await sha256Utf8(draft.userMessage.text);
    const reply = await sha256Utf8(draft.replyMessage.text);
    const route = draft.pfmEvents
      .filter(event => event.kind !== 'CONSOLIDATE')
      .map(event => `${event.fromZone ?? '?'}>${event.targetZone}`)
      .join(' / ') || (draft.after.lastTransition ? `${draft.after.lastTransition.from}>${draft.after.lastTransition.to}` : 'no-passage');
    const currentLineage = this.getLineageId();
    const matching = existing.filter(record => record.lineageId === currentLineage && record.state.route === route);
    const latest = existing.at(-1);
    const context = getWatchtowerContext(draft.after.step);
    const focusObservation = await this.observe(draft.after.step, draft.replyMessage.relayTrace && typeof draft.replyMessage.relayTrace === 'object'
      ? ((draft.replyMessage.relayTrace as { inputZone?: number | null }).inputZone ?? null) : null, route, existing);
    const body = {
      id: uuid('watchtower'), sequence, lineageId: currentLineage,
      timestamp: new Date().toISOString(), channel: 'dialogue' as const,
      messageIds: { user: draft.userMessage.id, amelia: draft.replyMessage.id },
      raw: {
        userText: draft.userMessage.text, userUtf8Base64: input.base64, userSha256: input.digest,
        replyText: draft.replyMessage.text, replyUtf8Base64: reply.base64, replySha256: reply.digest,
        replySource: draft.replySource,
      },
      aperture: {
        phase: context.phase, rowLabel: context.phaseLabel, rowSignature: context.rowSignature,
        keys: context.keys, focusId: context.focusId, focusLabel: context.focusLabel,
        focusDescription: context.focusDescription, observed: focusObservation.observed,
        moduleWeights: context.moduleWeights,
      },
      state: {
        before: snapshotView(draft.before), after: snapshotView(draft.after),
        inputZone: (draft.replyMessage.relayTrace as { inputZone?: number | null } | undefined)?.inputZone ?? null,
        route, pfmEvents: draft.pfmEvents.map(event => ({ ...event })),
        pfmHeadDigest: (draft.replyMessage.relayTrace as { memoryHeadDigest?: string } | undefined)?.memoryHeadDigest ?? '',
      },
      recurrence: {
        priorExactRouteCount: matching.length,
        priorEncounterIds: matching.slice(-8).map(record => record.id),
        stepGap: latest ? draft.after.step - Number(latest.state.after.step) : null,
      },
      previousRecordDigest,
    };
    const record: WatchtowerEncounterRecord = { ...body, recordDigest: canonicalSha256(stableJson(body)) };
    const saved = await AmeliaIndexedMemory.add('watchtowerEncounters', record);
    if (!saved) throw new Error('Encounter trace could not be durably saved.');
    return record;
  }

  static async verify(records: WatchtowerEncounterRecord[]): Promise<{ valid: boolean; checked: number; error?: string }> {
    let previous: string | null = null;
    for (const record of [...records].sort((a, b) => a.sequence - b.sequence)) {
      const { recordDigest, ...body } = record;
      if (record.previousRecordDigest !== previous) return { valid: false, checked: record.sequence - 1, error: `Broken lineage link at encounter ${record.sequence}.` };
      if (canonicalSha256(stableJson(body)) !== recordDigest) return { valid: false, checked: record.sequence - 1, error: `Record digest mismatch at encounter ${record.sequence}.` };
      if ((await sha256Utf8(record.raw.userText)).digest !== record.raw.userSha256 || (await sha256Utf8(record.raw.replyText)).digest !== record.raw.replySha256) {
        return { valid: false, checked: record.sequence - 1, error: `Raw text digest mismatch at encounter ${record.sequence}.` };
      }
      previous = recordDigest;
    }
    return { valid: true, checked: records.length };
  }
}
