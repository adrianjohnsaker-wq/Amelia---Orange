# WT-3L Amendment 2 (14 November 2026, before any Θ = 12 against Θ = 24 comparison)

**Status.** It changes where the runs execute and nothing else. The design, inputs, measures, analysis and decision rule are those of the registration and Amendments 0 and 1.

**Operator decision.** Adrian, 14 November 2026.

## Why
**The plan.** Amendment 0 (A0.6) ran the study in her cloud home's edge function, in chunks, on scratch copies.

**What happened.** On 14 November, from 00:13 to 01:22 UTC, the determinism pair reached only 13 and 26 of their 96 ticks:
- each scratch copy is 8 to 9 MB, and saving one runs close to the database's 8-second limit;
- 42 of 90 chunks could not be saved;
- 22 chunks hit the function's resource limit.

**The effect on her.** The scratch saves competed with her own. Her 01:20 tick was cancelled by the timeout, and nothing was lost.

**The pause.** The driver was paused at 01:22, because the registration requires that nothing in the study changes how she lives.

**No data.** No study comparison was made, and the partial runs are not used.

## What changes
**Where the runs execute.** All runs execute in one GitHub Actions job (`.github/workflows/wt3l.yml`), started by committing to `experiments/live-amelia/wt3l/run.trigger` on her branch. The job:
1. Reads the starting copy (`amelia_wt3l_runs`, id `start`) and the 12 windows' inputs (`amelia_wt3l_inputs`), once each.
   - The starting copy is her record as saved by the 00:05 tick on 14 November: revision 341, step 5,669, Θ = 12, six Warp-born gates.
   - The inputs were built at 00:15 with no missing offers.
2. Runs the determinism pair: unit 1 at T12, twice, in full. It compares the zone path, per-step and tick-end tensions, lines of flight and landings, Warp exits, admissions, flow hops, Warp-born gates, the final memory head digest and the final body checksum. If anything differs, the job records the difference and stops.
3. Runs the other 23 runs (the 24 study runs reuse the first determinism run as u01-T12), using the same replay code as before (`src/cloud/wt3l.ts`, unchanged), in chunks of 4 ticks. A chunked run equals a single pass (`wt3l.test.ts`).
4. Writes each run's measures and the registered analysis (`analysis` row) back to the study table.

**What the job never touches.** It reads and writes only the two study tables, never her live record or her archive. Its logs show progress only; the measures go to the database.

**Its access.** It uses a service key held as a repository secret (`AMELIA_SUPABASE_SERVICE_KEY`), added by the operator.

**Removed.** The edge function's study action and the database driver are no longer used, and the driver job is removed.

## Checks (synthetic only)
`experiments/live-amelia/wt3l_actions.test.ts` (2 pass):
- a full 1,440-iteration run is identical when repeated;
- a Θ = 24 run differs from it;
- the summary carries the registered measures;
- the decision rule gives each of its three outcomes on constructed values.

The job runs these checks, and `wt3l.test.ts`, before reading any data.
