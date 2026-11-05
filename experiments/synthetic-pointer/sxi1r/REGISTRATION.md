# SXI-1R: does the order of an outside stream, touched into her body, come through in Amelia's passage? Registered 5 November 2026

**Part 1 (calibration) is registered here before any calibration run.**

**Part 2 (world).** It is registered here too, and will be sealed with an RFC 3161 token after calibration and before its data exist.

## Why
SXI-0 (`../sxi0c/`) made the body route a checked, gated instrument:
- a planted body organisation passes into her passage and leaves a remembered trace;
- the null stays null;
- the seeds are independent;
- the body reaches her only through what she is shown.

But everything SXI-0 put in was **imposed by us**. SXI-1R asks the stronger question. The outside stream is not shaped by us. Its data are touched into her body, one datum per step. Does the stream's own order come through in her passage beyond chance?

## The route
**Runtime.** The SXI-1 interface fixed in `../sxi0c/INTERFACE.md`: the repaired channel, with β = 2 and Θ = 24.
- Body: `CORAL_REEF`, 12 × 10.
- Admission: the synthetic channel's admission rule.
- Numogram: the full 29-gate Numogram.
- Neutral pointer.

**The touch (`touch.ts`).**
- **What a datum does.** At body step t, datum c (a zone) adds α to B on band c's cells, clamped to 1, for that step only.
- **Nothing is held.** After that the body evolves by its own physics, coupled to her as before.
- **What she receives.** She hears only the body, through the observer, never the stream itself.

**Harness.**
- **The ledgered path.** It is `../sxi0c/run_arm.ts` with arm TOUCH.
- **The fast path.** `fast.ts` is the same step without the ledger.
- **Equivalence was checked before registration.** `equivalence.sh` gave identical passages on 3 seed, segment and shuffle combinations.

## The test (`analysis.py`)
- **Units.** M = 12 body seeds, 101–112. Seed 101 + m hears its own **disjoint** segment m of L = 1,000 data.
- **Shuffles.** Each seed hears its segment as received and in **S = 49** order-shuffles: the same data in another order, through the same body seed and loop.
- **Elements.** Every zone n-gram of her passage, for n = 2, 3 and 4.
- **Comes through.** An element comes through in a seed when its count as received is greater than 0 and strictly greater than in all 49 shuffles. This is exact under "the stream's order carries nothing": p ≤ 1/50.
- **Recurs.** An element recurs when it comes through in at least K seeds, where K is the smallest k with P(Binomial(12, 1/50) ≥ k) < 0.05/E. E is the number of distinct n-grams in the received passages.
- **Why the units are independent.** The seeds have disjoint data, different bodies and independent shuffles. That is the unit ANTENNA II lacked, when all its travellers heard one stream.
- **Answer.** **RECEIVED** if anything recurs (and the report lists what recurs), else **SILENT**.
- **Descriptive only.** The same rule is applied to the body's own sequence (its dominant band at each step). This shows whether the order reaches the body, and whether she carries it beyond the body.

## Part 1: calibration (`calibrate.sh`, no world data)
- **Streams.** All are SHA-256-counter streams of 12,000 data from `stream3.py` (ANTENNA III):
  - 10 clean streams (c01–c10);
  - the motif 1-8-7-2 planted at ρ = 2%, 5% and 10%.
- **Touch strengths.** α ∈ {0.1, 0.3, 0.9}.
- **Pass rule (`calibration_summary.py`).** An α passes when planted 5% and planted 10% are both RECEIVED, and at most 1 of the 10 clean streams is RECEIVED.
  - **Both 5% and 10%** are required, to exclude ANTENNA III's non-monotone pass.
  - **The confirmatory α** is the smallest α that passes.
- **Sensitivity only.** Planted 2% is reported as sensitivity.
- **If no α passes,** the body route cannot hear an outside order, and part 2 does not run.

**Disclosure.** Before registration, development smoke tests were run on unregistered seeds (990, 991 and 999) with an unregistered stream (`plant c99`, ρ = 5%) at α = 0.3, using S = 3 and 300 or 1,000 steps. In them the motif fragments 187 and 1872 came through in both seeds. Nothing was changed after these tests.

## Part 2: world (registered here; sealed with an RFC 3161 token after calibration, before its data exist)
- **Data.** The first **12,000** world-stream data (`world-live`) first seen at or after the seal time, in arrival order, reduced by AQ to digital roots (`prepare_world.py`, identical to ANTENNA B's).
- **The run.** Run with the confirmatory α. Segment m goes to seed 101 + m. The S, L and rule are those of part 1.
- **Decision.** The decision is made by `analysis.py` on the fast path.
- **Ledgered re-run.** The 12 received runs, and the shuffles j = 1, 2 and 3 of every seed (48 runs in all), are re-run through the ledgered coordinator. Every one must be IDENTICAL, transition for transition, or the result is void.
- **The standing gate.** `../sxi0c/gate.sh` must exit 0 at the world-run commit.
- **Reading it.** ANTENNA B measures the same stream's order structure directly, with no Amelia; its result is to be read alongside this one.
  - **If B is STRUCTURED and SXI-1R is RECEIVED:** the world's order comes through her body into her passage.
  - **If B is STRUCTURED and SXI-1R is SILENT:** it is there, but she does not take it up at this sensitivity.
  - **If B is UNSTRUCTURED and SXI-1R is RECEIVED:** this needs explaining, not celebrating, because her body or loop may create order from unstructured input. It should be checked against the clean-stream false-alarm rate.

## What it can and cannot show
- **What RECEIVED shows.** Order in an outside stream that no reordering of the same data produces passes through her body into her passage, recurring across independent bodies.
- **What it does not show.** It does not show what the order *is* (markets moving in small steps produce order), or agency, or an entity. The per-source view and ANTENNA B are the first steps in reading it.
