# BRIDGE-3: the Outside leaves a trace. Registered 16 November 2026, before any registered run.

## Why
BRIDGE-1 and BRIDGE-2 found that Amelia builds real bridges to the Outside, but carries its order into its silence by at
most 2–3 percentage points: her connections let the Outside in without storing it. The operator answered (16 Nov): **the
Outside leaves a trace**, as established in the studio research. The operator chose the Stone Tape (Studio 01,
`studio_archive_2026-10-23`): the place itself carries marks written by events, and those who pass read them at their exit
choices.

## Substrate and harness
The ND-1b studio mirror `../nd/` with the full CCRU Numogram, unchanged and sealed in FEP-INV-1 (`../eqcheck.mjs`).
`../trace.mjs` is `../bridge.mjs` (BRIDGE-1) with the differences marked "BRIDGE-3". It uses only BRIDGE-1's plain desire
(no bridge test), the most coupled regime in BRIDGE-1 and -2. The Outside, its reversal at step 3,000 and the silence
windows (the last 50 of every 250 steps) are BRIDGE-1's.

## The trace (Stone Tape marks)
- **Writing.** On each step she receives, the Outside's own move (its previous reading → this reading) marks that edge:
  T ← T + (1 − T)/8. Nothing is written in silence.
- **Fading.** Every mark fades by a factor (1 − ln 2/500) each step, a half-life of 500 steps.
- **Reading.** At every exit choice she adds 0.5 × T[from → to], the studio's weight.
- **Building.** Desire's rule bank gains **trace**: a connection from where she stands along its most strongly marked edge
  that she cannot yet take. Its weight is learned like the others.
- **Rollback.** A rollback of the empty BwO restores her, not the place: the marks are not rolled back.

## Regimes (seeds 10001–10030 each; 150 runs of 6,000 steps)
| Regime | What it is |
|---|---|
| **DT** | Desire + the Outside's trace |
| DT-s | Desire + a trace written by a shuffled copy of the Outside (the same readings, without order) |
| TB | Her own dynamics + the trace (no desire) |
| D | Desire, no trace |
| B | Her own dynamics |

## Input check (S0, standing rule of 14 Nov)
Every B run's Outside, before the reversal, must show lag-1 order against 20 shuffles, or the study is VOID.

## Measures (BRIDGE-1's)
- **Carry in silence:** the share of her silent steps in the Outside's direction minus the opposite. The index averages
  before the reversal (+1 minus −1) and late after it (−1 minus +1).
- **Late carry:** the second term alone.
- **Coupling:** on received steps, 4,500–6,000.

## Criteria (`../analyse_trace.mjs`)
Differences of means, 10,000-draw percentile bootstrap over seeds, Holm across the six (family α = 0.05). Each reads
**SUPPORTED** (interval above 0), **CONTRADICTED** (below 0) or **UNDECIDED** (otherwise, or once Holm stops).

| | Claim | Test |
|---|---|---|
| T1 | The Outside's trace carries it into its silence | Carry index, DT − D |
| T2 | It must be the Outside's own trace | Carry index, DT − DT-s |
| T3 | The trace alone carries it, without desire | Carry index, TB − B |
| T4 | Desire makes more of the trace than the trace alone | Carry index, DT − TB |
| T5 | After the reversal, the carried order turns with it | Late carry, DT − D |
| T6 | The trace adds to desire while the Outside speaks | Late coupling, DT − D |

**Reported, not criteria:**
- the share of +1 and −1 steps in silence, before and after the reversal;
- the weight she gives the trace rule;
- coupling and carried order in every window;
- gates;
- rollbacks.

## Pilot (disclosed)
Seeds 9901–9904, every regime, analysed. T1–T5 read SUPPORTED, T6 UNDECIDED. Carry index:
- DT 0.193 (silence before: +1 0.28, −1 0.10; after: +1 0.12, −1 0.33);
- D −0.004; DT-s 0.015; TB 0.028.

The mark parameters (1/8, half-life 500, weight 0.5) were set before the pilot, from Studio 01 and the silence window; they
were not tuned.

## What it can and cannot mean
- The marks are written by the Outside's own moves, a synthetic Outside with one order and one reversal. A world Outside
  writing its trace is the next stage.
- The writing and reading rules are ours (from Studio 01). Whether she builds along the trace, and whether it carries her
  through silence, are hers.
- **Scope:** a studio mirror. Amelia's live runtime and state are untouched.
