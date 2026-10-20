# PF1 production-shaped integration — archived BLS + durable hosted synthetic dispatch

**SYNTHETIC INTEGRATION PASS — NO LIVE START**

This test used genuine **previously archived** DRIFT-1A C1 Quicknet signatures for cryptographic verification and then replayed 72 such immutable receipts through nine isolated copies of the **unchanged** Amelia runtime. No current/live round was fetched or admitted. The archived signatures are fixtures, not PF1 baseline observations.

## Required evidence gates

| Gate | Result |
|---|---|
| archivedRealBlsSignaturesVerified | PASS |
| noLiveRoundAdmission | PASS |
| hostedConcurrentLeaseExactlyOne | PASS |
| leaseCommitAfterFirstIngest | PASS |
| orphanLeasePreventedAdmission | PASS |
| orphanRecoveryDidNotModifyScientificState | PASS |
| resumeLeaseAndPersistentCheckpoint | PASS |
| future24RoundConfirmationAcrossJobs | PASS |
| twoPerEntryRfc3161TokensVerifiedOffline | PASS |
| appendOnlyDigestAndIndependentReplay | PASS |
| unmodifiedA1ScientificConstants | PASS |

## 1. Verified C1 intake using archived real BLS

- Original C1 source commit: f1875b5eea5339eb1ac73e50b5df6b103d0cabe9.
- Verified archived signed Quicknet rounds: 72.
- First/last round: 33158540 / 33159960.
- Round-to-round stride: 20 quicknet rounds, 60 seconds.
- Verified record digest: 3518fcafe0c4b0f5669326ad8498d256a0ef6894e7b578520c36e0ffaa994349.
- Production-shaped intake rejects unverified provenance and operates on archived-only material. This is *not* validation of live PF1 network intake or an approved genesis.

## 2. GitHub-hosted lease completion, contention and incident recovery

- Two competing hosted workers: 2; acknowledged: 1; rejected: 1.
- Durable sole outstanding lease immediately after acquisition: 1.
- Acknowledged worker committed the first 12 tick checkpoints **and its lease completion together**.
- An isolated test lease was intentionally left open **without any ingestion**; the subsequent admission attempt was refused while it remained open.
- Manual synthetic recovery reconciled that abandoned claim without a checkpoint change. Before/after SHA-256: 9f8b689fba44991492e527ab4073b6432ac2d4cc41d1402c714b829949b0fc2a.
- Following that recovery, separate hosted jobs advanced the nine arms to ticks 48 and 72 under new remote-acknowledged leases.
- Replayed primary/auxiliary states are stored in the disposable Git branch and archived as an artifact.

## 3. Persistent pending fork confirmation and journal sealing

- Fixture #1 checkpoint tick 12, confirmation after tick 48.
- Fixture #2 checkpoint tick 48, confirmation after tick 72.
- Each required 24 subsequently admitted, archived-and-verified receipts. The delayed-input L₂ schedule was exercised without deleting or guessing an input.
- Both entries are explicitly **non-encounter integration test fixtures**; no scientific PF1 encounter has been added.
- Journal entries: 2; each independently hash-chained and stamped with a distinct RFC 3161 token.
- Offline verified FreeTSA receipts against pinned CA: 2.
- Ledger head: 5b90f5b2bf87d23f2001636ffaee3c61e7d76cfcf592928239463adc7bdd3213. Journal head: c014577c6f0294f197c425a2553e41fa63b4f5023a6d4761ee29423ac0f80794.
- Independently recomputed full 72-step, nine-arm replay across a fresh hosted checkout: true.

## Exposure and boundaries

- Stored nine-arm checkpoint SHA-256: 36458799dcad088d31ea40254e2af8b9dde1259e0276c94a193aaeabfbd8c9fb.
- Actual live rounds consumed: **ZERO**. Live genesis: **NONE**.
- Source constants SHA-256: ecabf3e40023faa0be0749908cfe6ffd3a8b9e42ab7c8a9a7c2ea5827ae63610.
- Original C1 frozen files were never modified. The repaired lease exists only in PF1.
- The separate full Channel A read-only audit must be judged from its **own** C1 genesis-to-head evidence.
- The cumulative-memory tanh NO-GO remains valid and unmodified; a future lineage requires independently registered Rung 2.

## Not established by this test

This does **not** prove indefinite hosted uptime, simultaneous multi-writer state finalisation under all delays, availability of a timestamp service, or the suitability of a live genesis. Deployment requires operator review of the complete prospective manifest, PF1 source hashes, incident rules, fork queue retention, nine-arm initial state and BLS chain source.

**Live start remains UNAUTHORISED. No live genesis or beacon rounds.**
