# Randomized code fragments at matched host encounters

This standalone study follows the cybergothic assemblage's population-level result: experienced viral fragments increased total nutrient uptake over a model-time window, but not clearly over the first 1,500 actions, and the role of fragment order remained unresolved. The present test asks what the fragments do to the **individual recipient** under a matched encounter. It does not connect to or modify Amelia Orange, her database, Governor, gates or scheduled studies.

The harness extends the exact previously saved portable-claim reactor. At virus shedding it records three equal-length candidates from the same donor: the fragment selected from that donor's prior productive experience; the fragment at that donor's current instruction pointer; and a seeded permutation of the experienced fragment, preserving each digit with its origin tag. The packet's route, gate signature, shedding cost and other ecology are shared. Candidates are prepared for measurement; their production does not consume the ecology's RNG. Tests compare the instrumented ecology with the uninstrumented parent and check that stepping through the observation hook alone gives identical events and state.

Once a travelling packet reaches a zone with a gate-matched host, a host is chosen by the existing ecology's rule. **The full state is frozen immediately after that choice and before insertion.** Three deep-copy branches insert one of the three candidates at that very host's instruction pointer, apply the same energy transfer and packet continuation, then follow the host for 12 model-time units. RNG and environment state, resources, competing agents, archive and event queue are identical at the fork. The environment's independently generated future signals are checked for equality across the three branches. After the first intervention, other stochastic choices and ecological interactions may diverge; common initial RNG does not mean later random draws correspond one-for-one.

The actual continuation used to encounter future recipients receives one of the three payloads via an independently seeded randomized, balanced sequence. The order in which the three counterfactual branches are evaluated is separately randomized. A packet is studied only at its first delivery to a host; a recipient is sampled at most once per independent population. The payload persists in that packet during later movement. All later infections, splices, memory changes and deaths operate normally, including those that can overwrite the experimental fragment. No material is transferred to a live system.

## Population, eligibility and observation

The fresh outcome set consists of **60 independent seeds 32001–32060**, each beginning with 36 founders, a 30-model-time-unit warm-up, and the same alternating-ID partial shock as the prior study. At the fork the 512-digit cap is applied only after checking that retained warm-up genomes fit it. The base ecology uses the previously studied random archive, experienced-vector, fading temporal trace (retention 0.85), salvage and portable-claim configuration.

Study up to **eight distinct recipients per seed**, in chronological encounter order. Only deliveries with all three nonempty equal-length fragments and no genome truncation qualify. The shuffled and experienced fragments are allowed to be identical if permutation leaves their sequence unchanged; the pointer and experienced fragments can also coincide. These are retained in the main analysis, and the frequency of such cases is reported. Eligibility is determined before observing the host's outcome. The last eligible time is 198 so every branch can be observed through its full 12-unit window by time 210. Seeds with no eligible recipients are reported and excluded from recipient-conditional comparisons, not assigned fabricated outcomes.

The earlier development included manual fixture seed 31991 and **eight inspected pilot seeds 31991–31998**. The outcome seeds have not been examined. This document fixes the design locally before the outcome run; it is not an independently witnessed public registration.

## Outcomes and analysis

The primary behavior outcome is the recipient's **total virtual nutrient harvested during the full 12-unit window**, including zero after it dies. The primary survival outcome is whether that same agent ID is still living at the end of the window; reconstitution of a descendant does not count as survival of the original recipient. The four fixed, paired contrasts are experienced minus pointer and experienced minus shuffled for each outcome.

For each independently seeded population, average its eligible encounter-level paired differences, then average those population means. Give each seed equal weight and use **10,000 seed-level bootstrap resamples**; report two-sided 98.75% percentile intervals (Bonferroni for the four planned contrasts). Recipients within one population and subsequent ecological events are not independent. Record all seeds, the number of eligible hosts and exclusions, baseline characteristics, candidate equality and actual randomized continuation assignments. Small-sample percentile intervals are approximate; an interval crossing zero is not evidence of equivalence.

Secondary descriptions: number of host actions, per-action uptake, host death cause and time, final energy conditional on survival, zones visited, the next executed digit and whether it matches the injected digit, and subsequent genome-changing events before and after that first action. Differences in first-action or conditional-survivor outcomes are potentially selected by post-intervention survival and must not be presented as an unconditional causal effect. A pre-intervention stratum in which experienced and comparator sequences differ is exploratory. This assay is a causal test **within the implemented ecology**; an effect does not by itself establish a benefit in Amelia or the physical world.

Before the outcome run, verify the no-intervention scheduler against the parent, equal host/energy/starting RNG and matched environment, and restart from a saved paused encounter. Afterward independently regenerate selected full ledgers, confirm insertion at the same pointer, sequence and ancestry provenance, gates, and the recorded 12-unit outcome. Record all per-seed results and digests. The tested persistent store is SQLite; no hosted Supabase project is involved.

## Fixed source SHA-256

```
e7514c3fb71e6fd231926c0c1de1dbc488b04bd2808b5a7dd0db95e57a88bfec  legacy_engine.py
4b5ce68032f7fdf8bcb3675d10fe4fb4b1b825443494a44c87555eb0e0849eb7  reactor.py
5a1641b831826ced59d710fc9bb3efe95053770a9e735bbf909d9ed38864963c  storage.py
812a689f0b7e75933e5f716b12479eb950e524b7c368c057de17e6748e9e1cff  study.py
1f05b457416853fd2461675763fa7cb90cccb96dce8ccbaf0ad1fa5a3676f37d  assemblage.py
02c0988415b4cba48f80b1c6e569b66b77c22cff087f9d5893984826d49058b4  adaptive.py
ee3aca9bbb31d2f4078798ba64825158a42c6616912aafe2445a1be54bac27d2  portable.py
db57943189bc142c0aab2ce3fb2e949c0defd802a15a883b4a9f90112ddb96ae  encounter_trial.py
37ee2e67513fae36e39fc80b10ab3c06acc94c786d9293c8a1d88bd486317648  run_study.py
70cc689b90b76e0c43cf075c1a6737a5c0ffd851b3a8a0738685e757ec2c36db  test_encounter_trial.py
```
