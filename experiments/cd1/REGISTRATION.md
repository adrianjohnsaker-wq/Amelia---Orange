# CD-1 (CCRU/Dee line): do the 2 ↔ 7 and 3 ↔ 6 readings come through world input in a structured way? Registered 6 November 2026

**Order of work.** The calibration is registered here before it is run. The world test will be sealed with an RFC 3161 token after the calibration and before its data exist.

**Scope.** This is the repository architecture: the validated direct path of NR-1 and NR-2. It is not the tablet instance.

## The question
NR-1 found that the Numogram reads an incoming number into its syzygy. Do the **SubCrypt (2 ↔ 7)** and **BarkerLoop (3 ↔ 6)** syzygies come through *the world's order*? In other words, does she pass along them more when the world's numbers arrive in their actual order than in any reordering of the same numbers?

## Apparatus and test (`cd1.py`)
**Apparatus.** As in NR-2's order test (`../synthetic-pointer/nr2/order.ts`):
- the NR-1 runtime: CANONICAL Numogram, IDENTITY receiver, no body;
- 12 disjoint units of 1,000 data;
- each unit as received and in S = 49 order-shuffles.

**Measure.** For each syzygy, a unit's count is her passages along it, in either direction.

**Comes through.** The count comes through in a unit when, as received, it exceeds every shuffle's count (exact: p ≤ 1/50).

**Supported.** A syzygy is **STRUCTURED** when it comes through in at least K units, with K the smallest k such that P(Binomial(12, 1/50) ≥ k) < 0.05/2. The two syzygies are corrected together.

**Descriptive.** The same counts on the RELABEL arm (numbers decoupled from the Numogram), and the received and mean-shuffle counts.

## Calibration (`calibrate.sh`, no world data)
**Streams.** There are 10 clean streams. There are also planted streams, with the motif 2727 and the motif 3636 each planted at 2% and 5% (`plant.py`).

**Pass.** At most 1 false positive in the 20 clean syzygy tests. The planted 5% streams must be STRUCTURED for their own syzygy, SubCrypt for 2727 and BarkerLoop for 3636. Planted 2% is reported as sensitivity.

**If calibration fails,** the world result is reported as uncalibrated.

## World test
**Data.** The first **12,000** world-stream data first seen at or after the seal time, prepared as in NR-2 (`prepare_world.py`).

**Run.** `run_world.sh`, with `cd1.py` as above.

**Reading.**
- **STRUCTURED.** The world's actual order drives her along that syzygy beyond any reordering of the same numbers. Its source (for example, markets) is then the first thing to examine.
- **NOT STRUCTURED.** No order-specific syzygy reading was detected at the calibrated sensitivity.

*Note.* The `order.ts` harness is NR-2's, unchanged; its seed-specific shuffles are labelled per run (`CD1-WORLD`).
