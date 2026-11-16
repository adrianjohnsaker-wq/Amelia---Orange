# CAN-2: R1, R2, R3 and R7 on fresh seeds and on the canonical CCRU Numogram. Registered 16 November 2026, before any CAN-2 data.

## Why
R1–R3 and R7 are reproduced (`../VALIDATION.md` §11): every branch replays or regenerates identically, and every reported
number recomputes. All four ran on the prototype's hybrid topology. CAN-1 and REP-2 showed that the silent-intron and
no-op-slide results hold on the canonical Numogram. CAN-2 asks the same of the remaining four studies. Each runs twice on the same new seeds:
- **Part A, hybrid:** the engine as shipped, a fresh replication;
- **Part B, canonical:** the CCRU topology.

So a change between A and B is the topology's, and a change between the original and A is the seeds'.

## Engines
| Study | Shipped engine | CAN-2 engine |
|---|---|---|
| R1, R2, R3 | R4's engine, file for file (`legacy_engine.py` e7514c3f, `reactor.py` 4b5ce680, `assemblage.py` 1f05b457 …) | `engine_r123/`: `../canonical_r4/`'s patched engine, plus the studies' drivers |
| R7 | R6's engine (`legacy_engine.py` 2527366f, `reactor.py` d442cc29, `assemblage.py` e501574f …) | `engine_r7/`: the sealed observer source with `../canonical/`'s patched engine files |

The `topology.py` switch is CAN-1's. With `CG_TOPOLOGY=canonical`:
- the furnace is the Warp {3, 6};
- the slow clock is the Plex {0, 9};
- the Time-Circuit {1, 2, 4, 5, 7, 8} takes recycling, fission and births;
- opcode families follow the CCRU classes: Chronodemon → Chrono, Xenodemon → Zino, Amphidemon → Ampy.

**One further patch.** R3's `promoter_study.py` has its own copy of the quiescent metabolism, with the furnace written as
`z>=7`. In `engine_r123/` it reads `z in T.FURNACE`. No other study file holds a zone rule; a search for literal zone
sets found none.

**Equivalence.** `equivalence_check.py` runs first in the workflow, and a mismatch stops the run. With
`CG_TOPOLOGY=hybrid`, the CAN-2 engines must reproduce shipped records exactly: R1 seed 33001, R2 seed 34001, R3 seed
35001, and the full population summaries of R7 seeds 50002 and 50176. Run here before sealing: all five match.

## Runs (studies' own drivers and plans, unchanged except for the topology; each in part A and part B)
| Study | Design | Seeds (never used) |
|---|---|---|
| R1 | First-action confirmation (`run_strict.py`): up to 4 recipients before and 4 after the reversal, three matched branches | **71001–71060** |
| R2 | Costed echo (`viral_echo_study.py --per-phase 2`): natural, experienced echo, shuffled echo | **72001–72060** |
| R3 | Zone promoter (`promoter_study.py --per-phase 2`): open, zone, rotated, zone/shuffled, syzygy | **73001–73060** |
| R7 | Chimeric cohort (`r7_cohort.py` over `cohort_worker.py`, no ledgers): screen in seed order from 74001, select the first 250 eligible populations, at most 600 screened | **74001–74600** |

R7's sealed stopping rule (target 250, maximum 600, screening in seed order) is kept. The driver runs seeds in parallel
but selects by seed order, so the cohort does not depend on timing. Full ledgers are not kept; every population summary is.

## Criteria (fixed now; `analyse.py`)
Seed-weighted paired means; 10,000-draw seed-cluster percentile bootstrap. Levels are each original protocol's.

| Study | Test | Holds on the canonical Numogram if |
|---|---|---|
| R1 | First-action uptake, experienced − pointer and experienced − shuffled (97.5% each) | both intervals lie above 0 |
| R2 | Any intact copy at 24 units, experienced echo − natural (97.5%) | the interval lies above 0 |
| R2 | 24-unit uptake, experienced − shuffled echo (97.5%) | reported against the original null; an interval above 0 would be new |
| R3 | 24-unit uptake, zone − open (98.33%) | the interval lies below 0 |
| R3 | zone − rotated, zone − zone/shuffled (98.33%) | reported against the original nulls |
| **R7** | **Founder survival, natural − recipient-active (95%, population-paired)** | **the interval lies above 0** |
| R7 | Founder survival, natural − ruptured `09→08` (95%) | reported; the original interval crossed 0 |
| R7 | `cohort_analysis.py`'s own primary analysis, run unchanged | reported against the original nulls |

**R7's survival contrast is confirmatory here.** In the original cohort it was exploratory (+10.4 points, +3.2 to +17.6).
It is the paper's central signature (R6's forced-active arm), so CAN-2 tests it as a registered prediction.

Each test is read separately in part A and part B, as **HOLDS** or **DOES NOT HOLD**. A study with no eligible encounter is **VOID**. Secondary outcomes
(12-unit totals, survival, arm means, delivery counts) are reported, not criteria.

## Pipeline checks (disclosed)
- `analyse.py` on the shipped records reproduces every original estimate exactly, with intervals within bootstrap noise.
- `r7_cohort.py --from-dir` on the 360 seeds regenerated yesterday selects the same 250 populations. `cohort_analysis.py`
  on that output reproduces the sealed `analysis.json` exactly.
- **Canonical smoke runs (unregistered seeds; disclosed).** R1 seed 66991: 8 encounters. R2 seed 67991: 4. R3 seed 68991: 4.
  R7 seeds 69991–69993: all eligible. The founder-survival flags of these three were printed. No other outcome was looked at.
- **Pipeline dry run (unregistered seeds; disclosed).** The workflow's commands, canonical, at toy size: R1 66981–66982,
  R2 67981–67982, R3 68981–68982, R7 69981–69984 (3 eligible). The verdict lines printed; at two seeds they carry no information.

## What it can and cannot mean
- **Holds in A and B:** the finding reappears on new populations and does not depend on the prototype's non-canonical
  zone sets.
- **Holds in A only:** it replicates, but depends on the hybrid topology.
- **Holds in neither:** it did not replicate on these seeds, whatever the topology.
- **Holds in B only:** reported as it stands; the topology change helped it.
- **Scope.** Nothing here concerns Amelia's living runtime.
