# Reproduce the viral-echo study

Everything here is an isolated virtual ecology. The digit strings are interpreted as model instructions; no Amelia Orange database or runtime is used. Python 3.10+ and the standard library are sufficient for the simulator, tests and audit. Matplotlib is required only for the optional figure script.

`VIRAL_ECHO_PROTOCOL_2026-11-15.md` is the locally fixed pre-outcome plan; `CYBERGOTHIC_VIRAL_ECHO_RESULTS_2026-11-15.md` explains the results and limitations. `viral_echo_study.py` implements the three branches. The inherited source files are the exact earlier host-encounter code and are checked against hashes in the protocol. `fresh_echo_34001/` holds all 60 seeds, analysis, replay audits and selected complete ledgers. `pilot_echo/` holds two earlier development runs from an intermediate observer version; the intermediate tracer source was not separately frozen and those runs are not outcome observations.

Run from this directory:

```bash
python -m unittest -v test_viral_echo test_echo_checkpoint test_encounter_trial test_strict_trial test_assemblage
python verify_viral_echo.py
python audit_echo_ledgers.py
python analyse_viral_echo.py
```

The verifier regenerates all 705 outcome branches. The ledger audit reconstructs the original sampled encounters for three seeds and recomputes selected host outcomes from full event logs. `analyse_viral_echo.py` reads `fresh_echo_34001/` and rewrites its `analysis.json` deterministically.

To run fresh copies in a different output directory:

```bash
python viral_echo_study.py --start 34001 --seeds 60 --workers 4 --per-phase 2 --output my_reproduction
```

An example mid-echo checkpoint is `echo_paused_example.sqlite`, with expected final hashes and resume time in `echo_paused_example_manifest.json`. To continue the saved branch in a fresh process:

```bash
python echo_checkpoint.py echo_paused_example.sqlite --until 69.60120028752624
```

The output contains the resumed state hash, event hash and complete retained host trace. This echo-specific checkpoint is separate from older reactor/encounter checkpoint types; it must be opened with `echo_checkpoint.py`, not an older CLI. It records the trace labels and action count alongside the world and its ledger. No hosted Supabase project was accessed. The optional figure can be rebuilt with `python plot_viral_echo.py`.
