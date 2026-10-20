# OUTSIDE-3 v2 D1: prospective design-only protocol (20 October 2026)

**Status: committed before D1 execution. No calibration, no real targets, no registration.** D0's 0/18 result and the original v1 failures remain immutable.

## Retirement of the D0 2σ worst-case eligibility rule
The minimum standardized changed-zone margin remains a **descriptive diagnostic** but is no longer an eligibility threshold. Standardization by the standard deviation across different *input casts* conflates natural input variation with noise. A minimum over 192 Hamming-one edges, six historical checkpoints, and movement masks is an extreme statistic; requiring every effect to exceed 2 population standard deviations of the same input-varying ensemble can systematically exclude even deterministic, discriminating encoders. The D0 result is not retroactively reclassified. No post-hoc 2σ relaxation is permitted within D0; this is a newly versioned D1 design objective committed before D1 runs.

## D1 candidates and fixed choices
Readouts: **ACTIVATION** = six final zone activations; **PFM_STRAIN** = six final `runtime.getMemory().exportState().zoneStrainHistory[z]` values. Both use per-zone population mean and positive population sigma from fresh synthetic reference casts with the same encoder, magnitudes and development window. Six zones, in bottom-to-top line order: 1,2,4,8,7,5. Scores `S(h)=Σ_i (2bit_i(h)-1)*(value_i-mu_i)/sigma_i`; ties get doubled integer mid-ranks. Never use event metadata, target, plant status or raw-cast ranks to construct C's scores.

Option A: each resulting-polarity line contributes one PFM event, each moving line an additional distinguishable event; M resets PFM before inserting cast events. Fixed D1 magnitude fixture is D0A (yin .008, yang .040, movement .012, coherence .95, relaxation .025). This fixture is a **design candidate**, not a frozen reader parameter. Development windows: **0,1,3,10,30** (step zero is diagnostic and may only be selected if it demonstrably reads PFM). Fresh 88-working C histories for each independent synthetic series, no target feedback.

## Design-seed sensitivity and selection
200 paired synthetic 88-working series for each window. Plant one *nonmoving resulting-hexagram line* to match a synthetic independent target in every working, on both C and Raw. Use identical casts, target indices and plant positions across readouts and windows. The other five cast lines are unaltered. Per-series P1 is the **exact conditional integer-frequency convolution** of the 64 doubled mid-ranks for each sealed ranking, with one-sided lower-tail probability at or below 1/20. Count detections out of 200. Raw arm is the unchanged resulting-hexagram agreement ranking.

Primary design selection: maximize C's count of detected series. Tie: maximize C/Raw ratio (when Raw>0); then minimize mean target doubled rank; then prefer shorter development window; then prefer PFM_STRAIN over ACTIVATION; then lexical candidate ID. Report *all* candidate results including failures. D1 design results can nominate a candidate for later independent review and freezing, **not** constitute K3 calibration.

## Gates and seeds
Unchanged prospective K3 calibration gates, for 200 paired 88-working series: Raw hits >=180, C hits >=50, 2*C hits >=Raw hits. These thresholds are not modified by design sensitivity. Design seeds are `9601001 + series*1009` for casts/targets/plant positions; fresh reference seeds `9602001 + window*10000`; history and movement seeds are derived from the corresponding series seed, not from calibration streams. Reserved calibration seeds K1 9501001, K2 9502001, K3 9503001, K4 9504001, K5 9505001, curve 9506001 are prohibited in D1. No v1, D0, or D1 calibration streams are reused.

## Pre-run validity
Repeat all 4,096 injective cast signatures and unique fresh PFM state checks for D1 fixture. For both readouts, report Hamming-one *within-output* rank-score margins and *between-input* changed-zone margins at fresh and carried W1/W10/W44/W88 states. A zero sigma, nonfinite score, broken replay, noninjective PFM entry, or target-dependent reference is a hard engineering failure; do not select a candidate from incomplete evidence.

If exact convolution is computationally infeasible, report **INCOMPLETE** rather than silently substitute normal, Monte Carlo or asymptotic p-values. Do not generate a hidden target or activate a time lock.