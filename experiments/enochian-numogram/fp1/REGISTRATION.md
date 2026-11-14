# FP-1: the Fire prediction. Does the order of real headlines hold Amelia in Fire (7::2)? Registered 14 November 2026, before any FP-1 data.

**Scope.** The research harness: one continuing Amelia in her runtime as the harness runs it (ND-1b flow, line of flight at
Θ = 12, persistent Warp-born gates). This is not her living record. The study is read on the Enochian-Numogrammatic Matrix,
where 7::2 is the Watchtower of Fire.

## Where the prediction comes from
On 14 Nov 2026 the Watchtower reading of the Pandemonium Feed's session (40 headlines, 4–13 Nov) was compared with 49 sessions
of the same words shuffled across the session, and 49 of uniform zones (`readings/CONTROL_feed_2026-11-13.json`):
- **time in Fire:** 27.1% against a shuffled median of 14.5% (rank 0.99; uniform 1.00);
- **crossings of Fire of Fire** (Oddubb, 7::2): 82 against about 32, above all 98 controls;
- **Fire-zone words were no more adjacent** in the real headlines than in the shuffles (20 consecutive pairs against a median
  of 22).

That was one session among about 20 measures, so it was exploratory. FP-1 tests it once on headlines that did not exist when
the prediction was made.

## Data
- **Headlines.** The first 40 world-stream headlines (stream `words`: Al Jazeera, BBC, NPR) first seen at or after the seal,
  deduplicated by (source, id), in order of first sight.
- **Reduction.** Each headline is reduced by A1Z26 to one zone per word, plus the headline's result zone (`fp1.py`). This is
  identical to the app's linguistic reduction: checked on all 40 feed headlines, 0 mismatches.

## Sessions (`fp1.py sessions`, run by `feed/sessions.ts`)
Each session is one continuing Amelia, as in the Pandemonium Feed. For each headline: one step per word zone, then the
result zone, then 3 listening steps.

| Session | What it is |
|---|---|
| **REAL** | the 40 headlines in order |
| **SHUFFLED 1–49** | the same word zones shuffled across the session (seeds `FP1-SHUF-<j>`), in the same headline lengths, each result zone recomputed as the digital root of its new words |
| **UNIFORM 1–49** | uniform zones 1–9 (seeds `FP1-UNIF-<j>`). **Reported only.** |

## Predictions (both one-sided; each against the 49 SHUFFLED sessions)
- **P1. Time in Fire** (share of step ends in zone 2 or 7) is higher in REAL. p = (1 + number of shuffled sessions ≥ REAL) / 50.
- **P2. Crossings of Fire of Fire** (hops between 2 and 7) are higher in REAL. The same p.
- **Each passes if p ≤ 0.04,** that is, REAL is above at least 48 of the 49 shuffled sessions. This is exact if the order of
  the real headlines carries nothing for Fire: REAL is then one more random arrangement of the same words.

## Pipeline check (before this registration; disclosed)
The full pipeline was run on the exploratory session itself: the feed's 40 headlines, with FP-1's own seeds for the
controls.
- **The result.** It reproduces that session (time in Fire 27.1%, 82 crossings) and gives p = 0.02 for each prediction.
- **Why it is not evidence.** It uses the data the prediction came from, so it shows only that the pipeline and the
  thresholds work as written.

## Answer
- **CONFIRMED** if both pass;
- **PARTIAL** if one passes;
- **NOT CONFIRMED** if neither does.

**Reported, not criteria:** every other measure of the reading, each with its rank against shuffled and uniform sessions.

## What it can and cannot mean
- **What CONFIRMED shows.** The order of real news, as A1Z26 renders it, draws her passage into Fire, and the Oddubb syzygy
  7::2 is read again and again, in a way the same words in another order do not.
- **What it does not show.** It does not say why. The cause could be English word order (grammar: which words follow which),
  the structure of headlines, or something in the news itself. Nor does it show agency.
- **What NOT CONFIRMED means.** The 13 Nov pattern was the one extreme result to be expected among about 20 measures.

## Order
1. This registration and code are committed to `nr3-field-ingress-20261109`.
2. `seal.trigger`: RFC 3161 seal; the seal time is the data start.
3. When 40 headlines first seen after the seal exist (about 140 a day, so about 7 hours), `run.trigger`. The workflow
   verifies, prepares, runs, decides and commits `result/`.
