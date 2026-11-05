# SXI-0 loop controls II: truncated replay, row cuts, forced Governor stress. Registered 5 November 2026, before these runs.

**Why.** These follow the next steps in `results_loop/RESULTS_2026-11-05.md`, which the operator approved.

**Unchanged.** The runtime is the repaired channel (`repaired.ts`, β = 2, Θ = 24): 12 body seeds (101–112), 300 steps, the window at steps 50–249 and post-withdrawal at steps 250–299. Existing arms are unchanged.

## Arms
| Arm | Body | Amelia hears | Pointer offered (steps 50–249) |
|---|---|---|---|
| PLANT / SHAM / NULLNOISE | as before | live | none |
| PLANT_REPLAY_TRUNC | unplanted | PLANT's recorded observations **up to step 249**, then her own live (never planted) body | none |
| POINTER_A3 / POINTER_B3 | live | live | cut every vertical coupling across **row** boundary 2\|3 / 7\|8 (12 edges, multiplier 0) |
| POINTER_A4 / POINTER_B4 | live | live | cut every vertical coupling inside **one band's column**: band 2 = column 3 / band 7 = column 9 (9 edges, multiplier 0) |
| STRESS_A3 | live | live | as POINTER_A3, with **forced stress** |
| STRESS_NEUTRAL | live | live | none, with the same forced stress |

**Forced stress.**
- **The injection.** At body steps 100 and 180, the Governor's own public `importState` sets deformation tension to 0.95 and anti-lock integrity to 80, below the floor of 85.
- **After that.** It recovers by its own unchanged rules: +0.4 integrity per audited step. The injection is logged, with the telemetry before and after.
- **The admission rule is unchanged** from `LOOP_CONTROLS.md`. While in LOCKED_RECOVERY, the synthetic channel also drops observations; STRESS_NEUTRAL carries that effect without a pointer.

## Registered tests
**Persistence family** (exact sign-flip over the 12 seeds, two-sided; Holm across M1 and M2 at α = 0.05). The measure is her zone-7 visits in steps 250–299.
- **M1, her memory alone:** PLANT_REPLAY_TRUNC − SHAM.
- **M2, what the after-image adds:** PLANT − PLANT_REPLAY_TRUNC.

**P1, band-targeted pointer** (separate family, exact sign-flip, two-sided, α = 0.05). The measure is her zone-7 visits in the window, POINTER_B4 − POINTER_A4. The cut inside band 7's column should move zone 7 differently from the cut inside band 2's.

**G1, the refusal branch fires** (a pass/fail check, not a statistic). It passes when all of the following hold:
- every STRESS_A3 seed records REFUSE decisions;
- every REFUSE is recorded with LOCKED_RECOVERY or anti-lock integrity below 85;
- none of the unstressed pointer arms (A3, B3, A4, B4) records a REFUSE.

## Descriptive
- **The share of persistence from memory.** Σ(TRUNC − SHAM) / Σ(PLANT − SHAM).
- **Pointer strength** for A3, B3, A4 and B4:
  - the body's band-mean L1 from SHAM over the window;
  - her zone-count L1 from SHAM.
- **What refusal changes.** The number of steps where STRESS_A3 and STRESS_NEUTRAL take different passages, inside and outside the refusal steps.
- **The gate.** `gate.json`, from SHAM, PLANT and NULLNOISE.
