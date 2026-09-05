/**
 * runThread4ACommandsCli.ts
 *
 * Executes Thread-4A Gain Sweep CLI commands and prints sealed results
 */

import { createCanonicalThread3Runner } from './AmeliaThread3LiveBridge';

async function main() {
  const runner = createCanonicalThread3Runner();

  console.log("=".repeat(80));
  console.log("COMMAND 1: BRIDGE THREAD4A — RUN PILOT");
  console.log("=".repeat(80));
  const pilotOutput = await runner.dispatcher("BRIDGE THREAD4A — RUN PILOT");
  console.log(pilotOutput);

  console.log("\n" + "=".repeat(80));
  console.log("COMMAND 2: BRIDGE THREAD4A — RUN FULL");
  console.log("=".repeat(80));
  const fullOutput = await runner.dispatcher("BRIDGE THREAD4A — RUN FULL");
  console.log(fullOutput);

  console.log("\n" + "=".repeat(80));
  console.log("COMMAND 3: BRIDGE THREAD4A — RESULTS");
  console.log("=".repeat(80));
  const resultsOutput = await runner.dispatcher("BRIDGE THREAD4A — RESULTS");
  console.log(resultsOutput);
}

main().catch((err) => {
  console.error("CLI Execution error:", err);
  process.exit(1);
});
