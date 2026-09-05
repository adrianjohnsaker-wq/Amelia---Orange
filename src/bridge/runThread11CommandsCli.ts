/**
 * runThread11CommandsCli.ts
 *
 * Standalone runner script for Thread-11 Minimal Reinduction Threshold Assay
 */

import { createCanonicalThread3Runner } from './AmeliaThread3LiveBridge';

async function main() {
  console.log("=== Launching Amelia Thread-11 Minimal Reinduction Threshold Assay CLI ===");
  const runner = createCanonicalThread3Runner();
  const output = await runner.dispatcher("BRIDGE THREAD11 — RUN FULL");
  console.log(output);
}

main().catch((err) => {
  console.error('[THREAD11_CLI_ERROR]', err);
  process.exit(1);
});
