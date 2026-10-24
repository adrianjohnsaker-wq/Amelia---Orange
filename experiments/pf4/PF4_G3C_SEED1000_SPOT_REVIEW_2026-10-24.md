# PF4 — Seed-1000 calibration reconstruction, CSV access, and inscription status
**24 October 2026. Design branch, unregistered/unsealed. No target-future beacon admitted.**

## Reported calibration package location could not be verified

The operator reports files in \`claude/pf4_calibration/\` named \`pf4_run.mjs\`, \`pf4_calibrate.py\`, \`null_residuals.csv\`, \`README.md\`, \`SHA256SUMS.txt\`, and a fuller calibration zip. At audit time, that directory does not exist on the reachable GitHub \`main\` or \`design/pf4-inscription-precommit-20261024\` branch, and the corresponding bytes were not available in conversation or Library files. Accordingly **neither all 900 rows nor the adapter source/generator have yet been independently reviewed**. Do not claim they have.

The operator's design says \`SHA256("PF4-NULL|seed|t")\` produces each 32-byte synthetic source value; 400 V* runs, 400 next-lineage-shift controls and 100 blank controls are reported.

## Independent 20,160-tick synthetic world (seed 1000) — PASS

[GitHub Actions 40089891525](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/40089891525) PASS. Independent source:
\`experiments/pf4/PF4_G3C_NULL_SPOT_SEED1000.mjs\`.
Generated artifact \`pf4-g3c-independent-seed1000\`, ID **12558209351**.

- Reuses the original, frozen normative \`PF2ReceiverLineage\` and its 24-step V-update law, with a fresh initially-born runtime.
- Feeds \`SHA256(UTF8("PF4-NULL|1000|"+decimal_t))\` for \`t=1..20160\` through independently authoritative \`pf2InputForArm\`.
- Starts one nine-lineage world from Studio V*; another from V* cyclically shifted **+1** in lineage index; another shifted −1 for disambiguation; another from blank V.
- Computes whole-code max absolute residual across 99 directed-edge memory values, deaths and zone 4 visits, with full per-edge maxima and per-lineage residuals in the machine-readable artifact.

| Code | \`R_all\` | Deaths | Zone 4 visits | Comparison to user-provided spot |
| --- | ---: | ---: | ---: | --- |
| \`vstar\` | 0.09772266196640947 | 3 | 391 | **all EXACT** |
| \`vstar_shift_plus1\` | 0.13581857356356242 | 6 | 408 | **all EXACT** (\`vstar_shift1\`) |
| \`vstar_shift_minus1\` | 0.19052135215391253 | 4 | 402 | diagnostic only |
| \`zero\` | 0.487091064453125 | 31 | 215 | **all EXACT** |

This validates the **seed-1000 spot**, generator and shift orientation under an independent runtime. It does not validate all 400/400/100 null samples and does not establish that synthetic and real Quicknet world residuals share a distribution.

## Exact CSV audit prepared but NOT applied to real data

\`experiments/pf4/PF4_G3D_OPERATOR_900_CSV_QA.py\` validates the operator's real \`null_residuals.csv\` **when supplied**. It demands exactly 900 rows (400/400/100 by code), unique and paired seeds, nonnegative finite scores, a blank-code subset on the first 100 sorted seeds, literal three seed-1000 spot triples, and outputs a SHA256 of the CSV, descriptive quantiles and \`R_shift-R_vstar\` distributions. It does NOT certify the generator or compare 11 edge-max columns to archived raw calibration JSONs; those remain required independent checks.

[CI 40090186093](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/40090186093) PASS **MOCK DATA SELF-TEST ONLY**, including rejection of deliberately corrupt sample records. Not a false assertion that the 900 operator rows have been processed.

Once the operator's CSV becomes available, compare its raw bytes against the two underlying calibration JSONs (export script, row ordering, floating-point exactness), calculate the csv SHA and add it to a **new** manifest; do not rewrite the original zip's registered checksum list.

## Crucial inferential defect and research decision

\`R_all(C,B)=max_{k,e}|F_B(C)_{k,e}-C_{k,e}|\` asks whether a code approximately reproduces itself under a particular future world. It need **not** discriminate \`C0\` from its lineage permutation when each arm is subjected to a similarly distributed, domain-separated stream under the null. Under ideal arm-exchangeability, the distribution of \`R_all\` is invariant under permutation of V among arms (although realised paired differences may occur). The physical Quicknet domains do not automatically satisfy exact exchangeability, so this is a null-model motivation, not a proof.

Do **not** select a new statistic based solely on the seed-1000 result or future target. A candidate **paired code-identity contrast** for each world is
\`A(B)=R_all(C_shift,B)-R_all(C_vstar,B)\` (positive favours original C0).
Calibration must show if \`A\` has any prospective discriminatory power, distinguish a generally better code from *future-specific* consistency, and preserve the 400 paired world dependence. Absolute \`R_all\` remains a separate necessary residual diagnostic so neither code can win by both being poor. Predeclare one JOINT four-window statistic based on null-calibrated four-window tuples and a disjoint source-window check, **before any future reveal**. If no feasible power/code discrimination emerges from historical/synthetic nulls, PF4's primary physical hypothesis should remain unregistered rather than change thresholds post hoc.

In particular, nine derived arms constitute ONE physical input world, not nine replicates. Four prospective windows are four paired worlds, not 36 trials.

## Inscription — method fixed, statement not admitted

The user supplied an original statement, but the already-committed V1 method \`PF4_SIGIL_V1.py\` rejects every non-ASCII character and every control character. The given statement contains **U+2014 em dashes** (besides typographic outer quotation marks if included). The protocol **does not silently normalise** those bytes. Therefore no sigil seed, training world, derived code or independent text commitment has yet been computed. A newly supplied *printable ASCII* statement (outer quotes excluded and em dashes explicitly replaced by ASCII \`-\`, if that is the author's intended canonical wording) can be admitted **only under the existing V1 source**, without changing the derivation rule or trying alternatives after seeing a result. Raw wording appears in the conversation and must not be represented as secret or independently encrypted.

The frozen \`Vstar\` primary code is not changed. The optional inscription code is separate, secondarily registered, and future-target windows have NOT been selected or sealed.

## Gate matrix

- D0 original 65 SHA-verified studio files: PASS.
- G2 1731 public Quicknet mapped and final code exact bitwise parity: PASS.
- G3c independent one-world seed-1000 generator/R_all/control alignment: PASS.
- G3d incoming 900-row CSV validator: MOCK SELF-TEST PASS; **actual package inaccessible**.
- G3 residual distribution, null-world exchangeability and discriminatory power: **NOT VERIFIED**.
- Prospective four-window test statistic/time-source and timestamp: **NOT REGISTERED**.
- Physical future-to-past evidence: **NOT TESTED**.
