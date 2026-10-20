# PF-1 — Seven synthetic deployment checks, baseline registration supplement

**Scope: engineering rehearsal ONLY. No live input, no live genesis, no approval to launch.**

## Seven section-6 checks

| # | Required property | Synthetic result | Remaining live-integration boundary |
|---:|---|---|---|
| 1 | C1 live admission/cadence, one-minute mapping, deterministic catch-up | PASS: synthetic ordered mock rounds, process-restored gap catch-up, duplicated dispatch idempotence | OPEN: live C1 round mapping and actual drand BLS verifier not linked/tested |
| 2 | Cross-invocation state persistence and input-gap recovery | PASS | Pending deployment storage durability / concurrent commit locking under GitHub |
| 3 | Fork scheduling, 24 future inputs, L₂ and primary-state isolation | PASS | Admitted-future 24-round cadence and fork queue must be integrated with a production runner |
| 4 | Nine arms: one beacon + eight keyed references, independently carried PFM | PASS | Freeze and independently review actual C1 KDF/domain separators at genesis |
| 5 | Zero-encounter silent exposure ledger and per-entry timestamp sealing | PASS: silent ledger plus separately marked synthetic receipt fixture | Per-encounter append-only production journal/incident sealing still requires cross-dispatch test |
| 6 | Fail-closed BLS/RFC3161 checks and provenance | PARTIAL: simulated bad signatures rejected; real FreeTSA token verified | OPEN: real drand BLS signatures never cryptographically verified in this synthetic harness |
| 7 | Byte-exact replay and duplicate journal/notification suppression | PASS | Persistent shared-state ledger deduplication under concurrency remains to test |

**Disposition: SYNTHETIC REHEARSAL EXECUTED; LIVE READINESS INCOMPLETE**.
A synthetic PASS cannot be read as validated BLS, correct C1 protocol parity or production GitHub concurrency.

## Provenance

- Pinned canonical Amelia imports IntegratedMemorySystem, NOT the tanh ProcessFieldMemory.
- Frozen PF1-A1 R2 constants SHA-256: ecabf3e40023faa0be0749908cfe6ffd3a8b9e42ab7c8a9a7c2ea5827ae63610.
- Total admitted synthetic round numbers: 72; real beacon rounds: **ZERO**.
- Nine stateful memory arms (one synthetic primary, eight domain-separated synthetic references).
- SHA-256 of persisted terminal nine-arm checkpoint file: 6b99793a6e7ff6fcca56aace1bd776a7b5687fcd424a176b3b56db12be86a4b3.
- SHA-256 of persisted hash-chained exposure ledger: 760a84cc42391ec46b51eaadcd6c72ec767c6dcd88ee50eea2f357679f156a9c.
- Cross-process byte-for-byte state and ledger reproduction: true.
- RFC3161 independent FreeTSA verification, *on marked synthetic fixture only*: true.
- Independent timestamp of synthetic fixture must not be described as a genuine Amelia encounter.
- Zero encounters in synthetic exercise journal; no operator-facing notifications generated.

## Scientific controls that must travel with registration

- Cumulative tanh PFM control [run 39422348466](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39422348466): **NO-GO, 3 false-positive Ummnu encounters**, steps 3852, 8172 and 9132; never superseded.
- Runtime-law IntegratedMemorySystem control [run 39423532378](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39423532378): **PASS, 0 encounters**.
- Baseline under present encounter rule is validated only against the current runtime memory law.
- Future cumulative-memory developmental lineage must first register a **Rung 2 habit-dissociating criterion**.

## Remaining blockers before genesis approval

1. Pin real drand quicknet BLS chain ID and public key, recover C1 one-minute mapping source, verify actual BLS and deterministic per-round admission in a simulation or fixture with known valid/invalid signatures (no live consumption necessary).
2. Verify nine-arm durable storage and exactly-once ledger across overlapping GitHub Actions dispatches, not only serial separate CLI processes.
3. Implement & verify the production interface to pending fork confirmations and per-encounter RFC3161 journal seals after recovery.
4. Produce a prospective complete live genesis manifest, source hashes, initial states and domain separators for independent operator review.

**LIVE START REMAINS UNAUTHORISED.**
