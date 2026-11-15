# Temporal trace adaptation after environmental reversal

The preceding fresh 30-seed trial found that an accumulated observed-transition trace predicted the original environmental rhythm better than last-signal persistence, but its advantage diminished after the programmed reversal. This follow-up tests whether a fading trace adapts more quickly, and what it sacrifices before the reversal. It is a locally fixed fresh-seed study prompted by observed results, not independently preregistered confirmation. One code smoke seed (27991) was run; outcome seeds 28001–28030 have not been examined.

The previous assemblage is extended with a retention coefficient applied to its observed transition counts before each new environment update. Retention 1.0 keeps all past weight; 0.85 and 0.70 gradually reduce it. The counts are based on the same previously revealed environmental signals. Agents have no access to the independent environment RNG or future values. More rapid forgetting can improve adjustment to a new rhythm while losing useful longer history; that trade-off is part of the test.

Each of 30 fresh seeds begins with 36 agents. Founders warm for 30 model-time units with the accumulating trace and the previously developed experienced-cargo, random-archive, three-action orientation and meltdown-salvage policies. A common alternating-ID shock is applied and the complete state is forked. In three 180-unit branches, retention becomes 1.0, 0.85 or 0.70 after the fork. The exogenous environment is identical across these branches for a given seed. The programmed directional reversal is first revealed at environment epoch 21.

The primary accuracy measure is a **shadow evaluation on identical environmental opportunities**. For every zone and environment reveal after the fork, reconstruct each trace's prediction from observations already available at the preceding reveal; score all 10 zones whether or not an agent currently inhabits them. Warm-up is accumulating in every arm. The two pre-specified paired contrasts are post-reversal correct-prediction fraction for retention 0.85 minus 1.0, and for retention 0.70 minus 1.0. Use 10,000 seed-level bootstrap resamples and 97.5% percentile intervals (Bonferroni across two contrasts). The evaluator must agree with every logged living-agent forecast where the observation windows overlap. These are forecasts of a modeled environment with a deliberately learnable structure, not a test of information from a physically unknown future.

Report the pre-reversal accuracy trade-off, last-signal persistence reference, actual living-agent forecast windows, ecological agent-time and nutrient intake, energetic costs and deaths as secondary measures. The shadow evaluation isolates identical opportunities; living ecological comparisons may diverge in occupancy and costs. Reconstruct selected histories, check identical environmental traces, and verify checkpoint restoration.

```
e7514c3fb71e6fd231926c0c1de1dbc488b04bd2808b5a7dd0db95e57a88bfec  legacy_engine.py
4b5ce68032f7fdf8bcb3675d10fe4fb4b1b825443494a44c87555eb0e0849eb7  reactor.py
5a1641b831826ced59d710fc9bb3efe95053770a9e735bbf909d9ed38864963c  storage.py
812a689f0b7e75933e5f716b12479eb950e524b7c368c057de17e6748e9e1cff  study.py
1f05b457416853fd2461675763fa7cb90cccb96dce8ccbaf0ad1fa5a3676f37d  assemblage.py
c141b4db4147ca8d2545fa2b12cb543ca78053dbedc73197ab7b12565da21cea  experiment.py
02c0988415b4cba48f80b1c6e569b66b77c22cff087f9d5893984826d49058b4  adaptive.py
b0a8e8212dd442a2c02d165a469b3795b1433889f25f7e8002e808236320befc  temporal_study.py
5ae8b6a0aaeff5adee36d96dd5d146dfcc8ddae04ee9814f189e8e8ddbd715dc  test_adaptive.py
```
