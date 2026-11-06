# AG-1 / RC-1 / CD-1 calibration: results, 6 November 2026

**Registrations.** They were committed in `2d874660` before these runs.

**Data.**
- **AG-1 and RC-1.** World data first seen 2026-11-04 01:00 to 2026-11-06 12:00 UTC, which were already seen. That is 59 simulated hourly epochs.
- **CD-1.** Clean and planted SHA-256-counter streams.

## AG-1: **PASSES**
| Condition | p ≤ 0.05 rate | Required |
|---|---|---|
| Null (1,000 assignments) | **0.047** | ≤ 0.07 |
| World answers APPLY epochs, f = 0.05 (200) | 0.925 | reported |
| World answers APPLY epochs, f = 0.10 (200) | **1.000** | ≥ 0.8 |

## RC-1: **FAILS. Its world result will be reported as uncalibrated, not decisive**
| Check | Result | Required |
|---|---|---|
| Distinct zPre sequences among 100 candidates | **40** | ≥ 50 |
| Null rate | 0.05 | ≤ 0.06 |
| Planted f = 0.10, live 11 / 47 / 83 | p = 0.05 / 0.62 / 0.27 (1 of 3) | ≥ 2 of 3 |
| Planted f = 0.05, live 11 / 47 / 83 | p = 0.12 / 0.16 / 0.58 | reported |

**Cause.** The candidate Amelias largely synchronise on the same data. A world that answers the live candidate is equally answered by every candidate standing in the same zone, so the live one cannot stand out: its A_live exceeds the yoked mean by only 0.001–0.010.

**Fix.** A retrocausality test needs a design in which the live Amelia's state is not shared by identical Amelias. That will be a new registration, RC-2.

## CD-1: **FAILS. Its world result will be reported as uncalibrated, not decisive**
| Condition | SubCrypt 2 ↔ 7 (units through; K = 2) | BarkerLoop 3 ↔ 6 |
|---|---|---|
| 10 clean streams | 0 false positives | 0 false positives |
| Planted 2727, 5% | **STRUCTURED** (2) | not structured |
| Planted 3636, 5% | not structured | **not structured** (0) |
| Planted 2% | not structured | not structured |

**Cause.** 3 ↔ 6 is the Warp's own shuttle. She already passes along it so often that planting its order adds nothing over the shuffles (a ceiling). 2 ↔ 7 is detectable, but only at the threshold.

**Fix.** A redesign (CD-2) should measure syzygy readings at their **entry**, the step on which the world's number moves her onto the syzygy, rather than raw passage counts.

**No changes were made after these calibrations. The live study (AG-1, with RC-1 computed alongside) and the CD-1 world test are sealed as registered.**
