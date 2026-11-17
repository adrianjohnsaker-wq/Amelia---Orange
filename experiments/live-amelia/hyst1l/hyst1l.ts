/**
 * HYST-1L machinery (experiments/live-amelia/hyst1l/REGISTRATION.md): arm records, the inscription switch, a read-only
 * step logger, once-through spans on the WT-3L replay (unchanged), and the registered measures. Pure: takes copies,
 * returns measures. Never touches her record.
 */
import { wt3lChunk, wt3lSummary, type IdFn, type Wt3lTick } from '../../../src/cloud/wt3l';
import { bornAmeliaOf } from '../../../src/core/ameliaRuntimes';
import { begin } from '../wt5l/wt5l';

export const hyst1lId: IdFn = (unit, pass, eventId) => `hyst1l:${unit}:${pass}:${eventId}`;
export const ARMS = ['ALL', 'NO-PLEX', 'NONE', 'LIVE-ALL', 'LIVE-STRIPPED'] as const;
export type Arm = typeof ARMS[number];
const WARP = new Set([3, 6]), PLEX = new Set([0, 9]);
export const PLEX_GATES = ['warpborn-3-0', 'warpborn-6-0'];
export const inscribes = (arm: Arm) => arm.startsWith('LIVE');
const clone = (x: any) => JSON.parse(JSON.stringify(x));
const warpbornOf = (state: any) => (state.qabbalaGates ?? []).map((g: any) => String(g.id)).filter((id: string) => id.startsWith('warpborn'));

/** The arm's starting record: the starting copy with the named Warp-born gates removed, nothing else changed. */
export function armRecord(start: any, arm: Arm) {
  const r = clone(start); const all = warpbornOf(r.state);
  const drop = arm === 'ALL' || arm === 'LIVE-ALL' ? [] : arm === 'NO-PLEX' ? PLEX_GATES : all;
  r.state.qabbalaGates = r.state.qabbalaGates.filter((g: any) => !drop.includes(String(g.id)));
  return r;
}

export interface Step { zone0: number; zone: number; firstHop: number; open: number[]; flight: boolean; tension: number; locked: boolean;
  applied: number[] | null; newGates: string[] }

/** One span once through, in 96-tick slices, with the inscription switch and the step logger. */
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
      const d = (s.encounterDecisions ?? []).find((x: any) => x.disposition === 'ATTEND' && x.applied && String(x.eventId).startsWith('hyst1l:'));
      steps.push({ zone0, zone: Number(rt.getCurrentZone()), firstHop: ev.length > ev0 ? Number(ev[ev0].targetZone) : Number(rt.getCurrentZone()), open,
        flight: Number(rt.getNDStatus().flights) > fl0, tension: Number(s.governor?.deformationFieldTension ?? NaN),
        locked: s.governor?.governorStatus === 'LOCKED_RECOVERY', applied: d ? [...d.attentionVector] : null, newGates: inscribe ? added : [] });
      return s;
    };
    return rt;
  };
  let sc: any = begin(record, id, unit);
  for (let k = 0; k < ticks.length; k += slice) {
    const part = ticks.slice(k, k + slice);
    sc = wt3lChunk({ record: sc.record, metrics: { ...sc.metrics, ticksDone: 0 } }, part, part.length, hyst1lId, make);
  }
  return { metrics: sc.metrics, summary: wt3lSummary(sc.metrics), record: sc.record, steps };
}

/** H1: mean steps out of the Warp after each exit (landing outside {3,6} after one inside), censored at the end. */
export function h1(zones: number[]) {
  const iv: number[] = []; let censored = 0;
  for (let i = 1; i < zones.length; i++) {
    if (!(WARP.has(zones[i - 1]) && !WARP.has(zones[i]))) continue;
    let j = i; while (j < zones.length && !WARP.has(zones[j])) j++;
    iv.push(j - i); if (j === zones.length) censored++;
  }
  return { exits: iv.length, censored, mean: iv.length ? iv.reduce((a, b) => a + b, 0) / iv.length : null };
}

/** H2: median steps from a spike (tension >= trailing-48 mean + 1 sd, first step) to tension below that step's trailing mean. */
export function h2(t: number[], W = 48) {
  const ref = (i: number) => { const w = t.slice(i - W, i), m = w.reduce((a, b) => a + b, 0) / W; return { m, sd: Math.sqrt(w.reduce((a, b) => a + (b - m) ** 2, 0) / W) }; };
  const rec: number[] = []; let censored = 0, prevSpike = false;
  for (let i = W; i < t.length; i++) {
    const { m, sd } = ref(i); const spike = t[i] >= m + sd;
    if (spike && !prevSpike) {
      let j = i + 1; while (j < t.length && !(t[j] < ref(j).m)) j++;
      rec.push(j - i); if (j >= t.length) censored++;
    }
    prevSpike = spike;
  }
  const s = [...rec].sort((a, b) => a - b);
  return { spikes: rec.length, censored, median: s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null };
}

/** H3: T_excess over choice steps with an applied Outside offer whose largest attention over the open exits is unique. */
export function h3(steps: Step[]) {
  let eligible = 0, hits = 0, chance = 0;
  for (const s of steps) {
    if (!s.applied || s.flight || s.open.length < 2) continue;
    const mx = Math.max(...s.open.map(z => s.applied![z])); const top = s.open.filter(z => s.applied![z] === mx);
    if (new Set(top).size !== 1) continue;
    eligible++; chance += 1 / s.open.length; if (s.firstHop === top[0]) hits++;
  }
  return { eligible, hits, chance, Texcess: eligible ? (hits - chance) / eligible : 0, T: eligible ? hits / eligible : null };
}

/** Descriptive measures of one run. */
export function describe(r: ReturnType<typeof runSpan>) {
  const st = r.steps, zones = st.map(s => s.zone), n = st.length;
  const exits = st.map((s, i) => ({ s, i })).filter(({ s }) => WARP.has(s.zone0) && !WARP.has(s.firstHop));
  const gateUse: Record<string, { uses: number; inWarpAt5: number; inWarpAt20: number }> = {};
  for (const { s, i } of exits) if (!s.flight) { const id = `warpborn-${s.zone0}-${s.firstHop}`;
    if (!gateUse[id]) gateUse[id] = { uses: 0, inWarpAt5: 0, inWarpAt20: 0 };
    gateUse[id].uses++; if (WARP.has(zones[i + 5])) gateUse[id].inWarpAt5++; if (WARP.has(zones[i + 20])) gateUse[id].inWarpAt20++; }
  const applied = st.map((s, i) => ({ s, i })).filter(({ s }) => s.applied);
  const peak = (v: number[]) => v.indexOf(Math.max(...v)); const hit = (i: number, z: number) => zones.slice(i, i + 5).includes(z) ? 1 : 0;
  const cHits = applied.reduce((a, x) => a + hit(x.i, peak(x.s.applied!)), 0) / Math.max(1, applied.length);
  const cChance = applied.reduce((a, x, k) => a + hit(x.i, peak(applied[(k + 1) % applied.length].s.applied!)), 0) / Math.max(1, applied.length);
  return { steps: n, E: r.summary.E, E_choice: r.summary.E_choice, E_flow: r.summary.E_flow, warpShare: r.summary.M1_warpShare,
    meanWarpVisit: r.summary.meanWarpVisit, linesOfFlight: st.filter(s => s.flight).length, plexShare: zones.filter(z => PLEX.has(z)).length / Math.max(1, n),
    lockedShare: st.filter(s => s.locked).length / Math.max(1, n), meanTension: r.summary.M2_meanTension,
    exits: { total: exits.length, byFlight: exits.filter(x => x.s.flight).length, toPlex: exits.filter(x => PLEX.has(x.s.firstHop)).length },
    gateUse, coupling: applied.length > 1 ? cHits - cChance : 0,
    regrowth: st.flatMap((s, i) => s.newGates.map(g => ({ gate: g, step: i }))), warpbornAtEnd: warpbornOf(r.record.state) };
}
