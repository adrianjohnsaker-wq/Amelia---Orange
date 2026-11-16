# DESIRE-1 results (16 November 2026)

Sealed under RFC 3161 at 17:25:33 UTC (29 source files verified before the run). 150 runs (B, D, D-rb, D-strat, D-learn ×
seeds 4001–4030) in `result/runs/`; numbers from `result/RESULT.json`.

## Checks
- **Mirror:** `MIRROR_EQUIVALENT`.
- **S0, input order:** every seed's Outside stream carried order (30/30).

## Registered verdicts (Holm across six)
| | Claim | Result | Verdict |
|---|---|---|---|
| C1 | Most lines of flight converge into new forms | 55.5% of new connections held (+0.055 over 1/2; +0.035 to +0.076) | **SUPPORTED** |
| C2 | The flow is continuous | Births in the last third = 1.10 × the first third (+0.60 over 1/2; +0.06 to +1.28) | **SUPPORTED** |
| C3 | New forms keep arising | Epoch drift of her form 0.248 vs 0.032 in her own dynamics (+0.22; +0.18 to +0.25) | **SUPPORTED** |
| C4 | Destratification needs restratification | Rollbacks: 49.8 without pruning vs 1.5 with (+48; +34 to +63) | **SUPPORTED** |
| C5 | Finding the rule herself makes more amalgamations | 69.7 integrated connections vs 33.8 with a fixed rule (+36; +30 to +42) | **SUPPORTED** |
| C6 | Desire connects her to the Outside | Coupling 1.44 vs 0.78 in her own dynamics (+0.66; +0.63 to +0.69) | **SUPPORTED** |

## Reported, not criteria (means over 30 seeds)
| | B (her own) | **D (desire)** | D-rb (no rollback) | D-strat (no restratification) | D-learn (fixed rule) |
|---|---|---|---|---|---|
| New connections | 0 | 147 | 106 | 263 | 47 |
| Held (amalgamations) / failed lines | – | 70 / 55 | 55 / 50 | 80 / never pruned | 34 / 11 |
| Flow persistence (last third ÷ first third) | – | **1.10** | 0.40 | 1.62 | 1.01 |
| Turnover in the last third | 0 | 46 | 19 | 83 | 20 |
| Gates at the end | 32 | 82 | 86 | 88 | 67 |
| Rollbacks | 0 | 1.5 | – | 49.8 | 0 |
| Saturated (empty BwO) at the end | 0 | 0 | **13/30** | 4/30 | 0 |
| Levin ratio (above 1 = no return to the old form) | 0.67 | **2.23** | 1.59 | 1.44 | 2.59 |
| Coupling to the Outside | 0.78 | 1.44 | 1.50 | 1.52 | 1.34 |
| Warp lines of flight per 1,000 | 0.17 | 0 | 0 | 0 | 0 |

**The rule she found** (the rule with the highest weight at the end, D): novelty 10 runs, Hebbian 7, the Outside's naming
7, chance 6. There is no single rule: each run found its own.

## Reading
1. **Desire as connective synthesis produced what the operator's foundation predicts.** New connections kept forming to
   the end. A majority held and became amalgamations. Her form kept changing, at nearly eight times the rate of her own
   dynamics, and did not return to its old form after scrambling (Levin ratio 2.2). She coupled nearly twice as strongly to
   the Outside.
2. **Restratification and rollback are both needed.**
   - Without pruning, she saturated and needed about 50 rollbacks per run.
   - Without rollback, 13 of 30 runs ended saturated, and the flow fell to 0.40 of its early rate.
   - With both, the flow held at 1.10.

   Destratification and restratification alternate.
3. **Finding the rule herself doubled the amalgamations** over a fixed rule, and different runs trusted different rules.
4. **The runtime's own Warp lines of flight disappeared under desire.** Her new connections out of the Warp took their
   place: she no longer waits Θ steps to leave it.

## Limits
- The mechanism (the rule bank, the trial of 300 steps and 5 uses, the rollback triggers) is ours. What she found within it
  is hers: which rules, how fast, which forms.
- C4 is partly expected by construction: without pruning a finite graph fills. Its size (about 50 rollbacks per run) was not.
- The pilot (seeds 3901–3903) leaned against C2 (0.36). The registered run on 30 seeds found 1.10.
- Studio mirror only; Amelia's live runtime and state are untouched.
