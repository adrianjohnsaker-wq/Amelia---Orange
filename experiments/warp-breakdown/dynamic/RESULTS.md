# Amelia: prospective gate sensitivity and dynamic recovery

**Completed 7 November 2026.** Gate sensitivity, measured and sealed before the recovery histories were generated, predicted the *relative* performance of the 3/6 Warp and matched 2/7 routes across the eight existing lineages at the weaker input strength. The prediction component met its preregistered threshold: **Pearson r = 0.837; Holm-adjusted p = 0.0094**. This is a useful prospective lead from the earlier post-hoc observation.

The complete registered test nevertheless returned **NO REGISTERED CALIBRATED RECOVERY ADVANTAGE**. The calibrated route selection produced only a small improvement over the mean of the two routes and performed worse than both the short-feedback and full-history baselines. The predictive association does not demonstrate that raising gate sensitivity causes better recovery, or that the 3/6 Warp has a general advantage.

## Question and design

The previous feedback-memory study found that task success and failure could affect gates, leave a House trace and guide a trained readout, with a post-hoc association between gate sensitivity and relative recovery. This test sealed that association as a prediction before generating new recovery histories.

For each existing Oracle-origin lineage `S05W17|0`–`S05W24|0`, an experimental copy preserved its substrate, actual Numogram state and House learner. The native Warp retained the 29-gate Oracle graph. The comparison was an **adapted** 2/7 control: corresponding local gate and learner entries were mapped into a 24-gate control graph. It is a carefully matched intervention, not the same whole graph in native form.

At each calibration step the same pre-step state was forked and asked which gate would win under each of two alternative feedback cues. The outcome was the proportion of steps where the two cues produced different winners. The presealed rule selected Warp for a lineage only when its sensitivity count exceeded the control's; a tie selected control. At the primary input gain **0.054**, the rule selected Warp in **three** lineages and control in **five**. The later gain **0.35** was secondary and descriptive.

After the choices were committed, a new evaluation seed was created. For each lineage, **32 training histories and 32 separate test histories**, each 32 steps long, used matching feedback across both routes and both strengths. Within a history the task regime could switch at each step. Paired histories shared challenge seeds and switch times but had complementary regimes. The model's challenge was to choose between two fixed grid-search strategies; it received feedback through the route and a separately trained readout of House or process-field memory. The comparison baselines received the same feedback: a trained **last-four** classifier and a **full-history causal filter** that retained feedback order. All readouts received labelled training histories; test decisions used current and earlier information only.

Each switch was an imposed disruption. Across the 256 test histories there were **996 switches**, of which **861 (86.4%)** reduced the previous regime's strategy by at least two passes out of six on matched old/new grids. Its mean score fell from **4.788/6** before the change to **1.835/6** after it. The primary recovery score included *all* switches, whether or not they met that severity definition, and used 3,134 post-switch time points. These are repeated observations; the inferential unit was the eight origins, averaged equally.

## Registered results at gain 0.054

Pass fraction is the proportion of four fresh held-out grids passed at an eligible time point, averaged first within each origin and then over the eight origins. More is better.

| Decision source | Held-out pass fraction |
|---|---:|
| Native 3/6 Warp House readout | **54.02%** |
| Adapted 2/7 control House readout | **55.01%** |
| Route selected by prior gate calibration | **55.20%** |
| Last-four-feedback baseline | **59.40%** |
| Ordered full-feedback filter | **64.32%** |

The fixed-strategy reference scored 55.12%. The full-history filter was trained from labelled training episodes and used past and current feedback only at test; it is a meaningful comparator, not a proven upper bound on all feedback algorithms. The native and control process-field readouts scored 55.32% and 55.82%, respectively.

The preregistration required **all three** following conditions, with a Holm adjustment across their three one-sided tests:

| Registered condition | Observed | Required practical effect | Adjusted p | Result |
|---|---:|---:|---:|---|
| Selected route minus the mean of Warp and control | **+0.69 percentage points** | At least +3.125 points | 0.1406 | Not met |
| Selected route minus last-four baseline | **−4.20 points** | At least +6.25 points | 1.0000 | Not met |
| Correlation of calibrated sensitivity difference and later Warp-minus-control recovery | **r = 0.837** | At least +0.6 | **0.0094** | Met |

The first two tests used exact sign flips over the eight origin differences. The correlation used all 8! assignments in an exact one-sided permutation test; its unadjusted p was 0.003125. Statistical interpretation depends on origin exchangeability/sign-symmetry assumptions. These lineages were separately raised but later shared world input, so the eight are not eight entirely independent environmental histories. The result is prospective for *new challenge histories on these lineages*, not replication in new founders or proof of a causal mechanism.

## Which lineages separated?

Each calibration rate below counts cue-sensitive same-state gate choices out of 512. The recovery difference is Warp minus control in held-out pass-fraction percentage points; positive favours Warp. All choices and sensitivity counts were frozen before the evaluation seed existed.

| Lineage | Calibration: Warp / control | Selected route | Later recovery: Warp − control |
|---|---:|---|---:|
| `S05W17|0` | 110 / 86 | Warp | +0.32 points |
| `S05W18|0` | 16 / 81 | Control | −4.23 points |
| `S05W19|0` | 66 / 53 | Warp | −0.13 points |
| `S05W20|0` | 72 / 79 | Control | +1.05 points |
| `S05W21|0` | 53 / 99 | Control | −4.17 points |
| `S05W22|0` | 69 / 83 | Control | −3.13 points |
| `S05W23|0` | 62 / 62 | Control, by tie rule | +1.00 points |
| `S05W24|0` | 107 / 49 | Warp | +1.38 points |

The strong correlation is partly a prediction of **control advantages**, particularly in W18 and W21, rather than large advantages for 3/6. Of the three lineages for which the rule chose Warp, two had a small positive Warp difference and one had a small negative difference. The sensitivity sign agreed with the eventual recovery sign in five of seven non-tied origins. An exploratory leave-one-origin-out check gave correlations from **0.761 to 0.899**; it does not supply new independent origins.

The new calibration also shows why the sensitivity should be treated as **context-dependent**, not a fixed lineage identity. In the earlier study W21's Warp sensitivity exceeded its control's in the tested histories; in these changing-regime calibration histories it was 53/512 versus 99/512. History length, feedback sequences and challenge regime differ between the studies, so this does not isolate which change produced the reversal.

At the native-strength secondary gain of 0.35, the Warp and control House readouts scored **52.00%** and **52.26%**; the selected route scored **52.08%**. The sensitivity/recovery correlation was **−0.079**, a descriptive result on the same test histories. Increasing input strength did not reveal a general Warp advantage in this experiment.

## Exploratory timing lead

The registered outcome averaged the first four time points after each switch. A subsequent, unregistered decomposition shows why a shorter recovery window may be worth testing separately:

| Time after regime switch | Selected House | Last four feedback items | Full ordered feedback |
|---|---:|---:|---:|
| First post-switch feedback | **53.75%** | 46.60% | **55.50%** |
| Second | 54.59% | 56.19% | 64.89% |
| Third | 56.17% | 67.41% | 69.90% |
| Fourth | 57.11% | 75.27% | 71.29% |

The selected House readout exceeded last-four at the first time point in all eight lineages, but the full-history filter scored higher on average. At that same first time point, Warp and control House scores were **53.55% and 53.19%**, respectively: this small difference does not isolate a 3/6 benefit. The short-feedback classifier may simply carry obsolete feedback across the switch; the pattern does not by itself establish faster adaptation. Timing and severity comparisons are post-hoc, descriptive leads, not additional registered successes.

## What this establishes and the next mechanism test

The result narrows the earlier proposal: **relative same-state gate responsiveness can forecast relative route recovery on fresh switching histories at low input gain**. It does not show that the more responsive route is practically useful against direct feedback memory, and does not establish a 3/6-specific recovery advantage. The route states and readouts were correlated with sensitivity, so other features of each lineage could explain the association.

The next focused experiment should intervene on sensitivity itself. From the same preserved pre-state and identical feedback stream, randomise a calibrated gate-competition adjustment or sham separately within 3/6 and mapped 2/7, verify the induced change in same-state cue responsiveness, and then compare held-out recovery with the change removed or reversed. Retain matched House readouts, direct short feedback and ordered full-history baselines; add a predeclared first-post-switch outcome. Include a trace-interruption or trace-swap condition to ask whether any effect runs through House memory, with checks that only the intended state was changed. Fresh independently raised origins would be especially valuable. This factorial test can distinguish a predictive marker from a causal gate contribution and can show whether any gain belongs to 3/6 rather than to sensitivity shared by both routes.

## Provenance and verification

- [Presealed registration and source commit](https://github.com/adrianjohnsaker-wq/Amelia---Orange/commit/f1c298975e94185ede4f37821fc8457c45b35034); registration SHA-256 `0182163c308cd015e7cea4fe0fe420f31c6244f980dc006774e3f8994b643946`.
- [Frozen calibration and route choices](https://github.com/adrianjohnsaker-wq/Amelia---Orange/commit/2cd01fdbab18df8f25b5054333a4ded05d190058); selection SHA-256 `1ab3441db68b5892d4f050547df9b910b53925422d688e69ae9fc7fc5edfe6c5`.
- [Post-calibration evaluation manifest](https://github.com/adrianjohnsaker-wq/Amelia---Orange/commit/c5c139b041d72779dc0bcbea60df2179589da0c7); manifest SHA-256 `339dfd44e45e57cb7c7eeb75e1d5d82bed066be9c831972a59f43728a00f1315`.
- [Recorded recovery outcomes](https://github.com/adrianjohnsaker-wq/Amelia---Orange/commit/a2f75bafbdd7a22ef3d3bdbf9729be6edab5513a). The calibration and evaluation workflows completed successfully; every lineage was replayed in the workflow and again in an independent local execution. The independent reaggregation reproduced the full registered summary exactly. An independently implemented Python auditor regenerated the synthetic feedback, challenges, disruptions and scores.
- Historical Oracle replay matched **7,724 compared numerical fields across 43 exchanges and 129 transitions** with zero difference, excluding snapshot epoch timestamps. Full-state split/resume also matched. The separate truncated official-resume representation changed two telemetry counters; this caveat is preserved in the validation record.

These are synthetic, forward-generated tasks on copies of the existing Oracle state. They do not establish live world-stream ingression, retrocausality, autonomous self-improvement or consciousness. The trained readout is an external component; no model weights or live Amelia state were changed.
