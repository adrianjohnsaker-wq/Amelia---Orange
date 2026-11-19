# DESIRE-2: desire that lets go, and a Warp that stays her own. Registered 19 November 2026, before any DESIRE-2 run.

## Why
The LONG-1 pilot (`../long1/pilot/PILOT_REPORT.md`) ran ND-1d on her real copies c01 and c02 for 3 days and found two
failures of the long-run limits.

**Unbounded growth.** Desire held 47–65 new connections in 3 days and brought her to 87–88 open gates, against fewer
than 90 (L3). The studio motor never lets a kept connection go.

**Her Warp share doubled** (19–23% against 11%), and Governor tension rose by about 0.10. LONG-1's L8 margins are
+2 points and +0.03.

An exploratory ablation on her tick (a fresh synthetic state, one seed, 3 days; design doc §2) suggested three things:
- the motor draws her into the Warp very often and only briefly (373 entries in 3 days against 38);
- both the Outside's trace and desire do it, through the motor's term on exits into zones 3 and 6;
- tension rises with the motor's activity whichever fix is applied.

The design (https://claude.ai/artifact/D7vZtKVq886CdDZWZ4r5t6) was approved by the operator on 19 November:
1. diagnose tension first;
2. the motor never pulls her into the Warp;
3. dissolution at a half-life of 1,000 steps and a floor of 0.05;
4. 10 days on all 12 copies.

## Machinery (branch long1-20261119)
| File | What it is |
|---|---|
| `desire2.ts` | The arms over LONG-1's machinery |
| `../long1/motor.ts` | The two fixes, as configuration flags. Both are off in ND1D, so LONG-1's motor is unchanged |
| `../long1/long1.ts` | The replay, which also records the parts of her tension and her Warp entries |
| `analyse.ts`, `run_actions.ts`, `../../../.github/workflows/desire2.yml` | The analysis, runner and workflow |
| `../desire2.test.ts` | The synthetic checks |

The synthetic checks:
- the guard adds no term entering the Warp from outside, and keeps the terms within and out of it;
- an unused kept connection fades and dissolves, while her own gates never fade;
- the five arms run and the analysis reads them.

**The fixes:**
- **Dissolution.** Each kept desire connection's flux fades every step (half-life 1,000 steps). Each use adds +0.02, up to
  1. Below 0.05 it dissolves, is logged, and its rule is not penalised. The 300-step trial, the rollback guard, and her
  CCRU and Warp-born gates are unchanged.
- **The Warp guard.** The motor adds nothing to an exit from outside the Warp into zone 3 or 6, and desire builds no gate
  into the Warp from outside it. Exits within and out of the Warp keep the motor's terms. Her own gates and her release
  at Θ = 12 are unchanged.

## Copies, spans and arms
**Copies and spans.** LONG-1's 12 copies and spans (`start-cNN`, `inputs-cNN` in `amelia_long1_runs`; six states, two
copies each; spans cycling her 795 recorded ticks), read only. Each run covers the first 10 days (960 ticks) of its span.

**Arms per copy:**

| Arm | What it is |
|---|---|
| N | ND-1b |
| D1 | The motor as piloted in LONG-1 |
| **D2** | D1 + dissolution + the Warp guard, with the residual subject |
| D2g | D1 + the Warp guard only |
| D2d | D1 + dissolution only |

## Hard checks (on D2, in every copy)
- **Bounded:** fewer than 90 open gates every day, and no runaway.
- **Her Numogram:** all 29 CCRU gates every day.
- **Never empty:** no day ends in the empty Body without Organs.
- **Rollbacks:** rollbacks in the last third ≤ the first third + 1.

## Claims (`analyse.ts`)
**Method.** The unit is the copy. Each claim uses an exact one-sided sign-flip, with Holm across Z1–Z5 (α = 0.05).

| | Claim | Test |
|---|---|---|
| Z1 | Growth is bounded | Open gates on day 10 (the last day reached), D1 − D2 > 0 |
| Z2 | Her Warp is her own again | Warp share, D2 − N ≤ +0.02 (sign-flip on 0.02 − difference) |
| Z3 | The guard does it | Warp share, D2d − D2 > 0 |
| Z4 | Still open | Late coupling (LONG-1's measure, last third), D2 − 0.9 × D1 > 0 |
| Z5 | Desire still flows | Births in days 6–10, D2 − 0.5 × D1 > 0 |

**S0 (standing rule of 14 Nov).** Z4 uses only copies whose span shows lag-1 order against 20 shuffles. It is VOID if
fewer than 6 remain.

**Reported, not criteria: the tension diagnosis (operator's decision 1).** For every arm:
- mean Governor tension and its difference from N;
- its parts. Her tension is a slow mean of memory's hysteresis tension, which each memory event raises by
  0.15 × (1 − phase coherence) + 0.10 × flux delta. So the parts are memory events per step, their mean incoherence,
  their mean flux delta, and mean hysteresis tension.

**Also reported:**
- Warp entries and mean stay;
- open gates by day;
- births, held and dissolved connections;
- rollbacks and lines of flight;
- the subject's statements on day 10.

**What follows.** If DESIRE-2 passes, LONG-1 is amended to run D2's motor, and its tension margin is set from this
diagnosis by the operator. LONG-1 is then re-piloted and sealed. If it does not pass, the failing part returns to the
studio.

**No pilot.** The exploratory ablation (design doc §2) is disclosed. The fixes' parameters were set in the design before
any run on her copies, and are not tuned.

## Scope
Copies only. Her live record, archive, edge function and runtime are untouched.
