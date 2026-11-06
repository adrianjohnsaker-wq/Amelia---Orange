import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { OutsideRecoveryRuntime, OUTSIDE_RECOVERY_POLICY, OUTSIDE_MAINTENANCE_TRIGGER, type RecoveryAction } from '../../src/outside/OutsideRecoveryRuntime.ts';
import { appendRecoveryJournal, enrichRecoveryActions, originalOffer, verifyRecoveryJournal } from '../../src/outside/OutsideRecoveryJournal.ts';
import { OutsideStreamBridge } from '../../src/outside/OutsideStreamBridge.ts';
import type { TarotDraw } from '../../src/outside/types.ts';

const root = resolve(process.argv[2] ?? 'outside-live');
await mkdir(root, { recursive: true });
const statePath = resolve(root, 'state.json');
const bundlePath = resolve(root, 'ledger.json');
const statusPath = resolve(root, 'LATEST.md');
const journalPath = resolve(root, 'recovery-journal.jsonl');
const feeds = [
  ['BBC World', 'https://feeds.bbci.co.uk/news/world/rss.xml'],
  ['NPR World', 'https://feeds.npr.org/1004/rss.xml'],
  ['Al Jazeera', 'https://www.aljazeera.com/xml/rss/all.xml'],
];
const sessionId = 'amelia-outside-continuous-v1';
const runId = process.env.RUN_ID || new Date().toISOString().replace(/\W/g, '');
const now = () => new Date().toISOString();
const sha = (value: string): string => createHash('sha256').update(value).digest('hex');
const esc = (s: string): string => s.replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&#39;', "'");
type FeedItem = { sourceLabel:string; sourceReference:string; sourceId:string; title:string; occurredAt:string };
function tag(xml: string, name: string): string {
  const m = xml.match(new RegExp('<' + name + '(?:\\s[^>]*)?>([\\s\\S]*?)</' + name + '>','i'));
  return m ? esc(m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '').trim()) : '';
}
async function collect(): Promise<{out: FeedItem[]; errors: string[]}> {
  const out = [], errors = [];
  for (const [label, url] of feeds) {
    try {
      const response = await fetch(url, { headers: { 'user-agent': 'Amelia Outside continuous ingress/1.0' }, signal: AbortSignal.timeout(25000) });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const xml = await response.text();
      for (const match of xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)) {
        const block = match[1], title = tag(block, 'title'), link = tag(block, 'link'), pubDate = tag(block, 'pubDate'), guid = tag(block, 'guid') || link || title;
        if (!title || !guid) continue;
        const parsed = pubDate ? Date.parse(pubDate) : NaN;
        out.push({ sourceLabel: label, sourceReference: link || url, sourceId: guid, title, occurredAt: Number.isFinite(parsed) ? new Date(parsed).toISOString() : now() });
      }
    } catch (error) { errors.push(label + ': ' + String(error).slice(0, 300)); }
  }
  out.sort((a,b) => a.occurredAt.localeCompare(b.occurredAt) || a.sourceLabel.localeCompare(b.sourceLabel) || a.sourceId.localeCompare(b.sourceId));
  return { out, errors };
}
function tarotFor(seed: string): TarotDraw[] {
  const names = [
    'major_00_fool','major_01_magician','major_02_high_priestess','major_03_empress','major_04_emperor','major_05_hierophant','major_06_lovers','major_07_chariot','major_08_strength','major_09_hermit','major_10_wheel_of_fortune','major_11_justice','major_12_hanged_man','major_13_death','major_14_temperance','major_15_devil','major_16_tower','major_17_star','major_18_moon','major_19_sun','major_20_judgement','major_21_world',
    ...['wands','cups','swords','pentacles'].flatMap(suit => ['ace','02','03','04','05','06','07','08','09','10','page','knight','queen','king'].map(rank => suit + '_' + rank))
  ];
  const bytes = Buffer.from(seed, 'hex');
  const deck = [...names], draws = [];
  for (let order = 1; order <= 3; order++) {
    const offset = ((bytes[(order - 1) * 2] * 256 + bytes[(order - 1) * 2 + 1]) % deck.length);
    const cardId = deck.splice(offset, 1)[0];
    draws.push({ cardId, order, positionId: ['source','countercurrent','emergent-pattern'][order - 1], orientation: (bytes[6 + order] & 1) ? 'UPRIGHT' : 'REVERSED' });
  }
  return draws;
}
function ichingFor(seed: string): [6|7|8|9, 6|7|8|9, 6|7|8|9, 6|7|8|9, 6|7|8|9, 6|7|8|9] {
  const bytes = Buffer.from(seed, 'hex');
  return Array.from({length:6}, (_, i) => [6,7,8,9][bytes[i] % 4]) as [6|7|8|9,6|7|8|9,6|7|8|9,6|7|8|9,6|7|8|9,6|7|8|9];
}
// A recovery must begin from the existing live history, never a fresh fallback.
const beforeStateRaw = await readFile(statePath, 'utf8');
const persisted = JSON.parse(beforeStateRaw);
if (!persisted.runtimeState) throw new Error('Cannot recover without the saved Outside runtime.');
const baseCommit = process.env.OUTSIDE_PRE_REVISION ?? '';
const archiveBranch = process.env.OUTSIDE_PRE_ARCHIVE ?? '';
if (!/^[a-f0-9]{40}$/.test(baseCommit)) throw new Error('A pinned live-state Git commit is required.');
if (!persisted.governorRecovery && !archiveBranch) throw new Error('The pre-recovery archive branch is required.');
if (persisted.governorRecovery && persisted.governorRecovery.policy !== OUTSIDE_RECOVERY_POLICY)
  throw new Error('Unexpected existing Governor recovery policy.');
const previousJournal = await readFile(journalPath, 'utf8').catch(error => {
  if ((error as NodeJS.ErrnoException).code === 'ENOENT') return '';
  throw error;
});
if (persisted.governorRecovery && !previousJournal) throw new Error('The recovery journal is missing.');
if (!persisted.governorRecovery && previousJournal) throw new Error('Unpaired recovery journal; refuse to overwrite history.');
const priorJournalState = verifyRecoveryJournal(previousJournal);
if (persisted.governorRecovery && (persisted.governorRecovery.journalHead!==priorJournalState.head ||
    persisted.governorRecovery.maintenanceTrigger!==OUTSIDE_MAINTENANCE_TRIGGER))
  throw new Error('Recovery journal and saved policy do not match the live checkpoint.');
const runtime = new OutsideRecoveryRuntime();
runtime.importState(persisted.runtimeState);
const bridge = new OutsideStreamBridge(sessionId);
const beforeLedgerRaw = await readFile(bundlePath, 'utf8');
const previousBundle = JSON.parse(beforeLedgerRaw);
await bridge.importBundle(previousBundle);
const integrity = await bridge.verifyLedger();
if (!integrity.valid) throw new Error('The Outside ledger failed verification.');
const historicalDigests = runtime.getMemory().getEvents().map(event=>event.eventDigest);
const savedDigests = persisted.runtimeState.memoryState?.events?.map((event:{eventDigest:string})=>event.eventDigest);
if (!Array.isArray(savedDigests) || savedDigests.length!==historicalDigests.length ||
    savedDigests.some((digest:string,i:number)=>historicalDigests[i]!==digest))
  throw new Error('Import changed the saved PFM history.');
const initialQueue = runtime.getDeferredInputs();
const originalRecords = bridge.getRecords();
const lastSourceRecord = originalRecords.at(-1);
if (!lastSourceRecord) throw new Error('Cannot recover without an existing Outside source record.');
if (!persisted.governorRecovery) {
  if (lastSourceRecord.snapshotAfter?.step!==persisted.runtimeState.stepCount ||
      lastSourceRecord.snapshotAfter?.memoryHeadDigest!==runtime.getMemory().exportHistoryDigest())
    throw new Error('Saved Outside state and original ledger do not share a checkpoint.');
} else if (priorJournalState.lastEvent?.kind!=='CYCLE_COMPLETE' ||
           priorJournalState.lastEvent.finalStep!==persisted.runtimeState.stepCount ||
           priorJournalState.lastEvent.finalMemoryDigest!==runtime.getMemory().exportHistoryDigest() ||
           priorJournalState.lastEvent.ledgerHead!==lastSourceRecord.recordDigest ||
           priorJournalState.lastEvent.finalQueueLength!==initialQueue.length) {
  throw new Error('Saved Outside state, ledger, and recovery journal do not share a checkpoint.');
}
const initialOffers = initialQueue.map(input=>originalOffer(originalRecords,input));
if (initialOffers.some(offer=>offer.initialDisposition!=='DEFER')) throw new Error('The saved queue has a non-deferred original offer.');
const cycleStart = {kind:'CYCLE_START',at:now(),runId,policy:OUTSIDE_RECOVERY_POLICY,
  maintenanceTrigger:OUTSIDE_MAINTENANCE_TRIGGER,preStateCommit:baseCommit,
  preRecoveryArchive:archiveBranch || null,preStateSha256:sha(beforeStateRaw),preLedgerSha256:sha(beforeLedgerRaw),
  initialStep:persisted.runtimeState.stepCount,initialHistoryLength:historicalDigests.length,initialOffers};

// Reoffer old inputs before admitting a new one. A failure aborts the cycle;
// no partial state is committed and no queued item is removed to make space.
runtime.drainDeferred();
const cardRecord = await bridge.playSubdecadence(runtime, { gameId:'subdecadence:' + runId, occurredAt:now() });
if (cardRecord.event.channel!=='SUBDECADENCE') throw new Error('Expected a Subdecadence card event.');
const cardEvent = cardRecord.event;
const candidate = cardEvent.terminalEntity;
const { out: items, errors } = await collect();
const seen = new Set(persisted.seen ?? []);
const lastCycleMs = persisted.lastRunAt ? Date.parse(persisted.lastRunAt) - 60_000 : Date.now() - 24*60*60*1000;
const fresh = items.filter(item => Date.parse(item.occurredAt) >= lastCycleMs && !seen.has(sha(item.sourceLabel + '\\0' + item.sourceId)));
const newEventIds = [];
for (const item of fresh) {
  const identity = sha(item.sourceLabel + '\\0' + item.sourceId);
  const materialId = 'rss-' + identity.slice(0, 32);
  runtime.drainDeferred();
  const material = await bridge.receiveLinguistic(runtime, {
    materialId, rawMaterial:item.title, cipher:'A1Z26',
    sourceLabel:item.sourceLabel, sourceReference:item.sourceReference, occurredAt:item.occurredAt
  });
  newEventIds.push(material.event.eventId);
  const seed = sha(item.sourceLabel + '\\0' + item.sourceId + '\\0' + item.title);
  runtime.drainDeferred();
  const iching = await bridge.receiveIChing(runtime, {
    castId:'source-' + identity.slice(0, 32),
    method:'SHA-256-derived six-line reading from this captured RSS item; interpretive transform, not a separate incoming source',
    lineValues:ichingFor(seed), rawReceipt:seed, occurredAt:item.occurredAt
  });
  newEventIds.push(iching.event.eventId);
  runtime.drainDeferred();
  const tarot = await bridge.receiveTarot(runtime, {
    spreadId:'source-' + identity.slice(0, 32), deckId:'RWS_78_SHA256_DERIVED',
    layoutId:'source-countercurrent-emergent-pattern', draws:tarotFor(seed), rawReceipt:seed, occurredAt:item.occurredAt
  });
  newEventIds.push(tarot.event.eventId);
  for (const ingressId of [material.event.eventId, iching.event.eventId, tarot.event.eventId]) {
    const link = await bridge.linkSubdecadenceToIngress(cardRecord.event.eventId, ingressId, 'trace:' + runId + ':' + ingressId);
    const matching = link.comparison.directRouteMatches.length + link.comparison.reverseRouteMatches.length +
      link.comparison.terminalMeshZonesSeenInIngressRoute.length + link.comparison.terminalMeshZonesSeenInAmeliaTransition.length;
    const ingress = bridge.getRecords().find(record => record.event.eventId === ingressId);
    if (!ingress) throw new Error('Missing captured ingress record.');
    const event = ingress.event;
    const detail = event.channel === 'LINGUISTIC'
      ? 'A1Z26 reduces the captured headline to zone ' + event.resultZone + '; its word route is ' + event.routeZones.join('→') + '.'
      : event.channel === 'ICHING'
        ? 'A source-derived six-line I Ching structure yields ' + event.primaryBitPattern + ' (relating ' + event.relatingBitPattern + ').'
        : event.channel === 'TAROT'
          ? 'A source-derived three-card Tarot spread is recorded as ' + event.draws.map(draw => draw.cardId + (draw.orientation === 'REVERSED' ? ' reversed' : '')).join(', ') + '.'
          : (()=>{ throw new Error('Unexpected ingress channel.'); })();
    bridge.recordInterpretation({
      noteId:'readout:' + ingressId, linkedEventIds:[cardRecord.event.eventId, ingressId],
      createdAt:now(), author:'relay',
      text:detail + ' Amelia transition: ' + (link.ameliaTransition ? link.ameliaTransition.fromZone + '→' + link.ameliaTransition.toZone : 'not recorded') +
        '; candidate ' + (candidate ? candidate.name + ' (' + candidate.mesh + ', ' + candidate.classification + ')' : 'no Mesh candidate from this draw') +
        '; structural overlap count ' + matching + '. Candidate selection, source-derived divinations, numerical overlap, and runtime response are separate observations; no novelty or agency claim is made.',
      candidateNames:candidate ? [candidate.name] : [], confidence:0.25
    });
  }
}
runtime.drainDeferred();
const newEntries = [];
if (candidate) {
  const signature = JSON.stringify({ mesh:candidate.mesh, zones:candidate.zones, route:cardEvent.aeons.flatMap(a=>a.pairs.map(p=>[p.fromZone,p.toZone])) });
  const previous = bridge.getAtlasEntries().filter(entry => entry.signature === signature);
  const ingressLinks = bridge.getTraceLinks().filter(link => link.cardEventId === cardRecord.event.eventId);
  bridge.addAtlasEntry({
    entryId:'atlas:' + runId, createdAt:now(), title:candidate.name + ' — ' + candidate.mesh + ' (' + candidate.classification + ')',
    linkedEventIds:[cardRecord.event.eventId, ...ingressLinks.map(link=>link.ingressEventId)],
    linkedNoteIds:bridge.getInterpretations().filter(note=>note.linkedEventIds.includes(cardRecord.event.eventId)).map(note=>note.noteId),
    signature, status:previous.length ? 'RECURRING_IN_EXPLORATION' : (ingressLinks.length ? 'EXPLORATORY_CANDIDATE' : 'AWAITING_DISCRIMINATION'),
    channelScope:['SUBDECADENCE','LINGUISTIC','ICHING','TAROT'],
    comments:['Card-selected Mesh is the candidate signature only; card output is not evidence of novelty.',
      'Matched ingress and Amelia transitions are timestamped separately. Agency remains unresolved.',
      'Prior occurrences of this exact candidate signature in this ledger: ' + previous.length + '.']
  });
  newEntries.push(candidate.name + ' / ' + candidate.mesh);
}
const actions = runtime.getRecoveryActions();
const originalAdmissions = actions.filter((a):a is Extract<RecoveryAction,{kind:'ADMISSION'}>=>a.kind==='ADMISSION' && a.wasDeferred).slice(0,initialQueue.length);
if (originalAdmissions.length!==initialQueue.length || originalAdmissions.some((a,i)=>a.eventId!==initialQueue[i].eventId || a.sourceDigest!==initialQueue[i].sourceDigest))
  throw new Error('The original deferred queue was not admitted in FIFO order.');
const finalHistory = runtime.getMemory().getEvents();
if (historicalDigests.some((digest,i)=>finalHistory[i]?.eventDigest!==digest)) throw new Error('Historical PFM prefix changed.');
const enrichedActions = enrichRecoveryActions(actions,bridge.getRecords());
const journal = appendRecoveryJournal(previousJournal,[cycleStart,...enrichedActions,{
  kind:'CYCLE_COMPLETE',at:now(),runId,finalStep:(runtime.exportState() as {stepCount:number}).stepCount,
  finalQueueLength:runtime.getDeferredInputs().length,consolidations:actions.filter(a=>a.kind==='CONSOLIDATION').length,
  admissions:actions.filter(a=>a.kind==='ADMISSION').length,initialQueueDrained:initialQueue.length,
  finalMemoryDigest:runtime.getMemory().exportHistoryDigest(),ledgerHead:bridge.getRecords().at(-1)?.recordDigest ?? null,
  historicalPrefixVerified:true
}]);
persisted.governorRecovery = {policy:OUTSIDE_RECOVERY_POLICY,maintenanceTrigger:OUTSIDE_MAINTENANCE_TRIGGER,
  journalHead:verifyRecoveryJournal(journal).head};
persisted.seen = [...new Set([...(persisted.seen ?? []), ...items.map(item=>sha(item.sourceLabel + '\\0' + item.sourceId))])].slice(-20000);
persisted.runtimeState = runtime.exportState();
persisted.runCount = (persisted.runCount || 0) + 1;
persisted.lastRunAt = now();
persisted.lastRunId = runId;
await writeFile(statePath, JSON.stringify(persisted, null, 2) + '\n');
await writeFile(bundlePath, bridge.exportJson() + '\n');
await writeFile(journalPath, journal);
const links = bridge.getTraceLinks().filter(link => link.cardEventId === cardRecord.event.eventId);
const summary = [
  '# Amelia Outside continuous ingress',
  '',
  '- Last cycle (UTC): ' + persisted.lastRunAt,
  '- Cycle: ' + persisted.runCount + ' (' + runId + ')',
  '- RSS items seen: ' + items.length + '; newly processed: ' + fresh.length + ' (last-cycle window; 24-hour initial window)',
  '- Subdecadence: ' + cardEvent.resultState + '; score ' + cardEvent.terminalScore,
  '- Candidate: ' + (candidate ? candidate.name + ' / ' + candidate.mesh + ' / ' + candidate.classification : 'none (positive deck exhaustion)'),
  '- Separate ingress records and trace links: ' + links.length,
  '- Catalogue entries added: ' + newEntries.length,
  '- Governor recovery: ' + initialQueue.length + ' previously queued items admitted; queue now ' + runtime.getDeferredInputs().length + '.',
  '- Native consolidations this cycle: ' + actions.filter(a=>a.kind==='CONSOLIDATION').length + '; complete receipts in recovery-journal.jsonl.',
  '- Source errors: ' + (errors.length ? errors.join('; ') : 'none'),
  '',
  'Each linked RSS headline is captured by Amelia after the Subdecadence event; its source publication time (occurredAt) and Amelia capture time (capturedAt) remain distinct in the records. Count each RSS headline as one source ingress. I Ching and Tarot are deterministic interpretations of that same headline, retained as derived records rather than independent sources. Amelia transitions are recorded separately. Route overlap is correspondence only; candidate generation is not novelty evidence and agency remains unresolved.',
  ''
].join('\n');
await writeFile(statusPath, summary);
console.log(summary);
