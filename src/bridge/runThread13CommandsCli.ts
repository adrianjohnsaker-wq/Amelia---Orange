/**
 * runThread13CommandsCli.ts
 *
 * Standalone runner script for Thread-13 Autonomous Mode Selection Assay
 */

import {
  runThread13AutonomousModeSelectionAssay,
  THREAD13_FULL_CONFIG,
  formatThread13Result,
} from './AmeliaThread13AutonomousModeSelectionAssay';
import { AmeliaThread3LiveBridgeRunner } from './AmeliaThread3LiveBridge';

async function main() {
  const runner = new AmeliaThread3LiveBridgeRunner();
  const bindings = runner.getBindings();
  const result = await runThread13AutonomousModeSelectionAssay(bindings, THREAD13_FULL_CONFIG);
  console.log(formatThread13Result(result));
}

main().catch((err) => {
  console.error('[THREAD13_CLI_ERROR]', err);
  process.exit(1);
});
