# NR-1b: confirmatory test of the lag-2 reading. Registered 6 November 2026, after NR-1 part 1 and before any NR-1b run.

## Why
NR-1's registered measure pooled lags 1–4, and on the held-out stream h01 it supported only gate vs REWIRED. The **descriptive** lag profile, seen after that result, shows where the reading sits.

| Lag | Arm | Identity | Syzygy | Current | Gate |
|---|---|---|---|---|---|
| 1 | CANONICAL | +0.204 | −0.051 | −0.023 | −0.032 |
| 2 | CANONICAL | −0.008 | +0.033 | +0.018 | +0.053 |
| 2 | RELABEL | +0.006 | +0.008 | +0.001 | −0.004 |
| 2 | REWIRED | +0.005 | +0.003 | +0.004 | −0.012 |

(Enrichment, IDENTITY receiver, mean over the 12 units of h01.)

At lag 1 she goes to the number itself. At lag 2 the canonical Numogram carries it into its gate, its syzygy and its current. Pooling lags 1–4 let lag 1 (where being at c means not being at its syzygy) cancel the lag-2 reading.

**This is exploratory, so it is confirmed here on fresh data with the statistic fixed in advance.**

## Test (`nr1b.py`)
- **Unchanged from NR-1:** the apparatus, arms, receiver (IDENTITY), units (12 × 1,000) and relations.
- **The statistic:** e_R at **lag 2 only**, using the enrichment of `analysis.py` (`enrich`, with 20 decoupling permutations).
- **The data:** a **new held-out clean stream, h02** (`stream3.py clean h02 12000`). It has not been generated before this registration.
- **The tests:** the 6 tests e_R(CANONICAL) − e_R(K), for R ∈ {syzygy, current, gate} and K ∈ {RELABEL, REWIRED}. Each is an exact two-sided sign-flip over the 12 units, with Holm correction at α = 0.05.
- **Calibration:** NR-1's calibration (positive control 10/10, null 2/30) carries over, since the apparatus is unchanged.
