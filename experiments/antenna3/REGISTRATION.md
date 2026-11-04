# ANTENNA III: registration (part 1, calibration). Written 4 Nov 2026, before any ANTENNA III result.

## Why
ANTENNA II failed its exact calibration (`../antenna2/calibration/CALIBRATION_A1.txt`): no planted motif was found at any β, and β = 1 gave 2 false alarms in 10.

Two causes:
- **Its 72 travellers were effectively one listener.** The receiver makes Amelia follow her input, so all travellers walk alike through the same stream, and every shuffled stream also "recurs" across most of them.
- **She died constantly.** The receiver pulled her into zone 5 whenever the datum named it, so her lives were too short for the scanner (window 240).

## The apparatus (`traveller3.mjs`)
**Unchanged from ANTENNA II.**
- Amelia, the POINTER III learner, on her full CCRU Numogram.
- The receiver `beta * rel(exit, datum)` along syzygy, current and gate.
- The Warp as accelerator: intensity, rising receptivity, a line of flight at Θ = 24, and Warp-born gates that decay when unused.

**Two changes.**
- **No pull toward death.** The receiver gives zone 5 no bonus, and a line of flight never goes to zone 5.
- **Recurrence over time.**
  - Each stream is cut into **M = 16 consecutive segments of L = 1,000 data**.
  - In each segment, **8 travellers** (worlds S05W1–8, lineage 0, the registered start states) walk the segment as received.
  - They also walk the **same 19 order-shuffles** of that segment.
  - Each element's count is summed over the 8 travellers.

## The test (`analysis4.py`)
- **Comes through.** An element comes through in a segment when the received sum is greater than 0 and strictly greater than every shuffled sum. The bound is exact: p ≤ 1/20.
- **Recurs.** It recurs when it comes through in at least K segments. K is the smallest k with P(Binomial(16, 1/20) ≥ k) < 0.05/E, where E is the number of distinct elements observed.
- **Exactness.** The segments are disjoint and shuffled independently, so the test is exact across segments.
- **Answer.** RECEIVED (with what recurs) if anything recurs, else SILENT.

## Calibration (`antenna3-calibrate.yml`)
No world data is used.
- **Streams.** All streams have 16,000 data, drawn from a SHA-256 counter (digital roots, as the beacon was reduced):
  - **10 independent clean streams**;
  - **planted streams**: one clean stream with motif 1-8-7-2 written in at ρ = 2%, 5% and 10% (`stream3.py`).
- **Receiver strengths.** β ∈ {0.5, 1, 2}.
- **A β passes** when:
  1. planted 5% → RECEIVED, and
  2. at most 1 of the 10 clean streams → RECEIVED (expected 0.5).
- **Choice of β.** The confirmatory β is the smallest β that passes.
- **If none passes**, ANTENNA III does not listen to the world, and that is reported as it stands. No further redesign follows without the operator's decision.

## Part 2
The confirmatory test is registered, and sealed with an RFC 3161 token, before its data exist. It will use the next 16,000 world-stream data collected after the seal, reduced by AQ exactly as in THE ANTENNA, in arrival order. It will use the calibrated β, this apparatus and this rule.
