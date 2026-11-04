# INGRESS-1 handoff — runtime and recalculation

**4 November 2026.** The supplied historical runtime matches the Studio mirror used by the W+ engineering adapter. Recalculation from the supplied season exports reproduces both registered INGRESS-1 decisions and every lineage's paired direction; the newly written JSON is not byte-identical to the supplied JSON because of floating-point-level differences.

## Runtime identity

The handoff manifest verifies the runtime archive, runtime checksum list, season archive, row export and aggregate analysis. The supplied runtime archive contains exactly the eight files in `vt_m_SHA256SUMS.txt`; every file matches `experiments/studio/runtime_mirror` byte for byte. The mirror and `runtime_unmodified` differ only in `substrate/ameliaNumogramSubstrateRuntime.ts`; its mirror SHA-256 is `c357f380e645224ed2fc0a1521ae971691a67b2f34768dabe2946dbfbeb8e21f`.

The Studio archive commit is `96341ff4dd4eabed9dc4a94ba2daecdca1c3d0cd`. Its archived checksum list agrees with the supplied runtime list. The previous W+ adapter used `runtime_mirror`, so no rebinding is necessary. The runner, not that runtime, supplies the full CCRU core and conditional `6→0` Plex exit.

The original INGRESS-1 runner makes **no Governor admission/refusal decision** for a pointer intervention. The archived substrate does perform an internal Governor audit on each step. Whether SXI-1 itself gates an intervention is a separate design choice; the isolated W+ engineering interventions in this branch are scheduled externally and record the internal audit.

## Recalculation

The archive contains exactly 224 expected files: seasons 7–12 and the final state, across eight worlds and four arms. Running the registered `ingress_test.py` on those files produced 216 rows, one for each of 27 lineages in each world. No row-level positive/negative decision changed.

| Registered test | Recalculated mean | Positive | p | Positive worlds | Registered result |
| --- | ---: | ---: | ---: | ---: | --- |
| H1: stream vs fresh ordinary input | +0.02483867486037629 | 121/216 | 0.043289567104328956 | 4/8 | Not supported; first Holm threshold 0.005 and world criterion 6/8. |
| H2: stream vs shuffled stream | −0.005621463477366244 | 105/216 | 0.6797432025679743 | 3/8 | Not supported; Holm procedure stops after H1 fails, and world criterion 6/8 is also unmet. |

The recomputed rows have 4,135 numerically unequal fields, with maximum absolute difference `8.881784197001252e-16`. The aggregate has four unequal numeric fields, with maximum absolute difference `1.3877787807814457e-16`; all nonnumeric fields, rounded descriptions, p-values, thresholds and conclusions agree. Supplied and regenerated files therefore have different SHA-256 hashes. The exact numerical cause of the last-bit differences was not independently isolated; the recorded environment was Python 3.12.14, NumPy 2.3.5 and SciPy 1.17.0. The analysis uses floating-point optimization and summation.

The null H2 does not by itself establish exact equivalence of ordered and shuffled input or prove that order can never matter. The original registered tests did not support a distinct stream or ordering effect under their criteria.

## Reproduce

Install NumPy and SciPy, then provide the supplied handoff directory and a local repository mirror. The verification script creates a new output directory, validates hashes and the expected file sets, extracts only regular safe paths, reruns the original analysis, and compares the rows, the signed paired decisions and the aggregate:

```sh
python3 experiments/synthetic-pointer/verify_ingress1_handoff.py \
  --handoff /path/to/supplied-files \
  --runtime-mirror /path/to/experiments/studio/runtime_mirror \
  --output /path/to/new-verification-directory
```

The supplied runner, precommit, `ingress_all.sh`, `calib.py` and analysis script were also checked against the hashes in the registration. A machine-readable receipt is in `evidence/INGRESS1_Handoff_Verification_2026-11-04.json`.

This is independent recalculation of the retained season exports, not independent re-execution of the original 12-season simulations. The original source stream and branching helper were not part of this handoff; the input-generation and original fork history are not independently replayed here. Matching hashes establish byte identity with the supplied records, not an independently authenticated origin or timestamp.
