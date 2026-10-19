# OUTSIDE-3 Stage 1 v1 K3 supplementary diagnostics

Post-calibration explanation only. Predeclared K3 and K4 failures are unchanged; NO RETUNING. No real target generated; registration remains closed.

## Same original 200 K3 synthetic series
Exactly the original planted casts, target draws and PRNG streams were used. Every recomputed C step-30 p-value and rejection flag was checked against the archived original K3 observations.

| Arm/readout | Rejections / 200 | Rate | Mean target mid-rank |
|---|---:|---:|---:|
| Raw | 197/200 | 0.9850 | 25.2039 |
| CStep0 | 64/200 | 0.3200 | 30.1602 |
| CStep30 | 11/200 | 0.0550 | 32.3465 |

Step 0 means immediately after v1 cast entry but before endogenous development. V1 moving-line event append does not immediately update zone activations, so its step-0 ranking is calculated from the exact initial polarity orientation and the frozen six reference activations. C step 30 is the original carried-memory output.

Mean absolute all-64-rank change from step 0 to 30: 10.362443 ordinary rank units.
Mean target rank shift (step 30 minus step 0; positive = deterioration): 2.186307 ordinary rank units.
Working-level comparisons with step 0 better: 9480 / 17,600; step 30 better: 7250 / 17,600.

## Constraints
The original floating-FFT v1 finite-support p-value calculation was reused for strict comparability. Diagnostic rates are post hoc; they do not substitute for preregistered thresholds or genuine hidden-target access. All 200 per-series values are archived in K3_DIAGNOSTIC_RESULTS.json; full working records are in the associated GitHub Actions artifacts.
V1 remains FAILED at K3 (5.5% vs required 25%) and K4 (20% C vs required 25%).

Frozen v1 constants SHA-256: f665aa922234d594b76193dc50e4699162987f21e8a190c4c7645d32f0940c5c
Shard input SHA-256: e4b1ececd8ccd76df45bb67dcf5ed08f35ada1f2c7579f64daf57f5cc55bbfab / 3856609ac87a2ff06b63ba3f31ab36756c90622095bcdd5b320be0e057af55cf

**Decision: v1 FAILED; future v2 work requires independent design and calibration.**
