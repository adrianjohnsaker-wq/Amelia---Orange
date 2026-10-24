# PF4 G2/G3 design decision — symbolic inscription, null exchangeability, and four future windows
**24 October 2026 · design advice only · UNSEALED, no target rounds chosen, no future data accessed**

This addendum answers the proposed code-generation decision without retroactively changing the previously pinned studio candidate.

## Decision 1: Candidate code origin

**PRIMARY C0 (do not replace):** Keep the archive's converged Studio04 9×11 code as the first and predeclared primary candidate. Its literal-byte SHA-256 is \`de0d86764a300abe5187b06a379be1beefed859942784d12cd6a672f81702925\`, checked by PF4 D0. No regeneration, adjustment to future expected data, or posthoc replacement permitted.

**SECONDARY text-derived inscription (optional, NOT YET IMPLEMENTED):** A separately labelled arm could deterministically construct a new synthetic training world from exactly specified UTF-8 bytes, source-domain separation, SHA-256 expansion algorithm, parameter choices, and published training code before new beacon rounds are available. Suggested **neutral** mnemonic seed bytes:
\`AMELIA|PF4|NINE-ZONES|FUTURE-BOUNDARY|V1\`.
This text is a design marker, not a physical information channel. Pre-register the derivation, the resulting *full 9×11 code SHA*, the exact secondary family and a multiplicity rule. A performance improvement cannot be retroactively attributed to a selected mystical label.

**O9A provenance warning:** The contemporary Order of Nine Angles (O9A) has documented connections to violent neo-Nazi and extremist currents. It should not be treated as equivalent to Jewish Kabbalah or the CCRU Numogram. Its name is not given a privileged computational role; historical discussion may mention it critically and separately. Choosing the mnemonic solely for philosophical imagery has no statistical or mechanistic advantage over an otherwise arbitrary neutral phrase.

**Do not choose whichever code later wins** (the archive code, text code, donor-yoked code, or additional seeds); each additional candidate is a separate hypothesis or part of an advance-declared family.

## Decision 2: Gate 2 independent parity and source authenticity

Operator reports a newly written 32-byte verified-beacon input adapter through the *exact* \`pf2InputForArm\` mapping and bit-for-bit agreement on all nine inherited code vectors after 1,731 published ticks.

**Status: reported only, not independently audited at this commit.** The adapter file/log is not yet in this PF4 branch. Before G2 PASS:
- File full adapter source, input round list, verifier receipts and both programs' literal ending V vectors/digests. Compare all 99 values with IEEE 754 exact equality, along with trace digests, deaths, current PFM birth/reset state and source eligibility.
- Verify signatures and chain hash \`52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971\`, the 3-second unchained Quicknet scheme; no hidden replay or future polling.
- A successfully replayed already-published PF2 prefix is an engineering-validation exercise, **NOT** a prospective temporal-boundary observation.

## Decision 3: Gate 3 / whether 400 null worlds yield an exact p

Quicknet has a deterministic BLS signature for each round given the secret threshold key and known round number. That makes the round result *unique conditional on the long-term key*, but does not imply that the threshold aggregate exists in public before participants broadcast signatures. A threshold compromise or illicit collection of signature shares could reveal it early: add this to the precommitted leakage threat model.

drand's outputs are intended to be computationally unpredictable/unbiasable under cryptographic assumptions. This alone **does not make 400 simulated SHA-derived worlds mathematically exchangeable with a future live Quicknet window**. That depends on the exact generator, arm mapping, dependence across rounds and blocks, time drift, verification/admission policy and the null's conditional sampling scheme.

If exchangeability of target plus null worlds is defensible under a *predeclared null*, then one-sided empirical rank is
\`p=(1+number_of_null_T_le_observed)/(401)\` for N=400.
The smallest resolvable p is **1/401 = 0.0024937656**. For *p < 0.01*, the number of null scores <= observed may be **0, 1, 2 or 3** (then p is at most 4/401 ≈ 0.009975). If 4 or more then p >= 5/401 > 0.01. This is discrete tail resolution, **not** a power estimate and not an exact unconditional p solely because drand is deterministic.
Four windows / multiple codes require an advance-declared joint test or multiplicity correction. Never choose a favourable window after seeing any of the four. The nine derived arms are **one world**, not nine experimental replicates.

## Decision 4: Four 14-day windows, joint specificity

Four consecutive **nonoverlapping** 20,160-tick windows spanning eight weeks is a reasonable prospective replication design, but only after a start time/round, stride, delivery irregularity rule, external timestamp and all null distributions are frozen.

Recommend **one primary global hypothesis for one PRIMARY C0** using all four windows, not picking a posthoc single favourable p.

Prepare:
1. \`R_{j,c}\` = max over the same 99 inherited-code components of |F_{Bj}(c) - c| for window j and candidate c.
2. \`R_{j,C0}\` = primary code's self-consistency residual; separately report code rankings within each future world against controls.
3. A *frozen joint specificity statistic*, e.g. a predeclared mean rank-score / median-control-adjusted residual across four periods; calculate its null distribution through identical four-window mock tuples, keeping any shared dependence. The statistic's direction and reference distribution are fixed before reveal, not chosen from calibration wins.
4. A second, predeclared specificity gate: C0 must outperform matched control codes within target worlds and fit target worlds more selectively than non-target worlds, controlling for mere general robustness. Treat the added gate as a genuinely separate success condition, and report failures.
5. Preserve raw per-window residual, death/zone-4 visits, pit-scar ablation and dormant-edge sensitivity regardless of outcome.

The first 1,731 **published** ticks and Monday PF2 weekly readouts remain purely retrospective engineering/control data and may not be scored as a future-window test.

## Decision 5: freeze order

(1) Audit G2 exact adapter and receipts -> (2) receive and audit G3 null outputs and verify the 400-world source distribution -> (3) freeze candidate family and text-seed algorithm (if used) -> (4) freeze 4-window joint statistic, tails, null semantics, alpha and all exclusions -> (5) create immutable time/round genesis, independent timestamp and third-party seal -> (6) only then admit the four live future periods -> (7) no interim inference or posthoc baselines -> (8) preserve results, including zero-effect and failed calibration outcomes.

**As of this addendum: no live PF4 registration, no new beacon rounds selected or admitted, and no causal future-to-past result has been obtained.**
