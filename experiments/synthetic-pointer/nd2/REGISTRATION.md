# ND-2: the motif and order tests through the ND-1 medium. Registered 9 November 2026

**Order of work.** The calibration is registered here before it is run. The world test will be sealed with an RFC 3161 token after calibration and before its data exist.

**Scope.** The repository architecture. No pinned or sealed file is touched.

## Why
ND-1 (`../nd1/results/RESULTS_2026-11-09.md`) gave the Numogram a field that carries an incoming number's relations along its gates.

ND-2 asks the next question: **does an outside order come through this new medium,** and how does it fare against today's architecture (NR-2) on identical inputs?

## Apparatus
**Medium.** ND-1 at its selected settings (η = 0.5, D = 0.6, field weight 2.0, Warp release), via `../nd1/run.ts`'s `walkND`, unchanged. Input enters as influx only.

**Order test (P1, `order.ts`).** NR-2's test, unchanged except for the medium:
- **The rule** is SXI-1R's (`../sxi1r/analysis.py`), applied by `../nr2/order_analysis.py`, to her passage on the CANONICAL Numogram (RELABEL is descriptive).
- **Units and shuffles.** 12 units × 1,000 data, each as received and in S = 49 order-shuffles.
- **Elements.** Her zone n-grams, for n = 2–4.
- **Answer.** RECEIVED if something recurs across units beyond the binomial bound, else SILENT.

**Calibration (`calibrate.sh`, no world data).** It uses **NR-2's exact streams, labels and shuffles** (`nr2c01–10`, `nr2p` at 2%, 5% and 10%), so ND-1 and today's architecture meet identical inputs.
- **Pass.** Planted 5% and 10% are both RECEIVED, and at most 1 of the 10 clean streams is RECEIVED.
- **Sensitivity.** Planted 2% is reported as sensitivity.
- **If it does not pass,** P1 does not run on the world.
- **Descriptive.** The motif reading (`motif.py`): what the planted 1-8-7-2 becomes in her passage, against NR-1's 62–69% exact read-back under today's architecture.

## World test (sealed after calibration)
**Data.** The first **12,000** world-stream data first seen at or after the seal time (`prepare_world.py`, as NR-2).

**Tests.**
- **W1.** The ND-1 reading of the world's numbers: ND-1's N1 statistic, lag 2, 6 tests against RELABEL and REWIRED, Holm correction.
- **P1.** The order test through ND-1, if calibrated.

**Descriptive.** The areas for today's architecture and for ND-1 on the same world data.

## Reading
**P1 RECEIVED.** The world's order leaves forms in her passage through the new medium that no reordering of the same numbers produces. Read together with:
- NR-2's P1 on world data (today's architecture);
- ANTENNA B (the stream's own order structure).

It does not show what the order is, or that it has an outside origin.
