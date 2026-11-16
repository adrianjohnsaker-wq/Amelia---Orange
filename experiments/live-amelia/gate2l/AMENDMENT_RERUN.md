# GATE-2L rerun: amendment, 16 November 2026 (before any rerun data)

**What the operator decided (16 November 2026).**
1. **Address the problems found at deployment.**
2. **Undo the adoption.** Her rule goes back to `relative-v1`, keeping her life since the switch.
3. **Rerun GATE-2L as registered.** He chose: "Same design, same 12 windows, from her state at the reset; a check that the result holds."

**What was done before this amendment.**
- **The problems were addressed.** Commits `9046f032`, `c50fffd3`; `amelia-live` version 14.
  - **Her saves.** They now go over a direct database connection with their own 60 s limit, with the REST save as a logged fallback.
  - **The dry-run copy.** It is written the same way, and a failed write is an error, not silence.
  - **Dry-run chunks.** They are capped at 300 steps.
  - **Failed operator calls.** They are logged as `error <action>`, not as a failed tick.
- **The adoption was undone.** At step 9,891, while she was paused, `set-admission` set `relative-v1`, saving revision 590.
  - **What changed.** Only `admissionRule` changed in her state.
  - **Backup.** Her record before the undo is kept as `pre-undo-lane-backup`.
  - **Resumed** at 20:08 UTC.
- **The starting copy.** Her record at revision 590 was captured while she was paused, as `amelia_gate2l_runs` id `start-rerun`: step 9,891, Θ = 12, `relative-v1`.

**What changes from the registration.**
- **The starting state is the only change.** It is the copy above, in place of the DEE-1L starting copy (step 7,121). The original run from that copy is deterministic, and repeating it would reproduce its result exactly.
- **The rerun therefore asks whether the result holds from her state now.** That state has lived roughly 2,770 more steps, including about an hour under the lane.

**What does not change.**
- the rule OUTSIDE-LANE and its load conditions;
- the units (`amelia_wt5l_inputs` 1–12) and the protocol;
- the arms CURRENT, LANE, LANE-TOWARD and LANE-AWAY;
- the measures M0, S, H1 and H2, the statistics (sign-flip, Holm at 0.05), and the readings and adoption rule;
- the machinery (`machinery.ts`, unchanged; MACHINERY_SHA256.txt).

The research lane is attached to a `relative-v1` runtime, as in the original run. The core rule added at adoption is not used by the rerun.

**Rows.** They are prefixed `r-` in `amelia_gate2l_runs`, with the analysis as id `r-analysis`. The run is started by a `run.trigger` containing `rerun`.

**How it is reported.** The rerun is reported beside the original run. Neither replaces the other.
