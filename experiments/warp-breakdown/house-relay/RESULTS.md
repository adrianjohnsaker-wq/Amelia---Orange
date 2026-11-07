# Amelia: House-dependent recovery relay

**Completed 7 November 2026.** The House-to-model relay was implemented in experimental Oracle copies, verified against the actual learner state, and tested on 16 fresh task histories across eight world-origin lineages. The registered joint result is **`NO_JOINT_HOUSE_RELAY_RECOVERY_ADVANTAGE_OBSERVED`**.

The relay succeeded as a connection: House-derived gate values reached the model, and the displayed value was associated with changes in later proposals. The decisive control is that a **wrong-edge House value** produced a similar pattern. The experiment therefore does not establish that the correctly aligned House signal improved recovery.

## 1. What was changed

The preceding experiment changed Amelia's House state and gate path, but never communicated that difference to the task model. This study added one explicit, numerical House-dependent field to the revision prompt. At the diagnostic gate decision, it computed the Oracle learner's pre-decision gate-bonus difference:

`House bonus for staying at proposal − House bonus for moving to diagnostic`.

The bonus is calculated from the Oracle's learner values `V`, `S` and `D`; it is not a direct score of task performance. Each decision's source triplets, computed difference, displayed value and gate transition were recorded. The [study was sealed](https://github.com/adrianjohnsaker-wq/Amelia---Orange/blob/7b966408397ef6de3a407f193be5c073d2d70339/experiments/warp-breakdown/house-relay/REGISTRATION.md) before the [model run](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/42374627271).

Every history ran all 12 combinations in randomized order:

| Factor | Conditions |
|---|---|
| Route | Warp 3/6; explicitly adapted 2/7 control |
| House | Saved native learner; engineered rearrangement of existing learner triplets |
| House field | Correct live gate difference; wrong-edge comparator; masked |

The wrong-edge comparator substituted the existing `2→3` learner triplet for the self-edge triplet **in the displayed calculation only**. It was another House-derived number in the same format, not a change to the learner or an external signal. The masked field contained no numerical gate difference.

The separate model-visible PFM values were held fixed across all 12 arms for each lineage and round. They came from a no-cue Warp shadow trajectory, not from the current experimental trajectory. Live PFM values were recorded separately. The House rearrangement exchanged existing `(V,S,D)` edge triplets in a copy; it was an engineered contrast, not an independently observed natural House state. The 2/7 route was an adapted experimental graph, not the unmodified native 2/7 circuit. The coded-zone gain was the calibrated experimental +0.054 rather than the live Oracle's +0.35.

## 2. The relay reached the model

Before the model run, calibration checked **192** diagnostic decisions across all eight lineages, both routes, both House states and two cue targets. The correct and wrong-edge values differed by at least **0.34887** at each tested decision. During the study, all **576** delivered fields met the registered separation check; no arm stalled.

Afterwards, all **1,170 recorded gate steps** were independently replayed locally from the saved learner states and the recorded cues. The replay reconstructed the same pre-decision House values and gate paths. The independent task audit also checked every prompt, candidate, feedback calculation, held-out score and recorded gate-score calculation. Its regenerated summary matched the workflow's summary.

In an exploratory prompt-level check, the first proposal was identical between the live and wrong-edge conditions in all **64** matched route/House/history comparisons. At the second revision, the prompts in those same 64 pairs were identical after removing the House field, and the candidates differed in **50/64** pairs. This is evidence that changing the field can affect subsequent model proposals, although the comparisons share histories and are not independent statistical replications. As a variability check, 13 of 288 pairs of identical second-round prompts also produced different candidates. The model received the House number; the result does not establish that it understood House or used the number's gate meaning.

## 3. Breakdown and the registered recovery test

The acute cost change met the presealed breakdown criterion in **14/16** histories, above the required 12. Across all conditions, the initial expression averaged **6.00/6** public cases before the change, **2.50/6** immediately afterwards, and **4.38/6** after revision. Its matched held-out mean rose from **3.6875/8** to **5.4792/8**. Those averages describe recovery across the study; they do not attribute it to the relay.

Each primary comparison averages native and rearranged House within the two task histories per lineage. A joint exploratory recovery lead required all three predeclared mean differences to be at least **+1 case out of eight**, with each Holm-adjusted conditional sign-flip p-value at most 0.05.

| Predeclared comparison | Mean difference, cases out of 8 | Conditional one-sided p | Holm-adjusted p | Result |
|---|---:|---:|---:|---|
| Warp live House field − Warp masked | **−0.5000** | 1.000 | 1.000 | Threshold not met |
| Warp live House field − Warp wrong-edge field | **+0.03125** | 0.500 | 1.000 | Threshold not met |
| `(Warp live − masked) − (2/7 live − masked)` | **+0.0625** | 0.375 | 1.000 | Threshold not met |

The corresponding Warp means were **5.3125/8** with the live field, **5.28125/8** with the wrong-edge field, and **5.8125/8** with the field masked. These comparisons do not show that the correct relay improved held-out recovery. The one-sided test was registered in the positive direction; its p-value is not a pre-registered test for harm.

## 4. The informative reversal

A predeclared **secondary**, unadjusted contrast showed that with the live relay the native House averaged **1.25 more held-out cases out of eight** than the rearranged House, averaged across routes. The difference was positive in all eight lineage means; its conditional two-sided sign-flip p-value was **0.0078125**, unadjusted for the secondary comparisons. On its own this looks like a promising House effect. The controls change its interpretation:

| House comparison, averaged across routes | Native House | Rearranged House | Native − rearranged |
|---|---:|---:|---:|
| Correct live field | 5.9375/8 | 4.6875/8 | **+1.2500** |
| Wrong-edge field | 4.6875/8 | 5.8750/8 | **−1.1875** |
| Masked field | 5.8125/8 | 5.8750/8 | **−0.0625** |

At the first decision, the native live value rounded near **−0.0000**, while the rearranged live value was near **−0.349**. The wrong-edge field approximately exchanged which House condition displayed those values. The apparent advantage reversed with it, and was nearly absent with the field masked. This pattern is consistent with sensitivity to the displayed number and warns against attributing the secondary live-field contrast to an advantage of the native House state itself. It is an exploratory mechanistic observation, not a demonstrated general law.

A comparable live-minus-masked difference occurred on the adapted control route: **−0.5625/8**. This secondary two-sided comparison has conditional p = **0.0078125**, unadjusted; it was not the registered positive-direction primary claim. The route comparison under the live field averaged **0.0/8**. Together with the registered interaction, these observations do not support a Warp-specific recovery advantage.

## 5. Lineage-level registered results

Each row averages that lineage's two fresh task histories and both House conditions. Values are held-out cases out of eight.

| World-origin lineage | Warp live − masked | Warp live − wrong-edge | Warp-versus-control relay interaction |
|---|---:|---:|---:|
| `S05W17|0` | −0.50 | 0 | 0 |
| `S05W18|0` | −0.75 | 0 | 0 |
| `S05W19|0` | −0.25 | 0 | 0 |
| `S05W20|0` | −0.25 | 0 | 0 |
| `S05W21|0` | −0.75 | 0 | −0.25 |
| `S05W22|0` | −0.75 | 0 | 0 |
| `S05W23|0` | −0.25 | +0.25 | +0.25 |
| `S05W24|0` | −0.50 | 0 | +0.50 |

These are separately raised world-origin lineages which later received shared world input. Exact sign-flip probabilities require a conditional exchangeability assumption and are exploratory, not independent environmental confirmation. Failing the registered thresholds does not establish that all possible House relays have no effect.

## 6. Scope and evidence

The study used bounded model-generated JSON search expressions, not execution of arbitrary model-generated programs. Model weights were not updated. It used **576 model generations** (139,870 input and 13,150 output tokens), with no stalls or invalid final candidates. No fresh world-stream item or Outside receiver was admitted into the task. The relay is an experimental prompt connection; it has not been deployed into the live Oracle.

The Oracle historical replay reproduced **43 exchanges and 129 transitions**, with the previously documented timestamp and official truncated-save telemetry qualifications. All 16 study jobs, each deterministic learner/gate replay, and the independent task-score aggregation completed successfully. The complete evidence includes the pinned source excerpt, checkpoint, sealed plan, individual model histories, remote and local validation records, relay code, calibration and explicitly labelled fixture rehearsal.

- [Sealed source and plan](https://github.com/adrianjohnsaker-wq/Amelia---Orange/tree/7b966408397ef6de3a407f193be5c073d2d70339/experiments/warp-breakdown/house-relay)
- [All study histories and recorded aggregate](https://github.com/adrianjohnsaker-wq/Amelia---Orange/tree/7c3fe7a6898fc4a83672c7292243dac5a9c18359/experiments/warp-breakdown/house-relay/results)
- Plan SHA-256: `cbc04912f76702b5e9a1d7665859a708149145f4abcefcbace1ba2e5e5b17565`.
- Aggregate SHA-256: `358abf4f9f2d7f3b9cc8262855bce0101b8880f491d161248daac19f47c2de52`.

The practical result is a working experimental House relay and evidence that its displayed values can affect this model's revision path. The control indicates that this effect cannot yet be interpreted as the **correct House information** improving recovery, or as a special contribution from 3/6. A useful next test would independently vary the representation or encoding of the same House signal, while matching displayed numerical distributions and preserving a wrong-edge control, to see whether a relation to House state survives changes in how the number is presented.
