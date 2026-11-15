/**
 * WT-6L / WT-7L machinery (experiments/live-amelia/wt6l7l/REGISTRATION.md), on the WT-5L machinery (unchanged).
 * Pure: takes copies, returns measures. Never touches her record.
 */
import { wt3lChunk, wt3lSummary, type IdFn, type Wt3lTick } from '../../../src/cloud/wt3l';
import { begin } from '../wt5l/wt5l';

/** PRE-24: 24 consecutive pre-switch ticks from tick 5(u-1), counted from 0, wrapping past the last tick to the first. */
export function pre24(preTicks: Wt3lTick[], unit: number) {
  const start = 5 * (unit - 1);
  return Array.from({ length: 24 }, (_, k) => preTicks[(start + k) % preTicks.length]);
}

/** Descriptive: a tick structure as replayed (cycled to 96 ticks, 15 iterations each). */
export function structureStats(ticks: Wt3lTick[], nTicks = 96, perTick = 15) {
  let offers = 0, four = 0; const pos: number[] = [];
  for (let k = 0; k < nTicks; k++) { const n = Math.min(perTick, ticks[k % ticks.length].offers.length); offers += n; if (n >= 4) four++;
    for (let i = 0; i < n; i++) pos.push(k * perTick + i); }
  const gaps = pos.slice(1).map((p, i) => p - pos[i]);
  return { offersPerTick: offers / nTicks, shareTicks4plus: four / nTicks, meanIterationsBetweenOffers: gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : null, offers };
}

/** Once through: feed a long tick sequence once, in slices of at most 96 ticks, each continuing from the previous record. */
export function onceThrough(start: any, ticks: Wt3lTick[], id: string, unit: number, idFn: IdFn, slice = 96) {
  let sc: any = begin(start, id, unit);
  for (let k = 0; k < ticks.length; k += slice) {
    const part = ticks.slice(k, k + slice);
    sc = wt3lChunk({ record: sc.record, metrics: { ...sc.metrics, ticksDone: 0 } }, part, part.length, idFn);
  }
  return { metrics: sc.metrics, summary: wt3lSummary(sc.metrics), record: sc.record };
}

/** Holm over the contrasts at alpha: sorted by p, thresholds alpha/(m-i), stopping at the first failure. */
export function holm(tests: Array<{ name: string; mean: number; p: number }>, alpha = 0.05) {
  const order = [...tests].sort((a, b) => a.p - b.p); let stop = false; const out = new Map<string, { survives: boolean; threshold: number }>();
  order.forEach((t, i) => { const threshold = alpha / (order.length - i); const ok = !stop && t.p <= threshold; if (!ok) stop = true; out.set(t.name, { survives: ok, threshold }); });
  return tests.map(t => ({ ...t, ...out.get(t.name)! }));
}

/** Descriptive: what differs between two of her states. */
export function stateDiff(a: any, b: any) {
  const pick = (r: any) => { const s = r.state;
    return { step: s.stepCount, zone: s.currentZone, baseline: s.nd1?.baseline ?? null, theta: s.nd1?.theta ?? null, lastNamed: s.nd1?.lastNamed ?? null,
      warpIntensity: s.nd1?.warpIntensity ?? null, flights: s.nd1?.flights ?? null,
      governorTension: s.governorState?.deformationTension ?? null, queue: (s.deferredEncounters ?? []).length,
      residentEvents: (s.memoryState?.events ?? []).length, admissionRule: s.admissionRule ?? null,
      gates: (s.qabbalaGates ?? []).map((g: any) => `${g.source}>${g.target}${g.isOpen ? '' : ':shut'}`).sort(),
      lastMemoryBias: (s.memoryConsumptionLog ?? []).at?.(-1)?.appliedBiasVector ?? null,
      lastHysteresis: (s.memoryConsumptionLog ?? []).at?.(-1)?.memoryHysteresisTension ?? null }; };
  const A = pick(a), B = pick(b);
  return { S837: A, S1981: B, sameGates: JSON.stringify(A.gates) === JSON.stringify(B.gates) };
}
