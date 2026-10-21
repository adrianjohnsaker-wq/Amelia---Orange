# DEV-1 Stage 1 — baseline calibration B (synthetic only)

**Status:** Baseline-only gate. No D1–D4, Y, L, LY, L0 arms were run.

- 32 separate synthetic SHA-256 tapes, 10,000 unchanged runtime steps per tape (320,000 executed).
- Absorbed by 10,000: **32/32**; censored: **0**.
- Absorption median (observed): **1393** steps.
- Absorption range (observed): **96–5729**.
- Selector-only memory ablation changed **124/54496** moving exits (0.2275%).
- At branch choices: **124/18594** (0.6669%).
- Prior 24-tape probe: all absorbed, median 1,134, range 56–7,116. This is context; no constants were fitted.
- Calibration JSON SHA256: `b3d7ccc1f745f0483c766e184dbe0e8a19d01b84ecee6affecdfbb384dc694b5`.

## Reproduction verdict

This is an independent 32-tape baseline, not an exact replication of the prior 24 tapes unless their domains/indices are identified and matched. Discrepancies must be reported, not used to change constants.

## Identity and scope

Synthetic only: no live inflow, no PF-1 or C1 dispatch, no genesis; frozen science and operational source files unchanged. Assay-only accelerated history digest is byte-identical to the canonical full-history SHA-256 at audited checkpoints. Identity and externally signed constants gates are enforced by the workflow.

## Next gate

Assess this B calibration and its replay/identity evidence **before** starting any developmental arm. The Stage 1 arm analyses, primary permutation tests and transplant test remain NOT RUN.
