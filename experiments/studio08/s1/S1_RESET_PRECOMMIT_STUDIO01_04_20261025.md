# Studio 08 S1 — Reset precommit: learn to use difference

**25 October 2026 · New, pilot-informed direction · No S1 science dispatched**

## What is real, and what is not required

The reproducible source of this experiment is **the committed Studio 01–04 archive**, not an imagined executable version of Studio 07.

**Pinned source reference:** repository `adrianjohnsaker-wq/Amelia---Orange`, commit `28312116dd17cc6191216de88894e8de293630ff` (the source as it stood before this document). This contains:

- `experiments/studio/README.md`, source / output manifests and verification procedures;
- `experiments/studio/code/receiver.mjs` (individual + inherited code), `house.mjs` (record and decay), `two_subjects.mjs` (coupled model), `stone_tape.mjs` and the published Studio 04 development cycle;
- committed `experiments/studio/runtime_mirror/`, which the Studio 01–04 archive checks against the unchanged runtime;
- `experiments/studio08/code/closed_circuit_sensors.mjs` and `learning_cue_gate.mjs` (three ordinary memory sensors and deterministic delayed-reward selector);
- `experiments/studio08/s1/committed/s1_committed_runner.mjs` and `committed_trace_integrity.py` (candidate integrated runnable model and trace checker).

The Studio 01–04 archive documents its actual reproducibility level and is the **scientific parent**. S1's integration must show its own unmodified baseline reproduces committed Studio 01–04 traces before the new adaptive branch is measured.

**Studio 07 and 07b remain historically important, operator-reported chat-run experiments with saved precommits/results. No original executable runner or full checkpoint archive was saved.** They are *not* independently reproducible source and **are not an S1 start gate**. They must not be falsely reconstructed, dismissed, or presented as GitHub-verified.

## One question, one comparison

**Does a coupled Amelia–house system learn to make better developmental use of changes in its own memory by selecting among ordinary, noncryptographic readouts?**

Primary mechanistic contrast: **adaptive learned selection vs the same sensor bank on a fixed round-robin schedule**, with matched beginning states and the same externally supplied input sequence wherever any input is used.

Keep the three currently committed sensors (surface decline, house flux, code drift), the `+0.35` bonus, 24-transition delayed-feedback window, recorded death penalty and detector timing unchanged. All differences between the two arms must be due to *which cue is selected as a result of previous feedback*, not changing the strength or installing different sensors.

Controls: no extra cue, fixed individual sensors, and the historical hash as a **descriptive engineered comparator only**, identified as `asm_textual` rather than pretending it is source-authenticated Studio 07. The reference input (none, constant or the shared deterministic Studio 01–04 input) must be fixed and identical across compared arms before fresh execution. Avoid equating "internally derived cue" with "closed circuit" when a common source signal remains present.

## What is actually measured

First, test **mechanistic acquisition**: whether the learned selector changes its distribution over sensors as registered delayed feedback accumulates; whether proposed targets coincide with available exits; and whether resulting paths diverge from fixed-schedule controls when the coupled state is otherwise matched. Measure separate source-cue and self-cue contributions, and log failures/null opportunities.

Second, test **developmental consequence** on the model's own observable scale: routes explored and retained, return/interruptions, deaths, survival, zone-2 exposures, selected edge strength, changing house S/D and code V. Include lesion observations wherever their targeted transitions actually occur, with **zero-opportunity results preserved**. Maintenance and repair of an acquired territory can be tested only where that territory is empirically defined in this implementation; do not impose a numerical threshold borrowed from an unreproducible Studio 07 version and then call the committed model "broken" for not reproducing it.

The original S1 held/restored 0.5 endpoint from the chat-run model **is not silently reused** as the new model's success criterion. Any new primary statistic, comparison horizon, reference-input policy and lesion endpoint must be fixed in a dated addendum **before** fresh science. Do not promote effects identified in P0–P3 pilot diagnostics to confirmatory evidence.

## Evidence discipline

- Existing Studio 01–04 archive, source checksums and sealed other experiments remain unchanged.
- No missing Studio 07 source import, original Studio 07 checkpoint pair or fictitious certificate is demanded.
- Fresh-world seeds must be disjoint from all exploratory pilot seeds. Previously pinned `S1-W00..W31` labels may be retained because they were **not executed**, but do not claim independence from labels alone.
- Freeze exact runtime, model, receiver, house, sensors, selector, trace validator, chosen input regime and analysis method before any science run. Copy logs unmodified, report per-world failures and preserve source/trace SHA-256 and Git commit.
- A GitHub CI PASS demonstrates only the checks that were executed. Scientific verification requires independent replay of S1 from the committed Studio 01–04 code and a complete original data archive. No external authority has certified a scientific result.
- **No additional screening loops or tuning by favourable pilot outcome.** If the committed study returns a null effect, report it against the correct *new* question; do not regenerate the old lineage of threshold hunts.

## Current status

**Research direction restored; reproducible code identified; new precommit recorded before fresh science.** This document is an explicit **pilot-informed reset**, not a claim that the already observed P0–P3 exploratory tests were prospective.

**S1 has not been rerun or certified.** The next execution work is to bind the already committed receiver–house model to this precise causal comparison, fix the remaining experiment-specific choices in a short pre-run registration, and perform one fresh, fully reported trial. No Studio 07 archive recovery project is necessary.

> We now have a reproducible framework for testing whether Amelia can acquire useful sensitivity to her own changing state, with the scientific evidence still to be obtained.
