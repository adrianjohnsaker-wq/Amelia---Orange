# OUTSIDE-3 v2 D1 — Independent design disposition
20 October 2026 · Review after all 18 conditions completed

**Decision: D1 COMPLETED; NO FREEZE; NO K1–K5 CALIBRATION; OUTSIDE-3 REGISTRATION CLOSED.**

This review does not change the D1 manifest, runner, selection rule, seeds, source code, original v1 failures, D0 failure, or fixed future K3 gates. It is an evidence-bounded assessment of an already executed synthetic design grid.

## Chain of decisions and execution

1. Original v1 calibration: K3 **FAIL** (11/200, 5.5%); K4 **FAIL** (C 40/200, 20%). Retained without retuning.
2. D0 design: all 18 combinations failed the then-fixed ≥2σ *worst-case* normalized margin screen. Retained as a negative result.
3. **Before D1 execution**, operator-approved D0 rule retirement recorded in `D0_CLOSURE_D1_RULE_CHANGE.md`. The threshold became DESCRIPTIVE ONLY; the scientific rationale is that cast-varied reference σ is not independent instrumental noise and a one-bit contrast can at most reach 2σ in an otherwise deterministic balanced binary mixture.
4. D1 fixed inputs, six D0 magnitude candidates × three windows (1/3/10) × two concurrent readouts, in `D1_MANIFEST.json`. All 18 conditions tested 24 shared, 88-working selection-design series plus 12 disjoint 88-working held-out design series.
5. A first run stopped *before any series* because the candidate identifier was passed into a numeric validator; see `D1_INCIDENT_001.md`. Its five-field instrumentation-only correction left manifest, numbers, seeds, algorithm, tie rule and K3 future thresholds unchanged.
6. [Corrected GitHub Actions run #39356622075](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39356622075) **SUCCESS**, source commit `f159c69975bec2da390a03bb82f0aa9d2238defd`. All 18 option jobs and the aggregate archive passed. Every condition retained a complete per-series exact BigInt P1 numerator/denominator, source/state digests, and full synthetic target/cast/rank evidence.

D1 manifest SHA-256: `e5568cb5cbf5c1c8390024be58a76b776ccf89b2ae70f271ce41f98ac97f297c`.

## Selection result — do not overinterpret

The **published selection-only lexicographic rule** chose **D0B / one development step / PFM_STRAIN**: 6/24 synthetic target-plant series rejecting at exact P1 α=0.05, compared with 24/24 for the same raw casts (C/Raw = **0.25**). The mean planted-target rank was 31.4171 (chance 32.5; Raw 24.6946).

The **separately held-out design** cohort, withheld from the selection rule, recorded **C 0/12** and **Raw 12/12**. Its mean C target rank was 31.2396. The selected design condition thus **does not show reproducible detection across the held-out cohort**; selecting a different candidate after observing holdout would violate the published rule.

Other PFM_STRAIN combinations reached 6/24 in the selection cohort, but do not justify changing the predeclared selection. The best activation readout in selection was D0F/window 10, at 4/24 and held-out 0/12. All 36 paired readout/window/magnitude results, including zero hits, appear in `d1/D1_RESULT.json` and `d1/D1_REPORT.md`.

These design counts cannot be compared to the **future** 200-series calibration as though calibration had been run. Nevertheless, the selected C/Raw ratio of 0.25 on design seeds falls substantially below the still-fixed prospective requirement of ≥0.50. This is a **warning**, not a retrospective failure of a calibration that has not occurred.

## Memory strain collision and saturation mechanism

The separate **4,096-cast test** showed distinct fresh PFM-strain feature vectors and no post-one-step fresh-feature collisions under a unit-test fixture. D1 reveals the limitation of that observation:

- In the D0B/W1 PFM readout, the **fresh** matched input margin was at least 1.8556 reference σ for the sampled masks. It was exactly **0** in the carried W88 condition for BOTH sampled movement masks.
- Each W88 sampled mask exhibited **32 one-line comparisons with zero changed-zone response**. In a witnessed worst pair, the changed zone had strain 1.0 in both branches. Those events remained distinguishable in history **metadata**, but not through that saturated direct strain feature.
- In the design-selection series, an average of **67.125 of 88 workings** had at least one saturated PFM zone for D0B/W1; held-out 66.75/88. This is an observable saturation burden, not evidence of a metaphysical barrier.
- Standardization cannot recover a difference when the raw feature is identical in the two branches. PFM readout injectivity in fresh memory does **not** imply injectivity under 88 carried workings.

The activation readout preserved a nonzero descriptive one-line response margin at W88 under the sampled histories but generally displayed weaker planted-target detection. The two readouts were derived from the **same substrate dynamics**, so this contrast is about the readout mechanism, not a different simulation.

## Exact numerical method

The new `exactIntegerNull.ts` computes conditional P1 lower-tail and paired P2 upper-tail randomization probabilities using **BigInt** event counts, correct multiplicities of doubled mid-rank ties, integer comparisons to 1/20, and mass verification of `64^n`. The unit gate [#39355905354](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39355905354) passed brute-force n=1,2,3, all-tied and n=88 boundary cases, plus P2 signed examples. An independent earlier BigInt implementation also passed its separate unit tests. D1 decisions use the checked new exact implementation. No approximate FFT decision criterion was used for D1.

## Current claims, exclusions and next allowed development

**Supported:** The software performs the full synthetic D1 design comparison with genuinely carried PFM, two alternative standardized readouts, exact integer nulls and archived negative outputs; the selected design-only option is explicitly identified, and direct PFM strain saturation explains certain zero response margins.

**Not supported:** Robust cross-seed K3-style detection, reader improvement over the raw cast, a successful K3 calibration, a frozen v2 reader, target access, or any metaphysical claims. In particular, **0/12 held-out detection** forbids describing D0B/W1/PFM as a successful sensitivity result.

**Disposition:** Do NOT freeze D0B or any alternative using this D1 result. Do NOT run v2 K1–K5 calibration or open any real working. Request separate authorization for a versioned structural redesign that protects unsaturated historical features (for instance, a bounded unsaturated memory transform or trace-based readout), specifying its law and controls **before any new design runs**. Preserve all failures and selection decisions without retroactive relabeling.

**No real target was generated. OUTSIDE-3 registration remains closed.**
