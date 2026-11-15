# Cybergothic assemblage: runnable research code

This is the separate Python ecology used in the accompanying report. It does not import or connect to Amelia Orange, and virtual code strings never execute as operating-system code. The reactor uses Python's standard library; the optional figure script additionally requires Matplotlib.

## Start and continue

From the `current` directory inside this archive:

```bash
python3 -m unittest -v test_assemblage test_extended test_adaptive test_cli_and_cloud test_portable test_portable_cli
python3 portable_cli.py init --db ./my_assemblage.sqlite --seed 20261114
python3 portable_cli.py advance --db ./my_assemblage.sqlite --duration 120
python3 portable_cli.py status --db ./my_assemblage.sqlite
python3 portable_cli.py advance --db ./my_assemblage.sqlite --duration 120
```

The default current configuration combines random archive reseeding, experienced viral cargo, retention 0.85, fallout-energy salvage and portable predatory claims. It is a research configuration selected after the earlier outcomes; it is not an independently validated optimum. To compare local-only claims, create another database with `--local-claims`. Pass `--retention 1.0` at `init` to retain the full temporal trace. The command-line default applies a 512-digit cap from initialization; the formal studies used an inactive warm-up guard and applied 512 only after the fork.

SQLite checkpoints contain the full field and scheduler, agent code and ancestry, active corpses and archive, travelling packets, prediction history, independent RNGs, temporal retention, portable claims, energy accounting and event ledger. Each `advance` commits at completion. An interruption leaves the preceding committed checkpoint; use shorter advances for more frequent checkpoints. Hashes detect accidental modification, but are not a signature against someone who can replace and recompute the whole database.

Checkpoints are **version-specific**. The final `portable_cli.py` and `portable_cloud_sync.py` expect a portable-claim checkpoint. The intermediate `adaptive_cli.py` and its cloud adapter expect an adaptive checkpoint. The earlier-version source in `first_pass/` and `second_pass/` uses its own checkpoint type. Use a new database per version; do not open a later-version database with an earlier-version CLI.

The evidence archive includes `persistence/portable_recovery_demo.sqlite`, a checkpoint from a full-population crash and exact new-process continuation. Copy it into a writable location and inspect the copy with `portable_cli.py status --db <path>`.

## Independent optional Supabase project

`portable_cloud_sync.py`, `portable_io.py` and `isolated_supabase_setup.sql` provide an optional checkpoint route for a **separately provisioned prototype project**. Their contract was tested against a local stub, not against hosted Supabase or real PostgreSQL row-level security. No SQL was applied to Amelia's project. The `--isolated-prototype-project` option is an operator assertion, not proof that a particular project is isolated. The single-row JSON approach is intended for small research runs; real deployment, access policies, optimistic concurrency, data-API exposure, scaling and security require independent verification.

After creating and validating an isolated project and authenticated user, set `CG_PROTOTYPE_SUPABASE_URL`, `CG_PROTOTYPE_SUPABASE_PUBLISHABLE_KEY`, `CG_PROTOTYPE_USER_JWT` and `CG_PROTOTYPE_RUN_ID` in the environment. Use a publishable key and user token; do not use a service-role or secret key. Then, for example:

```bash
python3 portable_cloud_sync.py push --db ./my_assemblage.sqlite --isolated-prototype-project
python3 portable_cloud_sync.py pull --db ./recovered_copy.sqlite --isolated-prototype-project
```

A push rejects a divergent existing event history; a pull refuses to overwrite an existing local file. No user credentials are included in this archive.

## Research layouts

- `first_pass/` preserves the fixed first-stage code and protocol.
- `second_pass/` preserves the fixed experienced-cargo/portfolio code, including its original command-line tools, for exact hash verification.
- `current/` adds fading temporal traces, portable claims, their typed checkpoint support, independent audits and the final CLI.

The four fixed protocol files state all settings and prior pilots. Study commands require a new output directory, for example `python3 portable_study.py --start 30001 --seeds 30 --workers 6 --output ./my_portable_run`. The retrospective analyses expect the result-directory names in the protocols; the accompanying evidence package supplies the original results and selected full ledgers. A timing-sensitive environment was not used in this round: the exogenous environmental sequence is generated independently from a seeded virtual RNG.
