# OUTSIDE-3 v2 — amended D1 independent design review (20 October 2026)

**DECISION: AMENDED D1 SOFTWARE/PROVENANCE COMPLETE; PROVISIONAL DESIGN NOMINEE ONLY; NO FREEZE, NO K1–K5 CALIBRATION, NO REAL TARGET, NO REGISTRATION.**

This review is written **after** the completed amended design run. It does not change the operator's eligibility floor, sensitivity-selection rule, planted sequences, exact P1 arithmetic, previous D1 study, D0 outcomes, or v1 failures.

## Provenance and incident

- Accepted pre-run amendments: [D1_PRE_RUN_PROTOCOL.md](./D1_PRE_RUN_PROTOCOL.md), commit `75ba13690f8cecaf0475c801b750493c8056978f` (frozen G seed clarification `0ac03d5e1c3af0c4caac4b9d4bea340fd77bbefb`).
- Original amended scientific run: [GitHub Actions #39363686421](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39363686421), source `654b1023dfc4e48c9c31f08ddc4b3118b95caff6`. Its diagnostic, all **20 paired 50-series shards**, 200-series aggregation, and frozen-G replay completed successfully. The **final Git commit step** failed solely on an extra trailing Markdown newline; see [D1_AMENDED_ARCHIVE_INCIDENT_001.md](./D1_AMENDED_ARCHIVE_INCIDENT_001.md).
- Recovery without scientific rerun: [GitHub Actions #39364899463](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39364899463), **SUCCESS**. Read the original run artifact, verified all 20 JSON SHA-256 digests, source commit, selected candidate, degree-preserving G check and 4,096 injectivity counts, and committed compact reports. Only the generated Markdown's trailing blank line was normalized.
- Frozen report SHA-256 identities are recorded in [d1-output/D1_ARCHIVE_RECOVERY_SHA256SUMS.txt](./d1-output/D1_ARCHIVE_RECOVERY_SHA256SUMS.txt). Full per-working synthetic ranking arrays reside in [the original run artifact](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39363686421/artifacts/12238543197); artifacts have finite GitHub retention, while summary reports and their digests have been committed.
- Prior, independent D1 design remains unchanged: [D1_INDEPENDENT_REVIEW.md](./D1_INDEPENDENT_REVIEW.md) recorded **0/12 held-out synthetic detections** for its previous, D0B/W1/PFM preferred design. The amended run uses separate independent seeds and cannot retrospectively repair that failure. [D1_AMENDED_CONTINUATION_PROVENANCE.md](./D1_AMENDED_CONTINUATION_PROVENANCE.md) documents the distinct cohorts.

## Objective and eligibility results

The amended protocol excludes window 0 regardless of readout. Its precommitted **complete-rank contribution** criteria are mean ordinary-rank displacement C–Raw ≥1.0, C–M ≥0.5, and at least 10% of workings with nonidentical rankings for **each** comparator. Differences only establish that the readout is not a raw or M identity; they **do not imply P2 added predictive value**.

All 8 combinations of ACTIVATE/PFM_STRAIN at windows 1/3/10/30 passed these contribution floors. The selection rule therefore chose **PFM_STRAIN at 1 autonomous step**, maximizing C's exact P1 design-seed detection count. Window 0 was reported but never selectable.

| Metric | Amended D1 nominee, PFM_STRAIN W1 |
| --- | ---: |
| Raw synthetic plant detection | **199/200 (99.5%)** |
| C synthetic plant detection | **20/200 (10.0%)** |
| C/Raw detection-rate ratio | **0.10050** |
| Mean absolute full-rank displacement C–Raw | **20.1473** ordinary rank positions |
| Mean absolute full-rank displacement C–M | **18.1145** ordinary rank positions |
| Workings with C ≠ Raw ranks | **100.00%** |
| Workings with C ≠ M ranks | **98.86%** |

The nominee is **clearly nonidentical** to Raw and M. However, nonidentity can coexist with large information loss: Raw detects the plant in 99.5% of series, while C detects only 10.0%. On these design seeds, C is below the still-fixed *future K3 calibration* thresholds **C≥50/200** and **2C≥Raw** (20<50 and 40<199), though Raw exceeds **180/200**. These are **design diagnostics against precommitted calibration targets**, not an executed K3 calibration, and thus must **not** be entered as a K3 PASS or FAIL. They strongly argue **against freezing** the current nominee for confirmatory evaluation.

Full all-window results: [d1-output/D1_DESIGN_RESULT.md](./d1-output/D1_DESIGN_RESULT.md) and the more detailed [D1_DESIGN_RESULT.json](./d1-output/D1_DESIGN_RESULT.json).

## Injectivity and carried-memory saturation

The source-encoding check passed **4,096/4,096** canonical cast/movement signatures and **4,096/4,096** distinct fresh PFM states under the D1 design fixture. Both activation and direct PFM-strain readouts received the same target-blind cast events.

However, the PFM_STRAIN W1 readout's matched **one-line changed-zone response margin** was:
- **Fresh memory: ~1.83366** standardized units;
- **W1: ~1.83366**;
- **W10, W44 and W88: exactly 0** in sampled matched comparisons.

These zero responses are **descriptive**, not a resurrection of the retired 2σ eligibility test. They show loss of dynamical distinguishability after historical saturation even while PFM event metadata remains unique. Later design must not equate fresh-history injectivity with carried-history information survival.

An additional diagnostic-quality limitation: window-0 ACTIVATE reference sigma was tiny (approximately 10^-15) rather than explicitly rejected as numerically degenerate, due summation roundoff on identical constant activations. **Window 0 was barred from selection**, so the primary eligibility and winner are unaffected, but window-0 activation rankings/detections are not a meaningful physiological or computational signal. Any future readout freeze must prospectively specify a numerical zero-variance tolerance or exact-constant detection rule rather than accept this roundoff.

## Frozen rewired graph G engineering check

The design nominee underwent a **separate target-free** 88-working replay on the v1-pinned G rewire seed **2609**, with 184 accepted swaps. The graph preserves the original in/out-degree vectors and has SHA-256 graph digest `4125980b3f3d4cb0976661bdc2351ba3c9540360ab8f88a63e3c9f267c11098c`. Two matched replays produced identical complete ranking trajectories, canonical and G state digests and PFM history digests. The G and canonical rankings differed in **85/88** workings (mean absolute rank displacement **2.97195**). This establishes deterministic engineering compatibility, **not** a P2 improvement or calibration pass. Evidence: [d1-output/D1_G_ENGINEERING.md](./d1-output/D1_G_ENGINEERING.md).

## Gate, scope and next permissible action

- The original v1 failures (K3 11/200, K4 40/200), D0 negative grid and previous D1's 0/12 held-out selection result all remain authoritative, unchanged.
- The future K3 gates remain Raw≥180/200; C≥50/200; 2C≥Raw, evaluated only on fresh independent **calibration** series if a later reviewed design is formally frozen.
- No v2 parameter set, PFM history law, readout or development window is being frozen as a confirmatory reader. Do **not** proceed to K1–K5, time-lock targets or real workings on these D1 results.
- A subsequent versioned structural design should address **PFM strain saturation**, and separately test information preservation and added value against Raw/M, using new disjoint synthetic design and holdout cohorts. Set all objectives and engineering variance rules **before** examining those future cohorts; do not tune the already completed D1 experiment.

**Final amended D1 status: COMPLETE AS A SYNTHETIC DESIGN AUDIT; NO-GO FOR FREEZING AND REGISTRATION.**
