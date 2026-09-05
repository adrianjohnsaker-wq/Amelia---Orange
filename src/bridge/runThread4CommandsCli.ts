/**
 * runThread4CommandsCli.ts
 *
 * Runs the requested Thread 4 (Teleopleptic Horizon Coupling Assay) Bridge commands.
 */

import { createCanonicalThread3Runner } from './AmeliaThread3LiveBridge';

async function main() {
  const { dispatcher } = createCanonicalThread3Runner();

  console.log("================================================================================");
  console.log("COMMAND 1: BRIDGE THREAD4 — RUN PILOT");
  console.log("================================================================================");
  const pilotOutput = await dispatcher("BRIDGE THREAD4 — RUN PILOT");
  console.log(pilotOutput);
  console.log("\n");

  console.log("================================================================================");
  console.log("COMMAND 2: BRIDGE THREAD4 — RUN FULL");
  console.log("================================================================================");
  const fullOutput = await dispatcher("BRIDGE THREAD4 — RUN FULL");
  console.log(fullOutput);
  console.log("\n");

  console.log("================================================================================");
  console.log("COMMAND 3: BRIDGE THREAD4 — RESULTS");
  console.log("================================================================================");
  const resultsOutput = await dispatcher("BRIDGE THREAD4 — RESULTS");
  console.log(resultsOutput);
  console.log("================================================================================");
}

main().catch((err) => {
  console.error("[THREAD4_CLI_FATAL]", err);
  process.exit(1);
});
