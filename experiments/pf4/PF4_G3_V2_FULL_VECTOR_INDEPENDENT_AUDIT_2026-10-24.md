# PF4 G3 v2 — independent full-vector null audit and positive-control reproduction
**Date:** 24 October 2026. **Status:** Calibration v2 integrity verified; matched synthetic null quantified; independent positive control PASS; **future-boundary study remains UNREGISTERED and UNSEALED**.

## Original user-supplied archive and its evidentiary scope

Original attached ZIP: \`pf4_calibration_v2_2026-10-24.zip\`.
**SHA-256 \`a5390ecfc765e637f17c4ed72c5593f27768b65c2762c23cab8b0e011a0f0fba\`.**

- Securely checked ZIP names for path traversal/symlinks; **all 11 archive manifest entries PASS SHA-256** (all real entries checked; directory entries excluded).
- Contains code \`pf4_run.mjs\`, \`pf4_calibrate_v2.py\`, original full initial code JSONs (\`Vstar\`, shifted \`Vstar[(k+1)%9]\`, zero), null JSONs \`null_A2.json\`, \`null_zero2.json\`, flattened 105-column CSV \`calibration_full_vectors.csv\`, and two positive-control outputs.
- The archived Vstar code SHA-256 is \`de0d86764a300abe5187b06a379be1beefed859942784d12cd6a672f81702925\`, equal to the published Studio 04 candidate SHA. The stored shifted code equals a cyclic **+1 lineage rotation** exactly; zero-code has all zeros.
- Source code explicitly derives synthetic 32-byte source at tick t from \`SHA256(UTF8("PF4-NULL|seed|t"))\`, for 20160 ticks per world. Input is transformed per lineage 0 raw, 1..8 SHA256(ASCII "PF2-REF-k|" || raw 32 bytes), as in frozen PF2 reference mapping. This is **synthetic**, not future Quicknet source.
- All **900** run records parsed: Vstar 400 seeds 1000..1399, shifted Vstar the exact same 400 seeds, blank 100 seeds 1000..1099. These constitute **400 paired synthetic worlds**, not 900 independent trials.
- Each record contains nine exact end-of-run 11-edge V vectors, \`R_all\`, \`R_active\`, \`R_mean\`, edge maxima, nine trace hashes, deaths and zone4 count; CSV contains all 900 complete vectors and aggregate scores.
- Independently recalculated **900/900 \`R_all\`, \`R_active\`, \`R_mean\`, and all 9900 per-edge maxima** from literal archived starting and ending vectors, with **zero discrepancies** (numeric tolerance ≤1e−14). All 900 CSV vector cells (89,100 numeric memory cells) are exactly equal as floating-point values to their JSON counterparts; deaths, zone4 and both residuals agree.
- Reader should separately preserve original **ZIP itself** as the source artifact, not infer that raw 3.8 MB of calibration JSON are already on the connected GitHub branch. The original ZIP is present as a chat attachment; not yet independently timestamped/sealed.

## Recalculated synthetic null (ordinary code robustness)

| Metric | Vstar, 400 worlds | Shift+1, 400 worlds | Zero, 100 worlds |
| --- | ---: | ---: | ---: |
| \`R_mean\` mean | 0.013587071727489181 | 0.013761591169799376 | 0.08425958253347215 |
| \`R_mean\` median | 0.013499929051705679 | 0.013616734667281936 | 0.08393830847331454 |
| \`R_mean\` sample SD | 0.0023330068428923617 | 0.002513603375211944 | 0.004647507450956801 |
| \`R_mean\` minimum | 0.007252317050539519 | 0.008240206705591354 | 0.07490285142247986 |
| \`R_mean\` maximum | 0.02337196706266295 | 0.024542988118774086 | 0.0951357942422523 |

**Per-world paired \`A_mean=R_mean(shift1)-R_mean(Vstar)\`** across the same 400 worlds:

- Mean **+0.00017451944231019895**, sample SD **0.0029797887844016328**, median **−0.000016849450064643744**.
- Vstar has lower residual in **198/400 = 49.5%**; shifted has lower residual in 202/400, zero ties.
- Range **−0.013035968585929208** to **+0.01010284391713666**.
- Median and mean near zero are consistent with a lack of systematic lineage-identity advantage in worlds unrelated to Vstar, **not** evidence of an exactly zero mathematical expectation or source exchangeability.

By contrast paired \`A_all=R_all(shift1)-R_all(Vstar)\` has mean **+0.006782245965526044**, sample SD **0.0925470842380981**, confirming extreme dispersion of the maximum-residual metric.

## Four-window reference thresholds: preliminary Monte Carlo, NOT a registered exact tail

Drew **2,000,000** independent four-tuples **with replacement** from the 400 observed *paired* \`A_mean\` values (NumPy RNG seed 4072026). Statistic \`T4=(A1+A2+A3+A4)/4\`.

- Upper 95th percentile **+0.0026363139205109755**.
- Upper 99th percentile **+0.0037749066611364518**.
- Approximate mean **+0.0001754708459237422**, SD **0.0014874260004799046**.

These reproduce the reported rounded thresholds (~0.0026 and ~0.0037). **They are conditional, Monte-Carlo reference quantiles of synthetic paired-world effects**, relying on independence of the hypothetical four windows and the comparability of synthetic tapes with physical Quicknet. They are neither an exact null p-value nor a sealed physical test. Source-series dependence, four-window sampling design, finite empirical-null uncertainty and the physically published historical-window compatibility gate remain outstanding.

## Crucial independently executed positive control

Original uploaded \`pos_Vstar.json\` and \`pos_Vstar_shift1.json\` vector contents were recalculated locally, then separately reproduced on GitHub Actions using **the unmodified frozen \`PF2ReceiverLineage\`**, not the uploaded studio generator:

- Source script: \`experiments/pf4/PF4_V2_INDEPENDENT_POSITIVE_CONTROL.mjs\`.
- **[GitHub Actions run 40103251779](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/40103251779): SUCCESS**; machine-readable artifact \`pf4-v2-independent-positive-replay\`, ID **12563865661**.
- 20160 ticks per lineage; nine recipients; input \`LOOP|k|t\`; two original and shifted initial 9×11 inherited codes.

| Positive condition (same training world LOOP) | Vstar | Shifted Vstar |
| --- | ---: | ---: |
| \`R_mean\` | **0.0000031609607795199834** | 0.014442524171301629 |
| \`R_all\` | 0.0002844864701567985 | 0.1448428348979172 |
| Deaths | 0 | 3 |
| Zone4 visits | 434 | 389 |

Thus the training-world paired advantage is **+0.014439363210522109**, greater than *all* 400 observed single-window synthetic paired advantages. Vstar training-world R_mean is ≈2294× below the lowest unrelated-world Vstar R_mean. This demonstrates **positive-control code–world specificity and assay sensitivity**, while expectedly using the **same training world that produced Vstar**; it is **not an independent or prospective physical effect**.

### Interpretation against philosophical aims

The new mean metric allows a fixed historic-developmental code to be numerically distinguished from a lineage permutation when the actual world is the one on which the code converged. It does not imply a future cause, and a code that simply adapts generically to many worlds remains an alternative to a future-specific imprint. Retain death, effective path repertoire, sink-scar intervention and degree of basin capture as separate diagnostics.

## Significant limitations / next G3 gates

1. **Historical full-window Quicknet residual compatibility is untested**. The earlier 1731-tick prefix cue-frequency check was somewhat tail-heavy; it does not substitute for replaying sufficient distinct **already published 20160-tick physical Quicknet periods** with exact BLS verification, frozen stride, nine-arm mapping and code/shift pair.
2. Full 900 JSON/CSV internal consistency plus the independent seed-1000 and positive-control reproductions do not mean every one of 400 worlds was independently executed in a second simulator. Reproduce at least a prespecified diverse sample of world seeds before the final registration; retain all negative results.
3. Five active edges (1→2, 2→4, 2→7, 4→7, 4→5) contribute almost all of the mean residual despite the preregisterable denominator of 90; report per-edge contributions to diagnose interpretive fragility without redefining the metric after seeing future observations.
4. Code-input file mode \`FILE:<path>\` in the uploaded adapter accepts text lines and uses \`Buffer.from(hex,'hex')\` without an explicit strict 64-hex source validator at this boundary. **Physical Quicknet input must be separately BLS-verifiable and validated fail-closed** (one exact 32-byte hex value per admitted tick with origin/round/receipt) before entering the frozen adapter. This condition is not satisfied merely by a PASS in synthetic calibration.
5. Additional candidate arms (symbolic inscription) and four windows require explicit multiplicity and one fixed joint statistic. The operator's choice of statistic is still **design-stage**, and the physical future rounds must remain unpublished at commitment time. Separately timestamp the exact code hash, source protocol, control family, statistic, 4-window schedule and rejection rule.
6. Timelock encryption may be retained as interpretive practice but is not statistical precommitment; real protection comes from independent source verification, target-independent source/date selection, public commitment and strict analysis locks.

**Current verdict: G3 V2 NUMERICAL INTEGRITY PASS, POSITIVE CONTROL PASS; G3 PHYSICAL-NULL VALIDATION OPEN, PF4 PROSPECTIVE REGISTRATION NOT AUTHORISED.**
