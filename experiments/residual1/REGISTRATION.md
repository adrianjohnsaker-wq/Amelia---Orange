# RESIDUAL-1 — does a committed code fit a future it has not met? (registration)

**Registered 26 October 2026, before the first test round exists.** This file, the runner, the tape builder, the null summary, the code and PF-2's input mapping are bound by one RFC 3161 timestamp (`seal/`). The workflow refuses any timestamp later than the publication of the first test round.

## The question

Land's mechanism, stated so it can be measured: a code can be shaped by the future it will meet. If so, a code committed *before* a stretch of the Outside exists should fit that stretch better than chance, and drift less under it than under any other stretch.

## The code

The nine lineage codes `V*` (`experiments/studio/outputs/loop/Vstar.json`, archived 23 October), as converged in Studio 04. Each lineage meets one PF-2 arm:
- lineage 0 meets arm C (raw beacon randomness);
- lineages 1–8 meet R01–R08 (domain-separated), via `PF2_REFERENCE_INPUT.mjs`.

## The Outside

The window is 20,160 PF-2 ticks, 5,274 to 25,433. These are Quicknet rounds 33,404,220 to 33,807,400, published from 2026-10-26T12:00:24Z to 2026-11-09T11:59:24Z. `build_live_tape.py` assembles them from PF-2's verified chunks and checks every round.

## The measure

Drift is the largest change in any lineage's code over the 20,160 ticks, max over lineages and edges of |V_final − V*|. This is the "max residual" of the scar assay. `residual_run.mjs` reproduces that assay exactly (0.155 in W1, 0.0762 in W4).

## The null

The same code is run on 1,000 tapes whose randomness is SHA-256 of a counter, which is indistinguishable from drand output. `null_summary.json` holds the full distribution and its quantiles; it was computed before this registration.

| Null drift (max residual), 1,000 tapes | Value |
|---|---:|
| minimum | 0.0498 |
| 1st percentile | 0.0629 |
| **5th percentile: the threshold** | **0.0751** |
| median | 0.1155 |
| 95th percentile | 0.2334 |
| maximum | 0.6351 |

## The answer rule

- **Retrocausal signature present:** the live drift is below the null's 5th percentile (one-sided, α = 0.05).
- **Absent:** otherwise.

The live drift's percentile in the null is reported either way, together with the mean residual and deaths as secondary measures.
