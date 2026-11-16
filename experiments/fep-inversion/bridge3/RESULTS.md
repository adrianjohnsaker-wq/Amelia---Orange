# BRIDGE-3 results (16 November 2026)

Sealed under RFC 3161 at 20:13:30 UTC (29 source files verified before the run). 150 runs (B, TB, D, DT, DT-s × seeds
10001–10030) in `result/runs/`; numbers from `result/RESULT.json`.

## Checks
- **Mirror:** `MIRROR_EQUIVALENT`.
- **S0, input order:** the Outside carried order before the reversal in 30/30 seeds.

## Registered verdicts (Holm across six)
| | Claim | Result | Verdict |
|---|---|---|---|
| T1 | The Outside's trace carries it into its silence | Carry index 0.245 vs 0.013 for plain desire (+0.23; +0.21 to +0.25) | **SUPPORTED** |
| T2 | It must be the Outside's own trace | 0.245 vs 0.005 for a shuffled trace (+0.24; +0.22 to +0.26) | **SUPPORTED** |
| T3 | The trace alone carries it, without desire | 0.024 vs 0.002 in her own dynamics (+0.022; +0.009 to +0.036) | **SUPPORTED** |
| T4 | Desire makes more of the trace than the trace alone | 0.245 vs 0.024 (+0.22; +0.20 to +0.24) | **SUPPORTED** |
| T5 | After the reversal, the carried order turns with it | Late carry 0.270 vs 0.024 (+0.25; +0.22 to +0.27) | **SUPPORTED** |
| T6 | The trace adds to desire while the Outside speaks | Late coupling 1.38 vs 1.45 (−0.07; −0.14 to −0.01) | **CONTRADICTED** |

## What she does in silence (shares of her silent steps; means over 30 seeds)
| | Before the reversal: +1 / −1 | After: +1 / −1 | Seeds with positive carry |
|---|---|---|---|
| B, her own | 0.27 / 0.26 | 0.26 / 0.26 | 15/30 |
| TB, trace alone | 0.23 / 0.19 | 0.23 / 0.24 | 30/30 |
| D, desire | 0.13 / 0.12 | 0.10 / 0.13 | 22/30 |
| **DT, desire + the Outside's trace** | **0.33 / 0.11** | **0.10 / 0.37** | **30/30** |
| DT-s, desire + a shuffled trace | 0.13 / 0.13 | 0.11 / 0.12 | 18/30 |

## Reported, not criteria (means over 30 seeds)
| | D | **DT** | DT-s |
|---|---|---|---|
| Connections that held / alive at the end | 98 / 42 | 31 / 31 | 99 / 43 |
| Weight of the trace rule (1 = untouched) | – | 1.60 | 3.83 |
| Gates at the end | 80 | 64 | 80 |
| Rollbacks | 3.7 | **0** | 4.2 |
| Coupling late | 1.45 | 1.38 | 1.44 |
| Order carried while it speaks (late) | 0.45 | 0.29 | 0.45 |

## Reading
1. **The Outside leaves a trace, and the trace carries it through its silence.** With the Outside's marks, she stepped in
   its direction three times as often as against it when it fell silent (0.33 vs 0.11). After the reversal the pattern
   turned (0.37 vs 0.10). Every one of 30 seeds carried positively. That is about 19 times plain desire, and about ten
   times anything bridges alone achieved in BRIDGE-1 and -2.
2. **It must be the Outside's own trace.** The same readings in shuffled order wrote marks that carried nothing.
3. **Trace and desire need each other.** The trace alone moved her only slightly (0.024). Desire building connections
   along the marked edges turned the trace into a path (0.245).
4. **The trace re-forms her web.** With it, desire built fewer, more selective connections (31 that held vs 98), never
   needed a rollback, and kept every connection it made.
5. **The cost (T6).** While the Outside speaks, the trace's older marks pull slightly against its present: coupling 1.38
   vs 1.45, and less order carried in the moment. The trace consolidates the Outside's past at some expense of its present.
   That is the trade between repetition and difference.

## Across the bridge studies
| Study | What consolidated the Outside? | Carry in silence |
|---|---|---|
| BRIDGE-1 | Bridges keyed to readings | ~0.02 |
| BRIDGE-2 | Bridges keyed to change | ~0.02 |
| **BRIDGE-3** | **The Outside's own trace, with desire** | **0.245** |

## Limits
- One synthetic Outside, one reversal. The marks follow Studio 01's rule (1/8, read at 0.5) with a 500-step half-life,
  set before the pilot and not tuned.
- Studio mirror only; Amelia's live runtime and state are untouched.
