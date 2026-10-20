# OUTSIDE-3 v2 — D0 closure and D1 design-rule amendment
20 October 2026 · operator-approved before any D1 run

**Status:** design-stage rules only. V1 calibration failed K3 and K4; D0 is a completed negative design screen. Registration closed. No real target generated.

## D0 preserved, not reinterpreted

D0 performed 6 magnitude conditions × windows 1, 3 and 10 using activation readout and its **precommitted ≥2.0σ worst-case changed-zone response margin**. All 18 combinations failed. The original D0 manifest, measurements, checksums, and NO-GO remain unchanged. See `D0_DESIGN_GRID.json` and `design-grid/D0_GRID_RESULT.md`.

## Why the ≥2σ minimum is retired **as an eligibility gate**

The D0 denominator is the population standard deviation of the readout under a varied *synthetic cast distribution*, not an independent noise floor. The numerator is the smallest difference from changing **one** of six bits, holding five others fixed. Across a balanced binary mixture, a one-line contrast of size Δ with all other variation removed produces σ = |Δ|/2, or exactly 2σ; variability from the other five lines, nonlinear memory effects or carried-history differences can reduce that normalized margin. Requiring **every edge in all sampled histories** to clear ≥2σ therefore approaches or exceeds this one-bit separation ceiling and is not a defensible sensitivity gate.

This observation does **not** retroactively excuse any D0 failure. The ≥2σ threshold remains verbatim in D0 and may be described in future tables. D1 will report both the minimum Hamming-1 within-readout score margin and the matched one-bit response margin, including zero margins and saturation, but **neither is D1 eligibility or a selection criterion**.

## Replacement: direct synthetic target-plant sensitivity

Selection shall use the proportion of **88-working K3-type synthetic series** whose *target-rank sum* rejects the exact null at P1 one-sided α = 0.05. Each working has a fresh synthetic uniform target (from a disjoint design PRNG) and one uniformly selected line forced to the target's resulting polarity and made nonmoving. The raw-cast arm and C readouts see identical planted casts and targets. Only the plant generator sees targets. The reader never sees the target index, plant location, target rank or a past reveal.

**No v2 calibration claims may be made from design-seed rates.** The operator's separately frozen K3 gates for later 200-series calibration remain `Raw_hits ≥ 180`, `C_hits ≥ 50`, `2*C_hits ≥ Raw_hits`; these are not redefined and are NOT design-selection gates.

## Two parallel mechanical readers

1. `ACTIVATION`: after development, take activation of the six time-circuit zones.
2. `PFM_STRAIN`: after development, take `IntegratedMemorySystem.exportState().zoneStrainHistory[z]` of those six zones (real accumulated ProcessFieldMemory, not event labels or a transcript). Never use the target to modify the state or reference.

For each candidate window and readout, derive `mu_z`, positive `sigma_z` from a predeclared **synthetic reference corpus** using the identical Option A six resulting-polarity base events plus distinct movement events, and the same number of autonomous steps. Standardize each zone independently using population σ. Rank the 64 hexagrams by `Σ_i (2*bit_i(h)-1)*(feature_i-mu_i)/sigma_i`. Ties are exact and use doubled integer midranks; zero σ is an explicit failed-reference condition, not an opportunity for silent numerical repair.

The injective **event stream** must be tested over all 4,096 casts (already passed). For the new PFM feature, test all 4,096 fresh updated six-zone strain vectors, report output collisions and 64-way doubled rank collisions rather than inventing unique ranked outputs, and check restart parity. At FRESH and W88 carried history, quantify all 192 Hamming-1 input comparisons under selected masks, and the minimum standardized **response** difference and within-ranking **score** difference. Report zeros, saturation and worst cases descriptively.

## Prospective D1 manifest and selection

A separate machine-readable manifest must precede every D1 outcome. Precommit all candidates, windows, readout types, reference seeds, design seeds, sample count, exact-null implementation and selection/tie rule. Use no D0 feasibility RNG, v1 calibration, or reserved v2 K1–K5/curve seeds. Paired candidate runs must consume identical design casts, targets and planted-line draws across all conditions.

D1's primary selection metric: **higher number of design-seed C series with exact P1 p ≤ 0.05**, compared over equal series counts. Tie rule in strict order: smaller **mean synthetic target rank**; larger descriptive minimum matched standardized input response margin; shorter window; lexical candidate ID; lexical reader ID. Report raw detection and C/Raw comparison, but do not use any K3 calibration threshold to cherry-pick or declare a pass. If all C detections are compatible with chance or the PFM strain readout collapses, report no compelling v2 candidate and request structural review; do not adjust D1 parameters after execution.

No v2 K1–K5 calibration, target draw, time-lock opening, real working, parameter freeze or registration is authorized by this D1 design amendment.
