/**
 * runReplayAtlasV2PreflightCli.ts
 *
 * Preflight validation and runner for PAPER_6_C1_REPLAY_ATLAS_V2.
 */

import { PAPER_6_C1_REPLAY_ATLAS_V2, v2PreflightSummary } from "./Paper6C1ReplayAtlasV2";
import { Paper6C1ReplayAtlasV2Preflight, V2PreflightReport } from "./Paper6C1ReplayAtlasV2Preflight";

export async function runV2Preflight(): Promise<V2PreflightReport> {
  const summary = v2PreflightSummary();
  console.log("================================================================");
  console.log("PAPER 6 C1 REPLAY ATLAS V2 - PREFLIGHT REPORT");
  console.log("================================================================");
  console.log(`Protocol ID:               ${summary.protocolId}`);
  console.log(`Status:                    ${summary.status}`);
  console.log(`Predecessor V1 Archive:    ${summary.V1Archive}`);
  console.log(`Question:                  ${PAPER_6_C1_REPLAY_ATLAS_V2.question}`);
  console.log(`Source Seeds:              ${PAPER_6_C1_REPLAY_ATLAS_V2.source.sourceSeeds.join(", ")}`);
  console.log(`Depths:                    ${PAPER_6_C1_REPLAY_ATLAS_V2.source.depths.join(", ")}`);
  console.log(`Sealed Source Checkpoints: ${summary.sealedSourceCheckpoints}`);
  console.log(`Stage A Replays:           ${summary.stageAReplays}`);
  console.log(`Raw Step Records:          ${summary.rawSteps}`);
  console.log("----------------------------------------------------------------");
  console.log("Executing V2 Native Preflight Invariant Suite...");

  const preflight = new Paper6C1ReplayAtlasV2Preflight();
  const report = await preflight.runFullPreflight();

  for (const phase of report.phases) {
    const symbol = phase.passed ? "✓ [PASS]" : "✗ [FAIL]";
    console.log(`${symbol} ${phase.phaseId}: ${phase.name}`);
    console.log(`    ${phase.details}`);
  }

  console.log("----------------------------------------------------------------");
  console.log(`All Preflight Invariants Passed: ${report.allPhasesPassed ? "YES" : "NO"}`);
  console.log(`V2 Release Boundary Seal Digest:  ${report.preflightSealDigest}`);
  console.log("================================================================");

  return report;
}

if (typeof process !== "undefined" && process.argv && process.argv[1]?.includes("runReplayAtlasV2PreflightCli")) {
  runV2Preflight().catch((err) => {
    console.error("V2 Preflight Error:", err);
  });
}

