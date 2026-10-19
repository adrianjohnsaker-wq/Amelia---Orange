# OUTSIDE-3 Stage 1 report — synthetic calibration

NO REAL TARGET GENERATED. NO REAL WORKING OPENED. REGISTRATION REMAINS CLOSED.

Run source SHA: 97af17f4c22946ace360e08ca7f747456e9cf9b5
Fixed design SHA-256: f665aa922234d594b76193dc50e4699162987f21e8a190c4c7645d32f0940c5c
Unchanged work order SHA-256: 1b1b0b74b385d607aa5a77a4462bf0809aadb6f26f2f8bd3f8170e4ead0a01ac

## A — Reader and four arms
All four arms receive identical six-line casts. C carries PFM, M resets only PFM once per working, G uses a fixed degree-preserving rewire, Raw ranks by resulting-hexagram agreement. Thirty unguided steps, 64 doubled mid-ranks. Reader replay smoke PASS: https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39301942640

## B — Time-lock gate
Time-lock gate status: PASS — synthetic Go/TS Quicknet crossover, ciphertext + secret-salt commitment evidence; see TLOCK_FEASIBILITY.md and run #39304200180.

## C — Pre-frozen constants
delta 0.14, magnitude 0.065, steps 30, reference seed 1337, rewiring seed 2609
Reference activation means: [0.2160841344612644,0.27781338905397546,0.05597947672792053,0.22778319060698127,0.14310166852963585,0.19797509195570645]
All thresholds were frozen before these K-checks:
{
  "K1": {
    "minDistinctCRankings": 2,
    "minNonzeroScoreVariance": 1e-10,
    "maximumTieFraction": 0.9
  },
  "K2": {
    "maxNullRejectionRate": 0.065,
    "series": 1000
  },
  "K3": {
    "minCDetectionRate": 0.25,
    "series": 200
  },
  "K4": {
    "minCDetectionRate": 0.25,
    "maxMDetectionRate": 0.065,
    "series": 200
  },
  "K5": {
    "minMeanRankDifference": 0.000001,
    "checkpoints": [
      10,
      44,
      88
    ]
  }
}

K1 automated status checks frozen diversity, tie rate and entropy only. Hexagram-specific rank-band balance is reported descriptively but has no frozen per-band tolerance; do not claim full K1 uniform coverage or approve registration solely from this PASS.

## K gate outcomes
| Gate | Verdict | Measurements |
|---|---|---|
| K1 | PASS | 10: 998 rankings; entropy 2.000; 20: 1000 rankings; entropy 2.000; 30: 999 rankings; entropy 2.000 |
| K2 | PASS | P1 rate 0.0630; P2 rate 0.0530; 1000 null series |
| K3 | FAIL | C detection 0.0550; 200 series |
| K4 | FAIL | C detection 0.2000; M detection 0.0550; 200 series |
| K5 | PASS | W10 difference 0.07813; W44 difference 0.03385; W88 difference 0.03776 |

## Descriptive share-of-workings signal plant
- proportion 0.1: 1/20 rejection, rate 0.0500
- proportion 0.2: 1/20 rejection, rate 0.0500
- proportion 0.3: 1/20 rejection, rate 0.0500
- proportion 0.45: 1/20 rejection, rate 0.0500
- proportion 0.6: 1/20 rejection, rate 0.0500

## Decision
At least one predeclared K-check FAILED. DO NOT RETUNE under this calibration.

Numerical null: each ranking supplies all 64 conditional doubled mid-rank scores; finite-support null convolution is evaluated using floating FFT. No Gaussian approximation. An independent exact arithmetic or numerical error-bound audit is required for registration.

This is a deterministic synthetic software calibration, not evidence of access to a hidden existing target.
Both operator and reviewer must accept a completed B gate and Stage 1 report before any registration.
