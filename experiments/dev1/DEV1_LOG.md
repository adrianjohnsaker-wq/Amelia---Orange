# DEV-1 Stage 1 engineering decision and incident log

**Scope:** Synthetic only. Canonical/C1/PF-1 files may be read and imported, never changed. This log records decisions, failures and deviations, including GitHub commit identifiers.

| UTC date | Kind | Decision / observation | Commit / evidence | Status |
|---|---|---|---|---|
| 2026-10-21 | Authorisation | Operator approved Stage 1 synthetic work order; B must report before any developmental arm; constants sealed before first execution. | Operator instruction received 09:44:43Z | APPROVED |
| 2026-10-21 | Design freeze | Create immutable definitions from work-order Section C; add explicit zero-based tape index and local selector-only memory-term ablation to make reproducibility measurable. No thresholds tuned from observations. | `8c6fa63fb7c53961561f1c07114f29421bb3ce30` | FROZEN FOR SEAL |
| 2026-10-21 | Architectural isolation | Introduce pure helper functions in `src/developmental/`; no canonical class modifications. | `f14de24c2bcdbc60d860bccabe08690f59a5b558` | BUILT, AWAITING TEST |
| 2026-10-21 | Calibration design | Synthetic B runner imports **unchanged** `AmeliaNumogramSubstrateRuntime`; 32 independent fresh states × 10,000 steps, observations counted after each transition. Detector records first entry into zone without an open exit. Selector-only ablation holds after-evolution zone state fixed. | `adce702dfbe17ab3589fda3758a1fdf308407671` | BUILT, AWAITING SEAL/RUN |
| 2026-10-21 | Interpretation guard | Source work order's 24-tape reference cannot be asserted to be an exact same-domain reproduction absent full previous seed identities; explicitly label 32-tape calibration an independent comparison. No constant adjustment permitted. | same | DECLARED |
| 2026-10-21 | Gate | No D1, D2, D3, D4, Y, L, LY, L0 execution before signed constants, identity/replay evidence, and baseline B report. | operator instruction | ACTIVE |

**Deviations:** none made to the numerical constants. The tape-index convention and selector-only ablation estimand are engineering specifications disclosed before calibration; if the operator intended another estimand, it must be registered as an amendment and the existing result retained, never overwritten.

**Failures:** none reported at the point this log was created. Any GitHub workflow failure will remain visible through its linked immutable Actions job; no failed gate may be reinterpreted as success.

## First Stage-1 workflow admission and provenance

| 2026-10-21 | Seal / execution workflow | One-way gate implemented: frozen science identity and C1 read-only pin; actual FreeTSA RFC3161 token checked against fixed trust-anchor fingerprints; archive seal; only then B tests, B calibration and byte-for-byte replay. No D arm command exists in the workflow. | `5ab69e5c2a3b1a6f20ca099630fe9d900b9f5ad1`; [Actions run 39580807013](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39580807013) | SEAL AND UNIT TEST PASS; B IN PROGRESS AT THIS UPDATE |

**Audit note:** successful timestamp and isolated unit-test gates are not evidence of baseline calibration success; no absorption summary, permutation inference, or D-arm result is asserted until the B calibration and byte-identical replay complete.
