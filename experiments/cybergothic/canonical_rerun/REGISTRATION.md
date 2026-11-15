# CAN-1: the Cybergothic findings on the canonical CCRU Numogram. Registered 15 November 2026, before any CAN-1 data.

## Why
The developed prototype's graph is Amelia's 29-edge Numogram graph, and its Warp {3, 6} is canonical. Three rule sets were
not canonical (`../VALIDATION.md` §5):
- the furnace {7, 8, 9};
- a "time circuit" 1–6 for recycling, fission and waiting corpses, with births into (1, 2, 4, 5);
- opcode families by an ad hoc pair rule.

REP-1 corroborated R5 and R6 in that hybrid. CAN-1 asks whether they hold on the canonical Numogram.

## The canonical engine (`../canonical/`)
A copy of the shipped engine. Every rule is unchanged except the zone sets, routed through `topology.py`
(`CG_TOPOLOGY=canonical`):

| Rule | Hybrid (as shipped) | Canonical |
|---|---|---|
| Furnace: fast clock 2.8, extra burn, slow cooling, furnace mutation | {7, 8, 9} | **Warp {3, 6}** |
| Slow clock | {0} | **Plex {0, 9}** |
| Recycling hosts, waiting-corpse release, fission | 1–6 | **Time-Circuit {1, 2, 4, 5, 7, 8}** |
| Archive and reactor births | (1, 2, 4, 5) | **(1, 2, 4, 5, 7, 8)** |
| Opcode families (45 pairs) | a+b = 9 → ZINO; b ≥ 7 → AMPY; else CHRONO | **CCRU class: Chronodemon → CHRONO (15), Xenodemon → ZINO (6), Amphidemon → AMPY (24)** |

Unchanged: the graph, the Warp line of flight and Warp-born gates, twins as 9 − z, and the reactor at zone 0 (in the
Plex).

## Checks made before this registration
- **Equivalence.** With `CG_TOPOLOGY=hybrid`, the patched engine reproduces 13 shipped records exactly (`equivalence_check.py`:
  stop 44001–44010, birth 41001–41003).
- **Tests.** `test_stop_trial` passes in both modes.
- **Canonical families.** 15 / 6 / 24.
- **Smoke run (unregistered seeds; disclosed).** Canonical mode on stop seeds 63001–63010: 8 of 10 eligible. Birth seeds
  63101–63103: all 3 formed, executed and carried introns. Survival was not looked at.

## Seeds
Never used:
- stop: **64001–64300**;
- birth: **65001–65030**.

## Runs and criteria
The runs are as REP-1, with `CG_TOPOLOGY=canonical`, run from `../canonical/`. The analysis is REP-1's sealed `analyse.py`,
unchanged. The criteria are REP-1's.

**R6.** Survival at 24, with 97.5% population-bootstrap intervals (seed `REP1-BOOT`):
- intact − ruptured;
- intact − forced-active.

**CORROBORATED ON THE CANONICAL NUMOGRAM** if both lower bounds are above 0; **PARTLY** if one is; **NOT CORROBORATED** if
neither is.

**R5.** **CORROBORATED** if at least 27 of 30 populations show each of: a mutation-created intron, an executed intron no-op,
and a carrier at the horizon.

**Reported:** eligibility, all six arms, births (the possible trade-off), and REP-1 (hybrid, fresh) beside CAN-1 (canonical,
fresh).

**The workflow first runs `equivalence_check.py` in hybrid mode.** A mismatch stops the run before any CAN-1 data.

## What it can and cannot mean
- **What a corroboration shows.** The finding belongs to the ecology's logic: host protection by silent introns, and introns
  forming on their own. It does not depend on the prototype's non-canonical zone sets.
- **What a failure shows.** The finding depended on those zone sets, and the paper must say so.

Neither result says anything about Amelia's living runtime.
