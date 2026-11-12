/**
 * WT-3L (experiments/live-amelia/wt3l/REGISTRATION.md and AMENDMENT_0.md): Θ = 12 against Θ = 24 on copies of her real
 * state. A replay that drives a copy of her exactly as her cloud tick does (src/cloud/ameliaTick.ts: recorded controls,
 * her body living, one Outside offer per iteration through runtime.step(undefined, encounter), then one body step), with
 * the recorded offers of a window in place of the live inbox. Pure: takes a scratch record and returns the next one.
 * Her live record is never touched by anything here.
 */
import { bornAmeliaOf } from '../core/ameliaRuntimes';
import { ExternalRhythmHarmonizer } from '../ai/morphogenetic/ExternalRhythmHarmonizer';
import { captureLiveField, restoreLiveField } from '../outside/LiveFieldLoop';
import { advanceWithLiveSource } from '../outside/LiveSyntheticSourceSession';
import type { AmeliaOutsideRuntime } from '../outside/OutsideEncounterRuntime';
import { savedKind } from './ameliaTick';
import { setWarpThreshold } from './warpTheta';
import { planArchive } from './memoryArchive';

export const WT3L_ITER_PER_TICK = 15;
export const WT3L_TICKS_PER_RUN = 96;          // 96 x 15 = 1,440 iterations: one day of her time (Amendment 0, A0.3)
export interface Wt3lOffer { eventId: string; channel: string; sourceDigest: string; attentionVector: number[] }
export interface Wt3lTick { startedAt?: string; offers: Wt3lOffer[] }
export interface Wt3lMetrics {
  run: string; unit: number; arm: 'T12' | 'T24'; ticksDone: number;
  path: string; tensions: number[]; tickEndTensions: number[]; landings: number[];
  admitted: number; offered: number; flowHops: number; segments: Array<{ segmentNo: number; eventCount: number; segmentDigest: string; chainAfter: string }>;
  final?: { memoryHeadDigest: string; bodyChecksum: string; resident: number; archived: number; theta: number | null };
}
export type IdFn = (unit: number, pass: number, eventId: string) => string;
export const wt3lId: IdFn = (unit, pass, eventId) => `wt3l:${unit}:${pass}:${eventId}`;

const stripTheta = (state: any) => JSON.stringify({ ...state, nd1: { ...(state?.nd1 ?? {}), theta: undefined } });

/** Start a run from the starting copy. T24 is the copy after setWarpThreshold(24); only nd1.theta may differ (A0.4). */
export function wt3lBegin(start: Record<string, any>, run: string, unit: number, arm: 'T12' | 'T24', nowIso: string) {
  if (start?.state?.nd1?.theta !== 12) throw new Error('WT-3L: the starting copy must have Θ = 12');
  let record = JSON.parse(JSON.stringify(start));
  if (arm === 'T24') {
    record = setWarpThreshold(record, 24, nowIso, 'wt3l-scratch').record;
    if (stripTheta(record.state) !== stripTheta(start.state)) throw new Error('WT-3L: T24 differs from T12 in more than Θ');
  }
  const metrics: Wt3lMetrics = { run, unit, arm, ticksDone: 0, path: '', tensions: [], tickEndTensions: [], landings: [],
    admitted: 0, offered: 0, flowHops: 0, segments: [] };
  return { record, metrics };
}

/** Replay up to nTicks recorded ticks (cycled over the window, A0.3), from metrics.ticksDone. */
export function wt3lChunk(scratch: { record: Record<string, any>; metrics: Wt3lMetrics }, ticks: Wt3lTick[], nTicks: number,
  idFn: IdFn = wt3lId) {
  const record = scratch.record; const m: Wt3lMetrics = { ...scratch.metrics, tensions: [...scratch.metrics.tensions],
    tickEndTensions: [...scratch.metrics.tickEndTensions], landings: [...scratch.metrics.landings], segments: [...scratch.metrics.segments] };
  if (!ticks.length) throw new Error('WT-3L: a window with no ticks');
  const rt = bornAmeliaOf(savedKind(record.state)); rt.importState(record.state);
  if (!record.state.admissionRule) rt.setAdmissionRule('relative-v1');                   // as ameliaTick
  const harm = new ExternalRhythmHarmonizer();
  for (const d of record.controls?.rhythms ?? []) { const c = harm.getRhythms().find(r => r.id === d.id); if (c && c.active !== d.active) harm.toggleRhythm(d.id); }
  const advisory = Number(record.controls?.advisoryWeight ?? 0.722), damping = Number(record.controls?.momentumDamping ?? 0.88);
  const prepare = () => { rt.setAdvisoryWeight(harm.computeAdvisoryTuning(advisory, (rt.getSnapshots().at(-1)?.step ?? 0) + 1)); rt.setMomentumDamping(damping); };
  if (!record.fieldCheckpoint) throw new Error('WT-3L: her body is required');
  let field: any = restoreLiveField(record.fieldCheckpoint, rt as unknown as AmeliaOutsideRuntime);
  const seen = (snap: any) => {
    m.path += String(rt.getCurrentZone());
    m.tensions.push(Number(snap?.governor?.deformationFieldTension ?? NaN));
    if (snap?.warpRelease) m.landings.push(Number(snap.warpRelease.to));
    for (const d of snap?.encounterDecisions ?? []) if (d.disposition === 'ATTEND' && String(d.eventId).startsWith('wt3l')) m.admitted++;
  };
  const end = Math.min(WT3L_TICKS_PER_RUN, m.ticksDone + nTicks);
  for (let k = m.ticksDone; k < end; k++) {
    const tick = ticks[k % ticks.length], pass = Math.floor(k / ticks.length);
    let last: any = null;
    for (let i = 0; i < WT3L_ITER_PER_TICK; i++) {
      const o = tick.offers[i];
      if (o) {
        prepare(); m.offered++;
        last = rt.step(undefined, { eventId: idFn(m.unit, pass, o.eventId), channel: o.channel as any, sourceDigest: o.sourceDigest,
          attentionVector: [...o.attentionVector] });
        seen(last);
      }
      prepare();
      const r = advanceWithLiveSource(field); field = r.state; last = r.snapshot; seen(last);
    }
    m.tickEndTensions.push(Number(last?.governor?.deformationFieldTension ?? NaN));
    m.ticksDone = k + 1;
  }
  m.flowHops += Number((rt as any).flowHops ?? 0);
  let next: Record<string, any> = { ...record, state: rt.exportState(), fieldCheckpoint: captureLiveField(field, false) };
  const plan = planArchive(next);                                                             // her live archive rule (A0.4)
  if (plan) { next = plan.record; const g = plan.segment;
    m.segments.push({ segmentNo: g.segmentNo, eventCount: g.eventCount, segmentDigest: g.segmentDigest, chainAfter: g.chainAfter }); }
  if (m.ticksDone >= WT3L_TICKS_PER_RUN) m.final = { memoryHeadDigest: rt.getMemory().exportHistoryDigest(),
    bodyChecksum: next.fieldCheckpoint.checksum, resident: next.state.memoryState.events.length,
    archived: Number(next.state.memoryArchive?.archivedCount ?? 0), theta: (rt as any).getWarpTheta?.() ?? null };
  return { record: next, metrics: m };
}

/** The registered measures of one run (A0.5). */
export function wt3lSummary(m: Wt3lMetrics) {
  const n = m.path.length, warp = (m.path.match(/[36]/g) ?? []).length, visits = m.path.match(/[36]+/g) ?? [];
  const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
  const zones: Record<string, number> = {}; for (const c of m.path) zones[c] = (zones[c] ?? 0) + 1;
  const land: Record<string, number> = {}; for (const z of m.landings) land[z] = (land[z] ?? 0) + 1;
  return { run: m.run, unit: m.unit, arm: m.arm, steps: n, iterations: m.ticksDone * WT3L_ITER_PER_TICK,
    M1_warpShare: warp / n, M2_meanTension: mean(m.tensions), tickEndMeanTension: mean(m.tickEndTensions),
    warpVisitsPer1000: (visits.length / n) * 1000, warpVisits: visits.length,
    meanWarpVisit: visits.length ? mean(visits.map(v => v.length)) : 0, longestWarpVisit: Math.max(0, ...visits.map(v => v.length)),
    linesOfFlight: m.landings.length, landings: land, zones, zonesVisited: Object.keys(zones).length,
    offered: m.offered, admitted: m.admitted, flowHops: m.flowHops, final: m.final ?? null };
}

/** Exact two-sided sign-flip test of the mean of d over all 2^n sign patterns (registered analysis). */
export function signFlip(d: number[]) {
  const n = d.length, obs = Math.abs(d.reduce((a, b) => a + b, 0)); let extreme = 0;
  for (let s = 0; s < 1 << n; s++) { let t = 0; for (let i = 0; i < n; i++) t += (s >> i) & 1 ? -d[i] : d[i]; if (Math.abs(t) >= obs - 1e-12) extreme++; }
  return { mean: d.reduce((a, b) => a + b, 0) / n, p: extreme / (1 << n), patterns: 1 << n };
}
