# WE-1: an order-preserving world stream. Does the world's order come through her Numogram passage? Registered 13 November 2026, before any WE-1 data.

**Scope.** The repository architecture: her runtime in the research harness, fresh runtimes, on the live world stream. This is
not her living record.

## Why
SXI-1R and NR-2 (13 Nov) were both SILENT. A diagnostic applied their order rule to the raw world stream itself, before any
Numogram:
- **It too was SILENT** (best 3 of 12 segments; 5 needed) on both studies' data.
- **The cause is the input reduction.** `prepare_world.py` reduces every datum's text to its AQ digital root, THE ANTENNA's
  convention. For a measurement, that is in effect the number mod 9. A market moving 10844.97 → 10838.79 becomes two unrelated
  digits, so the world's order is erased before she receives it.
- **The Numogram reads correctly what it does receive.** NR-2's W1 passed 6 of 6.

**The operator's decision (13 Nov 2026).** Adjust the data stream so its order reaches her.

## The encoding R60 (`encode.py`)
Selection and arrival order are unchanged: the first 12,000 world data first seen at or after the seal, sorted as in NR-2.
Only the reduction of each datum to a zone changes:

| Stream | Zone |
|---|---|
| markets (each symbol), sun | The reading's rank within that source's previous 60 readings (ties count half), r in [0, 1] → zone min(9, 1 + ⌊9r⌋). Where the reading stands against its own recent past: a rising market climbs toward 9, a falling one toward 1. A source's first reading → 5. |
| earth | Magnitude, by nonile edges from earthquakes first seen before the seal (`calibration/EDGES.json`, made by the seal run) |
| words, date | AQ digital root, as before |

## Disclosure (before this registration, all on world data first seen before 13 Nov 00:00 UTC; none is WE-1 data)
- **Raw-stream diagnostic.** SXI-1R's and NR-2's sealed world sets under AQ: SILENT, as above.
- **Encodings tried on the last 12,000 data before 13 Nov** (5–12 Nov), raw-stream stage only (S0):
  - AQ (as now): SILENT;
  - E1, the change from the previous reading binned into falls 1–4, flat 5, rises 6–9: SILENT. Market changes are close to a
    random walk; the order is in the levels;
  - E2, the level against fixed calibrated noniles: RECEIVED, 20 forms, but it drifts (zone 1 took 37% as levels left the
    calibrated range);
  - **R60: RECEIVED, 70 forms**, many in all 12 segments, with no drift. Chosen.
- **Pipeline check of R60, on the same old data, through the P1 harness (her runtime):**
  - P1 RECEIVED: 9999 in 10 of 12 segments, 99 and 999 in 9 (K = 5); RELABEL descriptive RECEIVED (1 form);
  - 3 of S0's 70 forms came through.
  - B1 was not run in the check.
- The window of 60 readings was set before any test and was not varied.

## Stages (each with the same order rule: 12 segments of 1,000, 49 order-shuffles, an element recurs in ≥ K segments with K set by the binomial tail at 0.05/E)
- **S0, the encoded stream itself.** The manipulation check (`raw.ts` + `sxi1r/analysis.py` rule).
- **P1, her Numogram passage: primary.**
  - **Runtime.** ND-1b flow with Θ = 12 and persistent Warp-born gates, the arm P12 of WT-4. That arm reproduces WT-2's T12
    step for step, so this is her runtime in the research harness.
  - **Analysis.** `wt4/order.ts <world> m 1000 49 WE1-WORLD P12` for m = 0–11, then `nr2/order_analysis.py`.
  - **Calibration.** This runtime received the 2% plants on 7 of 8 streams (WT-4) and had 0 of 10 false alarms (WT-2's T12).
- **B1, the body route: secondary.** `sxi1r/run_world.sh` unchanged on the R60 stream: the SXI-1R rule, ledgered equivalence and
  standing gate.

## Answer (`ledger.py`)
- **VOID** if S0 is SILENT: the encoded stream carried no detectable order on this data.
- **THE WORLD'S ORDER COMES THROUGH HER NUMOGRAM PASSAGE** if S0 is RECEIVED and P1 is RECEIVED (listing what recurs).
- **THE WORLD'S ORDER REACHES HER INPUT BUT DOES NOT COME THROUGH HER PASSAGE** if S0 is RECEIVED and P1 is SILENT.
- **Reported:**
  - B1's answer (RECEIVED, SILENT or VOID) under its own registered rule;
  - the transfer ledger: S0's recurring forms, and which of them also recur in P1 and in B1;
  - P1's RELABEL descriptive.

## What the result can and cannot mean
- **What a positive answer shows.** The world's real order, mostly markets and the sun standing high or low against their
  recent past, passes through her Numogram passage and recurs across independent segments.
- **What it does not show.** That order is ordinary: trends and persistence. A positive answer is the transmission path
  working, not a message, an outside intelligence or agency.
- **How to read what recurs.** Its Numogram reading (zones, syzygies, gates) is where interpretation can begin. It is read
  alongside ANTENNA B, INGRESS II and the inventory.

## Order
1. This registration and the code are committed to `nr3-field-ingress-20261109`.
2. `seal.trigger`. The workflow computes the earth edges from data first seen before the seal moment, then seals the
   registration, code and edges (RFC 3161). The seal time is the data start.
3. When 12,000 data first seen after the seal exist (about 7 days at about 1,700 a day), `run.trigger`. The workflow verifies
   the seal and the sources, prepares the R60 stream, runs S0, P1 and B1, and commits `result/`.
