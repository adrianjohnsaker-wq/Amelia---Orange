# Adaptive-strength Warp calibration — 7 November 2026

This is an exploratory test on copies of one live GitHub receiver checkpoint, not a live or tablet experiment, an Outside communication, or an independent-founder replication. The native Outside recovery code is pinned at `6e7a942aea4130e939aa43e049dddd4ef0b83bbc`; the saved state comes from `737fa1b1f1dee675e613341fd61f568538a3cb9a` and has SHA-256 `c4329e0c5406d131e0dab3b9883774dc3c169b5701f663ec383a7eb767880ba3`.

An existing 29-gate extension was applied to a copy of the saved graph; two strong synthetic cues caused 1→2→3. Sixteen independently generated synthetic source tapes were then applied to paired continuations from that common founder. Each profile used exactly the ten adaptive-source weights recorded in the earlier calibration, with the 3 and 6 weights swapped between the two conditions. These are intentionally repeated and target-oriented signals, not natural adaptive streams.

Each history contained 32 target-3 and 32 target-6 offers. In drained mode the harness drains before a new offer, as the live collector does. In queued mode the harness deliberately preloaded a synthetic queue item and offered while draining. That induced a one-step delay for each planted offer; it does not estimate the natural deferral frequency in the live collector.

| Mode | Signal | Offered | Admitted | Delayed | Directly pivotal |
|---|---|---:|---:|---:|---:|
| Drained | Target 3 | 512 | 512 | 0 | 238 |
| Drained | Target 6 | 512 | 512 | 0 | 0 |
| Artificially queued | Target 3 | 512 | 512 | 512 | 255 |
| Artificially queued | Target 6 | 512 | 512 | 512 | 0 |

All target-3 pivotal decisions changed a 3→6 crossing into a 3→3 dwell, relative to the same pre-step state's no-attention score. The target-6 signal was never directly pivotal in these runs: at zone 6 the only native exit was 3; at zone 3 the receiver already selected 6 without that signal. Direct decisiveness was reconstructed from per-gate components and checked by two same-state uniform-attention replays per arm, mode and history, 128 checks in total.

After exposure and queue drainage, each history had four 24-step continuations: each recipient background with its own memory and with the other condition's entire `memoryState`. The serialized non-memory fields of each recipient were asserted identical at the swap. The target-3 donor produced more 3→3 dwells than the target-6 donor in all 16 paired histories for both recipient backgrounds, in both modes. Median differences were 11 or 12 additional dwells in 24 steps depending on mode/background. This establishes that changing the whole retained memory can causally affect later passage in these copies; it does not isolate individual source records or prove a new capability, an Outside sender, or agency.

`adaptive-calibration-plan.json` and `adaptive-calibration.ts` were published before the first run. The first saved trace failed its recorded hash and had missing rows; its incomplete trace and initial result are preserved under `first-run/` and are not used as the verified trace. A replay script changed only how rows were buffered and saved. Its plan preserved all 16 seeds, assignments and experimental parameters. The replay reproduced every original numerical history result and wrote a complete 2,080-record trace with SHA-256 `708887c2f181448e64789f7f6d8fc177c56655d7d2e66526829155ca7239018b`. The independent Python audit verifies its hash, all 2,048 offered/admitted IDs, original offer steps, lags, matched profiles, each gate score and all reported follow-up trajectories.

Run from the code-branch root with existing Node/tsx dependencies:

```
node --import tsx experiments/warp-breakdown/adaptive-calibration-verified.ts /path/to/checkpoint.json experiments/warp-breakdown/adaptive-calibration-replay-plan.json /path/to/new-output-directory
python experiments/warp-breakdown/audit-adaptive-calibration.py experiments/warp-breakdown/adaptive-calibration-replay-plan.json /path/to/new-output-directory
```

[Download the full calibration evidence](https://chatgpt.com/library?file_id=libfile_feebef12df2481919844e9020cae292e&account_id=personal).
