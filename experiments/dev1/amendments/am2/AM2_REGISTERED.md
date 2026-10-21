# DEV-1 Amendment AM2 — ancestral course and resistance to the signal

**Issued and operator-approved:** 21 October 2026, 11:47:28 UTC.  
**Amends:** DEV-1 Stage 1 synthetic work order and the already sealed AM1 stone-tape amendment.  
**Status on registration:** PROSPECTIVE; requires genuine independent RFC 3161 token and SHA-256 evidence before any lineage arm is run.

## Scope and provenance

AM2 adds **only read-only measurement, logging and statistical reporting**. It adds no mechanism, new arm, selector weight, transition, experimental constant or adjustment to any registered existing test. All underlying DEV-1 and AM1 RFC3161-sealed files remain byte-identical. The existing AM1 seven-family architecture and primary comparison family are unchanged.

The conceptual pair is Nigel Kneale's *Quatermass and the Pit* (BBC, 1958–59) for inheritance of ancestral personal memory in L, and *The Stone Tape* (BBC2, 1972) for inheritance of death-only place marks in LS. These are framing analogies, not scientific evidence.

DEV-1 was designed partly in response to PF-1 P1, registered at **40 admitted ticks**, to make an externally auditable programme capable of **falsifying one of its own predictions**. This is *provenance, not a positive result*.

## P-AM2-1 — ancestral course (directional, registered)

**Unit of measurement:** individual completed or censored generations, then lineage. Exclude generation 1 (identical lineage starting condition). For each individual in generation g ≥ 2:

(a) distinct **directed** canonical edges traversed per **1,000 moving steps**, defined as `1000 * unique directed edges / count of actual non-dwell transitions`.

(b) distinct **PF-1-eligible unordered zone pairs presented as scanner candidates** per 1,000 moving steps, using the original unchanged PF-1 scanner and frozen graph-only eligibility definition. Count **distinct pair keys**, not repeated events or confirmed encounters. Report the number of scanner presentations alongside the distinct numerator. Never run forks or PF-1 live intake for this observational readout.

For each lineage, average the eligible individual rates from generations 2 to last (each generation contributes one rate, not weighted by survival duration). The choice of an arithmetic per-generation mean implements the operator's direction to "compute per individual and average per lineage"; no fitted parameters. If an individual has 0 moving steps, its rate is undefined; report its count and exclude it from that mean rather than divide by zero. A lineage with no eligible generation has a missing outcome; report it, do not assign a favorable value. Preserve all denominators and censoring labels.

**Primary AM2 prediction (measure a):** `L < LS` and `L < L0` in lineage-average exploration. Evaluate with separate one-sided permutation comparisons **100,000 permutations each**, with a **separate two-test Holm family at α = 0.05**, preserving the 32 lineage IDs, deterministic seed and whole-lineage permutation as the unit of exchange. Do not incorporate this into either the original work-order primary family or AM1's secondary family.

**Measure (b)** follows the same directional expectation in the descriptive report **but is not tested**. If L is not less exploratory on (a), report that the Quatermass ancestral-course interpretation **is not supported**, regardless of attractive results on (b).

## O8 — resistance to the signal (descriptive; zero inferential p-values)

**Choice points and targets:** 1→2 vs 1→8, 2→4 vs 2→7, 4→5 vs 4→7. Only these three zones are eligible.

**Cued choice:** at a choice point, the recorded input zone for the actual step **must equal exactly one of the two outgoing targets**. Uncued steps are excluded from both numerator and denominator and separately counted.

**Classes:**
- Pit-ward cued targets: **1→2, 2→4, 4→5**.
- Other cued targets: **1→8, 2→7, 4→7**.

**Compliance:** `choices whose selected target equals the cued target / total cued choices of that class`. Report each class's compliant count, cue count and fraction.

**Resistance index:** `compliance(other cues) − compliance(pit-ward cues)`. If either class has zero cues, report undefined/null, **not zero**. Each class of fewer than **20 cues** receives a **sparse** marker (including zero), with exact numerator/denominator.

**Reporting windows:** B, D1, D2, D3, D4 and Y: within-life by fixed nonoverlapping **1,000-step blocks** (global step 1–1000 = block 1, 1001–2000 = block 2, etc.). L, LY, L0, LS and LSY: by **generation**, including each reported generation unless excluded for P-AM2-1. No retroactive claim that B/D1 O8 was measured prospectively before AM2; any deterministic replay from archived synthetic tapes is labelled **reconstructed after AM2 registration**.

**Transparent, not tested:** B resistance index expected near zero because the cue exceeds the flux-score gap at the three choice points. Lineage-learning hypothesis: increasing resistance index in L and LS, not in LY or LSY. **O8 is descriptive and carries no p-value.**

## Timing, isolation and logging

- AM2 and a cryptographic **joint AM1+AM2 provenance manifest** must be SHA-256 checked and RFC 3161 sealed before **L, LY, L0, LS or LSY** is run. Certify absence of all lineage outcome data at the moment of sealing.
- Do **not** modify base `DEV1_CONSTANTS.json`, its existing token, `AM1_CONSTANTS.json`, `DEV1_CONSTANTS_MANIFEST.json`, or their AM1 tokens. Attach the original AM1 signed hashes and original base digest into the new jointly sealed AM2 bundle.
- Canonical and PF-1-pinned files and C1 remain byte-identical. Deterministic replay is mandatory on any future cohort.
- Constructed readout unit tests before use: **cue classification, exact compliance counting with known trace answers, exclusion of uncued choices**. Verify sparse-cell and undefined-index handling. No synthetic developmental-arm runs are authorised by this amendment.
- Retain D1 review gate: B and D1 have been reported; **no further developmental arm until the operator reviews D1 and authorises continuation**.
- Log all decisions, attempted seals, failures, deviations and results in `experiments/dev1/DEV1_LOG.md`, with links to immutable GitHub Actions evidence.
