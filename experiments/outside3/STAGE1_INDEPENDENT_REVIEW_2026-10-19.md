# OUTSIDE-3 Stage 1 independent implementation review — 19 October 2026

**Scope:** inspection of the completed synthetic-only code, frozen design, published calibration data, GitHub Actions outcomes, and unchanged operator work order. This review does **not** modify measurements, constants, reader code, tests or registration. No real target generated or real working opened by this review.

**Review decision: NOT APPROVED FOR OUTSIDE-3 REGISTRATION.**

## Evidence and source identities

- Governing unchanged work order: `experiments/outside3/OUTSIDE3_STAGE1_WORK_ORDER.md`, SHA-256 `1b1b0b74b385d607aa5a77a4462bf0809aadb6f26f2f8bd3f8170e4ead0a01ac`.
- Design constants: `experiments/outside3/design-output/constants.frozen.json`, SHA-256 `f665aa922234d594b76193dc50e4699162987f21e8a190c4c7645d32f0940c5c`.
- Reader smoke execution: https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39301942640 (success).
- Synthetic design/freezing: https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39302207304 (success).
- Synthetic K1–K5 calibration: https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39302871266 (success: computational execution, **not** all-gate scientific approval).
- Synthetic tlock Quicknet interoperability: https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39304200180 (success).
- Consolidated archived report: https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39308890973 (success).
- Frozen calibration source commit: `97af17f4c22946ace360e08ca7f747456e9cf9b5`.

## Frozen K outcomes (unchanged)

| Check | Reported verdict | Observed | Pre-frozen requirement |
| --- | --- | --- | --- |
| K1 | PASS (incomplete coverage test) | At 30 steps, 999 distinct rankings/1000; pooled band entropy 2.000 | Distinct rankings >=2, tie fraction <=0.9; **no per-hexagram band tolerance frozen** |
| K2 | PASS | P1 null rejection 0.063; P2 0.053 (1000 synthetic 88-working series) | each <=0.065 |
| K3 | **FAIL** | C cast-plant rejection **0.055** (200 series) | >=0.25 |
| K4 | **FAIL** | C memory-plant rejection **0.200**, M **0.055** (200 series) | C >=0.25, M <=0.065 |
| K5 | PASS | Mean rank differences at W10 0.078125, W44 0.0338542, W88 0.0377604 | >=0.000001 at all checkpoints |

**K3 and K4 are decisive failures against the frozen thresholds.** They must not be rerun with selected new constants while continuing to call the series the same frozen calibration. Stage 1 does **not** authorize opening real workings.

## Additional K1 coverage audit (independently derived from archived K1-000.json)

| Depth | Distinct rankings | Hexagrams never in best quartile | Hexagrams never in worst quartile | Range across per-hexagram mean ranks |
| --- | ---: | ---: | ---: | ---: |
| 10 | 998 | 14 | 14 | 1.754–63.246 |
| 20 | 1000 | 13 | 13 | 1.816–63.184 |
| 30 | 999 | **11** | **11** | **1.911–63.089** |

The current pooled four-band entropy of `2.000` is **mathematically guaranteed** for each untied complete permutation of ranks 1–64 (16 observations per quartile). It measures neither per-hexagram positional balance nor independence from the input cast. Given the stark per-hexagram bias, K1 is only a **limited software diversity pass**, not satisfaction of the work order's requirement that every hexagram reach every rank band with roughly comparable frequency. This must not be described as full K1 coverage validation.

## Other scientific and technical limitations

1. The null calculation in `exact.ts` uses floating-point FFT convolution of each conditional 64-target finite-support spectrum. It is not an *exact arithmetic* test and has no independently proved numerical-error bound. `massErrorBound:1e-7` is a hard-coded returned value, not a bound derived from an independent error analysis. Before prospective registration, independently verify threshold-sensitive tail probabilities with an integer/rational or controlled numerical method.
2. The shared state uses an unguided main runtime that still generates its endogenous step events. M resets PFM **once per working**, which matches the approved work order; C and G carry their own histories. These paths passed the smoke test, but no evidence of genuine target access follows from that.
3. K5 differences are nonzero but tiny by mean rank: the preselected `1e-6` threshold only establishes weak persistence, not useful target-detection sensitivity.
4. The TLOCK demonstration checked early-denial and post-round Go ↔ TypeScript ciphertext interoperability with a synthetic index and hidden 32-byte salt, and archived ciphertexts rather than plaintext. This verifies software feasibility, not that trusted infrastructure cannot have accessed plaintext during generation.
5. K2 P1 rejection at 6.3% is below the design-stage ceiling 6.5% but above nominal 5%; the finite 1000-series estimate warrants careful independent calibration and statistical uncertainty reporting, not automatic approval.
6. There is no signed, externally timestamped OUTSIDE-3 real evidence ledger because this is an explicitly synthetic-only stage.

## Review disposition and future work

The existing Stage 1 report remains authoritative about what ran and failed. **Do not retrospectively edit the frozen predictions, calibrations, thresholds, or artifacts.** Preserve all negative results and corresponding commit/run references.

For a **distinct new design iteration** only after operator/reviewer authorization: explicitly set per-hexagram coverage criteria, test a stronger cast and memory signal transfer before 30 steps, predefine design-only constants, and independently audit the rank-tail null computation. A new design must have fresh version IDs, its own synthetic design history, registration and calibration gates; do not repurpose the failed Stage 1 record.

**Status: Stage 1 implementation accomplished; report produced; calibration insufficient; registration prohibited.**
