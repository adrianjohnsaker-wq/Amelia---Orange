# PF1-A1 R2 — Reporting corrigendum and independent coverage interpretation

**Dated:** 20 October 2026. **Status:** correction to wording/table formatting only; no new scientific run, no constants or underlying evidence altered.

**Authoritative scientific run:** [GitHub Actions #39412416849](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39412416849) — SUCCESS; [original evidence artifact](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/39412416849/artifacts/12259717961).

The committed `PF1_A1_R2_REPILOT_REPORT.md` is preserved exactly as originally generated, retaining the SHA-256 `59c5631ae82e38f9ef2fa86d9c37171d617970784e6b7f7a2d3677b9aeafaeb3`. Two presentation defects are corrected **here**, without re-running science or rewriting the original sealed report.

## Correction 1 — original walker presents an eligible pair

The original report correctly lists **8–9** as detected and probed in its machine-generated table, but its introductory sentence mistakenly says that the original negative walker presents no eligible pairs. That sentence is **wrong and superseded by this corrigendum**.

The baseline walker traverses only the canonical **1→8→9→1** circuit. Nevertheless, the unchanged excursion scanner detects three pairs when different points in that circuit are used as anchors:

- **1–8, Mur Mur:** ineligible under the analytic null.
- **1–9, Tutagool:** ineligible under the analytic null.
- **8–9, Ummnu:** **eligible** under the analytic null.

Therefore the original walker **does test Ummnu (8–9)**, with **seven detected candidates, all five applicable instances probed per candidate (35 instance assessments), zero goal-only passes, zero complete encounters**. Do not claim that the baseline supplies no eligible negative coverage. Nor treat the three pair labels as independent physical circuits. Policy 000 is a duplicate of this walker.

## Correction 2 — table formatting only

The published report's negative-policy table has redundant leading and trailing empty pipe cells. Its numerical contents are correct. This is the normalized table:

| Negative policy | Eligible pairs detected | Eligible perturbation instance assessments | Goal criterion alone | Complete encounters |
|---|---|---:|---:|---:|
| ORIGINAL | 8–9 | 35 | 0 | 0 |
| 000 (duplicate) | 8–9 | 35 | 0 | 0 |
| 001 | 8–9 | 35 | 7 | 0 |
| 010 | 8–9 | 35 | 0 | 0 |
| 011 | 8–9 | 35 | 0 | 0 |
| 100 | 1–2, 2–7, 2–9, 7–8, 8–9 | 161 | 28 | 0 |
| 101 | 1–2, 2–7, 2–9, 7–8, 8–9 | 161 | 28 | 0 |
| 110 | none | 0 | 0 | 0 |
| 111 | 1–2, 2–4, 2–9, 4–7, 7–8, 8–9 | 196 | 14 | 0 |

The full **instance IDs for every pair/policy** are published in [negative-coverage.json](https://github.com/adrianjohnsaker-wq/Amelia---Orange/blob/main/experiments/pf1/a1-r2-repilot-output/negative-coverage.json); do not substitute this summary for that evidence.

## Specificity coverage conclusions

All seven graph-null-eligible pairs were presented by **at least one** policy, so **none is labelled `SPECIFICITY_UNTESTED`** under the operator's stated coverage criterion. The breadth remains unequal: **2–4 (Skoodu)** and **4–7 (Ababbatok)** were each presented only by policy 111, while 000 is not independent of ORIGINAL.

Memoryless policies generated **77 goal-only candidate passes** across the nine recorded labels (7 + 28 + 28 + 14); however **every policy produced zero full encounters**, as required. The memory/integration signature therefore performs essential discrimination here. This does not establish that every natural non-memory mechanism would be rejected.

## Fixture independence and Amelia findings unchanged

The constructed positive harness uses no seed to vary its dynamics; nominal seeds 101/202/303 are duplicates, not distinct fixtures. The correct denominator is **seven distinct eligible-pair constructed fixtures: 7/7 confirmed, all named correctly, sham parity verified**. 8–9 qualifies through the constructed **integration** signature even though its comparative memory-win delta is 1, below the required 2 for N=5.

The unchanged Amelia-Orange synthetic 10,000-step trajectory contained **three candidate pairs**: 1–9 and 1–8 (graph-null-ineligible), and **8–9** (probed). For 8–9, intact had **two** null-qualified wins (required three), reset had **two**, and integration was false. **Zero Amelia encounters.**

## Immutable boundaries

These corrections are reports about already archived evidence, not a revision to the original work order, scanner, substrate, source graph, sealed constants (SHA-256 `ecabf3e40023faa0be0749908cfe6ffd3a8b9e42ab7c8a9a7c2ea5827ae63610`), α, intervention instances, memory margin or control outcomes. **No new run has been authorised or initiated by this correction; live exploration remains unauthorised.**
