# Cybergothic Numogram Reactor — runnable research prototype

This Python project is a separate virtual ecology. It does not import Amelia Orange, connect to her runtime, modify her database, or execute digit strings as operating-system code. It uses only Python's standard library and was tested with Python 3 in this workspace.

## Start and resume a persistent reactor

From the `current` directory inside the code archive:

```bash
python3 -m unittest -v test_reactor test_extended test_colony
python3 cli.py init --db ./my_reactor.sqlite --seed 20261114 --steering target --recovery-floor 4 --pulse-renewal 0.6
python3 cli.py advance --db ./my_reactor.sqlite --duration 120
python3 cli.py status --db ./my_reactor.sqlite
python3 cli.py advance --db ./my_reactor.sqlite --duration 120
```

Each `advance` runs from the persisted scheduler, memory and random state and commits the event history and checkpoint atomically on completion. A process interruption during an `advance` leaves the preceding committed checkpoint; choose shorter durations for more frequent checkpoints. The command refuses to overwrite a database on `init`. The demo's 512-digit cap applies from the beginning; reproduce the studies with their own scripts, which apply that cap only after warm-up.

The local store is a real SQLite database. It saves the living population, archive, corpse field, resource pools, all pending events and bets, mutable instruction matrix, clock state, PRNG state, event ledger and parameters. Hashes detect accidental changes when loading, but are not a digital signature against a party able to replace and recompute the whole database. The reactor can continue with no living agents and reconstitute stored digit code when the configured energy and archival conditions are met.

## Optional isolated Supabase backend

`isolated_supabase_setup.sql` and `cloud_sync.py` implement an optional single-row checkpoint backend. They have been tested against a local HTTP contract stub, **not** a live Supabase project, PostgreSQL instance or real row-level-security deployment. The SQL has not been applied anywhere. Use them only after provisioning and verifying a separate prototype project; the `--isolated-prototype-project` flag records an operator assertion and does not technically determine which project is in use. Do not point this experiment at Amelia's live project.

After the separate project, authenticated user and SQL policies have been configured and verified, provide `CG_PROTOTYPE_SUPABASE_URL`, `CG_PROTOTYPE_SUPABASE_PUBLISHABLE_KEY`, `CG_PROTOTYPE_USER_JWT` and `CG_PROTOTYPE_RUN_ID` as environment variables. Use an authenticated user token and publishable key, not a service-role or secret key. Then:

```bash
python3 cloud_sync.py push --db ./my_reactor.sqlite --isolated-prototype-project
python3 cloud_sync.py pull --db ./new_recovered_copy.sqlite --isolated-prototype-project
```

The backend uses one versioned JSON checkpoint row; it is suitable for prototype-sized runs, not a claim of production throughput. A push refuses to replace a divergent event history. A pull refuses to overwrite a local file. Hosted concurrency, data-API exposure, policies, operational security and scaling require real-project verification before use.

## Research versions

- `baseline/`: first reactor and `study.py`; 30-seed mechanism, forced-die-off and telemetry experiments. `analyse.py`, `audit.py`, and `ambush_followup.py` calculate the reported results.
- `temporal/`: adds costed target steering, wrong-target and sham controls, and adjustable positive feedback. `extension_study.py` contains the second fixed design.
- `current/`: adds the recovery-floor control. `colony_study.py` contains the fixed recolonization test. This is the most capable version to run.

Every protocol describes seeds, horizons, controls and pre-outcome source hashes. Research output, recorded timing samples, selected full event ledgers and a completed SQLite checkpoint are in the separate evidence archive. Output directory arguments must name a new directory. Full studies use `--workers 6` by default and can be reduced for smaller machines.

## Design notes

The 29 directed gates are unchanged. A transient Θ = 12 line of flight from zones 3 and 6 is logged as a non-gate movement. The CCRU Warp here means 3/6. The ecology's 7–9 mutation furnace and 1–6 incubation region are modeling roles, not alternate claims about CCRU terminology. The 45 numbered matrix cells are an experimental mapping to 15 executable handlers in the Chrono, Zino and Ampy classes; they are not presented as a canonical demon-name mapping.

Digit ancestry is observational. Memory is an explicit engineered archive, and reconstitution spends externally renewed virtual energy. Prophecy steering uses the current local sum and costs energy: it is a forward-causal mechanism, not access to a future observation. The real timing source used in the study was `perf_counter_ns()`. A failure to distinguish that source from matched sampled noise is not evidence for equivalence or an external intelligence.
