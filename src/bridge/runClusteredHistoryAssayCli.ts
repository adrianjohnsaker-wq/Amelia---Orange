import { runClusteredHistoryAssay } from './AmeliaPoincareClusteredInferenceAssay';
import { writeFileSync } from 'fs';
import path from 'path';

const assayReport = runClusteredHistoryAssay(20260902, 10000, 50000);

console.log("=== CLUSTERED NULL-TEST ASSAY REPORT ===");
console.log(JSON.stringify(assayReport, null, 2));

// Generate and save the formatted CSVs
import { generateEmpiricalLineageDataset, computePairwiseRecords, exportRawTrajectoriesCsv, exportPairwiseCsv } from './AmeliaPoincareClusteredInferenceAssay';

const trajectories = generateEmpiricalLineageDataset(20260902);
const pairwise = computePairwiseRecords(trajectories);

const outDir = path.join(process.cwd(), 'src/bridge');
writeFileSync(path.join(outDir, 'poincare_raw_trajectories_replicates.csv'), exportRawTrajectoriesCsv(trajectories));
writeFileSync(path.join(outDir, 'poincare_pairwise_between_within.csv'), exportPairwiseCsv(pairwise));
writeFileSync(path.join(outDir, 'poincare_clustered_inference_summary.json'), JSON.stringify(assayReport, null, 2));

console.log("\nCSVs and JSON summary successfully written to", outDir);
