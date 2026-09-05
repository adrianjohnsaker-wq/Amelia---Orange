/**
 * runThread9CommandsCli.ts
 *
 * CLI execution entry point for Thread 9 Consolidation Under Horizon-Off Recovery Assay
 */

import { AmeliaThread3LiveBridgeRunner } from './AmeliaThread3LiveBridge';
import {
  THREAD9_PILOT_CONFIG,
  THREAD9_FULL_CONFIG,
  runThread9ConsolidationAssay,
  formatThread9Result,
} from './AmeliaThread9ConsolidationAssay';

async function main() {
  const arg = process.argv[2] || 'pilot';
  const runner = new AmeliaThread3LiveBridgeRunner();
  const bindings = runner.getBindings();

  console.log(`[THREAD-9 CLI] Executing Consolidation Under Horizon-Off Recovery Assay mode: ${arg}`);

  if (arg === 'full') {
    const res = await runThread9ConsolidationAssay(bindings, THREAD9_FULL_CONFIG);
    console.log(formatThread9Result(res));
  } else {
    const res = await runThread9ConsolidationAssay(bindings, THREAD9_PILOT_CONFIG);
    console.log(formatThread9Result(res));
  }
}

main().catch(console.error);
