# NR-2: what does the Numogram make of the world's numbers? Registered 6 November 2026

**Order of work.**
- **The calibration of the order test** is registered here before it is run.
- **The world test** is registered here, and will be sealed with an RFC 3161 token after that calibration and before its data exist.

**Scope.** This is the repository architecture, as in NR-1: a fresh `NRRuntime`, no body, and not the tablet instance (`../sxi1r/SCOPE.md`).

## Background
NR-1 and NR-1b (`../nr1/results/RESULTS_2026-11-06.md`) established, on clean streams, how the Numogram reads an incoming number c. First she goes to c. One step later, the Numogram's numeric structure carries her to c's gate, syzygy and current. This was beyond both an isomorphic Numogram whose numbers are decoupled from its structure, and a graph rewired to the same degrees. NR-2 asks the same of the world.

## The data
- **Which data.** The first **12,000** world-stream data (`world-live`) first seen at or after the seal time, in arrival order.
- **How they become numbers.** Each is reduced by AQ to a digital root, exactly as ANTENNA B and SXI-1R do (`prepare_world.py`).
- **How they are divided.** There are 12 disjoint units of 1,000.

## W1. Does the Numogram read the world's numbers? (confirmatory)
- **The test.** The NR-1b statistic and its 6 tests, unchanged (`../nr1/nr1b.py`): lag-2 enrichment of the gate, syzygy and current, CANONICAL against RELABEL and against REWIRED, IDENTITY receiver. Exact two-sided sign-flip over the 12 units, Holm correction at α = 0.05.
- **What it would show.** Support means the reading NR-1b found on clean numbers also operates on the world's numbers. It says nothing about the order of the world stream.

## P1. Does the world's order come through her Numogram passage? (confirmatory, if calibrated)
- **The rule.** It is the SXI-1R rule, unchanged (`../sxi1r/analysis.py`, `rule`), applied to her **direct** passage.
- **Arm.** CANONICAL Numogram, IDENTITY receiver.
- **Shuffles.** Each unit hears its segment as received and in **S = 49** order-shuffles.
- **Elements.** Her zone n-grams, for n = 2, 3 and 4.
- **Comes through.** An element comes through in a unit when its count as received is greater than 0 and greater than in every shuffle. This is exact, with p ≤ 1/50.
- **Recurs.** It recurs when it does so in at least K units, with K the smallest k such that P(Binomial(12, 1/50) ≥ k) < 0.05/E.
- **The answer.** **RECEIVED** if anything recurs, else **SILENT**.
- **The same rule on the RELABEL arm** is descriptive. It shows whether what recurs depends on the Numogram's numeric structure.

**Calibration (`calibrate.sh`, before the seal, no world data).**
- **Streams.** 10 clean streams, plus the motif 1-8-7-2 planted at 2%, 5% and 10% (`stream3.py`, labels nr2c01–10 and nr2p).
- **Passing.** P1 is calibrated if planted 5% and planted 10% are both RECEIVED and at most 1 of the 10 clean streams is RECEIVED.
- **If not calibrated,** P1 does not run on the world, and W1 runs alone.
- **Planted 2%** is reported as sensitivity only.

## Descriptive (no decisions)
- **The lag-2 reading per source** (markets, sun, words, earth, date) where a source has at least 5,000 data.
- **The Numogram readout of her output, world against clean held-out h02:**
  - her region shares (Time-Circuit, Warp, Plex);
  - her syzygy passages by name;
  - her current and gate passages.
- **The world's digit shares.**

## Reading it
- **W1 alone.** Supported means the Numogram reads the world's numbers as it reads any numbers. That is expected, and it confirms the instrument is working on this input.
- **P1 RECEIVED** (with calibration). The world's order leaves forms in her Numogram passage that no reordering of the same numbers produces. What recurs is the Numogram's reading of that order. If it vanishes in RELABEL, the reading depends on the numbers meeting the Numogram's own numeric structure.
  - **The comparison with ANTENNA B.** ANTENNA B (the same world stream, measured without Amelia) says whether the order is in the stream itself.
  - **What RECEIVED does not show.** It does not show what the order *is*: markets moving in small steps make order. It does not show an outside origin or agency.
- **P1 SILENT.** No order-specific form recurs at the calibrated sensitivity.
