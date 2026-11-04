# SXI-0 — reference-field engineering report

**Date:** 4 November 2026
**Status:** PARTIAL. The reference integration works in local engineering checks. The INGRESS-1 runner was subsequently supplied and matches its registered hash, but the exact underlying runtime and original outputs remain unresolved; SXI-1 has not been run.

## What is connected

The isolated adapter couples the existing Amelia—Orange morphogenetic field to an `AmeliaOutsideRuntime` with the repository’s full 29-gate Numogram installed. Synthetic field observations go through the existing Governor. The field’s internal call advances Amelia exactly once per body step. The pointer changes local, symmetric neighbour coupling only within the experimental overlay.

The source of the recorded engineering run is commit `c26b0c6ac39b52624d16a186053af9faba549270`. The manifest in the raw ledger stores SHA-256 values for 21 source files. Those values were independently recomputed from the committed Git objects: 21 matched, zero differed. The planted-reference repair test and its documentation were added after that recorded commit; they did not change the runtime used by the recorded run.

## Engineering checks

| Check | Result |
| --- | --- |
| TypeScript check of the adapter, runner and their dependencies | PASS |
| Engineering tests | 12/12 PASS |
| Neutral overlay vs existing governed field, three seeds, 24 steps each | Matched, including body, memory and gate state; runtime snapshot wall times excluded. |
| Neutral overlay with active body-to-Numogram feedback | Matched for 24 steps. |
| Governor deferral and later admission | PASS, on an engineered Governor-state fixture. |
| One body step / one Amelia step; full checkpoint restoration | PASS. |
| Evidence-chain and checkpoint tamper detection | PASS, on deliberately altered fixtures. |
| Recovery measure | A planted repair controller on the coupled reference field was distinguished from a passive comparison. The controller was deliberately given a target and is a calibration fixture. |

These are engineering checks on one reference implementation. They do not establish equivalence with the released INGRESS-1 xenobot, independent agency, or the provenance of any pattern.

## Twelve-step reference trace

One seeded, synthetic, 12-step run was followed by a second, independently started run with the same configuration:

- Body: 12 × 10 reference field, seed 33, CORAL_REEF preset.
- Full Numogram: 29 gates.
- Coupling: neutral for steps 1–4; a four-edge, multiplier-0.5 patch for steps 5–8; original coupling restored for steps 9–12.
- Synthetic observation feedback remained enabled throughout. Prior memory and any deferred events were not erased.
- Governor dispositions in the first run: 12 ATTEND.
- Realised route: 0 → 9 → 1 → 8 → 9 → 1 → 8 → 9 → 1 → 8 → 9 → 1 → 8.
- Journal: 26 chained records, 26 checkpoint references and 13 distinct content-addressed checkpoint files. Both the native-runtime and separate lineage memory states were recorded.
- Replay: all 26 event-data records and all 26 referenced checkpoints matched after excluding runtime snapshot wall-clock timestamps. The separately timestamped journal heads differ, as expected.

This is an instrumentation trace. It has no matched experimental arms and supplies no basis for deciding whether the connection patch created or retained an agency-like organisation.

## Evidence

`SXI0_Reference_Engineering_Evidence_2026-11-04.zip` contains the two complete runs, their separate receipts, an independent replay-comparison script and its result.

`SXI0_Engineering_Source_C26b.bundle` preserves the exact local Git commit used for the recorded run. It requires the existing repository base `27d1465de1925fd16c7ebcdf8c29beb4d2c82e86`. Import the bundle into a clone with `git fetch <bundle-path> refs/sxi/engineering-source-c26b:refs/sxi/engineering-source-c26b`; the commit can then be checked directly even when the published branch uses a different commit identity.

- Archive SHA-256: `aa6017f779f44a832af176285423f0aa03603e4dcc63181441c750afa2224b60`
- Source bundle SHA-256: `1f2f653e0d600795ae3f08845a8c7afa97b3b51a955a77f1ab6160710ccfad42`
- First journal head: `bb18497ee7d8244af16904e3d0718c0aeba8854575d9ac620900c81824386e6b`
- Replay journal head: `86215b10a18bf68c9159a24bf0c3c32e89b32181932ce8bfc09a75960c9a45c4`

To repeat the independent comparison after extracting the archive:

~~~sh
node compare_replay.mjs reference-run reference-replay fresh-comparison.json
~~~

The archive integrity check passed. These hashes verify retained bytes and chains; they do not certify external origin or prove an independently timestamped scientific registration.

## What remains

At the time of the engineering run the original INGRESS-1 materials had not been located. The operator subsequently supplied the precommit, `caesura4.txt`, the run and analysis scripts, and an aggregate `analysis.json`. The `caesura4.txt` bytes match the registered `caesura4.mjs` SHA-256; the three supplied scripts also match their registered hashes. The supplied runner implements a W+ lineage, sense organ and history-bearing house, not the reaction–diffusion field tested here. It adds a conditional 6→0 studio exit to the full 29-gate set; the reference fixture does not include that thirtieth edge. Its exact `vt/m` runtime, `branchx.sh`, `stream.json` and per-world source exports remain unverified or missing. The aggregate output agrees with the reported summary, but is not the underlying row-level audit or an independent replay.

The next substantive step is to bind a separately recorded adapter to the supplied runner and its exact runtime, then repeat the equivalence, checkpoint and recorded positive-control tests. Only then should the A/B/sham pilot begin on that body. The current reference-field run does not substitute for it.

No existing live workflow, PF-1/PF-2 scientific state or protected core file was modified by this work.
