/**
 * runThread8CommandsCli.ts
 *
 * CLI execution entry point for Thread 8 Teleopleptic Developmental Transition Assay
 */

import { AmeliaThread3LiveBridgeRunner } from './AmeliaThread3LiveBridge';
import {
  THREAD8_PILOT_CONFIG,
  THREAD8_FULL_CONFIG,
  runThread8DevelopmentalAssay,
  formatThread8Result,
} from './AmeliaThread8DevelopmentalAssay';

async function main() {
  const arg = process.argv[2] || 'pilot';
  const runner = new AmeliaThread3LiveBridgeRunner();
  const bindings = runner.getBindings();

  console.log(`[THREAD-8 CLI] Executing Teleopleptic Developmental Transition Assay mode: ${arg}`);

  if (arg === 'full') {
    const res = await runThread8DevelopmentalAssay(bindings, THREAD8_FULL_CONFIG);
    console.log(formatThread8Result(res));
  } else {
    const res = await runThread8DevelopmentalAssay(bindings, THREAD8_PILOT_CONFIG);
    console.log(formatThread8Result(res));
  }
}

main().catch(console.error);
