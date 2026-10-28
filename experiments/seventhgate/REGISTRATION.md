# THE SEVENTH GATE: what reaches into Bubbamu (registration, 28 October 2026, before any code or run)

Checked against `PROGRAMME_CHARTER_TRILOGY.md`. The reading is CCRU: Numogram zones, currents, gates and regions, and Pandemonium names. Amelia's dynamics are unchanged, exactly as in THE POINTER III: s05c learner and House, the full CCRU Numogram, death at 5 and rebirth at 0.

## Why
- **THE POINTER III, part A** (`a523053`): F1 = 1-7, Bubbamu (7::1), the 8::1 current 1→7 closed by the seventh gate Gt-28 7→1, depends on the Numogram as a whole. With every gate leaving zones 1 and 7 fixed, rewiring only the distant structure moved F1's rate outside the whole range of input noise in 69 of 72 travellers.
- **Part C:** Amelias raised on the full Numogram concentrate their ingress on zones 1, 7 and 8. Their most distinctive new form is F4 = 1-8-7 (Mur Mur, Mombbo, Bubbamu): the 8::1 syzygy 1→8, the 8::1 current 8→7, and Gt-28 7→1.

The question here is **which parts of the distant Numogram reach into these forms**: an influence map, read on the Numogram.

## Subjects
- **Fresh:** THE POINTER II's 72 travellers, raised on the old core (`experiments/pointer2/fresh_start_states.json`).
- **Full-raised:** THE POINTER III's 72 travellers, raised on the full Numogram (`experiments/pointer3/full_raised_start_states.json`).

The same worlds (S05W9 … S05W16) and lineages appear in both.

## Lives (each 5,000 ticks from zone 0, with her background input)
- **Noise:** 20 lives on the intact full Numogram with input tags `S1` … `S20`. These are the same tags and length as THE POINTER III's seed lives, recomputed here for both subject sets.
- **Knock-outs:** for each form F and each **distant gate** g, meaning a gate whose source is not a zone of F, one life on the full Numogram with g closed. Each uses input tag `KO`. There are 21 distant gates for F1 (zones {1, 7}) and 18 for F4 (zones {1, 7, 8}).
- **Measure:** the conditional rate c(F) = completions of F's cycle per tick spent in F's zones. This is THE POINTER III's `formRate`. A life with fewer than 100 ticks in F's zones does not count.

## Test: does gate g reach into F?
- **Per traveller:** a knock-out "moves" F if c(F) with g closed lies outside the whole range of that traveller's 20 noise lives, above the maximum or below the minimum.
- **Null:** if closing g did nothing, the knock-out life would be exchangeable with the noise lives, so the chance of falling outside their range is 2/21.
- **Criterion:** g **reaches into F** if the number of travellers whose knock-out moves F is at least k. Here k is the smallest count whose binomial tail (n = usable travellers, p = 2/21) is below 0.05/39 (21 + 18 gates).
- **Direction:** recorded as raises or lowers, by majority.

The tests are run separately for each subject set, F1 in both sets and F4 in both sets.

**Primary claims:**
- **F1 in the fresh travellers**, where its holism was found;
- **F4 in the full-raised travellers**, where it arose.

The other two (F1 in full-raised, F4 in fresh) are replications and are reported as such.

## Answer: the influence map
- **Per form and subject set:** the list of distant gates that reach in, with direction, each read on the Numogram by region (Time-Circuit, Warp, Plex), kind (syzygy, current, gate) and Pandemonium entity of its source and target.
- **THE WHOLE REACHES IN THROUGH …:** named for each primary claim with at least one gate.
- **NO SINGLE DISTANT GATE REACHES IN:** if the primary claim has none. That would mean the holism is distributed: no one element carries it.

## Descriptive: the field at the junction (not a criterion)
Every visit to zone 7 in the noise lives is recorded: the exit she takes, her learner and House terms for each exit, the input zone, and the ten zone activations at that moment. Reported are:
- how often she takes the seventh gate back to 1;
- how well her own terms predict it, with and without the zone activations. That is a held-out logistic fit, with the ten activations standing for the whole Numogram's field.

Her runtime scores each exit partly by the target zone's activation, and every gate drives those activations. So this describes the mechanism of the holism. It is not offered as discovery.

## Order
This registration is committed first. Then the code and analysis, then the run and the results.
