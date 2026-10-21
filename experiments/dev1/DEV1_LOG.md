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

## Resource/engineering amendment — no constant or dynamics change

| UTC date | Kind | Decision / observation | Commit / evidence | Status |
|---|---|---|---|---|
| 2026-10-21 | Resource diagnosis | The first 32×10,000 B job remained in progress with canon's full-history SHA-256 regeneration on each step. No B outcome read or threshold changed. Preserve original run instead of suppressing it. | [Run 39580807013](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39580807013) | ORIGINAL EVIDENCE RETAINED |
| 2026-10-21 | Assay-only optimisation | Implement a DEV1-only incremental SHA-256 streaming wrapper for the **same exact** canonical JSON-array history digest. Dynamic PFM, zones, input, selector and Governor are original. Check equality with canonical full recomputation on empty memory, first 24 steps and step 10,000 for **each** tape. This changes computational bookkeeping only; no effect on transitions or scientific constants. | `70562c67023e1bdd9c7dc83eed8be42d7527db66`, `05f1185158183181ababd77ec72c09d95277bc13` | APPLIED TO NEW B RUN |
| 2026-10-21 | Execution isolation | Rerun sealed-constants and identity gates, isolated unit tests, 32×10,000 B calibration and full byte-identical replay. Still no D arms. | `f612f372f88c39b1ecad16b7e4f90b2864fa083d`; [run 39581846789](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39581846789) | STARTED |
| 2026-10-21 | Work-order identity | Exact attached work-order SHA-256 (before any assay): `74bff57831b56facff30b8184fe41467766a0e9cbd3f7a64d6dce40733827aca`, length 6,079 bytes. | operator attachment | RECORDED |

**Deviation classification:** The accelerated digest is an implementation optimisation permitted by the work order's import-and-wrap rule, *not* an approved change to a canonical class or a numerical parameter. The exact-hash check must PASS. If it fails, the resulting run is a gate failure and its output cannot calibrate B.
