# Native full-graph Warp memory after displacement

## Question and developmental boundary

After training through actual gate-selected actions and their consequences, can a 3/6-origin Oracle copy retain *usable* task information through a controlled displacement, and does that retention exceed native 2/7-origin and adapted 2/7-loop controls? Native 2/7 can enter 3/6 naturally, so the native contrast estimates an effect of the **starting route and ensuing path**, not a pure comparison with a circuit that never enters Warp.

Developmental probes preceded this registration. In particular, an initial single-displacement pilot showed that moving copies to Zone 8 could leave all local gate decisions outside their trained area. Subsequent exploratory multi-zone probes examined eligibility and revealed that a whole-House readout could potentially expose stored values even where the local gate could not. The predeclared global readout below was added after those observations. The development and fixture records are preserved. The evaluation seed is generated only after this protocol and analysis are committed.

## Substrate, choices and learning

Use eight existing Oracle-origin checkpoints with later shared world input. Each episode begins with the same prepared full-graph state for all arms: the Warp copy starts in Zone 3 and the native comparator is repositioned to Zone 2. Both retain the unmodified 29-edge Numogram graph. The third comparator is the previously engineered 24-edge matched 2/7 loop. It copies local House and gate parameters from 3/6. If the native runtime reaches Zone 5 it performs its actual death/reset behavior; for the engineered matched comparator only, its grafted graph is reapplied after a reset so the intended comparator is not silently converted into the native graph. That is an explicit control adaptation.

The same decision rule applies to all three. At every decision the Oracle makes **exactly four unforced gate transitions**, with no cue, route forcing or externally selected gate. Sort each current source's open outgoing targets numerically; at the last transition whose source has at least two available exits, even exit-rank selects LIGHT and odd exit-rank selects HEAVY. If none has two exits, choose LIGHT. This common rank rule is an experimental action decoder, not a CCRU claim. All conditions are scored on two identical fresh grid cases at each decision and get the same four-transition and feedback budgets. Actual paths, alternate exits, Zone-5 resets and action codes are recorded.

Train for 24 decisions in one latent grid-cost regime, giving only the chosen strategy's actual grid outcome after each action. The environment supplies 0, 1 or 2 passed cases. On each feedback event, update all outgoing House V entries from the source of the selected gate using the prior sealed rate `eta = 1.0`:

`V[j] = clip[-1,1](0.75 * V[j] + (R - 1) * (1 if j % 2 == chosen_action else -1))`.

All other normal Oracle dynamics remain active. LIGHT is `g + 1.5d`, HEAVY is `g + 4d`, scored against the exact shortest path with a 50-expansion budget. For each route an independently evolving donor receives the opposite training regime on correspondingly seeded grids. Neither agent sees the current true regime, future test scores, or counterfactual action payoff when choosing.

## Displacement and memory interventions

After training, branch exact copies of each real-trained full state into:

- `retain`: preserve its entire House V vector.
- `reset`: replace that vector with the **same route's pre-training V vector**, preserving all other stored state.
- `donor`: replace the vector with the opposite-regime donor's V vector, preserving all other stored state.

This is a House-V intervention, not a selective removal of only the engineered update: it also removes or replaces any native V changes on those edges. An assertion and normalized hash check verify the rest of each state before and after that intervention.

A sham branch keeps its current zone. For the displacement branches, choose every zone in {1, 4, 8} that differs from the three real-trained routes' final zones; the same eligible zones are used for all routes and memory conditions within a paired episode. At least one will be eligible because the 3/6-origin route remains in its closed 3/6 circuit during pretraining. Eligibility depends only on the observed final zones and a preseeded ordering, not on post-shock outcomes. A displacement changes only the runtime current zone and the last trajectory-zone entry; a separate normalized state hash checks that all other fields are preserved. The intervention is an engineered teleport, not a naturally traversed gate.

Each branch is then followed for ten further decisions on fresh grid cases. Test both the same latent regime as training and the opposite regime, using matched per-round grid seeds. The experiment withholds the first five outcome-feedback events from all agents, while still scoring every decision; normal gate and memory dynamics continue. Feedback is supplied again on decisions 6–10. This isolates whether information from training is usable immediately after displacement, rather than allowing new post-shock feedback to create it.

A direct two-value learner with the same numerical update is trained on its own chosen outcomes; retained, reset and opposite-donor values are scored without substrate displacement. Both fixed strategies and a previously calibrated model-informed full-history Bayesian comparator are also reported. The Bayesian model was fitted earlier with labelled regimes and both action scores; at test time it uses only its own previous actions and outcomes, has no latent regime, shock target or explicit round index, and applies its fixed hazard prediction on feedback-withheld decisions. Its model calibration is an additional resource and must be disclosed.

## Two ways to read the memory

1. **Gate action:** score the real decision produced by the fourth-step local gate rule above. This is the primary, endogenous gate-coupled outcome.
2. **Whole-House readout:** before feedback, group all currently open gate House V entries by their source-local even/odd exit rank, excluding sources with fewer than two exits. Average the values within each group and choose the larger mean, with a tie choosing LIGHT. This same parameter-free readout is supplied to every route and memory arm. It is an external measurement; it does not steer the Oracle in this experiment. Over the first five feedback-withheld rounds, its alternative actions can be scored on the same cases without affecting the recorded trajectories, because their outcomes are not fed back. No counterfactual global-readout performance is claimed for later rounds when feedback is active.

The two readouts ask whether a trace is used by local gate dynamics versus recoverable by an external whole-state computation. The latter is not evidence of an autonomous relay.

## Predeclared endpoints

Each of eight origins has 8 paired test seeds and both complementary initial training regimes: 16 fresh episodes per origin. Within each episode the first-five score is averaged across its eligible displacement zones; then average across that origin's episodes and finally equally across the eight origins. Eligible targets are matched across routes within an episode, although their number can depend on pre-displacement paths. The primary environment keeps the same regime through the displacement; the opposite-regime challenge, sham, feedback-restored decisions 6–10, donor swaps, re-entry, path occupancy and death counts are secondary/descriptive.

For each readout define the memory contribution as retained minus reset performance after displacement. The six jointly registered one-sided paired contrasts are, for each of `gate` and `global`:

A. 3/6 memory contribution versus zero.
B. 3/6 contribution minus native-2/7-start contribution.
C. 3/6 contribution minus matched-2/7-loop contribution.

For a contrast to pass, require an average difference of at least **+3.125 percentage points** and an exact eight-origin one-sided sign-flip p ≤ .05 after Holm adjustment over all six contrasts. Each test is against zero; the practical threshold is not a confidence bound. `REGISTERED_WARP_SPECIFIC_MEMORY_ADVANTAGE` for a readout requires all of A, B and C to pass for that readout; otherwise record `NO_REGISTERED_WARP_SPECIFIC_MEMORY_ADVANTAGE`. Passing A alone supports memory usefulness within that readout and intervention, but not Warp specificity. Global and gate results remain separately labelled.

Count how often the native 2/7-start pretraining and displaced branches enter 3/6, as well as return to each original pair. Do not classify those later 3/6 states as an uncontaminated non-Warp control. A graph's known closure is not itself evidence of a learned recovery advantage. Origin-level sign-flip inference is conditional on eight reused lineages whose later input was shared.

## Integrity and scope

Commit the protocol, source hashes and previous fixed model before generating the fresh test seed; commit the seed before executing. Generate each origin twice, compare the complete deterministic datasets at 1e-12 tolerance, and independently regenerate every grid, score, valid gate path, action mapping and recorded feedback update. Verify readout arithmetic and the stored boundary-hash consistency. Original and replay executions assert no new Governor hard-limit violations. The Python audit does not independently recompute the Oracle's gate selection. Any failed validity check prevents outcome classification without a corrected, newly registered run. The live Oracle, receiver and world-stream pipelines are not changed.
