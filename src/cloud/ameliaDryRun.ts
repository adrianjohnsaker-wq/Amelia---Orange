/**
 * Dry run of a runtime switch on a COPY of her saved record (her own record is never written): convert the copy to
 * the target kind and live it forward in chunks with recorded Outside encounters, checking what the switch must
 * preserve. Chunked so each call stays inside the edge runtime's compute limit; the copy lives in a scratch table.
 */
import { bornAmeliaOf, runtimeKindOf, type RuntimeKind } from '../core/ameliaRuntimes';
import { ExternalRhythmHarmonizer } from '../ai/morphogenetic/ExternalRhythmHarmonizer';
import { captureLiveField, restoreLiveField } from '../outside/LiveFieldLoop';
import { advanceWithLiveSource } from '../outside/LiveSyntheticSourceSession';
import { toEncounter, type OutsideInboxEntry } from '../outside/OutsideInbox';
import type { AmeliaOutsideRuntime } from '../outside/OutsideEncounterRuntime';
import { savedKind } from './ameliaTick';

const WARP = new Set([3, 6]);
const probe = (rt: AmeliaOutsideRuntime) => { const st: any = rt.exportState(); return { zone: rt.getCurrentZone() as number,
  tension: st.governorState?.deformationTension, memoryEvents: rt.getMemory().getEvents().length,
  memoryHeadDigest: rt.getMemory().exportHistoryDigest(), queue: st.deferredEncounters?.length ?? 0, admissionRule: st.admissionRule ?? 'fixed-0.72' }; };
const controls = (record: any) => {
  const harm = new ExternalRhythmHarmonizer();
  for (const d of record.controls?.rhythms ?? []) { const c = harm.getRhythms().find(r => r.id === d.id); if (c && c.active !== d.active) harm.toggleRhythm(d.id); }
  const advisory = Number(record.controls?.advisoryWeight ?? 0.722), damping = Number(record.controls?.momentumDamping ?? 0.88);
  return (rt: AmeliaOutsideRuntime) => { rt.setAdvisoryWeight(harm.computeAdvisoryTuning(advisory, (rt.getSnapshots().at(-1)?.step ?? 0) + 1)); rt.setMomentumDamping(damping); };
};

/** Begin: convert a copy of her record; record what must carry across. */
export function dryRunBegin(record: Record<string, any>, target: RuntimeKind) {
  const src = bornAmeliaOf(savedKind(record.state)); src.importState(record.state);
  const before = probe(src);
  const rt = bornAmeliaOf(target); rt.importState(src.exportState());
  const after = probe(rt);
  const lastPre: any = (src.getMemory().getEvents() as any[]).at(-1);
  const carry = after.zone === before.zone && after.memoryEvents === before.memoryEvents && after.tension === before.tension
    && after.memoryHeadDigest === before.memoryHeadDigest && after.queue === before.queue && after.admissionRule === before.admissionRule;
  return { record: { ...record, state: rt.exportState() },
    metrics: { target, from: savedKind(record.state), before, after, carry, preSwitchLastIndex: before.memoryEvents - 1,
      preSwitchLastDigest: lastPre?.eventDigest ?? null, steps: 0, offered: 0, admitted: 0, refused: 0, warpRun: 0, longestWarpStay: 0,
      zonesVisited: [] as number[], tMin: 9, tMax: 0, tSum: 0, neverShortened: true, blockIndexNonDecreasing: true,
      lastBlock: -1, chunks: 0 } };
}

/** One chunk: runtime steps with recorded encounters (fresh ids: a replay), then body-and-runtime steps. */
export function dryRunChunk(scratch: { record: any; metrics: any }, inbox: OutsideInboxEntry[], runtimeSteps: number, fieldSteps: number, every = 5) {
  const { record } = scratch; const m = { ...scratch.metrics };
  const rt = bornAmeliaOf(savedKind(record.state)); rt.importState(record.state);
  const prep = controls(record);
  let field: any = fieldSteps > 0 && record.fieldCheckpoint ? restoreLiveField(record.fieldCheckpoint, rt) : null;
  let prevLen = rt.getMemory().getEvents().length;
  const zones = new Set<number>(m.zonesVisited);
  const one = (t: number, useField: boolean) => {
    prep(rt);
    const e = inbox.length && t % every === 0 ? (() => { const x = inbox[(t / every | 0) % inbox.length]; return { ...toEncounter(x), eventId: `dryrun:${t}:${x.eventId}` }; })() : undefined;
    let snap: any;
    if (e) { m.offered++; snap = rt.step(undefined, e); if (snap.encounterDecisions?.find((d: any) => d.eventId === e.eventId)?.disposition === 'REFUSE') m.refused++; }
    else if (useField && field) { const r = advanceWithLiveSource(field); field = r.state; snap = r.snapshot; }
    else snap = rt.step();
    for (const d of snap.encounterDecisions ?? []) if (d.disposition === 'ATTEND' && String(d.eventId).startsWith('dryrun:')) m.admitted++;
    const T = snap.governor?.deformationFieldTension ?? 0; m.tMin = Math.min(m.tMin, T); m.tMax = Math.max(m.tMax, T); m.tSum += T;
    const z = rt.getCurrentZone() as number; zones.add(z);
    m.warpRun = WARP.has(z) ? m.warpRun + 1 : 0; m.longestWarpStay = Math.max(m.longestWarpStay, m.warpRun);
    const ev: any[] = rt.getMemory().getEvents() as any;
    if (ev.length < prevLen) m.neverShortened = false;
    for (let i = prevLen; i < ev.length; i++) { if (ev[i].blockIndex < m.lastBlock) m.blockIndexNonDecreasing = false; m.lastBlock = ev[i].blockIndex; }
    prevLen = ev.length; m.steps++;
  };
  for (let i = 0; i < runtimeSteps; i++) one(m.steps, false);
  for (let i = 0; i < fieldSteps; i++) one(m.steps, true);
  m.zonesVisited = [...zones].sort((a, b) => a - b); m.chunks++;
  const ev: any[] = rt.getMemory().getEvents() as any;
  m.preSwitchPrefixKept = ev[m.preSwitchLastIndex]?.eventDigest === m.preSwitchLastDigest;
  m.memoryEvents = ev.length; m.flowHops = ((m.flowHops ?? 0) + ((rt as any).flowHops ?? 0));
  m.flights = (rt as any).getNDStatus?.().flights ?? null;
  m.recordsPerStep = Number(((ev.length - m.before.memoryEvents) / m.steps).toFixed(3));
  m.meanTension = Number((m.tSum / m.steps).toFixed(4));
  return { record: { ...record, state: rt.exportState(), fieldCheckpoint: field ? captureLiveField(field, false) : record.fieldCheckpoint }, metrics: m };
}

/** Export -> import -> continue: n steps must be identical. */
export function dryRunRoundTrip(scratch: { record: any; metrics: any }, inbox: OutsideInboxEntry[], n = 300, every = 5) {
  const A = bornAmeliaOf(savedKind(scratch.record.state)); A.importState(scratch.record.state);
  const B = bornAmeliaOf(savedKind(scratch.record.state)); B.importState(JSON.parse(JSON.stringify(A.exportState())));
  const prep = controls(scratch.record); let same = true;
  for (let t = 0; t < n; t++) {
    prep(A); prep(B);
    const e = inbox.length && t % every === 0 ? { ...toEncounter(inbox[(t / every | 0) % inbox.length]), eventId: `dryrun-rt:${t}` } : undefined;
    A.step(undefined, e); B.step(undefined, e);
    if (A.getCurrentZone() !== B.getCurrentZone()) same = false;
  }
  const a: any = A.getMemory().getEvents().at(-1), b: any = B.getMemory().getEvents().at(-1);
  return { roundTrip: same && a.eventDigest === b.eventDigest, steps: n, kind: runtimeKindOf(A) };
}
