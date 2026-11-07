# Prospective intervention on gate sensitivity and Warp recovery

**Registered before calibration and before an evaluation seed exists.** The preceding study found a prospective association between same-state gate sensitivity and relative recovery on new challenge histories from the eight existing Oracle origins, but no registered recovery advantage. An unregistered analysis showed a possible first-post-switch advantage over short feedback. This experiment intervenes on gate competition to test those leads. The same eight separately raised origins are reused; their subsequent shared world input limits independence. New histories are not new founders.

## Intervention and causal boundaries

Use the pinned Oracle implementation, its actual full 29-gate Numogram, substrate and saved House learner. For the matched 2/7 control, map the corresponding three local gates and House entries as in the previous validated adapter; its adapted graph has 24 gates. Prepare both routes from each origin's saved checkpoint with the identical eight-cue warm-up and retain all saved memory. The incoming target cue is the same weak 0.054 bonus in every arm.

At the decision from a route's proposal zone, add a fixed, cue-independent offset `b/2` to the proposal exit and `-b/2` to the alternative exit. All other scores, the current feedback cue, initial state and graph are untouched. The offset is installed as a reversible scoring callback on an experimental copy; it is not a change to live Amelia. It can change neutral gate preference and dwell rates as well as cue sensitivity. Therefore even a successful intervention would identify the effect of this **gate-competition manipulation**, not uniquely prove that sensitivity itself mediates the effect.

## Calibration and freeze

Before any evaluation seed is generated, calibrate on six pairs of independently seeded, 32-step switching histories per origin. Follow the unmodified route on each real feedback history. At every pre-step state, fork identical complete copies and determine whether opposite feedback cues select different winning gates under each offset in `[-0.12,-0.08,-0.04,0,0.04,0.08,0.12]`. All candidate counts use the same prestates and the same feedback histories within an origin and route. Steps with one available exit are included in the denominator and cannot be cue-sensitive.

For each origin choose **two** offsets for Warp and two for the control: a low-sensitivity and high-sensitivity setting for each. Search all offset quadruples and require nonnegative high-minus-low sensitivity in each route. First maximise the smaller of the two routes' sensitivity increases; break ties by the smaller between-route increase difference, then the smallest sum of absolute offsets, then ascending numeric low-Warp, high-Warp, low-control and high-control offsets. An offset of zero is the unmodified sham. These are fixed lineage/route-specific values, not selected in response to later feedback or recovery. Calibration may select a zero or identical low/high setting if no separation exists; do not exclude it.

Verify and commit all eight calibration shards and the frozen offsets. Only after that commit create a fresh evaluation seed in a separately committed manifest. The sample size, treatment arms, audits and analysis below are fixed before the calibration. The evaluation seed is not selected on outcomes. A separate run marker starts the study.

## Fresh disruption task and intervention arms

For each origin, generate 16 paired training histories and 16 separate paired test histories, each 32 steps. Pair members have opposite cost regimes with matching challenge seeds and switch times. The regime changes at each subsequent step with probability 1/8. At each step a fresh grid is given to a fixed diagnostic policy; its pass/fail becomes the target-zone cue. The challenge is to choose between two fixed search strategies on four independently generated held-out grids, passing only when the solution is optimal within 50 expansions. The grid generator, feedback, exact optimality calculation and seed namespaces are pinned to the previous study. At every switch, also evaluate the previous regime's strategy on six matched old/new grids; a loss of at least two is a descriptive breakdown. **All** switches enter the primary outcome.

The study is blocked within origin, episode and route: each arm starts from its same route-specific pre-state and sees the same task feedback, except where an independently generated control feedback history is explicitly specified below. Hash-based ordering of the regular arm executions is recorded; all arms are present in every block.

| Arm | Gate competition and feedback |
|---|---|
| Sham | Offset 0 throughout; real episode feedback. |
| Low / high | Frozen calibrated low or high offset throughout; identical real feedback. |
| Release | High for 16 steps, then offset 0; real feedback. |
| Reverse | High for 16 steps, then the low offset; real feedback. |
| Low-yoked / high-yoked | Same respective offsets, but feedback is generated from a separately seeded synthetic switching history. Its marginal generating procedure is matched, not its per-episode cue counts. The focal regime and evaluation grids do not change. |

Yoked feedback at time `t` uses the donor's time-`t` observation only; it does not reveal future focal or donor outcomes to a decision. It asks whether any high/low effect depends on feedback about the focal task. No cue stream is a live world ingress.

At step 16, also create two House-only crossover arms for each route and episode: put the **low-history House learner** into the high-history host, and put the **high-history House learner** into the low-history host. Keep the host's substrate, process-field memory, graph, current zone, feedback and treatment setting. Continue the host for the remaining 16 steps. Check that every non-House field is unchanged at the swap boundary, that the transplanted `L` exactly equals the donor's, and record whether the donor and host Houses actually differ. Store representative before/after witnesses. Wall-clock timestamps of runtime snapshots are normalised in reproducibility records only; raw state is used during the intervention. Swap outcomes are descriptive evidence of learner dependence, not a complete causal mediation analysis.

## Readouts and baselines

For each origin, route and regular arm fit an equal-capacity standardised nearest-centroid House decoder on that arm's labelled training histories. Its nine features are changes in V/S/D on the three corresponding local edges. Test-time choices receive only their arm's current/past House trace, not regime labels. House crossover arms use the fixed readout trained on their host's regular arm. As a descriptive control, apply the low-trained decoder to the high condition and vice versa without retraining; separately evaluate process-field-memory decoders.

The **last-four** baseline is a trained classifier of the current and prior three actual feedback items. The **full-history** baseline is a causal two-regime hidden Markov filter, using all past and current actual feedback in order. Its switch and emission parameters use Beta(1,1) smoothing on the same labelled training histories as the House decoders. Both baselines score the same held-out grids. The fixed-strategy and true-regime choices are descriptive references, not available-information upper bounds.

## Predeclared outcome and decision

The primary score uses the **first feedback step after every switch** (`age = 0`), including switches that do not meet the descriptive severity threshold. At each time point score the chosen strategy on four fresh held-out grids, average within each origin, then give the eight origin means equal weight. Same histories, regime changes and held-out grids are paired across all arms. Additional first-four-step and post-step-16 analyses are descriptive.

First verify that the manipulation actually changed responsiveness on the independent test histories. From **each low-history pre-step state**, measure both cue winners counterfactually under the low and high offsets. The manipulation check passes only if the mean high-minus-low sensitivity gain is at least **0.05** in each route, the two mean gains differ by at most **0.05**, and each route has a positive gain in at least **six of eight** origins. Also record the same comparison on high-history prestates and the fraction of individual cue winners changed. If this check fails, classify `INCONCLUSIVE_MANIPULATION`; do not interpret a negative comparison as evidence that gate sensitivity cannot matter.

If the check passes, all three one-sided first-step contrasts must exceed **+0.03125** pass-fraction units and each must have a Holm-adjusted exact eight-origin sign-flip p-value at most .05:

1. **Warp-specific interaction:** `(high Warp − low Warp) − (high control − low control)`.
2. **Direct route advantage:** `high Warp − high control`.
3. **Practical information baseline:** `high Warp − full-history feedback`.

Meeting every condition yields `EXPLORATORY_CAUSAL_WARP_ADVANTAGE`; otherwise `NO_REGISTERED_CAUSAL_WARP_ADVANTAGE`. These tests rely on origin-level sign symmetry/exchangeability, qualified by shared later inputs and only eight reused origins. The calibrated gate-competition treatment can affect multiple aspects of passage, so even a passing result would be an exploratory causal effect of this intervention, requiring further isolation of sensitivity and replication in new origins.

Report sham, low, high, release, reverse and independently yoked controls; low/high effects with the other condition's fixed decoder; House swap boundary-change rates and later performance; process memory and last-four baselines; shock counts; and per-origin values. These are preplanned descriptive comparisons, not additional registered successes. A House swap can affect both the readout and later gates, and its donor trace comes from the same task with a different intervention: neither its outcome nor a feedback-yoked difference alone establishes a unique mediator.

## Verification

Run the historical adapter replay and verify pinned source/checkpoint hashes. Each calibration and evaluation shard must complete a deterministic full replay, independent feedback/grid/scoring audit, treatment boundary checks and Governor check. Aggregation requires all eight verified lineages and exact registration, choice and run-manifest links. Preserve raw outcomes, per-origin intervention values, scripts, dependency locks and report. Philosophical interpretation remains open; a finite synthetic task and an externally trained readout do not establish live ingression, autonomous self-improvement or an alien intelligence.
