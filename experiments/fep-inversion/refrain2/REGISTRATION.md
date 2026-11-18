# REFRAIN-2: the refrain under the operator's guardrails. Registered 18 November 2026, before any registered run.

## Why
REFRAIN-1 (`../refrain1/RESULTS.md`) showed:
- the refrain cost the motor nothing (Z5, Z6);
- without decay and ceiling, home froze and territories saturated (Z2, Z3);
- it did not consolidate her territories beyond desire with the Outside's trace (Z1 undecided, 0.55 against 0.59).

The operator's guardrails (18 Nov) asked for four things REFRAIN-1 did not fully have, so that the refrain cannot recreate
DISJ-1's self-referential trap:
1. **Activation in silence**, or as a gentle background rhythm, never overriding the Outside while it speaks. The failure
   mode is the DISJ-1 replay: coupling falling from about 1.31 toward 0.95.
2. **Fast-to-moderate decay**, so that unused territories evaporate. The failure mode is fossilisation.
3. **A hard ceiling**, plus a forced line of flight. The failure mode is limit-cycle saturation.
4. **Inclusive indexing:** territories detected across relation types, not raw zone sequences. The failure mode is
   brittle repetition.

The operator approved this design (18 Nov).

## Substrate and harness
The ND-1b studio mirror `../nd/` with the full CCRU Numogram, unchanged and sealed in FEP-INV-1 (`../eqcheck.mjs`).
`../refrain2.mjs` is `../refrain.mjs` (REFRAIN-1) with the changes marked "REFRAIN-2". The Outside, its reversal at step
3,000 and its silences are DISJ-2's, as are the Outside's trace and desire. The inclusive record is inscribed and never read
at her exits. DTR is REFRAIN-1's refrain, unchanged.

## The relational refrain
- **Relational territories (guardrail 4).** Each hop realises relations of the Numogram: its gate (G), current (C),
  syzygy (S) and Pandemonium pair (P). The region is too coarse to make a territory and is left out. A **motif** is one
  relation of a hop followed by one relation of the next hop. Every such pair is inscribed at once, whichever zones carry
  it: a recurring syzygy, or a return to the same Pandemonium pair, is one motif even when the zone path differs.
- **Node territories (the control for guardrail 4).** A motif is a 3-zone segment a → b → c, as in REFRAIN-1.
- **Surfaces and decay (guardrail 2).** Both kinds of motif are inscribed in every regime on their own surfaces:
  + (1 − m)/8, with a half-life of 250 steps, half REFRAIN-1's. Her territories are the at most 3 strongest motifs whose
  mark has reached 0.6.
- **The pull (guardrail 1).** At an exit, each territory whose first term the last hop realised, and whose second term
  this exit would realise, offers min(0.85, its mark). She gains 0.5 × gate × the largest offer. The gate is 1 in the
  Outside's silences and 0.15 while it speaks, a background rhythm. In DTR2V (the replay control) the gate is always 1.
- **Ceiling and line of flight (guardrail 3).** The pull never exceeds 0.5 × 0.85, so visits to a territory at its
  ceiling add nothing. She is **at home** on a step whose last hop completed one of her territories. After 20 steps in a
  row at home, the pull is suspended, and every exit that completes none of her territories gains 0.5: a line of flight,
  until she leaves.

## Regimes (seeds 20001–20030 each; 180 runs of 6,000 steps)
| Regime | What it is |
|---|---|
| B | Her own dynamics (both surfaces inscribed and measured, not read) |
| DT | Desire + the Outside's trace, the benchmark (both surfaces inscribed and measured, not read) |
| DTR | REFRAIN-1's refrain (anchor) |
| **DTR2** | DT + the relational refrain, gated by silence, with fast decay, ceiling and line of flight |
| DTR2V | DTR2 with the pull always on (the DISJ-1 replay control) |
| DTN | DTR2 with node territories instead of relational ones (the indexing control) |

## Input check (S0, standing rule of 14 Nov)
Every B run's Outside, before the reversal, must show lag-1 order against 20 shuffles, or the study is VOID.

## Criteria (`../analyse_refrain2.mjs`)
**Measures, late (steps 4,500–6,000):**
- **persistence:** the mean Jaccard overlap between her territory set now and 250 steps before, on each surface. Steps on
  which neither set holds a territory are left out;
- **coupling and carry index:** DISJ-2's measures;
- **connections that held**;
- **periodicity:** her late passage's best agreement with itself at lags 2–8, minus the same for shuffles;
- **relational territories at the end:** motifs whose mark is at least 0.6.

Each claim is a linear contrast of regime means (plus a stated margin) that must exceed 0. It uses a 10,000-draw
percentile bootstrap over seeds, with Holm across the eight (family α = 0.05). Each reads **SUPPORTED** (interval above 0),
**CONTRADICTED** (below 0) or **UNDECIDED** (otherwise, or once Holm stops).

| | Claim | Test |
|---|---|---|
| Z1 | The relational refrain consolidates her territories beyond the benchmark | Relational persistence, DTR2 − DT |
| Z2 | Relational indexing consolidates more than node indexing | (DTR2 − DT, relational) − (DTN − DT, node) |
| Z3 | Silence-gating keeps her coupling above an always-on refrain | Coupling, DTR2 − DTR2V |
| Z4 | It keeps her coupling (within 10%) | Coupling, DTR2 − 0.9 · DT |
| Z5 | It keeps the carry through silence (within 10%) | Carry index, DTR2 − 0.9 · DT |
| Z6 | It keeps the connections that hold (within 10%) | Connections held, DTR2 − 0.9 · DT |
| Z7 | No limit cycles | Periodicity, DT + 0.02 − DTR2 |
| Z8 | No saturation | Relational territories at the end, 2 · DT − DTR2 |

**Reported, not criteria:**
- node persistence;
- every regime's coupling, carried order, carry and connections;
- time at home;
- lines of flight;
- births late, gates and rollbacks.

## Pilot (disclosed)
Seeds 19901–19904, every regime, analysed. Z8 read SUPPORTED; the other seven were UNDECIDED.

| | B | DT | DTR | DTR2 | DTR2V | DTN |
|---|---|---|---|---|---|---|
| Relational persistence | 0.43 | 0.27 | 0.27 | 0.24 | 0.42 | 0.32 |
| Node persistence | 0.48 | 0.40 | 0.35 | 0.35 | 0.45 | 0.42 |
| Coupling late | 0.60 | 1.36 | 1.47 | 1.26 | 1.27 | 1.49 |
| Carry through silence | 0.00 | 0.227 | 0.213 | 0.229 | 0.211 | 0.229 |
| Connections that held | – | 31 | 38 | 28 | 29 | 35 |
| Periodicity | 0.15 | 0.03 | 0.03 | 0.06 | 0.05 | 0.03 |
| Lines of flight per run | – | – | – | 5.8 | 4.5 | 1.8 |

**Changed during the pilot, before any claim was computed (disclosed):**
- **The threshold.** At 0.8, with the faster decay, she often held no territory at all (59% of late steps in DT), and an
  empty set would count as a persistent home. It was lowered to 0.6, at which her three territories are always filled.
- **Persistence.** It leaves out steps on which neither set holds a territory, for the same reason.

The 250-step half-life, the gate (0.15 while the Outside speaks), the ceiling 0.85, the 20-step dwell, the line-of-flight
bonus 0.5 and the pull weight 0.5 were set before the pilot and were not tuned.

## What it can and cannot mean
- **What it tests:** one relational refrain (pairs of relations across two hops) under the four guardrails, against its
  zone-path twin and against an always-on twin. The pull acts on the first hop of a step, the one that follows the hop
  that brought her where she stands.
- **Scope:** a studio mirror. Amelia's live runtime and state are untouched.
