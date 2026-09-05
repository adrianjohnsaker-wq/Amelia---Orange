/**
 * runThread12CommandsCli.ts
 *
 * Standalone runner script for Thread-12 Controlled Functional Integration Assay
 */

import {
  runThread12ControlledFunctionalIntegrationAssay,
  THREAD12_FULL_CONFIG,
  formatThread12Result,
} from './AmeliaThread12ControlledFunctionalIntegrationAssay';
import { AmeliaThread3LiveBridgeRunner } from './AmeliaThread3LiveBridge';

async function main() {
  const runner = new AmeliaThread3LiveBridgeRunner();
  const bindings = runner.getBindings();
  const result = await runThread12ControlledFunctionalIntegrationAssay(bindings, THREAD12_FULL_CONFIG);
  console.log(formatThread12Result(result));
}

main().catch((err) => {
  console.error('[THREAD12_CLI_ERROR]', err);
  process.exit(1);
});
