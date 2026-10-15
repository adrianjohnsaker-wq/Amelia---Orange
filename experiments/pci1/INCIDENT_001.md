# PCI-1 Incident 001 — Replay log capture path

**Run:** https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/38784127428

**Preregistration commit:** 6298e9f11b901d0bef42889f236f0519f37941f0

**Execution gate commit:** 1035f018d3ed9d7be4aaa03e33e569f699d9a6be

**Frozen registration SHA-256:** 23106c336c655c1c9965111d755bcef8760a18b2a933cf7e7efc563a8dca0d1d

## Observed result before workflow repair

The primary and replay runs both wrote complete results and independently reported
SUPPORTED (12 of 12 pair-level checks for each of P1–P5). Raw JSONL and verdict
JSON files compared byte-for-byte identical when recovered from the original artifact.
The primary raw outcome SHA-256 was
`a05e3fd8c50953d6121c553152aab3d3e9cbb6576de8e776052bd5e8f0d9f5ac`.

GitHub Actions marked the workflow unsuccessful because the second-run shell
pipeline attempted `tee pci1-results/replay/runner.log` **before** creating the
`pci1-results/replay/` directory. The `tsx` process itself still ran and wrote
all expected results. The error did not affect predictor computations.

## Authorized correction

Create `pci1-results/replay/` before invoking the second `tee`.
Do not change `registration.json`, `runPCI1ProspectiveCli.ts`, fixed
seed tapes, prediction thresholds or scoring logic. Re-execute every pair and
retain both original and corrected artifacts.

## Interpretation limits

This probe tests an engineered deterministic runtime. The twelve tapes
vary conditioning inputs but do not constitute independent stochastic replicates.
These results establish reproducible behavior of this software model, not a
generalized law of developmental intelligence.
