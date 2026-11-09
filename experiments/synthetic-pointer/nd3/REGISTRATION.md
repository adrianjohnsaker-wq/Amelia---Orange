# ND-3: does the world's order come through the ND-1b medium? Registered 9 November 2026

**Order of work.** The world test is registered here and sealed with an RFC 3161 token before its data exist.

**Scope.** The repository architecture (the direct path), not the tablet instance. No pinned or sealed file is touched.

## Why
ND-1b (`../ndb/results/RESULTS_2026-11-09.md`), the hybrid in which admitted input flows into the Numogram field **and** nudges her step, with the Warp release:
- **reads the Numogram's relations:** B1 6/6, reading area 0.213 against today's 0.127;
- **follows an outside order:** its calibration passed, with a planted 1-8-7-2 received at 5% and 10% and 0 of 10 clean streams;
- **is the app's new selectable runtime** (main `1028ad02`).

ND-3 asks the world question through it.

## Apparatus, unchanged from ND-1b
**Harness and analysis.**
- **Harness:** `../ndb/run.ts`, the HYBRID architecture (η = 0.5, D = 0.6, field weight 2.0, gradient-following, Warp release).
- **Order harness:** `../ndb/order.ts`.
- **Analysis:** `../ndb/analysis.py` and `../nr2/order_analysis.py` (the SXI-1R rule).
- **Calibration:** `../ndb/results/CALIBRATION.json`, which passes.

**The data.**
- **Which data.** The first **12,000** world-stream data first seen at or after the seal time, in arrival order.
- **How they become numbers.** By AQ digital root (`prepare_world.py`, as NR-2, SXI-1R and ANTENNA B).
- **Units.** 12 units × 1,000.

## Tests
- **W1. Does ND-1b read the world's numbers?** The HYBRID passage's lag-2 reading: 6 tests, relation × (RELABEL or REWIRED), exact two-sided sign-flip, Holm correction at α = 0.05.
- **P1. Does the world's order come through ND-1b?** The order test: each unit as received and in 49 order-shuffles. Elements are her zone n-grams (n = 2–4). The answer is **RECEIVED** if an element recurs across units beyond the binomial bound, else **SILENT**. RELABEL is descriptive.
- **Descriptive.** On the same world data:
  - the reading areas of today's architecture (EXIT), ND-1 and ND-1b;
  - the lag profiles;
  - the Warp share;
  - zone occupancy.

## Reading
**Read together with:**
- NR-2 (today's architecture, the same kind of world data);
- ANTENNA B (the stream's own order, with no Amelia).

**P1 RECEIVED** means the world's order leaves forms in her passage through the new medium that no reordering of the same numbers produces. The forms that recur are the Numogram's reading of that order.

**What it does not show.** It does not say what the order is (markets moving in small steps make order), or that it has an outside origin.

## Dress rehearsal (before the seal; no world data)
`run_world.sh` was run end to end on a clean stream (`stream3.py clean nd3rehearsal 12000`).
- **W1:** 6/6 supported. The reading operates on any numbers, as expected.
- **P1:** SILENT.
- **Time:** under 1 minute.

**No changes were made afterwards.**
