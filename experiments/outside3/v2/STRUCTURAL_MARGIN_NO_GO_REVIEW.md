# OUTSIDE-3 Reader v2 — structural margin no-go review

**Date:** 20 October 2026  
**Disposition:** \`D0_NO_ELIGIBLE_PARAMETER\`; the v2 parameter freeze and K1–K5 calibration remain **BLOCKED**.  
**Classification:** design-stage mathematical review, **not** an alteration to v1/v2 calibration or acceptance thresholds.

## Original evidence retained

- [Operator-fixed K3 gates](./K3_GATE_FIXED.json): Raw ≥180/200; C ≥50/200; 2×C ≥ Raw (paired exact-integer P1 test).
- [Pre-selection margin plan](./PRESELECTION_MARGIN_PLAN.md): minimum changed-zone standardized response ≥2.0 using the **population standard deviation across naturally input-varied casts**; within-output adjacent score margin strictly positive.
- [Failed initial fixture](./preselection-output/MARGIN_PROBE.md): min 0.9238156045σ changed-zone effect and min 0.2764501287 within-output adjacent score margin.
- [Precommitted D0 grid](./D0_DESIGN_GRID.json) and [completed outcomes](./design-grid/D0_GRID_RESULT.md): **0 of 18** magnitude/window combinations passed; best worst-case difference 1.1916169823σ.
- Historic v1 results: K3 11/200 (FAIL); K4 C 40/200 (FAIL). None has been altered.

## Mathematical audit: a 2σ ceiling on the minimum binary-line effect

Consider a particular standardized readout component \`Y = a_z\`, where a single resulting-hexagram line \`B∈{0,1}\` varies and \`U\` contains every other independent input (the other resulting lines and the movement flags), at a **fixed pre-working state and fixed development window**. Under the registered three-coin law, the resulting bit is fair:

- \`P(resulting yang) = P(6) + P(7) = 1/8 + 3/8 = 1/2\`;
- \`P(resulting yin) = P(8) + P(9) = 3/8 + 1/8 = 1/2\`;
- the movement flag has probability 1/4 conditional on either resulting polarity, so \`B\` and the movement flag are independent.

Write \`f_1(U)=Y|B=1\`, \`f_0(U)=Y|B=0\`, \`d(U)=f_1(U)-f_0(U)\`, and \`m(U)=[f_1(U)+f_0(U)]/2\`. The law of total variance gives the exact population identity:

\`\`\`text
Var(Y) = Var_U[m(U)] + E_U[d(U)^2]/4.
\`\`\`

Let \`d_min = min_U |d(U)|\`. Since \`E[d²] ≥ d_min²\`, **\`σ = sqrt(Var(Y)) ≥ d_min/2\`, hence \`d_min/σ ≤ 2\`.**

Equality at 2 requires both \`Var_U[m(U)]=0\` and \`|d(U)|=d_min\` almost surely: no common-mode response to other lines/movement and a perfectly constant-magnitude effect of changing the chosen line. Any nonzero variation of the conditional center or the binary contrast makes the inequality **strictly** below 2.

The proposed D0 gate takes the **minimum** changed-zone standardized effect over all one-bit cast pairs and all tested history states, so for an **exhaustively balanced reference over the same conditional state**, its required \`min ≥ 2σ\` is at the mathematical boundary of attainability. It can be attained only in the special exact-equality case; even weak cross-zone coupling, movement response or accumulated-history dependence tends to force failure.

**Qualification:** the actual D0 reference uses a *finite random sample of 128 casts from a fresh canonical state*. This is not a perfectly balanced population reference, and the D0 pair minima include carried-history states. The theorem is therefore a structural sensitivity warning and exact population bound, **not** a proof that any particular finite-sample D0 runner cannot ever print ≥2. Sample imbalance may spuriously produce a ratio greater than the population ceiling. No such result would validate genuine discrimination without a balanced audit.

## Separate issue: within-readout score separation

For standardized readout vector \`a_i\`, the linear score \`S(h)=Σ_i (2h_i−1)a_i\` has an exact single-bit score change \`|S(h)-S(h XOR 2^i)|=2|a_i|\`. Its worst adjacent score margin is therefore **\`2 min_i |a_i|\`**. If any centered activation \`a_i≈0\`, all edges in that coordinate nearly tie even while the PFM *event sequence* is injective.

This is not the same as the causal input-response margin. Neither entropy over pooled quartiles nor unique event digests establishes reliable rank separation.

## Methodological disposition

**No further amplitude sweeps should be used to chase a pass under the current v2 2σ input-variability gate.** The six tested candidates have already failed, and the mathematical audit shows that the gate sits at the population ceiling rather than representing an ordinary safety margin.

Do **not** reinterpret σ as instrument noise, weaken the 2σ condition, introduce a per-hypothesis boost, select a favorable finite reference sample or quietly switch from worst-case to average. Such changes are a **new design** requiring explicit operator/reviewer acceptance before any new parameter-selection runs.

Suggested successor design **v3 (proposal only, NOT implemented or authorized)**:
1. Preserve Option A and the K3 Raw≥0.90, C≥0.25, C≥0.50×Raw thresholds.
2. Measure causal separation using a **predeclared matched-sham variability denominator or independent experimental noise model**, rather than naturally input-induced σ; the deterministic substrate has no intrinsic measurement noise, so a sham-defined denominator must be nonzero, meaningful, and independent of the changed line.
3. Complement mean rank with target-blind bitwise causal contrasts and explicit 64×4 positional-coverage tables.
4. Preregister the new margin statistic, its bound, and tolerance **before** collecting any new design data. Reserve fresh, disjoint design and K-calibration seed sets.
5. Independently validate the exact BigInt rank-null computation before any new K2/K3 gate.
6. Keep v1 failures, v2 failed grid and all raw artifacts immutable.

**No real target generated; no working opened. OUTSIDE-3 registration remains closed.**

