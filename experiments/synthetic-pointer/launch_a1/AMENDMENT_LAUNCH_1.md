# Launch amendment 1 for SXI-1R and NR-2 (13 November 2026, before any result of either study)

**What failed.** The SXI-1R world run (Actions run 43362776343, 13 Nov 04:01 UTC) stopped within its first node call:
`Cannot find package 'tsx'`. No fast run, analysis, ledgered run or gate step completed, and nothing was written to
`sxi1r/result/`. No result of the study exists.

**Cause.** The sealed workflows install tsx in `/tmp/tsx`. tsx uses `$TMPDIR/tsx` (default `/tmp/tsx`) as its own cache
directory and clears it, deleting the installed package. This is the launcher fault already found and fixed for AG-1 and
RC-2 (amendment A1). NR-2's sealed workflow has the same line and would fail the same way.

**The amendment (launcher only).** A new workflow, `.github/workflows/launch-a1.yml`, runs the sealed run branch of each
study **unchanged**, with one difference: `TMPDIR` is set to the runner's temporary directory, so tsx no longer clears its
own install. Before running, it verifies the study's RFC 3161 seal and that every sealed source is unchanged, exactly as the
sealed workflow does.

**Unchanged:** the registrations, code, calibration, alpha, the world data rule (the first 12,000 world-stream data first
seen after the seal: a fixed set, so no choice of data enters), the analysis, the equivalence and gate checks, and the
decision rules. The sealed workflow files are not edited.

**Triggers.** `experiments/synthetic-pointer/sxi1r/run_a1.trigger` and `experiments/synthetic-pointer/nr2/run_a1.trigger`.
