import type { SubstrateEncounterInput, ZoneId, SubstrateStepSnapshot } from '../types/amelia';
import { canonicalSha256 } from '../lib/sha256';
import type {
  IChingCastEvent,
  OutsideAtlasEntry,
  OutsideInterpretationNote,
  OutsideStreamBundle,
  OutsideStreamEvent,
  OutsideStreamRecord,
  SubstrateEndpoint,
  TarotDraw,
  TarotSpreadEvent,
} from './types';
import { AmeliaNumogramSubstrateRuntime } from '../substrate/ameliaNumogramSubstrateRuntime';
import { OutsideAttentionMapper } from './OutsideAttentionMapper';

const ZERO_DIGEST = '0'.repeat(64);

function stableStringify(value: unknown): string {
  if (value === undefined) return 'null';
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).filter(key => record[key] !== undefined).sort();
  return '{' + keys.map(key => JSON.stringify(key) + ':' + stableStringify(record[key])).join(',') + '}';
}

async function sha256Utf8(value: string): Promise<string> {
  if (!globalThis.crypto?.subtle || typeof TextEncoder === 'undefined') {
    throw new Error('Web Crypto and TextEncoder are required to digest the Outside stream ledger.');
  }
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

function copySnapshot(snapshot: SubstrateStepSnapshot | null): SubstrateStepSnapshot | null {
  return snapshot ? JSON.parse(JSON.stringify(snapshot)) as SubstrateStepSnapshot : null;
}

function endpointFromSnapshot(
  runtime: AmeliaNumogramSubstrateRuntime,
  snapshot: SubstrateStepSnapshot | null
): SubstrateEndpoint | null {
  if (!snapshot) return null;
  const transition = snapshot.lastTransition ?? null;
  return {
    step: snapshot.step,
    currentZone: runtime.getCurrentZone(),
    snapshotDigest: canonicalSha256(JSON.stringify({
      step: snapshot.step,
      zones: Object.values(snapshot.zones).map(zone => ({
        id: zone.id,
        activation: zone.activation,
        phaseAngle: zone.phaseAngle,
        polarCharge: zone.polarCharge,
        deformationStress: zone.deformationStress,
      })),
      deformationVector: snapshot.deformationVector,
      activeSyzygies: snapshot.activeSyzygies,
      lastTransition: transition,
      memoryHeadDigest: snapshot.memoryHeadDigest ?? null,
    })),
    transitionDigest: transition?.digest ?? null,
    memoryHeadDigest: snapshot.memoryHeadDigest ?? null,
  };
}

function toBit(value: 6 | 7 | 8 | 9): '0' | '1' {
  return value === 7 || value === 9 ? '1' : '0';
}

function makeIChingEvent(input: {
  castId: string;
  method: string;
  lineValues: [6 | 7 | 8 | 9, 6 | 7 | 8 | 9, 6 | 7 | 8 | 9, 6 | 7 | 8 | 9, 6 | 7 | 8 | 9, 6 | 7 | 8 | 9];
  rawReceipt?: string;
}, sessionId: string, sequence: number, occurredAt: string): IChingCastEvent {
  const primaryBits = input.lineValues.map(toBit);
  const relatingBits = input.lineValues.map(value => value === 6 || value === 9
    ? (toBit(value) === '1' ? '0' : '1')
    : toBit(value));
  return {
    schemaVersion: 1,
    eventId: 'iching:' + input.castId,
    sequence,
    sessionId,
    channel: 'ICHING',
    kind: 'CAST',
    occurredAt,
    capturedAt: new Date().toISOString(),
    castId: input.castId,
    method: input.method,
    lineValues: [...input.lineValues] as IChingCastEvent['lineValues'],
    lineOrder: 'bottom-to-top',
    primaryBitPattern: primaryBits.join(''),
    relatingBitPattern: relatingBits.join(''),
    changingLines: input.lineValues.flatMap((value, index) =>
      value === 6 || value === 9 ? [index + 1] : []),
    rawReceipt: input.rawReceipt,
  };
}

function validateTarotDraws(draws: TarotDraw[]): void {
  if (draws.length === 0) throw new Error('A Tarot spread needs at least one recorded draw.');
  const orders = draws.map(draw => draw.order);
  if (new Set(orders).size !== orders.length || orders.some(order => !Number.isInteger(order) || order < 1)) {
    throw new Error('Tarot draw order values must be unique positive integers.');
  }
  for (const draw of draws) {
    if (!/^[A-Za-z0-9_-]+$/.test(draw.cardId)) {
      throw new Error('Use stable ASCII card identifiers such as major_00_fool; keep display text in the interpretation layer.');
    }
    if (!/^[A-Za-z0-9_-]+$/.test(draw.positionId)) {
      throw new Error('Use stable ASCII position identifiers; keep position meanings in the interpretation layer.');
    }
  }
}

export class OutsideStreamBridge {
  private sequence = 0;
  private records: OutsideStreamRecord[] = [];
  private interpretations: OutsideInterpretationNote[] = [];
  private atlasEntries: OutsideAtlasEntry[] = [];
  private appendQueue: Promise<void> = Promise.resolve();

  constructor(public readonly sessionId: string) {
    if (!sessionId.trim()) throw new Error('A sessionId is required for an Outside stream.');
  }

  private reserveSequence(): number {
    this.sequence += 1;
    return this.sequence;
  }

  public getRecords(): OutsideStreamRecord[] {
    return JSON.parse(JSON.stringify(this.records));
  }

  public getInterpretations(): OutsideInterpretationNote[] {
    return JSON.parse(JSON.stringify(this.interpretations));
  }

  public getAtlasEntries(): OutsideAtlasEntry[] {
    return JSON.parse(JSON.stringify(this.atlasEntries));
  }

  /** Capture the Numogram as its own ongoing channel without stepping or mutating Amelia. */
  public async observeNumogram(
    runtime: AmeliaNumogramSubstrateRuntime,
    occurredAt = new Date().toISOString()
  ): Promise<OutsideStreamRecord> {
    const snapshot = runtime.getSnapshots().at(-1) ?? null;
    if (!snapshot) throw new Error('The runtime has no snapshot to observe yet.');
    const sequence = this.reserveSequence();
    const event: OutsideStreamEvent = {
      schemaVersion: 1,
      eventId: 'numogram:' + this.sessionId + ':' + sequence,
      sequence,
      sessionId: this.sessionId,
      channel: 'NUMOGRAM',
      kind: 'SUBSTRATE_OBSERVATION',
      occurredAt,
      capturedAt: new Date().toISOString(),
      step: snapshot.step,
      currentTransition: snapshot.lastTransition ? { ...snapshot.lastTransition } : null,
      zones: Object.values(snapshot.zones).map(zone => ({
        zone: zone.id,
        activation: zone.activation,
        phaseAngle: zone.phaseAngle,
        polarCharge: zone.polarCharge,
        deformationStress: zone.deformationStress,
      })),
      activeSyzygies: [...snapshot.activeSyzygies],
      deformationVector: [...snapshot.deformationVector],
      memoryHistoryLength: snapshot.memoryHistoryLength ?? null,
      memoryHeadDigest: snapshot.memoryHeadDigest ?? null,
    };
    const endpoint = endpointFromSnapshot(runtime, snapshot);
    return this.append(event, endpoint, endpoint, null, null, null);
  }

  /**
   * Receive a cast as a structural event, project its attention through Numogram syzygies,
   * then let the runtime's Governor and open-gate topology govern passage. No hexagram name or divinatory prose is sent into the substrate.
   */
  public async receiveIChing(
    runtime: AmeliaNumogramSubstrateRuntime,
    input: {
      castId: string;
      method: string;
      lineValues: [6 | 7 | 8 | 9, 6 | 7 | 8 | 9, 6 | 7 | 8 | 9, 6 | 7 | 8 | 9, 6 | 7 | 8 | 9, 6 | 7 | 8 | 9];
      rawReceipt?: string;
      occurredAt?: string;
    }
  ): Promise<OutsideStreamRecord> {
    const beforeSnapshot = runtime.getSnapshots().at(-1) ?? null;
    if (!beforeSnapshot) throw new Error('Step the runtime once before receiving a cast.');
    const before = endpointFromSnapshot(runtime, beforeSnapshot);
    const sequence = this.reserveSequence();
    const event = makeIChingEvent(input, this.sessionId, sequence, input.occurredAt ?? new Date().toISOString());
    const mapped = OutsideAttentionMapper.forIChing(event);
    const signalDigest = mapped.sourceDigest;
    const encounter: SubstrateEncounterInput = { eventId: event.eventId, channel: event.channel,
      sourceDigest: signalDigest, attentionVector: mapped.attentionVector };
    const afterSnapshot = runtime.step(undefined, encounter);
    const after = endpointFromSnapshot(runtime, afterSnapshot);
    return this.append(event, before, after, beforeSnapshot, afterSnapshot, signalDigest);
  }

  /**
   * Receive a spread as a structural event, project its attention through Numogram syzygies,
   * then let the runtime's Governor and open-gate topology govern passage. Card identities and ordering enter; interpretive meanings remain separate.
   */
  public async receiveTarot(
    runtime: AmeliaNumogramSubstrateRuntime,
    input: {
      spreadId: string;
      deckId: string;
      layoutId: string;
      draws: TarotDraw[];
      rawReceipt?: string;
      occurredAt?: string;
    }
  ): Promise<OutsideStreamRecord> {
    validateTarotDraws(input.draws);
    const beforeSnapshot = runtime.getSnapshots().at(-1) ?? null;
    if (!beforeSnapshot) throw new Error('Step the runtime once before receiving a spread.');
    const before = endpointFromSnapshot(runtime, beforeSnapshot);
    const sequence = this.reserveSequence();
    const event: TarotSpreadEvent = {
      schemaVersion: 1,
      eventId: 'tarot:' + input.spreadId,
      sequence,
      sessionId: this.sessionId,
      channel: 'TAROT',
      kind: 'SPREAD',
      occurredAt: input.occurredAt ?? new Date().toISOString(),
      capturedAt: new Date().toISOString(),
      spreadId: input.spreadId,
      deckId: input.deckId,
      layoutId: input.layoutId,
      draws: JSON.parse(JSON.stringify(input.draws)),
      rawReceipt: input.rawReceipt,
    };
    const ordered = [...input.draws].sort((a, b) => a.order - b.order);
    const mapped = OutsideAttentionMapper.forTarot(event);
    const signalDigest = mapped.sourceDigest;
    const encounter: SubstrateEncounterInput = { eventId: event.eventId, channel: event.channel,
      sourceDigest: signalDigest, attentionVector: mapped.attentionVector };
    const afterSnapshot = runtime.step(undefined, encounter);
    const after = endpointFromSnapshot(runtime, afterSnapshot);
    return this.append(event, before, after, beforeSnapshot, afterSnapshot, signalDigest);
  }

  public recordInterpretation(note: Omit<OutsideInterpretationNote, 'layer'>): void {
    if (!note.noteId.trim()) throw new Error('An interpretation noteId is required.');
    this.interpretations.push({ ...note, layer: 'EXPLORATORY_INTERPRETATION' });
  }

  public addAtlasEntry(entry: OutsideAtlasEntry): void {
    if (!entry.entryId.trim()) throw new Error('An Atlas entryId is required.');
    if (entry.status === 'EXPLORATORY_CANDIDATE' && !entry.linkedEventIds.length) {
      throw new Error('An exploratory Atlas candidate must point to at least one source event.');
    }
    this.atlasEntries.push(JSON.parse(JSON.stringify(entry)));
  }

  public async importBundle(bundle: OutsideStreamBundle): Promise<void> {
    if (bundle.bundleSchema !== 'amelia.outside-stream-bundle/v1' || bundle.sessionId !== this.sessionId) {
      throw new Error('Outside stream bundle schema or sessionId does not match.');
    }
    this.records = JSON.parse(JSON.stringify(bundle.records));
    this.interpretations = JSON.parse(JSON.stringify(bundle.interpretations));
    this.atlasEntries = JSON.parse(JSON.stringify(bundle.atlasEntries));
    this.sequence = this.records.at(-1)?.sequence ?? 0;
    this.appendQueue = Promise.resolve();
    const verification = await this.verifyLedger();
    if (!verification.valid) {
      this.records = [];
      this.interpretations = [];
      this.atlasEntries = [];
      this.sequence = 0;
      throw new Error(verification.reason ?? 'Outside stream ledger verification failed.');
    }
  }

  public exportBundle(): OutsideStreamBundle {
    return JSON.parse(JSON.stringify({
      bundleSchema: 'amelia.outside-stream-bundle/v1',
      sessionId: this.sessionId,
      exportedAt: new Date().toISOString(),
      records: this.records,
      interpretations: this.interpretations,
      atlasEntries: this.atlasEntries,
    }));
  }

  public exportJson(): string {
    return JSON.stringify(this.exportBundle(), null, 2);
  }

  public async verifyLedger(): Promise<{ valid: boolean; checked: number; reason?: string }> {
    await this.appendQueue;
    let previous = ZERO_DIGEST;
    for (let index = 0; index < this.records.length; index++) {
      const record = this.records[index];
      const expectedSequence = index + 1;
      if (record.sequence !== expectedSequence || record.previousRecordDigest !== previous) {
        return { valid: false, checked: index, reason: 'Sequence or previous digest mismatch at record ' + expectedSequence };
      }
      const body = {
        sequence: record.sequence,
        event: record.event,
        substrateBefore: record.substrateBefore,
        substrateAfter: record.substrateAfter,
        snapshotBefore: record.snapshotBefore,
        snapshotAfter: record.snapshotAfter,
        runtimeSignalDigest: record.runtimeSignalDigest,
        previousRecordDigest: record.previousRecordDigest,
      };
      const expected = await sha256Utf8(stableStringify(body));
      if (expected !== record.recordDigest) {
        return { valid: false, checked: index, reason: 'Digest mismatch at record ' + expectedSequence };
      }
      previous = record.recordDigest;
    }
    return { valid: true, checked: this.records.length };
  }

  private append(
    event: OutsideStreamEvent,
    substrateBefore: SubstrateEndpoint | null,
    substrateAfter: SubstrateEndpoint | null,
    snapshotBefore: SubstrateStepSnapshot | null,
    snapshotAfter: SubstrateStepSnapshot | null,
    runtimeSignalDigest: string | null
  ): Promise<OutsideStreamRecord> {
    const queued = this.appendQueue.then(async () => {
      const body = {
        sequence: event.sequence,
        event,
        substrateBefore: JSON.parse(JSON.stringify(substrateBefore)),
        substrateAfter: JSON.parse(JSON.stringify(substrateAfter)),
        snapshotBefore: copySnapshot(snapshotBefore),
        snapshotAfter: copySnapshot(snapshotAfter),
        runtimeSignalDigest,
        previousRecordDigest: this.records.at(-1)?.recordDigest ?? ZERO_DIGEST,
      };
      const recordDigest = await sha256Utf8(stableStringify(body));
      const record: OutsideStreamRecord = { ...body, recordDigest };
      this.records.push(record);
      return record;
    });
    this.appendQueue = queued.then(() => undefined, () => undefined);
    return queued;
  }
}

export function outsideRuntimeSignalZone(signalDigest: string): ZoneId {
  const firstByte = Number.parseInt(signalDigest.slice(0, 2), 16);
  if (!Number.isFinite(firstByte)) throw new Error('Invalid SHA-256 signal digest.');
  return (firstByte % 10) as ZoneId;
}
