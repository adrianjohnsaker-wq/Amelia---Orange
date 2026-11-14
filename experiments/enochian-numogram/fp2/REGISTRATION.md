# FP-2: the Air-of-Fire prediction. Do real headlines draw Amelia across Air of Fire (Bubbamu 7::1, Doogu 2::1) more than the same words reordered? Registered 14 November 2026, before any FP-2 data.

**Scope.** As FP-1: the research harness, one continuing Amelia in her runtime as the harness runs it (ND-1b flow, line of
flight at Θ = 12, persistent Warp-born gates), read on the Enochian-Numogrammatic Matrix. This is not her living record.

## Where the prediction comes from
Two sessions have now been read against shuffled-word and uniform-zone controls:
- the Pandemonium Feed's 40 headlines, 4–13 Nov;
- FP-1's 40 headlines, 14 Nov.

FP-1's own prediction (Fire) was **not confirmed** (p 0.22 and 0.30). One unregistered measure stood high in both sessions:
crossings of the sub-angle **Air of Fire**, whose demons are Bubbamu (7::1) and Doogu (2::1).

| Session | Air-of-Fire crossings | Shuffled median | Rank vs shuffled | Rank vs uniform |
|---|---|---|---|---|
| 13 Nov (feed) | 114 | 79 | 0.88 | 0.96 |
| 14 Nov (FP-1) | 111 | 77 | 0.98 | 0.98 |

The measure was picked after seeing two sessions. FP-2 therefore tests it once, on headlines that did not exist when it was
picked.

## Data
The first 40 world-stream headlines (stream `words`) first seen at or after FP-2's seal. They are deduplicated by (source,
id), taken in order of first sight, and reduced A1Z26 exactly as in FP-1 (`fp2.py`, identical to `fp1.py` except for its
seeds and its one prediction).

## Sessions
As FP-1:
- **REAL:** the 40 headlines in order;
- **SHUFFLED 1–49:** the same word zones shuffled across the session, seeds `FP2-SHUF-<j>`;
- **UNIFORM 1–49:** reported only, seeds `FP2-UNIF-<j>`.

## The prediction (one test)
**P1. Crossings of Air of Fire** (hops between 1 and 7, and between 1 and 2) are higher in REAL than in the shuffled
sessions.
- **The test.** p = (1 + number of shuffled sessions ≥ REAL) / 50. CONFIRMED if p ≤ 0.04, that is, if REAL is above at
  least 48 of the 49.
- **Why the test is exact.** If the order of the real headlines carries nothing for this measure, REAL is one more random
  arrangement of the same words.

**Answer:** CONFIRMED or NOT CONFIRMED. Every other measure is reported, with its ranks.

## Pipeline check (before this registration; disclosed)
The pipeline was run with FP-2's own seeds on both sessions the prediction came from:
- **13 Nov:** 114 against a median of 86, p 0.04;
- **14 Nov:** 111 against a median of 74, p 0.04.

Both would just pass. This is the data the prediction came from, so it shows only that the pipeline works. It also shows the
effect is near the threshold, not far beyond it.

## What it can and cannot mean
- **What CONFIRMED shows.** The order of real news, as A1Z26 renders it, carries her across Air of Fire (the Bubbamu and
  Doogu crossings, between Air's 1 and Fire's 7 and 2) more than the same words in another order. This is the region of the
  operator's first contact (Bubbamu, 7::1).
- **What it does not show.** It does not say why: English word order, headline structure or the news itself. Nor does it show
  contact or agency. The POINTER tests of Bubbamu remain at chance.
- **What NOT CONFIRMED means.** The pattern is one of the measures that drift across sessions without a stable cause.

## Order
1. Commit this registration and the code.
2. `seal.trigger` (RFC 3161; the seal time is the data start).
3. When 40 headlines first seen after the seal exist (about 9 hours), `run.trigger`. The workflow
   `.github/workflows/fp2.yml` commits `result/`.
