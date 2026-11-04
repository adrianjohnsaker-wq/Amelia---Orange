# SXI-0 — W+ source-based engineering check

> **Subsequent handoff update:** The eight files of the historical `vt/m` runtime have now been matched byte for byte to the Studio mirror used below. The season exports have also been independently recalculated, reproducing the registered null decisions with only floating-point-level numerical differences. See [handoff verification](INGRESS1_Handoff_Verification_2026-11-04.md) and [matched controls](WPlus_Matched_Control_Engineering_2026-11-04.md). References below to an unidentified runtime or missing season exports describe the earlier state of this engineering report. The Governor's intervention policy is a design choice for the new experiment, not an INGRESS-1 constraint.

**Date:** 4 November 2026
**Status:** PARTIAL SXI-0. The supplied INGRESS-1 runner has been identified and a separate W+ adapter has been exercised against the archived Studio runtime. The original `vt/m` runtime remains unverified, so this is an engineering check, not an SXI-1 result or independent reproduction of INGRESS-1.

## Source reconciliation

The operator supplied the registration, the runner as `caesura4.txt`, the run script, calibration script, analysis script and aggregate `analysis.json`.

| Source | Check |
| --- | --- |
| `caesura4.txt` | SHA-256 `b6036fd6d15a5cb070b86f258e673ba0b5b3e13c99bc710995697656d25e82ed`, identical to the registered `caesura4.mjs` runner hash. |
| `ingress_all.sh` | Hash matches the registration. |
| `calib.py` | Hash matches the registration. |
| `ingress_test.py` | Hash matches the registration. |
| `analysis.json` | Its aggregate results match the numbers in the supplied closing note. It is not the row-level source data. |

The supplied runner is a W+ lineage with a sense organ, a learned edge-value code and recent/deep house records. It includes the full 29-edge Numogram plus a conditional `6→0` studio exit that opens at Warp momentum 48. It is distinct from the two-dimensional reaction–diffusion reference field used in the first SXI-0 check.

The runner requires an external runtime with an `exitBonus` hook. Amelia—Orange’s archived `experiments/studio/runtime_mirror` has such a hook and was used here. No hash in the supplied INGRESS-1 registration identifies that mirror as the exact `vt/m` runtime used historically. The original `branchx.sh`, `stream.json` and per-world season/row exports were not supplied or located. Accordingly, the aggregate statistics and the historical run have **not** been independently recomputed.

## Implemented W+ adapter

`build_wplus_overlay.py` verifies the supplied runner’s registered SHA-256 before generating a separate derivative; it never edits the original. It requires the Studio `exitBonus` hook and expected base topology, rejects external streams for this engineering test and applies no pointer change in neutral mode.

The experimental pointer temporarily scales the house-to-exit coupling for a named set of existing directed edges. It does not inject a target form or force a destination. The logger records every transition, actual open-gate options and reconstructed scores, input digest, memory event, Governor audit and pointer state. It also records periodic organ and house state samples, and the season-end lineage and runtime state. The supplemental PFM hash chain is labelled separately because this archived Studio runtime omits the native memory-head digest.

**Boundary:** in this W+ adapter the pointer intervention is externally scheduled and is **not Governor-gated**. Governor telemetry records an audit only; it must not be described as an attend/defer/refuse decision. Periodic state samples are not complete mid-season restart checkpoints.

## Local engineering checks

| Check | Result |
| --- | --- |
| Registered runner source check | PASS; wrong source bytes and pre-existing output are rejected. |
| Neutral overlay without recording | Supplied runner’s season summary and season-end state reproduced byte for byte on the tested fixture. |
| Neutral overlay with recording | Same two original outputs reproduced byte for byte. |
| Trace verification | Both traces passed independent checks of 20,160 passages, gate-score reconstruction, memory events, chain continuity and season-end state. |
| Full topology | 30 declared edges, including the conditional `6→0` exit. |

Both traces used world `S05W9401`, lineage 0, one season, synthetic input, `mode=plus`, `refrain=evo` and `inf=I`. They used the archived Studio mirror as a **candidate** runtime.

In the active engineering trace, four house-coupling terms were multiplied by 0.5 during ticks 501–1000. The paired traces agreed through the first 500 ticks; the first different destination occurred at tick 605. The intervention was active for 500 ticks and affected 426 available gate options. This verifies that the experimental control can affect the fixture. It is one paired engineering run, not evidence of a persistent target, a high-agency pattern or a population effect.

## Evidence and reproduction

`WPlus_SXI0_Engineering_Evidence_v2_2026-11-04.zip` contains the baseline, neutral and intervention outputs, both full per-step traces, independent verification results, comparison and source-hash manifest.

- Evidence archive SHA-256: `f4909ce9a87410d9e3da22e59df6bfa22c149953ce2925ffde55378de36e45f0`.
- Generated overlay SHA-256: `4d03f2c21b768cdf5910a5ccb8897663aea4552328e007dc414ed54593725672`.
- Neutral trace head: `6bf89f3df1327410def5497722a175ab4f35c0b15344ebf1a5523ca305fda449`.
- Intervention trace head: `3bbe2931c7ab1afb3679ecbf73e26a4c8b8efa3562957d44542f2643602afa57`.

The builder and independent trace verifiers are in this branch. To build the overlay, supply the operator’s runner locally; it is not included in the public branch:

~~~sh
python3 experiments/synthetic-pointer/build_wplus_overlay.py --source /path/to/caesura4.txt --output /new/path/caesura4-sxi.mjs
python3 experiments/synthetic-pointer/test_wplus_overlay.py /path/to/caesura4.txt
~~~

`verify_wplus_trace.mjs` and `compare_wplus_traces.mjs` print their argument requirements when invoked without arguments. The evidence has no external stream. The hashes establish consistency of the supplied and generated bytes, not an independently authenticated time or the identity of the missing historical runtime.

## Remaining gate

Identify or recover the exact `vt/m` runtime, and obtain the original branching helper, stream and per-world records if independent verification of INGRESS-1 is required. Bind and test the pointer intervention with explicit Governor admission and complete restart checkpoints before claiming SXI-0 complete or launching the preregistered SXI-1 pilot. The newly supplied runner and the present trace improve the connection to the actual experiment but do not fill those gaps.
