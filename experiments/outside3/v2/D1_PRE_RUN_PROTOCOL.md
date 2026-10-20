# OUTSIDE-3 v2 D1: prospective design-only protocol (20 October 2026)

**Status: committed before D1 execution. No calibration, no real targets, no registration.** D0's 0/18 result and the original v1 failures remain immutable.

## Retirement of the D0 2σ worst-case eligibility rule
The minimum standardized changed-zone margin remains a **descriptive diagnostic** but is no longer an eligibility threshold. Standardization by the standard deviation across different *input casts* conflates natural input variation with noise. A minimum over 192 Hamming-one edges, six historical checkpoints, and movement masks is an extreme statistic; requiring every effect to exceed 2 population standard deviations of the same input-varying ensemble can systematically exclude even deterministic, discriminating encoders. The D0 result is not retroactively reclassified. No post-hoc 2σ relaxation is permitted within D0; this is a newly versioned D1 design objective committed before D1 runs.

## D1 candidates and fixed choices
Readouts: **ACTIVATION** = six final zone activations; **PFM_STRAIN** = six final `runtime.getMemory().exportState().zoneStrainHistory[z]` values. Both use per-zone population mean and positive population sigma from fresh synthetic reference casts with the same encoder, magnitudes and development window. Six zones, in bottom-to-top line order: 1,2,4,8,7,5. Scores `S(h)=Σ_i (2bit_i(h)-1)*(value_i-mu_i)/sigma_i`; ties get doubled integer mid-ranks. Never use event metadata, target, plant status or raw-cast ranks to construct C's scores.

Option A: each resulting-polarity line contributes one PFM event, each moving line an additional distinguishable event; M resets PFM before inserting cast events. Fixed D1 magnitude fixture is D0A (yin .008, yang .040, movement .012, coherence .95, relaxation .025). This fixture is a **design candidate**, not a frozen reader parameter. Development windows: **0,1,3,10,30**. **Window 0 is strictly diagnostic-only and is never an eligible or selectable candidate**, regardless of its sensitivity or memory readout. Selection requires **at least one full autonomous substrate step** (windows 1, 3, 10, 30). Fresh 88-working C histories for each independent synthetic series, no target feedback.

## Design-seed sensitivity and selection
200 paired synthetic 88-working series for each window. Plant one *nonmoving resulting-hexagram line* to match a synthetic independent target in every working, on both C and Raw. Use identical casts, target indices and plant positions across readouts and windows. The other five cast lines are unaltered. Per-series P1 is the **exact conditional integer-frequency convolution** of the 64 doubled mid-ranks for each sealed ranking, with one-sided lower-tail probability at or below 1/20. Count detections out of 200. Raw arm is the unchanged resulting-hexagram agreement ranking.

**Conditional design selection:** among candidates that pass the predeclared C–Raw and C–M contribution floors below and have at least one autonomous step, maximize arm C's K3-type detection count on the 200 paired **design** series. Tie: maximize C/Raw rejection-rate ratio (only when Raw has nonzero detections); then minimize C mean target doubled rank; then prefer a shorter nonzero development window; then prefer PFM_STRAIN over ACTIVATION; then lexical candidate ID. Report all candidates, including ineligible and failing ones. D1 can nominate a candidate for later independent review and freezing, **not** constitute K3 calibration.

## Substrate-contribution eligibility — fixed before D1 execution

K3 rewards **preserving planted information**; the scientific added-value question P2 asks whether the substrate contributes beyond the raw cast. Optimizing K3 alone could select an essentially raw-copying reader. Accordingly **eligibility precedes maximizing sensitivity**. The candidate must have at least one autonomous step *and* differ observably from **both** the raw and memory-reset M arms, on the same matched 200 synthetic 88-working design series.

For each working, compare the complete arrays of 64 doubled integer mid-ranks and compute ordinary-rank mean absolute displacement, `D(A,B) = Σ_h |rank2_A[h] − rank2_B[h]| / (2×64)`. Average `D` across **all 17,600 workings**; separately count the fraction of workings whose arrays differ in at least one rank. Each candidate must meet **all four predeclared floors**:

- `mean_D(C,Raw) >= 1.00` ordinary rank position.
- `fraction_nonidentical(C,Raw) >= 0.10`.
- `mean_D(C,M) >= 0.50` ordinary rank position.
- `fraction_nonidentical(C,M) >= 0.10`.

Use the paired **full ranking arrays**, not just planted-target ranks, to prevent a candidate from appearing substantively different through small target-specific fluctuations. No exclusions or early stopping. These floors are engineering checks of nonidentity, **not P2 efficacy**: a different ranking may be worse than raw. The eventual prospective P2 test stays independent and unchanged. Failure of any floor means candidate **INELIGIBLE regardless of sensitivity**; do not lower the floors after results.

Arm M is constructed anew each working by copying C's exact pre-working present state (zones, traits, governor, gates, phases), then **resetting ProcessFieldMemory**, inserting the identical six resulting-polarity events and any movement events, and only then performing the selected autonomous steps. C carries PFM history across all 88 workings. Raw ranks agreement with the **resulting** hexagram.

## Frozen G rewiring engineering check

Once the design-stage selection rule identifies a candidate, check it with a *separate G engineering replay*, not an additional selection arm. Use the existing reproducible, degree-preserving `rewire` implementation in `experiments/outside3/reader.ts`, using the already frozen v1 `rewireSeed=2609` from `experiments/outside3/design-output/constants.frozen.json`. Record the resulting actual graph digest, swap count, full edge list, source graph digest and identical input-tape digest. Verify degree sequences, nonidentity with canonical graph, and **two identical replay runs** of 88 deterministic synthetic workings in both G and canonical C (no target content in either engine). Compare final state digests excluding wall-clock-only snapshot timestamps, readout ranks, PFM strain and zone activation under the *selected* readout and window. A G mismatch, failed replay, or graph-degree error blocks the proposed candidate's engineering acceptance. The frozen rewire may not be adjusted to improve sensitivity, and G does **not** enter D1 selection.

## Gates and seeds
Unchanged prospective K3 calibration gates, for 200 paired 88-working series: Raw hits >=180, C hits >=50, 2*C hits >=Raw hits. These thresholds are not modified by design sensitivity. Design seeds are `9601001 + series*1009` for casts/targets/plant positions; fresh reference seeds `9602001 + window*10000`; history and movement seeds are derived from the corresponding series seed, not from calibration streams. Reserved calibration seeds K1 9501001, K2 9502001, K3 9503001, K4 9504001, K5 9505001, curve 9506001 are prohibited in D1. No v1, D0, or D1 calibration streams are reused.

## Pre-run validity
Repeat all 4,096 injective cast signatures and unique fresh PFM state checks for D1 fixture. For both readouts, report Hamming-one *within-output* rank-score margins and *between-input* changed-zone margins at fresh and carried W1/W10/W44/W88 states. A zero sigma, nonfinite score, broken replay, noninjective PFM entry, or target-dependent reference is a hard engineering failure; do not select a candidate from incomplete evidence.

If exact convolution is computationally infeasible, report **INCOMPLETE** rather than silently substitute normal, Monte Carlo or asymptotic p-values. Do not generate a hidden target or activate a time lock.

## Operator amendment accepted 20 October 2026, 03:09 UTC

These nonzero-window, measurable C–Raw/C–M and fixed-G replay conditions were committed **before any D1 run**. All original v1 failures and D0 negative results remain unchanged. Neither D1 nor its G check opens registration or real targets.
