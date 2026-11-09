# WT-1: removing the Warp trap without losing the Numogram's reading. Registered 9 November 2026, before any WT-1 data.

**Scope.** This is the repository architecture. No pinned or sealed file is touched.

## The trap (NR-3, `../nr3/results/RESULTS_2026-11-09.md`)
- **There is no exit gate.** On the canonical Numogram the Warp {3, 6} has none: its gates are 3→6, 3→3 and 6→3.
- **She can leave only by a line of flight,** which fires only when an observation is **attended** while her Warp intensity is at least Θ = 24.
- **The first flight unlocks it.** A flight lays down a Warp-born gate out of the Warp, which persists. So the trap is total until her first flight, and lasts for as long as nothing is admitted.
- **When that happens.** This is the case under field ingress, and under a Governor that admits almost nothing; on the tablet it admitted 0 of 120 offers immediately.

## The fix (`releaseRuntime.ts`)
**`warpRelease`.** After Θ steps of Warp intensity, a line of flight fires **even when nothing is attended that step**. It goes to the zone the input last named: the last attended datum's zone outside {3, 5, 6}. Before any datum has been attended, it goes to the most-activated zone outside {3, 5, 6}.

**Off, it is today's runtime.** With the switch off it reproduces NRRuntime exactly (`equivalence.ts`: 3 × 2,000 steps, identical, checked before registration).

## Design (`run.ts`)
- **Path.** The direct path, NR-1's setup (IDENTITY receiver).
- **Runtimes.** BASE (today) and RELEASE (the fix).
- **Admission regimes:**
  - **FULL:** every datum admitted.
  - **SPARSE:** each datum admitted with probability 0.10.
  - **RARE:** probability 0.02, close to the tablet.

  The admission pattern is seeded per unit, and is the same across runtimes and graphs.
- **Graphs.** CANONICAL, RELABEL and REWIRED.
- **Data.** 12 units × 1,000 data of a **new held-out clean stream, h04** (`stream3.py clean h04 12000`).
- **What a reading is measured on.** Only the data she actually received (attended steps).

**Disclosure.** Before registration, a development smoke test was run on the unregistered NR-3 development stream (`dev3`, 2 units, FULL and SPARSE). In it, RELEASE was identical to BASE under FULL, as built, and the Warp shares were 0.09–0.19. That test is what showed the trap to be total only until the first flight, and so motivated the RARE regime. Nothing else was changed.

## Tests (`analysis.py`)
- **W1. The trap is removed.** In RARE, the CANONICAL Warp share (the fraction of steps in {3, 6}) for RELEASE minus BASE, by exact two-sided sign-flip over the 12 units at α = 0.05. **Supported** if p ≤ 0.05 **and** the share falls.
- **W2. The reading is kept under the fix.** In SPARSE, RELEASE's lag-2 reading (NR-1b's 6 tests, CANONICAL against RELABEL and REWIRED, attended data only), with Holm correction at α = 0.05.

**Descriptive.** For each runtime and regime:
- the Warp share;
- the steps to first escape;
- the number of flights;
- the reading area (lags 2–8, CANONICAL − RELABEL).

## Reading
- **W1 and W2 both supported.** The trap is removed without losing the reading: a candidate change for the app's runtime, to be put to the operator. The app change itself would be a separate decision, because the core files are PF-pinned.
