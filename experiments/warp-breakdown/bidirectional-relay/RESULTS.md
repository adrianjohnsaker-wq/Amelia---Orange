# Amelia: bidirectional syzygy relay under repeated reversals

**8 November 2026.** The bidirectional 3/6 relay enabled Amelia's retained House source to receive live feedback after displacement, and it improved the preregistered T80 measure relative to the remote read-only relay. Across eight reused origins, the mean restricted first crossing of 80% optimal selection was **5.25 decisions** with bidirectional writing versus **10.50** with remote reading alone; the paired difference was **5.25 restricted decisions**, Holm-adjusted **p = 0.03125**. Seven of the eight read-only origins never reached 80% in the ten-decision window and were assigned the prespecified censored value 11, so the difference is a restricted-window measure, not a measurement of their eventual crossing times.

The same test found **no registered Warp-specific velocity advantage**. The matched 2/7 bidirectional route averaged **4.125 decisions** on T80 and **1.875** on T50, compared with **5.25** and **1.875** for 3/6. The direct learner averaged **4.375** and **1.875**. These are observed restricted means; the prespecified tests were one-sided in the direction of a 3/6 advantage and do not establish that 2/7 is statistically faster. The classification is `NO_REGISTERED_WARP_SPECIFIC_VELOCITY_ADVANTAGE`.

## How the comparison was made

The study used **64 fresh synthetic episodes** on the eight existing Oracle-origin lineages. After 24 training decisions, each route was displaced to the same three eligible neutral zones, producing **192 episode–displacement branches per route**. Each branch then experienced an immediate regime reversal and two further reversals, **576 repeated reversal windows per route**. The intervals were independently seeded between 10 and 14 decisions. Branches and windows are repeated observations, not 576 independent lineages; the eight lineages were reused and later shared world input.

At every decision the chosen strategy's actual score on two synthetic grid searches was fed back after the decision. Neither the regime label, reversal schedule nor the alternative strategy's score was shown to the controller. Each Oracle decision used four scored gate transitions. The 3/6 and adapted 2/7 experiments used the same challenge cases, feedback rule, relay gain, phase-pulse rule and decision budget.

The **remote read-only** condition could deliver the focus House signal to gate selection but wrote new feedback only at the actual local source. Its ordinary local House updates remained enabled. The **bidirectional** condition used the same read signal and additionally wrote the chosen action's score to open branching House sources in its focus pair. If that focus source had already received the local update, the extra remote write was skipped to avoid double updating. Sham and reversed-direction writes, the global relay, the one-step engineered entry, and direct and model baselines were retained. The direct learner did not use gate transitions; the full-history model had earlier labelled and counterfactual calibration, an extra prior resource.

## Registered adaptation times

For each lineage and lag 1–10 after a reversal, the experiment averaged the proportion selecting the better-scoring of the **two tested strategies** on that two-grid challenge; ties counted both strategies as optimal, including when both scored zero. T50 and T80 are the **first crossings of each lineage's averaged curve**, not individual response times. An origin not crossing within ten decisions was assigned 11 and censored. Crossings can subsequently fall below the threshold; full curves and actual grid scores are reported below and in the evidence.

| Decision source | Mean T50, decisions | Mean T80, restricted decisions | Origins censored at T80 |
|---|---:|---:|---:|
| 3/6 natural gates | 1.750 | 7.000 | 0/8 |
| 3/6 remote read-only | 2.250 | 10.500 | 7/8 |
| 3/6 bidirectional relay | 1.875 | 5.250 | 0/8 |
| 3/6 sham write | 2.250 | 10.500 | 7/8 |
| 3/6 reversed write | 2.000 | 11.000 | 8/8 |
| 3/6 generic whole-House relay | 2.375 | 6.750 | 0/8 |
| 3/6 engineered entry | 1.875 | 4.375 | 0/8 |
| Matched 2/7 remote read-only | 2.000 | 4.750 | 0/8 |
| Matched 2/7 bidirectional relay | 1.875 | 4.125 | 0/8 |
| Direct learner | 1.875 | 4.375 | 0/8 |
| Calibrated full-history model | 2.000 | 4.375 | 0/8 |

One decision corresponds to four scored transitions in the Oracle routes; direct/model rows do not have a gate count. The crossing of the **pooled** eight-origin 3/6 bidirectional curve was decision 2 for 50% and decision 4 for 80%; that pooled crossing is distinct from the mean of the eight origin-specific crossing times above. The full-history model is a strong comparator with a different calibration resource.

| Lag after reversal | 3/6 bidirectional | 3/6 read-only | Matched 2/7 bidirectional | 3/6 generic | Direct learner |
|---|---:|---:|---:|---:|---:|
| 1 | 34.55% | 48.44% | 34.90% | 35.07% | 34.38% |
| 2 | 59.72% | 47.05% | 64.06% | 52.43% | 64.06% |
| 3 | 69.97% | 53.82% | 76.74% | 55.56% | 76.56% |
| 4 | 80.38% | 56.60% | 84.55% | 68.40% | 84.90% |
| 6 | 86.11% | 59.55% | 89.06% | 76.56% | 89.06% |
| 8 | 88.54% | 63.37% | 91.67% | 85.76% | 91.67% |
| 10 | 88.89% | 65.62% | 90.62% | 86.46% | 90.62% |

Values in this table are optimal selections among the two tested strategies, with ties counted as described. For an outcome that does not count both tied failures as successful grid searches: at lag 4, **72.83%** of the 3/6 bidirectional grid cases were solved, versus **54.08%** in read-only; at lag 10 the corresponding figures were **71.35%** and **54.51%**. These grid comparisons are descriptive rather than separate registered significance tests.

As a post-outcome sensitivity check, scores tied between both strategies were excluded and each remaining action was judged against the better-scoring strategy. At lag 10, the equally weighted origin-mean correct-selection rates were **84.34%** for 3/6 bidirectional, **52.77%** for read-only and **86.78%** for matched 2/7 bidirectional. This sensitivity analysis was not preregistered and is not a second confirmatory test.

## Predeclared contrasts

A Warp-specific result required **all eight** comparisons to show at least a one-decision 3/6 advantage and an exact one-sided sign-flip p ≤ .05 after Holm adjustment across all eight. Positive numbers mean the comparator's restricted crossing was later than 3/6 bidirectional. P-values test zero, not the one-decision margin.

| Comparison | 3/6 advantage, decisions | Raw p | Holm p | Passes |
|---|---:|---:|---:|:---:|
| 3/6 bidirectional vs matched 2/7, T50 | +0.000 | 1.00000 | 1.00000 | No |
| 3/6 bidirectional vs matched 2/7, T80 | -1.125 | 1.00000 | 1.00000 | No |
| 3/6 bidirectional vs read-only, T50 | +0.375 | 0.26562 | 1.00000 | No |
| 3/6 bidirectional vs read-only, T80 | +5.250 | 0.00391 | 0.03125 | Yes |
| 3/6 bidirectional vs generic, T50 | +0.500 | 0.12500 | 0.75000 | No |
| 3/6 bidirectional vs generic, T80 | +1.500 | 0.00781 | 0.05469 | No |
| 3/6 bidirectional vs direct learner, T50 | +0.000 | 1.00000 | 1.00000 | No |
| 3/6 bidirectional vs direct learner, T80 | -0.875 | 1.00000 | 1.00000 | No |

Only the 3/6 bidirectional-versus-read-only T80 contrast passed. For the generic comparator, T80 favoured 3/6 by **1.50 restricted decisions** but adjusted **p = 0.0547**. T50 did not show a registered improvement over read-only. Because the eight historical origins later shared input, even the passing contrast is an initial origin-paired result rather than a replication in independent new founders.

## What the writing channel did

During the first ten decisions of all three reversal windows, the 3/6 bidirectional arm recorded **5,760** local updates and **5,599** extra remote source writes; **161** remote writes were skipped because that same source had already received the local update. The remote writes touched **11,198** House-edge values, of which **8,144** changed, and **3,744** source writes carried directional R≠1 feedback. These are accounting measures, not proof that every write was useful or independent. The 3/6 read-only arm had **322/5,760** selected local updates at 3/6 sources and no added remote writes.

In the matched 2/7 bidirectional arm, **5,414/5,760** selected local updates were already at 2/7 sources, leaving **346** additional remote writes. The difference describes how these actual paths connected feedback to the focus sources; it does not establish that either route's topology inherently produces a general advantage. For 3/6, the sham-write and read-only curves coincided in this run, while the reversed-write arm did not reach T80 in any of the eight origin means; these are descriptive controls, not separately registered hypothesis tests.

The remote channel and the temporary entry edge are added experimental operations. The prior **15.80 transitions** was a restricted action-recovery latency, not the distance or time Amelia took to return to 3/6. No physical return or high-entropy wandering claim follows from it.

## Interpretation and next experiment

The test advances the previous result from **reading stored memory** to **updating that memory with the consequences of new actions**. It supports the narrower claim that, in this task and these reused states, the engineered write channel improves the 3/6 focused relay's T80 relative to remote reading alone. It does not show that 3/6 outperforms an equally resourced 2/7 circuit, generic feedback, or a direct learner. It also does not show a performance ceiling at the earlier 85.94% result.

A useful next route is to test a genuinely different task capability rather than add more speed to this two-strategy task: preseal a memory-binding or ordered-sequence challenge in which a candidate 3/6 circuit must preserve and update **relations between successive events**, then compare it against an equally sized 2/7 circuit and a direct recurrent learner with the same observations and write budget. Any claimed topology advantage should survive a label-permuted isomorphic control and fresh founder states.

## Provenance and verification

The protocol and complete source hashes were committed at `b1cf399a3f41c89a4328618f9a06609f91a84c20`; the fresh evaluation seed was committed afterward at `50c2fa1c6dd081a368e01aa5242092b1e031c2d1`. Registration SHA-256: `26e827090a78f02b122ea0cd46e497af19c3b63dc8870c14255618f25862c6ab`. A small implementation fixture was observed before registration and is archived; it is not part of the fresh evaluation.

All eight evaluation records were replayed. Independent checks regenerated every grid payoff and reversal schedule, checked gate-path legality, relay and write arithmetic, and boundary hashes; a separate implementation reconstructed every origin's lag curves and recomputed all crossings and registered tests from the records. A separate post-registration resource check reproduced the write counts. Replay checks deterministic Oracle execution; it is not an independent reconstruction of Oracle gate scores or phase values. The deliberately tampered fixture write was rejected by the arithmetic checker. No live Oracle, receiver or world stream was modified.
