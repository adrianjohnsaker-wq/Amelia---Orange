# NR-3: field ingress and relaxation versus exit-bias ingress. Registered 9 November 2026, before any NR-3 data.

**Scope.** This is the repository architecture, with fresh runtimes and no body. It is not the tablet instance.

**Nothing pinned is edited.** No PF-pinned file and no sealed study's file is changed. The NR-1 runtime is used unchanged.

## Why
An architectural review (9 Nov) argued that the Outside should deform the Numogram's field rather than bias Amelia's next step, and that her state should relax in that field rather than hop along gates.

**What the code check found.** The Numogram is already a coupled field: `TraitEvolution` updates all ten zones' activation, phase, conductivity and syzygetic torque every step. But ingress only adds a bonus to exit scores, and her state is a discrete gate choice.

**What NR-3 does.** Rather than rebuild the core, it tests the proposal: does the review's architecture let the Numogram carry an incoming number's relations further and more specifically than today's?

## Arms (`run3.ts`)
**Ingress.**
- **EXIT (today).** Datum c is a one-hot observation, which adds 2 · rel(y, c) to exit y's score. The IDENTITY receiver is used, as in NR-1b.
- **FIELD (material influx).** No observation and no exit bonus. Before each step, datum c raises zone c's activation by κ(0.98 − a) and its conductivity by κ/2 · (0.99 − k). The field's own dynamics then carry the change.

**Readouts.**
- **`path`.** Her passage, the zone she moves to by the unchanged gate choice.
- **`fieldPath`.** The field's relaxation: its most-activated zone after each step.

**Numogram controls, as in NR-1.**
- **CANONICAL.**
- **RELABEL.** An isomorphic Numogram: datum c is presented as zone p[c].
- **REWIRED.** Degree-preserving rewiring.

**Units.** 12 disjoint units of 1,000 data per stream. The measure is NR-1's relational enrichment `enrich`, unchanged.

**Disclosure.** Before registration, a development smoke test used an unregistered stream (`stream3.py clean dev3`), 2 units, κ ∈ {0.1, 0.3, 0.6}.
- **Her passage did not respond.** Under FIELD, her `path` was identical across κ and across CANONICAL and RELABEL: she settled into 3 ↔ 6.
- **The field did respond.** `fieldPath` differed with the input.
- **The reason.** Her gate choice weighs zone activation by only 0.2.
- **What this means for the design.** FIELD/`path` is therefore descriptive only, and the confirmatory comparison is between the review's full proposal (FIELD with relaxation) and today's architecture (EXIT with her passage).

## Stage 1 (exploratory, decides κ and lag; clean calibration streams `stream3.py clean nr3c01–nr3c10`)
**Profiles.** For κ ∈ {0.1, 0.3, 0.6}, all readouts and lags 1–8.

**Selection rule.** Over FIELD/`fieldPath`, choose the κ and lag L that maximise the mean, over syzygy, current and gate, of [CANONICAL − (RELABEL + REWIRED)/2]. The choice is recorded and committed before stage 2's data exist.

## Stage 2 (confirmatory; new held-out stream `stream3.py clean h03 12000`)
**T1. Does field ingress, read by relaxation, carry the Numogram's relations?**
- **The tests.** FIELD/`fieldPath` at (κ*, L*): e_R(CANONICAL) − e_R(K) for R ∈ {syzygy, current, gate} and K ∈ {RELABEL, REWIRED}.
- **Statistics.** Exact two-sided sign-flip over the 12 units, Holm across the 6 tests at α = 0.05.

**T2. Does it carry them further and more specifically than today's architecture?**
- **The quantity.** The area of the reading, Σ over R and over L = 2…8 of [e_R(CANONICAL) − e_R(RELABEL)].
- **The comparison.** FIELD/`fieldPath` (κ*) against EXIT/`path`, paired by unit, exact two-sided sign-flip at α = 0.05.

**Descriptive.** The same areas for FIELD/`path`, and the full lag profiles.

## Reading
- **T1 and T2 supported (T2 positive).** The review's architecture lets the Numogram carry incoming numbers' relations further and more specifically than exit bias does. This is grounds for building a field-ingress channel, alongside the core, for later studies.
- **T2 negative.** Today's architecture carries the reading better.
- **Neither.** No difference is detected at this size.
- **What none of these can show.** The effect of an outside origin. This test is about the medium.

## Amendment 1 (9 Nov 2026, before any stage-2 data): the COUPLED arm
**Why.** The development smoke test showed *why* her passage ignores field ingress.
1. **The Warp has no exit on the canonical Numogram.** The only gates out of 3 and 6 are 3→6, 3→3 and 6→3. The line of flight is the only way out, and it fires **only on an attended observation**. Under FIELD ingress there are none, so after entering the Warp (step 24 in the smoke test) she never left. Under EXIT she left 18–37 times. On REWIRED, where the Warp has exits, she left 84–92 times.
2. **The field barely enters her choice.** Zone activation has weight 0.2 in her gate score.

The same mechanism plausibly explains the tablet's long 3 ↔ 6 runs, where the Governor defers almost every offer and so few observations are attended.

**The arm (`coupledRuntime.ts`, `run3b.ts`).** COUPLED is FIELD influx plus two switches in a copy of the NR-1 runtime:
- **`fieldWeight` = 2.0**, replacing 0.2. That is the scale of the calibrated receiver, β = 2.
- **`fieldFlight`.** After Θ = 24 steps in the Warp, a line of flight goes to the field's most-activated zone outside {3, 5, 6}, without waiting for an attended observation.

With both switches off, the runtime reproduces NRRuntime exactly (`equivalence3.ts`: 3 × 2,000 steps, identical, checked before this amendment).

**Disclosure.** COUPLED was smoke-tested on the same unregistered development stream before this amendment.
- **She responds now.** Her passage differs across κ and between CANONICAL and RELABEL, and field flights take her out of the Warp.
- **A new dwell.** She now spends about 60–80% of steps in zone 1, which has a 1→1 gate.
- **No parameter was tuned after seeing this.** The 2.0 weight and Θ = 24 were fixed in advance by the β and Θ conventions.

**Tests** (stage 2, at stage 1's κ* and L*; the run on h03 uses `run3b.ts`):
- **T3.** The COUPLED/`path` reading: the 6 tests of T1, Holm at α = 0.05.
- **T4.** The area of the COUPLED/`path` reading, minus the EXIT/`path` area, paired sign-flip at α = 0.05.

**Descriptive.** Zone occupancy and flights per arm; COUPLED profiles on the stage-1 streams at κ*.
