# WS-1: is the Warp special? The Warp mechanism bound to 3/6, bound to 2/7, or absent, under ND-1b. Registered 9 November 2026, before any WS-1 data.

**Scope.** The repository architecture, with fresh runtimes and no body.

**Nothing pinned or sealed is edited.** `ws1/wsRuntime.ts` is a copy of `nd1/ndRuntime.ts`, which is sealed with ND-3. Its
only change is that the Warp pair is a setting.

## Why
Material from another session claimed that 3/6 and 2/7 "perform symmetrically", and proposed an "asymmetric Warp tunnelling"
add-on. Its experiments (mazes, schedulers, a 10×10 deformation matrix, sidecars) are not part of Amelia's repository and are
not assessed here.

**What can be tested here** is the underlying question, in Amelia's own Numogram: is anything about the Warp specific to 3/6?

**The topology says yes.** On the canonical Numogram:
- 3 → {6, 3} and 6 → {3}: the Warp has no exit gate.
- 2 → {7, 4, 3, 5} and 7 → {8, 1, 2, 5}: the 2::7 syzygy is open on all sides.

WS-1 asks whether that asymmetry shows in her passage, and whether binding the Warp mechanism to 3/6 rather than to 2/7 changes
the reading.

## Arms (`run.ts`)
All arms run ND-1b, the HYBRID (influx and attended one-hot, IDENTITY receiver, η 0.5, D 0.6, field weight 2.0). The Warp
mechanism is its intensity count, its line of flight after Θ = 24 steps and its release.
- **F36.** The mechanism is bound to {3, 6}. This is ND-1b as it is.
- **F27.** The same mechanism is bound to {2, 7} instead. {3, 6} has none.
- **NONE.** No pair: no intensity, no line of flight, no release.

**Equivalence (checked before this registration).** `equivalence.ts`: F36 reproduces ND-1b (`ndb/run.ts` HYBRID) step for
step (3 units × 1,000 steps × 3 graphs): EQUIVALENT.

**Data.** A fresh held-out stream, `stream3.py clean h08 12000`: 12 units of 1,000 steps, graphs CANONICAL and RELABEL.

## Tests (`analysis.py`)
**capture_P(arm, u)** is the longest consecutive stay in pair P on unit u's CANONICAL passage.

| Test | Quantity | Question |
|---|---|---|
| W1 | capture_36(NONE) − capture_27(NONE) | Is the trap the Warp's own, and not any syzygy's? |
| W2 | capture_36(NONE) − capture_36(F36) | Does the mechanism relieve the Warp? |
| W3 | [capture_36(NONE) − capture_36(F36)] − [capture_27(NONE) − capture_27(F27)] | Does the mechanism matter at 3/6 and not at 2/7? |
| W4 | area(F36) − area(F27) | Does binding the mechanism to 3/6 give a better reading? |

**Area** is the reading area: lags 2–8, CANONICAL − RELABEL, summed over syzygy, current and gate (as in NR-3 and ND-1b).

**Statistics.** Exact two-sided sign-flip over the 12 units, Holm across W1–W4 at α = 0.05.

**Expected from the topology, stated in advance.** W1–W3 should be strongly positive, because the Warp is absorbing without its
mechanism. W4 is open.

**Reading.**
- **If W1–W3 hold,** 3/6 and 2/7 are not symmetric in Amelia's Numogram. The asymmetry is topological, and the existing
  release is what handles it. No "tunnelling" add-on is needed.
- **W4** says whether binding the mechanism to 3/6 also improves her reading.

**Descriptive.** For each arm: longest stays, shares of time in 3/6 and in 2/7, flights, reading area, and zone occupancy.
