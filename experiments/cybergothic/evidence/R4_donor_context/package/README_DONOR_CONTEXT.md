# Donor-context and pointer-policy research package

This is a separate virtual ecology. No Amelia Orange runtime or live database is used. Python 3.10+ and the standard library are sufficient for the simulator, checkpoint, tests and audits; Matplotlib is only needed to regenerate the figure.

`DONOR_CONTEXT_PROTOCOL_2026-11-15.md` fixes the first study's provenance algorithm, controls and uptake endpoints before seeds 36001–36060. `SLIDE_SURVIVAL_CONFIRMATION_2026-11-15.md` fixes the fresh survival endpoint before seeds 37001–37060, after the first study's secondary survival result was seen. `CYBERGOTHIC_DONOR_CONTEXT_RESULTS_2026-11-15.md` reports results and limitations.

The original seed records, provenance samples, per-action traces, primary analyses, complete replay audits and selected ledger audits are under `fresh_donor_36001/` and `fresh_survival_37001/`. Seven complete example first-study ledgers are included. The `pilot_context/` and `pilot_corrected/` directories hold pre-protocol development output; the intermediate pilot sources were not separately frozen and none is an outcome sample.

From this directory:

```bash
python -m unittest -v test_donor_context test_context_checkpoint test_promoter_study test_promoter_checkpoint test_encounter_trial test_strict_trial test_assemblage
python verify_donor_context.py
python audit_donor_ledgers.py
python verify_confirmation.py
python audit_confirmation_ledgers.py
python analyse_donor_context.py
python analyse_survival_confirmation.py
```

The two replay verifiers regenerate **3,346** outcome branches. The ledger audits reconstruct selected original histories and check recipient uptake, actual decoded no-ops, gates and echo deliveries in 168 branches. The analyses deterministically rewrite their respective analysis JSON files.

To rerun the studies into new output directories:

```bash
python donor_context_study.py --start 36001 --seeds 60 --per-phase 2 --workers 4 --output my_first_study
python donor_context_study.py --start 37001 --seeds 60 --per-phase 2 --workers 4 --output my_survival_confirmation
```

`donor_context_paused_example.sqlite` is a dedicated checkpoint holding the ecology, event chain, promoter metadata, action policy, echo schedule and traces. `donor_context_paused_example_manifest.json` provides the expected continuation hashes. To resume it in a fresh process:

```bash
python context_checkpoint.py donor_context_paused_example.sqlite --until 69.6730650474903
```

The output returns state and event hashes plus the complete runtime trace. This checkpoint type must be opened using `context_checkpoint.py`, not an older reactor-only CLI. It uses local SQLite; no hosted Supabase project was accessed. The optional figure is regenerated with `python plot_donor_context.py`.
