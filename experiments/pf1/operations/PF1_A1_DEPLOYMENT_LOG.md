# PF-1 A1 operational deployment log

## 2026-10-21 10:11:29 UTC — authorisation
Operator explicitly approved A1 catch-up with existing unchanged scientific scope and constraints. Approval identity: `PF1_A1_OPERATOR_APPROVAL_2026-10-21.md`.

## First predeployment rehearsal — FAIL (preserved)
Run [39583546876](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39583546876): frozen-genesis, pinned source hash and operator approval checks all **PASS**. Synthetic Git rehearsal failed at the FIRST simulated batch because `git("status", "--porcelain")` trimmed leading status spaces before parsing, causing a false `A1_UNEXPECTED_WORKTREE_MUTATION` on a legitimate modified ledger. **No live dispatch or source modification occurred.** Defect corrected in operational-only `experiments/pf1/operations/PF1_A1_CATCHUP.py`, commit `ae5fb6c17f358d62b3a64e383265843835d70ed6`. Need a fresh full rehearsal; first failure must not be erased.

## Deployment invariant
No activation of the amended live scheduler until PASS of frozen-byte hash identity and the actual disposable remote-Git test: durable batch-1 acknowledgement, simulated interrupted/uncommitted batch recovery, next batch without duplicate admission, and rejection of a competing pushed Git head. Live source pinned under genesis remains unmodified.

## Second full predeployment rehearsal — PASS (verified)
Run [39583690337](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39583690337): all pinned-source and approval identity gates PASS. Disposable *actual Git remote* rehearsal: first 20-tick batch durably pushed; uncommitted failure after 3 more synthetic ticks recovered to 20; second 20-tick batch committed to 40 with no duplicate ticks; concurrent remote movement rejected without stale-base rebase; C1, PF1 and canon unchanged. Signatures were **synthetic fixtures only** in this test, and no live BLS admission was performed. No A1 operational threshold or frozen scientific code change.

## First live A1 deployment dispatch — SAFE PRELEASE FAILURE

[GitHub Actions 39583999475](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39583999475), 2026-10-21 10:22 UTC: frozen scientific source audit PASS, but `PF1_SAFE_LEASE.acquire()` rejected a **dirty local working tree** before remotely acquiring any lease or reading live beacon inputs. Root cause: prelease `python -m py_compile` writes an untracked `__pycache__` file; `npm install` was also changed to `npm ci` to avoid manifest mutation. This is a deployment-process error, **NOT a scientific observation**. No PF1 admission, no remote PF1 lease, no change to C1 or canonical files. Operational workflow fixed by using non-writing `ast.parse` and asserting clean status before lease in commit `af08d6dfd17ddc0bcc5835a1943da44cacc57d10`. Failed run preserved, no retrospective deletion.
