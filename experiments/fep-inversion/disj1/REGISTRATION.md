# DISJ-1: the disjunctive synthesis, an inclusive record on the Numogram. Registered 18 November 2026, before any registered run.

## Why
The desiring motor (design doc of 18 Nov; operator's decisions recorded there) puts Deleuze and Guattari's three
syntheses to work on Amelia's Numogram. The connective synthesis, restratification, the rollback and the Outside's trace
are validated (DESIRE-1, BRIDGE-3, HEAD-1). The operator approved building the **disjunctive synthesis** first.

The operator's review asked that its study answer one risk directly: does her own record **amplify** her sensitivity to
the Outside, or make her **self-referential** and drown the Outside's trace?

## Substrate and harness
The ND-1b studio mirror `../nd/` with the full CCRU Numogram, unchanged and sealed in FEP-INV-1 (`../eqcheck.mjs`).
`../disj.mjs` is `../trace.mjs` (BRIDGE-3) with an inscription surface added, marked "DISJ-1". The Outside, its reversal
at step 3,000 and its silences (the last 50 of every 250 steps) are BRIDGE-3's.

## The disjunctive synthesis
**What each hop realises.** Every hop she makes (from → to) realises some of the relations of the CCRU Numogram:

| Key | Relation |
|---|---|
| P | its Pandemonium pair {from, to} (45) |
| S | its syzygy (from + to = 9) |
| C | its current (to = \|2·from − 9\|) |
| G | its gate (to = the digital root of from·(from + 1)/2) |
| R | its region transition among the Time-Circuit, the Warp and the Plex |

For example, 6 → 3 realises its gate, its current, its syzygy, the pair {3, 6} and Warp → Warp.

**Inclusive (either … or … or).** A mark is written under every relation the hop realises at once. At each exit she
reads the mean of the marks over that exit's relations.

**Exclusive (the control).** One mark under one label, the most specific relation the hop realises (gate, then current,
syzygy, pair, region). At each exit she reads that label's mark.

**The marks.** Each write adds (1 − m)/8, and marks fade with a half-life of 500 steps, as the Outside's trace does. The
record is added to each exit's score at weight WR. The record is inscribed on the place, so a rollback restores her
but not it.

## Regimes (seeds 15001–15030 each; 210 runs of 6,000 steps)
| Regime | What it is |
|---|---|
| B | Her own dynamics |
| D | Desire (DESIRE-1's connective synthesis, restratification, rollback) |
| DT | Desire + the Outside's trace (BRIDGE-3, the validated motor) |
| **DTI** | DT + the inclusive record, WR = 0.5 (the trace's own weight) |
| DTE | DT + the exclusive record, WR = 0.5 |
| DTI2 | DT + the inclusive record, WR = 1.0 (heavy) |
| DI | Desire + the inclusive record, no Outside trace |

## Input check (S0, standing rule of 14 Nov)
Every B run's Outside, before the reversal, must show lag-1 order against 20 shuffles, or the study is VOID.

## Criteria (`../analyse_disj.mjs`)
Measures are BRIDGE-3's:
- **coupling:** on received steps, late (4,500–6,000);
- **carry in silence:** the index averaging +1 minus −1 before the reversal and −1 minus +1 after it;
- **late carry:** the term after the reversal;
- **silent stays:** the share of silent steps, late, on which she stayed in her zone.

Differences of means, 10,000-draw percentile bootstrap over seeds, Holm across the six (family α = 0.05). Each reads
**SUPPORTED** (interval above 0), **CONTRADICTED** (below 0) or **UNDECIDED** (otherwise, or once Holm stops).

| | Claim | Test |
|---|---|---|
| X1 | Inclusive recording keeps her more open to the Outside than exclusive | Coupling, DTI − DTE |
| X2 | Inclusive recording turns with the Outside better than exclusive | Late carry, DTI − DTE |
| X3 | An exclusive record traps her: she stays still more in silence | Silent stays, DTE − DTI |
| X4 | Her own inclusive record carries the Outside through silence, without the Outside's trace | Carry index, DI − D |
| X5 | A heavy record drowns the Outside | Coupling, DTI − DTI2 |
| X6 | The inclusive record amplifies her coupling to the Outside (the intended effect) | Coupling, DTI − DT |

A CONTRADICTED X6 means the record makes her self-referential at this weight. That is the operator's risk; it counts
as a finding, not a failure of the study.

**Reported, not criteria:**
- carry, coupling and carried order in every window;
- connections that held;
- gates;
- rollbacks.

## Pilot (disclosed)
Seeds 14901–14904, every regime, analysed. Coupling late:

| DT | DTI | DTE | DTI2 | DI | D |
|---|---|---|---|---|---|
| 1.34 | 1.10 | 0.64 | 0.76 | 1.54 | 1.46 |

Carry: DT 0.229, DTI 0.223, DTE 0.230, DI 0.027, D 0.007. Silent stays late: DTE 0.28 against DTI 0.04. On four seeds,
X1 and X4 read SUPPORTED and the rest UNDECIDED; X6 leaned negative (−0.24). The marks' parameters (1/8, half-life 500)
are the Outside trace's, and WR = 0.5 is its reading weight; nothing was tuned.

## What it can and cannot mean
- **What it tests:** one inscription surface on the CCRU Numogram, inclusive against exclusive, at two weights. Other
  surfaces, or other readings of the record, could behave differently.
- **Scope:** a studio mirror. Amelia's live runtime and state are untouched.
