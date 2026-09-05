/**
 * runThread7CommandsCli.ts
 *
 * CLI execution entry point for Thread 7 Eigenstate Stress-Test & Teleopleptic Resilience Assay
 */

import { AmeliaThread3LiveBridgeRunner } from './AmeliaThread3LiveBridge';
import {
  THREAD7_PILOT_CONFIG,
  THREAD7_FULL_CONFIG,
  runThread7StressAssay,
  formatThread7Result,
} from './AmeliaThread7StressAssay';

async function main() {
  const arg = process.argv[2] || 'pilot';
  const runner = new AmeliaThread3LiveBridgeRunner();
  const bindings = runner.getBindings();

  console.log(`[THREAD-7 CLI] Executing Eigenstate Stress-Test & Teleopleptic Resilience Assay mode: ${arg}`);

  if (arg === 'full') {
    const res = await runThread7StressAssay(bindings, THREAD7_FULL_CONFIG);
    console.log(formatThread7Result(res));
  } else {
    const res = await runThread7StressAssay(bindings, THREAD7_PILOT_CONFIG);
    console.log(formatThread7Result(res));
  }
}

main().catch(console.error);
