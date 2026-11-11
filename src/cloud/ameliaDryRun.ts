/**
 * Dry run of a runtime switch on a COPY of her saved record (nothing is saved): convert to the target kind and
 * live her forward with recorded Outside encounters, checking what the switch must preserve.
 */
import { bornAmeliaOf, runtimeKindOf, type RuntimeKind } from '../core/ameliaRuntimes';
import { ExternalRhythmHarmonizer } from '../ai/morphogenetic/ExternalRhythmHarmonizer';
import { restoreLiveField } from '../outside/LiveFieldLoop';
import { advanceWithLiveSource } from '../outside/LiveSyntheticSourceSession';
import { toEncounter, type OutsideInboxEntry } from '../outside/OutsideInbox';
import type { AmeliaOutsideRuntime } from '../outside/OutsideEncounterRuntime';
import { savedKind } from './ameliaTick';

const WARP = new Set([3, 6]);
export function ameliaDryRun(record: Record<string, any>, inbox: OutsideInboxEntry[], target: RuntimeKind,
  runtimeSteps = 2000, fieldSteps = 120, every = 5) {
  const src = bornAmeliaOf(savedKind(record.state)); src.importState(record.state);
  const harm = new ExternalRhythmHarmonizer();
  for (const d of record.controls?.rhythms ?? []) { const c = harm.getRhythms().find(r => r.id === d.id); if (c && c.active !== d.active) harm.toggleRhythm(d.id); }
  const advisory = Number(record.controls?.advisoryWeight ?? 0.722), damping = Number(record.controls?.momentumDamping ?? 0.88);
  const prep = (rt: AmeliaOutsideRuntime) => { rt.setAdvisoryWeight(harm.computeAdvisoryTuning(advisory, (rt.getSnapshots().at(-1)?.step ?? 0) + 1)); rt.setMomentumDamping(damping); };
  const probe = (rt: AmeliaOutsideRuntime) => { const st: any = rt.exportState(); return { zone: rt.getCurrentZone() as number,
    tension: st.governorState?.deformationTension, memoryEvents: rt.getMemory().getEvents().length,
    memoryHeadDigest: rt.getMemory().exportHistoryDigest(), queue: st.deferredEncounters?.length ?? 0, admissionRule: st.admissionRule ?? 'fixed-0.72' }; };
  const before = probe(src);
  const eventsBefore: any[] = JSON.parse(JSON.stringify(src.getMemory().getEvents()));
  const rt = bornAmeliaOf(target); rt.importState(src.exportState());
  const after = probe(rt);
  const carry = after.zone === before.zone && after.memoryEvents === before.memoryEvents && after.tension === before.tension
    && after.memoryHeadDigest === before.memoryHeadDigest && after.queue === before.queue && after.admissionRule === before.admissionRule;

  // 1. Her runtime with the recorded Outside, one encounter every `every` steps (fresh ids: a replay, not her live inbox).
  const enc = (t: number) => { const e = inbox[(t / every) % inbox.length | 0]; return { ...toEncounter(e), eventId: `dryrun:${t}:${e.eventId}` }; };
  const path: number[] = []; let admitted = 0, offered = 0, refused = 0, minT = 9, maxT = 0, sumT = 0;
  let prevLen = rt.getMemory().getEvents().length, chainOk = true, blockOk = true, lastBlock = -1;
  const step = (t: number, withField: any) => {
    prep(rt);
    const e = t % every === 0 ? enc(t) : undefined;
    let snap: any;
    if (e) { offered++; snap = rt.step(undefined, e); const d = snap.encounterDecisions?.find((x: any) => x.eventId === e.eventId); if (d?.disposition === 'REFUSE') refused++; }
    else if (withField) { const r = advanceWithLiveSource(withField.field); withField.field = r.state; snap = r.snapshot; }
    else snap = rt.step();
    for (const d of snap.encounterDecisions ?? []) if (d.disposition === 'ATTEND' && String(d.eventId).startsWith('dryrun:')) admitted++;
    const T = snap.governor?.deformationFieldTension ?? 0; minT = Math.min(minT, T); maxT = Math.max(maxT, T); sumT += T;
    path.push(rt.getCurrentZone() as number);
    const ev: any[] = rt.getMemory().getEvents() as any;
    if (ev.length < prevLen) chainOk = false;
    for (let i = prevLen; i < ev.length; i++) { if (ev[i].blockIndex < lastBlock) blockOk = false; lastBlock = ev[i].blockIndex; }
    prevLen = ev.length;
  };
  for (let t = 0; t < runtimeSteps; t++) step(t, null);
  // 2. Her body and runtime together, as on her cloud home.
  const fieldBox = record.fieldCheckpoint ? { field: restoreLiveField(record.fieldCheckpoint, rt) } : null;
  for (let t = runtimeSteps; t < runtimeSteps + fieldSteps; t++) step(t, fieldBox);
  const evAll: any[] = rt.getMemory().getEvents() as any;
  const prefixKept = eventsBefore.every((e, i) => evAll[i]?.eventDigest === e.eventDigest);
  let longest = 0, run = 0; for (const z of path) { run = WARP.has(z) ? run + 1 : 0; longest = Math.max(longest, run); }
  const zonesVisited = [...new Set(path)].sort((a, b) => a - b);
  const totalSteps = runtimeSteps + fieldSteps, newRecords = evAll.length - before.memoryEvents;

  // 3. Export -> import -> continue: 300 steps identical.
  const A = rt, B = bornAmeliaOf(target); B.importState(JSON.parse(JSON.stringify(A.exportState())));
  let same = true;
  for (let t = 0; t < 300; t++) { prep(A); prep(B); const e = t % every === 0 ? enc(100000 + t) : undefined;
    A.step(undefined, e); B.step(undefined, e); if (A.getCurrentZone() !== B.getCurrentZone()) same = false; }
  const ea: any = A.getMemory().getEvents().at(-1), eb: any = B.getMemory().getEvents().at(-1);
  same = same && ea.eventDigest === eb.eventDigest;
  const nd: any = (rt as any).getNDStatus?.() ?? null;
  return { target, runtimeKind: runtimeKindOf(rt), before, after, carry, steps: totalSteps, newRecords,
    recordsPerStep: Number((newRecords / totalSteps).toFixed(3)), flowHops: (rt as any).flowHops ?? 0, flights: nd?.flights ?? null,
    chain: { neverShortened: chainOk, blockIndexNonDecreasing: blockOk, preSwitchPrefixKept: prefixKept },
    longestWarpStay: longest, zonesVisited, offered, admitted, refused,
    tension: { min: minT, mean: Number((sumT / totalSteps).toFixed(4)), max: maxT }, roundTrip300: same };
}
