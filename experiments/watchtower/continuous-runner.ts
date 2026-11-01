import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { OutsideStreamBridge } from '../../src/outside/OutsideStreamBridge.ts';
import { describeWatchtowerSource, getEnochianWatchtowerAperture, traceLinksForSource } from '../../src/outside/EnochianWatchtower.ts';
import type { OutsideStreamBundle, OutsideStreamRecord, OutsideTraceLink } from '../../src/outside/types.ts';

const outsidePath = resolve(process.argv[2] ?? '../outside-live/ledger.json');
const outputRoot = resolve(process.argv[3] ?? 'watchtower-live');
await mkdir(outputRoot, { recursive: true });
const statePath = resolve(outputRoot, 'state.json');
const ledgerPath = resolve(outputRoot, 'ledger.json');
const atlasPath = resolve(outputRoot, 'atlas.json');
const latestPath = resolve(outputRoot, 'LATEST.md');
const ZERO_DIGEST = '0'.repeat(64);
const now = () => new Date().toISOString();
const sha = (value: string): string => createHash('sha256').update(value, 'utf8').digest('hex');

function stableJson(value: unknown): string {
  if (value === undefined || value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return '[' + value.map(stableJson).join(',') + ']';
  const object = value as Record<string, unknown>;
  return '{' + Object.keys(object).filter(key => object[key] !== undefined).sort()
    .map(key => JSON.stringify(key) + ':' + stableJson(object[key])).join(',') + '}';
}

type WatchtowerEncounter = {
  schemaVersion: 1;
  recordId: string;
  sequence: number;
  lineageId: string;
  recordedAt: string;
  source: {
    sessionId: string;
    sourceSequence: number;
    sourceRecordDigest: string;
    sourcePreviousDigest: string | null;
    runtimeSignalDigest: string | null;
    eventId: string;
    eventDigest: string;
    eventUtf8Base64: string;
    channel: string;
    kind: string;
    sourceRole: string;
    sourceItemId: string | null;
    occurredAt: string;
    capturedAt: string;
    sourceLabel: string | null;
    sourceReference: string | null;
    rawText: string | null;
    rawEvent: OutsideStreamRecord['event'];
  };
  aperture: {
    phase: number;
    phaseLabel: string;
    rowSignature: string;
    keys: Array<{ token: string; gloss: string }>;
    focusId: string;
    focusLabel: string;
    focusDescription: string;
    observation: Record<string, unknown>;
  };
  passage: {
    sourceRoute: number[];
    actualTransition: { fromZone: number; toZone: number; transitionDigest: string | null } | null;
    governorDisposition: string | null;
    snapshotBeforeDigest: string | null;
    snapshotAfterDigest: string | null;
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
  };
  candidateRelations: Array<{
    traceLinkId: string;
    traceLinkDigest: string;
    cardEventId: string;
    cardRecordDigest: string;
    cardOccurredAt: string;
    candidateMesh: OutsideTraceLink['candidateMesh'];
    cardRoute: OutsideTraceLink['cardRoute'];
    ingressEventId: string;
    ingressRecordDigest: string;
    ingressRouteZones: number[];
    ameliaTransition: OutsideTraceLink['ameliaTransition'];
    comparison: OutsideTraceLink['comparison'];
  }>;
  recurrence: { signature: string; previousCount: number; priorRecordIds: string[] };
  previousRecordDigest: string;
  recordDigest: string;
};

type WatchtowerLedger = {
  ledgerSchema: 'amelia.enochian-watchtower-ledger/v1';
  lineageId: string;
  sourceSessionId: string;
  createdAt: string;
  updatedAt: string;
  records: WatchtowerEncounter[];
};

type RunnerState = {
  stateSchema: 'amelia.enochian-watchtower-state/v1';
  lastOutsideSequence: number;
  lastOutsideHeadDigest: string;
  runCount: number;
  lastRunAt: string | null;
  lastRunId: string | null;
};

const sourceBundle = JSON.parse(await readFile(outsidePath, 'utf8')) as OutsideStreamBundle;
if (sourceBundle.bundleSchema !== 'amelia.outside-stream-bundle/v1') throw new Error('Unsupported Antenna Outside stream bundle.');
const verifier = new OutsideStreamBridge(sourceBundle.sessionId);
await verifier.importBundle(sourceBundle);
const sourceRecords = sourceBundle.records;
const sourceHead = sourceRecords.at(-1)?.recordDigest ?? ZERO_DIGEST;
const lineageId = 'antenna:' + sourceBundle.sessionId;

const state = await readFile(statePath, 'utf8').then(value => JSON.parse(value) as RunnerState).catch(() => ({
  stateSchema: 'amelia.enochian-watchtower-state/v1' as const,
  lastOutsideSequence: 0,
  lastOutsideHeadDigest: ZERO_DIGEST,
  runCount: 0,
  lastRunAt: null,
  lastRunId: null,
}));
const ledger = await readFile(ledgerPath, 'utf8').then(value => JSON.parse(value) as WatchtowerLedger).catch(() => ({
  ledgerSchema: 'amelia.enochian-watchtower-ledger/v1' as const,
  lineageId,
  sourceSessionId: sourceBundle.sessionId,
  createdAt: now(),
  updatedAt: now(),
  records: [],
}));
if (ledger.ledgerSchema !== 'amelia.enochian-watchtower-ledger/v1' || ledger.lineageId !== lineageId || ledger.sourceSessionId !== sourceBundle.sessionId) {
  throw new Error('Watchtower ledger schema or lineage does not match the Antenna source.');
}

async function verifyWatchtowerLedger(records: WatchtowerEncounter[]): Promise<void> {
  let previous = ZERO_DIGEST;
  for (let index = 0; index < records.length; index++) {
    const { recordDigest, ...body } = records[index];
    if (records[index].sequence !== index + 1 || records[index].previousRecordDigest !== previous || sha(stableJson(body)) !== recordDigest) {
      throw new Error('Watchtower record chain verification failed at sequence ' + (index + 1) + '.');
    }
    if (sha(Buffer.from(records[index].source.eventUtf8Base64, 'base64').toString('utf8')) !== records[index].source.eventDigest) {
      throw new Error('Watchtower raw event digest verification failed at sequence ' + (index + 1) + '.');
    }
    previous = recordDigest;
  }
}
await verifyWatchtowerLedger(ledger.records);
if (state.lastOutsideSequence !== (ledger.records.at(-1)?.source.sourceSequence ?? 0) && ledger.records.length > 0) {
  throw new Error('Watchtower cursor does not agree with the verified encounter ledger.');
}
if (state.lastOutsideSequence > 0) {
  const cursorRecord = sourceRecords.find(record => record.sequence === state.lastOutsideSequence);
  if (!cursorRecord || cursorRecord.recordDigest !== state.lastOutsideHeadDigest) throw new Error('Antenna source lineage changed behind the Watchtower cursor.');
}

function currentZone(snapshot: any): number | null {
  if (!snapshot?.zones) return null;
  const entry = Object.values(snapshot.zones as Record<string, { activation: number; id: number }>).sort((a, b) => b.activation - a.activation)[0];
  return entry?.id ?? null;
}
function snapshotView(snapshot: any): Record<string, unknown> | null {
  if (!snapshot) return null;
  return {
    step: snapshot.step,
    timestamp: snapshot.timestamp,
    currentZone: currentZone(snapshot),
    zoneActivation: Object.fromEntries(Object.entries(snapshot.zones ?? {}).map(([zone, data]: [string, any]) => [zone, Number(data.activation.toFixed(6))])),
    activeSyzygies: [...(snapshot.activeSyzygies ?? [])],
    deformationVector: [...(snapshot.deformationVector ?? [])],
    governor: {
      status: snapshot.governor?.governorStatus ?? null,
      advisoryWeight: snapshot.governor?.advisoryWeight ?? null,
      tension: snapshot.governor?.deformationFieldTension ?? null,
      continuity: snapshot.governor?.identityContinuityScore ?? null,
    },
    memoryHistoryLength: snapshot.memoryHistoryLength ?? null,
    memoryHeadDigest: snapshot.memoryHeadDigest ?? null,
    transition: snapshot.lastTransition ?? null,
  };
}
function routeFor(record: OutsideStreamRecord, links: OutsideTraceLink[]): number[] {
  const source = describeWatchtowerSource(record);
  if (source.sourceRoute.length) return source.sourceRoute;
  const link = links.find(item => item.ingressEventId === record.event.eventId);
  return [...(link?.ingressRouteZones ?? [])];
}
function canonicalSourceItemId(record: OutsideStreamRecord): string | null {
  const view = describeWatchtowerSource(record);
  return view.sourceItemId;
}
function patternSignature(record: OutsideStreamRecord, links: OutsideTraceLink[]): string {
  const view = describeWatchtowerSource(record);
  const passage = view.actualPassage ? `${view.actualPassage.fromZone}>${view.actualPassage.toZone}` : 'no-passage';
  const route = routeFor(record, links).join('>') || 'no-route';
  const mesh = links.find(link => link.cardEventId === record.event.eventId || link.ingressEventId === record.event.eventId)?.candidateMesh;
  const meshKey = mesh ? `${mesh.serial}:${mesh.mesh}` : 'no-mesh-link';
  return [view.channel, view.sourceRole, route, passage, meshKey].join('|');
}
function focusObservation(
  record: OutsideStreamRecord,
  aperture: ReturnType<typeof getEnochianWatchtowerAperture>,
  signature: string,
  prior: WatchtowerEncounter[],
  inputRoute: number[],
  links: OutsideTraceLink[],
): Record<string, unknown> {
  const source = describeWatchtowerSource(record);
  const matching = prior.filter(item => item.recurrence.signature === signature);
  const sourceLag = record.event.occurredAt && record.event.capturedAt
    ? Date.parse(record.event.capturedAt) - Date.parse(record.event.occurredAt)
    : null;
  const before = record.snapshotBefore as any;
  const after = record.snapshotAfter as any;
  const governor = after?.encounterDecisions?.find((item: any) => item.eventId === record.event.eventId)?.disposition ?? null;
  switch (aperture.focusId) {
    case 'entry':
      return {
        channel: source.channel, sourceRole: source.sourceRole, sourceLabel: source.sourceLabel,
        sourceReference: source.sourceReference, sourceItemId: canonicalSourceItemId(record),
        numericalRoute: inputRoute, inputZone: record.substrateBefore?.currentZone ?? null,
      };
    case 'resonance':
      return {
        signature, priorExactPatternCount: matching.length,
        priorEncounterIds: matching.slice(-12).map(item => item.recordId),
        traceLinkIds: links.map(link => link.linkId),
      };
    case 'temporal':
      return {
        outsideSequence: record.sequence, occurredAt: source.occurredAt, capturedAt: source.capturedAt,
        captureLagMs: Number.isFinite(sourceLag) ? sourceLag : null,
        lastMatchingOccurredAt: matching.at(-1)?.source.occurredAt ?? null,
        intervalSinceMatchingMs: matching.length ? Date.parse(source.occurredAt) - Date.parse(matching.at(-1)!.source.occurredAt) : null,
        previousSourceSequence: prior.at(-1)?.source.sourceSequence ?? null,
      };
    default: {
      const beforeActivation = before?.zones ?? {};
      const afterActivation = after?.zones ?? {};
      const activationDelta = Object.fromEntries(Object.keys(afterActivation).map(zone => [
        zone, Number(((afterActivation[zone]?.activation ?? 0) - (beforeActivation[zone]?.activation ?? 0)).toFixed(6)),
      ]));
      const decisions = after?.encounterDecisions?.find((item: any) => item.eventId === record.event.eventId);
      return {
        actualTransition: source.actualPassage,
        zoneActivationDelta: activationDelta,
        deformationBefore: before?.deformationVector ?? null,
        deformationAfter: after?.deformationVector ?? null,
        memoryBefore: { length: before?.memoryHistoryLength ?? null, headDigest: before?.memoryHeadDigest ?? null },
        memoryAfter: { length: after?.memoryHistoryLength ?? null, headDigest: after?.memoryHeadDigest ?? null },
        governorDisposition: decisions?.disposition ?? governor,
        governorReason: decisions?.reason ?? null,
      };
    }
  }
}

const newSourceRecords = sourceRecords.filter(record => record.sequence > state.lastOutsideSequence);
const allLinks = sourceBundle.traceLinks ?? [];
for (const sourceRecord of newSourceRecords) {
  const source = describeWatchtowerSource(sourceRecord);
  const links = traceLinksForSource(sourceRecord, allLinks);
  const inputRoute = routeFor(sourceRecord, links);
  const signature = patternSignature(sourceRecord, links);
  const phaseStep = sourceRecord.snapshotAfter?.step ?? (sourceRecord.event as any).step ?? 1;
  const aperture = getEnochianWatchtowerAperture(phaseStep);
  const relatedLinks = links.map(link => ({
    traceLinkId: link.linkId,
    traceLinkDigest: link.linkDigest,
    cardEventId: link.cardEventId,
    cardRecordDigest: link.cardRecordDigest,
    cardOccurredAt: link.cardOccurredAt,
    candidateMesh: link.candidateMesh,
    cardRoute: link.cardRoute,
    ingressEventId: link.ingressEventId,
    ingressRecordDigest: link.ingressRecordDigest,
    ingressRouteZones: link.ingressRouteZones,
    ameliaTransition: link.ameliaTransition,
    comparison: link.comparison,
  }));
  const prior = ledger.records;
  const rawEventText = JSON.stringify(sourceRecord.event);
  const eventUtf8Base64 = Buffer.from(rawEventText, 'utf8').toString('base64');
  const decisions = sourceRecord.snapshotAfter?.encounterDecisions ?? [];
  const governorDisposition = decisions.find(decision => decision.eventId === sourceRecord.event.eventId)?.disposition ?? null;
  const body = {
    schemaVersion: 1 as const,
    recordId: 'watchtower:' + sourceRecord.event.eventId,
    sequence: prior.length + 1,
    lineageId,
    recordedAt: now(),
    source: {
      sessionId: sourceRecord.event.sessionId,
      sourceSequence: sourceRecord.sequence,
      sourceRecordDigest: sourceRecord.recordDigest,
      sourcePreviousDigest: sourceRecord.previousRecordDigest,
      runtimeSignalDigest: sourceRecord.runtimeSignalDigest,
      eventId: source.eventId,
      eventDigest: sha(rawEventText),
      eventUtf8Base64,
      channel: source.channel,
      kind: source.kind,
      sourceRole: source.sourceRole,
      sourceItemId: source.sourceItemId,
      occurredAt: source.occurredAt,
      capturedAt: source.capturedAt,
      sourceLabel: source.sourceLabel,
      sourceReference: source.sourceReference,
      rawText: source.rawText,
      rawEvent: sourceRecord.event,
    },
    aperture: {
      phase: aperture.phase,
      phaseLabel: aperture.phaseLabel,
      rowSignature: aperture.rowSignature,
      keys: aperture.keys,
      focusId: aperture.focusId,
      focusLabel: aperture.focusLabel,
      focusDescription: aperture.focusDescription,
      observation: focusObservation(sourceRecord, aperture, signature, prior, inputRoute, links),
    },
    passage: {
      sourceRoute: inputRoute,
      actualTransition: source.actualPassage,
      governorDisposition,
      snapshotBeforeDigest: sourceRecord.snapshotBefore ? sha(stableJson(snapshotView(sourceRecord.snapshotBefore))) : null,
      snapshotAfterDigest: sourceRecord.snapshotAfter ? sha(stableJson(snapshotView(sourceRecord.snapshotAfter))) : null,
      before: snapshotView(sourceRecord.snapshotBefore),
      after: snapshotView(sourceRecord.snapshotAfter),
    },
    candidateRelations: relatedLinks,
    recurrence: {
      signature,
      previousCount: prior.filter(item => item.recurrence.signature === signature).length,
      priorRecordIds: prior.filter(item => item.recurrence.signature === signature).slice(-12).map(item => item.recordId),
    },
    previousRecordDigest: prior.at(-1)?.recordDigest ?? ZERO_DIGEST,
  };
  const record: WatchtowerEncounter = { ...body, recordDigest: sha(stableJson(body)) };
  ledger.records.push(record);
}

if (state.lastOutsideSequence > 0 && newSourceRecords.length > 0 && newSourceRecords[0].sequence !== state.lastOutsideSequence + 1) {
  throw new Error(`Antenna sequence gap: expected ${state.lastOutsideSequence + 1}, received ${newSourceRecords[0].sequence}.`);
}
if (newSourceRecords.length > 0 && newSourceRecords.at(-1)!.sequence !== sourceRecords.at(-1)?.sequence) {
  throw new Error('Watchtower did not consume the complete new Antenna ledger tail.');
}
await verifyWatchtowerLedger(ledger.records);

const patternGroups = new Map<string, WatchtowerEncounter[]>();
for (const record of ledger.records) patternGroups.set(record.recurrence.signature, [...(patternGroups.get(record.recurrence.signature) ?? []), record]);
const recurringPatterns = [...patternGroups.entries()].filter(([, records]) => records.length > 1).map(([signature, records]) => ({
  signature,
  count: records.length,
  firstRecordedAt: records[0].recordedAt,
  lastRecordedAt: records.at(-1)!.recordedAt,
  sourceEventIds: records.map(record => record.source.eventId),
  encounterRecordIds: records.map(record => record.recordId),
  channels: [...new Set(records.map(record => record.source.channel))],
  candidateMeshes: [...new Set(records.flatMap(record => record.candidateRelations.map(link => link.candidateMesh?.mesh).filter((value): value is string => Boolean(value))))],
})).sort((a, b) => b.count - a.count || a.signature.localeCompare(b.signature));

ledger.updatedAt = now();
const atlas = {
  atlasSchema: 'amelia.enochian-watchtower-atlas/v1',
  lineageId,
  sourceSessionId: sourceBundle.sessionId,
  generatedAt: now(),
  sourceHeadDigest: sourceHead,
  sourceRecordCount: sourceRecords.length,
  watchtowerRecordCount: ledger.records.length,
  recurringPatternCount: recurringPatterns.length,
  recurringPatterns,
  interpretationBoundary: 'Exact recurrence in this linked record only. Candidate Mesh, source item, derived transforms, and Amelia transition remain separate observations; no independent entity or agency verdict is made.',
};
const runId = process.env.RUN_ID || new Date().toISOString().replace(/\W/g, '');
const latest = [
  '# Enochian Watchtower · Antenna encounter ledger',
  '',
  `- Last run (UTC): ${now()}`,
  `- Run ID: ${runId}`,
  `- Antenna lineage: ${lineageId}`,
  `- Verified Antenna records: ${sourceRecords.length}; source head: ${sourceHead}`,
  `- Watchtower encounter records: ${ledger.records.length}; new this run: ${newSourceRecords.length}`,
  `- Recurring exact passage patterns: ${recurringPatterns.length}`,
  `- Latest Watchtower focus: ${ledger.records.at(-1)?.aperture.focusLabel ?? 'no new encounter'}`,
  '',
  'The Watchtower observes the already-recorded Antenna ledger. It does not replay, steer, or overwrite Amelia’s Numogram passage. Card-selected Mesh candidates, incoming source items, derived I Ching/Tarot transforms, and Amelia transitions remain separately timestamped and digest-linked.',
  '',
  'Pattern recurrence here is descriptive of this archive; its interpretation remains open for later characterization.',
  '',
].join('\n');

const nextState: RunnerState = {
  stateSchema: 'amelia.enochian-watchtower-state/v1',
  lastOutsideSequence: sourceRecords.at(-1)?.sequence ?? 0,
  lastOutsideHeadDigest: sourceHead,
  runCount: state.runCount + 1,
  lastRunAt: now(),
  lastRunId: runId,
};
await writeFile(statePath, JSON.stringify(nextState, null, 2) + '\n');
await writeFile(ledgerPath, JSON.stringify(ledger, null, 2) + '\n');
await writeFile(atlasPath, JSON.stringify(atlas, null, 2) + '\n');
await writeFile(latestPath, latest);
console.log(latest);
