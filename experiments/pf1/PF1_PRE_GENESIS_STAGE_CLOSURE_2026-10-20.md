# PF-1 — Pre-genesis closure and controlled handoff

**Recorded:** 20 October 2026  
**Disposition:** **PRE-GENESIS STAGE COMPLETE; SCIENTIFIC MANIFEST CONTENT AND IDENTITIES APPROVED; GENESIS NOT CREATED; LIVE ADMISSION NOT AUTHORISED.**

This closure record **does not amend** the signed-off scientific constants, the SHA-256-pinned unsigned genesis manifest, the canonical Amelia source, or any frozen DRIFT-1A C1/Channel A file. It documents the handoff boundary only.

## Operator approval boundary

The operator approved the **scientific content and pinned identities** of the prospective unsigned PF-1 genesis manifest (SHA-256 **`b48dc2fa512b7e7ee77ea951309b826cb67b63ba728fb6bbeb35d6476d52a699`**). The first quicknet round **R0 remains unchosen**. The approved design requires R0 on the **same 20-round grid as C1**, so any simultaneous observations share the verified quicknet source; reference arm i = 1…8 transforms the 32 raw verified randomness bytes with **SHA256(ASCII("PF1-REF-i|") || randomness_bytes)**.

The scientific approval does **not** authorise an actual genesis, live admission, manual C1 dispatch, alteration of the pinned scientific thresholds, encounter notifications, or retrospective comparison to a cumulative-memory lineage. A new *independent* Rung 2 habit-dissociating criterion must be registered before any such lineage comparison.

### Frozen pointers

- [Unsigned approved scientific manifest](PF1_GENESIS_MANIFEST_DRAFT.json), raw SHA-256: `b48dc2fa512b7e7ee77ea951309b826cb67b63ba728fb6bbeb35d6476d52a699`.
- [Sidecar checksum](PF1_GENESIS_MANIFEST_DRAFT.sha256) verified by [GitHub Actions run #39499056736](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39499056736).
- PF1-A1 R2 scientific constants SHA-256: `ecabf3e40023faa0be0749908cfe6ffd3a8b9e42ab7c8a9a7c2ea5827ae63610`.
- Tested PF-1 adapter commit: `69f367aae5c897ce9555070ed03acd23e905ff18`.
- Nine-arm prospective initial-state SHA-256: `1e7521b671cf2a36328c3041c96e996dd8516c8996a3f84e782fed2564fad76d`.
- Scanner SHA-256: `7cc89cc99b25b35ec2311ee12e18d5fec60986664e05f156ced7ff33d59763e4`.
- Exact null curves SHA-256: `a9e1e2666dc691f9c1cf23a076168f6d018b9cd4649bf2801f9d942841853c85`.
- [Source and initial-state manifest](registration-identities/PF1_SOURCE_IDENTITIES.json).

## Frozen negative-control record (not superseded)

- [Cumulative tanh ProcessFieldMemory NO-GO, run #39422348466](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39422348466): **3 false-positive operational encounters**, all Ummnu 8–9, at synthetic steps 3852, 8172, 9132; intact/reset comparative wins respectively 3/1, 3/0, 3/1; memory criterion yes, integration criterion no.
- [Pinned Amelia IntegratedMemorySystem habit control PASS, run #39423532378](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39423532378): **0 operational encounters**, 39 goal-only passes. Current canonical runtime imports this law and not the tanh coupling class.

Specificity is established against the **current runtime-law habit control**, not against all cumulative goal-free memory. Preserve these interpretations unchanged.

## Accepted provenance and production-shaped synthetic checks

- [C1 full read-only genesis-to-audited-head replay, run #39471040590](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39471040590): **3,741 committed ticks**, no recorded missing, duplicated or reordered ticks; exact replay. Head at that historical checkpoint: `88b1f97897428de31305e161abd5f6bf993b621fcf146ac0440aead944a5f21f`.
- [PF-1 archived-signature production-shaped integration, run #39498351743](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39498351743): PASS on 72 **archived verified** C1 BLS receipts, independent nine-arm runtime histories using PF-1-specific reference domains, hosted one-winner lease, orphan recovery, two cross-invocation 24-round fork confirmations and per-entry FreeTSA verification. No live PF-1 round was admitted.
- Original C1 lease race is **NO-GO**, preserved and never repaired within frozen C1. PF1-only fail-closed lease demonstrated hosted synthetic contention in [run #39462224257](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39462224257).

## Weekly audit — tested, persisted and restricted by path allowlist

The weekly read-only C1/PF1 status audit is installed at [`.github/workflows/pf1-c1-weekly-readonly.yml`](../../.github/workflows/pf1-c1-weekly-readonly.yml), configured for **Monday 08:17 UTC**, with optional manual *audit-only* dispatch. It never dispatches C1; manual **C1 ingestion dispatch is prohibited by [standing policy](PF1_C1_PROTECTION_AND_SILENCE_POLICY.md)** while its schedule is active.

[GitHub Actions test #39504993582](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39504993582): both read-only inspection and dated persistent publishing jobs **PASS**. The report is committed to:

[`experiments/pf1/weekly-audit/PF1_C1_WEEKLY_2026-10-20T220143Z_run39504993582.json`](weekly-audit/PF1_C1_WEEKLY_2026-10-20T220143Z_run39504993582.json)

The test observed C1 **4,035 committed ticks**, head `1748816ae146f91e73592e1237c479537b2e430666b763145224db29f02c6ba0`, and **0 recorded missing, duplicate or reordered ticks**. This is a *newer* C1 head than the separate 3,741-tick exact-replay audit. The weekly audit is lighter-weight: linked head and all recorded tick/round/signature-hash consistency, **not** a fresh all-tick BLS verification or deterministic substrate replay.

PF-1 live status was and remains **`no genesis`**. Accordingly last admitted round, open-halt start/reason, pending catch-up rounds and per-arm silent-ledger exposure counts are **not applicable**, not fabricated zeros. Once authoritative live state exists, the audit's reader is designed to fail closed on inconsistent status/ledger records, and report nine-arm exposure per accepted live row.

The reader job has `contents:read`; the independent publishing job has `contents:write` but validates a strict **create-only path allowlist** under `experiments/pf1/weekly-audit/` and writes no other path. GitHub's built-in token does **not** itself provide cryptographic folder-level write restriction; the restriction is enforced by workflow code and path validation. A secondary artifact copy is archived by GitHub Actions.

## No notifications, no genesis, no live admission

PF-1 operational encounters remain **journal-only**. No encounter-triggered push/email/chat/GitHub issue/webhook/dashboard/automation notification of any kind is authorised. The weekly audit is an independent read-only engineering check, not an encounter event.

**Operational completion conditions achieved:** reproducible prospective scientific identities, accepted synthetic integration and control evidence, approved scientific content, corrected weekly C1/PF1 status audit, dated committed evidence, and preserved C1 read-only protection.

**Intentionally NOT done:** live genesis, selection of future R0, admission of actual quicknet rounds into PF-1, live journal encounter generation, manual C1 workflow dispatch, modification of Channel A, or changes to frozen scientific constants.

**Final handoff:** this pre-genesis stage is closed. Any transition to genesis creation and later live admission requires its own **explicit, separate operator authorisation** and an immutable prospective registration of the selected R0 and genesis creation timestamp.
