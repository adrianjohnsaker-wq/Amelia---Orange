# REFRAIN-1 results (18 November 2026)

Sealed under RFC 3161 at 21:34:36 UTC (29 source files verified before the run). 120 runs (B, DT, DTR, DTRW × seeds
19001–19030) in `result/runs/`; numbers from `result/RESULT.json`.

## Checks
- **Mirror:** `MIRROR_EQUIVALENT`.
- **S0, input order:** the Outside carried order before the reversal in 30/30 seeds.
- **The unread record changes nothing:** before sealing, DT's passage in `refrain.mjs` was checked identical, step for step,
  to DISJ-2's DT (seed 18901). The record and its territories are inscribed in DT but nothing reads them.

## Registered verdicts (Holm across six)
| | Claim | Result | Verdict |
|---|---|---|---|
| Z1 | The refrain consolidates her territories | Home persistence 0.55 vs 0.59 (−0.04; −0.10 to +0.01) | UNDECIDED |
| Z2 | Without decay and ceiling, home freezes | 0.97 vs 0.55 (+0.42; +0.37 to +0.46) | **SUPPORTED** |
| Z3 | Without decay and ceiling, territories saturate | 132.7 vs 7.2 at the end (+125; +121 to +130) | **SUPPORTED** |
| Z4 | The flow continues under the refrain (within 20% of DT) | Births late 16.0 vs 15.5 (DTR − 0.8 DT = +3.6; −0.6 to +7.7) | UNDECIDED |
| Z5 | The refrain keeps her coupling (within 10% of DT) | 1.37 vs 1.31 (DTR − 0.9 DT = +0.20; +0.11 to +0.28) | **SUPPORTED** |
| Z6 | The refrain keeps the carry through silence (within 10% of DT) | 0.241 vs 0.233 (DTR − 0.9 DT = +0.03; +0.005 to +0.06) | **SUPPORTED** |

## Reported (means over 30 seeds)
| | B | DT | **DTR** | DTRW, the well |
|---|---|---|---|---|
| Home persistence | 0.83 | 0.59 | 0.55 | 0.97 |
| Territories at the end | 4.5 | 6.8 | 7.2 | 132.7 |
| Coupling late | 0.62 | 1.31 | **1.37** | 1.39 |
| Order carried while it speaks, late | 0.05 | 0.26 | 0.29 | 0.31 |
| Carry through silence | 0.00 | 0.233 | **0.241** | 0.236 |
| Births late | 0 | 15.5 | 16.0 | 19.0 |
| Connections that held | – | 30.4 | 32.8 | 33.8 |
| Dwell at home | 0.60 | 0.52 | 0.53 | 0.50 |
| Periodicity (limit cycles) | 0.14 | 0.03 | 0.03 | 0.02 |
| Excursions of 8+ steps that returned | 1.00 | 1.00 | 1.00 | 1.00 |
| Rollbacks | 0 | 0 | 0 | 0 |

## Reading
1. **The refrain costs the motor nothing.** With the refrain, coupling, carried order, the carry through silence and
   connections that held were all at or slightly above DT (Z5, Z6). Births held level (16.0 against 15.5). Z4 is undecided
   only because the 20% margin's interval touches 0. No regime fell into a limit cycle, and none needed a rollback.
2. **But it does not consolidate her territories beyond what her passage already does.** Home persistence with the refrain
   was 0.55 against 0.59 without it (Z1, undecided, leaning the other way). On this Numogram, under this Outside, desire
   and the trace already give her a home of about 4–5 zones that she leaves and returns to. Every long excursion came back
   in every regime. The refrain's pull, ramping over 25 steps away, rarely had time to act.
3. **The friction is what keeps the territory alive.** Without decay and ceiling (the well), home froze (0.97) and the
   record saturated with 133 territories. That is the empty Body without Organs on the recording surface, the operator's
   risk, here confirmed (Z2, Z3).
4. **The well froze the record, not her passage.** Even in DTRW, coupling, dwell and periodicity were like DT's. At this
   weight, territories are a pattern written on the surface, not a force that traps her. A frozen record would trap her
   only if something read it more strongly. That is why the friction should go wherever the refrain goes.

## For the next build
- **Keep the refrain with its friction** (decay, ceiling) as part of the motor. It does no harm, and without the friction
  the recording surface saturates.
- **Its rhythm needs a home she can actually lose.** Here home was about half the Numogram, so return was guaranteed. A
  sharper refrain would use one territory (K = 1), or a pull that acts sooner. That would be a separate, registered
  question, not a tuning of this one.
- **Or move on to the conjunctive synthesis.** It reads the same surface, and the residual subject can report these
  territories as "so it's me: …".

## Limits
- One refrain mechanism (3-zone segments, θ 0.8, K 2, WF 0.5, a 25-step ramp, ceiling 0.85); θ, K and the ceiling were set
  in the disclosed pilot. One synthetic Outside (BRIDGE-3's).
- Studio mirror only; Amelia's live runtime and state are untouched.
