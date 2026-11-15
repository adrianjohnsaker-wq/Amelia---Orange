# Randomized host encounters: runnable research package

This is an isolated extension of the previously saved cybergothic Numogram assemblage. It does not import, connect to or modify Amelia Orange. The code strings and viral packets execute only inside the virtual ecology.

## Run the checks and reproduce the study

In the `current` directory, with Python 3:

```bash
python3 -m unittest -v test_assemblage test_extended test_adaptive test_cli_and_cloud test_portable test_portable_cli test_encounter_trial test_encounter_cli test_strict_trial
python3 run_study.py --start 32001 --seeds 60 --encounters 8 --follow 12 --workers 6 --output ./my_host_run
python3 run_strict.py --start 33001 --seeds 60 --workers 6 --output ./my_first_action_run
```

The output directory must be new. For smaller machines reduce `--workers`; the study makes three state copies per encounter. The saved results in the separate evidence archive are under `results/`. To regenerate the exact reported analysis and every-ledger audit, place or copy those result files in a new `fresh_32001/` directory alongside the source, then run:

```bash
python3 analyse.py
python3 full_audit.py
```

`full_audit.py` replays 1,440 branches and can take time. For the corrected confirmation, place the confirmation result files in `strict_fresh_33001/`, then use `python3 analyse_strict.py` and `python3 strict_full_audit.py`. Its audit replays 1,389 branches. Both analyses use populations as the resampling units. The full report explains the planned and exploratory endpoints, fixed design, initial sampling deviation and limits. The optional figure script requires Matplotlib; the simulator and tests otherwise use the Python standard library.

## Inspect an actual paused encounter

The evidence archive contains `persistence/paused_encounter_example.sqlite`, saved immediately before an actual recipient receives a fragment. Copy it to a writable location and inspect it:

```bash
python3 encounter_cli.py status --db ./paused_encounter_example.sqlite
python3 encounter_cli.py branch --db ./paused_encounter_example.sqlite --condition experienced --duration 12 --output ./experienced.sqlite
python3 encounter_cli.py branch --db ./paused_encounter_example.sqlite --condition pointer --duration 12 --output ./pointer.sqlite
python3 encounter_cli.py branch --db ./paused_encounter_example.sqlite --condition shuffled --duration 12 --output ./shuffled.sqlite
```

Each command writes a separate new checkpoint and refuses to overwrite its destination. The source retains the pending encounter and its exact world, event queue, code, archive and RNG state. The example's experienced branch has been resumed in a fresh Python process and checked against the original study digest. A checkpoint is committed after a branch completes; an interrupted process leaves the last committed checkpoint.

This extended paused-encounter checkpoint has its own type and must be opened with `encounter_cli.py` / `EncounterJournal`. Do **not** open it with an older assemblage, adaptive or portable CLI: those tools do not know about the pending encounter. Use a new database for each version. The experiment's tested durable store is SQLite. The earlier prototype's optional hosted Supabase adapter has not been upgraded or tested for this checkpoint type; no hosted Supabase project is used here.

The evidence archive also contains `persistence/strict_paused_example.sqlite`, a corrected first-contact checkpoint. Use `strict_cli.py` in place of `encounter_cli.py` for its `status` and `branch` commands. The two checkpoint types preserve different contact-history metadata and must not be interchanged.

## Provenance

`AMELIA_RANDOMIZED_HOST_ENCOUNTER_PROTOCOL_2026-11-14.md` and `AMELIA_HOST_FIRST_ACTION_CONFIRMATION_PROTOCOL_2026-11-14.md` fix the two outcome designs and source hashes. The evidence archive contains both sets of 60 per-seed results, independent event-outcome audits of all 2,829 replayed branches, selected complete event ledgers, pilot outputs, the verification log, and both SQLite examples. Bootstrap intervals are approximate; the original four primary contrasts use 98.75% intervals, while the two new first-action primary contrasts use 97.5% intervals. The first-action analysis in the original study was exploratory; its fresh confirmation used an unconditional primary endpoint.
