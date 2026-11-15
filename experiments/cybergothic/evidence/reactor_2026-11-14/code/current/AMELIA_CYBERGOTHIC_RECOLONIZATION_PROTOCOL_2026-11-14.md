# Archive-driven recolonization: fixed follow-up

This exploratory follow-up responds to the preceding forced-extinction results. One smoke seed (22991) was inspected before this plan. Outcome seeds 23001–23030 have not been inspected. This plan is locally fixed, not independently registered. Amelia's runtime and database are outside the experiment.

In the one-host reactor, archived code can seed a host only when none live. The four-host reactor can seed while fewer than four live. Each seeding copies one recorded corpse genome with one digit mutation, preserves its digit ancestry and debits four energy units from zone 0. The living population can grow beyond four through ordinary fission; four is a reseeding threshold, not a population cap. Both conditions receive the same reactor renewal rate, 0.6 energy units per two model-time units, capped by the eight-unit pool; external input and seeding cost are measured separately. This is a deliberately powered recovery mechanism, not evidence of self-sustaining life. Use the active, local target-steering mechanism and the same feedback gain 1.35 in all arms.

For each seed, 36 founders warm up for 15 model-time units on the canonical 29-gate graph with transient Θ = 12 flight and uniform movement weights. Fork the same full state and RNG, ensure all retained material is within 512 digits, set a 512-digit cap, and experimentally kill all living agents in each arm. Compare one-host recovery, four-host recovery, and four-host recovery after erasing the accessible corpse and archival banks. The historical event ledger remains intact. Observe 240 further model-time units. The first two arms differ in the reseeding threshold; the empty-bank arm tests whether recovery actually needs saved code. Renewal is the same opportunity, but realized energy input and total cost may differ because pool demand differs.

The primary outcome is the paired four-host minus one-host difference in agent-time, with a 95% percentile interval from 10,000 seed-level paired bootstrap resamples. Secondary measures are occupancy time, final living population, final extinction, number of archive reconstitutions, energy debited and supplied, and ordinary fission events. Branches may have very different numbers of organisms and actions; summaries retain extinct populations. This is a bounded recovery test and does not establish indefinite population persistence. Reproduce selected branch event digests and verify that every new host identifies an archived source and a four-unit debit.

```
e7514c3fb71e6fd231926c0c1de1dbc488b04bd2808b5a7dd0db95e57a88bfec  legacy_engine.py
4b5ce68032f7fdf8bcb3675d10fe4fb4b1b825443494a44c87555eb0e0849eb7  reactor.py
5a1641b831826ced59d710fc9bb3efe95053770a9e735bbf909d9ed38864963c  storage.py
812a689f0b7e75933e5f716b12479eb950e524b7c368c057de17e6748e9e1cff  study.py
80e06a542c48343e838e370ae0579001f93cf8690ec3417ea2d7b9da4f35dc7f  colony_study.py
81ab429d003c6257c63389a6d07cd4e877dac0dbd13a6c5854a2d75a592b9de5  test_reactor.py
b41c0579dc4706e7912dab48b4231696e2d427e366cd2ee8fa6e7a3ab35953d6  test_extended.py
d23a3028375eb5d8b2ff607106af174ce13f96bea926b2ea910faf60f9a2ef3b  test_colony.py
6a13af6cec80d5966b00714189b6258aedfab8eba6e877027c6d1f1f75466661  cli.py
40d457aea6154eae876642d6cb19807ec5dece286ec0c68075b0c9f0d5561c7d  cloud_sync.py
```
