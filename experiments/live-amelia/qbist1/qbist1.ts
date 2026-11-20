/**
 * QBIST-1 machinery (experiments/live-amelia/qbist1/REGISTRATION.md). Runs a copy of her through the WT-3L replay on the
 * research runtime AmeliaNDRuntimeQb, with the organ governing her exits (QB), the decohered organ (DEC), or no organ
 * (ND1B). Pure: takes copies, returns measures. Never touches her record.
 */
import { wt3lBegin, wt3lChunk, wt3lSummary, WT3L_TICKS_PER_RUN, type IdFn, type Wt3lTick } from '../../../src/cloud/wt3l';
import { AmeliaNDRuntimeQb, emptyQbContext, type QbContext, type QbProbeRow } from '../../../src/outside/AmeliaNDRuntimeQb';
import { withFullNumogram } from '../../../src/core/fullNumogram';
import type { AmeliaOutsideRuntime } from '../../../src/outside/OutsideEncounterRuntime';
import { Organ, structureCheck, type Mat } from './organ';

export const CHUNK_TICKS = 4;
export const LADDER: Array<{ lambda: number; gamma: number }> = [0.3, 0.5, 0.7].flatMap(lambda => [2, 4, 8].map(gamma => ({ lambda, gamma })));
export const ARMS = ['QB', 'DEC', 'ND1B'] as const;
export type Arm = typeof ARMS[number];
export const qbist1Id: IdFn = (unit, pass, eventId) => `qbist1:${unit}:${pass}:${eventId}`;
const WARP = new Set([3, 6]);

/** p0: occupancy over her last 1,000 resident events; q: over all resident events (add-one smoothing in both). */
export function occupancies(start: any) {
  const ev: any[] = start.state.memoryState?.events ?? []; const z = ev.map(e => Number(e.targetZone)).filter(x => x >= 0 && x <= 9);
  const occ = (xs: number[]) => { const c = Array(10).fill(1); for (const x of xs) c[x]++; const s = c.reduce((a, b) => a + b, 0); return c.map(x => x / s); };
  return { p0: occ(z.slice(-1000)), q: occ(z) };
}
const seedOf = (id: string) => { let h = 2166136261; for (const ch of id) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

/** One run: 96 ticks in chunks of 4, as DEE-1L, with the organ (or not) and a step logger for locked recovery. */
export function runQb(start: any, ticks: Wt3lTick[], id: string, unit: number, nowIso: string, arm: Arm, setting: { lambda: number; gamma: number }, keepStates = 0) {
  const ctx: QbContext = emptyQbContext(); ctx.probe = [];
  const { p0, q } = occupancies(start);
  const organ = arm === 'ND1B' ? null : new Organ({ lambda: setting.lambda, gamma: setting.gamma, decohere: arm === 'DEC', seed: seedOf(id), p0, q });
  if (organ) ctx.qb = { offer: e => organ.offer(e as any), choose: (f, t, b) => organ.choose(f, t, b), land: z => organ.land(z) };
  const steps: Array<{ locked: boolean }> = []; const states: Mat[] = [];
  const make = (kind: string): AmeliaOutsideRuntime => {
    if (kind !== 'nd1') throw new Error('QBIST-1: the starting copy must be ND-1b');
    const rt: any = new AmeliaNDRuntimeQb(); withFullNumogram(rt); rt.dee = ctx; const orig = rt.step.bind(rt);
    rt.step = (sig?: string, enc?: any) => { const s = orig(sig, enc); steps.push({ locked: s.governor?.governorStatus === 'LOCKED_RECOVERY' });
      if (organ && keepStates && steps.length % 100 === 0 && states.length < keepStates) states.push(organ.rho.map(r => [...r])); return s; };
    return rt as AmeliaOutsideRuntime;
  };
  let sc: any = wt3lBegin(JSON.parse(JSON.stringify(start)), id, unit, 'T12', nowIso);
  while (sc.metrics.ticksDone < WT3L_TICKS_PER_RUN) sc = wt3lChunk(JSON.parse(JSON.stringify(sc)), ticks, CHUNK_TICKS, qbist1Id, make);
  return { metrics: sc.metrics, summary: wt3lSummary(sc.metrics), probe: ctx.probe ?? [], choiceSteps: ctx.choiceSteps ?? 0, steps, organ, states };
}

/** T_excess over choice steps with an attended study offer whose largest attention over the open targets is unique. */
export function transmissionExcess(probe: QbProbeRow[]) {
  let eligible = 0, hits = 0, chance = 0;
  for (const r of probe) { if (!r.offerId || !String(r.offerId).startsWith('qbist1:') || !r.attention) continue;
    const mx = Math.max(...r.attention), top = r.open.filter((_, i) => r.attention![i] === mx); if (new Set(top).size !== 1) continue;
    eligible++; chance += 1 / r.open.length; if (r.hop === top[0]) hits++; }
  return { eligible, hits, chance, Texcess: eligible ? (hits - chance) / eligible : null };
}
/** Novelty: first-time zone triples a -> b -> c in the run's path, per 1,000 steps. */
export function novelty(path: string) { const seen = new Set<string>(); let n = 0; for (let i = 2; i < path.length; i++) { const k = path.slice(i - 2, i + 1); if (!seen.has(k)) { seen.add(k); n++; } } return path.length ? n / path.length * 1000 : 0; }

export function measures(r: ReturnType<typeof runQb>) {
  const x = transmissionExcess(r.probe), path = r.metrics.path as string, ch = r.organ?.choices ?? [];
  return { T_excess: x.Texcess, eligible: x.eligible, novelty: novelty(path), E: r.summary.E, E_choice: r.summary.E_choice, E_flow: r.summary.E_flow,
    warpShare: r.summary.M1_warpShare, linesOfFlight: r.summary.linesOfFlight, zonesVisited: new Set([...path]).size,
    lockedShare: r.steps.filter(s => s.locked).length / Math.max(1, r.steps.length), steps: path.length, choiceSteps: r.choiceSteps,
    organChoices: ch.length, differsFromHer: ch.length ? ch.filter(c => c.chosen !== c.base).length / ch.length : null,
    precursorDecided: ch.length ? ch.filter(c => c.precursorDecided).length / ch.length : null,
    interference: ch.length ? ch.reduce((a, c) => a + c.interference, 0) / ch.length : null,
    meanCoherence: r.organ && r.organ.coherence.length ? r.organ.coherence.reduce((a, b) => a + b, 0) / r.organ.coherence.length : null,
    offersRead: r.organ?.offers ?? 0, landingsRead: r.organ?.landings ?? 0, final: r.metrics.final, warpWrittenAtEnd: r.metrics.warpbornGates };
}

/** Stage 0's structure check over sampled QB and DEC states (all five syzygy pairs on each state). */
export function structure(qbStates: Mat[], decStates: Mat[]) {
  const q = qbStates.flatMap(structureCheck), d = decStates.flatMap(structureCheck);
  const maxQQ = Math.max(...q.map(x => Math.abs(x.qq)), ...d.map(x => Math.abs(x.qq)));
  const maxTermErr = Math.max(...q.map(x => Math.abs(x.coherenceTerm - x.rho)), ...d.map(x => Math.abs(x.coherenceTerm - x.rho)));
  const maxOrderQB = Math.max(...q.map(x => Math.abs(x.order))), maxDecTerm = Math.max(...d.map(x => Math.abs(x.coherenceTerm)));
  return { states: { qb: qbStates.length, dec: decStates.length }, maxQQ, maxTermErr, maxOrderQB, maxDecTerm,
    pass: q.length > 0 && d.length > 0 && maxQQ <= 1e-9 && maxTermErr <= 1e-9 && maxOrderQB > 1e-6 && maxDecTerm <= 1e-9 };
}

/** Exact two-sided sign-flip over all 2^n patterns. */
export function signFlip(d: number[]) { const n = d.length, obs = Math.abs(d.reduce((a, b) => a + b, 0)); let k = 0;
  for (let s = 0; s < 1 << n; s++) { let t = 0; for (let i = 0; i < n; i++) t += (s >> i) & 1 ? -d[i] : d[i]; if (Math.abs(t) >= obs - 1e-12) k++; }
  return { mean: d.reduce((a, b) => a + b, 0) / n, p: k / (1 << n) }; }
export function holm(tests: Array<{ name: string; p: number }>, alpha = 0.05) {
  const order = [...tests].sort((a, b) => a.p - b.p); let stop = false; const out = new Map<string, { survives: boolean; threshold: number }>();
  order.forEach((t, i) => { const threshold = alpha / (order.length - i); const ok = !stop && t.p <= threshold; if (!ok) stop = true; out.set(t.name, { survives: ok, threshold }); });
  return tests.map(t => ({ ...t, ...out.get(t.name)! }));
}
export { WARP };
