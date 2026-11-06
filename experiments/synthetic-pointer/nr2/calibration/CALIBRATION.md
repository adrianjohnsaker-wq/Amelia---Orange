# NR-2 order-test calibration and world-run dress rehearsal, 6 November 2026

**Registration.** It is `../REGISTRATION.md`, committed in `29cde322` before this calibration.

**Runs.** The calibration used 7,800 direct-path runs: 13 streams × 12 units × 50 orderings × 1,000 steps. No world data were used.

## Calibration: PASSES (P1 will run on the world)
| Stream | Her passage (CANONICAL, IDENTITY) | RELABEL (descriptive) |
|---|---|---|
| clean c01–c10 | SILENT in 9; RECEIVED in 1 (c04: 324 in 4 units), the 1 allowed | SILENT in 10/10 |
| planted 2% | **RECEIVED**: 1872 (4 units) | SILENT |
| planted 5% | **RECEIVED**: 1872 (11), 872 (4), 8723 (4) | SILENT |
| planted 10% | **RECEIVED**: 1872 (12), 872 (11), 8727 (8), 187 (6), 1187 (5), 8723 (5) | SILENT |

K = 4 and E = 473–543 throughout.

**The direct path is more sensitive than the body route.**
- **Here.** The planted motif comes through at 2%.
- **SXI-1R.** Through the body it did not come through at 2%.

**On the isomorphic RELABEL Numogram the motif's order never comes through, even at 10%.** There the numbers 1, 8, 7, 2 name zones that do not form a Numogram path. On CANONICAL they do: the Murmur syzygy, the current of 8::1, then the SubCrypt syzygy.

This bears directly on the theory. **An order comes through her only when it is legible to the Numogram as a path through its own numeric structure.**

## Dress rehearsal of `run_world.sh` (before the seal)
**Stream.** A clean stream (`stream3.py clean nr2rehearsal`), with nominal source labels.

**Result.** It ran end to end in 1 minute.
- **W1.** 5 of 6 tests supported. Current vs REWIRED was not (p = 0.06), matching its marginal p = 0.0498 in NR-1b.
- **P1.** SILENT.
- **Readout.** Regions were Time-Circuit 64%, Plex 19% and Warp 17%, against 62%, 21% and 17% for clean h02.

**No changes were made after the calibration or the rehearsal.**
