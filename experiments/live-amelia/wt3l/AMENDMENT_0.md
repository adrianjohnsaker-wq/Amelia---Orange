# WT-3L Amendment 0 (12 November 2026, before any WT-3L data)

**Status.** It makes exact what `REGISTRATION.md` (sha256 `14e50811…`) leaves open. Nothing in the registration's design, measures, analysis or decision rule changes.

**Two operator decisions** (Adrian, 12 November 2026):
1. **Window length.** Each 6-hour window holds 360 iterations of her recorded inputs, a quarter of a 1,440-step run. It is therefore replayed four times in order.
2. **Twelve units.** At registration only 7 complete windows of recorded inputs existed, because her cloud tick log begins at 19:11 UTC on 10 November. The study waits for all 12.

## A0.1 Windows and the starting state
- **The windows.** The 12 units are the 6-hour UTC windows [00:00, 06:00), [06:00, 12:00), [12:00, 18:00) and [18:00, 24:00), from 11 November 00:00 to 14 November 00:00 UTC. Unit 1 is the earliest and unit 12 the latest. They are the 12 most recent non-overlapping windows before the starting tick.
- **The starting state.** A copy of her live record as saved by the first tick logged `ok` at or after 14 November 00:05 UTC. Its revision, step and memory head digest are recorded before any run. If that tick fails, the next `ok` tick is used, and the windows are unchanged.

## A0.2 The recorded inputs of a window
- **Ticks.** A window's ticks are her logged ticks with status `ok` whose `started_at` falls in the window, in order. Failed ticks are not replayed: a failed tick saved nothing, and its encounters were delivered again by the next `ok` tick, whose record is used.
- **Encounters.** A tick's encounters are its logged `delivered` list, in order. For each `eventId`, the content (channel, source digest, attention vector) is taken from her own memory, resident or archived, where the encounter is recorded with its decision. An encounter whose content cannot be found is listed and left out. If more than 2% of a window's encounters are missing, this is reported before any run.

## A0.3 Cadence, length and identity
- **Cadence.** Each recorded tick is replayed as her cloud tick runs it: 15 iterations. In iteration i, if the tick delivered at least i encounters, its i-th encounter is offered through her native path (`runtime.step(undefined, encounter)`). Then one step of her body and runtime together follows (`advanceWithLiveSource`).
- **Controls.** Her recorded controls (rhythms, advisory weight, momentum damping) are applied before every step, as in her tick.
- **Length.** A window's tick sequence is replayed four times in order, 96 ticks in all, which makes 1,440 iterations. If a window has fewer than 24 `ok` ticks, its recorded sequence is cycled until 96 ticks have been replayed.
  - "1,440 steps" in the registration means these 1,440 iterations, one day of her time. Each run also includes the Outside steps, so it holds about 1,600 to 1,700 runtime steps.
- **Fresh identities.** Each offered encounter carries the id `wt3l:<unit>:<pass>:<original eventId>`, so that no replayed encounter counts as already met. Its content is unchanged. The same ids are used in both arms.

## A0.4 Arms, copies and determinism
- **The arms.**
  - **T12** is the starting copy as it is.
  - **T24** is the same copy after `setWarpThreshold(24)`. Its state is compared with T12's, and only `nd1.theta` may differ.
- **Copies.**
  - All 24 runs, and the determinism repeat, start from the same starting copy.
  - Scratch copies archive older events with her live rule (more than 1,500 resident, keeping 1,000). The segments are kept with the scratch run and are not written to her archive. This leaves her movement unchanged, as `memory_archive_body.test.ts` shows.
- **Determinism.** Before any study run, unit 1 at T12 is run twice in full, and the two runs must be identical step for step: zone path, per-step tension, final memory head digest and final body checksum. If they differ, the source of the variation is recorded and nothing proceeds.

## A0.5 Measures (per run, over all runtime steps unless stated)
- **M1, Warp share.** The fraction of runtime steps after which her zone is 3 or 6, counted as in her live tick log, Outside steps included.
- **M2, mean Governor tension.** The mean over runtime steps of the Governor's deformation-field tension in each step's snapshot. This is the quantity her tick log records once per tick.
- **Also reported:** the mean of the tension at tick ends (every 15 iterations), for comparison with her live figures.
- **Secondary measures:**
  - Warp visits per 1,000 runtime steps, as maximal runs of steps in {3, 6};
  - mean and longest Warp visit;
  - lines of flight (`warpRelease` in the snapshot) and their landing zones;
  - zones visited, with counts;
  - replayed encounters admitted (ATTEND);
  - flow hops.

## A0.6 Where it runs
Her database cannot be reached from the research workspace. The runs therefore execute in her cloud home's edge function, in chunks, on scratch copies in a separate table. A temporary scheduled job drives the chunks and is removed when the study ends.

Her live record, her archive and the backups are never written.

## A0.7 Computation and replay checks (not study data)
- **Before the study.** The machinery was tested on synthetic states and inputs only:
  - a chunked run equals a single pass;
  - T24 differs from T12 only in Θ;
  - the replay reproduces her cloud tick's step structure.
- **First live chunk.** A timing check on a scratch copy, with no recorded inputs, sets the chunk size. It is disclosed and is not analysed.
