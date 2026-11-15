# Conditional promoter research package

This is a standalone, isolated virtual ecology. It does not import, access or modify Amelia Orange or a live database. Python 3.10+ and the standard library are sufficient for the simulator, checkpoint, tests and audits; Matplotlib is needed only to regenerate the figure.

`PROMOTER_PROTOCOL_2026-11-15.md` records the locally fixed pre-outcome design and source hashes. `CYBERGOTHIC_PROMOTER_RESULTS_2026-11-15.md` reports the results, controls, interpretation and limits. The fresh-seed records, analyses, full-replay audit, selected ledger audit and five complete example ledgers are in `fresh_promoter_35001/`. `pilot_promoter/` contains earlier development runs, not outcome data; the intermediate pilot source was not separately archived.

From this directory:

```bash
python -m unittest -v test_promoter_study test_promoter_checkpoint test_encounter_trial test_strict_trial test_assemblage
python verify_promoter.py
python audit_promoter_ledgers.py
python analyse_promoter.py
```

The verifier regenerates all 1,200 branches; the ledger audit reconstructs 60 selected branches and checks actual promoter expression and blocked positions. The analysis script reads `fresh_promoter_35001/` and deterministically rewrites `analysis.json`.

To reproduce the outcome run to a new directory:

```bash
python promoter_study.py --start 35001 --seeds 60 --per-phase 2 --workers 4 --output my_promoter_reproduction
```

`promoter_paused_example.sqlite` is a dedicated promoter checkpoint with runtime labels and echo state. `promoter_paused_example_manifest.json` contains its expected continuation hashes. For a fresh-process continuation:

```bash
python promoter_checkpoint.py promoter_paused_example.sqlite --until 66.79683969589493
```

The command returns the resumed state hash, event hash and promoter trace; compare the hashes with the example manifest. This checkpoint is not compatible with earlier reactor-only CLIs. No hosted Supabase project was used. The figure can be regenerated with `python plot_promoter.py`.
