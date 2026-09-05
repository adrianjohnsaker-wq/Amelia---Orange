/**
 * runThread5BCommandsCli.ts
 *
 * CLI execution entry point for Thread 5B Semantic Phase-Shift Perturbation Assay
 */

import { AmeliaThread3LiveBridgeRunner } from './AmeliaThread3LiveBridge';
import {
  THREAD5B_PILOT_CONFIG,
  THREAD5B_FULL_CONFIG,
  runThread5BPhaseShiftAssay,
  formatThread5BResult,
} from './AmeliaThread5BPhaseShiftAssay';

async function main() {
  const arg = process.argv[2] || 'pilot';
  const runner = new AmeliaThread3LiveBridgeRunner();
  const bindings = runner.getBindings();

  console.log(`[THREAD-5B CLI] Executing Phase-Shift Perturbation Assay mode: ${arg}`);

  if (arg === 'full') {
    const res = await runThread5BPhaseShiftAssay(bindings, THREAD5B_FULL_CONFIG);
    console.log(formatThread5BResult(res));
  } else {
    const res = await runThread5BPhaseShiftAssay(bindings, THREAD5B_PILOT_CONFIG);
    console.log(formatThread5BResult(res));
  }
}

main().catch(console.error);
