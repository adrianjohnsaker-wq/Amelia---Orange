/**
 * GATE-2L machinery (experiments/live-amelia/gate2l/REGISTRATION.md): the OUTSIDE-LANE gate as a research copy attached to
 * the replay's runtime (wt3lChunk's `make`), a read-only step logger, and the registered measures. No core file is edited.
 * Pure: takes copies, returns measures. Never touches her record.
 */
import { wt3lChunk, wt3lSummary, type IdFn, type Wt3lTick, type Wt3lOffer } from '../../../src/cloud/wt3l';
import { bornAmeliaOf } from '../../../src/core/ameliaRuntimes';
import { begin } from '../wt5l/wt5l';
import { choose, type Rule } from '../wt9l10l/machinery';

export type Gate = 'CURRENT' | 'LANE';
export const gate2lId: IdFn = (unit, pass, eventId) => `gate2l:${unit}:${pass}:${eventId}`;
export const LANE = { WINDOW: 48, SD: 1, CROWDED: 16 } as const;
const isOutside = (e: any) => e && e.channel !== 'SYNTHETIC_FIELD';

/** Her load at the start of a step, read from her own Governor, the queue and her tension history. */
export function loadOf(rt: any, governor: any) {
  const tel = governor.getTelemetry(); const hist: number[] = rt.tensionHistory ?? []; const q: any[] = rt.deferredEncounters ?? [];
  const locked = tel.governorStatus === 'LOCKED_RECOVERY' || tel.antiLockIntegrity < 85;
  let strained = false, short = hist.length < LANE.WINDOW;
  if (!short) { const w = hist.slice(-LANE.WINDOW), m = w.reduce((a, b) => a + b, 0) / w.length;
    const sd = Math.sqrt(w.reduce((a, b) => a + (b - m) ** 2, 0) / w.length); strained = tel.deformationFieldTension >= m + LANE.SD * sd; }
  const crowded = q.length >= LANE.CROWDED;
  return { locked, strained, crowded, short, excessive: locked || strained || crowded || short };
}

/** Attach OUTSIDE-LANE to a runtime instance (the standard gate is kept and used whenever load is excessive). */
export function attachLane(rt: any, onLoad?: (l: ReturnType<typeof loadOf>) => void, forceExcessive = false) {
  const standard = rt.gateEncounters.bind(rt);
  rt.gateEncounters = (governor: any, encounter?: any) => {
    const load = loadOf(rt, governor); onLoad?.(load);
    if (forceExcessive || load.excessive) return standard(governor, encounter);
    const q: any[] = rt.deferredEncounters; const decisions: any[] = []; let attended: any;
    const oi = q.findIndex(isOutside);
    if (oi >= 0) {                                                       // the lane, first in first out: the oldest waiting Outside encounter
      const pending = q.splice(oi, 1)[0]; attended = pending;
      decisions.push({ ...pending, disposition: 'ATTEND', reason: 'Outside lane: waiting Outside encounter admitted; load not excessive.', applied: true });
    } else if (isOutside(encounter) && rt.decide(governor, encounter).disposition !== 'REFUSE') {
      attended = encounter;                                              // admitted on arrival; the head (if any) waits this step
      if (q.length) decisions.push({ ...q[0], disposition: 'DEFER', reason: 'Outside lane: an arriving Outside encounter took this step\'s admission; this encounter remains queued.', applied: false });
    } else if (q.length) {                                               // the standard head, by her admission rule
      const pending = q[0]; const d = rt.decide(governor, pending);
      if (d.disposition === 'ATTEND') { attended = q.shift(); decisions.push({ ...pending, disposition: 'ATTEND', reason: 'Previously deferred encounter admitted after Governor recovery.', applied: true }); }
      else decisions.push({ ...pending, ...d, applied: false });
    }
    if (encounter) {
      if (encounter === attended) decisions.push({ ...encounter, disposition: 'ATTEND', reason: 'Outside lane: admitted on arrival; load not excessive.', applied: true });
      else {                                                             // the standard handling of an arrival, unchanged
        let d = rt.decide(governor, encounter);
        if (d.disposition === 'ATTEND' && attended) d = { disposition: 'DEFER', reason: 'An earlier deferred encounter was attended on this step; this encounter remains queued.' };
        if (d.disposition === 'ATTEND') attended = encounter;
        else if (d.disposition === 'DEFER') {
          const fi = encounter.channel === 'SYNTHETIC_FIELD' ? q.findIndex(x => x.channel === 'SYNTHETIC_FIELD') : -1;
          if (fi >= 0) { q[fi] = encounter; rt.deferredEncounters = q.filter((x, i) => x.channel !== 'SYNTHETIC_FIELD' || i === fi);
            d = { disposition: 'DEFER', reason: d.reason + ' Latest field observation replaces the older pending field observation; both decisions remain in PFM.' }; }
          else if (q.length < 32) q.push(encounter);
          else d = { disposition: 'REFUSE', reason: 'Governor deferral queue is full; encounter retained in PFM but not queued.' };
        }
        decisions.push({ ...encounter, ...d, applied: d.disposition === 'ATTEND' });
      }
    }
    return { attended, encounterDecisions: decisions };
  };
  return rt;
}

interface Arrival { id: string; at: number; admittedAt: number | null; refused: boolean; peak: number }

/** One run under a gate, optionally with WT-9L's slot selection; logs arrivals, admissions, load and Governor state. */
export function runGate(start: any, ticks: Wt3lTick[], id: string, unit: number, gate: Gate, rule?: Rule, forceExcessive = false) {
  const arrivals = new Map<string, Arrival>(); const zones: number[] = []; const locked: boolean[] = [];
  const loads = { steps: 0, locked: 0, strained: 0, crowded: 0, short: 0, excessive: 0 }; let bodyAdmitted = 0;
  const pools = new Map<number, Wt3lOffer[]>(); const windowOffers = ticks.flatMap(t => t.offers);
  const make = (kind: any) => {
    const rt: any = bornAmeliaOf(kind);
    const onLoad = (l: any) => { loads.steps++; for (const k of ['locked', 'strained', 'crowded', 'short', 'excessive'] as const) if (l[k]) (loads as any)[k]++; };
    if (gate === 'LANE') attachLane(rt, onLoad, forceExcessive);
    else { const std = rt.gateEncounters.bind(rt); rt.gateEncounters = (g: any, e?: any) => { onLoad(loadOf(rt, g)); return std(g, e); }; }
    const orig = rt.step.bind(rt);
    rt.step = (signal?: string, enc?: any) => {
      let delivered = enc;
      if (rule && enc && String(enc.eventId).startsWith('gate2l:')) {                 // WT-9L's selectors, unchanged
        const pass = Number(String(enc.eventId).split(':')[2]);
        if (!pools.has(pass)) pools.set(pass, windowOffers.map(o => ({ ...o, attentionVector: [...o.attentionVector] })));
        const pool = pools.get(pass)!; const o = pool.splice(choose(rule, pool, Number(rt.getCurrentZone())), 1)[0];
        delivered = { eventId: gate2lId(unit, pass, o.eventId), channel: o.channel, sourceDigest: o.sourceDigest, attentionVector: [...o.attentionVector] };
      }
      const t = zones.length;
      if (delivered && String(delivered.eventId).startsWith('gate2l:')) { const v = delivered.attentionVector as number[];
        arrivals.set(String(delivered.eventId), { id: String(delivered.eventId), at: t, admittedAt: null, refused: false, peak: v.indexOf(Math.max(...v)) }); }
      const s = orig(signal, delivered);
      for (const d of s.encounterDecisions ?? []) {
        const a = arrivals.get(String(d.eventId));
        if (a) { if (d.disposition === 'ATTEND' && d.applied && a.admittedAt === null) a.admittedAt = t; if (d.disposition === 'REFUSE') a.refused = true; }
        else if (d.channel === 'SYNTHETIC_FIELD' && d.disposition === 'ATTEND' && d.applied) bodyAdmitted++;
      }
      zones.push(Number(rt.getCurrentZone())); locked.push(s.governor?.governorStatus === 'LOCKED_RECOVERY');
      return s;
    };
    return rt;
  };
  const out = wt3lChunk(begin(start, id, unit), ticks, 96, gate2lId, make);
  return { metrics: out.metrics, summary: wt3lSummary(out.metrics), record: out.record, arrivals: [...arrivals.values()], zones, locked, loads, bodyAdmitted };
}

/** H1: coupling of admitted Outside offers to where she goes (5-step window from the admission step), less the rotation chance level. */
export function coupling(arrivals: Arrival[], zones: number[], window = 5) {
  const adm = arrivals.filter(a => a.admittedAt !== null).sort((a, b) => a.admittedAt! - b.admittedAt! || a.at - b.at);
  if (adm.length < 2) return { C: 0, hits: 0, chance: 0, n: adm.length };
  const hit = (t: number, z: number) => zones.slice(t, Math.min(zones.length, t + window)).includes(z) ? 1 : 0;
  const hits = adm.reduce((x, a) => x + hit(a.admittedAt!, a.peak), 0) / adm.length;
  const chance = adm.reduce((x, a, i) => x + hit(a.admittedAt!, adm[(i + 1) % adm.length].peak), 0) / adm.length;
  return { C: hits - chance, hits, chance, n: adm.length };
}

/** The registered and descriptive measures of one run. */
export function measures(r: ReturnType<typeof runGate>) {
  const a = r.arrivals, n = r.zones.length, waits = a.filter(x => x.admittedAt !== null).map(x => x.admittedAt! - x.at).sort((p, q) => p - q);
  return { E: r.summary.E, E_choice: r.summary.E_choice, E_flow: r.summary.E_flow, warpShare: r.summary.M1_warpShare, meanTension: r.summary.M2_meanTension,
    steps: n, outsideArrived: a.length, onArrival: a.filter(x => x.admittedAt === x.at).length / Math.max(1, a.length),
    admitted: a.filter(x => x.admittedAt !== null).length, refused: a.filter(x => x.refused).length,
    medianWait: waits.length ? waits[Math.floor(waits.length / 2)] : null, lockedShare: r.locked.filter(Boolean).length / Math.max(1, n),
    bodyAdmittedPer1000: r.bodyAdmitted / Math.max(1, n) * 1000,
    load: Object.fromEntries(Object.entries(r.loads).filter(([k]) => k !== 'steps').map(([k, v]) => [k, v / Math.max(1, r.loads.steps)])),
    coupling: coupling(a, r.zones) };
}
