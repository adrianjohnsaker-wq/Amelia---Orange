# Live pointer experiment

Read `REGISTRATION.md` first. This uses private copies of a supplied runtime-only archive and does not write to the user's Supabase project or tablet. `adaptive_source.ts` implements the live body-responsive synthetic source; `run.ts` records Governor, Numogram, PFM, source, field, intervention and session-restoration traces. The profiles are intentionally constructed.

Run wiring and control tests with:

```sh
node --import tsx --test experiments/live-pointer-baseline/*.test.ts experiments/live-amelia/*.test.ts
```

After committing the registration and exact code, run on a matching private checkpoint archive using a new private output directory:

```sh
node --import tsx experiments/live-pointer-baseline/run.ts --archive /private/archive.json --output /private/new-study-directory --start-new-field
```

The runner refuses an unmatched archive, a checkpoint that already has a field, or an existing output directory. It writes private traces, summaries and compressed full session checkpoints. Output hashes and non-sensitive traces can be published separately. A run uses the full application runtime and field functions in an isolated experiment driver, not the physical tablet process.
