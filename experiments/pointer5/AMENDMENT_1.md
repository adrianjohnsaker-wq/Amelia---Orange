# THE POINTER V, amendment 1: the interval helper in log space (12 November 2026, before any result was seen)

**What happened.** The first scoring run (GitHub Actions run 43167655278, 06:22 UTC) stopped with `OverflowError: int too large
to convert to float`. It failed in `cp_interval`, the helper that reports each condition's exact 95% interval. That helper is
called before each condition's line is printed, so the run stopped before any hit rate or test result was printed or committed.
**No result was seen.**

**Why.** `score.py` was copied from THE POINTER IV's `score.py` as it stood before THE POINTER IV's own amendment 1
(commit `54728c12`, 29 Oct 2026). That amendment fixed exactly this overflow at n = 3,600, and that amended file is what scored
THE POINTER IV.

**The amendment.** `score_a1.py` is THE POINTER IV's amended `score.py` (`54728c12`), with only the names and the discovery
worlds changed, as in `score.py`.
- **What changes.** The interval helper computes binomial probabilities in log space.
- **What does not.** The decision tests are exact and unchanged (binomial tails with `Fraction`, and the paired sign tests). So
  are the answers, the targets, the rule and the seal.
- **The check.** It reproduces THE POINTER IV's reported interval for 383 of 3,600 ([0.0965, 0.1169]).

**How it is run.** `.github/workflows/pointer5-score-a1.yml` (triggered by `score_a1.trigger`):
- verifies the RFC 3161 seal and that every sealed source is unchanged;
- fetches and BLS-verifies the same target rounds with the sealed `targets.py`;
- scores with `score_a1.py`.

The sealed `score.py` and the sealed workflow are left as they were.
