# OUTSIDE-3 Reader v2 — design-stage closure report

**20 October 2026** · Amelia---Orange · Synthetic design evidence only  
**Final disposition:** **DESIGN COMPLETE / NO-GO / NO PARAMETER FREEZE**

The requested engineering work has been brought to its scientifically defensible decision. This is **not** a successful v2 calibration and **not** a registration. No real target was generated; no real working was opened.

## Completed evidence

| Component | Outcome | Evidence |
|---|---|---|
| Option A resulting-hexagram PFM encoding (6 polarity events plus movement events) | **PASS** 4,096/4,096 injective fresh-state casts | [Encoder and replay unit test](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39336272213) |
| Fixed K3 thresholds | **LOCKED**, not executed | [Machine-readable gate](./K3_GATE_FIXED.json): Raw ≥180/200; C ≥50/200; 2×C ≥ Raw |
| Original 88-working carried PFM and saturation margin fixture | **FAIL** predeclared 2σ gate | [Synthetic feasibility](./preselection-output/MARGIN_PROBE.md), min input response 0.9238156σ |
| Six-candidate D0 magnitude grid, windows 1/3/10 | **FAIL**, 0 of 18 eligible | [Design output](./design-grid/D0_GRID_RESULT.md), best worst-case response 1.191617σ |
| Independent mathematical margin review | **PASS** computational certificate of structural 2σ ceiling under balanced reference | [Mathematical note](./STRUCTURAL_MARGIN_NO_GO_REVIEW.md), [verified CI](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39352856712) |
| Exact finite P1/P2 null software | **PASS** unit verification (not K calibration) | [Exact BigInt implementation](./exactBigIntNull.ts), [unit evidence](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39352660498) |

The original Stage 1 failures remain fixed: K3 C 11/200 = 0.055 against 0.25; K4 C 40/200 = 0.20 against 0.25. Its raw-cast K3 supplement remains separately archived: Raw 197/200, C at entry 64/200, C after 30 steps 11/200. None of those results have been reinterpreted as successful confirmation.

## Why the current margin criterion is obstructive

For a fair resulting polarity bit \`B\`, independent of all other cast information \`U\`, write the final scalar activation as \`Y=f(B,U)\`. Conditional responses to the bit are \`f_0(U)\` and \`f_1(U)\`.

The exact identity is

\`\`\`text
Var(Y) = Var_U((f_0+f_1)/2) + E_U[(f_1-f_0)^2]/4.
\`\`\`

Therefore, with \`d_min = min_U |f_1-f_0|\`, \`d_min/sigma_Y ≤ 2\`. Equality demands zero variability in the conditional midpoint and a constant-magnitude bit effect. Real interactions, movement and history typically violate these equality conditions.

A fair binary resulting bit follows from the three-coin probabilities: \`P(resulting yang)=P(6)+P(7)=1/2\`. Its moving flag is independent of its resulting polarity: \`P(moving|either polarity)=1/4\`.

**Limit of the theorem:** the D0 sigma denominator was estimated from 128 randomly sampled synthetic casts rather than the fully balanced population. A finite-sample ratio can exceed 2 by sampling imbalance; that is not evidence of stronger underlying discrimination. The exact mathematical audit does not claim universal impossibility for every finite random realization.

The other linear-readout boundary is \`min_{adjacent h,h'} |S(h)-S(h')|=2 min_i |a_i|\`. At centered or near-zero activations, adjacent hypotheses nearly tie even though all PFM event sequences remain distinct.

The empirical D0 worst-case response values (0.871 to 1.192σ across the reported settings) agree with this structural constraint. Pursuing larger PFM flux alone against a fixed 2σ minimum would not be a scientifically appropriate response.

## Exact arithmetic progress retained

\`exactBigIntNull.ts\` computes finite-support spectra with multiplicities represented as \`BigInt\` coefficients and total mass \`64^n\`. P1 tails are exact integers, and paired P2 differences may be negative; P2 upper tails are also exact. Decisions at one-sided alpha 0.05 are computed as \`20×numerator ≤ denominator\` without floating rounding.

The independent tests exhaustively enumerated \`64^n\` assignments for n=1,2,3, including ties and signed differences, and checked an 88-working P1 spectrum with exact mass preservation. The 88-working untied P1 benchmark took about 0.9 seconds in the tested GitHub runner. This **does not** certify full 200/1000-series P2 throughput or complete K2–K3 calibration performance; no such claim is made.

## Controls and non-actions

- No v1 source, v1 thresholds, original K3/K4 outcomes, or D0 candidate grid was retrospectively changed.
- No D0 winner or v2 development window was selected. No v2 constants were frozen.
- No v2 K1–K5, descriptive target-plant calibration, or real target was run.
- GitHub workflow success describes successful computation and evidence archiving, **not** successful scientific acceptance.
- OUTSIDE-3 registration remains CLOSED.

## What would count as a legitimate continuation?

An operator/reviewer-approved, independently versioned reader design must **prospectively define a statistically meaningful signal-to-variability reference** rather than trying to clear the mathematical limit by sampling artefact. A matched sham control, separately specified technical perturbations, and conditional paired effects should be evaluated, but the deterministic apparatus has no intrinsic measurement noise: any replacement denominator must be justified, measured, and precommitted. Alternatively, a predictive classification/ROC margin could be defined, with complete positional-bias guardrails and fixed, held-out design seeds.

K3 gates must remain Raw≥0.90, C≥0.25, and C≥0.50×Raw on the **same 200 synthetic series**, unless a new explicitly approved registration process supersedes that choice prospectively. Any successor's criterion/seed namespaces/readout must be committed **before** new design experiments.

**Final stage status: NO-GO accepted as an evidence-bounded software and methodological finding. The work package is complete as a design-stage audit, but the reader is not approved for real OUTSIDE-3 use.**
