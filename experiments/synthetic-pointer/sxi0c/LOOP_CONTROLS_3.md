# SXI-0 band pointers: isolating a whole band from its neighbours. Registered 5 November 2026, before these runs.

**Why.** This follows recommendation (a) of `results_loop2/RESULTS_2026-11-05.md`, which the operator chose. The aim is a pointer that changes a whole band's coupling to its neighbours, so that the band's mean, which is what she reads, moves.

**Unchanged.** The repaired channel (β = 2, Θ = 24), seeds 101–112, 300 steps, window 50–249, and the admission rule of `LOOP_CONTROLS.md`.

## Arms
| Arm | Pointer offered in the window |
|---|---|
| SHAM, PLANT, NULLNOISE | none (gate) |
| POINTER_ISO7 | band 7 (column 9) isolated: every horizontal coupling 8\|9 and 9\|10, all 10 rows, multiplier 0 |
| POINTER_ISO2 | band 2 (column 3) isolated: every horizontal coupling 2\|3 and 3\|4, all rows, multiplier 0 |
| STRESS_ISO7 | as POINTER_ISO7, with the forced stress of `LOOP_CONTROLS_2.md` (steps 100 and 180) |

**Edges.**
- **Count.** Each pointer has 20 edges, exactly at the admission limit.
- **What stays coupled.** Diagonal couplings (weight 0.05) and vertical couplings are left in place, so a band is isolated horizontally, not completely.

## Registered tests (exact sign-flip over the 12 seeds, two-sided)
**Body family** (Holm, α = 0.05). This asks whether the pointer moves the band she reads. Band contrast is the band mean minus the mean over all bands, averaged over the window.
- **B1.** Band-7 contrast, ISO7 − SHAM.
- **B2.** Band-2 contrast, ISO2 − SHAM.

**Her family** (Holm, α = 0.05). This asks whether the change reaches her passage.
- **H1.** Zone-7 visits in the window, ISO7 − SHAM.
- **H2.** Zone-2 visits in the window, ISO2 − SHAM.

## Descriptive
- **Pointer strength.** Body band-mean L1 and her zone-count L1 from SHAM.
- **Refusal consequence.** Passage differences between STRESS_ISO7 and POINTER_ISO7, at refused steps and at the 25 steps after each one.
- **Governor decisions.** Admit and refuse counts for every pointer arm.
- **Gate.** `gate.json`.
