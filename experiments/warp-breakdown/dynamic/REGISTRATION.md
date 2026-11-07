# Prospective gate sensitivity and recovery after changing regimes

**Status:** registered before the calibration and before the evaluation seed exists. This is an experiment on copies of the eight existing Oracle-origin lineages S05W17–S05W24, not new founders. The common historical inputs and the reuse of lineages constrain generalisation. The post-hoc .054 gate-sensitivity/recovery correlation in the preceding study motivated this independent-history test; it is not itself prospective evidence.

## Question and experimental copies

Does a lineage's same-prestate gate sensitivity, measured before the evaluation challenge histories exist, predict whether the native 3/6 route or the matched 2/7 route yields better recovery after unfamiliar disruptions? Both are complete independent forks of the same historical Oracle checkpoint, with its actual Numogram, substrate and House learner. The Warp copy uses the native graph. The explicitly adapted control remaps the corresponding three local learned edges to 2/7 and copies their learner values; its local gate comparison is matched but its full graph is not identical to the native graph. The common preparation performs eight alternating cues at gain .054. A historical replay validates the underlying adapter before study execution.

The task and its feedback are generated locally; they are neither live world-stream inputs nor evidence about the Outside. A trained, external readout translates state into strategy. The study does not train model weights or demonstrate self-improving intelligence. No live Amelia state is changed.

## Sequential seal

1. Commit this registration, all executable and audit source hashes, the lineage identities, calibration seed, design constants, and both workflow hashes. Do not generate the evaluation seed at this stage.
2. Calibrate each lineage on 8 paired histories (16 trajectories) of 32 observations, under gains .054 and .35. At every step and in each route, fork the identical pre-step state and separately ask what gate would win under the proposal cue and the diagnostic cue. The sensitivity is the fraction of steps at which the winning gate changes. Save the actual route and no-cue pivotal count too. The actual state proceeds on the feedback-determined cue only; counterfactual forks are discarded.
3. For each lineage and strength select Warp when its sensitivity count is strictly higher than the matched control's. Select control for an exact tie. This decision is made separately for each gain. Freeze and commit the eight verified calibration shards and all selections. Source-replay and independent input audits must pass. Calibration results are not recovery outcomes.
4. Only after the frozen-selection commit exists, generate a fresh independent cryptographic evaluation seed, and commit it in a separate manifest referencing the registration and selection SHA-256 digests. The sample size is already fixed below. A further separate trigger starts training and testing. No evaluation outcome has informed route selection or seed choice.

## Fresh changing challenges

For each origin, draw 16 pairs of 32-step training episodes and 16 different pairs of test episodes. Complementary members of a pair share challenge seeds and switch times but have opposite regimes. Each episode begins equally likely in regime 1 or 3; at each subsequent step an independently hashed draw changes regime with probability 1/8. Hash-derived partitions separate calibration, training and test histories. All four gain/route arms see the same within-episode feedback sequence and are reset from the same prepared checkpoint at each episode.

The feedback is the pass/fail result of a fixed diagnostic strategy on a newly generated 9-by-9 weighted grid. Wall probability is 26%, a deterministic path is carved, and regime determines the cell-cost scale. A passing diagnostic cues the first route zone; a failing one cues the second. The fixed candidate strategies use priority scores `g + 1.5d` and `g + 4d`. A held-out case passes only if it finds an optimal path within 50 expansions. Four distinct held-out grids per observation score each candidate after the full state history has been captured. Regime labels and future feedback are not inputs to a test-time decision.

Each regime switch is an imposed disruption. To quantify whether it actually breaks an incumbent, score the candidate associated with the previous regime on six old-regime and six new-regime versions of the same seeded grids; a fall of at least two passes is a recorded breakdown. The primary recovery outcome includes **all** switches, not just those passing this descriptive severity check: for time points aged 0, 1, 2 or 3 after the latest switch, average held-out pass fraction over eligible points within each lineage, then average the eight lineage means equally. A rapid subsequent switch restarts the age at zero. Initial pre-switch points do not enter the primary outcome.

## Readouts and controls

Train each route and gain's House readout only on that origin's separate training histories. It is a standardised nearest-centroid linear classifier using nine changes in the three local edges' V, S and D values. An analogous three-feature process-field-memory decoder is a supplementary measurement. Both receive the same labelled training episodes. Test classification sees the relevant state trace at that time only.

The common four-observation baseline is a separately trained nearest-centroid classifier of successes and window length in the latest four feedback observations. The full-feedback comparison is a causal two-regime hidden Markov filter that consumes all successes and failures in order. Its switching and emission parameters are estimated with Beta(1,1) smoothing from the same labelled training histories; during test the filter uses only current and earlier feedback. Both baselines are run on the same episodes and scored on the same held-out grids as the House readouts. Fixed-strategy and true-regime choices are descriptive reference bounds; the latter is not an available practical policy. Only gains, routes and observations specified here are analysed as registered.

## Primary claims and tests

The sole primary input strength is .054. For each of the eight origins calculate the selected House pass fraction, the mean of the native Warp and matched-control House fractions, the short-feedback fraction, and Warp minus control. Three jointly necessary conditions are:

1. Selected House minus the mean of the two route House scores is at least 0.03125 pass-fraction units, with a one-sided exact sign-flip test across the eight origin differences.
2. Selected House minus the short-feedback baseline is at least 0.0625, with the same one-sided sign-flip test.
3. Across origins, Pearson's correlation of the previously sealed calibration sensitivity difference (Warp minus control) and the independent test recovery difference (Warp minus control) is at least +0.6, with a one-sided exact permutation test over 8! assignments. A constant vector fails this condition.

Adjust the three exact p-values by the Holm procedure; all adjusted p-values must be at most .05 as well as meeting the stated practical thresholds for the classification `EXPLORATORY_CALIBRATED_ROUTE_SELECTION_LEAD`. Otherwise classify `NO_REGISTERED_CALIBRATED_RECOVERY_ADVANTAGE`. These small-sample tests require exchangeability/sign symmetry assumptions that are qualified by shared later history. Stronger gain .35, full-feedback HMM, process-memory, raw Warp versus control, per-origin results and breakdown severity are preplanned descriptive comparisons, not additional confirmatory claims. In particular, a selected-route result does not by itself establish a universal 3/6-specific advantage; show the actual Warp-control differences and which routes were selected. If the ordered full-feedback comparator is better, say so explicitly.

## Verification and reporting

Each calibration and evaluation lineage is independently replayed and machine-compared; a separately implemented Python auditor regenerates the challenge grids, feedback and scores. Aggregation requires all eight complete verified shards and their declared source, selection and manifest hashes. Preserve registration, calibration, frozen selection, evaluation manifest, per-lineage raw outcomes, audits, fitted readouts, workflow records, and a reproducible outcome report. The original eight origins have separate histories but shared subsequent input, so no claim of independent founder replication follows from the nominal episode count.
