# PF-1 — Pre-live engineering gate register (20 October 2026)

**Status: NO LIVE START. Operator review required before a future genesis.**  
**Scientific constants:** PF1-A1 R2 SHA-256 `ecabf3e40023faa0be0749908cfe6ffd3a8b9e42ab7c8a9a7c2ea5827ae63610` (unchanged).  
**Current runtime:** pinned `IntegratedMemorySystem`; future cumulative-memory lineage needs a registered Rung 2 habit-dissociating criterion.  
**Baseline registration:** [PF1_LIVE_START_REGISTRATION_DRAFT.md](PF1_LIVE_START_REGISTRATION_DRAFT.md).

## Preserved scientific controls

The original PF1-A1 R2 10,000-step re-pilot passed 7/7 *seed-independent* constructed positive controls and the specified fixed memoryless policies. Its descriptive Amelia trajectory produced zero encounters. Two separate habit controls MUST accompany every registration or eventual report:

1. **Cumulative tanh `ProcessFieldMemory`: NO-GO.** [Run #39422348466](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39422348466), [artifact #12264830788](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39422348466/artifacts/12264830788). Three false-positive **8–9 Ummnu** encounters: steps 3852 (intact 3 vs reset 1), 8172 (3 vs 0), 9132 (3 vs 1); all goal+memory, none integration.
2. **Actual `IntegratedMemorySystem` runtime law: PASS within scope.** [Run #39423532378](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39423532378), zero encounters (39 goal-only passes). Actual canonical `ameliaNumogramSubstrateRuntime.ts` imports this class; review specification, not repository, had confused it with the tanh class.

## Deployment audits

| Gate | Evidence | What passed | What remains open |
|---|---|---|---|
| 1. C1 beacon identity/cadence | [C1 offline BLS/cadence #39459914775](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39459914775); [artifact](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39459914775/artifacts/12281827906) | **Actual pinned C1 source** verified genuine archived BLS round 1,000,000 under original quicknet key; rejected five invalid inputs; source `R0+20*t` at 60-second intervals; no HTTP/beacon admission | Integrate this *exact* verifier, cadence and live-mode separation into PF1's production pipeline; an offline isolated KAT is not a deployed adapter |
| 2. Persistent nine-arm state / concurrency | [Nine-arm synthetic #39426135510](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39426135510); [C1 race #39460285743](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39460285743); [PF1 candidate safe lease #39460790104](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39460790104) | 72 input rounds across nine independent stored PFM arms, byte-identical CLI replay; prospective new PF1 **single-push, fail-closed lease** had 1/1 winner per trial in six isolated Git races | **CRITICAL:** old pinned C1 lease permitted **two** outstanding leases in **all six** race trials. Do NOT reuse it. Prospective repair still needs independent review, integration, actual overlapping GitHub workflow test, durable state push and orphan-recovery plan |
| 3. Future fork scheduling | [Seven-check rehearsal #39426135510](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39426135510) | Exact L₂ input queue; unavailable 24th future round rejected; primary state and history untouched; neutral sham parity | Production persistent queue for pending 24-minute confirmation windows, commit/restart recovery and exactly-once consumption |
| 4. Eight references and main arm | Same synthetic rehearsal | Nine carried-memory arms, nine distinct synthetic keyed streams | Freeze and test source-derived C1 transformed-tape/domain rules for PF1; current rehearsal uses PF1 test-only HMAC domains, not verified production C1 KDF identity |
| 5. Journal and silent exposure | Same synthetic rehearsal | Zero-event ledger, separate synthetic test journal, duplicate test entry/notification suppressed across processes | Production append-only hash chain with receipt binding and per-encounter timestamp across GitHub runs |
| 6. Cryptographic fail-closed admission | C1 offline KAT + synthetic FreeTSA rehearsal | Real archived C1 BLS verified offline; corrupted round/randomness/signature rejected; mock corruption/ledger tampering rejected; real FreeTSA receipt checked against pinned root | Bind C1 verifier and RFC3161 to **actual PF1 intake and encounter pipeline** with strict source/identity checks; no online/live intake authorised |
| 7. Complete replay, incident recovery | Seven-check synthetic rehearsal | Byte-identical serial process replay, duplicate synthetic fixture rejection | Actual hosted concurrent running, lease contention, push conflicts, interrupted fork jobs and independent replay on archived production-formatted artifacts |

## Two independent lease findings, never merge them

**Unsafe original C1 lease, preserved NO-GO:** [machine-readable six-trial evidence](c1-compat-output/C1_GIT_LEASE_RACE.json); [incident report](PF1_DEPLOY_INCIDENT_001_C1_LEASE_RACE.md). All six local Git simulations produced 2 acknowledged acquisitions and 2 durable outstanding leases. C1 retry rebased an old claim onto a branch that already carried a different unresolved lease, without rechecking admission.

**Proposed PF1-specific fail-closed replacement, LOCAL SYNTHETIC PASS:** [PF1_SAFE_LEASE.py](PF1_SAFE_LEASE.py); [six-trial evidence](c1-compat-output/PF1_SAFE_GIT_LEASE_RACE.json); [artifact](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39460790104/artifacts/12281883754). All six races had **exactly one** acknowledged claimant and **exactly one** outstanding lease. It never rebases a prepared stale lease, never permits admission before acknowledged push and verifies the remote branch's exclusive active claim.

The repair is not an amendment to C1's pinned source, nor a scientific constant change. The local test does **not** certify actual GitHub runner concurrency. Neither script has been activated for PF1 live ingestion.

## Source provenance and immutable boundaries

- PF1 canonical unchanged substrate: `b67ec92e1cec13e9500d87292d59605428fb467e`.
- C1 operational source: `adrianjohnsaker-wq/Amelia-0.4`, branch `amelia-1.0`, pinned `f1875b5eea5339eb1ac73e50b5df6b103d0cabe9`.
- C1 quicknet chain hash: `52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971`; scheme `bls-unchained-g1-rfc9380`, 3-second periods, stride 20, effective 60-second acquisition schedule.
- The C1 source's genesis selects a future `R0` aligned to a 20-round boundary and at least 600 seconds after a prospective creation time. **No PF1 genesis time or `R0` has been selected, registered or sealed.**
- All current test records derive from synthetic tapes, mocked inflow or a **previously archived cryptographic known-answer used for offline verifier testing only**. No live drand round was admitted into Amelia, and no scientific data changed the sealed criteria.

## Forward disposition

**Engineering blockers remaining:** production-integrated exclusive lease and durable reconciliation, true cross-run contention test, production queued fork confirmations and encounter sealing, and independently reviewed complete prospective genesis source/domain manifest. Offline BLS and C1 cadence verification are complete; they are not live permission.

**LIVE START UNAUTHORISED. No genesis manifest signed or activated. No automatic scientific threshold adjustments.**
