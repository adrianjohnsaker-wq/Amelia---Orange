// Detection counts per entity, identical to experiments/pf1/core.mjs findCandidates (window 240, recurrence 3)
// but linear in path length: the same excursions, with a per-key window instead of re-filtering all excursions.
import { findExcursions } from '../pf1/core.mjs';
export function scanCandidates(zones, graph, windowSteps = 240, required = 3) {
  const excursions = findExcursions(zones, graph), ends = new Map(), last = new Map(), out = [];
  for (const x of excursions) {
    const q = ends.get(x.key) ?? []; q.push(x.end); while (q[0] < x.end - windowSteps + 1) q.shift(); ends.set(x.key, q);
    const previous = last.get(x.key);
    if (q.length >= required && (previous === undefined || x.end - previous >= windowSteps)) { last.set(x.key, x.end); out.push({ key: x.key, end: x.end }); }
  }
  return out;
}
export function scanCounts(zones, graph) { const c = {}; for (const x of scanCandidates(zones, graph)) c[x.key] = (c[x.key] || 0) + 1; return c; }
