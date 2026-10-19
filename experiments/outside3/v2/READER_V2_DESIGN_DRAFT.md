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

### Option A: injective resulting-polarity memory encoding (operator directive)

**Primary input polarity means the resulting hexagram, not the primary cast.** Each original line is encoded bottom-to-top with one mandatory polarity event at z(i) for the **resulting** polarity. Every old/moving line additionally inserts a distinct \`CAST_MOVEMENT\` event at its own z(i). Six base events plus 0–6 movement events jointly encode both the resulting hexagram and movement mask; the primary is recovered by XOR. **Raw continues to rank the resulting hexagram.**

| Original value | Primary polarity | Resulting PFM polarity at z(i) | Additional PFM event |
|---|---|---|---|
| 6 (old yin) | yin | \`CAST_POLARITY_YANG\` (\`m_yang\`) | \`CAST_MOVEMENT\` (\`m_move\`) |
| 7 (young yang) | yang | \`CAST_POLARITY_YANG\` (\`m_yang\`) | none |
| 8 (young yin) | yin | \`CAST_POLARITY_YIN\` (\`m_yin\`) | none |
| 9 (old yang) | yang | \`CAST_POLARITY_YIN\` (\`m_yin\`) | \`CAST_MOVEMENT\` (\`m_move\`) |

The complement-zone yin encoding is rejected as non-injective. Line-specific and chronologically ordered event descriptors retain original cast value, original and resulting polarity, moving flag and event type for replay, while the *nonnegative PFM flux magnitudes* must independently preserve causal differentiation. Magnitudes \`m_yin\`, \`m_yang\`, \`m_move\`, coherence and relaxation are **not yet selected or frozen**; neither unique metadata nor injectivity in fresh PFM suffices to pass the carried-history margin requirement. The numerical magnitudes require distinct positive effective levels, no clamping alias under 88-working histories and export/import parity. Do not introduce signed negative flux without an independent substrate-change commit before design runs.

**Before design runs**, enumerate all **64 resulting hexagrams × 64 movement masks = 4,096 casts**, verify unique canonical PFM event streams, distinct freshly updated PFM readouts, explicit old-line reversal (6→yang, 9→yin), all 64 nonmoving hexagrams, and all movement masks. Test each candidate magnitude's dynamical distinguishability under carried/saturated histories separately.


**Arm M order is mandatory:** copy C's identical pre-working zones, phases, gates, Governor and traits; **reset PFM before inserting six resulting-polarity base cast events and the optional extra movement events**, then execute autonomous development. Never reset M after cast entry or within the observation window. C carries its own PFM; G carries its separate graph/history; all three receive the same event stream (and Raw receives the resulting hexagram only).

**Present orientation:** do not directly overwrite activations in the v2 primary reader. Casts enter through PFM, not a parallel transient orientation channel.

## Pre-selection margin / saturation feasibility (before any parameter-selection runs)

The pre-freeze diagnostic reports the **smallest standardized readout difference between hexagrams one line apart**, both with fresh PFM and through synthetic **88-working carried-memory** trajectories, before choosing candidate magnitudes. The reference \`mu_z\`, \`sigma_z\` are **design-only** synthetic estimates, *not* frozen calibration references; freeze the final reference corpus only after choosing a window.

For final standardized activations \`a_i=(activation[z(i)]-mu_i)/sigma_i\` and linear hexagram score \`S(h)=sum_i (2*bit_i(h)-1)*a_i\`, report:

1. **Within-output Hamming-1 score margin:** for each recorded readout, enumerate all **192 undirected Hamming-1 hexagram edges** and compute \`min_(h,i) |S(h)-S(h xor 2^i)| = 2*min_i |a_i|\`. Report zeros, ties and minima, not just averages. This is *ranking margin* and may be small even if the encoder is injective.
2. **Between-input response margin:** from the identical pre-working state, encode two casts with the same movement mask and resulting hexagrams differing at exactly one line; develop both under identical conditions and record the standardized activation-vector distance \`max_i |a_i(A)-a_i(B)|\` and \`|a_changed_zone(A)-a_changed_zone(B)|\`. Take the minimum over every one-line pair and tested history. A merely different input digest does not count.

Include all six individual \`sigma_z\`, the observed synthetic output/readout variability (standard deviations and robust dispersion), and a **minimum margin-to-variability ratio** with its denominator explicitly shown. Check fresh memory, workings **1, 10, 44 and 88**, and a declared saturated PFM fixture. Carry the same synthetic history into each fork; do not reinitialize midway. Record worst cases and any zero separation. The numeric meaning of *clearly above variability* (\`TO_DESIGN\` margin factor) must be defined **before parameter-grid selection** and cannot be relaxed after seeing candidate results; if the entire parameter grid fails, return to design review.

## Architecture B: prospective development-window choice

**The number of unguided steps is not 30 by default.** Before K1–K5 calibration, conduct design-only runs at predetermined candidate windows, proposed \`[0, 1, 3, 5, 10, 15, 20, 30, 45, 60]\`. Step 0 is a diagnostic baseline, not an automatically eligible production readout if it fails to develop any memory.

**Design-only signal plants are explicitly permitted** for selecting the development window and motivating prospective K3/other thresholds, provided that *every design-seed stream (casts, targets, plant-location RNG and conditioning histories) is disjoint from every reference and K1–K5/curve calibration stream*. Publish the complete distinct seed namespaces and all design runs, including candidates that fail. Plant outcomes on K3 calibration seeds, even accidentally reused seeds, must NEVER be used for window selection, threshold adjustment, or late readout decisions.

**Design-only planted signals are permitted to support window selection and prospective threshold rationale.** They must use seeds (including casts, target draws, line positions, reference runs and carried histories) strictly disjoint from ALL K1–K5 calibration and curve seeds. Publish the designated design-seed and held-out calibration-seed namespaces before any design-run execution. No calibration data may enter tuning. 

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
| **K3 — DECISIVE** | 200 paired 88-working synthetic series with an identical target-planted nonmoving line per cast. Apply the exact-integer P1 test to C and Raw using the same planted series. **Raw ≥0.90 (≥180/200); C ≥0.25 (≥50/200); C ≥0.50×Raw (`2*C_hits >= Raw_hits`)**. All three are compulsory, fixed **before parameter selection**. Failure of any condition is a hard NO-GO regardless of other gates. |
| **K4** | 200 synthetic 88-working series with target-yang line PFM plants in C before cast, not in M; separate C detection minimum, M false-positive ceiling, and matched comparisons fixed prospectively |
| **K5** | Full 88-working synthetic series, one historical perturbation applied at W1, matched later inputs, C–M divergence; pre-frozen meaningful rank survival threshold at W10/W44/W88, not merely nonzero |

**Descriptive curve:** 200 synthetic 88-working series at **each** planted-working fraction \`0.10, 0.20, 0.30, 0.45, 0.60\`, with fraction sampled independently for each working, and all raw results retained. This is descriptive and not a calibration tuning source.

**Operator-fixed K3 thresholds, effective before parameter selection:** \`Raw_hits >=180\`, \`C_hits >=50\`, and \`2*C_hits >= Raw_hits\`, all on the same **200** synthetic planted series with exact-integer P1 p ≤0.05. Use integer pass counts to avoid floating threshold ambiguity. No threshold may be revised after seeing any subsequent design or calibration data. K3 is the decisive gate; raw plant sensitivity is an independent requirement, not a zero-denominator bypass.

## Gate, audit and no-peeking boundaries

1. Accept this design draft for implementation; assign a unique v2 reader source digest. Do not edit v1 reader, design outputs, original K shards or original failure report.
2. Complete the **post hoc v1 supplemental diagnostics** on original K3 seeds first; they are explanatory only and cannot revise v1's K3 failure.
3. Implement and unit-test v2 entry, scoring and exact-integer null software with synthetic data only.
4. Commit any necessary substrate changes in their own hash-addressed commit **before** design runs. Prefer no substrate changes.
5. Run design-only selection and freeze **all** v2 constants, \`mu\`, \`sigma\`, event weights, development window, graph rewiring, null implementation SHA-256, unique synthetic seeds, decision thresholds, and logging methods.
6. Only then run v2 K1–K5 and the five 200-series descriptive-curve cohorts. Execute and archive all outcomes, including failures; do not stop early and do not retune within v2.
7. Produce \`v2/STAGE_REPORT.md\`, exact source/parameter manifests, K1 per-hexagram tables, per-series p-value numerator/denominator, replay hashes, failed thresholds and provenance.
8. Operator + independent reviewer acceptance is required **before** any registration of a future OUTSIDE-3 real-target experiment.

**Current authorization:** update and exhaustively unit-test Option A, complete a pre-selection fresh/carried 88-working saturation-margin diagnostic, then run separately declared parameter-selection DESIGN experiments if the diagnostic is adequate. NO v2 K1–K5 calibration, real targets, or registration.


## Operator amendments before any v2 freeze — 19 October 2026

This amendment rejects non-injective complementary-zone encoding, mandates all-six-line base PFM entry with causally distinct polarity magnitudes and extra movement events, specifies **M reset → cast entry → development**, permits synthetic design-seed plants strictly separate from calibration, and proposes paired **K3 C/Raw ≥ 0.50** plus predesign absolute floor and raw sensitivity requirements. No constants or thresholds have been retrospectively reselected; the reader and tests must pass before the next design stage.

## Stage 1 post hoc diagnostics available after this draft

The operator-requested v1 K3 supplement has been completed on the original 200 synthetic K3 series without changing v1's constants or source.

- Raw-cast P1 detection: **197/200 (98.5%)**, mean target rank **25.2039**.
- C at step 0 (immediately after v1 orientation): **64/200 (32%)**, mean target rank **30.1602**.
- C after 30 steps (from archived frozen K3 output): **11/200 (5.5%)**, mean target rank **32.3465**.
- Difference in mean target rank C30 minus C0: **+2.1863** positions (worse at step 30).

Provenance: [Stage 1 K3 supplementary result](../diagnostics-v1/fast-output/FAST_K3_REPORT.md) and [per-series records](../diagnostics-v1/fast-output/FAST_K3_RESULTS.json).

**Interpretation:** A synthetic planted channel is present in the cast, partly represented in the initial orientation, and substantially less detectable after 30 developmental steps. Importantly, K3's planted line is made **nonmoving**, so the original v1 entry pathway never wrote that planted line as one of its moving-line PFM events. This distinguishes loss at history encoding from loss during subsequent development; their relative contributions still require a prospective factorial design.

These post hoc observations motivate but **must not determine** v2 development-window selection or acceptance thresholds. The v2 selection objective, candidate windows and dedicated design seeds must be finalized before design runs. V1 K3/K4 verdicts remain FAILED; registration CLOSED.


## Pre-selection amendment dated 19 October 2026

Movement direction Option A, fixed K3 thresholds (Raw 0.90, C 0.25 and C ≥ 0.50×Raw), and pre-freeze Hamming-1 standardized readout-margin requirements were accepted by the operator before parameter selection. This document is still **a design draft, not a registration**.
