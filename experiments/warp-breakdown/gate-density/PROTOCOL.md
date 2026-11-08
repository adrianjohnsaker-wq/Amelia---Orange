# Warp gate density: fixed-mask order-recall test

## Question and outcome

Does closing five gates in Amelia's native 3/6 Oracle graph improve preservation of the original order after displacement and an interfering sequence, and does any resulting 3/6 route outperform both the adapted 2/7 circuit and a matched-state direct recurrent comparator? The four masks below are fixed before fresh test data. They are a small targeted grid, not an exhaustive search over all 24-gate graphs.

For **each** mask A–D compare switched-history original-order accuracy against (1) the adapted 2/7 gate and (2) the direct recurrent readout on the **same masked host state**. Adjust all eight exact one-sided paired sign-flip p-values together by Holm. `REGISTERED_WARP_DENSITY_MASK_ADVANTAGE` is declared if at least one mask has a strictly positive mean difference and Holm-adjusted p **strictly below .05 for both of its comparisons**. Otherwise record `NO_REGISTERED_WARP_DENSITY_MASK_ADVANTAGE`. The comparator output uses the same six values and same analytic decoder but bypasses gate choice; it still executes four background transitions. These are one-sided tests in the 3/6 direction, not tests of superiority in the opposite direction.

A separate prespecified **density** family compares each mask with a 29-open-gate sham on the same switched old-order outcome; Holm-adjust the four p-values together. A passing comparison requires a positive mean and adjusted p < .05 and supports only that specific tested mask's effect relative to sham, not a general causal claim about gate count. A separate secondary memory family compares mask A retained versus reset and retained versus opposite-history donor, adjusted across those two tests. These families do not form one global multiplicity correction, so report primary, secondary-density and secondary-memory findings separately. The p-values test zero, not a practical margin.

## Fixed masks and resources

The 29-gate native Oracle graph is changed by marking five gate entries closed, without deleting House values. Each listed arrow is closed; all others retain their native open state and parameters:

| Mask | Five closed gates |
|---|---|
| A | 1→1, 1→7, 2→5, 7→1, 7→8 |
| B | 1→1, 1→7, 2→5, 7→1, 8→7 |
| C | 1→1, 1→7, 2→5, 7→8, 8→7 |
| D | 1→1, 2→5, 7→1, 7→8, 8→7 |

A is the concrete structural candidate recorded after the previous paths were inspected. B–D are three fixed local variations. The grid was designed after earlier outcomes and is not a random or representative sample of all masks; all four share closures 1→1 and 2→5. The full mask list and all analysis code are committed before the fresh seed. No mask is chosen or altered using the fresh outcomes.

All masks retain 3→3, 3→6, 6→3 and the 2→3 natural entrance. A static check using the runtime's Zone-5 death/reset semantics verifies 24 open gates, the same set of reachable post-reset zones, and the same minimum distances 2, 3 and 3 to {3,6} from shocks 1, 4 and 8. Any source that had at least two native open exits retains at least two. A reset test forces entry into Zone 5 and verifies all five closures persist after the runtime resets to Zone 0. A sham wrapper with zero closures must reproduce the old unmodified gate behavior in the implementation fixture.

The sham and mask arms begin from the **same** prepared 3/6 state and undergo exactly the same first sequence. After displacement and matched six-value perturbation, apply the mask or sham to clones: only gate-open flags and experiment metadata differ at this boundary, verified by hashes. The mask is reapplied after every Zone-5 death/reset, and every subsequent recorded gate step is checked for its open-gate count and legal options. The direct comparator for a mask is a clone of that very masked state with identical event transitions and input; its final choice is read directly instead of through gate selection. A separate direct-host 29-gate baseline and a six-value standalone recurrent baseline are descriptive controls.

The native 29-gate sham and adapted 2/7 gate are additional comparisons. All hosted arms have ten zones, the same 30 values in each House V/S/D register and the same six task-visible values. Masked graphs retain all 29 gate entries with five marked closed; the adapted control has 24 gate entries. The number of native transitions per presented token or hosted probe is four, but equal total runtime memory and CPU cost are not claimed. The adapter's ordinary S/D updates continue on base House keys even if corresponding gates are closed: this intervention changes gating, not the House-update rule.

## Histories and primary accuracy

Reuse eight historical Oracle-origin checkpoints, later partly dependent through shared world input. Use four fresh paired seeds per origin and all four combinations of first and second order with the same anchor and physical symbol set: 16 histories per origin, 128 total. In the switched subset expose A→B→C, force the same displacement to each of Zones 1, 4 and 8 with the same six-coordinate input-independent perturbation in {-0.24,-0.18,...,+0.24}, then expose A→C→B. Unchanged histories are intermixed without a switch label, including cases with the same second sequence and opposite first orders. No output label is fed back.

Use the previous sealed six-scalar two-timescale event recurrence and analytic old/new order decoder without retraining or changing its coefficients. A bounded ±0.75 gate-score relay produces the actual gate-selected answer to a two-alternative old-order probe; both candidate orderings are tested from exact clones. Score only outside the runtime. Original-order accuracy in switched histories is the primary endpoint, averaged first over the two alternatives, then three shocks, then the two switched histories per seed, then four seeds per origin, and finally eight origins equally. The 384 binary probes per arm are repeated observations, not 384 independent lineages. All retained/reset/donor and old/new probes, unchanged histories, per-origin values and unmodified-control scores are reported.

## Mechanism accounting and limitations

For each arm log every path, gate count and death, whether the second sequence reaches the focus pair, and mean absolute change in each of the three focus V slots and three D slots between the engineered write and the end of the four natural transitions. This `slot drift` describes recorded within-step changes and does not isolate entropy, information diffusion, or a causal mechanism by itself. Donor exchange replaces only six slots from an opposite-first-order history with the same second sequence, shock and perturbation. The no-label/reset and donor boundaries are hash-checked.

The order encoder, analytic decoder and relay are engineered and the direct comparator is a hand-specified recurrent learner, not a gradient-trained network. Successful performance is scoped to this two-order synthetic task and the tested masks. Counts may be constrained to 24 without proving gate density alone causes an effect, since which gates are closed and any induced paths also change. No live tablet, Oracle receiver or world stream is modified.

## Integrity

Seal protocol, masks, source hashes, pinned Oracle runtime and checkpoint hashes, topology checks and implementation-only fixtures before generating a cryptographically random evaluation seed; commit the seed before the held-out test. Each origin is run twice; complete output is compared to 1e-12 numeric tolerance. An independent audit regenerates paired histories, perturbations, legal paths, per-step open counts, decoder arithmetic, target labels and intervention-boundary checks. Another checker reconstructs accuracies, slot drift, resource counts and all three Holm families from raw records. Neither independently reimplements native Oracle gate scoring or the full House dynamics; replay is a same-implementation check. A deliberately corrupted fixture must be rejected.
