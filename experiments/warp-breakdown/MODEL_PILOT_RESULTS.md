# WBD-2 bounded model pilot

**Status:** completed exploratory model pilot, not the full 16-history WBD-2 comparison. The run used Claude Haiku `claude-haiku-4-5-20251001` through the existing Anthropic API, not a local Hermes model. The controlled [GitHub Actions run](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/42324408539) completed successfully from trigger commit `ace841590ad69ecb96e718abaefa38b4fb7d9de6`.

The pilot used two independently seeded synthetic task blocks, each with six matched conditions: the native extended 3/6 Warp or an explicitly topology-matched 2/7 adapter, crossed with correct, unrelated or masked model-facing diagnostic text. All continuations came from the same archived receiver checkpoint. The 29-edge extension and initial 2→3 entry were explicit interventions. The model revised a bounded JSON search-priority expression in a trusted interpreter; the model did not execute arbitrary generated code or update its weights. The model made 28 calls across 12 conditions.

The candidate first searched six public grid problems with unit costs. The same public layouts then acquired heterogeneous costs; six public and eight hidden weighted cases assessed recovery. The model received aggregate public feedback and local Numogram memory readings, never the hidden cases. The feedback-control condition changed only the text sent to the model: in every condition the real public failure count was also encoded into the input sent to Amelia. Thus the masked-text arm is not an all-channel no-feedback control. Feedback strings had equal character length, but token counts were not matched.

| Block | Before disruption, public | After disruption, same public | Final held-out result |
|---|---:|---:|---|
| 1 | 6/6 | 4/6 | Baseline 4/8; all six conditions finished at 6/8 |
| 2 | 6/6 | 1/6 | Baseline 3/8; Warp/correct finished at 7/8; the other five conditions finished at 4/8 |

Eleven of twelve conditions ended with the same expression, `g + 2.5d`; the second block's Warp/correct condition ended at `g + 3.2d`. This is a useful candidate lead, but a difference in one of two paired blocks is not evidence of a reliable Warp advantage. The solver operated within a predefined expression grammar, so improvement is a task-specific revision, not proof of new model weights, an independent mind, or unrestricted self-rewriting.

The failure diagnostics were processed as numerical attention offers. All 28 diagnostic offers were attended; there were 56 recorded gate steps including the returns, no queue residue and no hard-limit violations. A same-state remove-attention score reconstruction found **zero immediately pivotal diagnostic offers**: in these states the same gate won without the pulse. The inputs were nevertheless appended to PFM and PFM readings were provided to the model, so this does not exclude a later memory or prompt effect. It does mean that the observed 3→6 crossings cannot be attributed directly to these diagnostic pulses.

Independent Python code regenerated the task cases and evaluated every recorded candidate, checked all 28 model responses and feedback selections, and reconstructed the 56 recorded gate decisions. It verified the plan and executable hashes. This independently checks the recorded outputs; it does not independently regenerate the remote model's stochastic responses. The exact original result is stored on the [study branch](https://github.com/adrianjohnsaker-wq/Amelia---Orange/blob/warp-adaptive-calibration-20261107/experiments/warp-breakdown/results/model-pilot-result.json), Git blob `a782afad49ded1654f279fafaf715a8560c1a897`.

The next stronger test should prevent diagnostic information from leaking into the supposedly masked control through Amelia's memory, and should use more disjoint histories and states in which adaptive-strength diagnostic input can actually be pivotal. It should keep the pre-migration checkpoint and the full/adapter graph distinction.

[Download the complete evidence bundle](https://chatgpt.com/library?file_id=libfile_fc17247d082c8191a9894e0571f6c494&account_id=personal).
