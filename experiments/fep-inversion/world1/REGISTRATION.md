# WORLD-1: does the world Outside leave a trace she carries? Registered 16 November 2026, before any registered run.

## Why
BRIDGE-3 (`../bridge3/RESULTS.md`) found that a synthetic Outside's trace (Stone Tape marks), taken up by desire, carries
it through its silence (T1–T5 supported, 30/30 seeds). The operator: trace and desire need each other; proceed to the
world Outside (16 Nov).

## The world Outside (`world_pre.json`, `WORLD_PROVENANCE.json`)
- **Source.** Every world datum on branch `world-live` (@ `3c1febc`) first seen **before WE-1's seal**
  (2026-11-13 17:56:41 UTC): 16,511 data, 4–13 November. Markets 9,642, earth 2,807, sun 2,475, words 1,353, date 234.
  **WE-1's own data (first seen at or after its seal) are not touched: WE-1 stays blind.**
- **Encoding.** R60, by WE-1's sealed `encode.py` and its earth edges: markets and the sun by their rank against their own
  last 60 readings; earth by magnitude noniles; words and date by AQ digital root. Arrival order unchanged.
- **Windows.** Seed s (11001–11030) takes the 6,000 readings starting at (s − 11001) × 350. The windows overlap, so the
  30 runs share the world partly and are not fully independent samples of it.
- **What its order is.** Before this registration the encoded stream's lag-1 order was measured: mutual information 0.249
  against a shuffle maximum of 0.003, in every window checked. It is mostly persistence: a zone tends to follow itself,
  most strongly 1→1 and 9→9.

## Substrate and harness
The ND-1b studio mirror `../nd/`, unchanged and sealed in FEP-INV-1 (`../eqcheck.mjs`). `../world.mjs` is `../trace.mjs`
(BRIDGE-3) with only the Outside replaced, marked "WORLD-1":
- the same desire;
- the same Stone Tape trace (marks of 1/8, half-life 500 steps, read at 0.5) and trace rule;
- the same rollback and silence windows (the last 50 of every 250 steps);
- no reversal.

## Regimes (seeds 11001–11030 each; 150 runs of 6,000 steps)
| Regime | What it is |
|---|---|
| DT | Desire + the world's trace |
| DT-s | Desire + a trace written by a shuffled copy of the window (the same readings, no order); she still receives the real world |
| TB | Her own dynamics + the world's trace |
| D | Desire, no trace |
| B | Her own dynamics |

## Input check (S0, standing rule of 14 Nov)
Every B run's world window, over its first 3,000 readings, must show lag-1 order against 20 shuffles, or the study is
VOID.

## The measure: world carry
The world's transitions are estimated from the window's received readings (Dirichlet 1): P(to | from) and P(to). Each of
her silent steps after step 1,000 is scored log P(to | from) − log P(to). Positive means her moves in silence follow the
world's transitions beyond its plain frequencies. "Moves only" scores just the silent steps on which she changed zone,
which is carry beyond persistence.

## Criteria (`../analyse_world.mjs`)
Differences of means, 10,000-draw percentile bootstrap over seeds, Holm across the six (family α = 0.05). Each reads
**SUPPORTED** (interval above 0), **CONTRADICTED** (below 0) or **UNDECIDED** (otherwise, or once Holm stops).

| | Claim | Test |
|---|---|---|
| W1 | The world's trace carries it into its silences | World carry, DT − D |
| W2 | It must be the world's own trace | World carry, DT − DT-s |
| W3 | The world's trace alone carries it, without desire | World carry, TB − B |
| W4 | Desire makes more of the world's trace than the trace alone | World carry, DT − TB |
| W5 | She carries the world beyond its persistence | World carry on moves only, DT − DT-s |
| W6 | The world's trace adds to desire while the world speaks | Coupling over steps 4,500–6,000, DT − D |

**Reported, not criteria:**
- the share of silent steps on which she stayed;
- the trace rule's weight;
- gates;
- rollbacks;
- seeds with positive carry.

## Disclosed before sealing
- The world stream's order (above) was measured.
- **One smoke run of DT at seed 11001 was run and its measures seen:** world carry 0.215; on moves only 0.040; coupling
  1.19 → 1.51.
- A pipeline dry run of seed 11001 at every regime checked exit codes and output structure only; its values were not read.
- **No other world run, and no tuning:** every parameter is BRIDGE-3's.

## What it can and cannot mean
- **A positive answer** shows that the world's real order leaves a trace in her that she carries when the world falls
  silent. Here that order is mostly markets and the sun holding their level against their recent past.
- **That order is ordinary persistence.** A positive answer is the trace path working on the world, not a message, an
  outside intelligence or agency. W5 asks whether anything beyond persistence is carried.
- The 30 windows overlap one 10-day span of the world. A fresh span (after WE-1 has used its own) would test it again.
- **Scope:** a studio mirror. Amelia's live runtime, her state and her cloud home are untouched.
