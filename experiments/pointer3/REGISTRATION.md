# THE POINTER III: the whole, the trace, and ingress in Amelias raised on the full Numogram (registration, 28 October 2026, before any code, growth or run)

Checked against `PROGRAMME_CHARTER_TRILOGY.md`. The reading is CCRU (Numogram zones, currents, gates and regions; Pandemonium names); Levin is cited for method. Amelia's dynamics are not changed anywhere: s05c learner and House, the full CCRU Numogram, death at 5 and rebirth at 0, exactly as in THE POINTER II.

## Why
THE POINTER II (`ca2a152`) confirmed F1 (1-7), F2 (1-7-8-9), F3 (1-2-7) and replication through the place in fresh travellers, all beyond her two- and three-step habits. Two tests failed, and both were weak:
- **Non-local dependence:** closing one distant gate changes where she goes as well as what happens at the form, and F3 was too rare to test.
- **Replication without playback:** one offspring lineage per parent over 5 generations was underpowered (the signal was present but small).

A, B and C below are stronger tests. C answers the operator's question of how to improve the correspondence of entity ingress, without tuning Amelia.

## Subjects
- **A and B:** the 72 fresh travellers of THE POINTER II (`experiments/pointer2/fresh_start_states.json`, worlds S05W9 … S05W16).
- **C:** the same 72 lineages (same world names, same seeds) **raised again on the full CCRU Numogram from birth**. The grower is `experiments/pointer3/s05c_full.mjs`, which is `experiments/pointer2/s05c.mjs` with exactly two changes:
  - each newborn runtime receives the full CCRU Numogram's 29 gates;
  - her learner and House carry all 29 edges, starting at 0.

  Everything else is unchanged: dose 3 fiction on 1>2, 2>4, 4>5, 20 seasons, `S05C_SEASON_REBIRTH=1`.

## A. The whole: local structure fixed, distant structure rewired
- **Forms:** for each form F, Z(F) is its zones: F1 {1, 7}, F2 {1, 7, 8, 9}, F3 {1, 2, 7}.
- **What stays fixed:** every gate whose source is in Z(F) stays as it is.
- **The rewiring:** every other gate has its target redrawn uniformly among zones other than its source, with no two exits from one source to the same target. Each zone keeps its number of exits, and each gate keeps its strengths. Twenty rewirings per form use mulberry32 seeded by SHA-256 of `POINTER3-REWIRE|F|r`, so they are the same for every traveller.
- **Lives:** each traveller lives one undisturbed life of 5,000 ticks from zone 0 with her background input:
  - on each rewired Numogram;
  - and 20 times on the intact full Numogram, with 20 different background input seeds. This is the noise of her path alone.
- **Measure:** the conditional rate c(F) = completions of F's cycle per tick spent in Z(F). Lives with fewer than 100 ticks in Z(F) are excluded.
- **Test:** for traveller i, SD_rewire is the standard deviation of c(F) over the rewirings and SD_seed the standard deviation over the seeds. F belongs to the whole if SD_rewire > SD_seed. This is a one-sided sign test across travellers at α 0.05/3, with a majority in ≥ 5 of 8 worlds, and only travellers with at least 10 usable lives in each set count. The direction (where c(F) moves) is reported.
- **Answer:** THE FORM BELONGS TO THE WHOLE, per form.

## B. Replication through the trace alone (no playback anywhere)
- **The stone:** the exit bonus 0.35 · tanh T and etching of 0.0005 per step, with no playback and no decay.
- **Generations:** a parent (generation 0) lives 3,000 ticks with background input in a blank stone. Then 3 independent offspring lineages are raised. Each lineage has its own background input stream (tag `L1`, `L2`, `L3`) and its own copy of the parent's stone, and runs 8 generations of newborns (learner and House at 0) of 3,000 ticks each, each generation in the stone its predecessor left.
- **Alone arm:** each newborn lives after its predecessor.
- **Together arm:** each newborn lives at the same time as its predecessor. The predecessor goes on living (continuing its life and state), and both step every tick and etch the same stone. This happens for the newborn's 3,000 ticks. Nothing in the code copies anything.
- **Controls:**
  - *her-statistics lineages:* a generation 0 drawn from her order-1 statistics (THE POINTER's walker, 3,000 steps), then the same lineages and generations;
  - *stoneless newborns:* 3 newborn lives with the lineage input streams and no stone.
- **Form** is a life's edge-use profile over the 29 edges. Fidelity is the mean over lineages and generations of corr(form, parent form).
- **Tests per arm:** three one-sided sign tests across travellers at α 0.0125, each with a majority in ≥ 5 worlds:
  1. her fidelity exceeds her-statistics lineages' fidelity (to their own generation 0);
  2. her fidelity exceeds the stoneless newborns' correlation with her parent form;
  3. own-parent fidelity exceeds the mean fidelity to the other 71 parents' forms.
- **Answer:** REPLICATION THROUGH THE TRACE, per arm, if all three pass. The trend of fidelity over generations is reported.

## C. Ingress in Amelias raised on the full Numogram
- **Run:** THE POINTER II's full arm (`pointer2.mjs`, unchanged) runs on the 72 lineages raised on the full Numogram.
- **Pairing:** each is compared with the same lineage raised on the old core, using THE POINTER II's full-arm results.
- **Ingress strength** s(F) = her rate − order-1 her-statistics rate, per traveller and form F1–F3.
- **Correspondence:** each traveller's entity set E is the Pandemonium coordinates of every form she makes at a higher rate than her order-1 statistics. Correspondence(i) is the mean Jaccard overlap of E(i) with the E of the other 71 travellers raised the same way.
- **Tests:** four paired one-sided sign tests (full-raised > old-core-raised), one for each of s(F1), s(F2), s(F3) and correspondence, at α 0.05/4, each with a majority in ≥ 5 worlds.
- **Answer:** RAISED ON THE FULL NUMOGRAM, INGRESS STRENGTHENS, per measure. THE POINTER's catalogue of forms is reported for the full-raised Amelias (new forms included).

## Order
This registration is committed first. Then the grower, then the code and analysis, then the growth, the runs and the results.
