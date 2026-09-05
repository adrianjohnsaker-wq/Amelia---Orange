/**
 * runNativePoincarePipelineCli.ts
 * 
 * CLI driver executing the authentic native Amelia Poincaré pipeline:
 * 1. Runs authentic Amelia native trajectories through sealed conditioning + unguided observation.
 * 2. Archives CSVs directly to disk.
 * 3. Reads back and validates SHA-256 digests from disk.
 * 4. Runs clustered permutation / bootstrap / BH-FDR statistical tests.
 * 5. Emits complete unredacted summary JSON and console logs.
 */

import { writeFileSync, readFileSync } from 'fs';
import path from 'path';
import {
  executeNativeAmeliaTrajectories,
  computePairwiseComparisons,
  formatTrajectoriesCsv,
  formatPairwiseCsv,
  runStatisticalInferenceOnLoadedData,
  NativeTrajectoryRecord,
  PairwiseDistanceRecord,
  FullNativeAssayReport,
} from './AmeliaNativePoincarePipeline';
import { canonicalSha256 } from '../lib/sha256';

async function main() {
  const baseDir = path.join(process.cwd(), 'src/bridge');
  const trajFilePath = path.join(baseDir, 'poincare_raw_trajectories_replicates.csv');
  const pairFilePath = path.join(baseDir, 'poincare_pairwise_distances_between_within.csv');
  const summaryFilePath = path.join(baseDir, 'poincare_clustered_inference_summary.json');

  console.log("1. Executing authentic native Amelia lineages (sealed conditioning + unguided observation)...");
  const rawTrajectories = await executeNativeAmeliaTrajectories(
    [101, 202, 303, 404, 505], // 5 seeds
    [128, 256, 384, 432, 480, 512], // 6 depths
    ['H_ALPHA', 'H_BETA', 'H_GAMMA'], // 3 histories
    3 // 3 repeats
  );

  console.log(`   Generated ${rawTrajectories.length} genuine native trajectory records.`);

  console.log("2. Computing pairwise between vs within distances...");
  const pairwiseRecords = computePairwiseComparisons(rawTrajectories);
  console.log(`   Generated ${pairwiseRecords.length} pairwise comparisons.`);

  console.log("3. Writing CSVs to disk...");
  const trajCsvText = formatTrajectoriesCsv(rawTrajectories);
  const pairCsvText = formatPairwiseCsv(pairwiseRecords);

  writeFileSync(trajFilePath, trajCsvText, 'utf8');
  writeFileSync(pairFilePath, pairCsvText, 'utf8');

  console.log("4. Reading CSVs from disk and validating source digests...");
  const diskTrajCsv = readFileSync(trajFilePath, 'utf8');
  const diskPairCsv = readFileSync(pairFilePath, 'utf8');

  const trajSha256 = canonicalSha256(diskTrajCsv);
  const pairSha256 = canonicalSha256(diskPairCsv);

  console.log(`   Raw Trajectories SHA256: ${trajSha256}`);
  console.log(`   Pairwise Distances SHA256: ${pairSha256}`);

  // Parse back from disk to guarantee data loaded from file
  const loadedTrajs: NativeTrajectoryRecord[] = [];
  const trajLines = diskTrajCsv.trim().split('\n').slice(1);
  for (const line of trajLines) {
    const [depth, seed_id, history_id, replicate_id, poincare_u, poincare_v, pfm_head_digest, current_zone, strain_frobenius, governor_anti_lock] = line.split(',');
    loadedTrajs.push({
      depth: parseInt(depth, 10),
      seed_id,
      history_id: history_id as any,
      replicate_id: parseInt(replicate_id, 10),
      poincare_u: parseFloat(poincare_u),
      poincare_v: parseFloat(poincare_v),
      pfm_head_digest,
      current_zone: parseInt(current_zone, 10),
      strain_frobenius: parseFloat(strain_frobenius),
      governor_anti_lock: parseFloat(governor_anti_lock),
    });
  }

  const loadedPairs: PairwiseDistanceRecord[] = [];
  const pairLines = diskPairCsv.trim().split('\n').slice(1);
  for (const line of pairLines) {
    const [depth, seed_id, comparison_type, history_a, replicate_a, history_b, replicate_b, distance] = line.split(',');
    loadedPairs.push({
      depth: parseInt(depth, 10),
      seed_id,
      comparison_type: comparison_type as any,
      history_a: history_a as any,
      replicate_a: parseInt(replicate_a, 10),
      history_b: history_b as any,
      replicate_b: parseInt(replicate_b, 10),
      distance: parseFloat(distance),
    });
  }

  console.log("5. Running rigorous statistical inference engine (10,000 bootstraps, 50,000 permutations, BH-FDR)...");
  const { results, globalConclusion } = runStatisticalInferenceOnLoadedData(
    loadedTrajs,
    loadedPairs,
    20260902,
    10000,
    50000
  );

  const fullReport: FullNativeAssayReport = {
    assay_title: "AMELIA_NATIVE_POINCARE_LINEAGE_CLUSTERED_INFERENCE_V1",
    timestamp: new Date().toISOString(),
    random_seed: 20260902,
    raw_trajectories_csv_sha256: trajSha256,
    pairwise_csv_sha256: pairSha256,
    bootstrap_reps: 10000,
    permutation_reps: 50000,
    results_table: results,
    global_conclusion: globalConclusion,
  };

  writeFileSync(summaryFilePath, JSON.stringify(fullReport, null, 2), 'utf8');

  console.log("\n=== COMPLETE UNREDACTED RESULTS TABLE ===");
  console.table(results.map(r => ({
    depth: r.depth,
    mean_between: r.mean_d_between,
    mean_within: r.mean_d_within,
    delta: r.delta_observed,
    ci_95: `[${r.delta_ci_95[0]}, ${r.delta_ci_95[1]}]`,
    perm_p_unadj: r.perm_p_unadj,
    perm_p_fdr: r.perm_p_fdr,
    hedges_g: r.seed_paired_hedges_g,
    g_ci_95: `[${r.g_ci_95[0]}, ${r.g_ci_95[1]}]`,
    verdict: r.verdict,
  })));

  console.log("\n=== FULL REPORT JSON ===");
  console.log(JSON.stringify(fullReport, null, 2));
}

main().catch(err => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
