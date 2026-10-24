# PF4 AM1 — Same-window two-code experiment: operator decision, 24 October 2026

**Status:** OPERATOR SCOPE DECISION ACCEPTED; engineering/pre-registration **DRAFT**; NO PROSPECTIVE ROUND ADMITTED, NO NEW CODE CREATED, NO RFC3161 SEAL. 
**Supersedes:** earlier 24 October PF4 design *only insofar as it scheduled the inscription code in a later block*. Preserve earlier documents and negative evidence; do not delete or rewrite history.

## 1. Four source windows; no experimental live intake

PF4 consumes **zero** new physical data until after the stipulated future Quicknet decryption round. The two future-code evaluations are **offline deterministic replays**, not live running models. Physical Quicknet publishes naturally during the four periods; later, the independently verified published record is supplied simultaneously to the two code pairs.

PF2 retains its own intake, lease, signed science, and reporting obligations. PF2's **day-30/43200-admitted-tick assessment** must be published before PF4 window 1. If the already-registered P2-2 sparse-events clause extends PF2 to **86400 admitted ticks**, PF4 dates **remain unchanged** and the PF2 day-60 report must be published **before PF4 decryption**. If the day-30 report or G3 check is not ready before the target, stop registration and make a documented prospective scheduling amendment; do not quietly backdate or cherry-pick a different round.

**Provisional Quicknet source grid:** chain \`52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971\`, genesis Unix 1692803367, three-second period, stride 20 rounds (= 60 seconds), exactly 20160 ticks per window.

| Window | Start round | Start UTC | Last round | Last UTC |
|:---|---:|:---|---:|:---|
| 1 | 34196220 | 2026-11-23 00:00:24 | 34599400 | 2026-12-06 23:59:24 |
| 2 | 34599420 | 2026-12-07 00:00:24 | 35002600 | 2026-12-20 23:59:24 |
| 3 | 35002620 | 2026-12-21 00:00:24 | 35405800 | 2027-01-03 23:59:24 |
| 4 | 35405820 | 2027-01-04 00:00:24 | 35809000 | 2027-01-17 23:59:24 |

Candidate optional decryption round **35810220**, approximately **2027-01-18 01:00:24 UTC**, with a one-hour buffer. Do not regard these as operator-approved exact live start rounds or an existing seal until all remaining conditions are satisfied. Check against pinned chain metadata before seal. No future rounds to be fetched now.

## 2. Two distinct **pre-declared code identities**, same four worlds

**Code family A — original Vstar:** literal immutable nine-lineage code \`experiments/studio/outputs/loop/Vstar.json\`; full JSON SHA256 \`de0d86764a300abe5187b06a379be1beefed859942784d12cd6a672f81702925\`. Paired control \`VstarShift[k]=Vstar[(k+1)%9]\`. Old approved synthetic calibration world IDs **1000–1399**.

**Code family B — authorial inscription:** a SINGLE construction from the already frozen source \`experiments/pf4/PF4_SIGIL_V1.py\`, after the author's previously agreed ASCII typing rule. Exactly one 30-pass studio synthetic loop starting with zero V. Code B full 9×11 SHA256 must be independently committed **before first target round**. Control \`SigilShift[k]=Sigil[(k+1)%9]\`. Independently calibrate code B against the SAME 400 synthetic seed IDs 1000–1399 with the exact source \`SHA256(UTF8("PF4-NULL|seed|t"))\`, 20,160 ticks, PF2 input map; no interpolation, adjustment, seed retries, different random worlds or prompt search.

**Four staged code configurations per future source world** (two codes + each code's own shift). Every such configuration contains nine independently reborn lineages under the same domain-separated inputs. **One Quicknet source window is one physical replicate**, not 9 or 36.

For each family i and future window j:
\`Rmean(C,B)=(1/90) sum_{k=0}^8 sum_{e in ten active edges except 3>6} abs(Vend(C,B)[k,e]-C[k,e])\`.
\`A_i(B_j)=Rmean(C_i_shift,B_j)-Rmean(C_i,B_j)\`.
\`T_i=(A_i(B1)+A_i(B2)+A_i(B3)+A_i(B4))/4\`.
**Positive A_i and positive T_i favour the correctly aligned original code.** Report \`R_all\`, all 99 original/final V values per lineage per run, deaths, sink scar, brink access and per-edge contributions as diagnostics for **both** code families.

No switching candidate to whichever code, source period, sign, statistic, edge subset or test policy scores better after reveal. All null-world 400 pairs and positive-control outcomes (including negative/failed ones) published prior to first target round.

## 3. Inscription once; nulls then encryption, with no human plaintext inspection

One audited **ephemeral execution session** must:
1. Check frozen V1 source SHA and studio archive/goldens, statement-normalisation rule and absence of future-source data.
2. Accept the statement one time through \`getpass\` (surrounding quotes omitted, both U+2014 dashes typed as ASCII \`--\`); **do not change V1**, use no operator trial-run candidate and no public raw sigil or phrase dump.
3. Execute unchanged V1 thirty-pass synthetic derivation exactly once. Treat generated plaintext 9×11 code as intermediate machine-readable secret material accessible only to the controlled runner.
4. Independently run full deterministic **400 paired synthetic null worlds** for both inscription and cyclic shift with the exact same PF2 Quicknet-source adapter, plus a **positive control in the inscription's own synthetic world**. Preserve all raw calibration outputs and checksums under custody; only publish code SHA and null quantiles/summary provenance before the source window.
5. Predeclare the family B null diagnostic acceptance/power criteria **before step 2**. If a predeclared engineering failure occurs, record the failed status. DO NOT repeat with another inscription or change the seed. Distinguish a scientifically negative null result from an actual tooling fault with explicit frozen repair/abort policy.
6. Once derivation and QA pass, timelock-encrypt the candidate code and its derivation record to the prechosen Quicknet unlock round after window 4. Independently timestamp ciphertext SHA and plaintext code SHA *before window 1*; erase only the expected temporary plaintext on the isolated runner, logging custody boundaries. A hash does not encrypt, and knowledge of the public statement plus deterministic algorithm allows independent re-derivation; this is **meaningful practice, not a statistical protection by itself**.
7. After four complete verified physical windows and the specified Quicknet unlock, decrypt once, match code SHA, run frozen evaluation on both family pairs, and publish BOTH outcomes plus failed/negative results.
8. If any family cannot be derived/sealed before the first round, apply the predeclared abort/partial-family policy; do NOT invent a retrospective code.

The official executable tool, its pinned revision, the exact tlock ciphertext format and unlock-round header must be independently reviewed. No code is generated, timelocked or sealed by writing this note.

## 4. Unresolved multiplicity fork — OPERATOR MUST CHOOSE BEFORE SEAL

The user's 24 October directive explicitly leaves the **error-allocation decision** open. Do not present either as already chosen. Two defensible alternatives:

**Policy D (both confirmatory):** each of the two predeclared one-sided code families is tested at **α=0.005**, controlling the two-arm familywise error rate at most **0.01** by Bonferroni without assuming between-family independence. Report both p-values and both decisions, no winner selection. Each family requires its OWN independently frozen four-world null distribution and cutoff. For the existing Vstar synthetic paired-null, 3,000,000 resampled four-tuples (seed 4072026) suggest the α=0.005 upper cutoff **~0.004207** (exploratory reference only); the inscription cutoff is UNKNOWN until its code and null are generated. Prefer full specified exact/validated numerical method with uncertainty to an unqualified "exact" p-value from a finite 400-world bootstrap.

**Policy P (one confirmatory):** Vstar alone is tested at **α=0.01**; inscription is independently predeclared exploratory/descriptive in the *same four source windows*, with **no confirmatory significance label**, no winner claim and explicit separate null comparison. Vstar's exploratory 3,000,000-draw paired upper-1%-tail reference is ~**0.003775**, not yet a sealed threshold; inscription's null still needs calibrating to describe an exploratory score faithfully. Do not posthoc elevate inscription to primary if Vstar misses.

**Recommended:** Policy D for a symmetrical two-code hypothesis if the operator wants **both** inscriptions to have prospective confirmatory status. Policy P is scientifically valid when priority explicitly belongs to the original Vstar, but then the inscription test is genuinely exploratory even if its result looks compelling.

The operator must commit **exactly one** named policy (D/P) to the independently time-stamped genesis **before first future beacon publication**. Require that the primary statistical procedure, null sampler, source, family tests and multiplicity are frozen; no "choose after calibration based on significance" licence. Choosing now after prior synthetic design exploration and before future physical outcomes is possible, but make rationale transparent.

## 5. Physical source compatibility gate — before both arms and any seal

The ten predeclared complete real historical Quicknet windows (June 1–October 18; 20160 ticks per 14 days) remain mandatory. As of the initial feasibility phase, just **30 sampled rounds were individually BLS-authenticated**, plus a separate 30-record acquisition pilot; this is not 201,600 authenticated input rounds or 10 Rmean outcomes.

At least for immutable Vstar+shift, obtain all 201,600 source values and apply exact PF2 reference-domain mapping, fresh births and full V statistics. An equivalence screen must be **frozen before all ten real Rmeans are observed**, using a meaningful predeclared median tolerance and tails. The operator's candidate screen "all ten within synthetic 0.5–99.5 percentiles and historical median near synthetic median" is a *gross-mismatch acceptance screen*, not proof of mathematical exchangeability or 1%-tail validity. Estimation based on just ten historical worlds has inherently wide uncertainty. Don't claim that a non-significant KS test establishes equivalence; if historical worlds fail, stop and revise the *experimental design* before prospective data access, not tune the null to make a result pass.

The inscription's null calibration can execute only after its code exists. Baseline fit and code-specific power must be documented before registration, while the literal code remains out of unauthorised human view. Same four future worlds = paired families, not two independent samples.

## 6. Mandatory status declaration

**G3 full historical Quicknet residual compatibility: OPEN.**
**Inscription code: NOT YET GENERATED.**
**Inscription 400-world null and positive control: NOT YET RUN.**
**Policy D versus Policy P: OPERATOR CHOICE OPEN.**
**PF4 genesis, independent timestamp and tlock: NOT CREATED.**
**PF2 live/science unchanged.**

The computational bootstrap and memory-dependent scar remain verified within their own archived synthetic experiments; no physically retrocausal dependency has been tested by AM1.

## 7. Timelock disclosure versus the PF2 reporting order

The proposed Quicknet timelock ciphertext becomes **technically decryptable** when its chosen Quicknet round is published, regardless of whether the PF2 day-60 report has appeared. Consequently, the requirement "publish the PF2 day-60 report before PF4 is decrypted" is an **operator-controlled publication/decryption order**, not a cryptographic property of the tlock. If PF2 reporting is unexpectedly late, the operator and custodian must defer the **act of decrypting and scoring** PF4; they cannot claim that published Quicknet prevents a third party who has the ciphertext from decrypting it. Predeclared timing amendments cannot retroactively alter that physical availability. If strict information inaccessibility until PF2 reporting were genuinely required, a separately controlled private key or later fixed unlock round would be needed and independently precommitted before window 1. This reporting condition does not justify moving the four physical source windows.
