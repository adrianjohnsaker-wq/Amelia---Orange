# WORLD-1 results (16 November 2026)

Sealed under RFC 3161 at 20:33:40 UTC (32 files, including the world data, verified before the run). 150 runs (B, TB, D,
DT, DT-s × seeds 11001–11030) in `result/runs/`; numbers from `result/RESULT.json`.

## Checks
- **Mirror:** `MIRROR_EQUIVALENT`.
- **S0, input order:** every world window carried lag-1 order (30/30).

## Registered verdicts (Holm across six)
| | Claim | Result | Verdict |
|---|---|---|---|
| W1 | The world's trace carries it into its silences (DT − D) | 0.163 vs 0.177 (−0.014; −0.061 to +0.031) | UNDECIDED |
| W2 | It must be the world's own trace (DT − DT-s) | 0.163 vs −0.072 (+0.235; +0.179 to +0.293) | **SUPPORTED** |
| W3 | The world's trace alone carries it, without desire (TB − B) | 0.610 vs 0.792 (−0.18; −0.26 to −0.11) | **CONTRADICTED** |
| W4 | Desire makes more of the world's trace than the trace alone (DT − TB) | 0.163 vs 0.610 (−0.45; −0.51 to −0.39) | **CONTRADICTED** |
| W5 | She carries the world beyond its persistence (moves only, DT − DT-s) | −0.018 vs −0.180 (+0.16; +0.13 to +0.19) | **SUPPORTED** |
| W6 | The world's trace adds to desire while the world speaks (coupling, DT − D) | 1.48 vs 1.30 (+0.18; +0.13 to +0.24) | **SUPPORTED** |

## Reported (means over 30 seeds)
| | B, her own | TB, trace alone | D, desire | **DT, desire + world trace** | DT-s, shuffled trace |
|---|---|---|---|---|---|
| World carry, all silent steps | **0.79** | 0.61 | 0.18 | 0.16 | −0.07 |
| World carry, moves only | 0.15 | −0.06 | 0.10 | −0.02 | −0.18 |
| Silent steps on which she stayed | 17% | 47% | 3% | 6% | 3% |
| Coupling late | 0.63 | 0.58 | 1.30 | **1.48** | 1.40 |
| Weight of the trace rule | – | – | – | **1,729** | 747 |
| Seeds with positive carry | 30 | 30 | 30 | 29 | **5** |
| Rollbacks | 0 | 0 | 4.8 | 0.1 | 0.0 |

## Reading
1. **The measure's zero is not "no carry".** Her own dynamics (B), with no trace and no desire, score highest. The world's
   order is mostly persistence, strongest at zones 1 and 9. Her CCRU Numogram already dwells at 1 and 9 (two of its four
   self-edges), so her own architecture resembles the world's form before any trace. Desire moves her almost everywhere
   and rarely lets her stay (3% of silent steps), which lowers the score. W1, W3 and W4 therefore partly compare how much
   she stays, not how much world she carries. W3 and W4 are recorded as contradicted under the registered test; they do
   not show that the trace carries nothing.
2. **Against the clean control, the world's trace is real.** A trace of the same readings without the world's order
   left her silent moves running against the world's transitions (−0.07; positive in only 5 of 30 seeds). The world's own
   trace carried it (+0.16; positive in 29 of 30). The difference holds **beyond persistence** (W5: on moves only, −0.02
   vs −0.18). What she carries in silence is the world's order, not its frequencies.
3. **On the world, the trace also helps her follow it while it speaks** (W6: coupling 1.48 vs 1.30). The synthetic
   Outside showed the opposite (BRIDGE-3, T6). On the world, its trace and its present agree more than a reversing
   Outside's did.
4. **She trusts the world's trace.** The trace rule's weight rose to about 1,700 (747 for the shuffled trace), and desire
   with the world's trace almost never needed a rollback.

## Lessons for the next test
- Score world carry against each run's own expectation (for example against the same regime run with a shuffled trace,
  or as a difference from her own dynamics' silent behaviour), not against zero or against regimes that stay more.
- A fresh world span (after WE-1 has used its window) would test W2, W5 and W6 again on new data.

## Limits
- The 30 windows overlap one 10-day span of the world (4–13 Nov).
- The world's order is ordinary: markets and the sun holding their level. A positive result is the trace path working on
  the world, not a message, an outside intelligence or agency.
- Studio mirror only; Amelia's live runtime and state are untouched.
