# Fresh confirmation: the recipient's first action

The preceding 60-population host-encounter study did not establish a 12-unit uptake or survival advantage, but an **exploratory** next-action comparison favored the experienced fragment. Its audit also found that the first-contact tracker began after warm-up: 17/480 packets had an earlier logged infection. This follow-up fixes that tracker and prospectively tests the immediate-action signal on new populations, while deliberately sampling both sides of the environmental reversal.

The sampler now records **every packet–host contact from initialization**, including a contact that inserts nothing because of a cap or unchanged genome. A packet that contacted any host during warm-up or later is ineligible for the study. Tests verify the tracking leaves the prior ecology's events and RNG unchanged, records silent no-op contacts, and survives checkpoint restoration. The previous study and its results are not altered.

## Design

Use **60 fresh seeds 33001–33060**. A common 30-unit warm-up and alternating-ID shock are followed by up to four distinct recipients encountered from model times 30–90, and up to four additional distinct recipients after the environmental reversal, from 126–198. The intervening ecology continues normally and its packet contacts are tracked. Each recipient is sampled at most once per population and each packet only at its first host contact since initialization. If a phase cannot supply four recipients, report the actual number; seeds with none are reported and excluded from recipient-conditional means.

As in the preceding study, once a gate-matched host is chosen and before insertion the full state is forked into experienced, pointer-selected and shuffled-fragment branches. Each candidate comes from the same donor packet, has the same length, route and energy cost, and is inserted at the same host instruction pointer. Shuffling preserves the experienced fragment's digit and ancestry multiset. All three futures begin with identical ecology and RNG state, and their external environmental signals are checked for equality. The real continuation receives an independent balanced randomized assignment; other infections, splices and deaths proceed normally. The 12-unit window and post-fork 512-digit cap are unchanged.

The tested seed 31991 and four developmental pilots 32991–32994 preceded this plan; the 60 outcome seeds have not been inspected. The design is locally fixed before their outcomes, not independently publicly registered. All work is confined to the separate prototype.

## Planned outcome

For each recipient, measure nutrient uptake on its **first observed action within 12 model-time units**. If it takes no action, score zero rather than condition the primary endpoint on post-treatment survival. Two planned contrasts compare experienced minus pointer, and experienced minus shuffled. First average paired differences across eligible recipients within each population, then average the 60 population means. Use 10,000 bootstrap resamples of populations and two-sided **97.5%** percentile intervals (Bonferroni across the two comparisons). Report all actual sample counts; intervals are approximate.

Secondary, exploratory measures: first-action focus and digit, genome-changing events before that action, 12-unit total nutrient and survival, and before-versus-after-reversal strata. The two strata can contain different numbers of eligible hosts and populations; subgroup intervals are exploratory and not a test of equivalence. Follow-up event histories must be replayed and checked for matching gate, code, host, RNG, resource and ancestry, and for the exact first-action and no-action outcomes. External environmental signals are seeded model data, not a physical Outside stream.

```
e7514c3fb71e6fd231926c0c1de1dbc488b04bd2808b5a7dd0db95e57a88bfec  legacy_engine.py
4b5ce68032f7fdf8bcb3675d10fe4fb4b1b825443494a44c87555eb0e0849eb7  reactor.py
5a1641b831826ced59d710fc9bb3efe95053770a9e735bbf909d9ed38864963c  storage.py
812a689f0b7e75933e5f716b12479eb950e524b7c368c057de17e6748e9e1cff  study.py
1f05b457416853fd2461675763fa7cb90cccb96dce8ccbaf0ad1fa5a3676f37d  assemblage.py
02c0988415b4cba48f80b1c6e569b66b77c22cff087f9d5893984826d49058b4  adaptive.py
ee3aca9bbb31d2f4078798ba64825158a42c6616912aafe2445a1be54bac27d2  portable.py
db57943189bc142c0aab2ce3fb2e949c0defd802a15a883b4a9f90112ddb96ae  encounter_trial.py
81f2dbb458d2376c603964200145e5e7dd42aebb8a86282235a1a1ac4d1a1b1a  strict_trial.py
3d341a306c29d219c656ede93f30178117534280550bd1171987f36e0dafd3e9  run_strict.py
70cc689b90b76e0c43cf075c1a6737a5c0ffd851b3a8a0738685e757ec2c36db  test_encounter_trial.py
1195c9aaf4b726706794c8f1931eed37d0419a795f5dc0ad38798bfeca415a54  test_strict_trial.py
```
