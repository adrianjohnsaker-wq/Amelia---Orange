# Amelia: Warp readout and House intervention

**Completed 7 November 2026.** Sixteen fresh task histories, two for each of the eight Oracle world-origin lineages `S05W17|0`–`S05W24|0`. Each history ran all 16 registered conditions. **Registered outcome:** no clear signal at the registered threshold for route, displayed memory, or the engineered House intervention.

The House intervention changed Amelia's internal gate behaviour, including a five-step reduction in diagnostic search in one lineage. It did not establish a recovery advantage. The design also makes an important distinction: once the visible memory values and model opportunities were held fixed, the model was not told the House state or the gate path. This makes the House gate result informative, but it limits what the recovery-score null can say about a House-to-model mechanism.

## 1. What was tested

The [experiment and decision rules were sealed](https://github.com/adrianjohnsaker-wq/Amelia---Orange/blob/0069a4026dd717f95095173ca21fb4d7993db883/experiments/warp-breakdown/house-prompt/REGISTRATION.md) before the separate [run was started](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/42367768713). The two principal interventions were crossed rather than conflated:

| Factor | Conditions |
|---|---|
| Route | Oracle 3/6 Warp; parameter-matched adapted 2/7 control |
| Model-visible memory | Fixed Warp-derived tape; fixed control-derived tape |
| House | Saved native learner; reversible rearrangement of saved learner values |
| Diagnostic feedback | Correct; unrelated task feedback |

Every combination was run in each history, in a randomized order. Public and held-out task cases were matched within a history. The task was a bounded, model-revised JSON priority expression for weighted grid search; no arbitrary model-generated program was executed and model weights did not change.

The two three-round memory tapes came from no-cue shadow trajectories before the task. Both were used on both routes and under both House conditions. They were **fixed experimental readouts**, not the trajectory's current live memory; the current values were recorded separately. Thus the comparison can ask what happens when displayed memory is controlled or exchanged, with that qualification.

## 2. House calibration and actual gate behaviour

The saved House records differed as whole objects, but their initial contributions to the particular competing Warp gates were almost identical. A naive donor swap would therefore have been largely uninformative. The experiment reversibly swapped the existing complete `(V, S, D)` House value triplets on edges `3→3` and `2→3` in a copy. It preserved the multiset of learned triplets and all non-House state fields. The control mapped the altered `3→3` triplet onto its corresponding `2→2` edge. This was an **engineered reassignment**, selected during calibration, not a naturally observed second House state.

In 32 identical-prestate, alternating-cue counterfactual probes per lineage, the rearrangement changed the relative House contribution at the competing Warp gates by approximately −0.349. It changed at least one gate choice in **all eight lineages**, 12 of 256 probes overall. The remote pre-run calibration reproduced these results.

During the actual study the changed House configuration altered search-step counts in **eight matched comparisons**, all in `S05W17|0` on the Warp route. In both task histories and for every readout/feedback combination in that lineage, the native House needed **8 search steps across three rounds**, while the rearranged House needed **3**. Its adapted 2/7 control needed 3 with either House. Other lineage/route matched comparisons showed no change in total search steps. This is a concrete, local effect of the deliberately changed gate scores; it is not by itself evidence of a smarter or more autonomous system.

All arms reached their three model opportunities. Consequently, the shortened path did not create extra revisions, and gate counts and House values were not sent to the model. In this configuration the model could not directly use the House-path difference. A lack of a recovery advantage here does not rule out an effect when a genuine House-dependent readout can reach the task process.

## 3. Breakdown and recovery

The acute task change met the presealed breakdown rule in **16/16 histories**; the required minimum was 12. Averaged over the conditions, the initial expression passed **6.00/6** public cases before the change and **2.5625/6** immediately after it. After revision it passed **3.5703/6** public cases. On the matched held-out cases, the initial expression averaged **3.6250/8** and final expressions **4.7227/8**. These are descriptive averages, not evidence that any particular route or feedback caused recovery.

The presealed primary outcome was the marginal difference in final held-out cases, averaged over the remaining factors. The target was at least **one case out of eight** in the specified direction for route and readout, or in either direction for House, together with a Holm-adjusted conditional sign-flip probability at most 0.05 across the three primary tests.

| Registered comparison | Mean difference, cases out of 8 | Conditional p | Holm-adjusted p | Result |
|---|---:|---:|---:|---|
| Warp minus adapted control, with readouts crossed | **+0.0234** | 0.5000 | 1.0000 | Threshold not met |
| Warp-derived minus control-derived displayed memory | **+0.2578** | 0.0625 | 0.1875 | Threshold not met |
| Native minus rearranged House | **+0.0234** | 1.0000 | 1.0000 | Threshold not met |

The route and readout p-values are one-sided in the registered positive direction; House is two-sided. The prior Oracle rerun's coupled acute Warp-versus-control contrast was **+0.6875/8**. This new controlled route contrast is much smaller, but the task histories, factorial design and fixed shadow readouts changed. The comparison does not establish that the earlier difference was caused by the displayed values.

For a direct view of the crossed design, the following are final held-out means, averaging over House and feedback:

| Actual route | Warp-derived tape | Control-derived tape |
|---|---:|---:|
| Warp 3/6 | 4.8750/8 | 4.5938/8 |
| Adapted control 2/7 | 4.8281/8 | 4.5938/8 |

The preplanned secondary route-by-readout interaction was **+0.0469/8**, conditional two-sided p = 1.0; correct minus unrelated feedback was **+0.1641/8**, p = 0.65625. These secondary calculations are exploratory and unadjusted. The House search-step difference, rearranged minus native, averaged **−0.3125 steps per arm** across all lineages and conditions, conditional two-sided p = 1.0; it is entirely accounted for by the `S05W17|0` Warp observations described above.

### Primary contrasts by lineage

Each value averages the lineage's two histories and the other factorial conditions. Differences are held-out cases out of eight.

| World-origin lineage | Warp − control | Warp tape − control tape | Native − rearranged House |
|---|---:|---:|---:|
| `S05W17|0` | 0 | 0 | 0 |
| `S05W18|0` | 0 | 0 | 0 |
| `S05W19|0` | 0 | +0.5000 | 0 |
| `S05W20|0` | +0.1875 | +0.4375 | +0.1875 |
| `S05W21|0` | 0 | +0.6250 | 0 |
| `S05W22|0` | 0 | 0 | 0 |
| `S05W23|0` | 0 | +0.5000 | 0 |
| `S05W24|0` | 0 | 0 | 0 |

These are separately raised world-origin lineages that later received a shared world stream. The exact p-values require conditional exchangeability of lineage-level signs and should not be treated as independent environmental confirmation. Missing an effect threshold also does not prove the conditions are equivalent.

## 4. Prompt-level check and interpretation

As a descriptive post-run check, all **128** route-paired first prompts with the same readout tape, House and feedback were identical; **125** yielded the same first candidate. Across all rounds, 370 route-paired prompts were identical, and 363 of those yielded the same parsed candidate. In 125 of the 128 route-paired arms the final candidates matched. The few differences despite identical prompts demonstrate model-response variability is possible even at temperature zero; later prompts can diverge after an earlier different response.

There were **768 model generations**, no stalls and no invalid final candidates. Provider usage was 170,636 input and 17,605 output tokens. The House states differed by construction, and their impact on at least one gate choice per lineage was verified in calibration. However, the actual House-path differences did not enter the model prompt, so the held-out House comparison is a limited test of opportunities and timing, not a complete test of whether House information could improve recovery.

The result supports an operational distinction: Amelia's modified House organization can change a Numogram transition pattern; this experiment found no registered route, prompt-tape or House recovery advantage. The Warp-derived readout had a small positive direction, below both registered thresholds. Neither the internal gate change nor the task scores establish an external agent, retrocausality, general intelligence, or development beyond the tested process.

## 5. Provenance and verification

The Oracle-preserving adapter retains the full saved graph and learner. Historical replay reproduced **43 recorded exchanges, 129 transitions and 7,724 compared numerical fields**, with maximum numerical difference 0, excluding epoch timestamps. The official truncated-save resume has the two previously documented telemetry-counter differences. The experimental cue gain was **0.054**, rather than the live Oracle's 0.35; the 2/7 control is an adapted 24-gate copy, not the native 2/7 circuit. No Outside receiver or fresh external world signal was admitted during this task.

The workflow completed all 16 study jobs and the aggregate audit. All 16 original histories were downloaded and independently re-audited locally: the regenerated aggregate matched the published JSON. The independent audit recomputes task evaluations, exact model prompts and recorded gate-score arithmetic; it does not rerun the remote model or independently reconstruct every runtime transition. The fixture rehearsal in the evidence package is labelled as such and is not a scientific result.

- [Sealed plan, calibration and source](https://github.com/adrianjohnsaker-wq/Amelia---Orange/tree/0069a4026dd717f95095173ca21fb4d7993db883/experiments/warp-breakdown/house-prompt)
- [Individual histories and aggregate](https://github.com/adrianjohnsaker-wq/Amelia---Orange/tree/59962175ccf45998ed4f1dcf46ac696d4d7d8350/experiments/warp-breakdown/house-prompt/results)
- Sealed plan SHA-256: `2f793e4c3ee6b17c864065bed2ee6ae3e6c6e35fdf22ee488de494e07b64da15`.
- Published aggregate SHA-256: `a5eb486e634bdcb2c7ad71d239fb9ec43ebd97ed0162d697ad145413ed001ae5`.

A logically distinct follow-up would keep the original memory tape fixed while explicitly delivering a measured House-dependent gate or learner signal to the task process, with a matched no-signal control, and then preseal new task histories. That would test whether the verified House difference can reach recovery; it would be an additional experimental relay rather than a claim about the unchanged live Oracle.
