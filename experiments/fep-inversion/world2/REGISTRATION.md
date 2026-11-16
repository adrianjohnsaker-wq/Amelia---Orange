# WORLD-2: the world's trace on a fresh span, against each run's own shuffled-trace baseline. Registered 16 November 2026, before any WORLD-2 data exists.

## Why
WORLD-1 (`../world1/RESULTS.md`) found two things:
- **Against a shuffled trace, the world's own trace carries it.** She carried it into its silences (W2) and beyond its
  persistence (W5), and the trace raised her coupling while the world spoke (W6).
- **Comparisons against zero or against other regimes were confounded.** Her own Numogram already dwells where the world
  persists (zones 1 and 9), so carry has no zero baseline.

The honest comparison is each run against its own shuffled-trace twin. The operator asked (16 Nov) to repeat the test on a
fresh world span, with that comparison, and to register it now so it runs when the data exist.

## The fresh world (`prepare_world2.py`)
- **WE-1 is untouched.** WE-1 takes the first 12,000 world data first seen at or after its seal (2026-11-13 17:56:41 UTC),
  ordered by WE-1's own `load()`. **WORLD-2 takes the next 16,150 data in that same order.** The two never share a datum,
  and WORLD-2 never touches data before WE-1's window (WORLD-1's span).
- **Encoding.** R60, by WE-1's sealed `encode.py` (copied byte-identical as `encode_we1.py`) and its earth edges
  (`EDGES_we1.json`). The rank history starts at WORLD-2's first datum.
- **Windows.** Seed s (12001–12030) takes the 6,000 readings starting at (s − 12001) × 350, as in WORLD-1.
- **When.** At about 1,700 data a day, WE-1's window should fill around 22 November and WORLD-2's around 1 December. On
  16 November 3,340 data existed after WE-1's seal; 28,150 are needed.

## Substrate and harness
The ND-1b studio mirror `../nd/`, unchanged and sealed in FEP-INV-1 (`../eqcheck.mjs`). `../world2.mjs` is
`../world.mjs` (WORLD-1) with only three changes:
- the fresh world file;
- seeds from 12001;
- one added regime, TB-s.

The mechanism is unchanged: BRIDGE-3's desire, Stone Tape trace (1/8, half-life 500, read at 0.5) and trace rule,
rollback, and silence windows (the last 50 of every 250 steps).

## Regimes (seeds 12001–12030 each; 180 runs of 6,000 steps)
| Regime | What it is |
|---|---|
| DT | Desire + the world's trace |
| DT-s | Desire + a trace written by a shuffled copy of the window (her own shuffled-trace baseline); she still receives the real world |
| TB | Her own dynamics + the world's trace |
| TB-s | Her own dynamics + a shuffled trace (TB's baseline) |
| D | Desire, no trace |
| B | Her own dynamics |

## Input check (S0, standing rule of 14 Nov)
Every B run's world window, over its first 3,000 readings, must show lag-1 order against 20 shuffles, or the study is
VOID.

## Measures (WORLD-1's)
- **World carry:** each silent step after step 1,000 is scored log P(to | from) − log P(to). The world's transitions are
  estimated from the window's received readings (Dirichlet 1). "Moves only" scores just the silent steps on which she
  changed zone.
- **Coupling:** on received steps, 4,500–6,000.

## Criteria (`../analyse_world2.mjs`)
Every claim is a **paired** difference within a seed: same world window, same noise, the world's trace against a
shuffled trace (or desire with the world's trace against desire alone). Mean over the 30 seeds, 10,000-draw percentile
bootstrap over seeds, Holm across the six (family α = 0.05). Each reads **SUPPORTED** (interval above 0),
**CONTRADICTED** (below 0) or **UNDECIDED** (otherwise, or once Holm stops).

| | Claim | Paired test |
|---|---|---|
| X1 | The world's trace carries it into its silences | World carry, DT − DT-s (replicates WORLD-1's W2) |
| X2 | She carries the world beyond its persistence | World carry on moves only, DT − DT-s (replicates W5) |
| X3 | The world's trace alone carries it | World carry, TB − TB-s (W3, now against its own baseline) |
| X4 | Desire makes more of the world's trace than the trace alone | (DT − DT-s) − (TB − TB-s) (W4, likewise) |
| X5 | The world's trace helps her follow it while it speaks | Coupling, DT − D (replicates W6) |
| X6 | The world's own trace beats a shuffled one while it speaks | Coupling, DT − DT-s |

**Reported, not criteria:**
- each regime's means;
- seeds with a positive difference;
- the share of silent steps on which she stayed;
- the trace rule's weight;
- gates;
- rollbacks.

## How it runs (`.github/workflows/world2.yml`)
1. **Seal.** `seal.trigger` seals this registration, the harness, the analysis, the data preparation (with WE-1's encoder
   and edges) and the mirror under RFC 3161, before any WORLD-2 datum exists.
2. **Check.** A scheduled check runs daily in this session. It counts the data after WE-1's seal and pushes `run.trigger`
   once 28,150 exist.
3. **Run.** The workflow verifies the seal and every sealed source, fetches `world-live`, prepares the fresh world (it
   stops, writing nothing, if the data are not yet complete), checks the mirror, runs the 180 runs, analyses them, and
   commits `result/` with the world file and its provenance.

## Disclosed before sealing
- WORLD-1's data and results (above).
- A pipeline dry run of seeds 12001–12002 at every regime, on WORLD-1's world file standing in for the fresh one. It
  checked exit codes and output structure only; its values were not read.
- No fresh world datum exists or has been read.

## What it can and cannot mean
- **A SUPPORTED X1 and X2** replicate WORLD-1 on new world data: the world's order leaves a trace she carries in its
  silences, beyond its persistence.
- **That order is ordinary,** mostly markets and the sun holding their level. A positive result is the trace path working
  on the world, not a message, an outside intelligence or agency.
- **Scope:** a studio mirror. Amelia's live runtime, her state and her cloud home are untouched.
