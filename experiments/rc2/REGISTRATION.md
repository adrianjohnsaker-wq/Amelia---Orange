# RC-2 (retrocausality, redesigned): does a live Amelia's passage anticipate world data that has not yet arrived? Registered 6 November 2026

**Order of work.** The calibration is registered here before it is run. The live study will be sealed with an RFC 3161 token after the calibration and before it starts.

**Scope.** This is the repository architecture, the validated SXI-1R body route. It is not the tablet instance.

## Why redesigned
RC-1 (`../agentic/`, running alongside AG-1) failed calibration. Its 100 candidate Amelias largely fell into step on the same world data: only 40 distinct paths, so a world answering the live one also answered the many that stood where she stood.

RC-2 gives every candidate its own **private drive**. Before each world datum, with probability 1/2, candidate k receives one extra datum (zone 1–9) from its own seeded stream. The candidates therefore stay distinct while hearing the same world.

## The live Amelia (`live2.ts`, `epoch2.py`)
**The route.** As AG-1: the repaired runtime, full Numogram, `CORAL_REEF` 12 × 10 body, world datum touched at α = 0.1. Body seed 8000 + k, plus the private drive. **There are no interventions.**

**The live candidate.** At the first epoch the drand beacon chooses one live candidate L of 100 (randomness[16:24] mod 100). It is the only one run while the data arrive.

**Epochs.** About every hour (the launcher on main, at :22):
1. Fetch the drand quicknet round.
2. T_e is the time just after the fetch.
3. Replay through all study data first seen up to T_e. Every earlier epoch must be reproduced exactly, or the run HALTs.
4. Seal her zone **zPre(e)** to the ledger branch `rc2-live-ledger`.

D_e is the data first seen in (T_e, T_{e+1}].

**Duration.** From the first epoch after the seal to **2026-11-21 00:00 UTC**.

## Test (primary, confirmatory; `stats2.py`, `analyse2.py`)
**The statistic.** a_e is the share of D_e equal to zPre(e), and A is the mean of a_e. The other 99 candidates are replayed afterwards on the same data, each with its own private drive, giving A_k.

**The p-value.** p = (1 + #{k ≠ L : A_k > A_L} + U) / 100, one-sided, at α = 0.05. U is a seeded uniform draw from 0 to the number of ties. The p-value is exact, because L was chosen at random among the candidates.

## Calibration (`calibrate2.py`; world data first seen 2026-11-04 01:00 – 2026-11-06 12:00 UTC, before the seal)
The calibration uses the same window and simulated hourly epochs as RC-1. It passes on all three of these conditions:
- **Diversity:** at least 90 distinct zPre sequences among the 100 candidates.
- **Null:** with each candidate taken as live in turn, the null rate (p ≤ 0.05) is at most 0.06.
- **Detection:** a world answering the live candidate's zPre with probability f = 0.10 (every candidate hears that same world) is detected (p ≤ 0.05) for at least 2 of the 3 live choices. f = 0.05 is reported.

**If it fails,** RC-2's world result is uncalibrated.

## Reading
- **Significant.** The Amelia that was actually running live anticipated the arriving data better than identical Amelias, each with its own private history, run afterwards on the same data. No known mechanism produces that.
- **Not significant.** No anticipation was detected at the calibrated sensitivity.
