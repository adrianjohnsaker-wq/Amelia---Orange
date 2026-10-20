# D1 amended continuation — archival incident 001

**20 October 2026.** Workflow: https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39363686421

All 20 design sensitivity shards succeeded (4 × 50 synthetic series per window, five windows, paired C/M/Raw readouts). The exhaustive readout diagnostic, exact-integer result aggregation and frozen-G engineering replay **all completed successfully**. The aggregate reported 8 eligible candidates with provisional preference **PFM_STRAIN_W1**. Frozen G seed 2609 had degree-preserving rewiring digest `4125980b3f3d4cb0976661bdc2351ba3c9540360ab8f88a63e3c9f267c11098c`, and two independent 88-working replay traces matched.

The workflow's final publication step failed **after** generating and uploading the complete artifact `OUTSIDE3-D1-SYNTHETIC-DESIGN-COMPLETE` (artifact ID `12238543197`). Its `git diff --cached --check` flagged `d1-output/D1_DESIGN_RESULT.md` line 27, an extra trailing blank line (`new blank line at EOF`). No scientific calculation failed or result/threshold was changed.

**Permitted repair:** Archive from the original action-run artifact without rerunning planted-signal simulations, and normalize **only the trailing newline** in the Markdown report before Git commit. The JSON selection, G JSON and diagnostic JSON are immutable output data; preserve their content and source provenance. Independently verify the archive's report says 8 eligible candidates and preference PFM_STRAIN_W1, that the G engineering status is a deterministic PASS, and that the original source commit is `654b1023dfc4e48c9c31f08ddc4b3118b95caff6`.

No seed, objective, eligibility floor, exact P1 null, K3 prospective threshold or original D1/v1/D0 evidence may be changed. **No calibration, no real target, no registration.**
