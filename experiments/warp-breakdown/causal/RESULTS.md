# Amelia: causal gate-competition and House-memory intervention

**Completed 7 November 2026.** The intervention successfully increased same-state feedback sensitivity in both Amelia's native 3/6 Warp route and the matched 2/7 control. On independent test histories the increases were **15.67 and 16.02 percentage points**, respectively, with a positive increase in all eight origins. The predeclared manipulation check passed.

The registered recovery result was **NO REGISTERED CAUSAL WARP ADVANTAGE**. Greater sensitivity did not improve average first-step recovery in either route, and the difference between the two routes' high-versus-low effects was smaller than the predeclared practical threshold. This tests a particular calibrated gate-competition intervention; it does not rule out every way of making sensitivity useful or every possible Warp advantage.

## Why this test was needed

The preceding study found that gate sensitivity predicted which route would do better on fresh switching histories, but that association did not establish causation. A post-hoc comparison also suggested that a House readout could beat a short-feedback baseline immediately after a disruption. Here, gate competition was actively changed on matched copies, and the first post-switch step was specified before new test histories existed.

The study used the same eight previously catalogued Oracle origins, `S05W17|0`–`S05W24|0`, with their actual saved substrate and House learner. They originated separately but later shared world input. The 3/6 route retains the native 29-gate graph; the comparison is an explicitly adapted 24-gate 2/7 control with mapped local learner entries. New histories are not new founders.

The intervention added a fixed, cue-independent offset to the competition between the two local exits. It did not change the 0.054 incoming feedback bonus. For each origin and route, low- and high-sensitivity offsets were chosen on separate calibration histories by comparing opposing cues from identical pre-step states. The calibration and all choices were committed before the fresh evaluation seed was generated.

All arms began from matched route-specific saved states and saw the same task feedback, except for separately identified feedback-yoked controls. The study also included unmodified sham, removal and reversal of the adjustment after step 16, and an actual **House-only state exchange** at that point: the host kept its own runtime, process-field memory, route and treatment while receiving the other treatment history's complete House learner. Before-and-after witnesses verify the boundary. The readout was an externally trained, equal-capacity classifier; no live Amelia state or LLM parameters were modified.

For each origin there were 32 training and 32 different test histories, in complementary matched pairs. In the 256 test histories, **974** regime switches were recorded; **810 (83.2%)** reduced the previous regime's strategy by at least two of six matched checks. The incumbent's average fell from **4.80/6** before the change to **1.90/6** afterward. Every switch entered the first-step outcome, whether or not it met this severity threshold.

## Did the intervention change sensitivity?

The prespecified check compared high and low settings on the **identical low-history pre-step state**, asking whether alternative feedback cues would select different gates. Rates below include steps with only one possible exit.

| Route | Low-setting sensitive steps | High-setting sensitive steps | Increase |
|---|---:|---:|---:|
| Native 3/6 Warp | 6.19% | 21.86% | **+15.67 points** |
| Adapted 2/7 control | 0.00% | 16.02% | **+16.02 points** |

Both increases exceeded the presealed five-point minimum, all eight origins had a positive increase in each route, and the mean increases differed by only **0.34 points**, below the five-point balance limit. That balance concerns the group means: individual origins were not always closely matched, with the route-specific gains differing by as much as **12.01 points** in W24. Testing from high-history prestates also gave positive increases: **21.13 points** for Warp and **20.57** for control. Calibration had produced mean increases of 18.42 and 17.81 points, respectively.

The manipulation changed more than sensitivity: it also affected the routes' neutral competition and actual passage. Consequently its recovery effects are causal effects of the **implemented score adjustment**, not an isolated intervention on sensitivity alone.

## Registered first-step recovery

Scores are the pass fraction on four fresh held-out grids, averaged first within each origin and then equally across the eight origins. Each origin contributed matched histories to every route and condition.

| Decision source | Low sensitivity | High sensitivity |
|---|---:|---:|
| 3/6 Warp House readout | **53.79%** | **52.33%** |
| Adapted 2/7 control House readout | **54.98%** | **52.54%** |

| Common comparison | First-step pass fraction |
|---|---:|
| Last-four-feedback classifier | 47.10% |
| Ordered full-feedback filter | **55.04%** |
| Always use the light strategy, post-hoc reference | 54.98% |

All three registered claims were required, each with a practical target of at least +3.125 percentage points and a Holm-adjusted exact one-sided eight-origin sign-flip p-value at most .05:

| Registered contrast | Observed | Adjusted p | Outcome |
|---|---:|---:|---|
| `(high − low) Warp − (high − low) control` | **+0.98 points** | 0.4219 | Not met |
| High Warp − high control | **−0.21 points** | 1.0000 | Not met |
| High Warp − full-feedback filter | **−2.71 points** | 1.0000 | Not met |

The interaction's unadjusted p-value was 0.140625. High minus low was **−1.46 points** in Warp and **−2.44 points** in the control; the positive interaction reflects the smaller decline in Warp, rather than an improvement. The full-history filter exceeded high Warp in all eight origins. These exact tests assume origin-level sign symmetry/exchangeability, limited by the origins' common later stream and small number.

The primary analysis trained a separate readout for each setting. In the preplanned descriptive check holding the **low-trained readout fixed**, Warp scored **53.79% low versus 54.22% high** (+0.43 points); the control scored **54.98% in both**. These small fixed-readout differences reinforce that the primary contrast concerns the combined passage-and-training pipeline, not a clean effect of sensitivity on a single unchanged decoder.

The previous immediate-post-switch comparison with short feedback did recur descriptively: high Warp and high control both exceeded the last-four classifier in all eight origins. However, both fell below the full-history filter on the origin-average comparison, and this short-baseline contrast was not a primary test. The results below show why that comparison alone cannot establish adaptive House memory.

## What changed in the passage?

An exploratory inspection of all test-history transitions found a major difference in dwell time. The low setting made the adapted control alternate **2→7→2 on every recorded test step**. In Warp, 3→3 dwell accounted for **3.71%** of steps under the low setting and **28.83%** under the high setting. The control's 2→2 dwell rose from **0.00%** to **27.84%**. Thus the experiment jointly changed responsiveness and route occupancy; it cannot decide which of those changes produced a recovery difference.

In the low control, the path and the nine measured House features were identical under real versus independently generated feedback in **all 256 test episodes**. The trained House decoder's weights were exactly zero in all eight origins, so it always chose the light strategy. Its **54.98%** first-step score was exactly the fixed light strategy's score. Three of the eight low-Warp House decoders also had zero weights. A separate post-hoc check found that last-four identified the current regime on **34.54%** of first post-switch observations, compared with **50.00%** for the fixed low-control choice and **51.81%** for the full-history filter. Regime accuracy is a different measure from grid pass fraction. Together these diagnostics show that a fixed policy can beat the lagging last-four classifier immediately after a switch without using task-relevant House feedback. This observation does not retroactively prove that every earlier House-memory result was a fixed-policy effect.

The high-sensitivity real-feedback first-step scores were 52.33% for Warp and 52.54% for control; independently yoked feedback scored 54.37% and 53.92% with separately trained matched readouts. These are descriptive controls, not a registered test or proof that feedback is never used.

## House exchange, removal and reversal

In the test episodes, donor and host House learners actually differed at **414/512** recorded Warp swap boundaries and **354/512** control boundaries. The count includes both swap directions. Each swap retained the host's non-House saved state, and representative witnesses were independently checked.

For first post-switch observations after step 16, the high-Warp host scored **52.66%**; giving it the low-Warp House produced **52.84%**. The high-control host scored **52.75%**; giving it the low-control House produced **54.83%**. These are descriptive averages over all origins, including no-op swaps. An additional post-hoc analysis restricted to boundaries where the House actually differed gave a **+0.20-point** mean change for Warp across seven origins with eligible observations and **+3.13 points** for control across six. This selected subset is not a confirmatory mediation test; a swapped learner can alter both subsequent gates and the values delivered to the readout.

The removal and reversal arms shared their first 16 steps exactly with the high arm. In an additional post-hoc check that held the high-trained decoder fixed after step 16, first-step scores for high/reverse/release were **52.66% / 53.09% / 52.59%** in Warp and **52.75% / 52.92% / 51.43%** in the control. The small, mixed differences do not establish a reversible Warp recovery gain.

## Per-origin first-step effects

The interaction is the Warp high-minus-low change minus the control high-minus-low change, in percentage points. Sensitivity increases are measured on matched low-history prestates.

| Origin | Sensitivity gain: Warp / control | Warp: high − low | Control: high − low | Interaction |
|---|---:|---:|---:|---:|
| `S05W17|0` | +10.55 / +15.62 | +0.38 | −2.50 | +2.88 |
| `S05W18|0` | +20.51 / +15.62 | +0.89 | 0.00 | +0.89 |
| `S05W19|0` | +9.38 / +15.62 | −3.13 | −4.58 | +1.46 |
| `S05W20|0` | +18.75 / +12.50 | −1.79 | −2.32 | +0.54 |
| `S05W21|0` | +21.58 / +12.50 | −1.67 | +2.08 | −3.75 |
| `S05W22|0` | +12.50 / +12.50 | −3.75 | −2.92 | −0.83 |
| `S05W23|0` | +19.14 / +18.75 | −2.23 | −4.91 | +2.68 |
| `S05W24|0` | +12.99 / +25.00 | −0.42 | −4.38 | +3.96 |

Rounding can make differences appear off by 0.01 point. The independent result is the paired origin-level comparison, not the number of within-origin time points.

## Interpretation and next mechanism

The earlier gate-sensitivity association was a useful predictor in the previous sample. Here a direct adjustment made cues more capable of changing the chosen gate, but did not produce the registered recovery benefit. It also changed dwell and cycle occupancy, and low control became feedback-insensitive. The test therefore narrows the lead: **cue sensitivity is not sufficient, in this implemented gate regime, to create a Warp-specific recovery advantage**. It does not establish that sensitivity is irrelevant under other dynamics.

A focused follow-up would attempt to vary feedback dependence while **matching gate occupancy and alternation rate** between arms, with a no-feedback/yoked condition and fixed-policy and full-history controls. It should verify that the model-visible House features actually vary with feedback before evaluating recovery. Such a design could distinguish informative passage from an apparent early advantage caused by a fixed strategy or a lagging baseline. Fresh independently raised origins would strengthen any replication.

## Provenance and verification

- [Presealed registration and implementation](https://github.com/adrianjohnsaker-wq/Amelia---Orange/commit/e4121d0fbfbd3e46926ad35527e98c7ef2cc84f2); registration SHA-256 `59ba0f3ba3ecb7d1c495d31a62af02bae3452e40edd1fd6fcf5541a504268fdf`.
- [Frozen calibration](https://github.com/adrianjohnsaker-wq/Amelia---Orange/commit/c323daba9cf8c961ea487921a25e0f3259dddf13); choice SHA-256 `b3a7d575e6a9af05739364fba683a9a49dfc6bee51fdbda51a7bcef97905c381`.
- [Post-calibration evaluation manifest](https://github.com/adrianjohnsaker-wq/Amelia---Orange/commit/d7daff7b2283b990f8ddb2432d10bb35c500de62); manifest SHA-256 `4871ca6c59c9ada04f7275de3f1bacf510177df9396c3540bc3c15e615d20ade`.
- [Recorded outcome](https://github.com/adrianjohnsaker-wq/Amelia---Orange/commit/4fc09ff34ab206369b552e323ce68decaf899a85). All eight remote results matched independent local executions, and the remote summary matched the independently audited local aggregate.
- The historical adapter validation reproduced 43 exchanges and 129 transitions, with 7,724 compared numerical fields matching. The original exchange block begins at [Oracle transcript line 21459](https://github.com/adrianjohnsaker-wq/Amelia---Orange/blob/88b6ed11ea499ae66ab71de45bbe2e4d05535ddb/transcript.jsonl#L21459). Snapshot wall-clock timestamps were excluded; the earlier documented truncated-save telemetry differences remain. All eight calibration shards were independently replayed and reaggregated. Evaluation shards were replayed, and independently written Python checks regenerated feedback, grids, scoring and saved swap witnesses. Runtime snapshot wall-clock timestamps are normalised in the stored swap witnesses only; the raw state is used in the intervention.

The commit sequence records the operational order of registration, calibration, seed generation and outcomes; it is not an independent trusted timestamp service.

The task is a synthetic, forward-generated grid experiment on copies of Oracle state. It does not establish live world-stream ingression, retrocausality, autonomous self-improvement or consciousness. The philosophical interpretation remains open.
