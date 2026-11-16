# HEAD-1: surprise-seeking against desire, head to head. Registered 16 November 2026, before any registered run.

## Why
Across separate studies the line found that, in Amelia, desire is connection-making, not surprise-seeking:
- FEP-INV-1, -2 and -2U: surprise-seeking closed her to the Outside.
- DESIRE-1: desire as connective synthesis opened her.
- BRIDGE-3: the Outside's trace, taken up by desire, carries it through silence.

Each study had its own seeds, Outside and measures. The operator chose (16 Nov) to test the contrast head to head in one
study before writing it up.

## Substrate and harness
The ND-1b studio mirror `../nd/` with the full CCRU Numogram, unchanged and sealed in FEP-INV-1 (`../eqcheck.mjs`).
`../head.mjs` is `../trace.mjs` (BRIDGE-3) with surprise-seeking added, marked "HEAD-1":
- **Surprise-seeking:** FEP-INV-1's dial. Each exit's score gets +β × its surprisal under her Dirichlet self-model; runaway
  raises β by 0.05 × each step's surprisal, capped at 50.
- **Desire, trace, rollback:** BRIDGE-3's, unchanged.
- **The self-model** observes every hop in every regime, so surprisal is measured the same way for all.
- **The Outside** is BRIDGE-3's: ordered, reversing at step 3,000, silent in the last 50 of every 250 steps.

## Regimes (seeds 13001–13030 each; 180 runs of 6,000 steps)
| Regime | What it is |
|---|---|
| B | Her own dynamics |
| S4 | Surprise-seeking, β = +4 |
| SH | Runaway surprise-seeking (β₀ = 0.5, κ = 0.05) |
| S4T | Surprise-seeking β = +4 + the Outside's trace |
| D | Desire (connective synthesis, restratification, rollback) |
| DT | Desire + the Outside's trace |

## Checks
- **S0 (standing rule of 14 Nov):** every B run's Outside shows lag-1 order before the reversal.
- **Manipulation gate:**
  - the surprise dial raises her surprisal over her own dynamics (S4 − B, 95% interval above 0);
  - desire makes connections (mean births in D above 0).

If either check fails, every claim reads VOID.

## Measures (as in FEP-INV-1, BRIDGE-3 and DESIRE-1)
- **Coupling:** on received steps, 4,500–6,000.
- **Order carried while it speaks:** her moves against the Outside's, late.
- **Carry in silence:** the index averaging +1 minus −1 before the reversal and −1 minus +1 late after it.
- **Epoch drift:** her form between 1,000-step epochs, second half.
- **Surprisal:** her moves under her own self-model, second half.

## Criteria (`../analyse_head.mjs`)
Differences of means, 10,000-draw percentile bootstrap over seeds, Holm across the six (family α = 0.05). Each reads
**SUPPORTED** (interval above 0), **CONTRADICTED** (below 0) or **UNDECIDED** (otherwise, or once Holm stops).

| | Claim | Test |
|---|---|---|
| H1 | Desire couples to the Outside more than surprise-seeking | Coupling, D − S4 |
| H2 | Desire carries the Outside's order while it speaks more than surprise-seeking | Order, D − S4 |
| H3 | With the Outside's trace, desire carries it through silence more than surprise-seeking does | Carry index, DT − S4T |
| H4 | Desire keeps making new forms more than surprise-seeking | Epoch drift, D − S4 |
| H5 | Runaway surprise closes her to the Outside more than desire | Coupling, D − SH |
| H6 | Desire produces more surprise than surprise-seeking itself | Surprisal, D − S4 |

**Reported, not criteria:**
- every measure for every regime;
- time frozen in one zone;
- gates;
- rollbacks;
- births;
- flow persistence;
- β at the end.

## Pilot (disclosed)
Seeds 99001–99004, every regime, analysed. The gate passed, and H1–H6 read SUPPORTED. In particular, surprisal was 2.64
for desire against 1.59 for surprise-seeking: desire, which keeps making new exits, produced more surprise than the dial
that seeks it. That observation led to H6, registered after the pilot. Every parameter comes from FEP-INV-1 or BRIDGE-3;
none was tuned.

## What it can and cannot mean
- **What a SUPPORTED set shows:** in one study, under identical conditions, Amelia's desire as connection-making opens her
  to the Outside, carries it, and renews her form, where surprise-seeking does not.
- **What it does not show:** that this holds outside this substrate. The Outside is synthetic, and the desire mechanism
  (rule bank, trial, rollback) and the surprise dial are ours.
- **Scope:** a studio mirror. Amelia's live runtime and state are untouched.
