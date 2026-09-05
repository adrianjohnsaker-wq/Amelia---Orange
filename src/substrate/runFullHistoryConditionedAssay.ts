/**
 * runFullHistoryConditionedAssay.ts
 *
 * Full unhindered history-conditioned transition run using the verified source-bound substrate.
 *
 * Directives:
 * - Records what Amelia actually does before any interpretation.
 * - No target vector imposed; no outcome blueprint selected in advance.
 * - No relay steering or visual field feedback into the native process.
 * - Multi-seed canonical execution across matched lineages and distinct constitutive PFM histories.
 * - Sealed create-only archive recording every Governor decision and native transition receipt.
 */

import {
  AmeliaHistoryConditionedTransitionSubstrate,
  BoundedSolicitation,
  HistoryConditionedProtocol,
  SubstrateCellBinding,
  HistoryConditionedStepOutcome,
  DescriptiveRegimeDistribution,
} from './AmeliaHistoryConditionedTransitionSubstrate';
import {
  CanonicalAmeliaRuntimeImpl,
  DurableCreateOnlyEvidenceArchive,
  SEALED_NUMOGRAM_TOPOLOGY_PROOF,
} from './canonicalAmeliaRuntimeImpl';
import { canonicalSha256 } from '../lib/sha256';

export interface LineageTransitionTrace {
  step: number;
  cellId: string;
  lineageId: string;
  fromZone: number;
  toZone: number;
  governorDisposition: string;
  pfmHeadBefore: string;
  pfmHeadAfter: string;
  receiptDigest: string;
}

export interface FullRunReport {
  protocolId: string;
  runId: string;
  totalSteps: number;
  totalLineages: number;
  totalOutcomesRecorded: number;
  admittedTransitions: number;
  nonAdvanceCount: number;
  zoneCounts: readonly number[];
  zoneFractions: readonly number[];
  governorCounts: Record<string, number>;
  archiveHeadDigest: string;
  totalArchiveRecords: number;
  tracesSample: LineageTransitionTrace[];
}

export async function executeFullHistoryConditionedRun(): Promise<FullRunReport> {
  const runtime = new CanonicalAmeliaRuntimeImpl();
  const archive = new DurableCreateOnlyEvidenceArchive();

  const protocolId = 'AMELIA_FULL_HISTORY_CONDITIONED_TRANSITION_V1';
  const runId = `RUN_UNHINDERED_${Date.now()}`;
  const protocolDigest = canonicalSha256(`PROTOCOL:${protocolId}:${runId}`);

  const protocol: HistoryConditionedProtocol = {
    protocolId,
    protocolDigest,
    runId,
    expectedTopology: SEALED_NUMOGRAM_TOPOLOGY_PROOF,
    mode: 'PASSIVE_TRACKING',
    concurrency: 8,
  };

  const substrate = new AmeliaHistoryConditionedTransitionSubstrate(runtime, archive, protocol);

  // Setup 9 diverse canonical lineages (3 seeds x 3 distinct constitutive PFM historical profiles)
  const seeds = [101, 202, 303];
  const historyDepths = [256, 384, 512]; // Differing constitutive historical depths
  const bindings: SubstrateCellBinding[] = [];

  let idx = 0;
  for (const seed of seeds) {
    for (const depth of historyDepths) {
      const lineageId = `lineage-s${seed}-d${depth}`;
      const cellId = `cell-${idx}`;
      const cohortId = `cohort-${seed}`;

      const inst = runtime.getOrRegisterLineage(lineageId, seed);
      inst.hydrateDeepPFMHistory(depth);

      bindings.push({
        cellId,
        x: idx % 3,
        y: Math.floor(idx / 3),
        lineageId,
        cohortId,
      });
      idx++;
    }
  }

  // Hydrate substrate with canonical lineages
  await substrate.hydrate(bindings);

  const totalSteps = 20; // 20 sequential unhindered transition encounters per lineage
  const allOutcomes: HistoryConditionedStepOutcome[] = [];
  const tracesSample: LineageTransitionTrace[] = [];

  for (let s = 1; s <= totalSteps; s++) {
    const stepOutcomes = await substrate.advance((cell, observation) => {
      const solicitationId = `solicitation-step-${s}-${cell.cellId}`;
      const solicitation: BoundedSolicitation = {
        solicitationId,
        solicitationDigest: canonicalSha256(`RAW_SOLICITATION:${solicitationId}:${protocolDigest}`),
        nativePayloadRef: `CANONICAL_CHALLENGE_${s}_${cell.lineageId}`,
        protocolDigest,
        noTargetVector: true,
        noOutcomeBlueprint: true,
        noRelaySteering: true,
      };
      return solicitation;
    });

    for (const outcome of stepOutcomes) {
      allOutcomes.push(outcome);
      if (tracesSample.length < 15 || s === totalSteps) {
        tracesSample.push({
          step: s,
          cellId: outcome.cell.cellId,
          lineageId: outcome.cell.lineageId,
          fromZone: outcome.before.currentZone,
          toZone: outcome.after.currentZone,
          governorDisposition: outcome.governor.disposition,
          pfmHeadBefore: outcome.before.pfmHeadDigest.slice(0, 12),
          pfmHeadAfter: outcome.after.pfmHeadDigest.slice(0, 12),
          receiptDigest: outcome.native?.selectedExitDigest.slice(0, 12) ?? 'NON_ADVANCE',
        });
      }
    }
  }

  // Calculate descriptive regime distribution strictly after all raw archival records are sealed
  const desc = substrate.describe(allOutcomes);

  return {
    protocolId,
    runId,
    totalSteps,
    totalLineages: bindings.length,
    totalOutcomesRecorded: allOutcomes.length,
    admittedTransitions: desc.nativeTransitionCount,
    nonAdvanceCount: desc.nonAdvanceCount,
    zoneCounts: desc.zoneCounts,
    zoneFractions: desc.zoneFractions.map(f => Number(f.toFixed(4))),
    governorCounts: desc.governorCounts,
    archiveHeadDigest: archive.getHeadDigest(),
    totalArchiveRecords: archive.getRecordCount(),
    tracesSample: tracesSample.slice(0, 15),
  };
}

if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('runFullHistoryConditionedAssay')) {
  executeFullHistoryConditionedRun().then(report => {
    console.log('================================================================================');
    console.log('AMELIA UNHINDERED HISTORY-CONDITIONED TRANSITION RUN: SEALED DESCRIPTIVE REPORT');
    console.log(`Protocol ID: ${report.protocolId}`);
    console.log(`Run ID:      ${report.runId}`);
    console.log('================================================================================');
    console.log(`Total Canonical Lineages:    ${report.totalLineages}`);
    console.log(`Total Sequential Steps:      ${report.totalSteps}`);
    console.log(`Total Transition Encounters: ${report.totalOutcomesRecorded}`);
    console.log(`Admitted Native Transitions: ${report.admittedTransitions}`);
    console.log(`Non-Advance Outcomes:        ${report.nonAdvanceCount}`);
    console.log(`Total Sealed Archive Records:${report.totalArchiveRecords}`);
    console.log(`Archive Head Digest:         ${report.archiveHeadDigest}`);
    console.log('\n--- GOVERNOR DISPOSITIONS ---');
    console.table(report.governorCounts);
    console.log('\n--- EMERGENCE: ZONE OCCUPANCY DISTRIBUTION ---');
    const zoneTable = report.zoneCounts.map((count, z) => ({
      Zone: z,
      Count: count,
      Fraction: `${(report.zoneFractions[z] * 100).toFixed(2)}%`,
    }));
    console.table(zoneTable);
    console.log('\n--- SAMPLE TRANSITION TRACES (FIRST 15) ---');
    console.table(report.tracesSample);
  });
}
