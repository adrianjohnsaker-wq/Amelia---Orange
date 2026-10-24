# PF4 — Symbolic inscription: fixed reduction and reproducible code-generation protocol
**Version V1 / 24 October 2026**
**STATUS: source committed BEFORE author supplies an inscription. NOT sealed or approved for a live run.**

## Purpose

Test a secondary *author-supplied, text-conditioned synthetic world code* separately from the immutable primary Studio04 candidate \`Vstar.json\` (SHA-256 \`de0d86764a300abe5187b06a379be1beefed859942784d12cd6a672f81702925\`).

The central physical hypothesis remains a possible future-boundary dependence. The textual inscription is a predefined *choice of synthetic initial condition*, not evidence that a future condition caused the author to write it. No privileged symbolism, belief efficacy, or external agency is presumed.

The art-historical inspiration is Austin Osman Spare's sigilisation of a statement, with repeated letters removed and remaining letters symbolically combined. Our version deliberately replaces subjective glyph-styling with a deterministic, reproducible string-and-hash rule. "Forgetting" in the historical occult context is not itself a scientific information-hiding method.

## Exact protocol BEFORE writing the phrase

**Implementation:** \`experiments/pf4/PF4_SIGIL_V1.py\`. The file's published source hash and Git commit must be recorded in a timestamp-verifiable pre-text method commitment. If ANY rule below changes, register V2 *before* accepting the statement; never inspect a prospective candidate code and then alter the mapping.

**Statement input:** user enters **one line, 1..256 printable ASCII characters**, interactively via TTY prompt; no CLI literal or checked-in file. Reject control chars and non-ASCII rather than silently transliterating. No user statement is present in source, docs or CI tests.

**Reduction:**
1. Uppercase A–Z; spaces, digits and all punctuation are omitted.
2. Traverse the resulting letters left to right, keep **only the first occurrence of each**. Vowels remain (not a vowels-elimination variant).
3. If zero letters remain, abort. The reduction is a deterministic string of 1..26 distinct uppercase letters, called SIGIL.
4. Compute \`DIGEST = SHA256( ASCII("AMELIA-PF4-SIGIL-V1") || 0x00 || ASCII(SIGIL) )\`.
5. Set \`NS = "PF4S1-" + lowercase_hex(DIGEST)\`.
6. For each complete synthetic world *pass*, every lineage k in \`0..8\` receives exactly 20,160 ticks with input UTF-8 bytes of \`NS + "|" + decimal(k) + "|" + decimal(tick)\` where tick runs \`1..20160\`. This directly uses the preexisting studio runner's SHA-256 cue mapping; no physical beacon is consumed.
7. Initialise the 9×11 inherited V code to zero. Repeat **exactly thirty** whole-history iterations by running unchanged \`experiments/studio/code/bootstrap_run.mjs\`, with \`runtime_mirror/\`, learner mode, 9, 20160, and the fixed namespace. Set next starting V to previous final \`finalVFull\` without rounding after each pass; no tuning or adaptive stopping.
8. Serialize pass-29 *ending* nine-lineage full V with Python \`json.dumps(V,separators=(",",":"),ensure_ascii=True,allow_nan=False) + "\n"\` UTF-8. Name result \`PF4_SIGIL_V1_CANDIDATE.json\`. Compute the whole-byte SHA-256 and record the exact code SHA and per-pass numerical max change, deaths and nine trace digests. Code convergence need not be exact.
9. Record SHA-256 of the source script, existing studio runner and candidate. Never store or echo the original statement or its legible reduced letters in the runner's outputs. The recorded hashes, namespace and code do **not** guarantee cryptographic confidentiality of low-entropy phrases.

**Usage after separate pre-text source commitment:**
\`python3 experiments/pf4/PF4_SIGIL_V1.py --out /tmp/private-unique-pf4-inscription\`
This prompts for text on an interactive terminal; a new output folder outside the repository is mandatory. The \`--self-test\` option runs fixed, innocuous synthetic letter fixtures **without** constructing a candidate or reading any future source.

## Custody — distinguish commitment, encryption and blindness

- The *method source* must be frozen **before the text is written**.
- The text is written once and transformed without experimenting with alternative phrasings or inspecting candidate performance.
- The derived candidate code, its hash and subsequent null/control assignments must be placed under independently timestamped commit **before the first future target round is published**.
- For a literal "forget until all four windows close" policy, the simplest method requires **no PF4 live execution during those windows**: generate the secondary code once before the first target round, immediately encrypt it under an independent custodian's key, publish its exact plaintext SHA-256 plus ciphertext digest with an independent timestamp, and keep the plaintext inaccessible. After the fourth window ends, decrypt once and run the **precommitted** adapter and analysis retrospectively over the fully verified published beacons. This preserves prospective information separation without running a blind live scoring service. An SHA-256 commitment alone is **not** confidentiality or encryption. This V1 source does **not** implement encryption, escrow or independent timestamping.
- Any manual observation of the code or premature unblinding must be logged under the predeclared exclusion/incident procedure, not relabelled as a new start.
- The score family, null labels, four future 14-day windows, correction for secondary arms, reference timetable and exact external verifiers all require later independent registration and sealing.

## How this affects physical interpretation

The study is designed around **future specificity**, not ritual efficacy or a posthoc narrative of meaningful coincidence. Text selection is an ordinary earlier physical act unless a genuinely preregistered experiment shows information dependence beyond the null.

PF4's primary \`Vstar\` code is **not regenerated**. The sigil arm is a secondary hypothesis, with its own frozen predictive outcome and multiplicity adjustment; post-reveal selection of the better-fitting code is prohibited.

## Live source gate BEFORE sealing

The exact published-Quicknet PF2 adapter and 1,731-tick comparison are currently operator-reported, not independently available as committed source/output on this branch. Review their literal 32-byte inputs, BLS signatures, historical rounds, trace/V digests and exact mapping before marking G2 PASS.

The 400 synthetic calibration worlds are likewise in progress as reported and not yet available here. The exchangeability assumption should be examined empirically using **separate, pre-target published Quicknet periods** processed with exactly the same PF2 adapter, cadence, 9-arm mapping, code, 20,160-step window and residual definition as the synthetic null. Nine derived arms of one round stream are **one world**, not nine independent tests.

A non-rejection of a difference (e.g. KS p > 0.05) does **not** demonstrate distributional equality. Specify in advance a meaningful equivalence margin, sufficient historical whole-window sample size, dependence-aware confidence interval and allowed source/admission incidents. With fewer than enough past full 14-day windows, G3 must remain **unresolved**, not automatically PASS.

For four consecutive future 14-day periods, pre-register **one joint primary score and its distribution under matched four-window null blocks**; do not choose one of the four best single-window p-values. Fisher's chi-squared calibration presumes a particular dependence structure and is not automatically justified for shared candidate memory and common-source rounds. Keep signed time/round genesis and independent receipt of the primary and secondary candidate codes.

**No target time/date selected; no prospective source admitted; nothing sealed.** All design work on a new branch only; PF1, PF2, C1 untouched.
