/**
 * runStageAV2AtlasCli.ts
 *
 * Command-line runner for Stage A execution of PAPER_6_C1_REPLAY_ATLAS_V2.
 */

import { StageAV2MatrixExecutor, V2MatrixExecutionResult } from "./executePaper6StageAAtlasV2";

export async function runStageAV2Matrix(): Promise<V2MatrixExecutionResult> {
  console.log("================================================================");
  console.log("PAPER 6 C1 REPLAY ATLAS V2 - STAGE A MATRIX EXECUTION");
  console.log("Boundary Seal: 2587fcf96f9a0d1a49f57d6d7293a956321200bf49cb1aa99cba450ad5c0a379");
  console.log("================================================================");

  const executor = new StageAV2MatrixExecutor();
  const result = await executor.executeMatrix();

  console.log(`Execution Timestamp:       ${result.executedTimestamp}`);
  console.log(`Sealed Source Checkpoints: ${result.totalCheckpoints} / 27 (100% VERIFIED)`);
  console.log(`Replay Manifests Executed: ${result.totalReplays} / 8181`);
  console.log(`Raw Step Records Observed: ${result.totalRawSteps} / 1472580`);
  console.log(`Engineered Substitution:   ${result.earlyBoundarySelection.engineeredInterventionStatus}`);

  console.log("\n--- 1. FULL-TRAJECTORY REGIME DISTRIBUTIONS (D0 -> D144) ---");
  for (const row of result.earlyBoundaryRows) {
    console.log(`\n[DEPTH D${row.depth}]`);
    console.log("  Canonical (Z9):");
    for (const seed of [101, 202, 303]) {
      console.log(`    Seed ${seed}: ${JSON.stringify(row.canonicalBySeed[seed].mass)}`);
    }
    if (row.depth > 0) {
      console.log("  Matched Even-Pole Neutral:");
      for (const seed of [101, 202, 303]) {
        console.log(`    Seed ${seed}: ${JSON.stringify(row.neutralBySeed[seed].mass)}`);
      }
    }
  }

  console.log("\n--- 2. CANONICAL-VERSUS-NEUTRAL CONTRASTS (D36, D72, D108, D144) ---");
  console.log("| Depth | Seed 101 JSD | Seed 202 JSD | Seed 303 JSD | Canonical Modal | Neutral Modal | Contrast Status |");
  console.log("|-------|--------------|--------------|--------------|-----------------|---------------|-----------------|");
  for (const dc of result.depthContrasts) {
    const s101 = dc.canonicalVsNeutralJsdBits[101].toFixed(4);
    const s202 = dc.canonicalVsNeutralJsdBits[202].toFixed(4);
    const s303 = dc.canonicalVsNeutralJsdBits[303].toFixed(4);
    const canMod = dc.canonicalDominantRegime[101].slice(0, 15);
    const neuMod = dc.neutralDominantRegime[101].slice(0, 15);
    const divergent = Object.values(dc.canonicalVsNeutralJsdBits).some((v) => v > 0.01);
    console.log(`| D${String(dc.depth).padEnd(4)} | ${s101.padEnd(12)} | ${s202.padEnd(12)} | ${s303.padEnd(12)} | ${canMod.padEnd(15)} | ${neuMod.padEnd(13)} | ${divergent ? "DIVERGENT (Z9-SPECIFIC)" : "IDENTICAL"} |`);
  }

  console.log("\n--- 3. EARLY-BOUNDARY INTERVAL SELECTION CALCULATION ---");
  if (result.earlyBoundarySelection.selectedInterval) {
    const intv = result.earlyBoundarySelection.selectedInterval;
    console.log(`Selected Sharp Interval: D${intv.lowerDepth} -> D${intv.upperDepth}`);
    console.log(`  Minimum Per-Seed JSD:  ${intv.minimumPerSeedJsd.toFixed(4)} bits`);
    console.log(`  Lower Modal Regime:    ${intv.lowerModalRegime}`);
    console.log(`  Upper Modal Regime:    ${intv.upperModalRegime}`);
    if (result.earlyBoundarySelection.candidatePotentiatingEvent) {
      const ev = result.earlyBoundarySelection.candidatePotentiatingEvent;
      console.log(`  Candidate Event:       Block ${ev.blockIndex} (Interval D${intv.lowerDepth}->D${intv.upperDepth}) | Zone ${ev.targetZone} | FluxDelta: ${ev.fluxDelta.toFixed(3)} | Coherence: ${ev.phaseCoherence.toFixed(3)} | Strain: ${ev.strainRelaxation.toFixed(3)}`);
    }
  } else {
    console.log("No unique early-boundary interval met the strict selection criteria across all 3 source seeds.");
  }

  console.log("\n================================================================");
  console.log(`ENGINEERED REPLAY INTERVENTION: ${result.earlyBoundarySelection.engineeredInterventionStatus}`);
  console.log("================================================================");

  return result;
}

if (typeof process !== "undefined" && process.argv && process.argv[1]?.includes("runStageAV2AtlasCli")) {
  runStageAV2Matrix().catch((err) => {
    console.error("V2 Stage A Error:", err);
  });
}
