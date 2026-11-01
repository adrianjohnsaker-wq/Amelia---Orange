import type { OutsideStreamRecord, OutsideTraceLink } from './types';

/** Project-specific Watchtower matrix; glosses are interpretive cues, not asserted translations. */
export const ENOCHIAN_WATCHTOWER_MATRIX = [
  ['m', 'a', 'd', 'o', 'l', 'g'],
  ['v', 'r', 'e', 'g', 'z', 'o'],
  ['i', 'o', 'i', 'a', 'd', 't'],
  ['b', 'i', 't', 'o', 'm', 'e'],
] as const;

const KEY_GLOSSES: Readonly<Record<string, string>> = {
  MAD: 'creative origin', OLG: 'material grounding', VREG: 'sonic resonance',
  ZODACAR: 'dynamic velocity', IOIAD: 'temporal distortion', TORZU: 'structural escalation',
  BITOM: 'destructive transformation', EXENTSER: 'chaos and linear breakage',
};

const LENSES = [
  { id: 'entry', label: 'Entry and grounding', description: 'Attend to the incoming element, its source and numerical route, and the Numogram passage it enters.' },
  { id: 'resonance', label: 'Resonance and recurrence', description: 'Attend to repeated source routes, candidate Mesh relations, and lineage-linked prior encounters.' },
  { id: 'temporal', label: 'Temporal return', description: 'Attend to source and capture times, sequence, intervals, re-entry, and interruption.' },
  { id: 'transformation', label: 'Transformation and rupture', description: 'Attend to before/after zone activation, deformation, PFM state, and Governor disposition.' },
] as const;

export interface EnochianWatchtowerAperture {
  phase: number;
  phaseLabel: string;
  rowSignature: string;
  keys: Array<{ token: string; gloss: string }>;
  focusId: typeof LENSES[number]['id'];
  focusLabel: string;
  focusDescription: string;
}

export function getEnochianWatchtowerAperture(step: number): EnochianWatchtowerAperture {
  const phase = ((Math.floor(step) - 1) % ENOCHIAN_WATCHTOWER_MATRIX.length + ENOCHIAN_WATCHTOWER_MATRIX.length) % ENOCHIAN_WATCHTOWER_MATRIX.length;
  const rowSignature = ENOCHIAN_WATCHTOWER_MATRIX[phase].join('').toUpperCase();
  const lens = LENSES[phase];
  return {
    phase,
    phaseLabel: `row ${phase + 1} of ${ENOCHIAN_WATCHTOWER_MATRIX.length}`,
    rowSignature,
    keys: Object.entries(KEY_GLOSSES).filter(([token]) => rowSignature.includes(token)).map(([token, gloss]) => ({ token, gloss })),
    focusId: lens.id,
    focusLabel: lens.label,
    focusDescription: lens.description,
  };
}

export interface WatchtowerSourceView {
  eventId: string;
  sourceSequence: number;
  channel: string;
  kind: string;
  sourceRole: 'card-candidate' | 'primary-source-item' | 'derived-transform' | 'substrate-observation';
  sourceItemId: string | null;
  occurredAt: string;
  capturedAt: string;
  sourceLabel: string | null;
  sourceReference: string | null;
  rawText: string | null;
  sourceRoute: number[];
  actualPassage: { fromZone: number; toZone: number; transitionDigest: string | null } | null;
}

/** An explicit, non-authorising reading of one already-recorded Antenna event. */
export function describeWatchtowerSource(record: OutsideStreamRecord): WatchtowerSourceView {
  const event = record.event as any;
  let sourceRole: WatchtowerSourceView['sourceRole'] = 'substrate-observation';
  if (event.channel === 'SUBDECADENCE') sourceRole = 'card-candidate';
  else if (event.channel === 'LINGUISTIC') sourceRole = 'primary-source-item';
  else if (event.channel === 'ICHING' || event.channel === 'TAROT') sourceRole = 'derived-transform';

  let sourceItemId: string | null = null;
  if (event.channel === 'LINGUISTIC') sourceItemId = event.materialId ?? null;
  if (event.channel === 'ICHING') sourceItemId = String(event.castId ?? '').replace(/^source-/, 'rss-') || null;
  if (event.channel === 'TAROT') sourceItemId = String(event.spreadId ?? '').replace(/^source-/, 'rss-') || null;
  const sourceRoute: number[] = event.channel === 'LINGUISTIC'
    ? [...(event.routeZones ?? [])]
    : event.channel === 'SUBDECADENCE'
      ? (event.aeons ?? []).flatMap((aeon: any) => (aeon.pairs ?? []).flatMap((pair: any) => [pair.fromZone, pair.toZone]))
      : [];
  const actualPassage = record.substrateBefore && record.substrateAfter
    ? {
      fromZone: record.substrateBefore.currentZone,
      toZone: record.substrateAfter.currentZone,
      transitionDigest: record.substrateAfter.transitionDigest,
    }
    : null;
  return {
    eventId: event.eventId,
    sourceSequence: record.sequence,
    channel: event.channel,
    kind: event.kind,
    sourceRole,
    sourceItemId,
    occurredAt: event.occurredAt,
    capturedAt: event.capturedAt,
    sourceLabel: event.sourceLabel ?? null,
    sourceReference: event.sourceReference ?? null,
    rawText: event.rawMaterial ?? null,
    sourceRoute,
    actualPassage,
  };
}

export function traceLinksForSource(record: OutsideStreamRecord, links: OutsideTraceLink[]): OutsideTraceLink[] {
  return links.filter(link => link.cardEventId === record.event.eventId || link.ingressEventId === record.event.eventId);
}
