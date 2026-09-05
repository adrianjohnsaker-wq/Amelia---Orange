/**
 * runThread3RCommandsCli.ts
 *
 * Runs the requested Thread 3R (Target-Reinforced Deformation Assay) Bridge commands.
 */

import { createCanonicalThread3Runner } from './AmeliaThread3LiveBridge';

async function main() {
  const { dispatcher } = createCanonicalThread3Runner();

  console.log("================================================================================");
  console.log("COMMAND 1: BRIDGE THREAD3R — RUN PILOT");
  console.log("================================================================================");
  const pilotOutput = await dispatcher("BRIDGE THREAD3R — RUN PILOT");
  console.log(pilotOutput);
  console.log("\n");

  console.log("================================================================================");
  console.log("COMMAND 2: BRIDGE THREAD3R — RUN FULL");
  console.log("================================================================================");
  const fullOutput = await dispatcher("BRIDGE THREAD3R — RUN FULL");
  console.log(fullOutput);
  console.log("\n");

  console.log("================================================================================");
  console.log("COMMAND 3: BRIDGE THREAD3R — RESULTS");
  console.log("================================================================================");
  const resultsOutput = await dispatcher("BRIDGE THREAD3R — RESULTS");
  console.log(resultsOutput);
  console.log("================================================================================");
}

main().catch((err) => {
  console.error("[THREAD3R_CLI_FATAL]", err);
  process.exit(1);
});
