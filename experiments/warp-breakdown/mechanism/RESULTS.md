# Amelia: Warp feedback-memory mechanism and recovery

**Completed 7 November 2026.** The study tested a concrete route from task failure and success, through Amelia's gates and House learner, to a choice of recovery strategy. It found a usable, task-relevant memory trace, especially with the Oracle's native input gain. **Neither input-gain condition met the registered criteria for a Warp-specific advantage.**

The most useful lead is more specific: at the weaker input setting, some lineages' Warp gates were sensitive to feedback when their matched control gates were not, and those lineages' House readouts performed better on the held-out task. Other lineages favoured the control or showed no difference. A gate-sensitivity explanation fits these records, but the analysis was devised after the main outcome and requires a fresh prospective test.

## 1. The question and the mechanism

The earlier House relay established that a numerical House value could change model proposals, but the wrong-edge control showed that the model might simply respond to the number. Here the question was narrowed: **does the learner retain information about an actual sequence of successes and failures, and can that information select a useful strategy on new cases?**

The tested chain was:

1. A fixed diagnostic strategy encountered 24 public search challenges and produced success/failure feedback.
2. Each outcome was deliberately encoded as a cue to Amelia's proposal or diagnostic zone.
3. The actual Oracle runtime selected gates and updated its House learner and process-field memory.
4. A separately trained, fixed numerical readout attempted to identify the challenge regime from the saved state and select between two recovery strategies.
5. The selected strategy was evaluated on 16 newly generated held-out grids.

The feedback is therefore an ordinary, deliberately supplied information source. The House trace cannot contain information about these synthetic challenges that was not conveyed by the inputs and initial state. The decoder was trained outside the Oracle; it is not evidence that the unmodified live Oracle autonomously selected the strategy.

## 2. Design and honest pilot boundary

A development pilot examined several grid-cost regimes, search limits and fixed strategies. The first diagnostic (`g+2.5d`) poorly separated the chosen regimes; the second (`g+1.5d`) produced clearer feedback. The final task uses the selected diagnostic, a 50-expansion limit, exact optimality, and two possible recovery policies: `g+1.5d` and `g+4d`. These were deliberately selected after inspecting the pilot. The full pilot, including the less informative first diagnostic, was saved with the [sealed plan](https://github.com/adrianjohnsaker-wq/Amelia---Orange/blob/26609199f6a4595f5439aa6edba7b50b240e5d2a/experiments/warp-breakdown/mechanism/REGISTRATION.md).

For each of the eight Oracle world-origin lineages `S05W17|0`–`S05W24|0`, fresh seeded tasks supplied 24 matched training pairs and 24 different matched test pairs. Each pair contained two cost regimes and was run with identical feedback on both the 3/6 Warp and an adapted 2/7 control, at both an attenuated **0.054** cue gain and the Oracle's native **0.35**. The common pre-study preparation used the earlier 0.054 setting for all copies. The control has an engineered 24-gate graph and mapped House entries; it is not native 2/7. The Warp retains the 29-gate Oracle graph.

This produced **3,072 condition histories**: eight origins × two splits × 24 paired seeds × two regimes × two routes × two gains. The held-out evaluations for a paired case used the same independently generated grids across routes and gains. The eight origins were separately raised but later received common world input, and are not eight wholly independent environmental histories.

The study trained the same nearest-centroid readout on separate training histories for House, process-field memory (PFM), their combination, transition counts, the most recent feedback bit, the last four bits and the total of all 24 bits. It also trained a secondary readout on the other seven origins before testing on the eighth. These are **externally trained probes**, not native Oracle decision rules.

## 3. Breakdown and held-out recovery

In the 384 test regime histories, the original `g+2.5d` routine averaged **4.828/6** before the regime change and **3.104/6** immediately after it. The registered two-case loss occurred in **221/384** histories. The study retained every history, including those without that loss.

At the native **0.35** gain, the House-based Warp readout identified the held-out regime correctly in **98.44%** of cases and its chosen strategy solved **12.583/16** held-out grids. For comparison:

| Information used for strategy choice | Regime accuracy | Held-out cases solved, out of 16 |
|---|---:|---:|
| Warp House trace, native gain | **98.44%** | **12.583** |
| Adapted 2/7 House trace, native gain | **98.70%** | **12.615** |
| Last four feedback outcomes | **90.10%** | **11.982** |
| Count of all 24 feedback outcomes | **99.74%** | **12.672** |
| Best fixed strategy selected on training data | — | **8.781** |
| Regime-aware reference | 100% by definition | **12.698** |

The House result is a tangible feedback-memory and recovery mechanism in this constructed task: the information in the state can be decoded into a useful choice. It is not unique to the Warp. The transition-count readout on the Warp scored **98.70%** and **12.596/16**, and the complete feedback count performed slightly better than the House probe. The same input sequence can therefore explain the trace; these results do not show newly created information.

The House-based Warp policy exceeded the last-four-feedback baseline by **0.602/16** on average at native gain. Its conditional one-sided p-value was **0.00390625**, Holm-adjusted across the six registered comparisons to **0.0234375**. The positive difference appeared in all eight origin means. It fell below the presealed practical target of **+1/16**, however, and the other required Warp-specific contrasts did not pass. It is a useful partial finding, not a registered joint advantage.

## 4. The registered Warp comparisons

| Cue gain | Warp House accuracy | Control House accuracy | Warp − control recovery, out of 16 | Warp House − last four, out of 16 | Registered outcome |
|---|---:|---:|---:|---:|---|
| **0.054** | 78.39% | 74.74% | **+0.273** | **−0.987** | No registered Warp advantage |
| **0.35** | 98.44% | 98.70% | **−0.031** | **+0.602** | No registered Warp advantage |

At 0.054, the Warp accuracy difference was **+3.65 percentage points**, below the presealed +5-point target; its route-recovery difference was also below +1/16. The Holm-adjusted conditional p-values for these contrasts were 1.0. At 0.35, the two routes were almost tied. For a positive registered lead, all three contrasts at a gain had to meet both their practical and adjusted-p thresholds; neither did.

The House readout trained on the other seven origins achieved **98.44%** accuracy on the withheld origin at native gain; the corresponding control achieved the same mean. This is encouraging transfer within this synthetic family, but the lineages share later world history and the test is not independent replication in a new environment.

## 5. Memory swaps: where the effect occurs

For every test case, the complete House learner and the complete PFM were separately transplanted from the paired history in the opposite cost regime into an otherwise fixed recipient state. The non-transplanted state hashes were checked before and after. These are intentionally mismatched histories, not samples of an independent external agent.

At native gain on the Warp:

- House donors differed in **384/384** recipient comparisons, and the House-trained decoder changed its strategy in **372/384**. The original House gave **7.568 more held-out cases out of 16** on average than the opposite-regime House in the same recipient task.
- PFM donors also differed in **384/384**, and the PFM-trained decoder changed its strategy in **368/384**.
- In a 12-step continuation with no new cues, **0/384 House swaps** changed the recorded Warp gate path, while **79/384 PFM swaps** did. The corresponding adapted-control counts were 0/384 and 130/384.

The 384 recipient comparisons include both directions of matched pairs and are not 384 independent lineages. The House swap shows that the external House readout's choice causally depended on which learned House state it received in this task. The no-cue continuation shows that, in these particular states and over these 12 steps, swapping House did not change the native gate path. The PFM path result is a separate dynamical effect; it is not by itself evidence of better recovery.

## 6. Where a Warp-specific mechanism might lie

After inspecting the registered result, a further diagnostic reconstructed every test history. At each recorded pre-step state it compared the gate winner under the proposal cue, the diagnostic cue and no cue, then verified the actual recorded transition. Each origin contributed 1,152 test steps per route and gain. This was **post-hoc**, not a preregistered test.

At gain 0.054, the two possible cues selected different winners in **1,186/9,216** Warp steps and **941/9,216** control steps overall. The difference was highly lineage-dependent:

| Lineage | Warp cue-sensitive steps | Control cue-sensitive steps | House accuracy: Warp / control | Recovery difference: Warp − control |
|---|---:|---:|---:|---:|
| `S05W17|0` | **303/1,152** | **0/1,152** | 89.58% / 50.00% | **+2.917/16** |
| `S05W18|0` | 48/1,152 | 242/1,152 | 77.08% / 87.50% | −0.667/16 |
| `S05W19|0` | 0/1,152 | 0/1,152 | 50.00% / 50.00% | 0/16 |
| `S05W20|0` | 218/1,152 | 233/1,152 | 85.42% / 91.67% | −0.479/16 |
| `S05W21|0` | **146/1,152** | **0/1,152** | 77.08% / 50.00% | **+1.958/16** |
| `S05W22|0` | 183/1,152 | 248/1,152 | 93.75% / 91.67% | +0.292/16 |
| `S05W23|0` | 144/1,152 | 74/1,152 | 81.25% / 87.50% | −0.583/16 |
| `S05W24|0` | 144/1,152 | 144/1,152 | 72.92% / 89.58% | −1.250/16 |

A further post-hoc check calculated cue sensitivity on the **separate training histories**, then retrospectively chose the more sensitive route for each origin, breaking ties in favour of the control. At 0.054 it chose Warp for four origins. On the held-out histories this rule averaged **11.102/16**, versus **10.995/16** for always choosing Warp and **10.721/16** for always choosing the control. It remained below the **11.982/16** last-four-feedback baseline.

Across the eight origins, training-route sensitivity difference and held-out House prediction difference had descriptive Pearson **r = 0.825** at 0.054; the corresponding recovery difference had **r = 0.798**. These associations were calculated after examining the outcome, use only eight partly dependent origins, and are not independent validation. The route-selection rule was also devised after the main result was seen, even though it uses training histories for its selection. Both need a new prospectively sealed replication.

The plausible mechanism is **feedback sensitivity → different gate passage → learned state → a useful readout**. It explains why a Warp advantage can appear in a particular lineage when its adapted control does not transmit the same cue, while also explaining why the advantage does not generalize across the whole cohort. The data do not yet show that this mechanism beats a simple feedback memory or belongs uniquely to the 3/6 topology.

## 7. Verification and scope

The [workflow](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/42383128640) passed the historical Oracle check of **43 exchanges, 129 transitions and 7,724 numerical fields**, subject to the documented timestamp and truncated-save qualifications. All eight datasets and complete deterministic replays passed; the held-out grid scores were independently regenerated in Python, and the local aggregate matched the published JSON. An additional full local runtime replay matched all eight recorded datasets. No Governor hard-limit increase was observed in the recorded runs.

The actual decoder was a trained external numerical probe. The challenge, regime transition and feedback-to-zone mapping were engineered; no LLM was called, no live Oracle was changed, and no fresh Outside/world-stream item entered this assay. The historical lineages later shared input. Exact conditional sign-flip probabilities require lineage-level exchangeability. The philosophy remains open, but this experiment's demonstrated information source is the supplied task feedback.

- [Sealed plan, pilot and source](https://github.com/adrianjohnsaker-wq/Amelia---Orange/tree/26609199f6a4595f5439aa6edba7b50b240e5d2a/experiments/warp-breakdown/mechanism)
- [Registered lineage records and aggregate](https://github.com/adrianjohnsaker-wq/Amelia---Orange/tree/07b4bbfb3f33eb944fdb994a2fdf1f7b049e29a6/experiments/warp-breakdown/mechanism/results)
- [Clearly labelled post-hoc gate analysis](https://github.com/adrianjohnsaker-wq/Amelia---Orange/tree/331c85c8a6f8e945302ed0ce06a45b16e8d7dbac/experiments/warp-breakdown/mechanism/posthoc)
- Sealed plan SHA-256: `cd629a83c8f6c1383b17b85c4a18dd928837298b2d59278a0c1119bbd8acc283`.
- Registered aggregate SHA-256: `715979b0e7c85f7e73ada48103f0de139dda0ae921e3aac5cb44cfee99c6c907`.

The focused next test is to **preseal** gate-sensitivity calibration and route-selection rules on new training histories, then evaluate their predicted advantage on fresh held-out challenges and, if available, genuinely new world origins. It should retain the last-four and full-feedback baselines. That would ask whether the lineage-dependent lead identified here can be predicted before seeing the outcome.
