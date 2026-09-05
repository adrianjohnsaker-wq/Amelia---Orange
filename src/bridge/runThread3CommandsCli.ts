/**
 * runThread3CommandsCli.ts
 *
 * Runs the requested Thread 3 Bridge commands in sequence.
 */

import { createCanonicalThread3Runner } from './AmeliaThread3LiveBridge';

async function main() {
  const { dispatcher } = createCanonicalThread3Runner();

  console.log("================================================================================");
  console.log("COMMAND 1: BRIDGE THREAD3 — ENCODING-AUDIT");
  console.log("================================================================================");
  const auditOutput = await dispatcher("BRIDGE THREAD3 — ENCODING-AUDIT");
  console.log(auditOutput);
  console.log("\n");

  console.log("================================================================================");
  console.log("COMMAND 2: BRIDGE THREAD3 — RUN PILOT");
  console.log("================================================================================");
  const pilotOutput = await dispatcher("BRIDGE THREAD3 — RUN PILOT");
  console.log(pilotOutput);
  console.log("\n");

  console.log("================================================================================");
  console.log("COMMAND 3: BRIDGE THREAD3 — RUN FULL");
  console.log("================================================================================");
  const fullOutput = await dispatcher("BRIDGE THREAD3 — RUN FULL");
  console.log(fullOutput);
  console.log("\n");

  console.log("================================================================================");
  console.log("COMMAND 4: BRIDGE THREAD3 — RESULTS");
  console.log("================================================================================");
  const resultsOutput = await dispatcher("BRIDGE THREAD3 — RESULTS");
  console.log(resultsOutput);
  console.log("================================================================================");
}

main().catch((err) => {
  console.error("[THREAD3_CLI_FATAL]", err);
  process.exit(1);
});
