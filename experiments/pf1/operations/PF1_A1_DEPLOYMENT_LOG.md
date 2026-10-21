# PF-1 A1 operational deployment log

## 2026-10-21 10:11:29 UTC — authorisation
Operator explicitly approved A1 catch-up with existing unchanged scientific scope and constraints. Approval identity: `PF1_A1_OPERATOR_APPROVAL_2026-10-21.md`.

## First predeployment rehearsal — FAIL (preserved)
Run [39583546876](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39583546876): frozen-genesis, pinned source hash and operator approval checks all **PASS**. Synthetic Git rehearsal failed at the FIRST simulated batch because `git("status", "--porcelain")` trimmed leading status spaces before parsing, causing a false `A1_UNEXPECTED_WORKTREE_MUTATION` on a legitimate modified ledger. **No live dispatch or source modification occurred.** Defect corrected in operational-only `experiments/pf1/operations/PF1_A1_CATCHUP.py`, commit `ae5fb6c17f358d62b3a64e383265843835d70ed6`. Need a fresh full rehearsal; first failure must not be erased.

## Deployment invariant
No activation of the amended live scheduler until PASS of frozen-byte hash identity and the actual disposable remote-Git test: durable batch-1 acknowledgement, simulated interrupted/uncommitted batch recovery, next batch without duplicate admission, and rejection of a competing pushed Git head. Live source pinned under genesis remains unmodified.
