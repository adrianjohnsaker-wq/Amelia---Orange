import type { SubstrateEncounterInput, ZoneId, SubstrateStepSnapshot } from '../types/amelia';
import { canonicalSha256 } from '../lib/sha256';
import type {
  IChingCastEvent,
  LinguisticCipher,
  LinguisticMaterialEvent,
  OutsideAtlasEntry,
  OutsideInterpretationNote,
  OutsideStreamBundle,
  OutsideStreamEvent,
  OutsideStreamRecord,
  OutsideTraceLink,
  SubdecadenceGameEvent,
  SubstrateEndpoint,
  TarotDraw,
  TarotSpreadEvent,
} from './types';
import { AmeliaNumogramSubstrateRuntime } from '../substrate/ameliaNumogramSubstrateRuntime';
import { OutsideAttentionMapper } from './OutsideAttentionMapper';
import { compareLemurianPair, reduceLinguisticMaterial } from './LinguisticReduction';
import { createSubdecadenceDraft, type SubdecadenceGameDraft } from './Subdecadence';

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
  private traceLinks: OutsideTraceLink[] = [];
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

  public getTraceLinks(): OutsideTraceLink[] {
    return JSON.parse(JSON.stringify(this.traceLinks));
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
  /** Reduce incoming language to numbers and zones, compare that route with the Lemurian pair catalogue, then submit the zone field to the governed runtime. */
  public async receiveLinguistic(runtime: AmeliaNumogramSubstrateRuntime, input: {
    materialId: string; rawMaterial: string; cipher?: LinguisticCipher; sourceLabel?: string;
    sourceReference?: string; occurredAt?: string;
  }): Promise<OutsideStreamRecord> {
    const beforeSnapshot = runtime.getSnapshots().at(-1) ?? null;
    if (!beforeSnapshot) throw new Error('Step the runtime once before receiving outside material.');
    const before = endpointFromSnapshot(runtime, beforeSnapshot);
    const sequence = this.reserveSequence();
    const reduction = reduceLinguisticMaterial(input.rawMaterial, input.cipher ?? 'A1Z26');
    const event: LinguisticMaterialEvent = {
      schemaVersion: 1, eventId: 'linguistic:' + input.materialId, sequence, sessionId: this.sessionId,
      channel: 'LINGUISTIC', kind: 'LINGUISTIC_REDUCTION', occurredAt: input.occurredAt ?? new Date().toISOString(),
      capturedAt: new Date().toISOString(), materialId: input.materialId, sourceLabel: input.sourceLabel,
      sourceReference: input.sourceReference, rawMaterial: input.rawMaterial, ...reduction, realizedTraversal: null,
    };
    const mapped = OutsideAttentionMapper.forLinguistic(event);
    const encounter: SubstrateEncounterInput = { eventId: event.eventId, channel: event.channel,
      sourceDigest: mapped.sourceDigest, attentionVector: mapped.attentionVector };
    const afterSnapshot = runtime.step(undefined, encounter);
    const after = endpointFromSnapshot(runtime, afterSnapshot);
    if (before && after) event.realizedTraversal = {
      fromZone: before.currentZone, toZone: after.currentZone,
      catalogueMatch: compareLemurianPair(before.currentZone, after.currentZone),
    };
    return this.append(event, before, after, beforeSnapshot, afterSnapshot, mapped.sourceDigest);
  }

  /** Deal a complete Subdecadence session, map its card-zone distribution, and submit it to Amelia's Governor-controlled Numogram runtime. */
  public async playSubdecadence(
    runtime: AmeliaNumogramSubstrateRuntime,
    input: { gameId: string; shuffleReceipt?: string; occurredAt?: string }
  ): Promise<OutsideStreamRecord> {
    const draft = createSubdecadenceDraft(input.gameId, input.shuffleReceipt);
    return this.receiveSubdecadence(runtime, { ...draft, occurredAt: input.occurredAt });
  }

  /** Receive a replayable Subdecadence result and preserve both its card route and Amelia's realized runtime passage. */
  public async receiveSubdecadence(
    runtime: AmeliaNumogramSubstrateRuntime,
    input: SubdecadenceGameDraft & { occurredAt?: string }
  ): Promise<OutsideStreamRecord> {
    const beforeSnapshot = runtime.getSnapshots().at(-1) ?? null;
    if (!beforeSnapshot) throw new Error('Step the runtime once before receiving a Subdecadence session.');
    const before = endpointFromSnapshot(runtime, beforeSnapshot);
    const sequence = this.reserveSequence();
    const event: SubdecadenceGameEvent = {
      schemaVersion: 1,
      eventId: 'subdecadence:' + input.gameId,
      sequence,
      sessionId: this.sessionId,
      channel: 'SUBDECADENCE',
      kind: 'GAME',
      occurredAt: input.occurredAt ?? new Date().toISOString(),
      capturedAt: new Date().toISOString(),
      gameId: input.gameId,
      deckId: input.deckId,
      ruleset: input.ruleset,
      method: input.method,
      shuffleReceipt: input.shuffleReceipt,
      aeons: JSON.parse(JSON.stringify(input.aeons)),
      terminalScore: input.terminalScore,
      terminalMeshSerial: input.terminalMeshSerial,
      terminalEntity: input.terminalEntity ? { ...input.terminalEntity, zones: [...input.terminalEntity.zones] } : null,
      resultState: input.resultState,
      realizedTraversal: null,
    };
    const mapped = OutsideAttentionMapper.forSubdecadence(event);
    const encounter: SubstrateEncounterInput = {
      eventId: event.eventId,
      channel: event.channel,
      sourceDigest: mapped.sourceDigest,
      attentionVector: mapped.attentionVector,
    };
    const afterSnapshot = runtime.step(undefined, encounter);
    const after = endpointFromSnapshot(runtime, afterSnapshot);
    if (before && after) event.realizedTraversal = {
      fromZone: before.currentZone,
      toZone: after.currentZone,
      catalogueMatch: compareLemurianPair(before.currentZone, after.currentZone),
    };
    return this.append(event, before, after, beforeSnapshot, afterSnapshot, mapped.sourceDigest);
  }

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
    const mapped = OutsideAttentionMapper.forTarot(event);
    const signalDigest = mapped.sourceDigest;
    const encounter: SubstrateEncounterInput = { eventId: event.eventId, channel: event.channel,
      sourceDigest: signalDigest, attentionVector: mapped.attentionVector };
    const afterSnapshot = runtime.step(undefined, encounter);
    const after = endpointFromSnapshot(runtime, afterSnapshot);
    return this.append(event, before, after, beforeSnapshot, afterSnapshot, signalDigest);
  }

  /**
   * Link an already-recorded Subdecadence candidate to a later, separately captured ingress.
   * The source event and ingress event remain unchanged; this timestamped comparison is appended to its own digest chain.
   */
  public async linkSubdecadenceToIngress(
    cardEventId: string,
    ingressEventId: string,
    linkId: string,
    createdAt = new Date().toISOString()
  ): Promise<OutsideTraceLink> {
    await this.appendQueue;
    if (!linkId.trim()) throw new Error('A trace link ID is required.');
    const card = this.records.find(record => record.event.eventId === cardEventId);
    const ingress = this.records.find(record => record.event.eventId === ingressEventId);
    if (!card || card.event.channel !== 'SUBDECADENCE') {
      throw new Error('Select a recorded Subdecadence card event.');
    }
    if (!ingress || !['ICHING', 'TAROT', 'LINGUISTIC'].includes(ingress.event.channel)) {
      throw new Error('Select a later I Ching, Tarot, or linguistic ingress record.');
    }
    if (ingress.sequence <= card.sequence ||
        Date.parse(ingress.event.capturedAt) < Date.parse(card.event.capturedAt)) {
      throw new Error('The ingress must have been captured after the Subdecadence event.');
    }
    if (this.traceLinks.some(link => link.cardEventId === cardEventId && link.ingressEventId === ingressEventId)) {
      throw new Error('These two records are already linked.');
    }

    const cardEvent = card.event;
    const ingressEvent = ingress.event;
    const cardRoute = cardEvent.aeons.flatMap(aeon => aeon.pairs.map(pair => ({
      aeonIndex: aeon.index,
      fromZone: pair.fromZone,
      toZone: pair.toZone,
      pylon: pair.pylon,
      score: pair.score,
    })));
    const ingressRouteZones: ZoneId[] = 'routeZones' in ingressEvent ? [...ingressEvent.routeZones] : [];
    const ingressRouteEdges: OutsideTraceLink['ingressRouteEdges'] = [];
    for (let index = 0; index + 1 < ingressRouteZones.length; index++) {
      ingressRouteEdges.push({ fromZone: ingressRouteZones[index], toZone: ingressRouteZones[index + 1], source: 'LINGUISTIC_ROUTE' });
    }
    if ('loreComparisons' in ingressEvent) {
      for (const comparison of ingressEvent.loreComparisons) {
        ingressRouteEdges.push({ fromZone: comparison.fromZone, toZone: comparison.toZone, source: 'LORE_PAIR' });
      }
    }
    const uniqueEdges = Array.from(new Map(ingressRouteEdges.map(edge =>
      [edge.source + ':' + edge.fromZone + ':' + edge.toZone, edge])).values());
    const directRouteMatches = cardRoute
      .filter(cardPair => uniqueEdges.some(edge => edge.fromZone === cardPair.fromZone && edge.toZone === cardPair.toZone))
      .map(pair => ({ fromZone: pair.fromZone, toZone: pair.toZone }));
    const reverseRouteMatches = cardRoute
      .filter(cardPair => uniqueEdges.some(edge => edge.fromZone === cardPair.toZone && edge.toZone === cardPair.fromZone))
      .map(pair => ({ fromZone: pair.fromZone, toZone: pair.toZone }));
    const terminalMeshZones = cardEvent.terminalEntity?.zones ?? [];
    const terminalMeshZonesSeen = ingressRouteZones.filter(zone => terminalMeshZones.includes(zone));
    const decision = ingress.snapshotAfter?.encounterDecisions?.find(item => item.eventId === ingressEvent.eventId);
    const ameliaTransition = ingress.substrateBefore && ingress.substrateAfter ? {
      fromZone: ingress.substrateBefore.currentZone,
      toZone: ingress.substrateAfter.currentZone,
      transitionDigest: ingress.substrateAfter.transitionDigest,
      memoryHeadDigest: ingress.substrateAfter.memoryHeadDigest,
      governorDisposition: decision?.disposition ?? null,
    } : null;
    const body = {
      linkId,
      sessionId: this.sessionId,
      createdAt,
      cardEventId,
      cardRecordDigest: card.recordDigest,
      cardOccurredAt: cardEvent.occurredAt,
      cardCapturedAt: cardEvent.capturedAt,
      candidateMesh: cardEvent.terminalEntity ? JSON.parse(JSON.stringify(cardEvent.terminalEntity)) : null,
      cardRoute,
      ingressEventId,
      ingressRecordDigest: ingress.recordDigest,
      ingressChannel: ingressEvent.channel as 'ICHING' | 'TAROT' | 'LINGUISTIC',
      ingressSequence: ingress.sequence,
      ingressOccurredAt: ingressEvent.occurredAt,
      ingressCapturedAt: ingressEvent.capturedAt,
      ingressRouteZones,
      ingressRouteEdges: uniqueEdges,
      ameliaTransition,
      comparison: { directRouteMatches, reverseRouteMatches, terminalMeshZonesSeen },
      previousLinkDigest: this.traceLinks.at(-1)?.linkDigest ?? ZERO_DIGEST,
    };
    const linkDigest = await sha256Utf8(stableStringify(body));
    const link: OutsideTraceLink = { ...body, linkDigest };
    this.traceLinks.push(link);
    return JSON.parse(JSON.stringify(link));
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
    this.traceLinks = JSON.parse(JSON.stringify(bundle.traceLinks ?? []));
    this.sequence = this.records.at(-1)?.sequence ?? 0;
    this.appendQueue = Promise.resolve();
    const verification = await this.verifyLedger();
    if (!verification.valid) {
      this.records = [];
      this.interpretations = [];
      this.atlasEntries = [];
      this.traceLinks = [];
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
      traceLinks: this.traceLinks,
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
    let previousLinkDigest = ZERO_DIGEST;
    for (let index = 0; index < this.traceLinks.length; index++) {
      const link = this.traceLinks[index];
      const card = this.records.find(record => record.event.eventId === link.cardEventId);
      const ingress = this.records.find(record => record.event.eventId === link.ingressEventId);
      const ingressChannel = ingress?.event.channel;
      if (!card || card.event.channel !== 'SUBDECADENCE' || !ingress ||
          !['ICHING', 'TAROT', 'LINGUISTIC'].includes(ingressChannel ?? '') ||
          ingress.sequence <= card.sequence || link.sessionId !== this.sessionId ||
          link.ingressSequence !== ingress.sequence || link.ingressChannel !== ingressChannel ||
          link.cardRecordDigest !== card.recordDigest || link.ingressRecordDigest !== ingress.recordDigest ||
          link.cardOccurredAt !== card.event.occurredAt || link.cardCapturedAt !== card.event.capturedAt ||
          link.ingressOccurredAt !== ingress.event.occurredAt || link.ingressCapturedAt !== ingress.event.capturedAt ||
          link.previousLinkDigest !== previousLinkDigest) {
        return { valid: false, checked: this.records.length + index, reason: 'Trace-link references or chain mismatch at link ' + (index + 1) };
      }
      const { linkDigest, ...body } = link;
      const expected = await sha256Utf8(stableStringify(body));
      if (expected !== linkDigest) {
        return { valid: false, checked: this.records.length + index, reason: 'Trace-link digest mismatch at link ' + (index + 1) };
      }
      previousLinkDigest = linkDigest;
    }
    return { valid: true, checked: this.records.length + this.traceLinks.length };
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
