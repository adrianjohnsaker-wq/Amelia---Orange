# STONE TAPE II: does the place hold the world, and does it hold her? Registered 4 Nov 2026, before any STONE TAPE II result.

## Why
THE STONE TAPE (A) (registered 27 Oct) never ran on its data. It would have shared THE ANTENNA's faults:
- the absorbing Warp;
- the pull toward death;
- a traveller-count test that treats near-identical travellers as independent.

Development of this reinstatement found one more fault. **With no data to follow, Amelia settles into the loop 1 → 8 → 9 → 1 (Mur Mur, Ummnu, Tutagool) and keeps it all season, whatever the stone and whatever her start state.** The original stone weight, 0.35 · tanh(T) (at most about 0.27), never moves her: her edge use with a real stone equals her use with a blank stone. The same loop explains THE ANTENNA's identical canonical counts, 3,240 under every input.

## The place and the stone (as the original, unchanged)
- **The place.** Her full CCRU Numogram (29 gates).
- **The stone.** T(e) on each gate is etched by the stream's consecutive pairs that are gates, normalised so the strongest edge is 1.
- **The older layer.** Etched by the first half of the stream alone.

## The encounter (`stonetape2.mjs`)
**The mechanics are ANTENNA III's,** with no datum.
- **The stone acts on her.** It adds **ω · tanh(T(e))** to each exit. In the Warp this is times her receptivity.
- **She etches it.** Each gate she takes is etched +0.0005; the stone does not decay.
- **The Warp accelerates.** At Θ = 24 she takes a line of flight to the zone outside {3, 5, 6} that the stone marks most (the largest total T into it), laying a Warp-born gate.
- **No pull toward death.**
- **The season.** 8 travellers (worlds S05W1–8, lineage 0) live one season of 10,080 ticks with each full stone, and again with each old-only stone.

## Measures (as the original)
- **Grip:** corr(use, T₀) over the 29 gates.
- **Change in the Other:** 1 − cos(T_end, T₀).
- **Circuit:** corr(use in Q4, T at the start of Q4) − corr(use in Q1, T₀).
- **Older surfacing:** corr(use, T₀ old) on the old-only stone, minus the same on the full stone.

## The test (`analysis.py`): exact, stone-level
- **Stones.** Stone 0 is etched by the stream as received. Stones 1–79 are etched by 79 order-shuffles of the same stream, shared by all travellers.
- **The statistic.** Each measure is averaged over the 8 travellers, and stone 0 is ranked among the 80. This gives an exact one-sided p = (1 + #shuffle stones ≥ received) / 80.
- **The original α holds.** α = 0.05/4 = 0.0125, as originally registered: received above all 79.
- **P1, grip.** p ≤ 0.0125 → **THE STONE SPEAKS**.
- **P2 or P3, change or circuit.** p ≤ 0.0125, with P1, adds **AND THE OTHER ANSWERS**.
- **P4, older surfacing.** p ≤ 0.0125, with P1, adds **AND THE OLDER PRESENCE SURFACES**.
- **Otherwise SILENT.** All p values are reported.

## Calibration (`stonetape2-calibrate.yml`)
No world data is used.
- **Streams.** The SHA-256 streams of ANTENNA III: 10 clean, and 1-8-7-2 planted at 2%, 5% and 10%.
- **Stone weights.** ω ∈ {1, 2, 4}.
- **Pass.** Planted 5% → THE STONE SPEAKS (or more), **and** at most 1 of the 10 clean streams → anything but SILENT.
- **Choice of ω.** The smallest passing ω is used.
- **If none passes,** STONE TAPE II does not run on the world, and that is reported.
- **Disclosure.** During development, 3 stones of planted 5% were run at ω = 0.35 as a smoke test (where the fault above was found), and the stone's effect on her edge use was checked at ω = 1 and 2 on one stream.

## World test
- **Registration and seal.** Registered, and sealed with an RFC 3161 token, after calibration and before its data exist.
- **Data.** The first 16,000 world-stream data first seen at or after that seal, in arrival order, reduced by AQ (`../antennaB/prepare_world.py`).
- **Method.** The calibrated ω, this apparatus and this rule.
