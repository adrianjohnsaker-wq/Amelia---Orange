# PF4 — G2/G3 evidence review, 24 October 2026 (before any seal)
**Status: G2 numerical parity PASS; G3 source diagnostic COMPLETE WITH CAUTION; 14-day residual calibration NOT RECEIVED / NOT VERIFIED; NO PF4 LIVE WINDOW AUTHORIZED.**

## Scope and frozen parentage
This is a separate **design branch** \`design/pf4-inscription-precommit-20261024\`, begun from the archived main snapshot \`dd48820ff2ac5e97bd2f9a327ce113a0b02d93ff\`. At this branch's frozen read-only snapshot, the PF2 archive holds exactly 95 linked chunks and **1731** admitted ticks (ticks 0..1730). Later live PF2 data remain out of scope. No changes to PF1/PF2/C1 signed science files, leases or published intake. No new future beacon time, source round or prospective statistical test chosen.

## G2 — independently constructed historical adapter parity: PASS

[GitHub Actions **40082034607**](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/40082034607) PASS. Earlier run [40081975503](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/40081975503) failed *before* science assertions because vanilla Node.js could not load frozen extensionless TypeScript imports; test switched to the standard tsx runner without changing any frozen PF2 code. Both records retained.

**Source:** \`experiments/pf4/PF4_G2_ARCHIVED_1731_PARITY.mjs\`, derived workflow artifact \`pf4-g2-independent-1731-bitwise-parity\` (ID **12555900749**).

Test cross-checks:
- 95 archived, contiguous history chunks with correct \`R0+20*tick\` rounds, linked row/chunk hashes, no uncommitted or future source reads.
- 1731 public Quicknet random values mapped separately with a new \`Buffer\`/SHA256 implementation and the frozen \`pf2InputForArm\` function. **15579/15579** mappings equal.
- A separately implemented Studio \`runtime_mirror\` with its own 24-step refrain, final-excursion and ±1/8 V-update law matches **15579/15579 learner transitions** and cue/source/death linkages.
- Normative PF2NinePairs processes the same archived rounds and reproduces all **31158/31158** recorded original 18-arm events. The nine learner states then agree on **99/99 IEEE-754 bit patterns** of V, including any sign of zero, after exactly 1731 ticks.
- Input archive prefix digest: \`86acde069fbb5a059e94592aa761cf557f9f139f1a37efa8dd0514a99fe5b222\`; first physical round 33298740, last 33333340.
- All original Studio archive's 65 SHA256-listed files verify.

**Limitations:** No additional BLS signature verification in this parity script; the live PF2 verifier has separate authority. This independent G2 audit does NOT inspect the user's separately developed adapter package, which has not yet been provided. It establishes exact numerical parity independently against the published reference.

## G3a — preliminary published Quicknet vs simulated 1731-tick *cue* compatibility: CAUTION

[GitHub Actions **40082169521**](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/40082169521) PASS as an *execution audit only*. Source: \`experiments/pf4/PF4_G3A_PUBLISHED_PREFIX_CUE_COMPATIBILITY.py\`, artifact \`pf4-g3a-1731-cue-compatibility\` ID **12555687138**.

Compared **one** pre-existing 1731-tick published prefix with **400** new synthetic SHA256 1731-tick tapes under exactly the nine PF2 domain-separated cue mappings. Observed 15579 cues by 10 bins:
\`[1576,1627,1572,1647,1662,1549,1521,1463,1478,1484]\`.

| Historical-source descriptor | Observed | Number of 400 synthetic worlds at or above observed | Approximate empirical upper-tail location |
| --- | ---: | ---: | ---: |
| 10-bin Pearson chi-square of aggregated PF2 cues | **29.763720392836508** | **4** | ~1.0% |
| Within-arm lag-one same-cue counts | **1596** | 60 | ~15.0% |
| Across-arm matched-cue counts (relative to C) | **1442** | 23 | ~5.75% |

The chi-square imbalance is **near the high end** of the synthetic sample. These are exploratory post-inspection statistics, not registered primary measurements. No justified family-wise significance inference is permitted from several inspected summaries. A one-prefix source mismatch **could** be sampling fluctuation, changed source distribution, conditional selection, source/arm mapping mismatch or other causes; inspect independently rather than re-designing away the observation.

Crucially, this **does not compare 14-day code residual distributions** and **cannot justify a 14-day future-boundary residual cutoff, exchangeability, or physical retrocausality**. No future Quicknet data were examined.

## G3b — strict incoming package validator: SELF-TEST PASS; ACTUAL PACKAGE NOT RECEIVED

[CI **40082430385**](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/40082430385) PASS, using *fabricated solely internal QA fixtures with adversarial corruption checks*, **not** 400 actual world scores. Source: \`experiments/pf4/PF4_G3B_OPERATOR_CALIBRATION_QA.py\`.

For the independent operator's *real* full-residual package, provide:
1. The **exact adapter source, generator source, specification and SHA256 digests**.
2. Exactly **400 distinct 20,160-step synthetic input tapes** with identity/digest, the precise 32-byte generation function, round and lineage schedule and PF2 reference-domain mapping.
3. Vstar (code SHA256 \`de0d86764a300abe5187b06a379be1beefed859942784d12cd6a672f81702925\`) plus **the shifted-lineage code on all 400**, and zero-code scores on 100 predeclared worlds.
4. Every per-world candidate code residual \`R_all\` computed using all **99 inherited-code components**, with no value pruning or changing the divergence metric after inspecting results. Retain all nine per-lineage residuals and complete terminal vectors if feasible.
5. Raw outputs, scripts and checksums, not only aggregate calibration figures; explicit no-future-target data assurance.
6. For **historical physical-source compatibility**, use pre-target published complete 14-day Quicknet periods with the exact adapter; if not available, record the limitation and keep Gate 3 open. Matching marginal cues at 1731 ticks is not enough.
7. A *predeclared* joint four-window null sampler that respects source/arm dependence; do not combine four individually favourable periods post hoc or assume Fisher's independent-p test without confirming its assumptions.

The G3b QA validator intentionally marks all of **raw generator independently rerun**, **physical historical compatibility**, **statistical exchangeability**, **independent full-residual reproduction** and **prospective seal** as **FALSE** until separate supporting audits confirm them. A structural QA PASS is not a scientific G3 PASS.

## PF4 outstanding authorization matrix

| Gate | Current state |
| --- | --- |
| D0 65-file Studio archive and scar audit | PASS in [40052535462](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/40052535462) |
| G2 archived published 1731-tick 9-lineage input/code parity | **PASS** |
| G2 operator adapter package SHA, signed source receipts and independent package review | **PENDING** |
| G3a brief source-cue distribution diagnostic | **EXECUTED, caution** |
| G3b shape validator unit tests | **PASS (mock only)** |
| G3 400-world full 14-day residual null package | **NOT YET RECEIVED** |
| G3 real published complete-period vs synthetic residual exchangeability / adequacy | **NOT ESTABLISHED** |
| Freeze four-window joint test, candidate family, multiplicity and source commitments | **NOT REGISTERED** |
| Independent RFC3161 seal, time-lock and four future live windows | **NOT INITIATED** |

**Decision:** Do NOT seal PF4, fix a 0.076/0.163 cutoff, issue future-target API calls, or infer an experimental retrocausal anomaly at this stage. Preserve all failed, null, near-tail and unexpected observations. The live-source adapter package and the completed 400-world residuals are the next required inputs.
