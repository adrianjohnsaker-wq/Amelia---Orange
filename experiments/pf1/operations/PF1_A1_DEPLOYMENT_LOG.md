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

## Second live A1 dispatch — PRELEASE INSTALL FAILURE (zero admission)
[GitHub Actions 39584195317](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39584195317), 2026-10-21 10:23 UTC: A1 source identity and due checks PASS; npm installer `npm ci` exited EUSAGE because this repository does not contain an existing `package-lock.json` (or npm-shrinkwrap). **No exclusive lease was attempted, no BLS intake occurred, no new PF1 ticks admitted.** The original no-lockfile design uses `npm install` but can write an untracked lockfile, so the approved operational prelease should instead install with `npm install --no-save --package-lock=false --no-audit --no-fund`, then enforce `git status --porcelain` empty. Change is to operational workflow only; do not alter package files or scientific pins. A fresh synthetic/toolchain cleanliness preflight must pass before another live workflow activation.

## A1 first full live dispatch closed — PASS
- Run 39584712702 completed successfully, 2026-10-21 10:38:47 UTC. Exclusive lease 39584712702-1 fully completed, commit f8698cf55596f38e806a49f72092a4c75d465b17.
- 24 batches of 20 genuinely published, C1-pinned BLS-verified quicknet rounds; 480 admitted, original 40 -> 520 total. Last batch commit 566a4144ecc4dd3d660e9bbf597c0922402cbf3e. Last round 33255240; ledger head 035a251216a37f37c59ea7bb8284ba22cf328e14b9ea23dc7c35d1b678b9f3ac.
- In-run post-seal verifier: exact nine-arm PFM count, journal seals, hash chain PASS. Unsealed journals=0; notifications=0; C1Changed=false. At end there were 167 eligible published ticks still awaiting admission: dispatch hit the preapproved cap; do not describe it as caught up.
- Subsequent A1 loop and unchanged PF1_LIVE_INTAKE.py compute the next round from durable admittedTicks and only select records at or before current_round(now-3), requiring exact round R0+20*t and full BLS validation. This is an enforced input-selection invariant; actual post-catch-up zero-backlog dispatch has not yet been observed. Existing opportunistic five-minute cron may lag.
- P1 R02 first prospective absorption at step 159 separately recorded from the authoritative read-only 520-tick audit; no forecast change.
