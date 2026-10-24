# PF4 Gates 2 & 3 — Independent Published-Prefix Parity and Calibration Intake
**24 October 2026 · READ-ONLY engineering report · NOT a registration, NOT a sealed live result.**

## G2: independent reconstruction PASSED

- [GitHub Actions run 40082042690](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/40082042690) **SUCCESS** at branch tip \`a60ad9e14aa4d309214157059255f700f47976b0\`.
- Source: \`experiments/pf4/PF4_G2_ARCHIVED_PREFIX_PARITY.mjs\`, with 2026-10-24 published/admitted PF2 snapshot inherited from commit \`acfbfcca204bf133c670e5c09c8838b0563f4890\`. Source metadata is archived in \`pf4-g2-published-prefix-parity\` workflow artifact.
- 1,991 previously committed PF2 ticks, nine learner arms, 17,919 independent per-arm 32-byte Quicknet input transformations and 17,919 exact transition choices matched.
- All 197,109 intermediary inherited V float64 checks (\`1991×9×11\`) match a separately implemented Studio-mirror memory update against the frozen PF2 receiver replay, **at every tick**. The final nine \`V\` objects also compare exactly to the archived signed PF2 \`STATE.json\` snapshot. Six recorded learner deaths in that prefix.
- Every archived row is checked for \`SHA256(signature)==randomness\`, round continuity and prior/final digest head; the original PF2 engine independently replays \`armEvents\` at each tick. This **does not separately reverify the BLS proof itself or each RFC3161 certificate**; the previously established PF2 verifier and original signed chunk provenance remain the upstream trust boundary.
- No network call, no generation of future values, no scientific file or lease mutation. This is **engineering compatibility on a published prefix**, not a prospective retrocausal test.
- First workflow [40081967173](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/40081967173) FAILED due to TypeScript extensionless import handling before any assay data processing; revised workflow pins the established \`tsx@4.23.12\` loader. Both runs remain visible.

**Decision:** G2 retrospective adapter/parity condition **PASS** for the pinned published archive prefix. The operator's independently prepared 1,731-tick adapter *source and transcript package* has not been received/audited; do not equate this with validation of that still-unseen file.

## G3: schema and submission path READY; experimental calibration results NOT AVAILABLE

- [G3 intake/validation self-test run 40082211526](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/40082211526) **SUCCESS**. Script \`experiments/pf4/PF4_G3_NULL_PACKAGE_AUDIT.py\` enforces a specific **submitted package** contract and rejects duplicate null sources and any embedded future target scores.
- This run checks **only schema and fail-closed controls**. It does **not** run 400 actual worlds or claim a distribution, an exact p-value or null exchangeability. The user's separately running 400-world calibration and 1,731-tick adapter package are not committed to checked project sources as of this audit.
- The expected file \`PF4_G3_CALIBRATION_PACKAGE_V1\` has: literal primary C0 SHA-256 \`de0d86764a300abe5187b06a379be1beefed859942784d12cd6a672f81702925\`, candidate-specific adapter and runner SHA-256, 20,160 ticks/9 lineages, 400 uniquely identified hashed synthetic 32-byte source-worlds and their paired C0/lineage-shifted residuals, 100 blank-code residuals, independently validated already-published G2 parity record with matching adapter hash and any separately archived *full* 20,160-tick historical Quicknet reference worlds.
- No historical validation is possible from a 1,731- or 1,991-tick prefix alone: those are shorter than one 20,160-tick prospective world. A new read-only, historically verified source sample with full periods would have to be generated, with no future target admission. If no such sample is available, G3 historical compatibility gate remains **INCOMPLETE**, regardless of a successful 400-world synthetic simulation.
- Structural inspection returns min, 1%, 5%, median, 95%, max residual, paired comparison vs lineage-shifted code, and optional historical source observations. It never labels the rank p exact without exchangeability.

## What the 400 worlds can and cannot tell us

400 completed 32-byte synthetic null worlds provide a **model-based reference** under assumptions about the SHA-driven synthetic generator, Quicknet's pseudorandom unpredictability, source selection, and whole-window dependence. They do not automatically form an **exact randomisation distribution** for one realised physical Quicknet window. Nine arm transformations of one Quicknet source are one physical world. The natural minimum empirical rank score against 400 exchangeable nulls is \`1/401\`, but use an exact-test label ONLY with a demonstrably justified exchangeability/randomisation mechanism.

Future-world specificity requires a precommitted candidate C0, independent four-window targets *published after* a valid external timestamp, prechosen joint statistic and matching controls. The current PF4 source still lacks a sealed start round, verified Quicknet-vs-synthetic full-window comparison, independently time-stamped genesis or verified 400-world output package. **No PF4 registration or live residual inference has been performed.**

## Next source handoff

Provide the *completed* null and independent adapter package via the repo or attached archive, including literal source, raw generator labels/seeds, input adapter SHA, 400 outcomes, 100 zero-code outcomes, 1,731 published-tick bitwise-parity transcript, and exact results format. The G3 auditor can be run on a normalised copy *without altering the original*, and the original packaging/checksums should be preserved. Any mismatch is a failed gate to investigate, not an opportunity to retune the null statistic on a prospective target.

**Keep all work under this isolated analysis branch. Never change PF1, PF2, C1 or the original Studio04 signed/unsealed archive.**
