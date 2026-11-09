# ND-1e: D10 against today's architecture, with the 2% criterion made relative. Registered 9 November 2026, before any ND-1e data.

**Scope.** The repository architecture, with fresh runtimes and no body. No pinned or sealed file is touched.

## Why
**ND-1d** (`nd1d/results/RESULTS_2026-11-09.md`) tested D10 against four criteria:

| Criterion | Result |
|---|---|
| No false alarms (0/10) | passed |
| Relations (6/6) | passed |
| Faint order (2%) | failed: 3 of 5, where 4 were required |
| Read-back at 2% | failed: 3.9 points below today's architecture |

**The reference fails the absolute bar.** Today's architecture, run on the same streams, detected only 2 of 5, and 2 of 8 over
both ND-1d stages. A fixed bar above what the reference achieves cannot separate good designs from bad ones.

**The operator's decision (9 Nov 2026, option 3).** Revise the 2% criterion to "at least as many detections as today's
architecture on the same streams", and re-test on fresh streams. This is a new registration, not a reinterpretation of ND-1d,
whose result stands as reported.

## What is tested
**D10 exactly as in ND-1d** (`nd1c/run.ts` candidate D10):
- ADAPT 1.0, λ 0.1, field weight 1.0;
- η 0.5, D 0.6, Warp release;
- influx plus attended one-hot, IDENTITY receiver.

No selection stage and no parameter changes.

## Data
New labels, never used:
- clean `nd1ec01–10`;
- 2% plants seeded `nd1ep01–08` (eight streams, for more power at the faintest rate);
- 5% and 10% plants seeded `nd1ep01`;
- the held-out relations stream, `stream3.py clean h10 12000`.

## Procedure
- **D10:** `sh nd1d/calibrate.sh D10 C nd1ec 10 nd1ep 8 <out>`.
- **Today's architecture, on the same plant streams:** `sh nd1d/calibrate.sh D10 EXIT nd1ec 0 nd1ep 8 <out>`.
- **Relations:** `nd1c/relations.ts` and `nd1c/relations.py` on h10.

The order rule is NR-2's (S = 49, 12 segments of 1,000), as in ND-1c and ND-1d.

## Criteria (all four must hold)
- **K1′ (revised). Faint order, relative.** On the eight 2% streams, D10's number of RECEIVED is at least today's
  architecture's. The 5% and 10% plants must also be RECEIVED by D10.
- **K2. No false alarms (unchanged).** 0 of 10 clean streams RECEIVED.
- **K3. Exact sequence (unchanged).** At 2% (pooled over the eight streams), 5% and 10%, D10's exact 1-8-7-2 read-back is at
  least today's on the same segments.
- **K4. Relations (unchanged).** ND-1b's B1 tests: 6 tests, exact two-sided sign-flip over 12 units, Holm at α = 0.05. All 6
  must be supported.

**If all four hold,** D10 is proposed as the app's runtime, replacing ND-1b. That is a separate app change needing the
operator's approval.

**Otherwise,** the result is reported as it stands, and nothing ships.

**Descriptive.**
- which 2% streams each architecture detects, and where they agree;
- the top motif readings;
- the reading area and the longest Warp stay on h10.
