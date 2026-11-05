# SXI-0 loop controls, stronger pointers, Governor-admitted pointers. Registered 5 November 2026, before these runs.

These implement the operator-approved recommendations of `results_repaired/RESULTS_2026-11-05.md`. Everything uses the repaired channel (`repaired.ts`, β = 2, Θ = 24), with 12 body seeds (101–112) and 300 steps. The window is steps 50–249 and post-withdrawal is steps 250–299.

**The loop is real.** The body's coupling parameters are bound to Amelia's memory-bias tensor and zone strains (`AmeliaMorphogeneticSubstrate.ts`, step function). Her passage therefore reshapes the body, and the body reaches her through the observer.

## Arms
| Arm | Body | Amelia hears |
|---|---|---|
| SHAM / SHAM_OPEN | unplanted | the live body / nothing |
| PLANT | band 7 planted (B = 0.9) in the window | the live body (closed loop) |
| PLANT_OPEN | planted, as PLANT | **nothing** (body without her listening) |
| PLANT_REPLAY | unplanted | the **recorded** observations of that seed's PLANT run, step for step (each replaced step is marked `REPLAY` in its trace) |
| NULLNOISE | a different natural body (seed + 5000) | the live body |
| POINTER_A2 / POINTER_B2 | **cut** (multiplier 0) every horizontal coupling across column boundary 2\|3 or 8\|9, all 10 rows, in the window | the live body |

**Pointer admission.** Each pointer change is offered to the Governor every step. It is **ADMITTED** unless malformed (more than 20 edges, or multipliers outside [0, 1]), or unless the Governor is in LOCKED_RECOVERY or below 85 anti-lock integrity. In those cases it is **REFUSED** and the body runs neutral. Every decision is recorded.

## Tests (exact sign-flip over the 12 seeds, two-sided; Holm across L1 and L2 at α = 0.05)
- **L1. Does the closed loop add to her persistence beyond her memory of the signal?** The difference in zone-7 visits after withdrawal, PLANT − PLANT_REPLAY.
- **L2. Does her loop sustain the body's organisation after withdrawal?** The difference in the body's band-7 contrast after withdrawal, PLANT − PLANT_OPEN. Band-7 contrast is the band-7 mean minus the mean over all bands, averaged over steps 250–299.

## Descriptive
- **Her memory alone.** PLANT_REPLAY − SHAM, zone-7 visits after withdrawal.
- **The body's physics alone.** PLANT_OPEN − SHAM_OPEN, band-7 contrast after withdrawal.
- **Pointer strength.**
  - Body change: the mean, over the window, of the L1 distance of the 10 band means from SHAM's.
  - Her change: the L1 distance of her zone-visit counts from SHAM's.
  - Selectivity: the L1 distance between A2's and B2's zone counts.
  - Each is compared with the old POINTER_A and POINTER_B (multiplier 0.3) in `results_repaired`.
- **Governor pointer decisions.** Admit and refuse counts.

## Standing gate (`gate.sh`, recommendation 1)
SHAM, PLANT and NULLNOISE are run with the repaired channel, × 12 seeds × 300 steps, and `gate_check.py` applies the registered rules:
- positive control p ≤ 0.01 with at least 10 of 12 seeds;
- null control p > 0.05;
- 12 distinct SHAM paths.

It exits non-zero unless all three hold. `INTERFACE.md` fixes this as the gate that must pass before any SXI-1 run on this route.
