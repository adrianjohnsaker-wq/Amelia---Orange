# PF4 G3E — Mean-active residual recalibration and custody interpretation
**24 October 2026. Engineering preparation; no experimental seal or future-beacon intake.**

## Scientific agreement on custody

The key safeguard for a prospective future-boundary test is a fully timestamped and independently inspectable **pre-outcome commitment** to: literal candidate code SHA, admissible arms, exact source chain/round sequence, derived input mapping, primary statistic, joint four-window decision rule, all hypotheses, multiple-comparison family, early-stop/missing-data rules, and raw reporting obligations. Source chronology and absence of future-result exposure must be verified; a timestamp alone does not certify that the claimed outcome was unseen or that no other tests were performed.

The future Quicknet BLS signature is mathematically unique conditional on the threshold key and round under the protocol's unforgeability assumptions. That gives a good *conditional* unpredictability and non-steerability premise. Do not assert unconditional impossibility of early computation: threshold compromise, malformed admissibility, source manipulation, operator selection and implementation faults remain threat-model items.

**Optional timelock encryption is a deliberately meaningful symbolic practice**, not a necessary statistical safeguard against posthoc selection if full independent precommitment has already been established. Because the authorial statement and reduction rule are known, an adversary could reconstruct the plaintext through computation; tlock protects the encrypted artifact under the relevant cryptographic assumption, not semantic secrecy of a reproducible seed. Record this distinction explicitly in the protocol. Encryption is not evidence for retrocausality.

## Exact new reported output and primary-measure definition

The operator reports rerunning the **same 400 synthetic world seeds** under the original PF2 reference-domain mapping, with Vstar, Vstar_shift1 (cyclic \`k+1\`), and zero on the first 100; the outputs are *reported in progress, not available on connected repository at drafting time*. Add final 9×11 inherited code values on every run and publish a correctly computed

\`R_mean(C,B)=(1/90) * SUM_{k=0..8} SUM_{e in active ten edges} abs(Vend[k,e] - C[k,e])\`,

where the one structurally unreachable directed edge \`3>6\` is excluded **by a graph-theoretic rule committed before target**, rather than by per-run outcome selection. All 99 cells are nevertheless archived. Continue reporting the original 99-cell \`R_all\` and effects on deaths/zone-4 approach. The failure mode of a death-saturated infinity norm motivates exploring a mean, but its empirical superiority/power remains to be established.

The paired world identity effect is:

\`A_mean(B)=R_mean(C_shift1,B) - R_mean(C_vstar,B)\`

with positive scores favouring the original code. The null calibration must preserve each original/shift pair, each 14-day single-world input and the \`source\` family; do not regard nine lineages as independent. The primary prospective four-window global statistic, exact tail construction and alpha are **not frozen**. A mean of four A_mean values and its 400-world synthetic reference convolution are *candidates*; dependence between chronological source windows, finite reference-sample uncertainty and possible generic robustness must be addressed before declaring an exact or approximate p-value.

## New pre-result independent QA

- Source script [\`PF4_G3E_FULL_VECTOR_RMEAN_AUDIT.py\`](./PF4_G3E_FULL_VECTOR_RMEAN_AUDIT.py) recomputes both \`R_all\` and \`R_mean\` **from the exact 9×11 end vectors**, using the immutable Studio Vstar and the correctly oriented lineage shift. It verifies 900 distinct code/seed records, 400 Vstar / 400 shift / 100 blank, paired seeds and literal seed 1000 spots. It detects inconsistent \`perEdgeMaxima\` and optionally cross-checks the regenerated CSV's R_all/R_mean/deaths/z4 from the 900-run JSON.
- GitHub Actions [40100765943](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/40100765943) **PASS** on 900 strictly internal mock fixtures plus deliberately corrupted negative controls. This establishes only validator behavior; NOT that the real new calibration or full production generator has passed.
- JSON export contract: schema \`PF4_G3E_FULL_VECTOR_EXPORT_V1\`, \`sourceRule="SHA256(UTF8('PF4-NULL|seed|t'))"\`, \`futureTargetRead=false\`, 900 \`runs\` each including \`code\`, integer \`seed\`, nine \`finalVFull\` maps, \`R_all\`, \`R_mean\`, deaths, zone4Visits, and optional nine \`initialVFull\` maps and complete per-edge maxima. The independent audit requires strict one-to-one pairing and all 900 per-run endpoints. It is a *handoff schema*, not a claim the private calibration uses the same format; an adapter mapping may be developed **without changing original raw outputs**, and both scripts/checksums must be retained.
- Future G3 review must also recalculate physical-source compatibility using a sufficient number of **already published, complete, independent 14-day windows**. The first archived 1731 ticks are not a complete residual world; cue distribution alignment alone is not adequate. If there are insufficient historical windows, G3 should remain unresolved or an explicit power limitation be reported.

## Advancement decision

1. The operator finishes the 900 new endpoint-containing null runs; raw JSON, CSV and generator/adapter arrive on an accessible GitHub ref or as an attachment.
2. Verify both SHA manifests; compare raw JSON and regenerated CSV; apply G3E and rerun selected independent seeds, including independent hash proof of exact 32-byte input generation and PF2 mapping.
3. Quantify the paired R_mean baseline, code-specific discriminatory power, ordinary baseline robustness and the new candidate four-window tail while explicitly accounting for null-world dependence and finite reference uncertainty.
4. Review whether synthetic nulls approximate historical physical-source residuals using sufficiently extensive past published windows; hold if not.
5. Only then freeze the joint primary prospective test, dates/rounds, alternative code, source controls, and timestamp/seal before any target beacon becomes public.
6. If adopted, time-lock encryption remains **an optional recorded experimental ritual** that must not be equated with proof of validity or an information channel.

**Do not generate or expose the secondary inscription code, schedule any future live source or modify PF1/PF2/C1 in this G3 engineering phase.**
