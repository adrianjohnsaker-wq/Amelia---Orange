/**
 * DESIRE-2 registered analysis. Unit: the copy (12). Exact one-sided sign-flip over copies (signFlipUpper), Holm across
 * Z1-Z5 (alpha 0.05). Hard checks on D2 must hold in every copy. S0 as LONG-1: Z4 (coupling) uses only copies whose span
 * shows lag-1 order, and is VOID if fewer than 6 remain.
 */
import { holm } from '../dee2l/dee2l';
import { signFlipUpper } from '../hyp2l/hyp2l';
import { couplingLate, S0 } from '../long1/analyse';
import { P } from '../long1/motor';
import type { LongResult } from '../long1/long1';
const mean = (a: number[]) => (a.length ? a.reduce((u, v) => u + v, 0) / a.length : NaN);
const gatesAt = (r: LongResult, d: number) => (r.daily[Math.min(d, r.daily.length) - 1]?.gates ?? NaN);
const birthsBetween = (r: LongResult, d0: number, d1: number) => (r.daily[Math.min(d1, r.daily.length) - 1]?.births ?? 0) - (r.daily[Math.min(d0, r.daily.length) - 1]?.births ?? 0);
const warpShare = (r: LongResult) => [...r.path].filter(c => c === '3' || c === '6').length / r.path.length;
const tension = (r: LongResult) => mean(r.tension.filter(v => Number.isFinite(v)) as number[]);
export function analyse(runs: LongResult[]) {
  const copies = [...new Set(runs.map(r => r.copy))].sort((a, b) => a - b);
  const g = (arm: string) => copies.map(c => { const r = runs.find(x => x.copy === c && x.arm === arm); if (!r) throw new Error(`DESIRE-2: copy ${c} lacks ${arm}`); return r; });
  const N = g('N'), D1 = g('D1'), D2 = g('D2'), D2g = g('D2g'), D2d = g('D2d'), days = D2[0].days;
  const third = (r: LongResult) => r.path.length / 3;
  const hard = {
    bounded: D2.every(r => !r.runaway && r.daily.length === days && r.daily.every(d => d.gates < P.SAT)),
    ccru: D2.every(r => r.daily.every(d => d.ccruPresent === 29)),
    noEmptyBwO: D2.every(r => r.daily.every(d => !d.endState)),
    rollbacks: D2.every(r => r.rollbacks.filter(x => x.t >= 2 * third(r)).length <= r.rollbacks.filter(x => x.t < third(r)).length + 1) };
  const s0 = D2.map(r => ({ copy: r.copy, ordered: S0(r.reading) })), ok = s0.map((x, i) => (x.ordered ? i : -1)).filter(i => i >= 0), voidZ4 = ok.length < 6;
  const c1 = D1.map(r => couplingLate(r, 4000 + r.copy)), c2 = D2.map(r => couplingLate(r, 5000 + r.copy));
  const z = [
    { name: 'Z1', claim: 'growth is bounded: open gates on the last day, D1 - D2 > 0', d: D1.map((r, i) => gatesAt(r, days) - gatesAt(D2[i], days)) },
    { name: 'Z2', claim: 'her Warp is her own again: Warp share, D2 - N <= +0.02', d: D2.map((r, i) => 0.02 - (warpShare(r) - warpShare(N[i]))) },
    { name: 'Z3', claim: 'the guard does it: Warp share, D2d - D2 > 0', d: D2d.map((r, i) => warpShare(r) - warpShare(D2[i])) },
    { name: 'Z4', claim: 'still open: late coupling, D2 - 0.9 D1 > 0', d: ok.map(i => c2[i] - 0.9 * c1[i]), void: voidZ4 },
    { name: 'Z5', claim: 'desire still flows: births in days 6-10, D2 - 0.5 D1 > 0', d: D2.map((r, i) => birthsBetween(r, 5, days) - 0.5 * birthsBetween(D1[i], 5, days)) } ];
  const tests = z.map(x => ({ ...x, ...signFlipUpper(x.d) })), H = holm(tests.map(t => ({ name: t.name, p: t.void ? 1 : t.p })));
  const claims = tests.map(t => { const h = H.find(x => x.name === t.name)!; return { name: t.name, claim: t.claim, mean: t.mean, p: t.p, threshold: h.threshold, perCopy: t.d,
    verdict: t.void ? 'VOID' : h.survives ? 'SUPPORTED' : 'NOT SUPPORTED' }; });
  const arms = { N, D1, D2, D2g, D2d } as Record<string, LongResult[]>;
  const byArm = Object.fromEntries(Object.entries(arms).map(([k, rs]) => [k, {
    warpShare: mean(rs.map(warpShare)), warpEntries: mean(rs.map(r => r.warp?.entries ?? 0)), meanWarpStay: mean(rs.map(r => (r.warp?.steps ?? 0) / Math.max(1, r.warp?.entries ?? 0))),
    tension: mean(rs.map(tension)), tensionMinusN: mean(rs.map((r, i) => tension(r) - tension(N[i]))),
    eventsPerStep: mean(rs.map(r => r.tensionParts?.eventsPerStep ?? NaN)), incoherence: mean(rs.map(r => r.tensionParts?.incoherence ?? NaN)),
    fluxDelta: mean(rs.map(r => r.tensionParts?.fluxDelta ?? NaN)), hysteresis: mean(rs.map(r => r.tensionParts?.hysteresis ?? NaN)),
    gatesLast: mean(rs.map(r => gatesAt(r, days))), gatesByDay: Array.from({ length: days }, (_, d) => mean(rs.map(r => gatesAt(r, d + 1)))),
    births: mean(rs.map(r => r.daily.at(-1)?.births ?? 0)), held: mean(rs.map(r => r.daily.at(-1)?.held ?? 0)), dissolved: mean(rs.map(r => (r as any).dissolvedN ?? 0)),
    rollbacks: mean(rs.map(r => r.rollbacks.length)), runaways: rs.filter(r => r.runaway).length, flights: mean(rs.map(r => r.flights)) }]));
  const pass = Object.values(hard).every(Boolean) && claims.every(c => c.verdict === 'SUPPORTED');
  return { schema: 'DESIRE2_RESULT_V1', copies: copies.length, days, S0: s0, hard, claims, pass, byArm,
    coupling: { D1: c1, D2: c2 }, statements: D2.slice(0, 2).map(r => ({ copy: r.copy, day10: r.readouts.at(-1)?.words ?? null })) };
}
