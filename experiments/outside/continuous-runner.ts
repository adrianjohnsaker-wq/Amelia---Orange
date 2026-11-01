import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { AmeliaNumogramSubstrateRuntime } from '../../src/substrate/ameliaNumogramSubstrateRuntime.ts';
import { OutsideStreamBridge } from '../../src/outside/OutsideStreamBridge.ts';
import type { TarotDraw } from '../../src/outside/types.ts';

const root = resolve(process.argv[2] ?? 'outside-live');
await mkdir(root, { recursive: true });
const statePath = resolve(root, 'state.json');
const bundlePath = resolve(root, 'ledger.json');
const statusPath = resolve(root, 'LATEST.md');
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
const initialBundle = { bundleSchema:'amelia.outside-stream-bundle/v1', sessionId, exportedAt:now(), records:[], interpretations:[], atlasEntries:[], traceLinks:[] };
const persisted = await readFile(statePath, 'utf8').then(JSON.parse).catch(() => ({ seen:[], runtimeState:null, runCount:0 }));
const runtime = new AmeliaNumogramSubstrateRuntime();
if (persisted.runtimeState) runtime.importState(persisted.runtimeState);
else runtime.step();
const bridge = new OutsideStreamBridge(sessionId);
const previousBundle = await readFile(bundlePath, 'utf8').then(JSON.parse).catch(() => initialBundle);
await bridge.importBundle(previousBundle);
const cardRecord = await bridge.playSubdecadence(runtime, { gameId:'subdecadence:' + runId, occurredAt:now() });
const candidate = cardRecord.event.terminalEntity;
const { out: items, errors } = await collect();
const seen = new Set(persisted.seen ?? []);
const lastCycleMs = persisted.lastRunAt ? Date.parse(persisted.lastRunAt) - 60_000 : Date.now() - 24*60*60*1000;
const fresh = items.filter(item => Date.parse(item.occurredAt) >= lastCycleMs && !seen.has(sha(item.sourceLabel + '\\0' + item.sourceId)));
const newEventIds = [];
for (const item of fresh) {
  const identity = sha(item.sourceLabel + '\\0' + item.sourceId);
  const materialId = 'rss-' + identity.slice(0, 32);
  const material = await bridge.receiveLinguistic(runtime, {
    materialId, rawMaterial:item.title, cipher:'A1Z26',
    sourceLabel:item.sourceLabel, sourceReference:item.sourceReference, occurredAt:item.occurredAt
  });
  newEventIds.push(material.event.eventId);
  const seed = sha(item.sourceLabel + '\\0' + item.sourceId + '\\0' + item.title);
  const iching = await bridge.receiveIChing(runtime, {
    castId:'source-' + identity.slice(0, 32),
    method:'SHA-256-derived six-line reading from this captured RSS item; interpretive transform, not a separate incoming source',
    lineValues:ichingFor(seed), rawReceipt:seed, occurredAt:item.occurredAt
  });
  newEventIds.push(iching.event.eventId);
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
    const event = ingress.event;
    const detail = event.channel === 'LINGUISTIC'
      ? 'A1Z26 reduces the captured headline to zone ' + event.resultZone + '; its word route is ' + event.routeZones.join('→') + '.'
      : event.channel === 'ICHING'
        ? 'A source-derived six-line I Ching structure yields ' + event.primaryBitPattern + ' (relating ' + event.relatingBitPattern + ').'
        : 'A source-derived three-card Tarot spread is recorded as ' + event.draws.map(draw => draw.cardId + (draw.orientation === 'REVERSED' ? ' reversed' : '')).join(', ') + '.';
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
const newEntries = [];
if (candidate) {
  const signature = JSON.stringify({ mesh:candidate.mesh, zones:candidate.zones, route:cardRecord.event.aeons.flatMap(a=>a.pairs.map(p=>[p.fromZone,p.toZone])) });
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
persisted.seen = [...new Set([...(persisted.seen ?? []), ...items.map(item=>sha(item.sourceLabel + '\\0' + item.sourceId))])].slice(-20000);
persisted.runtimeState = runtime.exportState();
persisted.runCount = (persisted.runCount || 0) + 1;
persisted.lastRunAt = now();
persisted.lastRunId = runId;
await writeFile(statePath, JSON.stringify(persisted, null, 2) + '\n');
await writeFile(bundlePath, bridge.exportJson() + '\n');
const links = bridge.getTraceLinks().filter(link => link.cardEventId === cardRecord.event.eventId);
const summary = [
  '# Amelia Outside continuous ingress',
  '',
  '- Last cycle (UTC): ' + persisted.lastRunAt,
  '- Cycle: ' + persisted.runCount + ' (' + runId + ')',
  '- RSS items seen: ' + items.length + '; newly processed: ' + fresh.length + ' (last-cycle window; 24-hour initial window)',
  '- Subdecadence: ' + cardRecord.event.resultState + '; score ' + cardRecord.event.terminalScore,
  '- Candidate: ' + (candidate ? candidate.name + ' / ' + candidate.mesh + ' / ' + candidate.classification : 'none (positive deck exhaustion)'),
  '- Separate ingress records and trace links: ' + links.length,
  '- Catalogue entries added: ' + newEntries.length,
  '- Source errors: ' + (errors.length ? errors.join('; ') : 'none'),
  '',
  'Each RSS headline is an independently timestamped linguistic event. I Ching and Tarot readings are deterministic SHA-256-derived interpretations of that same captured item and are marked as derived, not independent channels. Amelia transitions are recorded on each event. Candidate generation is not novelty evidence; agency remains unresolved.',
  ''
].join('\n');
await writeFile(statusPath, summary);
console.log(summary);
