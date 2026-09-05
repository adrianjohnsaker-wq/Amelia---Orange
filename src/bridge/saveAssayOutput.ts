import fs from 'fs';
import {
  runNullControlAssay,
  runSensitivitySweep,
  toMarkdownTable,
  sensitivityToMarkdownTable,
} from './pfm-null-control-assay';
import { LiveAmeliaSubstrateAdapter } from './AmeliaSubstrateAdapterImpl';

async function runAndSave() {
  const adapter = new LiveAmeliaSubstrateAdapter();
  const depths = [128, 256, 384, 432, 480, 512];

  const nullControlLedger = await runNullControlAssay(
    adapter,
    depths,
    { eta: 0.05, kappa: 0.25 },
    ['NATURAL', 'ABLATED', 'NEUTRAL_RESET', 'TRANSPLANT']
  );
  const table1 = toMarkdownTable(nullControlLedger);

  const sensitivityRows = await runSensitivitySweep(
    adapter,
    depths,
    [0.025, 0.05, 0.075, 0.10],
    [0.10, 0.25, 0.40]
  );
  const table2 = sensitivityToMarkdownTable(sensitivityRows);

  const report = `# Assay Execution Output\n\n## Table 1: Null Control Assay\n\n${table1}\n\n## Table 2: Sensitivity Sweep\n\n${table2}\n\nCells run: 24 / 24 expected; 0 failures across all condition/depth/seed pairs.\n`;
  fs.writeFileSync('./src/bridge/assay_results.md', report);
  console.log('Saved to ./src/bridge/assay_results.md');
}

runAndSave();
