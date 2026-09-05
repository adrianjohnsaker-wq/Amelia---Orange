/**
 * runThread9BCommandsCli.ts
 *
 * CLI execution entry point for Thread 9B Extended Longevity Assay (Consolidation Half-Life)
 */

import { AmeliaThread3LiveBridgeRunner } from './AmeliaThread3LiveBridge';
import {
  THREAD9B_PILOT_CONFIG,
  THREAD9B_FULL_CONFIG,
  runThread9BLongevityAssay,
  formatThread9BResult,
} from './AmeliaThread9BLongevityAssay';

async function main() {
  const arg = process.argv[2] || 'pilot';
  const runner = new AmeliaThread3LiveBridgeRunner();
  const bindings = runner.getBindings();

  console.log(`[THREAD-9B CLI] Executing Extended Longevity Assay (Consolidation Half-Life) mode: ${arg}`);

  if (arg === 'full') {
    const res = await runThread9BLongevityAssay(bindings, THREAD9B_FULL_CONFIG);
    console.log(formatThread9BResult(res));
  } else {
    const res = await runThread9BLongevityAssay(bindings, THREAD9B_PILOT_CONFIG);
    console.log(formatThread9BResult(res));
  }
}

main().catch(console.error);
