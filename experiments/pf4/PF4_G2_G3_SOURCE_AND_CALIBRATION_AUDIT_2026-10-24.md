# PF4 G2/G3 — Independently audited published-input adapter and null-package contract
**Date: 2026-10-24. Status: G2 engineering PARITY PASS; G3 calibration DATA NOT RECEIVED.** No PF4 genesis, time-seal, unseen source read or prospective hypothesis test.

## G2: independent published-prefix parity

Evidence workflow: https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/40082306143

The separate \`experiments/pf4/PF4_G2_STUDIO_PREFIX_PARITY.mjs\` reads the **already signed and admitted** PF2 chunk archive of branch \`analysis/pf4-g2-g3-input-audit-20261024\`, whose source branch was pinned to \`acfbfcca204bf133c670e5c09c8838b0563f4890\`. It reconstructs the original input mapping in a function independent of \`pf2InputForArm\` and checks both agree. Runs its own 9 learner instances of the archived, hooked studio runtime, independently recomputes delayed 24-step refrain and terminal fatal-excursion penalties, and fails immediately if any recorded learner choice, cue, V at choice, settled credit, fatal excursion or output V differs.

**Result:** 1,991 already-published Quicknet ticks, 109 committed batches, **17,919** learner decisions, **99/99** final code values **exactly equal** to saved PF2 learner state, ending at drand round **33338540**. No PF1/PF2/C1 state was mutated. Uses already verified PF2 signed receipts and SHA256(signature)==randomness; it does **not** independently redo each BLS pairing or RFC3161 chain proof. Original live PF2 replay/audit handles those.

This PASS is independent replay of the **published** prefix, **not** evidence that the code knew future unpublished bytes. No supplied third-party adapter package or 1,731-step log has yet appeared in the repository, so this G2 result is the separate GitHub-side reconstruction, not certification of the external studio package.

## G3: required calibration package — absent as of this branch

For the completed 400-world simulation, submit a JSON file \`PF4_G3_CALIBRATION_EXPORT_V1.json\` (and its actual generator/adapter code + hashes, provenance manifest and logs). The strict independent auditor is \`experiments/pf4/PF4_G3_CALIBRATION_AUDITOR.py\`. It **rejects** incomplete data rather than manufacturing approximate numbers.

Schema and constraints:

\`\`\`json
{
  "schema":"PF4_G3_CALIBRATION_EXPORT_V1",
  "candidateCodeSha256":"de0d86764a300abe5187b06a379be1beefed859942784d12cd6a672f81702925",
  "source":{
    "kind":"PREDECLARED_SYNTHETIC_32_BYTE_UNIFORM_MODEL",
    "domainSeparation":"PF2-REF-i|",
    "ticksPerWorld":20160,
    "armsPerWorld":9,
    "disjointFromFutureTarget":true,
    "independentSeeds":true,
    "generatorSourceSha256":"<SHA256 OF ACTUAL GENERATOR FILE>",
    "adapterSourceSha256":"<SHA256 OF ACTUAL ADAPTER FILE>",
    "seedSelectionDeclaredBeforeCalibration":true
  },
  "worlds":[
    {
      "index":0,
      "worldId":"<REAL SOURCE WORLD ID>",
      "seedHex":"<64 LOWERCASE HEX>",
      "tapeSha256":"<64 LOWERCASE HEX>",
      "inputCount":20160,
      "R_all":{
        "C0":0.0,
        "lineage_shift":0.0,
        "blank":0.0
      }
    }
  ],
  "publishedHistoricalFullWindows":[]
}
\`\`\`

**All example values are placeholders, never calibration measurements.** Supply *exactly 400* synthetic worlds indexed 0..399, one unique seed and tape digest each, with predeclared C0 and lineage-shift control scores on all 400. The example first 100 worlds have a blank-code score as reported, the remaining 300 do not. If the actually completed simulation differs, disclose the real allocation and revise the *design-stage auditing contract before prospective seal*; never fabricate missing rows.

Every \`R_all\` must use the **unrounded 9×11 maximum absolute start/end V difference** after *20,160* signed-adapter-equivalent inputs. Provide 20,160 source-values per world or a preserved and re-generable seed/tape algorithm in the source package, not merely a summary histogram. Preserve the original generator version, seed-list determination date and all source hashes, and an actual independent reproduction recipe. SHA256 file metadata does not itself prove the score computation.

Run the audit with \`python3 experiments/pf4/PF4_G3_CALIBRATION_AUDITOR.py --input /tmp/PF4_G3_CALIBRATION_EXPORT_V1.json --out /tmp/pf4-g3\`. Reports empirical C0 quantiles, paired control comparisons and whether any *complete published* 20,160-tick windows permit historical compatibility testing. It never outputs a prospective p-value.

### The physical-vs-synthetic source gate

PF2 consumes a published Quicknet source round every 20 underlying 3-second rounds, domain-separated to nine input strings; the studio \`NS|k|tick\` strings are **not that same source mapping**. Source equivalence needs to be assessed on the **entire 20,160-tick outcome distribution**, including correlations, temporal dependence, gate/source admission rules, 9-arm common-source correlations, exact studio runtime and code.

At the independently audited prefix there were only **1,991 ticks**—fewer than 10% of one proposed full 14-day world—and no completed 20,160-tick historical PF2 world. Without sufficient published full-world data, G3's historical equivalence margin **cannot pass on PF2 alone**. Short prefix diagnostics can challenge blatant input/cue differences but cannot validate the null distribution of \`R_all\`. Nonrejection of e.g. a KS test does not show two distributions are equal; all exchangeability arguments are conditional on cryptographic and model assumptions.

### Next stage before PF4 can be sealed

- Commit/retrieve the *actual completed* 400-world package, compute source SHA hashes and rerun a predeclared subset of worlds from the real raw 32-byte source seeds for **bit-for-bit residual equality** against submitted outputs.
- Fix the pre-existing risk of calibration tuning: if worlds were generated or summarised under a different source mapping, disclose this and register a new independent G3; never recast the old numbers as the correct null.
- Predefine the exact physical-vs-synthetic reference distribution and any historical compatibility test. Without enough matched full-length published Quicknet data, keep the gate unresolved and explicitly state the cryptographic modelling assumption.
- Freeze one family-wise four-window statistic, candidate code/control scores, time-locked genesis, BLS receipt and record of any revisions, with independent timestamp before any future target publication.

**G2 confirms executable parity. G3 source package is pending. There is no supported residual percentile, live significance result, or evidence for physical retrocausality yet.**
