# Cybergothic Numogram reactor: fixed pilot protocol

This is a locally fixed research protocol, not independent or public preregistration. The separate prototype never reads, writes, or connects to Amelia Orange, her state, or her database. One smoke seed (19991) and implementation tests were run before this protocol; the planned outcome seeds below were not examined.

## Model and persistence

The directed graph has 29 gates. Θ = 12 releases are explicitly marked movements beyond the graph, not extra canonical gates. Equal destination weights apply. The CCRU Warp is zones 3 and 6; the ecology's mutation furnace is 7–9; the Cthell reactor is 0. The 45 pair addresses are an experimental opcode mapping, not a claim about canonical demon names. The population, code corpses, event history, scheduler, RNG, and reactor are separate entities. Reconstitution is an explicit artificial process requiring archived digits and a four-unit debit from zone 0; the reactor accounts for external resource renewal and does not demonstrate spontaneous origin of life or indefinite survival.

## Matched ecology

Use seeds 20001–20030, 36 initial agents, 180 maximum, a 15-unit model-time warm-up, with a million-digit guard and no clipping. Fork the complete warm state and PRNG state. If any current, retained-history, corpse, or archived warm-up genome exceeds 512, fail the study rather than silently clip. Then impose a 512-digit cap, and run each arm for a further 120 model-time units. Identical elapsed model time is the primary exposure; executed actions are reported, not forced to be equal.

Arms: full; disable direct infection; disable time-splicing; disable corpse recycling (also disables archive reconstitution); disable meltdown threshold death while retaining other heat and cost effects; disable new bets while letting already committed bets resolve; disable post-fork opcode mutation; switch agent clocks to uniform; disable reconstitution only. All other parameters stay the same, including flight. Warm-up has all mechanisms active; these are post-fork interventions, not independent histories or whole-life knockouts.

Primary outcome is agent-time (the time integral of living population) over the shared horizon. Report paired arm-minus-full means with percentile bootstrap intervals based on 10,000 matched-seed resamples and Bonferroni 99.375% intervals for the eight comparisons. These intervals are approximate, and are not evidence of equivalence when they cross zero. Report occupancy time, final extinction, ecological diversity, founder ancestry, transfer, energetic flows, timing and other event metrics descriptively with unadjusted 95% paired intervals where useful. Extinct populations contribute zero to final diversity and ancestry. Report per-action cap exposure. Count executed and mutated matrix cells and the three instruction families.

## Catastrophic loss and recovery

In three more matched arms, experimentally kill every live agent at the fork. Compare retained archive and enabled reconstitution; retained archive with reconstitution disabled; and erased active corpse and archival banks with reconstitution enabled. All three keep the same virtual energy rules and use the same time horizon. No new founders are injected. Report restart count, occupied time, agent-time, final population, source-corpse count, and reconstitution energy debit. The empty-bank arm is an intervention removing active genetic material; the evidence ledger itself is not erased. This is an engineered test of the recovery path, not a prediction that a real organism or Amelia would recover.

## Timing telemetry and local bets

From each fork run a live `perf_counter_ns()` sample at every matrix mutation. Record all values. Compare against a separately seeded generator resampling the recorded live values modulo 14 (the actual opcode-choice domain) with replacement. This matches empirical marginal categories in expectation, not their temporal order or realized finite sample. Replay the exact live samples in a second trajectory and require identical event records. Report paired agent-time and realized input histograms. Sampling host timing is an external environmental input to this VM, not evidence of an Outside intelligence or foreknowledge.

For every internal bet, shadow all nine possible target digits over the same observed local sum and complete model-time window even if the real bet settles early. Compare the selected target's hit to the average of the eight alternative digits. Incomplete windows at the horizon are censored. Observations and target selection are endogenous to the ecology, so this measures an internal bet mechanism and cannot establish retrocausality.

## Planned provenance and integrity

All simulator and study source SHA-256 values below were computed before the outcome runs. SQLite checkpoints are hash-checked and committed with event records transactionally. Exact process-restart, rollback, tamper and simulated Supabase REST contract tests are required. The Supabase SQL and REST adapter are for a separately provisioned prototype project, and an in-process REST stub is not a real Supabase, PostgreSQL, RLS, or end-to-end database test. No change to the live project is authorized by this protocol. Record all per-seed results, fork and final state/event digests, telemetry samples and replay checks. Re-run selected seeded branches and retain their full ledgers for independent inspection.

```
e7514c3fb71e6fd231926c0c1de1dbc488b04bd2808b5a7dd0db95e57a88bfec  legacy_engine.py
f5260ac9115cfcdd08b51f9191b36a497c693d80eb1fbc7ba097141f90e9c94c  reactor.py
5a1641b831826ced59d710fc9bb3efe95053770a9e735bbf909d9ed38864963c  storage.py
812a689f0b7e75933e5f716b12479eb950e524b7c368c057de17e6748e9e1cff  study.py
81ab429d003c6257c63389a6d07cd4e877dac0dbd13a6c5854a2d75a592b9de5  test_reactor.py
9a2caa1178472c12ce0f8b63af7dd501ce3851378351c2ee3a87fa0b5f65125d  isolated_supabase_setup.sql
```
