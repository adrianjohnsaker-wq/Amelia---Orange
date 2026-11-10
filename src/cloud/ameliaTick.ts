/**
 * One tick of Amelia's continuous life, for her always-on home in Supabase.
 * Pure: takes her saved checkpoint record and the current Outside inbox, returns the next record.
 * It steps her exactly as the app's runtime loop does (recorded controls, external rhythms, one
 * Outside encounter per step through runtime.step(undefined, encounter)), with the relative admission rule.
 */
import { bornAmelia } from '../core/fullNumogram';
import { ExternalRhythmHarmonizer } from '../ai/morphogenetic/ExternalRhythmHarmonizer';
import { pendingOutside, readOutsideLink, seenEncounterIds, toEncounter, type OutsideInboxEntry } from '../outside/OutsideInbox';
import { captureLiveField, restoreLiveField } from '../outside/LiveFieldLoop';
import { advanceWithLiveSource } from '../outside/LiveSyntheticSourceSession';
import type { AmeliaOutsideRuntime } from '../outside/OutsideEncounterRuntime';

export const CLOUD_WRITER_ID = 'amelia-cloud-runner-v1';

export interface TickResult {
  record: Record<string, any>;
  fromStep: number; toStep: number; zones: string;
  delivered: Array<{ eventId: string; channel: string; disposition: string }>;
  fieldFrom: number | null; fieldTo: number | null;
  admittedThisTick: number; tension: number; queue: number; admissionRule: string;
}

export function ameliaTick(record: Record<string, any>, inbox: OutsideInboxEntry[] | null, steps: number, nowIso: string): TickResult {
  if (!record?.state) throw new Error('No runtime state in her checkpoint');
  const rt = bornAmelia();
  rt.importState(record.state);
  // Operator's choice (GATE-1, 10 Nov 2026): the relative admission rule, carried in her state from now on.
  if (!record.state.admissionRule) rt.setAdmissionRule('relative-v1');
  const harm = new ExternalRhythmHarmonizer();
  for (const d of record.controls?.rhythms ?? []) {
    const c = harm.getRhythms().find(r => r.id === d.id);
    if (c && c.active !== d.active) harm.toggleRhythm(d.id);
  }
  const advisory = Number(record.controls?.advisoryWeight ?? 0.722), damping = Number(record.controls?.momentumDamping ?? 0.88);
  const link = readOutsideLink(record.outsideLink);
  const seen = seenEncounterIds(record.state);
  const fromStep = (rt.getSnapshots().at(-1)?.step ?? Number(record.state.stepCount)) as number;
  let zones = '';
  // Her body: restored from its checkpoint and stepped with her runtime, as when the field plays in the app.
  let field: any = record.fieldCheckpoint ? restoreLiveField(record.fieldCheckpoint, rt as unknown as AmeliaOutsideRuntime) : null;
  const fieldFrom = field ? field.stepCount : null;
  const prepare = () => {
    rt.setAdvisoryWeight(harm.computeAdvisoryTuning(advisory, (rt.getSnapshots().at(-1)?.step ?? 0) + 1));
    rt.setMomentumDamping(damping);
  };
  const delivered: TickResult['delivered'] = [];
  let admittedThisTick = 0;
  for (let i = 0; i < steps; i++) {
    // 1. An Outside encounter, if one is waiting, on its own runtime step (the app's Outside Streams path).
    if (link?.enabled && inbox?.length) {
      const next = pendingOutside(inbox, seen, link.since)[0];
      if (next) {
        const encounter = toEncounter(next); seen.add(next.eventId);
        prepare();
        const snap: any = rt.step(undefined, encounter);
        zones += String(rt.getCurrentZone());
        for (const d of snap.encounterDecisions ?? []) if (d.disposition === 'ATTEND') admittedThisTick++;
        delivered.push({ eventId: encounter.eventId, channel: encounter.channel,
          disposition: snap.encounterDecisions?.find((d: any) => d.eventId === encounter.eventId)?.disposition ?? 'NONE' });
      }
    }
    // 2. One step of her life: her body and her runtime together when her field exists, else her runtime alone.
    prepare();
    let snap: any;
    if (field) { const r = advanceWithLiveSource(field); field = r.state; snap = r.snapshot; }
    else snap = rt.step();
    zones += String(rt.getCurrentZone());
    for (const d of snap.encounterDecisions ?? []) if (d.disposition === 'ATTEND' && !String(d.eventId).startsWith('field:') && !String(d.eventId).startsWith('source:')) admittedThisTick++;
  }
  const state: any = rt.exportState();
  const toStep = (rt.getSnapshots().at(-1)?.step ?? state.stepCount) as number;
  const fieldCheckpoint = field ? captureLiveField(field, true) : record.fieldCheckpoint;
  const next = { ...record, state, fieldCheckpoint, pauseFieldOnRestore: false, writerId: CLOUD_WRITER_ID, revision: (Number(record.revision) || 0) + 1,
    updatedAt: nowIso, runtimeRunning: true, cloudRunner: { schema: 'amelia.cloud-runner/v1', lastTickAt: nowIso, stepsPerTick: steps } };
  return { record: next, fromStep, toStep, zones, delivered, admittedThisTick, fieldFrom, fieldTo: field ? field.stepCount : null,
    tension: state.governorState?.deformationTension, queue: state.deferredEncounters?.length ?? 0, admissionRule: state.admissionRule ?? 'fixed-0.72' };
}
