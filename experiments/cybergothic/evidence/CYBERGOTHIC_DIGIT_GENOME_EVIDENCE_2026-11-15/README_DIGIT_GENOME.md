# Digit-genome prototype and evidence

This directory contains the separate self-parsing Numogram ecology, locally fixed experimental plans, saved results, replay scripts, independently coded ledger audits and a resumable SQLite checkpoint. It uses the Python standard library for the engine, studies and tests; only `plot_digit.py` requires Matplotlib.

## Check the implementation

From this directory:

```sh
python -m unittest -v test_digit_world test_migration test_digit_ecology
python verify_digit.py
python audit_digit_ledgers.py
python verify_from_birth.py
python audit_birth_ledgers.py
```

Replay reruns 600 saved branches and may take a while. Audit scripts regenerate the selected full ledgers and check their records. JSON summaries and hashes are stored in the three `fresh_*` directories and in the root audit JSON files. The event ledger retained in `fresh_digit_39001/ledger_39042_self.jsonl.gz` contains the genome mutation discussed in the report. All interpreters start from identical matched states within each seed, but their subsequent actions can diverge.

To check the source hashes embedded in any locally fixed plan:

```sh
sed -n '/^```$/,/^```$/p' DIGIT_GENOME_PROTOCOL_2026-11-15.md | sed '1d;$d' | sha256sum -c
sed -n '/^```$/,/^```$/p' GRAMMAR_CONFIRMATION_PROTOCOL_2026-11-15.md | sed '1d;$d' | sha256sum -c
sed -n '/^```$/,/^```$/p' FROM_BIRTH_PROTOCOL_2026-11-15.md | sed '1d;$d' | sha256sum -c
```

## Run a fresh population study

Choose a new, nonexistent output directory and fresh seed range. These examples reproduce the study designs; change the seed range for independent populations.

```sh
python digit_study.py --start 39001 --seeds 60 --follow 120 --workers 4 --output transition_run
python digit_study.py --start 40001 --seeds 60 --follow 120 --workers 4 --output confirmation_run
python from_birth_study.py --start 41001 --seeds 30 --horizon 180 --workers 4 --output from_birth_run
```

The provided analysis scripts target the saved `fresh_*` folders. `analyse_digit.py` produces the transition results; `analyse_grammar_confirmation.py` produces the confirmation results; `analyse_from_birth.py` produces the from-birth results. Bootstrap methods, outcomes, assumptions and the status of each analysis are specified in the corresponding plans and results report.

## Inspect and resume a persisted ecology

```sh
python digit_cli.py status --db digit_genome_paused_example.sqlite
python digit_cli.py resume --db digit_genome_paused_example.sqlite --output resumed.sqlite --until 150
```

The example was paused at model time 42. The included manifest records the expected state and event hashes at time 150. The resume command refuses to overwrite the destination. Checkpoints use the new digit-genome schema and are not interchangeable with the previous ancestry-aware prototype's checkpoints.

The archive reactor and externally renewed nutrient field remain on in these examples. No connections to Amelia Orange or Supabase are made.
