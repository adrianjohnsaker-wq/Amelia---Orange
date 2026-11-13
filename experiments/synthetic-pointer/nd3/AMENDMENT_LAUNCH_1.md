# Launch amendment 1 for ND-3 (13 November 2026, before any ND-3 data or result)

**Why, before ND-3 runs.** The SXI-1R world run (Actions run 43362776343, 13 Nov 04:01 UTC) failed with `Cannot find
package 'tsx'`. ND-3's sealed workflow has the identical install line and would fail the same way at its run (17 Nov).
ND-3 has not run; no result exists.

**Cause.** The sealed workflows install tsx in `/tmp/tsx`. tsx uses `$TMPDIR/tsx` (default `/tmp/tsx`) as its own cache
directory and clears it, deleting the installed package. This is the launcher fault already found and fixed for AG-1 and
RC-2 (amendment A1). 

**The amendment (launcher only).** A new workflow, `.github/workflows/nd3-launch-a1.yml`, runs ND-3's sealed run branch
**unchanged**, with one difference: `TMPDIR` is set to the runner's temporary directory, so tsx no longer clears its
own install. Before running, it verifies ND-3's RFC 3161 seal and that every sealed source is unchanged, exactly as the
sealed workflow does.

**Unchanged:** the registrations, code, calibration, alpha, the world data rule (the first 12,000 world-stream data first
seen after the seal: a fixed set, so no choice of data enters), the analysis, the equivalence and gate checks, and the
decision rules. The sealed workflow files are not edited.

**Trigger.** `experiments/synthetic-pointer/nd3/run_a1.trigger` (use it instead of `run.trigger`).
