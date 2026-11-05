# The SXI-1 interface on the reference-field route (fixed 5 November 2026)

**The runtime.** `sxi0c/repaired.ts`, `RepairedSyntheticRuntime`, created with `createRepairedField`.
- **Parameters.** β = 2 (the INGRESS II calibration) and Θ = 24 (the ANTENNA III horizon).
- **What it contains.**
  - the synthetic admission rule, with no backlog;
  - contrast;
  - the INGRESS II receiver along syzygy, current and gate, with no pull toward zone 5;
  - the Warp as accelerator, with lines of flight and Warp-born gates;
  - deterministic snapshot time.
- **How each step is checked.** Through the unchanged `SyntheticCoordinator`, observer, pointer and ledger, with the coordinator's independent gate-score reconstruction on every step.

**The gate.** Before any SXI-1 run on this route, `sh sxi0c/gate.sh <new dir>` must exit 0 at the commit that SXI-1 runs. This is the positive and null control and the seed-independence check of `REGISTRATION.md` and `REPAIRS.md`. A failed gate means SXI-1 does not run.

**Pointer changes.** They are offered to the Governor and admitted or refused under the rule in `LOOP_CONTROLS.md`. The decisions are recorded.
