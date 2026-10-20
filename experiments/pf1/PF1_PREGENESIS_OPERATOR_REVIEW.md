# PF-1 Baseline — Pre-genesis operator review pack

**Prepared:** 20 October 2026  
**Status:** DRAFT ONLY. No genesis, no admitted live beacon rounds, no activation.  
**Scope:** Baseline of current frozen Amelia-Orange; NOT a developmental lineage.

## I. C1 Channel A read-only integrity audit — PASS

- Source: `adrianjohnsaker-wq/Amelia-0.4`, branch `amelia-1.0`, pinned checkout commit `f1875b5eea5339eb1ac73e50b5df6b103d0cabe9`.
- Audit: [Actions #39471040590](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39471040590); [full machine-readable audit](c1-compat-output/C1_CHANNEL_A_HEAD_AUDIT.json); [evidence artifact](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39471040590/artifacts/12288640953).
- Frozen genesis R0 `33158540`. **3,741** recorded ticks (0–3,740), 15 compressed hash-chained chunks.
- No lost ticks, duplicated ticks, reordered ticks or incorrectly mapped quicknet rounds.
- All recorded BLS inputs passed the pinned source verifier. Engine replay from genesis reproduced every recorded tick and every arm checkpoint exactly.
- **Recorded C1 chain-head SHA-256:** `88b1f97897428de31305e161abd5f6bf993b621fcf146ac0440aead944a5f21f`.
- Last recorded quicknet round `33233340`; next scheduled `33233360`.
- C1 frozen files **unchanged** (27 files verified); no new beacon rounds were admitted.
- This audit describes the **recorded chain as of the pinned checkout**, not an unbounded assertion about future C1 runs.

**IMPORTANT: C1 lease defect is distinct from recorded tick integrity.** Original C1 lease retry showed duplicate lease acquisition in six isolated Git races, reported as NO-GO. The defect has **not** been patched in Channel A's frozen C1 source. A separate PF-1-only fail-closed lease proposal passed local and hosted synthetic contention tests.

## II. Production-shaped archived-only synthetic integration — PASS

- Evidence: [Actions #39473152330](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39473152330), [integration report](PF1_PRODUCTION_SYNTHETIC_INTEGRATION_REPORT.md), [archive](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39473152330/artifacts/12288206415).
- Original C1 cryptographic verifier accepted **72 genuine previously archived** quicknet BLS signatures, rounds `33158540` through `33159960`, one every 20 rounds. These were archived fixtures, **not** newly obtained or admitted live PF-1 data.
- **Concurrent hosted admission:** two GitHub runners competed for an ephemeral synthetic lease; exactly one acknowledged acquisition and one rejection. Its first 12-step nine-arm checkpoint was committed together with the corresponding lease completion.
- **Recovery:** an intentionally unresolved synthetic lease blocked a further claimant. Documented manual reconciliation completed it **without changing the scientific checkpoint**. Separate hosted runs then continued the state to 48 and 72 steps.
- **Persistent fork confirmations:** synthetic-only fork fixture 1 prepared at step 12, confirmed after step 48; fixture 2 prepared at step 48, confirmed after step 72. Each consumed exactly 24 subsequently archived and verified round inputs.
- **Per-entry timestamp sealing:** two independently hash-chained **test fixture** entries, two genuine RFC 3161 FreeTSA tokens, both verified offline against the pinned CA. Neither is a scientific encounter.
- **Reproduction:** byte-equivalent deterministic 72-step replay for nine independent carried-memory runtime arms from the immutable archived signed input set.
- Ledger head SHA-256: `5b90f5b2bf87d23f2001636ffaee3c61e7d76cfcf592928239463adc7bdd3213`.
- Synthetic journal head SHA-256: `c014577c6f0294f197c425a2553e41fa63b4f5023a6d4761ee29423ac0f80794`.
- Every listed dry-run gate PASS. No PF-1 live genesis or live input.

These are **synthetic production-integration tests**, not approval of an unattended live service, its long-term liveness or every possible GitHub failure mode.

## III. Current scientific validity and limits

- Sealed experimental constants SHA-256: `ecabf3e40023faa0be0749908cfe6ffd3a8b9e42ab7c8a9a7c2ea5827ae63610`; unchanged.
- The canonical runtime imports `IntegratedMemorySystem` (not the separate cumulative tanh `ProcessFieldMemory` law).
- Runtime-law habit negative: [run #39423532378](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39423532378), **0 encounters**.
- Cumulative-tanh habit negative: [NO-GO run #39422348466](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39422348466), **three false-positive Ummnu encounters** at steps 3852 (intact 3 / reset 1), 8172 (3 / 0), 9132 (3 / 1). All goal+memory, none integration.
- Thus the existing PF1-A1 R2 rule is engineering-validated against the *current runtime-law* control, **not universally specific to minds**, and any cumulative-memory developmental lineage requires its own prospectively registered **Rung 2 habit-dissociating criterion before comparison**.

## IV. Genesis draft for approval, not activation

[PF1_GENESIS_MANIFEST_DRAFT.json](PF1_GENESIS_MANIFEST_DRAFT.json) lists the proposed cryptographic source, frozen substrate and null-curve identities, nine-arm layout, history policy, seal requirements, open incident rules and both negative-control interpretations.

The following **must remain unset** in a review draft:

- Future PF-1 genesis creation timestamp and initial quicknet round R0.
- Full final deployable code/tree hashes and initial nine-arm state digest, for separate prospective pinning.
- Any approved credentials, dispatch enablement or live start schedule.

**Operator action requested:** review the draft and evidence, approve or amend the genesis registration, then issue a **separate explicit authorisation** before generating an actual genesis or consuming any live rounds. An approval of these synthetic tests alone is not that authorisation.

**STATUS: NO GENESIS. NO LIVE ADMISSION.**
