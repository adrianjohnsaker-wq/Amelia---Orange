# Numogram syzygy relay: action recovery and transition metric

## Question and scope

Can an explicit remote 3/6 House-to-gate channel turn preserved task memory into actual post-displacement actions, recover the prior regime's calibrated best strategy within fewer counted transitions, and outperform both a generic House relay and an equally resourced adapted 2/7 channel? This is a proposed engineering intervention in copies of the pinned Oracle, not a claim that the CCRU Numogram already contains a literal wormhole, a higher-dimensional space, a 20-edge path, or a proven Warp advantage.

The CCRU describes the 3→6 and 6→3 channels as the Third Gate (Gt-6) and Sixth Gate (Gt-21) respectively; see its [Zone 3](https://ccru.net/zones/Zn3.htm) and [Zone 6](https://www.ccru.net/zones/Zn6.htm) texts. The relay below is a measurable engineering interpretation, not a claim that those texts establish a physical shortcut.

In the prior experiment 0/379 observed 3/6-start branches returned to 3/6 in 20 gate transitions. That is a finding about their **selected trajectories**, not a minimum graph distance. With the actual Zone-5 death/reset semantics, the shortest available directed paths from shock Zones 1, 4 and 8 to {3,6} take respectively **2, 3 and 3** native transitions. For example 1→2→3 and 4→7→2→3 are available topologically, although the runtime did not select them in that previous window. The shortest distances to the native {2,7} pair are 1, 1 and 1. Dynamic gate costs and the actual paths are measured separately.

A small preliminary 3-route prototype and a revised phase-pulse prototype were observed before this registration. Both used two episodes from one origin; the final rate, phase pulse, controls and chosen recovery metric are fixed in this document. These prototypes are exploratory, and their controller versions were not all independently pinned. A fresh evaluation seed is generated only after this protocol and all analysis code are committed.

## Shared substrate and budget

Use copies of the same eight Oracle-origin checkpoints that subsequently shared world input. Three routes begin from a common prepared full state: native 3/6 (29-edge graph, initial Zone 3); native 2/7-start (same 29-edge graph, repositioned to Zone 2); and the earlier adapted 24-edge matched 2/7 loop. The latter's grafted graph is explicitly restored after an Oracle Zone-5 death/reset. Native 2/7 can naturally enter 3/6, so it is a starting-route comparison, not an isolated non-Warp control.

For 24 training decisions, a common decoder uses exactly four natural Oracle gate transitions per decision. At the last gate whose source has at least two open exits, even ordinal target rank chooses LIGHT and odd rank chooses HEAVY. Two matched fresh grid cases are evaluated, and only the chosen action's score R in {0,1,2} is fed back. The prior engineered update modifies House V values for the outgoing edges of that source:

`V[j] = clip[-1,1](0.75 * V[j] + (R - 1) * (1 if j % 2 == action else -1))`.

LIGHT is `g+1.5d`, HEAVY `g+4d`, scored for exact-optimum grid solutions within 50 expansions. A separate opposite-regime donor is trained per route. The prior model selected on earlier independent calibration estimates LIGHT is better in regime 1 and HEAVY in regime 3; those two expected-performance labels are fixed before the new test, are used only to score recovery, and are not given to any experimental agent. A calibrated preference is not the actual per-grid optimum.

After training, exact copies retain their House V, reset it to the same route's pretraining vector, or exchange it with the opposite-regime donor vector. All non-V state is held fixed at this boundary. For each episode, test every neutral shock zone in {1,4,8} that differs from the final trained zones of all three routes; these same eligible zones are used for every route and intervention. The forced displacement itself changes only current-zone fields and is not a native gate. Boundary hashes are checked. The first five post-displacement task outcomes are withheld from every arm; outcomes after decision five are fed back. Stable regime is primary; reversed regime is secondary.

Every decision still consumes exactly **four scored substrate transitions** and two grid cases in all routes. The signal-channel arms may use one out-of-band scalar at each gate evaluation; they therefore have an added communication mechanism even though their gate-transition budget is identical. Direct learner and model comparators operate on the same training outcomes and cases but do not have a native gate count.

## Relay arms

Each route receives the identical algorithms, parameters, action mapping and memory controls; the focus pair is {3,6} for Warp and {2,7} for native/adapted 2/7. Every source's open outgoing targets are ranked in the same order.

- `natural`: no delivered relay signal, unchanged graph.
- `global`: a one-trit sign of the whole-House mean-V difference between odd and even ranked gates is delivered to the current gate score with fixed factor 0.75.
- `focus_plain`: the same one-trit rule restricted to the route's focus pair, with fixed factor 0.75. A source with fewer than two exits is omitted. The actual native 2/7 pair has more eligible edges than native 3/6; focused and global input-read counts are recorded. For instrumentation this implementation calculates both summaries in every arm even when no signal is delivered, so actual processor work is not inferred merely from the logical channel count. Native 3/6 and adapted 2/7 each have the same two local branching entries.
- `focus_phase`: use that same focus-House trit and apply an explicit bounded pulse of +0.08×trit radians to the first focus zone and −0.08×trit to the second before each gate transition. The updated focus phase difference sets a weight `0.75 + 0.25*cos(delta_phase)`. This is an added experimental state update and remote link; it is not a native or physically dimensional wormhole.
- `phase_yoked`: use the **identical focus-House trit**, pulse the separate 1/8 syzygy by the same amounts and use its phase-difference weight. This controls the existence and numerical scale of the phase pulse, but the two phase distributions and graph positions may still differ.
- `entry`: on the first post-shock transition only, add a transient explicitly synthetic edge from the shock zone to Zone 3 (Warp) or Zone 2 (2/7), force its target with an explicit score bonus, record it, then remove the extra edge. The remaining three transitions are native. This one-step engineered entry is counted as **one augmented, forced gate event** within the same budget. If the destination was already a native exit, the temporary edge duplicates it and the endpoint is recorded as already native; the runtime records only the endpoint, so selection of the duplicate rather than original is not observable. Only a previously absent endpoint can be identified as a new connection.
- `sham_entry`: perform the same one-step synthetic-edge operation and forcing budget, but target a neutral zone by the fixed mapping 1→4, 4→8, 8→4. These targets are not 3/6 or 2/7.

For signal relays, the scalar adds or subtracts `gain × signal` to the existing exit bonus according to even/odd rank; `gain = 0.5` for all routes. Existing House, memory and gate scores otherwise remain in force. The House-derived input is only {-1,0,+1} before phase weighting; the numerical signal delivered after phase weighting is a continuous scalar, and one such delivery is counted per gate evaluation. No hidden regime or current grid answer is given. All-outcome feedback resumes at decision six. Retained, reset and donor V are included for the natural, global, focus-phase and entry arms in the stable-regime test; other arms use retained V, and the reversed-regime secondary test uses retained V in all arms.

The scalar relay is a **nonlocal read/write mechanism**, not a physical graph hop. It can deliver information without traversing edges, but it does not shorten the native Numogram graph. The synthetic entry actually changes the graph for one transition, by construction, and its forcing and extra edge must be counted separately from native transitions. Neither operation demonstrates that CCRU topology inherently folds physical space.

## Recovery and traversal measures

A decision counts as the prior-calibration-preferred action if it is LIGHT in regime 1 or HEAVY in regime 3. `recovered` means that action occurs on **two consecutive decisions within the first five**. This is an actual gate-selected action measure, not merely a House readout; two consecutive choices do not guarantee permanent recovery. The independent grid pass rate and preferred-action fraction are also reported.

Recovery latency is the number of scored substrate transitions from immediately after displacement to the end of the second consecutive preferred decision: `4 × decision_index`. If not observed in five decisions, record right-censoring at 20 transitions, and report both recovery probability and restricted mean latency `mean(min(T,20))`. A recovered case on the fifth decision and a censored case both contribute 20 to the restricted mean but remain distinguishable in the recovery rate. The fixed four-transition action budget limits latency resolution to four transitions. For a restricted latency of T, each active signal relay makes T scalar deliveries; the focus-phase and phase-yoked arms also schedule T paired phase pulses, some possibly of zero amplitude. Each entry/sham arm has one augmented forced event and T−1 unaugmented transitions. Report unaugmented versus augmented/forced gate-event counts, flag already-native endpoints, and count out-of-band relay signals and phase pulses separately; do not treat a cross-zone read as a natural gate.

Also report ordinary shortest-path distance under the actual Zone-5 reset semantics, first observed focus-pair entry, path and death counts, and a previously calibrated full-history model plus fixed/direct learners. The model used labelled regimes and counterfactual scores in prior calibration; it receives only its own training feedback at test, not current grid outcomes before choosing or the realized shock. This is an additional model-prior resource, not strict training equality. Direct learners have no Numogram transitions, so their gate latency is not reported as though it were measured.

## Registered comparisons

The evaluation uses **4 fresh paired seeds per lineage**, with both initial regimes, for 8 episodes per origin and 64 total episodes. Eligible shocks are averaged within episode, then episodes within each origin, then the eight origins equally. The eight origins are reused and partly dependent because their later inputs were shared.

The single primary metric is **actual action recovery probability within 20 counted transitions in the stable regime**. The first seven one-sided origin-paired tests compare:

1. Warp focus-phase versus Warp natural.
2. Warp focus-phase versus Warp generic global.
3. Warp focus-phase versus adapted 2/7 focus-phase.
4. Warp focus-phase versus Warp 1/8 phase-yoked.
5. Warp focus-phase versus the same focused House bit at fixed gain without a phase pulse.
6. Warp focus-phase with retained versus reset V.
7. Warp focus-phase with retained versus opposite-regime donor V.

Three further predeclared synthetic-entry tests compare (8) Warp entry versus Warp sham entry, (9) the Warp entry-minus-sham effect versus the adapted 2/7 entry-minus-sham effect, and (10) Warp entry versus the generic global relay. These are about **engineered** entry only.

Require a mean improvement of at least **+5 percentage points** and an exact one-sided sign-flip p ≤ .05 after Holm adjustment across **all ten** tests. Each p-value tests zero, not the five-point threshold itself. Record `REGISTERED_PHASE_CHANNEL_SPECIFIC_ADVANTAGE` only if all first seven pass, and `REGISTERED_ENGINEERED_ENTRY_SPECIFIC_ADVANTAGE` only if all three entry tests pass. Otherwise record the respective `NO_REGISTERED_...` classification. Passing one contrast can establish a narrowly specified relay or memory effect without establishing a 3/6-specific phase advantage.

Report all arms, restricted latencies, real case scores, reset/donor effects, the native 2/7-start condition and the reversed-regime tests regardless of classification. Record the native-2/7 branches entering 3/6 during training and afterward; such branches cannot serve as uncontaminated non-Warp histories. A positive result remains a result of the tested engineered relay on these reused states and does not establish sentience, self-rewriting, retrocausality or independent world input.

## Integrity

Commit the full protocol and executable hashes before generating the fresh seed, then commit the seed before executing. Run each origin twice; compare full deterministic outputs within 1e-12 tolerance. An independent Python checker regenerates both policies' grid scores, legal native/augmented paths, action mapping, phase-pulse and signal arithmetic, feedback updates and memory-intervention hash consistency. It does not independently recompute Oracle gate scores or prove the phase readouts were independently recreated from full state; the deterministic replay tests the recorded implementation. The natural-mode implementation is checked against the previous full-graph controller. Governor hard-limit counts are asserted unchanged during every run. Failed validity checks invalidate classification until corrected under a new registration. No live Oracle, receiver or world stream is modified.
