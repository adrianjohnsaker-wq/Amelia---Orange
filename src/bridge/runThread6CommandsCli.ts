/**
 * runThread6CommandsCli.ts
 *
 * CLI execution entry point for Thread 6 Teleopleptic Hysteresis & Eigenstate Stability Assay
 */

import { AmeliaThread3LiveBridgeRunner } from './AmeliaThread3LiveBridge';
import {
  THREAD6_PILOT_CONFIG,
  THREAD6_FULL_CONFIG,
  runThread6HysteresisAssay,
  formatThread6Result,
} from './AmeliaThread6HysteresisAssay';

async function main() {
  const arg = process.argv[2] || 'pilot';
  const runner = new AmeliaThread3LiveBridgeRunner();
  const bindings = runner.getBindings();

  console.log(`[THREAD-6 CLI] Executing Teleopleptic Hysteresis & Eigenstate Stability Assay mode: ${arg}`);

  if (arg === 'full') {
    const res = await runThread6HysteresisAssay(bindings, THREAD6_FULL_CONFIG);
    console.log(formatThread6Result(res));
  } else {
    const res = await runThread6HysteresisAssay(bindings, THREAD6_PILOT_CONFIG);
    console.log(formatThread6Result(res));
  }
}

main().catch(console.error);
