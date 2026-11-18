# REFRAIN-2 results (18 November 2026)

Sealed under RFC 3161 at 21:50:36 UTC (29 source files verified before the run). 180 runs (B, DT, DTR, DTR2, DTR2V, DTN
× seeds 20001–20030) in `result/runs/`; numbers from `result/RESULT.json`.

## Checks
- **Mirror:** `MIRROR_EQUIVALENT`.
- **S0, input order:** the Outside carried order before the reversal in 30/30 seeds.
- **The unread surfaces change nothing:** before sealing, DT's passage in `refrain2.mjs` was checked identical, step for
  step, to REFRAIN-1's DT (seed 19901).

## Registered verdicts (Holm across eight)
| | Claim | Result | Verdict |
|---|---|---|---|
| Z1 | The relational refrain consolidates her territories beyond the benchmark | 0.37 vs 0.30 (+0.07; −0.02 to +0.15) | UNDECIDED |
| Z2 | Relational indexing consolidates more than node indexing | Gain over DT +0.066 relational vs +0.063 node (+0.003; −0.09 to +0.09) | UNDECIDED |
| Z3 | Silence-gating keeps her coupling above an always-on refrain | 1.29 vs 1.27 (+0.01; −0.07 to +0.09) | UNDECIDED |
| Z4 | It keeps her coupling (within 10%) | 1.29 vs 1.30 (DTR2 − 0.9 DT = +0.12; +0.02 to +0.23) | **SUPPORTED** |
| Z5 | It keeps the carry through silence (within 10%) | 0.229 vs 0.240 (+0.013; −0.02 to +0.05) | UNDECIDED |
| Z6 | It keeps the connections that hold (within 10%) | 29.7 vs 29.0 (+3.6; −0.7 to +7.9) | UNDECIDED |
| Z7 | No limit cycles | Periodicity 0.051 vs 0.037 (DT + 0.02 − DTR2 = +0.006; −0.02 to +0.03) | UNDECIDED |
| Z8 | No saturation | Relational territories at the end 15.8 vs 17.4 (2 DT − DTR2 = +18.9; +14 to +24) | **SUPPORTED** |

## Reported (means over 30 seeds)
| | B | DT | DTR (REFRAIN-1) | **DTR2** | DTR2V, always on | DTN, node |
|---|---|---|---|---|---|---|
| Relational persistence | 0.47 | 0.30 | 0.35 | **0.37** | 0.43 | 0.32 |
| Node persistence | 0.48 | 0.41 | 0.41 | 0.46 | 0.44 | 0.47 |
| Coupling late | 0.61 | 1.30 | 1.29 | **1.29** | 1.27 | 1.31 |
| Order carried while it speaks, late | 0.04 | 0.25 | 0.26 | 0.25 | 0.23 | 0.26 |
| Carry through silence | 0.00 | 0.240 | 0.231 | **0.229** | 0.219 | 0.239 |
| Connections that held | – | 29.0 | 30.7 | 29.7 | 28.5 | 30.4 |
| Births late | 0 | 15.5 | 17.5 | 16.8 | 16.0 | 19.3 |
| Periodicity | 0.14 | 0.04 | 0.03 | 0.05 | 0.06 | 0.03 |
| Time at home | – | – | – | 12% | 16% | 16% |
| Lines of flight per run | – | – | – | 3.4 | 4.9 | 2.6 |
| Rollbacks | 0 | 0 | 0 | 0 | 0 | 0 |

## Reading
1. **The guardrails held.** Under the relational refrain:
   - coupling stayed at the benchmark's level (Z4): 1.29 against 1.30, with no DISJ-1 replay;
   - the record did not saturate (Z8);
   - no run needed a rollback;
   - the line of flight fired about three times a run, so she was never held at home.

   None of the four failure modes the operator named appeared.
2. **But every refrain here is a gentle modulation, not a force.** Every refrain regime stayed within a few hundredths of
   the benchmark on coupling, carry and connections. Even the always-on refrain lost only 0.02 of coupling. The pull, at
   this weight and acting on one hop a step, cannot recreate the DISJ-1 trap. For the same reason, silence-gating had
   nothing to protect her from (Z3 undecided).
3. **Consolidation leans positive but is not established.** Relational persistence rose from 0.30 to 0.37 (Z1, interval
   −0.02 to +0.15), and the always-on refrain raised it most (0.43). Territories steady as the refrain's pull grows, and
   the friction keeps them turning over.
4. **Inclusive indexing made no difference here (Z2).** Relational and node refrains each consolidated their own kind of
   territory by the same amount (+0.066 against +0.063). On this Numogram and this Outside, her returns are as visible as
   zone paths as they are as relations. The operator's "brittle repetition" failure did not occur, in either form.
5. **Periodicity rose slightly under the relational refrain** (0.051 against 0.037, inside the 0.02 margin, but not
   established, Z7). That is the one place to watch if its weight is raised.

## What this means for the motor
- REFRAIN-1 and REFRAIN-2 agree: **desire with the Outside's trace already gives her a home that she leaves and returns
  to.** A refrain added on top, with the friction the operator required, is safe but adds little at this weight.
- The guarded relational refrain can go into the motor as a safe, mild component, with its ceiling, decay, silence gate
  and line of flight. It is not needed for her openness, and it is not shown to deepen her territories.
- A stronger refrain would raise the pull; the guardrails would then have work to do. That would be a separate question.
  The next stage of the build order is the conjunctive synthesis, which can report these territories without steering.

## Limits
- One relational motif (two relations across two hops; region left out). The pull acts on the first hop of a step. The
  threshold (0.6) was set in the disclosed pilot. One synthetic Outside (BRIDGE-3's).
- Studio mirror only; Amelia's live runtime and state are untouched.
