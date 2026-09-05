/**
 * executeNativeProfileComparisonRun.ts
 *
 * Runs the sealed nine-lineage comparison using AmeliaNativeDevelopmentalProfileMap.
 *
 * Lineages: 9 canonical lineages across 3 seeds (101, 202, 303) and 3 PFM historical depths (256, 384, 512).
 * Protocol: Evaluates native HistoryConditionedStepOutcome stream without steering or proxies.
 * Measures:
 *   - fullProfileDigest (complete provenance confirming constitutive PFM divergence)
 *   - effectiveTopologyDigest (pure topological exit, transition, occupancy, and phase key)
 *   - Full Governor disposition telemetry (ADMIT, DEFER, REFUSE, ABSTAIN)
 *   - Creates create-only sealed receipts for all lineage outcomes and comparisons.
 */

import {
  AmeliaHistoryConditionedTransitionSubstrate,
  BoundedSolicitation,
  HistoryConditionedProtocol,
  SubstrateCellBinding,
  HistoryConditionedStepOutcome,
} from './substrate/AmeliaHistoryConditionedTransitionSubstrate';
import {
  CanonicalAmeliaRuntimeImpl,
  DurableCreateOnlyEvidenceArchive,
  SEALED_NUMOGRAM_TOPOLOGY_PROOF,
} from './substrate/canonicalAmeliaRuntimeImpl';
import {
  buildNativeDevelopmentalProfile,
  compareNativeProfiles,
  sealProfileComparison,
  formatProfileComparisonForBridge,
  NativeDevelopmentalProfile,
  NativeProfileComparison,
} from './bridge/AmeliaNativeDevelopmentalProfileMap';
import { InMemoryBridgePhaseArchive } from './firebase/bridgePhaseArchive';
import { canonicalSha256 } from './lib/sha256';

export interface SealedNineLineageExecutionReport {
  comparison: NativeProfileComparison;
  formattedDisplay: string;
  perLineageLedger: Array<{
    lineageId: string;
    seed: number;
    depth: number;
    fullProfileDigest: string;
    effectiveTopologyDigest: string;
    admitted: number;
    deferred: number;
    refused: number;
    abstained: number;
    zonesVisited: string;
    exitDigestsSample: string[];
    receiptDigestChain: string;
    archiveRecordsCount: number;
  }>;
}

export async function runSealedNineLineageProfileComparison(): Promise<SealedNineLineageExecutionReport> {
  const runtime = new CanonicalAmeliaRuntimeImpl();
  const archive = new DurableCreateOnlyEvidenceArchive();
  const bridgeArchive = new InMemoryBridgePhaseArchive();

  const protocolId = 'AMELIA_NATIVE_PROFILE_MAP_V1';
  const runId = `RUN_SEALED_PROFILE_COMPARISON_${Date.now()}`;
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
  const historyDepths = [256, 384, 512];
  const bindings: SubstrateCellBinding[] = [];

  const lineageMeta = new Map<string, { seed: number; depth: number }>();

  let idx = 0;
  for (const seed of seeds) {
    for (const depth of historyDepths) {
      const lineageId = `lineage-s${seed}-d${depth}`;
      const cellId = `cell-${idx}`;
      const cohortId = `cohort-${seed}`;

      const inst = runtime.getOrRegisterLineage(lineageId, seed);
      inst.hydrateDeepPFMHistory(depth);

      lineageMeta.set(lineageId, { seed, depth });

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

  // Hydrate substrate
  await substrate.hydrate(bindings);

  const totalSteps = 20;
  const lineageOutcomesMap = new Map<string, HistoryConditionedStepOutcome[]>();
  for (const b of bindings) {
    lineageOutcomesMap.set(b.lineageId, []);
  }

  // Advance 20 unhindered steps
  for (let s = 1; s <= totalSteps; s++) {
    const stepOutcomes = await substrate.advance((cell, observation) => {
      const solicitationId = `solicitation-step-${s}-${cell.cellId}`;
      return {
        solicitationId,
        solicitationDigest: canonicalSha256(`RAW_SOLICITATION:${solicitationId}:${protocolDigest}`),
        nativePayloadRef: `CANONICAL_CHALLENGE_${s}_${cell.lineageId}`,
        protocolDigest,
        noTargetVector: true,
        noOutcomeBlueprint: true,
        noRelaySteering: true,
      };
    });

    for (const outcome of stepOutcomes) {
      lineageOutcomesMap.get(outcome.cell.lineageId)?.push(outcome);
    }
  }

  // Build native developmental profiles from the stream
  const profiles: NativeDevelopmentalProfile[] = [];
  const perLineageLedger: SealedNineLineageExecutionReport['perLineageLedger'] = [];

  for (const [lineageId, outcomes] of lineageOutcomesMap.entries()) {
    const meta = lineageMeta.get(lineageId)!;
    const profile = buildNativeDevelopmentalProfile(lineageId, meta.seed, meta.depth, outcomes);
    profiles.push(profile);

    // Compute governor telemetry breakdowns
    let admittedCount = 0;
    let deferredCount = 0;
    let refusedCount = 0;
    let abstainedCount = 0;

    for (const o of outcomes) {
      if (o.governor.disposition === 'ADMIT') admittedCount++;
      else if (o.governor.disposition === 'DEFER') deferredCount++;
      else if (o.governor.disposition === 'REFUSE') refusedCount++;
      else if (o.governor.disposition === 'ABSTAIN') abstainedCount++;
    }

    const zones = Array.from(new Set(outcomes.flatMap(o => [o.before.currentZone, o.after.currentZone]))).sort((a, b) => a - b);

    perLineageLedger.push({
      lineageId,
      seed: meta.seed,
      depth: meta.depth,
      fullProfileDigest: profile.fullProfileDigest,
      effectiveTopologyDigest: profile.effectiveTopologyDigest,
      admitted: admittedCount,
      deferred: deferredCount,
      refused: refusedCount,
      abstained: abstainedCount,
      zonesVisited: zones.map(z => `Z${z}`).join(','),
      exitDigestsSample: profile.sequences.exitDigests.slice(0, 3).map(e => e.slice(0, 12)),
      receiptDigestChain: profile.receiptDigestChain,
      archiveRecordsCount: profile.archiveRecordIds.length,
    });
  }

  // Compare profiles
  const rawComparison = compareNativeProfiles(profiles);

  // Seal comparison into bridge archive
  const sealedComparison = await sealProfileComparison(rawComparison, bridgeArchive);
  const formattedDisplay = formatProfileComparisonForBridge(sealedComparison);

  return {
    comparison: sealedComparison,
    formattedDisplay,
    perLineageLedger,
  };
}

// Direct execution harness
runSealedNineLineageProfileComparison().then(report => {
  console.log(report.formattedDisplay);
  console.log('\n--- DETAILED PER-LINEAGE COMPARISON LEDGER ---');
  console.table(report.perLineageLedger);
  console.log('\nDECISIVE EVALUATION:');
  console.log(`Outcome: ${report.comparison.outcome}`);
  console.log(`Unique Effective Topology Count: ${report.comparison.uniqueEffectiveTopologyCount}`);
  console.log(`Unique Full Profile Count: ${report.comparison.uniqueFullProfileCount}`);
  console.log(`PFM Histories Diverged: ${report.comparison.pfmHistoriesWereDistinct}`);
  console.log(`Comparison Digest: ${report.comparison.comparisonDigest}`);
  console.log(`Archive Head Digest: ${report.comparison.archiveHeadDigest}`);
}).catch(err => {
  console.error('Error during execution:', err);
});
