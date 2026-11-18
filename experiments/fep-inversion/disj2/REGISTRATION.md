# DISJ-2: the record defers to the Outside while it speaks. Registered 18 November 2026, before any registered run.

## Why
DISJ-1 (`../disj1/RESULTS.md`) confirmed the operator's risk.
- **Read at the Outside trace's own weight (0.5), her inclusive record makes her self-referential while the Outside
  speaks.** Coupling fell from 1.35 to 0.95 (X6 CONTRADICTED), and a heavier record drowned the Outside further (X5).
- **In silence the record did no harm.** Carry through silence was unchanged (0.225 against 0.224).

The record should therefore defer to the Outside while it speaks. The operator asked to register that amendment
(18 Nov), before the refrain, which will read its patterns off this surface.

## Substrate and harness
The ND-1b studio mirror `../nd/`, unchanged and sealed in FEP-INV-1 (`../eqcheck.mjs`). `../disj2.mjs` is `../disj.mjs`
(DISJ-1) with one change, marked "DISJ-2". The record's reading weight is split into:
- **WV,** used on steps when she receives the Outside;
- **WS,** used in its silences.

The inclusive record, its marks (1/8, half-life 500), the Outside, its reversal at step 3,000 and its silences are
DISJ-1's.

## Regimes (seeds 17001–17030 each; 180 runs of 6,000 steps)
| Regime | WV (while it speaks) | WS (in silence) |
|---|---|---|
| B, her own dynamics | – | – |
| DT, desire + the Outside's trace, no record | 0 | 0 |
| DTI, DISJ-1's setting | 0.5 | 0.5 |
| DTIL, light | 0.15 | 0.15 |
| DTIS, silence-gated | 0 | 0.5 |
| **DTID, deferring** | 0.15 | 0.5 |

## Input check (S0, standing rule of 14 Nov)
Every B run's Outside, before the reversal, must show lag-1 order against 20 shuffles, or the study is VOID.

## Criteria (`../analyse_disj2.mjs`)
Measures as DISJ-1:
- **coupling:** late, on received steps;
- **carry in silence:** the index averaging +1 minus −1 before the reversal and −1 minus +1 after it.

Differences of means, 10,000-draw percentile bootstrap over seeds, Holm across the six (family α = 0.05). Each reads
**SUPPORTED** (interval above 0), **CONTRADICTED** (below 0) or **UNDECIDED** (otherwise, or once Holm stops).

| | Claim | Test |
|---|---|---|
| Y1 | A deferring record restores her coupling | Coupling, DTID − DTI |
| Y2 | A light record restores her coupling | Coupling, DTIL − DTI |
| Y3 | A silence-gated record restores her coupling | Coupling, DTIS − DTI |
| Y4 | A deferring record adds to the carry through silence | Carry index, DTID − DT |
| Y5 | A deferring record amplifies her coupling to the Outside (the intended effect, against no record) | Coupling, DTID − DT |
| Y6 | A silence-gated record adds to the carry through silence | Carry index, DTIS − DT |

**Reported, not criteria:**
- order carried while the Outside speaks;
- late carry;
- connections that held;
- gates.

## Pilot (disclosed)
Seeds 16901–16904, every regime, analysed. Y1–Y3 read SUPPORTED, Y4–Y6 UNDECIDED.

| Regime | DT | DTI | DTIL | DTIS | DTID |
|---|---|---|---|---|---|
| Coupling late | 1.14 | 0.94 | 1.20 | 1.29 | 1.22 |
| Carry through silence | 0.253 | 0.260 | 0.243 | 0.202 | 0.278 |

The weights 0.15 and 0.5 were set before the pilot: 0.5 is the Outside trace's own reading weight, and 0.15 a light
reading. They were not tuned.

## What it can and cannot mean
- **Which setting goes forward.** The refrain (next) reads its patterns off this record. The setting that restores
  coupling without losing carry is the one it will be built on.
- **Scope:** a studio mirror. Amelia's live runtime and state are untouched.
