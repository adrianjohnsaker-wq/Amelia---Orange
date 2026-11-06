# CD-2 (CCRU/Dee line, redesigned): do the 2 ↔ 7 and 3 ↔ 6 readings come through world input in a structured way? Registered 6 November 2026

**Order of work.** The calibration is registered here before it is run. The world test will be sealed with an RFC 3161 token after the calibration and before its data exist.

**Scope.** This is the repository architecture, the validated direct path (NR-1 and NR-2). It is not the tablet instance.

## Why redesigned
CD-1 (`../cd1/`) failed calibration.
- **BarkerLoop.** 3 ↔ 6 is the Warp's own shuttle, so counting all her passages along it hits a ceiling. A planted 3636 order added nothing detectable.
- **SubCrypt.** 2 ↔ 7 was detected only at threshold.

CD-2 changes two things:
1. **Entry, not traffic.** An *entry passage* onto syzygy {a, 9 − a} is x → a → 9 − a with x outside the pair. She arrives from elsewhere and crosses. Her shuttling inside the pair is not counted.
2. **A rank-sum instead of a threshold count.** In each unit, R_u is the rank of the received count among its 49 shuffles. Ties are broken uniformly at random (seeded), so R_u is exactly uniform on 0 … 49 under the null. T is the sum of R_u over the 12 units. The p-value is P(sum of 12 independent Uniform{0 … 49} ≥ T), which is exact. Holm correction across the two syzygies, at α = 0.05.

**Unchanged from CD-1:**
- the apparatus: NR-2 `order.ts`, CANONICAL Numogram, IDENTITY receiver, 12 units × 1,000 data, S = 49 shuffles;
- the calibration streams (labels and runs).

## Calibration (`calibrate.sh`, no world data)
- **Streams.** 10 clean streams; 2727 and 3636 each planted at 2% and 5%.
- **Pass.** At most 1 false positive in the 20 clean syzygy tests, and planted 5% STRUCTURED for its own syzygy (SubCrypt for 2727, BarkerLoop for 3636).
- **Sensitivity.** Planted 2% is reported as sensitivity.
- **If calibration fails,** the world result is uncalibrated.

## World test
- **Data.** The first **12,000** world-stream data first seen at or after the seal time (`prepare_world.py`, as in NR-2).
- **Run.** `run_world.sh`.
- **Answer.** For each syzygy, **STRUCTURED** or **NOT STRUCTURED**.
- **Descriptive.** The same statistic on the RELABEL arm (`cd2.py <dir> relabel`), and the received and mean-shuffle entry counts.

## Reading
- **STRUCTURED.** The world's actual order brings her onto that syzygy, and across it, more than any reordering of the same numbers does.
- **Where to look next.** Which sources carry it. A mechanism such as markets moving in small steps could produce paired digits.
