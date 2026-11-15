# Cybergothic assemblage: fixed fresh-seed study

The aim is to develop necrotic recovery, viral circulation, temporal attraction and runaway feedback as interacting ecological processes. This is a separate Python prototype and does not connect to Amelia Orange or her live database. Six exploratory seeds (24001–24006) were inspected before fixing this study; outcome seeds 25001–25030 have not been examined. This is a locally time-stamped plan, not independent public preregistration, and it follows model development informed by the exploratory runs.

## Environment and agents

The prior 29-gate reactor, 45 mutable matrix addresses, local clocks, Θ = 12 transient flight and genome execution remain. In addition, every agent's currently executed digit controls an embodied three-channel nutrient focus: instructions can retain or rotate focus, sense local supplies at a cost, or recall a previously productive focus. The same digit also participates in the existing matrix interpreter. Nutrient stocks are finite and renewed by an exogenous changing environment; agents compete for them. The external environmental random generator is separate from agent RNG and its state is checkpointed. Its channel transitions are directionally correlated and reverse at environment epoch 20. The future is generated only at the scheduled reveal; agent policies consult current and previously observed states, not the environment RNG.

Added mechanisms are: (1) reconstitution chooses the most productive recorded source among three randomly sampled corpse records, where past productivity means realized nutrient harvested per forage; the control selects the first of the same kind of sample; (2) a successful direct infection can shed an energy-costed code packet that travels along existing gates and, on matching a host gate, inserts its code at the host's instruction pointer; (3) a local observed-transition history commits a paid forecast of the next nutrient regime, scored against the last observed signal in the same windows; (4) a portion of a meltdown victim's remaining energy goes into a bounded Cthell vault and may later fund reconstitution, reducing the need for external reactor renewal. None of these choices is treated as evidence of literal foreknowledge or independent intelligence.

## Design

Thirty fresh seeds, 25001–25030, begin with 36 founders and a 30-model-time-unit warm-up. The warm-up retains all material under a million-digit guard; the study aborts if any active, historical or archival genome exceeds the post-fork 512-digit cap. The living-ecology study applies the same partial shock to every root by killing alternating agents in sorted-ID order, then forks the entire state and RNG into seven 180-unit branches:

| Branch | Archive selection | Forecast | Travelling vectors | Meltdown salvage |
| --- | --- | --- | --- |
| Full assemblage | guided | learned | intact | on |
| No vector | guided | learned | off | on |
| No salvage | guided | learned | intact | off |
| Neither | guided | learned | off | off |
| Shuffled vector | guided | learned | shuffled | on |
| Last-signal forecast | guided | persistence | intact | on |
| Earlier-policy control | random | persistence | off | off |

All branches retain direct local infection, ordinary splicing, corpse recycling and internal local-sum bets; "earlier-policy" runs in the new changing environment and is not the exact previous model. Vector shuffling preserves the digits and their ancestry tags but changes their order before emission. The same energetic rules apply, although interventions change later encounter opportunities and realized costs. The four on/off vector/salvage branches permit an exploratory interaction contrast.

In a separate set of branches from the same pre-shock roots, every living agent is killed. Compare random archive selection, guided selection, guided selection with each recalled genome's order shuffled, and deletion of both accessible archive and active corpse banks. Shuffling preserves the digit multiset and its ancestry tags before the same one-digit mutation. All three archive conditions use the same eight-host recovery floor, initial pool, external renewal rule, forecast and vector settings. The event ledger is not erased. Retained material, food availability, external input and reactor energy are reported.

## Measures fixed before fresh outcomes

The six paired contrasts below use 10,000 seed-level bootstrap resamples and 99.1667% percentile intervals, allocating a 5% family-wise error budget by Bonferroni across six comparisons:

1. Living ecology: full minus earlier-policy agent-time.
2. Complete-loss recovery: guided minus random archive, total nutrient harvested.
3. Living ecology: full minus no-vector, total nutrient harvested.
4. Living ecology: full minus no-salvage agent-time.
5. In full branches, learned minus last-signal forecast accuracy over the same prospectively committed, completed observation windows, calculated per seed.
6. Complete-loss recovery: guided minus order-shuffled archive, total nutrient harvested.

Also report seed-level action-normalized nutrient intake, final population, occupied time and zone coverage; costs and energy transfers; numbers of packets, infected hosts and first subsequent host digit executions; archive sources, reconstitutions and natural fissions; events before and after the environmental reversal; and the vector-by-salvage interaction. These secondary outcomes and comparisons are exploratory. Zero-population arms contribute zero resource harvest and agent-time. Forecasts whose window extends beyond the observation horizon are censored. Forecast success is not a retrocausality test.

All branches in a seed experience the same proposed exogenous environmental sequence, but accepted nutrient input differs with unoccupied stock capacity and uptake. Reconstitutions pay four virtual units each; forecast commitments and vector shedding also cost energy. Field uptake and birth counts need not be matched after a branch diverges. The setup is explicitly designed to determine what these particular modeled mechanisms do, not to establish the metaphysical status of esoteric concepts. Independently regenerate selected event and state histories and audit archive provenance, code insertion, energy movement and commitment-before-reveal.

## Fixed code SHA-256

```
e7514c3fb71e6fd231926c0c1de1dbc488b04bd2808b5a7dd0db95e57a88bfec  legacy_engine.py
4b5ce68032f7fdf8bcb3675d10fe4fb4b1b825443494a44c87555eb0e0849eb7  reactor.py
5a1641b831826ced59d710fc9bb3efe95053770a9e735bbf909d9ed38864963c  storage.py
812a689f0b7e75933e5f716b12479eb950e524b7c368c057de17e6748e9e1cff  study.py
2845e584b8080e88dceef26d2fbf29350178bb4503962fb49ecf5ae806eb0cd0  assemblage.py
9010b854a5b11c82f29e379e287a15c13126f1a958c05d44db309d6ec064ebf1  experiment.py
d444f44882af000c30f44d6bbbdbeb564a273c6774926f7b2ee95ef7b9c27d39  test_assemblage.py
d62ddd8ffd2f53653a77a9fc069ff310eeff514fdf8a769503ce66cdac6de140  cli.py
1391c0d21d4cac87fad3f7c5d800358ca8918c377f42a5a7ee0a78d25352a8c5  cloud_sync.py
9a2caa1178472c12ce0f8b63af7dd501ce3851378351c2ee3a87fa0b5f65125d  isolated_supabase_setup.sql
```
