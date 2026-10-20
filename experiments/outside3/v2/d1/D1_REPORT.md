# OUTSIDE-3 reader v2 — D1 synthetic sensitivity design report

> DESIGN ONLY. Not a calibration, parameter freeze, hidden-target trial or registration.

Design manifest SHA-256: e5568cb5cbf5c1c8390024be58a76b776ccf89b2ae70f271ce41f98ac97f297c.
Conditions: 36 (six magnitudes × three windows × two parallel readouts). Each option uses 24 shared 88-working selection-design series and 12 disjoint held-out design series.

## Precommitted design preference (not frozen)

**D0B / 1 steps / PFM_STRAIN** is the highest-scoring design-only option under the published lexicographic objective.
Primary count C: 6/24; paired Raw: 24/24.
Held-out (not used to select): C 0/12, paired Raw 12/12.

## All options, including weak and negative results

| Candidate | Window | Readout | C detections / 24 | Raw / 24 | C mean target rank | Held-out C / 12 | Worst descriptive Hamming-1 input margin (σ) |
|---|---:|---|---:|---:|---:|---:|---:|
| D0B | 1 | PFM_STRAIN | 6/24 | 24/24 | 31.4171 | 0/12 | 0.00000 |
| D0F | 1 | PFM_STRAIN | 6/24 | 24/24 | 31.4247 | 0/12 | 0.00000 |
| D0F | 3 | PFM_STRAIN | 6/24 | 24/24 | 31.5592 | 2/12 | 0.00000 |
| D0F | 10 | PFM_STRAIN | 6/24 | 24/24 | 31.8802 | 1/12 | 0.00000 |
| D0B | 3 | PFM_STRAIN | 5/24 | 24/24 | 31.5047 | 1/12 | 0.00000 |
| D0C | 3 | PFM_STRAIN | 5/24 | 24/24 | 31.6354 | 1/12 | 0.00000 |
| D0B | 10 | PFM_STRAIN | 5/24 | 24/24 | 31.8007 | 0/12 | 0.00000 |
| D0A | 1 | PFM_STRAIN | 4/24 | 24/24 | 31.6089 | 0/12 | 0.00000 |
| D0F | 10 | ACTIVATION | 4/24 | 24/24 | 31.6146 | 0/12 | 0.937430 |
| D0C | 1 | PFM_STRAIN | 4/24 | 24/24 | 31.6269 | 0/12 | 0.00000 |
| D0A | 3 | PFM_STRAIN | 4/24 | 24/24 | 31.6705 | 0/12 | 0.00000 |
| D0C | 10 | PFM_STRAIN | 4/24 | 24/24 | 31.8878 | 0/12 | 0.00000 |
| D0D | 1 | PFM_STRAIN | 4/24 | 24/24 | 31.9441 | 0/12 | 0.00000 |
| D0E | 1 | PFM_STRAIN | 4/24 | 24/24 | 31.9848 | 0/12 | 0.00000 |
| D0D | 10 | PFM_STRAIN | 4/24 | 24/24 | 31.9948 | 0/12 | 0.00000 |
| D0E | 10 | PFM_STRAIN | 4/24 | 24/24 | 32.0455 | 0/12 | 0.00000 |
| D0C | 10 | ACTIVATION | 3/24 | 24/24 | 31.6761 | 0/12 | 0.937327 |
| D0E | 10 | ACTIVATION | 3/24 | 24/24 | 31.7150 | 0/12 | 0.929784 |
| D0D | 10 | ACTIVATION | 3/24 | 24/24 | 31.7211 | 0/12 | 0.925975 |
| D0A | 10 | PFM_STRAIN | 3/24 | 24/24 | 31.9020 | 0/12 | 0.00000 |
| D0E | 3 | PFM_STRAIN | 3/24 | 24/24 | 32.0417 | 0/12 | 0.00000 |
| D0F | 3 | ACTIVATION | 2/24 | 24/24 | 31.7178 | 2/12 | 0.925561 |
| D0B | 10 | ACTIVATION | 2/24 | 24/24 | 31.7348 | 0/12 | 0.992394 |
| D0A | 10 | ACTIVATION | 2/24 | 24/24 | 31.7822 | 0/12 | 0.961728 |
| D0E | 3 | ACTIVATION | 2/24 | 24/24 | 31.8613 | 2/12 | 0.917839 |
| D0D | 3 | ACTIVATION | 2/24 | 24/24 | 31.9384 | 1/12 | 0.916311 |
| D0C | 3 | ACTIVATION | 2/24 | 24/24 | 31.9512 | 0/12 | 0.917675 |
| D0D | 3 | PFM_STRAIN | 2/24 | 24/24 | 32.0128 | 0/12 | 0.00000 |
| D0B | 3 | ACTIVATION | 2/24 | 24/24 | 32.0294 | 0/12 | 0.946302 |
| D0A | 3 | ACTIVATION | 2/24 | 24/24 | 32.1165 | 0/12 | 0.936527 |
| D0F | 1 | ACTIVATION | 1/24 | 24/24 | 32.1525 | 2/12 | 0.934582 |
| D0E | 1 | ACTIVATION | 0/24 | 24/24 | 32.2969 | 1/12 | 0.915089 |
| D0D | 1 | ACTIVATION | 0/24 | 24/24 | 32.4361 | 1/12 | 0.908640 |
| D0C | 1 | ACTIVATION | 0/24 | 24/24 | 32.5213 | 0/12 | 0.930876 |
| D0B | 1 | ACTIVATION | 0/24 | 24/24 | 32.5710 | 0/12 | 1.12853 |
| D0A | 1 | ACTIVATION | 0/24 | 24/24 | 32.6723 | 0/12 | 1.15952 |

## Scientific interpretation

The original D0 ≥2σ worst-case criterion is retired as D1 eligibility by a prior committed design rationale. Both within-output Hamming-1 score margin and between-input standardized feature margin remain in the per-condition evidence as descriptive measurements, including zero or saturated responses.
The planted target is synthetic and intentionally leaked into one cast line by the design generator; success is apparatus sensitivity, never hidden target access.
All p-value decisions are exact integer-frequency BigInt finite-null calculations. Numerator and denominator appear per series; decisions do not depend on floating display rounding.
The raw comparator remains the resulting hexagram. C carries PFM through each 88-working series. Activation and PFM strain are alternate readouts of the same state trajectory, not separate dynamical arms.
Held-out DESIGN values were reported only after selection was calculated from the selection cohort; they cannot change the selection.
Later K3 calibration gates remain Raw≥180/200, C≥50/200, 2*C≥Raw. None have been evaluated here. Earlier v1 K3/K4 failures and the D0 negative design result remain unchanged.

## Evidentiary limits

Only six D0 magnitudes and three windows were considered. Pairwise margins used fresh and W88 histories and movement masks 0 and 21, not every possible long-historical state. A design-preferred option is not eligible for real-target use until independent review accepts a new freeze and the complete K1–K5 calibration passes.
No real target generated. Registration closed.
