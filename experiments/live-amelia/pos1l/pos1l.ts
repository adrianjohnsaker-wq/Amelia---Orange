/**
 * POS-1L (experiments/live-amelia/pos1l/REGISTRATION.md): the arms on GATE-2L's runGate (unchanged) with WT-9L's selectors
 * (unchanged), and the descriptive edge measure. Pure: takes copies, returns measures. Never touches her record.
 */
import type { Wt3lTick } from '../../../src/cloud/wt3l';
import { setAdmissionRuleOf } from '../../../src/cloud/admissionRule';
import { runGate, measures } from '../gate2l/machinery';
import type { Rule } from '../wt9l10l/machinery';

export const ARMS = ['LANE-TOWARD', 'LANE-AWAY', 'LANE-BLIND', 'LANE-RECORDED', 'QUEUE-TOWARD', 'QUEUE-AWAY'] as const;
export type Arm = typeof ARMS[number];
const WARP = new Set([3, 6]), EDGE = new Set([7, 2, 5]);

/** The QUEUE start: her copy with only the admission rule set to relative-v1 (the set-admission operation). */
export const queueStart = (start: any) => setAdmissionRuleOf(start, 'relative-v1', String(start.updatedAt ?? ''), 'pos1l').record;

export function runArm(start: any, queue: any, ticks: Wt3lTick[], unit: number, arm: Arm) {
  const [g, sel] = arm.split('-') as ['LANE' | 'QUEUE', string];
  return runGate(g === 'LANE' ? start : queue, ticks, `u${String(unit).padStart(2, '0')}-${arm}`, unit, 'CURRENT', sel as Rule);
}

/** Descriptive: entries among landings on the delivery step and the 4 after it, split by her zone before the delivery step. */
export function edgeEntries(r: ReturnType<typeof runGate>, window = 5) {
  const z = r.zones; const out = { edge: { deliveries: 0, entries: 0 }, elsewhere: { deliveries: 0, entries: 0 } };
  for (const a of r.arrivals) {
    if (a.at < 1) continue;
    const k = EDGE.has(z[a.at - 1]) ? 'edge' : 'elsewhere'; out[k].deliveries++;
    for (let t = a.at; t < Math.min(z.length, a.at + window); t++) if (WARP.has(z[t]) && !WARP.has(z[t - 1])) out[k].entries++;
  }
  return { ...out, edgePerDelivery: out.edge.entries / Math.max(1, out.edge.deliveries), elsewherePerDelivery: out.elsewhere.entries / Math.max(1, out.elsewhere.deliveries),
    shareAtEdge: out.edge.deliveries / Math.max(1, out.edge.deliveries + out.elsewhere.deliveries) };
}

export const armMeasures = (r: ReturnType<typeof runGate>) => ({ ...measures(r), linesOfFlight: r.summary.linesOfFlight, edge: edgeEntries(r) });
