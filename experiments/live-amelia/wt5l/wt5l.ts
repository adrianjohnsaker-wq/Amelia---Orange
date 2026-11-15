/**
 * WT-5L machinery (experiments/live-amelia/wt5l/REGISTRATION.md). Uses the WT-3L replay (src/cloud/wt3l.ts, unchanged) with:
 *   - her starting state converted at the switch by her own cloud tick's code path (ameliaTick, zero steps, target nd1);
 *   - a read-only step logger (each runtime step's transition: target zone and digest);
 *   - a once-through mode with original ids (A1);
 *   - the PRE-CONTENT builder (B);
 *   - her live record for a span of steps, read from her archived memory with the same instruments.
 * Pure: takes copies, returns measures. Never touches her record.
 */
import { ameliaTick } from '../../../src/cloud/ameliaTick';
import { wt3lChunk, wt3lSummary, warpbornIds, type IdFn, type Wt3lMetrics, type Wt3lTick } from '../../../src/cloud/wt3l';
import { bornAmeliaOf } from '../../../src/core/ameliaRuntimes';
import type { AmeliaOutsideRuntime } from '../../../src/outside/OutsideEncounterRuntime';

const WARP = new Set([3, 6]);
export const sameId: IdFn = (_u, _p, eventId) => eventId;
export const wt5lId: IdFn = (unit, pass, eventId) => `wt5l:${unit}:${pass}:${eventId}`;

/** The switch as the switch tick made it: ameliaTick with zero steps and target ND-1b. */
export function convertAtSwitch(backup: Record<string, any>, nowIso: string) {
  const r = ameliaTick(JSON.parse(JSON.stringify(backup)), null, 0, nowIso, 'nd1');
  const rec = r.record;
  if (rec.state?.runtimeKind !== 'nd1') throw new Error('WT-5L: conversion did not give ND-1b');
  if (rec.state?.nd1?.theta !== 24) throw new Error('WT-5L: converted state must have Θ = 24');
  if (Number(rec.state.stepCount) !== Number(backup.state.stepCount)) throw new Error('WT-5L: the conversion must take no steps');
  return rec;
}

/** As wt3lBegin, without its Θ = 12 requirement (WT-5L runs at Θ = 24). */
export function begin(start: Record<string, any>, run: string, unit: number) {
  const record = JSON.parse(JSON.stringify(start)); const warpborn = warpbornIds(record.state);
  const metrics: Wt3lMetrics = { run, unit, arm: 'T24', ticksDone: 0, path: '', tensions: [], tickEndTensions: [], landings: [],
    admitted: 0, offered: 0, flowHops: 0, segments: [], exits: { flight: 0, warpborn: 0, preexisting: 0 }, exitLog: [],
    warpbornAtStart: warpborn.length, warpbornGates: warpborn };
  return { record, metrics };
}

export interface StepLog { step: number; to: number; digest: string }

/** One run: nTicks ticks (A1: the 65 ticks once; WT protocol: 96), one chunk, with the step logger. */
export function runWt5l(start: any, ticks: Wt3lTick[], id: string, unit: number, nTicks: number, idFn: IdFn) {
  const log: StepLog[] = [];
  const make = (kind: any): AmeliaOutsideRuntime => {
    const rt: any = bornAmeliaOf(kind); const orig = rt.step.bind(rt);
    rt.step = (signal?: string, enc?: any) => { const s = orig(signal, enc);
      log.push({ step: Number(s.step), to: Number(s.lastTransition?.to), digest: String(s.lastTransition?.digest) }); return s; };
    return rt;
  };
  const out = wt3lChunk(begin(start, id, unit), ticks, nTicks, idFn, make);
  return { metrics: out.metrics, summary: wt3lSummary(out.metrics), log, record: out.record };
}

/** PRE-CONTENT (Part B): same ticks, slots and ids; content replaced in order from the pool, unit u from 14(u-1), cycled. */
export function preContent(ticks: Wt3lTick[], pool: Array<{ channel: string; sourceDigest: string; attentionVector: number[] }>, unit: number) {
  if (!pool.length) throw new Error('WT-5L: empty pre-switch pool');
  let j = 0; const off = 14 * (unit - 1);
  return ticks.map(t => ({ ...t, offers: t.offers.map(o => { const p = pool[(off + j++) % pool.length];
    return { eventId: o.eventId, channel: p.channel, sourceDigest: p.sourceDigest, attentionVector: [...p.attentionVector] }; }) }));
}

/** Her record for steps [from, to] from her memory events: per step the last record's zone and digest; entries hop by hop. */
export function liveSpan(events: any[], from: number, to: number, startZone: number) {
  const byStep = new Map<number, any[]>();
  for (const e of events) { const b = Number(e.blockIndex); if (b >= from && b <= to) { if (!byStep.has(b)) byStep.set(b, []); byStep.get(b)!.push(e); } }
  const steps: StepLog[] = []; let choice = 0, flow = 0, flowSteps = 0, zone = startZone, warp = 0;
  for (let b = from; b <= to; b++) {
    const recs = byStep.get(b); if (!recs?.length) throw new Error(`WT-5L: her memory has no record for step ${b}`);
    let prev = zone; recs.forEach((e, k) => { const t = Number(e.targetZone); if (!WARP.has(prev) && WARP.has(t)) k === 0 ? choice++ : flow++; prev = t; });
    if (recs.length > 1) flowSteps++;
    zone = prev; if (WARP.has(zone)) warp++;
    steps.push({ step: b, to: zone, digest: String(recs[recs.length - 1].eventDigest) });
  }
  const n = steps.length;
  return { steps, n, entries: { choice, flow }, flowSteps, E: (choice + flow) / n * 1000, E_choice: choice / n * 1000, E_flow: flow / n * 1000,
    warpShare: warp / n };
}

/** F1, F2: agreement of the replay's step log with her live record, step by step. */
export function fidelity(log: StepLog[], live: StepLog[]) {
  const rep = new Map(log.map(s => [s.step, s]));
  let zoneAgree = 0, digestAgree = 0, firstZone: number | null = null, firstDigest: number | null = null;
  for (const l of live) { const r = rep.get(l.step);
    const z = !!r && r.to === l.to, d = !!r && r.digest === l.digest;
    if (z) zoneAgree++; else if (firstZone === null) firstZone = l.step;
    if (d) digestAgree++; else if (firstDigest === null) firstDigest = l.step; }
  return { steps: live.length, zoneAgree, zoneShare: zoneAgree / live.length, digestAgree, digestShare: digestAgree / live.length,
    firstZoneDivergence: firstZone, firstDigestDivergence: firstDigest, replaySteps: log.length };
}

export const TOL_E = 2.0, TOL_WARP = 0.02;
export function a1Reading(f: ReturnType<typeof fidelity>, rep: { E: number; warpShare: number }, live: { E: number; warpShare: number }) {
  if (f.zoneAgree === f.steps && f.replaySteps === f.steps) return 'FAITHFUL';
  return Math.abs(rep.E - live.E) <= TOL_E && Math.abs(rep.warpShare - live.warpShare) <= TOL_WARP ? 'CLOSE' : 'NOT FAITHFUL';
}

/** Descriptive: an offer pool's channel mix and mean attention on zones 2, 3, 5, 6, 7. */
export function poolProfile(offers: Array<{ channel: string; attentionVector: number[] }>) {
  const ch: Record<string, number> = {}; for (const o of offers) ch[o.channel] = (ch[o.channel] ?? 0) + 1;
  const att = Object.fromEntries([2, 3, 5, 6, 7].map(z => [z, offers.reduce((a, o) => a + Number(o.attentionVector[z] ?? 0), 0) / offers.length]));
  return { offers: offers.length, channels: ch, meanAttention: att };
}
