/**
 * WT-9L / WT-10L machinery (experiments/live-amelia/wt9l10l/REGISTRATION.md), on the WT-3L replay (unchanged) and the
 * WT-5L begin step. A runtime wrapper (passed as wt3lChunk's `make`) logs every step read-only and, for WT-9L, chooses
 * which offer of the pass fills each slot. Pure: takes copies, returns measures. Never touches her record.
 */
import { wt3lChunk, wt3lSummary, type IdFn, type Wt3lTick, type Wt3lOffer } from '../../../src/cloud/wt3l';
import { bornAmeliaOf } from '../../../src/core/ameliaRuntimes';
import { begin } from '../wt5l/wt5l';

const WARP = new Set([3, 6]);
export type Rule = 'RECORDED' | 'TOWARD' | 'AWAY' | 'BLIND';
export const wt9lId: IdFn = (unit, pass, eventId) => `wt9l:${unit}:${pass}:${eventId}`;
export const ahead = (z: number): number[] => z === 7 ? [2, 5] : z === 2 ? [3] : z === 5 ? [6] : [];
const sumAt = (o: Wt3lOffer, zs: number[]) => zs.reduce((a, z) => a + Number(o.attentionVector[z] ?? 0), 0);

/** The arm's choice among the remaining offers of the pass (indices into `pool`), ties to the earliest. */
export function choose(rule: Rule, pool: Wt3lOffer[], zone: number): number {
  if (!pool.length) throw new Error('WT-9L: empty pool');
  const pick = (score: (o: Wt3lOffer) => number, max: boolean) => { let bi = 0, bv = score(pool[0]);
    for (let i = 1; i < pool.length; i++) { const v = score(pool[i]); if (max ? v > bv : v < bv) { bv = v; bi = i; } } return bi; };
  if (rule === 'RECORDED') return 0;
  if (rule === 'BLIND') return pick(o => sumAt(o, [2, 3, 5, 6]), true);
  const az = ahead(zone); if (!az.length) return 0;
  return pick(o => sumAt(o, az), rule === 'TOWARD');
}

export interface StepRec { zone: number; choice: number; flow: number; tension: number; change2: number | null; change5: number | null;
  admitted: Array<{ id: string; zoneAt: number; aheadSum: number }>; slot?: { atEdge: boolean; admittedAtDelivery: boolean } }

/** One run with the step logger; with `rule`, WT-9L's slot selection from `windowTicks`' offers per pass. */
export function runLogged(start: any, ticks: Wt3lTick[], id: string, unit: number, idFn: IdFn, rule?: Rule, logFirst = 50) {
  const steps: StepRec[] = []; const pools = new Map<number, Wt3lOffer[]>();
  const windowOffers = ticks.flatMap(t => t.offers);
  const make = (kind: any) => {
    const rt: any = bornAmeliaOf(kind); const orig = rt.step.bind(rt);
    rt.step = (signal?: string, enc?: any) => {
      const zone0 = Number(rt.getCurrentZone()); let delivered = enc; let slot: StepRec['slot'];
      if (rule && enc && String(enc.eventId).startsWith('wt9l:')) {
        const pass = Number(String(enc.eventId).split(':')[2]);
        if (!pools.has(pass)) pools.set(pass, windowOffers.map(o => ({ ...o, attentionVector: [...o.attentionVector] })));
        const pool = pools.get(pass)!; const o = pool.splice(choose(rule, pool, zone0), 1)[0];
        delivered = { eventId: idFn(unit, pass, o.eventId), channel: o.channel, sourceDigest: o.sourceDigest, attentionVector: [...o.attentionVector] };
      }
      const ev0 = rt.getMemory().getEvents().length;
      const s = orig(signal, delivered);
      const ev: any[] = rt.getMemory().getEvents() as any[]; let prev = zone0, choice = 0, flow = 0;
      for (let i = ev0; i < ev.length; i++) { const t = Number(ev[i]?.targetZone); if (!WARP.has(prev) && WARP.has(t)) i === ev0 ? choice++ : flow++; prev = t; }
      const admitted = (s.encounterDecisions ?? []).filter((d: any) => d.disposition === 'ATTEND' && String(d.eventId).startsWith('wt'))
        .map((d: any) => ({ id: String(d.eventId), zoneAt: zone0, aheadSum: ahead(zone0).reduce((a: number, z: number) => a + Number(d.attentionVector?.[z] ?? 0), 0) }));
      if (delivered && String(delivered.eventId).startsWith('wt')) slot = { atEdge: ahead(zone0).length > 0,
        admittedAtDelivery: (s.encounterDecisions ?? []).some((d: any) => d.eventId === delivered.eventId && d.disposition === 'ATTEND') };
      const early = steps.length < logFirst, base = early ? (rt.getNDStatus?.().baseline ?? null) : null;
      steps.push({ zone: Number(rt.getCurrentZone()), choice, flow, tension: Number(s.governor?.deformationFieldTension ?? NaN),
        change2: early && base ? Number(s.zones?.[2]?.activation) - base[2] : null, change5: early && base ? Number(s.zones?.[5]?.activation) - base[5] : null,
        admitted, ...(slot ? { slot } : {}) });
      return s;
    };
    return rt;
  };
  const out = wt3lChunk(begin(start, id, unit), ticks, 96, idFn, make);
  return { metrics: out.metrics, summary: wt3lSummary(out.metrics), steps, record: out.record };
}

/** Descriptive: what preceded each entry (a step ending in the Warp after one that did not). */
export function precededEntries(steps: StepRec[]) {
  const out: any[] = []; let last: { zoneAt: number; aheadSum: number; at: number } | null = null;
  steps.forEach((s, i) => {
    if (i > 0 && WARP.has(s.zone) && !WARP.has(steps[i - 1].zone))
      out.push({ step: i, zonesBefore: steps.slice(Math.max(0, i - 3), i).map(x => x.zone), lastAdmittedZone: last?.zoneAt ?? null,
        lastAdmittedAheadSum: last?.aheadSum ?? null, stepsSince: last ? i - last.at : null });
    for (const a of s.admitted) last = { zoneAt: a.zoneAt, aheadSum: a.aheadSum, at: i };
  });
  return out;
}

export const slotStats = (steps: StepRec[]) => { const sl = steps.filter(s => s.slot).map(s => s.slot!);
  return { slots: sl.length, atEdge: sl.filter(s => s.atEdge).length / Math.max(1, sl.length), admittedAtDelivery: sl.filter(s => s.admittedAtDelivery).length / Math.max(1, sl.length) }; };
export const choiceFirst = (steps: StepRec[], n = 200) => steps.slice(0, n).reduce((a, s) => a + s.choice, 0) / Math.min(n, steps.length) * 1000;

/** WT-10L: the parts, and the swap of one part from the donor into the receiver. */
export const PARTS = {
  FIELD: { state: ['qabbalaZones', 'deformationTensor'], nd1: ['baseline'], top: [] as string[] },
  GOVERNOR: { state: ['governorState', 'tensionHistory', 'suppressRelaySteering', 'currentObjective'], nd1: [] as string[], top: [] as string[] },
  MEMORY: { state: ['memoryState', 'memoryArchive', 'memoryConsumptionLog', 'traitEvolutionHistory'], nd1: [] as string[], top: [] as string[] },
  BODY: { state: [] as string[], nd1: [] as string[], top: ['fieldCheckpoint', 'controls'] },
  POSITION: { state: ['currentZone', 'lastTransition', 'stepCount', 'snapshots', 'deferredEncounters'], nd1: ['warpIntensity', 'lastNamed', 'flights'], top: [] as string[] },
} as const;
export type Part = keyof typeof PARTS;
const clone = (x: any) => JSON.parse(JSON.stringify(x));
const setOrDel = (dst: any, src: any, k: string) => { if (src && k in src) dst[k] = clone(src[k]); else delete dst[k]; };
export function swap(receiver: any, donor: any, parts: Part[]) {
  const r = clone(receiver);
  for (const p of parts) { const P = PARTS[p];
    for (const k of P.state) setOrDel(r.state, donor.state, k);
    if (P.nd1.length) { r.state.nd1 = { ...(r.state.nd1 ?? {}) }; for (const k of P.nd1) setOrDel(r.state.nd1, donor.state.nd1, k); }
    for (const k of P.top) setOrDel(r, donor, k); }
  return r;
}
export const canon = (x: any): string => x === null || typeof x !== 'object' ? JSON.stringify(x)
  : Array.isArray(x) ? `[${x.map(canon).join(',')}]` : `{${Object.keys(x).sort().filter(k => x[k] !== undefined).map(k => `${JSON.stringify(k)}:${canon(x[k])}`).join(',')}}`;
/** Run-time checks: shared parts equal; all five parts swapped reproduce the donor over state, body and controls. */
export function partitionCheck(receiver: any, donor: any) {
  const shared = ['qabbalaGates', 'admissionRule', 'runtimeKind'].filter(k => canon(receiver.state[k]) !== canon(donor.state[k]));
  if (receiver.state.nd1?.theta !== donor.state.nd1?.theta) shared.push('nd1.theta');
  const all = swap(receiver, donor, Object.keys(PARTS) as Part[]);
  const keys = new Set([...Object.keys(all.state), ...Object.keys(donor.state)]);
  const diff = [...keys].filter(k => canon(all.state[k]) !== canon(donor.state[k]));
  for (const k of ['fieldCheckpoint', 'controls']) if (canon(all[k]) !== canon(donor[k])) diff.push(k);
  return { sharedDiffer: shared, partitionDiffer: diff, ok: !shared.length && !diff.length };
}
