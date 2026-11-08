# Amelia: decoder inversion and gate-structure audit

**8 November 2026.** The first place to start was the existing decoder trace. In an exploratory re-execution of the final trial's exact 3/6 histories, reversing the binary signal sent into gate scoring changed retained original-order accuracy after a switch from **48.44% to 51.56%**. The **+3.125 percentage-point** change was not compelling evidence of a systematic inversion: the exploratory one-sided origin-paired sign-flip p-value was **0.25**, unadjusted, across eight reused origins. This is a post-outcome analysis of the same histories, not a new preregistered confirmation.

Reversing the signal did have effects in other conditions. If applied to both contexts, it changed the new-order score from **100% to 0%**. When the second sequence had not switched, original-order accuracy fell from **63.54% to 36.46%**. A blanket inversion therefore does not restore order binding in this test.

| 3/6 condition | Original signal | Reversed signal |
|---|---:|---:|
| Switched; retained House; original-order probe | 48.44% | 51.56% |
| Unchanged; retained House; original-order probe | 63.54% | 36.46% |
| Switched; retained House; new-order probe | 100.00% | 0.00% |
| Switched; reset House; original-order probe | 50.00% | 50.00% |
| Switched; **opposite-history donor**; original-order probe | 36.46% | 63.54% |

The donor was deliberately taken from a history with the **opposite original order**, while preserving the same second sequence, shock and perturbation. Its 36.46% score is not evidence that Amelia's own retained trace was inverted. Reversing that donor's output changes which history it agrees with; the significant donor-swap effect still shows that the exchanged House values influenced responses. The retained-versus-reset comparison remains unsupported.

## What the inversion actually changed

The original presealed result and source remain unchanged. For all eight lineages the input history, displacement, House perturbation, original event paths and normal probe paths were reconstructed and checked against the preserved records. On cloned post-sequence states, the sign of the **binary decoder decision delivered as a gate-scoring bonus** was reversed, and the four actual Oracle gate transitions were re-executed. No new target was given to the runtime.

For retained switched old-order probes, the reversed signal changed the selected gate action on **384/384** repeated probes. The accuracy table reports the physically re-executed gate actions, not an assumption that the gate would follow a flipped output. The original paired design and same eight partly dependent origins remain; 384 probes are not 384 independent subjects. Six origin means were unchanged at chance, while two improved under inversion. For the reset condition the analytic decoder is exactly tied at zero; this implementation also reverses its default choice, but its balanced accuracy remains 50%.

The exact p-value is descriptive: direction and intervention were proposed after seeing the original data, no multiple-comparison adjustment is claimed, and the lineages later shared input. It does not rule out a context-specific inversion under other conditions.

## What differs between the 29- and 24-gate graphs

The native 3/6 graph has **29 open gates** and the adapted 2/7 control **24**, but this is more than a simple five-gate deletion. The control removes the eight outgoing gate entries from Zones 2 and 7, then inserts three gates copied from the 3/6 local loop. At the endpoint level:

- Six native connections are absent from the control: **2→3, 2→4, 2→5, 7→1, 7→5 and 7→8**.
- One connection is added: **2→2**. Two shared endpoints, **2→7 and 7→2**, have copied gate parameters.
- The three-edge local loops are matched: **3→3, 3→6, 6→3** versus **2→2, 2→7, 7→2**.

These rewiring and parameter changes prevent attributing the 63.54% versus 48.44% comparison to gate count alone. They can affect paths as well as density. In the original switched 3/6 records, **16/192** post-displacement second-sequence branches used **2→3**; **184/384** original-order probes used at least one of the endpoints absent from the adapted control. The counts are repeated branch/probe observations and do not establish that those edges caused a memory effect.

The difference matters for access: with the Oracle's Zone-5 death/reset rule, closing **2→3** removes all native routes from the tested displacement Zones 1, 4 and 8 into {3,6}. The 3/6 loop itself can remain intact while natural re-entry is lost. Furthermore, the adapter continues its S/D updates for base House edges even when a gate is closed; reducing the count alone does not automatically freeze the associated House values.

## A concrete density-matched starting configuration

As a **posthoc structural example**, close—but do not delete—the following five native gates:

`1→1, 1→7, 2→5, 7→1, 7→8`.

This leaves **24 open gates**, preserves **3→3, 3→6, 6→3** and the **2→3** entrance, and preserves the set of reachable post-reset zones from each tested shock zone. The native shortest paths to {3,6} remain **2, 3 and 3 transitions** from Zones 1, 4 and 8. Each source that formerly had at least two open exits still has at least two. These are structural checks only; the mask was selected after examining the prior paths, it is not isomorphic to the 2/7 control, and **no recall performance was measured under it**.

To test the density idea, the relevant comparison would hold the same 3/6 pre-state, six-value House representation, perturbations, decoder and gate budget fixed while comparing the 29-open-gate host, a sham intervention and prespecified 24-open-gate masks. The existing 2/7 and direct recurrent controls would remain. Mask selection and any claimed advantage would need separate fresh histories; searching masks and declaring a winner on these same records would be exploratory.

## Files and verification

The reproducible inversion script and gate-structure ledgers are in the accompanying evidence package. The prior source and its SHA-256 registration were checked before replay. Each original lineage's source-result SHA-256 and audit/replay proof was checked, and an independent Python aggregation verified all **4,608** recorded original and inverted probe rows against the original choices and targets. Native gate scores were re-executed with the original implementation, not independently reimplemented. No live tablet, receiver or world stream was changed.
