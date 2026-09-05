import {
  runNullControlAssay,
  runSensitivitySweep,
  toMarkdownTable,
  sensitivityToMarkdownTable,
} from './pfm-null-control-assay';
import { LiveAmeliaSubstrateAdapter } from './AmeliaSubstrateAdapterImpl';

async function execute() {
  const adapter = new LiveAmeliaSubstrateAdapter();
  const depths = [128, 256, 384, 432, 480, 512];

  // 1. Run Null-Control Assay across 4 conditions
  const nullControlLedger = await runNullControlAssay(
    adapter,
    depths,
    { eta: 0.05, kappa: 0.25 },
    ['NATURAL', 'ABLATED', 'NEUTRAL_RESET', 'TRANSPLANT']
  );

  const table1Markdown = toMarkdownTable(nullControlLedger);
  console.log('=== TABLE 1: NULL CONTROL ASSAY ===');
  console.log(table1Markdown);

  // 2. Run Hyperparameter Sensitivity Sweep across eta & kappa grids
  const sensitivityRows = await runSensitivitySweep(
    adapter,
    depths,
    [0.025, 0.05, 0.075, 0.10],
    [0.10, 0.25, 0.40]
  );

  const table2Markdown = sensitivityToMarkdownTable(sensitivityRows);
  console.log('\n=== TABLE 2: SENSITIVITY SWEEP ===');
  console.log(table2Markdown);
}

execute().catch(err => {
  console.error('Execution error:', err);
});
