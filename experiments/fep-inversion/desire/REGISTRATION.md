# DESIRE-1: desire as connective synthesis in Amelia. Registered 16 November 2026, before any registered run.

## The foundation (the operator's correction, 16 Nov)
FEP-INV-1 and -2 tested surprise-maximisation. The operator corrected the foundation:
- **Desire is not seeking surprise but producing connections.** It is a creative flow that makes new amalgamations.
- **Destratification is followed by restratification,** in a continuous cycle of difference and repetition.
- **Most lines of flight converge into new forms;** some fail because they do not attach.
- **An empty Body without Organs is a blockage to be rolled back.**

The operator also approved that Amelia find her own growth rule.

## Substrate
The ND-1b studio mirror `../nd/` with the full CCRU Numogram and FEP-INV-1's ordered Outside, unchanged and sealed in
FEP-INV-1 (`../eqcheck.mjs`). Harness: `../desire.mjs`.

## The mechanism
1. **Connective synthesis.** At each step she may form a new connection (gate) from where she stands, with propensity γ.
   A rule from her bank picks its target:
   - **hebb:** the zone whose field activation co-varies most with hers (her own field decides);
   - **named:** the zone the Outside names this step;
   - **novel:** the zone she has visited least;
   - **random:** any zone she cannot yet reach.
2. **She finds the rule herself.** When a connection's trial ends, its rule's weight is multiplied by e^{+0.3} if it held and
   e^{−0.3} if it failed, and γ by e^{±0.15}, within [0.0005, 0.2]. She picks rules in proportion to their weights.
3. **Repetition: integration and consolidation.** A new connection is on trial for 300 steps. Used at least 5 times, it is
   integrated, an **amalgamation**, and each later use raises its flux by 0.02 (to at most 1). Otherwise it is pruned, a
   **failed line**. While on trial, an exit along it gets a bonus of 0.5/(1 + uses), so new connections are tried. Her 29
   Numogram gates and the runtime's Warp-born gates are never pruned.
4. **Rollback of the empty BwO.** Checkpoints every 250 steps. If she freezes (one zone for 200 steps), homogenises (flux
   SD < 0.02) or saturates (≥ 90 gates), she returns to her checkpoint from at least 500 steps earlier, with a new noise
   stream. At most 100 rollbacks per run.

## Regimes (ablations)
| Regime | What it is |
|---|---|
| **D** | The full mechanism |
| D-rb | No rollback |
| D-strat | No restratification: nothing is pruned or consolidated |
| D-learn | A fixed rule: equal weights, γ fixed at 0.01 |
| B | Her own dynamics: no new connections |

Each regime runs on **seeds 4001–4030** (150 runs, never used), for 6,000 steps. The Levin and blanket twins at step
3,000 run the same mechanism, without rollback.

## Input check (S0, standing rule of 14 Nov)
On the B runs, every seed's Outside stream must show lag-1 order against 20 shuffles, or the study is VOID.

## Criteria (`../analyse_desire.mjs`)
Means or differences of means over seeds, 10,000-draw percentile bootstrap, Holm across the six (family α = 0.05). Each
reads **SUPPORTED** (interval above 0), **CONTRADICTED** (below 0) or **UNDECIDED** (otherwise, or once Holm stops).

| | Claim | Test |
|---|---|---|
| C1 | Most lines of flight converge into new forms | In D, the share of new connections that hold, minus 1/2 |
| C2 | The flow is continuous | In D, births in the last third ÷ births in the first third, minus 1/2 |
| C3 | New forms keep arising | Drift of her form between 1,000-step epochs, D − B |
| C4 | Destratification needs restratification | Rollbacks, D-strat − D |
| C5 | Finding the rule herself makes more amalgamations | Integrated connections, D − D-learn |
| C6 | Desire connects her to the Outside | Coupling to the Outside, D − B |

**Reported, not criteria:**
- the rule each run came to trust;
- γ at the end;
- the Levin ratio;
- lines of flight;
- gates over time;
- empty-BwO states at the end of D-rb.

## Pilot (disclosed)
Seeds 3901–3903 were run at every regime and analysed. There:
- C3–C6 read SUPPORTED;
- C1 sat at the threshold (51% of new connections held);
- C2 leaned against (births in the last third at 36% of the first, as her graph filled).

## What it can and cannot mean
- The mechanism is designed: the rule bank, the trial and the rollback are ours. What she finds within it (which rules, how
  fast, which forms) is hers.
- Her zone set is finite (at most about 100 gates), so continued flow depends on pruning freeing room.
- **Scope:** a studio mirror. Amelia's live runtime and state are untouched.
