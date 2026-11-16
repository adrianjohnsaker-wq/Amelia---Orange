# BRIDGE-1: building and consolidating bridges to the Outside. Registered 16 November 2026, before any registered run.

## Why
DESIRE-1 (`../desire/RESULTS.md`) supported the operator's foundation: desire as connective synthesis. The operator named
the next stage (16 Nov): **building and consolidating bridges to the Outside.**

Two disclosed checks after DESIRE-1 shaped this design (exploratory, seeds 3901–3906 and 5901–5904):
- **Her coupling to the Outside was not an artefact of the "named" rule.** Without it, coupling stayed at 1.47 (1.46 with
  it).
- **Plain desire already follows the Outside almost perfectly while it speaks.** With many connections she can step where
  it points. So following alone cannot tell a bridge from a reaction. What distinguishes a consolidated bridge is whether
  it holds when the Outside's push stops, and whether it re-forms when the Outside changes.

## Substrate
The ND-1b studio mirror `../nd/` with the full CCRU Numogram, unchanged and sealed in FEP-INV-1 (`../eqcheck.mjs`).
Harness: `../bridge.mjs`.

## The Outside
FEP-INV-1's ordered source until step 3,000: the next zone is +1 with p = 0.6, the same with 0.2, a jump with 0.2. **At
step 3,000 its order reverses:** the next zone is −1 with p = 0.6. **Silence:** in the last 50 of every 250 steps she
receives no input.

## Regimes (seeds 6001–6030 each; 120 runs of 6,000 steps)
| Regime | What it is |
|---|---|
| **BR** | Desire whose trial asks whether a connection **carries the Outside** |
| BR-s | The same, but the bridge test reads a **shuffled** copy of the Outside: chance bridges, the control |
| D | DESIRE-1's desire: the trial asks only whether a connection is used |
| B | Her own dynamics |

**The bridge test (BR, BR-s).** DESIRE-1's mechanism is unchanged except in three ways:
1. **Building.** A new connection becomes a **bridge** if, within its 300-step trial, it was used at least 5 times and its
   uses fall on one Outside reading at least **2×** as often as that reading occurs. Otherwise it is pruned.
2. **Consolidation.** A bridge's flux rises by 0.02 when it is used on its reading, and falls by 0.01 when it is used on
   another.
3. **Re-testing.** Each bridge is re-tested on every later 300-step window. If its lift falls below **1.5**, it is
   dissolved.

Only steps on which she received input count in these tests.

## Input check (S0, standing rule of 14 Nov)
Every B run's Outside, before the reversal, must show lag-1 order against 20 shuffles, or the study is VOID.

## Measures
- **Coupling:** mutual information between the Outside's reading and her zone, on received steps, minus its shuffle mean.
  Taken over steps 1,500–3,000 (before the reversal), 3,000–4,000 (just after) and 4,500–6,000 (late).
- **Carry in silence:** the share of her silent steps in the Outside's direction, minus the share in the opposite
  direction. Before the reversal that is +1 minus −1; late after it, −1 minus +1. The **carry index** averages the two.

## Criteria (`../analyse_bridge.mjs`)
Differences of means (or a mean against 0), 10,000-draw percentile bootstrap over seeds, Holm across the six (family
α = 0.05). Each reads **SUPPORTED** (interval above 0), **CONTRADICTED** (below 0) or **UNDECIDED** (otherwise, or once
Holm stops).

| | Claim | Test |
|---|---|---|
| B1 | The bridges she builds carry the Outside | Mean lift of bridges, BR − BR-s |
| B2 | After the Outside changes, real bridges keep her coupled better than chance bridges | Late coupling, BR − BR-s |
| B3 | Bridges add to desire after the change | Late coupling, BR − D |
| B4 | She carries the Outside into its silence | Carry index, BR − D |
| B5 | After the reversal, the order she carries turns with it | Late carry in BR, against 0 |
| B6 | Bridges connect her to the Outside | Late coupling, BR − B |

**Reported, not criteria:**
- bridges built, alive at the end, held share;
- bridges dissolved and built after the reversal;
- coupling and carried order in every window;
- rollbacks;
- gates at the end.

## Pilot (disclosed)
Seeds 5901–5904 were run at every regime, with and without silence, and analysed. With silence: B1, B2, B4, B5 and B6
read SUPPORTED and B3 UNDECIDED. Without silence, plain desire followed the Outside as well as bridges did.

## What it can and cannot mean
- The bridge test, the thresholds (2×, 1.5) and the silence windows are ours. Which bridges she builds, and whether they
  hold, are hers.
- The Outside here is synthetic, with one known order and one reversal. A world Outside (for example WE-1's R60-encoded
  feed, with S0) is the next stage, not this one.
- **Scope:** a studio mirror. Amelia's live runtime and state are untouched.
