# Studio 08 S1 — pre-commit on the committed learner–house model (DRAFT, not sealed)

**Drafted 26 October 2026, before any S1 run. Status: DRAFT for operator decision; nothing below has been executed on S1 worlds.**

## Why this route

Studio 07 and 07b were run inside a chat. No runner, serializer, checkpoint or trace file was saved, so the import gate in issue #7 can never be met. Studio 07/07b therefore survive only as the operator-reported results recorded in `STUDIO_07_07B_OPERATOR_SUPPLIED_RESULTS_AND_CAUSAL_CORRECTION_20261025.md`. S1 is re-based on code that is already committed and verified, and Studio 07 is not treated as reproduced, replicated or authenticated anywhere in S1.

This replaces the "original Studio 07 model" gate of `S1_FRESH_WORLDS_REGISTRATION_CANDIDATE.md`. Its design otherwise carries over: aims, 32 seeds, two scenarios, six arms, the outcome classes, and the statistics.

## Model (committed, verified)

- **Runtime:** `experiments/studio/runtime_mirror/`, verified 23–24 October. It produces identical trajectories to the unmodified runtime (`eqcheck`) and to the registered PF-2 goldens (`verify.sh`). It is used unchanged; the only hook is `exitBonus`.
- **Learner and house:** the Studio 03 two-subject dynamics in `experiments/studio/code/two_subjects.mjs`, with every constant as committed:
  - code V: refrain update (AM3), death update on the final excursion (AM5), η = 1/8, H = 24, read as wV·V(e) with wV = 0.5;
  - house: traversal deposit a = 0.002, death deposit A = 1 on the final excursion, surface decay λS = 0.002, seepage κ = 0.0005, deep decay λD = 0.00005, read as wH·tanh(S+D) with wH = 0.35.
  - These are the "contested_learn" settings of Studio 03, the archived configuration with both subjects active. They are carried over, not tuned for S1.
- **Life and death:** a death is entry to zone 5. A successor is born at once with a fresh canonical runtime, the same V, S and D, and a continuous clock (no per-life cap in the test phase).

## Worlds

- **IDs and seeds:** 32 worlds, `S1-W00`…`S1-W31`, using the seeds already pinned in `S1_FRESH_WORLD_SEEDS_V1.json`.
- **Genesis:** each world starts from V = S = D = 0. It runs the Studio 03 schedule (24 generations, 5,000-tick cap per life) with input string `S1G|<seed>|<g>|<i>`. This is the only phase that receives input; blank worlds under no input are all identical (all fall into the 0→9→1→8 circuit), so genesis input is what makes the worlds distinct.
- **Checkpoint:** {V, S, D} at the end of generation 24, at a birth boundary, with its SHA-256. Worlds whose checkpoints coincide are reported and fail the independence gate. There is no reselection or re-seeding.
- **Same forks for every arm:** all twelve arm × scenario runs of a world start from that one checkpoint.

## Test phase

- **No input:** every step is `step(undefined)` in every arm, so the canonical external cue never fires and nothing from outside enters.
- **Seasons:** a season is 5,000 ticks. Seven seasons per run: season 1, then six follow-up seasons.
- **Scenarios:**
  - *Intact:* no intervention.
  - *Lesion:* during season 1 only, a −5 term is added to the exit score of edge 2→7. This damages the world's route; it does not edit memory, and V, S and D evolve normally throughout.
- **Arms**, each with at most one +0.35 cue bonus per choice:
  - `adaptive`, `round_robin`, `fixed_surface_decline24` and `fixed_house_flux24`, using the committed Studio 08 sensors (`closed_circuit_sensors.mjs`) and UCB selector (`learning_cue_gate.mjs`, c = 0.20). Credit and censoring follow the S1 candidate unchanged.
  - `no_cue`.
  - `asm_textual`: a new arm built from the Studio 07 narrative formula, and **not** Studio 07's cue. The target is the first byte of `SHA256("SELF|" + last 24 zones joined by "," + "|" + V in EDGES order + "|" + (S+D) in EDGES order)` mod 10, with numbers written to 6 decimals and the zone history including the current zone. It is a secondary benchmark only.

That is 32 × 2 × 6 = 384 runs.

## Outcomes and analysis

These carry over from the S1 candidate and `science_analysis.py` unchanged, with three definitions pinned here because the committed model must state them:

- **Routes:** the mean, over lives in season 7 (including the open life), of distinct directed edges traversed.
- **Pull 2→7 and pull 4→5:** tanh(S+D) on that edge at the end of season 7. This is without the wH factor, as `house.mjs` reports it; with wH the 0.5 threshold could never be reached.
- **Last-season deaths:** deaths in season 7.

Classes and tests are unchanged:
- **Held / restored:** deaths = 0, routes ≥ 6.5, pull 2→7 ≥ 0.5.
- **Circuit:** deathless, routes ≤ 4.5.
- **Haunted:** deaths > 0 and pull 4→5 ≥ 0.05.
- **Otherwise:** other.
- **Co-primary tests:** `adaptive` vs `round_robin`, on held (intact) and on restored (lesion). One-sided exact paired McNemar test on each, Holm-corrected at α = 0.05 across the two. A positive claim requires both.

## Gates before the first S1 run

1. **Pilot, for engineering only:** run on four separate pilot seeds, `SHA256("STUDIO08-S1-PILOT-V1|P0".."P3")`, never S1 seeds. It checks custody, determinism under re-run, distinct checkpoints and complete trace files. Pilot outcomes are reported but may not change any parameter above. A bug fix is allowed only as a logged amendment before sealing.
2. **Seal:** one RFC 3161 token over this pre-commit, the runner, the seed file and the SHA-256 of every model file, using the committed C1 `Sealer`. No S1 world runs before the token exists.
3. **Run, then replay:** all 384 runs, then an independent clean-checkout replay that reproduces every trace SHA-256.

## Decisions for the operator before sealing

These are proposals; the values above are what will be sealed unless changed.

1. **Season length 5,000 ticks.** Studio 07's season length was never recorded; 5,000 is the Studio 03 life cap.
2. **Lesion as a one-season −5 exit-score penalty on 2→7.** This is a reading of "one-season 2→7 lesion of −5"; the alternative is subtracting 5 from that edge's house memory once.
3. **Genesis of 24 generations under the Studio 03 settings.** Shorter or longer genesis changes how established the territory is.
4. **Keep `asm_textual` as a secondary arm, or drop it.** Keeping it gives a comparison with the hash cue, but it must never be described as Studio 07's cue.
