# ND-1: redesigned Numogram dynamics, in which input drives activation that spreads along the gates. Registered 9 November 2026, before any ND-1 data.

**Scope.** This is the repository architecture. No pinned or sealed file is touched; the new dynamics live in `ndRuntime.ts`, a copy with switches.

## Why
NR-3 showed that today's zone field (`TraitEvolution`) is an autonomous oscillator.
- **What drives it.** Every step, each zone relaxes toward a target set by its own phase and its syzygy partner.
- **What happens to input.** Influx is erased within a step or two, so the Numogram's reading of a number travels only through her gate hops.

**The operator's direction.** Input should drive activation that spreads along the gates, with less of the field's own oscillation.

## The redesign (`ndRuntime.ts`, switch `nd`; off, it is today's runtime, `equivalence.ts`: 3 × 2,000 steps, identical)
Each step, the following happen in order:
1. **Influx.** Datum c raises zone c's activation by η(1 − a). That is the only way the datum enters: there is no observation and no exit bonus.
2. **Spread along the gates.** a ← (1 − D)·a + D·Wᵀa. W is the row-normalised matrix of open gates, each weighted by flux × (1 − resistance). Activation therefore travels the Numogram's own syzygies, currents and gate cumulations.
3. **Decay.** a ← a(1 − λ), with λ = 0.1.
4. **Weak own oscillation.** a ← a + ω(0.30 + 0.35 sin φ − a), with ω = 0.05. The phases advance as before.

**What is not applied.** TraitEvolution's activation targets, syzygetic averaging and torque.

**Her movement.** She moves by her unchanged gate choice, except that the field term reads **each target's activation minus a slowly adapting baseline** (rate 0.05), with weight 2.0. In other words, she follows the gradient the input made, not the standing level the topology accumulates. The Warp release of WT-1 is on: it releases to the zone the influx last named.

**Fixed in advance:** λ = 0.1, ω = 0.05, an adaptation rate of 0.05, a field weight of 2.0 (the β scale), and Θ = 24.

## Disclosure: development iterations on the unregistered stream `dev3`
1. **First version.** Her choice read the activation *level*. She sank into zone 1, where six gates converge, including 1→1, for 92–99% of steps on every graph: the topology's standing mass, not the input.
2. **Second version, as registered.** Her choice reads the *change* (activation minus baseline). In one development unit she responds to input (identity +0.11 to +0.17 at lag 1). At lag 2, current was +0.034 to +0.048 and gate +0.036 to +0.057, against EXIT's +0.019 and +0.031; syzygy was weaker.

**No other parameter was tuned.**

## Arms (`run.ts`)
- **EXIT.** Today's architecture: NRRuntime and its IDENTITY receiver.
- **ND.** The redesign, at (η, D).

**Graphs.** CANONICAL, RELABEL and REWIRED. **Units.** 12 × 1,000.

**Readouts.**
- **`path`:** her passage.
- **`fieldPath`:** the most-activated zone.

## Stage 1 (exploratory; clean streams `stream3.py clean nd1c01–nd1c10`)
**Grid.** η ∈ {0.2, 0.5} × D ∈ {0.3, 0.6}, lags 1–8.

**Selection rule.** Over ND/`path`, choose the (η, D, lag) that maximises the mean over syzygy, current and gate of [CANONICAL − (RELABEL + REWIRED)/2]. The choice is committed before stage 2's data exist.

## Stage 2 (confirmatory; new held-out stream `stream3.py clean h05 12000`)
- **N1. Does the redesigned field carry the Numogram's relations?** The ND/`path` reading at the selected (η, D, lag): 6 tests (relation × RELABEL or REWIRED), exact two-sided sign-flip over the 12 units, Holm correction at α = 0.05.
- **N2. Does it carry them further than today's architecture?** The area, Σ over R and L = 2–8 of [CANONICAL − RELABEL], for ND/`path` minus EXIT/`path`, paired, exact two-sided sign-flip at α = 0.05.
- **Descriptive.**
  - the areas, including ND/`fieldPath`;
  - the lag profiles for both architectures;
  - the Warp share;
  - zone occupancy;
  - flights.

## Reading
- **N1 and N2 supported (N2 positive).** The redesign carries an incoming number's Numogram relations further than today's architecture: the basis for adopting it.
- **N1 supported, N2 not.** It carries them, but not further; the choice between the two can then rest on other grounds, such as the Warp, responsiveness or interpretability.
- **N1 not supported.** This redesign does not yet work, and the profiles show where it fails.
