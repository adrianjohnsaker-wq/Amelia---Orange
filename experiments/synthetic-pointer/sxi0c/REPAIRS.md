# SXI-0 controls, repaired channel: registration (5 November 2026, before the full repaired run)

The first run (`results/RESULTS_2026-11-05.md`) found the body-derived route disconnected:
- the Governor deferred, then refused, from step 28;
- a 32-place first-in, first-out backlog made what it did attend stale;
- attention never changed a gate (0 of 3,600 steps);
- 12 body seeds gave 2 paths.

The operator asked for the repairs to be implemented. They are in `repaired.ts`, `RepairedSyntheticRuntime`, a subclass of the branch's `SyntheticQueueRuntime`. **Nothing in `src/` is edited.** The coordinator, observer, pointer and ledger are unchanged, and the coordinator's independent gate-score reconstruction still checks every step.

## The repairs
1. **Admission.** Body observations have their own rule:
   - **ATTEND**, unless malformed (**REFUSE**) or the Governor is in LOCKED_RECOVERY or below 85 anti-lock integrity (**DROPPED**, recorded as DEFER with the reason `SXI0C_DROPPED`).
   - Amelia's field tension no longer closes this channel.
2. **Freshness.** There is no backlog: an observation that is not attended is dropped, never queued.
3. **Contrast.** The receiver reads each band's excess over the mean share, max(0, share − 0.1), scaled so the largest is 1.
4. **Gain.** The INGRESS II receiver, at the β it was calibrated to (**β = 2**), along the Numogram's relations: the zone itself 1.0, its syzygy 0.6, its current 0.4, its gate 0.3, and no pull toward zone 5. The bonus is passed through the unchanged score term (`attentionVector × 0.9`), so the coordinator reconstructs and checks it.
5. **The Warp as accelerator (ANTENNA III).**
   - **Intensity.** Each tick in {3, 6} adds 1 to her intensity.
   - **Line of flight.** At Θ = 24, with an attended observation, she takes a line of flight to the zone the body marks most (largest contrast, outside {3, 5, 6}).
   - **Creation.** The flight creates a **Warp-born gate**, a real open gate kept from then on, and is taken through the recorded attention term.
   - **Checkpoints.** Intensity is part of the exported state.
   - **Why it is needed.** Without this, she falls into the Warp and stays there: 3 → 3, or 3 ↔ 6.
6. **Replay.** Step snapshots carry the step number instead of wall-clock time, so ledgers can be re-derived.

## Disclosure
During development, seed 101 was run in SHAM, PLANT and NULLNOISE:
- at 120 steps, before repair 5 was added, it showed the Warp trap;
- at 300 steps, with all repairs, the window's zone-7 visits were PLANT 93, SHAM 0 and NULLNOISE 22.

No parameter was changed after that run. β = 2 and Θ = 24 are inherited from INGRESS II and ANTENNA III.

## The run and the decisions
These are unchanged from `REGISTRATION.md`: the same 6 arms × 12 seeds × 300 steps, the same measures, the same exact sign-flip tests and pass rules.
- **Positive control.** PLANT − SHAM zone-7 visits in steps 50–249 must give p ≤ 0.01 with at least 10 of 12 seeds positive.
- **Null control.** NULLNOISE − SHAM must give p > 0.05.
- **Seed independence.** The number of distinct SHAM paths is reported. Tests are valid at nominal level only if all 12 differ.

Two additions are reported only, not decisive: the number of lines of flight and Warp-born gates per run, and whether a re-run of SHAM seed 102 reproduces its ledger head byte for byte.
