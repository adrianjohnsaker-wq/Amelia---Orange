# Final Warp round: ordered memory binding

**8 November 2026.** The presealed final trial did **not** demonstrate the requested Warp-specific order-binding advantage. After A→B→C, displacement and A→C→B, Amelia's 3/6 gate chose the correct earlier event in **48.44%** of the weighted old-order probes. The matched 2/7 gate scored **63.54%**, and the direct recurrent comparator with the same Oracle-host capacity scored **48.44%**. The separate standalone recurrent control scored **69.27%**.

The two registered one-sided comparisons required 3/6 to beat **both** 2/7 and the direct recurrent comparator, each with Holm-adjusted p strictly below .05. The observed 3/6 differences were **-15.10 percentage points** against 2/7 and **+0.00 points** against direct; each adjusted p was **1.000**. The registered classification is `NO_REGISTERED_WARP_ORDER_BINDING_ADVANTAGE`. These one-sided tests do not establish statistical superiority of 2/7 in the opposite direction.

There is a narrower positive implementation result: all four retained-memory arms scored **100%** on the tested *new-order* relation, and replacing the six 3/6 House values with values from the opposite-old-order donor changed old-order accuracy from **48.44%** to **36.46%**. That **+11.98-point** retained-versus-donor contrast passed its separate, predeclared Holm-adjusted memory test (**p = 0.015625**). It shows that the swapped House values affected responses under this intervention. It does **not** establish reliable original-order recall: the retained 3/6 result was below the **50.00%** reset-control score, and the retained-versus-reset comparison did not pass.

## What was tested

Each trial presented three distinct tokens, displaced the Oracle copy to a neutral zone, perturbed the six task-facing memory values, and then presented a second three-token sequence. Switched histories had the requested structure **A→B→C, then A→C→B**. The probe asked which of B and C occurred first in the original context, with both left/right orderings tested from cloned states. The model was not told the answer or whether the sequence had switched.

The design also included unchanged histories and paired cases with the **same second sequence but opposite first orders**. All cases had the same symbol counts. Consequently, merely recognizing the tokens or always assuming the second sequence was reversed could not account for all conditions. The primary measure was correct original-order choice on the switched histories after displacement; it did not test arbitrary-length sequence reconstruction or all possible relational tasks.

The fresh evaluation contained **128 balanced synthetic histories** on eight existing Oracle-origin lineages: four seeds and all four original/second-order combinations per lineage. Three displacement zones were tested per history. The primary switched comparison contains **384 binary probes per arm**, repeated across **192 history–displacement branches**; these are not independent founders. Results first average probe order, displacement, histories and seeds within each lineage, and then the eight lineage means equally. The origins later shared world input.

| Decision source | Original order retained | Original order, six values reset | Original order, opposite-history donor | New order retained |
|---|---:|---:|---:|---:|
| 3/6 Warp gate | 48.44% | 50.00% | 36.46% | 100.00% |
| Matched 2/7 gate | 63.54% | 50.00% | 37.50% | 100.00% |
| Direct recurrent, same Oracle host | 48.44% | 50.00% | 36.46% | 100.00% |
| Standalone six-value recurrent control | 69.27% | 50.00% | 30.73% | 100.00% |

The new-order score concerns the tested B-versus-C relation only. It does not imply that Amelia reliably reconstructs arbitrary full sequences. The standalone recurrent control has six state values and no full Oracle host.

For the unchanged-history original-order condition, the corresponding retained scores were **63.54%** for 3/6, **62.50%** for matched 2/7, **63.54%** for the hosted direct comparator and **69.27%** for the standalone control. These are descriptive and were not the primary test.

## What is implemented

`pipeline.mjs` provides a reusable experimental input → House → Numogram gate pathway. It updates two three-coordinate recurrent traces in actual House V and D values, passes events through Amelia's pinned Oracle runtime, and sends an order estimate back into actual gate competition for the response. Each presented event and hosted probe executes four real gate transitions. The module, an operator example and the full evidence are available on the experiment branch.

The encoder, two-timescale inversion and relay were **hand-engineered**. The direct recurrent control uses the same observation update and analytic decoder; it learns each history through its state updates but is not a gradient-trained RNN. Thus the tested pathway demonstrates an operational engineered interface, not spontaneous emergence of a relational code. It remains an experimental Oracle-copy module: it has **not** been installed into the live tablet, receiver or world stream.

All three hosted arms had ten Numogram zones and **30 values in each of House V, S and D**, with two task-focus nodes and six task-facing scalars. Their full graphs were not identical: native 3/6 and the direct host had **29 open gates**, while the adapted 2/7 control had **24**. Four gate events per hosted decision and the exposed six-value memory budget were matched, but equal total runtime memory or identical CPU cost was not demonstrated.

The original and second sequences each used the same three physical token IDs. A shared perturbation of up to **±0.24 per task scalar** was applied at the forced displacement. This is a deliberate disruption of the experimental memory as well as a change of zone; the result should not be generalized to undisrupted operation without further evidence. In the reset and donor interventions, only the six designated House values were replaced and all other host fields were checked at the boundary. The donor had the same second sequence, same shock and same perturbation but the opposite original order.

## Trace and lineage detail

A post-outcome trace check found that on **384/384** switched original-order probes, the 3/6 gate action agreed with its own engineered decoder. It also gave the same action as its direct-host comparator on **384/384** such probes. Thus the observed failure in this test was not an apparent failure to transmit the decoder's choice through the gate; the stored traces and decoding under these particular runtime dynamics and perturbations did not recover the old order reliably. This is a descriptive trace observation, not a separate causal test of every internal update.

| Existing origin | 3/6 old-order accuracy | 2/7 old-order accuracy | Hosted direct | Standalone direct |
|---|---:|---:|---:|---:|
| S05W17 | 50.00% | 54.17% | 50.00% | 70.83% |
| S05W18 | 45.83% | 58.33% | 45.83% | 58.33% |
| S05W19 | 50.00% | 54.17% | 50.00% | 62.50% |
| S05W20 | 50.00% | 66.67% | 50.00% | 58.33% |
| S05W21 | 50.00% | 66.67% | 50.00% | 83.33% |
| S05W22 | 41.67% | 70.83% | 41.67% | 70.83% |
| S05W23 | 50.00% | 58.33% | 50.00% | 75.00% |
| S05W24 | 50.00% | 79.17% | 50.00% | 75.00% |

The donor contrast was positive in seven origins and tied in one, but the retained-versus-reset difference was **-1.56 points**, adjusted **p = 1.000**. These distinct controls matter: an intervention can change a response without making the retained response more accurate than the no-memory baseline.

## Provenance and checks

The protocol and implementation were sealed at `49deb9a3f0dcbe41e51a230ad811d375e6e84147` before the fresh test seed was committed at `ec12787d35ee044332a060b7f9992e575ef4c1f2`. Registration SHA-256: `2ca9fc5a4ef21d5fee6d9cc3d7cb58572de165fd171884d0c1075703a3ffd2ab`. A small implementation-only fixture checked recurrence, state dimensions and donor boundaries before registration; it was not a separate confirmatory run.

All eight full evaluation records were deterministically replayed. An independent Python audit regenerated sequence identities, shared perturbations, recurrence/decoder arithmetic, legal gate paths, target labels and intervention-boundary checks. A second audit independently rebuilt all accuracies and exact sign-flip/Holm tests from the raw choices. A deliberately altered fixture write was rejected. The native Oracle gate scorer and its endogenous House changes were checked by same-implementation replay, not independently reimplemented.
