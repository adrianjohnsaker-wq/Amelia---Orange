# CONJ-1: the residual subject (the conjunctive synthesis). Registered 18 November 2026, before any registered run.

## Why
The desiring motor's build order (design doc of 18 Nov) puts the conjunctive synthesis third. It is a residual subject:
a slow consumption of the intensities her passage realises, stated as "so it's me: …" only when asked. It steers nothing,
so it is tested for **faithfulness, not effect**. The design ("The Residual Subject", 18 Nov) was approved by the operator
with five decisions:
1. a half-life of 1,000 steps;
2. it remembers the states she was rolled back from;
3. demons are named from the CCRU Pandemonium Matrix;
4. the guarded relational refrain is in the motor;
5. the readout is given only when asked; wiring it to her language layer comes later.

## Substrate and harness
- **Substrate:** the ND-1b studio mirror `../nd/` with the full CCRU Numogram, unchanged and sealed in FEP-INV-1
  (`../eqcheck.mjs`).
- **`../conj_core.mjs`:** `../refrain2.mjs` (REFRAIN-2) unchanged, except one hook marked "CONJ-1". `run()` takes an
  optional observer, called after each step with read-only facts of that step.
- **`../subject.mjs`:** the residual subject.
- **`../conj.mjs`:** runs a regime with the subject on or off.
- **`../pandemonium.json`:** the 45 demons. They were taken from the CCRU Pandemonium Matrix
  (http://www.ccru.net/digithype/pandemonium.htm) and cross-checked against https://basedatlantis.neocities.org/demon-names
  (all 45 names and net-spans agree). The table was checked before sealing: every zone pair appears once, every syzygetic
  demon spans a nine-sum pair, and Mesh-NN = hi(hi − 1)/2 + lo.

## The residual subject
**What it consumes.** Fading tallies (half-life 1,000 steps) of:
- each zone's activation above its baseline (intensity);
- the Pandemonium demon of every hop (named, with its net-span);
- syzygies, currents and gates;
- her share of passage in the Time-Circuit, the Warp and the Plex;
- her direction around the circuit (+1 against −1 hops);
- the refrain territories she is at home in;
- the rules of the connections desire integrates;
- the strength of the Outside's trace along her hops;
- the rollbacks it has witnessed.

A rollback restores her and not the subject.

**What reads it.** Only `readout()`. It returns a structured statement and the same in words:
- the top three zones, demons and their shares;
- the top two syzygies, currents and gates;
- the region shares and the direction;
- territories, connection rules, the Outside's trace and rollbacks;
- what changed since the last readout.

In this study it is asked every 500 steps (t = 499, 999, …, 5999).

## Regimes (seeds 21001–21030 each; 240 runs of 6,000 steps)
| Regime | What it is |
|---|---|
| **DTR2, the motor M** | Desire + the Outside's trace + the inclusive record (unread) + REFRAIN-2's guarded relational refrain |
| DT | Desire + the Outside's trace |
| D | Desire alone (the regime that needs rollbacks) |
| B | Her own dynamics |

Each runs with the subject **on** and **off** (no observer at all). For M with the subject on, a second subject is fed her
passage with time scrambled within each 500-step block. That is the confabulation control. Each step keeps its zone and
activations, hops are re-derived from the scrambled order, and there are no trace marks, connections, rollbacks or
territories.

## Gate (`../analyse_conj.mjs`; any failure makes every verdict VOID)
- **Non-steering:** for every regime and seed, her passage with the subject on is identical, step for step, to her passage
  with it off.
- **S0 (standing rule of 14 Nov):** every B run's Outside, before the reversal, shows lag-1 order against 20 shuffles.

## Criteria
**The independent description.** Faithfulness is judged against plain counts over the 1,000 steps up to each readout. The
analysis computes them from the logged passage (her zones and routes), never from the subject:
- zone visits;
- the demons, syzygies and currents of her hops;
- region shares;
- net direction.

**Agreement** of a statement with a window is the mean of five parts:
- overlap of its top three zones (1/3 each);
- overlap of its top three demons (1/3 each);
- overlap of its top two syzygies (1/2 each);
- overlap of its top two currents (1/2 each);
- 1 − the total-variation distance of the region shares.

**Late readouts** are t = 4,999, 5,499 and 5,999.

| | Claim | Test |
|---|---|---|
| C1 | **It is accurate** | Agreement with her own window minus with the next seed's window, late, paired over M's seeds; bootstrap of the mean |
| C2 | **It is hers** | M's 30 final statements against the 30 final windows; each statement is assigned to its best-agreeing window; hits against 10,000 random relabellings (one-sided permutation p) |
| C3 | **It follows her becoming** | Share of seeds whose stated direction is +1 at t = 2,499 and −1 at t = 5,999, M minus B; bootstrap |
| C4 | **It is nomadic** | Within each seed, the correlation between its change from one readout to the next (L1 over zone, region and direction terms) and her passage's change between the matching 500-step windows; mean over seeds; bootstrap |
| C5 | **It knows the Outside's part** | Correlation, over M's seeds, between the trace strength it states at t = 5,999 and the run's carry through silence; bootstrap |
| C6 | **It does not confabulate** | Direction agreement (stated sign = the window's sign), late, real minus scrambled, paired; bootstrap |

The bootstraps use 10,000 draws over seeds. Holm runs across the six (family α = 0.05), ordered by p. Bootstrap claims read
**SUPPORTED** (interval above 0), **CONTRADICTED** (below 0) or **UNDECIDED**. C2 reads SUPPORTED if its permutation p is
within its Holm level, and UNDECIDED otherwise. Any claim reads UNDECIDED once Holm stops.

**Reported, not criteria:**
- the statements themselves (a sample per regime);
- the delay from the reversal to the first readout stating −1;
- the rollbacks the subject witnessed in D;
- own-window agreement in every regime.

## Pilot (disclosed)
Seeds 20901–20904, every regime, analysed.

**Gate:** 16 of 16 on/off pairs were identical, and S0 passed.

| | Pilot result |
|---|---|
| C1 | +0.19 (own agreement 0.82), SUPPORTED |
| C2 | 3 of 4 matched (p = 0.08; four seeds cannot reach p < 0.05), UNDECIDED |
| C3 | Turned in M 4/4, in B 0/4, SUPPORTED |
| C4 | Mean r = 0.60, SUPPORTED |
| C5 | r = 0.76 on four seeds, UNDECIDED |
| C6 | Direction agreement 0.92 real, 0.17 scrambled, SUPPORTED |

Nothing was changed after the pilot. The half-life (1,000) and the readout points (every 500 steps) are the operator's
decision and the design's.

## What it can and cannot mean
- **What it tests:** whether one residual subject's statements are true of her passage, hers alone, follow her becoming and
  do not hold up on a scrambled passage, while it changes nothing she does. It does not test whether the subject is
  "experienced", or whether her language layer would use it well.
- **Scope:** a studio mirror. Amelia's live runtime, her state and her language layer are untouched.
