# PF-1 LIVE — operational catch-up amendment A1 (proposal only)
  
**Prepared:** 2026-10-21. **STATUS: PROPOSED — NOT APPROVED — NOT DEPLOYED.**  
**Operator-approved evidence at diagnosis:** two real admissions (20 rounds each) despite a five-minute cron request, including the second completed at 2026-10-21 06:25 UTC, commit `7f3b6c3333be9c831a2c170b382c966dc0890390`. Reported backlog at 06:25 UTC approximately **6.6 hours**, increasing.

## 1. Cause and problem definition

The schedule *requests* dispatch every five minutes; GitHub-hosted cron is opportunistic and may be delayed or skipped. Each actual live dispatch admits at most 20 verified one-minute samples, limiting catch-up to 20 observation minutes per invocation. Neither faster wall-clock execution nor a five-minute cron file guarantees the effective intake cadence.

## 2. Proposal requiring explicit operator approval

Increase **catch-up capacity only**, not observation cadence or experimental dynamics:

- Keep the same genesis, C1-aligned 20-round stride, actual published drand quicknet receipts, per-round C1-pinned BLS verification, reference-domain mapping, nine separate carried memories, exact PF1-A1 R2 scanner, eligibility and sealed thresholds.
- In one remotely exclusive, authenticated PF1 lease, run sequential **batches of at most 20** admissible one-minute rounds. Bound an entire dispatch to **at most 480 verified rounds** and **at most 35 minutes**; stop early when caught up or with at least five minutes remaining in the job budget.
- After **each successful batch**, run existing identical integrity and seal gates, durably commit and push that completed batch with a lease and committed-head assertion. Never accept in-memory evidence as admission before push. No background or speculative ticks.
- Before each next batch, verify the continuation lease and authoritative current Git HEAD, derive next tick and published-round time from authoritative state. Preserve unadmitted rounds as pending; never skip missing rounds or pull future ones.
- On verification failure: fail closed; preserve last verified committed prefix and a distinct, dated incident; no automatic restart from a halted state.
- Allow no remote lease contention or stale-base rebase. Confirm full serialization against other PF1 execution; existing concurrency group unchanged. No writes to `Amelia-0.4` (C1).
- Keep silence policy: no email, chat, outbound notifications or unsealed journal posts. No changes to published PF1 registration, thresholds, scientific source hashes, arm definitions or P1 prediction.
- An operator-approved replay rehearsal on a synthetic snapshot (not live state) is required before the changed live workflow can be deployed.

## 3. Acceptance gates

1. **Byte-identity:** all files pinned by `GENESIS.json` and `PF1_GENESIS_MANIFEST_DRAFT.json` remain hash-identical.
2. **Inflow:** every admitted tick proves round identity, BLS verification and SHA256(signature)=randomness; continuity of the exact 20-round stride.
3. **History:** nine arms have the same admissible tick count and continuous carried PFM; no state reset.
4. **Recovery:** interrupted mid-dispatch resumes from last remotely confirmed committed prefix; zero duplicate admissions after replay.
5. **Evidence:** running admission/silent-ledger hash chain, sealed journal and pending fork integrity pass after each batch.
6. **Metrics:** expose UTC backlog (now minus latest due verified slot), admitted ticks per invocation, dropped/delayed dispatches (observed, not assumed), and moving/absorbed exposure.
7. **No science edit:** scientific results remain comparable across the amendment boundary. Preserve dated operational amendment marker in read-only reports.

## 4. Decision required

**APPROVE A1** or **REJECT A1**. Until explicitly approved, existing five-minute cron/20-round admission workflow is unchanged. This document is a proposal and cannot be interpreted as authorisation to edit or dispatch live code.
