# SXI-0: synthetic-pointer engineering reference

**Status: engineering and exploratory control checks; no SXI-1 discovery or agency result.** The reference-field adapter connects an Amelia—Orange morphogenetic field to the Governor and full 29-gate Numogram. The separately instrumented W+ runner uses the verified INGRESS-1 runtime, its full Numogram and the conditional Plex exit. Matched-control checks and independent recalculation of INGRESS-1 are now recorded below.

## Scope and identity gate

The operator supplied the hash-matching INGRESS-1 runner, its `vt/m` runtime and the season exports. The runner defines a W+ lineage, sense organ and history-bearing house, rather than the two-dimensional reaction–diffusion reference field. All eight supplied runtime files match `experiments/studio/runtime_mirror` byte for byte; the W+ check was already bound to that mirror. Recalculation from 224 supplied season files reproduces the registered conclusions, but not byte-identical floating-point output. The original branching helper and source stream were not supplied, so this is not an independent replay of the historical simulation. See [the handoff verification](INGRESS1_Handoff_Verification_2026-11-04.md).

The selected reference is `src/substrate/AmeliaMorphogeneticSubstrate.ts`. The full Numogram is installed through the existing `withFullNumogram()` public-state adapter. The supplied INGRESS-1 runner additionally defines a conditional studio exit from 6 to 0, making its declared set 30 edges; the reference fixture has 29 and does not implement that extra exit. Existing PF-1/PF-2 protected substrate, Governor and Numogram implementation files are not edited. The only existing source edit extends the non-frozen `OutsideChannel` type with the truthful value `SYNTHETIC_FIELD`. No existing Outside stream, live state or workflow is modified.

## Components

- `observer.ts` measures mean B activation across ten fixed vertical bands, records the raw values and, if the total exceeds a tolerance, creates a normalised synthetic observation. Zero activation produces no observation.
- `SyntheticQueueRuntime` submits at most one field observation to the existing `AmeliaOutsideRuntime` at the **one** runtime step already invoked by the morphogenetic field. The existing Governor and its defer queue remain authoritative.
- `pointer.ts` provides an experimental, symmetric weighted-neighbour overlay. A selected neighbouring edge’s multiplier is bounded to [0,1]. Invalid or duplicate edges fail before advancing the runtime. The unchanged field is used for the neutral fast path; a separate reconstructed neutral path is tested against it.
- `coordinator.ts` records the pre-step body, memory and input; executes one body/runtime step; independently reconstructs the realised gate score from the actual evolved gates, zones, memory and attended vector; and records the post-step state. A scoring disagreement halts the run.
- `ledger.ts` uses exclusive run directories, canonical JSON, per-checkpoint SHA-256, a chained append-only journal and fsync. It can verify records and checkpoints against an externally retained chain head. A partial step is not marked complete. The code does not implement automatic crash recovery or claim independently authenticated timestamps.
- `recovery.ts` is a descriptive, offline Euclidean recovery measure. It does not steer the system. A numerical fixture and a deliberately planted repair controller on the coupled reference field are controls, not evidence of agency in Amelia.
- `sxi0.test.ts` tests the integration on isolated fixtures.
- `run-engineering.ts` makes a 12-step synthetic engineering receipt, with four neutral steps, four steps of bounded coupling change and four steps after restoration. It keeps the synthetic observation loop enabled after restoration and records that fact; it is not a withdrawal of all prior inputs or memory.
- `build_wplus_overlay.py` builds a separate W+ experimental overlay only from the operator-supplied, hash-matching INGRESS-1 runner. `verify_wplus_trace.mjs` checks every recorded transition, available-gate score, supplemental memory chain and season-end state; `compare_wplus_traces.mjs` compares matched synthetic traces. The Studio mirror used in that check now matches the supplied historical `vt/m` runtime. W+ pointer interventions are externally scheduled and not Governor-gated in these isolated engineering checks; Governor records are substrate audits only.
- `make_wplus_control_schedules.py` creates sham, ordered, reordered and rapidly mixed schedules. `build_wplus_scheduled_overlay.py` measures the consequences of equal scheduled coupling. `build_wplus_exposure_overlay.py` implements a separate equal-realised-score-dose control. The latter deliberately selects an available gate and adjusts its score; this is an imposed intervention, not an independently discovered organisation. Their respective verifiers reconstruct transitions, memory events, gate scores, samples and actual dose. See [the matched-control engineering report](WPlus_Matched_Control_Engineering_2026-11-04.md).
- `verify_ingress1_handoff.py` validates all supplied handoff hashes and the complete runtime and season file sets, runs the registered analysis in a new directory, and compares all row fields and paired decisions with the supplied records.

Full checkpoints distinguish native runtime memory from the separate lineage memory and include their state, field cells, body parameters, pointer receipts, pending/deferred encounters and the runtime RNG schedule. Checkpoints can be restored for local replay. Full-body hashes are not the field’s short summary `stateDigest`. IEEE-754 negative zero is preserved by the checkpoint encoding.

## Run the engineering checks

From a checkout of this branch with the existing project development dependencies installed:

~~~sh
node --import tsx --test experiments/synthetic-pointer/sxi0.test.ts
~~~

To create a **new** engineering-only record outside the repository:

~~~sh
node --import tsx experiments/synthetic-pointer/run-engineering.ts /absolute/new/output-directory
~~~

The run requires its source files to be clean at a committed Git head, hashes the source files in its manifest, refuses an existing output directory and writes a separate receipt containing the ledger head. Preserve that receipt independently if a later audit needs to detect truncation. There is no network, live receiver, PF-1/PF-2 dispatch, or LLM in this runner.

A valid hash chain proves internal consistency of the retained bytes, not that an observation has an external origin or that omitted data never existed.

## Gates before SXI-1

1. **Done for the supplied handoff:** bind the runner to its exact `vt/m` bytes and independently recalculate the season exports. Recover the branching helper and original source stream only if a full independent historical simulation replay is required.
2. The new W+ neutral trace matches the original runner's season summary and end state byte for byte on a second fixture. Mid-season restart and full checkpoint/replay remain unverified.
3. Complete a recorded end-to-end positive control using an engineered repair-capable version of the verified body and matched passive controls. The current reference-field repair controller is a deliberately planted test fixture, not that verified-body test.
4. Define and validate pointer A, pointer B and spatially matched sham/control arrangements on the verified body.
5. Preregister the prospective holdout and thresholds only after exploratory calibration.

Do not present this reference-field receipt as SXI-1, a discovered pattern, proof of an outside entity, or a verification of INGRESS-1.
