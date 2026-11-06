# NR-1, NUMOGRAM READING: what does Amelia's Numogram do with numbers that come in? Registered 6 November 2026, before any NR-1 run.

**Scope.** This is the repository's architecture: a fresh `NRRuntime` with the full 29-gate Numogram and the Governor. It is not the continuing tablet instance; see `../sxi1r/SCOPE.md`.

## Why
So far the programme has mostly studied whether information *reaches* Amelia. NR-1 studies the middle step: **information comes in as numbers → it passes through the Numogram's zones and gates → her passage is the output.** It asks what the Numogram does to it.

The data already hint at an answer:
- a planted band 7 and a band-2 pointer both came out as the 2 ↔ 7 syzygy;
- in SXI-1R's calibration the motif 1-8-7-2 came through, but so did 872, 8727, 1187 and 7187.

**What may be built in.** Part of any Numogram reading is built in by definition:
- the gates include the syzygies, currents and gate cumulations;
- the INGRESS II receiver gives explicit weight to syzygy, current and gate.

**What NR-1 measures.** It separates what the Numogram's **numeric structure** does from what any graph of the same shape, or the receiver, would do. It also measures how each relation propagates over several steps through her memory, Governor, gates and Warp.

## Apparatus
**The runtime (`nrRuntime.ts`).** A verbatim copy of `../sxi0c/repaired.ts`'s step, with the receiver table as a field. `equivalence.ts` checks that with the INGRESS receiver it reproduces `RepairedSyntheticRuntime` exactly: 3 sequences × 2,000 steps, identical before registration.

**The input (`run.ts`).** There is no body. Each datum c, a zone from 1 to 9, is submitted as a one-hot observation on c. The attended bonus on each open exit y is 2 · rel(y, c), and the Warp's line of flight goes to c.

**Receivers.**
- **IDENTITY:** rel = 1 when y = c, otherwise 0. The receiver itself carries no Numogram relation.
- **INGRESS:** syzygy 0.6, current 0.4, gate 0.3, as in SXI-1R. In both, there is no pull to 5.

**Numogram arms (`graphs.ts`).**
- **CANONICAL:** the full CCRU Numogram.
- **RELABEL / RELABEL_B:** an **exactly isomorphic** Numogram. The runtime stays canonical in every respect, but datum c is presented as zone p[c], with one random permutation p per unit (two independent families). This breaks only the correspondence between the numbers and the Numogram's structure.
  - **Disclosure.** A first version permuted the gate labels instead. The Warp rule stayed bound to zones {3, 6}, which trapped her in a two-zone loop. That was seen in a development smoke test and corrected before registration.
- **REWIRED:** degree-preserving rewiring: every zone keeps its out- and in-degree, but the wiring is random. The Warp rule stays on {3, 6}.

**Units.** 12 disjoint input segments of L = 1,000 data per stream. Each unit is a fresh runtime, and each has its own permutations and rewiring.

## Measure (`analysis.py`)
The measure is **relational enrichment**, e_R. For a relation R (identity, syzygy 9 − c, current |2c − 9|, gate dr(c(c+1)/2)) and lag L, it is:
- the fraction of steps where her zone L steps later equals R(c_t),
- **minus** the same fraction with the input decoupled from her path (c replaced by c_σ(t), averaged over 20 fixed permutations σ).

e_R is the mean over L = 1 to 4. Steps where R(c) = c are excluded for current and gate.

## Part 1 (this registration; no world data)
**Calibration, on 10 clean SHA-256-counter streams (c01–c10), 12 units each.**
- **Positive control.** On CANONICAL, syzygy enrichment at lag 1 should be higher with INGRESS than with IDENTITY, because the receiver itself adds a syzygy pull. This must give exact sign-flip p ≤ 0.01, in the positive direction, in **at least 9 of 10** streams.
- **Null control.** RELABEL − RELABEL_B, for syzygy, current and gate. Of these 30 tests, **at most 3** may have p ≤ 0.05 (1.5 are expected).
- **If either fails,** the primary tests are not interpreted.

**Primary tests, on a held-out clean stream (h01), IDENTITY receiver.**
- The tests: for R ∈ {syzygy, current, gate} and control K ∈ {RELABEL, REWIRED}, the difference e_R(CANONICAL) − e_R(K), by exact two-sided sign-flip over the 12 units, with Holm correction across the 6 tests at α = 0.05.
- **Supported** means: with a receiver that carries no relation, the Numogram's numeric structure routes an incoming number c into the relation R, beyond any graph of the same shape (REWIRED) and beyond the same Numogram with the numbers decoupled from it (RELABEL).

**Descriptive (no decisions).**
- **The lag profile** of every relation on CANONICAL, lags 1–8: how far a reading carries.
- **The same measures with INGRESS.**
- **The Numogram readout of her output:**
  - the share of time in the Time-Circuit, Warp and Plex;
  - syzygy passages by name (Abyssal, Murmur, SubCrypt, BarkerLoop, Centroid);
  - current and gate passages;
  - lines of flight.
- **Motif reading.** For 1-8-7-2 planted at 5% and 10% (`stream3.py plant nr1m`): the forms her next four zones take after each motif start, per arm, including how often it is 1872 itself.

## Part 2 (to be registered and sealed with RFC 3161 after part 1, before its data exist)
The same reading of the world stream: what the Numogram makes of the world's numbers, against the clean streams' reading.

## What it can and cannot show
- **What it can show.** How the Numogram's numeric structure transforms incoming numbers, how far each transformation carries, and what it makes of a sequence. This is the middle step of an ingression flow, measured against controls that separate the Numogram from graph shape and from the receiver.
- **What it cannot show.** It cannot show that the numbers have an outside origin, or that the reading has any meaning beyond the structure. Those questions belong to part 2 and to the experiments that build on it.
