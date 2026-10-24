# PF4 G3f/G3g — ten historical Quicknet windows: source feasibility result
**24 October 2026.** Design-stage read-only proof. **Sampling PASS; ten full 14-day historical-world residuals NOT YET COMPUTED.** No PF4 seal, no future target, no PF1/PF2/C1 mutation.

## Authenticity sample: PASS, 30 genuine historical beacon receipts

- [GitHub Actions run 40114750711](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/40114750711) **success**. Source \`experiments/pf4/PF4_G3F_HISTORICAL_QUICKNET_SAMPLE.py\`; derived artifact ID \`12567654098\`.
- Uses **pinned** independent C1/PF1 verifier from \`adrianjohnsaker-wq/Amelia-0.4@f1875b5eea5339eb1ac73e50b5df6b103d0cabe9\`, including an independently checked known-answer Quicknet BLS public-key test, full signature validation of each round, and SHA256(signature)==randomness.
- Exactly ten fully preselected, non-overlapping 20160-tick physical source-world schedules, source interval **2026-06-01 00:00:24 through 2026-10-18 23:59:24 UTC**.
- **30 individually BLS-verified Quicknet rounds**, one at first, midpoint and last of each historical world. Each is already published. Authentication/key/round chronology **feasible**.
- Required to complete G3: **201600 distinct verified physical Quicknet rounds**, nine-lineage domain mapping and **10 independently initialised pairwise Vstar versus shift1 20160-tick full receiver histories** (not yet completed). Neither 30 samples nor 1731-tick cue preflight supplies a whole-world R_mean.

## Bounded resumable full-source acquisition: engineering pilot PASS

- Script \`experiments/pf4/PF4_G3G_HISTORICAL_BLS_CHUNK.py\` defines deterministic acquisition of **170 individually SHA-bound chunks** (10 worlds × 17 chunks per world). Chunks are **1200 sampled minutes** each except the final **960** per world; output is new artifact, with precise start/stop round and per-round BLS receipt/signature.
- Independent [GitHub Actions run 40115143743](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/40115143743) **success**. Its default \`push\` mode fetched a **30-record pilot only**, marked **\`PILOT_PARTIAL_NOT_ADMISSIBLE\`** to prevent accidental inclusion in full-world scientific inference. Artifact ID \`12567149475\`.
- Pilot world index 0, chunk 0: first round \`29156220\`, last \`29156800\`, 30 BLS receipts, file SHA-256 \`d0f0dcf2356159ca1523af13467900b1a58f941c3f954217b430ed693b3e45b1\`. These first 30 samples necessarily overlap the 30-world checkpoint source only at the first round; never count them as independent sources.
- Manual GitHub workflow dispatch accepts \`window\` 0..9, \`chunk\` 0..16 for a **full** authenticated chunk, but the full 170-chunk archival download/reconstruction is **not done and cannot be declared PASS** until every chunk has been acquired, verified, assembled in strict chronological order and its source digests archived. Full runs may be I/O and BLS expensive, and should be rate-limited against public relay capacity, chunked/retried transparently, and recorded with full cost/provenance.
- Chunks must be assembled only after checking exact missing/overlap-free partition coverage, every expected round, chain hash, timestamp before current date and byte SHA. Never interpolate missing rounds, replace with synthetic values, silently shift a window or use PF2 lease.

## Provisional primary scheduling choice (NOT SEALED)

[Window schedule draft](./PF4_G3_HISTORICAL_AND_PROSPECTIVE_WINDOW_DRAFT_2026-10-24.md):

Four 14-day consecutive 20160-tick prospective source windows proposed from **2026-11-23 00:00:24 UTC** (first round \`34196220\`) through **2027-01-17 23:59:24 UTC** (last round \`35809000\`). Proposed extra future timelock opening round \`35810220\` ~**2027-01-18 01:00:24 UTC**, after a one-hour margin. Do not fetch or commit a live source yet.

This start is conditional on **G3 complete-source comparability**, independent approval/timestamp of the statistical analysis, and confirmation that PF2 has attained its **43200 admitted-tick** day-30 boundary after the stated 2026-11-21 assessment. If prerequisites fail, do not silently slide the start. Make a written new-date amendment **before any target becomes available**.

**Inscription arm remains a separately registered future PF4-I phase**, to avoid multiplying the first assay's arm family. The decision to offer such a later phase is registered on this design branch before the primary assay; its launch must not be conditioned on observing success in the primary assay.

## Evidence interpretation and stop condition

30 verified historical rounds and an executable chunk grid make collection *feasible*, not *completed*. They do not demonstrate equivalence to the synthetic null, access to the future, or temporal causal influence. Ten full historical worlds would themselves yield only **ten independent source-world residual observations**, insufficient alone to establish 1% tail validity or genuine equality of the physical and synthetic score distributions. Require explicit finite-sample uncertainty and no negative-evidence suppression.

**NO FULL HISTORICAL-SOURCE R_MEAN RESULTS YET. G3 PHYSICAL NULL OPEN. PF4 REGISTRATION NOT AUTHORISED.**
