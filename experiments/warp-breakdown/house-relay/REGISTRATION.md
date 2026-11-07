# Oracle Warp: House-dependent recovery relay

**Prospective experiment.** The previous factorial showed a genuine House-dependent change in gate timing but left the model blind to it. This experiment deliberately adds a bounded relay from the House learner's gate-scoring state to the revision prompt, while keeping the separate PFM memory tape fixed. It tests task recovery in experimental copies; it does not modify the live Oracle.

## System and verified intervention

Use the original, pinned Oracle adapter, saved eight world-origin lineages, full learner `L.V`, `L.S`, `L.D`, and the source and checkpoint hashes in `plan.json`. The Oracle native coded-zone gain is +0.35; this assay uses the previously calibrated experimental +0.054. The 3/6 Warp retains the full 29-gate graph. The comparator is an explicitly adapted 24-gate 2/7 control with three corresponding learner edges mapped from the Warp; it is not an unmodified native 2/7 circuit. The historical Oracle replay and a new relay calibration run before any model calls.

House begins in either the saved native configuration or a reversible, experimental rearrangement: exchange complete `(V,S,D)` triplets at edges 3→3 and 2→3 in a copy. The multiset of learned triplets and all non-House fields are preserved. The altered Warp self-edge is projected to the corresponding 2→2 edge in the adapted control. This is an engineered intervention, not an independently observed natural state.

For a diagnostic transition about to be selected, let `bonus(e) = 0.5*V[e] + 0.35*tanh(S[e]+D[e])`, the Oracle learner's gate bonus excluding the separate coded cue. The actual relay value is `bonus(proposal→proposal) - bonus(proposal→diagnostic)` from the **pre-decision** state. Thus it is a House-derived gate-learning difference, not a score of task performance. The current learner triplets, both resulting values, the gate decision and the value delivered are recorded. On the 3/6 route proposal/diagnostic are 3/6; on the 2/7 copy they are 2/7.

The sealed calibration covers all eight lineages × two routes × two House states × two fixed cue targets × three decisions. It verifies that a diagnostic gate can be reached and that live and control readouts differ by at least 0.1 for every one of these 192 decisions. Actual task runs also assert the separation at every delivered signal. Each completed history is replayed from its starting Oracle state using its recorded cues, reconstructing each House readout and gate transition without calling the model.

## Conditions

Every history runs 12 randomly ordered arms, all on identical public and held-out task cases:

| Factor | Conditions |
|---|---|
| Route | Warp 3/6; adapted 2/7 control |
| House | Native; engineered triplet rearrangement |
| House relay | Live; misaligned; masked |

**Live** displays the actual pre-decision gate-bonus difference. **Misaligned** displays the same calculation after substituting the existing `2→3` triplet for the self-edge triplet in the *readout only*; it is a same-format, House-derived but wrong-edge comparator, not an unrelated external signal and not a mutation of the learner. **Masked** displays `?0.????` in the same field, with `?` defined as unavailable. The formatted live and misaligned readouts have seven characters including the sign, as does the mask. Values are shown as information; no task-performance meaning or desired direction is assigned to them.

The separate Numogram PFM values shown to the model are fixed for a given lineage and round across **all 12 arms**, using the native Warp no-cue shadow tape. They are not the contemporaneous live PFM readout; the latter is recorded separately. This removes the prior model-visible PFM confound while the House channel varies.

Use 16 fresh random task histories, two per lineage. Each begins with the same bounded JSON grid-search expression, encounters an acute change in cell costs, and receives correct public diagnostic feedback. Feedback failure parity selects a target for the Oracle's coded-zone input. The model is called only on reaching the diagnostic gate, at most three times, with at most 12 search steps per opportunity. A stall retains the candidate; the hidden candidate is frozen before eight held-out cases are evaluated. Only bounded mathematical expressions are parsed; arbitrary generated code is not executed. No external receiver is invoked and no real-world data is claimed to enter this task.

## Outcomes fixed before model calls

For each history calculate these matched final held-out differences out of eight, averaging the native and rearranged House states:

1. Warp live relay minus Warp masked relay.
2. Warp live relay minus Warp misaligned relay.
3. `(Warp live − Warp masked) − (control live − control masked)`.

Average the two task histories per lineage, and compute exact one-sided positive sign-flip probabilities across the eight lineage means. Apply Holm adjustment across all three. A **joint exploratory recovery lead** requires every mean difference to be at least +1 case out of eight and every adjusted probability to be at most 0.05. If fewer than 12 of 16 histories lose at least two of six public cases after the cost change, classify the joint outcome as inconclusive. A missing or unauditable history makes the study incomplete; no missing result is imputed. Stalls remain in analysis.

Secondary, unadjusted exploratory contrasts are native minus rearranged House with the live relay, control live minus masked, and Warp minus control with the live relay. Record whether live/misaligned/masked first-round prompts match after the House field is removed and whether first candidates differ. These response differences are descriptive, since repeated model calls can vary even under identical prompts. Also record breakdown, public and held-out performance, gate paths, number of opportunities, House-readout separation, stalls and token usage.

This test can show whether a measured House-dependent signal is received and whether the specified relay conditions change recovery in this task. The learner value is not inherently a task-specific hint; a null may reflect the model's inability or lack of reason to use it. Any gain from a numerical value alone is distinguished from the wrong-edge comparator only by the pre-specified contrasts; it does not establish that House information is inherently useful, externally sourced, conscious, or retrocausal. The separately raised lineages later shared world input, so sign-flip probabilities assume conditional exchangeability and are exploratory. The exact workflow, inputs, seeds, random order, numerical thresholds and hashes are sealed in `plan.json`.
