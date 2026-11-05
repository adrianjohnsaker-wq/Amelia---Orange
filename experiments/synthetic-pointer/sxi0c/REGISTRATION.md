# SXI-0 controls: sensitivity, attend rate, body-planted positive and null controls, seed independence

Registered 5 November 2026, before any of these runs.

**Scope.** This is SXI-0 engineering, on the reference morphogenetic field (`createReferenceField`, 12 × 10, CORAL_REEF, noise 0.003). Observations travel observer → Governor (`AmeliaOutsideRuntime`) → full 29-gate Numogram. Every run goes through `SyntheticCoordinator` and `SyntheticEvidenceLedger`. It is not SXI-1, a discovery, or a claim about the W+ body.

**Why.** Three findings from the ANTENNA series apply here:
- **She can lock into a loop.** Amelia can lock into 1 → 8 → 9 → 1 whatever her input.
- **Matched units can be one sample.** Near-identical travellers or twins behave as a single sample.
- **Detection must be calibrated.** No detection can be trusted without a planted positive control and a null.

The SXI-1 screen used an engineered score change and noted that the body-derived observation route was untested, and that seed independence was not established.

## Runs
- **Seeds.** Body seeds s = 101 … 112, so 12 seeds. Each run lasts **300 body steps**, and every body step is exactly one Amelia step, as the coordinator enforces.
- **Arms** (all start from the same seeded body):

| Arm | Procedure |
|---|---|
| SHAM | Neutral pointer; body observation submitted every step. |
| WITHHELD | Neutral pointer; observation **not** submitted (the coordinator's `submitObservation = false`). |
| PLANT | As SHAM, but during steps 50–249 every cell of band 7 (the columns that the observer maps to zone 7) has B set to 0.9 before each step. Each planting is visible in that step's `STEP_BEGIN` checkpoint (the recorded body carries B = 0.9) and is listed in the run's metrics file. The ledger's complete-run verifier admits only coordinator record kinds, so no extra record kind is added. This is a **planted** organisation, and it reaches Amelia only through the observer. |
| NULLNOISE | As SHAM, with body seed s + 5000: the same procedure, a different natural body. |
| POINTER_A | Weakened couplings (multiplier 0.3) on 10 horizontal edges, rows 0–1, columns 0–5, during steps 50–249, then restored. |
| POINTER_B | The same, with columns 6–11. |

- **Ledger handling.** Each ledger is verified (`verifyLedger`, `requireComplete`) before its metrics are read. Afterwards the event journal, its head and a receipt are kept. The checkpoint files are deleted after verification, except one complete exemplar run (SHAM, seed 101).

## Measures (from verified `STEP_COMMITTED` records)
- **Dispositions.** The share of submitted observations the Governor ATTENDs and applies, DEFERs or REFUSEs.
- **Decisive rate.** The share of steps at which the winning gate *without* the attention component differs from the realised winner, recomputed from the recorded components.
- **Loop share.** The share of transitions on 1→8, 8→9 or 9→1.
- **Zone-7 visits.** Visits to zone 7 in steps 50–249 and in steps 250–299.
- **Paired divergence (WITHHELD vs SHAM).** The first step at which the passages differ, and the share of steps that differ.
- **Seed independence.** For SHAM, the share of identical transitions between every pair of seeds, and the number of distinct SHAM paths.

## Decisions (exact sign-flip over the 12 seeds: 2¹² = 4096 sign vectors, one-sided)
- **Positive control (passes iff).** For d = zone-7 visits in steps 50–249, PLANT − SHAM, the sign-flip p is ≤ 0.01 **and** d > 0 in at least 10 of 12 seeds.
- **Null control (passes iff).** For the same statistic, NULLNOISE − SHAM, p > 0.05.
- **Sensitivity (reported, not a pass or fail).** Attend rate, decisive rate, paired divergence and loop share.
  - **Decisive rate below 1%** is flagged as "the body signal does not steer her".
  - **Loop share above 50%** is flagged as "locked".
- **POINTER_A and POINTER_B.** Descriptive only: the same measures, plus an exact within-seed permutation over arm labels, comparing their zone-visit distributions with SHAM's.
- **If seeds are not independent,** for example most SHAM paths identical, the effective number of seeds is reported, and the sign-flip tests are marked as not valid at nominal level.
