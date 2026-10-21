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

## B baseline completed — factual closure (21 October 2026)

| Kind | Evidence | Decision / result |
|---|---|---|
| External constants timestamp | [Action 39581846789](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39581846789) | Genuine FreeTSA RFC3161 request/response verified before B; identity and mechanism unit tests PASS. |
| B / unmodified runtime | [Original action 39580807013](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39580807013) | B2 32×10,000 **PASS**, B3 independent byte-identical replay **PASS**; median 1393; range 96–5729; 32/32 absorbed; moving-selector ablation 124/54496. Original JSON SHA-256 `1444ae773c90ba59132ff8bdeb116fabde6756c489f129d65bf077734d85fb06`. |
| B / exact-digest wrapped runtime | [Action 39581846789](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39581846789) | All gates, original-history-digest comparison checkpoints and second byte-identical replay PASS; **same 32 individual absorption steps**, identical calibration totals. JSON SHA-256 `b3d7ccc1f745f0483c766e184dbe0e8a19d01b84ecee6affecdfbb384dc694b5`; differs from original only in recorded source/provenance description. |
| Archive failure on original workflow | Run 39580807013, step B4; GitHub API HTTP 422 `sha wasn't supplied`. | Expected **create-only collision**: accelerated B run already published the same report path, and older B workflow was forbidden to overwrite it. This marks the *original workflow as failed overall*, although its B2/B3 scientific gates passed. The failure is **retained**; no overwrite, threshold change or retrial masking. |
| Baseline interpretation | `experiments/dev1/DEV1_STAGE1_REPORT.md` | Thirty-two of 32 absorbed by 10,000; median 1,393, range 96–5,729; selector-only memory term changed 124/54,496 moving exit selections (0.2275%) and 124/18,594 branching choices (0.6669%). The prior 24-tape median 1,134, range 56–7,116 is descriptive reference only, not the same-tape reproduction. |
| Order gate | Stage 1 work order §B | Report B **before** any developmental arm. D1–D4, Y, L, LY, L0 **NOT RUN** at this closure. No live inflow; no C1 or PF1 dispatch. |

**Remaining work:** Implement and independently test D-arm integration, then run the prespecified D/E arms strictly in order. The present baseline report must not be misrepresented as a completed full Stage 1 developmental study.

## D1 unit gate and cohort setup — 2026-10-21
- Operator approved D1 only; B baseline accepted: 32/32, median 1393, O2 branch reference 124/18594 = 0.667%.
- Sealed constants external timestamp and unchanged science verified, mandatory isolated D1 unit run https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39586471562 PASS before any D1 cohort.
- Flux-score gap on 4->5 versus 4->7 is 0.0093; V(4->7)=0.1 times wV=0.5 gives 0.05 and reverses the chosen exit. Real unchanged runtime integration also passed. No canonical source edits.
- D1 only: synthetic 32 tapes, H=24, V updated by (o-V)/8, O1 RMST up to 10000 and O2 branch-choice ablations plus absorption routes. Stops terminal individual at absorbing zone 5; this is a computational shortcut after an irreversible event.
- Pre-run engineering cleanup: remove unused delayed-credit expression, invoke sealed consequenceOutcome directly, commit ea162b1cafdbbeff8d46a9835940bf733275a485. No constants changed.
- D2, D3, D4, Y, L, LY, L0 not authorised to run until D1 reviewed.

## D1 32-tape result and stop gate, 21 October 2026
- Stage 1 D1-only workflow run 39587190646 PASS: pinned PF1/C1 source identities, RFC3161 sealed constants, standalone D1 unit before cohort, 32 synthetic tapes, byte-identical independent replay, create-only result and report publication. No D2/D3/D4/Y/L/LY/L0 executed.
- O1 D1 RMST 1224.6875 vs B 1703.0000; paired D1-B -478.3125 steps. All 32 absorbed; D1 median 857, range 96–3435. Descriptive only; no D1 confirmatory p-value in registered design.
- O2 combined selector-memory ablation 137/13409=1.021701842%, V-only 173/13409=1.290178238%; B reference 124/18594=0.6668817898%. O2 mechanism manipulation PASS under registered strict D1 greater than B. Not a survival advantage.
- Terminal last-four-zone absorption route 1->2->4->5 in all 32; 10 tapes shortened survival, 5 prolonged survival, 17 unchanged compared with B.
- D1 data and report: experiments/dev1/DEV1_D1_RESULT.json and experiments/dev1/DEV1_D1_REPORT.md; replay and run https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39587190646.
- STOP: all further developmental arms remain not run pending operator review of D1, with no parameters tuned from this outcome.

## AM1 stone-tape registration and pre-cohort gates — 21 October 2026

- **11:27:35 UTC:** operator explicitly APPROVED additive AM1 for LS/LSY, sealed prior to any L/LY/L0/LS/LSY cohort. Current D1 report already delivered, and all subsequent developmental arms remain not authorised without separate review.
- **AM1 freeze:** `experiments/dev1/amendments/am1/AM1_STONE_TAPE_REGISTRATION.md`, `AM1_CONSTANTS.json`, additive `experiments/dev1/DEV1_CONSTANTS_MANIFEST.json` committed *before* sealing; original `DEV1_CONSTANTS.json` untouched. T keyed by 11 immutable gate IDs; H=24; terminal-only distinct-edge write once `T <- T +(-1-T)/8`; wT=wV=0.5; new LS and LSY arms; secondary Holm two directional comparisons; O2-T and O7 preserved.
- **11:32:41 UTC:** SHA256 and genuine independent FreeTSA RFC3161 signed token/imprint verification **PASS for each of three files**, including original constants seal and pinned-source byte identity. [Actions run 39592718602](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39592718602); create-only receipt `experiments/dev1/amendments/am1/seal/receipt.json`. **NO lineage outcome data existed at the time of seal**, certified by preseal repository gate; no scientific files changed.
- **Engineering implementation after seal:** `src/developmental/DEV1StoneTape.ts` and `DEV1StoneLineage.ts` import original runtime/canonical gates. Place-only terminal writer, bounded marks, gate-value readout proxy and independent LS/LSY fresh birth & contemporaneous donor snapshot machinery; no experimental cohort runner or lineage data.
- **First AM1 unit workflow FAIL before testing:** [run 39593603904](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39593603904). Byte-identity/receipt and zero-lineage-data check PASS; the test workflow's pinned TSA certificate SHA256 was mistyped (not a properly formatted sha256sum line), so workflow failed before calling the TS unit fixtures. No false assertion of unit success, no cohort executed. Original separate three-file seal remains independently valid.
- **Repair only test workflow:** use exactly pinned certificate SHA256 `8bfb0305bb64e2571ca507552ef3245cb1c2fee8728e0ff8689225081ea13467`, and repeat the full SHA256/signature/unit gate. No modification to three signed files, their original signed requests, tokens, weights or source.

- **Second AM1 unit workflow FAIL after sealing gate:** run 39593745019 passed original-base and all three AM1 SHA256/RFC3161 signature and imprint verifications, plus no-lineage-data check. Before executing any unit assertion, TypeScript module resolution failed: the nested `experiments/dev1/amendments/am1/AM1_LINEAGE_UNIT.ts` used `../../src/` instead of `../../../../src/`. Engineering path correction only, no science, sealed constant, or thresholds changes; original failed CI run retained. Re-run full unit gate required.
