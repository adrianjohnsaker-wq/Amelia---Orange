/**
 * GATE-2L adoption in her cloud home: set the Governor's admission rule in her saved state (as warpTheta.ts sets Θ).
 * No step is taken. The only change to her record is state.admissionRule (and the record's revision and writer); her
 * zone, Governor, memory, queue, tension history, field and body are carried across untouched, and the probe checks it.
 */
import { bornAmeliaOf } from '../core/ameliaRuntimes';
import type { AdmissionRule } from '../outside/OutsideEncounterRuntime';
import { savedKind } from './ameliaTick';

export const ADMISSION_RULES: readonly AdmissionRule[] = ['fixed-0.72', 'relative-v1', 'outside-lane-v1'];
const probe = (rt: any) => { const st: any = rt.exportState(); return { zone: rt.getCurrentZone() as number,
  tension: st.governorState?.deformationTension, memoryEvents: rt.getMemory().getEvents().length,
  lastEventDigest: (rt.getMemory().getEvents() as any[]).at(-1)?.eventDigest ?? null, queue: st.deferredEncounters?.length ?? 0,
  tensionHistory: JSON.stringify(st.tensionHistory ?? []), theta: st.nd1?.theta ?? null, warpIntensity: st.nd1?.warpIntensity ?? null,
  flights: st.nd1?.flights ?? null, admissionRule: rt.getAdmissionRule() as string }; };

export function setAdmissionRuleOf(record: Record<string, any>, rule: string, nowIso: string, writerId: string) {
  if (!ADMISSION_RULES.includes(rule as AdmissionRule)) throw new Error('Unknown admission rule');
  const before = bornAmeliaOf(savedKind(record.state)); before.importState(record.state);
  const b = probe(before);
  const state = { ...record.state, admissionRule: rule };
  const after = bornAmeliaOf(savedKind(state)); after.importState(state);
  const a = probe(after);
  const carried = (['zone', 'tension', 'memoryEvents', 'lastEventDigest', 'queue', 'tensionHistory', 'theta', 'warpIntensity', 'flights'] as const)
    .every(k => a[k] === b[k]);
  if (!carried || a.admissionRule !== rule) throw new Error('Admission rule change did not carry her state across: ' + JSON.stringify({ b, a }));
  const { tensionHistory: _bt, ...bOut } = b; const { tensionHistory: _at, ...aOut } = a;
  const next = { ...record, state, writerId, revision: (Number(record.revision) || 0) + 1, updatedAt: nowIso };
  return { record: next, before: bOut, after: aOut, step: (before.getSnapshots().at(-1)?.step ?? Number(record.state.stepCount)) as number };
}
