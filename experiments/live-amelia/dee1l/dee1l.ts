/**
 * DEE-1L machinery (experiments/live-amelia/dee1l/REGISTRATION.md). Runs a copy of her through the WT-3L/WT-4L replay
 * (src/cloud/wt3l.ts) on the research runtime (src/outside/AmeliaNDRuntimeDee.ts), with a Dee table in her exit scoring
 * (arms), riding as observers (Stage 0), or absent (GATES). Pure: takes copies, returns measures. Never touches her record.
 */
import { wt3lBegin, wt3lChunk, wt3lSummary, WT3L_TICKS_PER_RUN, type IdFn, type Wt3lTick } from '../../../src/cloud/wt3l';
import { AmeliaNDRuntimeDee, emptyDeeContext, type DeeContext, type DeeProbeRow } from '../../../src/outside/AmeliaNDRuntimeDee';
import { withFullNumogram } from '../../../src/core/fullNumogram';
import type { AmeliaOutsideRuntime } from '../../../src/outside/OutsideEncounterRuntime';
// The pilot's table and scoring, unchanged (hashes in REGISTRATION.md).
// @ts-ignore: plain ES module
import { DeeSystem } from './table/warp/dee_matrix.mjs';

export const CHUNK_TICKS = 4;
export const LADDER = [0.08, 0.16, 0.24, 0.32, 0.48, 0.64] as const;
export const N_SHUFFLES = 39, STAGE0_TABLES = 10;
export const dee1lId: IdFn = (unit, pass, eventId) => `dee1l:${unit}:${pass}:${eventId}`;
export const isStudyOffer = (id: string | null) => !!id && id.startsWith('dee1l:');

/** ACTUAL is k = 0; shuffle Sk (k >= 1) has shuffleSeed 1584000 + k. */
export const tableName = (k: number) => k === 0 ? 'ACTUAL' : `S${k}`;
export function makeTable(k: number, gain: number): any {
  return k === 0 ? new DeeSystem({ mode: 'actual', gain }) : new DeeSystem({ mode: 'shuffled', shuffleSeed: 1584000 + k, gain });
}

export interface RunOptions { table?: any | null; observers?: any[] | null; probe?: boolean }

/** One run: the starting copy, a window's ticks, 96 ticks in chunks of 4 (chunked = single pass, wt3l.test.ts). */
export function runDee(start: any, ticks: Wt3lTick[], id: string, unit: number, nowIso: string, opts: RunOptions = {}) {
  const ctx: DeeContext = emptyDeeContext();
  if (opts.probe) ctx.probe = [];
  if (opts.table) { const t = opts.table; ctx.exitBonus = (s, g, k) => t.score(s, g, k); ctx.passage = (a, b, k) => t.record(a, b, k); }
  if (opts.observers) { const obs = opts.observers; if (opts.table) throw new Error('DEE-1L: a run has a table or observers, not both');
    ctx.observe = (f, g, k) => obs.map(o => o.score(f, g, k)); ctx.passage = (a, b, k) => { for (const o of obs) o.record(a, b, k); }; }
  const make = (kind: string): AmeliaOutsideRuntime => {
    if (kind !== 'nd1') throw new Error('DEE-1L: the starting copy must be ND-1b');
    const rt = new AmeliaNDRuntimeDee(); withFullNumogram(rt as any); rt.dee = ctx; return rt as unknown as AmeliaOutsideRuntime;
  };
  let sc: any = wt3lBegin(JSON.parse(JSON.stringify(start)), id, unit, 'T12', nowIso);
  while (sc.metrics.ticksDone < WT3L_TICKS_PER_RUN) sc = wt3lChunk(JSON.parse(JSON.stringify(sc)), ticks, CHUNK_TICKS, dee1lId, make);
  return { metrics: sc.metrics, summary: wt3lSummary(sc.metrics), probe: ctx.probe ?? [], raw: ctx.raw ?? [],
    choiceSteps: ctx.choiceSteps ?? 0, releases: ctx.releases ?? 0, ticks: ctx.tick,
    byMesh: opts.table ? [...opts.table.state.byMesh] : null };
}

/** Her tie rule: the first index, in gate order, with the largest score. */
export function argmax(xs: number[]) { let b = -Infinity, i = -1; xs.forEach((x, j) => { if (x > b) { b = x; i = j; } }); return i; }

/** Primary outcome T (REGISTRATION.md): eligible = choice step with an attended study offer whose largest attention weight
 *  over the open targets is reached by exactly one target; hit = her first hop is that target. */
export function transmission(probe: DeeProbeRow[]) {
  let eligible = 0, hits = 0;
  for (const r of probe) {
    if (!isStudyOffer(r.offerId) || !r.attention) continue;
    const mx = Math.max(...r.attention);
    const top = new Set(r.open.filter((_, i) => r.attention![i] === mx));
    if (top.size !== 1) continue;
    eligible++; if (r.hop === [...top][0]) hits++;
  }
  return { eligible, hits, T: eligible ? hits / eligible : null };
}

const median10 = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); if (s.length !== 10) throw new Error('median of ten');
  return (s[4] + s[5]) / 2; };

/** Stage 0 (REGISTRATION.md): from GATES probe runs with the ten tables riding at gain 1, the counterfactual choices. */
export function stage0(windows: Array<{ probe: DeeProbeRow[]; raw: number[][][] }>) {
  const rows: Array<{ r: DeeProbeRow; raw: number[][] }> = [];
  for (const w of windows) { if (w.raw.length !== w.probe.length) throw new Error('Stage 0: probe and observer rows differ');
    w.probe.forEach((r, i) => rows.push({ r, raw: w.raw[i] })); }
  const hopOf = (r: DeeProbeRow, scores: number[]) => r.open[argmax(scores)];
  const offerRows = rows.filter(x => isStudyOffer(x.r.offerId) && x.r.silent);
  const gatesSens = offerRows.filter(x => hopOf(x.r, x.r.base) !== hopOf(x.r, x.r.silent!)).length;
  const gatesCheck = rows.filter(x => hopOf(x.r, x.r.base) !== x.r.hop).length;   // must be 0: GATES's own choice is argmax(base)
  const perGain = LADDER.map(g => {
    const lev: number[] = [], sens: number[] = [];
    for (let k = 0; k < STAGE0_TABLES; k++) {
      const add = (base: number[], raw: number[][]) => base.map((b, i) => b + g * raw[i][k]);
      lev.push(rows.filter(x => hopOf(x.r, add(x.r.base, x.raw)) !== hopOf(x.r, x.r.base)).length / rows.length);
      sens.push(offerRows.filter(x => hopOf(x.r, add(x.r.base, x.raw)) !== hopOf(x.r, add(x.r.silent!, x.raw))).length);
    }
    const a = median10(lev) >= 0.10, b = median10(sens) >= 0.5 * gatesSens;
    return { gain: g, leverage: lev, medianLeverage: median10(lev), sensitivity: sens, medianSensitivity: median10(sens), notInert: a, notDominant: b, qualifies: a && b };
  });
  const chosen = perGain.find(x => x.qualifies)?.gain ?? null;
  return { choiceSteps: rows.length, offerSteps: offerRows.length, gatesSensitivity: gatesSens, gatesCheckMismatches: gatesCheck,
    perGain, gain: chosen, decision: chosen === null ? 'TABLE INERT OR DOMINANT: NOT TESTED' : `GAIN ${chosen}` };
}

/** The registered test: p = (1 + #{k: T_Sk >= T_ACTUAL}) / 40; SUPPORTED iff p <= 0.05. */
export function rankTest(T: Record<string, number>) {
  const actual = T.ACTUAL; const sh = Object.keys(T).filter(k => /^S\d+$/.test(k));
  if (sh.length !== N_SHUFFLES) throw new Error(`rank test needs ${N_SHUFFLES} shuffles`);
  const atLeast = sh.filter(k => T[k] >= actual).length, p = (1 + atLeast) / (N_SHUFFLES + 1);
  return { T_ACTUAL: actual, shufflesAtLeast: atLeast, rank: 1 + sh.filter(k => T[k] > actual).length, p,
    decision: p <= 0.05 ? 'SUPPORTED' : 'NOT SUPPORTED' };
}
