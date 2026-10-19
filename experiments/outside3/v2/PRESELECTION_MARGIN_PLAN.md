# OUTSIDE-3 v2 — pre-selection margin feasibility plan (synthetic only)

**Status:** Design-only feasibility, BEFORE magnitude/window parameter-selection comparisons. Not v2 calibration, not registration. Original v1 failed K3/K4 untouched.

## Immutable measurement definitions

- Encoder: Option A, six resulting-polarity events at zones [1,2,4,8,7,5], plus adjacent separate events for the movement mask.
- Evaluate **all 192 undirected Hamming-1 edges** of 64 resulting hexagrams (for each fixed mask).
- Masks: 0 (none moving) and 21 (three moving lines). This is a diagnostic sample of movement masks; full 4,096 coverage is checked separately.
- Entry is PFM-only, using existing nonnegative flux; no transient zone activation overwrite.
- Test at development windows **1 and 10** steps (diagnostic depths only, neither selected).
- Use **unit-test fixtures**, NOT selected constants: yin 0.011, yang 0.031, movement 0.008, phase coherence 0.95, strain relaxation 0.025.
- At each of fresh canonical memory; W1, W10, W44, W88 from one deterministic 88-working carried synthetic history (ten steps per working, independent of any future chosen window); and one declared saturated-history fixture.
- History generator: Mulberry32, namespace 9201001. Reference generator: Mulberry32, namespace 9202001; no overlap with v1 or future v2 K seeds.
- Reference: 192 independent synthetic six-line casts from a fresh canonical state at each diagnostic window. Estimate per-zone reference mean and **population** standard deviation. `sigma_z` must be >0; no sigma floor may be introduced after outputs are seen.
- For every Hamming-1 pair, run both casts on clones of the **same** pre-working state, changing exactly one resulting line and holding movement mask fixed.
- **Within-readout margin:** for every produced six-zone standardized activation vector a, compute `min_(h,i)|S(h)-S(h XOR 2^i)|=2*min_i|a_i|`; retain the global minimum and zero counts.
- **Input-response margin:** for each matched one-line cast pair, compute `abs(a_changed(A)-a_changed(B))`, and `max_i abs(a_i(A)-a_i(B))`. Retain minima across *all* checked pairs, especially at W88 and saturated fixture.
- Reference variability: population sigma per raw zone; in standardized readout the reference distribution has SD exactly 1 per zone (up to rounding). Margin-to-variability ratio is the minimum changed-zone response difference in standardized units divided by 1. **This is natural input-driven spread, not instrument noise or stochastic uncertainty.**
- Candidate-selection gate proposed and fixed **before parameter selection**: minimum standardized *changed-zone response margin* across fresh, W1/W10/W44/W88 and saturated fixture **≥2.0 reference standard deviations**, at the chosen development window; in addition the within-readout score margin cannot be zero or numerically tied. If impossible for any candidate within a precommitted grid, report NO-GO without weakening the threshold. A reported variance collapse/zero also fails.
- Report per-group minimum, worst-case pair (resulting hexagram, changed line, mask), reference sigma/means, within-output and input-response margins, W88 and saturated states, and serialized evidence SHA-256.
- No live hidden target; all generated casts are synthetic and target-independent. No K1–K5 calibration, no reveal round, no registration.
- This diagnostic **does not choose** or freeze magnitudes/windows. A *separate* versioned design-run manifest with disjoint seeds and predefined selection objective must be committed before parameter-grid comparisons.

## K3 fixed thresholds (not subject to design tuning)

At 200 paired synthetic K3 series: `Raw_hits ≥ 180`, `C_hits ≥ 50`, `2*C_hits ≥ Raw_hits`, using exact integer-convolution P1; no interpretation if these are not all satisfied.
