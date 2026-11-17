/**
 * HYST-2L machinery (experiments/live-amelia/hyst2l/REGISTRATION.md). HYST-1L's arms, inscription switch, step logger and
 * measures, with one added arm (NO-6-2) and one added per-step field (Warp entries counted hop by hop, by the WT-4L rule),
 * so that entries can be split into the halves of a run. Pure: takes copies, returns measures. Never touches her record.
 */
import { wt3lChunk, wt3lSummary, type IdFn, type Wt3lTick } from '../../../src/cloud/wt3l';
import { bornAmeliaOf } from '../../../src/core/ameliaRuntimes';
import { begin } from '../wt5l/wt5l';
import { h1, describe, PLEX_GATES } from '../hyst1l/hyst1l';

export const hyst2lId: IdFn = (unit, pass, eventId) => `hyst2l:${unit}:${pass}:${eventId}`;
export const ARMS = ['ALL', 'NONE', 'NO-6-2', 'LIVE-ALL', 'LIVE-STRIPPED'] as const;
export type Arm = typeof ARMS[number];
export const THRESHOLD_GATE = 'warpborn-6-2';
const WARP = new Set([3, 6]);
export const inscribes = (arm: Arm) => arm.startsWith('LIVE');
const clone = (x: any) => JSON.parse(JSON.stringify(x));
const warpbornOf = (state: any) => (state.qabbalaGates ?? []).map((g: any) => String(g.id)).filter((id: string) => id.startsWith('warpborn'));
export { PLEX_GATES };

/** The arm's starting record: the starting copy with the named Warp-born gates removed, nothing else changed. */
export function armRecord(start: any, arm: Arm) {
  const r = clone(start); const all = warpbornOf(r.state);
  const drop = arm === 'ALL' || arm === 'LIVE-ALL' ? [] : arm === 'NO-6-2' ? [THRESHOLD_GATE] : all;
  r.state.qabbalaGates = r.state.qabbalaGates.filter((g: any) => !drop.includes(String(g.id)));
  return r;
}

export interface Step { zone0: number; zone: number; firstHop: number; open: number[]; flight: boolean; tension: number; locked: boolean;
  applied: number[] | null; newGates: string[]; entries: number }

/** HYST-1L's runSpan, with the per-step entries field. */
export function runSpan(record: any, ticks: Wt3lTick[], id: string, unit: number, inscribe: boolean, slice = 96) {
  const steps: Step[] = [];
  const make = (kind: any) => {
    const rt: any = bornAmeliaOf(kind); const orig = rt.step.bind(rt);
    rt.step = (signal?: string, enc?: any) => {
      const gates: any[] = rt.qabbala.getGates(); const zone0 = Number(rt.getCurrentZone());
      const open = gates.filter(g => g.isOpen && g.source === zone0).map(g => Number(g.target));
      const before = new Set(gates.map(g => String(g.id))); const fl0 = Number(rt.getNDStatus().flights); const ev0 = rt.getMemory().getEvents().length;
      const s = orig(signal, enc);
      const after: any[] = rt.qabbala.getGates();
      const added = after.filter(g => !before.has(String(g.id)) && String(g.id).startsWith('warpborn')).map(g => String(g.id));
      if (!inscribe) for (let i = after.length - 1; i >= 0; i--) if (added.includes(String(after[i].id))) after.splice(i, 1);
      const ev: any[] = rt.getMemory().getEvents() as any[];
      let prev = zone0, entries = 0;
      for (let i = ev0; i < ev.length; i++) { const t = Number(ev[i].targetZone); if (!WARP.has(prev) && WARP.has(t)) entries++; prev = t; }
      const d = (s.encounterDecisions ?? []).find((x: any) => x.disposition === 'ATTEND' && x.applied && String(x.eventId).startsWith('hyst2l:'));
      steps.push({ zone0, zone: Number(rt.getCurrentZone()), firstHop: ev.length > ev0 ? Number(ev[ev0].targetZone) : Number(rt.getCurrentZone()), open,
        flight: Number(rt.getNDStatus().flights) > fl0, tension: Number(s.governor?.deformationFieldTension ?? NaN),
        locked: s.governor?.governorStatus === 'LOCKED_RECOVERY', applied: d ? [...d.attentionVector] : null, newGates: inscribe ? added : [], entries });
      return s;
    };
    return rt;
  };
  let sc: any = begin(record, id, unit);
  for (let k = 0; k < ticks.length; k += slice) {
    const part = ticks.slice(k, k + slice);
    sc = wt3lChunk({ record: sc.record, metrics: { ...sc.metrics, ticksDone: 0 } }, part, part.length, hyst2lId, make);
  }
  return { metrics: sc.metrics, summary: wt3lSummary(sc.metrics), record: sc.record, steps };
}

/** Entries per 1,000 steps in the first and second halves of a run (by step count; the odd step goes to the second half). */
export function halves(steps: Step[]) {
  const k = Math.floor(steps.length / 2), rate = (a: Step[]) => a.length ? (a.reduce((x, s) => x + s.entries, 0) / a.length) * 1000 : null;
  return { first: rate(steps.slice(0, k)), second: rate(steps.slice(k)) };
}

/** The measures of one run: the four registered quantities, HYST-1L's descriptive set, time out, and the halves. */
export function measures(r: ReturnType<typeof runSpan>) {
  const d = describe(r as any);
  return { P_Eflow: d.E_flow, P_stay: d.meanWarpVisit, P_E: d.E, P_Echoice: d.E_choice, H1: h1(r.steps.map(s => s.zone)), halves: halves(r.steps), ...d };
}

/** Two-sided 95% t interval for the mean of d (descriptive). */
export function tInterval(d: number[]) {
  const n = d.length, m = d.reduce((a, b) => a + b, 0) / n, sd = Math.sqrt(d.reduce((a, b) => a + (b - m) ** 2, 0) / (n - 1));
  const T: Record<number, number> = { 9: 2.262, 10: 2.228, 11: 2.201 }; const t = T[n - 1] ?? 1.96;
  return { mean: m, lo: m - t * sd / Math.sqrt(n), hi: m + t * sd / Math.sqrt(n) };
}
