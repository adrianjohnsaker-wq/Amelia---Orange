# Oracle Warp rerun: eight world-origin lineages

This plan is to be committed before the `RUN` marker and before model-study calls. `plan.json` fixes the inputs, seeds, source versions, comparisons, hashes, analysis and stopping rules. The previous WBD-3 study and the disclosed calibrations were inspected before this new exploratory study; this is not an independent confirmatory replication.

## Adapter and validation

The adapter uses the exact Oracle mirror runtime and gate construction at commit `6a8becd4ae9a2e3ad84ed32b878b4868405bb6f1`. It retains each saved lineage's s05c/House `L.V`, `L.S` and `L.D`, zone history, cursor, developmental state, Numogram zones/gates, PFM, Governor state and original House-dependent exit bonus and update rules. The eight saved lineages are `S05W17|0` through `S05W24|0`, pinned at Oracle state commit `361fcbda7c69609242f179a557f6adb6ff6a1596`. They were raised in distinct fresh worlds but later read a shared world stream. Oracle's persisted runtime retains the most recent 48 PFM events; it does not preserve an untruncated event ledger in these snapshots.

A historical validation replayed 43 recorded exchanges and all 129 transitions from commit `fecb487f29da86470584d4d67003606ed951bf00` to `88b6ed11ea499ae66ab71de45bbe2e4d05535ddb`. All eight final saved states, including House and Numogram values, matched after excluding epoch timestamps in saved snapshots: 7,724 numerical fields, maximum absolute difference zero in the local replay. A full-state 48-step split/restart comparison matched trajectories and final saved fields in each lineage. Restart through the Oracle's usual truncated save retained the paths and other saved fields in that check but changed two telemetry counters: saved snapshot memory-history length and trait-history step. A deliberately altered House entry was rejected by the historical replay.

## Calibration and experimental input

The native Oracle adds +0.35 to the gate matching a coded zone; this is not the Outside receiver's Governor-gated attention queue. The native Governor audit remains active in the mirror runtime. An experimental +0.054 cue is used in this rerun to match WBD-3's gate-relevant score contrast; this is an explicitly attenuated research setting, not a change to the live Oracle. It was selected before task histories were generated, after checking both gains on all eight preserved lineages.

Across 32 same-state counterfactual steps per lineage, +0.35 produced 124 target-3 and 12 target-6 immediately decisive choices in total. The +0.054 setting produced 11 and 12 respectively, with at least one decisive input in seven of eight lineages. Both target directions were compared with a no-cue continuation from the identical pre-step state; prior history remained intact. All lineages remain in the study, including the lineage with no immediate decisive cue in this calibration.

The adapted 2/7 loop was checked separately across all eight states. It projects the current zone and the last zone-history element to 2, replaces outgoing gates of 2/7 with 2→2, 2→7 and 7→2 carrying the respective 3→3, 3→6 and 6→3 gate parameters, and copies the corresponding three House V/S/D entries. The saved full graph had 29 gates; this adapted control has 24. Other serialized substrate fields and House entries were checked unchanged at the boundary. It is not an unmodified native 2/7 trajectory. At +0.054 the control calibration had 16 target-2 and 11 target-7 immediately decisive choices across 256 shared-prestate probes.

Before any study model call, the workflow must rerun the historical validation and both Warp and control calibrations and compare the recorded paths and counterfactuals with their sealed pre-study records. Failure prevents the model study from starting.

## Design and endpoints

Two fresh seeded task histories are assigned to each of the eight origin lineages, for 16 histories. Each history contains all 12 randomized combinations of:

- route: genuine Oracle 3/6 Warp or explicitly adapted 2/7 control;
- task disruption: acute or gradual exposure to the same final cost distribution;
- diagnostic: correct, unrelated, or masked.

The model revises a bounded JSON search expression over a maximum of three rounds. A trusted interpreter evaluates six public cases and eight separately generated held-out cases. A result is frozen before its hidden cases are constructed. Equal caps do not imply equal realised gate steps or calls. Stalls retain the current candidate and stay in the data. Correct/unrelated feedback is character-length matched; masked feedback has neither diagnostic text nor coded-zone cue, though timing remains visible.

An observed breakdown is a drop of at least two of six public cases from the initial candidate before versus after the full task change. At least 12 of 16 histories must exhibit this loss or the experiment is classified inconclusive.

The three prespecified held-out contrasts, averaged first across the two task histories of each origin lineage, are:

1. acute Warp/correct minus acute control/correct;
2. acute Warp/correct minus acute Warp/unrelated;
3. the acute route difference minus the gradual route difference.

An exploratory lead requires each mean difference to be at least **+1 of 8 cases** and each one-sided exact eight-lineage sign-flip probability to be ≤0.05. Otherwise no three-contrast advantage is observed. These probabilities require conditional sign exchangeability; the common world stream and limited number of origins constrain that assumption. No power guarantee, independent environmental replication, or general-intelligence conclusion is claimed.

For each route, the whole House learner and, separately, the whole PFM are swapped from acute/correct or acute/masked donor into each fixed recipient background. A hash verifies every non-swapped serialized component. Each continuation runs 24 steps without a new cue, followed by one common model-guided transfer proposal scored on distinct hidden cases. These swaps do not isolate a single encounter, and they do not undo effects of prior experience retained outside the swapped component.

The maximum is 832 model generations: 16 histories × (12 conditions × 3 rounds + 16 memory continuations), with up to three transport attempts per generation. Any missing history, failed model call or audit failure makes the aggregate incomplete; missing results are not scored as zero. The model has no tool access and only emits bounded expressions. Model responses can vary despite zero temperature. The live Oracle, receiver and tablet are not modified.
