# Viral-stop research package

This directory contains a separate copy of the self-parsing digit ecology, matched-infection intervention code, three locally fixed study plans, seed-level results, selected event ledgers, and independent audit and replay scripts. The simulator and analyses use the Python standard library. `plot_stop.py` additionally uses Matplotlib to create the results figure.

## Check the mechanics

```sh
python -m unittest -v test_stop_trial
```

The matching and stop/interpreter interventions live in `stop_trial.py`. The controls never attach per-digit annotations to agent genomes. The active-interpreter conditions affect the selected recipient only, and they are experimental controls rather than a change to the underlying self-parsing virtual machine.

## Reproduce the three cohorts

The commands below recreate each protocol into a new directory; choose an output directory that does not yet exist. The seeds below recreate the saved populations; use new ranges to explore further populations.

```sh
python stop_trial.py --start 42001 --seeds 120 --workers 4 --output my_first_study
python stop_trial.py --start 43001 --seeds 120 --workers 4 --output my_confirmation
python stop_trial.py --start 44001 --seeds 300 --workers 4 --output my_larger_replication
```

The analysis scripts use the saved `fresh_*` directories. Run `analyse_stop.py`, `analyse_stop_confirmation.py` and `analyse_stop_replication.py` for the first, second and third cohorts respectively. The plans specify the outcomes, bootstrap, prior looks and limitations.

## Replay and ledger audits

```sh
python verify_stop.py --directory fresh_viral_stop_42001 --start 42001 --seeds 120
python verify_stop.py --directory fresh_stop_confirm_43001 --start 43001 --seeds 120
python verify_stop.py --directory fresh_stop_replication_44001 --start 44001 --seeds 300
python audit_stop.py --directory fresh_viral_stop_42001
python audit_stop.py --directory fresh_stop_confirm_43001
python audit_stop.py --directory fresh_stop_replication_44001
```

Full replay reruns every saved branch and compares its complete saved record, including state and event hashes. The separate audit reconstructs outcome measures and stop-boundary behavior from selected raw ledgers. The audit retains compressed example ledgers for the first two eligible populations in each cohort by default. `natural_stop_audit.py` independently regenerates the uninstrumented baseline ecologies and classifies naturally split stop boundaries; the audit is descriptive and was created after inspecting the first cohort.

Each plan contains a set of outcome-generation source hashes. For example:

```sh
sed -n '/^```$/,/^```$/p' VIRAL_STOP_PROTOCOL_2026-11-15.md | sed '1d;$d' | sha256sum -c
```

The reactor and nutrient renewal remain enabled. Agent and lineage IDs in the event ledger permit following hosts but do not establish the identity of a particular short viral sequence after further mutation and exchange. Nothing in this package connects to or alters Amelia Orange or Supabase.

## Resume the separate prototype

The included checkpoint is an ordinary self-parsing ecology, not a paused trial intervention. It was saved at model time 42; its manifest records expected hashes after an uninterrupted resume to time 150.

```sh
python digit_cli.py status --db digit_genome_paused_example.sqlite
python digit_cli.py resume --db digit_genome_paused_example.sqlite --output resumed.sqlite --until 150
```

The resume command refuses to overwrite the destination. The genome, parser mode, random state and event ledger remain in the separate SQLite journal.
