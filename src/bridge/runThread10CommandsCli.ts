/**
 * runThread10CommandsCli.ts
 *
 * Direct CLI invocation script for Thread 10 Functional Perturbation Assay
 */

import { createCanonicalThread3Runner } from './AmeliaThread3LiveBridge';

async function main() {
  console.log("=== Launching Amelia Thread-10 Functional Perturbation Assay CLI ===");
  const runner = createCanonicalThread3Runner();

  console.log("\n>>> Executing Thread-10 Pilot Assay...");
  const pilotOutput = await runner.dispatcher("BRIDGE THREAD10 — RUN PILOT");
  console.log(pilotOutput);

  console.log("\n>>> Executing Thread-10 Full Assay...");
  const fullOutput = await runner.dispatcher("BRIDGE THREAD10 — RUN FULL");
  console.log(fullOutput);
}

main().catch(err => {
  console.error("Fatal error running Thread-10 CLI:", err);
});
