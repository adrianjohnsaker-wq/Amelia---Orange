# ANTENNA II: registration (part 1, calibration). Written 4 Nov 2026, before any ANTENNA II result.

## Why
THE ANTENNA (4 Nov) answered SILENT, but its receiver could not hear.

- **The input barely reached her.** Each datum reached Amelia as a +0.35 nudge on one exit, available about one tick in four.
- **The canonical walks were identical.** On the canonical Numogram, the top counts were identical under the world stream, the beacon and the shuffled world (Mur Mur, Ummnu and Tutagool each 3,240).
- **The Warp was absorbing.** On the CCRU and full Numograms the absorbing Warp held 69–72 of 72 travellers, and once there her path no longer depended on the input.
- **It was never calibrated.** No planted-signal calibration was ever run.

That SILENT therefore says "could not listen", not "nothing there". THE ANTENNA's committed result stands as what it is; it is not re-scored.

## The apparatus (`traveller2.mjs`, fixed)
**Base.** Amelia (POINTER III learner, constants unchanged) on her full CCRU Numogram (29 gates).

**Receiver.** The datum's zone c adds `beta * rel(y, c)` to each open exit y:
- rel = 1 when y = c;
- 0.6 when y = the syzygy of c (9 − c);
- 0.4 when y = the current of c (|2c − 9|);
- 0.3 when y = the gate of c (the digital root of c(c+1)/2).

**Warp as accelerator.**
- **Intensity.** Each tick in the Warp {3, 6} adds 1 to her intensity I. Her receptivity there is (1 + I/Θ), with Θ = 24, the learner's horizon.
- **Line of flight.** When I ≥ Θ and the datum names a zone outside the Warp, she takes a line of flight to that zone, and I resets to 0.
- **Creation.** Each flight lays down, or reinforces, a **Warp-born gate** from her Warp zone to where she landed. It is a real gate:
  - it carries her learned weight W (+1 per flight, weighted by 0.5 in her exit choice);
  - W decays by 0.2% per tick;
  - the gate is removed when W falls below 0.01.

**Elements.** Two kinds of element are read from her walk:
- PF-1 scanner detections (window 240, recurrence 3) per Pandemonium entity;
- flights per Warp-born gate.

## The test (`analysis2.py`, fixed)
- **The comparison.** For each traveller (72: worlds S05W1–8 × lineages 0–8, the registered start states), the stream as received is compared with **19 order-shuffles** of the same stream.
- **Comes through.** An element comes through in a traveller when its count is greater than zero and strictly greater than in every shuffle (p ≤ 1/20 under "order carries nothing").
- **Recurs.** It recurs when it comes through in at least K travellers from at least 5 worlds. K is the smallest k with P(Binomial(72, 1/20) ≥ k) < 0.05/E, where E is the number of distinct elements observed.
- **Answer.** RECEIVED if anything recurs, else SILENT.

## Calibration (`calibrate.yml`)
Calibration uses no world data.
- **Streams.** THE ANTENNA's beacon stream (drand Quicknet, BLS-verified, N = 10,761):
  - **clean** (ρ = 0);
  - **planted**, with the motif 1-8-7-2 written into it at ρ = 2%, 5% and 10% of tokens (`plant.py`, seeded).
- **Receiver strengths.** β ∈ {0.5, 1, 2}.
- **The apparatus passes calibration at a given β** when:
  1. planted ρ = 5% → RECEIVED, and
  2. clean beacon → SILENT.
- **Choice of β.** The confirmatory β is the **smallest β that passes**.
- **If no β passes,** the apparatus is still deaf, or it hallucinates. It does not listen to the world, and that is reported as it stands.
- **Information only.** ρ = 2% and 10% are reported as a sensitivity curve; they do not decide anything.

## Part 2
The confirmatory test is registered, and sealed with an RFC 3161 token, after calibration and before its data exist. It will use the world stream (`world-live`) collected **after** that seal, never THE ANTENNA's already-seen world data. It will use the calibrated β, the same apparatus and the same rule.
