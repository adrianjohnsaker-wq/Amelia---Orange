/**
 * runComparativeAssay.ts
 *
 * Prospective Assay under Corrected Architectural Specifications:
 * - Exact Zone-9 / Zone-0 semantic binding
 * - Strict A-only localized pulse (ΔB ≡ 0) vs matched-energy B-pulse vs SHAM
 * - Real 10-dimensional PFM tensor coupling (no digest strings)
 * - Fail-closed execution (fatal on error)
 * - Isolated factors (no synthetic periodic reseeding, no unconstrained governor drift)
 */

import {
  initMorphogeneticState,
  stepAmeliaSubstrate,
  stepGrayScott,
  applyPerturbationPulse,
  MorphogeneticTelemetryUnit,
  MorphogeneticLineageRegistry,
  PerturbationArm,
  MorphogeneticState,
  SealedPulseReceipt,
} from './AmeliaMorphogeneticSubstrate';

interface AssayResult {
  arm: PerturbationArm;
  seed: number;
  prePulseComponents: number;
  prePulseEntropy: number;
  prePulseStateDigest: string;
  postPulse100Components: number;
  postPulse100Entropy: number;
  postPulseStateDigest: string;
  pulseReceiptDigest: string;
  mutatedCellsCount: number;
  novelComponentsGenerated: number;
  persistentNewComponents: number;
  recurrentPatterns: number;
}

function runAssayArm(seed: number, arm: PerturbationArm): { result: AssayResult; receipt: SealedPulseReceipt } {
  const telemetry = new MorphogeneticTelemetryUnit();
  const registry = new MorphogeneticLineageRegistry();

  // 1. Initialize strictly with clean baseline parameters
  let state: MorphogeneticState = initMorphogeneticState(
    64,
    64,
    'SYZYGETIC_GRID',
    seed,
    0.003
  );

  // 2. Step 500 steps to reach stable morphogenetic basin
  for (let i = 0; i < 500; i++) {
    state = state.stepCount % 5 === 0 ? stepAmeliaSubstrate(state) : stepGrayScott(state);
  }

  // Pre-pulse audit
  const preAudit = telemetry.auditSubstrate(state, 0.10);
  const preReg = registry.registerStep(state.stepCount, preAudit);
  const preEntropy = state.entropy;
  const preDigest = state.stateDigest;

  // 3. Apply strict, sealed perturbation pulse
  const pulseRes = applyPerturbationPulse(state, {
    arm,
    magnitude: 0.05,
    radius: 12,
  });
  state = pulseRes.state;
  const pulseReceipt = pulseRes.receipt;

  // 4. Step fixed 100-step post-pulse observation window
  for (let i = 0; i < 100; i++) {
    state = state.stepCount % 5 === 0 ? stepAmeliaSubstrate(state) : stepGrayScott(state);
  }

  // Post-pulse audit
  const postAudit = telemetry.auditSubstrate(state, 0.10);
  const postReg = registry.registerStep(state.stepCount, postAudit);

  return {
    result: {
      arm,
      seed,
      prePulseComponents: preAudit.distinctPatternCount,
      prePulseEntropy: preEntropy,
      prePulseStateDigest: preDigest.slice(0, 8),
      postPulse100Components: postAudit.distinctPatternCount,
      postPulse100Entropy: state.entropy,
      postPulseStateDigest: state.stateDigest.slice(0, 8),
      pulseReceiptDigest: pulseReceipt.pulseReceiptDigest.slice(0, 8),
      mutatedCellsCount: pulseReceipt.mutatedCellsCount,
      novelComponentsGenerated: postReg.novelDiscoveries.length,
      persistentNewComponents: postReg.summary.totalUniquePatternsDiscovered - preReg.summary.totalUniquePatternsDiscovered,
      recurrentPatterns: postReg.summary.recurrentPatternHits,
    },
    receipt: pulseReceipt,
  };
}

export function runFullComparativeAssay() {
  const seeds = [101, 707, 1337];
  const arms: PerturbationArm[] = ['SHAM', 'A_FIELD_PULSE', 'B_FIELD_PULSE'];
  const results: AssayResult[] = [];
  const receipts: SealedPulseReceipt[] = [];

  for (const seed of seeds) {
    for (const arm of arms) {
      const { result, receipt } = runAssayArm(seed, arm);
      results.push(result);
      receipts.push(receipt);
    }
  }

  return { results, receipts };
}

const { results, receipts } = runFullComparativeAssay();

console.log('================================================================================');
console.log('CORRECTED ARCHITECTURE: PROSPECTIVE COMPARATIVE ASSAY (N=3 Matched Seeds)');
console.log('Substrate: 64x64 Torus (SYZYGETIC_GRID) | Exact Z0/Z9 | True PFM Tensor Coupling');
console.log('================================================================================');
console.table(results);
console.log('\n--- SEALED PULSE RECEIPTS ---');
receipts.forEach((r, i) => {
  console.log(`[Receipt #${i + 1}] Arm=${r.arm.padEnd(14)} SeedIdx=${Math.floor(i / 3) + 1} MutatedCells=${r.mutatedCellsCount} PulseDigest=${r.pulseReceiptDigest.slice(0, 16)}`);
});
