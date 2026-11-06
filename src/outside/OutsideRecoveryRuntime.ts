/**
 * Native-Governor recovery for the continuous Outside receiver.
 *
 * Consolidation is a recorded memory intervention. No admission threshold,
 * integrity gate, queue entry, or scoring rule is bypassed or rewritten here.
 */
import { AmeliaOutsideRuntime } from './OutsideEncounterRuntime';
import type { OutsideStepSnapshot, SubstrateEncounterInput } from './encounterTypes';

export const OUTSIDE_RECOVERY_POLICY = 'amelia.outside-native-consolidation/v1';
export const OUTSIDE_MAINTENANCE_TRIGGER = 0.66;
export const OUTSIDE_MAX_DRAIN_STEPS = 512;

export type RecoveryAction = {
  kind: 'CONSOLIDATION'; at: string; priorStep: number;
  governorTension: number; hysteresisBefore: number; hysteresisAfter: number;
  strainBefore: number[]; strainAfter: number[]; memoryEventDigest: string;
} | {
  kind: 'ADMISSION'; at: string; step: number; eventId: string; sourceDigest: string;
  channel: string; fromZone: number; toZone: number; tension: number;
  wasDeferred: boolean;
} | {
  kind: 'OFFER'; at: string; step: number; eventId: string; sourceDigest: string;
  channel: string; disposition: 'ATTEND'|'DEFER'|'REFUSE'; applied: boolean;
};

/** Extension local to the Outside collector; the frozen substrate is untouched. */
export class OutsideRecoveryRuntime extends AmeliaOutsideRuntime {
  private recoveryActions: RecoveryAction[] = [];

  public getDeferredInputs(): SubstrateEncounterInput[] {
    const internal = this as unknown as { deferredEncounters: SubstrateEncounterInput[] };
    if (!Array.isArray(internal.deferredEncounters)) throw new Error('Outside queue is unavailable.');
    return structuredClone(internal.deferredEncounters);
  }

  public getRecoveryActions(): RecoveryAction[] { return structuredClone(this.recoveryActions); }

  public override step(inputSignal?: string, encounter?: SubstrateEncounterInput): OutsideStepSnapshot {
    const queuedBefore = this.getDeferredInputs();
    const governor = this.getGovernor();
    if (governor.deformationFieldTension >= OUTSIDE_MAINTENANCE_TRIGGER) {
      const before = this.getMemory().exportState();
      const priorStep = (this.exportState() as {stepCount:number}).stepCount;
      this.triggerConsolidation();
      const after = this.getMemory().exportState();
      const last = after.events.at(-1);
      if (!last || last.kind !== 'CONSOLIDATE') throw new Error('Native consolidation was not recorded.');
      this.recoveryActions.push({kind:'CONSOLIDATION',at:new Date().toISOString(),priorStep,
        governorTension:governor.deformationFieldTension,
        hysteresisBefore:before.hysteresisTension,hysteresisAfter:after.hysteresisTension,
        strainBefore:[...before.zoneStrainHistory],strainAfter:[...after.zoneStrainHistory],
        memoryEventDigest:last.eventDigest});
    }
    const snapshot = super.step(inputSignal, encounter);
    if (!snapshot.governor.nonAuthorisingEnforced ||
        snapshot.governor.hardLimitViolationCount > governor.hardLimitViolationCount)
      throw new Error('Governor invariant violation during Outside recovery.');
    let offeredDecisionFound = !encounter;
    for (const d of snapshot.encounterDecisions ?? []) {
      if (encounter && d.eventId===encounter.eventId && d.sourceDigest===encounter.sourceDigest) {
        if (offeredDecisionFound) throw new Error('Duplicate decision for an Outside offer.');
        offeredDecisionFound = true;
        this.recoveryActions.push({kind:'OFFER',at:new Date(snapshot.timestamp).toISOString(),
          step:snapshot.step,eventId:d.eventId,sourceDigest:d.sourceDigest,channel:d.channel,
          disposition:d.disposition,applied:d.applied});
      }
      if (d.disposition !== 'ATTEND' || !d.applied) continue;
      const passage = snapshot.lastTransition;
      if (!passage) throw new Error('An admission has no Numogram transition.');
      this.recoveryActions.push({kind:'ADMISSION',at:new Date(snapshot.timestamp).toISOString(),
        step:snapshot.step,eventId:d.eventId,sourceDigest:d.sourceDigest,channel:d.channel,
        fromZone:passage.from,toZone:passage.to,tension:snapshot.governor.deformationFieldTension,
        wasDeferred:queuedBefore.some(q=>q.eventId===d.eventId&&q.sourceDigest===d.sourceDigest)});
    }
    if (!offeredDecisionFound) throw new Error('The Governor did not record the Outside offer.');
    return snapshot;
  }

  /** Drain before offering another item, so existing backlog is not displaced. */
  public drainDeferred(maxSteps = OUTSIDE_MAX_DRAIN_STEPS): {steps:number; remaining:number} {
    if (!Number.isInteger(maxSteps) || maxSteps < 1) throw new Error('Invalid drain limit.');
    let steps = 0;
    while (this.getDeferredInputs().length && steps < maxSteps) { this.step(); steps++; }
    const remaining = this.getDeferredInputs().length;
    if (remaining) throw new Error(`Governor recovery did not drain ${remaining} queued entries in ${steps} steps.`);
    return {steps,remaining};
  }
}
