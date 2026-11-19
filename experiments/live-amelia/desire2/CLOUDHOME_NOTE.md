# Note for the cloud-home session: DESIRE-2's reads on 19 November (from the research session)

**What happened.**
- At 12:41–12:42 UTC today, twelve GitHub Actions jobs (run 44525771213, branch `long1-20261119`) each read two rows of
  `amelia_long1_runs`: `start-cNN`, and `inputs-cNN` (8–9 MB of JSON each), within about a minute of each other.
- Eight jobs got HTTP 500 on these reads through six retries, the last at about 12:47 UTC, and stopped. Four completed.
- They then wrote their result rows (`desire2-cNN-ARM`, about 1–2 MB each) at about 13:23–13:35 UTC.
- The analysis job read all `desire2-c*` rows at 13:35 UTC.
- Nothing else in her database was read or written by these jobs.

**Why it matters.** The same database serves her live record. In WT-3L (14 Nov) concurrent large scratch saves cancelled
her 01:20 tick, and these reads may have competed with her ticks in the same way.

## What we ask
1. **Her ticks, 12:35–13:40 UTC today.** Did any tick fail, time out, run late or save partially? Please check her tick
   log and her record's revisions across that window. If any did, what was lost, and is her record whole?
2. **Database errors in that window.** Statement timeouts, connection limits, or anything logged against
   `amelia_long1_runs`.
3. **Safe pacing for the re-run.** DESIRE-2 Amendment 1 (`experiments/live-amelia/desire2/AMENDMENT_1.md`) re-runs the 8
   missing copies with their reads at least 2 minutes apart, one job at a time. Is that safe for her? If her ticks fire at
   fixed minutes, which minutes should the reads avoid? If 2 minutes is not enough, what spacing is?
4. **LONG-1 later.** LONG-1 will read the same rows for 12 copies the same way. We will use whatever pacing you give
   here.

**Until you reply**, nothing from the research session reads or writes her database. The amendment's run trigger is not
committed.
