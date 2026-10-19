# OUTSIDE-3 Reader v2 — Design draft (NOT registration)

**Date:** 19 October 2026
**Status:** \`DESIGN_DRAFT_NOT_FROZEN\`; synthetic-only research proposal; operator/reviewer sign-off required before implementation and design runs.
**Parent experiment:** OUTSIDE-3 Stage 1 (v1), whose unchanged report records K3 FAIL (0.055) and K4 FAIL (0.200 C; 0.055 M).
**Ground truth:** \`../STAGE1_REPORT.md\`, \`../design-output/constants.frozen.json\`, and \`../STAGE1_INDEPENDENT_REVIEW_2026-10-19.md\`.

## Why the new version is needed

The Stage 1 reader used present activation orientation and **only moving-line PFM events**. It did not meet the synthetic K3 planted-cast detection target (0.055 vs 0.25), nor K4 (0.200 vs 0.25). K1 also showed severe hexagram-dependent positional bias, inadequately diagnosed by pooled quartile entropy.

Stage 1 stays a completed **failed calibration**. v2 has its own source version, constants, synthetic seeds, design-run records, gates, calibration outputs and verdicts. v1 artifacts are never modified or pooled with v2.

**Do not implement or freeze v2 merely by accepting this draft.** First accept the supplementary v1 K3 diagnostics on the raw arm and step 0 versus step 30. Any operational parameter below labeled \`TO_DESIGN\` has no assigned value.

## v2 scientific question and claim boundary

Can a deliberately planted one-line signal entering through the cast survive a complete, target-blind PFM-mediated reader and be detectable through its final ranking? This is **apparatus sensitivity**, not hidden-target access. Separately ask if information carried in memory improves detection relative to the memory-reset arm.

For actual OUTSIDE-3, future registration remains prohibited until all required v2 calibrations and independent review have passed. No real targets, reveal rounds, casts from a querent or working IDs may be opened in this phase.

## Architecture A: six-line PFM input, not transient activation orientation

The mapping remains bottom-first lines 1–6 → zones \`[1,2,4,8,7,5]\`. Binary encoding remains 6/8 = yin, 7/9 = yang; 6 and 9 move; resulting hexagram is primary XOR moving mask; raw arm continues ranking by resulting-hexagram agreement. Bit index 0 is the bottom line.

**All six lines enter as exactly one PFM event per line** in ascending line order, regardless of movement. One design candidate is a polarity encoding through syzygy partners:

| Line value | Polarity | History channel | Movement |
|---|---|---|---|
| 6 | yin | complement of z(i), paired within its time syzygy | old/moving |
| 7 | yang | z(i) | young/stationary |
| 8 | yin | complement of z(i) | young/stationary |
| 9 | yang | z(i) | old/moving |

Complement means \`9 - z(i)\`, preserving the mapped time-circuit set. The event body records original line index, mapped zone, polarity, actual target zone, moving flag, input value, local step, and a canonical digest. **No target or planted-signal label may reach reader code.** Per-line event magnitude/coherence may distinguish old/young lines using a **predeclared candidate rule**; amplitudes, saturation handling and strain relaxation all require synthetic design studies and a later versioned freeze.

Potential alternative: signed-history event encoding, but only if a separate substrate-change commit precedes every v2 design/calibration run. Do not introduce negative flux into the current nonnegative PFM update law without explicit safety and replay tests.

Present orientation: **do not directly overwrite activation to ±δ for v2 primary path**. The cast should influence development through the ordinary PFM read/transition mechanism. The canonical present state and six events are sufficient for the candidate reader. A direct-orientation variant may be a **design-stage comparator only**, must not be silently combined with the primary pathway, and may not be selected using calibration outcomes.

At the beginning of each working: C carries its complete PFM; M starts with a clone of C's identical present zones/gates/Governor/traits but resets only PFM; G evolves on its own pre-frozen degree-matched rewiring and separately carried history; Raw has no substrate. All three substrate arms receive the identical six events. M accumulates endogenous PFM during the observation window; never reset M each step.

## Architecture B: prospective development-window choice

**The number of unguided steps is not 30 by default.** Before K1–K5 calibration, conduct design-only runs at predetermined candidate windows, proposed \`[0, 1, 3, 5, 10, 15, 20, 30, 45, 60]\`. Step 0 is a diagnostic baseline, not an automatically eligible production readout if it fails to develop any memory.

The window-selection objective and tie-breaking rule must be written **before design runs**. The design record must assess input/rank information retention, per-zone readout variance, C–M separation and recurrent-state saturation, with a held-out design subset. The selection rule may prefer a shorter window preserving synthetic plant sensitivity without collapse, but MUST NOT optimize against K1–K5 evaluation seeds or against real targets. Publish all design candidates, scores, ties and the selected window in a distinct \`v2/design-output/constants.frozen.json\` and include a hash and independent provenance for the selection.

## Architecture C: standardized per-zone linear readout

Compute \`mu_z\` and \`sigma_z\` **separately for all six time-circuit zones** from a predeclared corpus of at least 1,000 synthetic reference casts using a fresh canonical state and the v2 reader. Reference seeds, sample construction and whether fresh state is used per reference cast must be fixed before generation. The reference procedure must evaluate the **same selected development window and entry mechanism** used by C.

\`\`\`text
a_z = (final_activation_z - mu_z) / sigma_z
S(h) = sum_{i=1..6} (2 * bit_i(h) - 1) * a_{z(i)}
\`\`\`

The variance estimate (sample vs population) and a floor/zero-variance failure condition are frozen in the design manifest. **Never silently divide by zero or choose a sigma floor after viewing calibration.** Keep scores deterministic (same floating evaluation order); ranks use exact score comparisons with doubled integer mid-ranks. Record all six \`mu_z\`, \`sigma_z\`, their denominators, design seed and SHA-256.

## K1 — responsiveness **and positional-bias guard**

Report by proposed development checkpoint and finally selected window:
- number of distinct rankings, tie fraction, empirical per-zone standardized score spread and the **per-hexagram mean rank**;
- the full 64×4 position/quartile frequency table, not only pooled entropy;
- count of hexagrams that never enter a given quartile; per-hexagram rank-band deviation from the registered band proportions; maximum absolute per-hexagram mean-rank deviation from 32.5;
- any deterministic h↔(63 XOR h) symmetry constraints of a pure linear readout.

The acceptance rule must include **numeric, fixed per-hexagram positional-bias tolerance(s)** before calibration. Do not reuse v1's pooled entropy as the sole gate: every untied full ranking has pooled quartile entropy exactly two bits, irrespective of systematic hexagram bias. K1 cannot pass solely because rankings differ across casts.

A strong bias at step 0 is separately reported and never concealed by the selected window. If standardized linear readout remains intrinsically unable to satisfy defensible K1 per-hexagram tolerances, terminate the proposed reader rather than relax tolerances post-calibration.

## Exact finite nulls — integer convolution, not floating FFT

Inputs to the null are each working's 64 doubled mid-ranks, and for P2 each working's 64 paired differences \`rank2_Raw[h] - rank2_C[h]\`. Duplicate values (ties) are included with their exact multiplicities.

For each working \`w\`, define integer-frequency polynomial
\`\`\`text
F_w(x) = sum_{h=0..63} x^{rank2_C_w[h]}
D_w(x) = sum_{h=0..63} x^{rank2_Raw_w[h] - rank2_C_w[h]}
\`\`\`
Then compute integer coefficient convolutions \`F = Π F_w\`, \`D = Π D_w\` over all 88 workings. For n workings, total mass must equal \`64^n\` **as a BigInt integer**, with no floating rounding, FFT clipping or renormalization. Sum coefficients for observed lower-tail P1 and upper-tail P2 statistics, and express each p-value as exact numerator/denominator \`BigInt\` strings, optionally showing a rounded display decimal.

Implementation requirements:
- Sparse/nonnegative BigInt maps with signed score offsets for P2, or equivalent dense indexed BigInt arrays with explicit minimum offsets.
- End-to-end exactness checks on tiny enumerated cases (n = 1, 2, 3), ties/all-equal ranks, negative paired differences, normalization mass identity.
- Benchmark 88-working performance on design-only synthetic distributions. If resource limits prevent acceptable runtime, improve exact implementation **before** freezing; do not silently fall back to approximate FFT.
- P1 one-sided smaller total rank is better; P2 one-sided larger Raw-minus-C is better. P2 is prospectively gatekept by P1 for later real-target interpretation.
- Never use a target-independent uniform-rank shortcut for P2 (the paired C-vs-Raw difference spectrum is generally not uniform).

## Calibration and gating plan (fresh synthetic series)

Distinct v2 seeds for reference, design, K1, K2, K3, K4, K5 and curve, with no reuse of v1 seeds or outcome-target information. Every synthetic 88-working sequence carries C/G history and resets M per working. Publishing seeds and generator logic is required.

| Check | v2 requirement |
|---|---|
| **K1** | At least 1,000 fresh synthetic casts, selected window, numerical per-hexagram positional-bias criterion fixed before K gates; report entropy, quartiles, symmetry, ties and rank diversity |
| **K2** | 1,000 target-independent synthetic 88-working series, exact-integer P1 and P2 nulls; pre-frozen false-positive ceiling and observed uncertainty |
| **K3 — DECISIVE** | 200 full synthetic 88-working series; one randomly chosen cast line in every working forced to the target's polarity, set nonmoving. Demand a **predeclared minimum** C detection rate that is meaningfully greater than the no-signal false-positive baseline; if K3 fails, **v2 fails regardless of K1/K2/K4/K5** |
| **K4** | 200 synthetic 88-working series with target-yang line PFM plants in C before cast, not in M; separate C detection minimum, M false-positive ceiling, and matched comparisons fixed prospectively |
| **K5** | Full 88-working synthetic series, one historical perturbation applied at W1, matched later inputs, C–M divergence; pre-frozen meaningful rank survival threshold at W10/W44/W88, not merely nonzero |

**Descriptive curve:** 200 synthetic 88-working series at **each** planted-working fraction \`0.10, 0.20, 0.30, 0.45, 0.60\`, with fraction sampled independently for each working, and all raw results retained. This is descriptive and not a calibration tuning source.

Pre-frozen K3 detection threshold: \`TO_DESIGN\`; do not assign a convenient value after K3 has run. The plan should include a power/sensitivity rationale based solely on design-only simulations, with separate, withheld seeds for calibration. K3 failing is a hard NO-GO, even if K4 passes.

## Gate, audit and no-peeking boundaries

1. Accept this design draft for implementation; assign a unique v2 reader source digest. Do not edit v1 reader, design outputs, original K shards or original failure report.
2. Complete the **post hoc v1 supplemental diagnostics** on original K3 seeds first; they are explanatory only and cannot revise v1's K3 failure.
3. Implement and unit-test v2 entry, scoring and exact-integer null software with synthetic data only.
4. Commit any necessary substrate changes in their own hash-addressed commit **before** design runs. Prefer no substrate changes.
5. Run design-only selection and freeze **all** v2 constants, \`mu\`, \`sigma\`, event weights, development window, graph rewiring, null implementation SHA-256, unique synthetic seeds, decision thresholds, and logging methods.
6. Only then run v2 K1–K5 and the five 200-series descriptive-curve cohorts. Execute and archive all outcomes, including failures; do not stop early and do not retune within v2.
7. Produce \`v2/STAGE_REPORT.md\`, exact source/parameter manifests, K1 per-hexagram tables, per-series p-value numerator/denominator, replay hashes, failed thresholds and provenance.
8. Operator + independent reviewer acceptance is required **before** any registration of a future OUTSIDE-3 real-target experiment.

**Current authorization:** draft v2 and run explanatory v1 diagnostics only. **Do not execute v2 calibration or generate any real target.**


## Stage 1 post hoc diagnostics available after this draft

The operator-requested v1 K3 supplement has been completed on the original 200 synthetic K3 series without changing v1's constants or source.

- Raw-cast P1 detection: **197/200 (98.5%)**, mean target rank **25.2039**.
- C at step 0 (immediately after v1 orientation): **64/200 (32%)**, mean target rank **30.1602**.
- C after 30 steps (from archived frozen K3 output): **11/200 (5.5%)**, mean target rank **32.3465**.
- Difference in mean target rank C30 minus C0: **+2.1863** positions (worse at step 30).

Provenance: [Stage 1 K3 supplementary result](../diagnostics-v1/fast-output/FAST_K3_REPORT.md) and [per-series records](../diagnostics-v1/fast-output/FAST_K3_RESULTS.json).

**Interpretation:** A synthetic planted channel is present in the cast, partly represented in the initial orientation, and substantially less detectable after 30 developmental steps. Importantly, K3's planted line is made **nonmoving**, so the original v1 entry pathway never wrote that planted line as one of its moving-line PFM events. This distinguishes loss at history encoding from loss during subsequent development; their relative contributions still require a prospective factorial design.

These post hoc observations motivate but **must not determine** v2 development-window selection or acceptance thresholds. The v2 selection objective, candidate windows and dedicated design seeds must be finalized before design runs. V1 K3/K4 verdicts remain FAILED; registration CLOSED.
