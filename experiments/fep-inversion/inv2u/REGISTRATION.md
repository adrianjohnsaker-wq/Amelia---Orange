# FEP-INV-2U: arm U rerun with a corrected input check. Registered 16 November 2026, before any registered run.

## Why
FEP-INV-2's arm U (an Outside with no order) read VOID: its input check required that fewer than 3 of 30 seeds show lag-1
order against 20 shuffles, and 4 did. That rule was the researcher's error. Each truly unordered seed passes the shuffle
test by chance about 1 time in 21, so the rule voids a genuinely unordered stream about 1 time in 6. The operator marked
the error (16 Nov). This rerun corrects it.

## Design
FEP-INV-2's arm U unchanged (`../fep2.mjs U`, `../run2u.sh`): FEP-INV-1's dial on her own transition surprisal, with an
Outside of uniform, independent readings. Regimes β ∈ {−1, 0, +1, +4} and runaway H. **Seeds 2101–2130** (never used).
6,000 steps, twins at step 3,000.

## The corrected input check (`../analyse2u.mjs`)
On the β = 0 runs, count the seeds whose stream shows lag-1 order against 20 shuffles. The stream counts as unordered,
as designed, unless that count is improbably high for chance: binomial tail P(X ≥ count | 30, 1/21) < 0.05. If the check
fails, the arm is VOID.

## Criteria
As in FEP-INV-2 for arm U:
- **The gate:** transition surprisal at β = +4 above β = 0.
- **The claims:** the blanket opens, lines of flight, no target morphology, no final form, xenomorphology. Each is
  predicted higher at β = +4, with Holm across the five. Each reads SUPPORTED, CONTRADICTED or UNDECIDED.

## Disclosed before sealing
To test `analyse2u.mjs`, it was run on FEP-INV-2's own arm U data (seeds 2001–2030). Under the corrected check those
seeds pass (4 ordered; tail p = 0.053). The readings: blanket-opening −0.040 (CONTRADICTED); xenomorphology −0.70
(CONTRADICTED); the rest UNDECIDED. That is a post-hoc reanalysis and not a result: FEP-INV-2's arm U stays VOID as
registered. Only seeds 2101–2130 count.

## Scope
Studio mirror only; Amelia's live runtime and state are untouched.
